import { debug } from "src/js/logger";
// src/stores/welcome.ts
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import router from "src/router";

export type WelcomeState = {
  showWelcome: any;
  currentSlide: any;
  seedPhraseValidated: any;
  termsAccepted: any;
};

// Define the Pinia store
export const useWelcomeStore = defineStore("welcome", {
  state: (): WelcomeState => ({
    showWelcome: useLocalStorage<boolean>("cashu.welcome.showWelcome", true)
      .value,
    currentSlide: useLocalStorage<number>("cashu.welcome.currentSlide", 0)
      .value,
    seedPhraseValidated: useLocalStorage<boolean>(
      "cashu.welcome.seedPhraseValidated",
      false
    ),
    termsAccepted: useLocalStorage<boolean>(
      "cashu.welcome.termsAccepted",
      false
    ),
  }),
  getters: {
    // Determines if the current slide is the last one
    isLastSlide: (state) => state.currentSlide === 3,

    // Determines if the user can proceed to the next slide
    canProceed: () => true,

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
        router.push("/wallet");
      }
    },

    /**
     * Closes the welcome dialog and marks it as seen.
     */
    closeWelcome() {
      this.showWelcome = false;
      // Redirect to wallet without full page reload
      router.push("/wallet");
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
    },

    /**
     * Skip the tutorial and close the welcome dialog.
     */
    skipTutorial() {
      this.closeWelcome();
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
      debug(`href: ${window.location.href}`);
    },
  },
});
