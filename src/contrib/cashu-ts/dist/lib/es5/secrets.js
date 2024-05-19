"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveBlindingFactor = exports.deriveSecret = exports.deriveSeedFromMnemonic = exports.generateNewMnemonic = void 0;
var bip32_1 = require("@scure/bip32");
var bip39_1 = require("@scure/bip39");
var english_1 = require("@scure/bip39/wordlists/english");
var base64_1 = require("./base64");
var utils_1 = require("./utils");
var utils_2 = require("@noble/curves/abstract/utils");
var STANDARD_DERIVATION_PATH = "m/129372'/0'";
var DerivationType;
(function (DerivationType) {
    DerivationType[DerivationType["SECRET"] = 0] = "SECRET";
    DerivationType[DerivationType["BLINDING_FACTOR"] = 1] = "BLINDING_FACTOR";
})(DerivationType || (DerivationType = {}));
var generateNewMnemonic = function () {
    var mnemonic = (0, bip39_1.generateMnemonic)(english_1.wordlist, 128);
    return mnemonic;
};
exports.generateNewMnemonic = generateNewMnemonic;
var deriveSeedFromMnemonic = function (mnemonic) {
    var seed = (0, bip39_1.mnemonicToSeedSync)(mnemonic);
    return seed;
};
exports.deriveSeedFromMnemonic = deriveSeedFromMnemonic;
var deriveSecret = function (seed, keysetId, counter) {
    return derive(seed, keysetId, counter, DerivationType.SECRET);
};
exports.deriveSecret = deriveSecret;
var deriveBlindingFactor = function (seed, keysetId, counter) {
    return derive(seed, keysetId, counter, DerivationType.BLINDING_FACTOR);
};
exports.deriveBlindingFactor = deriveBlindingFactor;
var derive = function (seed, keysetId, counter, secretOrBlinding) {
    var hdkey = bip32_1.HDKey.fromMasterSeed(seed);
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
        keysetIdInt = (0, utils_2.hexToNumber)(keysetId) % BigInt(Math.pow(2, 31) - 1);
    }
    else {
        //legacy keyset compatibility
        keysetIdInt = (0, utils_1.bytesToNumber)((0, base64_1.encodeBase64toUint8)(keysetId)) % BigInt(Math.pow(2, 31) - 1);
    }
    return keysetIdInt;
};
