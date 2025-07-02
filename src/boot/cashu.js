import { boot } from "quasar/wrappers";
import { Notify } from "quasar";
import { useWalletStore } from "src/stores/wallet";
import { useMintsStore } from "src/stores/mints";
import { verifyMint } from "./mint-info";

export default boot(async () => {
  const walletStore = useWalletStore();
  const wallet = walletStore.wallet;
  const mints = useMintsStore();
  if (mints.activeMintUrl) {
    const ok = await verifyMint(mints.activeMintUrl);
    if (!ok) {
      Notify.create({
        type: "negative",
        message:
          "Selected mint lacks conditional‑secret support (NUT‑10/11/14)",
      });
      throw new Error("Unsupported mint");
    }
  }
  if (typeof wallet.initKeys === "function") {
    await wallet.initKeys();
  }
});
