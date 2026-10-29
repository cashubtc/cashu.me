<template>
  <div class="q-pt-md">
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
        <div class="mint-header-container q-mb-lg">
          <MintIdentityHeader :url="mintData.url" :info="mintData.info">
            <!-- A labelled chip: a bare QR glyph under the name read as decoration
                 (council R76-R80). -->
            <div class="top-icons">
              <TonalChip
                :aria-expanded="showQrCode"
                @click="showQrCode = !showQrCode"
              >
                <template #icon><QrCodeIcon :size="18" /></template>
                {{
                  showQrCode
                    ? $t("MintDetailsDialog.qr.hide")
                    : $t("MintDetailsDialog.qr.show")
                }}
              </TonalChip>
            </div>

            <!-- QR Code Section (toggleable) -->
            <div class="qr-code-container">
              <RevealTransition appear>
                <div
                  v-if="showQrCode"
                  class="qr-code-section q-my-md"
                  key="qr-code"
                >
                  <QrBlock :value="mintData.url" />
                </div>
              </RevealTransition>
            </div>
          </MintIdentityHeader>

          <!-- Only when there is something to say: empty, its 24px top margin doubled the gap
               above Mint details (council R84). -->
          <div
            v-if="
              (mintData.info?.motd && !mintData.motdDismissed) ||
              mintData.info?.description ||
              mintData.info?.description_long
            "
            class="mint-descriptions q-mt-lg"
          >
            <!-- MOTD Component -->
            <RevealTransition appear enter-active-class="animated pulse">
              <mint-motd-message
                v-if="mintData.info?.motd && !mintData.motdDismissed"
                :message="mintData.info.motd"
                :mint-url="mintData.url"
                :dismissed="mintData.motdDismissed"
                @dismiss="motdDismissed = true"
              />
            </RevealTransition>

            <div class="mint-description" v-if="mintData.info?.description">
              {{ mintData.info.description }}
            </div>
            <div
              class="mint-description-long q-mt-md"
              v-if="mintData.info?.description_long"
            >
              {{ mintData.info.description_long }}
            </div>
          </div>
          <RevealTransition>
            <MintMotdMessage
              v-if="mintData.info?.motd && mintData.motdDismissed"
              :message="mintData.info.motd"
              :mintUrl="mintData.url"
              :dismissed="mintData.motdDismissed"
              @dismiss="dismissMotd"
            />
          </RevealTransition>
        </div>

        <!-- Section Divider -->
        <SectionDivider
          v-if="mintData.info?.contact?.length > 0"
          :label="$t('MintDetailsDialog.contact.title')"
        />

        <!-- Contact Info Section -->
        <div class="contact-section q-mb-lg">
          <div
            v-for="contactInfo in mintData.info?.contact"
            :key="contactInfo.method"
            class="contact-item q-mb-md"
          >
            <div class="contact-icon-container">
              <MailIcon
                v-if="contactInfo.method === 'email'"
                size="20"
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
            <CopyButton
              :value="contactInfo.info"
              class="copy-icon"
              :label="$t('global.actions.copy.label')"
            />
          </div>
        </div>

        <!-- Section Divider -->
        <SectionDivider :label="$t('MintDetailsDialog.details.title')" />

        <!-- Mint Details Section -->
        <div class="mint-details-section q-mb-lg">
          <!-- URL -->
          <DetailRow
            class="q-mb-md"
            :icon="LinkIcon"
            :label="$t('MintDetailsDialog.details.url.label')"
            :value="mintData.url"
            value-class="items-center"
            @value-click="copyText(mintData.url)"
          />

          <!-- Nuts -->
          <DetailRow
            v-if="mintData.info?.nuts"
            action
            class="q-mb-md"
            :icon="ListChecksIcon"
            :label="$t('MintDetailsDialog.details.nuts.label')"
            :value="
              showAllNuts
                ? $t('MintDetailsDialog.details.nuts.actions.hide.label')
                : $t('MintDetailsDialog.details.nuts.actions.show.label')
            "
            @click="showAllNuts = !showAllNuts"
          />

          <!-- Expanded Nuts Section (when showAllNuts is true) -->
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
                  <span class="nut-number">{{ nutNumber }}:</span> {{ nutName }}
                </div>
              </div>
            </div>
          </div>

          <!-- Currency (if available) -->
          <DetailRow
            v-if="mintData.info?.currencies"
            class="q-mb-md"
            :icon="CoinsIcon"
            :label="$t('MintDetailsDialog.details.currency.label')"
            >{{ mintData.info.currencies }}</DetailRow
          >

          <!-- Currency Units (if available) -->
          <DetailRow
            v-if="mintUnits && mintUnits.length > 0"
            class="q-mb-md"
            :icon="CoinsIcon"
            :label="$t('MintDetailsDialog.details.currencies.label')"
            :value="
              mintUnits
                .map((unit) =>
                  unit === 'sat' ? '\u2066₿ (sat)\u2069' : unit.toUpperCase()
                )
                .join(', ')
            "
          />

          <!-- Version -->
          <DetailRow
            v-if="mintData.info?.version"
            :icon="TagIcon"
            :label="$t('MintDetailsDialog.details.version.label')"
            :value="mintData.info.version"
          />
        </div>

        <!-- Section Divider for Audit Info -->
        <SectionDivider
          v-if="settings.auditorEnabled"
          :label="$t('MintAuditInfo.title')"
        />

        <!-- Mint Audit Info Section -->
        <MintAuditInfo
          v-if="settings.auditorEnabled && mintData.url"
          class="mint-details-section"
          :mintUrl="mintData.url"
          @close="() => {}"
        />

        <!-- Section Divider -->
        <SectionDivider :label="$t('MintDetailsDialog.actions.title')" />

        <!-- Actions: everyday actions in one group, the destructive one on its own below,
             as real buttons (SettingsActionRow) with the shared row hover and focus. -->
        <q-list class="settings-menu-group mint-details-actions">
          <SettingsActionRow
            :icon="PencilIcon"
            data-testid="mint-edit"
            :label="$t('MintDetailsDialog.actions.edit.label')"
            @click="openEditMintDialog"
          />
          <SettingsActionRow
            :icon="CopyIcon"
            :label="$t('MintDetailsDialog.actions.copy_mint_url.label')"
            @click="copyText(mintData.url)"
          >
            <template #side><span /></template>
          </SettingsActionRow>
          <SettingsActionRow
            :icon="StarIcon"
            :label="$t('CreateMintReview.title')"
            @click="openCreateReviewDialog"
          />
        </q-list>
        <q-list class="settings-menu-group mint-details-actions q-mt-md">
          <SettingsActionRow
            :icon="Trash2Icon"
            data-testid="mint-delete"
            :label="$t('MintDetailsDialog.actions.delete.label')"
            danger
            @click="openRemoveMintDialog"
          >
            <template #side><span /></template>
          </SettingsActionRow>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import RevealTransition from "src/components/ui/RevealTransition.vue";
