import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNostrStore } from "./nostr";

export interface Tier {
  id: string;
  name: string;
  price: number;
  perks: string;
}

export const useCreatorHubStore = defineStore("creatorHub", {
  state: () => ({
    loggedInNpub: useLocalStorage<string>("creatorHub.loggedInNpub", ""),
    tiers: useLocalStorage<Record<string, Tier>>("creatorHub.tiers", {}),
  }),
  actions: {
    async loginWithNip07() {
      const nostr = useNostrStore();
      await nostr.initNip07Signer();
      this.loggedInNpub = nostr.pubkey;
    },
    async loginWithNsec(nsec: string) {
      const nostr = useNostrStore();
      await nostr.initPrivateKeySigner(nsec);
      this.loggedInNpub = nostr.pubkey;
    },
    logout() {
      this.loggedInNpub = "";
    },
    async updateProfile(profile: any) {
      const nostr = useNostrStore();
      await nostr.initSignerIfNotSet();
      const ev = new NDKEvent(nostr.ndk);
      ev.kind = 0;
      ev.content = JSON.stringify(profile);
      await ev.sign(nostr.signer);
      await ev.publish();
    },
    addTier(tier: Partial<Tier>) {
      const id = tier.id || Date.now().toString();
      this.tiers[id] = {
        id,
        name: tier.name || "",
        price: tier.price || 0,
        perks: tier.perks || "",
      } as Tier;
    },
    removeTier(id: string) {
      delete this.tiers[id];
    },
    getTierArray(): Tier[] {
      return Object.values(this.tiers);
    },
  },
});
