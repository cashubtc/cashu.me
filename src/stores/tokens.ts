import { useLocalStorage } from "@vueuse/core";
import { date } from "quasar";
import { defineStore } from "pinia";
import { PaymentRequest, Proof, Token } from "@cashu/cashu-ts";
import token from "src/js/token";
import { DEFAULT_COLOR } from "src/js/constants";
import { DEFAULT_BUCKET_ID } from "@/constants/buckets";
import { useProofsStore } from "./proofs";

/**
 * The tokens store handles everything related to tokens and proofs
 */

export type HistoryToken = {
  status: "paid" | "pending";
  amount: number;
  date: string;
  token: string;
  mint: string;
  unit: string;
  label?: string;
  color?: string;
  description?: string;
  paymentRequest?: PaymentRequest;
  fee?: number;
  bucketId: string;
};

export const useTokensStore = defineStore("tokens", {
  state: () => ({
    historyTokens: useLocalStorage("cashu.historyTokens", [] as HistoryToken[]),
  }),
  actions: {
    /**
     * @param {{amount: number, token: string, mint: string, unit: string}} param0
     */
    addPaidToken({
      amount,
      token,
      mint,
      unit,
      fee,
      paymentRequest,
      label,
      description,
      color,
      bucketId = DEFAULT_BUCKET_ID,
    }: {
      amount: number;
      token: string;
      mint: string;
      unit: string;
      fee?: number;
      paymentRequest?: PaymentRequest;
      label?: string;
      description?: string;
      color?: string;
      bucketId?: string;
    }) {
      this.historyTokens.push({
        status: "paid",
        amount,
        date: currentDateStr(),
        token,
        mint,
        unit,
        label,
        description,
        color: color ?? DEFAULT_COLOR,
        fee,
        paymentRequest,
        bucketId,
      } as HistoryToken);
    },
    addPendingToken({
      amount,
      tokenStr,
      mint,
      unit,
      fee,
      paymentRequest,
      label,
      description,
      color,
      bucketId = DEFAULT_BUCKET_ID,
    }: {
      amount: number;
      tokenStr: string;
      mint: string;
      unit: string;
      fee?: number;
      paymentRequest?: PaymentRequest;
      label?: string;
      description?: string;
      color?: string;
      bucketId?: string;
    }) {
      this.historyTokens.push({
        status: "pending",
        amount,
        date: currentDateStr(),
        token: tokenStr,
        mint,
        unit,
        label,
        description,
        color: color ?? DEFAULT_COLOR,
        fee,
        paymentRequest,
        bucketId,
      });
    },
    editHistoryToken(
      tokenToEdit: string,
      options?: {
        newAmount?: number;
        addAmount?: number;
        newStatus?: "paid" | "pending";
        newToken?: string;
        newFee?: number;
        newLabel?: string;
        newColor?: string;
        newDescription?: string;
      },
    ): HistoryToken | undefined {
      const index = this.historyTokens.findIndex(
        (t) => t.token === tokenToEdit,
      );
      if (index >= 0) {
        if (options) {
          if (options.newToken) {
            this.historyTokens[index].token = options.newToken;
          }
          if (options.newAmount) {
            this.historyTokens[index].amount =
              options.newAmount * Math.sign(this.historyTokens[index].amount);
          }
          if (options.addAmount) {
            if (this.historyTokens[index].amount > 0) {
              this.historyTokens[index].amount += options.addAmount;
            } else {
              this.historyTokens[index].amount -= options.addAmount;
            }
          }
          if (options.newStatus) {
            this.historyTokens[index].status = options.newStatus;
          }
          if (options.newFee) {
            this.historyTokens[index].fee = options.newFee;
          }
          if (options.newLabel !== undefined) {
            this.historyTokens[index].label = options.newLabel;
            try {
              const tokenJson = token.decode(this.historyTokens[index].token);
              if (tokenJson) {
                const proofs = token.getProofs(tokenJson);
                const proofsStore = useProofsStore();
                proofsStore.updateProofLabels(
                  proofs.map((p) => p.secret),
                  options.newLabel,
                );
              }
            } catch (e) {
              console.warn("Could not update proof labels", e);
            }
          }
          if (options.newDescription !== undefined) {
            this.historyTokens[index].description = options.newDescription;
            try {
              const tokenJson = token.decode(this.historyTokens[index].token);
              if (tokenJson) {
                const proofs = token.getProofs(tokenJson);
                const proofsStore = useProofsStore();
                proofsStore.updateProofDescriptions(
                  proofs.map((p) => p.secret),
                  options.newDescription,
                );
              }
            } catch (e) {
              console.warn("Could not update proof descriptions", e);
            }
          }
          if (options.newColor !== undefined) {
            this.historyTokens[index].color = options.newColor;
          }
        }

        return this.historyTokens[index];
      }

      return undefined;
    },

    findHistoryTokenBySecret(secret: string): HistoryToken | undefined {
      for (const ht of this.historyTokens) {
        try {
          const tokenJson = token.decode(ht.token);
          if (tokenJson) {
            const proofs = token.getProofs(tokenJson);
            if (proofs.some((p) => p.secret === secret)) {
              return ht;
            }
          }
        } catch (e) {
          console.warn("Could not decode token", e);
        }
      }
      return undefined;
    },

    editHistoryTokenBySecret(
      secret: string,
      options?: {
        newAmount?: number;
        addAmount?: number;
        newStatus?: "paid" | "pending";
        newToken?: string;
        newFee?: number;
        newLabel?: string;
        newColor?: string;
        newDescription?: string;
      },
    ): HistoryToken | undefined {
      const ht = this.findHistoryTokenBySecret(secret);
      if (!ht) return undefined;
      return this.editHistoryToken(ht.token, options);
    },
    setTokenPaid(token: string) {
      const index = this.historyTokens.findIndex(
        (t) => t.token === token && t.status == "pending",
      );
      if (index >= 0) {
        this.historyTokens[index].status = "paid";
      }
    },
    deleteToken(token: string) {
      const index = this.historyTokens.findIndex((t) => t.token === token);
      if (index >= 0) {
        this.historyTokens.splice(index, 1);
      }
    },
    changeHistoryTokenBucket({
      secrets,
      oldBucketId,
      newBucketId,
    }: {
      secrets?: string[];
      oldBucketId?: string;
      newBucketId: string;
    }) {
      this.historyTokens.forEach((ht) => {
        let update = false;
        if (oldBucketId && ht.bucketId === oldBucketId) {
          update = true;
        }
        if (!update && secrets && secrets.length) {
          try {
            const tokenJson = token.decode(ht.token);
            if (tokenJson) {
              const proofs = token.getProofs(tokenJson);
              if (proofs.some((p) => secrets.includes(p.secret))) {
                update = true;
              }
            }
          } catch (e) {
            console.warn("Could not decode token", e);
          }
        }
        if (update) {
          ht.bucketId = newBucketId;
        }
      });
    },
    tokenAlreadyInHistory(tokenStr: string): HistoryToken | undefined {
      return this.historyTokens.find((t) => t.token === tokenStr);
    },
    decodeToken(encodedToken: string): Token | undefined {
      encodedToken = encodedToken.trim();
      if (!isValidTokenString(encodedToken)) {
        console.error("Invalid token string");
        return undefined;
      }
      try {
        const decoded = token.decode(encodedToken);
        const proofs = token.getProofs(decoded);
        if (!proofs || proofs.length === 0) {
          console.error("Decoded token contains no proofs");
          return undefined;
        }
        return decoded;
      } catch (e) {
        console.error(e);
        return undefined;
      }
    },
  },
});

function currentDateStr() {
  return date.formatDate(new Date(), "YYYY-MM-DD HH:mm:ss");
}

function isValidTokenString(tokenStr: string): boolean {
  const prefixRegex = /^cashu[A-Za-z0-9][A-Za-z0-9_\-+=\/]*$/;
  return prefixRegex.test(tokenStr);
}
