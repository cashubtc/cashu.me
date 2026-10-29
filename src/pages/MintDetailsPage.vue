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

        <!-- Contacts: one copy row per entry that has something to copy (an empty entry drew
             an icon and a copy button for nothing, owner 2026-10-29, items 8 and 35). -->
        <SectionDivider
          v-if="contacts.length"
          :label="$t('MintDetailsDialog.contact.title')"
        />
        <div v-if="contacts.length" class="detail-table q-mb-lg">
          <DetailRow
            v-for="c in contacts"
            :key="`${c.method}:${c.info}`"
            :icon="contactIcon(c.method)"
            :icon-src="contactIconSrc(c.method)"
            :label="contactLabel(c.method)"
            :copy-value="c.info"
            :action-label="`${contactLabel(c.method)}: ${c.info}`"
            ><bdi dir="ltr">{{
              c.method === "nostr" ? shortenMiddle(c.info) : c.info
            }}</bdi></DetailRow
          >
        </div>

        <!-- Section Divider -->
        <SectionDivider :label="$t('MintDetailsDialog.details.title')" />

        <!-- Mint Details Section -->
        <div class="detail-table q-mb-lg">
          <!-- URL: the one way to copy it (owner 2026-10-29). -->
          <DetailRow
            :icon="LinkIcon"
            :label="$t('MintDetailsDialog.details.url.label')"
            :value="mintData.url"
            :copy-value="mintData.url"
            :action-label="$t('MintDetailsDialog.actions.copy_mint_url.label')"
          />

          <!-- Nuts -->
          <DetailRow
            v-if="mintData.info?.nuts"
            action
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
            :icon="CoinsIcon"
            :label="$t('MintDetailsDialog.details.currency.label')"
            >{{ mintData.info.currencies }}</DetailRow
          >

          <!-- Currency Units (if available) -->
          <DetailRow
            v-if="mintUnits && mintUnits.length > 0"
            :icon="CoinsIcon"
            :label="$t('MintDetailsDialog.details.currencies.label')"
            :value="mintUnits.map(unitCode).join(', ')"
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
import { unitCode } from "src/js/format-currency";
import RevealTransition from "src/components/ui/RevealTransition.vue";
import TonalChip from "src/components/ui/TonalChip.vue";
import { defineComponent } from "vue";
import { displayContacts, shortenMiddle } from "src/js/mintContacts";
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
import DetailRow from "src/components/ui/DetailRow.vue";
import SectionDivider from "src/components/ui/SectionDivider.vue";
import SettingsActionRow from "src/components/ui/SettingsActionRow.vue";

// Picture icons for the contact methods that have no Lucide glyph, and their proper names.
const CONTACT_ICONS = {
  nostr: "/nostr-icon.svg",
  twitter: "/x-logo.svg",
  telegram: "/telegram-icon.svg",
};
const CONTACT_NAMES = { nostr: "Nostr", twitter: "X", telegram: "Telegram" };

export default defineComponent({
  name: "MintDetailsPage",
  mixins: [windowMixin],
  components: {
    RevealTransition,
    TonalChip,
    SettingsActionRow,
    QrCodeIcon,
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
    contacts() {
      return displayContacts(this.mintData.info?.contact);
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
    unitCode,
    ...mapActions(useMintsStore, [
      "removeMint",
      "fetchMintInfo",
      "triggerMintInfoMotdChanged",
    ]),
    shortenMiddle,
    contactIcon(method) {
      return method === "email" ? MailIcon : null;
    },
    contactIconSrc(method) {
      return CONTACT_ICONS[method] || null;
    },
    contactLabel(method) {
      if (method === "email") return this.$t("MintDetailsDialog.contact.email");
      return CONTACT_NAMES[method] || method;
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

/* Details, contacts and audit are flat rows on the 16px page edge; interactive rows bleed
   their tint 12px into the gutter (DetailRow), so nothing is indented to match the Actions
   card (owner 2026-10-29, item 34). */
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
  margin-block: 0 8px;
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
