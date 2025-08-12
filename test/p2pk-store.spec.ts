import { describe, it, expect, vi, beforeEach } from "vitest";
import { useP2PKStore } from "stores/p2pk";
import { useWalletStore } from "stores/wallet";
import { DEFAULT_BUCKET_ID } from "@/constants/buckets";

let mintsStoreMock: any;
let proofsStoreMock: any;
let tokensStoreMock: any;
let walletStore: any;

vi.mock("src/js/token", () => ({
  default: {
    decode: vi.fn(() => ({ proofs: [], mint: "mint", unit: "sat" })),
    getMint: vi.fn(() => "mint"),
    getUnit: vi.fn(() => "sat"),
  },
}));

vi.mock("stores/mints", () => ({
  useMintsStore: () => mintsStoreMock,
}));

vi.mock("stores/proofs", () => ({
  useProofsStore: () => proofsStoreMock,
}));

vi.mock("stores/tokens", () => ({
  useTokensStore: () => tokensStoreMock,
}));

vi.mock("stores/dexie", () => ({
  cashuDb: {
    lockedTokens: {
      where: () => ({ equals: () => ({ first: async () => null }) }),
    },
  },
}));

beforeEach(() => {
  proofsStoreMock = { addProofs: vi.fn() };
  tokensStoreMock = { addPaidToken: vi.fn() };
  mintsStoreMock = {
    mints: [{ url: "mint", keysets: [] }],
    addMint: vi.fn(),
    mintUnitProofs: vi.fn(() => []),
  };
  walletStore = useWalletStore();
  vi.spyOn(walletStore, "mintWallet").mockReturnValue({
    receive: vi.fn(async () => [{ amount: 1, id: "a", C: "c" }]),
  } as any);
  vi.spyOn(walletStore, "getKeyset").mockReturnValue("kid");
  vi.spyOn(walletStore, "keysetCounter").mockReturnValue(1);
  vi.spyOn(walletStore, "increaseKeysetCounter").mockImplementation(() => {});
});

describe("p2pk store", () => {
  it("claims locked token using wallet.receive", async () => {
    const p2pk = useP2PKStore();
    p2pk.getPrivateKeyForP2PKEncodedToken = vi.fn(() => "priv");

    await p2pk.claimLockedToken("tok");

    const wallet = (walletStore.mintWallet as any).mock.results[0].value;
    expect(wallet.receive).toHaveBeenCalledWith("tok", {
      counter: 1,
      privkey: "priv",
      proofsWeHave: [],
    });
    expect(proofsStoreMock.addProofs).toHaveBeenCalled();
    expect(tokensStoreMock.addPaidToken).toHaveBeenCalledWith({
      amount: 1,
      token: "tok",
      mint: "mint",
      unit: "sat",
      label: "",
      bucketId: DEFAULT_BUCKET_ID,
    });
  });
});
