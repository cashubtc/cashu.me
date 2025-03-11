<template>
  <EditMintDialog
    :mint="mintToEdit"
    @update:mint="
      (updatedMint) => {
        mintToEdit = updatedMint;
      }
    "
    @remove="showRemoveMintDialogWrapper"
    :showEditMintDialog="showEditMintDialog"
    @update:showEditMintDialog="showEditMintDialog = $event"
  />
  <RemoveMintDialog
    :mintToRemove="mintToRemove"
    :showRemoveMintDialog="showRemoveMintDialog"
    @update:showRemoveMintDialog="showRemoveMintDialog = $event"
    @remove="removeMint"
  />
  <q-dialog
    v-model="showMintInfoDialog"
    position="top"
    :maximized="true"
    transition-show="fade"
    transition-hide="fade"
    full-width
    full-height
    seamless
  >
    <div class="fullscreen bg-black">
      <div class="mint-content-container q-pa-md">
        <!-- Top Icons -->
        <div class="top-icons q-pt-md q-mb-lg">
          <close-icon
            size="24"
            class="close-icon cursor-pointer text-white"
            v-close-popup
          />
          <qr-code-icon
            size="24"
            class="qr-icon cursor-pointer text-white"
            @click="showQrCode = !showQrCode"
          />
        </div>

        <!-- QR Code Section (toggleable) -->
        <transition-group
          appear
          enter-active-class="animated slideInDown"
          leave-active-class="animated slideOutUp"
          name="fade"
        >
          <div v-if="showQrCode" class="qr-code-section q-mb-md">
            <vue-qrcode
              :value="showMintInfoData.url"
              :options="{ width: 300 }"
              class="rounded-borders"
            />
          </div>
        </transition-group>

        <!-- Mint Header Profile Name Section -->
        <div class="mint-header-container q-mb-lg">
          <div class="mint-header q-pa-md q-py-lg">
            <q-avatar size="56px" class="mint-profile-icon q-mb-sm">
              <img
                v-if="showMintInfoData.info.icon_url"
                :src="showMintInfoData.info.icon_url"
                alt="Mint Profile"
              />
              <building-icon v-else size="36" />
            </q-avatar>
            <div class="mint-name q-mb-xs">
              {{ showMintInfoData.info.name || "Mint" }}
            </div>
            <div class="mint-balance" v-if="showMintInfoData.info.balance">
              {{ showMintInfoData.info.balance }}
            </div>
          </div>

          <div class="mint-descriptions q-mt-lg">
            <div
              class="mint-description"
              v-if="showMintInfoData.info.description"
            >
              {{ showMintInfoData.info.description }}
            </div>
            <div
              class="mint-description-long q-mt-md"
              v-if="showMintInfoData.info.description_long"
            >
              {{ showMintInfoData.info.description_long }}
            </div>
          </div>
        </div>

        <!-- Section Divider -->
        <div
          class="section-divider q-mb-md"
          v-if="showMintInfoData.info.contact?.length > 0"
        >
          <div class="divider-line"></div>
          <div class="divider-text">CONTACT</div>
          <div class="divider-line"></div>
        </div>

        <!-- Contact Info Section -->
        <div class="contact-section q-mb-lg">
          <div
            v-for="contactInfo in showMintInfoData.info.contact"
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
          <div class="divider-text">MINT DETAILS</div>
          <div class="divider-line"></div>
        </div>

        <!-- Mint Details Section -->
        <div class="mint-details-section q-mb-lg">
          <!-- URL -->
          <div class="detail-item q-mb-md">
            <div class="detail-label">
              <link-icon size="20" color="#9E9E9E" class="detail-icon" />
              <div class="detail-name">URL</div>
            </div>
            <div class="detail-value">{{ showMintInfoData.url }}</div>
          </div>

          <!-- Nuts -->
          <div class="detail-item q-mb-md" v-if="showMintInfoData.info.nuts">
            <div class="detail-label">
              <nut-icon size="20" color="#9E9E9E" class="detail-icon" />
              <div class="detail-name">Nuts</div>
            </div>
            <div class="detail-value">
              {{ Object.keys(showMintInfoData.info.nuts).join(", ") }}
            </div>
          </div>

          <!-- Currency (if available) -->
          <div
            class="detail-item q-mb-md"
            v-if="showMintInfoData.info.currencies"
          >
            <div class="detail-label">
              <currency-icon size="20" color="#9E9E9E" class="detail-icon" />
              <div class="detail-name">Currency</div>
            </div>
            <div class="detail-value">
              {{ showMintInfoData.info.currencies }}
            </div>
          </div>

          <!-- Version -->
          <div class="detail-item" v-if="showMintInfoData.info.version">
            <div class="detail-label">
              <info-icon size="20" color="#9E9E9E" class="detail-icon" />
              <div class="detail-name">Version</div>
            </div>
            <div class="detail-value">
              {{ showMintInfoData.info.version }}
            </div>
          </div>
        </div>

        <!-- Section Divider -->
        <div class="section-divider q-mb-md">
          <div class="divider-line"></div>
          <div class="divider-text">ACTIONS</div>
          <div class="divider-line"></div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons q-mt-lg q-mb-xl">
          <q-btn
            class="edit-mint-button"
            unelevated
            rounded
            @click="openEditMintDialog"
          >
            <edit-icon size="20" class="q-mr-sm" />
            <div class="action-label">EDIT MINT</div>
          </q-btn>

          <q-btn
            class="delete-mint-button"
            outline
            rounded
            @click="openRemoveMintDialog"
          >
            <trash-icon size="20" class="q-mr-sm" />
            <div class="action-label">DELETE MINT</div>
          </q-btn>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import { useMintsStore } from "src/stores/mints";
