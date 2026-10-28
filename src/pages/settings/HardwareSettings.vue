<template>
  <SettingsPageShell
    :title="$t('Settings.menu.hardware.title')"
    :caption="$t('Settings.menu.hardware.caption')"
  >
    <SettingsSection
      :title="$t('Settings.hardware_features.webnfc.title')"
      :caption="$t('Settings.hardware_features.webnfc.description')"
    >
      <SettingsRadioRow
        :selected="nfcEncoding === 'text'"
        :label="$t('Settings.hardware_features.webnfc.text.title')"
        :caption="$t('Settings.hardware_features.webnfc.text.description')"
        @select="nfcEncoding = 'text'"
      />
      <SettingsRadioRow
        :selected="nfcEncoding === 'weburl'"
        :label="$t('Settings.hardware_features.webnfc.weburl.title')"
        :caption="$t('Settings.hardware_features.webnfc.weburl.description')"
        @select="nfcEncoding = 'weburl'"
      />
      <SettingsRadioRow
        :selected="nfcEncoding === 'binary'"
        :label="$t('Settings.hardware_features.webnfc.binary.title')"
        :caption="$t('Settings.hardware_features.webnfc.binary.description')"
        @select="nfcEncoding = 'binary'"
      />
    </SettingsSection>

    <SettingsSection>
      <SettingsToggleRow
        v-model="showNfcButtonInDrawer"
        :label="$t('Settings.hardware_features.webnfc.quick_access.toggle')"
        :caption="
          $t('Settings.hardware_features.webnfc.quick_access.description')
        "
      />
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState, mapWritableState } from "pinia";
import { useSettingsStore } from "src/stores/settings";
import { useUiStore } from "src/stores/ui";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsRadioRow from "src/components/ui/SettingsRadioRow.vue";
import SettingsToggleRow from "src/components/ui/SettingsToggleRow.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "HardwareSettings",
  mixins: [windowMixin],
  components: {
    SettingsRadioRow,
    SettingsToggleRow,
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
