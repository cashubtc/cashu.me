import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNostrStore, SignerType } from "src/stores/nostr";
import { useWalletStore } from "src/stores/wallet";

vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-i18n")>()),
  useI18n: () => ({ t: (key: string) => key }),
}));

const mnemonic =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

describe("Nostr startup before onboarding", () => {
  beforeEach(() => localStorage.clear());

  it("defers seed work without marking the signer initialized or generating a seed", async () => {
    const wallet = useWalletStore();
    const nostr = useNostrStore();
    const derive = vi.spyOn(nostr, "walletSeedGenerateKeyPair");
    const connect = vi.spyOn(nostr, "initNdkReadOnly");
    await nostr.initSigner();
    await nostr.subscribeToNip17DirectMessages();
    expect(wallet.mnemonic).toBe("");
    expect(nostr.initialized).toBe(false);
    expect(derive).not.toHaveBeenCalled();
    expect(connect).not.toHaveBeenCalled();

    wallet.mnemonic = mnemonic;
    await nostr.initSignerIfNotSet();
    expect(nostr.initialized).toBe(true);
    expect(nostr.seedSignerPublicKey).toMatch(/^[0-9a-f]{64}$/);
    expect(nostr.pubkey).toBe(nostr.seedSignerPublicKey);
  });

  it("keeps non-seed signers available without a wallet mnemonic", async () => {
    const nostr = useNostrStore();
    nostr.signerType = SignerType.NIP07;
    const initialize = vi
      .spyOn(nostr, "initNip07Signer")
      .mockResolvedValue(undefined);
    await nostr.initSigner();
    expect(initialize).toHaveBeenCalledOnce();
    expect(nostr.initialized).toBe(true);
  });
});
