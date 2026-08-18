<template>
  <div
    class="mint-details q-pa-md"
    :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'"
  >
    <div class="mint-details-page-content">
      <EditMintDialog
        :mint="mintToEdit"
        :showEditMintDialog="showEditMintDialog"
        @update:showEditMintDialog="showEditMintDialog = $event"
      />
      <RemoveMintDialog
        :mintToRemove="mintToRemove"
        :showRemoveMintDialog="showRemoveMintDialog"
        @update:showRemoveMintDialog="showRemoveMintDialog = $event"
        @remove="removeMint"
      />

      <div class="mint-content-container q-px-md">
        <!-- Mint Header Profile Name Section -->
        <div class="mint-header-container q-mb-md">
          <div class="mint-header q-pa-lg">
            <!-- QR Code Toggle -->
            <q-btn
              flat
              dense
              round
              size="sm"
              class="qr-toggle-btn"
              aria-label="Toggle mint QR code"
              @click="showQrCode = !showQrCode"
            >
              <qr-code-icon :size="20" />
            </q-btn>

            <!-- Mint Profile Name Section -->
            <q-avatar size="64px" class="mint-profile-icon q-mb-sm">
              <img
                v-if="mintData.info?.icon_url"
                :src="mintData.info.icon_url"
                alt="Mint Profile"
              />
              <building-icon v-else size="36" />
            </q-avatar>
            <div class="mint-name q-mb-xs">
              {{ mintData.info?.name || "Mint" }}
            </div>

            <!-- QR Code Section (toggleable) -->
            <div class="qr-code-container">
              <transition name="smooth-slide">
                <div
                  v-if="showQrCode"
                  class="qr-code-section q-my-md"
                  key="qr-code"
                >
                  <vue-qrcode
                    :value="mintData.url"
                    :options="{ width: 300 }"
                    class="rounded-borders"
                  />
                </div>
              </transition>
            </div>
          </div>

          <div class="mint-descriptions q-mt-md">
            <!-- MOTD Component -->
            <transition name="smooth-slide">
              <mint-motd-message
                v-if="mintData.info?.motd && !mintData.motdDismissed"
                :message="mintData.info.motd"
                :mint-url="mintData.url"
                :dismissed="mintData.motdDismissed"
                @dismiss="motdDismissed = true"
              />
            </transition>

            <div class="mint-description" v-if="mintData.info?.description">
              {{ mintData.info.description }}
            </div>
            <div
              class="mint-description-long q-mt-sm"
              v-if="mintData.info?.description_long"
            >
              {{ mintData.info.description_long }}
            </div>
          </div>
          <transition name="smooth-slide">
            <MintMotdMessage
              v-if="mintData.info?.motd && mintData.motdDismissed"
              :message="mintData.info.motd"
              :mintUrl="mintData.url"
              :dismissed="mintData.motdDismissed"
              @dismiss="dismissMotd"
            />
          </transition>
        </div>

        <!-- Section Label -->
        <div class="section-label" v-if="mintData.info?.contact?.length > 0">
          {{ $t("MintDetailsDialog.contact.title") }}
        </div>

        <!-- Contact Info Section -->
        <div
          class="contact-section surface-card"
          v-if="mintData.info?.contact?.length > 0"
        >
          <div
            v-for="contactInfo in mintData.info?.contact"
            :key="contactInfo.method"
            class="contact-item pressable cursor-pointer"
            @click="copyText(contactInfo.info)"
          >
            <div class="contact-icon-container">
              <mail-icon
                v-if="contactInfo.method === 'email'"
                size="18"
                class="contact-icon"
              />
              <img
                v-else-if="contactInfo.method === 'nostr'"
                src="nostr-icon.svg"
                class="contact-icon"
                alt=""
              />
              <img
                v-else-if="contactInfo.method === 'twitter'"
                src="/x-logo.svg"
                class="contact-icon"
                alt=""
              />
              <img
                v-else-if="contactInfo.method === 'telegram'"
                src="/telegram-icon.svg"
                class="contact-icon"
                alt=""
              />
              <div v-else class="contact-text q-ml-xs">
                {{ contactInfo.method }}
              </div>
            </div>
            <div class="contact-text">{{ contactInfo.info }}</div>
            <copy-icon size="16" class="copy-icon" />
          </div>
        </div>

        <!-- Section Label -->
        <div class="section-label">
          {{ $t("MintDetailsDialog.details.title") }}
        </div>

        <!-- Mint Details Section -->
        <div class="mint-details-section surface-card">
          <!-- URL -->
          <div
            class="detail-item detail-item--clickable pressable cursor-pointer"
            @click="copyText(mintData.url)"
          >
            <div class="detail-label">
              <link-icon size="18" class="detail-icon" />
              <div class="detail-name">
                {{ $t("MintDetailsDialog.details.url.label") }}
              </div>
            </div>
            <div class="detail-value items-center">
              <span class="detail-value-text">{{ mintData.url }}</span>
              <copy-icon size="14" class="detail-value-icon" />
            </div>
          </div>

          <!-- Nuts -->
          <div class="detail-item" v-if="mintData.info?.nuts">
            <div class="detail-label">
              <nut-icon size="18" class="detail-icon" />
              <div class="detail-name">
                {{ $t("MintDetailsDialog.details.nuts.label") }}
              </div>
            </div>
            <div
              class="detail-value nuts-toggle"
              @click="showAllNuts = !showAllNuts"
            >
              <span>{{
                showAllNuts
                  ? $t("MintDetailsDialog.details.nuts.actions.hide.label")
                  : $t("MintDetailsDialog.details.nuts.actions.show.label")
              }}</span>
              <q-icon
                name="keyboard_arrow_down"
                size="18px"
                class="nuts-toggle-chevron"
                :class="{ 'nuts-toggle-chevron--open': showAllNuts }"
              />
            </div>
          </div>

          <!-- Expanded Nuts Section (when showAllNuts is true) -->
          <transition name="expand">
            <div
              class="nuts-expanded-section"
              v-if="showAllNuts && mintData.info?.nuts"
            >
              <div class="nuts-grid">
                <div
                  v-for="(nutName, nutNumber) in visibleNuts"
                  :key="nutNumber"
                  class="nut-pill"
                >
                  <div class="nut-content">
                    <span class="nut-number">{{ nutNumber }}</span>
                    {{ nutName }}
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- Currency (if available) -->
          <div class="detail-item" v-if="mintData.info?.currencies">
            <div class="detail-label">
              <currency-icon size="18" class="detail-icon" />
              <div class="detail-name">
                {{ $t("MintDetailsDialog.details.currency.label") }}
              </div>
            </div>
            <div class="detail-value">{{ mintData.info.currencies }}</div>
          </div>

          <!-- Currency Units (if available) -->
          <div class="detail-item" v-if="mintUnits && mintUnits.length > 0">
            <div class="detail-label">
              <banknote-icon size="18" class="detail-icon" />
              <div class="detail-name">
                {{ $t("MintDetailsDialog.details.currencies.label") }}
              </div>
            </div>
            <div class="detail-value">
              {{ mintUnits.map((unit) => unit.toUpperCase()).join(", ") }}
            </div>
          </div>

          <!-- Version -->
          <div class="detail-item" v-if="mintData.info?.version">
            <div class="detail-label">
              <info-icon size="18" class="detail-icon" />
              <div class="detail-name">
                {{ $t("MintDetailsDialog.details.version.label") }}
              </div>
            </div>
            <div class="detail-value">{{ mintData.info.version }}</div>
          </div>
        </div>

        <!-- Section Label for Audit Info -->
        <div v-if="settings.auditorEnabled" class="section-label">
          AUDIT INFO
        </div>

        <!-- Mint Audit Info Section -->
        <MintAuditInfo
          v-if="settings.auditorEnabled && mintData.url"
          :mintUrl="mintData.url"
          @close="() => {}"
        />

        <!-- Section Label -->
        <div class="section-label">
          {{ $t("MintDetailsDialog.actions.title") }}
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons-section">
          <div class="action-buttons-container surface-card">
            <div
              class="action-button pressable cursor-pointer"
              @click="openEditMintDialog"
            >
              <pencil-icon size="18" class="action-icon" />
              <div class="action-label">
                {{ $t("MintDetailsDialog.actions.edit.label") }}
              </div>
            </div>

            <div
              class="action-button pressable cursor-pointer"
              @click="copyText(mintData.url)"
            >
              <copy-icon size="18" class="action-icon" />
              <div class="action-label">
                {{ $t("MintDetailsDialog.actions.copy_mint_url.label") }}
              </div>
            </div>

            <div
              class="action-button pressable cursor-pointer"
              @click="openCreateReviewDialog"
            >
              <q-icon name="rate_review" size="18px" class="action-icon" />
              <div class="action-label">Review Mint</div>
            </div>

            <div
              class="action-button delete-button pressable cursor-pointer"
              @click="openRemoveMintDialog"
            >
              <trash-icon size="18" class="action-icon" />
              <div class="action-label">
                {{ $t("MintDetailsDialog.actions.delete.label") }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useSettingsStore } from "src/stores/settings";
