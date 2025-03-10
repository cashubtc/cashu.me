<template>
  <q-dialog
    v-model="showMintInfoDialog"
    position="top"
    :maximized="$q.screen.lt.sm"
    transition-show="fade"
    transition-hide="fade"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card v-if="showMintInfoData" class="q-px-lg q-pt-md q-pb-md qcard">
      <div class="text-center q-mb-md q-mt-none q-pt-none">
        <q-responsive :ratio="1" class="q-mx-lg q-mt-none q-pt-none">
          <vue-qrcode
            :value="showMintInfoData.url"
            :options="{ width: 300 }"
            class="rounded-borders"
          >
          </vue-qrcode>
        </q-responsive>
        <div class="row justify-center">
          <div class="row justify-center">
            <q-chip
              outline
              class="q-pa-md q-mt-md"
              style="font-family: monospace; font-size: 0.8rem"
            >
              <q-icon name="account_balance" size="xs" class="q-mr-xs" />
              {{ showMintInfoData.url }}
            </q-chip>
          </div>
          <q-card-section class="q-pa-sm">
            <div
              v-if="showMintInfoData.errored"
              class="row justify-center q-pa-md"
            >
              <q-badge color="red" label="Error" class="q-mr-xs">
                <q-icon name="error" class="q-ml-xs" />
              </q-badge>
            </div>
            <div
              v-if="showMintInfoData.info.name"
              class="row justify-center q-pt-sm"
            >
              <q-item-label
                caption
                v-if="showMintInfoData.info.name"
                class="text-weight-bold text-white"
                style="font-size: 16px"
              >
                {{ showMintInfoData.info.name }}
              </q-item-label>
            </div>
            <div
              v-if="showMintInfoData.info.description"
              class="row justify-center q-pt-sm"
            >
              <q-item-label
                caption
                v-if="showMintInfoData.info.description"
                class="text-white"
                style="font-size: 12px"
              >
                {{ showMintInfoData.info.description }}
              </q-item-label>
            </div>
            <div
              v-if="showMintInfoData.info.description_long"
              class="row justify-center q-pt-sm"
            >
              <q-item-label
                caption
                v-if="showMintInfoData.info.description_long"
                class="text-weight-light text-white"
                style="font-size: 12px"
              >
                {{ showMintInfoData.info.description_long }}
              </q-item-label>
            </div>
            <div
              v-if="showMintInfoData.info.version"
              class="row justify-center q-pt-sm"
            >
              <q-item-label
                caption
                v-if="showMintInfoData.info.version"
                class="text-weight-light text-white"
                style="font-family: monospace; font-size: 0.7rem"
              >
                Version: {{ showMintInfoData.info.version }}
              </q-item-label>
            </div>
            <div
              v-if="showMintInfoData.info.nuts"
              class="row justify-center q-pt-sm"
            >
              <q-item-label
                caption
                v-if="showMintInfoData.info.nuts"
                class="text-weight-light text-white"
                style="font-family: monospace; font-size: 0.7rem"
              >
                <!-- only the keys of the info.nuts object -->
                Nuts: {{ Object.keys(showMintInfoData.info.nuts).join(", ") }}
              </q-item-label>
            </div>
          </q-card-section>

          <q-card-section>
            <div
              v-if="
                showMintInfoData.info.contact &&
                showMintInfoData.info.contact.length > 0
              "
              class="justify-center"
            >
              <div
                v-for="contactInfo in showMintInfoData.info.contact"
                :key="contactInfo.method"
                class="row justify-center q-pt-sm"
              >
                <q-item-label
                  caption
                  class="text-weight-light text-white"
                  style="font-family: monospace; font-size: 0.7rem"
                >
                  <q-icon
                    v-if="contactIcons[contactInfo.method]"
                    :name="contactIcons[contactInfo.method]"
                    size="xs"
                    class="q-mr-xs"
                  />
                  <span v-else class="text-weight-bold q-mr-xs">
                    {{ contactMethods[contactInfo.method] }}
                  </span>
                  {{ shortenText(contactInfo.info, 30) }}
                  <q-icon
                    name="content_copy"
                    @click="copyText(contactInfo.info)"
                    size="1em"
                    color="grey"
                    class="q-mr-xs cursor-pointer"
                  />
                </q-item-label>
              </div>
            </div>
          </q-card-section>
        </div>
        <div class="row q-mt-lg">
          <q-btn
            class="q-mx-xs"
            size="md"
            flat
            @click="copyText(showMintInfoData.url)"
            >Copy URL</q-btn
          >
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Close</q-btn>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import VueQrcode from "@chenfengyuan/vue-qrcode";

import { useMintsStore } from "src/stores/mints";
export default defineComponent({
  name: "MintInfoDialog",
  mixins: [windowMixin],
  components: {
    VueQrcode,
  },
  data: function () {
    return {
      contactIcons: {
        email: "mail_outline",
      },
      contactMethods: {
        twitter: "X",
        nostr: "Nostr",
      },
    };
  },
  computed: {
    ...mapState(useMintsStore, ["showMintInfoData"]),
    ...mapWritableState(useMintsStore, ["showMintInfoDialog"]),
  },
  methods: {
    shortenText: function (text, maxLength) {
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
      }
      return text;
    },
  },
});
</script>
