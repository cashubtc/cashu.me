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
      <div class="mint-content-container">
        <!-- Top Icons -->
        <div class="top-icons">
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
          <q-responsive :ratio="1" class="q-mx-lg q-mt-none q-pt-none">
            <vue-qrcode
              :value="showMintInfoData.url"
              :options="{ width: 300 }"
              class="rounded-borders"
            >
            </vue-qrcode>
          </q-responsive>
        </div>

        <!-- Mint Header Profile Name Section -->
        <div class="mint-header-profile-name">
          <div class="mint-header">
            <q-avatar size="42px" class="mint-profile-icon">
              <q-icon name="account_balance" size="28px" />
            </q-avatar>
            <div class="mint-details">
              <div class="mint-name">
                {{ showMintInfoData.info.name || "Mint" }}
              </div>
              <div class="mint-balance" v-if="showMintInfoData.info.balance">
                {{ showMintInfoData.info.balance }}
              </div>
            </div>
          </div>

          <div class="mint-descriptions">
            <div
              class="mint-description"
              v-if="showMintInfoData.info.description"
            >
              {{ showMintInfoData.info.description }}
            </div>
            <div
              class="mint-description-long"
              v-if="showMintInfoData.info.description_long"
            >
              {{ showMintInfoData.info.description_long }}
            </div>
          </div>
        </div>

        <!-- Mint Contact Info Section -->
        <div class="mint-contact-info">
          <!-- Contact Section -->
          <div
            class="mint-contact-header-text"
            v-if="
              showMintInfoData.info.contact &&
              showMintInfoData.info.contact.length > 0
            "
          >
            <div class="mint-contact-header-text-child"></div>
            <div class="right-add-on">Contact</div>
            <div class="mint-contact-header-text-child"></div>
          </div>

          <div
            class="mint-contact-info-1"
            v-if="
              showMintInfoData.info.contact &&
              showMintInfoData.info.contact.length > 0
            "
          >
            <div
              v-for="contactInfo in showMintInfoData.info.contact"
              :key="contactInfo.method"
              class="contact-item"
            >
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
              <div class="mint-contact-text">{{ contactInfo.info }}</div>
              <q-icon
                name="content_copy"
                @click="copyText(contactInfo.info)"
                size="20px"
                class="copy-icon cursor-pointer"
              />
            </div>
          </div>

          <!-- Mint Details Section -->
          <div class="mint-contact-header-text">
            <div class="mint-contact-header-text-child"></div>
            <div class="right-add-on">Mint details</div>
            <div class="mint-contact-header-text-child"></div>
          </div>

          <div class="mint-details-info">
            <!-- URL -->
            <div class="mint-url">
              <div class="detail-label">
                <q-icon name="link" size="20px" class="detail-icon" />
                <div class="currency-copy">URL</div>
              </div>
              <div class="right-add-on-wrapper">
                <div class="mint-detail-value">{{ showMintInfoData.url }}</div>
              </div>
            </div>

            <!-- Nuts -->
            <div class="mint-url" v-if="showMintInfoData.info.nuts">
              <div class="detail-label">
                <q-icon name="settings" size="20px" class="detail-icon" />
                <div class="currency-copy">Nuts</div>
              </div>
              <div class="right-add-on-wrapper">
                <div class="mint-detail-value">
                  {{ Object.keys(showMintInfoData.info.nuts).join(", ") }}
                </div>
              </div>
            </div>

            <!-- Currency (if available) -->
            <div class="mint-url" v-if="showMintInfoData.info.currencies">
              <div class="detail-label">
                <q-icon name="attach_money" size="20px" class="detail-icon" />
                <div class="currency-copy">Currency</div>
              </div>
              <div class="right-add-on-wrapper">
                <div class="mint-detail-value">
                  {{ showMintInfoData.info.currencies }}
                </div>
              </div>
            </div>

            <!-- Version -->
            <div class="mint-url" v-if="showMintInfoData.info.version">
              <div class="detail-label">
                <q-icon name="info" size="20px" class="detail-icon" />
                <div class="currency-copy">Version</div>
              </div>
              <div class="nutshell-version">
                {{ showMintInfoData.info.version }}
              </div>
            </div>
          </div>

          <!-- Actions Section -->
          <div class="mint-contact-header-text">
            <div class="mint-contact-header-text-child"></div>
            <div class="right-add-on">Actions</div>
            <div class="mint-contact-header-text-child"></div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <div class="edit-mint-button" @click="$emit('edit-mint')">
            <q-icon name="edit" size="20px" class="action-icon" />
            <div class="label">Edit mint</div>
          </div>
          <div class="delete-mint-button" @click="$emit('delete-mint')">
            <q-icon name="delete" size="20px" class="action-icon" />
            <div class="label">Delete mint</div>
          </div>
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
  padding: 16px;
  color: #fff;
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
  margin-bottom: 24px;
  padding-top: 16px;
}

