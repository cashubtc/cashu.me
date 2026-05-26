/**
 * CashuPay — Embeddable payment SDK for cashu.me
 *
 * Usage:
 *   <script src="https://cashu.me/embed.js"></script>
 *   <script>
 *     const cashu = new CashuPay();
 *     const result = await cashu.requestPayment({ amount: 100, unit: 'sat' });
 *     console.log(result.token); // cashuB...
 *   </script>
 */

interface CashuPayOptions {
  origin?: string;
  timeout?: number;
}

interface PaymentParams {
  amount: number;
  unit?: string;
  mint?: string;
  memo?: string;
  description?: string;
}

interface PaymentResult {
  token: string;
}

class CashuPay {
  private _origin: string;
  private _timeout: number;

  constructor(options?: CashuPayOptions) {
    this._origin = options?.origin || "https://cashu.me";
    this._timeout = options?.timeout || 120000;
  }

  requestPayment(params: PaymentParams): Promise<PaymentResult> {
    if (!params.amount || params.amount <= 0) {
      return Promise.reject(new Error("Invalid amount"));
    }

    return new Promise((resolve, reject) => {
      const nonce = crypto.randomUUID();

      const query = new URLSearchParams();
      query.set("amount", String(params.amount));
      query.set("unit", params.unit || "sat");
      query.set("nonce", nonce);
      query.set("origin", window.location.origin);
      query.set("url", window.location.href);
      if (params.mint) query.set("mint", params.mint);
      if (params.memo) query.set("memo", params.memo);
      if (params.description) query.set("description", params.description);

      const popup = window.open(
        `${this._origin}/embed/pay?${query.toString()}`,
        `cashu_pay_${nonce}`,
        "width=420,height=620,popup=yes,noopener=no"
      );

      if (!popup) {
        reject(new Error("Popup blocked"));
        return;
      }

      let timer: ReturnType<typeof setTimeout> | null = null;
      let pollClosed: ReturnType<typeof setInterval> | null = null;

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        if (pollClosed) clearInterval(pollClosed);
        window.removeEventListener("message", onMessage);
      };

      const onMessage = (event: MessageEvent) => {
        if (event.origin !== this._origin) return;
        const data = event.data;
        if (!data || data.type !== "cashu:payment-result") return;
        if (data.nonce !== nonce) return;

        cleanup();

        if (data.status === "success") {
          resolve({ token: data.token });
        } else {
          reject(new Error(data.error || "Payment failed"));
        }
      };

      window.addEventListener("message", onMessage);

      pollClosed = setInterval(() => {
        if (popup.closed) {
          cleanup();
          reject(new Error("Payment cancelled"));
        }
      }, 500);

      timer = setTimeout(() => {
        cleanup();
        reject(new Error("Payment timed out"));
      }, this._timeout);
    });
  }
}

// Expose globally
(window as any).CashuPay = CashuPay;
