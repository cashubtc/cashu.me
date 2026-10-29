<template>
  <div class="q-mt-lg q-mb-lg">
    <div class="text-caption q-mx-sm" v-if="loading">
      <PendingDots class="q-mr-sm" />
      {{ $t("MintAuditInfo.loading") }}
    </div>
    <div v-else-if="mintNotAudited" class="q-mx-sm">
      <InfoIcon
        :size="20"
        class="q-mr-sm text-app-muted"
        style="vertical-align: -4px"
      />
      <span class="text-bold">{{ $t("MintAuditInfo.not_audited") }}</span>
      <br />
      <i18n-t
        keypath="MintAuditInfo.not_audited_text"
        tag="span"
        class="text-caption"
      >
        <template #link>
          <a :href="auditUrl">audit.8333.space</a>
        </template>
        <template #here>
          <span
            class="text-bold cursor-pointer text-primary"
            @click="getAuditorPaymentRequestsAndHandle"
            >{{ $t("MintAuditInfo.here") }}</span
          >
        </template>
      </i18n-t>
    </div>
    <!-- On the Mint details row grid, with its icon, not a loose line under a centred label
         (council R83-R84). -->
    <DetailRow
      v-else-if="error"
      :icon="InfoIcon"
      :label="
        /fetch|network/i.test(error) ? $t('MintAuditInfo.unavailable') : error
      "
    />
    <div v-else-if="mintInfo" class="mint-info">
      <!-- Warning Box -->
      <div style="margin-bottom: 32px">
        <transition
          appear
          enter-active-class="animated pulse"
          name="smooth-slide"
        >
          <MintAuditWarningBox :mint="mintInfo" :swaps="mintSwaps" />
        </transition>
      </div>
      <!-- statistics -->
      <div class="q-pb-none">
        <div class="row q-col-gutter-md q-px-md" style="flex-wrap: nowrap">
          <!-- Success Rate Card -->
          <div class="col-6 stat-card">
            <div class="q-pa-md">
              <div class="text-subtitle1">
                {{ $t("MintAuditInfo.success_rate") }}
              </div>
              <div class="text-h5">{{ successRate }}%</div>
              <div class="text-caption">
                {{
                  $t("MintAuditInfo.swaps_count", {
                    successful: successfulSwaps,
                    total: mintSwaps.length,
                  })
                }}
              </div>
            </div>
          </div>
          <!-- Average Time Card -->
          <div class="col-6 stat-card q-ml-md">
            <div class="q-pa-md">
              <div class="text-subtitle1">
                {{ $t("MintAuditInfo.average_time") }}
              </div>
              <div class="text-h5">{{ formatTime(averageTime) }}</div>
              <div class="text-caption">
                {{ $t("MintAuditInfo.average_time_caption") }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bar Chart -->
      <div v-if="mintSwaps.length > 0" class="q-py-md">
        <MintAuditSwapsBarChart :swaps="mintSwaps" />
      </div>

      <!-- Disclaimer -->
      <div class="q-mt-md text-app-muted text-caption">
        {{ $t("MintAuditInfo.disclaimer") }}
      </div>
      <!-- Donate ecash to the auditor -->
      <i18n-t
        keypath="MintAuditInfo.donate_text"
        tag="div"
        class="q-mt-md text-app-muted text-caption"
      >
        <template #link>
          <a :href="auditUrl">{{ auditUrlShort }}</a>
        </template>
        <template #balance>
          <span class="text-bold">{{
            $t("MintAuditInfo.sats_amount", { amount: mintInfo.balance })
          }}</span>
        </template>
        <template #donations>
          <span class="text-bold">{{
            $t("MintAuditInfo.sats_amount", { amount: mintInfo.sum_donations })
          }}</span>
        </template>
        <template #press_here>
          <span
            class="text-bold cursor-pointer text-primary"
            @click="getAuditorPaymentRequestsAndHandle"
            >{{ $t("MintAuditInfo.press_here") }}</span
          >
        </template>
      </i18n-t>
    </div>
  </div>
</template>

<script lang="ts">
import PendingDots from "src/components/ui/PendingDots.vue";
import { Info as InfoIcon } from "lucide-vue-next";
import { markRaw } from "vue";
interface MintRead {
  id: number;
  url: string;
  info?: string;
  name?: string;
  balance: number;
  sum_donations?: number;
  updated_at: string;
  next_update?: string;
  state: string;
  n_errors: number;
  n_mints: number;
  n_melts: number;
}

interface SwapEventRead {
  id: number;
  from_id: number;
  to_id: number;
  from_url: string;
  to_url: string;
  amount: number;
  fee: number;
  created_at: string;
  time_taken: number;
  state: string;
  error: string;
}

import MintAuditWarningBox from "./MintAuditWarningBox.vue";
import DetailRow from "src/components/ui/DetailRow.vue";
import MintAuditSwapsBarChart from "./MintAuditSwapsBarChart.vue";
import { useWalletStore } from "../stores/wallet";
import { useMintsStore } from "../stores/mints";
import { useSettingsStore } from "../stores/settings";
import { getShortUrl } from "../js/wallet-helpers";

export default {
  name: "MintAuditInfo",
  components: {
    DetailRow,
    PendingDots,
    InfoIcon,
    MintAuditWarningBox,
    MintAuditSwapsBarChart,
  },
  props: {
    mintUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    const settingsStore = useSettingsStore();
    return {
      InfoIcon: markRaw(InfoIcon),
      auditorApiUrl: settingsStore.auditorApiUrl,
      auditUrl: settingsStore.auditorUrl,
      auditUrlShort: getShortUrl(settingsStore.auditorUrl),
      mintNotAudited: false,
      loading: true,
      error: null,
      couldFetchInfo: true,
      mints: [] as MintRead[],
      mintInfo: null as MintRead | null,
      mintSwaps: [] as SwapEventRead[],
      limit: 100,
      skip: 0,
      allLoaded: false,
      loadingMore: false,
    };
  },
  computed: {
    successfulSwaps() {
      return this.mintSwaps.filter((swap) => swap.state === "OK").length;
    },
    successRate() {
      if (this.mintSwaps.length === 0) return 0;
      return Math.round((this.successfulSwaps / this.mintSwaps.length) * 100);
    },
    averageTime() {
      const successfulSwapsWithTime = this.mintSwaps.filter(
        (swap) => swap.state === "OK" && swap.time_taken
      );
      if (successfulSwapsWithTime.length === 0) return 0;
      const totalTime = successfulSwapsWithTime.reduce(
        (sum, swap) => sum + (swap.time_taken || 0),
        0
      );
      return totalTime / successfulSwapsWithTime.length;
    },
  },
  async mounted() {
    try {
      this.loading = true;
      await this.getMintInfo();
      if (this.mintInfo && this.mintInfo.id) {
        await this.getMintSwaps(this.mintInfo.id);
      }
    } catch (err: any) {
      this.error =
        err.message || (this.$t("MintAuditInfo.load_failed") as string);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async getMintInfo() {
      try {
        const response = await fetch(
          `${this.auditorApiUrl}/mints/url?url=${this.mintUrl}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            this.mintNotAudited = true;
            throw new Error(`This mint is not being audited yet.`);
          }
          throw new Error(`API error: ${response.status}`);
        }
        this.mintInfo = (await response.json()) as MintRead;
        console.log("# MintAuditInfo", this.mintInfo);
        if (!this.mintInfo) {
          this.mintNotAudited = true;
          throw new Error(`This mint is not being audited yet.`);
        }
      } catch (err) {
        console.error("Error fetching mint info:", err);
        throw err;
      }
    },
    async getMintSwaps(mintId: number, skip = 0, limit = 100) {
      try {
        const response = await fetch(
          `${this.auditorApiUrl}/swaps/mint/${mintId}?skip=${skip}&limit=${limit}`
        );
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const fetchedSwaps = (await response.json()) as SwapEventRead[];

        if (skip === 0) {
          this.mintSwaps = fetchedSwaps;
        } else {
          this.mintSwaps = [...this.mintSwaps, ...fetchedSwaps];
        }

        this.skip += limit;
        this.allLoaded = fetchedSwaps.length < limit;
      } catch (err) {
        console.error("Error fetching mint swaps:", err);
        throw err;
      }
    },
    async getAuditorPaymentRequestsAndHandle() {
      const walletStore = useWalletStore();
      const mintStore = useMintsStore();
      try {
        const response = await fetch(
          `${this.auditorApiUrl}/pr?url=${this.mintUrl}`
        );
        const paymentRequestResponse = await response.json();
        const paymentRequestString = paymentRequestResponse.pr;
        const paymentRequest = paymentRequestString.replace(/"/g, "");
        console.log("# AuditorPaymentRequests", paymentRequest);
        await mintStore.activateMintUrl(this.mintUrl);
        await mintStore.activateUnit("sat");
        await walletStore.decodeRequest(paymentRequest);
        // close the mint info dialog
        this.$emit("close");
      } catch (err) {
        console.error("Error fetching auditor payment requests:", err);
      }
    },
    async loadMoreSwaps() {
      if (this.allLoaded || this.loadingMore || !this.mintInfo) return;

      this.loadingMore = true;
      try {
        await this.getMintSwaps(this.mintInfo.id, this.skip, this.limit);
      } finally {
        this.loadingMore = false;
      }
    },
    formatTime(milliseconds: number) {
      if (milliseconds === 0) return "N/A";
      const seconds = milliseconds / 1000;
      if (seconds < 10) {
        return `${milliseconds.toFixed(0)} ms`;
      } else {
        return `${seconds.toFixed(2)} s`;
      }
    },
  },
};
</script>

<style scoped>
.mint-info {
  text-align: start;
  margin-top: 20px;
}

.stat-card {
  /* The shared box surface, from the group tokens. */
  background-color: var(--app-group-fill);
  border: 1px solid var(--app-group-edge);
  color: var(--app-text);
  min-height: 100px;
  border-radius: var(--app-radius-lg);
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 15px;
  padding-right: 15px;
}

.text-subtitle1 {
  font-size: 14px;
  color: var(--app-text-muted);
  margin-bottom: 8px;
}

.text-h5 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.text-caption {
  font-size: 12px;
  color: var(--app-text-muted);
}

.row {
  display: flex;
  flex-direction: row;
}

.col-6 {
  flex: 0 0 50%;
  max-width: 50%;
}

.q-mb-md {
  margin-bottom: 16px;
}

.q-ml-md {
  margin-inline-start: 16px;
}

.q-pa-md {
  padding: 16px;
}

.q-py-md {
  padding-top: 16px;
  padding-bottom: 16px;
}

.q-py-none {
  padding-top: 0;
  padding-bottom: 0;
}

.q-px-md {
  padding-left: 16px;
  padding-right: 16px;
}
</style>