.close-icon,
.qr-icon {
  width: 24px;
  height: 24px;
}

/* Mint Header Profile Name Section */
.mint-header-profile-name {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 32px;
  width: 100%;
  margin-bottom: 32px;
}

.mint-header {
  align-self: stretch;
  border-radius: 8px;
  background-color: #0f0f0f;
  border: 1px solid #181818;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  gap: 8px;
}

.mint-profile-icon {
  width: 42px;
  height: 42px;
  position: relative;
  object-fit: cover;
}

.mint-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.mint-name {
  position: relative;
  letter-spacing: -0.02em;
  line-height: 32px;
  font-weight: 600;
  font-size: 24px;
}

.mint-balance {
  position: relative;
  font-size: 20px;
  letter-spacing: -0.02em;
  line-height: 28px;
  font-weight: 600;
}

.mint-descriptions {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  font-size: 16px;
}

.mint-description {
  align-self: stretch;
  position: relative;
  line-height: 24px;
  font-weight: 600;
}

.mint-description-long {
  align-self: stretch;
  position: relative;
  font-size: 14px;
  line-height: 20px;
  color: #636366;
}

/* Mint Contact Info Section */
.mint-contact-info {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 32px;
  font-size: 16px;
  width: 100%;
}

.mint-contact-header-text {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  margin-bottom: 16px;
}

.mint-contact-header-text-child {
  flex: 1;
  position: relative;
  border-top: 0.5px solid #48484a;
  box-sizing: border-box;
  height: 0.5px;
}

.right-add-on {
  position: relative;
  line-height: 18px;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 14px;
  padding: 0 8px;
}

.mint-contact-info-1 {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 14px;
  width: 100%;
}

.contact-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
}

.contact-icon,
.nostr-icon,
.x-logo-icon {
  width: 20px;
  height: 20px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.x-logo-icon {
  width: 15.6px;
  height: 16px;
}

.mint-contact-text {
  position: relative;
  line-height: 24px;
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-icon {
  color: #636366;
}

/* Mint Details Info Section */
.mint-details-info {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  color: #636366;
  width: 100%;
}

.mint-url {
  align-self: stretch;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.detail-label {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.detail-icon {
  width: 20px;
  height: 20px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.currency-copy {
  position: relative;
  line-height: 24px;
  font-weight: 500;
}

.right-add-on-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  color: #fff;
}

.mint-detail-value {
  position: relative;
  line-height: 24px;
  font-weight: 600;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nutshell-version {
  position: relative;
  line-height: 24px;
  font-weight: 600;
  color: #fff;
}

/* Action Buttons */
.action-buttons {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  font-size: 17px;
  margin-top: 16px;
  margin-bottom: 32px;
}

.edit-mint-button {
  flex: 1;
  border-radius: 100px;
  background-color: #ededed;
  height: 54px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  gap: 8px;
  color: #000;
  cursor: pointer;
}

.delete-mint-button {
  flex: 1;
  border-radius: 100px;
  background-color: #000;
  border: 1px solid #ff453a;
  box-sizing: border-box;
  height: 54px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 16px;
  gap: 8px;
  color: #ff453a;
  cursor: pointer;
}

.label {
  position: relative;
  letter-spacing: -0.43px;
  line-height: 22px;
  text-transform: uppercase;
  font-weight: 600;
}

.qr-code-section {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 8px;
  margin-bottom: 16px;
}
</style>
