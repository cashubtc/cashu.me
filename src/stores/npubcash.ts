import type { MintQuoteState } from "@cashu/cashu-ts";
import NDK, { NDKEvent } from "@nostr-dev-kit/ndk";
import { StorageSerializers, useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { date } from "quasar";
import { nip19 } from "nostr-tools";
import { markRaw } from "vue";
import { notifyApiError, notifyError } from "src/js/notify";
import { useTransactionWorkerStore } from "src/stores/transactionWorker";
import { useMintsStore } from "src/stores/mints";
import { useNostrStore } from "src/stores/nostr";
import { useWalletStore } from "src/stores/wallet";

type NpubCashUser = {
  lockQuote: boolean;
  mintUrl: string;
  name?: string;
  pubkey: string;
};

type NpubCashInfoResponse =
  | {
      error: true;
      message: string;
    }
  | {
      error: false;
      data: {
        user: NpubCashUser;
      };
    };

type NpubCashUsernameResponse =
  | { error: true; message: string }
  | { error: false; data: { user: NpubCashUser } };

type NpubCashQuote = {
  createdAt: number;
  paidAt: number;
  expiresAt: number;
  mintUrl: string;
  quoteId: string;
  request: string;
  amount: number;
  state: MintQuoteState;
  locked: boolean;
};

type NpubCashQuoteResponse =
  | {
      error: true;
      message: string;
    }
  | {
      error: false;
      data: {
        quotes: NpubCashQuote[];
      };
      metadata: { limit: number; total: number; since?: number };
    };

type UsernameQuote = { username: string; creq: string };

const NPUB_CASH_BASE_URL = "npub.cash";
const NPUB_CASH_HTTP_URL = `https://${NPUB_CASH_BASE_URL}`;
const NPUB_CASH_QUOTES_URL = `${NPUB_CASH_HTTP_URL}/api/v2/wallet/quotes`;
const NPUB_CASH_WS_URL = `wss://${NPUB_CASH_BASE_URL}/api/v2/ws/quote`;
const NPUB_CASH_STORAGE_VERSION = "1";
const NPUB_CASH_STORAGE_PREFIX = "cashu.npubcash";
const NIP_98_KIND = 27235;
const QUOTE_PAGE_SIZE = 50;
const QUOTE_SYNC_DEBOUNCE_MS = 250;
const QUOTE_RECONNECT_MAX_MS = 30_000;

const legacyStorageKeys = [
  "cashu.npc.enabled",
  "cashu.npc.lastCheck",
  "cashu.npc.automaticClaim",
  "cashu.npc.connections",
  "cashu.npc.address",
  "cashu.npc.domain",
  "cashu.npc.baseURL",
  "cashu.npc.v2.enabled",
  "cashu.npc.v2.claimAutomatically",
  "cashu.npc.v2.lastCheck",
  "cashu.npc.v2.address",
  "cashu.npc.v2.mint",
  "cashu.npc.v2.baseURL",
];

function readStoredBoolean(key: string): boolean | undefined {
  const value = localStorage.getItem(key);
  return value === null ? undefined : value === "true";
}

function readStoredNumber(key: string): number | null {
  const value = localStorage.getItem(key);
  if (value === null || value === "null") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readStoredString(key: string): string | null {
  const value = localStorage.getItem(key);
  return value === null || value === "null" || value === "" ? null : value;
}

function migrateNpubCashStorage() {
  if (
    typeof localStorage === "undefined" ||
    localStorage.getItem(`${NPUB_CASH_STORAGE_PREFIX}.storageVersion`) ===
      NPUB_CASH_STORAGE_VERSION
  ) {
    return;
  }

  const legacyV1Enabled = readStoredBoolean("cashu.npc.enabled") ?? false;
  const legacyV2Enabled = readStoredBoolean("cashu.npc.v2.enabled") ?? false;
  const legacyV1ClaimAutomatically = readStoredBoolean(
    "cashu.npc.automaticClaim"
  );
  const legacyV2ClaimAutomatically = readStoredBoolean(
    "cashu.npc.v2.claimAutomatically"
  );

  let claimAutomatically = true;
  if (legacyV2Enabled) {
    claimAutomatically = legacyV2ClaimAutomatically ?? true;
  } else if (legacyV1Enabled) {
    claimAutomatically = legacyV1ClaimAutomatically ?? true;
  } else {
    claimAutomatically =
      legacyV2ClaimAutomatically ?? legacyV1ClaimAutomatically ?? true;
  }

  localStorage.setItem(
    `${NPUB_CASH_STORAGE_PREFIX}.enabled`,
    String(legacyV1Enabled || legacyV2Enabled)
  );
  localStorage.setItem(
    `${NPUB_CASH_STORAGE_PREFIX}.claimAutomatically`,
    String(claimAutomatically)
  );

  const lastCheck = readStoredNumber("cashu.npc.v2.lastCheck");
  if (lastCheck === null) {
    localStorage.removeItem(`${NPUB_CASH_STORAGE_PREFIX}.lastCheck`);
  } else {
    localStorage.setItem(
      `${NPUB_CASH_STORAGE_PREFIX}.lastCheck`,
      String(lastCheck)
    );
  }

  localStorage.setItem(`${NPUB_CASH_STORAGE_PREFIX}.address`, "");
  const mintUrl = readStoredString("cashu.npc.v2.mint");
  if (mintUrl === null) {
    localStorage.removeItem(`${NPUB_CASH_STORAGE_PREFIX}.mintUrl`);
  } else {
    localStorage.setItem(`${NPUB_CASH_STORAGE_PREFIX}.mintUrl`, mintUrl);
  }

  localStorage.setItem(
    `${NPUB_CASH_STORAGE_PREFIX}.storageVersion`,
    NPUB_CASH_STORAGE_VERSION
  );
  legacyStorageKeys.forEach((key) => localStorage.removeItem(key));
}

export const useNpubCashStore = defineStore("npubCash", {
  state: () => {
    migrateNpubCashStorage();
    return {
      enabled: useLocalStorage<boolean>(
        `${NPUB_CASH_STORAGE_PREFIX}.enabled`,
        false
      ),
      claimAutomatically: useLocalStorage<boolean>(
        `${NPUB_CASH_STORAGE_PREFIX}.claimAutomatically`,
        true
      ),
      lastCheck: useLocalStorage<number | null>(
        `${NPUB_CASH_STORAGE_PREFIX}.lastCheck`,
        null,
        { serializer: StorageSerializers.number }
      ),
      address: useLocalStorage<string>(
        `${NPUB_CASH_STORAGE_PREFIX}.address`,
        ""
      ),
      mintUrl: useLocalStorage<string | null>(
        `${NPUB_CASH_STORAGE_PREFIX}.mintUrl`,
        null
      ),
      loading: false,
      quoteSocket: null as WebSocket | null,
      quoteSyncPromise: null as Promise<void> | null,
      quoteSyncRequested: false,
      quoteSyncTimer: null as ReturnType<typeof setTimeout> | null,
      quoteReconnectTimer: null as ReturnType<typeof setTimeout> | null,
      quoteReconnectAttempt: 0,
      quoteResumeHandler: null as (() => void) | null,
    };
  },
  actions: {
    initializeNpubCash: async function () {
      if (!this.enabled) {
        this.stopQuoteUpdates();
        return;
      }
      const nostrStore = useNostrStore();
      await nostrStore.initSignerIfNotSet();
      await this.refreshNpubCashConnection();
      await this.synchronizeQuotes();
      this.startQuoteUpdates();
    },
    refreshNpubCashConnection: async function () {
      if (!this.enabled) {
        return;
      }
      const nostrStore = useNostrStore();
      const mintsStore = useMintsStore();
      if (!nostrStore.pubkey) {
        return;
      }
      const walletPublicKeyHex = nostrStore.pubkey;
      this.address =
        nip19.npubEncode(walletPublicKeyHex) + "@" + NPUB_CASH_BASE_URL;
      this.loading = true;
      try {
        const previousAddress = this.address;
        const info = await this.getInfo();
        if (info.name) {
          const usernameAddress = info.name + "@" + NPUB_CASH_BASE_URL;
          if (previousAddress !== usernameAddress) {
            console.log(`[npub.cash] Logged in as ${info.name}`);
          }
          this.address = usernameAddress;
        }
        if (mintsStore.mints.map((mint) => mint.url).includes(info.mintUrl)) {
          this.mintUrl = info.mintUrl;
        } else if (mintsStore.activeMintUrl) {
          await this.changeMintUrl(mintsStore.activeMintUrl);
        } else {
          await mintsStore.addMint({ url: info.mintUrl });
          this.mintUrl = info.mintUrl;
        }
      } catch (error) {
        if (error instanceof Error) {
          notifyApiError(error);
        }
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    getInfo: async function (): Promise<NpubCashUser> {
      try {
        const response = await this.sendAuthedRequest(
          `${NPUB_CASH_HTTP_URL}/api/v2/user/info`
        );
        const info: NpubCashInfoResponse = await response.json();
        if (info.error) {
          notifyError(info.message);
          throw new Error(info.message);
        }
        return info.data.user;
      } catch (error) {
        console.error(error);
        return {
          mintUrl: "",
          name: "",
          pubkey: "",
          lockQuote: false,
        };
      }
    },
    changeMintUrl: async function (mintUrl: string) {
      const mintsStore = useMintsStore();
      if (!mintsStore.mints.find((mint) => mint.url === mintUrl)) {
        notifyError(
          `Please make sure ${mintUrl} is added to your wallet first!`,
          "Could not update npub.cash mint"
        );
        return;
      }
      try {
        const response = await this.sendAuthedRequest(
          `${NPUB_CASH_HTTP_URL}/api/v2/user/mint`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            method: "PATCH",
            body: JSON.stringify({ mint_url: mintUrl }),
          }
        );
        const data = await response.json();
        if (data.error) {
          throw new Error(data.message);
        }
        this.mintUrl = data.data.user.mintUrl;
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          notifyError(error.message);
        } else {
          notifyError("Something went wrong!");
        }
      }
    },
    synchronizeQuotes: async function (): Promise<void> {
      if (!this.enabled) return;
      if (this.quoteSyncPromise) {
        this.quoteSyncRequested = true;
        return this.quoteSyncPromise;
      }

      this.quoteSyncRequested = true;
      const syncPromise = (async () => {
        do {
          this.quoteSyncRequested = false;
          await this.fetchAndQueueQuotes();
        } while (this.enabled && this.quoteSyncRequested);
      })().finally(() => {
        if (this.quoteSyncPromise === syncPromise) {
          this.quoteSyncPromise = null;
        }
      });
      this.quoteSyncPromise = syncPromise;
      return syncPromise;
    },
    fetchAndQueueQuotes: async function () {
      if (!this.enabled) return;
      const transactionWorkerStore = useTransactionWorkerStore();
      const walletStore = useWalletStore();
      try {
        const quotes: NpubCashQuote[] = [];
        const seenQuotes = new Set<string>();
        let offset = 0;
        let total = 0;

        do {
          const params = new URLSearchParams({
            limit: String(QUOTE_PAGE_SIZE),
            offset: String(offset),
          });
          // Re-read the previous second so quotes sharing a paidAt timestamp
          // cannot fall through the strict `since` boundary.
          if (this.lastCheck !== null) {
            params.set("since", String(Math.max(0, this.lastCheck - 1)));
          }
          const response = await this.sendAuthedRequest(
            `${NPUB_CASH_QUOTES_URL}?${params.toString()}`,
            undefined,
            NPUB_CASH_QUOTES_URL
          );
          if (!response.ok) {
            throw new Error(`npub.cash quote sync failed (${response.status})`);
          }
          const responseData: NpubCashQuoteResponse = await response.json();
          if (responseData.error) throw new Error(responseData.message);

          const page = responseData.data.quotes;
          total = responseData.metadata.total;
          for (const quote of page) {
            const key = `${quote.mintUrl}|${quote.quoteId}`;
            if (!seenQuotes.has(key)) {
              seenQuotes.add(key);
              quotes.push(quote);
            }
          }
          offset += page.length;
          if (page.length === 0) break;
        } while (offset < total);

        if (!this.enabled) return;
        let latestQuoteTime: number | undefined;
        let queuedQuotes = false;
        for (const quote of quotes) {
          const paidAt = quote.paidAt || quote.createdAt;
          if (!latestQuoteTime || latestQuoteTime < paidAt) {
            latestQuoteTime = paidAt;
          }
          if (
            walletStore.invoiceHistory.find(
              (invoice) =>
                invoice.quote === quote.quoteId &&
                invoice.mint === quote.mintUrl
            )
          ) {
            continue;
          }
          const invoice = {
            label: "Zap",
            mint: quote.mintUrl,
            memo: "",
            request: quote.request,
            amount: quote.amount,
            quote: quote.quoteId,
            date: date.formatDate(
              new Date(quote.createdAt * 1000),
              "YYYY-MM-DD HH:mm:ss"
            ),
            status: "pending" as const,
            unit: "sat",
            mintQuote: {
              request: quote.request,
              quote: quote.quoteId,
              state: quote.state,
              expiry: quote.expiresAt,
              amount: quote.amount,
              unit: "sat",
            },
          };
          await walletStore.addPaymentHistory(invoice);
          if (this.claimAutomatically) {
            transactionWorkerStore.queueIncomingMintQuote(invoice);
            queuedQuotes = true;
          }
        }
        if (latestQuoteTime) {
          this.lastCheck = latestQuoteTime;
        }
        if (queuedQuotes) {
          await transactionWorkerStore.processIncomingTransactionsNow(
            walletStore
          );
        }
      } catch (error) {
        console.error(error);
      }
    },
    scheduleQuoteSync: function (delay = QUOTE_SYNC_DEBOUNCE_MS) {
      if (!this.enabled) return;
      if (this.quoteSyncTimer) clearTimeout(this.quoteSyncTimer);
      this.quoteSyncTimer = setTimeout(() => {
        this.quoteSyncTimer = null;
        void this.synchronizeQuotes();
      }, delay);
    },
    startQuoteUpdates: function () {
      if (!this.enabled || typeof WebSocket === "undefined") return;
      if (!this.quoteResumeHandler) {
        this.quoteResumeHandler = () => {
          if (!this.enabled || document.visibilityState === "hidden") return;
          // Browsers may keep a stale OPEN socket after a device resumes.
          const socket = this.quoteSocket;
          this.quoteSocket = null;
          if (socket) socket.close(1000);
          this.connectQuoteUpdates();
          this.scheduleQuoteSync(0);
        };
        window.addEventListener("online", this.quoteResumeHandler);
        document.addEventListener("visibilitychange", this.quoteResumeHandler);
      }
      this.connectQuoteUpdates();
    },
    connectQuoteUpdates: function () {
      if (!this.enabled || typeof WebSocket === "undefined") return;
      if (
        this.quoteSocket &&
        (this.quoteSocket.readyState === WebSocket.CONNECTING ||
          this.quoteSocket.readyState === WebSocket.OPEN)
      ) {
        return;
      }
      if (this.quoteReconnectTimer) {
        clearTimeout(this.quoteReconnectTimer);
        this.quoteReconnectTimer = null;
      }

      try {
        const socket = markRaw(new WebSocket(NPUB_CASH_WS_URL));
        this.quoteSocket = socket;
        socket.onmessage = (event) => {
          void this.handleQuoteSocketMessage(socket, event.data);
        };
        socket.onerror = () => {
          socket.close();
        };
        socket.onclose = () => {
          if (this.quoteSocket !== socket) return;
          this.quoteSocket = null;
          this.scheduleQuoteReconnect();
        };
      } catch (error) {
        console.error("Could not connect to npub.cash quote updates", error);
        this.quoteSocket = null;
        this.scheduleQuoteReconnect();
      }
    },
    handleQuoteSocketMessage: async function (
      socket: WebSocket,
      rawMessage: unknown
    ) {
      if (typeof rawMessage !== "string") return;
      try {
        const message = JSON.parse(rawMessage);
        if (message.type === "challenge") {
          const payload = message.payload;
          const usesPayloadProtocol =
            payload !== null && typeof payload === "object";
          const authUrl = usesPayloadProtocol ? payload.url : NPUB_CASH_WS_URL;
          const method = usesPayloadProtocol ? payload.method : "GET";
          const parsedAuthUrl = new URL(authUrl);
          const expectedAuthUrl = new URL(NPUB_CASH_WS_URL);
          if (
            !["https:", "wss:"].includes(parsedAuthUrl.protocol) ||
            parsedAuthUrl.hostname !== expectedAuthUrl.hostname ||
            parsedAuthUrl.port !== expectedAuthUrl.port ||
            parsedAuthUrl.pathname !== expectedAuthUrl.pathname
          ) {
            throw new Error("Refusing an unexpected npub.cash auth URL");
          }
          const token = await this.generateNip98Event(authUrl, method || "GET");
          if (
            this.quoteSocket !== socket ||
            socket.readyState !== WebSocket.OPEN
          ) {
            return;
          }
          socket.send(
            JSON.stringify(
              usesPayloadProtocol
                ? {
                    type: "challenge-response",
                    payload: `Nostr ${token}`,
                  }
                : { type: "auth", token: `Nostr ${token}` }
            )
          );
          return;
        }
        if (message.type === "ok" || message.type === "challenge-success") {
          this.quoteReconnectAttempt = 0;
          // This second catch-up closes the gap between the startup REST fetch
          // and successful WebSocket authentication.
          this.scheduleQuoteSync(0);
          return;
        }
        if (message.type === "update") {
          const quoteId = message.quoteId || message.payload?.quoteId;
          if (quoteId) this.scheduleQuoteSync();
          return;
        }
        if (message.type === "error") {
          socket.close();
        }
      } catch (error) {
        const errorDetails =
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : String(error);
        console.error(
          `Could not handle npub.cash quote update: ${errorDetails}`
        );
        socket.close();
      }
    },
    scheduleQuoteReconnect: function () {
      if (!this.enabled || this.quoteReconnectTimer) return;
      const baseDelay = Math.min(
        1_000 * 2 ** this.quoteReconnectAttempt,
        QUOTE_RECONNECT_MAX_MS
      );
      const delay = Math.round(baseDelay * (0.75 + Math.random() * 0.5));
      this.quoteReconnectAttempt += 1;
      this.quoteReconnectTimer = setTimeout(() => {
        this.quoteReconnectTimer = null;
        this.connectQuoteUpdates();
      }, delay);
    },
    stopQuoteUpdates: function () {
      if (this.quoteSyncTimer) clearTimeout(this.quoteSyncTimer);
      if (this.quoteReconnectTimer) clearTimeout(this.quoteReconnectTimer);
      this.quoteSyncTimer = null;
      this.quoteReconnectTimer = null;
      this.quoteSyncRequested = false;
      this.quoteReconnectAttempt = 0;

      const socket = this.quoteSocket;
      this.quoteSocket = null;
      if (socket) socket.close(1000);

      if (this.quoteResumeHandler) {
        window.removeEventListener("online", this.quoteResumeHandler);
        document.removeEventListener(
          "visibilitychange",
          this.quoteResumeHandler
        );
        this.quoteResumeHandler = null;
      }
    },
    getUsernameQuote: async function (
      username: string
    ): Promise<UsernameQuote> {
      const response = await this.sendAuthedRequest(
        `${NPUB_CASH_HTTP_URL}/api/v2/user/username`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        }
      );
      const data = (await response.json()) as NpubCashUsernameResponse;
      if (data.error) {
        if (response.status === 402) {
          const paymentHeader = response.headers.get("X-Cashu");
          if (!paymentHeader) {
            throw new Error("Unexpected reply without payment request");
          }
          return { username, creq: paymentHeader };
        }
        throw new Error(data.message);
      }
      throw new Error("Unexpected reply without payment request");
    },
    setUsername: async function (username: string, token: string) {
      try {
        const response = await this.sendAuthedRequest(
          `${NPUB_CASH_HTTP_URL}/api/v2/user/username`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Cashu": token },
            body: JSON.stringify({ username }),
          }
        );
        const data = (await response.json()) as NpubCashUsernameResponse;
        if (data.error) {
          throw new Error(data.message);
        }
        this.address = `${data.data.user.name}@${NPUB_CASH_BASE_URL}`;
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          notifyError(error.message);
        }
      }
    },
    sendAuthedRequest: async function (
      url: string,
      options?: RequestInit,
      authUrl?: string
    ) {
      const authHeader = await this.generateNip98Event(
        authUrl || url,
        options?.method || "GET"
      );
      return fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          authorization: `Nostr ${authHeader}`,
        },
      });
    },
    generateNip98Event: async function (
      url: string,
      method: string
    ): Promise<string> {
      const nostrStore = useNostrStore();
      await nostrStore.initSignerIfNotSet();
      const nip98Event = new NDKEvent(new NDK());
      nip98Event.kind = NIP_98_KIND;
      nip98Event.content = "";
      nip98Event.tags = [
        ["u", url],
        ["method", method],
      ];
      await nip98Event.sign(nostrStore.signer);
      const eventString = JSON.stringify(nip98Event.rawEvent());
      return btoa(eventString);
    },
  },
});
