import {
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
  nip19,
  nip44,
  Relay,
} from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils";
import { Notify } from "quasar";

type BugstrConfig = {
  developerPubkey: string;
  relays?: string[];
  environment?: string;
  release?: string;
  beforeSend?: (payload: BugstrPayload) => BugstrPayload | null;
  confirmSend?: (summary: BugstrSummary) => Promise<boolean> | boolean;
};

type BugstrPayload = {
  message: string;
  stack?: string;
  timestamp: number;
  environment?: string;
  release?: string;
};

type BugstrSummary = {
  message: string;
  stackPreview?: string;
};

const REDACTION_PATTERNS: RegExp[] = [
  /cashuA[a-zA-Z0-9]+/g, // tokens
  /lnbc[a-z0-9]+/gi, // lightning invoices
  /npub1[a-z0-9]+/gi, // nostr public keys
  /nsec1[a-z0-9]+/gi, // nostr private keys
  /https?:\/\/[^\s"]*\/mint[^\s"]*/gi, // mint URLs (best-effort)
];

const DEFAULT_RELAYS = ["wss://relay.damus.io", "wss://nos.lol"];

let isInitialized = false;
let senderPrivkey: string | undefined;
let developerPubkeyHex = "";
let config: BugstrConfig = {
  developerPubkey: "",
};

function decodePubkey(pubkey: string): string {
  if (!pubkey) return "";
  if (pubkey.startsWith("npub")) {
    const decoded = nip19.decode(pubkey);
    if (decoded.type === "npub") {
      return decoded.data;
    }
  }
  return pubkey;
}

function redact(input: string | undefined): string | undefined {
  if (!input) return input;
  return REDACTION_PATTERNS.reduce(
    (acc, pattern) => acc.replace(pattern, "[redacted]"),
    input
  );
}

function randomPastTimestamp(): number {
  const now = Math.floor(Date.now() / 1000);
  const maxOffset = 60 * 60 * 24 * 2; // up to 2 days
  const offset = Math.floor(Math.random() * maxOffset);
  return now - offset;
}

function buildPayload(err: unknown): BugstrPayload {
  const message =
    err instanceof Error
      ? err.message || "Unknown error"
      : typeof err === "string"
      ? err
      : "Unknown error";
  const stack =
    err instanceof Error && typeof err.stack === "string" ? err.stack : "";
  return {
    message: redact(message) || "Unknown error",
    stack: redact(stack),
    timestamp: Date.now(),
    environment: config.environment,
    release: config.release,
  };
}

async function sendToNostr(payload: BugstrPayload): Promise<void> {
  if (!developerPubkeyHex || !senderPrivkey) {
    throw new Error("Bugstr Nostr keys not configured");
  }
  const relays = config.relays?.length ? config.relays : DEFAULT_RELAYS;
  const plaintext = JSON.stringify(payload);

  // Build unsigned kind 14 (chat message)
  const unsignedKind14 = {
    kind: 14,
    created_at: randomPastTimestamp(),
    tags: [["p", developerPubkeyHex]],
    content: plaintext,
    pubkey: getPublicKey(senderPrivkey),
  };

  // Seal (kind 13) signed by sender, content encrypted with nip44 conversation key
  const conversationKey = nip44.getConversationKey(
    senderPrivkey,
    developerPubkeyHex
  );
  const sealContent = await nip44.encrypt(
    JSON.stringify(unsignedKind14),
    conversationKey
  );
  const seal = finalizeEvent(
    {
      kind: 13,
      created_at: randomPastTimestamp(),
      tags: [],
      content: sealContent,
    },
    senderPrivkey
  );

  // Gift wrap (kind 1059) encrypted with random key for receiver
  const wrapperPriv = bytesToHex(generateSecretKey());
  const wrapKey = nip44.getConversationKey(wrapperPriv, developerPubkeyHex);
  const giftWrapContent = await nip44.encrypt(
    JSON.stringify(seal),
    wrapKey
  );
  const giftWrap = finalizeEvent(
    {
      kind: 1059,
      created_at: randomPastTimestamp(),
      tags: [["p", developerPubkeyHex]],
      content: giftWrapContent,
    },
    wrapperPriv
  );

  let lastError: Error | undefined;
  let okCount = 0;
  for (const relayUrl of relays) {
    try {
      const relay = await Relay.connect(relayUrl);
      await relay.publish(giftWrap);
      relay.close();
      okCount += 1;
      console.info(`Bugstr: send completed (received OK from ${okCount} relay${okCount > 1 ? "s" : ""}, last=${relayUrl})`);
      return;
    } catch (err) {
      lastError = err as Error;
    }
  }
  throw lastError || new Error("Unable to publish Bugstr event");
}

async function maybeSend(payload: BugstrPayload) {
  const summary: BugstrSummary = {
    message: payload.message,
    stackPreview: payload.stack ? payload.stack.split("\n").slice(0, 3).join("\n") : undefined,
  };

  const shouldSend = await (config.confirmSend
    ? config.confirmSend(summary)
    : window.confirm(
        `Send crash report to developers?\n\n${summary.message}${
          summary.stackPreview ? `\n\n${summary.stackPreview}` : ""
        }`
      ));

  if (!shouldSend) return;
  console.info("Bugstr: user confirmed send");
  const finalPayload =
    config.beforeSend === undefined ? payload : config.beforeSend(payload);
  if (finalPayload === null) return;
  try {
    await sendToNostr(finalPayload || payload);
    console.info("Bugstr: send completed");
    Notify.create({
      type: "positive",
      message: "Bugstr crash report sent.",
      timeout: 2500,
    });
  } catch (err) {
    console.warn("Bugstr send failed", err);
    Notify.create({
      type: "negative",
      message: "Bugstr failed to send crash report.",
      timeout: 3000,
    });
  }
}

function handleError(event: ErrorEvent) {
  if (!event) return;
  captureException(event.error || event.message);
}

function handleRejection(event: PromiseRejectionEvent) {
  if (!event) return;
  captureException(
    event.reason instanceof Error
      ? event.reason
      : new Error(
          typeof event.reason === "string"
            ? event.reason
            : "Unhandled promise rejection"
        )
  );
}

export function initBugstr(userConfig: BugstrConfig) {
  if (isInitialized) return;
  config = userConfig;
  developerPubkeyHex = decodePubkey(config.developerPubkey);
  senderPrivkey = bytesToHex(generateSecretKey());
  isInitialized = true;
  if (typeof window !== "undefined") {
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    // Expose helpers for manual testing when initialized
    (window as any).__bugstr = bugstr;
    (window as any).__bugstrCapture = captureException;
  }
}

export function captureException(err: unknown) {
  if (!isInitialized) {
    console.warn("Bugstr not initialized; dropping error");
    return;
  }
  const payload = buildPayload(err);
  maybeSend(payload).catch((sendErr) =>
    console.warn("Bugstr send failed", sendErr)
  );
}

export const bugstr = {
  init: initBugstr,
  captureException,
};
