import { debug } from "src/js/logger";
import { defineStore } from "pinia";
import { useWalletStore } from "src/stores/wallet"; // invoiceData,
import { useUiStore } from "src/stores/ui"; // showInvoiceDetails
import { useSendTokensStore } from "src/stores/sendTokensStore"; // showSendTokens and sendData
import { useSettingsStore } from "./settings";
import { HistoryToken, useTokensStore } from "./tokens";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { Proof } from "@cashu/cashu-ts";
import { useNostrStore, SignerType } from "./nostr";
import { useSignerStore } from "./signer";
import { schnorr } from "@noble/curves/secp256k1";
import { nip19 } from "nostr-tools";
export const useWorkersStore = defineStore("workers", {
  state: () => {
    return {
      invoiceCheckListener: null as NodeJS.Timeout | null,
      tokensCheckSpendableListener: null as NodeJS.Timeout | null,
      invoiceWorkerRunning: false,
      tokenWorkerRunning: false,
      checkInterval: 5000,
    };
  },
  getters: {},

  actions: {
    clearAllWorkers: function () {
      if (this.invoiceCheckListener) {
        clearInterval(this.invoiceCheckListener);
        this.invoiceWorkerRunning = false;
      }
      if (this.tokensCheckSpendableListener) {
        clearInterval(this.tokensCheckSpendableListener);
        this.tokenWorkerRunning = false;
      }
    },
    invoiceCheckWorker: async function (quote: string) {
      const walletStore = useWalletStore();
      let nInterval = 0;
      this.clearAllWorkers();
      this.invoiceCheckListener = setInterval(async () => {
        try {
          this.invoiceWorkerRunning = true;
          nInterval += 1;

          // exit loop after 1m
          if (nInterval > 12) {
            debug("### stopping invoice check worker");
            this.clearAllWorkers();
          }
          debug("### invoiceCheckWorker setInterval", nInterval);

          // this will throw an error if the invoice is pending
          await walletStore.checkInvoice(quote, false);

          // only without error (invoice paid) will we reach here
          debug("### stopping invoice check worker");
          this.clearAllWorkers();
        } catch (error) {
          debug("invoiceCheckWorker: not paid yet");
        }
      }, this.checkInterval);
    },
    signWithRemote: async function (proofs: Proof[]): Promise<Proof[]> {
      const signerStore = useSignerStore();
      const nostr = useNostrStore();

      let method = signerStore.method;
      if (method === "nip07") {
        await nostr.initNip07Signer();
      } else if (method === "nip46") {
        await nostr.initNip46Signer();
      } else if (!method) {
        await nostr.initSignerIfNotSet();
        if (nostr.signerType === SignerType.NIP07) method = "nip07";
        else if (nostr.signerType === SignerType.NIP46) method = "nip46";
      }

      let signSchnorr: ((h: string) => Promise<string>) | undefined;
      if (method === "local" && signerStore.nsec) {
        const key = nip19.decode(signerStore.nsec).data as Uint8Array;
        signSchnorr = async (h: string) =>
          schnorr.sign(h, key) as unknown as string;
      } else if (method === "nip07") {
        signSchnorr =
          (window as any)?.nostr?.signSchnorr ||
          (nostr.signer as any)?.signSchnorr;
      } else if (method === "nip46") {
        signSchnorr = (nostr.signer as any)?.signSchnorr;
      }

      if (!signSchnorr) {
        return proofs;
      }

      return Promise.all(
        proofs.map(async (p) => {
          if (typeof p.secret === "string" && p.secret.startsWith('["P2PK"')) {
            const h = sha256(new TextEncoder().encode(p.secret));
            const sig = await signSchnorr(bytesToHex(h));
            return { ...p, witness: { signatures: [sig] } } as Proof;
          }
          return p;
        }),
      );
    },
    checkTokenSpendableWorker: async function (historyToken: HistoryToken) {
      const settingsStore = useSettingsStore();
      if (!settingsStore.checkSentTokens) {
        debug(
          "settingsStore.checkSentTokens is disabled, not kicking off checkTokenSpendableWorker",
        );
        return;
      }
      debug("### kicking off checkTokenSpendableWorker");
      this.tokenWorkerRunning = true;
      const walletStore = useWalletStore();
      const sendTokensStore = useSendTokensStore();
      let nInterval = 0;
      this.clearAllWorkers();
      this.tokensCheckSpendableListener = setInterval(async () => {
        try {
          nInterval += 1;
          // exit loop after 30s
          if (nInterval > 10) {
            debug("### stopping token check worker");
            this.clearAllWorkers();
          }
          debug("### checkTokenSpendableWorker setInterval", nInterval);
          let paid = await walletStore.checkTokenSpendable(historyToken, false);
          if (paid) {
            debug("### stopping token check worker");
            this.clearAllWorkers();
            sendTokensStore.showSendTokens = false;
          }
        } catch (error: any) {
          if (error?.message?.includes("Failed to acquire global mutex lock")) {
            debug("checkTokenSpendableWorker: mutex locked, retrying later");
            return;
          }
          debug("checkTokenSpendableWorker: some error", error);
          this.clearAllWorkers();
        }
      }, this.checkInterval);
    },
  },
});
