<template>
  <div class="q-mt-lg q-mb-lg">
    <div class="text-caption q-mx-sm" v-if="loading">
      <q-spinner color="grey" size="20px" class="q-mr-sm" />
      Loading audit info...
    </div>
    <div v-else-if="mintNotAudited" class="q-mx-sm">
      <q-icon
        name="info_outline"
        color="grey"
        size="20px"
        class="q-mr-sm"
        style="padding-bottom: 2px; margin-bottom: 2px"
      />
      <span class="text-bold">This mint has not been audited yet.</span>
      <br />
      <span class="text-caption">
        To learn more about the auditor or support a future audit, visit
        <a :href="auditUrl">audit.8333.space</a> or click
        <span
          class="text-bold cursor-pointer text-primary"
          @click="getAuditorPaymentRequestsAndHandle"
        >
          here
        </span>
        to donate ecash and help initiate an audit of this mint.
      </span>
    </div>
    <div v-else-if="error" class="q-mx-sm text-bold">Error: {{ error }}</div>
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
              <div class="text-subtitle1">Success Rate</div>
              <div class="text-h5">{{ successRate }}%</div>
              <div class="text-caption">
                {{ successfulSwaps }} of {{ mintSwaps.length }} swaps
              </div>
            </div>
          </div>
          <!-- Average Time Card -->
          <div class="col-6 stat-card q-ml-md">
            <div class="q-pa-md">
              <div class="text-subtitle1">Average Time</div>
              <div class="text-h5">{{ formatTime(averageTime) }}</div>
              <div class="text-caption">For successful swaps</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bar Chart -->
      <div v-if="mintSwaps.length > 0" class="q-py-md">
        <MintAuditSwapsBarChart :swaps="mintSwaps" />
      </div>

      <!-- Disclaimer -->
      <div class="q-mt-md text-grey-6 text-caption">
        Audit data is provided by independent third parties to help assess a
        mint’s reliability over time. However, these results are informational
        only and do not guarantee the safety, solvency, or trustworthiness of
        any mint. Always conduct your own research and ensure you trust the mint
        operator before using their services.
      </div>
      <!-- Donate ecash to the auditor -->
      <div class="q-mt-md text-grey-6 text-caption">
        Audit information is made available by
        <a :href="auditUrl">{{ auditUrlShort }}</a
        >. The current balance held by the auditor for this mint is
        <span class="text-bold">{{ mintInfo.balance }} sats</span>, with a total
        of
        <span class="text-bold">{{ mintInfo.sum_donations }} sats</span>
        donated so far. To support continued auditing, you can
        <span
          class="text-bold cursor-pointer text-primary"
          @click="getAuditorPaymentRequestsAndHandle"
        >
          press here
        </span>
        to donate ecash to the auditor.
      </div>
    </div>
  </div>
</template>

<script lang="ts">
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
import MintAuditSwapsBarChart from "./MintAuditSwapsBarChart.vue";
import { useWalletStore } from "../stores/wallet";
import { useMintsStore } from "../stores/mints";
import { useSettingsStore } from "../stores/settings";
import { getShortUrl } from "../js/wallet-helpers";

export default {
  name: "MintAuditInfo",
  components: {
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
      this.error = err.message || "Failed to load mint data";
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
  text-align: left;
  margin-top: 20px;
}

.stat-card {
  background-color: #1e1e1e;
  color: white;
  min-height: 100px;
  border-radius: 8px;
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 15px;
  padding-right: 15px;
}

.text-subtitle1 {
  font-size: 14px;
  color: #9e9e9e;
  margin-bottom: 8px;
}

.text-h5 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.text-caption {
  font-size: 12px;
  color: #9e9e9e;
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
  margin-left: 16px;
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
