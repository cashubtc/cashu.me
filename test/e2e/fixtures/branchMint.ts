import { createServer, type Server } from "node:http";
import { createHash, randomBytes } from "node:crypto";
import { secp256k1 } from "@noble/curves/secp256k1";

// A minimal in-process Cashu mint that settles quotes through a custom
// (generic) payment method called "branch" — the counter-settlement model
// pecan uses. It advertises the method in NUT-04/NUT-05, issues real blind
// signatures, and exposes a test-only endpoint to play the teller:
//
//   POST /__test__/pay/{quoteId}     mark a mint quote as paid (cash received)
//
// The mint has a single unit ("ora") and zero fees. No NUT-12 (DLEQ), no
// NUT-17 (websockets): the wallet must fall back to polling.

export const BRANCH_MINT_PORT = 8095;
export const BRANCH_MINT_URL = `http://127.0.0.1:${BRANCH_MINT_PORT}`;
export const BRANCH_UNIT = "ora";
export const BRANCH_METHOD = "branch";
// NUT-06 optional display name for the method
export const BRANCH_METHOD_NAME = "Bux Counter";

const MAX_ORDER = 20; // denominations 1..2^19

type MintQuote = {
  quote: string;
  request: string;
  unit: string;
  amount: number;
  state: "UNPAID" | "PAID" | "ISSUED";
  amount_paid: number;
  amount_issued: number;
  pubkey?: string;
  expiry: number;
};

type MeltQuote = {
  quote: string;
  request: string;
  unit: string;
  amount: number;
  fee_reserve: number;
  state: "UNPAID" | "PENDING" | "PAID";
  expiry: number;
  payment_preimage: string | null;
};

function sha256(data: Buffer | Uint8Array): Buffer {
  return createHash("sha256").update(data).digest();
}

export class BranchMint {
  private server: Server | null = null;
  private privkeys = new Map<number, bigint>();
  private pubkeys = new Map<number, string>();
  private keysetId = "";
  readonly mintQuotes = new Map<string, MintQuote>();
  readonly meltQuotes = new Map<string, MeltQuote>();
  private spentYs = new Set<string>();

  constructor() {
    // Deterministic keys so restarts behave like the same mint.
    for (let order = 0; order < MAX_ORDER; order++) {
      const amount = 2 ** order;
      const seed = sha256(Buffer.from(`branch-mint-secret-${order}`));
      const k = BigInt(`0x${seed.toString("hex")}`) % secp256k1.CURVE.n;
      this.privkeys.set(amount, k);
      this.pubkeys.set(
        amount,
        Buffer.from(secp256k1.getPublicKey(k, true)).toString("hex")
      );
    }
    this.keysetId = this.deriveKeysetId();
  }

  // NUT-02 (version 00) keyset id: sha256 over pubkeys sorted by amount.
  private deriveKeysetId(): string {
    const amounts = [...this.pubkeys.keys()].sort((a, b) => a - b);
    const concat = Buffer.concat(
      amounts.map((a) => Buffer.from(this.pubkeys.get(a)!, "hex"))
    );
    return "00" + sha256(concat).toString("hex").slice(0, 14);
  }

  // NUT-00 hash_to_curve — used to track spent proofs by their Y point.
  private hashToCurve(secret: string): string {
    const domain = Buffer.from("Secp256k1_HashToCurve_Cashu_");
    const msgHash = sha256(Buffer.concat([domain, Buffer.from(secret)]));
    for (let counter = 0; counter < 2 ** 16; counter++) {
      const counterBuf = Buffer.alloc(4);
      counterBuf.writeUInt32LE(counter);
      const x = sha256(Buffer.concat([msgHash, counterBuf]));
      try {
        const point = secp256k1.ProjectivePoint.fromHex(
          "02" + x.toString("hex")
        );
        return point.toHex(true);
      } catch {
        // not on the curve, try the next counter
      }
    }
    throw new Error("hash_to_curve: no point found");
  }

  private signOutput(output: { amount: number; id: string; B_: string }) {
    const k = this.privkeys.get(output.amount);
    if (!k) throw new Error(`no key for amount ${output.amount}`);
    const B_ = secp256k1.ProjectivePoint.fromHex(output.B_);
    const C_ = B_.multiply(k);
    return { amount: output.amount, id: this.keysetId, C_: C_.toHex(true) };
  }

  private keysResponse() {
    const keys: Record<string, string> = {};
    for (const [amount, pubkey] of this.pubkeys) keys[String(amount)] = pubkey;
    return {
      keysets: [{ id: this.keysetId, unit: BRANCH_UNIT, keys }],
    };
  }

