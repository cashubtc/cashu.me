import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cashuDb } from "src/stores/dexie";
import { backfillPayments } from "src/js/paymentReceiver";
import type { PaymentRelay } from "src/js/paymentRelay";
import type { RelayCheckpoint } from "src/js/paymentRequestRepository";

vi.mock("src/stores/wallet", () => ({ useWalletStore: () => ({}) }));
vi.mock("src/stores/nostr", () => ({ useNostrStore: () => ({}) }));
vi.mock("src/stores/paymentJobs", () => ({ usePaymentJobsStore: () => ({}) }));
vi.mock("src/stores/payment-request", () => ({ usePRStore: () => ({}) }));

const checkpoint = (): RelayCheckpoint => ({
  id: "identity:relay",
  identity: "test-identity",
  relay: "ws://127.0.0.1:7777/",
  limit: 500,
  complete: false,
});
const events = (count: number, time: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `${time}-${index}`,
    created_at: time,
  }));

describe("resumable historical payment recovery", () => {
  beforeEach(async () => {
    await cashuDb.paymentCheckpoints.clear();
  });
  it("recovers older than two days and does not skip equal-timestamp pages", async () => {
    const records = [...events(750, 1000), ...events(2, 999)];
    const query = vi.fn(async (filter) =>
      records
        .filter(
          (r) => filter.until === undefined || r.created_at <= filter.until
        )
        .slice(0, filter.limit)
    );
    const received = new Set<string>();
    await backfillPayments(
      { query } as unknown as PaymentRelay,
      checkpoint(),
      async (event) => {
        received.add(event.id);
      }
    );
    expect(received.size).toBe(752);
    expect(query.mock.calls[0][0].since).toBeUndefined();
    expect(
      (await cashuDb.paymentCheckpoints.get(checkpoint().id))?.complete
    ).toBe(true);
  });
  it("leaves the current boundary uncommitted when ingestion fails", async () => {
    const original = checkpoint();
    await cashuDb.paymentCheckpoints.put(original);
    const query = vi.fn(async () => events(3, 1000));
    await expect(
      backfillPayments(
        { query } as unknown as PaymentRelay,
        original,
        async () => {
          throw new Error("quota exceeded");
        }
      )
    ).rejects.toThrow("quota exceeded");
    expect(await cashuDb.paymentCheckpoints.get(original.id)).toEqual(original);
  });
  it("reports incomplete history when the relay caps a full timestamp boundary", async () => {
    const records = events(600, 1000);
    const query = vi.fn(async (filter) =>
      records
        .filter(
          (r) => filter.until === undefined || r.created_at <= filter.until
        )
        .slice(0, Math.min(500, filter.limit))
    );
    await expect(
      backfillPayments(
        { query } as unknown as PaymentRelay,
        checkpoint(),
        async () => {}
      )
    ).rejects.toThrow("capped");
    const saved = await cashuDb.paymentCheckpoints.get(checkpoint().id);
    expect(saved?.complete).toBe(false);
    expect(saved?.until).toBe(1000);
  });
  it("resumes from the saved boundary without allowing live timestamps to skip it", async () => {
    const query = vi.fn(async () => []);
    const saved = {
      ...checkpoint(),
      until: 1000,
      limit: 1000,
      boundaryCount: 500,
    };
    await backfillPayments(
      { query } as unknown as PaymentRelay,
      saved,
      async () => {}
    );
    expect(query.mock.calls[0][0]).toMatchObject({ until: 1000, limit: 1000 });
  });
  it("uses an overlapping catch-up window only after a completed full scan", async () => {
    const query = vi.fn(async () => []);
    await backfillPayments(
      { query } as unknown as PaymentRelay,
      { ...checkpoint(), complete: true, syncedThrough: 900000 },
      async () => {}
    );
    expect(query.mock.calls[0][0].since).toBe(900000 - 172800 - 300);
  });
});
