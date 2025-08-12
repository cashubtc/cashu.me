import { describe, it, expect } from "vitest";
import { parseMessageSnippet } from "../../../src/utils/message-snippet";

describe("parseMessageSnippet", () => {
  it("maps subscription payment payload", () => {
    const json = JSON.stringify({ type: "cashu_subscription_payment" });
    const result = parseMessageSnippet(json);
    expect(result.text).toBe("Subscription payment");
    expect(result.icon).toBe("mdi-cash");
  });

  it("returns truncated text for invalid json", () => {
    const result = parseMessageSnippet("hello world");
    expect(result.text).toBe("hello world");
  });

  it("returns truncated text for unknown payload", () => {
    const json = JSON.stringify({ type: "unknown", foo: 1 });
    const result = parseMessageSnippet(json);
    expect(result.text).toBe(json.slice(0, 30));
  });
});
