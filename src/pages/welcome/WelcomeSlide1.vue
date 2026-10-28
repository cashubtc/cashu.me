<!-- src/components/WelcomeSlide1.vue -->
<template>
  <div class="welcome-slide">
    <!-- Logo -->
    <div class="logo">
      <transition appear enter-active-class="animated fadeIn">
        <img src="/clean.png" alt="Cashu Logo" class="logo-image" />
      </transition>
    </div>

    <!-- Title -->
    <h1 class="title">{{ $t("WelcomeSlide1.title") }}</h1>

    <!-- Description -->
    <p class="description">{{ $t("WelcomeSlide1.text") }}</p>

    <!-- Welcome actions -->
    <div class="welcome-actions">
      <!-- Next button -->
      <q-btn
        color="primary"
        rounded
        unelevated
        data-testid="onboarding-start"
        :label="$t('WelcomePage.actions.next.label')"
        @click="goToNext"
        class="welcome-next-btn"
      />

      <!-- Terms agreement -->
      <div class="terms-agreement">
        <i18n-t
          keypath="WelcomeSlide1.terms_agreement"
          tag="p"
          class="terms-text"
        >
          <template #terms>
            <span class="terms-link" @click="showTermsSheet">{{
              $t("WelcomeSlide4.title")
            }}</span>
          </template>
        </i18n-t>
      </div>
    </div>

    <!-- Language selector at bottom -->
    <div class="language-section">
      <button
        type="button"
        class="language-trigger"
        aria-haspopup="listbox"
        :aria-expanded="showLanguageMenu"
        @click="toggleLanguageMenu"
      >
        <span class="language-text">{{ selectedLanguage }}</span>
        <ChevronUpIcon :size="16" class="language-icon" />
      </button>
    </div>

    <!-- Language picker: the shared sheet, in the onboarding's dark palette. -->
    <BottomSheet
      v-model="showLanguageMenu"
      dark
      :title="$t('Settings.language.title')"
    >
      <div
        role="listbox"
        :aria-label="$t('Settings.language.title')"
        class="language-options"
      >
        <SheetOption
          v-for="option in languageOptions"
          :key="option.value"
          :selected="selectedLanguage === option.label"
          @select="selectLanguage(option)"
        >
          <template #label>
            <span dir="auto">{{ option.label }}</span>
          </template>
        </SheetOption>
      </div>
    </BottomSheet>

    <!-- Terms of Service: the shared sheet, in the onboarding's dark palette. -->
    <BottomSheet v-model="showTerms" dark :title="$t('WelcomeSlide4.title')">
      <div class="terms-content">
        <TermsOfServiceText class="terms-text-content" />
      </div>
    </BottomSheet>
  </div>
</template>

<script lang="ts">
import { ChevronUp as ChevronUpIcon } from "lucide-vue-next";
import { useWelcomeStore } from "src/stores/welcome";
import BottomSheet from "src/components/BottomSheet.vue";
import SheetOption from "src/components/SheetOption.vue";
import TermsOfServiceText from "src/components/TermsOfServiceText.vue";

export default {
  name: "WelcomeSlide1",
  components: { ChevronUpIcon, BottomSheet, SheetOption, TermsOfServiceText },
  data() {
    return {
      selectedLanguage: "",
      showLanguageMenu: false,
      showTerms: false,
      termsAccepted: true,
      languageOptions: [
        { label: "English", value: "en-US" },
        { label: "Español", value: "es-ES" },
        { label: "Italiano", value: "it-IT" },
        { label: "Deutsch", value: "de-DE" },
        { label: "Français", value: "fr-FR" },
        { label: "Čeština", value: "cs-CZ" },
        { label: "Português (Brasil)", value: "pt-BR" },
        { label: "Svenska", value: "sv-SE" },
        { label: "Ελληνικά", value: "el-GR" },
        { label: "Türkçe", value: "tr-TR" },
        { label: "ไทย", value: "th-TH" },
        { label: "العربية", value: "ar-SA" },
        { label: "中文", value: "zh-CN" },
        { label: "日本語", value: "ja-JP" },
      ],
    };
  },
  methods: {
    changeLanguage(locale: string) {
      this.$i18n.locale = locale;
      localStorage.setItem("cashu.language", locale);
    },
    goToNext() {
      const welcomeStore = useWelcomeStore();
      // Mark terms as accepted since user is proceeding
      welcomeStore.acceptTerms();
      welcomeStore.goToNextSlide();
    },
    toggleLanguageMenu() {
      this.showLanguageMenu = !this.showLanguageMenu;
      if (this.showLanguageMenu) {
        // Open on the current language, which can sit below the fold in a long list.
        // The sheet is teleported to <body>, so look it up there once it has mounted.
        this.$nextTick(() => {
          requestAnimationFrame(() => {
            document
              .querySelector(".language-options .sheet-option--selected")
              ?.scrollIntoView({ block: "nearest" });
          });
        });
      }
    },
    closeLanguageMenu() {
      this.showLanguageMenu = false;
    },
    selectLanguage(option: any) {
      this.selectedLanguage = option.label;
      this.changeLanguage(option.value);
      this.closeLanguageMenu();
    },
    showTermsSheet() {
      this.showTerms = true;
    },
    closeTermsSheet() {
      this.showTerms = false;
      this.termsAccepted = true;
    },
  },
  created() {
    this.selectedLanguage =
      this.languageOptions.find((option) => option.value === this.$i18n.locale)
        ?.label || "English";
  },
};
</script>

<style scoped>
.welcome-slide {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  background: var(--app-welcome-bg);
  color: white;
  padding: 40px 0 24px;
  box-sizing: border-box;
  text-align: center;
}

.logo {
  margin-top: auto;
  margin-bottom: 30px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-image {
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: white;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.description {
  font-size: 1.1rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 auto auto;
  padding-bottom: 32px;
  max-width: 32ch;
  text-align: center;
  hyphens: manual;
  text-wrap: pretty;
}

/* Unified content width */
.title,
.welcome-actions,
.language-section {
  width: 100%;
  max-width: 500px;
  margin-top: 12px;
}

.welcome-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}

.welcome-next-btn {
  width: 100%;
  height: 52px;
  font-weight: 600;
  text-transform: none;
  font-size: 1.0625rem;
  border-radius: 26px;
}

.terms-agreement {
  margin-top: 16px;
  text-align: center;
}

.terms-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
}

.terms-link {
  color: var(--app-accent);
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.terms-link:hover {
  color: color-mix(in srgb, var(--q-primary) 80%, transparent);
}

/* Language trigger button */
.language-trigger {
  background: none;
  border: 0;
  font: inherit;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 8px 16px;
  border-radius: var(--app-radius-md);
}

.language-trigger:hover {
  color: rgba(255, 255, 255, 0.9);
}

.language-text {
  font-size: 0.9rem;
  font-weight: 500;
}

.language-icon {
  transition: transform 0.2s ease;
}

.language-trigger:hover .language-icon {
  transform: scale(1.1);
}

/* The language and terms lists sit inside the shared BottomSheet. */

.terms-content {
  padding: 0 8px;
}

.terms-text-content {
  padding: 0 4px;
}

.language-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
  flex-shrink: 0;
}

/* Animation */
.animated.bounce {
  animation-duration: 0.8s;
  animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
</style>
