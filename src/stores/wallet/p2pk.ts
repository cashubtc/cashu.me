import { CashuWallet, Proof } from '@cashu/cashu-ts';
import { WalletProof } from '../mints';
import { useMintsStore } from '../mints';
import { DEFAULT_BUCKET_ID } from '../buckets';
import { notifyError } from 'src/js/notify';
import { useProofsStore } from '../proofs';

/**
 * Actions dealing with P2PK timelocks.
 */
export const p2pkActions = {
  async sendToLock(
    this: any,
    proofs: WalletProof[],
    wallet: CashuWallet,
    amount: number,
    receiverPubkey: string,
    bucketId: string = DEFAULT_BUCKET_ID,
    locktime?: number,
    refundPubkey?: string,
  ) {
    const mintStore = useMintsStore();
    const nutSupport = mintStore.activeInfo?.nut_supports || [];
    if (!(nutSupport.includes(10) && nutSupport.includes(11))) {
      notifyError(this.t('wallet.notifications.lock_not_supported'));
      throw new Error('Mint does not support timelocks or P2PK');
    }
    const spendableProofs = this.spendableProofs(proofs, amount);
    const proofsToSend = this.coinSelect(
      spendableProofs,
      wallet,
      amount,
      true,
      bucketId,
    );
    const keysetId = this.getKeyset(wallet.mint.mintUrl, wallet.unit);
    const { keep: keepProofs, send: sendProofs } = await wallet.send(amount, proofsToSend, {
      keysetId,
      pubkey: receiverPubkey,
      locktime,
      refund: refundPubkey,
    });
    const proofsStore = useProofsStore();
    await proofsStore.removeProofs(proofsToSend);
    await proofsStore.addProofs(keepProofs, undefined, bucketId, '');
    return { keepProofs, sendProofs };
  },
};
