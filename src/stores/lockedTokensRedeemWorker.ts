import { defineStore } from "pinia";
import { cashuDb } from "./dexie";
import { useWalletStore } from "./wallet";
import { useReceiveTokensStore } from "./receiveTokensStore";
import { useSettingsStore } from "./settings";
import { useMintsStore } from "./mints";
import { useMessengerStore } from "./messenger";
import { useP2PKStore } from "./p2pk";
import { notifySuccess } from "src/js/notify";
import token from "src/js/token";
import { ensureCompressed } from "src/utils/ecash";
import { debug } from "src/js/logger";

export const useLockedTokensRedeemWorker = defineStore(
  "lockedTokensRedeemWorker",
  {
    state: () => ({
      checkInterval: 5000,
      worker: null as NodeJS.Timeout | null,
      redeemChain: Promise.resolve() as Promise<void>,
    }),
    actions: {
      startLockedTokensRedeemWorker() {
        if (this.worker) return;
        window.addEventListener("message", this.handleMessage);
        this.worker = setInterval(
          () => this.processTokens(),
          this.checkInterval,
        );
        // run immediately
        this.processTokens();
      },
      stopLockedTokensRedeemWorker() {
        if (this.worker) {
          clearInterval(this.worker);
          this.worker = null;
        }
        window.removeEventListener("message", this.handleMessage);
      },
      handleMessage(event: MessageEvent) {
        if (event.data?.type === "retry-locked-token") {
          this.processTokens();
        }
      },
      processTokens() {
        this.redeemChain = this.redeemChain.then(() => this._processTokens());
        return this.redeemChain;
      },
      async _processTokens() {
        const settingsStore = useSettingsStore();
        if (!settingsStore.autoRedeemLockedTokens) return;
        const now = Math.floor(Date.now() / 1000);
        let entries = await cashuDb.lockedTokens
          .where("unlockTs")
          .belowOrEqual(now)
          .toArray();

        const legacyEntries = await cashuDb.lockedTokens
          .filter(
            (e: any) =>
              e.unlockTs === undefined &&
              typeof e.locktime === "number" &&
              e.locktime <= now,
          )
          .toArray();

        for (const entry of legacyEntries) {
          if (entry.unlockTs === undefined && typeof (entry as any).locktime === "number") {
            await cashuDb.lockedTokens.update(entry.id, {
              unlockTs: (entry as any).locktime,
            });
            (entry as any).unlockTs = (entry as any).locktime;
          }
        }

        entries = entries.concat(legacyEntries as any[]);
        if (!entries.length) return;
        const wallet = useWalletStore();
        const receiveStore = useReceiveTokensStore();
        const mintStore = useMintsStore();
        for (const entry of entries) {
          if (entry.autoRedeem !== true) continue;
          const nowSec = Math.floor(Date.now() / 1000);
          if (entry.unlockTs > nowSec) {
            await cashuDb.lockedTokens.update(entry.id, { status: "pending" });
            continue;
          }
          try {
            const decoded = token.decode(entry.tokenString);
            if (!decoded) {
              console.error("Invalid token stored", entry.id);
              await cashuDb.lockedTokens
                .where("tokenString")
                .equals(entry.tokenString)
                .delete();
              continue;
            }
            const mintUrl = token.getMint(decoded);
            const unit = token.getUnit(decoded);
            const proofs = token.getProofs(decoded);
            const mint = mintStore.mints.find((m) => m.url === mintUrl);
            if (
              !mint ||
              !proofs.every((p) => mint.keysets.some((k) => k.id === p.id))
            ) {
              console.error(
                "Mint or keyset mismatch for locked token",
                entry.id,
              );
              await cashuDb.lockedTokens
                .where("tokenString")
                .equals(entry.tokenString)
                .delete();
              continue;
            }
            const mintWallet = wallet.mintWallet(mintUrl, unit);
            const spent = await wallet.checkProofsSpendable(proofs, mintWallet);
            if (spent && spent.length === proofs.length) {
              await cashuDb.lockedTokens
                .where("tokenString")
                .equals(entry.tokenString)
                .delete();
              continue;
            }

            // normalise secret before redeem
            decoded.proofs.forEach((p) => {
              if (
                typeof p.secret === "string" &&
                p.secret.startsWith('["P2PK"')
              ) {
                const s = JSON.parse(p.secret);
                if (s[1]?.data) s[1].data = ensureCompressed(s[1].data);
                p.secret = JSON.stringify(s);
              }
            });
            receiveStore.receiveData.tokensBase64 = entry.tokenString;
            receiveStore.receiveData.bucketId = entry.tierId;
            const p2pkStore = useP2PKStore();
            receiveStore.receiveData.p2pkPrivateKey =
              p2pkStore.getPrivateKeyForP2PKEncodedToken(entry.tokenString);

            const needsSig = proofs.some(
              (p) => typeof p.secret === "string" && p.secret.startsWith('["P2PK"')
            );
            if (needsSig && !receiveStore.receiveData.p2pkPrivateKey) {
              postMessage({
                type: "locked-token-missing-signer",
                tokenId: entry.id,
              });
              continue;
            }

            debug("locked token redeem: sending proofs", proofs);
            try {
              await cashuDb.transaction('rw', cashuDb.lockedTokens, async () => {
                const row = await cashuDb.lockedTokens.get(entry.id);
                if (!row || (row.status as any) === 'processing') return;
                await cashuDb.lockedTokens.update(entry.id, {
                  status: 'processing' as any,
                  redeemed: true,
                });
              });
              await receiveStore.enqueue(() =>
                (wallet as any).receive(entry.tokenString),
              );
              await cashuDb.lockedTokens.update(entry.id, { status: 'claimed' });

              // update subscription interval if applicable
              if (entry.subscriptionId) {
                try {
                  const sub = await cashuDb.subscriptions.get(
                    entry.subscriptionId,
                  );
                  const idx = sub?.intervals.findIndex(
                    (i) =>
                      i.intervalKey === entry.intervalKey ||
                      i.lockedTokenId === entry.id,
                  );
                  if (sub && idx !== undefined && idx >= 0) {
                    sub.intervals[idx].status = "claimed";
                    sub.intervals[idx].redeemed = true;
                    await cashuDb.subscriptions.update(sub.id, {
                      intervals: sub.intervals,
                    });
                  }
                } catch (e) {
                  console.error("failed updating subscription interval", e);
                }

                if (entry.creatorNpub) {
                  const messenger = useMessengerStore();
                  const payload = {
                    type: "cashu_subscription_claimed",
                    subscription_id: entry.subscriptionId,
                    tier_id: entry.tierId,
                    month_index: entry.monthIndex,
                    total_months: entry.totalPeriods,
                    ...(entry.htlcSecret ? { htlc_secret: entry.htlcSecret } : {}),
                  } as const;
                  try {
                    await messenger.sendDm(
                      entry.creatorNpub,
                      JSON.stringify(payload),
                    );
                    notifySuccess("Subscription payment claimed");
                  } catch (e) {
                    console.error("failed to notify creator", e);
                  }
                }
              }
            } catch (err: any) {
              if (
                typeof err?.message === "string" &&
                (err.message.includes("No private key or remote signer") ||
                  err.message.includes(
                    "You do not have the private key to unlock this token."
                  ))
              ) {
                postMessage({
                  type: "locked-token-missing-signer",
                  tokenId: entry.id,
                });
              } else {
                throw err;
              }
            }
          } catch (e) {
            console.error("Failed to auto-redeem locked token", e);
          }
        }
      },
    },
  },
);
