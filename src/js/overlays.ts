import { useUiStore } from "src/stores/ui";
import { useWalletStore } from "src/stores/wallet";
import { useCameraStore } from "src/stores/camera";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { useP2PKStore } from "src/stores/p2pk";
import { usePRStore } from "src/stores/payment-request";
import { useNWCStore } from "src/stores/nwc";
import { useMintsStore } from "src/stores/mints";

type WalletOverlayRouter = {
  push(location: { path: string }): Promise<unknown> | unknown;
};

/** Overlay ids in close-priority order (deepest / topmost first). */
export enum WalletOverlay {
  MultinutPayment = "multinutPayment",
  Camera = "camera",
  PayInvoice = "payInvoice",
  SendTokens = "sendTokens",
  ReceiveTokens = "receiveTokens",
  CreateInvoice = "createInvoice",
  InvoiceDetails = "invoiceDetails",
  PaymentRequest = "prDialog",
  P2PK = "p2pkDialog",
  NWC = "nwcDialog",
  AddMint = "addMint",
  RemoveMint = "removeMint",
  EditMint = "editMint",
  MintInfo = "mintInfo",
  ReceiveEcash = "receiveEcashDrawer",
  Send = "sendDialog",
  Receive = "receiveDialog",
}

export type OverlayId = WalletOverlay;

const walletOverlaySlugs: Record<WalletOverlay, string> = {
  [WalletOverlay.MultinutPayment]: "multinut-payment",
  [WalletOverlay.Camera]: "scan",
  [WalletOverlay.PayInvoice]: "pay-invoice",
  [WalletOverlay.SendTokens]: "send-token",
  [WalletOverlay.ReceiveTokens]: "receive-token",
  [WalletOverlay.CreateInvoice]: "create-invoice",
  [WalletOverlay.InvoiceDetails]: "invoice-details",
  [WalletOverlay.PaymentRequest]: "payment-request",
  [WalletOverlay.P2PK]: "p2pk",
  [WalletOverlay.NWC]: "nwc",
  [WalletOverlay.AddMint]: "add-mint",
  [WalletOverlay.RemoveMint]: "remove-mint",
  [WalletOverlay.EditMint]: "edit-mint",
  [WalletOverlay.MintInfo]: "mint-info",
  [WalletOverlay.ReceiveEcash]: "receive-ecash",
  [WalletOverlay.Send]: "send",
  [WalletOverlay.Receive]: "receive",
};

