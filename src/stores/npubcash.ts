import NDK, { NDKEvent } from "@nostr-dev-kit/ndk";
import { MintQuoteState } from "@cashu/cashu-ts";
import { StorageSerializers, useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { date } from "quasar";
import { nip19 } from "nostr-tools";
import { notifyApiError, notifyError } from "src/js/notify";
import { useTransactionWorkerStore } from "src/stores/transactionWorker";
import { useMintsStore } from "src/stores/mints";
import { useNostrStore } from "src/stores/nostr";
import { useSettingsStore } from "src/stores/settings";
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
  state: string;
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

const NPUB_CASH_BASE_URL = "https://npub.cash";
const NPUB_CASH_DOMAIN = "npub.cash";
const NPUB_CASH_STORAGE_VERSION = "1";
const NPUB_CASH_STORAGE_PREFIX = "cashu.npubcash";
const NIP_98_KIND = 27235;

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
    };
  },
  actions: {
    initializeNpubCash: async function () {
      if (!this.enabled) {
        return;
      }
      const nostrStore = useNostrStore();
      await nostrStore.initSignerIfNotSet();
      await Promise.all([
        this.refreshNpubCashConnection(),
        this.synchronizeQuotes(),
      ]);
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
        nip19.npubEncode(walletPublicKeyHex) + "@" + NPUB_CASH_DOMAIN;
      this.loading = true;
      try {
        const previousAddress = this.address;
        const info = await this.getInfo();
        if (info.name) {
          const usernameAddress = info.name + "@" + NPUB_CASH_DOMAIN;
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
          `${NPUB_CASH_BASE_URL}/api/v2/user/info`
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
          `${NPUB_CASH_BASE_URL}/api/v2/user/mint`,
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
    synchronizeQuotes: async function () {
      if (!this.enabled) {
        return;
      }
      const transactionWorkerStore = useTransactionWorkerStore();
      const settingsStore = useSettingsStore();
      const walletStore = useWalletStore();
      const mintsStore = useMintsStore();
      const since = this.lastCheck ? `?since=${this.lastCheck}` : "";
      const quoteUrl = `${NPUB_CASH_BASE_URL}/api/v2/wallet/quotes`;
      try {
        const response = await this.sendAuthedRequest(
          quoteUrl + since,
          undefined,
          quoteUrl
        );
        const responseData: NpubCashQuoteResponse = await response.json();
        if (responseData.error) {
          return;
        }
        let latestQuoteTime: number | undefined;
        for (const quote of responseData.data.quotes) {
          if (
            walletStore.invoiceHistory.find(
              (invoice) => invoice.quote === quote.quoteId
            )
          ) {
            continue;
          }
          if (!latestQuoteTime || latestQuoteTime < quote.createdAt) {
            latestQuoteTime = quote.createdAt;
          }
          await walletStore.addPaymentHistory({
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
            status: "pending",
            unit: "sat",
            mintQuote: {
              request: quote.request,
              quote: quote.quoteId,
              state: MintQuoteState.PAID,
              expiry: quote.expiresAt,
              amount: quote.amount,
              unit: "sat",
            },
          });
          if (this.claimAutomatically) {
            if (settingsStore.periodicallyCheckIncomingInvoices) {
              const mint = mintsStore.mints.find(
                (item) => item.url === quote.mintUrl
              );
              if (transactionWorkerStore.mintSupportsBolt11Batch(mint)) {
                transactionWorkerStore.addBatchInvoiceToChecker(quote.quoteId);
              } else {
                transactionWorkerStore.addInvoiceToChecker(quote.quoteId);
              }
            } else {
              await walletStore.mintOnPaidBolt11(quote.quoteId);
            }
          }
        }
        if (latestQuoteTime) {
          this.lastCheck = latestQuoteTime;
        }
      } catch (error) {
        console.error(error);
      }
    },
    getUsernameQuote: async function (
      username: string
    ): Promise<UsernameQuote> {
      const response = await this.sendAuthedRequest(
        `${NPUB_CASH_BASE_URL}/api/v2/user/username`,
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
          `${NPUB_CASH_BASE_URL}/api/v2/user/username`,
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
        this.address = `${data.data.user.name}@${NPUB_CASH_DOMAIN}`;
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
