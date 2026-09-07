import { finalizeEvent, getPublicKey } from "nostr-tools";
import { PaymentRelay, publishToRelays } from "src/js/paymentRelay";
import {
  normalizeRelayUrls,
  RECOVERY_OVERLAP_SECONDS,
} from "src/js/paymentRequestProtocol";
import { cashuDb } from "src/stores/dexie";
import { useWalletStore } from "src/stores/wallet";
import { usePRStore } from "src/stores/payment-request";
import { usePaymentJobsStore } from "src/stores/paymentJobs";
import { useNostrStore } from "src/stores/nostr";
import type { RelayCheckpoint } from "src/js/paymentRequestRepository";

let generation = 0;
let runningKey = "";
let initialized = false;
let retryTimer: ReturnType<typeof setInterval> | undefined;
const connections = new Map<string, PaymentRelay>();
const reconnectTimers = new Set<ReturnType<typeof setTimeout>>();

export function stopPaymentReceiver() {
  generation++;
  runningKey = "";
  clearInterval(retryTimer);
  for (const timer of reconnectTimers) clearTimeout(timer);
  reconnectTimers.clear();
  for (const relay of connections.values()) relay.close();
  connections.clear();
}

/** Persist progress only after actual EOSE and successful durable ingestion. */
export async function backfillPayments(
  relay: PaymentRelay,
  checkpoint: RelayCheckpoint,
  receive: (event: import("nostr-tools").Event) => Promise<void>,
  active = () => true
) {
  const startedAt = Math.floor(Date.now() / 1000);
  const base = { kinds: [1059], "#p": [checkpoint.identity] };
  if (checkpoint.complete && checkpoint.syncedThrough !== undefined) {
    // Catch up newest-first with the same pagination as full recovery.
    checkpoint = { ...checkpoint, until: undefined, complete: false };
  }
  const lowerBound =
    checkpoint.syncedThrough !== undefined
      ? Math.max(0, checkpoint.syncedThrough - RECOVERY_OVERLAP_SECONDS)
      : undefined;
  while (active()) {
    const events = await relay.query({
      ...base,
      ...(checkpoint.until !== undefined ? { until: checkpoint.until } : {}),
      ...(lowerBound !== undefined ? { since: lowerBound } : {}),
      limit: checkpoint.limit,
    });
    if (!active()) return;
    for (const event of events) await receive(event);
    if (!events.length) {
      await cashuDb.paymentCheckpoints.put({
        ...checkpoint,
        complete: true,
        until: undefined,
        limit: 500,
        boundaryCount: undefined,
        syncedThrough: startedAt,
        error: undefined,
      });
      return;
    }
    const oldest = Math.min(...events.map((event) => event.created_at));
    // Inclusive boundary: repeat the oldest second, grow the page until it is
    // exhausted. Never decrement a full equal-timestamp boundary and skip value.
    if (checkpoint.until === oldest) {
      if (
        checkpoint.boundaryCount !== undefined &&
        events.length <= checkpoint.boundaryCount
      )
        throw new Error("Relay capped an unresolved timestamp boundary");
      if (events.length >= checkpoint.limit) {
        if (checkpoint.limit >= 10000)
          throw new Error("Relay history has an unresolved timestamp boundary");
        checkpoint = {
          ...checkpoint,
          limit: Math.min(10000, checkpoint.limit * 2),
          boundaryCount: events.length,
        };
      } else
        checkpoint = {
          ...checkpoint,
          until: oldest - 1,
          limit: 500,
          boundaryCount: undefined,
        };
    } else
      checkpoint = {
        ...checkpoint,
        until: oldest,
        limit: 500,
        boundaryCount: undefined,
      };
    await cashuDb.paymentCheckpoints.put({ ...checkpoint, error: undefined });
  }
}