import EditMintDialog from "src/components/EditMintDialog.vue";
import RemoveMintDialog from "src/components/RemoveMintDialog.vue";
import {
  X as CloseIcon,
  QrCode as QrCodeIcon,
  Link as LinkIcon,
  Nut as NutIcon,
  DollarSign as CurrencyIcon,
  Info as InfoIcon,
  Mail as MailIcon,
  Copy as CopyIcon,
  Edit as EditIcon,
  Trash as TrashIcon,
  Building as BuildingIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "MintInfoDialog",
  components: {
    VueQrcode,
    CloseIcon,
    QrCodeIcon,
    LinkIcon,
    NutIcon,
    CurrencyIcon,
    InfoIcon,
    MailIcon,
    CopyIcon,
    EditIcon,
    TrashIcon,
    BuildingIcon,
    EditMintDialog,
    RemoveMintDialog,
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
    };
  },
  computed: {
    ...mapState(useMintsStore, ["showMintInfoData"]),
    ...mapWritableState(useMintsStore, [
      "showMintInfoDialog",
      "showEditMintDialog",
      "showRemoveMintDialog",
    ]),
  },
  methods: {
    ...mapActions(useMintsStore, ["removeMint"]),
    shortenText: function (text, maxLength) {
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
      }
      return text;
    },
    copyText(text) {
      navigator.clipboard.writeText(text);
      this.$q.notify({
        message: "Copied to clipboard",
        color: "positive",
        position: "top",
        timeout: 1000,
      });
    },
    openEditMintDialog() {
      this.mintToEdit = Object.assign({}, this.showMintInfoData);
      this.editMintData = Object.assign({}, this.showMintInfoData);
      this.showEditMintDialog = true;
    },
    openRemoveMintDialog() {
      this.mintToRemove = Object.assign({}, this.showMintInfoData);
      this.showRemoveMintDialog = true;
    },
  },
});
</script>

<style>
.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  z-index: 6000;
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
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

/* Mint Header */
.mint-header-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.mint-header {
  width: 100%;
  border-radius: 12px;
  background-color: #121212;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
.action-buttons {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
}

.edit-mint-button {
  flex: 1;
  background-color: white !important;
  color: black !important;
  height: 54px;
  font-weight: 600;
}

.delete-mint-button {
  flex: 1;
  border-color: #ff453a !important;
  color: #ff453a !important;
  height: 54px;
  font-weight: 600;
}

.action-label {
  font-size: 16px;
  letter-spacing: 0.5px;
}

.qr-code-section {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
