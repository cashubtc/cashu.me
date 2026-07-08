<template>
  <SettingsPageShell
    :title="$t('Settings.menu.language.title')"
    :caption="$t('Settings.menu.language.caption')"
  >
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">{{
              $t("Settings.language.title")
            }}</q-item-label>
            <q-item-label caption>{{
              $t("Settings.language.description")
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-select
              v-model="selectedLanguage"
              :options="languageOptions"
              rounded
              outlined
              dense
              emit-value
              map-options
              @update:model-value="changeLanguage"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SettingsPageShell from "./SettingsPageShell.vue";

export default defineComponent({
  name: "LanguageSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
  },
  data: function () {
    return {
      selectedLanguage: navigator.language || "en-US",
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
    changeLanguage(locale) {
      // Set the i18n locale
      this.$i18n.locale = locale;

      // Store the selected language in localStorage
      localStorage.setItem("cashu.language", locale);
    },
  },
  created: function () {
    // Set the initial selected language based on the current locale
    this.selectedLanguage =
      this.languageOptions.find((option) => option.value === this.$i18n.locale)
        ?.label || "Language";
  },
});
</script>
