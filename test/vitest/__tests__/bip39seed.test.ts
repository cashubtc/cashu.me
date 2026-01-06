import { test, describe, expect } from 'vitest';
import { mnemonicToSeedSync, validateMnemonic, mnemonicToSeed } from "@scure/bip39";
import { wordlist } from '@scure/bip39/wordlists/english';

describe('mnemonicToSeedSync', () => {
  test('converts same mnemonic consistently', () => {
    const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
    expect(validateMnemonic(mnem, wordlist)).toBeTruthy();
    const seed1 = mnemonicToSeedSync(mnem);
    const seed2 = mnemonicToSeedSync(mnem);
    expect(seed1).toEqual(seed2);
  });
  test('converts same mnemonic consistently sync/async', async () => {
    const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
    expect(validateMnemonic(mnem, wordlist)).toBeTruthy();
    const seed1 = await mnemonicToSeed(mnem);
    const seed2 = mnemonicToSeedSync(mnem);
    expect(seed1).toEqual(seed2);
  });
  test('varies with capitalization', () => {
    const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow'; // [w]inner
    const mNem = 'legal Winner thank year wave sausage worth useful legal winner thank yellow'; // [W]inner
    expect(validateMnemonic(mnem, wordlist)).toBeTruthy();
    expect(validateMnemonic(mNem, wordlist)).toBeFalsy();
    const lowerSeed = mnemonicToSeedSync(mnem);
    const mixedSeed = mnemonicToSeedSync(mNem);
    expect(lowerSeed).not.toEqual(mixedSeed);
  });
  test('fails with extra/missing spacing', () => {
    const mnem1 = 'legal  winner thank year wave sausage worth useful legal winner thank yellow'; // 2 spaces
    const mnem2 = 'legalwinner thank year wave sausage worth useful legal winner thank yellow'; // missing space
    const mnem3 = ' legalwinner thank year wave sausage worth useful legal winner thank yellow '; // untrimmed
    expect(validateMnemonic(mnem1, wordlist)).toBeFalsy();
    expect(validateMnemonic(mnem2, wordlist)).toBeFalsy();
    expect(validateMnemonic(mnem3, wordlist)).toBeFalsy();
    expect(() => mnemonicToSeedSync(mnem1)).toThrow();
    expect(() => mnemonicToSeedSync(mnem2)).toThrow();
    expect(() => mnemonicToSeedSync(mnem3)).toThrow();
  });
  test('converts any words/order does not matter', () => {
    const mnem1 = 'legal thank winner year wave sausage worth useful legal winner yellow thank'; // invalid checksum
    expect(validateMnemonic(mnem1, wordlist)).toBeFalsy();
    expect(() => mnemonicToSeedSync(mnem1)).not.toThrow();
    const mnem2 = 'a b c d e f g h i j k l'; // 12 "words"
    expect(validateMnemonic(mnem2, wordlist)).toBeFalsy();
    expect(() => mnemonicToSeedSync(mnem2)).not.toThrow();
    const mnem3 = 'lega winn than year wave saus wort usef lega winn than yell'; // first 4
    expect(validateMnemonic(mnem3, wordlist)).toBeFalsy();
    expect(() => mnemonicToSeedSync(mnem3)).not.toThrow();
    expect(mnemonicToSeedSync(mnem1)).not.toEqual(mnemonicToSeedSync(mnem3));
  });
});
