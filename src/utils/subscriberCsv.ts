import type { CreatorSubscription } from "stores/creatorSubscriptions";

export function exportSubscribers(
  subscribers: CreatorSubscription[],
  filename: string,
) {
  const headers = [
    "Subscriber",
    "Tier",
    "Start",
    "Next Renewal",
    "Months",
    "Remaining",
    "Status",
  ];
  const lines = [headers.join(",")];
  for (const sub of subscribers) {
    const start = sub.startDate ? new Date(sub.startDate).toISOString() : "";
    const next = sub.nextRenewal ? new Date(sub.nextRenewal).toISOString() : "";
    const months = `${sub.receivedMonths}/${sub.totalMonths ?? ""}`;
    const remaining =
      (sub.totalMonths ?? sub.receivedMonths) - sub.receivedMonths;
    const row = [
      sub.subscriberNpub,
      sub.tierName,
      start,
      next,
      months,
      remaining,
      sub.status,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",");
    lines.push(row);
  }
  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default exportSubscribers;
