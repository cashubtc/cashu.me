import { defineStore } from "pinia";
import {
  Amount,
  type AmountLike,
  decodePaymentRequest,
  normalizeProofAmounts,
  PaymentRequest,
  type PaymentRequestPayload,
  PaymentRequestTransport,
  PaymentRequestTransportType,
} from "@cashu/cashu-ts";
import { useMintsStore } from "./mints";
import { useSendTokensStore } from "./sendTokensStore";
import { useNostrStore } from "./nostr";
import { useTokensStore } from "./tokens";
import { useWalletStore } from "./wallet";
import { useP2PKStore } from "./p2pk";
import type { HistoryToken } from "./tokens";
import token from "src/js/token";
import { notifySuccess, notifyWarning } from "src/js/notify";
import { useLocalStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";
import { nip19 } from "nostr-tools";

// Request fields used by the UI and delivery; history stores these as plain data.
export type PaymentRequestData = Pick<
  PaymentRequest,
  | "transport"
  | "id"
  | "unit"
  | "mints"
  | "description"
  | "singleUse"
  | "nut10"
  | "mintsPreferred"
> & {
  amount?: AmountLike;
  supportedMethods?: Array<{ method: string; fee?: AmountLike }>;
};

export function toPaymentRequest(data: PaymentRequestData): PaymentRequest {
  return new PaymentRequest(
    data.transport,
    data.id,
    data.amount,
    data.unit,
    data.mints,
    data.description,
    data.singleUse,
    data.nut10,
    data.mintsPreferred,
    data.supportedMethods
  );
}

export type OurPaymentRequest = {
  id: string; // UUID from PaymentRequest
  encoded: string;
  unit?: string;
  mints?: string[];
  memo?: string;
  createdAt: string;
  receivedPaymentIds: string[]; // HistoryToken ids mapped to this PR
};

export const usePRStore = defineStore("payment-request", {
  state: () => ({
    showPRDialog: false,
    showPRKData: "" as string,
    enablePaymentRequest: useLocalStorage<boolean>("cashu.pr.enable", true),
    receivePaymentRequestsAutomatically: useLocalStorage<boolean>(
      "cashu.pr.receive",
      false
    ),
    ourPaymentRequests: useLocalStorage<OurPaymentRequest[]>(
      "cashu.pr.ours",
      []
    ),
    selectedPRIndex: useLocalStorage<number>("cashu.pr.selected_index", 0),
  }),
  getters: {
    currentPaymentRequest(state): OurPaymentRequest | undefined {
      if (!state.ourPaymentRequests.length) return undefined;
      const idx = Math.min(
        Math.max(0, state.selectedPRIndex ?? 0),
        state.ourPaymentRequests.length - 1
      );
      return state.ourPaymentRequests[idx];
    },
  },
  actions: {
    newPaymentRequest(
      amount?: number,
      memo?: string,
      mintUrl?: string,
      forceNew: boolean = false
    ) {
      this.pruneOurPaymentRequests();
      // If not forcing a new request and we already have at least one,
      // do not auto-create a new one; just show the currently selected.
      if (!forceNew && this.ourPaymentRequests.length > 0) {
        const current =
          this.currentPaymentRequest || this.ourPaymentRequests[0];
        this.showPRKData = current.encoded;
        return;
      }
      this.showPRKData = this.createPaymentRequest(amount, memo, mintUrl);
    },
    // Replaces the shown request unless it has been paid, then a new one is added.
    updatePaymentRequest(amount?: number, memo?: string, mintUrl?: string) {
      const current = this.currentPaymentRequest;
      if (current && current.receivedPaymentIds.length === 0) {
        this.ourPaymentRequests.splice(
          this.ourPaymentRequests.indexOf(current),
          1
        );
      }
      this.showPRKData = this.createPaymentRequest(amount, memo, mintUrl);
    },
    // Keeps requests addressed to this wallet's nostr key, plus any that were paid.
    pruneOurPaymentRequests() {
      const ourPubkey = useNostrStore().seedSignerPublicKey;
      if (!ourPubkey) return;
      const addressedToUs = (encoded: string) => {
        try {
          const target = decodePaymentRequest(encoded).getTransport(
            PaymentRequestTransportType.NOSTR
          )?.target;
          if (!target) return false;
          const decoded = nip19.decode(target);
          return decoded.type === "nprofile"
            ? decoded.data.pubkey === ourPubkey
            : decoded.type === "npub" && decoded.data === ourPubkey;
        } catch {
          return false;
        }
      };
      const kept = this.ourPaymentRequests.filter(
        (r) => r.receivedPaymentIds.length > 0 || addressedToUs(r.encoded)
      );
      if (kept.length === this.ourPaymentRequests.length) return;
      this.ourPaymentRequests = kept;
      this.selectedPRIndex = Math.max(0, kept.length - 1);
    },
    createPaymentRequest: function (
      amount?: number,
      memo?: string,
      mintUrl?: string
    ) {
      const nostrStore = useNostrStore();
      const mintStore = useMintsStore();
      const tags = [["n", "17"]];
      const transport = [
        {
          type: PaymentRequestTransportType.NOSTR,
          target: nostrStore.seedSignerNprofile,
          tags: tags,
        },
      ] as PaymentRequestTransport[];
      const uuid = uuidv4().split("-")[0];
      const paymentRequest = new PaymentRequest(
        transport,
        uuid,
        amount,
        mintStore.activeUnit,
        mintUrl?.length
          ? mintStore.activeMintUrl
            ? [mintStore.activeMintUrl]
            : undefined
          : undefined,
        memo
      );
      const encoded = paymentRequest.toEncodedRequest();
      this.ensureStoredRequest(paymentRequest, encoded, memo);
      this.showPRKData = encoded;
      return encoded;
    },
    ensureStoredRequest(
      request: PaymentRequest,
      encoded: string,
      memo?: string
    ) {
      // PaymentRequest.id is optional in v4; we key OurPaymentRequest by id,
      // so a request without one can't be tracked.
      if (!request.id) return;
      const existIdx = this.ourPaymentRequests.findIndex(
        (r) => r.id === request.id
      );
      const entry: OurPaymentRequest = {
        id: request.id,
        encoded,
        unit: request.unit,
        mints: request.mints,
        memo,
        createdAt: new Date().toISOString(),
        receivedPaymentIds: [],
      };
      if (existIdx >= 0) {
        // Update encoded/memo/unit/mints in case changed
        this.ourPaymentRequests[existIdx] = {
          ...this.ourPaymentRequests[existIdx],
          ...entry,
        };
        this.selectedPRIndex = existIdx;
      } else {
        this.ourPaymentRequests.push(entry);
        this.selectedPRIndex = this.ourPaymentRequests.length - 1;
      }
    },
    selectPrevRequest() {
      if (!this.ourPaymentRequests.length) return;
      this.selectedPRIndex =
        (this.selectedPRIndex - 1 + this.ourPaymentRequests.length) %
        this.ourPaymentRequests.length;
      this.showPRKData = this.ourPaymentRequests[this.selectedPRIndex].encoded;
    },
    selectNextRequest() {
      if (!this.ourPaymentRequests.length) return;
      this.selectedPRIndex =
        (this.selectedPRIndex + 1) % this.ourPaymentRequests.length;
      this.showPRKData = this.ourPaymentRequests[this.selectedPRIndex].encoded;
    },
    selectRequestByIndex(index: number) {
      if (!this.ourPaymentRequests.length) return;
      const idx = Math.min(
        Math.max(0, index),
        this.ourPaymentRequests.length - 1
      );
      this.selectedPRIndex = idx;
      this.showPRKData = this.ourPaymentRequests[idx].encoded;
    },
    registerIncomingPaymentForRequest(
      requestId: string,
      historyTokenId: string
    ) {
      const pr = this.ourPaymentRequests.find((r) => r.id === requestId);
      if (!pr) return;
      if (!pr.receivedPaymentIds.includes(historyTokenId)) {
        pr.receivedPaymentIds.push(historyTokenId);
      }
    },
    // Whether a payment pays one of our requests in full (NUT-18); false if we can't tell.
    async paymentSatisfiesRequest(
      payload: PaymentRequestPayload
    ): Promise<boolean> {
      const ours = this.ourPaymentRequests.find((r) => r.id === payload.id);
      if (!ours) return false;
      try {
        const wallet = await useWalletStore().mintWallet(
          payload.mint,
          payload.unit,
          true
        );
        const privkeys = useP2PKStore().p2pkKeys.map((k) => k.privateKey);
        // 0 is the floor for an amountless request; ignored when it sets one
        return wallet.isPaymentRequestSatisfied(
          decodePaymentRequest(ours.encoded),
          payload.proofs,
          0,
          { privkeys }
        );
      } catch (e) {
        console.warn("Could not check payment against request:", e);
        return false;
      }
    },
    getPaymentsForRequest(requestId: string) {
      const tokensStore = useTokensStore();
      const pr = this.ourPaymentRequests.find((r) => r.id === requestId);
      if (!pr) return [];
      return pr.receivedPaymentIds
        .map((id) => tokensStore.historyTokens.find((t) => t.id === id))
        .filter((t): t is HistoryToken => !!t);
    },
    async decodePaymentRequest(pr: string) {
      console.log("decodePaymentRequest", pr);
      const request: PaymentRequest = decodePaymentRequest(pr);
      this.getPaymentRequestTransport(request);
      console.log("decodePaymentRequest", request);
      const mintsStore = useMintsStore();
      // switch to a listed mint unless the active one is listed already
      if (
        request.mints?.length &&
        !request.includesMint(mintsStore.activeMintUrl)
      ) {
        const listed = mintsStore.mints.find((m) =>
          request.includesMint(m.url)
        );
        if (listed) {
          mintsStore.activeMintUrl = listed.url;
        } else if (request.isMintListStrict) {
          throw new Error(
            `This payment requires using the mint: ${request.mints}`
          );
        }
      }

      // activate the unit in the payment request
      if (request.unit) {
        // if the activeMint() supports this unit, set it
        if (mintsStore.activeMint().units.find((u) => u == request.unit)) {
          mintsStore.activeUnit = request.unit;
        } else {
          notifyWarning(
            `The mint does not support the unit in the payment request: ${request.unit}`
          );
        }
      }

      const sendTokenStore = useSendTokensStore();
      // Always clear any existing send data so a new payment request starts fresh
      sendTokenStore.clearSendData();
      // if the payment request has an amount, set it
      if (request.amount) {
        sendTokenStore.sendData.amount =
          Amount.from(request.amount).toNumber() /
          mintsStore.activeUnitCurrencyMultiplyer;
      }
      sendTokenStore.sendData.paymentRequest = request;
      if (!sendTokenStore.showSendTokens) {
        // show the send dialog
        sendTokenStore.showSendTokens = true;
      }
    },
    getPaymentRequestTransport(
      request: PaymentRequestData
    ): PaymentRequestTransport {
      const transport = request.transport?.find(
        (transport) =>
          transport.type === PaymentRequestTransportType.NOSTR ||
          transport.type === PaymentRequestTransportType.POST
      );
      if (!transport) {
        throw new Error("Unsupported payment request transport.");
      }
      return transport;
    },
    async parseAndPayPaymentRequest(
      request: PaymentRequestData,
      tokenStr: string
    ): Promise<boolean> {
      const transport = this.getPaymentRequestTransport(request);
      if (transport.type == PaymentRequestTransportType.NOSTR) {
        return await this.payNostrPaymentRequest(request, transport, tokenStr);
      }
      if (transport.type == PaymentRequestTransportType.POST) {
        return await this.payPostPaymentRequest(request, transport, tokenStr);
      }
      throw new Error("Unsupported payment request transport.");
    },
    async payNostrPaymentRequest(
      request: PaymentRequestData,
      transport: PaymentRequestTransport,
      tokenStr: string
    ): Promise<boolean> {
      console.log("payNostrPaymentRequest", request, tokenStr);
      console.log("transport", transport);
      const nostrStore = useNostrStore();
      const decodedToken = await token.decodeFull(tokenStr);
      if (!decodedToken) {
        console.error("could not decode token");
        throw new Error("Could not decode ecash token.");
      }
      const paymentPayloadString = toPaymentRequest(request).encodePayload(
        token.getMint(decodedToken),
        normalizeProofAmounts(token.getProofs(decodedToken)),
        { unit: token.getUnit(decodedToken) }
      );
      try {
        await nostrStore.sendNip17DirectMessageToNprofile(
          transport.target,
          paymentPayloadString
        );
      } catch (error) {
        console.error("Error paying payment request:", error);
        throw error;
      }
      notifySuccess("Payment sent");
      return true;
    },
    async payPostPaymentRequest(
      request: PaymentRequestData,
      transport: PaymentRequestTransport,
      tokenStr: string
    ): Promise<boolean> {
      console.log("payPostPaymentRequest", request, tokenStr);
      // get the endpoint from the transport target and make an HTTP POST request with the paymentPayload as the body
      const decodedToken = await token.decodeFull(tokenStr);
      if (!decodedToken) {
        console.error("could not decode token");
        throw new Error("Could not decode ecash token.");
      }
      const paymentPayloadString = toPaymentRequest(request).encodePayload(
        token.getMint(decodedToken),
        normalizeProofAmounts(token.getProofs(decodedToken)),
        { unit: token.getUnit(decodedToken) }
      );
      try {
        const response = await fetch(transport.target, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: paymentPayloadString,
        });
        if (!response.ok) {
          console.error("Error paying payment request:", response.statusText);
          throw new Error(response.statusText);
        }
        notifySuccess("Payment sent");
      } catch (error) {
        console.error("Error paying payment request:", error);
        throw error;
      }
      return true;
    },
  },
});
