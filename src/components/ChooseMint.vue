<template>
  <div class="q-pb-md">
    <!-- title that says choose a mint -->
    <div class="row q-mb-none" v-if="title.length">
      <div class="col-12">
        <span class="text-caption">{{ title }}</span>
      </div>
    </div>
    <div
      class="row q-mt-xs q-mb-none"
      v-if="activeMintUrl || !requireActiveMint"
    >
      <div class="col-12 cursor-pointer">
        <q-select
          outlined
          class="q-px-none"
          color="white"
          v-model="chosenMint"
          :options="chooseMintOptions()"
          option-value="url"
          option-label="nickname"
          :rounded="rounded"
          :style="style"
          :dense="dense"
          :placeholder="placeholder"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label
                  class="text-body1 q-pt-xs"
                  :style="
                    activeMintUrl === scope.opt.url ? 'font-weight: bold' : ''
                  "
                  >{{ scope.opt.nickname || scope.opt.shorturl }}</q-item-label
                >
                <q-item-label
                  class="text-caption q-pb-xs"
                  style="font-family: monospace; font-size: 11px"
                >
                  {{ scope.opt.url }}</q-item-label
                >
                <div v-if="showBalances">
                  <q-badge
                    v-for="unit in scope.opt.units"
                    :key="unit"
                    :color="
                      scope.opt.url === activeMintUrl ? 'primary' : 'grey'
                    "
                    :label="formatCurrency(scope.opt.balances[unit], unit)"
                    class="q-mr-xs q-mb-xs"
                  />
                  <div v-if="scope.opt.errored" class="error-badge">
                    <q-badge
                      color="red"
                      class="q-mr-xs q-mt-sm text-weight-bold"
                      >{{ $t("ChooseMint.badge_option_mint_error_text") }}
                      <q-icon name="error" class="q-ml-xs" />
                    </q-badge>
                  </div>
                </div>
              </q-item-section>
            </q-item>
            <q-separator />
          </template>
          <template v-slot:prepend>
            <q-icon
              name="account_balance"
              size="1.2rem"
              color="grey"
              class="q-mr-none q-mb-none"
            />
          </template>
          <template v-slot:append v-if="showBalances">
            <div class="row items-center">
              <q-badge
                v-if="chosenMint?.errored"
                color="red"
                class="q-mr-xs text-weight-bold"
              >
                {{ $t("ChooseMint.badge_mint_error_text") }}
                <q-icon name="error" class="q-ml-xs" />
              </q-badge>
              <q-badge
                color="primary"
                :label="formatCurrency(getBalance, activeUnit)"
                class="q-ma-xs q-pa-sm text-weight-bold"
              />
            </div>
          </template>
        </q-select>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore } from "stores/mints";
import { MintClass } from "stores/mints";
import { i18n } from "../boot/i18n";

export default defineComponent({
  name: "ChooseMint",
  mixins: [windowMixin],
  props: {
    rounded: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: i18n.global.t("ChooseMint.title"),
    },
    style: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    showBalances: {
      type: Boolean,
      default: true,
    },
    requireActiveMint: {
      type: Boolean,
      default: true,
    },
    // When provided, this will be used instead of activeMintUrl
    modelValue: {
      type: String,
      default: null,
    },
  },
  emits: ["update:modelValue"],
  data: function () {
    return {
      chosenMint: null,
    };
  },
  mounted() {
    this.initializeChosenMint();
  },
  watch: {
    chosenMint: async function () {
      if (this.modelValue !== null) {
        // Emit the selected mint URL when using v-model
        this.$emit("update:modelValue", this.chosenMint?.url || "");
      } else {
        // Use the original behavior when not using v-model
        this.activeMintUrl = this.chosenMint?.url || "";
      }
    },
    modelValue: {
      handler() {
        this.initializeChosenMint();
      },
      immediate: true,
    },
    activeMintUrl: {
      handler() {
        if (this.modelValue === null) {
          this.initializeChosenMint();
        }
      },
    },
  },
  computed: {
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeProofs",
      "mints",
      "activeUnit",
    ]),
    ...mapWritableState(useMintsStore, ["activeMintUrl"]),
    getBalance: function () {
      return this.activeProofs
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
    },
  },
  methods: {
    ...mapActions(useMintsStore, ["activateMintUrl"]),
    initializeChosenMint() {
      const targetUrl =
        this.modelValue !== null ? this.modelValue : this.activeMintUrl;
      if (targetUrl) {
        const m = this.mints.find((m) => m.url === targetUrl);
        if (m) {
          const mint = new MintClass(m);
          this.chosenMint = {
            url: targetUrl,
            nickname: mint.mint.nickname || mint.mint.info?.name,
            shorturl: getShortUrl(targetUrl),
            errored: mint.mint.errored,
          };
        }
      }
    },
    chooseMintOptions: function () {
      let options = [];
      for (const [i, m] of Object.entries(this.mints)) {
        const all_units = m.keysets.map((r) => r.unit);
        const units = [...new Set(all_units)];
        const mint = new MintClass(m);
        options.push({
          nickname: mint.mint.nickname || mint.mint.info?.name,
          url: mint.mint.url,
          shorturl: getShortUrl(m.url),
          balances: mint.allBalances,
          errored: mint.mint.errored,
          units: units,
        });
      }
      return options;
    },
  },
});
</script>
