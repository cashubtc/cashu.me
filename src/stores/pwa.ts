import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type PwaDisplayMode = "browser" | "standalone" | "twa";

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<() => void>();

function notifyPromptListeners() {
  promptListeners.forEach((listener) => listener());
}

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const standaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
  return standaloneMedia || (navigator as any).standalone === true;
}

function readDisplayMode(): PwaDisplayMode {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return "browser";
  }
  if (document.referrer.startsWith("android-app://")) {
    return "twa";
  }
  if (isStandaloneDisplay()) {
    return "standalone";
  }
  return "browser";
}

function detectIos(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

function detectAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return /android/.test(window.navigator.userAgent.toLowerCase());
}

function isNativeCapacitor(): boolean {
  return typeof window !== "undefined" && !!(window as any).Capacitor;
}

function migrateLegacyDismissFlags(bannerDismissed: boolean): boolean {
  if (bannerDismissed || typeof localStorage === "undefined") {
    return bannerDismissed;
  }
  const iosSeen = localStorage.getItem("cashu.ui.showIosPWAPrompt") === "seen";
  const androidSeen =
    localStorage.getItem("cashu.ui.showAndroidPWAPrompt") === "seen";
  return iosSeen || androidSeen;
}

// Capture beforeinstallprompt as early as this module is imported.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notifyPromptListeners();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notifyPromptListeners();
  });
}

export const usePwaStore = defineStore("pwa", {
  state: () => ({
    canPromptInstall: deferredPrompt !== null,
    isInstalled: isStandaloneDisplay(),
    isInstalling: false,
    bannerDismissed: useLocalStorage<boolean>(
      "cashu.ui.pwaBannerDismissed",
      false
    ),
    _initialized: false,
  }),
  getters: {
    displayMode(): PwaDisplayMode {
      return readDisplayMode();
    },
    isIos(): boolean {
      return detectIos();
    },
    isAndroid(): boolean {
      return detectAndroid();
    },
    /** True when the home-screen install banner should be shown. */
    showBanner(state): boolean {
      if (isNativeCapacitor()) return false;
      if (state.isInstalled || state.bannerDismissed) return false;
      if (this.displayMode !== "browser") return false;
      return this.isIos || this.isAndroid;
    },
  },
  actions: {
    init() {
      if (this._initialized) return;
      this._initialized = true;

      if (migrateLegacyDismissFlags(this.bannerDismissed)) {
        this.bannerDismissed = true;
      }

      this.canPromptInstall = deferredPrompt !== null;
      this.isInstalled = isStandaloneDisplay();

      const onPromptChange = () => {
        this.canPromptInstall = deferredPrompt !== null;
        if (isStandaloneDisplay()) {
          this.isInstalled = true;
          this.isInstalling = false;
        }
      };
      promptListeners.add(onPromptChange);

      const onAppInstalled = () => {
        this.isInstalled = true;
        this.isInstalling = false;
        this.canPromptInstall = false;
        deferredPrompt = null;
      };
      window.addEventListener("appinstalled", onAppInstalled);

      const media = window.matchMedia("(display-mode: standalone)");
      const onDisplayModeChange = (event: MediaQueryListEvent) => {
        if (event.matches) {
          this.isInstalled = true;
          this.isInstalling = false;
        }
      };
      media.addEventListener("change", onDisplayModeChange);
    },
    dismissBanner() {
      this.bannerDismissed = true;
    },
    async promptInstall(): Promise<"accepted" | "dismissed" | null> {
      if (!deferredPrompt) return null;
      const promptEvent = deferredPrompt;
      deferredPrompt = null;
      this.canPromptInstall = false;
      this.isInstalling = true;

      // Clear installing state if appinstalled never fires.
      const installTimeout = window.setTimeout(() => {
        if (!isStandaloneDisplay()) {
          this.isInstalling = false;
        }
      }, 15000);

      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === "accepted") {
          this.dismissBanner();
        } else {
          window.clearTimeout(installTimeout);
          this.isInstalling = false;
        }
        return outcome;
      } catch {
        window.clearTimeout(installTimeout);
        this.isInstalling = false;
        return null;
      }
    },
  },
});
