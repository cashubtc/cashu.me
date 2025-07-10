import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { nip19 } from "nostr-tools";
import fs from "fs";
import vm from "vm";

const htmlFile = fs.readFileSync("public/find-creators.html", "utf8");
const scriptMatch = htmlFile.match(/<script type="module">([\s\S]*?)<\/script>/);
const script = (scriptMatch ? scriptMatch[1] : "")
  .replace(/import\s+\{[^}]+\}\s+from\s+['"]\/src\/config\/relays['"];?/, "const DEFAULT_RELAYS = [];")
  .replace(/document.addEventListener\([^]*?\);/, "");

const dom = new JSDOM(htmlFile.replace(/<script type="module">([\s\S]*?)<\/script>/, ""), { runScripts: "dangerously" });

dom.window.NostrTools = require("nostr-tools");

vm.runInContext(script, dom.getInternalVMContext());

describe("find-creators message button", () => {
  it("navigates to messenger with peer query", () => {
    const profile = { name: "Alice", pubkey: "a".repeat(64), about: "bio" };
    const list = dom.window.document.getElementById("resultsList")!;
    dom.window.renderProfiles([profile], list, false);
    dom.window.parent = { location: { href: "" } } as any;
    const btn = dom.window.document.querySelector(".btn-message") as HTMLElement;
    btn.dispatchEvent(new dom.window.Event("click", { bubbles: true }));
    const expected = `/nostr-messenger?peer=${encodeURIComponent(nip19.npubEncode(profile.pubkey))}`;
    expect(dom.window.parent.location.href).toBe(expected);
  });
});
