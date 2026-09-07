import { defineStore } from "pinia";
import { liveQuery } from "dexie";
import {
  Amount,
  PaymentRequest,
  JSONInt,
  getEncodedToken,
  getTokenMetadata,
  serializeSwapPreview,
  deserializeSwapPreview,
  normalizeProofAmounts,
  type PaymentRequestPayload,
  type Wallet,
} from "@cashu/cashu-ts";
import { getPublicKey, type Event } from "nostr-tools";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { cashuDb } from "src/stores/dexie";
import { useWalletStore } from "src/stores/wallet";
import { useMintsStore } from "src/stores/mints";
import { useProofsStore } from "src/stores/proofs";
import { useTokensStore, type HistoryToken } from "src/stores/tokens";
import { useP2PKStore } from "src/stores/p2pk";
import { useUiStore } from "src/stores/ui";
import { usePRStore } from "src/stores/payment-request";
import { useNostrStore } from "src/stores/nostr";
import {
  assertRequestSupported,
  assertSupportedAmount,
  assertMessageSize,
  decodeGiftWrap,
  decodePaymentPayload,
  encodeGiftWrap,
  decodeRecipient,
  normalizeMintUrl,
  payloadIdentity,
  proofIdentity,
  selectPaymentTransport,
  MAX_PAYMENT_PROOFS,
} from "src/js/paymentRequestProtocol";
import { paymentDto, type PaymentJob } from "src/js/paymentRequestRepository";
import { completeRecoverableSwap } from "src/js/paymentSwap";
import { publishToRelays, resolveInboxRelays } from "src/js/paymentRelay";
import token from "src/js/token";

const now = () => new Date().toISOString();
const activeJobs = new Set<string>();

function identity() {
  if (!useWalletStore().mnemonic)
    throw new Error("Initialize the wallet before receiving payments");
  return getPublicKey(useWalletStore().seed.slice(0, 32));
}

function assertIdentity(expected: string) {
  if (expected !== identity())
    throw new Error("Wallet changed during payment processing");
}

async function runExclusive<T>(id: string, work: () => Promise<T>): Promise<T> {
  const lockId = identity();
  if (activeJobs.has(id)) throw new Error("Payment is already being processed");
  activeJobs.add(id);
  const run = async () => {
    const ui = useUiStore();
    const owner = crypto.randomUUID();
    await ui.lockMutex("normal");
    let renewal: ReturnType<typeof setInterval> | undefined;
    try {
      if (lockId !== identity())
        throw new Error("Wallet changed while waiting for payment processing");
      await cashuDb.transaction("rw", cashuDb.paymentLocks, async () => {
        const held = await cashuDb.paymentLocks.get(lockId);
        if (held && held.expires > Date.now())
          throw new Error("Another wallet tab is processing a payment");
        await cashuDb.paymentLocks.put({
          id: lockId,
          owner,
          expires: Date.now() + 120000,
        });
      });
      renewal = setInterval(() => {
        cashuDb
          .transaction("rw", cashuDb.paymentLocks, async () => {
            const held = await cashuDb.paymentLocks.get(lockId);
            if (held?.owner === owner)
              await cashuDb.paymentLocks.update(lockId, {
                expires: Date.now() + 120000,
              });
          })
          .catch(() => {});
      }, 10000);
      return await work();
    } finally {
      clearInterval(renewal);
      await cashuDb
        .transaction("rw", cashuDb.paymentLocks, async () => {
          if ((await cashuDb.paymentLocks.get(lockId))?.owner === owner)
            await cashuDb.paymentLocks.delete(lockId);
        })
        .finally(() => ui.unlockMutex());
    }
  };
  try {
    // The app's tab guard is UX, not a transaction lock.
    if (navigator.locks)
      return await navigator.locks.request(
        `cashu-payment-wallet:${lockId}`,
        run
      );
    return await run();
  } finally {
    activeJobs.delete(id);
  }
}