export async function startPaymentReceiver() {
  if (!initialized) return;
  const pr = usePRStore();
  const wallet = useWalletStore();
  if (!pr.enablePaymentRequest || !wallet.mnemonic) {
    stopPaymentReceiver();
    return;
  }
  const identity = getPublicKey(wallet.seed.slice(0, 32));
  const relays = normalizeRelayUrls(useNostrStore().relays);
  const key = JSON.stringify([identity, relays]);
  if (runningKey === key) return;
  stopPaymentReceiver();
  runningKey = key;
  const version = generation;
  const active = () =>
    generation === version &&
    pr.enablePaymentRequest &&
    getPublicKey(wallet.seed.slice(0, 32)) === identity;
  await pr.initOwnedRequests();
  const jobs = usePaymentJobsStore();
  await jobs.init();
  if (!active()) return;
  const retry = async () => {
    if (!active()) return;
    const unfinished = await cashuDb.paymentEnvelopes
      .where("identity")
      .equals(identity)
      .filter((e) => e.state === "stored")
      .toArray();
    for (const envelope of unfinished)
      if (active() && envelope.event) await jobs.ingestEnvelope(envelope.event);
    if (active()) await jobs.retryPending();
  };
  retryTimer = setInterval(() => {
    retry().catch(() => {
      /* Retain records/checkpoints on storage errors. */
    });
  }, 15000);
  retry().catch(() => {});
  const connect = async (url: string) => {
    if (!active()) return;
    const relay = new PaymentRelay(url, wallet.seed.slice(0, 32));
    connections.set(url, relay);
    let scheduled = false;
    const reconnect = () => {
      if (!active() || scheduled) return;
      scheduled = true;
      relay.close();
      connections.delete(url);
      const timer = setTimeout(() => {
        reconnectTimers.delete(timer);
        connect(url).catch(() => {});
      }, 5000);
      reconnectTimers.add(timer);
    };
    relay.onDisconnect = reconnect;
    const id = `${identity}:${url}`;
    const checkpoint: RelayCheckpoint = (await cashuDb.paymentCheckpoints.get(
      id
    )) ?? { id, identity, relay: url, limit: 500, complete: false };
    try {
      await relay.connect();
      if (!active()) {
        relay.close();
        return;
      }
      // Live listener is established before historical queries. It never advances
      // historical coverage, even when newer payments arrive during recovery.
      const live = relay.subscribe(
        {
          kinds: [1059],
          "#p": [identity],
          since: Math.floor(Date.now() / 1000) - RECOVERY_OVERLAP_SECONDS,
        },
        async (event) => {
          if (!active()) throw new Error("Wallet identity changed");
          await jobs.ingestEnvelope(event);
          retry().catch(() => {});
        },
        true
      );
      await live.eose;
      await backfillPayments(
        relay,
        checkpoint,
        async (event) => {
          if (!active()) throw new Error("Wallet identity changed");
          await jobs.ingestEnvelope(event);
        },
        active
      );
      await retry();
    } catch {
      const saved = (await cashuDb.paymentCheckpoints.get(id)) ?? checkpoint;
      await cashuDb.paymentCheckpoints.put({
        ...saved,
        error: "Synchronization interrupted; saved progress will be retried",
      });
      reconnect();
    }
  };
  for (const relay of relays) connect(relay).catch(() => {});
}

export async function initializePaymentReceiver() {
  initialized = true;
  await startPaymentReceiver();
}

export async function publishInboxRelayList() {
  if (!usePRStore().advertiseInbox)
    throw new Error("Enable public inbox discovery before publishing");
  const wallet = useWalletStore();
  if (!wallet.mnemonic) throw new Error("Initialize the wallet first");
  const relays = normalizeRelayUrls(useNostrStore().relays);
  const event = finalizeEvent(
    {
      kind: 10050,
      content: "",
      created_at: Math.floor(Date.now() / 1000),
      tags: relays.map((relay) => ["relay", relay]),
    },
    wallet.seed.slice(0, 32)
  );
  return publishToRelays(event, relays);
}
