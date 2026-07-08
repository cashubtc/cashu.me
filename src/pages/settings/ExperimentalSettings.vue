<template>
  <SettingsPageShell
    :title="$t('Settings.menu.experimental.title')"
    :caption="$t('Settings.menu.experimental.caption')"
  >
    <SettingsSection
      :title="$t('Settings.experimental.title')"
      :caption="$t('Settings.experimental.description')"
    >
      <!-- receive swaps -->
      <q-item tag="label">
        <q-item-section>
          <q-item-label>
            {{ $t("Settings.experimental.receive_swaps.toggle") }}
            <q-badge
              color="primary"
              :label="$t('Settings.experimental.receive_swaps.badge')"
              class="q-ml-sm"
            ></q-badge>
          </q-item-label>
          <q-item-label caption>{{
            $t("Settings.experimental.receive_swaps.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="enableReceiveSwaps" color="primary" />
        </q-item-section>
      </q-item>

      <!-- auto paste -->
      <q-item tag="label">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.experimental.auto_paste.toggle")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.experimental.auto_paste.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="autoPasteEcashReceive" color="primary" />
        </q-item-section>
      </q-item>

      <!-- auditor -->
      <q-item tag="label">
        <q-item-section>
          <q-item-label>
            {{ $t("Settings.experimental.auditor.toggle") }}
            <q-badge
              color="primary"
              :label="$t('Settings.experimental.auditor.badge')"
              class="q-ml-sm"
            ></q-badge>
          </q-item-label>
          <q-item-label caption>{{
            $t("Settings.experimental.auditor.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="auditorEnabled" color="primary" />
        </q-item-section>
      </q-item>
      <template v-if="auditorEnabled">
        <q-item class="settings-control-item">
          <q-item-section>
            <q-input
              v-model="auditorUrl"
              :label="$t('Settings.experimental.auditor.url_label')"
              color="primary"
              outlined
              dense
              rounded
            >
              <template v-slot:append>
                <q-btn
                  dense
                  flat
                  round
                  icon="content_copy"
                  @click="copyText(auditorUrl)"
                  size="sm"
                  color="grey"
                />
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
              outlined
              dense
              rounded
            >
              <template v-slot:append>
                <q-btn
                  dense
                  flat
                  round
                  icon="content_copy"
                  @click="copyText(auditorApiUrl)"
                  size="sm"
                  color="grey"
                />
              </template>
            </q-input>
          </q-item-section>
        </q-item>
      </template>

      <!-- multinut -->
      <q-item tag="label">
        <q-item-section>
          <q-item-label>
            {{ $t("Settings.multinut.use_multinut") }}
            <q-badge
              color="primary"
              :label="$t('Settings.experimental.receive_swaps.badge')"
              class="q-ml-sm"
            ></q-badge>
          </q-item-label>
          <q-item-label caption>{{
            $t("Settings.experimental.multinut.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="multinutEnabled" color="primary" />
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
  name: "ExperimentalSettings",
  mixins: [windowMixin],
  components: {
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