function checkRequestMatch(
  request: PaymentRequest,
  payload: PaymentRequestPayload,
  wallet: Wallet
) {
  if (request.unit && request.unit !== payload.unit)
    throw new Error("Payment unit does not match the request");
  if (request.isMintListStrict && !request.includesMint(payload.mint))
    throw new Error("Payment mint does not match the request");
  if (request.supportedMethods?.length) {
    const methods = wallet
      .getMintInfo()
      .supportedMethods("melt")
      .filter((m) => m.unit === payload.unit)
      .map((m) => m.method);
    if (!request.supportedMethods.some((m) => methods.includes(m.method)))
      throw new Error("Mint cannot honor the requested payment methods");
  }
  if (request.nut10) {
    const expected = request.toP2PKOptions();
    if (!expected) throw new Error("Unsupported payment locking condition");
    for (const proof of payload.proofs) {
      let secret;
      try {
        secret = JSON.parse(proof.secret);
      } catch {
        throw new Error("Payment is not locked as requested");
      }
      const actual = new PaymentRequest({
        nut10: {
          kind: secret[0],
          data: secret[1]?.data,
          tags: secret[1]?.tags,
        },
      }).toP2PKOptions();
      if (JSON.stringify(actual) !== JSON.stringify(expected))
        throw new Error("Payment locking condition does not match");
    }
  }
  // For amountless requests any positive net amount is acceptable.
  if (!wallet.isPaymentRequestSatisfied(request, payload.proofs, 1))
    throw new Error("Payment is below the required net amount and fees");
  assertSupportedAmount(Amount.sum(payload.proofs.map((p) => p.amount)));
}

