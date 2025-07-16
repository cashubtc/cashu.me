import { exportFile } from 'quasar';
import dayjs from 'dayjs';
import token from 'src/js/token';
import type { MessengerMessage } from 'src/stores/messenger';

export function saveReceipt(msg: MessengerMessage) {
  if (!msg.subscriptionPayment) return;
  const decoded = token.decode(msg.subscriptionPayment.token);
  const amount = decoded ? token.getProofs(decoded).reduce((s, p) => s + p.amount, 0) : 0;
  const mintUrl = decoded ? token.getMint(decoded) : '';
  const data = {
    rawToken: msg.subscriptionPayment.token,
    amount,
    mintUrl,
    unlock_time: msg.subscriptionPayment.unlock_time,
  };
  const fileName = `fundstr_${msg.subscriptionPayment.subscription_id}_${dayjs().utc().format('YYYYMMDD-HHmmss')}.json`;
  exportFile(fileName, JSON.stringify(data, null, 2), 'application/json');
}
