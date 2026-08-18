<template>
  <SettingsPageShell
    :title="$t('Settings.menu.language.title')"
    :caption="$t('Settings.menu.language.caption')"
  >
    <SettingsSection
      :title="$t('Settings.language.title')"
      :caption="$t('Settings.language.description')"
    >
      <q-item
        v-for="option in languageOptions"
        :key="option.value"
        clickable
        @click="selectLanguage(option.value)"
        :active="activeLocale === option.value"
        active-class="text-weight-bold text-primary"
      >
        <q-item-section avatar>
          <q-icon
            :color="activeLocale === option.value ? 'primary' : 'grey'"
            :name="
              activeLocale === option.value
                ? 'check_circle'
                : 'radio_button_unchecked'
            "
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ option.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "LanguageSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    SettingsSection,
  },
  data: function () {
    return {
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
  computed: {
    activeLocale() {
      return this.$i18n.locale;
    },
  },
  methods: {
    selectLanguage(locale) {
      // Set the i18n locale
      this.$i18n.locale = locale;

      // Store the selected language in localStorage
      localStorage.setItem("cashu.language", locale);
    },
  },
});
</script>
