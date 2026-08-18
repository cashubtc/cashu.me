<template>
  <SettingsPageShell
    :title="$t('Settings.menu.hardware.title')"
    :caption="$t('Settings.menu.hardware.caption')"
  >
    <SettingsSection
      :title="$t('Settings.hardware_features.webnfc.title')"
      :caption="$t('Settings.hardware_features.webnfc.description')"
    >
      <q-item clickable @click="nfcEncoding = 'text'">
        <q-item-section avatar>
          <q-icon
            :color="nfcEncoding === 'text' ? 'primary' : 'grey'"
            :name="
              nfcEncoding === 'text' ? 'check_circle' : 'radio_button_unchecked'
            "
          />
        </q-item-section>
        <q-item-section style="word-break: break-word">
          <q-item-label>{{
            $t("Settings.hardware_features.webnfc.text.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.hardware_features.webnfc.text.description")
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable @click="nfcEncoding = 'weburl'">
        <q-item-section avatar>
          <q-icon
            :color="nfcEncoding === 'weburl' ? 'primary' : 'grey'"
            :name="
              nfcEncoding === 'weburl'
                ? 'check_circle'
                : 'radio_button_unchecked'
            "
          />
        </q-item-section>
        <q-item-section style="word-break: break-word">
          <q-item-label>{{
            $t("Settings.hardware_features.webnfc.weburl.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.hardware_features.webnfc.weburl.description")
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable @click="nfcEncoding = 'binary'">
        <q-item-section avatar>
          <q-icon
            :color="nfcEncoding === 'binary' ? 'primary' : 'grey'"
            :name="
              nfcEncoding === 'binary'
                ? 'check_circle'
                : 'radio_button_unchecked'
            "
          />
        </q-item-section>
        <q-item-section style="word-break: break-word">
          <q-item-label>{{
            $t("Settings.hardware_features.webnfc.binary.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.hardware_features.webnfc.binary.description")
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item tag="label">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.hardware_features.webnfc.quick_access.toggle")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.hardware_features.webnfc.quick_access.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="showNfcButtonInDrawer" color="primary" />
        </q-item-section>
      </q-item>
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState, mapWritableState } from "pinia";
import { useSettingsStore } from "src/stores/settings";
import { useUiStore } from "src/stores/ui";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "HardwareSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    SettingsSection,
  },
  computed: {
    ...mapWritableState(useSettingsStore, [
      "nfcEncoding",
      "showNfcButtonInDrawer",
    ]),
    ...mapState(useUiStore, ["ndefSupported"]),
  },
});
</script>
