<template>
  <q-dialog class="z-top" persistent v-model="showWelcomeDialog" position="top">
    <q-card class="q-pa-lg z-top">
      <q-toolbar>
        <q-avatar>
          <img
            src="https://raw.githubusercontent.com/cashubtc/cashu-ui/main/ui/icons/circle/128x128.png"
          />
        </q-avatar>
        <q-toolbar-title
          ><span class="text-weight-bold">Cashu</span> wallet</q-toolbar-title
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
          <q-btn outline color="grey" class="q-mx-sm" @click="copyText(baseURL)"
            >Copy URL</q-btn
          >
          <q-btn
            v-close-popup
            flat
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
<script>
import { defineComponent } from "vue";

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
  methods: {},
});
</script>
