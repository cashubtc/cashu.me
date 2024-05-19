import { secp256k1 } from '@noble/curves/secp256k1';
import { bytesToNumber } from './utils.js';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/curves/abstract/utils';
import { Buffer } from 'buffer/';
var DOMAIN_SEPARATOR = hexToBytes('536563703235366b315f48617368546f43757276655f43617368755f');
function hashToCurve(secret) {
    var msgToHash = sha256(Buffer.concat([DOMAIN_SEPARATOR, secret]));
    var counter = new Uint32Array(1);
    var maxIterations = Math.pow(2, 16);
    for (var i = 0; i < maxIterations; i++) {
        var counterBytes = new Uint8Array(counter.buffer);
        var hash = sha256(Buffer.concat([msgToHash, counterBytes]));
        try {
            return pointFromHex(bytesToHex(Buffer.concat([new Uint8Array([0x02]), hash])));
        }
        catch (error) {
            counter[0]++;
        }
    }
    throw new Error('No valid point found');
}
export function pointFromHex(hex) {
    return secp256k1.ProjectivePoint.fromHex(hex);
}
/* export function h2cToPoint(h2c: H2CPoint<bigint>): ProjPointType<bigint> {
    return secp256k1.ProjectivePoint.fromAffine(h2c.toAffine());
} */
function blindMessage(secret, r) {
    var Y = hashToCurve(secret);
    if (!r) {
        r = bytesToNumber(secp256k1.utils.randomPrivateKey());
    }
    var rG = secp256k1.ProjectivePoint.BASE.multiply(r);
    var B_ = Y.add(rG);
    return { B_: B_, r: r };
}
function unblindSignature(C_, r, A) {
    var C = C_.subtract(A.multiply(r));
    return C;
}
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
export { hashToCurve, blindMessage, unblindSignature, constructProofs };
//# sourceMappingURL=DHKE.js.map