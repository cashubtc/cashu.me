import { useUiStore } from "src/stores/ui";
import { useWalletStore } from "src/stores/wallet";
import { useCameraStore } from "src/stores/camera";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { useP2PKStore } from "src/stores/p2pk";
import { usePRStore } from "src/stores/payment-request";
import { useNWCStore } from "src/stores/nwc";
import { useMintsStore } from "src/stores/mints";

/** Overlay ids in close-priority order (deepest / topmost first). */
export type OverlayId =
  | "multinutPayment"
  | "camera"
  | "payInvoice"
  | "sendTokens"
  | "receiveTokens"
  | "createInvoice"
  | "invoiceDetails"
  | "prDialog"
  | "p2pkDialog"
  | "nwcDialog"
  | "addMint"
  | "removeMint"
  | "editMint"
  | "mintInfo"
  | "receiveEcashDrawer"
  | "sendDialog"
  | "receiveDialog";

const walletOverlaySlugs: Record<OverlayId, string> = {
  multinutPayment: "multinut-payment",
  camera: "scan",
  payInvoice: "pay-invoice",
  sendTokens: "send-token",
  receiveTokens: "receive-token",
  createInvoice: "create-invoice",
  invoiceDetails: "invoice-details",
  prDialog: "payment-request",
  p2pkDialog: "p2pk",
  nwcDialog: "nwc",
  addMint: "add-mint",
  removeMint: "remove-mint",
  editMint: "edit-mint",
  mintInfo: "mint-info",
  receiveEcashDrawer: "receive-ecash",
  sendDialog: "send",
  receiveDialog: "receive",
};

const overlayBySlug = Object.entries(walletOverlaySlugs).reduce(
  (acc, [overlay, slug]) => {
    acc[slug] = overlay as OverlayId;
    return acc;
  },
  {} as Record<string, OverlayId>
);

type WalletRouteLike = {
  path?: string;
  params?: {
    walletOverlay?: string | string[];
  };
};

function normalizePath(path?: string | null): string {
  if (!path) {
    return "";
  }

  let normalized = path;
  const hashIndex = normalized.indexOf("#");
  if (hashIndex >= 0) {
    const hashPath = normalized.slice(hashIndex + 1);
    if (hashPath.startsWith("/")) {
      normalized = hashPath;
    }
  }

  normalized = normalized.split("?")[0].split("#")[0];
  normalized = normalized.replace(/\/+$/, "");
  return normalized || "/";
}

export function getWalletOverlayPath(overlay: OverlayId): string {
  return `/wallet/${walletOverlaySlugs[overlay]}`;
}

export function getWalletOverlayLocation(overlay: OverlayId): {
  path: string;
} {
  return {
    path: getWalletOverlayPath(overlay),
  };
}

export function getWalletOverlayFromPath(
  path?: string | null
): OverlayId | null {
  const normalized = normalizePath(path);
  if (!normalized.startsWith("/wallet/")) {
    return null;
  }

  const slug = normalized.slice("/wallet/".length);
  return overlayBySlug[slug] ?? null;
}

export function getWalletOverlayFromRoute(
  route?: WalletRouteLike | null
): OverlayId | null {
  const param = route?.params?.walletOverlay;
  const slug = Array.isArray(param) ? param[0] : param;
  if (slug && overlayBySlug[slug]) {
    return overlayBySlug[slug];
  }

  return getWalletOverlayFromPath(route?.path);
}

export function isWalletHomePath(path?: string | null): boolean {
  return normalizePath(path) === "/";
}

export function isWalletRoute(route?: WalletRouteLike | null): boolean {
  return (
    isWalletHomePath(route?.path) || Boolean(getWalletOverlayFromRoute(route))
  );
}

/**
 * Returns currently open wallet overlays, deepest / topmost first.
 * Call only after Pinia is active (e.g. from a mounted component).
 */
export function getOpenOverlays(): OverlayId[] {
  const uiStore = useUiStore();
  const walletStore = useWalletStore();
  const cameraStore = useCameraStore();
  const sendTokensStore = useSendTokensStore();
  const receiveTokensStore = useReceiveTokensStore();
  const p2pkStore = useP2PKStore();
  const prStore = usePRStore();
  const nwcStore = useNWCStore();
  const mintsStore = useMintsStore();

  const open: OverlayId[] = [];

  if (uiStore.showMultinutPaymentDialog) open.push("multinutPayment");
  if (cameraStore.camera.show) open.push("camera");
  if (walletStore.payInvoiceData.show) open.push("payInvoice");
  if (sendTokensStore.showSendTokens) open.push("sendTokens");
  if (receiveTokensStore.showReceiveTokens) open.push("receiveTokens");
  if (uiStore.showCreateInvoiceDialog) open.push("createInvoice");
  if (uiStore.showInvoiceDetails) open.push("invoiceDetails");
  if (prStore.showPRDialog) open.push("prDialog");
  if (p2pkStore.showP2PKDialog) open.push("p2pkDialog");
  if (nwcStore.showNWCDialog) open.push("nwcDialog");
  if (mintsStore.showAddMintDialog) open.push("addMint");
  if (mintsStore.showRemoveMintDialog) open.push("removeMint");
  if (mintsStore.showEditMintDialog) open.push("editMint");
  if (mintsStore.showMintInfoDialog) open.push("mintInfo");
  if (uiStore.showReceiveEcashDrawer) open.push("receiveEcashDrawer");
  if (uiStore.showSendDialog) open.push("sendDialog");
  if (uiStore.showReceiveDialog) open.push("receiveDialog");

  return open;
}

