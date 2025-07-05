import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateP2pkKeyPair, useP2PKStore } from "../../../src/stores/p2pk";
import { useWalletStore } from "../../../src/stores/wallet";
import { useProofsStore } from "../../../src/stores/proofs";
import { useMintsStore } from "../../../src/stores/mints";
import { cashuDb } from "../../../src/stores/dexie";
import { useTokensStore } from "../../../src/stores/tokens";
import { DEFAULT_BUCKET_ID } from "../../../src/stores/buckets";

beforeEach(async () => {
  localStorage.clear();
  await cashuDb.close();
  await cashuDb.open();
});

describe("claimLockedToken", () => {
  it("redeems token locked with known P2PK key", async () => {
    const walletStore = useWalletStore();
    const proofsStore = useProofsStore();
    const p2pk = useP2PKStore();
    const mintsStore = useMintsStore();
    const tokensStore = useTokensStore();

    mintsStore.mints = [
      {
        url: "m",
        keys: [],
        keysets: [{ id: "kid", unit: "sat", active: true }],
        info: { nut_supports: [10, 11] },
      },
    ];
    mintsStore.activeMintUrl = "m";
    mintsStore.activeUnit = "sat";

    vi.spyOn(proofsStore, "removeProofs").mockResolvedValue();
    vi.spyOn(proofsStore, "addProofs").mockResolvedValue();
    vi.spyOn(tokensStore, "addPaidToken").mockImplementation(() => {});

    walletStore.spendableProofs = vi.fn(() => [
      { secret: "s", amount: 1, id: "kid", C: "c" } as any,
    ]);
    walletStore.coinSelect = vi.fn(() => [
      { secret: "s", amount: 1, id: "kid", C: "c" } as any,
    ]);
    walletStore.getKeyset = vi.fn(() => "kid");
    walletStore.keysetCounter = vi.fn(() => 1);
    walletStore.increaseKeysetCounter = vi.fn();

    let sendProofs: any[] = [];
    const wallet = {
      mint: { mintUrl: "m" },
      unit: "sat",
      send: vi.fn(async (_a: number, _p: any, opts: any) => {
        const secret = JSON.stringify([
          "P2PK",
          { data: opts.pubkey, tags: [["locktime", String(opts.locktime)]] },
        ]);
        sendProofs = [{ id: "kid", amount: 1, C: "sent", secret }];
        return { keep: [], send: sendProofs };
      }),
      receive: vi.fn(async () => sendProofs),
    } as any;

    const { pub, priv } = generateP2pkKeyPair();
    p2pk.p2pkKeys = [
      { publicKey: pub, privateKey: priv, used: false, usedCount: 0 },
    ];

    await walletStore.sendToLock(
      [{ secret: "s", amount: 1, id: "kid", C: "c" } as any],
      wallet,
      1,
      pub,
      "b",
      123,
    );

    const tokenObj = { token: [{ proofs: sendProofs, mint: "m" }] };
    const encoded =
      "cashuA" + Buffer.from(JSON.stringify(tokenObj)).toString("base64");

    await p2pk.claimLockedToken(encoded);

    expect(wallet.receive).toHaveBeenCalledWith(encoded, expect.anything());
    expect(proofsStore.addProofs).toHaveBeenCalledWith(
      sendProofs,
      undefined,
      DEFAULT_BUCKET_ID,
      "",
    );
  });
});
