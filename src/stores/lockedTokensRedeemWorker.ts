import { defineStore } from "pinia";
import { cashuDb } from "./dexie";
import { useWalletStore } from "./wallet";
import { useReceiveTokensStore } from "./receiveTokensStore";
import { useSettingsStore } from "./settings";
import { useMintsStore } from "./mints";
import token from "src/js/token";
import { ensureCompressed } from "src/utils/ecash";
import { debug } from "src/js/logger";

export const useLockedTokensRedeemWorker = defineStore(
  "lockedTokensRedeemWorker",
  {
    state: () => ({
      checkInterval: 5000,
      worker: null as NodeJS.Timeout | null,
    }),
    actions: {
      startLockedTokensRedeemWorker() {
        if (this.worker) return;
        window.addEventListener("message", this.handleMessage);
        this.worker = setInterval(
          () => this.processTokens(),
          this.checkInterval
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
      async processTokens() {
        const settingsStore = useSettingsStore();
        if (!settingsStore.autoRedeemLockedTokens) return;
        const now = Math.floor(Date.now() / 1000);
        const entries = await cashuDb.lockedTokens
          .where("unlockTs")
          .belowOrEqual(now)
          .toArray();
        if (!entries.length) return;
        const wallet = useWalletStore();
        const receiveStore = useReceiveTokensStore();
        const mintStore = useMintsStore();
        for (const entry of entries) {
          try {
            const decoded = token.decode(entry.tokenString);
            if (!decoded) {
              console.error("Invalid token stored", entry.id);
              await cashuDb.lockedTokens.delete(entry.id);
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
              console.error("Mint or keyset mismatch for locked token", entry.id);
              await cashuDb.lockedTokens.delete(entry.id);
              continue;
            }
            const mintWallet = wallet.mintWallet(mintUrl, unit);
            const spent = await wallet.checkProofsSpendable(proofs, mintWallet);
            if (spent && spent.length === proofs.length) {
              await cashuDb.lockedTokens.delete(entry.id);
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
            debug("locked token redeem: sending proofs", proofs);
            try {
              await wallet.redeem(entry.tierId);
              await cashuDb.lockedTokens.delete(entry.id);
            } catch (err: any) {
              if (
                typeof err?.message === "string" &&
                err.message.includes("No private key or remote signer")
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
  }
);
