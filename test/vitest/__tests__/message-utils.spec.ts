import { describe, it, expect } from 'vitest';
import {
  sanitizeMessage,
  createFormattedTokenMessage,
  parseFormattedTokenMessage,
} from '../../../src/js/message-utils';

describe('sanitizeMessage', () => {
  it('removes non printable characters', () => {
    const result = sanitizeMessage('hi\u0007there');
    expect(result).toBe('hithere');
  });

  it('truncates to max length', () => {
    const result = sanitizeMessage('abcdef', 3);
    expect(result).toBe('abc');
  });
});

describe('formatted token message', () => {
  it('round trips data', () => {
    const msg = createFormattedTokenMessage('tok', 2, 'm', 10);
    const parsed = parseFormattedTokenMessage(msg);
    expect(parsed).toEqual({ token: 'tok', amount: 2, memo: 'm', unlockTime: 10 });
  });

  it('returns null without delimiters', () => {
    expect(parseFormattedTokenMessage('foo')).toBeNull();
  });
});
