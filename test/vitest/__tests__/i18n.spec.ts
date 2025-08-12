import { describe, it, expect } from "vitest";
import { createI18n } from "vue-i18n";
import { loadMessages } from "../../../src/i18n";

describe("i18n SendBucketDmDialog", () => {
  it("loads de-DE translation", async () => {
    const messages = { "de-DE": await loadMessages("de-DE") };
    const i18n = createI18n({ legacy: false, locale: "de-DE", messages });
    expect(i18n.global.t("SendBucketDmDialog.options.proofs")).toBe(
      "Select Tokens"
    );
  });
});
