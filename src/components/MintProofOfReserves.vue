<template>
  <div class="proof-of-reserves q-mt-lg q-mb-lg" :class="containerTextClass">
    <!-- Loading -->
    <div class="text-caption q-mx-sm" v-if="loading">
      <q-spinner color="grey" size="20px" class="q-mr-sm" />
      Loading reserve attestation...
    </div>

    <!-- Empty / not published -->
    <div v-else-if="empty" class="q-mx-sm">
      <q-icon
        name="info_outline"
        color="grey"
        size="20px"
        class="q-mr-sm"
        style="padding-bottom: 2px; margin-bottom: 2px"
      />
      <span class="text-bold">No reserve attestation published yet.</span>
      <br />
      <span class="text-caption text-grey-6">
        This mint has not published a proof-of-reserves bundle. The attested
        reserve is a lower bound on assets; absence of a bundle is not evidence
        of insolvency.
      </span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="q-mx-sm">
      <q-icon
        name="warning"
        color="negative"
        size="20px"
        class="q-mr-sm"
        style="padding-bottom: 2px; margin-bottom: 2px"
      />
      <span class="text-bold">Could not load reserve attestation.</span>
      <br />
      <span class="text-caption text-grey-6">{{ error }}</span>
    </div>

    <!-- Bundle present -->
    <div v-else-if="bundle" class="por-card">
      <!-- Headline reserve total -->
      <div class="por-headline q-mb-md">
        <div class="por-headline-label">Attested reserve</div>
        <div class="por-headline-value">{{ totalDisplay }}</div>
        <div class="por-headline-sub">lower bound on assets</div>
      </div>

      <!-- Expired banner -->
      <div v-if="isExpired" class="por-expired q-mb-md">
        <q-icon name="error_outline" size="18px" class="q-mr-xs" />
        <span class="text-bold">EXPIRED</span>
        <span class="q-ml-xs">
          attestation is {{ blocksAgoDisplay }} old (older than
          {{ expiryBlocks }} blocks)
        </span>
      </div>

      <!-- As-of block height + freshness -->
      <div class="detail-item q-mb-md">
        <div class="detail-label">
          <BoxIcon :size="20" :color="iconColor" class="detail-icon" />
          <div class="detail-name">As of block</div>
        </div>
        <div class="detail-value">
          {{ formatNumber(bundle.as_of_block.height) }}
        </div>
      </div>

      <div class="detail-item q-mb-md">
        <div class="detail-label">
          <ClockIcon :size="20" :color="iconColor" class="detail-icon" />
          <div class="detail-name">Freshness</div>
        </div>
        <div
          class="detail-value"
          :class="isExpired ? 'text-negative' : 'text-positive'"
        >
          {{ freshnessDisplay }}
        </div>
      </div>

      <!-- Number of reserve VTXOs -->
      <div class="detail-item q-mb-md">
        <div class="detail-label">
          <LayersIcon :size="20" :color="iconColor" class="detail-icon" />
          <div class="detail-name">Reserve VTXOs</div>
        </div>
        <div class="detail-value">{{ formatNumber(reserveCount) }}</div>
      </div>

      <!-- Attestation time -->
      <div v-if="timeDisplay" class="detail-item q-mb-md">
        <div class="detail-label">
          <CalendarIcon :size="20" :color="iconColor" class="detail-icon" />
          <div class="detail-name">Published</div>
        </div>
        <div class="detail-value">{{ timeDisplay }}</div>
      </div>

      <!-- Mint identity pubkey -->
      <div v-if="bundle.mint_identity_pubkey" class="detail-item q-mb-md">
        <div class="detail-label">
          <KeyIcon :size="20" :color="iconColor" class="detail-icon" />
          <div class="detail-name">Mint identity key</div>
        </div>
        <div
          class="detail-value"
          @click="copyValue(bundle.mint_identity_pubkey)"
          style="cursor: pointer"
        >
          {{ shortHex(bundle.mint_identity_pubkey) }}
        </div>
      </div>

      <!-- Actions -->
      <div class="por-actions q-mt-md">
        <q-btn
          outline
          no-caps
          color="primary"
          icon="download"
          label="Download bundle"
          class="full-width q-mb-sm"
          @click="downloadBundle"
        />

        <q-expansion-item
          dense
          dense-toggle
          icon="verified_user"
          label="Verify independently"
          class="por-verify"
        >
          <div class="por-verify-body text-caption text-grey-6">
            <p class="q-mb-sm">
              Do not trust this card. Verification is a
              <span class="text-bold">wallet-controlled</span> action: download
              the bundle and check it yourself with the open-source
              <span class="text-bold">bark-audit</span> verifier. This wallet
              never asks the mint to verify its own reserves.
            </p>
            <p class="q-mb-xs text-bold">1. Download the bundle (button above).</p>
            <p class="q-mb-xs text-bold">2. Run the verifier:</p>
            <pre class="por-code">{{ verifyCommand }}</pre>
            <p class="q-mb-sm">
              It checks the signature against the mint identity key, confirms
              every reserve VTXO anchors to a confirmed on-chain output, and
              re-sums the total. The total is a
              <span class="text-bold">lower bound on assets</span> attested as of
              block {{ bundle.as_of_block.height }}.
            </p>
            <p class="q-mb-none">
              Get the verifier:
              <a :href="verifierRepoUrl" target="_blank" rel="noopener">
                {{ verifierRepoUrl }}
                <q-icon name="open_in_new" size="xs" class="q-ml-xs" />
              </a>
            </p>
          </div>
        </q-expansion-item>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { copyToClipboard } from "quasar";
