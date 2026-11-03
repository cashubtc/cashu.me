import { date } from "quasar";

function splitAmount(value) {
  const chunks = [];
  for (let i = 0; i < 32; i++) {
    const mask = 1 << i;
    if ((value & mask) !== 0) chunks.push(Math.pow(2, i));
  }
  return chunks;
}

function currentDateStr() {
  return date.formatDate(new Date(), "YYYY-MM-DD HH:mm:ss");
}

export { splitAmount, currentDateStr };
