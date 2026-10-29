// A mint's /v1/info contact list, cleaned up for display: the mint details page shows one
// copy row per entry that has something to copy (an entry with an empty `info` drew an icon
// and a copy button for nothing, owner 2026-10-29, item 8).

export type DisplayContact = { method: string; info: string };

// Accepts the NUT-06 `{ method, info }` objects and the legacy `[method, info]` tuples; drops
// entries whose method or info is missing, blank or not a string. Never mutates the input.
export function displayContacts(contact: unknown): DisplayContact[] {
  if (!Array.isArray(contact)) return [];
  const result: DisplayContact[] = [];
  for (const entry of contact) {
    let method: unknown;
    let info: unknown;
    if (Array.isArray(entry)) {
      [method, info] = entry;
    } else if (entry && typeof entry === "object") {
      ({ method, info } = entry as { method?: unknown; info?: unknown });
    }
    if (typeof method !== "string" || typeof info !== "string") continue;
    const m = method.trim();
    const i = info.trim();
    if (m && i) result.push({ method: m, info: i });
  }
  return result;
}

// Long keys (npub…) keep their start and end, so a reader can still match them by eye.
export function shortenMiddle(value: string, head = 10, tail = 6): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}
