import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { DS_GROUPS, DS_ITEMS } from "src/design-system/registry";

// The design system board (src/pages/DesignSystemPage.vue) and the registry it reads
// (src/design-system/registry.ts) must describe the same components, in the same order.

const SRC = join(__dirname, "../../../src");
const board = readFileSync(join(SRC, "pages/DesignSystemPage.vue"), "utf8");
const boardIds = [...board.matchAll(/<DsEntry\s+id="([^"]+)"/g)].map((m) => m[1]);

describe("design system board", () => {
  it("renders every registered entry once, in registry order", () => {
    const ordered = DS_GROUPS.flatMap((g) =>
      DS_ITEMS.filter((i) => i.group === g.id).map((i) => i.id)
    );
    expect(boardIds).toEqual(ordered);
  });

  it("registers every shared component in src/components/ui", () => {
    const sources = DS_ITEMS.map((i) => i.source.split(" ")[0]);
    const ui = readdirSync(join(SRC, "components/ui")).map(
      (f) => `src/components/ui/${f}`
    );
    expect(ui.filter((f) => !sources.includes(f))).toEqual([]);
  });

  it("points every component entry at a file that exists", () => {
    const missing = DS_ITEMS.map((i) => i.source.split(" ")[0])
      .filter((p) => p.endsWith(".vue"))
      .filter((p) => {
        try {
          readFileSync(join(SRC, "..", p));
          return false;
        } catch {
          return true;
        }
      });
    expect(missing).toEqual([]);
  });

  it("has unique ids", () => {
    const ids = DS_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
