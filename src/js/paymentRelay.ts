import {
  finalizeEvent,
  generateSecretKey,
  matchFilter,
  verifyEvent,
  type Event,
  type Filter,
} from "nostr-tools";
import {
  MAX_ENVELOPE_BYTES,
  normalizeRelayUrls,
} from "src/js/paymentRequestProtocol";

type Pending = {
  message: unknown[];
  reject: (error: Error) => void;
  retryAfterAuth?: boolean;
  authRetried?: boolean;
  renewSubscription?: () => void;
};
type Subscription = Pending & {
  filter: Filter;
  receive: (event: Event) => Promise<void>;
  pending: Promise<void>;
  eose: () => void;
  live: boolean;
};

/** Payment-only connections: actual EOSE/OK frames, never SDK timeout-as-EOSE. */
export class PaymentRelay {
  private socket?: WebSocket;
  private subscriptions = new Map<string, Subscription>();
  private publications = new Map<string, Pending & { resolve: () => void }>();
  private authenticated = false;
  private authId?: string;
  private challenge?: string;
  onDisconnect?: () => void;
  constructor(
    readonly url: string,
    private authKey: Uint8Array = generateSecretKey(),
    private timeout = 15000
  ) {
    normalizeRelayUrls([url]);
  }
  async connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    await new Promise<void>((resolve, reject) => {
      const socket = (this.socket = new WebSocket(this.url));
      const timer = setTimeout(() => {
        reject(new Error("Relay connection timed out"));
        socket.close();
      }, this.timeout);
      socket.onopen = () => {
        clearTimeout(timer);
        resolve();
      };
      socket.onerror = () => {
        clearTimeout(timer);
        reject(new Error("Relay connection failed"));
      };
      socket.onclose = () => {
        clearTimeout(timer);
        reject(new Error("Relay disconnected"));
        this.fail(new Error("Relay disconnected"));
        this.onDisconnect?.();
      };
      socket.onmessage = (frame) => {
        if (
          typeof frame.data !== "string" ||
          frame.data.length > MAX_ENVELOPE_BYTES
        )
          return;
        try {
          this.receive(JSON.parse(frame.data));
        } catch {
          /* Invalid relay frame; never log its content. */
        }
      };
    });
  }
  private send(message: unknown[]) {
    if (this.socket?.readyState !== WebSocket.OPEN)
      throw new Error("Relay is not connected");
    this.socket.send(JSON.stringify(message));
  }
  private fail(error: Error) {
    for (const pending of [
      ...this.subscriptions.values(),
      ...this.publications.values(),
    ])
      pending.reject(error);
    this.subscriptions.clear();
    this.publications.clear();
  }
  close() {
    this.onDisconnect = undefined;
    this.fail(new Error("Relay connection closed"));
    this.socket?.close();
  }
  private authenticate() {
    if (!this.challenge || this.authId) return;
    const auth = finalizeEvent(
      {
        kind: 22242,
        created_at: Math.floor(Date.now() / 1000),
        content: "",
        tags: [
          ["relay", this.url],
          ["challenge", this.challenge],
        ],
      },
      this.authKey
    );
    this.authId = auth.id;
    this.send(["AUTH", auth]);
  }
  private retryAuthenticated(pending: Pending) {
    if (pending.authRetried) {
      pending.reject(
        new Error("Relay authentication did not authorize this operation")
      );
      return;
    }
    pending.retryAfterAuth = true;
    if (this.authenticated) {
      pending.authRetried = true;
      pending.retryAfterAuth = false;
      pending.renewSubscription?.();
      this.send(pending.message);
    } else this.authenticate();
  }
  private receive(frame: unknown[]) {
    const [type, id, value, reason] = frame;
    if (type === "AUTH" && typeof id === "string") {
      if (this.challenge !== id) {
        this.challenge = id;
        this.authId = undefined;
        this.authenticated = false;
        // Some relays silently filter protected events and return an empty EOSE
        // before authentication. Repeat those queries after AUTH succeeds.
        for (const sub of this.subscriptions.values())
          sub.retryAfterAuth = true;
      }
      this.authenticate();
    } else if (type === "OK" && id === this.authId) {
      if (!value) {
        this.fail(new Error("Relay authentication rejected"));
        return;
      }
      this.authenticated = true;
      for (const pending of [
        ...this.subscriptions.values(),
        ...this.publications.values(),
      ]) {
        if (pending.retryAfterAuth) this.retryAuthenticated(pending);
      }
    } else if (type === "OK" && typeof id === "string") {
      const pending = this.publications.get(id);
      if (!pending) return;
      if (value === true) pending.resolve();
      else if (String(reason).startsWith("auth-required:"))
        this.retryAuthenticated(pending);
      else pending.reject(new Error("Relay rejected publication"));
    } else if (type === "EVENT" && typeof id === "string") {
      const sub = this.subscriptions.get(id);
      const event = value as Event;
      if (!sub || !verifyEvent(event) || !matchFilter(sub.filter, event))
        return;
      sub.pending = sub.pending.then(() => sub.receive(event));
      sub.pending.catch(sub.reject);
    } else if (type === "EOSE" && typeof id === "string") {
      const sub = this.subscriptions.get(id);
      if (sub && !sub.retryAfterAuth && !(this.authId && !this.authenticated))
        sub.pending.then(sub.eose, sub.reject);
    } else if (type === "CLOSED" && typeof id === "string") {
      const sub = this.subscriptions.get(id);
      if (!sub) return;
      if (String(value).startsWith("auth-required:"))
        this.retryAuthenticated(sub);
      else sub.reject(new Error("Relay closed subscription"));
    }
  }
  subscribe(
    filter: Filter,
    receive: (event: Event) => Promise<void>,
    live = false
  ) {
    let id = crypto.randomUUID();
    const close = () => {
      clearTimeout(timer);
      this.subscriptions.delete(id);
      if (this.socket?.readyState === WebSocket.OPEN) this.send(["CLOSE", id]);
    };
    let timer: ReturnType<typeof setTimeout>;
    const eose = new Promise<void>((resolve, reject) => {
      const sub: Subscription = {
        message: ["REQ", id, filter],
        filter,
        receive,
        live,
        pending: Promise.resolve(),
        retryAfterAuth: !!this.authId && !this.authenticated,
        renewSubscription: () => {
          // Relays may suppress an identical REQ on an existing subscription.
          // A fresh ID also prevents a late pre-auth EOSE completing this query.
          close();
          id = crypto.randomUUID();
          sub.message[1] = id;
          this.subscriptions.set(id, sub);
          timer = setTimeout(
            () =>
              sub.reject(new Error("Relay did not complete synchronization")),
            this.timeout
          );
        },
        eose: () => {
          clearTimeout(timer);
          if (!live) close();
          resolve();
        },
        reject: (error) => {
          close();
          reject(error);
          if (live) this.onDisconnect?.();
        },
      };
      timer = setTimeout(
        () => sub.reject(new Error("Relay did not complete synchronization")),
        this.timeout
      );
      this.subscriptions.set(id, sub);
      try {
        this.send(sub.message);
      } catch (error) {
        sub.reject(error as Error);
      }
    });
    return { eose, close };
  }
  async query(filter: Filter) {
    const events = new Map<string, Event>();
    await this.subscribe(filter, async (event) => {
      events.set(event.id, event);
    }).eose;
    return [...events.values()];
  }
  publish(event: Event): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => finish(new Error("Relay publication acknowledgement timed out")),
        this.timeout
      );
      const finish = (error?: Error) => {
        clearTimeout(timer);
        this.publications.delete(event.id);
        error ? reject(error) : resolve();
      };
      const pending = {
        message: ["EVENT", event],
        resolve: () => finish(),
        reject: (error: Error) => finish(error),
      };
      this.publications.set(event.id, pending);
      try {
        this.send(pending.message);
      } catch (error) {
        finish(error as Error);
      }
    });
  }
}

