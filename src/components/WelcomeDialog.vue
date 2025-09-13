<template>
  <q-dialog
    class="z-top"
    persistent
    position="top"
    @drop="dragFile"
    @dragover="allowDrop"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="q-pa-lg z-top">
      <q-toolbar>
        <!-- <q-avatar>
          <img
            src="https://raw.githubusercontent.com/cashubtc/cashu-ui/main/ui/icons/circle/128x128.png"
          />
        </q-avatar> -->
        <q-toolbar-title
          ><span class="text-weight-bold">Cashu</span> ecash
          wallet</q-toolbar-title
        >
      </q-toolbar>
      <q-card-section>
        <p>Please take a moment to read the following information.</p>
        <p>
          <strong>Install and add to home screen.</strong>
          For the best experience, use this wallet with your device's native web
          browser (Safari on iOS, Chrome on Android). In Chrome click the
          hamburger menu at the upper right. In Safari click the share button
          and press the Add to Home screen button.
        </p>
        <p>
          <strong>Back up your seed phrase.</strong> This wallet stores ecash
          tokens in its database. If you delete your browser data without
          backing up, you will lose your tokens. Make sure to back up your
          wallet seed phrase in the settings.
        </p>
        <p>
          <strong>This software is in BETA!</strong> We hold no responsibility
          for people losing access to funds. Use at your own risk! This wallet
          is not affiliated with any mint. This code is open-source and licensed
          under the MIT license.
        </p>
        <!-- wallet backup restore -->
        <input
          type="file"
          id="fileUpload"
          ref="fileUpload"
          v-on:change="onChangeFileUpload()"
        />

        <div class="row q-mt-lg">
          <q-btn
            outline
            class="q-mx-sm"
            v-if="
              getPwaDisplayMode() == 'browser' &&
              deferredPWAInstallPrompt != null
            "
            color="primary"
            @click="triggerPwaInstall()"
            >Install Cashu</q-btn
          >
          <q-btn
            flat
            size="0.6rem"
            class="q-mx-xs q-px-none"
            @click="copyText(baseURL)"
            >Copy URL</q-btn
          >
          <q-btn
            flat
            size="0.6rem"
            class="q-mx-xs q-px-none"
            color="warning"
            icon="upload_for_offline"
            @click="browseBackupFile"
            >Restore<q-tooltip
              >You can drag &amp; drop the wallet backup here!</q-tooltip
            ></q-btn
          >
          <q-btn
            v-close-popup
            outline
            size="0.8rem"
            class="q-ml-auto"
            @click="setWelcomeDialogSeen()"
            >Continue</q-btn
          >
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<style scoped>
#fileUpload {
  display: none;
}
</style>
<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { useWalletStore } from "src/stores/wallet";
import { useStorageStore } from "src/stores/storage";

export default defineComponent({
  name: "WelcomeDialog",
  mixins: [windowMixin],
  props: {
    welcomeDialog: Object,
    triggerPwaInstall: Function,
    setTab: Function,
    getPwaDisplayMode: Function,
    setWelcomeDialogSeen: Function,
  },
  data: function () {
    return {};
  },
  watch: {},
  computed: {
    ...mapState(useWalletStore, ["mnemonic"]),
  },
  methods: {
    ...mapActions(useStorageStore, ["restoreFromBackup"]),
    readFile(file) {
      let reader = new FileReader();
      reader.onload = (f) => {
        let content = f.target.result;
        let backup = JSON.parse(content);

        this.restoreFromBackup(backup);
      };
      reader.readAsText(file);
    },
    dragFile(ev) {
      ev.preventDefault();

      let files = ev.dataTransfer.files;
      let file = files[0];

      this.readFile(file);
    },
    allowDrop(ev) {
      ev.preventDefault();
    },
    onChangeFileUpload() {
      let file = this.$refs.fileUpload.files[0];

      this.readFile(file);
    },
    browseBackupFile() {
      this.$refs.fileUpload.click();
    },
  },
});
</script>
