<template>
  <SettingsPageShell
    :title="$t('Settings.menu.appearance.title')"
    :caption="$t('Settings.menu.appearance.caption')"
  >
    <!-- use numeric keyboard -->
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">{{
              $t("Settings.appearance.keyboard.title")
            }}</q-item-label>
            <q-item-label caption>{{
              $t("Settings.appearance.keyboard.description")
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-toggle
            v-model="useNumericKeyboard"
            :label="$t('Settings.appearance.keyboard.toggle')"
            color="primary"
          /> </q-item
        ><q-item class="q-pt-none">
          <q-item-label caption
            >{{ $t("Settings.appearance.keyboard.toggle_description") }}
          </q-item-label>
        </q-item>
      </q-list>
    </div>

    <!-- bip177 -->
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">{{
              $t("Settings.appearance.bip177.title")
            }}</q-item-label>
            <q-item-label caption>{{
              $t("Settings.appearance.bip177.description")
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-toggle
            v-model="bip177BitcoinSymbol"
            :label="$t('Settings.appearance.bip177.toggle')"
            color="primary"
          />
        </q-item>
      </q-list>
    </div>

    <!-- theme -->
    <div class="q-py-mb q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">{{
              $t("Settings.appearance.theme.title")
            }}</q-item-label>
            <q-item-label caption
              >{{ $t("Settings.appearance.theme.description") }}
            </q-item-label>
            <div class="row q-pt-md">
              <q-btn
                v-if="themes.includes('monochrome')"
                dense
                flat
                @click="changeColor('monochrome')"
                icon="format_color_fill"
                color="grey"
                size="md"
                ><q-tooltip>{{
                  $t("Settings.appearance.theme.tooltips.mono")
                }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="themes.includes('cyber')"
                dense
                flat
                @click="changeColor('cyber')"
                icon="format_color_fill"
                color="green"
                size="md"
                ><q-tooltip>{{
                  $t("Settings.appearance.theme.tooltips.cyber")
                }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="themes.includes('freedom')"
                dense
                flat
                @click="changeColor('freedom')"
                icon="format_color_fill"
                color="pink-13"
                size="md"
                ><q-tooltip>{{
                  $t("Settings.appearance.theme.tooltips.freedom")
                }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="themes.includes('classic')"
                dense
                flat
                @click="changeColor('classic')"
                icon="format_color_fill"
                color="deep-purple"
                size="md"
                ><q-tooltip>{{
                  $t("Settings.appearance.theme.tooltips.nostr")
                }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="themes.includes('bitcoin')"
                dense
                flat
                @click="changeColor('bitcoin')"
                icon="format_color_fill"
                color="orange"
                size="md"
                ><q-tooltip>{{
                  $t("Settings.appearance.theme.tooltips.bitcoin")
                }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="themes.includes('mint')"
                dense
                flat
                @click="changeColor('mint')"
                icon="format_color_fill"
                color="light-green-9"
                size="md"
                ><q-tooltip>{{
                  $t("Settings.appearance.theme.tooltips.mint")
                }}</q-tooltip> </q-btn
              ><q-btn
                v-if="themes.includes('autumn')"
                dense
                flat
                @click="changeColor('autumn')"
                icon="format_color_fill"
                color="brown"
                size="md"
                ><q-tooltip>{{
                  $t("Settings.appearance.theme.tooltips.nut")
                }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="themes.includes('salvador')"
                dense
                flat
                @click="changeColor('salvador')"
                icon="format_color_fill"
                color="blue-10"
                size="md"
                ><q-tooltip>{{
                  $t("Settings.appearance.theme.tooltips.blu")
                }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="themes.includes('flamingo')"
                dense
                flat
                @click="changeColor('flamingo')"
                icon="format_color_fill"
                color="pink-3"
                size="md"
                ><q-tooltip>{{
                  $t("Settings.appearance.theme.tooltips.flamingo")
                }}</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapWritableState } from "pinia";
import { useSettingsStore } from "src/stores/settings";
import SettingsPageShell from "./SettingsPageShell.vue";

export default defineComponent({
  name: "AppearanceSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
  },
  data: function () {
    return {
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
    };
  },
  computed: {
    ...mapWritableState(useSettingsStore, [
      "useNumericKeyboard",
      "bip177BitcoinSymbol",
    ]),
  },
});
</script>
