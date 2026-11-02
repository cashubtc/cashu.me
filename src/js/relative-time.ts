import { parseISO } from "date-fns";

/** One locale-formatted phrase ("5 minutes ago", "منذ 5 دقائق", "5分钟前"), so the number,
 * unit and direction words never come from different languages. Latin digits in every
 * locale, like the amounts. */
function formatRelativeTime(date: Date, locale: string): string {
  const format = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
    numberingSystem: "latn",
  } as Intl.RelativeTimeFormatOptions);
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["second", 60],
    ["minute", 60],
    ["hour", 24],
    ["day", 30],
    ["month", 12],
  ];
  let value = (date.getTime() - Date.now()) / 1000;
  for (const [unit, size] of steps) {
    if (Math.abs(value) < size) return format.format(Math.round(value), unit);
    value /= size;
  }
  return format.format(Math.round(value), "year");
}

/** A stored history date string as a relative phrase (see formatRelativeTime). */
export function formatRelativeDate(dateStr: string, locale: string): string {
  return formatRelativeTime(parseISO(dateStr), locale);
}
