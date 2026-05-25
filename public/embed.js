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
(function () {
  "use strict";

  class CashuPay {
    constructor(options) {
      options = options || {};
      this._origin = options.origin || "https://cashu.me";
      this._timeout = options.timeout || 120000;
    }

    requestPayment(params) {
      var self = this;
      params = params || {};

      if (!params.amount || params.amount <= 0) {
        return Promise.reject(new Error("Invalid amount"));
      }

      return new Promise(function (resolve, reject) {
        var nonce = crypto.randomUUID();

        var query = new URLSearchParams();
        query.set("amount", String(params.amount));
        query.set("unit", params.unit || "sat");
        query.set("nonce", nonce);
        query.set("origin", window.location.origin);
        query.set("url", window.location.href);
        if (params.mint) query.set("mint", params.mint);
        if (params.memo) query.set("memo", params.memo);
        if (params.description) query.set("description", params.description);

        var popup = window.open(
          self._origin + "/embed/pay?" + query.toString(),
          "cashu_pay_" + nonce,
          "width=420,height=620,popup=yes,noopener=no"
        );

        if (!popup) {
          reject(new Error("Popup blocked"));
          return;
        }

        var timer = null;
        var pollClosed = null;

        function cleanup() {
          if (timer) clearTimeout(timer);
          if (pollClosed) clearInterval(pollClosed);
          window.removeEventListener("message", onMessage);
        }

        function onMessage(event) {
          if (event.origin !== self._origin) return;
          var data = event.data;
          if (!data || data.type !== "cashu:payment-result") return;
          if (data.nonce !== nonce) return;

          cleanup();

          if (data.status === "success") {
            resolve({ token: data.token });
          } else {
            reject(new Error(data.error || "Payment failed"));
          }
        }

        window.addEventListener("message", onMessage);

        pollClosed = setInterval(function () {
          if (popup.closed) {
            cleanup();
            reject(new Error("Payment cancelled"));
          }
        }, 500);

        timer = setTimeout(function () {
          cleanup();
          reject(new Error("Payment timed out"));
        }, self._timeout);
      });
    }
  }

  window.CashuPay = CashuPay;
})();
