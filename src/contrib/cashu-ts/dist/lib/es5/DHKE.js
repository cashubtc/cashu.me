"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructProofs = exports.unblindSignature = exports.blindMessage = exports.hashToCurve = exports.pointFromHex = void 0;
var secp256k1_1 = require("@noble/curves/secp256k1");
var utils_js_1 = require("./utils.js");
var sha256_1 = require("@noble/hashes/sha256");
var utils_1 = require("@noble/curves/abstract/utils");
var buffer_1 = require("buffer/");
var DOMAIN_SEPARATOR = (0, utils_1.hexToBytes)('536563703235366b315f48617368546f43757276655f43617368755f');
function hashToCurve(secret) {
    var msgToHash = (0, sha256_1.sha256)(buffer_1.Buffer.concat([DOMAIN_SEPARATOR, secret]));
    var counter = new Uint32Array(1);
    var maxIterations = Math.pow(2, 16);
    for (var i = 0; i < maxIterations; i++) {
        var counterBytes = new Uint8Array(counter.buffer);
        var hash = (0, sha256_1.sha256)(buffer_1.Buffer.concat([msgToHash, counterBytes]));
        try {
            return pointFromHex((0, utils_1.bytesToHex)(buffer_1.Buffer.concat([new Uint8Array([0x02]), hash])));
        }
        catch (error) {
            counter[0]++;
        }
    }
    throw new Error('No valid point found');
}
exports.hashToCurve = hashToCurve;
function pointFromHex(hex) {
    return secp256k1_1.secp256k1.ProjectivePoint.fromHex(hex);
}
exports.pointFromHex = pointFromHex;
/* export function h2cToPoint(h2c: H2CPoint<bigint>): ProjPointType<bigint> {
    return secp256k1.ProjectivePoint.fromAffine(h2c.toAffine());
} */
function blindMessage(secret, r) {
    var Y = hashToCurve(secret);
    if (!r) {
        r = (0, utils_js_1.bytesToNumber)(secp256k1_1.secp256k1.utils.randomPrivateKey());
    }
    var rG = secp256k1_1.secp256k1.ProjectivePoint.BASE.multiply(r);
    var B_ = Y.add(rG);
    return { B_: B_, r: r };
}
exports.blindMessage = blindMessage;
function unblindSignature(C_, r, A) {
    var C = C_.subtract(A.multiply(r));
    return C;
}
exports.unblindSignature = unblindSignature;
function constructProofs(promises, rs, secrets, keyset) {
    return promises.map(function (p, i) {
        var C_ = pointFromHex(p.C_);
        var A = pointFromHex(keyset.keys[p.amount]);
        var C = unblindSignature(C_, rs[i], A);
        var proof = {
            id: p.id,
            amount: p.amount,
            secret: new TextDecoder().decode(secrets[i]),
            C: C.toHex(true)
        };
        return proof;
    });
}
exports.constructProofs = constructProofs;
