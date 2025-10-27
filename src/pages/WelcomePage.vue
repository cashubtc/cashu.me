<!-- src/components/WelcomePage.vue -->
<template>
  <q-dialog
    v-model="welcomeStore.showWelcome"
    persistent
    transition-show="slide-up"
    transition-hide="fadeOut"
    full-screen
    @drop.prevent="dragFile"
    @dragover.prevent
  >
    <q-card class="q-pa-none" style="height: 100%">
      <q-carousel
        v-model="welcomeStore.currentSlide"
        animated
        control-color="primary"
        class="flex-1"
        style="height: 100%"
      >
        <q-carousel-slide :name="0">
          <WelcomeSlide1 />
        </q-carousel-slide>
        <q-carousel-slide :name="1">
          <WelcomeSlide2 />
        </q-carousel-slide>
        <q-carousel-slide :name="2">
          <WelcomeSlideChoice />
        </q-carousel-slide>
        <!-- New wallet flow: seed display at slide 3 -->
        <q-carousel-slide
          :name="3"
          v-if="welcomeStore.onboardingPath === 'new'"
        >
          <WelcomeSlide3 />
        </q-carousel-slide>
        <!-- Recover flow: seed input at slide 3 -->
        <q-carousel-slide
          :name="3"
          v-else-if="welcomeStore.onboardingPath === 'recover'"
        >
          <WelcomeRecoverSeed />
        </q-carousel-slide>
        <!-- Mints setup at slide 4 (both paths) -->
        <q-carousel-slide :name="4" v-if="welcomeStore.onboardingPath">
          <WelcomeMintSetup />
        </q-carousel-slide>
        <!-- Recover flow: restore ecash at slide 5 -->
        <q-carousel-slide
          :name="5"
          v-if="welcomeStore.onboardingPath === 'recover'"
        >
          <WelcomeRestoreEcash />
        </q-carousel-slide>
      </q-carousel>

      <div
        class="q-pa-md flex justify-between"
        v-if="welcomeStore.currentSlide > 0"
      >
        <q-btn
          flat
          icon="arrow_left"
          :label="$t('WelcomePage.actions.previous.label')"
          v-if="welcomeStore.canGoPrev"
          @click="welcomeStore.goToPrevSlide"
        />
        <!-- language selector (hidden on first slide since it's now in the slide itself) -->
        <div
          class="q-ml-md"
          v-if="!welcomeStore.canGoPrev && welcomeStore.currentSlide > 0"
          style="position: relative; top: -5px"
        >
          <q-select
            v-model="selectedLanguage"
            :options="languageOptions"
            emit-value
            dense
            map-options
            @update:model-value="changeLanguage"
            style="max-width: 200px; max-height: 20px"
          />
        </div>
        <q-space />
        <q-btn
          flat
          icon="arrow_right"
          :label="$t('WelcomePage.actions.next.label')"
          :disable="!welcomeStore.canProceed"
          @click="welcomeStore.goToNextSlide"
          v-if="
            welcomeStore.currentSlide > 0 && welcomeStore.currentSlide !== 2
          "
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import { useWelcomeStore } from "src/stores/welcome";
import { useStorageStore } from "src/stores/storage";
import WelcomeSlide1 from "./welcome/WelcomeSlide1.vue";
import WelcomeSlide2 from "./welcome/WelcomeSlide2.vue";
import WelcomeSlide3 from "./welcome/WelcomeSlide3.vue";
import WelcomeSlideChoice from "./welcome/WelcomeSlideChoice.vue";
import WelcomeRecoverSeed from "./welcome/WelcomeRecoverSeed.vue";
import WelcomeMintSetup from "./welcome/WelcomeMintSetup.vue";
import WelcomeRestoreEcash from "./welcome/WelcomeRestoreEcash.vue";

export default {
  name: "WelcomePage",
  components: {
    WelcomeSlide1,
    WelcomeSlide2,
    WelcomeSlide3,
    WelcomeSlideChoice,
    WelcomeRecoverSeed,
    WelcomeMintSetup,
    WelcomeRestoreEcash,
  },
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
    changeLanguage(locale) {
      // Set the i18n locale
      this.$i18n.locale = locale;

      // Store the selected language in localStorage
      localStorage.setItem("cashu.language", locale);
    },
  },
  created() {
    // Set the initial selected language based on the current locale or from storage
    this.selectedLanguage =
      this.languageOptions.find(
        (option) => option.value === this.$i18n.locale || navigator.language
      )?.label || "Language";
  },
  setup() {
    const welcomeStore = useWelcomeStore();
    const storageStore = useStorageStore();
    const fileUpload = ref(null);

    const onChangeFileUpload = () => {
      const file = fileUpload.value.files[0];
      if (file) readFile(file);
    };

    const readFile = (file) => {
      const reader = new FileReader();
      reader.onload = (f) => {
        const backup = JSON.parse(f.target.result);
        storageStore.restoreFromBackup(backup);
      };
      reader.readAsText(file);
    };

    const dragFile = (ev) => {
      const file = ev.dataTransfer.files[0];
      if (file) readFile(file);
    };

    onMounted(() => {
      welcomeStore.initializeWelcome();
    });

    return {
      welcomeStore,
      fileUpload,
      onChangeFileUpload,
      dragFile,
    };
  },
};
</script>

<style scoped>
.q-dialog__inner {
  height: 100%;
  width: 100%;
  margin: 0; /* Align dialog to cover the entire viewport */
}

.q-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.q-carousel {
  flex: 1;
}

.custom-navigation {
  display: flex;
  justify-content: space-between;
  padding: 16px;
}
</style>
