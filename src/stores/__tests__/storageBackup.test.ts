import { describe, expect, it } from "vitest";
import { parseBackupTable, stringifyBackupTable } from "src/stores/storage";

describe("wallet backup table serialization", () => {
  it("serializes bigint-bearing legacy rows without throwing", () => {
    const serialized = stringifyBackupTable([
      { quote: "legacy-quote", amount: { value: 21n } },
    ]);

    expect(serialized).toBe('[{"quote":"legacy-quote","amount":{"value":21}}]');
    expect(parseBackupTable(serialized)).toEqual([
      { quote: "legacy-quote", amount: { value: 21 } },
    ]);
  });

  it("rejects a malformed backup table", () => {
    expect(() => parseBackupTable('{"not":"a table"}')).toThrow(
      "Invalid wallet backup table"
    );
  });
});

import { vi } from "vitest";
import { useStorageStore, validateWalletBackup } from "src/stores/storage";
import { notifyError } from "src/js/notify";

vi.mock("src/js/notify", () => ({
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
}));

const validBackup = () => ({
  "cashu.mints": JSON.stringify([
    { url: "https://mint.example", keys: [], keysets: [] },
  ]),
  "cashu.dexie.db.proofs":
    '[{"id":"keyset","secret":"proof-secret","C":"signature","amount":2}]',
});

describe("backup validation before persistence", () => {
  it("accepts current and legacy proof storage, including empty wallets", () => {
    expect(() => validateWalletBackup(validBackup())).not.toThrow();
    const legacy: Record<string, string> = validBackup();
    legacy["cashu.proofs"] = legacy["cashu.dexie.db.proofs"];
    delete legacy["cashu.dexie.db.proofs"];
    expect(() => validateWalletBackup(legacy)).not.toThrow();
    expect(() =>
      validateWalletBackup({
        ...validBackup(),
        "cashu.dexie.db.proofs": "[]",
        "cashu.mints": "[]",
      })
    ).not.toThrow();
  });

  for (const backup of [
    null,
    [],
    {},
    { "cashu.activeMintUrl": "not a mint url" },
    { ...validBackup(), "cashu.language": {} },
    { ...validBackup(), "cashu.dexie.db.proofs": '[{"amount":2}]' },
    {
      ...validBackup(),
      "cashu.dexie.db.proofs": '[{"id":"a","secret":"b","C":"c","amount":-1}]',
    },
    {
      ...validBackup(),
      "cashu.mints":
        '[{"url":"https://not%20a%20mint","keys":[],"keysets":[]}]',
    },
    { ...validBackup(), "cashu.dexie.db.paymentHistory": "{}" },
    {
      ...validBackup(),
      "cashu.dexie.db.mintQuotes": '[{"quote":"q","amount":"invalid"}]',
    },
    { ...validBackup(), "cashu.historyTokens": "[null]" },
  ]) {
    it(`rejects malformed backup ${JSON.stringify(backup)}`, async () => {
      expect(() => validateWalletBackup(backup)).toThrow();
      const store = useStorageStore();
      const write = vi.spyOn(localStorage, "setItem");
      write.mockClear();
      await store.restoreFromBackup(backup);
      expect(write).not.toHaveBeenCalled();
      expect(notifyError).toHaveBeenCalledWith("Invalid wallet backup format");
      write.mockRestore();
    });
  }
});
