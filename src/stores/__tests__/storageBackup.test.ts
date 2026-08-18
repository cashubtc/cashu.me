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