import EditMintDialog from "src/components/EditMintDialog.vue";
import RemoveMintDialog from "src/components/RemoveMintDialog.vue";
import MintMotdMessage from "src/components/MintMotdMessage.vue";
import MintAuditInfo from "src/components/MintAuditInfo.vue";
import {
  QrCode as QrCodeIcon,
  Link as LinkIcon,
  Nut as NutIcon,
  DollarSign as CurrencyIcon,
  Info as InfoIcon,
  Mail as MailIcon,
  Copy as CopyIcon,
  Pencil as PencilIcon,
  Trash as TrashIcon,
  Building as BuildingIcon,
  Banknote as BanknoteIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "MintDetailsPage",
  mixins: [windowMixin],
  components: {
    VueQrcode,
    QrCodeIcon,
    LinkIcon,
    NutIcon,
    CurrencyIcon,
    InfoIcon,
    MailIcon,
    CopyIcon,
    PencilIcon,
    TrashIcon,
    BuildingIcon,
    BanknoteIcon,
    EditMintDialog,
    RemoveMintDialog,
    MintMotdMessage,
    MintAuditInfo,
  },
  data: function () {
    return {
      contactIcons: {
        email: "mail",
      },
      contactMethods: {
        twitter: "X",
        nostr: "Nostr",
      },
      showQrCode: false,
      showAllNuts: false,
      nutNames: {
        7: "Token state check",
        8: "Overpaid Lightning fees",
        9: "Signature restore",
        10: "Spending conditions",
        11: "Pay-To-Pubkey (P2PK)",
        12: "DLEQ proofs",
        13: "Deterministic secrets",
        14: "Hashed Timelock Contracts",
        15: "Partial multi-path payments",
        16: "Animated QR codes",
        17: "WebSocket subscriptions",
        18: "Payment requests",
        19: "Cached Responses",
        20: "Signature on Mint Quote",
        21: "Clear authentication",
        22: "Blind authentication",
      },
      motdDismissed: false,
      settings: useSettingsStore(),
      mintData: {},
      mintToEdit: {},
      mintToRemove: {},
    };
  },
  computed: {
    ...mapWritableState(useMintsStore, [
      "showEditMintDialog",
      "showRemoveMintDialog",
    ]),
    filteredNutNames() {
      // Only include nuts 7 and above
      const filteredNuts = {};
      Object.keys(this.nutNames).forEach((nutNumber) => {
        if (parseInt(nutNumber) >= 7) {
          filteredNuts[nutNumber] = this.nutNames[nutNumber];
        }
      });
      return filteredNuts;
    },
    visibleNuts() {
      // Return only the nuts that are both in our filtered list and supported by the mint
      const result = {};
      if (this.mintData && this.mintData.info && this.mintData.info.nuts) {
        Object.keys(this.filteredNutNames).forEach((nutNumber) => {
          if (this.mintData.info.nuts[nutNumber]) {
            result[nutNumber] = this.filteredNutNames[nutNumber];
          }
        });
      }
      return result;
    },
    mintUnits() {
      if (this.mintData) {
        const mintClassInstance = new MintClass(this.mintData);
        return mintClassInstance.units;
      }
      return [];
    },
  },
  methods: {
    ...mapActions(useMintsStore, [
      "removeMint",
      "fetchMintInfo",
      "triggerMintInfoMotdChanged",
    ]),
    shortenText: function (text, maxLength) {
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
      }
      return text;
    },
    copyText(text) {
      navigator.clipboard.writeText(text);
      this.$q.notify({
        message: this.$i18n.t("global.copy_to_clipboard.success"),
        color: "positive",
        position: "top",
        timeout: 1000,
      });
    },
    openEditMintDialog() {
      this.mintToEdit = Object.assign({}, this.mintData);
      this.showEditMintDialog = true;
    },
    openRemoveMintDialog() {
      this.mintToRemove = Object.assign({}, this.mintData);
      this.showRemoveMintDialog = true;
    },
    openCreateReviewDialog() {
      // Navigate to create review page
      this.$router.push({
        path: "/createreview",
        query: {
          mintUrl: this.mintData.url,
        },
      });
    },
    dismissMotd() {
      // Handle MOTD dismissal
      this.motdDismissed = true;
    },
    async refreshMintInfo() {
      try {
        console.log("Refreshing mint info for:", this.mintData.url);
        const newMintInfo = await this.fetchMintInfo(this.mintData);
        this.triggerMintInfoMotdChanged(newMintInfo, this.mintData, false);
        const mintsStore = useMintsStore();
        const target = mintsStore.mints.find(
          (m) => m.url === this.mintData.url
        );
        if (target) {
          target.info = newMintInfo;
        }
        if (this.mintData) {
          this.mintData.info = newMintInfo;
        }
      } catch (error) {
        console.log("Failed to fetch mint info:", error);
      }
    },
  },
  created() {
    // Get mint data from query params or store
    if (this.$route.query.mintUrl) {
      const mintsStore = useMintsStore();
      const mint = mintsStore.mints.find(
        (m) => m.url === this.$route.query.mintUrl
      );
      if (mint) {
        this.mintData = mint;
        this.refreshMintInfo();
      } else {
        // Mint not found, redirect back
        this.$router.push("/");
      }
    } else {
      // No mint URL provided, redirect back
      this.$router.push("/");
    }
  },
});
</script>

