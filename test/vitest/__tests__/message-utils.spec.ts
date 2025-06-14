import { describe, it, expect } from "vitest";
import { sanitizeMessage } from "../../../src/js/message-utils";

describe("sanitizeMessage", () => {
  it("removes non printable characters", () => {
    const result = sanitizeMessage("hi\u0007there");
    expect(result).toBe("hithere");
  });

  it("truncates to max length", () => {
    const result = sanitizeMessage("abcdef", 3);
    expect(result).toBe("abc");
  });
});
