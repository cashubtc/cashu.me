import { Proof } from "@cashu/cashu-ts";

export interface WalletProof extends Proof {
  reserved: boolean;
  quote?: string;
  bucketId?: string;
  label?: string;
  description?: string;
}
