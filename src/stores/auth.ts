import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import {
  BiometricAuth,
  BiometryType,
  AndroidBiometryStrength,
} from "@aparajita/capacitor-biometric-auth";
import { notify, notifyError, notifySuccess } from "../js/notify";
import { App, AppState } from "@capacitor/app";

export type BiometricType =
  | "fingerprintAuthentication"
  | "faceAuthentication"
  | "irisAuthentication"
  | "none";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    // Settings persisted to localStorage
    authEnabled: useLocalStorage<boolean>("cashu.auth.enabled", false),
    requireAuthOnResume: useLocalStorage<boolean>(
      "cashu.auth.requireOnResume",
      true
    ),

    // Runtime state
    isAuthenticated: false,
    isAuthenticating: false,
    showAuthPrompt: false,
    availableBiometrics: [] as BiometricType[],
    biometricStrength: "weak" as "weak" | "strong",
    deviceIsSecure: false,

    // App state listener
    appStateListener: null as any,
  }),

  getters: {
    needsAuthentication(state): boolean {
      if (!state.authEnabled) return false;
      if (!state.isAuthenticated) return true;
      return false;
    },

    hasStrongBiometrics(state): boolean {
      return state.biometricStrength === "strong";
    },

    hasBiometrics(state): boolean {
      return (
        state.availableBiometrics.length > 0 &&
        state.availableBiometrics[0] !== "none"
      );
    },

    biometricTypeLabel(state): string {
      if (state.availableBiometrics.length === 0) return "Device Credential";

      const type = state.availableBiometrics[0];
      switch (type) {
        case "fingerprintAuthentication":
          return "Fingerprint";
        case "faceAuthentication":
          return "Face ID";
        case "irisAuthentication":
          return "Iris";
        default:
          return "Device Credential";
      }
    },
  },

  actions: {
    async checkBiometricAvailability() {
      try {
        const result = await BiometricAuth.checkBiometry();
        this.availableBiometrics = result.biometryTypes.map(
          (t) => t as unknown as BiometricType
        );
        this.biometricStrength = result.strongBiometryIsAvailable
          ? "strong"
          : "weak";
        this.deviceIsSecure = result.deviceIsSecure;

        return {
          isAvailable: result.isAvailable,
          biometryTypes: result.biometryTypes,
          strongBiometryIsAvailable: result.strongBiometryIsAvailable,
          deviceIsSecure: result.deviceIsSecure,
        };
      } catch (error) {
        console.error("Error checking biometric availability:", error);
        return {
          isAvailable: false,
          biometryTypes: [],
          strongBiometryIsAvailable: false,
          deviceIsSecure: false,
        };
      }
    },

    async authenticate(reason?: string): Promise<boolean> {
      if (this.isAuthenticating) {
        return false;
      }

      this.isAuthenticating = true;

      try {
        await BiometricAuth.authenticate({
          reason: reason || "Please authenticate to access your wallet",
          cancelTitle: "Cancel",
          allowDeviceCredential: true,
          iosFallbackTitle: "Use Passcode",
          androidTitle: "Authenticate",
          androidSubtitle: "Cashu Wallet",
          androidConfirmationRequired: false,
          androidBiometryStrength: (this.hasStrongBiometrics
            ? "strong"
            : "weak") as unknown as AndroidBiometryStrength,
        });

        // Authentication successful
        this.isAuthenticated = true;
        this.showAuthPrompt = false;

        return true;
      } catch (error: any) {
        console.error("Authentication failed:", error);

        // Handle specific error codes
        if (error.code === "userCancel") {
          // User cancelled - don't show error
          return false;
        } else if (error.code === "biometryNotAvailable") {
          notifyError("Biometric authentication is not available");
        } else if (error.code === "biometryNotEnrolled") {
          notifyError("No biometrics enrolled on this device");
        } else {
          notifyError("Authentication failed");
        }

        return false;
      } finally {
        this.isAuthenticating = false;
      }
    },

    async promptAuthentication(reason?: string): Promise<boolean> {
      // Check if biometrics are available first
      const availability = await this.checkBiometricAvailability();

      if (!availability.isAvailable && !availability.deviceIsSecure) {
        notifyError(
          "No authentication method available. Please set up a screen lock or biometrics on your device."
        );
        return false;
      }

      return await this.authenticate(reason);
    },

    async enableAuth(): Promise<boolean> {
      // Check availability first
      const availability = await this.checkBiometricAvailability();

      if (!availability.isAvailable && !availability.deviceIsSecure) {
        notifyError(
          "No authentication method available. Please set up a screen lock or biometrics on your device first."
        );
        return false;
      }

      // Require authentication to enable
      const authenticated = await this.authenticate(
        "Authenticate to enable security"
      );

      if (authenticated) {
        this.authEnabled = true;
        notifySuccess("Authentication enabled");
        return true;
      }

      return false;
    },

    disableAuth() {
      this.authEnabled = false;
      this.isAuthenticated = false;
      notifySuccess("Authentication disabled");
    },

    logout() {
      this.isAuthenticated = false;
    },

    async startAppStateListener() {
      // Listen for app state changes (background/foreground)
      try {
        this.appStateListener = await App.addListener(
          "appStateChange",
          (state) => {
            if (
              !state.isActive &&
              this.authEnabled &&
              this.requireAuthOnResume
            ) {
              // App went to background, invalidate auth
              this.isAuthenticated = false;
            } else if (state.isActive && this.needsAuthentication) {
              // App came to foreground and needs auth
              this.showAuthPrompt = true;
            }
          }
        );
      } catch (error) {
        console.error("Failed to start app state listener:", error);
      }
    },

    stopAppStateListener() {
      if (this.appStateListener) {
        this.appStateListener.remove();
        this.appStateListener = null;
      }
    },

    async initialize() {
      // Check biometric availability on init
      await this.checkBiometricAvailability();

      // Start listening to app state changes
      await this.startAppStateListener();

      // If auth is enabled, always require authentication on startup
      if (this.authEnabled && this.needsAuthentication) {
        this.showAuthPrompt = true;
      }
    },
  },
});
