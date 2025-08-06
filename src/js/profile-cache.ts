interface CachedProfile {
  profile: any;
  timestamp: number;
}

// cache entries are considered stale after 10 minutes
const CACHE_TTL = 10 * 60 * 1000;
const cache = new Map<string, CachedProfile>();

function get(pk: string): any | null {
  const entry = cache.get(pk);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(pk);
    return null;
  }
  return entry.profile;
}

function set(pk: string, profile: any): void {
  cache.set(pk, { profile, timestamp: Date.now() });
}

export default { get, set };
