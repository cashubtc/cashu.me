import { HDKey } from '@scure/bip32';
import { generateMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { encodeBase64toUint8 } from './base64';
import { bytesToNumber } from './utils';
import { hexToNumber } from '@noble/curves/abstract/utils';
var STANDARD_DERIVATION_PATH = "m/129372'/0'";
var DerivationType;
(function (DerivationType) {
    DerivationType[DerivationType["SECRET"] = 0] = "SECRET";
    DerivationType[DerivationType["BLINDING_FACTOR"] = 1] = "BLINDING_FACTOR";
})(DerivationType || (DerivationType = {}));
export var generateNewMnemonic = function () {
    var mnemonic = generateMnemonic(wordlist, 128);
    return mnemonic;
};
export var deriveSeedFromMnemonic = function (mnemonic) {
    var seed = mnemonicToSeedSync(mnemonic);
    return seed;
};
export var deriveSecret = function (seed, keysetId, counter) {
    return derive(seed, keysetId, counter, DerivationType.SECRET);
};
export var deriveBlindingFactor = function (seed, keysetId, counter) {
    return derive(seed, keysetId, counter, DerivationType.BLINDING_FACTOR);
};
var derive = function (seed, keysetId, counter, secretOrBlinding) {
    var hdkey = HDKey.fromMasterSeed(seed);
    var keysetIdInt = getKeysetIdInt(keysetId);
    var derivationPath = "".concat(STANDARD_DERIVATION_PATH, "/").concat(keysetIdInt, "'/").concat(counter, "'/").concat(secretOrBlinding);
    var derived = hdkey.derive(derivationPath);
    if (derived.privateKey === null) {
        throw new Error('Could not derive private key');
    }
    return derived.privateKey;
};
var getKeysetIdInt = function (keysetId) {
    var keysetIdInt;
    if (/^[a-fA-F0-9]+$/.test(keysetId)) {
        keysetIdInt = hexToNumber(keysetId) % BigInt(Math.pow(2, 31) - 1);
    }
    else {
        //legacy keyset compatibility
        keysetIdInt = bytesToNumber(encodeBase64toUint8(keysetId)) % BigInt(Math.pow(2, 31) - 1);
    }
    return keysetIdInt;
};
//# sourceMappingURL=secrets.js.map