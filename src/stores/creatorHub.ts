import { defineStore } from "pinia";
import { toRaw } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { NDKEvent, NDKKind, NDKFilter } from "@nostr-dev-kit/ndk";
import {
  useNostrStore,
  fetchNutzapProfile,
  publishNutzapProfile,
  ensureRelayConnectivity,
  RelayConnectionError,
} from "./nostr";
import { useP2PKStore } from "./p2pk";
import { useCreatorProfileStore } from "./creatorProfile";
import { db } from "./dexie";
import { v4 as uuidv4 } from "uuid";
import { notifySuccess, notifyError } from "src/js/notify";
import { filterValidMedia } from "src/utils/validateMedia";
import { useNdk } from "src/composables/useNdk";
import type { Tier, TierMedia } from "./types";
import { frequencyToDays } from "src/constants/subscriptionFrequency";

const TIER_DEFINITIONS_KIND = 30000;

export async function maybeRepublishNutzapProfile() {
  const nostrStore = useNostrStore();
  await nostrStore.initSignerIfNotSet();
  if (!nostrStore.signer) {
    throw new Error(
      "No Nostr signer available. Unlock or connect a signer add-on (Nos2x/Alby) first.",
    );
  }
  const ndk = await useNdk();
  if (!ndk) {
    throw new Error(
      "You need to connect a Nostr signer before publishing tiers",
    );
  }
  let current = null;
  try {
    current = await fetchNutzapProfile(nostrStore.pubkey);
  } catch (e: any) {
    if (e instanceof RelayConnectionError) {
      notifyError("Unable to connect to Nostr relays");
      return;
    }
    throw e;
  }
  const profileStore = useCreatorProfileStore();
  const desiredMints = profileStore.mints.sort().join(",");
  const desiredP2PK = useP2PKStore().firstKey?.publicKey;

  if (!desiredP2PK) return;

  const hasDiff =
    !current ||
    current.p2pkPubkey !== desiredP2PK ||
    current.trustedMints.sort().join(",") !== desiredMints;

  if (hasDiff) {
    await publishNutzapProfile({
      p2pkPub: desiredP2PK,
      mints: [...profileStore.mints],
      relays: [...profileStore.relays],
    });
  }
}

export const useCreatorHubStore = defineStore("creatorHub", {
  state: () => ({
    loggedInNpub: useLocalStorage<string>("creatorHub.loggedInNpub", ""),
    tiers: useLocalStorage<Record<string, Tier>>("creatorHub.tiers", {}),
    tierOrder: useLocalStorage<string[]>("creatorHub.tierOrder", []),
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
      await ev.sign(nostr.signer as any);
      try {
        await ensureRelayConnectivity(ndk);
        await ev.publish();
      } catch (e: any) {
        notifyError(e?.message ?? String(e));
        throw e;
      }
    },
    addTier(tier: Partial<Tier> & { price?: number; perks?: string }) {
      let id = tier.id || uuidv4();
      while (this.tiers[id]) {
        id = uuidv4();
      }
      const newTier: Tier = {
        id,
        name: tier.name || "",
        price_sats:
          (tier as any).price_sats ?? (tier as any).price ?? 0,
        description: (tier as any).description || "",
        frequency: (tier as any).frequency || 'monthly',
        intervalDays: tier.intervalDays ??
          frequencyToDays(((tier as any).frequency || 'monthly') as any),
        welcomeMessage: tier.welcomeMessage || "",
        ...(tier.benefits || (tier as any).perks
          ? { benefits: tier.benefits || [(tier as any).perks] }
          : {}),
        media: tier.media ? filterValidMedia(tier.media as TierMedia[]) : [],
      };
      this.tiers[id] = newTier;
      if (!this.tierOrder.includes(id)) {
        this.tierOrder.push(id);
      }
      maybeRepublishNutzapProfile();
    },
    updateTier(id: string, updates: Partial<Tier> & { price?: number; perks?: string }) {
      const existing = this.tiers[id];
      if (!existing) return;
      this.tiers[id] = {
        ...existing,
        ...updates,
        ...(updates.frequency !== undefined
          ? { frequency: updates.frequency,
              intervalDays: frequencyToDays(updates.frequency as any) }
          : updates.intervalDays !== undefined
          ? { intervalDays: updates.intervalDays }
          : {}),
        ...(updates.price_sats === undefined && updates.price !== undefined
          ? { price_sats: updates.price }
          : {}),
        ...(updates.benefits === undefined && (updates as any).perks
          ? { benefits: [(updates as any).perks] }
          : {}),
        media: updates.media
          ? filterValidMedia(updates.media as TierMedia[])
          : existing.media,
      };
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
          const raw: any[] = JSON.parse(ev.content);
          const obj: Record<string, Tier> = {};
          raw.forEach((t) => {
            const tier: Tier = {
              ...t,
              price_sats: t.price_sats ?? t.price ?? 0,
              ...(t.perks && !t.benefits ? { benefits: [t.perks] } : {}),
              media: t.media ? filterValidMedia(t.media) : [],
            };
            obj[tier.id] = tier;
          });
          this.tiers = obj as any;
          this.tierOrder = raw.map((t) => t.id);
        } catch (e) {
          console.error(e);
        }
      });
    },
    async removeTier(id: string) {
      delete this.tiers[id];
      this.tierOrder = this.tierOrder.filter((t) => t !== id);
      await maybeRepublishNutzapProfile();
    },

    async publishTierDefinitions() {
      const tiersArray = this.getTierArray().map((t) => ({
        ...toRaw(t),
        price: t.price_sats,
        media: t.media ? filterValidMedia(t.media) : [],
      }));
      const nostr = useNostrStore();

      if (!nostr.signer) {
        throw new Error("Signer required to publish tier definitions");
      }

      const ndk = await useNdk();
      if (!ndk) {
        throw new Error("NDK not initialised – cannot publish tiers");
      }

      const ev = new NDKEvent(ndk);
      ev.kind = TIER_DEFINITIONS_KIND as unknown as NDKKind;
      ev.tags = [["d", "tiers"]];
      ev.created_at = Math.floor(Date.now() / 1000);
      ev.content = JSON.stringify(tiersArray);
      await ev.sign(nostr.signer as any);
      try {
        await ensureRelayConnectivity(ndk);
        await ev.publish();
      } catch (e: any) {
        notifyError(e?.message ?? String(e));
        throw e;
      }

      await db.creatorsTierDefinitions.put({
        creatorNpub: nostr.pubkey,
        tiers: tiersArray as any,
        eventId: ev.id!,
        updatedAt: ev.created_at!,
        rawEventJson: JSON.stringify(ev.rawEvent()),
      });

      notifySuccess("Tiers published");
    },
    setTierOrder(order: string[]) {
      this.tierOrder = [...order];
    },
    getTierArray(): Tier[] {
      if (!this.tierOrder.length) {
        return Object.values(this.tiers);
      }
      return this.tierOrder
        .map((id) => this.tiers[id])
        .filter((t): t is Tier => !!t);
    },
  },
});
