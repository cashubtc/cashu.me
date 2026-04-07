import { defineStore } from "pinia";
import NDK, {
  NDKEvent,
  NDKSigner,
  NDKNip07Signer,
  NDKNip46Signer,
  NDKFilter,
  NDKPrivateKeySigner,
  NostrEvent,
  NDKKind,
  NDKRelaySet,
  NDKRelay,
  NDKTag,
  ProfilePointer,
} from "@nostr-dev-kit/ndk";
import NDKCashuWallet from "@nostr-dev-kit/ndk-wallet";

import { nip04, nip19, nip44 } from "nostr-tools";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils"; // already an installed dependency
import { useWalletStore } from "./wallet";
import { generateSecretKey, getPublicKey } from "nostr-tools";
import { useLocalStorage } from "@vueuse/core";
import { useSettingsStore } from "./settings";
import { useReceiveTokensStore } from "./receiveTokensStore";
import { Token } from "@cashu/cashu-ts";
import { useTokensStore } from "./tokens";
import {
  notifyApiError,
  notifyError,
  notifySuccess,
  notifyWarning,
  notify,
} from "../js/notify";
import { useSendTokensStore } from "./sendTokensStore";
import { usePRStore } from "./payment-request";
import token from "../js/token";
import { useNostrStore } from "./nostr";
import { useMintsStore } from "./mints";

export const useNip60Store = defineStore("nip60", {
  state: () => ({
    connected: false,
    nip60Enabled: useLocalStorage<boolean>("cashu.nip60.enabled", false),
    pubkey: useLocalStorage<string>("cashu.nip60.pubkey", ""),
    relays: useSettingsStore().defaultNostrRelays,
    ndk: {} as NDK,
  }),
  getters: {},
  actions: {
    createNip60Wallet: async function (unit: string) {
      const mintsStore = useMintsStore();
      const mintUrls = mintsStore.mints.map((m) => m.url);
      const nostrStore = useNostrStore();
      await nostrStore.walletSeedGenerateKeyPair();
      const walletSigner = nostrStore.seedSigner;
      const ndk = new NDK({
        explicitRelayUrls: nostrStore.relays,
        signer: walletSigner,
      });
      const wallet = NDKCashuWallet.create(
        ndk,
        unit,
        mintUrls,
        nostrStore.relays
      );
    },
  },
});
