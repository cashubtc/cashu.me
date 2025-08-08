import { defineStore } from "pinia";
import { cashuDb } from "./dexie";
import { useWalletStore } from "./wallet";
import { useP2PKStore } from "./p2pk";
import { useMintsStore } from "./mints";
import { useProofsStore } from "./proofs";
import { useTokensStore } from "./tokens";
import { DEFAULT_BUCKET_ID } from "@/constants/buckets";
import token from "src/js/token";
import { ensureCompressed } from "src/utils/ecash";
import { MintOperationError } from "@cashu/cashu-ts";

export const useSubscriptionRedeemWorker = defineStore(
  "subscriptionRedeemWorker",
  {
    state: () => ({
      checkInterval: 5000,
      worker: null as NodeJS.Timeout | null,
      chain: Promise.resolve() as Promise<void>,
    }),
    actions: {
      start() {
        if (this.worker) return;
        this.worker = setInterval(() => this.process(), this.checkInterval);
        this.process();
      },
      stop() {
        if (this.worker) {
          clearInterval(this.worker);
          this.worker = null;
        }
      },
      process() {
        this.chain = this.chain.then(() => this._process());
        return this.chain;
      },
      async _process() {
        const walletStore = useWalletStore();
        const p2pkStore = useP2PKStore();
        const mintsStore = useMintsStore();
        const proofsStore = useProofsStore();
        const tokensStore = useTokensStore();
        const now = Math.floor(Date.now() / 1000);

        await cashuDb.transaction(
          "rw",
          cashuDb.subscriptions,
          async () => {
            const subs = await cashuDb.subscriptions.toArray();
            for (const sub of subs) {
              let changed = false;
              for (const interval of sub.intervals) {
                if (
                  interval.redeemed ||
                  interval.status !== "unlockable" ||
                  interval.unlockTs > now
                )
                  continue;

                interval.redeemed = true;
                interval.status = "claimed";
                changed = true;
                await cashuDb.subscriptions.update(sub.id, {
                  intervals: sub.intervals,
                });

                try {
                  const decoded = token.decode(interval.tokenString);
                  if (!decoded) continue;
                  const mintUrl = token.getMint(decoded);
                  const unit = token.getUnit(decoded);
                  const mint = mintsStore.mints.find((m) => m.url === mintUrl);
                  if (!mint) continue;
                  if (
                    !decoded.proofs.every((p) =>
                      mint.keysets.some((k) => k.id === p.id),
                    )
                  )
                    continue;

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

                  const wallet = walletStore.mintWallet(mintUrl, unit);
                  const keysetId = walletStore.getKeyset(mintUrl, unit);
                  const counter = walletStore.keysetCounter(keysetId);
                  const priv = p2pkStore.getPrivateKeyForP2PKEncodedToken(
                    interval.tokenString,
                  );
                  const received = await wallet.receive(interval.tokenString, {
                    counter,
                    privkey: priv,
                    proofsWeHave: mintsStore.mintUnitProofs(mint, unit),
                  });

                  await proofsStore.addProofs(
                    received,
                    undefined,
                    interval.tierId ?? DEFAULT_BUCKET_ID,
                    "Subscription payment",
                  );
                  walletStore.increaseKeysetCounter(keysetId, received.length);
                  tokensStore.addPaidToken({
                    amount: received.reduce((s, p) => s + p.amount, 0),
                    token: interval.tokenString,
                    mint: mintUrl,
                    unit,
                    label: "Subscription payment",
                    bucketId: interval.tierId ?? DEFAULT_BUCKET_ID,
                  });
                } catch (err: any) {
                  if (
                    err instanceof MintOperationError &&
                    typeof err.message === "string" &&
                    err.message.includes("already spent")
                  ) {
                    // ignore
                  } else {
                    console.error("Failed redeeming subscription token", err);
                  }
                }
              }
              if (changed) {
                await cashuDb.subscriptions.update(sub.id, {
                  intervals: sub.intervals,
                });
              }
            }
          },
        );
      },
    },
  },
);
