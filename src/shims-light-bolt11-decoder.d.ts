declare module "light-bolt11-decoder" {
  export function decode(paymentRequest: string): {
    paymentRequest: string;
    sections: any[];
  };
}
