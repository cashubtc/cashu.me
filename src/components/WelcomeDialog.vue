<template>
  <q-dialog
    class="z-top"
    persistent
    v-model="showWelcomeDialog"
    position="top"
    @drop="dragFile"
    @dragover="allowDrop"
  >
    <q-card class="q-pa-lg z-top">
      <q-toolbar>
        <q-avatar>
          <img
            src="https://raw.githubusercontent.com/cashubtc/cashu-ui/main/ui/icons/circle/128x128.png"
          />
        </q-avatar>
        <q-toolbar-title
          ><span class="text-weight-bold">Cashu.me</span>
          wallet</q-toolbar-title
        >
      </q-toolbar>
      <q-card-section>
        <p>Please take a moment to read the following information.</p>

        <p>
          <strong>Open this wallet on your device's native browser</strong>
          Cashu stores your ecash on your device locally. For the best
          experience, use this wallet with your device's native web browser (for
          example Safari for iOS, Chrome for Android).
        </p>
        <p>
          <strong>Add to home screen.</strong>
          Add Cashu to your home screen as a progressive web app (PWA). On
          Android Chrome, click the hamburger menu at the upper right. On iOS
          Safari, click the share button. Now press the Add to Home screen
          button.
        </p>
        <p>
          <strong>This software is in BETA!</strong> We hold no responsibility
          for people losing access to funds. Use at your own risk! Ecash is a
          bearer asset, meaning losing access to this wallet will mean you will
          lose the funds. This wallet stores ecash tokens in its database. If
          you lose the link or delete your your data without backing up, you
          will lose your tokens. Press the Backup button to download a copy of
          your tokens.
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
            color="grey"
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
            color="primary"
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
<script>
import { defineComponent } from "vue";
import { mapActions } from "pinia";
import { useMintsStore } from "stores/mints";

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
    return {
      showWelcomeDialog:
        localStorage.getItem("cashu.welcomeDialogSeen") != "seen",
    };
  },
  watch: {},
  computed: {},
  methods: {
    ...mapActions(useMintsStore, ["restoreFromBackup"]),
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
