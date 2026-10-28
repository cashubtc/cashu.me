<template>
  <SettingsPageShell
    :title="$t('Settings.menu.experimental.title')"
    :caption="$t('Settings.menu.experimental.caption')"
  >
    <SettingsSection>
      <!-- receive swaps -->
      <SettingsToggleRow
        v-model="enableReceiveSwaps"
        :label="$t('Settings.experimental.receive_swaps.toggle')"
        :badge="$t('Settings.experimental.receive_swaps.badge')"
        :caption="$t('Settings.experimental.receive_swaps.description')"
      />

      <!-- auto paste -->
      <SettingsToggleRow
        v-model="autoPasteEcashReceive"
        :label="$t('Settings.experimental.auto_paste.toggle')"
        :caption="$t('Settings.experimental.auto_paste.description')"
      />

      <!-- auditor -->
      <SettingsToggleRow
        v-model="auditorEnabled"
        :label="$t('Settings.experimental.auditor.toggle')"
        :badge="$t('Settings.experimental.auditor.badge')"
        :caption="$t('Settings.experimental.auditor.description')"
      />
      <template v-if="auditorEnabled">
        <q-item class="settings-control-item">
          <q-item-section>
            <q-input
              v-model="auditorUrl"
              :label="$t('Settings.experimental.auditor.url_label')"
              color="primary"
              class="url-input"
              outlined
              dense
              rounded
            >
              <template v-slot:append>
                <CopyButton :value="auditorUrl" />
              </template>
            </q-input>
          </q-item-section>
        </q-item>
        <q-item class="settings-control-item">
          <q-item-section>
            <q-input
              v-model="auditorApiUrl"
              :label="$t('Settings.experimental.auditor.api_url_label')"
              color="primary"
              class="url-input"
              outlined
              dense
              rounded
            >
              <template v-slot:append>
                <CopyButton :value="auditorApiUrl" />
              </template>
            </q-input>
          </q-item-section>
        </q-item>
      </template>

      <!-- multinut -->
      <SettingsToggleRow
        v-model="multinutEnabled"
        :label="$t('Settings.multinut.use_multinut')"
        :badge="$t('Settings.experimental.receive_swaps.badge')"
        :caption="$t('Settings.experimental.multinut.description')"
      />
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapWritableState } from "pinia";
import { useSettingsStore } from "src/stores/settings";
import SettingsPageShell from "./SettingsPageShell.vue";
import CopyButton from "src/components/ui/CopyButton.vue";
import SettingsToggleRow from "src/components/ui/SettingsToggleRow.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "ExperimentalSettings",
  mixins: [windowMixin],
  components: {
    SettingsToggleRow,
    CopyButton,
    SettingsPageShell,
    SettingsSection,
  },
  computed: {
    ...mapWritableState(useSettingsStore, [
      "enableReceiveSwaps",
      "autoPasteEcashReceive",
      "auditorEnabled",
      "auditorUrl",
      "auditorApiUrl",
      "multinutEnabled",
    ]),
  },
});
</script>
