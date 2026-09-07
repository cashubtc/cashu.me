import { describe, expect, it, vi } from "vitest";
import {
  Amount,
  OutputData,
  type SwapPreview,
  type Wallet,
} from "@cashu/cashu-ts";
import { secp256k1 } from "@noble/curves/secp256k1";
import { completeRecoverableSwap } from "src/js/paymentSwap";

describe("saved swap recovery", () => {
  const id = "0011223344556677";
  const keyset = {
    id,
    unit: "sat",
    keys: { "1": secp256k1.ProjectivePoint.BASE.multiply(7n).toHex(true) },
  };
  function fixture() {
    const outputs = [
      OutputData.createSingleRandomData(1, id),
      OutputData.createSingleRandomData(1, id),
    ];
    const signatures = outputs.map((output) => ({
      id,
      amount: Amount.from(1),
      C_: secp256k1.ProjectivePoint.fromHex(output.blindedMessage.B_)
        .multiply(7n)
        .toHex(true),
    }));
    const preview = {
      inputs: [],
      keepOutputs: [outputs[0]],
      sendOutputs: [outputs[1]],
      keysetId: id,
      amount: Amount.from(1),
      fees: Amount.from(0),
    } as SwapPreview;
    const wallet = {
      completeSwap: vi.fn().mockRejectedValue(new Error("lost response")),
      mint: {
        restore: vi.fn().mockResolvedValue({
          outputs: outputs.map((o) => o.blindedMessage).reverse(),
          signatures: [...signatures].reverse(),
        }),
      },
      ensureOperableKeysets: vi.fn(),
      getKeyset: vi.fn(() => keyset),
    };
    return { outputs, signatures, preview, wallet };
  }
  it("unblinds the saved outputs after a lost mint response, independent of restore ordering", async () => {
    const { outputs, signatures, preview, wallet } = fixture();
    const result = await completeRecoverableSwap(
      wallet as unknown as Wallet,
      preview
    );
    expect(result).toEqual({
      keep: [outputs[0].toProof(signatures[0], keyset)],
      send: [outputs[1].toProof(signatures[1], keyset)],
    });
    expect(wallet.mint.restore).toHaveBeenCalledWith({
      outputs: outputs.map((o) => o.blindedMessage),
    });
  });
  it("does not commit a partial restore or invent replacement outputs", async () => {
    const { outputs, signatures, preview, wallet } = fixture();
    wallet.mint.restore.mockResolvedValue({
      outputs: [outputs[0].blindedMessage],
      signatures: [signatures[0]],
    });
    await expect(
      completeRecoverableSwap(wallet as unknown as Wallet, preview)
    ).rejects.toThrow("lost response");
    expect(wallet.getKeyset).not.toHaveBeenCalled();
  });
  it("does not restore when the original swap succeeds", async () => {
    const { preview, wallet } = fixture();
    wallet.completeSwap.mockResolvedValue({ keep: [], send: [] });
    await completeRecoverableSwap(wallet as unknown as Wallet, preview);
    expect(wallet.mint.restore).not.toHaveBeenCalled();
  });
});
