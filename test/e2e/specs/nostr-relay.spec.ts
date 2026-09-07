import { expect, test } from "@playwright/test";
import { WebSocket } from "ws";
import { finalizeEvent, generateSecretKey, getPublicKey } from "nostr-tools";

test("real NIP-42 relay hides gift wraps from anonymous readers and acknowledges recipient authentication", async () => {
  const relay = "ws://127.0.0.1:7778/";
  const key = generateSecretKey();
  const recipient = getPublicKey(key);
  const wrap = finalizeEvent(
    {
      kind: 1059,
      created_at: Math.floor(Date.now() / 1000) - 86400,
      tags: [["p", recipient]],
      content: "synthetic relay authorization fixture",
    },
    generateSecretKey()
  );
  const socket = new WebSocket(relay);
  let challenge = "";
  let authId = "";
  const anonymous: string[] = [];
  const authenticated: string[] = [];
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Relay authorization test timed out")),
        10000
      );
      const fail = (error: Error) => {
        clearTimeout(timer);
        reject(error);
      };
      socket.on("error", fail);
      socket.on("open", () => socket.send(JSON.stringify(["EVENT", wrap])));
      socket.on("message", (raw) => {
        const frame = JSON.parse(String(raw));
        if (frame[0] === "AUTH") challenge = frame[1];
        if (frame[0] === "OK") {
          if (!frame[2]) {
            fail(
              new Error("Relay rejected test publication or authentication")
            );
            return;
          }
          if (frame[1] === wrap.id)
            socket.send(
              JSON.stringify(["REQ", "anonymous", { ids: [wrap.id] }])
            );
          if (frame[1] === authId)
            socket.send(
              JSON.stringify(["REQ", "authenticated", { ids: [wrap.id] }])
            );
        }
        if (frame[0] === "EVENT")
          (frame[1] === "anonymous" ? anonymous : authenticated).push(
            frame[2].id
          );
        if (frame[0] === "EOSE" && frame[1] === "anonymous") {
          socket.send(JSON.stringify(["CLOSE", "anonymous"]));
          const auth = finalizeEvent(
            {
              kind: 22242,
              content: "",
              tags: [
                ["relay", relay],
                ["challenge", challenge],
              ],
              created_at: Math.floor(Date.now() / 1000),
            },
            key
          );
          authId = auth.id;
          socket.send(JSON.stringify(["AUTH", auth]));
        }
        if (frame[0] === "EOSE" && frame[1] === "authenticated") {
          clearTimeout(timer);
          resolve();
        }
      });
    });
    expect(anonymous).toEqual([]);
    expect(authenticated).toEqual([wrap.id]);
  } finally {
    socket.close();
  }
});