  private infoResponse() {
    return {
      name: "Branch Mock Mint",
      version: "BranchMock/0.1.0",
      description: `Mock mint settling via the custom '${BRANCH_METHOD}' method`,
      nuts: {
        "4": {
          methods: [
            {
              method: BRANCH_METHOD,
              method_name: BRANCH_METHOD_NAME,
              unit: BRANCH_UNIT,
              min_amount: 1,
              max_amount: 1_000_000,
            },
          ],
          disabled: false,
        },
        "5": {
          methods: [
            {
              method: BRANCH_METHOD,
              method_name: BRANCH_METHOD_NAME,
              unit: BRANCH_UNIT,
              min_amount: 1,
              max_amount: 1_000_000,
            },
          ],
          disabled: false,
        },
        "7": { supported: true },
        "20": { supported: true },
      },
    };
  }

  /** Test hook: the teller received cash for a mint quote. */
  payMintQuote(quoteId: string) {
    const quote = this.mintQuotes.get(quoteId);
    if (!quote) throw new Error("mint quote not found");
    if (quote.state === "UNPAID") {
      quote.state = "PAID";
      quote.amount_paid = quote.amount;
    }
    return quote;
  }

  private handle(
    method: string,
    path: string,
    body: any
  ): { status: number; data: any } {
    const notFound = { status: 404, data: { detail: "not found", code: 0 } };

    if (method === "GET" && path === "/v1/info") {
      return { status: 200, data: this.infoResponse() };
    }
    if (method === "GET" && path === "/v1/keysets") {
      return {
        status: 200,
        data: {
          keysets: [
            {
              id: this.keysetId,
              unit: BRANCH_UNIT,
              active: true,
              input_fee_ppk: 0,
            },
          ],
        },
      };
    }
    if (
      method === "GET" &&
      (path === "/v1/keys" || path === `/v1/keys/${this.keysetId}`)
    ) {
      return { status: 200, data: this.keysResponse() };
    }

    // --- test hooks -------------------------------------------------------
    let match = path.match(/^\/__test__\/pay\/(.+)$/);
    if (method === "POST" && match) {
      const quote = this.mintQuotes.get(match[1]);
      if (!quote) return notFound;
      return { status: 200, data: this.payMintQuote(match[1]) };
    }
    if (method === "GET" && path === "/__test__/quotes") {
      return {
        status: 200,
        data: {
          mint: [...this.mintQuotes.values()],
          melt: [...this.meltQuotes.values()],
        },
      };
    }

    // --- NUT-04 generic mint quotes --------------------------------------
    if (method === "POST" && path === `/v1/mint/quote/${BRANCH_METHOD}`) {
      if (body?.unit !== BRANCH_UNIT) {
        return {
          status: 400,
          data: { detail: "Unsupported unit", code: 11005 },
        };
      }
      const amount = Number(body?.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return { status: 400, data: { detail: "Invalid amount", code: 0 } };
      }
      // Like pecan: deposits are only accepted on wallet-locked quotes.
      if (!body?.pubkey) {
        return {
          status: 400,
          data: {
            detail: "Quote must be locked to a pubkey (NUT-20)",
            code: 0,
          },
        };
      }
      const quote: MintQuote = {
        quote: randomBytes(16).toString("hex"),
        request: "",
        unit: BRANCH_UNIT,
        amount,
        state: "UNPAID",
        amount_paid: 0,
        amount_issued: 0,
        pubkey: body.pubkey,
        expiry: Math.floor(Date.now() / 1000) + 3600,
      };
      this.mintQuotes.set(quote.quote, quote);
      return { status: 200, data: quote };
    }
    match = path.match(
      new RegExp(`^/v1/mint/quote/${BRANCH_METHOD}/([0-9a-f]+)$`)
    );
    if (method === "GET" && match) {
      const quote = this.mintQuotes.get(match[1]);
      if (!quote) return notFound;
      return { status: 200, data: quote };
    }
    if (method === "POST" && path === `/v1/mint/${BRANCH_METHOD}`) {
      const quote = this.mintQuotes.get(String(body?.quote));
      if (!quote) return notFound;
      const outputs = Array.isArray(body?.outputs) ? body.outputs : [];
      const outputTotal = outputs.reduce(
        (sum: number, o: any) => sum + Number(o.amount),
        0
      );
      if (quote.state !== "PAID") {
        return { status: 400, data: { detail: "Quote not paid", code: 20001 } };
      }
      if (outputTotal > quote.amount_paid - quote.amount_issued) {
        return {
          status: 400,
          data: { detail: "Output amount exceeds quote", code: 0 },
        };
      }
      const signatures = outputs.map((o: any) => this.signOutput(o));
      quote.amount_issued += outputTotal;
      if (quote.amount_issued >= quote.amount_paid) quote.state = "ISSUED";
      return { status: 200, data: { signatures } };
    }

    // --- NUT-05 generic melt quotes ---------------------------------------
    if (method === "POST" && path === `/v1/melt/quote/${BRANCH_METHOD}`) {
      // cdk's MeltQuoteCustomRequest requires `method` in the body (matching
      // the URL) and a `request` string; mirror that contract exactly.
      if (body?.method !== BRANCH_METHOD || typeof body?.request !== "string") {
        return {
          status: 400,
          data: { detail: "Invalid payment method", code: 50000 },
        };
      }
      if (body?.unit !== BRANCH_UNIT) {
        return {
          status: 400,
          data: { detail: "Unsupported unit", code: 11005 },
        };
      }
      const amount = Number(body?.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return { status: 400, data: { detail: "Invalid amount", code: 0 } };
      }
      const quote: MeltQuote = {
        quote: randomBytes(16).toString("hex"),
        request: String(body?.request ?? ""),
        unit: BRANCH_UNIT,
        amount,
        fee_reserve: 0,
        state: "UNPAID",
        expiry: Math.floor(Date.now() / 1000) + 3600,
        payment_preimage: null,
      };
      this.meltQuotes.set(quote.quote, quote);
      return { status: 200, data: quote };
    }
    match = path.match(
      new RegExp(`^/v1/melt/quote/${BRANCH_METHOD}/([0-9a-f]+)$`)
    );
    if (method === "GET" && match) {
      const quote = this.meltQuotes.get(match[1]);
      if (!quote) return notFound;
      return { status: 200, data: { ...quote, change: [] } };
    }
    if (method === "POST" && path === `/v1/melt/${BRANCH_METHOD}`) {
      const quote = this.meltQuotes.get(String(body?.quote));
      if (!quote) return notFound;
      const inputs = Array.isArray(body?.inputs) ? body.inputs : [];
      const inputTotal = inputs.reduce(
        (sum: number, p: any) => sum + Number(p.amount),
        0
      );
      if (inputTotal < quote.amount + quote.fee_reserve) {
        return {
          status: 400,
          data: { detail: "Insufficient inputs", code: 0 },
        };
      }
      const ys = inputs.map((p: any) => this.hashToCurve(String(p.secret)));
      if (ys.some((y: string) => this.spentYs.has(y))) {
        return {
          status: 400,
          data: { detail: "Token already spent", code: 11001 },
        };
      }
      ys.forEach((y: string) => this.spentYs.add(y));
      // Teller pays out immediately in this mock.
      quote.state = "PAID";
      return { status: 200, data: { ...quote, change: [] } };
    }

    // --- NUT-03 swap -------------------------------------------------------
    if (method === "POST" && path === "/v1/swap") {
      const inputs = Array.isArray(body?.inputs) ? body.inputs : [];
      const outputs = Array.isArray(body?.outputs) ? body.outputs : [];
      const inputTotal = inputs.reduce(
        (sum: number, p: any) => sum + Number(p.amount),
        0
      );
      const outputTotal = outputs.reduce(
        (sum: number, o: any) => sum + Number(o.amount),
        0
      );
      if (outputTotal > inputTotal) {
        return {
          status: 400,
          data: { detail: "Output exceeds input", code: 0 },
        };
      }
      const ys = inputs.map((p: any) => this.hashToCurve(String(p.secret)));
      if (ys.some((y: string) => this.spentYs.has(y))) {
        return {
          status: 400,
          data: { detail: "Token already spent", code: 11001 },
        };
      }
      ys.forEach((y: string) => this.spentYs.add(y));
      const signatures = outputs.map((o: any) => this.signOutput(o));
      return { status: 200, data: { signatures } };
    }

    // --- NUT-07 checkstate --------------------------------------------------
    if (method === "POST" && path === "/v1/checkstate") {
      const ys = Array.isArray(body?.Ys) ? body.Ys : [];
      return {
        status: 200,
        data: {
          states: ys.map((y: string) => ({
            Y: y,
            state: this.spentYs.has(y.toLowerCase()) ? "SPENT" : "UNSPENT",
            witness: null,
          })),
        },
      };
    }

    return notFound;
  }

  start(port = BRANCH_MINT_PORT): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer((req, res) => {
        if (req.method === "OPTIONS") {
          res.writeHead(204, {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET,POST,OPTIONS",
            "access-control-allow-headers": "*",
            "access-control-max-age": "86400",
          });
          res.end();
          return;
        }
        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => {
          let body: any = undefined;
          const raw = Buffer.concat(chunks).toString();
          if (raw.length) {
            try {
              body = JSON.parse(raw);
            } catch {
              body = undefined;
            }
          }
          let result;
          try {
            result = this.handle(
              req.method ?? "GET",
              (req.url ?? "/").split("?")[0],
              body
            );
          } catch (error: any) {
            result = {
              status: 500,
              data: { detail: String(error?.message ?? error), code: 0 },
            };
          }
          res.writeHead(result.status, {
            "content-type": "application/json",
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET,POST,OPTIONS",
            "access-control-allow-headers": "*",
          });
          res.end(JSON.stringify(result.data));
        });
      });
      this.server.once("error", reject);
      this.server.listen(port, "127.0.0.1", () => resolve());
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) return resolve();
      this.server.close(() => resolve());
      this.server = null;
    });
  }
}
