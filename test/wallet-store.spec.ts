import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWalletStore } from 'stores/wallet';
import { DEFAULT_BUCKET_ID } from '@/constants/buckets';

let proofsStoreMock: any;
let uiStoreMock: any;

vi.mock('stores/proofs', () => {
  proofsStoreMock = {
    addProofs: vi.fn(),
    removeProofs: vi.fn(),
    setReserved: vi.fn(),
  };
  return { useProofsStore: () => proofsStoreMock };
});

vi.mock('stores/mints', () => ({
  useMintsStore: () => ({
    activeUnit: 'sat',
    activeMintUrl: 'mint',
    mints: [{ url: 'mint', keys: [], keysets: [] }],
    activeKeys: [],
    activeKeysets: [],
    mintUnitProofs: () => [],
  }),
}));

vi.mock('stores/ui', () => {
  uiStoreMock = {
    lockMutex: vi.fn(async () => {}),
    unlockMutex: vi.fn(),
  };
  return { useUiStore: () => uiStoreMock };
});

vi.mock('stores/signer', () => ({ useSignerStore: () => ({ reset: vi.fn(), method: null }) }));
vi.mock('src/js/notify', () => ({
  notifyApiError: vi.fn(),
  notifyError: vi.fn(),
  notifyWarning: vi.fn(),
  notify: vi.fn(),
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('wallet store', () => {
  it('calls wallet.send with selected proofs', async () => {
    const walletStore = useWalletStore();
    const proofs = [
      { secret: 's1', amount: 1, id: 'a', C: 'c1' } as any,
      { secret: 's2', amount: 1, id: 'b', C: 'c2' } as any,
    ];

    walletStore.spendableProofs = vi.fn(() => proofs);
    walletStore.coinSelect = vi.fn(() => proofs);
    walletStore.signP2PKIfNeeded = vi.fn((p: any) => p);
    walletStore.getKeyset = vi.fn(() => 'kid');
    walletStore.keysetCounter = vi.fn(() => 1);
    walletStore.increaseKeysetCounter = vi.fn();

    const wallet = {
      mint: { mintUrl: 'mint' },
      unit: 'sat',
      getFeesForProofs: vi.fn(() => 0),
      send: vi.fn(async (_a: number, _p: any, _opts: any) => ({ keep: [], send: [] })),
    } as any;

    await walletStore.send(proofs, wallet, 1, false, false, DEFAULT_BUCKET_ID);

    expect(wallet.send).toHaveBeenCalledWith(1, proofs, {
      counter: 1,
      keysetId: 'kid',
      proofsWeHave: proofs,
    });
    expect(proofsStoreMock.setReserved).toHaveBeenCalled();
  });

  it('retries redeem until attemptRedeem succeeds', async () => {
    const walletStore = useWalletStore();
    const attempt = vi
      .spyOn(walletStore, 'attemptRedeem')
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await walletStore.redeem('token');

    expect(attempt).toHaveBeenCalledTimes(2);
  });
});
