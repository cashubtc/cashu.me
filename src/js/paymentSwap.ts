import {
  type Wallet,
  type SwapPreview,
  OutputData,
  type SendResponse,
} from "@cashu/cashu-ts";

/** A lost response must never cause fresh outputs to be generated for spent inputs. */
export async function completeRecoverableSwap(
  wallet: Wallet,
  preview: SwapPreview,
  privkey?: string
): Promise<SendResponse> {
  try {
    return await wallet.completeSwap(preview, privkey);
  } catch (originalError) {
    const outputs = [
      ...(preview.keepOutputs ?? []),
      ...(preview.sendOutputs ?? []),
    ];
    if (!outputs.length) throw originalError;
    // NUT-09 also works after the mint's NUT-19 response cache has expired.
    const restored = await wallet.mint.restore({
      outputs: outputs.map((o) => o.blindedMessage),
    });
    const signatures = new Map(
      restored.outputs.map((o, i) => [o.B_, restored.signatures[i]])
    );
    if (
      outputs.some((o) => {
        const signature = signatures.get(o.blindedMessage.B_);
        return (
          !signature ||
          signature.id !== o.blindedMessage.id ||
          signature.amount.compareTo(o.blindedMessage.amount) !== 0
        );
      })
    )
      throw originalError;
    await wallet.ensureOperableKeysets([
      ...new Set(outputs.map((o) => o.blindedMessage.id)),
    ]);
    const recover = (items: typeof outputs) =>
      items.map((item) => {
        const data = OutputData.deserialize(OutputData.serialize(item));
        const sig = signatures.get(item.blindedMessage.B_)!;
        return data.toProof(sig, wallet.getKeyset(sig.id));
      });
    return {
      keep: recover(preview.keepOutputs ?? []),
      send: recover(preview.sendOutputs ?? []),
    };
  }
}
