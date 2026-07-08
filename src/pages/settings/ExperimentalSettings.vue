<template>
  <SettingsPageShell
    :title="$t('Settings.menu.experimental.title')"
    :caption="$t('Settings.menu.experimental.caption')"
  >
    <div class="q-py-sm q-px-xs text-left" on-left>
      <!-- enable receive swaps -->
      <q-item>
        <q-item-section>
          <q-item-label overline class="text-weight-bold">{{
            $t("Settings.experimental.title")
          }}</q-item-label>
          <q-item-label caption>
            {{ $t("Settings.experimental.description") }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-toggle
          v-model="enableReceiveSwaps"
          :label="$t('Settings.experimental.receive_swaps.toggle')"
          color="primary"
        >
          <q-badge
            color="primary"
            :label="$t('Settings.experimental.receive_swaps.badge')"
            class="q-mx-sm"
          ></q-badge>
        </q-toggle>
      </q-item>
      <q-item class="q-pt-none">
        <q-item-label caption
          >{{ $t("Settings.experimental.receive_swaps.description") }}
        </q-item-label>
      </q-item>
      <q-item>
        <q-toggle
          v-model="autoPasteEcashReceive"
          :label="$t('Settings.experimental.auto_paste.toggle')"
          color="primary"
        /> </q-item
      ><q-item class="q-pt-none">
        <q-item-label caption
          >{{ $t("Settings.experimental.auto_paste.description") }}
        </q-item-label>
      </q-item>

      <!-- auditor settings -->
      <q-item>
        <q-toggle
          v-model="auditorEnabled"
          :label="$t('Settings.experimental.auditor.toggle')"
          color="primary"
        >
          <q-badge
            color="primary"
            :label="$t('Settings.experimental.auditor.badge')"
            class="q-mx-sm"
          ></q-badge>
        </q-toggle>
      </q-item>
      <div v-if="auditorEnabled">
        <q-item class="q-pt-none">
          <q-item-label caption
            >{{ $t("Settings.experimental.auditor.description") }}
          </q-item-label>
        </q-item>
        <div class="row q-mx-md">
          <div class="col-12">
            <q-input
              v-model="auditorUrl"
              :label="$t('Settings.experimental.auditor.url_label')"
              color="primary"
              outlined
              dense
              rounded
              :disable="!auditorEnabled"
            >
              <template v-slot:append>
                <q-btn
                  dense
                  flat
                  icon="content_copy"
                  @click="copyText(auditorUrl)"
                  size="sm"
                  color="grey"
                />
              </template>
            </q-input>
          </div>
        </div>
        <div class="row q-mx-md q-mt-md">
          <div class="col-12">
            <q-input
              v-model="auditorApiUrl"
              :label="$t('Settings.experimental.auditor.api_url_label')"
              color="primary"
              outlined
              dense
              rounded
              :disable="!auditorEnabled"
            >
              <template v-slot:append>
                <q-btn
                  dense
                  flat
                  icon="content_copy"
                  @click="copyText(auditorApiUrl)"
                  size="sm"
                  color="grey"
                />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <!-- multinut settings -->
      <div class="row q-mx-md q-mt-md">
        <div class="col-12">
          <div class="row q-pt-md">
            <q-toggle
              v-model="multinutEnabled"
              :label="$t('Settings.multinut.use_multinut')"
              color="primary"
            >
              <q-badge
                color="primary"
                :label="$t('Settings.experimental.receive_swaps.badge')"
                class="q-mx-sm"
              ></q-badge>
              <q-item-label caption>
                {{ $t("Settings.experimental.multinut.description") }}
              </q-item-label>
            </q-toggle>
          </div>
        </div>
      </div>
    </div>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapWritableState } from "pinia";
import { useSettingsStore } from "src/stores/settings";
import SettingsPageShell from "./SettingsPageShell.vue";

export default defineComponent({
  name: "ExperimentalSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
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
