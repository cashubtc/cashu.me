import { defineStore } from "pinia";
import { useWalletStore } from "./wallet";
import {
  decodePaymentRequest,
  PaymentRequest,
  PaymentRequestPayload,
  PaymentRequestTransport,
  PaymentRequestTransportType,
} from "@cashu/cashu-ts";
import { bech32m } from "bech32";
import { useMintsStore } from "./mints";
import { useSendTokensStore } from "./sendTokensStore";
import { useNostrStore } from "./nostr";
import { useTokensStore } from "./tokens";
import type { HistoryToken } from "./tokens";
import token from "src/js/token";
import {
  notify,
  notifyError,
  notifySuccess,
  notifyWarning,
} from "src/js/notify";
import { useLocalStorage } from "@vueuse/core";
import { v4 as uuidv4 } from "uuid";

const NUT26_HRP = "creqb";

const NUT26_TAG = {
  ID: 0x01,
  AMOUNT: 0x02,
  UNIT: 0x03,
  SINGLE_USE: 0x04,
  MINT: 0x05,
  DESCRIPTION: 0x06,
  TRANSPORT: 0x07,
} as const;

const NUT26_TRANSPORT_KIND = {
  NOSTR: 0x00,
  HTTP_POST: 0x01,
} as const;

const NUT26_TRANSPORT_TAG = {
  KIND: 0x01,
  TARGET: 0x02,
  TAG_TUPLE: 0x03,
} as const;

function readU64BE(bytes: Uint8Array, offset: number): number {
  let val = 0;
  for (let i = 0; i < 8; i++) {
    val = val * 256 + (bytes[offset + i] ?? 0);
  }
  return val;
}

function parseTlvEntries(
  bytes: Uint8Array
): Array<{ type: number; value: Uint8Array }> {
  const entries: Array<{ type: number; value: Uint8Array }> = [];
  let i = 0;
  while (i < bytes.length) {
    const type = bytes[i++];
    if (i + 2 > bytes.length) break;
    const len = (bytes[i] << 8) | bytes[i + 1];
    i += 2;
    if (i + len > bytes.length) break;
    entries.push({ type, value: bytes.slice(i, i + len) });
    i += len;
  }
  return entries;
}

function parseTransportTlv(bytes: Uint8Array): PaymentRequestTransport | null {
  const entries = parseTlvEntries(bytes);
  let kind: number | undefined;
  let target = "";
  const tags: string[][] = [];

  for (const entry of entries) {
    if (entry.type === NUT26_TRANSPORT_TAG.KIND) {
      kind = entry.value[0];
    } else if (entry.type === NUT26_TRANSPORT_TAG.TARGET) {
      target = new TextDecoder().decode(entry.value);
    } else if (entry.type === NUT26_TRANSPORT_TAG.TAG_TUPLE) {
      const tagBytes = entry.value;
      let pos = 0;
      const tuple: string[] = [];
      while (pos < tagBytes.length) {
        const sLen = tagBytes[pos++];
        tuple.push(new TextDecoder().decode(tagBytes.slice(pos, pos + sLen)));
        pos += sLen;
      }
      if (tuple.length > 0) tags.push(tuple);
    }
  }

  if (kind === undefined) return null;

  if (kind === NUT26_TRANSPORT_KIND.NOSTR) {
    return {
      type: PaymentRequestTransportType.NOSTR,
      target,
      tags: tags.length ? tags : undefined,
    } as PaymentRequestTransport;
  }
  if (kind === NUT26_TRANSPORT_KIND.HTTP_POST) {
    return {
      type: PaymentRequestTransportType.POST,
      target,
      tags: tags.length ? tags : undefined,
    } as PaymentRequestTransport;
  }
  return null;
}

export function decodeNut26PaymentRequest(encoded: string): PaymentRequest {
  const decoded = bech32m.decode(encoded.toLowerCase(), 8192);
  if (decoded.prefix !== NUT26_HRP) {
    throw new Error(
      `Invalid NUT-26 payment request: expected HRP "${NUT26_HRP}", got "${decoded.prefix}"`
    );
  }

  const bytes = new Uint8Array(bech32m.fromWords(decoded.words));
  const entries = parseTlvEntries(bytes);
  const decoder = new TextDecoder();

  let id: string | undefined;
  let amount: number | undefined;
  let unit: string | undefined;
  let singleUse = false;
  const mints: string[] = [];
  let description: string | undefined;
  const transports: PaymentRequestTransport[] = [];

  for (const entry of entries) {
    switch (entry.type) {
      case NUT26_TAG.ID:
        id = decoder.decode(entry.value);
        break;
      case NUT26_TAG.AMOUNT: {
        const padded = new Uint8Array(8);
        padded.set(entry.value, 8 - entry.value.length);
        amount = readU64BE(padded, 0);
        break;
      }
      case NUT26_TAG.UNIT:
        unit =
          entry.value.length === 1 && entry.value[0] === 0x00
            ? "sat"
            : decoder.decode(entry.value);
        break;
      case NUT26_TAG.SINGLE_USE:
        singleUse = entry.value[0] === 0x01;
        break;
      case NUT26_TAG.MINT:
        mints.push(decoder.decode(entry.value));
        break;
      case NUT26_TAG.DESCRIPTION:
        description = decoder.decode(entry.value);
        break;
      case NUT26_TAG.TRANSPORT: {
        const transport = parseTransportTlv(entry.value);
        if (transport) transports.push(transport);
        break;
      }
      default:
        break;
    }
  }

  return new PaymentRequest(
    transports.length ? transports : undefined,
    id,
    amount,
    unit,
    mints.length ? mints : undefined,
    description,
    singleUse
  );
}

