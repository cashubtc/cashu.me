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
          <div class="row items-center q-gutter-sm">
            <q-btn
              color="primary"
              rounded
              unelevated
              no-caps
              class="settings-primary-action"
              @click="generateKeypair"
              >{{ $t("Settings.p2pk_features.generate_button") }}</q-btn
            >
            <q-btn
              class="q-px-md"
              color="primary"
              size="sm"
              rounded
              outline
              @click="importNsec"
              >{{ $t("Settings.p2pk_features.import_button") }}</q-btn
            >
          </div>
        </q-item-section>
      </q-item>
      <!-- Shown once a key exists: before that the toggle could do nothing (R16). -->
      <SettingsToggleRow
        v-if="p2pkKeys.length"
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
            <CopyButton :value="key.publicKey" :icon-size="18" />
            <q-btn
              flat
              dense
              round
              size="sm"
              color="grey"
              :aria-label="
                $t('Settings.nostr_wallet_connect.connection.qr_tooltip')
              "
              @click="showP2PKKeyEntry(key.publicKey)"
            >
              <QrCodeIcon :size="18" />
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
    </SettingsSection>

    <!-- P2PK DIALOG -->
    <P2PKDialog v-model="showP2PKDialog" />
  </SettingsPageShell>
</template>

<script lang="ts">
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
