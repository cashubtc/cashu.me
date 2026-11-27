import {
  KeyChain,
  Mint,
  StaleKeysetError,
  Wallet,
  WalletEvents,
} from "@cashu/cashu-ts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notify, notifyError } from "src/js/notify";
import { i18n } from "src/boot/i18n";
import {
  KeysetDerivationCollisionError,
  type StoredMint,
  useMintsStore,
} from "src/stores/mints";
import { useWalletStore } from "src/stores/wallet";

vi.mock("src/js/notify", () => ({
  notify: vi.fn(),
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  notifyWarning: vi.fn(),
  notifyApiError: vi.fn(),
}));

vi.mock("src/stores/proofs", () => ({
  useProofsStore: () => ({ proofs: [], updateActiveProofs: vi.fn() }),
}));

const LEGACY_A = "0000000000000001";
const LEGACY_B = "0000000080000000";
const LEGACY_C = "0000000000000002";
const V2 = "01" + "00".repeat(31);
const mintInfo = {
  name: "Test mint",
  pubkey: "",
  version: "test/1.0",
  contact: [],
  nuts: {
    "4": { methods: [], disabled: false },
    "5": { methods: [], disabled: false },
  },
};

const keyset = (id: string, active = true) => ({ id, unit: "sat", active });
const storedMint = (
  id = LEGACY_A,
  url = "https://mint-a.example"
): StoredMint => ({
  url,
  keysets: [keyset(id)],
  keys: [],
});