<style scoped>
/* Theme-aware design tokens: dark values by default (the app is dark-first),
   light overrides below. Keeps the page working in both modes. */
.mint-details {
  --md-text: #ffffff;
  --md-muted: #8e8e93;
  --md-surface: rgba(255, 255, 255, 0.05);
  --md-surface-hover: rgba(255, 255, 255, 0.1);
  --md-danger: #ff453a;
}
body:not(.body--dark) .mint-details {
  --md-text: #1d1d1d;
  --md-muted: #6e6e73;
  --md-surface: rgba(0, 0, 0, 0.04);
  --md-surface-hover: rgba(0, 0, 0, 0.08);
  --md-danger: #d70015;
}

.mint-details-page-content {
  max-width: 600px;
  margin: 0 auto;
  color: var(--md-text);
}

.mint-content-container {
  max-width: 600px;
  margin: 0 auto;
  color: var(--md-text);
}

/* Mint Header */
.mint-header-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.mint-header {
  background-color: var(--md-surface);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
}

.qr-toggle-btn {
  color: var(--md-muted);
  position: absolute;
  right: 10px;
  top: 10px;
}

.mint-name {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-align: center;
}

.mint-descriptions {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.mint-description {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: -0.01em;
  width: 100%;
}

.mint-description-long {
  align-self: stretch;
  position: relative;
  font-size: 14px;
  line-height: 20px;
  color: var(--md-muted);
  width: 100%;
  font-weight: 500;
}

/* Section labels (iOS grouped-list style) */
.section-label {
  color: var(--md-muted);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  margin: 28px 0 8px 4px;
  text-transform: uppercase;
}

/* Grouped surface cards */
.surface-card {
  background-color: var(--md-surface);
  border-radius: 16px;
  overflow: hidden;
  padding: 4px;
  width: 100%;
}

/* Contact Section */
.contact-section {
  width: 100%;
}

.contact-item {
  align-items: center;
  border-radius: 12px;
  display: flex;
  min-height: 44px;
  padding: 8px 10px;
  width: 100%;
}

@media (hover: hover) and (pointer: fine) {
  .contact-item:hover {
    background-color: var(--md-surface-hover);
  }
}

.contact-icon-container {
  align-items: center;
  display: flex;
  justify-content: center;
  margin-right: 12px;
  width: 24px;
}

.contact-icon {
  width: 18px;
  height: 18px;
  color: var(--md-muted);
}

.contact-text {
  color: var(--md-text);
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-icon {
  color: var(--md-muted);
  flex-shrink: 0;
  margin-left: 10px;
}

/* Mint Details Section */
.mint-details-section {
  width: 100%;
}

.detail-item {
  align-items: center;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  min-height: 44px;
  padding: 8px 10px;
  width: 100%;
}

.detail-item--clickable {
  transition: transform var(--dur-press) var(--ease-out),
    background-color var(--dur-press) var(--ease-standard);
}
@media (hover: hover) and (pointer: fine) {
  .detail-item--clickable:hover {
    background-color: var(--md-surface-hover);
  }
}

.detail-label {
  align-items: center;
  display: flex;
  flex-shrink: 0;
}

.detail-icon {
  color: var(--md-muted);
  margin-right: 12px;
}

.detail-name {
  color: var(--md-muted);
  font-size: 15px;
  font-weight: 500;
}

.detail-value {
  align-items: center;
  color: var(--md-text);
  display: flex;
  font-size: 15px;
  font-weight: 600;
  justify-content: flex-end;
  max-width: 60%;
  min-width: 0;
  text-align: right;
}

.detail-value-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-value-icon {
  color: var(--md-muted);
  flex-shrink: 0;
  margin-left: 6px;
}

/* Nuts toggle + expanded section */
.nuts-toggle {
  color: var(--q-primary);
  cursor: pointer;
  gap: 2px;
}

.nuts-toggle-chevron {
  transition: transform var(--dur-ui) var(--ease-out);
}

.nuts-toggle-chevron--open {
  transform: rotate(180deg);
}

.nuts-expanded-section {
  overflow: hidden;
  width: 100%;
}

.nuts-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 4px 8px;
  width: 100%;
}

.nut-pill {
  background-color: var(--md-surface);
  border-radius: 8px;
  padding: 8px 12px;
  width: 100%;
}
body:not(.body--dark) .nut-pill {
  background-color: rgba(0, 0, 0, 0.03);
}

.nut-content {
  color: var(--md-text);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}

.nut-number {
  color: var(--md-muted);
  display: inline-block;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  margin-right: 8px;
  min-width: 18px;
}

/* Action Buttons */
.action-buttons-section {
  width: 100%;
  margin-bottom: 32px;
}

.action-buttons-container {
  width: 100%;
}

.action-button {
  align-items: center;
  border-radius: 12px;
  display: flex;
  gap: 14px;
  min-height: 44px;
  padding: 10px;
  width: 100%;
}

@media (hover: hover) and (pointer: fine) {
  .action-button:hover {
    background-color: var(--md-surface-hover);
  }
  .delete-button:hover {
    background-color: color-mix(in srgb, var(--md-danger) 10%, transparent);
  }
}

.action-button:active {
  background-color: var(--md-surface-hover);
}
.delete-button:active {
  background-color: color-mix(in srgb, var(--md-danger) 14%, transparent);
}

.action-icon {
  color: var(--md-muted);
  min-width: 18px;
}

.action-label {
  color: var(--md-text);
  font-size: 15px;
  font-weight: 500;
  line-height: 24px;
}

.delete-button .action-icon,
.delete-button .action-label {
  color: var(--md-danger);
}

/* QR Code Container and expand/collapse animation.
   Explicit properties only — never `transition: all`. Enter is slower than
   exit (asymmetric timing: slow when deciding, fast when responding). */
.qr-code-container {
  min-height: 0;
  display: flex;
  justify-content: center;
  width: 100%;
  overflow: hidden;
}

.qr-code-section {
  display: flex;
  justify-content: center;
  overflow: hidden;
  width: 100%;
}

.smooth-slide-enter-active {
  transition: max-height 0.3s var(--ease-out), opacity 0.25s var(--ease-out),
    transform 0.3s var(--ease-out), margin-bottom 0.3s var(--ease-out);
  max-height: 350px;
  margin-bottom: 16px;
  opacity: 1;
  pointer-events: auto;
}

.smooth-slide-leave-active {
  transition: max-height 0.2s var(--ease-out), opacity 0.15s var(--ease-out),
    transform 0.2s var(--ease-out), margin-bottom 0.2s var(--ease-out);
  max-height: 350px;
  margin-bottom: 16px;
  opacity: 1;
}

.smooth-slide-enter-from,
.smooth-slide-leave-to {
  max-height: 0;
  margin-bottom: 0;
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
  pointer-events: none;
}

.expand-enter-active {
  transition: max-height 0.3s var(--ease-out), opacity 0.25s var(--ease-out);
  max-height: 1200px;
  opacity: 1;
}

.expand-leave-active {
  transition: max-height 0.2s var(--ease-out), opacity 0.15s var(--ease-out);
  max-height: 1200px;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .smooth-slide-enter-active,
  .smooth-slide-leave-active,
  .expand-enter-active,
  .expand-leave-active {
    transition: opacity 0.15s ease;
    transform: none;
  }
  .nuts-toggle-chevron {
    transition: none;
  }
}
</style>
