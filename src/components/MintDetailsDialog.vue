<template>
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
          <q-icon
            name="close"
            size="24px"
            class="close-icon cursor-pointer text-white"
            v-close-popup
          />
          <q-icon
            name="qr_code"
            size="24px"
            class="qr-icon cursor-pointer text-white"
            @click="showQrCode = !showQrCode"
          />
        </div>

        <!-- QR Code Section (toggleable) -->
        <div v-if="showQrCode" class="qr-code-section q-mb-md">
          <vue-qrcode
            :value="showMintInfoData.url"
            :options="{ width: 300 }"
            class="rounded-borders"
          />
        </div>

        <!-- Mint Header Profile Name Section -->
        <div class="mint-header-container q-mb-lg">
          <div class="mint-header q-pa-md q-py-lg">
            <q-avatar size="56px" class="mint-profile-icon q-mb-sm">
              <img
                v-if="showMintInfoData.info.profileUrl"
                :src="showMintInfoData.info.profileUrl"
                alt="Mint Profile"
              />
              <q-icon v-else name="account_balance" size="36px" />
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
        <div class="section-divider q-mb-md">
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
              <q-icon
                v-if="contactIcons[contactInfo.method]"
                :name="contactIcons[contactInfo.method]"
                size="20px"
                class="contact-icon"
              />
              <img
                v-else-if="contactInfo.method === 'nostr'"
                src="nostr-icon.svg"
                class="nostr-icon"
                alt=""
              />
              <img
                v-else-if="contactInfo.method === 'twitter'"
                src="x logo.svg"
                class="x-logo-icon"
                alt=""
              />
            </div>
            <div class="contact-text">{{ contactInfo.info }}</div>
            <q-icon
              name="content_copy"
              @click="copyText(contactInfo.info)"
              size="20px"
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
              <q-icon name="link" size="20px" class="detail-icon" />
              <div class="detail-name">URL</div>
            </div>
            <div class="detail-value">{{ showMintInfoData.url }}</div>
          </div>

          <!-- Nuts -->
          <div class="detail-item q-mb-md" v-if="showMintInfoData.info.nuts">
            <div class="detail-label">
              <q-icon name="settings" size="20px" class="detail-icon" />
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
              <q-icon name="attach_money" size="20px" class="detail-icon" />
              <div class="detail-name">Currency</div>
            </div>
            <div class="detail-value">
              {{ showMintInfoData.info.currencies }}
            </div>
          </div>

          <!-- Version -->
          <div class="detail-item" v-if="showMintInfoData.info.version">
            <div class="detail-label">
              <q-icon name="info" size="20px" class="detail-icon" />
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
            @click="$emit('edit-mint')"
          >
            <q-icon name="edit" size="20px" class="q-mr-sm" />
            <div class="action-label">EDIT MINT</div>
          </q-btn>

          <q-btn
            class="delete-mint-button"
            outline
            rounded
            @click="$emit('delete-mint')"
          >
            <q-icon name="delete" size="20px" class="q-mr-sm" />
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

export default defineComponent({
  name: "MintInfoDialog",
  components: {
    VueQrcode,
  },
  data: function () {
    return {
      contactIcons: {
        email: "mail_outline",
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
    ...mapWritableState(useMintsStore, ["showMintInfoDialog"]),
  },
  methods: {
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
  max-width: 400px;
  margin: 0 auto;
  color: white;
  font-family: Inter, sans-serif;
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

.mint-profile-icon {
  /* Removed gradient background */
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
  font-size: 14px;
  line-height: 20px;
  color: #9e9e9e;
  width: 100%;
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
  color: white;
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

.contact-text {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-icon {
  color: #9e9e9e;
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
  color: #9e9e9e;
  margin-right: 10px;
}

.detail-name {
  font-size: 16px;
  font-weight: 500;
  color: #9e9e9e;
}

.detail-value {
  font-size: 16px;
  font-weight: 500;
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
