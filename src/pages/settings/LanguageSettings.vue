<template>
  <SettingsPageShell
    :title="$t('Settings.menu.language.title')"
    :caption="$t('Settings.menu.language.caption')"
  >
    <SettingsSection :radiogroup="$t('Settings.menu.language.title')">
      <SettingsRadioRow
        v-for="option in languageOptions"
        :key="option.value"
        :selected="activeLocale === option.value"
        :label="option.label"
        @select="selectLanguage(option.value)"
      />
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { LANGUAGE_OPTIONS } from "src/js/languages";
import { defineComponent } from "vue";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsRadioRow from "src/components/ui/SettingsRadioRow.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "LanguageSettings",
  mixins: [windowMixin],
  components: {
    SettingsRadioRow,
    SettingsPageShell,
    SettingsSection,
  },
  data: function () {
    return {
      languageOptions: LANGUAGE_OPTIONS,
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