export function hasOpenDialogs(): boolean {
  return getOpenOverlays().length > 0;
}

export function openOverlay(overlay: OverlayId): void {
  const uiStore = useUiStore();
  const walletStore = useWalletStore();
  const cameraStore = useCameraStore();
  const sendTokensStore = useSendTokensStore();
  const receiveTokensStore = useReceiveTokensStore();
  const p2pkStore = useP2PKStore();
  const prStore = usePRStore();
  const nwcStore = useNWCStore();
  const mintsStore = useMintsStore();

  switch (overlay) {
    case "multinutPayment":
      uiStore.showMultinutPaymentDialog = true;
      break;
    case "camera":
      cameraStore.camera.show = true;
      break;
    case "payInvoice":
      walletStore.payInvoiceData.show = true;
      break;
    case "sendTokens":
      sendTokensStore.showSendTokens = true;
      break;
    case "receiveTokens":
      receiveTokensStore.showReceiveTokens = true;
      break;
    case "createInvoice":
      uiStore.showCreateInvoiceDialog = true;
      break;
    case "invoiceDetails":
      uiStore.showInvoiceDetails = true;
      break;
    case "prDialog":
      prStore.showPRDialog = true;
      break;
    case "p2pkDialog":
      p2pkStore.showP2PKDialog = true;
      break;
    case "nwcDialog":
      nwcStore.showNWCDialog = true;
      break;
    case "addMint":
      mintsStore.showAddMintDialog = true;
      break;
    case "removeMint":
      mintsStore.showRemoveMintDialog = true;
      break;
    case "editMint":
      mintsStore.showEditMintDialog = true;
      break;
    case "mintInfo":
      mintsStore.showMintInfoDialog = true;
      break;
    case "receiveEcashDrawer":
      uiStore.showReceiveEcashDrawer = true;
      break;
    case "sendDialog":
      uiStore.showSendDialog = true;
      break;
    case "receiveDialog":
      uiStore.showReceiveDialog = true;
      break;
  }
}

export function openOnlyOverlay(overlay: OverlayId): void {
  closeAllOverlays();
  openOverlay(overlay);
}

/** Closes the topmost overlay. Returns true if something was closed. */
export function closeTopOverlay(): boolean {
  const top = getOpenOverlays()[0];
  if (!top) {
    return false;
  }

  const uiStore = useUiStore();
  const walletStore = useWalletStore();
  const cameraStore = useCameraStore();
  const sendTokensStore = useSendTokensStore();
  const receiveTokensStore = useReceiveTokensStore();
  const p2pkStore = useP2PKStore();
  const prStore = usePRStore();
  const nwcStore = useNWCStore();
  const mintsStore = useMintsStore();

  switch (top) {
    case "multinutPayment":
      uiStore.showMultinutPaymentDialog = false;
      break;
    case "camera":
      cameraStore.camera.show = false;
      break;
    case "payInvoice":
      walletStore.payInvoiceData.show = false;
      break;
    case "sendTokens":
      sendTokensStore.showSendTokens = false;
      break;
    case "receiveTokens":
      receiveTokensStore.showReceiveTokens = false;
      break;
    case "createInvoice":
      uiStore.showCreateInvoiceDialog = false;
      break;
    case "invoiceDetails":
      uiStore.showInvoiceDetails = false;
      break;
    case "prDialog":
      prStore.showPRDialog = false;
      break;
    case "p2pkDialog":
      p2pkStore.showP2PKDialog = false;
      break;
    case "nwcDialog":
      nwcStore.showNWCDialog = false;
      break;
    case "addMint":
      mintsStore.showAddMintDialog = false;
      break;
    case "removeMint":
      mintsStore.showRemoveMintDialog = false;
      break;
    case "editMint":
      mintsStore.showEditMintDialog = false;
      break;
    case "mintInfo":
      mintsStore.showMintInfoDialog = false;
      break;
    case "receiveEcashDrawer":
      // Match ReceiveEcashDrawer.goBack(): restore receive chooser
      uiStore.showReceiveEcashDrawer = false;
      uiStore.showReceiveDialog = true;
      break;
    case "sendDialog":
      uiStore.showSendDialog = false;
      break;
    case "receiveDialog":
      uiStore.showReceiveDialog = false;
      break;
  }

  return true;
}

/** Closes every tracked overlay (hard reset). */
export function closeAllOverlays(): void {
  const uiStore = useUiStore();
  const walletStore = useWalletStore();
  const cameraStore = useCameraStore();
  const sendTokensStore = useSendTokensStore();
  const receiveTokensStore = useReceiveTokensStore();
  const p2pkStore = useP2PKStore();
  const prStore = usePRStore();
  const nwcStore = useNWCStore();
  const mintsStore = useMintsStore();

  uiStore.closeDialogs();
  uiStore.showMultinutPaymentDialog = false;
  walletStore.payInvoiceData.show = false;
  sendTokensStore.showSendTokens = false;
  receiveTokensStore.showReceiveTokens = false;
  cameraStore.camera.show = false;
  prStore.showPRDialog = false;
  p2pkStore.showP2PKDialog = false;
  nwcStore.showNWCDialog = false;
  mintsStore.showAddMintDialog = false;
  mintsStore.showRemoveMintDialog = false;
  mintsStore.showEditMintDialog = false;
  mintsStore.showMintInfoDialog = false;
}
