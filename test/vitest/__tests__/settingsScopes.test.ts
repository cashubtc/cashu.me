import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

// src/css/settings.scss styles the settings column (.settings-view). Its defensive wrapping
// rules name the parts they are for. A rule on every descendant, or on button content, lets
// buttons and pagination cells shrink below their content, so an icon and its label split
// across two lines wherever the settings column is an ancestor.

const css = readFileSync(
  join(__dirname, "../../../src/css/settings.scss"),
  "utf8"
);

/** The declarations of every rule whose selector list includes `selector`. */
function declarationsFor(selector: string): string {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((m) =>
      m[1]
        .split(",")
        .map((s) => s.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "").trim())
        .includes(selector)
    )
    .map((m) => m[2])
    .join("\n");
}

describe("settings.scss scoping", () => {
  it("doesn't let every descendant shrink below its content", () => {
    expect(declarationsFor(".settings-view *")).not.toMatch(/min-width/);
  });

  it("keeps button content at its min-content width", () => {
    const button = declarationsFor(".settings-view .q-btn__content");
    expect(button).not.toMatch(/white-space:\s*normal/);
    expect(button).not.toMatch(/overflow-wrap:\s*anywhere/);
    expect(button).not.toMatch(/min-width:\s*0/);
  });
});
