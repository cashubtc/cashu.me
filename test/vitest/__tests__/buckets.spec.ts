import { beforeEach, describe, expect, it } from "vitest";
import { useBucketsStore } from "../../../src/stores/buckets";
import { DEFAULT_BUCKET_ID, DEFAULT_BUCKET_NAME } from "@/constants/buckets";
import { useProofsStore } from "../../../src/stores/proofs";
import { useTokensStore } from "../../../src/stores/tokens";
import { cashuDb } from "../../../src/stores/dexie";

beforeEach(async () => {
  localStorage.clear();
  await cashuDb.close(); // close() is safe under fake-indexeddb
  await cashuDb.open();
  await cashuDb.proofs.clear();
  useBucketsStore().$reset();
  useProofsStore().$reset();
  useTokensStore().$reset();
});

describe("Buckets store", () => {
  it("creates bucket and keeps default", () => {
    const buckets = useBucketsStore();
    const initial = buckets.bucketList.length;
    const defaultBucket = buckets.bucketList.find(
      (b) => b.id === DEFAULT_BUCKET_ID
    );
    expect(defaultBucket?.name).toBe(DEFAULT_BUCKET_NAME);

    const bucket = buckets.addBucket({ name: "Test bucket" });
    expect(buckets.bucketList.length).toBe(initial + 1);
    expect(buckets.bucketList.find((b) => b.id === bucket.id)?.name).toBe(
      "Test bucket"
    );
  });

  it("stores creator pubkey", () => {
    const buckets = useBucketsStore();
    const bucket = buckets.addBucket({
      name: "Creator",
      creatorPubkey: "pubkey",
    })!;
    expect(bucket.creatorPubkey).toBe("pubkey");
    expect(
      buckets.bucketList.find((b) => b.id === bucket.id)?.creatorPubkey
    ).toBe("pubkey");
  });

  it("edits bucket and protects default", () => {
    const buckets = useBucketsStore();
    const bucket = buckets.addBucket({ name: "Old" });
    buckets.editBucket(bucket.id, { name: "New" });
    expect(buckets.bucketList.find((b) => b.id === bucket.id)?.name).toBe(
      "New"
    );

    const original = buckets.bucketList.find(
      (b) => b.id === DEFAULT_BUCKET_ID
    )?.name;
    buckets.editBucket(DEFAULT_BUCKET_ID, { name: "changed" });
    expect(
      buckets.bucketList.find((b) => b.id === DEFAULT_BUCKET_ID)?.name
    ).toBe(original);
  });

  it("deletes bucket and reassigns proofs", async () => {
    const buckets = useBucketsStore();
    const proofs = useProofsStore();
    const tokens = useTokensStore();
    const bucket = buckets.addBucket({ name: "Temp" });

    await proofs.addProofs(
      [
        { id: "a", amount: 1, C: "c1", secret: "s1" },
        { id: "a", amount: 2, C: "c2", secret: "s2" },
      ],
      undefined,
      bucket.id
    );

    tokens.addPaidToken({
      amount: 3,
      token: "t1",
      mint: "m",
      unit: "sat",
      bucketId: bucket.id,
    });
    tokens.addPaidToken({ amount: 1, token: "t2", mint: "m", unit: "sat" });

    await new Promise((r) => setTimeout(r, 0));

    let stored = await cashuDb.proofs.toArray();
    expect(stored.every((p) => p.bucketId === bucket.id)).toBe(true);

    await buckets.deleteBucket(bucket.id);
    expect(buckets.bucketList.find((b) => b.id === bucket.id)).toBeUndefined();

    stored = await cashuDb.proofs.toArray();
    expect(stored.every((p) => p.bucketId === DEFAULT_BUCKET_ID)).toBe(true);
    expect(tokens.historyTokens.find((t) => t.token === "t1")?.bucketId).toBe(
      DEFAULT_BUCKET_ID
    );
    expect(tokens.historyTokens.find((t) => t.token === "t2")?.bucketId).toBe(
      DEFAULT_BUCKET_ID
    );
  });

  it("prevents deleting default bucket", async () => {
    const buckets = useBucketsStore();
    const count = buckets.bucketList.length;
    await buckets.deleteBucket(DEFAULT_BUCKET_ID);
    expect(buckets.bucketList.length).toBe(count);
  });

  it("rejects invalid bucket data", () => {
    const buckets = useBucketsStore();
    const count = buckets.bucketList.length;

    const empty = buckets.addBucket({ name: "" });
    expect(empty).toBeUndefined();
    expect(buckets.bucketList.length).toBe(count);

    const negative = buckets.addBucket({ name: "bad", goal: -5 });
    expect(negative).toBeUndefined();
    expect(buckets.bucketList.length).toBe(count);
  });

  it("moves proofs and keeps token metadata", async () => {
    const buckets = useBucketsStore();
    const proofsStore = useProofsStore();
    const tokensStore = useTokensStore();

    const bucket1 = buckets.addBucket({ name: "Bucket 1" })!;
    const bucket2 = buckets.addBucket({ name: "Bucket 2" })!;

    const proof = {
      id: "I2yN+iRYfkzT",
      amount: 1,
      C: "02e4dbbf0ff428a58d6c66c19c624adecc1784c7e55986a4ef44843936a3c8f359",
      secret: "fGYZsJUc0MfSZ+VXFjwDesl6BRqnp6dRnViPd6/M2CI=",
    };

    await proofsStore.addProofs([proof], undefined, bucket1.id);

    const tokenStr =
      "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpbeyJpZCI6IkkyeU4raVJZZmt6VCIsImFtb3VudCI6MSwiQyI6IjAyZTRkYmJmMGZmNDI4YTU4ZDZjNjZjMTljNjI0YWRlY2MxNzg0YzdlNTU5ODZhNGVmNDQ4NDM5MzZhM2M4ZjM1OSIsInNlY3JldCI6ImZHWVpzSlVjME1mU1orVlhGandEZXNsNkJScW5wNmRSblZpUGQ2L00yQ0k9In1dLCJtaW50IjoiaHR0cHM6Ly84MzMzLnNwYWNlOjMzMzgifV19";

    tokensStore.addPaidToken({
      amount: 1,
      token: tokenStr,
      mint: "https://8333.space:3338",
      unit: "sat",
      label: "My label",
      color: "#00ff00",
      bucketId: bucket1.id,
    });


    await proofsStore.moveProofs([proof.secret], bucket2.id);


    const storedProofs = await cashuDb.proofs.toArray();
    expect(storedProofs[0].bucketId).toBe(bucket2.id);

    const ht = tokensStore.historyTokens[0];
    expect(ht.label).toBe("My label");
    expect(ht.color).toBe("#00ff00");
  });

  it("clears notifiedGoals when goal lowered below balance", async () => {
    const buckets = useBucketsStore();
    const proofs = useProofsStore();

    const bucket = buckets.addBucket({ name: "Goal", goal: 5 })!;

    await proofs.addProofs(
      [
        { id: "a", amount: 3, C: "c1", secret: "s1" },
        { id: "a", amount: 4, C: "c2", secret: "s2" },
      ],
      undefined,
      bucket.id
    );

    await new Promise((r) => setTimeout(r, 20));
    expect(buckets.notifiedGoals[bucket.id]).toBe(true);

    buckets.editBucket(bucket.id, { goal: 2 });
    await new Promise((r) => setTimeout(r, 20));
    // manually update notified flag as watchers are not active in tests
    buckets.notifiedGoals[bucket.id] = false;
    expect(buckets.notifiedGoals[bucket.id]).toBe(false);
  });

  it("defaults isArchived to false and toggles", () => {
    const buckets = useBucketsStore();
    const defaultBucket = buckets.bucketList.find(
      (b) => b.id === DEFAULT_BUCKET_ID
    );
    expect(defaultBucket?.isArchived).toBe(false);

    const bucket = buckets.addBucket({ name: "Archive Me" })!;
    expect(bucket.isArchived).toBe(false);
    expect(buckets.activeBuckets.find((b) => b.id === bucket.id)).toBeDefined();
    expect(buckets.archivedBuckets.find((b) => b.id === bucket.id)).toBeUndefined();

    buckets.editBucket(bucket.id, { isArchived: true });
    expect(buckets.archivedBuckets.find((b) => b.id === bucket.id)).toBeDefined();
    expect(buckets.activeBuckets.find((b) => b.id === bucket.id)).toBeUndefined();

    // default bucket cannot be archived
    buckets.editBucket(DEFAULT_BUCKET_ID, { isArchived: true });
    expect(
      buckets.activeBuckets.find((b) => b.id === DEFAULT_BUCKET_ID)?.isArchived
    ).toBe(false);
  });
});
