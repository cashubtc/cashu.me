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

export function normalizeMediaUrl(url: string): string {
  return normalizeYouTube(url.trim());
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
