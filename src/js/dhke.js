import { uint8ToBase64 } from "./base64";
import { bytesToNumber } from "./utils";
// import * as nobleSecp256k1 from "./noble-secp256k1";
import * as nobleSecp256k1 from "@noble/secp256k1";
console.log(nobleSecp256k1.utils);

async function hashToCurve(secretMessage) {
  let point;
  while (!point) {
    const hash = await nobleSecp256k1.utils.sha256(secretMessage);
    const hashHex = nobleSecp256k1.utils.bytesToHex(hash);
    const pointX = "02" + hashHex;
    try {
      point = nobleSecp256k1.Point.fromHex(pointX);
    } catch (error) {
      secretMessage = await nobleSecp256k1.utils.sha256(secretMessage);
    }
  }
  return point;
}

async function step1Alice(secretMessage) {
  secretMessage = uint8ToBase64.encode(secretMessage);
  secretMessage = new TextEncoder().encode(secretMessage);
  const Y = await hashToCurve(secretMessage);
  const r_bytes = nobleSecp256k1.utils.randomPrivateKey();
  const r = bytesToNumber(r_bytes);
  const P = nobleSecp256k1.Point.fromPrivateKey(r);
  const B_ = Y.add(P);
  return { B_: B_.toHex(true), r: nobleSecp256k1.utils.bytesToHex(r_bytes) };
}

function step3Alice(C_, r, A) {
  const rInt = bytesToNumber(r);
  const C = C_.subtract(A.multiply(rInt));
  return C;
}

export { step1Alice, step3Alice };
