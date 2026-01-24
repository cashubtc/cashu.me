<template>
  <div class="bg-dark text-white q-pa-md flex flex-center">
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
          <div class="mint-header q-pa-md">
            <!-- Mint Profile Name Section -->
            <q-avatar size="56px" class="mint-profile-icon q-mb-sm">
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

            <!-- QR Code Icon -->
            <div class="top-icons">
              <qr-code-icon
                size="24"
                class="qr-icon cursor-pointer text-white"
                @click="showQrCode = !showQrCode"
              />
            </div>

            <!-- QR Code Section (toggleable) -->
            <div class="qr-code-container">
              <transition appear name="smooth-slide">
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

          <div class="mint-descriptions q-mt-lg">
            <!-- MOTD Component -->
            <transition
              appear
              enter-active-class="animated pulse"
              name="smooth-slide"
            >
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
              class="mint-description-long q-mt-md"
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

        <!-- Section Divider -->
        <div
          class="section-divider q-mb-md"
          v-if="mintData.info?.contact?.length > 0"
        >
          <div class="divider-line"></div>
          <div class="divider-text">
            {{ $t("MintDetailsDialog.contact.title") }}
          </div>
          <div class="divider-line"></div>
        </div>

        <!-- Contact Info Section -->
        <div class="contact-section q-mb-lg">
          <div
            v-for="contactInfo in mintData.info?.contact"
            :key="contactInfo.method"
            class="contact-item q-mb-md"
          >
            <div class="contact-icon-container">
              <mail-icon
                v-if="contactInfo.method === 'email'"
                size="20"
                color="#9E9E9E"
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
            <copy-icon
              @click="copyText(contactInfo.info)"
              size="20"
              color="#9E9E9E"
              class="copy-icon cursor-pointer"
            />
          </div>
        </div>

        <!-- Section Divider -->
        <div class="section-divider q-mb-md">
          <div class="divider-line"></div>
          <div class="divider-text">
            {{ $t("MintDetailsDialog.details.title") }}
          </div>
          <div class="divider-line"></div>
        </div>

        <!-- Mint Details Section -->
        <div class="mint-details-section q-mb-lg">
          <!-- URL -->
          <div class="detail-item q-mb-md">
            <div class="detail-label">
              <link-icon size="20" color="#9E9E9E" class="detail-icon" />
              <div class="detail-name">
                {{ $t("MintDetailsDialog.details.url.label") }}
              </div>
            </div>
            <div
              class="detail-value items-center"
              @click="copyText(mintData.url)"
            >
              {{ mintData.url }}
            </div>
          </div>

          <!-- Nuts -->
          <div class="detail-item q-mb-md" v-if="mintData.info?.nuts">
            <div class="detail-label">
              <nut-icon size="20" color="#9E9E9E" class="detail-icon" />
              <div class="detail-name">
                {{ $t("MintDetailsDialog.details.nuts.label") }}
              </div>
            </div>
            <div
              class="detail-value"
              v-if="!showAllNuts"
              @click="showAllNuts = true"
            >
              {{ $t("MintDetailsDialog.details.nuts.actions.show.label") }}
            </div>
            <div class="detail-value" v-else @click="showAllNuts = false">
              {{ $t("MintDetailsDialog.details.nuts.actions.hide.label") }}
            </div>
          </div>

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
          <div class="detail-item q-mb-md" v-if="mintData.info?.currencies">
            <div class="detail-label">
              <currency-icon size="20" color="#9E9E9E" class="detail-icon" />
              <div class="detail-name">
                {{ $t("MintDetailsDialog.details.currency.label") }}
              </div>
            </div>
            <div class="detail-value">{{ mintData.info.currencies }}</div>
          </div>

          <!-- Currency Units (if available) -->
          <div
            class="detail-item q-mb-md"
            v-if="mintUnits && mintUnits.length > 0"
          >
            <div class="detail-label">
              <banknote-icon size="20" color="#9E9E9E" class="detail-icon" />
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
              <info-icon size="20" color="#9E9E9E" class="detail-icon" />
              <div class="detail-name">
                {{ $t("MintDetailsDialog.details.version.label") }}
              </div>
            </div>
            <div class="detail-value">{{ mintData.info.version }}</div>
          </div>
        </div>

        <!-- Section Divider for Audit Info -->
        <div v-if="settings.auditorEnabled" class="section-divider q-mb-md">
          <div class="divider-line"></div>
          <div class="divider-text">AUDIT INFO</div>
          <div class="divider-line"></div>
        </div>

        <!-- Mint Audit Info Section -->
        <MintAuditInfo
          v-if="settings.auditorEnabled && mintData.url"
          :mintUrl="mintData.url"
          @close="() => {}"
        />

        <!-- Section Divider -->
        <div class="section-divider q-mb-md">
          <div class="divider-line"></div>
          <div class="divider-text">
            {{ $t("MintDetailsDialog.actions.title") }}
          </div>
          <div class="divider-line"></div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons-section">
          <div class="action-buttons-container">
            <div
              class="action-button cursor-pointer"
              @click="openEditMintDialog"
            >
              <pencil-icon size="20" color="#9E9E9E" class="action-icon" />
              <div class="action-label">
                {{ $t("MintDetailsDialog.actions.edit.label") }}
              </div>
            </div>

            <div
              class="action-button cursor-pointer"
              @click="copyText(mintData.url)"
            >
              <copy-icon size="20" color="#9E9E9E" class="action-icon" />
              <div class="action-label">
                {{ $t("MintDetailsDialog.actions.copy_mint_url.label") }}
              </div>
            </div>

            <div
              class="action-button cursor-pointer"
              @click="openCreateReviewDialog"
            >
              <q-icon name="rate_review" size="20px" class="action-icon" />
              <div class="action-label">Review Mint</div>
            </div>

            <div
              class="action-button delete-button cursor-pointer"
              @click="openRemoveMintDialog"
            >
              <trash-icon size="20" color="#FF453A" class="action-icon" />
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
.mint-details-page-content {
  max-width: 600px;
  margin: 0 auto;
  color: white;
  height: 100%;
  overflow-y: auto;
  position: absolute;
  top: 0;
  width: 100%;
}

