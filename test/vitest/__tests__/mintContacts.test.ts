import { describe, expect, it } from "vitest";
import { displayContacts, shortenMiddle } from "src/js/mintContacts";

describe("displayContacts", () => {
  it("is empty when there is no contact list", () => {
    expect(displayContacts(undefined)).toEqual([]);
    expect(displayContacts(null)).toEqual([]);
    expect(displayContacts([])).toEqual([]);
    expect(displayContacts("npub1abc")).toEqual([]);
  });

  it("drops entries with nothing to copy", () => {
    expect(displayContacts([{ method: "nostr", info: "" }])).toEqual([]);
    expect(displayContacts([{ method: "nostr", info: "   " }])).toEqual([]);
    expect(displayContacts([{ method: "email" }])).toEqual([]);
    expect(displayContacts([{ method: "", info: "a@b.c" }])).toEqual([]);
    expect(displayContacts([{ method: "nostr", info: 42 }])).toEqual([]);
    expect(displayContacts([null, "x", 3])).toEqual([]);
  });

  it("keeps the valid entries of a mixed list, trimmed, in order", () => {
    expect(
      displayContacts([
        { method: "email", info: " ops@mint.example " },
        { method: "nostr", info: "" },
        { method: "twitter", info: "@mint" },
      ])
    ).toEqual([
      { method: "email", info: "ops@mint.example" },
      { method: "twitter", info: "@mint" },
    ]);
  });

  it("reads the legacy [method, info] tuples", () => {
    expect(
      displayContacts([
        ["nostr", "npub1abc"],
        ["email", ""],
      ])
    ).toEqual([{ method: "nostr", info: "npub1abc" }]);
  });

  it("does not change the mint's info", () => {
    const contact = [
      { method: "email", info: " a@b.c " },
      { method: "nostr", info: "" },
    ];
    const before = JSON.parse(JSON.stringify(contact));
    displayContacts(contact);
    expect(contact).toEqual(before);
  });
});

describe("shortenMiddle", () => {
  it("keeps the start and end of a long key", () => {
    const npub = "npub1" + "q".repeat(50) + "xyz789";
    expect(shortenMiddle(npub)).toBe("npub1qqqqq…xyz789");
  });

  it("leaves a short value whole", () => {
    expect(shortenMiddle("npub1short")).toBe("npub1short");
  });
});
