import { beforeEach, describe, expect, it } from "vitest";
import { useReceiveTokensStore } from "../../../src/stores/receiveTokensStore";
import { cashuDb } from "../../../src/stores/dexie";

const VALID_TOKEN =
  "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpbeyJpZCI6IkkyeU4raVJZZmt6VCIsImFtb3VudCI6MSwiQyI6IjAyZTRkYmJmMGZmNDI4YTU4ZDZjNjZjMTljNjI0YWRlY2MxNzg0YzdlNTU5ODZhNGVmNDQ4NDM5MzZhM2M4ZjM1OSIsInNlY3JldCI6ImZHWVpzSlVjME1mU1orVlhGandEZXNsNkJScW5wNmRSblZpUGQ2L00yQ0k9In1dLCJtaW50IjoiaHR0cHM6Ly84MzMzLnNwYWNlOjMzMzgifV19";

beforeEach(async () => {
  localStorage.clear();
  await cashuDb.close(); // close() is safe under fake-indexeddb
  await cashuDb.open();
});

describe("receiveTokensStore.decodeToken", () => {
  it("decodes valid token", () => {
    const store = useReceiveTokensStore();
    const decoded = store.decodeToken(VALID_TOKEN);
    expect(decoded?.mint).toBe("https://8333.space:3338");
  });

  it("rejects invalid prefix", () => {
    const store = useReceiveTokensStore();
    expect(store.decodeToken("bad")).toBeUndefined();
  });

  it("rejects malformed token", () => {
    const store = useReceiveTokensStore();
    expect(store.decodeToken("cashuAinvalid")).toBeUndefined();
  });

  it("decodes token with surrounding whitespace", () => {
    const store = useReceiveTokensStore();
    const decoded = store.decodeToken(`  ${VALID_TOKEN}\n`);
    expect(decoded?.mint).toBe("https://8333.space:3338");
  });
});
