import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { DS_GROUPS, DS_ITEMS } from "src/design-system/registry";

// The design system board (src/pages/DesignSystemPage.vue) and the registry it reads
// (src/design-system/registry.ts) must describe the same components, in the same order.

const SRC = join(__dirname, "../../../src");
const board = readFileSync(join(SRC, "pages/DesignSystemPage.vue"), "utf8");
const boardIds = [...board.matchAll(/<DsEntry\s+id="([^"]+)"/g)].map(
  (m) => m[1]
);

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

  it("registers every component tag its samples use", () => {
    const template = board.slice(0, board.indexOf("<script"));
    const used = new Set(
      [...template.matchAll(/<([A-Z][A-Za-z0-9]+)/g)].map((m) => m[1])
    );
    const registry = board.slice(
      board.indexOf("components: {"),
      board.indexOf("},", board.indexOf("components: {"))
    );
    expect(
      [...used].filter((t) => !new RegExp(`\\b${t}\\b`).test(registry))
    ).toEqual([]);
  });

  // The sample is the component itself, never a copy of its markup.
  it("renders each component entry with that component", () => {
    const blocks = Object.fromEntries(
      [...board.matchAll(/<DsEntry\s+id="([^"]+)"[\s\S]*?<\/DsEntry>/g)].map(
        (m) => [m[1], m[0]]
      )
    );
    expect(
      DS_ITEMS.filter((i) => i.usage?.tag)
        .filter((i) => !blocks[i.id]?.includes(`<${i.usage?.tag}`))
        .map((i) => i.id)
    ).toEqual([]);
  });

  // Samples render like the app only in the app's own context. The board's shell is not a
  // settings page: a settings ancestor's rules reached every sample and broke ones that never
  // sit in settings (History's Check status split under its icon). Settings components get the
  // settings column from their registry context, through DsEntry, and nothing else does.
  it("gives a sample the settings context only through its registry entry", () => {
    expect(board).not.toMatch(/settings-view|settings-sub-page/);
    const entry = readFileSync(join(SRC, "components/ds/DsEntry.vue"), "utf8");
    expect(entry).toMatch(
      /class="ds-entry__sample"\s+:class="\{ 'settings-view': item\.context === 'settings' \}"/
    );
  });

  it("declares the settings context for exactly the settings components", () => {
    const settingsTag = (i: (typeof DS_ITEMS)[number]) =>
      /^Settings/.test(i.usage?.tag ?? "");
    expect(
      DS_ITEMS.filter((i) => settingsTag(i) && i.context !== "settings").map(
        (i) => i.id
      )
    ).toEqual([]);
    expect(
      DS_ITEMS.filter(
        (i) => i.context === "settings" && ["feature", "token"].includes(i.tier)
      ).map((i) => i.id)
    ).toEqual([]);
  });

  // Feature samples run on in-memory fixtures, never the wallet's own stores.
  it("renders History on fixture payments, not the live wallet", () => {
    const block = board.match(
      /<DsEntry\s+id="history">[\s\S]*?<\/DsEntry>/
    )![0];
    const tables = [...block.matchAll(/<HistoryTable\b[^>]*>/g)].map(
      (m) => m[0]
    );
    expect(tables.length).toBeGreaterThan(0);
    expect(tables.filter((t) => !t.includes(':transactions="'))).toEqual([]);
  });

  it("has unique ids", () => {
    const ids = DS_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
