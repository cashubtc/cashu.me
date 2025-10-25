<!-- src/components/WelcomeSlide1.vue -->
<template>
  <div class="welcome-slide">
    <!-- Logo -->
    <div class="logo">
      <transition appear enter-active-class="animated bounce">
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
        :label="$t('WelcomePage.actions.next.label')"
        @click="goToNext"
        class="welcome-next-btn"
      />
    </div>

    <!-- Language selector at bottom -->
    <div class="language-section">
      <div class="language-trigger" @click="toggleLanguageMenu">
        <span class="language-text">{{ selectedLanguage }}</span>
        <q-icon name="keyboard_arrow_up" class="language-icon" />
      </div>
    </div>

    <!-- Custom full-width language menu -->
    <div
      v-if="showLanguageMenu"
      class="language-menu-overlay"
      @click="closeLanguageMenu"
    >
      <div class="language-menu" @click.stop>
        <div class="language-menu-header">
          <h3>Select Language</h3>
          <q-btn
            flat
            round
            icon="close"
            @click="closeLanguageMenu"
            class="close-btn"
          />
        </div>
        <div class="language-options">
          <div
            v-for="option in languageOptions"
            :key="option.value"
            class="language-option"
            :class="{ active: selectedLanguage === option.label }"
            @click="selectLanguage(option)"
          >
            {{ option.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useWelcomeStore } from "src/stores/welcome";

export default {
  name: "WelcomeSlide1",
  data() {
    return {
      selectedLanguage: "",
      showLanguageMenu: false,
      languageOptions: [
        { label: "English", value: "en-US" },
        { label: "Español", value: "es-ES" },
        { label: "Italiano", value: "it-IT" },
        { label: "Deutsch", value: "de-DE" },
        { label: "Français", value: "fr-FR" },
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
      welcomeStore.goToNextSlide();
    },
    toggleLanguageMenu() {
      this.showLanguageMenu = !this.showLanguageMenu;
    },
    closeLanguageMenu() {
      this.showLanguageMenu = false;
    },
    selectLanguage(option: any) {
      this.selectedLanguage = option.label;
      this.changeLanguage(option.value);
      this.closeLanguageMenu();
    },
  },
  created() {
    this.selectedLanguage =
      this.languageOptions.find(
        (option) => option.value === this.$i18n.locale || navigator.language
      )?.label || "English";
  },
};
</script>

<style scoped>
.welcome-slide {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  background: var(--q-dark);
  color: white;
  padding: 40px 20px 20px 20px;
  box-sizing: border-box;
  text-align: center;
}

.logo {
  margin-bottom: 30px;
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
  margin: 0 0 50px 0;
  max-width: 350px;
  text-align: left;
}

.welcome-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex: 1;
  justify-content: center;
  width: 100%;
}

.welcome-next-btn {
  width: 100%;
  height: 44px;
  font-weight: 600;
  text-transform: none;
  font-size: 1rem;
  border-radius: 22px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.welcome-next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

/* Language trigger button */
.language-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 8px 16px;
  border-radius: 8px;
}

.language-trigger:hover {
  color: rgba(255, 255, 255, 0.9);
}

.language-text {
  font-size: 0.9rem;
  font-weight: 500;
}

.language-icon {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.language-trigger:hover .language-icon {
  transform: scale(1.1);
}

/* Full-width language menu overlay */
.language-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s ease;
}

.language-menu {
  width: 100%;
  background: rgba(20, 20, 20, 0.98);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px 20px 0 0;
  height: 85vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

.language-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.language-menu-header h3 {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  color: rgba(255, 255, 255, 0.7) !important;
}

.language-options {
  flex: 1;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}

.language-option {
  padding: 16px 24px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}

.language-option:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.language-option.active {
  background: rgba(var(--q-primary-rgb), 0.2);
  color: var(--q-primary);
}

.language-option:last-child {
  border-bottom: none;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.language-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
  flex-shrink: 0;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .welcome-slide {
    padding: 30px 15px 15px 15px;
  }

  .logo-image {
    width: 70px;
    height: 70px;
  }

  .title {
    font-size: 1.8rem;
  }

  .description {
    font-size: 1rem;
    max-width: 300px;
    margin-bottom: 40px;
  }

  .welcome-next-btn {
    width: 100%;
    height: 40px;
    font-size: 0.95rem;
  }

  .language-section {
    padding: 8px 0;
  }
}

/* Animation */
.animated.bounce {
  animation-duration: 0.8s;
  animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
</style>
