<template>
  <SettingsPageShell
    :title="$t('Settings.menu.p2pk.title')"
    :caption="$t('Settings.menu.p2pk.caption')"
  >
    <SettingsSection
      warning
      :caption="$t('Settings.p2pk_features.description')"
    >
      <q-item>
        <q-item-section>
          <!-- Two equal choices, one filled and one outlined, sharing the row (a full button
               beside a small one reads as unrelated). -->
          <div class="row no-wrap p2pk-setup-actions">
            <q-btn
              color="primary"
              rounded
              unelevated
              class="col settings-primary-action"
              @click="generateKeypair"
              >{{ $t("Settings.p2pk_features.generate_button") }}</q-btn
            >
            <q-btn
              color="primary"
              rounded
              outline
              class="col"
              @click="importNsec"
              >{{ $t("Settings.p2pk_features.import_button") }}</q-btn
            >
          </div>
        </q-item-section>
      </q-item>
      <SettingsToggleRow
        v-model="showP2PkButtonInDrawer"
        :label="$t('Settings.p2pk_features.quick_access.toggle')"
        :caption="$t('Settings.p2pk_features.quick_access.description')"
      />
    </SettingsSection>

    <!-- keys -->
    <SettingsSection
      v-if="p2pkKeys.length"
      :title="
        $t('Settings.p2pk_features.keys_expansion.label', {
          count: p2pkKeys.length,
        })
      "
    >
      <q-item v-for="key in p2pkKeys" :key="key.publicKey">
        <q-item-section>
          <q-item-label
            caption
            class="cursor-pointer"
            style="word-break: break-all"
            @click="showP2PKKeyEntry(key.publicKey)"
            >{{ key.publicKey }}</q-item-label
          >
        </q-item-section>
        <q-item-section side>
          <div class="row items-center no-wrap q-gutter-sm">
            <AppBadge v-if="key.used">{{
              $t("Settings.p2pk_features.keys_expansion.used_badge")
            }}</AppBadge>
            <CopyButton :value="key.publicKey" />
            <IconButton
              :label="$t('global.actions.show_qr.label')"
              tooltip
              @click="showP2PKKeyEntry(key.publicKey)"
            >
              <QrCodeIcon :size="20" />
            </IconButton>
          </div>
        </q-item-section>
      </q-item>
    </SettingsSection>

    <!-- P2PK DIALOG -->
    <P2PKDialog v-model="showP2PKDialog" />
  </SettingsPageShell>
</template>

<script lang="ts">
import IconButton from "src/components/ui/IconButton.vue";
import AppBadge from "src/components/ui/AppBadge.vue";
import { QrCode as QrCodeIcon } from "lucide-vue-next";
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useP2PKStore } from "src/stores/p2pk";
import P2PKDialog from "src/components/P2PKDialog.vue";
import SettingsPageShell from "./SettingsPageShell.vue";
import CopyButton from "src/components/ui/CopyButton.vue";
import SettingsToggleRow from "src/components/ui/SettingsToggleRow.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "P2PKSettings",
  mixins: [windowMixin],
  components: {
    IconButton,
    AppBadge,
    QrCodeIcon,
    CopyButton,
    SettingsToggleRow,
    SettingsPageShell,
    SettingsSection,
    P2PKDialog,
  },
  computed: {
    ...mapState(useP2PKStore, ["p2pkKeys"]),
    ...mapWritableState(useP2PKStore, [
      "showP2PKDialog",
      "showP2PkButtonInDrawer",
    ]),
  },
  methods: {
    ...mapActions(useP2PKStore, [
      "importNsec",
      "generateKeypair",
      "showKeyDetails",
    ]),
    showP2PKKeyEntry: async function (pubKey) {
      this.showKeyDetails(pubKey);
      this.showP2PKDialog = true;
    },
  },
});
</script>

<style scoped>
.p2pk-setup-actions {
  gap: 12px;
}
</style>
