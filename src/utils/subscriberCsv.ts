import { useCreatorSubscribersStore } from "src/stores/creatorSubscribers";
import type { Subscriber } from "src/types/subscriber";

// Columns exported to CSV.  `nextRenewal` and `lifetimeSat` are included so the
// resulting file can be used directly for KPI or chart calculations.
const HEADER = [
  "name",
  "npub",
  "nip05",
  "tier",
  "frequency",
  "status",
  "amount_sat",
  "next_renewal_iso",
  "lifetime_sat",
  "start_date_iso",
].join(",");

export function downloadCsv(rows?: Subscriber[]) {
  const store = useCreatorSubscribersStore();
  const data = rows ?? store.filtered;

  const lines = data.map((r) => {
    const nextIso =
      typeof r.nextRenewal === "number"
        ? new Date(r.nextRenewal * 1000).toISOString()
        : "";
    const lifetimeSat = typeof r.lifetimeSat === "number" ? r.lifetimeSat : 0;
    const amountSat = typeof r.amountSat === "number" ? r.amountSat : 0;

    return [
      JSON.stringify(r.name),
      r.npub,
      r.nip05,
      JSON.stringify(r.tierName),
      r.frequency,
      r.status,
      amountSat,
      nextIso,
      lifetimeSat,
      new Date(r.startDate * 1000).toISOString(),
    ].join(",");
  });

  const blob = new Blob([HEADER + "\n" + lines.join("\n")], {
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
