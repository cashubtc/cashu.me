export interface Bucket {
  id: string;
  name: string;
  color?: string;
  description?: string;
  goal?: number;
  creatorPubkey?: string;
  isArchived?: boolean;
}

export interface BucketRule {
  id: string;
  bucketId: string;
  mint?: string;
  memo?: string;
}
