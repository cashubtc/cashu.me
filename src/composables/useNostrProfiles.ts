import { reactive } from "vue";
import type { NDKUserProfile as Profile } from "@nostr-dev-kit/ndk";
import profileCache from "src/js/profile-cache";
import { useNostrStore } from "stores/nostr";

const LOCAL_TTL = 24 * 60 * 60 * 1000;
const STORAGE_PREFIX = "nostr-profile:";

const profiles = reactive(new Map<string, Profile>());
const pending = new Map<string, Promise<void>>();

function save(npub: string, profile: Profile) {
  profiles.set(npub, profile);
  profileCache.set(npub, profile);
  try {
    localStorage.setItem(
      STORAGE_PREFIX + npub,
      JSON.stringify({ profile, timestamp: Date.now() }),
    );
  } catch (e) {
    console.error(e);
  }
}

function load(npub: string): Profile | undefined {
  const existing = profiles.get(npub);
  if (existing) return existing;

  const cached = profileCache.get(npub);
  if (cached) {
    profiles.set(npub, cached);
    return cached;
  }

  const raw = localStorage.getItem(STORAGE_PREFIX + npub);
  if (!raw) return undefined;
  try {
    const { profile, timestamp } = JSON.parse(raw) as {
      profile: Profile;
      timestamp: number;
    };
    if (Date.now() - timestamp > LOCAL_TTL) {
      localStorage.removeItem(STORAGE_PREFIX + npub);
      return undefined;
    }
    profiles.set(npub, profile);
    profileCache.set(npub, profile);
    return profile;
  } catch (e) {
    console.error(e);
    localStorage.removeItem(STORAGE_PREFIX + npub);
    return undefined;
  }
}

async function fetchAndCache(npub: string) {
  try {
    const nostr = useNostrStore();
    const profile = (await nostr.getProfile(npub)) as Profile | null;
    if (profile) save(npub, profile);
    else save(npub, {} as Profile);
  } catch (e) {
    console.error("Failed to fetch profile", e);
  }
}

function ensure(npub: string) {
  if (load(npub)) return;
  if (pending.has(npub)) return;
  const p = fetchAndCache(npub).finally(() => pending.delete(npub));
  pending.set(npub, p);
}

function get(npub: string): Profile | undefined {
  ensure(npub);
  return profiles.get(npub);
}

export function useNostrProfiles() {
  return {
    get,
  };
}

export type { Profile };