export async function publishToRelays(event: Event, urls: string[]) {
  const relays = normalizeRelayUrls(urls);
  if (!relays.length) throw new Error("No recipient relay is available");
  const results = await Promise.all(
    relays.map(async (url) => {
      const relay = new PaymentRelay(url);
      try {
        await relay.connect();
        await relay.publish(event);
        return { url, accepted: true };
      } catch {
        return { url, accepted: false };
      } finally {
        relay.close();
      }
    })
  );
  const accepted = results.filter((r) => r.accepted).map((r) => r.url);
  if (!accepted.length)
    throw new Error(
      "No relay acknowledged the payment. The saved payment can be retried."
    );
  return {
    accepted,
    failed: results.filter((r) => !r.accepted).map((r) => r.url),
  };
}

export async function resolveInboxRelays(
  pubkey: string,
  hints: string[],
  discovery: string[]
) {
  const sources = normalizeRelayUrls([...hints, ...discovery]);
  if (!sources.length)
    throw new Error("No relay is available for inbox discovery");
  const results = await Promise.all(
    sources.map(async (url) => {
      const relay = new PaymentRelay(url);
      try {
        await relay.connect();
        return {
          complete: true,
          events: await relay.query({
            kinds: [10050],
            authors: [pubkey],
            limit: 1,
          }),
        };
      } catch {
        return { complete: false, events: [] as Event[] };
      } finally {
        relay.close();
      }
    })
  );
  const lists = results
    .flatMap((r) => r.events)
    .sort((a, b) => b.created_at - a.created_at || a.id.localeCompare(b.id));
  if (lists.length) {
    const relays = normalizeRelayUrls(
      lists[0].tags.filter((t) => t[0] === "relay").map((t) => t[1])
    );
    if (!relays.length)
      throw new Error("Recipient's advertised inbox has no usable relays");
    return relays;
  }
  if (results.some((r) => !r.complete))
    throw new Error(
      "Inbox discovery is incomplete. Retry when the relays are reachable."
    );
  if (!hints.length)
    throw new Error("Recipient has no advertised or legacy inbox relays");
  return normalizeRelayUrls(hints);
}
