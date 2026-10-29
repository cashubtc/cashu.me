<!-- src/components/WelcomeSlide1.vue -->
<template>
  <WelcomeSlideScaffold
    class="welcome-start"
    :title="$t('WelcomeSlide1.title')"
    :text="$t('WelcomeSlide1.text')"
  >
    <template #hero>
      <div class="logo">
        <transition appear enter-active-class="animated fadeIn">
          <img
            src="/clean.png"
            alt="Cashu Logo"
            class="logo-image"
            width="80"
            height="80"
          />
        </transition>
      </div>
    </template>

    <template #footer>
      <!-- Start, the terms it agrees to, then the language: on the footer's column. -->
      <q-btn
        color="primary"
        rounded
        unelevated
        data-testid="onboarding-start"
        :label="$t('WelcomePage.actions.next.label')"
        @click="goToNext"
        class="full-width welcome-next-btn"
      />

      <i18n-t
        keypath="WelcomeSlide1.terms_agreement"
        tag="p"
        class="terms-text"
      >
        <template #terms>
          <button type="button" class="terms-link" @click="showTermsSheet">
            {{ $t("WelcomeSlide4.title") }}
          </button>
        </template>
      </i18n-t>

      <div class="language-section">
        <button
          type="button"
          class="language-trigger"
          aria-haspopup="listbox"
          :aria-expanded="showLanguageMenu"
          @click="toggleLanguageMenu"
        >
          <GlobeIcon :size="16" class="language-icon" />
          <span class="language-text">{{ selectedLanguage }}</span>
          <ChevronDownIcon :size="16" class="language-icon" />
        </button>
      </div>
    </template>

    <!-- Language picker: the shared sheet (teleported), in the app's own mode. -->
    <BottomSheet
      v-model="showLanguageMenu"
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
          :selected="option.value === $i18n.locale"
          @select="selectLanguage(option)"
        >
          <template #label>
            <span dir="auto">{{ option.label }}</span>
          </template>
        </SheetOption>
      </div>
    </BottomSheet>

    <!-- Terms of Service: the shared sheet (teleported), in the app's own mode. -->
    <BottomSheet v-model="showTerms" :title="$t('WelcomeSlide4.title')">
      <div class="terms-content">
        <TermsOfServiceText class="terms-text-content" />
      </div>
    </BottomSheet>
  </WelcomeSlideScaffold>
</template>

<script lang="ts">
import WelcomeSlideScaffold from "src/components/ui/WelcomeSlideScaffold.vue";
import { LANGUAGE_OPTIONS, languageLabel } from "src/js/languages";
import {
  ChevronDown as ChevronDownIcon,
  Globe as GlobeIcon,
} from "lucide-vue-next";
import { useWelcomeStore } from "src/stores/welcome";
import BottomSheet from "src/components/BottomSheet.vue";
import SheetOption from "src/components/SheetOption.vue";
import TermsOfServiceText from "src/components/TermsOfServiceText.vue";

export default {
  name: "WelcomeSlide1",
  components: {
    WelcomeSlideScaffold,
    ChevronDownIcon,
    GlobeIcon,
    BottomSheet,
    SheetOption,
    TermsOfServiceText,
  },
  data() {
    return {
      showLanguageMenu: false,
      showTerms: false,
      termsAccepted: true,
      languageOptions: LANGUAGE_OPTIONS,
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
  computed: {
    // From the live locale, so the button and the sheet's check never go stale.
    selectedLanguage(): string {
      return languageLabel(this.$i18n.locale);
    },
  },
  watch: {
    // Open the sheet with the current language in view (it can sit below the fold).
    showLanguageMenu(open: boolean) {
      if (!open) return;
      this.$nextTick(() => {
        const selected = document.querySelector(
          '.language-options [aria-selected="true"]'
        );
        if (!selected) return;
        selected.scrollIntoView({ block: "center" });
        // Then settle on a whole row, so no sliver of a row peeks out under the sheet
        // header (council R83-R84).
        const box = selected.closest(".bottom-sheet-content");
        if (!box) return;
        const boxTop = box.getBoundingClientRect().top;
        const first = Array.from(box.querySelectorAll("[aria-selected]")).find(
          (row) => row.getBoundingClientRect().bottom > boxTop + 1
        );
        if (first)
          box.scrollTop += first.getBoundingClientRect().top - boxTop - 4;
      });
    },
  },
};
</script>

<style scoped>
/* The first step's hero sits in the middle of the screen, above its own footer. */
.welcome-start :deep(.welcome-slide__content) {
  justify-content: center;
}
.welcome-start :deep(.welcome-slide__title) {
  /* A step larger than later steps' titles, and smaller on narrow phones, so a long
     localized title keeps the page margins (council R85-R87). */
  font-size: clamp(1.75rem, 8vw, 2.2rem);
  letter-spacing: -0.02em;
}
.welcome-start :deep(.welcome-slide__description) {
  font-size: 1.1rem;
  hyphens: manual;
  margin-bottom: 0;
}

.logo {
  align-items: center;
  background: var(--app-tint-strong);
  border-radius: 50%;
  display: flex;
  height: 120px;
  justify-content: center;
  margin-bottom: 10px;
  width: 120px;
}

.logo-image {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  height: 80px;
  width: 80px;
}

.welcome-next-btn {
  min-height: 52px;
}

.terms-text {
  color: var(--app-text-muted);
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 16px 0 0;
  text-align: center;
}

/* The terms opener is a button that reads as an inline link: the accent, underlined. */
.terms-link {
  background: none;
  border: 0;
  border-radius: 2px;
  color: var(--app-accent);
  cursor: pointer;
  font: inherit;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.terms-link:hover {
  text-decoration-thickness: 2px;
}

.terms-link:focus-visible {
  outline: 2px solid var(--app-accent);
  outline-offset: 2px;
}

.language-section {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

/* Language trigger: a 44px target in muted ink. */
.language-trigger {
  align-items: center;
  background: none;
  border: 0;
  border-radius: var(--app-radius-md);
  color: var(--app-text-muted);
  cursor: pointer;
  display: flex;
  font: inherit;
  gap: 8px;
  justify-content: center;
  min-height: 44px;
  padding: 8px 16px;
}

.language-trigger:hover {
  color: var(--app-text);
}

.language-trigger:focus-visible {
  outline: 2px solid var(--app-accent);
  outline-offset: 2px;
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
</style>
