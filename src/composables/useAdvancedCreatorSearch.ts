import { ref } from 'vue';
import { SimplePool, nip19 } from 'nostr-tools';
import { DEFAULT_RELAYS } from 'src/config/relays';

export interface ProfileResult {
  pubkey: string;
  name?: string;
  nip05?: string;
  picture?: string;
  about?: string;
  lud16?: string;
}

export function useAdvancedCreatorSearch() {
  const results = ref<ProfileResult[]>([]);
  const loading = ref(false);
  const status = ref('');
  let currentAbort: AbortController | null = null;

  const FALLBACK_RELAYS = DEFAULT_RELAYS;
  let storedRelays: string[] = [];
  try {
    const stored = window.localStorage.getItem('cashu.settings.defaultNostrRelays');
    storedRelays = JSON.parse(stored ?? '[]');
    if (!Array.isArray(storedRelays)) storedRelays = [];
  } catch {
    storedRelays = [];
  }
  const RELAYS = Array.from(new Set([...storedRelays, ...FALLBACK_RELAYS]));
  const pool = new SimplePool({ eoseSubTimeout: 8000 });

  function fetchWithTimeout(resource: string, options: any = {}) {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const p = fetch(resource, { ...options, signal: controller.signal });
    p.finally(() => clearTimeout(id));
    return p;
  }

  function fetchEventsFromRelays(relays: string[], filter: any, signal: AbortSignal, timeout = 7000): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (signal.aborted) return reject(new DOMException('Aborted', 'AbortError'));
      const events: any[] = [];
      const sub = pool.sub([...new Set(relays)], [filter]);
      const cleanup = () => {
        try { sub.unsub(); } catch {}
        signal.removeEventListener('abort', onAbort);
        clearTimeout(tid);
      };
      const onAbort = () => { cleanup(); reject(new DOMException('Aborted','AbortError')); };
      signal.addEventListener('abort', onAbort);
      const tid = setTimeout(() => { cleanup(); resolve(events); }, timeout);
      sub.on('event', (e: any) => { events.push(e); });
    });
  }

  async function fetchProfilesFromRelays(relays: string[], filter: any, signal: AbortSignal): Promise<ProfileResult[]> {
    const events = await fetchEventsFromRelays(relays, filter, signal);
    const map = new Map<string, ProfileResult & {event:any}>();
    events.forEach(ev => {
      if (ev.kind === 0) {
        try {
          const content = JSON.parse(ev.content);
          const existing = map.get(ev.pubkey);
          if (!existing || ev.created_at > (existing as any).event.created_at) {
            map.set(ev.pubkey, {
              pubkey: ev.pubkey,
              name: content.name || content.display_name || content.username || '',
              nip05: content.nip05 || '',
              picture: content.picture || '',
              about: content.about || '',
              lud16: content.lud16 || '',
              event: ev,
            });
          }
        } catch { /* ignore */ }
      }
    });
    return Array.from(map.values()).map(({event, ...rest}) => rest);
  }

  async function resolveNip05(nip05: string, signal: AbortSignal): Promise<{pubkey:string}|null> {
    const match = nip05.match(/^([a-zA-Z0-9_.-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/);
    if (!match) return null;
    const [, localPart, domain] = match;
    try {
      const url = `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(localPart)}`;
      const resp = await fetchWithTimeout(url, { signal });
      if (!resp.ok) return null;
      const data = await resp.json();
      if (data.names && data.names[localPart]) return { pubkey: data.names[localPart] };
    } catch (e:any) {
      if (e.name !== 'AbortError') console.error('nip05 resolve failed', e);
    }
    return null;
  }

  async function fetchProfileFromIndexer(pubkey: string, signal: AbortSignal): Promise<ProfileResult | null> {
    try {
      const resp = await fetchWithTimeout(`https://api.nostr.band/v0/profile?pubkey=${pubkey}`, { signal });
      if (!resp.ok) return null;
      const data = await resp.json();
      if (data && data.profile) {
        const c = JSON.parse(data.profile.content);
        return {
          pubkey: data.profile.pubkey,
          name: c.name || c.display_name || c.username || '',
          nip05: c.nip05 || '',
          picture: c.picture || '',
          about: c.about || '',
          lud16: c.lud16 || '',
        };
      }
    } catch (e:any) {
      if (e.name !== 'AbortError') console.error('nostr.band API error', e);
    }
    return null;
  }

  async function fetchProfileFromPrimal(pubkey: string, signal: AbortSignal): Promise<ProfileResult | null> {
    try {
      const primalUrl = `https://primal-cache.snort.social/api/v1/eose/user/profile/${pubkey}`;
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(primalUrl)}`;
      const resp = await fetchWithTimeout(proxyUrl, { signal });
      if (!resp.ok) return null;
      const data = await resp.json();
      if (data && data[0] && data[0].content) {
        const c = JSON.parse(data[0].content);
        return {
          pubkey: data[0].pubkey,
          name: c.name || c.display_name || c.username || '',
          nip05: c.nip05 || '',
          picture: c.picture || '',
          about: c.about || '',
          lud16: c.lud16 || '',
        };
      }
    } catch (e:any) {
      if (e.name !== 'AbortError') console.error('Primal API error', e);
    }
    return null;
  }

  async function findProfileByPubkey(pubkey: string, signal: AbortSignal): Promise<ProfileResult | null> {
    let profiles = await fetchProfilesFromRelays(RELAYS, { kinds:[0], authors:[pubkey] }, signal);
    if (signal.aborted) return null;
    if (profiles.length) return profiles[0];
    const idx = await fetchProfileFromIndexer(pubkey, signal);
    if (signal.aborted) return null;
    if (idx) return idx;
    return await fetchProfileFromPrimal(pubkey, signal);
  }

  async function search(query: string) {
    const clean = query.trim();
    results.value = [];
    status.value = '';
    if (currentAbort) currentAbort.abort();
    if (!clean) return;
    const controller = new AbortController();
    currentAbort = controller;
    loading.value = true;
    try {
      let pubkey: string | null = null;
      if (clean.startsWith('npub1')) {
        try { const dec = nip19.decode(clean); pubkey = typeof dec.data === 'string' ? dec.data : null; } catch {}
      } else if (clean.length === 64 && /^[0-9a-fA-F]+$/.test(clean)) {
        pubkey = clean.toLowerCase();
      } else if (/^([a-zA-Z0-9_.-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(clean)) {
        status.value = 'Resolving NIP-05...';
        const res = await resolveNip05(clean, controller.signal);
        if (res) pubkey = res.pubkey;
      }
      if (pubkey) {
        const profile = await findProfileByPubkey(pubkey, controller.signal);
        if (profile) results.value = [profile];
        return;
      }
      status.value = `Searching relays for "${clean}"...`;
      const filter = { kinds:[0], search: clean, limit:25 } as any;
      const profs = await fetchProfilesFromRelays(RELAYS, filter, controller.signal);
      results.value = profs;
    } finally {
      loading.value = false;
    }
  }

  return { results, loading, status, search };
}
