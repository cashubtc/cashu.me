export function sanitizeMessage(message: string, maxLength = 1000): string {
  if (!message) return "";
  const sanitized = message.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
  return sanitized.slice(0, maxLength);
}

export const CASHU_TOKEN_START = "CASHU_TOKEN_START";
export const CASHU_TOKEN_END = "CASHU_TOKEN_END";

export type FormattedTokenPayload = {
  token: string;
  amount?: number | null;
  memo?: string;
  unlockTime?: number | null;
};

export function createFormattedTokenMessage(
  token: string,
  amount: number | null = null,
  memo?: string,
  unlockTime: number | null = null,
): string {
  const payload: FormattedTokenPayload = {
    token,
    amount,
    memo,
    unlockTime,
  };
  return `${CASHU_TOKEN_START}${JSON.stringify(payload)}${CASHU_TOKEN_END}`;
}

export function parseFormattedTokenMessage(
  message: string,
): FormattedTokenPayload | null {
  const start = message.indexOf(CASHU_TOKEN_START);
  const end = message.indexOf(CASHU_TOKEN_END, start + CASHU_TOKEN_START.length);
  if (start === -1 || end === -1) return null;
  const json = message
    .slice(start + CASHU_TOKEN_START.length, end)
    .trim();
  try {
    const parsed = JSON.parse(json) as FormattedTokenPayload;
    if (parsed.token) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}