import TonalChip from "src/components/ui/TonalChip.vue";
import { defineComponent } from "vue";
import { copyToClipboard } from "quasar";
import { notifyCopied } from "src/js/notify";
import { mapActions, mapState, mapWritableState } from "pinia";
import QrBlock from "src/components/QrBlock.vue";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useSettingsStore } from "src/stores/settings";
import EditMintDialog from "src/components/EditMintDialog.vue";
import RemoveMintDialog from "src/components/RemoveMintDialog.vue";
import MintMotdMessage from "src/components/MintMotdMessage.vue";
import MintAuditInfo from "src/components/MintAuditInfo.vue";
import {
  Coins as CoinsIcon,
  Copy as CopyIcon,
  Tag as TagIcon,
  Link as LinkIcon,
  Mail as MailIcon,
  ListChecks as ListChecksIcon,
  Pencil as PencilIcon,
  QrCode as QrCodeIcon,
  Star as StarIcon,
  Trash2 as Trash2Icon,
} from "lucide-vue-next";
import MintIdentityHeader from "src/components/MintIdentityHeader.vue";
import CopyButton from "src/components/ui/CopyButton.vue";
import DetailRow from "src/components/ui/DetailRow.vue";
import SectionDivider from "src/components/ui/SectionDivider.vue";
import SettingsActionRow from "src/components/ui/SettingsActionRow.vue";

