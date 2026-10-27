import { describe, expect, it } from "vitest";
import { shouldReduceEffects } from "src/js/device-effects";

const PIXEL_8 =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";
const ANDROID_7 =
  "Mozilla/5.0 (Linux; Android 7.0; SM-G930F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Mobile Safari/537.36";
const IPHONE_IOS_17 =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const IPHONE_IOS_14 =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1";
const DESKTOP =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

describe("shouldReduceEffects", () => {
  it("keeps the blur on current phones and desktops", () => {
    expect(
      shouldReduceEffects({
        userAgent: PIXEL_8,
        deviceMemory: 8,
        hardwareConcurrency: 8,
      })
    ).toBe(false);
    expect(
      shouldReduceEffects({ userAgent: IPHONE_IOS_17, hardwareConcurrency: 4 })
    ).toBe(false);
    expect(
      shouldReduceEffects({
        userAgent: DESKTOP,
        deviceMemory: 8,
        hardwareConcurrency: 10,
      })
    ).toBe(false);
  });

  it("drops it on low-memory or dual-core devices", () => {
    expect(shouldReduceEffects({ userAgent: PIXEL_8, deviceMemory: 2 })).toBe(
      true
    );
    expect(
      shouldReduceEffects({ userAgent: PIXEL_8, hardwareConcurrency: 2 })
    ).toBe(true);
  });

  it("drops it on old Android and old iOS", () => {
    expect(shouldReduceEffects({ userAgent: ANDROID_7, deviceMemory: 4 })).toBe(
      true
    );
    expect(shouldReduceEffects({ userAgent: IPHONE_IOS_14 })).toBe(true);
  });
});
