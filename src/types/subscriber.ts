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
  /** Number of days between payments */
  intervalDays: number;
  status: SubStatus;
  startDate: number;
  nextRenewal?: number;
  lifetimeSat: number;
  receivedPeriods: number;
  totalPeriods?: number;
  /**
   * Progress through the current billing period as a fraction between 0 and 1.
   */
  progress: number;
  /** Whether the subscription renewal is due within the next 72 hours */
  dueSoon: boolean;
}
