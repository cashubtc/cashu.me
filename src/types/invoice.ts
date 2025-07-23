import { MeltQuoteResponse, MintQuoteResponse } from "@cashu/cashu-ts";

export interface Invoice {
  amount: number;
  bolt11: string;
  quote: string;
  memo: string;
}

export interface InvoiceHistory extends Invoice {
  date: string;
  status: "pending" | "paid";
  mint: string;
  unit: string;
  mintQuote?: MintQuoteResponse;
  meltQuote?: MeltQuoteResponse;
}
