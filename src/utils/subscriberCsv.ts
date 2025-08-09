import type { CreatorSubscription } from "stores/creatorSubscriptions";
import type { NDKUserProfile } from "@nostr-dev-kit/ndk";

export function downloadCsv(
  subs: CreatorSubscription[],
  profiles?: (NDKUserProfile | undefined)[]
) {
  const headers = [
    "subscriptionId",
    "displayName",
    "npub",
    "nip05",
    "lud16",
    "tierName",
    "frequency",
    "status",
    "amountPerInterval_sat",
    "lifetime_sat",
    "nextRenewal_iso",
    "startDate_iso",
    "endDate_iso",
  ];
  const lines = [headers.join(",")];

  const profilesByNpub: Record<string, NDKUserProfile> = {};
  if (profiles) {
    for (const p of profiles) {
      if (p?.npub) profilesByNpub[p.npub] = p;
    }
  }

  const dtFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  const toDate = (ts: number | null | undefined) => ts ? dtFormat.format(new Date(ts * 1000)) : '';

  for (const sub of subs) {
    const profile = profilesByNpub[sub.subscriberNpub];
    const row = [
      sub.subscriptionId,
      profile?.displayName || profile?.name || "",
      sub.subscriberNpub,
      profile?.nip05 || "",
      profile?.lud16 || "",
      sub.tierName,
      sub.frequency,
      sub.status,
      sub.amountPerInterval || 0,
      sub.totalAmount,
      toDate(sub.nextRenewal),
      toDate(sub.startDate),
      toDate(sub.endDate),
    ]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",");
    lines.push(row);
  }

  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `subscribers-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default downloadCsv;

