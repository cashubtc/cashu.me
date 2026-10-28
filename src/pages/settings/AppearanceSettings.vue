<template>
  <SettingsPageShell
    :title="$t('Settings.menu.appearance.title')"
    :caption="$t('Settings.menu.appearance.caption')"
  >
    <!-- keyboard -->
    <SettingsSection :title="$t('Settings.appearance.keyboard.title')">
      <SettingsToggleRow
        v-model="useNumericKeyboard"
        :label="$t('Settings.appearance.keyboard.toggle')"
        :caption="$t('Settings.appearance.keyboard.toggle_description')"
      />
    </SettingsSection>

    <!-- bip177 -->
    <SettingsSection :title="$t('Settings.appearance.bip177.title')">
      <SettingsToggleRow
        v-model="bip177BitcoinSymbol"
        :label="$t('Settings.appearance.bip177.toggle')"
        :caption="$t('Settings.appearance.bip177.description')"
      />
    </SettingsSection>

    <!-- mode: dark or light, chosen like a theme (light mode had no
         control in the app) -->
    <SettingsSection :title="$t('Settings.appearance.mode.title')">
      <SettingsRadioRow
        v-for="mode in modeOptions"
        :key="mode.name"
        data-testid="appearance-mode"
        :data-mode="mode.name"
        :selected="$q.dark.isActive === mode.dark"
        @select="selectMode(mode.dark)"
      >
        <template #label>
          <q-item-label class="theme-option-label">{{
            $t(`Settings.appearance.mode.${mode.name}`)
          }}</q-item-label>
        </template>
        <template #side>
          <component :is="mode.icon" :size="20" class="mode-glyph" />
        </template>
      </SettingsRadioRow>
    </SettingsSection>

    <!-- theme -->
    <SettingsSection
      :title="$t('Settings.appearance.theme.title')"
      :caption="$t('Settings.appearance.theme.description')"
    >
      <SettingsRadioRow
        v-for="theme in visibleThemeOptions"
        :key="theme.name"
        :selected="activeTheme === theme.name"
        @select="selectTheme(theme.name)"
      >
        <template #label>
          <q-item-label class="theme-option-label">{{
            $t(`Settings.appearance.theme.tooltips.${theme.tooltip}`)
          }}</q-item-label>
        </template>
        <template #side>
          <span
            class="theme-swatch"
            :class="`bg-${theme.color}`"
            aria-hidden="true"
          />
        </template>
      </SettingsRadioRow>
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapWritableState } from "pinia";
import { useSettingsStore } from "src/stores/settings";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsRadioRow from "src/components/ui/SettingsRadioRow.vue";
import SettingsToggleRow from "src/components/ui/SettingsToggleRow.vue";
import SettingsSection from "./SettingsSection.vue";
import { Moon as MoonIcon, Sun as SunIcon } from "lucide-vue-next";

export default defineComponent({
  name: "AppearanceSettings",
  mixins: [windowMixin],
  components: {
    SettingsRadioRow,
    SettingsToggleRow,
    SettingsPageShell,
    SettingsSection,
    MoonIcon,
    SunIcon,
  },
  data: function () {
    return {
      activeTheme: "monochrome",
      modeOptions: [
        { name: "dark", dark: true, icon: "MoonIcon" },
        { name: "light", dark: false, icon: "SunIcon" },
      ],
      themes: [
        "monochrome",
        "classic",
        "bitcoin",
        "mint",
        "autumn",
        "salvador",
        "freedom",
        "cyber",
        "flamingo",
      ],
      themeOptions: [
        { name: "monochrome", color: "grey", tooltip: "mono" },
        { name: "cyber", color: "green", tooltip: "cyber" },
        { name: "freedom", color: "pink-13", tooltip: "freedom" },
        { name: "classic", color: "deep-purple", tooltip: "nostr" },
        { name: "bitcoin", color: "orange", tooltip: "bitcoin" },
        { name: "mint", color: "light-green-9", tooltip: "mint" },
        { name: "autumn", color: "brown", tooltip: "nut" },
        { name: "salvador", color: "blue-10", tooltip: "blu" },
        { name: "flamingo", color: "pink-3", tooltip: "flamingo" },
      ],
    };
  },
  computed: {
    ...mapWritableState(useSettingsStore, [
      "useNumericKeyboard",
      "bip177BitcoinSymbol",
    ]),
    visibleThemeOptions() {
      return this.themeOptions.filter((theme) =>
        this.themes.includes(theme.name)
      );
    },
  },
  methods: {
    selectMode: function (dark: boolean) {
      if (this.$q.dark.isActive !== dark) this.toggleDarkMode();
    },
    selectTheme: function (themeName) {
      this.changeColor(themeName);
      this.activeTheme = themeName;
    },
  },
  created: function () {
    this.activeTheme =
      this.$q.localStorage.getItem("cashu.theme") || "monochrome";
  },
});
</script>

<style scoped>
.mode-glyph {
  color: var(--app-text-muted);
}
/* A filled swatch of each theme's accent, easier to compare than a small glyph. */
.theme-swatch {
  display: block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px var(--app-border-strong);
}
.theme-option-label {
  color: var(--app-text);
}
</style>
