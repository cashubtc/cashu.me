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
          <div class="text-h4 q-mb-sm">
            {{ amount }} {{ unit }}
          </div>
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

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useWalletStore } from "src/stores/wallet";
import { useMintsStore } from "src/stores/mints";
import { useProofsStore } from "src/stores/proofs";
import { useTokensStore } from "src/stores/tokens";

const walletStore = useWalletStore();
const mintsStore = useMintsStore();
const proofsStore = useProofsStore();
const tokensStore = useTokensStore();

const amount = ref(0);
const unit = ref("sat");
const mint = ref("");
const memo = ref("");
const description = ref("");
const nonce = ref("");
const callerHostname = ref("");
const callerUrl = ref("");
const balance = ref(0);
const loading = ref(false);
const error = ref("");
const noOpener = ref(false);

function sendResult(payload: object) {
  if (window.opener) {
    window.opener.postMessage(payload, "*");
  }
}

onMounted(async () => {
  if (!window.opener) {
    noOpener.value = true;
    return;
  }

  const params = new URLSearchParams(window.location.search);
  amount.value = Number(params.get("amount")) || 0;
  unit.value = params.get("unit") || "sat";
  mint.value = params.get("mint") || mintsStore.activeMintUrl;
  memo.value = params.get("memo") || "";
  description.value = params.get("description") || "";
  nonce.value = params.get("nonce") || "";

  // Caller identification for scam prevention
  const rawOrigin = params.get("origin") || "";
  const rawUrl = params.get("url") || "";
  try {
    callerHostname.value = new URL(rawOrigin).hostname;
  } catch {
    callerHostname.value = rawOrigin || "Unknown";
  }
  callerUrl.value = rawUrl || rawOrigin || "Unknown";

  if (amount.value <= 0) {
    error.value = "Invalid amount";
    return;
  }

  // Activate the requested mint and unit
  if (mint.value && mint.value !== mintsStore.activeMintUrl) {
    mintsStore.activeMintUrl = mint.value;
  }
  if (unit.value !== mintsStore.activeUnit) {
    mintsStore.activeUnit = unit.value;
  }

  // Wait for proofs to update
  await proofsStore.updateActiveProofs();

  // Get balance for the active mint/unit
  const activeMint = mintsStore.mints.find(
    (m) => m.url === mintsStore.activeMintUrl
  );
  if (activeMint) {
    const mintClass = new (await import("src/stores/mints")).MintClass(
      activeMint
    );
    balance.value = mintClass.unitBalance(unit.value);
  } else {
    error.value = "No wallet configured for this mint";
  }
});

async function confirmPayment() {
  loading.value = true;
  error.value = "";

  try {
    const wallet = await walletStore.mintWallet(mint.value, unit.value);
    const proofs = mintsStore.activeProofs;
    const { sendProofs } = await walletStore.send(
      proofs,
      wallet,
      amount.value,
      true
    );
    const token = proofsStore.serializeProofs(sendProofs);

    // Record in transaction history
    const label = description.value
      ? `${callerHostname.value}: ${description.value}`
      : `Payment to ${callerHostname.value}`;
    tokensStore.addPaidToken({
      amount: -amount.value,
      token,
      mint: mint.value,
      unit: unit.value,
      label,
    });

    sendResult({
      type: "cashu:payment-result",
      nonce: nonce.value,
      status: "success",
      token: token,
    });

    window.close();
  } catch (e: any) {
    loading.value = false;
    error.value = e.message || "Payment failed";
  }
}

function cancelPayment() {
  sendResult({
    type: "cashu:payment-result",
    nonce: nonce.value,
    status: "error",
    error: "User cancelled",
  });
  window.close();
}
</script>
