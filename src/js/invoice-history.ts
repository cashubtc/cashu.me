export type InvoiceWithParentQuote = {
  quote?: string;
  parentQuote?: string;
};

function randomId(): string {
  const crypto = globalThis.crypto;
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }

  if (crypto?.getRandomValues) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createSubpaymentHistoryQuote(): string {
  return `subpayment:${randomId()}`;
}

export function mintQuoteForHistoryInvoice(
  invoice: InvoiceWithParentQuote
): string {
  return invoice.parentQuote || invoice.quote || "";
}
