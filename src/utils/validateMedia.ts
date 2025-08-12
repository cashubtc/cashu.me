import type { TierMedia } from "stores/types";

export function isTrustedUrl(url: string): boolean {
  const cleaned = extractIframeSrc(url);
  return /^(https:\/\/|ipfs:\/\/|nostr:)/i.test(cleaned.trim());
}

export function normalizeYouTube(url: string): string {
  const idMatch = url
    .replace("https://", "")
    .match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))(\w{11})/i
    );
  if (idMatch) {
    return `https://www.youtube.com/embed/${idMatch[1]}`;
  }
  return url;
}

export function ipfsToGateway(url: string): string {
  if (url.trim().toLowerCase().startsWith("ipfs://")) {
    return url.replace(/^ipfs:\/\//i, "https://nftstorage.link/ipfs/");
  }
  return url;
}

export function normalizeNostrEventUrl(url: string): string {
  const match = url
    .trim()
    .match(/^https:\/\/(primal\.net|snort\.social)\/e\/([a-z0-9]+)/i);
  if (match) {
    const [, host, id] = match;
    return `https://${host}/e/${id}?embed=1`;
  }
  return url;
}

export function isNostrEventUrl(url: string): boolean {
  return /^https:\/\/(primal\.net|snort\.social)\/e\/[a-z0-9]+/i.test(
    url.trim()
  );
}

export function extractIframeSrc(input: string): string {
  const match = input.trim().match(/<iframe[^>]*src=['"]([^'"]+)['"][^>]*>/i);
  return match ? match[1].trim() : input.trim();
}

export function normalizeMediaUrl(url: string): string {
  const cleaned = extractIframeSrc(url);
  return normalizeYouTube(ipfsToGateway(normalizeNostrEventUrl(cleaned)));
}

export function determineMediaType(
  url: string
): "youtube" | "video" | "audio" | "image" | "iframe" | "nostr" {
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com/embed/")) {
    return "youtube";
  }
  if (/(\.mp3|\.wav|\.ogg)(\?.*)?$/.test(lower)) {
    return "audio";
  }
  if (/(\.mp4|\.webm|\.mov|\.ogv)(\?.*)?$/.test(lower)) {
    return "video";
  }
  if (/(\.png|\.jpe?g|\.gif|\.svg|\.webp|\.bmp|\.avif)(\?.*)?$/.test(lower)) {
    return "image";
  }
  if (isNostrEventUrl(lower)) {
    return "nostr";
  }
  return "iframe";
}

export function filterValidMedia(media: TierMedia[] = []): TierMedia[] {
  return media
    .map((m) => ({ ...m, url: normalizeMediaUrl(m.url) }))
    .filter((m) => m.url && isTrustedUrl(m.url));
}
