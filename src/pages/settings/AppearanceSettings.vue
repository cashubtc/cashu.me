<template>
  <SettingsPageShell
    :title="$t('Settings.menu.appearance.title')"
    :caption="$t('Settings.menu.appearance.caption')"
  >
    <!-- keyboard -->
    <SettingsSection
      :title="$t('Settings.appearance.keyboard.title')"
      :caption="$t('Settings.appearance.keyboard.description')"
    >
      <q-item tag="label">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.appearance.keyboard.toggle")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.appearance.keyboard.toggle_description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="useNumericKeyboard" color="primary" />
        </q-item-section>
      </q-item>
    </SettingsSection>

    <!-- bip177 -->
    <SettingsSection
      :title="$t('Settings.appearance.bip177.title')"
      :caption="$t('Settings.appearance.bip177.description')"
    >
      <q-item tag="label">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.appearance.bip177.toggle")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="bip177BitcoinSymbol" color="primary" />
        </q-item-section>
      </q-item>
    </SettingsSection>

    <!-- theme -->
    <SettingsSection
      :title="$t('Settings.appearance.theme.title')"
      :caption="$t('Settings.appearance.theme.description')"
    >
      <q-item
        v-for="theme in visibleThemeOptions"
        :key="theme.name"
        clickable
        @click="selectTheme(theme.name)"
        :active="activeTheme === theme.name"
        active-class="text-weight-bold text-primary"
      >
        <q-item-section avatar>
          <q-icon
            :color="activeTheme === theme.name ? 'primary' : 'grey'"
            :name="
              activeTheme === theme.name
                ? 'check_circle'
                : 'radio_button_unchecked'
            "
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{
            $t(`Settings.appearance.theme.tooltips.${theme.tooltip}`)
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="format_color_fill" :color="theme.color" size="sm" />
        </q-item-section>
      </q-item>
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapWritableState } from "pinia";
import { useSettingsStore } from "src/stores/settings";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "AppearanceSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    SettingsSection,
  },
  data: function () {
    return {
      activeTheme: "monochrome",
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