const overlayBySlug = Object.entries(walletOverlaySlugs).reduce(
  (acc, [overlay, slug]) => {
    acc[slug] = overlay as WalletOverlay;
    return acc;
  },
  {} as Record<string, WalletOverlay>
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

export function openWalletOverlay(
  router: WalletOverlayRouter,
  overlay: OverlayId
): Promise<unknown> | unknown {
  return router.push(getWalletOverlayLocation(overlay));
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

  if (uiStore.showMultinutPaymentDialog)
    open.push(WalletOverlay.MultinutPayment);
  if (cameraStore.camera.show) open.push(WalletOverlay.Camera);
  if (walletStore.payInvoiceData.show) open.push(WalletOverlay.PayInvoice);
  if (sendTokensStore.showSendTokens) open.push(WalletOverlay.SendTokens);
  if (receiveTokensStore.showReceiveTokens)
    open.push(WalletOverlay.ReceiveTokens);
  if (uiStore.showCreateInvoiceDialog) open.push(WalletOverlay.CreateInvoice);
  if (uiStore.showInvoiceDetails) open.push(WalletOverlay.InvoiceDetails);
  if (prStore.showPRDialog) open.push(WalletOverlay.PaymentRequest);
  if (p2pkStore.showP2PKDialog) open.push(WalletOverlay.P2PK);
  if (nwcStore.showNWCDialog) open.push(WalletOverlay.NWC);
  if (mintsStore.showAddMintDialog) open.push(WalletOverlay.AddMint);
  if (mintsStore.showRemoveMintDialog) open.push(WalletOverlay.RemoveMint);
  if (mintsStore.showEditMintDialog) open.push(WalletOverlay.EditMint);
  if (mintsStore.showMintInfoDialog) open.push(WalletOverlay.MintInfo);
  if (uiStore.showReceiveEcashDrawer) open.push(WalletOverlay.ReceiveEcash);
  if (uiStore.showSendDialog) open.push(WalletOverlay.Send);
  if (uiStore.showReceiveDialog) open.push(WalletOverlay.Receive);

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
    case WalletOverlay.MultinutPayment:
      uiStore.showMultinutPaymentDialog = true;
      break;
    case WalletOverlay.Camera:
      cameraStore.camera.show = true;
      break;
    case WalletOverlay.PayInvoice:
      walletStore.payInvoiceData.show = true;
      break;
    case WalletOverlay.SendTokens:
      sendTokensStore.showSendTokens = true;
      break;
    case WalletOverlay.ReceiveTokens:
      receiveTokensStore.showReceiveTokens = true;
      break;
    case WalletOverlay.CreateInvoice:
      uiStore.showCreateInvoiceDialog = true;
      break;
    case WalletOverlay.InvoiceDetails:
      uiStore.showInvoiceDetails = true;
      break;
    case WalletOverlay.PaymentRequest:
      prStore.showPRDialog = true;
      break;
    case WalletOverlay.P2PK:
      p2pkStore.showP2PKDialog = true;
      break;
    case WalletOverlay.NWC:
      nwcStore.showNWCDialog = true;
      break;
    case WalletOverlay.AddMint:
      mintsStore.showAddMintDialog = true;
      break;
    case WalletOverlay.RemoveMint:
      mintsStore.showRemoveMintDialog = true;
      break;
    case WalletOverlay.EditMint:
      mintsStore.showEditMintDialog = true;
      break;
    case WalletOverlay.MintInfo:
      mintsStore.showMintInfoDialog = true;
      break;
    case WalletOverlay.ReceiveEcash:
      uiStore.showReceiveEcashDrawer = true;
      break;
    case WalletOverlay.Send:
      uiStore.showSendDialog = true;
      break;
    case WalletOverlay.Receive:
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
    case WalletOverlay.MultinutPayment:
      uiStore.showMultinutPaymentDialog = false;
      break;
    case WalletOverlay.Camera:
      cameraStore.camera.show = false;
      break;
    case WalletOverlay.PayInvoice:
      walletStore.payInvoiceData.show = false;
      break;
    case WalletOverlay.SendTokens:
      sendTokensStore.showSendTokens = false;
      break;
    case WalletOverlay.ReceiveTokens:
      receiveTokensStore.showReceiveTokens = false;
      break;
    case WalletOverlay.CreateInvoice:
      uiStore.showCreateInvoiceDialog = false;
      break;
    case WalletOverlay.InvoiceDetails:
      uiStore.showInvoiceDetails = false;
      break;
    case WalletOverlay.PaymentRequest:
      prStore.showPRDialog = false;
      break;
    case WalletOverlay.P2PK:
      p2pkStore.showP2PKDialog = false;
      break;
    case WalletOverlay.NWC:
      nwcStore.showNWCDialog = false;
      break;
    case WalletOverlay.AddMint:
      mintsStore.showAddMintDialog = false;
      break;
    case WalletOverlay.RemoveMint:
      mintsStore.showRemoveMintDialog = false;
      break;
    case WalletOverlay.EditMint:
      mintsStore.showEditMintDialog = false;
      break;
    case WalletOverlay.MintInfo:
      mintsStore.showMintInfoDialog = false;
      break;
    case WalletOverlay.ReceiveEcash:
      // Match ReceiveEcashDrawer.goBack(): restore receive chooser
      uiStore.showReceiveEcashDrawer = false;
      uiStore.showReceiveDialog = true;
      break;
    case WalletOverlay.Send:
      uiStore.showSendDialog = false;
      break;
    case WalletOverlay.Receive:
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