export const usePaymentJobsStore = defineStore("payment-jobs", {
  state: () => ({ jobs: [] as PaymentJob[], initialized: false }),
  actions: {
    async init() {
      if (this.initialized) return;
      this.initialized = true;
      const subscription = liveQuery(() =>
        cashuDb.paymentJobs.toArray()
      ).subscribe({
        next: (jobs) => {
          this.jobs = jobs.sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt)
          );
        },
        error: () => {
          this.initialized = false;
        },
      });
      const dispose = this.$dispose.bind(this);
      this.$dispose = () => {
        subscription.unsubscribe();
        dispose();
      };
      this.jobs = await cashuDb.paymentJobs.toArray();
    },
    async refresh() {
      this.jobs = (await cashuDb.paymentJobs.toArray()).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
      await useTokensStore().refreshEcashHistory();
    },
    async failJob(id: string, reason: string) {
      const job = await cashuDb.paymentJobs.get(id);
      if (!job || ["confirmed", "published"].includes(job.state)) return;
      const attempts = job.attempts + 1;
      await cashuDb.paymentJobs.update(id, {
        reason,
        attempts,
        updatedAt: now(),
        retryAt:
          Date.now() + Math.min(300000, 2000 * 2 ** Math.min(attempts, 8)),
      });
      await this.refresh();
    },
    async preflight(request: PaymentRequest) {
      assertRequestSupported(request);
      const transport = selectPaymentTransport(request);
      let relays: string[] | undefined;
      if (transport.type === "nostr") {
        const recipient = decodeRecipient(transport.target);
        relays = await resolveInboxRelays(
          recipient.pubkey,
          recipient.relays,
          useNostrStore().relays
        );
      }
      return {
        transport: { type: transport.type, target: transport.target },
        relays,
      };
    },
    async prepareOutgoing(
      request: PaymentRequest,
      amount: number,
      mint: string,
      unit: string
    ): Promise<PaymentJob> {
      const owner = identity();
      const encoded = request.toEncodedRequest();
      // A retry must resume the existing debit, even after changing the active
      // mint or reopening the dialog. Only published payments may be paid anew.
      const pending = () =>
        cashuDb.paymentJobs
          .where("identity")
          .equals(owner)
          .filter(
            (job) =>
              job.direction === "outgoing" &&
              job.requestEncoded === encoded &&
              ["prepared", "ready"].includes(job.state)
          )
          .first();
      const existing = await pending();
      if (existing)
        return runExclusive(existing.id, () =>
          this.completeOutgoing(existing.id)
        );
      const snapshot = PaymentRequest.fromEncodedRequest(encoded);
      assertSupportedAmount(amount);
      const route = await this.preflight(snapshot);
      const id = crypto.randomUUID();
      return runExclusive(id, async () => {
        assertIdentity(owner);
        const concurrent = await pending();
        if (concurrent) return this.completeOutgoing(concurrent.id);
        const wallet = await useWalletStore().mintWallet(mint, unit, true);
        const candidates = (await useProofsStore().getProofs()).filter(
          (p) => !p.reserved && wallet.keyChain.isUnitKeyset(p.id)
        );
        const builder = wallet.ops
          .sendToRequest(
            snapshot,
            normalizeProofAmounts(candidates),
            snapshot.amount === undefined ? amount : undefined
          )
          .keepAsDeterministic();
        // Do not override a requested lock with deterministic bearer outputs.
        if (!snapshot.nut10) builder.asDeterministic();
        const preview = await builder.prepare();
        assertIdentity(owner);
        if ((preview.sendOutputs?.length ?? 0) > MAX_PAYMENT_PROOFS)
          throw new Error("Payment requires too many proofs for Nostr");
        // Estimate with the exact secrets/metadata and a maximum-length signature.
        const estimated = snapshot.encodePayload(
          mint,
          (preview.sendOutputs ?? []).map((o) => ({
            id: o.blindedMessage.id,
            amount: o.blindedMessage.amount,
            secret: new TextDecoder().decode(o.secret),
            C: "0".repeat(96),
            dleq: { e: "0".repeat(64), s: "0".repeat(64), r: "0".repeat(64) },
            ...(o.ephemeralE ? { p2pk_e: o.ephemeralE } : {}),
          })),
          { unit }
        );
        if (route.transport.type === "nostr") {
          // Check both encryption layers, including JSON escaping, before debit.
          // This trial envelope is never saved or published.
          encodeGiftWrap(
            estimated,
            useWalletStore().seed.slice(0, 32),
            decodeRecipient(route.transport.target).pubkey
          );
        }
        const job: PaymentJob = {
          id,
          identity: owner,
          direction: "outgoing",
          state: "prepared",
          createdAt: now(),
          updatedAt: now(),
          mint,
          unit,
          requestId: snapshot.id,
          requestEncoded: encoded,
          historyId: id,
          attempts: 0,
          amount,
          preview: serializeSwapPreview(preview),
          ...route,
        };
        await cashuDb.transaction(
          "rw",
          cashuDb.proofs,
          cashuDb.paymentJobs,
          async () => {
            assertIdentity(owner);
            for (const proof of preview.inputs) {
              const stored = await cashuDb.proofs.get(proof.secret);
              if (!stored || stored.reserved)
                throw new Error("Payment inputs are no longer available");
              await cashuDb.proofs.update(proof.secret, {
                reserved: true,
                quote: id,
              });
            }
            await cashuDb.paymentJobs.add(paymentDto(job));
          }
        );
        try {
          return await this.completeOutgoing(id, wallet);
        } catch (error) {
          await this.failJob(
            id,
            "Preparing payment was interrupted. Retry the saved payment."
          );
          throw error;
        }
      });
    },
    async completeOutgoing(id: string, wallet?: Wallet): Promise<PaymentJob> {
      const job = await cashuDb.paymentJobs.get(id);
      if (!job || job.identity !== identity())
        throw new Error("Payment belongs to another wallet");
      if (job.token) return job;
      if (!job.preview || !job.requestEncoded)
        throw new Error("Missing saved payment preparation");
      wallet ??= await useWalletStore().mintWallet(job.mint, job.unit, true);
      assertIdentity(job.identity);
      const preview = deserializeSwapPreview(job.preview);
      const result = await completeRecoverableSwap(wallet, preview);
      if (job.identity !== identity())
        throw new Error(
          "Wallet changed; resume this saved payment in its original wallet"
        );
      const request = PaymentRequest.fromEncodedRequest(job.requestEncoded);
      const tokenStr = getEncodedToken({
        mint: job.mint,
        unit: job.unit,
        proofs: result.send,
      });
      const payload = request.encodePayload(job.mint, result.send, {
        unit: job.unit,
      });
      const next = paymentDto({
        ...job,
        token: tokenStr,
        payload,
        state: "ready" as const,
        updatedAt: now(),
        reason: undefined,
        retryAt: undefined,
      });
      const history: HistoryToken = {
        id,
        amount: -Amount.sum(result.send.map((p) => p.amount)).toNumber(),
        date: job.createdAt,
        status: "pending",
        token: tokenStr,
        mint: job.mint,
        unit: job.unit,
        paymentRequestEncoded: job.requestEncoded,
        paymentJobId: id,
        deliveryState: "ready",
      };
      await cashuDb.transaction(
        "rw",
        cashuDb.proofs,
        cashuDb.ecashHistory,
        cashuDb.paymentJobs,
        async () => {
          await cashuDb.proofs.bulkDelete(preview.inputs.map((p) => p.secret));
          await cashuDb.proofs.bulkPut(
            useProofsStore().proofsToWalletProofs(result.keep)
          );
          await cashuDb.ecashHistory.put(paymentDto(history));
          await cashuDb.paymentJobs.put(next);
        }
      );
      await this.refresh();
      return next;
    },
    async adoptLegacyOutgoing(
      request: PaymentRequest,
      encodedToken: string
    ): Promise<PaymentJob> {
      const owner = identity();
      const encoded = request.toEncodedRequest();
      const history = await cashuDb.ecashHistory
        .where("token")
        .equals(encodedToken)
        .first();
      const savedRequest = history?.paymentRequestEncoded;
      if (
        !history ||
        history.amount >= 0 ||
        history.status !== "pending" ||
        !savedRequest ||
        PaymentRequest.fromEncodedRequest(savedRequest).toEncodedRequest() !==
          encoded
      ) {
        throw new Error(
          "No pending payment history matches this request and token"
        );
      }
      const route = await this.preflight(request);
      return runExclusive(history.id, async () => {
        assertIdentity(owner);
        const existing = await cashuDb.paymentJobs.get(history.id);
        if (existing) return existing;
        const meta = getTokenMetadata(encodedToken);
        if (
          !useMintsStore().mints.some(
            (m) => normalizeMintUrl(m.url) === normalizeMintUrl(meta.mint)
          )
        )
          throw new Error("Approve the saved payment's mint before retrying");
        const decoded = await token.decodeFull(encodedToken);
        assertIdentity(owner);
        if (!decoded) throw new Error("Could not decode saved payment");
        const payload = request.encodePayload(decoded.mint, decoded.proofs, {
          unit: decoded.unit,
        });
        if (route.transport.type === "nostr") assertMessageSize(payload);
        const job: PaymentJob = {
          id: history.id,
          identity: owner,
          direction: "outgoing",
          state: "ready",
          createdAt: history.date,
          updatedAt: now(),
          mint: decoded.mint,
          unit: decoded.unit ?? meta.unit,
          requestId: request.id,
          requestEncoded: encoded,
          historyId: history.id,
          token: encodedToken,
          payload,
          amount: -history.amount,
          attempts: 0,
          ...route,
        };
        await cashuDb.transaction(
          "rw",
          cashuDb.paymentJobs,
          cashuDb.ecashHistory,
          async () => {
            await cashuDb.paymentJobs.add(paymentDto(job));
            await cashuDb.ecashHistory.update(history.id, {
              paymentJobId: job.id,
              deliveryState: "ready",
            });
          }
        );
        return job;
      });
    },
    async publishPayment(id: string) {
      return runExclusive(id, async () => {
        let job = await this.completeOutgoing(id);
        if (job.state === "published" || job.state === "confirmed") return job;
        try {
          if (job.transport?.type === "nostr") {
            if (!job.envelope) {
              const recipient = decodeRecipient(job.transport.target);
              const envelope = encodeGiftWrap(
                job.payload!,
                useWalletStore().seed.slice(0, 32),
                recipient.pubkey
              );
              await cashuDb.paymentJobs.update(id, {
                envelope: paymentDto(envelope),
              });
              job = { ...job, envelope };
            }
            const result = await publishToRelays(
              job.envelope!,
              job.relays ?? []
            );
            job.acceptedRelays = result.accepted;
          } else if (job.transport?.type === "post") {
            const response = await fetch(job.transport.target, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: job.payload,
              redirect: "error",
              signal: AbortSignal.timeout(15000),
            });
            if (!response.ok)
              throw new Error("Payment endpoint rejected the payment");
          } else throw new Error("Unsupported saved payment transport");
          job.state = "published";
          job.reason = undefined;
          job.retryAt = undefined;
          job.updatedAt = now();
          await cashuDb.transaction(
            "rw",
            cashuDb.paymentJobs,
            cashuDb.ecashHistory,
            async () => {
              await cashuDb.paymentJobs.put(paymentDto(job!));
              await cashuDb.ecashHistory.update(id, {
                deliveryState: "published",
              });
            }
          );
          await this.refresh();
          return job;
        } catch (error) {
          await this.failJob(
            id,
            "Publication was not acknowledged. Retry this saved payment."
          );
          throw error;
        }
      });
    },
    async ingestEnvelope(event: Event) {
      const owner = identity();
      const recipientKey = useWalletStore().seed.slice(0, 32);
      const existing = await cashuDb.paymentEnvelopes.get(event.id);
      if (existing && existing.state !== "stored") return;
      if (!existing)
        await cashuDb.paymentEnvelopes.put({
          id: event.id,
          identity: owner,
          created_at: event.created_at,
          state: "stored",
          event: paymentDto(event),
        });
      if (owner !== identity())
        throw new Error("Wallet changed during receipt storage");
      let content: string;
      try {
        content = decodeGiftWrap(event, recipientKey).content;
      } catch {
        await cashuDb.paymentEnvelopes.update(event.id, {
          state: "invalid",
          event: undefined,
        });
        return;
      }
      const receipts = await this.ingestContent(content, owner);
      await cashuDb.paymentEnvelopes.update(event.id, {
        state: "processed",
        receiptIds: receipts,
        event: undefined,
      });
    },
    async ingestContent(
      content: string,
      owner = identity()
    ): Promise<string[]> {
      assertIdentity(owner);
      let payload: PaymentRequestPayload;
      try {
        payload = decodePaymentPayload(content);
      } catch {
        // Ordinary text is a separate legacy path, not a failed JSON cast.
        const candidates = [
          ...new Set(content.match(/cashu[AB][-A-Za-z0-9_+/=]+/g) ?? []),
        ];
        const ids: string[] = [];
        for (const encoded of candidates.slice(0, 8)) {
          let meta: ReturnType<typeof getTokenMetadata>;
          let mint: string;
          try {
            meta = getTokenMetadata(encoded);
            mint = normalizeMintUrl(meta.mint);
          } catch {
            continue; // Not a decodable token. Storage failures must propagate.
          }
          // Stable IDs also deduplicate concurrent plaintext delivery.
          const fingerprint = bytesToHex(sha256(encoded));
          const id = `${owner}:legacy:${fingerprint}`;
          assertIdentity(owner);
          await cashuDb.transaction("rw", cashuDb.paymentJobs, async () => {
            assertIdentity(owner);
            if (await cashuDb.paymentJobs.get(id)) return;
            await cashuDb.paymentJobs.add({
              id,
              identity: owner,
              direction: "incoming",
              state: "review",
              createdAt: now(),
              updatedAt: now(),
              token: encoded,
              fingerprint,
              mint,
              unit: meta.unit,
              historyId: id,
              attempts: 0,
              reason: "Unsolicited ecash: review before claiming",
            });
          });
          ids.push(id);
        }
        return ids;
      }
      const fingerprint = payloadIdentity(payload);
      const proofIds = payload.proofs.map((p) =>
        proofIdentity(payload.mint, p)
      );
      const id = `${owner}:${fingerprint}`;
      const owned = payload.id
        ? await cashuDb.paymentRequests.get(payload.id)
        : undefined;
      const known = useMintsStore().mints.some(
        (m) => normalizeMintUrl(m.url) === payload.mint
      );
      const matching = owned?.identity === owner && !owned.archived && known;
      const job: PaymentJob = {
        id,
        identity: owner,
        direction: "incoming",
        state: matching ? "pending" : "review",
        createdAt: now(),
        updatedAt: now(),
        mint: payload.mint,
        unit: payload.unit,
        requestId: payload.id,
        requestEncoded: matching ? owned!.encoded : undefined,
        matching: false,
        payload: JSONInt.stringify(payload)!,
        token: getEncodedToken(payload),
        historyId: id,
        fingerprint,
        proofIds,
        attempts: 0,
        reason: matching
          ? undefined
          : "Unknown request or mint: review before claiming",
      };
      const legacyHistory = await cashuDb.ecashHistory
        .where("token")
        .equals(job.token!)
        .first();
      if (legacyHistory?.amount > 0) {
        job.historyId = legacyHistory.id;
        if (legacyHistory.status === "paid") {
          job.state = "confirmed";
          job.amount = legacyHistory.amount;
          job.fee = legacyHistory.fee;
          job.matching =
            !!matching && legacyHistory.paymentRequestId === job.requestId;
        }
      }
      await cashuDb.transaction(
        "rw",
        cashuDb.paymentJobs,
        cashuDb.paymentProofClaims,
        async () => {
          if (job.identity !== identity())
            throw new Error("Wallet changed during receipt storage");
          if (await cashuDb.paymentJobs.get(id)) return;
          const claims = await cashuDb.paymentProofClaims.bulkGet(proofIds);
          if (claims.some(Boolean)) {
            job.state = "review";
            job.reason = "Proofs overlap an existing payment";
          } else
            await cashuDb.paymentProofClaims.bulkAdd(
              proofIds.map((proofId) => ({ id: proofId, jobId: id }))
            );
          await cashuDb.paymentJobs.add(paymentDto(job));
        }
      );
      await this.refresh();
      return [id];
    },
    async redeemReceipt(id: string, manual = false) {
      return runExclusive(id, async () => {
        let job = await cashuDb.paymentJobs.get(id);
        if (!job || job.identity !== identity() || job.direction !== "incoming")
          throw new Error("Unknown incoming payment");
        if (job.state === "confirmed") return job;
        if (
          !manual &&
          (!usePRStore().receivePaymentRequestsAutomatically ||
            job.state === "review")
        )
          return job;
        if (
          !useMintsStore().mints.some(
            (m) => normalizeMintUrl(m.url) === job!.mint
          )
        )
          throw new Error(
            "Approve this mint in the receive dialog before claiming"
          );
        try {
          const wallet = await useWalletStore().mintWallet(
            job.mint,
            job.unit,
            true
          );
          assertIdentity(job.identity);
          const payload = job.payload
            ? decodePaymentPayload(job.payload)
            : await token.decodeFull(job.token!);
          if (!payload) throw new Error("Unable to decode payment");
          if (job.requestEncoded && !job.preview) {
            try {
              const request = PaymentRequest.fromEncodedRequest(
                job.requestEncoded
              );
              checkRequestMatch(
                request,
                payload as PaymentRequestPayload,
                wallet
              );
              if (
                request.singleUse &&
                (
                  await cashuDb.paymentJobs
                    .where("requestId")
                    .equals(request.id!)
                    .toArray()
                ).some(
                  (p) =>
                    p.id !== id &&
                    p.direction === "incoming" &&
                    p.state === "confirmed" &&
                    p.matching
                )
              )
                throw new Error("Single-use request is already paid");
              job.matching = true;
            } catch {
              job.matching = false;
              job.state = "review";
              job.reason = "Payment does not meet the request terms";
              await cashuDb.paymentJobs.put(paymentDto(job));
              if (!manual) {
                await this.refresh();
                return job;
              }
            }
          }
          assertSupportedAmount(
            Amount.sum(payload.proofs.map((p) => p.amount))
          );
          // A replay with a different wrapper/request ID must not redeem an overlap twice.
          const claims = await cashuDb.paymentProofClaims.bulkGet(
            payload.proofs.map((p) => proofIdentity(job!.mint, p))
          );
          if (claims.some((c) => c && c.jobId !== id))
            throw new Error(
              "Payment overlaps an existing receipt; review that receipt instead"
            );
          const privkey = await useP2PKStore().getPrivateKeyForP2PKEncodedToken(
            job.token!
          );
          if (!job.preview) {
            const preview = await wallet.ops
              .receive(payload)
              .asDeterministic()
              .privkey(privkey)
              .prepare();
            assertIdentity(job.identity);
            job = {
              ...job,
              preview: serializeSwapPreview(preview),
              state: "prepared",
              updatedAt: now(),
            };
            await cashuDb.paymentJobs.put(paymentDto(job));
          }
          assertIdentity(job.identity);
          const result = await completeRecoverableSwap(
            wallet,
            deserializeSwapPreview(job.preview!),
            privkey
          );
          if (job.identity !== identity())
            throw new Error(
              "Wallet changed; resume this saved receipt in its original wallet"
            );
          const amount = Amount.sum(
            result.keep.map((p) => p.amount)
          ).toNumber();
          const fee =
            Amount.sum(payload.proofs.map((p) => p.amount)).toNumber() - amount;
          const history: HistoryToken = {
            id: job.historyId,
            amount,
            fee,
            status: "paid",
            date: job.createdAt,
            paidDate: now(),
            token: job.token,
            mint: job.mint,
            unit: job.unit,
            paymentRequestId: job.matching ? job.requestId : undefined,
            paymentJobId: id,
            paymentMatching: !!job.matching,
            label: (payload as PaymentRequestPayload).memo,
          };
          job = {
            ...job,
            state: "confirmed",
            amount,
            fee,
            updatedAt: now(),
            reason: undefined,
            retryAt: undefined,
          };
          await cashuDb.transaction(
            "rw",
            cashuDb.proofs,
            cashuDb.ecashHistory,
            cashuDb.paymentJobs,
            cashuDb.paymentProofClaims,
            async () => {
              assertIdentity(job!.identity);
              await cashuDb.proofs.bulkPut(
                useProofsStore().proofsToWalletProofs(result.keep)
              );
              await cashuDb.ecashHistory.put(paymentDto(history));
              await cashuDb.paymentJobs.put(paymentDto(job!));
              await cashuDb.paymentProofClaims.bulkPut(
                payload.proofs.map((p) => ({
                  id: proofIdentity(job!.mint, p),
                  jobId: id,
                }))
              );
            }
          );
          useP2PKStore().setPrivateKeyUsed(privkey);
          await this.refresh();
          return job;
        } catch (error) {
          await this.failJob(
            id,
            "Receiving was interrupted. The payment is saved for retry."
          );
          throw error;
        }
      });
    },
    async retryPending() {
      const jobs = await cashuDb.paymentJobs
        .where("identity")
        .equals(identity())
        .toArray();
      for (const job of jobs) {
        if (activeJobs.has(job.id) || (job.retryAt && job.retryAt > Date.now()))
          continue;
        try {
          if (
            job.direction === "incoming" &&
            ["pending", "prepared"].includes(job.state)
          )
            await this.redeemReceipt(job.id);
          if (
            job.direction === "outgoing" &&
            ["prepared", "ready"].includes(job.state)
          )
            await this.publishPayment(job.id);
        } catch {
          /* Job records hold a redacted, retryable failure. */
        }
      }
    },
  },
});
