declare module "light-bolt11-decoder" {
  export interface DecodedSection {
    name?: string;
    value?: any;
    [key: string]: any;
  }

  export interface DecodedBolt11 {
    paymentRequest: string;
    sections: DecodedSection[];
  }

  export function decode(paymentRequest: string): DecodedBolt11;
}
