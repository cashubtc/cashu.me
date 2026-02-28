import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useMintsStore, Mint } from "../mints";
import { useUiStore } from "../ui";
import { useWorkersStore } from "../workers";
import { useNostrMintBackupStore } from "../nostrMintBackup";
import { useSettingsStore } from "../settings";

// Mock dependencies
vi.mock("@cashu/cashu-ts", async () => {
  const actual = await vi.importActual("@cashu/cashu-ts");
  return {
    ...actual,
    CashuMint: vi.fn().mockImplementation(() => ({
      getInfo: vi.fn().mockResolvedValue({
        name: "Test Mint",
        version: "Nutshell/0.17.0",
        motd: "Welcome",
        nuts: {
          15: {
            methods: [{ method: "bolt11", unit: "sat" }],
          },
        },
      }),
      getKeys: vi.fn().mockResolvedValue({
        keysets: [{ id: "00abcdef12345678", unit: "sat", active: true }],
      }),
      getKeySets: vi.fn().mockResolvedValue({
        keysets: [{ id: "00abcdef12345678", unit: "sat", active: true }],
      }),
    })),
  };
});

// Mock i18n
vi.mock("src/boot/i18n", () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

// Mock notify
vi.mock("src/js/notify", () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  notifyApiError: vi.fn(),
}));

describe("useMintsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Reset localStorage
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("addMint", () => {
    it("should sanitize URL correctly", async () => {
      const store = useMintsStore();
      const mint = await store.addMint({ url: "mint.test/" });
      expect(mint.url).toBe("https://mint.test");
    });

    it("should prevent duplicate mints", async () => {
      const store = useMintsStore();
      await store.addMint({ url: "https://mint.test" });

      const mint2 = await store.addMint({ url: "https://mint.test" });

      expect(store.mints.length).toBe(1);
      expect(mint2.url).toBe("https://mint.test");
    });

    it("should trigger nostr backup", async () => {
      const store = useMintsStore();
      const nostrStore = useNostrMintBackupStore();
      const settingsStore = useSettingsStore();

      // Enable backup in settings
      settingsStore.nostrMintBackupEnabled = true;

      // Spy on the backup action
      // We need to replace the action on the store instance
      nostrStore.backupMintsToNostr = vi.fn();

      // Mock setTimeout to run immediately
      vi.useFakeTimers();

      await store.addMint({ url: "https://mint.test" });

      vi.runAllTimers();
      expect(nostrStore.backupMintsToNostr).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe("checkForMintKeysetIdCollisions", () => {
    it("should detect collision", async () => {
      const store = useMintsStore();

      // Add a mint first
      await store.addMint({ url: "https://mint1.test" });
      // The mock returns keyset id "00abcdef12345678" for mint1

      // Try to check for collision with another mint having same keyset ID
      const mint2: Mint = { url: "https://mint2.test", keys: [], keysets: [] };
      const keysets = [{ id: "00abcdef12345678", unit: "sat", active: true }];

      await expect(
        store.checkForMintKeysetIdCollisions(mint2, keysets)
      ).rejects.toThrow("wallet.mint.notifications.mint_validation_error");
    });

    it("should not detect collision for different IDs", async () => {
      const store = useMintsStore();
      await store.addMint({ url: "https://mint1.test" });

      const mint2: Mint = { url: "https://mint2.test", keys: [], keysets: [] };
      const keysets = [{ id: "differentId", unit: "sat", active: true }];

      const result = await store.checkForMintKeysetIdCollisions(mint2, keysets);
      expect(result).toBe(true);
    });
  });

  describe("activateMint", () => {
    it("should stop workers and update mint info", async () => {
      const store = useMintsStore();
      const workersStore = useWorkersStore();
      const uiStore = useUiStore();

      // Mock methods
      workersStore.clearAllWorkers = vi.fn();
      uiStore.lockMutex = vi.fn();
      uiStore.unlockMutex = vi.fn();

      const mint = await store.addMint({ url: "https://mint.test" });

      // Call activateMint explicitly
      await store.activateMint(mint, false, true);

      expect(workersStore.clearAllWorkers).toHaveBeenCalled();
      expect(uiStore.lockMutex).toHaveBeenCalled();
      expect(store.activeMintUrl).toBe("https://mint.test");
      expect(uiStore.unlockMutex).toHaveBeenCalled();
    });
  });
});
