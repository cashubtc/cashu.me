import { beforeEach, describe, expect, it } from "vitest";
import { useTokensStore } from "../../../src/stores/tokens";
import { cashuDb } from "../../../src/stores/dexie";

beforeEach(async () => {
  localStorage.clear();
  await cashuDb.close(); // close() is safe under fake-indexeddb
  await cashuDb.open();
});

describe("Tokens store", () => {
  it("edits token label", () => {
    const store = useTokensStore();
    store.addPaidToken({ amount: 1, token: "t1", mint: "m1", unit: "sat" });
    store.editHistoryToken("t1", { newLabel: "new name" });
    expect(store.historyTokens[0].label).toBe("new name");
  });

  it("edits token color", () => {
    const store = useTokensStore();
    store.addPaidToken({ amount: 1, token: "t2", mint: "m1", unit: "sat" });
    store.editHistoryToken("t2", { newColor: "#ff0000" });
    expect(store.historyTokens[0].color).toBe("#ff0000");
  });

  it("edits token description", () => {
    const store = useTokensStore();
    store.addPaidToken({ amount: 1, token: "t3", mint: "m1", unit: "sat" });
    store.editHistoryToken("t3", { newDescription: "foo" });
    expect(store.historyTokens[0].description).toBe("foo");
  });

  it("finds history token by secret", () => {
    const tokenObj = {
      token: [
        { proofs: [{ id: "a", amount: 1, C: "c", secret: "sec" }], mint: "m1" },
      ],
    };
    const encoded =
      "cashuA" + Buffer.from(JSON.stringify(tokenObj)).toString("base64");
    const store = useTokensStore();
    store.addPaidToken({ amount: 1, token: encoded, mint: "m1", unit: "sat" });
    const found = store.findHistoryTokenBySecret("sec");
    expect(found?.token).toBe(encoded);
  });

  it("edits history token by secret", () => {
    const tokenObj = {
      token: [
        {
          proofs: [{ id: "a", amount: 1, C: "c", secret: "sec2" }],
          mint: "m1",
        },
      ],
    };
    const encoded =
      "cashuA" + Buffer.from(JSON.stringify(tokenObj)).toString("base64");
    const store = useTokensStore();
    store.addPaidToken({ amount: 1, token: encoded, mint: "m1", unit: "sat" });
    store.editHistoryTokenBySecret("sec2", { newLabel: "abc" });
    expect(store.historyTokens[0].label).toBe("abc");
  });
});
