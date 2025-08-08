import type { CreatorSubscription } from "stores/creatorSubscriptions";

export function downloadCsv(rows: CreatorSubscription[]) {
  const headers = [
    "subscriptionId",
    "displayName",
    "npub",
    "nip05",
    "lud16",
    "tier",
    "frequency",
    "status",
    "nextRenewal",
    "intervalDays",
    "totalAmount",
    "startDate",
    "endDate",
  ];
  const lines = [headers.join(",")];

  for (const sub of rows) {
    const r: any = sub as any;
    const next = sub.nextRenewal
      ? new Date(sub.nextRenewal * 1000).toISOString()
      : "";
    const start = sub.startDate
      ? new Date(sub.startDate * 1000).toISOString()
      : "";
    const end = sub.endDate
      ? new Date(sub.endDate * 1000).toISOString()
      : "";
    const row = [
      sub.subscriptionId,
      r.displayName ?? "",
      r.npub ?? sub.subscriberNpub,
      r.nip05 ?? "",
      r.lud16 ?? "",
      r.tier ?? sub.tierName,
      sub.frequency,
      sub.status,
      next,
      sub.intervalDays,
      sub.totalAmount,
      start,
      end,
    ]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",");
    lines.push(row);
  }

  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "subscribers.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default downloadCsv;

