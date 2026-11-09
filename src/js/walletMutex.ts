export const WALLET_MUTEX_NAME = "cashu:wallet:mutex";

export type ReleaseWalletLock = () => Promise<void>;

export function requestWalletLock(): Promise<ReleaseWalletLock> | undefined {
  const locks = globalThis.navigator?.locks;
  if (typeof locks?.request !== "function") return;

  return new Promise<ReleaseWalletLock>((resolve, reject) => {
    let release!: () => void;
    const held = new Promise<void>((resolveHeld) => {
      release = resolveHeld;
    });
    const request = locks.request(
      WALLET_MUTEX_NAME,
      { mode: "exclusive" },
      () => {
        // Keep the browser callback alive until the existing mutex is unlocked.
        resolve(async () => {
          release();
          await request;
        });
        return held;
      }
    );
    void request.catch(reject);
  });
}
