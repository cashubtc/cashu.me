import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDonationPresetsStore } from "../../../src/stores/donationPresets";
import { useWalletStore } from "../../../src/stores/wallet";
import { useProofsStore } from "../../../src/stores/proofs";
import { useDexieLockedTokensStore } from "../../../src/stores/lockedTokensDexie";
import { cashuDb } from "../../../src/stores/dexie";
import { useMintsStore } from "../../../src/stores/mints";

beforeEach(async () => {
  localStorage.clear();
  await cashuDb.delete();
  await cashuDb.open();
});

vi.mock("../../../src/stores/wallet", () => ({
  useWalletStore: () => ({
    wallet: {},
    sendToLock: vi.fn(async () => ({ sendProofs: [] })),
  }),
}));

vi.mock("../../../src/stores/proofs", () => ({
  useProofsStore: () => ({
    serializeProofs: vi.fn(() => "tok"),
    updateActiveProofs: vi.fn(),
  }),
}));

vi.mock("../../../src/stores/lockedTokensDexie", () => ({
  useDexieLockedTokensStore: () => ({
    addLockedToken: vi.fn(async (d: any) => ({ id: "id", ...d })),
  }),
}));

vi.mock("../../../src/stores/mints", () => ({
  useMintsStore: () => ({
    activeProofs: [{ amount: 10, bucketId: "b" }],
    activeMintUrl: "m",
    activeUnit: "sat",
  }),
}));

describe("Donation presets", () => {
  it("has default presets", () => {
    const store = useDonationPresetsStore();
    expect(store.presets.length).toBe(4);
    expect(store.presets[0].months).toBe(1);
  });

  it("calls sendToLock with sequential locktimes", async () => {
    const store = useDonationPresetsStore();
    const wallet = useWalletStore();
    const spy = wallet.sendToLock as any;
    await store.createDonationPreset(3, 1, "pk", "b");
    expect(spy).toHaveBeenCalledTimes(3);
    const first = spy.mock.calls[0][5];
    const second = spy.mock.calls[1][5];
    const third = spy.mock.calls[2][5];
    expect(second).toBeGreaterThan(first);
    expect(third).toBeGreaterThan(second);
  });

  it("skips schedule when months is 0 and returns token", async () => {
    const store = useDonationPresetsStore();
    const wallet = useWalletStore();
    const spy = wallet.sendToLock as any;
    const token = await store.createDonationPreset(0, 5, "pk", "b");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][2]).toBe(5);
    expect(token).toBe("tok");
  });

  it("uses provided startDate for locktimes", async () => {
    const store = useDonationPresetsStore();
    const wallet = useWalletStore();
    const spy = wallet.sendToLock as any;
    const start = 1000;
    await store.createDonationPreset(3, 1, "pk", "b", start);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[0][5]).toBe(start);
    expect(spy.mock.calls[1][5]).toBe(start + 30 * 24 * 60 * 60);
    expect(spy.mock.calls[2][5]).toBe(start + 2 * 30 * 24 * 60 * 60);
  });

  it("returns locked token data when detailed is true", async () => {
    const store = useDonationPresetsStore();
    const locked = useDexieLockedTokensStore();
    (locked.addLockedToken as any).mockImplementation((d: any) => ({
      id: "id" + (locked.addLockedToken as any).mock.calls.length,
      date: "d",
      ...d,
    }));
    const res = (await store.createDonationPreset(
      2,
      1,
      "pk",
      "b",
      undefined,
      true
    )) as any[];
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(2);
    expect(res[0].id).toBeDefined();
  });
});
