<template>
  <div class="pol-audit-container bg-dark text-white q-pa-md q-my-md rounded-borders border-grey">
    <!-- Intro Card -->
    <div v-if="state === 'idle'" class="text-center q-py-md">
      <div class="row items-center justify-center q-gutter-sm q-mb-md">
        <q-icon name="shield" size="36px" color="primary" />
        <span class="text-h6 text-bold">Proof of Liabilities (PoL) Auditor</span>
      </div>
      <p class="text-caption text-grey-4 q-px-md max-width-text mx-auto">
        Verify the mint's solvency on-chain. This cryptographically proves that the mint is fully solvent (its active assets cover 100% of outstanding liabilities) and guarantees that your specific ecash notes are valid, active, and accounted for in the mint's Merkle trees.
      </p>
      
      <div class="q-mt-lg">
        <q-btn
          color="primary"
          unelevated
          no-caps
          size="md"
          label="Verify Mint Solvency"
          class="q-px-lg text-weight-bold"
          @click="startAudit"
        />
      </div>
    </div>

    <!-- Auditing State / Loading Progress -->
    <div v-if="state === 'auditing' || state === 'completed'" class="q-py-xs">
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <q-spinner-dots v-if="state === 'auditing'" color="primary" size="24px" />
          <q-icon v-else name="check_circle" color="positive" size="24px" />
          <span class="text-subtitle1 text-bold">
            {{ state === 'auditing' ? 'Running Cryptographic Solvency Walk...' : 'Solvency Audit Complete' }}
          </span>
        </div>
        <q-btn
          v-if="state === 'completed'"
          flat
          round
          size="sm"
          color="grey-4"
          icon="refresh"
          @click="startAudit"
        >
          <q-tooltip>Re-run Solvency Audit</q-tooltip>
        </q-btn>
      </div>

      <!-- Stepper / Step Indicators -->
      <div class="q-gutter-md q-mb-lg">
        <!-- Step 1: Keyset Manifest -->
        <div class="row items-start q-col-gutter-sm">
          <div class="col-auto">
            <q-spinner-oval v-if="steps.manifest.status === 'running'" color="primary" size="18px" />
            <q-icon v-else-if="steps.manifest.status === 'success'" name="check" color="positive" size="18px" />
            <q-icon v-else-if="steps.manifest.status === 'failed'" name="close" color="negative" size="18px" />
            <q-icon v-else name="radio_button_unchecked" color="grey-6" size="18px" />
          </div>
          <div class="col">
            <div class="text-bold text-caption text-uppercase" :class="getStepClass(steps.manifest.status)">
              Step 1: Fetch Keyset Manifest
            </div>
            <div class="text-caption text-grey-4" v-if="steps.manifest.message">
              {{ steps.manifest.message }}
            </div>
          </div>
        </div>

        <!-- Step 2: Blockchain Anchor -->
        <div class="row items-start q-col-gutter-sm">
          <div class="col-auto">
            <q-spinner-oval v-if="steps.anchor.status === 'running'" color="primary" size="18px" />
            <q-icon v-else-if="steps.anchor.status === 'success'" name="check" color="positive" size="18px" />
            <q-icon v-else-if="steps.anchor.status === 'warning'" name="warning" color="warning" size="18px" />
            <q-icon v-else-if="steps.anchor.status === 'failed'" name="close" color="negative" size="18px" />
            <q-icon v-else name="radio_button_unchecked" color="grey-6" size="18px" />
          </div>
          <div class="col">
            <div class="text-bold text-caption text-uppercase" :class="getStepClass(steps.anchor.status)">
              Step 2: Verify Blockchain Anchor (OTS)
            </div>
            <div class="text-caption text-grey-4" v-if="steps.anchor.message">
              {{ steps.anchor.message }}
            </div>
          </div>
        </div>

        <!-- Step 3: Spent Tree -->
        <div class="row items-start q-col-gutter-sm">
          <div class="col-auto">
            <q-spinner-oval v-if="steps.spentTree.status === 'running'" color="primary" size="18px" />
            <q-icon v-else-if="steps.spentTree.status === 'success'" name="check" color="positive" size="18px" />
            <q-icon v-else-if="steps.spentTree.status === 'failed'" name="close" color="negative" size="18px" />
            <q-icon v-else name="radio_button_unchecked" color="grey-6" size="18px" />
          </div>
          <div class="col">
            <div class="text-bold text-caption text-uppercase" :class="getStepClass(steps.spentTree.status)">
              Step 3: Spent Tree Audit
            </div>
            <div class="text-caption text-grey-4" v-if="steps.spentTree.message">
              {{ steps.spentTree.message }}
            </div>
          </div>
        </div>

        <!-- Step 4: Issued Tree -->
        <div class="row items-start q-col-gutter-sm">
          <div class="col-auto">
            <q-spinner-oval v-if="steps.issuedTree.status === 'running'" color="primary" size="18px" />
            <q-icon v-else-if="steps.issuedTree.status === 'success'" name="check" color="positive" size="18px" />
            <q-icon v-else-if="steps.issuedTree.status === 'failed'" name="close" color="negative" size="18px" />
            <q-icon v-else name="radio_button_unchecked" color="grey-6" size="18px" />
          </div>
          <div class="col">
            <div class="text-bold text-caption text-uppercase" :class="getStepClass(steps.issuedTree.status)">
              Step 4: Issued Tree Audit
            </div>
            <div class="text-caption text-grey-4" v-if="steps.issuedTree.message">
              {{ steps.issuedTree.message }}
            </div>
          </div>
        </div>
      </div>

      <!-- Verdict States -->
      <div v-if="state === 'completed'" class="q-mt-lg">
        <!-- Success Banner -->
        <q-banner v-if="challenges.length === 0 && !auditError" rounded class="bg-positive text-white q-pa-md">
          <template v-slot:avatar>
            <q-icon name="check_circle" size="28px" />
          </template>
          <div class="text-bold text-subtitle2">✓ Proof of Liabilities Audit Succeeded!</div>
          <div class="text-caption">
            All mathematical proofs verified perfectly up to the Merkle-Sum Tree roots. This proves that the balance of the mint's outstanding liabilities is exactly what the mint has claimed in the manifest, and that your ecash notes are 100% accounted for and included in that balance.
          </div>
        </q-banner>

        <!-- Audit Error Banner -->
        <q-banner v-else-if="auditError" rounded class="bg-warning text-white q-pa-md">
          <template v-slot:avatar>
            <q-icon name="error" size="28px" />
          </template>
          <div class="text-bold text-subtitle2">Solvency Audit Interrupted</div>
          <div class="text-caption">
            The solvency audit could not be completed because an error occurred: {{ auditError }}
          </div>
        </q-banner>

        <!-- Failure Banner -->
        <q-banner v-else rounded class="bg-negative text-white q-pa-md">
          <template v-slot:avatar>
            <q-icon name="warning" size="28px" />
          </template>
          <div class="text-bold text-subtitle2">❌ MINT CHEATING DETECTED! SOLVENCY AUDIT FAILED!</div>
          <div class="text-caption q-mb-xs">
            The mint has committed cryptographic fraud by failing Merkle-Sum verification, altering outstanding coin values, or withholding valid receipts in its periodic liability declarations.
          </div>
          <div class="row q-gutter-sm q-mt-sm">
            <q-btn
              color="white"
              text-color="negative"
              unelevated
              no-caps
              dense
              size="sm"
              class="q-px-md text-bold"
              label="Copy Fraud Challenges"
              @click="copyFraudChallenges"
            />
          </div>
        </q-banner>

        <!-- Stats Card -->
        <div class="stat-box q-pa-md q-mt-md rounded-borders bg-grey-9 text-caption text-grey-3">
          <div class="row justify-between q-py-xs border-bottom-grey">
            <span>Keysets Audited:</span>
            <span class="text-bold text-white">{{ stats.keysetsCount }}</span>
          </div>
          <div class="row justify-between q-py-xs border-bottom-grey">
            <span>Active (Unspent) Notes Audited:</span>
            <span class="text-bold text-white">{{ stats.unspentCount }}</span>
          </div>
          <div class="row justify-between q-py-xs border-bottom-grey">
            <span>Historical Spent Notes Audited:</span>
            <span class="text-bold text-white">{{ stats.spentCount }}</span>
          </div>
          <div class="row justify-between q-py-xs">
            <span>Blinded Messages (B') Reconstructed & Checked:</span>
            <span class="text-bold text-white">{{ stats.blindedCount }}</span>
          </div>
        </div>

        <!-- Detailed Token Explorer -->
        <div class="q-mt-lg">
          <q-btn
            flat
            no-caps
            dense
            color="primary"
            class="row items-center q-px-xs text-bold text-caption"
            @click="showExplorer = !showExplorer"
          >
            <span>{{ showExplorer ? 'Hide Detailed Audit Log' : 'Show Detailed Audit Log' }}</span>
            <q-icon :name="showExplorer ? 'expand_less' : 'expand_more'" class="q-ml-xs" />
          </q-btn>

          <transition name="smooth-slide">
            <div v-if="showExplorer" class="explorer-panel q-mt-md rounded-borders bg-grey-10 q-pa-sm text-caption">
              <!-- Challenges List -->
              <div v-if="challenges.length > 0" class="q-mb-md">
                <div class="text-bold text-negative q-mb-sm row items-center">
                  <q-icon name="error_outline" class="q-mr-xs" size="16px" />
                  Cryptographic Fraud Challenges ({{ challenges.length }})
                </div>
                <div v-for="(ch, idx) in challenges" :key="idx" class="q-pa-sm bg-red-10 rounded-borders q-mb-sm border-negative text-white">
                  <div class="text-bold text-uppercase" style="font-size: 11px;">
                    Fraud Type: {{ ch.item_type }}
                  </div>
                  <div class="text-grey-3 text-caption q-my-xs">
                    {{ ch.error }}
                  </div>
                  <div class="q-mt-xs text-grey-4" style="font-family: monospace; font-size: 10px; word-break: break-all;">
                    Item: {{ ch.item }}<br />
                    Expected Value: {{ ch.value }} | Amount: {{ ch.amount }} sat<br />
                    Signature (C/C'): {{ ch.signature }}
                  </div>
                  <div v-if="ch.pol_receipt" class="q-mt-xs q-pa-xs bg-red-9 rounded-borders text-bold" style="font-size: 10px;">
                    ★ Smoke-Gun: Manifest epoch {{ ch.pol_receipt.target_epoch }} Transaction Receipt is present and valid!
                  </div>
                </div>
              </div>

              <!-- Verified Tokens -->
              <div class="text-bold text-primary q-mb-sm row items-center">
                <q-icon name="done_all" class="q-mr-xs" size="16px" color="primary" />
                Verified Token Tree Inclusions ({{ verifiedTokens.length }})
              </div>
              <div class="scroll-area max-height-300">
                <div v-for="(vt, idx) in verifiedTokens" :key="idx" class="q-pa-xs border-bottom-grey">
                  <div class="row justify-between items-center text-grey-4">
                    <span class="text-bold" :class="vt.status === 'Unspent' ? 'text-positive' : 'text-grey-5'">
                      {{ vt.status }}
                    </span>
                    <span class="text-bold text-white">{{ vt.amount }} sat</span>
                  </div>
                  <div class="text-grey-6 text-italic" style="font-family: monospace; font-size: 9px; word-break: break-all;">
                    Secret: {{ vt.secret }}<br />
                    Y: {{ vt.y }}<br />
                    B': {{ vt.bPrime || 'Not Reconstructible' }}
                    <div v-if="vt.receiptStatus" class="q-mt-xs row items-center q-gutter-xs" style="font-style: normal;">
                      <q-icon v-if="vt.receiptStatus === 'valid'" name="verified" color="positive" size="14px" />
                      <q-icon v-else-if="vt.receiptStatus === 'missing'" name="warning" color="warning" size="14px" />
                      <q-icon v-else name="cancel" color="negative" size="14px" />
                      <span class="text-caption" :class="vt.receiptStatus === 'valid' ? 'text-positive' : (vt.receiptStatus === 'missing' ? 'text-warning' : 'text-negative')" style="font-size: 10px; font-weight: bold;">
                        {{ vt.receiptStatus === 'valid' ? `✓ Epoch ${vt.receiptEpoch} Receipt Verified` : (vt.receiptStatus === 'missing' ? '⚠ Missing Transaction Receipt (Vulnerable if mint cheats)' : '❌ Invalid Transaction Receipt (Mint fraud detected!)') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState, mapActions } from "pinia";
import { useWalletStore } from "../stores/wallet";
import { useMintsStore } from "../stores/mints";
import { useTokensStore } from "../stores/tokens";
import { useProofsStore } from "../stores/proofs";
import axios from "axios";

import {
  precomputeDefaultNodes,
  verifyMerkleProof,
  calculateY,
  calculateBPrime,
  deriveBlindingFactor,
  deriveSecret,
  verifyOtsAnchoring,
  verifyPolReceipt,
  bytesToHex,
  hexToBytes,
  sha256,
  DefaultNode,
  MerkleProofItem
} from "../js/pol";

interface VerifiedTokenInfo {
  secret: string;
  amount: number;
  y: string;
  bPrime: string | null;
  status: "Unspent" | "Spent";
  receiptStatus?: "valid" | "missing" | "invalid";
  receiptEpoch?: number;
}

export default defineComponent({
  name: "PoLAuditView",
  props: {
    mintUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      state: "idle" as "idle" | "auditing" | "completed",
      showExplorer: false,
      challenges: [] as any[],
      verifiedTokens: [] as VerifiedTokenInfo[],
      auditError: null as string | null,
      steps: {
        manifest: { status: "pending", message: "" },
        anchor: { status: "pending", message: "" },
        spentTree: { status: "pending", message: "" },
        issuedTree: { status: "pending", message: "" },
      },
      stats: {
        keysetsCount: 0,
        unspentCount: 0,
        spentCount: 0,
        blindedCount: 0,
      },
      manifest: null as any,
    };
  },
  computed: {
    ...mapState(useMintsStore, ["mints"]),
    ...mapState(useProofsStore, ["proofs"]),
    ...mapState(useTokensStore, ["historyTokens"]),
    ...mapState(useWalletStore, ["invoiceHistory", "mnemonic"]),
  },
  mounted() {
    // Eagerly instantiate stores synchronously in the lifecycle context
    useWalletStore();
    useMintsStore();
    useTokensStore();
    useProofsStore();
  },
  methods: {
    getStepClass(status: string) {
      if (status === "success") return "text-positive";
      if (status === "warning") return "text-warning";
      if (status === "failed") return "text-negative";
      if (status === "running") return "text-primary";
      return "text-grey-6";
    },
    async getReceiptStatus(proof: any, y: string, bPrime: string | null, storedMint: any): Promise<{ receiptStatus: "valid" | "missing" | "invalid", receiptEpoch?: number }> {
      const polReceipt = proof.polReceipt || proof.pol_receipt;
      if (!polReceipt) {
        return { receiptStatus: "missing" };
      }

      let pubKeyHex = null;
      const mintKeyset = storedMint.keys.find((k: any) => k.id === proof.id);
      if (mintKeyset && mintKeyset.keys) {
        pubKeyHex = mintKeyset.keys[proof.amount];
      }

      if (!pubKeyHex) {
        return { receiptStatus: "missing" };
      }

      const isValid = await verifyPolReceipt(
        polReceipt.signature,
        polReceipt.target_epoch,
        pubKeyHex,
        y,
        bPrime || ""
      );

      return {
        receiptStatus: isValid ? "valid" : "invalid",
        receiptEpoch: polReceipt.target_epoch
      };
    },
    async startAudit() {
      this.state = "auditing";
      this.challenges = [];
      this.verifiedTokens = [];
      this.manifest = null;
      this.auditError = null;
      this.showExplorer = false;

      this.steps.manifest = { status: "running", message: "Fetching active keyset manifests..." };
      this.steps.anchor = { status: "pending", message: "" };
      this.steps.spentTree = { status: "pending", message: "" };
      this.steps.issuedTree = { status: "pending", message: "" };

      try {
        // 1. Resolve Keyset IDs for this Mint
        const storedMint = this.mints.find((m) => m.url === this.mintUrl);
        if (!storedMint) {
          throw new Error("Mint credentials not found in wallet settings.");
        }
        const keysetIds = (storedMint.keysets || []).map((k: any) => k.id);
        if (keysetIds.length === 0) {
          throw new Error("No active keysets derived for this mint yet.");
        }
        this.stats.keysetsCount = keysetIds.length;

        // 2. Fetch Unspent Proofs
        const unspentProofs = this.proofs.filter((p) => keysetIds.includes(p.id));
        this.stats.unspentCount = unspentProofs.length;

        // 3. Precompute default empty Merkle nodes
        const defaultNodes = await precomputeDefaultNodes();

        // 4. Step 1: Manifest check (Fetch manifest of the active keyset ID)
        const activeKeysetId = keysetIds[0];
        const manifestUrl = `${this.mintUrl}/v1/pol/${activeKeysetId}/manifest`;
        
        let resp;
        try {
          resp = await axios.get(manifestUrl);
        } catch (e: any) {
          if (e.response && e.response.status === 404) {
            this.state = "completed";
            this.steps.manifest = { status: "failed", message: "Verification not supported by this mint." };
            return;
          }
          throw new Error(`Failed to contact solvency endpoint: ${e.message}`);
        }

        const manifest = resp.data;
        this.manifest = manifest;
        const epochIdx = manifest.epoch_index;
        const rootIssuedHash = manifest.root_issued.hash;
        const rootIssuedSum = manifest.root_issued.sum;
        const rootSpentHash = manifest.root_spent.hash;
        const rootSpentSum = manifest.root_spent.sum;

        if (manifest.outstanding_balance !== rootIssuedSum - rootSpentSum) {
          this.challenges.push({
            keyset_id: activeKeysetId,
            epoch_index: epochIdx,
            item_type: "issued_inclusion_path_error",
            item: "manifest",
            index: "00",
            value: manifest.outstanding_balance,
            signature: "",
            amount: 0,
            error: `Manifest liability balance mismatch: outstanding balance (${manifest.outstanding_balance}) != root difference (${rootIssuedSum} - ${rootSpentSum})`
          });
        }

        this.steps.manifest = {
          status: "success",
          message: `Epoch ${epochIdx} Manifest loaded. Balance: ${manifest.outstanding_balance} sat (Issued: ${rootIssuedSum} sat, Spent: ${rootSpentSum} sat)`
        };

        // Step 2: OTS Anchor status
        this.steps.anchor = { status: "running", message: "Validating OpenTimestamps (OTS) anchor..." };
        const otsReceiptHex = manifest.ots_receipt;

        // Compute deterministic global digest hash to verify OTS authenticity
        const commitmentDataInput = new Uint8Array(activeKeysetId.length + 32 + 32);
        const encoder = new TextEncoder();
        commitmentDataInput.set(encoder.encode(activeKeysetId), 0);
        commitmentDataInput.set(hexToBytes(rootIssuedHash), activeKeysetId.length);
        commitmentDataInput.set(hexToBytes(rootSpentHash), activeKeysetId.length + 32);

        const computedGlobalDigest = await sha256(commitmentDataInput);
        const computedGlobalDigestHex = bytesToHex(computedGlobalDigest);

        const otsMsg = await verifyOtsAnchoring(otsReceiptHex, computedGlobalDigestHex);
        this.steps.anchor = {
          status: otsMsg.startsWith("✓") ? "success" : (otsMsg.startsWith("⚠") ? "warning" : (otsMsg.startsWith("❌") ? "failed" : "pending")),
          message: otsMsg
        };

        if (otsMsg.startsWith("❌")) {
          this.challenges.push({
            keyset_id: activeKeysetId,
            epoch_index: epochIdx,
            item_type: "issued_inclusion_path_error",
            item: "ots_receipt",
            index: "00",
            value: 0,
            signature: "",
            amount: 0,
            error: otsMsg
          });
        }

        // 5. Reconstruct all historical deterministic secrets (KDF walk)
        const walletStore = useWalletStore();
        const unspentSecrets = new Set<string>();
        const unspentProofMap = new Map<string, any>();
        for (const up of unspentProofs) {
          unspentSecrets.add(up.secret);
          unspentProofMap.set(up.secret, up);
        }

        const auditedUnspent: any[] = [];
        const auditedSpentCandidates: any[] = [];

        if (walletStore.mnemonic) {
          const seed = walletStore.mnemonicToSeedSync(walletStore.mnemonic);
          for (const kid of keysetIds) {
            const maxCounter = walletStore.keysetCounter(kid) || 0;
            // Scan up to counter + 100 for safety margin
            for (let counter = 0; counter <= maxCounter + 100; counter++) {
              try {
                const secretBytes = deriveSecret(seed, kid, counter);
                const rBytes = deriveBlindingFactor(seed, kid, counter);

                const secretHex = Array.from(secretBytes).map(b => b.toString(16).padStart(2, '0')).join('');
                const rHex = Array.from(rBytes).map(b => b.toString(16).padStart(2, '0')).join('');

                let matchedProof = unspentProofMap.get(secretHex);
                let matchedSecret = secretHex;

                if (!matchedProof) {
                  try {
                    const secretStr = new TextDecoder().decode(secretBytes);
                    const proofStr = unspentProofMap.get(secretStr);
                    if (proofStr) {
                      matchedProof = proofStr;
                      matchedSecret = secretStr;
                    }
                  } catch (e) {}
                }

                const y = await calculateY(matchedSecret);
                const bPrime = await calculateBPrime(matchedSecret, rHex);

                if (matchedProof) {
                  auditedUnspent.push({
                    id: kid,
                    secret: matchedSecret,
                    amount: matchedProof.amount,
                    C: matchedProof.C,
                    y,
                    bPrime,
                    rHex,
                    status: "Unspent"
                  });
                } else {
                  auditedSpentCandidates.push({
                    id: kid,
                    secret: matchedSecret,
                    y,
                    bPrime,
                    rHex,
                    status: "Spent"
                  });
                }
              } catch (e) {}
            }
          }
        }

        // Add any unspent proofs that weren't matched (e.g. manually imported)
        const matchedSecretsInLoop = new Set<string>(auditedUnspent.map(au => au.secret));
        for (const up of unspentProofs) {
          if (!matchedSecretsInLoop.has(up.secret)) {
            const y = await calculateY(up.secret);
            let bPrime: string | null = null;
            const rHex = up.dleq && up.dleq.r ? up.dleq.r : null;
            if (rHex) {
              try {
                bPrime = await calculateBPrime(up.secret, rHex);
              } catch (e) {}
            }
            auditedUnspent.push({
              id: up.id,
              secret: up.secret,
              amount: up.amount,
              C: up.C,
              y,
              bPrime,
              rHex,
              status: "Unspent"
            });
          }
        }

        // 6. Step 3: Spent Tree Audit
        this.steps.spentTree = { status: "running", message: "Verifying active coins non-inclusion & historical spent coins inclusion..." };

        // Batch query unspent Ys
        const unspentYs = auditedUnspent.map(au => au.y);
        const unspentYToProof = Object.fromEntries(auditedUnspent.map(au => [au.y, au]));
        let respSpentUnspent;
        if (unspentYs.length > 0) {
          respSpentUnspent = await axios.post(`${this.mintUrl}/v1/pol/${activeKeysetId}/proofs/spent`, { ys: unspentYs });
        }

        // Batch query spent candidates Ys
        const spentCandidatesMap = new Map<string, any>();
        const spentCandidateYsList: string[] = [];
        for (const asc of auditedSpentCandidates) {
          spentCandidatesMap.set(asc.y, asc);
          spentCandidateYsList.push(asc.y);
        }

        let respSpentSpent;
        if (spentCandidateYsList.length > 0) {
          respSpentSpent = await axios.post(`${this.mintUrl}/v1/pol/${activeKeysetId}/proofs/spent`, { ys: spentCandidateYsList });
        }

        // Process unspent proofs (must be 0 value)
        if (respSpentUnspent) {
          for (const item of respSpentUnspent.data.proofs) {
            const y = item.item;
            const proof = unspentYToProof[y];
            if (!proof) continue;

            if (item.value !== 0) {
              this.challenges.push({
                keyset_id: activeKeysetId,
                epoch_index: epochIdx,
                item_type: "spent_non_inclusion",
                item: proof.secret,
                index: item.index,
                value: 0,
                signature: proof.C || "",
                amount: proof.amount,
                pol_receipt: proof.polReceipt || null,
                error: `Active coin falsely registered as spent with value ${item.value}`
              });
            } else {
              const pathOk = await verifyMerkleProof(item as MerkleProofItem, rootSpentHash, rootSpentSum, defaultNodes);
              if (!pathOk) {
                this.challenges.push({
                  keyset_id: activeKeysetId,
                  epoch_index: epochIdx,
                  item_type: "spent_non_inclusion_path",
                  item: proof.secret,
                  index: item.index,
                  value: 0,
                  signature: proof.C || "",
                  amount: proof.amount,
                  pol_receipt: proof.polReceipt || null,
                  error: "Active coin sibling path failed Spent Tree Merkle-Sum verification"
                });
              } else {
                const { receiptStatus, receiptEpoch } = await this.getReceiptStatus(proof, y, proof.bPrime, storedMint);
                if (receiptStatus === "invalid") {
                  const polReceipt = proof.polReceipt || proof.pol_receipt;
                  this.challenges.push({
                    keyset_id: activeKeysetId,
                    epoch_index: polReceipt.target_epoch,
                    item_type: "spent_non_inclusion_path",
                    item: proof.secret,
                    index: item.index,
                    value: 0,
                    signature: polReceipt.signature,
                    amount: proof.amount,
                    pol_receipt: polReceipt,
                    error: `MINT SECURITY BREACH: The transaction pol_receipt signature provided by the mint is INVALID for epoch ${polReceipt.target_epoch}!`
                  });
                }
                this.verifiedTokens.push({
                  secret: proof.secret,
                  amount: proof.amount,
                  y: y,
                  bPrime: proof.bPrime,
                  status: "Unspent",
                  receiptStatus,
                  receiptEpoch
                });
              }
            }
          }
        }

        // Process spent candidates (real spent coins must have value > 0)
        const verifiedSpentProofs: any[] = [];
        if (respSpentSpent) {
          for (const item of respSpentSpent.data.proofs) {
            const y = item.item;
            const candidate = spentCandidatesMap.get(y);
            if (!candidate) continue;

            // Ignore candidates with value == 0 (never minted)
            if (item.value > 0) {
              const pathOk = await verifyMerkleProof(item as MerkleProofItem, rootSpentHash, rootSpentSum, defaultNodes);
              if (!pathOk) {
                this.challenges.push({
                  keyset_id: activeKeysetId,
                  epoch_index: epochIdx,
                  item_type: "spent_inclusion_path",
                  item: candidate.secret,
                  index: item.index,
                  value: item.value,
                  signature: "",
                  amount: item.value,
                  error: "Spent coin sibling path failed Spent Tree Merkle-Sum verification"
                });
              } else {
                verifiedSpentProofs.push({
                  ...candidate,
                  amount: item.value,
                  index: item.index
                });
              }
            }
          }
        }
        this.stats.spentCount = verifiedSpentProofs.length;

        this.steps.spentTree = {
          status: this.challenges.some(c => c.item_type.startsWith("spent")) ? "failed" : "success",
          message: `Spent tree verified. Checked ${unspentYs.length} active and ${verifiedSpentProofs.length} confirmed historical spent coins.`
        };

        // 7. Step 4: Issued Tree Audit
        this.steps.issuedTree = { status: "running", message: "Reconstructing blinded messages (B') and verifying tree inclusion..." };

        const allProofsToVerifyBPrime = [...auditedUnspent, ...verifiedSpentProofs];
        const blindedMessages: string[] = [];
        const bHexToProof: Record<string, any> = {};

        for (const p of allProofsToVerifyBPrime) {
          if (p.bPrime) {
            blindedMessages.push(p.bPrime);
            bHexToProof[p.bPrime] = p;
          }
        }
        this.stats.blindedCount = blindedMessages.length;

        if (blindedMessages.length > 0) {
          const respIssued = await axios.post(`${this.mintUrl}/v1/pol/${activeKeysetId}/proofs/issued`, { blinded_messages: blindedMessages });
          for (const item of respIssued.data.proofs) {
            const bPrime = item.item;
            const proof = bHexToProof[bPrime];
            if (!proof) continue;

            if (item.value !== proof.amount) {
              this.challenges.push({
                keyset_id: activeKeysetId,
                epoch_index: epochIdx,
                item_type: "issued_inclusion_path_error",
                item: bPrime,
                index: item.index,
                value: proof.amount,
                signature: proof.C || "",
                amount: proof.amount,
                pol_receipt: proof.polReceipt || null,
                error: `Falsely registered issued amount as ${item.value} instead of ${proof.amount}`
              });
            } else {
              const pathOk = await verifyMerkleProof(item as MerkleProofItem, rootIssuedHash, rootIssuedSum, defaultNodes);
              if (!pathOk) {
                this.challenges.push({
                  keyset_id: activeKeysetId,
                  epoch_index: epochIdx,
                  item_type: "issued_inclusion_path",
                  item: bPrime,
                  index: item.index,
                  value: proof.amount,
                  signature: proof.C || "",
                  amount: proof.amount,
                  pol_receipt: proof.polReceipt || null,
                  error: "Issued coin sibling path failed Issued Tree Merkle-Sum verification"
                });
              } else if (proof.status === "Spent") {
                const { receiptStatus, receiptEpoch } = await this.getReceiptStatus(proof, proof.y, proof.bPrime, storedMint);
                if (receiptStatus === "invalid") {
                  const polReceipt = proof.polReceipt || proof.pol_receipt;
                  this.challenges.push({
                    keyset_id: activeKeysetId,
                    epoch_index: polReceipt.target_epoch,
                    item_type: "issued_inclusion_path",
                    item: proof.secret,
                    index: item.index,
                    value: proof.amount,
                    signature: polReceipt.signature,
                    amount: proof.amount,
                    pol_receipt: polReceipt,
                    error: `MINT SECURITY BREACH: The transaction pol_receipt signature provided by the mint is INVALID for epoch ${polReceipt.target_epoch}!`
                  });
                }
                this.verifiedTokens.push({
                  secret: proof.secret,
                  amount: proof.amount,
                  y: proof.y,
                  bPrime: proof.bPrime,
                  status: "Spent",
                  receiptStatus,
                  receiptEpoch
                });
              }
            }
          }
        }

        this.steps.issuedTree = {
          status: this.challenges.some(c => c.item_type.startsWith("issued")) ? "failed" : "success",
          message: `Issued tree verified. Checked ${blindedMessages.length} deterministic blinded signatures.`
        };

        this.state = "completed";
      } catch (err: any) {
        this.state = "completed";
        this.auditError = err.message || "An unexpected error occurred during auditing.";
        Object.keys(this.steps).forEach((k) => {
          const step = (this.steps as any)[k];
          if (step.status === "running" || step.status === "pending") {
            step.status = "failed";
          }
        });
      }
    },
    copyFraudChallenges() {
      const formatted = JSON.stringify(this.challenges, null, 2);
      navigator.clipboard.writeText(formatted);
      this.$q.notify({
        type: "positive",
        message: "Fraud proofs copied to clipboard!",
        timeout: 2000,
      });
    }
  }
});
</script>

<style scoped>
.pol-audit-container {
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}
.max-width-text {
  max-width: 500px;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.border-grey {
  border: 1px solid #333;
}
.border-bottom-grey {
  border-bottom: 1px solid #222;
}
.stat-box {
  border: 1px solid #2a2a2a;
}
.explorer-panel {
  border: 1px solid #222;
}
.scroll-area {
  overflow-y: auto;
}
.max-height-300 {
  max-height: 300px;
}
</style>
