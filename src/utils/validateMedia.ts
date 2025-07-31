import type { TierMedia } from 'stores/types';

export function isTrustedUrl(url: string): boolean {
  return /^(https:\/\/|ipfs:\/\/|nostr:)/i.test(url.trim());
}

export function normalizeYouTube(url: string): string {
  const idMatch = url
    .replace('https://', '')
    .match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))(\w{11})/i);
  if (idMatch) {
    return `https://www.youtube.com/embed/${idMatch[1]}`;
  }
  return url;
}

export function ipfsToGateway(url: string): string {
  if (url.trim().toLowerCase().startsWith('ipfs://')) {
    return url.replace(/^ipfs:\/\//i, 'https://nftstorage.link/ipfs/');
  }
  return url;
}

export function normalizeMediaUrl(url: string): string {
  return normalizeYouTube(ipfsToGateway(url.trim()));
}

export function determineMediaType(url: string): 'youtube' | 'video' | 'audio' | 'image' {
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com/embed/')) {
    return 'youtube';
  }
  if (/(\.mp3|\.wav|\.ogg)(\?.*)?$/.test(lower)) {
    return 'audio';
  }
  if (/(\.mp4|\.webm|\.mov|\.ogv)(\?.*)?$/.test(lower)) {
    return 'video';
  }
  return 'image';
}

export function filterValidMedia(media: TierMedia[] = []): TierMedia[] {
  return media
    .filter((m) => m.url && isTrustedUrl(m.url))
    .map((m) => ({ ...m, url: normalizeMediaUrl(m.url) }));
}
