import { date } from "quasar";
import * as nobleSecp256k1 from "@noble/secp256k1";

function splitAmount(value) {
  const chunks = [];
  for (let i = 0; i < 32; i++) {
    const mask = 1 << i;
    if ((value & mask) !== 0) chunks.push(Math.pow(2, i));
  }
  return chunks;
}

function bytesToNumber(bytes) {
  return hexToNumber(nobleSecp256k1.etc.bytesToHex(bytes));
}

function bigIntStringify(key, value) {
  return typeof value === "bigint" ? value.toString() : value;
}

function hexToNumber(hex) {
  if (typeof hex !== "string") {
    throw new TypeError("hexToNumber: expected string, got " + typeof hex);
  }
  return BigInt(`0x${hex}`);
}

function currentDateStr() {
  return date.formatDate(new Date(), "YYYY-MM-DD HH:mm:ss");
}

export { splitAmount, bytesToNumber, bigIntStringify, currentDateStr };