export function isNut26PaymentRequest(req: string): boolean {
  return req.toLowerCase().startsWith(NUT26_HRP + "1");
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
      const walletStore = useWalletStore();
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
      const request: PaymentRequest = isNut26PaymentRequest(pr)
        ? decodeNut26PaymentRequest(pr)
        : decodePaymentRequest(pr);
      console.log("decodePaymentRequest", request);
      const mintsStore = useMintsStore() as any;
      // activate the mint in the payment request
      if (request.mints && request.mints.length > 0) {
        let foundMint = false;
        for (const mint of request.mints) {
          if (mintsStore.mints.find((m) => m.url == mint)) {
            // await mintsStore.activateMintUrl(mint, false, false, request.unit);
            mintsStore.activeMintUrl = mint;
            foundMint = true;
            break;
          }
        }
        if (!foundMint) {
          notifyError(`This payment requires using the mint: ${request.mints}`);
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
      if (!sendTokenStore.showSendTokens) {
        // if the sendtokendialog is not currently open, clear all data and then show the send dialog
        sendTokenStore.clearSendData();
      }
      // if the payment request has an amount, set it
      if (request.amount) {
        sendTokenStore.sendData.amount =
          request.amount / mintsStore.activeUnitCurrencyMultiplyer;
      }
      // Also make sure this decoded request gets stored (e.g., if user pasted an older one)
      try {
        const encoded = pr;
        this.ensureStoredRequest(request, encoded);
        this.showPRKData = encoded;
      } catch (e) {
        // noop
      }
      sendTokenStore.sendData.paymentRequest = request;
      if (!sendTokenStore.showSendTokens) {
        // show the send dialog
        sendTokenStore.showSendTokens = true;
      }
    },
    async parseAndPayPaymentRequest(
      request: PaymentRequest,
      tokenStr: string
    ): Promise<boolean> {
      const transports: PaymentRequestTransport[] = request.transport ?? [];
      for (const transport of transports) {
        if (transport.type == PaymentRequestTransportType.NOSTR) {
          return await this.payNostrPaymentRequest(
            request,
            transport,
            tokenStr
          );
        }
        if (transport.type == PaymentRequestTransportType.POST) {
          return await this.payPostPaymentRequest(request, transport, tokenStr);
        }
      }
      throw new Error("Unsupported payment request transport.");
    },
    async payNostrPaymentRequest(
      request: PaymentRequest,
      transport: PaymentRequestTransport,
      tokenStr: string
    ): Promise<boolean> {
      console.log("payNostrPaymentRequest", request, tokenStr);
      console.log("transport", transport);
      const nostrStore = useNostrStore();
      const decodedToken = token.decode(tokenStr);
      if (!decodedToken) {
        console.error("could not decode token");
        throw new Error("Could not decode ecash token.");
      }
      const proofs = token.getProofs(decodedToken);
      const mint = token.getMint(decodedToken);
      const paymentPayload: PaymentRequestPayload = {
        id: request.id,
        mint: mint,
        unit: request.unit || "",
        proofs: proofs,
      };
      const paymentPayloadString = JSON.stringify(paymentPayload);
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
      request: PaymentRequest,
      transport: PaymentRequestTransport,
      tokenStr: string
    ): Promise<boolean> {
      console.log("payPostPaymentRequest", request, tokenStr);
      // get the endpoint from the transport target and make an HTTP POST request with the paymentPayload as the body
      const decodedToken = token.decode(tokenStr);
      if (!decodedToken) {
        console.error("could not decode token");
        throw new Error("Could not decode ecash token.");
      }
      const proofs = token.getProofs(decodedToken);
      const unit = token.getUnit(decodedToken);
      const mint = token.getMint(decodedToken);
      const paymentPayload: PaymentRequestPayload = {
        id: request.id,
        mint: mint,
        unit: unit,
        proofs: proofs,
      };
      const paymentPayloadString = JSON.stringify(paymentPayload);
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
