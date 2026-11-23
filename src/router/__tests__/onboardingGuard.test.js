import { describe, expect, it } from "vitest";
import { onboardingRedirect } from "src/router/onboardingGuard";

const to = (path, extra = {}) => ({ path, query: {}, hash: "", ...extra });
const fresh = () => ({ showWelcome: true, termsAccepted: false });
const onboarded = () => ({ showWelcome: false, termsAccepted: true });

describe("onboardingRedirect", () => {
  it.each(["/", "/settings", "/settings/backup", "/settings/privacy"])(
    "sends %s to the welcome page before a wallet exists",
    (path) => {
      expect(onboardingRedirect(to(path), fresh())).toMatchObject({
        path: "/welcome",
      });
    }
  );

  it.each(["/", "/settings", "/settings/backup"])(
    "lets %s through once onboarding is finished",
    (path) => {
      expect(onboardingRedirect(to(path), onboarded())).toBeUndefined();
    }
  );

  it.each(["/welcome", "/terms", "/restore", "/already-running"])(
    "never redirects %s",
    (path) => {
      expect(onboardingRedirect(to(path), fresh())).toBeUndefined();
    }
  );

  it("shows the welcome page again while the terms are not accepted", () => {
    const welcome = { showWelcome: false, termsAccepted: false };
    expect(onboardingRedirect(to("/settings"), welcome)).toMatchObject({
      path: "/welcome",
    });
    expect(welcome.showWelcome).toBe(true);
  });

  it("keeps the query and hash of a shared link", () => {
    const link = to("/", { query: { mint: "m" }, hash: "#token=abc" });
    expect(onboardingRedirect(link, fresh())).toEqual({
      path: "/welcome",
      query: { mint: "m" },
      hash: "#token=abc",
    });
  });
});
