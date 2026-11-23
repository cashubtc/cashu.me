import { afterEach, describe, expect, it, vi } from "vitest";
import { useWelcomeStore } from "src/stores/welcome";

describe("welcome store navigation", () => {
  afterEach(() => vi.unstubAllGlobals());

  const stubLocation = (search = "", hash = "") => {
    const location = { search, hash, href: "/welcome", replace: vi.fn() };
    vi.stubGlobal("location", location);
    return location;
  };

  it("replaces the welcome page with home when onboarding ends", () => {
    const location = stubLocation("?mint=m", "#token=abc");
    const welcome = useWelcomeStore();

    welcome.closeWelcome();

    expect(welcome.showWelcome).toBe(false);
    expect(location.replace).toHaveBeenCalledWith("/?mint=m#token=abc");
    // assigning href would push a new entry and keep /welcome behind home
    expect(location.href).toBe("/welcome");
  });

  it("replaces the welcome page when it is opened after onboarding", () => {
    const location = stubLocation();
    const welcome = useWelcomeStore();
    welcome.showWelcome = false;

    welcome.initializeWelcome();

    expect(location.replace).toHaveBeenCalledWith("/");
  });

  it("stays on the welcome page while onboarding is due", () => {
    const location = stubLocation();
    const welcome = useWelcomeStore();
    welcome.showWelcome = true;

    welcome.initializeWelcome();

    expect(location.replace).not.toHaveBeenCalled();
  });
});
