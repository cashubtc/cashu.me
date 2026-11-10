import { date } from "quasar";

function currentDateStr() {
  return date.formatDate(new Date(), "YYYY-MM-DD HH:mm:ss");
}

export { currentDateStr };
