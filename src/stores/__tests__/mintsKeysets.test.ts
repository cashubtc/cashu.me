import {
  KeyChain,
  Mint,
  StaleKeysetError,
  Wallet,
  WalletEvents,
} from "@cashu/cashu-ts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notify, notifyError } from "src/js/notify";
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
const storedMint = (id = LEGACY_A): StoredMint => ({
  url: "https://mint-a.example",
  keysets: [keyset(id)],
  keys: [],
});

describe("mint keyset validation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts distinct legacy derivation paths and repeated IDs", async () => {
    const mints = useMintsStore();
    mints.mints = [storedMint()];

    await expect(
      mints.checkForMintKeysetIdCollisions([keyset(LEGACY_A), keyset(LEGACY_C)])
    ).resolves.toBe(true);
  });

  it("accepts V2 keysets alongside legacy keysets", async () => {
    const mints = useMintsStore();
    mints.mints = [storedMint()];

    await expect(
      mints.checkForMintKeysetIdCollisions([keyset(V2)])
    ).resolves.toBe(true);
  });

  it.each([
    [LEGACY_A, LEGACY_B],
    ["AAAAAAAAAAE=", LEGACY_B],
    ["AAAAAAAAAAAA", "0000000000000000"],
  ])("checks legacy IDs %s and %s together", async (known, incoming) => {
    const mints = useMintsStore();
    mints.mints = [storedMint(known)];

    await expect(
      mints.checkForMintKeysetIdCollisions([keyset(incoming)])
    ).rejects.toThrow(KeysetDerivationCollisionError);
  });

  it("checks keysets within a newly added mint", async () => {
    const mints = useMintsStore();
    mints.mints = [];

    await expect(
      mints.checkForMintKeysetIdCollisions([keyset(LEGACY_A), keyset(LEGACY_B)])
    ).rejects.toThrow(KeysetDerivationCollisionError);
  });

  it("keeps inactive keysets in the validation set", async () => {
    const mints = useMintsStore();
    const mint = storedMint();
    mint.keysets[0].active = false;
    mints.mints = [mint];

    await expect(
      mints.checkForMintKeysetIdCollisions([keyset(LEGACY_B)])
    ).rejects.toThrow(KeysetDerivationCollisionError);
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

  it("reports a specific error when adding a mint with conflicting keysets", async () => {
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
      expect.stringContaining(new KeysetDerivationCollisionError().message),
      expect.any(String)
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

  it("checks repaired keysets before repeating or starting an operation", async () => {
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
      []
    );
    const operation = vi
      .fn()
      .mockImplementationOnce(async () => {
        onKeychainUpdated({ cache });
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
