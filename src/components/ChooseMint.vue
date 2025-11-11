<template>
  <div class="q-pb-md">
    <!-- Main mint selector button -->
    <div
      class="row q-mt-xs q-mb-none"
      v-if="activeMintUrl || !requireActiveMint"
    >
      <div class="col-12">
        <div
          class="mint-selector-btn"
          :class="{ 'mint-selector-dense': dense }"
          :style="style"
          @click="showMintSheet = true"
        >
          <div class="row items-center full-width no-wrap">
            <!-- Mint Icon -->
            <q-avatar
              :size="dense ? '40px' : '48px'"
              class="q-mr-md mint-icon-avatar"
            >
              <q-img
                v-if="chosenMint?.iconUrl"
                :src="chosenMint.iconUrl"
                spinner-color="white"
                spinner-size="xs"
              >
                <template v-slot:error>
                  <div class="row items-center justify-center full-height">
                    <q-icon name="account_balance" color="grey-7" size="24px" />
                  </div>
                </template>
              </q-img>
              <q-icon
                v-else
                name="account_balance"
                color="grey-7"
                size="24px"
              />
            </q-avatar>

            <!-- Mint Info -->
            <div class="col text-left mint-info-section">
              <div class="mint-name-label">
                {{
                  chosenMint?.nickname ||
                  chosenMint?.shorturl ||
                  placeholder ||
                  $t("ChooseMint.placeholder")
                }}
              </div>
              <div v-if="showBalances && chosenMint" class="mint-balance-label">
                <span v-if="!chosenMint.errored" class="text-grey-6">
                  {{ formatCurrency(selectedMintBalance, activeUnit) }}
                  {{ $t("ChooseMint.available_text") }}
                </span>
                <span v-else class="text-red">
                  {{ $t("ChooseMint.badge_mint_error_text") }}
                </span>
              </div>
            </div>

            <!-- Chevron -->
            <q-icon name="expand_more" color="grey-6" size="20px" />
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Sheet for Mint Selection -->
    <teleport to="body">
      <transition name="mint-overlay">
        <div
          v-if="showMintSheet"
          class="mint-sheet-overlay"
          @click="showMintSheet = false"
        >
          <div class="mint-sheet" @click.stop>
            <!-- Header -->
            <div class="mint-sheet-header">
              <h3>{{ $t("ChooseMint.sheet_title") }}</h3>
              <q-btn
                flat
                round
                icon="close"
                @click="showMintSheet = false"
                class="close-btn"
              />
            </div>

            <!-- Mint List -->
            <div class="mint-options">
              <div
                v-for="mint in chooseMintOptions()"
                :key="mint.url"
                class="mint-option"
                :class="{ active: chosenMint?.url === mint.url }"
                @click="selectMint(mint)"
              >
                <div class="row items-center full-width no-wrap">
                  <!-- Mint Icon -->
                  <q-avatar size="48px" class="q-mr-md">
                    <q-img
                      v-if="mint.iconUrl"
                      :src="mint.iconUrl"
                      spinner-color="white"
                      spinner-size="xs"
                    >
                      <template v-slot:error>
                        <div
                          class="row items-center justify-center full-height"
                        >
                          <q-icon
                            name="account_balance"
                            color="grey-7"
                            size="24px"
                          />
                        </div>
                      </template>
                    </q-img>
                    <q-icon
                      v-else
                      name="account_balance"
                      color="grey-7"
                      size="24px"
                    />
                  </q-avatar>

                  <!-- Mint Info -->
                  <div class="col text-left">
                    <div class="mint-option-name">
                      {{ mint.nickname || mint.shorturl }}
                    </div>
                    <div v-if="showBalances" class="mint-option-balance">
                      <span v-if="!mint.errored" class="text-grey-6">
                        <span
                          v-for="unit in mint.units"
                          :key="unit"
                          class="q-mr-sm"
                        >
                          {{ formatCurrency(mint.balances[unit], unit) }}
                        </span>
                      </span>
                      <span v-else class="text-red">
                        {{ $t("ChooseMint.badge_mint_error_text") }}
                      </span>
                    </div>
                  </div>

                  <!-- Selection Indicator -->
                  <q-icon
                    v-if="chosenMint?.url === mint.url"
                    name="check_circle"
                    color="primary"
                    size="24px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore } from "stores/mints";
import { MintClass } from "stores/mints";
import type { Mint } from "stores/mints";
import { useUiStore } from "stores/ui";
import { i18n } from "../boot/i18n";

declare const windowMixin: any;

