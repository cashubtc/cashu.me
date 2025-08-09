export type Frequency = "weekly" | "biweekly" | "monthly";

export type SubStatus = "active" | "pending" | "ended";

export interface Subscriber {
  id: string;
  name: string;
  npub: string;
  nip05: string;
  tierId: string;
  tierName: string;
  amountSat: number;
  frequency: Frequency;
  status: SubStatus;
  startDate: number;
  nextRenewal?: number;
  lifetimeSat: number;
}
