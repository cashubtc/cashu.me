<template>
  <div
    class="fullscreen bg-dark text-white text-center q-pa-md flex flex-center"
  >
    <div style="max-width: 360px; width: 100%">
      <!-- Error: no opener -->
      <div v-if="noOpener">
        <div class="text-h5 q-mb-md">Invalid Access</div>
        <div class="text-grey">
          This page must be opened from a payment request.
        </div>
      </div>

      <!-- Payment UI -->
      <div v-else>
        <div class="text-h5 q-mb-md">Payment Request</div>

        <!-- Caller info -->
        <q-card flat bordered class="bg-grey-10 q-pa-sm q-mb-md">
          <div class="text-caption text-grey-5">Requested by</div>
          <div class="text-body2 text-weight-medium">{{ callerHostname }}</div>
          <div class="text-caption text-grey-6 ellipsis">{{ callerUrl }}</div>
        </q-card>

        <q-card flat bordered class="bg-grey-9 q-pa-md q-mb-md">
          <div class="text-h4 q-mb-sm">{{ amount }} {{ unit }}</div>
          <div v-if="description" class="text-body2 q-mb-sm">
            {{ description }}
          </div>
          <div v-if="memo" class="text-grey text-caption q-mb-sm">
            {{ memo }}
          </div>
          <div class="text-caption text-grey">
            Balance: {{ balance }} {{ unit }}
          </div>
        </q-card>

        <!-- Error display -->
        <div v-if="error" class="text-negative q-mb-md text-caption">
          {{ error }}
        </div>

        <!-- Insufficient balance warning -->
        <div
          v-if="!error && balance < amount && !loading"
          class="text-warning q-mb-md text-caption"
        >
          Insufficient balance
        </div>

        <!-- Actions -->
        <div class="q-gutter-sm">
          <q-btn
            rounded
            unelevated
            color="primary"
            label="Pay"
            :loading="loading"
            :disable="balance < amount || loading"
            class="full-width q-mb-sm"
            @click="confirmPayment"
          />
          <q-btn
            rounded
            flat
            color="grey"
            label="Cancel"
            class="full-width"
            :disable="loading"
            @click="cancelPayment"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useWalletStore } from "src/stores/wallet";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useProofsStore } from "src/stores/proofs";
import { useTokensStore } from "src/stores/tokens";

export default defineComponent({
  name: "EmbedPayPage",
  data() {
    return {
      amount: 0,
      unit: "sat",
      mint: "",
      memo: "",
      description: "",
      nonce: "",
      callerHostname: "",
      callerUrl: "",
      balance: 0,
      loading: false,
      error: "",
      noOpener: false,
    };
  },
  computed: {
    ...mapWritableState(useMintsStore, ["activeMintUrl", "activeUnit"]),
    ...mapState(useMintsStore, ["mints", "activeProofs"]),
  },
  async mounted() {
    if (!window.opener) {
      this.noOpener = true;
      return;
    }

    const params = new URLSearchParams(window.location.search);
    this.amount = Number(params.get("amount")) || 0;
    this.unit = params.get("unit") || "sat";
    this.mint = params.get("mint") || this.activeMintUrl;
    this.memo = params.get("memo") || "";
    this.description = params.get("description") || "";
    this.nonce = params.get("nonce") || "";

    // Caller identification for scam prevention
    const rawOrigin = params.get("origin") || "";
    const rawUrl = params.get("url") || "";
    try {
      this.callerHostname = new URL(rawOrigin).hostname;
    } catch {
      this.callerHostname = rawOrigin || "Unknown";
    }
    this.callerUrl = rawUrl || rawOrigin || "Unknown";

    if (this.amount <= 0) {
      this.error = "Invalid amount";
      return;
    }

    // Activate the requested mint and unit
    if (this.mint && this.mint !== this.activeMintUrl) {
      this.activeMintUrl = this.mint;
    }
    if (this.unit !== this.activeUnit) {
      this.activeUnit = this.unit;
    }

    // Wait for proofs to update
    await this.updateActiveProofs();

    // Get balance for the active mint/unit
    const activeMint = this.mints.find((m) => m.url === this.activeMintUrl);
    if (activeMint) {
      this.balance = new MintClass(activeMint).unitBalance(this.unit);
    } else {
      this.error = "No wallet configured for this mint";
    }
  },
  methods: {
    ...mapActions(useProofsStore, ["updateActiveProofs", "serializeProofs"]),
    ...mapActions(useWalletStore, ["mintWallet", "send"]),
    ...mapActions(useTokensStore, ["addPaidToken"]),
    // The opener is an arbitrary page, so we cannot pin a target origin here
    // and must post with "*". The token returned on success is spendable
    // ecash, so the SDK-side nonce/origin checks are the only correlation
    // guarantee: if the opener navigated away, the token could reach an
    // unintended page. Keep the popup lifetime short and rely on those checks.
    sendResult(payload: object) {
      if (window.opener) {
        window.opener.postMessage(payload, "*");
      }
    },
    async confirmPayment() {
      this.loading = true;
      this.error = "";

      try {
        const wallet = await this.mintWallet(this.mint, this.unit);
        const proofs = this.activeProofs;
        const { sendProofs } = await this.send(
          proofs,
          wallet,
          this.amount,
          true
        );
        const token = this.serializeProofs(sendProofs);

        // Record in transaction history
        const label = this.description
          ? `${this.callerHostname}: ${this.description}`
          : `Payment to ${this.callerHostname}`;
        this.addPaidToken({
          amount: -this.amount,
          token,
          mint: this.mint,
          unit: this.unit,
          label,
        });

        this.sendResult({
          type: "cashu:payment-result",
          nonce: this.nonce,
          status: "success",
          token: token,
        });

        window.close();
      } catch (e: any) {
        this.loading = false;
        this.error = e.message || "Payment failed";
      }
    },
    cancelPayment() {
      this.sendResult({
        type: "cashu:payment-result",
        nonce: this.nonce,
        status: "error",
        error: "User cancelled",
      });
      window.close();
    },
  },
});
</script>
