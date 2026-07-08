<template>
  <SettingsPageShell
    :title="$t('Settings.menu.p2pk.title')"
    :caption="$t('Settings.menu.p2pk.caption')"
  >
    <SettingsSection
      :title="$t('Settings.p2pk_features.title')"
      :caption="$t('Settings.p2pk_features.description')"
    >
      <q-item>
        <q-item-section>
          <div class="row items-center q-gutter-sm">
            <q-btn
              class="q-px-md"
              color="primary"
              size="sm"
              rounded
              outline
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
      <q-item tag="label">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.p2pk_features.quick_access.toggle")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.p2pk_features.quick_access.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="showP2PkButtonInDrawer" color="primary" />
        </q-item-section>
      </q-item>
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
            <q-badge
              v-if="key.used"
              :label="$t('Settings.p2pk_features.keys_expansion.used_badge')"
              color="primary"
            />
            <q-icon
              name="content_copy"
              @click="copyText(key.publicKey)"
              size="xs"
              color="grey"
              class="cursor-pointer"
            />
            <q-icon
              name="qr_code"
              @click="showP2PKKeyEntry(key.publicKey)"
              size="xs"
              color="grey"
              class="cursor-pointer"
            />
          </div>
        </q-item-section>
      </q-item>
    </SettingsSection>

    <!-- P2PK DIALOG -->
    <P2PKDialog v-model="showP2PKDialog" />
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useP2PKStore } from "src/stores/p2pk";
import P2PKDialog from "src/components/P2PKDialog.vue";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "P2PKSettings",
  mixins: [windowMixin],
  components: {
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
