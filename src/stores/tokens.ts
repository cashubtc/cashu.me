import { date } from "quasar";
import { defineStore } from "pinia";
import { liveQuery } from "dexie";
import { cashuDb } from "./dexie";
import {
  PaymentRequest,
  Proof,
  Token,
  MeltQuoteBolt11Response,
} from "@cashu/cashu-ts";
import token from "src/js/token";
import { v4 as uuidv4 } from "uuid";

/**
 * The tokens store handles everything related to tokens and proofs
 */

export type HistoryToken = {
  id: string;
  status: "paid" | "pending";
  amount: number;
  date: string;
  token?: string;
  mint: string;
  unit: string;
  paymentRequest?: PaymentRequest;
  fee?: number;
  label?: string; // Add label field for custom naming
  meltQuote?: MeltQuoteBolt11Response;
  paidDate?: string;
  paymentRequestId?: string; // If created in response to a payment request
};

function hasIndexedDb() {
  return typeof indexedDB !== "undefined";
}

function sortHistoryTokens(tokens: HistoryToken[]) {
  return tokens.slice().sort((a, b) => {
    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();
    if (aTime !== bTime) return aTime - bTime;
    return a.id.localeCompare(b.id);
  });
}

export const useTokensStore = defineStore("tokens", {
  state: () => ({
    historyTokens: [] as HistoryToken[],
    ecashHistorySubscription: null as any,
  }),
  actions: {
    async initEcashHistory() {
      if (!hasIndexedDb()) return;
      if (!this.ecashHistorySubscription) {
        this.ecashHistorySubscription = liveQuery(() =>
          cashuDb.ecashHistory.toArray()
        ).subscribe({
          next: (historyTokens) => {
            this.historyTokens = sortHistoryTokens(
              historyTokens as HistoryToken[]
            );
          },
          error: (error) => console.error(error),
        });
      }
      await this.refreshEcashHistory();
    },
    async refreshEcashHistory() {
      if (!hasIndexedDb()) return;
      this.historyTokens = sortHistoryTokens(
        (await cashuDb.ecashHistory.toArray()) as HistoryToken[]
      );
    },
    persistHistoryToken(historyToken: HistoryToken) {
      if (!hasIndexedDb()) return;
      cashuDb.ecashHistory.put({ ...historyToken }).catch((error) => {
        console.error("Could not persist ecash history token", error);
      });
    },
    async migrateHistoryTokensFromLocalStorage() {
      const raw = localStorage.getItem("cashu.historyTokens");
      if (!raw) {
        await this.refreshEcashHistory();
        return;
      }
      const historyTokens = (JSON.parse(raw) as HistoryToken[]).map(
        (historyToken) => ({
          ...historyToken,
          id: historyToken.id || uuidv4(),
        })
      );
      if (!hasIndexedDb()) {
        this.historyTokens = sortHistoryTokens(historyTokens);
        localStorage.removeItem("cashu.historyTokens");
        return;
      }
      await cashuDb.ecashHistory.bulkPut(historyTokens);
      localStorage.removeItem("cashu.historyTokens");
      await this.refreshEcashHistory();
    },
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
      paymentRequestId,
    }: {
      amount: number;
      token: string;
      mint: string;
      unit: string;
      fee?: number;
      paymentRequest?: PaymentRequest;
      label?: string;
      paymentRequestId?: string;
    }): string {
      const id = uuidv4();
      const historyToken = {
        id,
        status: "paid",
        amount,
        date: currentDateStr(),
        token,
        mint,
        unit,
        fee,
        paymentRequest,
        label,
        paymentRequestId,
      } as HistoryToken;
      this.historyTokens.push(historyToken);
      this.persistHistoryToken(historyToken);
      return id;
    },
    addPendingToken({
      amount,
      token,
      mint,
      unit,
      fee,
      paymentRequest,
      label,
      paymentRequestId,
    }: {
      amount: number;
      token: string;
      mint: string;
      unit: string;
      fee?: number;
      paymentRequest?: PaymentRequest;
      label?: string;
      paymentRequestId?: string;
    }): string {
      const id = uuidv4();
      const historyToken = {
        id,
        status: "pending",
        amount,
        date: currentDateStr(),
        token: token,
        mint,
        unit,
        fee,
        paymentRequest,
        label,
        paymentRequestId,
      };
      this.historyTokens.push(historyToken);
      this.persistHistoryToken(historyToken);
      return id;
    },
    editHistoryToken(
      tokenToEdit: string,
      options?: {
        newAmount?: number;
        addAmount?: number;
        newStatus?: "paid" | "pending";
        newToken?: string;
        newFee?: number;
      }
    ): HistoryToken | undefined {
      const index = this.historyTokens.findIndex(
        (t) => t.token === tokenToEdit
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
        }

        this.persistHistoryToken(this.historyTokens[index]);
        return this.historyTokens[index];
      }

      return undefined;
    },
    setTokenPaid(token: string) {
      const index = this.historyTokens.findIndex(
        (t) => t.token === token && t.status == "pending"
      );
      if (index >= 0) {
        this.historyTokens[index].status = "paid";
        this.historyTokens[index].paidDate = currentDateStr();
        this.persistHistoryToken(this.historyTokens[index]);
      }
    },
    deleteToken(token: string) {
      const index = this.historyTokens.findIndex((t) => t.token === token);
      if (index >= 0) {
        const id = this.historyTokens[index].id;
        this.historyTokens.splice(index, 1);
        if (hasIndexedDb()) {
          cashuDb.ecashHistory.delete(id).catch((error) => {
            console.error("Could not delete ecash history token", error);
          });
        }
      }
    },
    tokenAlreadyInHistory(tokenStr: string): HistoryToken | undefined {
      return this.historyTokens.find((t) => t.token === tokenStr);
    },
    async redactOldPaidTokens(maxHistory = 200) {
      const paidTokens = this.historyTokens
        .filter((t) => t.status == "paid")
        .sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
      if (paidTokens.length <= maxHistory) return;
      const redactTokens = paidTokens.slice(0, paidTokens.length - maxHistory);
      const redactIds = new Set(redactTokens.map((token) => token.id));
      this.historyTokens
        .filter((token) => redactIds.has(token.id))
        .forEach((token) => {
          token.token = undefined;
        });
      if (!hasIndexedDb()) return;
      await cashuDb.transaction("rw", cashuDb.ecashHistory, async () => {
        for (const token of redactTokens) {
          await cashuDb.ecashHistory.update(token.id, { token: undefined });
        }
      });
      await this.refreshEcashHistory();
    },
  },
});

function currentDateStr() {
  return date.formatDate(new Date(), "YYYY-MM-DD HH:mm:ss");
}
