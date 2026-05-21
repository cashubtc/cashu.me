import { watch } from "vue";
import { useUiStore } from "../stores/ui";
import { useMintsStore } from "../stores/mints";
import { useCameraStore } from "../stores/camera";
import { useSendTokensStore } from "../stores/sendTokensStore";
import { useReceiveTokensStore } from "../stores/receiveTokensStore";
import { useP2PKStore } from "../stores/p2pk";
import { usePRStore } from "../stores/payment-request";
import { useWalletStore } from "../stores/wallet";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

export function setupBackButtonHandler() {
  // Track if we've added a history state for an open dialog
  let dialogHistoryAdded = false;

  // Function to add a history entry when a dialog opens
  const addDialogHistoryEntry = () => {
    if (!dialogHistoryAdded) {
      // Use replaceState instead of pushState to avoid creating multiple history entries
      window.history.replaceState({ dialog: true, timestamp: Date.now() }, "");
      dialogHistoryAdded = true;
    }
  };

  // Function to handle back button press
  const handleBackButton = (event?: PopStateEvent) => {
    const uiStore = useUiStore();

    // Check if any dialogs are open - call it as a method
    if (uiStore.hasOpenDialogs()) {
      // Prevent default back action if possible
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Close dialogs
      uiStore.closeDialogs();

      // Reset the history state for future dialog openings
      dialogHistoryAdded = false;

      return true;
    }

    // No dialogs open, let the default back behavior happen
    return false;
  };

  // Watch for dialog openings
  const watchDialogs = () => {
    const uiStore = useUiStore();
    const mintsStore = useMintsStore();

    // Watch for changes in dialog state - call it as a method
    watch(
      () => uiStore.hasOpenDialogs(),
      (isOpen) => {
        if (isOpen && !dialogHistoryAdded) {
          addDialogHistoryEntry();
        }
      }
    );

    // Also watch specific dialogs from mints store
    watch(
      () => [
        mintsStore.showAddMintDialog,
        mintsStore.showRemoveMintDialog,
        mintsStore.showMintInfoDialog,
        mintsStore.showEditMintDialog,
      ],
      (newValues) => {
        const isAnyOpen = newValues.some((v) => v);
        if (isAnyOpen && !dialogHistoryAdded) {
          addDialogHistoryEntry();
        }
      }
    );
  };

  // Set up platform-specific handlers
  if (Capacitor.isNativePlatform()) {
    // For mobile apps (Android/iOS)
    App.addListener("backButton", () => {
      handleBackButton();
    });
  } else {
    // For web browsers
    window.addEventListener("popstate", handleBackButton);
  }

  // Start watching dialogs
  watchDialogs();

  // Return a cleanup function
  return () => {
    if (Capacitor.isNativePlatform()) {
      // Clean up Capacitor listeners
      App.removeAllListeners();
    } else {
      window.removeEventListener("popstate", handleBackButton);
    }
  };
}