export default defineComponent({
  name: "MintDetailsPage",
  mixins: [windowMixin],
  components: {
    RevealTransition,
    TonalChip,
    SettingsActionRow,
    CopyButton,
    QrCodeIcon,
    MailIcon,
    QrBlock,
    MintIdentityHeader,
    EditMintDialog,
    RemoveMintDialog,
    MintMotdMessage,
    MintAuditInfo,
    DetailRow,
    SectionDivider,
  },
  setup() {
    return {
      CopyIcon,
      PencilIcon,
      StarIcon,
      Trash2Icon,
      CoinsIcon,
      TagIcon,
      LinkIcon,
      ListChecksIcon,
    };
  },
  data: function () {
    return {
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
      copyToClipboard(text).then(() => notifyCopied());
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
/* One gap before every section label: each section drops its own trailing margin and the
   label sits 24px below it (the gaps were 56px above Mint details and 24px above Audit info,
   council R75). */
.mint-content-container > :has(+ .section-divider-block) {
  margin-bottom: 0 !important;
}
.mint-content-container > :has(+ .section-divider-block) > :deep(:last-child) {
  margin-bottom: 0 !important;
}
.mint-content-container > .section-divider-block {
  margin-top: 24px;
}
/* The page scrolls as a whole; no inner scroll container. */
.mint-details-page-content {
  max-width: var(--app-column);
  margin: 0 auto;
  color: var(--app-text);
  width: 100%;
  padding-bottom: 32px;
}

/* Top Icons */
.top-icons {
  padding-top: 10px;
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Mint Header */
.mint-header-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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
  width: 100%;
}

.mint-description-long {
  align-self: stretch;
  position: relative;
  font-size: 14px;
  line-height: 20px;
  color: var(--app-text-muted);
  width: 100%;
  font-weight: 500;
}

/* Contact Section */
.contact-section {
  width: 100%;
}

.contact-item {
  display: flex;
  align-items: center;
  width: 100%;
}

/* Contact rows share the detail rows' icon slot, gap and text size (app.scss .detail-*). */
.contact-icon-container {
  width: 24px;
  display: flex;
  justify-content: center;
  margin-inline-end: 12px;
}

.contact-icon {
  width: 20px;
  height: 20px;
  color: var(--app-text-muted);
}

/* Contact values read like the detail rows: regular weight on the text colour. */
.contact-text {
  flex: 1;
  font-size: 15px;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-icon {
  margin-inline-start: 4px;
}

/* Details and audit info are flat rows on the page, like the invoice and token details, but
   inset so their icons and values sit on the same columns as the Actions card's rows
   (the icons were 24px apart, council R88-R89). */
.mint-details-section {
  padding-block: 4px 0;
  padding-inline: 22px 20px;
  width: 100%;
}

.mint-details-actions {
  margin-bottom: 32px;
}
.mint-details-actions + .mint-details-actions {
  margin-top: -16px;
}

/* QR Code Container and Animation */
.qr-code-container {
  min-height: 0;
  display: flex;
  justify-content: center;
  width: 100%;
  overflow: hidden;
}

.qr-code-section {
  width: 100%;
  display: flex;
  justify-content: center;
}

.nuts-expanded-section {
  width: 100%;
  margin-bottom: 16px;
}

.nuts-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.nut-pill {
  border-radius: 4px;
  padding: 8px;
  width: 100%;
}

.nut-content {
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
  color: var(--app-text);
}

.nut-number {
  color: var(--app-text-muted);
}
</style>
