import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WebSocketServer, WebSocket as NodeWebSocket } from "ws";
import {
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
  verifyEvent,
} from "nostr-tools";
import {
  PaymentRelay,
  publishToRelays,
  resolveInboxRelays,
} from "src/js/paymentRelay";

const servers: WebSocketServer[] = [];
const clients: PaymentRelay[] = [];
const deferred = <T = void>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { resolve, promise };
};
async function server(
  handler: (socket: NodeWebSocket, frame: any[]) => void,
  autoAuth = true
) {
  const ws = new WebSocketServer({ host: "127.0.0.1", port: 0 });
  servers.push(ws);
  await new Promise<void>((done, reject) => {
    ws.once("listening", done);
    ws.once("error", reject);
  });
  ws.on("connection", (socket) => {
    socket.send(JSON.stringify(["AUTH", "test-challenge"]));
    socket.on("message", (data) => {
      const frame = JSON.parse(data.toString());
      if (autoAuth && frame[0] === "AUTH")
        socket.send(JSON.stringify(["OK", frame[1].id, true, ""]));
      handler(socket, frame);
    });
  });
  return `ws://127.0.0.1:${(ws.address() as { port: number }).port}/`;
}
function client(url: string, key?: Uint8Array) {
  const relay = new PaymentRelay(url, key, 250);
  clients.push(relay);
  return relay;
}
const event = () =>
  finalizeEvent(
    {
      kind: 1,
      tags: [],
      content: "synthetic protocol test",
      created_at: Math.floor(Date.now() / 1000),
    },
    generateSecretKey()
  );

describe("payment relay acknowledgements and authentication", () => {
  beforeEach(() => vi.stubGlobal("WebSocket", NodeWebSocket));
  afterEach(async () => {
    for (const relay of clients.splice(0)) relay.close();
    for (const ws of servers.splice(0)) {
      for (const socket of ws.clients) socket.terminate();
      await new Promise<void>((done) => ws.close(() => done()));
    }
    vi.unstubAllGlobals();
  });
  it("does not resolve a publish until the relay acknowledges it", async () => {
    const received = deferred<{ socket: NodeWebSocket; id: string }>();
    const url = await server((socket, frame) => {
      if (frame[0] === "EVENT") received.resolve({ socket, id: frame[1].id });
    });
    const relay = client(url);
    await relay.connect();
    let resolved = false;
    const sent = relay.publish(event()).then(() => {
      resolved = true;
    });
    const pending = await received.promise;
    expect(resolved).toBe(false);
    pending.socket.send(JSON.stringify(["OK", pending.id, true, ""]));
    await sent;
    expect(resolved).toBe(true);
  });
  it("propagates publication rejection and rejects zero successful relays", async () => {
    const url = await server((socket, frame) => {
      if (frame[0] === "EVENT")
        socket.send(
          JSON.stringify(["OK", frame[1].id, false, "blocked: test"])
        );
    });
    await expect(publishToRelays(event(), [url])).rejects.toThrow(
      "No relay acknowledged"
    );
    await expect(publishToRelays(event(), [])).rejects.toThrow("No recipient");
  });
  it("does not turn a missing EOSE into successful history coverage", async () => {
    const url = await server(() => {});
    const relay = client(url);
    await relay.connect();
    await expect(relay.query({ kinds: [1] })).rejects.toThrow(
      "did not complete"
    );
  });
  it("waits for durable event handling even when EOSE arrives immediately", async () => {
    const started = deferred();
    const persist = deferred();
    const url = await server((socket, frame) => {
      if (frame[0] === "REQ") {
        socket.send(JSON.stringify(["EVENT", frame[1], event()]));
        socket.send(JSON.stringify(["EOSE", frame[1]]));
      }
    });
    const relay = client(url);
    await relay.connect();
    let done = false;
    const sub = relay.subscribe({ kinds: [1] }, async () => {
      started.resolve();
      await persist.promise;
    });
    const finished = sub.eose.then(() => {
      done = true;
    });
    await started.promise;
    expect(done).toBe(false);
    persist.resolve();
    await finished;
    expect(done).toBe(true);
  });
  it("authenticates with the recipient key and resubscribes after auth-required", async () => {
    const key = generateSecretKey();
    let auth: any;
    let requests = 0;
    const url = await server((socket, frame) => {
      if (frame[0] === "AUTH") auth = frame[1];
      if (frame[0] === "REQ") {
        requests++;
        if (requests === 1) {
          socket.send(
            JSON.stringify(["CLOSED", frame[1], "auth-required: inbox"])
          );
          socket.send(JSON.stringify(["OK", auth.id, true, ""]));
        } else socket.send(JSON.stringify(["EOSE", frame[1]]));
      }
    }, false);
    const relay = client(url, key);
    await relay.connect();
    await relay.query({ kinds: [1059], "#p": [getPublicKey(key)] });
    expect(requests).toBe(2);
    expect(auth.pubkey).toBe(getPublicKey(key));
    expect(verifyEvent(auth)).toBe(true);
    expect(auth.tags).toContainEqual(["relay", url]);
    expect(auth.tags).toContainEqual(["challenge", "test-challenge"]);
  });
  it("uses the verified inbox list instead of legacy relay hints", async () => {
    const key = generateSecretKey();
    const advertised = "wss://inbox.example/";
    const list = finalizeEvent(
      {
        kind: 10050,
        tags: [["relay", advertised]],
        content: "",
        created_at: Math.floor(Date.now() / 1000),
      },
      key
    );
    const url = await server((socket, frame) => {
      if (frame[0] === "REQ") {
        socket.send(JSON.stringify(["EVENT", frame[1], list]));
        socket.send(JSON.stringify(["EOSE", frame[1]]));
      }
    });
    expect(await resolveInboxRelays(getPublicKey(key), [url], [])).toEqual([
      advertised,
    ]);
  });
  it("uses a new subscription after authentication and ignores late pre-auth EOSE", async () => {
    let auth: any;
    let firstId = "";
    let secondId = "";
    const expected = event();
    const url = await server((socket, frame) => {
      if (frame[0] === "AUTH") auth = frame[1];
      if (frame[0] === "REQ") {
        if (!firstId) {
          firstId = frame[1];
          socket.send(JSON.stringify(["EOSE", firstId]));
          socket.send(JSON.stringify(["OK", auth.id, true, ""]));
        } else if (frame[1] !== firstId) {
          secondId = frame[1];
          socket.send(JSON.stringify(["EOSE", firstId]));
          socket.send(JSON.stringify(["EVENT", secondId, expected]));
          socket.send(JSON.stringify(["EOSE", secondId]));
        }
      }
    }, false);
    const relay = client(url);
    await relay.connect();
    expect((await relay.query({ kinds: [1] })).map((e) => e.id)).toEqual([
      expected.id,
    ]);
    expect(secondId).not.toBe(firstId);
  });
  it("falls back to explicit hints only after a completed empty lookup", async () => {
    const url = await server((socket, frame) => {
      if (frame[0] === "REQ") socket.send(JSON.stringify(["EOSE", frame[1]]));
    });
    expect(
      await resolveInboxRelays(getPublicKey(generateSecretKey()), [url], [])
    ).toEqual([url]);
  });
});
