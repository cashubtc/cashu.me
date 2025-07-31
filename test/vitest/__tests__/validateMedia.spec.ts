import { describe, it, expect } from 'vitest';
import { isTrustedUrl, normalizeYouTube, determineMediaType } from '../../../src/utils/validateMedia';

describe('validateMedia', () => {
  it('accepts trusted schemes', () => {
    expect(isTrustedUrl('https://example.com')).toBe(true);
    expect(isTrustedUrl('ipfs://cid')).toBe(true);
    expect(isTrustedUrl('nostr:foo')).toBe(true);
  });

  it('rejects untrusted schemes', () => {
    expect(isTrustedUrl('http://example.com')).toBe(false);
    expect(isTrustedUrl('ftp://example.com')).toBe(false);
  });

  it('normalizes youtube links', () => {
    const url = 'https://youtu.be/abcd1234efg';
    expect(normalizeYouTube(url)).toBe('https://www.youtube.com/embed/abcd1234efg');
  });

  it('detects media type', () => {
    expect(determineMediaType('https://example.com/video.mp4')).toBe('video');
    expect(determineMediaType('https://example.com/song.mp3')).toBe('audio');
    expect(determineMediaType('https://www.youtube.com/embed/id')).toBe('youtube');
    expect(determineMediaType('https://example.com/image.png')).toBe('image');
  });
});
