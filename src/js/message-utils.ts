export function sanitizeMessage(message: string, maxLength = 1000): string {
  if (!message) return "";
  const sanitized = message.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
  return sanitized.slice(0, maxLength);
}

export const CASHU_TOKEN_START = "CASHU_TOKEN_START";
export const CASHU_TOKEN_END = "CASHU_TOKEN_END";

export type TokenData = {
  token: string;
  amount: number;
  memo?: string;
  unlockTime?: number; // Unix timestamp in seconds
};

export function createFormattedTokenMessage(tokenData: TokenData): string {
  const lines = [CASHU_TOKEN_START];
  lines.push(`Token Amount: ${tokenData.amount} sats`);

  if (tokenData.memo) {
    lines.push(`Memo: ${tokenData.memo}`);
  }

  if (tokenData.unlockTime && tokenData.unlockTime > 0) {
    const date = new Date(tokenData.unlockTime * 1000);
    const formattedDate = date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    lines.push(`Unlock Time: ${formattedDate}`);
  } else {
    lines.push("Unlock Time: N/A");
  }

  lines.push("---");
  lines.push(tokenData.token);
  lines.push(CASHU_TOKEN_END);

  return lines.join("\n");
}

export function parseFormattedTokenMessage(messageText: string): string | null {
  if (!messageText) return null;

  const startIndex = messageText.indexOf(CASHU_TOKEN_START);
  const endIndex = messageText.indexOf(CASHU_TOKEN_END);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return null;
  }

  const contentWithStart = messageText.substring(startIndex + CASHU_TOKEN_START.length, endIndex);

  const separatorIndex = contentWithStart.indexOf("\n---\n");

  if (separatorIndex === -1) {
    // Fallback for older format or if "---" is directly after CASHU_TOKEN_START
    const directTokenMatch = contentWithStart.match(/^\s*---\s*\n([\s\S]*)/);
    if (directTokenMatch && directTokenMatch[1]) {
        return directTokenMatch[1].trim();
    }
    // If no "---", assume the content after CASHU_TOKEN_START (trimmed) might be the token itself,
    // but this is less specific. For now, we require "---"
    return null;
  }

  const tokenPart = contentWithStart.substring(separatorIndex + "\n---\n".length);

  return tokenPart.trim();
}
