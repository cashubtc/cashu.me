import { beforeEach, describe, expect, it } from "vitest";
import { useLockedTokensStore } from "../../../src/stores/lockedTokens";

beforeEach(() => {
  localStorage.clear();
});

describe("LockedTokens store", () => {
  it("adds and retrieves tokens", () => {
    const store = useLockedTokensStore();
    const t = store.addLockedToken({
      amount: 1,
      token: "tok",
      pubkey: "pk",
      bucketId: "b1",
    });
    expect(store.lockedTokens.length).toBe(1);
    expect(store.tokensByBucket("b1")[0].id).toBe(t.id);
  });

  it("deletes token", () => {
    const store = useLockedTokensStore();
    const t = store.addLockedToken({
      amount: 1,
      token: "tok",
      pubkey: "pk",
      bucketId: "b1",
    });
    store.deleteLockedToken(t.id);
    expect(store.lockedTokens.length).toBe(0);
  });

  it("returns valid tokens for tier", () => {
    const store = useLockedTokensStore();
    const past = Math.floor(Date.now() / 1000) - 10;
    const future = Math.floor(Date.now() / 1000) + 100;
    const t1 = store.addLockedToken({
      amount: 1,
      token: "a",
      pubkey: "pk",
      bucketId: "b",
      locktime: past,
    });
    store.addLockedToken({
      amount: 1,
      token: "b",
      pubkey: "pk",
      bucketId: "b",
      locktime: future,
    });
    store.addLockedToken({
      amount: 1,
      token: "c",
      pubkey: "other",
      bucketId: "b",
    });
    const tokens = store.validTokensForTier("pk", "b");
    expect(tokens.length).toBe(1);
    expect(tokens[0].id).toBe(t1.id);
  });
});
