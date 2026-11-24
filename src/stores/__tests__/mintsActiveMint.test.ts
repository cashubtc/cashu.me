import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMintsStore } from "src/stores/mints";

vi.mock("src/js/notify", () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  notifyWarning: vi.fn(),
  notifyApiError: vi.fn(),
  notify: vi.fn(),
}));

const MINT_A = "https://mint-a.example";
const MINT_B = "https://mint-b.example";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("mints store activeMint()", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Keeps every activation waiting on the mint's info and keys until
  // `finish()` is called.
  function setup(urls: string[]) {
    const mints = useMintsStore();
    mints.mints = urls.map((url) => ({ url, keys: [], keysets: [] }));
    mints.activeMintUrl = "";
    const pending: Array<() => void> = [];
    const fetchInfoAndKeys = vi
      .spyOn(mints, "updateMintInfoAndKeys")
      .mockImplementation(
        (mint) =>
          new Promise((resolve) => pending.push(() => resolve(mint as any)))
      );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const finish = async () => {
      while (pending.length) {
        pending.shift()!();
        await flush();
      }
    };
    return { mints, fetchInfoAndKeys, consoleError, finish };
  }

  it("does not start another activation while addMint() activates the mint", async () => {
    const { mints, fetchInfoAndKeys, consoleError, finish } = setup([]);
    const adding = mints.addMint({ url: MINT_A });
    await flush();

    expect(mints.activeMint().mint.url).toBe(MINT_A);
    expect(mints.activeMint().mint.url).toBe(MINT_A);
    expect(consoleError).not.toHaveBeenCalled();

    await finish();
    await adding;
    expect(fetchInfoAndKeys).toHaveBeenCalledTimes(1);
    expect(mints.activeMintUrl).toBe(MINT_A);
  });

  it("does not start another activation while removeMint() activates the next mint", async () => {
    const { mints, fetchInfoAndKeys, consoleError, finish } = setup([
      MINT_A,
      MINT_B,
    ]);
    mints.activeMintUrl = MINT_A;
    const removing = mints.removeMint(MINT_A);
    await flush();

    expect(mints.activeMint().mint.url).toBe(MINT_B);
    expect(consoleError).not.toHaveBeenCalled();

    await finish();
    await removing;
    expect(fetchInfoAndKeys).toHaveBeenCalledTimes(1);
    expect(mints.activeMintUrl).toBe(MINT_B);
  });

  it("falls back to the first mint once and activates it", async () => {
    const { mints, fetchInfoAndKeys, consoleError, finish } = setup([MINT_A]);

    expect(mints.activeMint().mint.url).toBe(MINT_A);
    expect(mints.activeMint().mint.url).toBe(MINT_A);
    expect(mints.activeMint().mint.url).toBe(MINT_A);
    await flush();

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(fetchInfoAndKeys).toHaveBeenCalledTimes(1);

    await finish();
    expect(mints.activeMintUrl).toBe(MINT_A);
  });
});
