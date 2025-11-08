import { installLockdownIconFallback } from "src/js/lockdown-icons";

function isIOS() {
  try {
    // Capacitor preferred when present
    // eslint-disable-next-line no-undef
    if (window?.Capacitor) {
      // eslint-disable-next-line no-undef
      return Capacitor.getPlatform && Capacitor.getPlatform() === "ios";
    }
    const ua = navigator.userAgent || "";
    return /iP(ad|hone|od)/.test(ua);
  } catch {
    return false;
  }
}

async function detectLockdownMode() {
  if (!isIOS()) return false;
  try {
    // Wait until font loading has settled
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  } catch {
    // ignore
  }

  try {
    // When Lockdown Mode is enabled on iOS, custom webfonts cannot be used.
    // We check a common webfont and a ligature font used by Quasar.
    const matOk = document.fonts?.check?.('16px "Material Icons"') || false;
    const interOk = document.fonts?.check?.('16px "Inter"') || false;
    // If neither is available, assume lockdown mode (fonts blocked)
    return !matOk && !interOk;
  } catch {
    return false;
  }
}

function injectInterIfAllowed() {
  try {
    const id = "inter-font-link";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
  } catch {
    // noop
  }
}

export default async () => {
  const lockdown = await detectLockdownMode();
  const root = document.documentElement;
  if (lockdown) {
    root.classList.add("lockdown");
    installLockdownIconFallback();
  } else {
    root.classList.add("no-lockdown");
    // Keep experience unchanged for non-lockdown users by loading Inter dynamically
    injectInterIfAllowed();
  }
};
