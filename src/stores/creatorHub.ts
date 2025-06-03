import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { STORAGE_KEYS } from "../js/storageKeys";
import { NDKEvent, NDKKind, NDKFilter } from "@nostr-dev-kit/ndk";
import { useNostrStore } from "./nostr";
import { v4 as uuidv4 } from "uuid";
import { notifySuccess } from "src/js/ui-utils";

export interface Tier {
  id: string;
  name: string;
  price: number;
  description: string;
  welcomeMessage?: string;
}

const CREATOR_TIER_KIND = 38100;

export const useCreatorHubStore = defineStore("creatorHub", {
  state: () => ({
    loggedInNpub: useLocalStorage<string>(
      STORAGE_KEYS.CREATOR_HUB_LOGGED_IN_NPUB,
      ""
    ),
    tiers: useLocalStorage<Record<string, Tier>>(STORAGE_KEYS.CREATOR_HUB_TIERS, {}),
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
      let id = tier.id || uuidv4();
      while (this.tiers[id]) {
        id = uuidv4();
      }
      const newTier: Tier = {
        id,
        name: tier.name || "",
        price: tier.price || 0,
        description: (tier as any).description || (tier as any).perks || "",
        welcomeMessage: tier.welcomeMessage || "",
      };
      this.tiers[id] = newTier;
      this.saveTier(newTier);
    },
    updateTier(id: string, updates: Partial<Tier>) {
      const existing = this.tiers[id];
      if (!existing) return;
      this.tiers[id] = { ...existing, ...updates };
      this.saveTier(this.tiers[id]);
    },
    async saveTier(tier: Tier) {
      const nostr = useNostrStore();
      await nostr.initSignerIfNotSet();
      const ev = new NDKEvent(nostr.ndk);
      ev.kind = CREATOR_TIER_KIND as unknown as NDKKind;
      ev.tags = [["d", tier.id]];
      ev.content = JSON.stringify(tier);
      await ev.sign(nostr.signer);
      await ev.publish();
      notifySuccess("Tier saved");
    },
    async loadTiersFromNostr(pubkey?: string) {
      const nostr = useNostrStore();
      await nostr.initNdkReadOnly();
      const author = pubkey || this.loggedInNpub || nostr.pubkey;
      if (!author) return;
      const filter: NDKFilter = {
        kinds: [CREATOR_TIER_KIND as unknown as NDKKind],
        authors: [author],
        limit: 200,
      };
      const events = await nostr.ndk.fetchEvents(filter);
      events.forEach((ev) => {
        try {
          const data = JSON.parse(ev.content) as any;
          const id = data.id || (ev.tagValue("d") as string) || ev.id;
          const tier: Tier = {
            id,
            name: data.name || "",
            price: data.price || 0,
            description: data.description || data.perks || "",
            welcomeMessage: data.welcomeMessage || "",
          };
          this.tiers[id] = tier;
        } catch (e) {
          console.error(e);
        }
      });
    },
    async removeTier(id: string) {
      delete this.tiers[id];

      const nostr = useNostrStore();
      await nostr.initSignerIfNotSet();
      const ev = new NDKEvent(nostr.ndk);
      ev.kind = CREATOR_TIER_KIND as unknown as NDKKind;
      ev.tags = [["d", id]];
      ev.content = "";
      await ev.sign(nostr.signer);
      await ev.publish();
    },
    getTierArray(): Tier[] {
      return Object.values(this.tiers);
    },
  },
});