describe("mint keyset validation", () => {
  const initialLocale = i18n.global.locale;
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    i18n.global.locale = initialLocale;
    vi.restoreAllMocks();
  });

  it("accepts distinct legacy derivation paths and repeated IDs", async () => {
    const mints = useMintsStore();
    mints.mints = [storedMint()];

    expect(
      mints.checkForMintKeysetIdCollisions(mints.mints[0], [
        keyset(LEGACY_A),
        keyset(LEGACY_C),
      ])
    ).toBe(true);
  });

  it("accepts V2 keysets alongside legacy keysets", async () => {
    const mints = useMintsStore();
    mints.mints = [storedMint()];

    expect(
      mints.checkForMintKeysetIdCollisions(mints.mints[0], [keyset(V2)])
    ).toBe(true);
  });

  it.each([LEGACY_A, V2])("rejects ID %s shared by different mints", (id) => {
    const mints = useMintsStore();
    const other = storedMint(id, "https://mint-b.example");
    mints.mints = [storedMint(id), other];

    expect(() => mints.checkForMintKeysetIdCollisions(other)).toThrow(
      KeysetDerivationCollisionError
    );
  });

  it.each([
    [LEGACY_A, LEGACY_B],
    ["AAAAAAAAAAE=", LEGACY_B],
    ["AAAAAAAAAAAA", "0000000000000000"],
  ])("checks legacy IDs %s and %s together", async (known, incoming) => {
    const mints = useMintsStore();
    mints.mints = [storedMint(known)];

    expect(() =>
      mints.checkForMintKeysetIdCollisions(mints.mints[0], [keyset(incoming)])
    ).toThrow(KeysetDerivationCollisionError);
  });

  it("checks keysets within a newly added mint", async () => {
    const mints = useMintsStore();
    mints.mints = [];

    expect(() =>
      mints.checkForMintKeysetIdCollisions(storedMint(), [
        keyset(LEGACY_A),
        keyset(LEGACY_B),
      ])
    ).toThrow(KeysetDerivationCollisionError);
  });

  it("keeps inactive keysets in the validation set", async () => {
    const mints = useMintsStore();
    const mint = storedMint();
    mint.keysets[0].active = false;
    mints.mints = [mint];

    expect(() =>
      mints.checkForMintKeysetIdCollisions(mint, [keyset(LEGACY_B)])
    ).toThrow(KeysetDerivationCollisionError);
  });

  it("validates a rotation against the same mint's saved keysets", async () => {
    const mints = useMintsStore();
    const mint = storedMint();
    mints.mints = [mint];
    vi.spyOn(Mint.prototype, "getKeySets").mockResolvedValue({
      keysets: [keyset(LEGACY_B)],
    });

    await expect(mints.fetchMintKeysets(mint)).rejects.toThrow(
      KeysetDerivationCollisionError
    );
    expect(mints.mints[0].keysets).toEqual([keyset(LEGACY_A)]);
  });

  it("reports translated validation errors when adding a mint", async () => {
    i18n.global.locale = "fr-FR";
    const mints = useMintsStore();
    mints.mints = [storedMint()];
    vi.spyOn(Mint.prototype, "getInfo").mockResolvedValue(mintInfo);
    vi.spyOn(Mint.prototype, "getKeySets").mockResolvedValue({
      keysets: [keyset(LEGACY_B)],
    });
    const getKeys = vi.spyOn(Mint.prototype, "getKeys");

    await expect(
      mints.addMint({ url: "https://mint-b.example" })
    ).rejects.toThrow(KeysetDerivationCollisionError);
    expect(mints.mints).toHaveLength(1);
    expect(getKeys).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledWith(
      mints.t("wallet.mint.notifications.mint_validation_error"),
      mints.t("wallet.mint.notifications.activation_failed")
    );
    expect(new KeysetDerivationCollisionError().message).not.toBe(
      "Mint validation error"
    );
  });

  it("stops wallet creation when an hourly refresh rejects the keysets", async () => {
    const mints = useMintsStore();
    const mint = storedMint();
    mints.mints = [mint];
    const wallet = useWalletStore();
    const createWallet = vi.spyOn(wallet, "createWalletInstance");
    vi.spyOn(Mint.prototype, "getInfo").mockResolvedValue(mintInfo);
    vi.spyOn(Mint.prototype, "getKeySets").mockResolvedValue({
      keysets: [keyset(LEGACY_B)],
    });

    await expect(wallet.mintWallet(mint.url, "sat", true)).rejects.toThrow(
      KeysetDerivationCollisionError
    );
    expect(createWallet).not.toHaveBeenCalled();
    expect(mints.mints[0].keysets).toEqual([keyset(LEGACY_A)]);
  });

  it("uses the saved mint when an hourly refresh cannot connect", async () => {
    const mints = useMintsStore();
    const mint = storedMint();
    mints.mints = [mint];
    const wallet = useWalletStore();
    vi.spyOn(mints, "updateMintInfoAndKeys").mockRejectedValue(
      new TypeError("Network request failed")
    );

    await expect(
      wallet.mintWallet(mint.url, "sat", true)
    ).resolves.toBeInstanceOf(Wallet);
  });

  it("keeps saved keys and keysets unchanged when a repair is rejected", async () => {
    const mints = useMintsStore();
    mints.mints = [storedMint()];
    mints.mints[0].lastKeysetsUpdated = new Date().toISOString();
    const wallet = useWalletStore();
    const subscribe = vi.spyOn(WalletEvents.prototype, "keychainUpdated");
    wallet.createWalletInstance(mints.mints[0], mints.mints[0].url, "sat");
    const onKeychainUpdated = subscribe.mock.calls[0][0];
    const cache = KeyChain.mintToCacheDTO(
      mints.mints[0].url,
      [keyset(LEGACY_A, false), keyset(LEGACY_B)],
      [{ ...keyset(LEGACY_B), keys: {} }]
    );

    expect(() => onKeychainUpdated({ cache })).toThrow(
      KeysetDerivationCollisionError
    );
    expect(mints.mints[0].keysets).toEqual([keyset(LEGACY_A)]);
    expect(mints.mints[0].keys).toEqual([]);

    const refresh = vi.spyOn(mints, "updateMintInfoAndKeys");
    await expect(
      wallet.mintWallet(mints.mints[0].url, "sat", true)
    ).resolves.toBeInstanceOf(Wallet);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("checks saved keysets before repeating or starting an operation", async () => {
    const mints = useMintsStore();
    mints.mints = [storedMint()];
    mints.mints[0].lastKeysetsUpdated = new Date().toISOString();
    const wallet = useWalletStore();
    const operation = vi
      .fn()
      .mockImplementationOnce(async () => {
        mints.mints[0].keysets.push(keyset(LEGACY_B));
        throw new StaleKeysetError(true);
      })
      .mockResolvedValueOnce("done");

    await expect(
      wallet.retryOnceOnRecoverableError(LEGACY_A, operation)
    ).rejects.toThrow(KeysetDerivationCollisionError);
    expect(operation).toHaveBeenCalledTimes(1);
    expect(notify).not.toHaveBeenCalled();

    const refresh = vi.spyOn(mints, "updateMintInfoAndKeys");
    const createWallet = vi.spyOn(wallet, "createWalletInstance");
    for (const updateKeysets of [false, true]) {
      await expect(
        wallet.mintWallet(mints.mints[0].url, "sat", updateKeysets)
      ).rejects.toThrow(KeysetDerivationCollisionError);
    }
    expect(refresh).not.toHaveBeenCalled();
    expect(createWallet).not.toHaveBeenCalled();
  });

  it("rejects a repaired keyset already used by another mint before saving", () => {
    const mints = useMintsStore();
    mints.mints = [
      storedMint(),
      storedMint(LEGACY_C, "https://mint-b.example"),
    ];
    const wallet = useWalletStore();
    const subscribe = vi.spyOn(WalletEvents.prototype, "keychainUpdated");
    wallet.createWalletInstance(mints.mints[0], mints.mints[0].url, "sat");
    const cache = KeyChain.mintToCacheDTO(
      mints.mints[0].url,
      [keyset(LEGACY_A, false), keyset(LEGACY_C)],
      [{ ...keyset(LEGACY_C), keys: {} }]
    );

    expect(() => subscribe.mock.calls[0][0]({ cache })).toThrow(
      KeysetDerivationCollisionError
    );
    expect(mints.mints[0].keysets).toEqual([keyset(LEGACY_A)]);
    expect(mints.mints[0].keys).toEqual([]);
  });

  it("opens and retries an unrelated mint when other mints conflict", async () => {
    const mints = useMintsStore();
    const unrelated = storedMint(LEGACY_C, "https://mint-c.example");
    unrelated.lastKeysetsUpdated = new Date().toISOString();
    mints.mints = [
      storedMint(),
      storedMint(LEGACY_B, "https://mint-b.example"),
      unrelated,
    ];
    const wallet = useWalletStore();

    await expect(
      wallet.mintWallet(unrelated.url, "sat", true)
    ).resolves.toBeInstanceOf(Wallet);
    await expect(wallet.mintWallet(mints.mints[0].url, "sat")).rejects.toThrow(
      KeysetDerivationCollisionError
    );

    const operation = vi
      .fn()
      .mockRejectedValueOnce(new StaleKeysetError(true))
      .mockResolvedValueOnce("done");
    await expect(
      wallet.retryOnceOnRecoverableError(LEGACY_C, operation)
    ).resolves.toBe("done");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("saves compatible updates for an unrelated mint", () => {
    const mints = useMintsStore();
    const unrelated = storedMint(LEGACY_C, "https://mint-c.example");
    mints.mints = [
      storedMint(),
      storedMint(LEGACY_B, "https://mint-b.example"),
      unrelated,
    ];
    const wallet = useWalletStore();
    const subscribe = vi.spyOn(WalletEvents.prototype, "keychainUpdated");
    wallet.createWalletInstance(unrelated, unrelated.url, "sat");
    const next = keyset("0000000000000003");
    const cache = KeyChain.mintToCacheDTO(
      unrelated.url,
      [keyset(LEGACY_C, false), next],
      [{ ...next, keys: {} }]
    );

    subscribe.mock.calls[0][0]({ cache });
    const updated = mints.mints.find((mint) => mint.url === unrelated.url)!;
    expect(updated.keysets).toEqual([
      expect.objectContaining(keyset(LEGACY_C, false)),
      expect.objectContaining(next),
    ]);
    expect(updated.keys).toEqual([
      expect.objectContaining({ ...next, keys: {} }),
    ]);
  });

  it("validates saved keysets after a connection error", async () => {
    const mints = useMintsStore();
    const mint = storedMint();
    mint.keysets.push(keyset(LEGACY_B));
    mints.mints = [mint];
    const wallet = useWalletStore();
    const createWallet = vi.spyOn(wallet, "createWalletInstance");
    vi.spyOn(mints, "updateMintInfoAndKeys").mockRejectedValue(
      new TypeError("Network request failed")
    );

    await expect(wallet.mintWallet(mint.url, "sat", true)).rejects.toThrow(
      KeysetDerivationCollisionError
    );
    expect(createWallet).not.toHaveBeenCalled();
  });

  it.each([LEGACY_C, V2])(
    "repeats an operation after a compatible repair to %s",
    async (id) => {
      const mints = useMintsStore();
      mints.mints = [storedMint()];
      const wallet = useWalletStore();
      const operation = vi
        .fn()
        .mockImplementationOnce(async () => {
          mints.mints[0].keysets.push(keyset(id));
          throw new StaleKeysetError(true);
        })
        .mockResolvedValueOnce("done");

      await expect(
        wallet.retryOnceOnRecoverableError(LEGACY_A, operation)
      ).resolves.toBe("done");
      expect(operation).toHaveBeenCalledTimes(2);
    }
  );
});
