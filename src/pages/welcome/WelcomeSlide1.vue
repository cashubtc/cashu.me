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

    <!-- Bottom controls -->
    <div class="controls">
      <!-- Language selector -->
      <q-select
        v-model="selectedLanguage"
        :options="languageOptions"
        emit-value
        dense
        outlined
        map-options
        @update:model-value="changeLanguage"
        class="language-select"
      />

      <!-- Next button -->
      <q-btn
        color="primary"
        rounded
        :label="$t('WelcomePage.actions.next.label')"
        @click="goToNext"
        class="next-btn"
        icon="arrow_forward"
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
  height: 100%;
  background: var(--q-dark);
  color: white;
  padding: 40px 20px 20px 20px;
  box-sizing: border-box;
}

.logo {
  text-align: center;
  margin-bottom: 20px;
}

.logo-image {
  width: 60px;
  height: 60px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 15px 0;
  color: white;
  line-height: 1.2;
  text-align: center;
}

.description {
  font-size: 0.95rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 30px 0;
  text-align: center;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-top: auto;
}

.language-select {
  flex: 1;
  max-width: 120px;
}

.language-select :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  height: 36px;
  min-height: 36px;
}

.language-select :deep(.q-field__native) {
  color: white;
  font-size: 0.9rem;
}

.language-select :deep(.q-field__label) {
  color: rgba(255, 255, 255, 0.7);
}

.language-select :deep(.q-field__dropdown-icon) {
  color: rgba(255, 255, 255, 0.7);
}

.next-btn {
  flex: 1;
  max-width: 120px;
  height: 36px;
  font-weight: 500;
  text-transform: none;
  font-size: 0.9rem;
  border-radius: 18px;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .welcome-slide {
    padding: 30px 15px 15px 15px;
  }

  .title {
    font-size: 1.6rem;
  }

  .description {
    font-size: 0.9rem;
    max-width: 280px;
  }

  .controls {
    flex-direction: column;
    gap: 10px;
  }

  .language-select,
  .next-btn {
    width: 100%;
    max-width: none;
  }
}

/* Animation */
.animated.bounce {
  animation-duration: 0.8s;
  animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
</style>