.mint-content-container {
  max-width: 600px;
  margin: 0 auto;
  color: white;
  height: 100%;
  overflow-y: auto;
  position: relative;
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
  margin-top: 50px;
}

.mint-header {
  width: 100%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
}

.mint-name {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
}

.mint-balance {
  font-size: 20px;
  font-weight: 600;
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
  width: 100%;
}

.mint-description-long {
  align-self: stretch;
  position: relative;
  font-size: 14px;
  line-height: 20px;
  color: #9e9e9e;
  width: 100%;
  font-weight: 500;
}

/* Section Divider */
.section-divider {
  display: flex;
  align-items: center;
  width: 100%;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #333;
}

.divider-text {
  padding: 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
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

.contact-icon-container {
  width: 24px;
  display: flex;
  justify-content: center;
  margin-right: 10px;
}

.contact-icon {
  width: 20px;
  height: 20px;
  color: #636366;
}

.contact-text {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-icon {
  color: #636366;
  margin-left: 10px;
}

/* Mint Details Section */
.mint-details-section {
  width: 100%;
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
  font-size: 16px;
  font-weight: 600;
  color: #9e9e9e;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: white;
  text-align: right;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Action Buttons */
.action-buttons-section {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-top: 16px;
  margin-bottom: 32px;
}

.action-buttons-container {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
}

.action-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.3s;
  width: 100%;
  margin-bottom: 16px;
}

.action-button:last-child {
  margin-bottom: 0;
}

.action-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.action-icon {
  min-width: 20px;
}

.action-label {
  position: relative;
  line-height: 24px;
  font-weight: 500;
  font-size: 16px;
}

.delete-button {
  color: #ff453a;
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

.smooth-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  max-height: 350px;
  margin-bottom: 16px;
  opacity: 1;
  pointer-events: auto;
}

.smooth-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 350px;
  margin-bottom: 16px;
  opacity: 1;
}

.smooth-slide-enter-from,
.smooth-slide-leave-to {
  max-height: 0;
  margin-bottom: 0;
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
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
  color: white;
}

.nut-number {
  color: #9e9e9e;
}

/* Make "View all" and "Hide" text clickable */
.detail-value[v-if="!showAllNuts"],
.detail-value[v-else] {
  cursor: pointer;
  color: white;
  font-weight: 600;
}

/* Currency Units */
.currency-units-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.currency-unit-pill {
  border-radius: 4px;
  background-color: #1d1d1d;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  display: inline-block;
}
</style>