import {
  Box as BoxIcon,
  Clock as ClockIcon,
  Layers as LayersIcon,
  Calendar as CalendarIcon,
  Key as KeyIcon,
} from "lucide-vue-next";

declare const windowMixin: any;

interface ReserveEntry {
  vtxo_id: string;
  amount_sat: number;
  anchor: {
    txid: string;
    vout: number;
    block_height: number;
  };
}

interface AttestationBundle {
  format: string;
  mint_id: string;
  mint_identity_pubkey: string;
  ark_server_pubkey: string;
  as_of_block: {
    height: number;
    hash: string;
  };
  reserve: ReserveEntry[];
  total_reserve_sat: number;
  time: number | string;
  signature: string;
}

export default defineComponent({
  name: "MintProofOfReserves",
  mixins: [windowMixin],
  components: {
    BoxIcon,
    ClockIcon,
    LayersIcon,
    CalendarIcon,
    KeyIcon,
  },
  props: {
    bundleUrl: {
      type: String,
      default: "",
    },
    // Treat an attestation older than this many blocks as expired.
    expiryBlocks: {
      type: Number,
      default: 1000,
    },
  },
  data() {
    return {
      loading: true,
      empty: false,
      error: null as string | null,
      bundle: null as AttestationBundle | null,
      currentHeight: null as number | null,
      verifierRepoUrl: "https://github.com/second-tech/bark-audit",
    };
  },
  computed: {
    iconColor(): string {
      return this.$q.dark.isActive ? "#9E9E9E" : "#616161";
    },
    containerTextClass(): string {
      return this.$q.dark.isActive ? "text-white" : "text-dark";
    },
    reserveCount(): number {
      return Array.isArray(this.bundle?.reserve)
        ? this.bundle!.reserve.length
        : 0;
    },
    totalDisplay(): string {
      const total = this.bundle?.total_reserve_sat ?? 0;
      return `${this.formatNumber(total)} sat`;
    },
    // Reference height: chain tip if known, else highest anchor height.
    referenceHeight(): number | null {
      if (typeof this.currentHeight === "number") return this.currentHeight;
      const anchors = (this.bundle?.reserve ?? [])
        .map((r) => r.anchor?.block_height)
        .filter((h): h is number => typeof h === "number");
      if (anchors.length === 0) return null;
      return Math.max(...anchors, this.bundle?.as_of_block?.height ?? 0);
    },
    blocksAgo(): number | null {
      const ref = this.referenceHeight;
      const asOf = this.bundle?.as_of_block?.height;
      if (typeof ref !== "number" || typeof asOf !== "number") return null;
      return Math.max(0, ref - asOf);
    },
    blocksAgoDisplay(): string {
      const n = this.blocksAgo;
      if (n === null) return "unknown";
      return `${this.formatNumber(n)} block${n === 1 ? "" : "s"}`;
    },
    isExpired(): boolean {
      const n = this.blocksAgo;
      if (n === null) return false;
      return n > this.expiryBlocks;
    },
    freshnessDisplay(): string {
      const n = this.blocksAgo;
      if (n === null) return "freshness unknown";
      if (this.isExpired) return `EXPIRED — ${this.blocksAgoDisplay} ago`;
      return `${this.blocksAgoDisplay} ago`;
    },
    timeDisplay(): string {
      const raw = this.bundle?.time;
      if (raw === undefined || raw === null) return "";
      let ms: number | null = null;
      if (typeof raw === "number") {
        ms = raw > 1e12 ? raw : raw * 1000;
      } else if (typeof raw === "string") {
        const numeric = Number(raw);
        if (!Number.isNaN(numeric) && numeric > 0) {
          ms = numeric > 1e12 ? numeric : numeric * 1000;
        } else {
          const parsed = Date.parse(raw);
          if (!Number.isNaN(parsed)) ms = parsed;
        }
      }
      if (ms === null) return "";
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(ms));
    },
    verifyCommand(): string {
      return "bark-audit verify ./latest.json";
    },
  },
  async mounted() {
    await this.loadBundle();
  },
  methods: {
    formatNumber(value: number): string {
      if (typeof value !== "number" || !Number.isFinite(value)) return "0";
      return new Intl.NumberFormat().format(value);
    },
    shortHex(hex: string): string {
      if (!hex || hex.length <= 16) return hex || "";
      return `${hex.slice(0, 8)}…${hex.slice(-8)}`;
    },
    async copyValue(value: string) {
      if (!value) return;
      try {
        await copyToClipboard(value);
        this.$q.notify({
          message: "Copied",
          color: "positive",
          position: "top",
          timeout: 1000,
        });
      } catch (e) {
        console.error("Failed to copy", e);
      }
    },
    async loadBundle() {
      this.loading = true;
      this.empty = false;
      this.error = null;
      try {
        const response = await fetch(this.bundleUrl, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (response.status === 404) {
          this.empty = true;
          return;
        }
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as AttestationBundle | null;
        if (
          !data ||
          typeof data.total_reserve_sat !== "number" ||
          !data.as_of_block
        ) {
          this.empty = true;
          return;
        }
        this.bundle = data;
        // Best-effort: also fetch the current chain tip for freshness.
        await this.loadChainTip();
      } catch (err: any) {
        console.error("Error fetching reserve attestation:", err);
        this.error = err?.message || "Network error";
      } finally {
        this.loading = false;
      }
    },
    async loadChainTip() {
      // Mutinynet signet tip; best-effort and never blocks rendering.
      try {
        const res = await fetch(
          "https://mutinynet.com/api/blocks/tip/height",
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const txt = await res.text();
        const height = Number(txt.trim());
        if (Number.isFinite(height) && height > 0) {
          this.currentHeight = height;
        }
      } catch (e) {
        // Ignore: fall back to anchor-derived reference height.
      }
    },
    downloadBundle() {
      if (!this.bundle) return;
      try {
        const json = JSON.stringify(this.bundle, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const height = this.bundle.as_of_block?.height ?? "latest";
        a.href = url;
        a.download = `reserve-attestation-${height}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error("Failed to download bundle", e);
        this.$q.notify({
          message: "Could not download bundle",
          color: "negative",
          position: "top",
        });
      }
    },
  },
});
</script>

<style scoped>
.proof-of-reserves {
  width: 100%;
}

.por-card {
  text-align: left;
}

.por-headline {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(127, 127, 127, 0.08);
}

.por-headline-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--q-color-grey-6);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.por-headline-value {
  font-size: 28px;
  font-weight: 700;
  margin: 4px 0;
}

.por-headline-sub {
  font-size: 12px;
  color: var(--q-color-grey-6);
}

.por-expired {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 6px;
  background-color: rgba(255, 69, 58, 0.12);
  color: #ff453a;
  font-size: 13px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.detail-label {
  display: flex;
  align-items: center;
}

.detail-icon {
  margin-right: 10px;
}

.detail-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--q-color-grey-6);
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: inherit;
  text-align: right;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.por-actions {
  width: 100%;
}

.por-verify-body {
  padding: 8px 4px 4px;
  line-height: 1.5;
}

.por-code {
  background-color: rgba(127, 127, 127, 0.12);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 4px 0 8px;
}
</style>
