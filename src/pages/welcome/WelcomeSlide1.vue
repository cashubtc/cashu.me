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
      <q-select
        v-model="selectedLanguage"
        :options="languageOptions"
        emit-value
        dense
        borderless
        map-options
        @update:model-value="changeLanguage"
        class="welcome-language-select"
      />
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
}

.welcome-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.welcome-next-btn {
  min-width: 140px;
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

.welcome-language-select {
  min-width: 100px;
}

.welcome-language-select :deep(.q-field__control) {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  min-height: auto;
  padding: 0;
}

.welcome-language-select :deep(.q-field__native) {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  text-align: center;
  padding: 0;
}

.welcome-language-select :deep(.q-field__label) {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.welcome-language-select :deep(.q-field__dropdown-icon) {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
}

.welcome-language-select :deep(.q-field__marginal) {
  height: auto;
  padding: 0;
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
    min-width: 120px;
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
