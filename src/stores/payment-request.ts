import { defineStore } from "pinia";
import {
  PaymentRequest,
  decodePaymentRequest,
  type PaymentRequestTransport,
} from "@cashu/cashu-ts";
import { useLocalStorage } from "@vueuse/core";
import { useMintsStore } from "src/stores/mints";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { useNostrStore } from "src/stores/nostr";
import { useTokensStore } from "src/stores/tokens";
import { usePaymentJobsStore } from "src/stores/paymentJobs";
import { cashuDb } from "src/stores/dexie";
import {
  assertRequestSupported,
  assertSupportedAmount,
  decodeRecipient,
  normalizeMintUrl,
} from "src/js/paymentRequestProtocol";
import {
  paymentDto,
  type OwnedPaymentRequest,
} from "src/js/paymentRequestRepository";
import { notifySuccess } from "src/js/notify";

export type OurPaymentRequest = OwnedPaymentRequest & {
  unit?: string;
  mints?: string[];
  memo?: string;
};

export const usePRStore = defineStore("payment-request", {
  state: () => ({
    showPRDialog: false,
    showPRKData: "",
    enablePaymentRequest: useLocalStorage("cashu.pr.enable", true),
    receivePaymentRequestsAutomatically: useLocalStorage(
      "cashu.pr.receive",
      false
    ),
    advertiseInbox: useLocalStorage("cashu.pr.advertiseInbox", false),
    ourPaymentRequests: [] as OurPaymentRequest[],
    selectedPRIndex: useLocalStorage("cashu.pr.selected_index", 0),
  }),
  getters: {
    currentPaymentRequest(state): OurPaymentRequest | undefined {
      return state.ourPaymentRequests[
        Math.max(
          0,
          Math.min(state.selectedPRIndex, state.ourPaymentRequests.length - 1)
        )
      ];
    },
  },
  actions: {
    ownsRequest(request: PaymentRequest) {
      return (
        request.transport?.some((t) => {
          try {
            return (
              t.type === "nostr" &&
              decodeRecipient(t.target).pubkey ===
                useNostrStore().seedSignerPublicKey
            );
          } catch {
            return false;
          }
        }) ?? false
      );
    },
    async initOwnedRequests() {
      await useNostrStore().walletSeedGenerateKeyPair();
      const identity = useNostrStore().seedSignerPublicKey;
      const raw = localStorage.getItem("cashu.pr.ours");
      if (raw) {
        const old: Array<{
          id: string;
          encoded: string;
          createdAt?: string;
          receivedPaymentIds?: string[];
        }> = JSON.parse(raw);
        await cashuDb.transaction(
          "rw",
          cashuDb.paymentRequests,
          cashuDb.ecashHistory,
          async () => {
            for (const entry of old) {
              if (await cashuDb.paymentRequests.get(entry.id)) continue;
              let archived = true;
              try {
                archived = !this.ownsRequest(
                  decodePaymentRequest(entry.encoded)
                );
              } catch {
                /* Preserve unreadable legacy records. */
              }
              await cashuDb.paymentRequests.add({
                id: entry.id,
                identity,
                encoded: entry.encoded,
                createdAt: entry.createdAt ?? new Date().toISOString(),
                archived,
              });
              if (!archived)
                for (const historyId of entry.receivedPaymentIds ?? []) {
                  const history = await cashuDb.ecashHistory.get(historyId);
                  if (
                    history &&
                    history.amount > 0 &&
                    !history.paymentRequestId
                  )
                    await cashuDb.ecashHistory.update(historyId, {
                      paymentRequestId: entry.id,
                    });
                }
            }
          }
        );
        localStorage.removeItem("cashu.pr.ours");
      }
      const rows = await cashuDb.paymentRequests
        .where("identity")
        .equals(identity)
        .toArray();
      this.ourPaymentRequests = rows
        .filter((r) => !r.archived)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map((row) => {
          const pr = decodePaymentRequest(row.encoded);
          return {
            ...row,
            unit: pr.unit,
            mints: pr.mints,
            memo: pr.description,
          };
        });
    },
    async newPaymentRequest(
      amount?: number,
      memo?: string,
      mintUrl?: string,
      forceNew = false
    ) {
      const opening = arguments.length === 0;
      await this.initOwnedRequests();
      if (opening && this.currentPaymentRequest && !forceNew) {
        this.showPRKData = this.currentPaymentRequest.encoded;
        return this.showPRKData;
      }
      const current =
        this.currentPaymentRequest &&
        decodePaymentRequest(this.currentPaymentRequest.encoded);
      if (
        !forceNew &&
        current &&
        current.amount?.toNumber() === amount &&
        current.unit === useMintsStore().activeUnit &&
        (current.description ?? "") === (memo ?? "") &&
        JSON.stringify(current.mints ?? []) ===
          JSON.stringify(mintUrl ? [normalizeMintUrl(mintUrl)] : [])
      ) {
        this.showPRKData = this.currentPaymentRequest!.encoded;
        return this.showPRKData;
      }
      return this.createPaymentRequest(amount, memo, mintUrl);
    },
    async createPaymentRequest(
      amount?: number,
      memo?: string,
      mintUrl?: string
    ) {
      await useNostrStore().walletSeedGenerateKeyPair();
      if (amount !== undefined) assertSupportedAmount(amount);
      const builder = PaymentRequest.builder()
        .id(crypto.randomUUID())
        .unit(useMintsStore().activeUnit)
        .addNostrTransport(useNostrStore().seedSignerNprofile)
        .singleUse(false);
      if (amount !== undefined)
        builder.amount(amount, useMintsStore().activeUnit);
      if (memo) builder.description(memo);
      if (mintUrl) builder.addMint(normalizeMintUrl(mintUrl));
      const request = builder.build();
      const encoded = request.toEncodedCreqA();
      await this.ensureStoredRequest(request, encoded);
      this.showPRKData = encoded;
      return encoded;
    },
    async ensureStoredRequest(request: PaymentRequest, encoded: string) {
      if (!request.id || !this.ownsRequest(request))
        throw new Error("This is not an owned receiving request");
      const existing = await cashuDb.paymentRequests.get(request.id);
      if (existing && existing.encoded !== encoded)
        throw new Error(
          "Shared payment requests are immutable; create a new request"
        );
      if (!existing)
        await cashuDb.paymentRequests.add(
          paymentDto({
            id: request.id,
            encoded,
            identity: useNostrStore().seedSignerPublicKey,
            createdAt: new Date().toISOString(),
          })
        );
      await this.initOwnedRequests();
      this.selectedPRIndex = this.ourPaymentRequests.findIndex(
        (r) => r.id === request.id
      );
    },
    selectRequestByIndex(index: number) {
      if (!this.ourPaymentRequests.length) return;
      this.selectedPRIndex =
        (index + this.ourPaymentRequests.length) %
        this.ourPaymentRequests.length;
      this.showPRKData = this.currentPaymentRequest!.encoded;
    },
    selectPrevRequest() {
      this.selectRequestByIndex(this.selectedPRIndex - 1);
    },
    selectNextRequest() {
      this.selectRequestByIndex(this.selectedPRIndex + 1);
    },
    async registerIncomingPaymentForRequest(
      requestId: string,
      historyTokenId: string
    ) {
      if (!(await cashuDb.paymentRequests.get(requestId))) return;
      await cashuDb.ecashHistory.update(historyTokenId, {
        paymentRequestId: requestId,
      });
      await useTokensStore().refreshEcashHistory();
    },
    getPaymentsForRequest(requestId: string) {
      return useTokensStore().historyTokens.filter(
        (t) => t.paymentRequestId === requestId && t.amount > 0
      );
    },
    async decodePaymentRequest(encoded: string) {
      const request = decodePaymentRequest(encoded);
      assertRequestSupported(request);
      const mints = useMintsStore();
      const acceptable = mints.mints.filter(
        (m) =>
          (!request.isMintListStrict || request.includesMint(m.url)) &&
          (!request.unit ||
            m.keysets.some((keyset) => keyset.unit === request.unit))
      );
      const selected =
        acceptable.find((m) => request.includesMint(m.url)) ??
        acceptable.find((m) => m.url === mints.activeMintUrl) ??
        acceptable[0];
      if (!selected)
        throw new Error(
          "No trusted mint supports this request's mint and unit requirements"
        );
      mints.activeMintUrl = selected.url;
      if (request.unit) mints.activeUnit = request.unit;
      const send = useSendTokensStore();
      send.clearSendData();
      send.sendData.paymentRequest = request;
      if (request.amount !== undefined)
        send.sendData.amount =
          assertSupportedAmount(request.amount) /
          mints.activeUnitCurrencyMultiplyer;
      send.showSendTokens = true;
    },
    async parseAndPayPaymentRequest(
      request: PaymentRequest,
      tokenStr: string
    ): Promise<boolean> {
      const job =
        (await cashuDb.paymentJobs
          .where("direction")
          .equals("outgoing")
          .filter(
            (job) =>
              job.token === tokenStr &&
              job.requestEncoded === request.toEncodedRequest()
          )
          .first()) ??
        (await usePaymentJobsStore().adoptLegacyOutgoing(request, tokenStr));
      await usePaymentJobsStore().publishPayment(job.id);
      notifySuccess(
        job.transport?.type === "nostr"
          ? "Published to relay"
          : "Payment accepted by endpoint"
      );
      return true;
    },
    async payNostrPaymentRequest(
      request: PaymentRequest,
      _transport: PaymentRequestTransport,
      tokenStr: string
    ) {
      return this.parseAndPayPaymentRequest(request, tokenStr);
    },
    async payPostPaymentRequest(
      request: PaymentRequest,
      _transport: PaymentRequestTransport,
      tokenStr: string
    ) {
      return this.parseAndPayPaymentRequest(request, tokenStr);
    },
  },
});
