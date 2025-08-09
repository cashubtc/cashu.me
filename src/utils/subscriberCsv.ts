import { useCreatorSubscribersStore } from "src/stores/creatorSubscribers";
import type { Subscriber } from "src/types/subscriber";

export function downloadCsv(rows?: Subscriber[]) {
  const store = useCreatorSubscribersStore();
  const data = rows ?? store.filtered;

  const header =
    "name,npub,nip05,tier,frequency,status,amount_sat,next_renewalISO,lifetime_sat,start_dateISO";
  const lines = data.map((r) =>
    [
      JSON.stringify(r.name),
      r.npub,
      r.nip05,
      JSON.stringify(r.tierName),
      r.frequency,
      r.status,
      r.amountSat,
      r.nextRenewal ? new Date(r.nextRenewal * 1000).toISOString() : "",
      r.lifetimeSat,
      new Date(r.startDate * 1000).toISOString(),
    ].join(","),
  );

  const blob = new Blob([header + "\n" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `subscribers-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default downloadCsv;
