import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { NDKEvent, NDKKind, NDKFilter } from "@nostr-dev-kit/ndk";
import {
  useNostrStore,
  fetchNutzapProfile,
  publishNutzapProfile,
} from "./nostr";
import { useP2PKStore } from "./p2pk";
import { useMintsStore } from "./mints";
import { db } from "./dexie";
import { v4 as uuidv4 } from "uuid";
import { notifySuccess } from "src/js/notify";
import { useNdk } from "src/composables/useNdk";

export interface Tier {
  id: string;
  name: string;
  price: number;
  description: string;
  welcomeMessage?: string;
}

const TIER_DEFINITIONS_KIND = 30000;

export async function maybeRepublishNutzapProfile() {
  const nostrStore = useNostrStore();
  await nostrStore.initSignerIfNotSet();
  const ndk = await useNdk();
  if (!ndk) {
    throw new Error(
      "You need to connect a Nostr signer before publishing tiers",
    );
  }
  const current = await fetchNutzapProfile(nostrStore.pubkey);
  const desiredMints = useMintsStore()
    .mints.map((m) => m.url)
    .sort()
    .join(",");
  const desiredP2PK = useP2PKStore().firstKey?.publicKey;

  if (!desiredP2PK) return;

  const hasDiff =
    !current ||
    current.p2pkPubkey !== desiredP2PK ||
    current.trustedMints.sort().join(",") !== desiredMints;

  if (hasDiff) {
    await publishNutzapProfile({
      p2pkPub: desiredP2PK,
      mints: useMintsStore().mints.map((m) => m.url),
      relays: nostrStore.relays,
    });
  }
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
      const ndk = await useNdk();
      const ev = new NDKEvent(ndk);
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
      maybeRepublishNutzapProfile();
    },
    updateTier(id: string, updates: Partial<Tier>) {
      const existing = this.tiers[id];
      if (!existing) return;
      this.tiers[id] = { ...existing, ...updates };
    },
    async addOrUpdateTier(data: Partial<Tier>) {
      if (data.id && this.tiers[data.id]) {
        this.updateTier(data.id, data);
      } else {
        this.addTier(data);
      }
    },
    async saveTier(_tier: Tier) {
      // previously published each tier individually; now no-op for backwards
      // compatibility with existing component logic
    },
    async loadTiersFromNostr(pubkey?: string) {
      const nostr = useNostrStore();
      await nostr.initNdkReadOnly();
      const author = pubkey || this.loggedInNpub || nostr.pubkey;
      if (!author) return;
      const filter: NDKFilter = {
        kinds: [TIER_DEFINITIONS_KIND as unknown as NDKKind],
        authors: [author],
        "#d": ["tiers"],
        limit: 1,
      };
      const ndk = await useNdk();
      const events = await ndk.fetchEvents(filter);
      events.forEach((ev) => {
        try {
          const data: Tier[] = JSON.parse(ev.content);
          const obj: Record<string, Tier> = {};
          data.forEach((t) => {
            obj[t.id] = t;
          });
          this.tiers = obj as any;
        } catch (e) {
          console.error(e);
        }
      });
    },
    async removeTier(id: string) {
      delete this.tiers[id];
      await maybeRepublishNutzapProfile();
    },

    async publishTierDefinitions() {
      const tiersArray = this.getTierArray();
      const nostr = useNostrStore();
      await nostr.initSignerIfNotSet();
      const ndk = await useNdk();
      if (!ndk) {
        throw new Error(
          "You need to connect a Nostr signer before publishing tiers",
        );
      }
      const ev = new NDKEvent(ndk);
      ev.kind = TIER_DEFINITIONS_KIND as unknown as NDKKind;
      ev.tags = [["d", "tiers"]];
      ev.created_at = Math.floor(Date.now() / 1000);
      ev.content = JSON.stringify(tiersArray);
      await ev.sign(nostr.signer);
      await ev.publish();

      await db.creatorsTierDefinitions.put({
        creatorNpub: nostr.pubkey,
        tiers: tiersArray as any,
        eventId: ev.id!,
        updatedAt: ev.created_at!,
      });

      notifySuccess("Tiers published");
    },
    getTierArray(): Tier[] {
      return Object.values(this.tiers);
    },
  },
});
