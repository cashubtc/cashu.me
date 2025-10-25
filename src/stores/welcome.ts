// src/stores/welcome.ts
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";

export type WelcomeState = {
  showWelcome: boolean;
  currentSlide: number;
  seedPhraseValidated: boolean;
  termsAccepted: boolean;
  onboardingPath: string; // 'new' | 'recover' | ''
  seedEnteredValid: boolean;
  mintSetupCompleted: boolean;
  ecashRestoreCompleted: boolean;
};

// Define the Pinia store
export const useWelcomeStore = defineStore("welcome", {
  state: (): WelcomeState => ({
    showWelcome: useLocalStorage<boolean>("cashu.welcome.showWelcome", true),
    currentSlide: useLocalStorage<number>("cashu.welcome.currentSlide", 0),
    seedPhraseValidated: useLocalStorage<boolean>(
      "cashu.welcome.seedPhraseValidated",
      false
    ),
    termsAccepted: useLocalStorage<boolean>(
      "cashu.welcome.termsAccepted",
      false
    ),
    onboardingPath: useLocalStorage<string>("cashu.welcome.path", ""),
    seedEnteredValid: useLocalStorage<boolean>(
      "cashu.welcome.seedEnteredValid",
      false
    ),
    mintSetupCompleted: useLocalStorage<boolean>(
      "cashu.welcome.mintSetupCompleted",
      false
    ),
    ecashRestoreCompleted: useLocalStorage<boolean>(
      "cashu.welcome.ecashRestoreCompleted",
      false
    ),
  }),
  getters: {
    // Determines if the current slide is the last one
    isLastSlide: (state) => {
      // Slides:
      // 0 Intro, 1 PWA, 2 Choice,
      // New: 3 Seed, 4 Mints (no more terms screen)
      // Recover: 3 SeedIn, 4 Mints, 5 Restore (no more terms screen)
      if (state.onboardingPath === "recover") return state.currentSlide === 5;
      if (state.onboardingPath === "new") return state.currentSlide === 4;
      // before choosing a path
      return false;
    },

    // Determines if the user can proceed to the next slide
    canProceed: (state) => {
      // 0 Intro
      if (state.currentSlide === 0) return true;
      // 1 PWA
      if (state.currentSlide === 1) return true;
      // 2 Choice
      if (state.currentSlide === 2) return state.onboardingPath !== "";
      // 3 (seed phrase for both paths)
      if (state.currentSlide === 3) {
        if (state.onboardingPath === "new") return state.seedPhraseValidated;
        if (state.onboardingPath === "recover") return state.seedEnteredValid;
      }
      // 4 (mints setup for both paths - last step for "new" path)
      if (state.currentSlide === 4) return state.mintSetupCompleted || true;
      // 5 (restore step for recover path - last step for "recover" path)
      if (state.currentSlide === 5) {
        if (state.onboardingPath === "recover")
          return state.ecashRestoreCompleted || true;
      }
      return false;
    },

    // Determines if the user can navigate to the previous slide
    canGoPrev: (state) => state.currentSlide > 0,
  },
  actions: {
    /**
     * Initializes the welcome dialog based on local storage.
     * Should be called when the store is initialized.
     */
    initializeWelcome() {
      if (!this.showWelcome) {
        window.location.href = "/";
      }
    },

    /**
     * Closes the welcome dialog and marks it as seen.
     */
    closeWelcome() {
      this.showWelcome = false;
      // Reset the slide to the beginning for next time (if welcome is ever shown again)
      this.currentSlide = 0;
      // Redirect to home or desired route
      window.location.href =
        "/" + window.location.search + window.location.hash;
    },
    setPath(path: "new" | "recover") {
      this.onboardingPath = path;
    },

    /**
     * Sets the current slide index.
     * @param index - The index of the slide to navigate to.
     */
    setCurrentSlide(index: number) {
      this.currentSlide = index;
    },

    /**
     * Marks the terms as accepted.
     */
    acceptTerms() {
      this.termsAccepted = true;
    },

    /**
     * Validates the seed phrase.
     */
    validateSeedPhrase() {
      this.seedPhraseValidated = true;
    },

    /**
     * Resets the welcome dialog state (useful for testing or resetting).
     */
    resetWelcome() {
      this.showWelcome = true;
      this.currentSlide = 0;
      this.termsAccepted = false;
      this.seedPhraseValidated = false;
      this.onboardingPath = "";
      this.seedEnteredValid = false;
      this.mintSetupCompleted = false;
      this.ecashRestoreCompleted = false;
    },

    /**
     * Navigates to the previous slide if possible.
     */
    goToPrevSlide() {
      if (this.canGoPrev) {
        this.currentSlide -= 1;
      }
      // Optionally, handle edge cases or emit events
    },

    /**
     * Navigates to the next slide if possible.
     * If on the last slide, it can close the welcome dialog.
     */
    goToNextSlide() {
      if (this.canProceed) {
        if (this.isLastSlide) {
          this.closeWelcome();
        } else {
          this.currentSlide += 1;
        }
      }
      // Optionally, handle edge cases or emit events
      console.log(`href: ${window.location.href}`);
    },
  },
});
