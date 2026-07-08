<template>
  <SettingsPageShell
    :title="$t('Settings.menu.p2pk.title')"
    :caption="$t('Settings.menu.p2pk.caption')"
  >
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">{{
              $t("Settings.p2pk_features.title")
            }}</q-item-label>
            <q-item-label caption>{{
              $t("Settings.p2pk_features.description")
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item style="display: inline-block">
          <q-btn
            class="q-ml-sm q-px-md"
            color="primary"
            size="sm"
            rounded
            outline
            @click="generateKeypair"
            >{{ $t("Settings.p2pk_features.generate_button") }}</q-btn
          >
        </q-item>
        <q-item style="display: inline-block">
          <q-btn
            class="q-ml-sm q-px-md"
            color="primary"
            size="sm"
            rounded
            outline
            @click="importNsec"
            >{{ $t("Settings.p2pk_features.import_button") }}</q-btn
          >
        </q-item>
        <q-item>
          <q-toggle
            v-model="showP2PkButtonInDrawer"
            :label="$t('Settings.p2pk_features.quick_access.toggle')"
            color="primary"
          /> </q-item
        ><q-item class="q-pt-none">
          <q-item-label caption
            >{{ $t("Settings.p2pk_features.quick_access.description") }}
          </q-item-label>
        </q-item>
      </q-list>
      <q-item v-if="p2pkKeys.length">
        <q-expansion-item
          dense
          dense-toggle
          v-if="p2pkKeys.length"
          class="text-left"
          :label="
            $t('Settings.p2pk_features.keys_expansion.label', {
              count: p2pkKeys.length,
            })
          "
        >
          <q-item v-for="key in p2pkKeys" :key="key.privakey">
            <q-item-section
              class="q-mx-none q-pl-none"
              style="max-width: 1.05em"
            >
              <q-icon
                name="content_copy"
                @click="copyText(key.publicKey)"
                size="1.2em"
                color="grey"
                class="q-mr-xs cursor-pointer"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label
                caption
                clickable
                style="word-break: break-word; font-size: 0.65rem"
                class="q-mx-sm"
                @click="showP2PKKeyEntry(key.publicKey)"
                >{{ key.publicKey }}</q-item-label
              >
            </q-item-section>
            <q-item-section side>
              <q-badge
                v-if="key.used"
                :label="$t('Settings.p2pk_features.keys_expansion.used_badge')"
                color="primary"
                class="q-mr-sm"
              />
            </q-item-section>
            <q-item-section
              class="q-mx-none q-pl-none"
              style="max-width: 1.05em"
            >
              <q-icon
                name="qr_code"
                @click="showP2PKKeyEntry(key.publicKey)"
                size="1em"
                color="grey"
                class="q-mr-xs cursor-pointer"
              />
            </q-item-section>
          </q-item>
        </q-expansion-item>
      </q-item>
    </div>

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

export default defineComponent({
  name: "P2PKSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
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