type MintOption = {
  nickname?: string | null;
  url: string;
  shorturl: string | null;
  iconUrl?: string | null;
  balances: Record<string, number>;
  errored?: boolean;
  units: string[];
};

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
    dryRun: {
      type: Boolean,
      default: false,
    },
    excludeMint: {
      type: String,
      default: null,
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
      chosenMint: null as MintOption | null,
      showMintSheet: false,
    };
  },
  mounted() {
    this.initializeChosenMint();
  },
  watch: {
    chosenMint: async function () {
      const selectedUrl = this.chosenMint?.url || "";
      if (this.dryRun || this.modelValue !== null) {
        this.$emit("update:modelValue", selectedUrl);
      }
      if (this.modelValue === null && !this.dryRun) {
        // Use the original behavior when not using v-model
        (this.activeMintUrl as unknown as string) = selectedUrl;
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
    excludeMint() {
      this.initializeChosenMint();
    },
  },
  computed: {
    ...mapState(useMintsStore, ["activeProofs", "mints", "activeUnit"]),
    ...mapWritableState(useMintsStore, ["activeMintUrl"]),
    selectedMintBalance(): number {
      const unit = this.activeUnit;
      if (!this.chosenMint || !unit) {
        return 0;
      }
      const balance = this.chosenMint.balances?.[unit];
      return typeof balance === "number" ? balance : 0;
    },
  },
  methods: {
    ...mapActions(useMintsStore, ["activateMintUrl"]),
    formatCurrency(value: number, currency: string) {
      return useUiStore().formatCurrency(value, currency);
    },
    applyChosenMint(option: MintOption | null) {
      if (!option) {
        this.chosenMint = null;
        return;
      }
      this.chosenMint = {
        ...option,
        balances: { ...option.balances },
        units: [...option.units],
      };
    },
    initializeChosenMint() {
      const options = this.chooseMintOptions();
      const fallbackUrl =
        this.chosenMint?.url && this.chosenMint.url !== this.excludeMint
          ? this.chosenMint.url
          : "";
      let targetUrl =
        this.modelValue !== null
          ? this.modelValue
          : fallbackUrl || this.activeMintUrl;
      if (targetUrl && targetUrl === this.excludeMint) {
        targetUrl = "";
      }
      if (targetUrl) {
        const matched = options.find(
          (option: MintOption) => option.url === targetUrl
        );
        if (matched) {
          this.applyChosenMint(matched);
          return;
        }
      }
      if (options.length) {
        this.applyChosenMint(options[0]);
      } else {
        this.applyChosenMint(null);
      }
    },
    selectMint(mint: MintOption) {
      if (this.excludeMint && mint.url === this.excludeMint) {
        return;
      }
      this.applyChosenMint(mint);
      this.showMintSheet = false;
    },
    chooseMintOptions: function () {
      const options: MintOption[] = [];
      const availableMints = Array.isArray(this.mints)
        ? (this.mints as Mint[])
        : [];
      for (const mintData of availableMints) {
        const all_units = mintData.keysets.map((r) => r.unit);
        const units = [...new Set(all_units)];
        const mint = new MintClass(mintData);
        if (!this.excludeMint || mint.mint.url !== this.excludeMint) {
          options.push({
            nickname: mint.mint.nickname || mint.mint.info?.name,
            url: mint.mint.url,
            shorturl: getShortUrl(mintData.url),
            iconUrl: mint.mint.info?.icon_url,
            balances: mint.allBalances,
            errored: mint.mint.errored,
            units: units,
          });
        }
      }
      return options;
    },
  },
});
</script>

<style lang="scss" scoped>
.mint-selector-btn {
  width: 100%;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &.mint-selector-dense {
    padding: 12px;
  }
}

.mint-icon-avatar {
  flex-shrink: 0;
}

.mint-info-section {
  min-width: 0;
}

.mint-name-label {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.3;
  color: white;
}

.mint-balance-label {
  font-size: 14px;
  line-height: 1.3;
  margin-top: 4px;
}

/* Bottom sheet overlay */
.mint-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
}

/* Bottom sheet */
.mint-sheet {
  width: 100%;
  background: rgba(20, 20, 20, 0.98);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px 20px 0 0;
  max-height: 70vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.mint-sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mint-sheet-header h3 {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  color: rgba(255, 255, 255, 0.7) !important;
}

.mint-options {
  flex: 1;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}

.mint-option {
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  &.active {
    background: rgba(var(--q-primary-rgb), 0.2);
  }

  &:last-child {
    border-bottom: none;
  }
}

.mint-option-name {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.3;
  color: white;
}

.mint-option-balance {
  font-size: 14px;
  line-height: 1.3;
  margin-top: 4px;
}

/* Vue transition for overlay fade and sheet slide */
.mint-overlay-enter-active,
.mint-overlay-leave-active {
  transition: opacity 0.3s ease;
}
.mint-overlay-enter-from,
.mint-overlay-leave-to {
  opacity: 0;
}
/* Animate the sheet together with the overlay */
.mint-overlay-enter-active .mint-sheet,
.mint-overlay-leave-active .mint-sheet {
  transition: transform 0.3s ease;
}
.mint-overlay-enter-from .mint-sheet,
.mint-overlay-leave-to .mint-sheet {
  transform: translateY(100%);
}
</style>
