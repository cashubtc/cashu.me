import { WalletProof } from '../mints';
import { CashuWallet, Proof } from '@cashu/cashu-ts';
import { DEFAULT_BUCKET_ID } from '../buckets';
import { useProofsStore } from '../proofs';
import { useUiStore } from '../ui';
import { useMintsStore } from '../mints';
import { useReceiveTokensStore } from '../receiveTokensStore';
import token from 'src/js/token';
import { HistoryToken, useTokensStore } from '../tokens';
import { useP2PKStore } from '../p2pk';

/**
 * Actions related to token handling such as coin selection,
 * sending and receiving tokens.
 */
export const tokenActions = {
  coinSelectSpendBase64: function (
    proofs: WalletProof[],
    amount: number,
  ): WalletProof[] {
    const base64Proofs = proofs.filter((p) => !p.id.startsWith('00'));
    if (base64Proofs.length > 0) {
      base64Proofs.sort((a, b) => b.amount - a.amount);
      let sum = 0;
      let selectedProofs: WalletProof[] = [];
      for (let i = 0; i < base64Proofs.length; i++) {
        const proof = base64Proofs[i];
        sum += proof.amount;
        selectedProofs.push(proof);
        if (sum >= amount) {
          return selectedProofs;
        }
      }
      return [];
    }
    return [];
  },

  coinSelect: function (
    proofs: WalletProof[],
    wallet: CashuWallet,
    amount: number,
    includeFees: boolean = false,
    preferredBucketId?: string,
  ): WalletProof[] {
    if (proofs.reduce((s, t) => (s += t.amount), 0) < amount) {
      return [];
    }

    let orderedProofs = [...proofs];

    if (preferredBucketId) {
      orderedProofs.sort((a, b) => {
        const aPref = a.bucketId === preferredBucketId ? 0 : 1;
        const bPref = b.bucketId === preferredBucketId ? 0 : 1;
        if (aPref !== bPref) {
          return aPref - bPref;
        }
        return b.amount - a.amount;
      });
    }

    let sum = 0;
    let selectedProofs: WalletProof[] = [];
    for (const proof of orderedProofs) {
      selectedProofs.push(proof);
      sum += proof.amount;
      const fees = includeFees ? wallet.getFeesForProofs(selectedProofs) : 0;
      if (sum >= amount + fees) {
        break;
      }
    }

    const finalFees = includeFees ? wallet.getFeesForProofs(selectedProofs) : 0;
    if (sum < amount + finalFees) {
      return [];
    }

    return selectedProofs.map((p) => ({ ...p, reserved: false } as WalletProof));
  },

  send: async function (
    this: any,
    proofs: WalletProof[],
    wallet: CashuWallet,
    amount: number,
    invalidate: boolean = false,
    includeFees: boolean = false,
    bucketId: string = DEFAULT_BUCKET_ID,
  ): Promise<{ keepProofs: Proof[]; sendProofs: Proof[] }> {
    const mintStore = useMintsStore();
    const proofsStore = useProofsStore();
    const uIStore = useUiStore();
    let proofsToSend: WalletProof[] = [];
    const keysetId = this.getKeyset(wallet.mint.mintUrl, wallet.unit);
    await uIStore.lockMutex();
    try {
      const spendableProofs = this.spendableProofs(proofs, amount);

      proofsToSend = this.coinSelect(
        spendableProofs,
        wallet,
        amount,
        includeFees,
        bucketId,
      );
      const totalAmount = proofsToSend.reduce((s, t) => (s += t.amount), 0);
      const fees = includeFees ? wallet.getFeesForProofs(proofsToSend) : 0;
      const targetAmount = amount + fees;

      let keepProofs: Proof[] = [];
      let sendProofs: Proof[] = [];

      if (totalAmount != targetAmount) {
        const counter = this.keysetCounter(keysetId);
        proofsToSend = this.coinSelect(
          spendableProofs,
          wallet,
          targetAmount,
          true,
          bucketId,
        );
        ({ keep: keepProofs, send: sendProofs } = await wallet.send(
          targetAmount,
          proofsToSend,
          { counter, keysetId, proofsWeHave: spendableProofs },
        ));
        this.increaseKeysetCounter(
          keysetId,
          keepProofs.length + sendProofs.length,
        );
        await proofsStore.addProofs(keepProofs, undefined, bucketId, '');
        await proofsStore.addProofs(sendProofs, undefined, bucketId, '');

        const proofsToSendNotReturned = proofsToSend
          .filter((p) => !sendProofs.find((s) => s.secret === p.secret))
          .filter((p) => !keepProofs.find((k) => k.secret === p.secret));
        await proofsStore.removeProofs(proofsToSendNotReturned);
      } else if (totalAmount == targetAmount) {
        keepProofs = [];
        sendProofs = proofsToSend;
      } else {
        throw new Error('could not split proofs.');
      }

      await proofsStore.setReserved(sendProofs, true);
      if (invalidate) {
        await proofsStore.removeProofs(sendProofs);
      }
      return { keepProofs, sendProofs };
    } catch (error: any) {
      await proofsStore.setReserved(proofsToSend, false);
      console.error(error);
      notifyApiError(error);
      this.handleOutputsHaveAlreadyBeenSignedError(keysetId, error);
      throw error;
    } finally {
      uIStore.unlockMutex();
    }
  },

  redeem: async function (this: any, bucketId: string = DEFAULT_BUCKET_ID) {
    const uIStore = useUiStore();
    const mintStore = useMintsStore();
    const p2pkStore = useP2PKStore();
    const receiveStore = useReceiveTokensStore();

    receiveStore.showReceiveTokens = false;

    if (receiveStore.receiveData.tokensBase64.length == 0) {
      throw new Error('no tokens provided.');
    }
    const tokenJson = token.decode(receiveStore.receiveData.tokensBase64);
    if (tokenJson == undefined) {
      throw new Error('no tokens provided.');
    }
    let proofs = token.getProofs(tokenJson);
    if (proofs.length == 0) {
      throw new Error('no proofs found.');
    }
    const inputAmount = proofs.reduce((s, t) => (s += t.amount), 0);
    let fee = 0;
    let mintInToken = token.getMint(tokenJson);
    let unitInToken = token.getUnit(tokenJson);

    const historyToken = {
      amount: inputAmount,
      token: receiveStore.receiveData.tokensBase64,
      unit: unitInToken,
      mint: mintInToken,
      label: receiveStore.receiveData.label ?? '',
      fee: fee,
      bucketId,
    } as HistoryToken;
    const mintWallet = this.mintWallet(historyToken.mint, historyToken.unit);
    const mint = mintStore.mints.find((m) => m.url === historyToken.mint);
    if (!mint) {
      throw new Error('mint not found');
    }
    const proofsStore = useProofsStore();
    const tokenStore = useTokensStore();
    await uIStore.lockMutex();
    try {
      const keysetId = this.getKeyset(historyToken.mint, historyToken.unit);
      const counter = this.keysetCounter(keysetId);
      const privkey = receiveStore.receiveData.p2pkPrivateKey;
      let newProofs: Proof[];
      try {
        newProofs = await mintWallet.receive(
          receiveStore.receiveData.tokensBase64,
          {
            counter,
            privkey,
            proofsWeHave: mintStore.mintUnitProofs(mint, historyToken.unit),
          },
        );
        await proofsStore.addProofs(
          newProofs,
          undefined,
          bucketId,
          receiveStore.receiveData.label ?? '',
        );
        this.increaseKeysetCounter(keysetId, newProofs.length);
      } catch (error: any) {
        console.error(error);
        this.handleOutputsHaveAlreadyBeenSignedError(keysetId, error);
        throw new Error('Error receiving tokens: ' + error);
      }

      p2pkStore.setPrivateKeyUsed(privkey);

      const outputAmount = newProofs.reduce((s, t) => (s += t.amount), 0);

      if (
        tokenStore.historyTokens.find(
          (t) => t.token === receiveStore.receiveData.tokensBase64 && t.amount > 0,
        )
      ) {
        tokenStore.setTokenPaid(receiveStore.receiveData.tokensBase64);
      } else {
        if (
          tokenStore.historyTokens.find(
            (t) => t.token === receiveStore.receiveData.tokensBase64 && t.amount < 0,
          )
        ) {
          tokenStore.setTokenPaid(receiveStore.receiveData.tokensBase64);
        }
        fee = inputAmount - outputAmount;
        historyToken.fee = fee;
        historyToken.amount = outputAmount;
        tokenStore.addPaidToken(historyToken);
      }
      useUiStore().vibrate();
      let message = this.t('wallet.notifications.received', {
        amount: uIStore.formatCurrency(outputAmount, historyToken.unit),
      });
      if (fee > 0) {
        message += this.t('wallet.notifications.fee', {
          fee: uIStore.formatCurrency(fee, historyToken.unit),
        });
      }
      notifySuccess(message);
    } catch (error: any) {
      console.error(error);
      notifyApiError(error);
      throw error;
    } finally {
      uIStore.unlockMutex();
    }
  },
};
