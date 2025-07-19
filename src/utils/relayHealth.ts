import { FREE_RELAYS } from "src/config/relays";

export async function pingRelay(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const ws = new WebSocket(url);
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try {
          ws.close();
        } catch {}
        resolve(false);
      }
    }, 1000);
    ws.onopen = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        ws.close();
        resolve(true);
      }
    };
    ws.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(false);
      }
    };
    ws.onmessage = (ev) => {
      if (
        !settled &&
        typeof ev.data === "string" &&
        ev.data.startsWith("restricted:")
      ) {
        settled = true;
        clearTimeout(timer);
        ws.close();
        resolve(false);
      }
    };
  });
}

export async function filterHealthyRelays(relays: string[]): Promise<string[]> {
  const results = await Promise.all(
    relays.map(async (u) => ((await pingRelay(u)) ? u : null))
  );
  const healthy = results.filter((u): u is string => !!u);
  return healthy.length >= 2 ? healthy : FREE_RELAYS;
}
