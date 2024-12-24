<template>
  <q-header class="bg-marginal-bg">
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        icon="menu"
        color="primary"
        aria-label="Menu"
        @click="toggleLeftDrawer"
        :disable="uiStore.globalMutexLock"
      />
      <q-toolbar-title></q-toolbar-title>
      <transition
        appear
        enter-active-class="animated wobble"
        leave-active-class="animated fadeOut"
      >
        <q-badge
          v-if="g.offline"
          color="red"
          text-color="black"
          class="q-mr-sm"
        >
          <span>Offline</span>
        </q-badge>
      </transition>
      <q-badge
        v-if="isStaging()"
        color="yellow"
        text-color="black"
        class="q-mr-sm"
      >
        <span>Staging – don't use with real funds!</span>
      </q-badge>
      <!-- <q-badge color="yellow" text-color="black" class="q-mr-sm">
        <span v-if="!isStaging()">Beta</span>
        <span v-else>Staging – don't use with real funds!</span>
      </q-badge> -->
      <transition-group appear enter-active-class="animated pulse">
        <q-badge
          v-if="countdown > 0"
          color="negative"
          text-color="white"
          class="q-mr-sm"
          @click="reload"
        >
          Reload in {{ countdown }}
          <q-spinner
            v-if="countdown > 0"
            size="0.8em"
            :thickness="10"
            class="q-ml-sm"
            color="white"
          />
        </q-badge>
      </transition-group>
      <q-btn
        flat
        dense
        round
        size="0.8em"
        :icon="countdown > 0 ? 'close' : 'refresh'"
        :color="countdown > 0 ? 'negative' : 'primary'"
        aria-label="Refresh"
        @click="reload"
        :disable="uiStore.globalMutexLock && countdown === 0"
      >
      </q-btn>
    </q-toolbar>
  </q-header>

  <q-drawer v-model="leftDrawerOpen" bordered>
    <q-list>
      <q-item-label header>Settings </q-item-label>
      <q-item clickable to="/settings">
        <q-item-section avatar>
          <q-icon name="settings" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Settings</q-item-label>
          <q-item-label caption>Wallet configuration</q-item-label>
        </q-item-section>
      </q-item>
      <q-item-label header>Terms </q-item-label>
      <q-item clickable to="/terms">
        <q-item-section avatar>
          <q-icon name="gavel" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Terms</q-item-label>
          <q-item-label caption>Terms of Service</q-item-label>
        </q-item-section>
      </q-item>
      <q-item-label header>Links </q-item-label>
      <EssentialLink
        v-for="link in essentialLinks"
        :key="link.title"
        v-bind="link"
      />
    </q-list>
  </q-drawer>
</template>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import { useUiStore } from "src/stores/ui";

const linksList = [
  {
    title: "Cashu.space",
    caption: "cashu.space",
    icon: "web",
    link: "https://cashu.space",
  },
  {
    title: "Github",
    caption: "github.com/cashubtc",
    icon: "code",
    link: "https://github.com/cashubtc/cashu.me",
  },
  {
    title: "Matrix",
    caption: "#cashu-me:matrix.cashu.space",
    icon: "chat",
    link: "https://matrix.to/#/#cashu-me:matrix.cashu.space",
  },
  {
    title: "Twitter",
    caption: "@CashuBTC",
    icon: "rss_feed",
    link: "https://twitter.com/CashuBTC",
  },
  {
    title: "Donate",
    caption: "Support Cashu",
    icon: "favorite",
    link: "https://docs.cashu.space/contribute",
  },
];

export default defineComponent({
  name: "MainHeader",
  mixins: [windowMixin],
  components: {
    EssentialLink,
  },
  setup() {
    const leftDrawerOpen = ref(false);
    const uiStore = useUiStore();
    const countdown = ref(0);
    let countdownInterval;

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    const isStaging = () => {
      return location.host.includes("staging");
    };

    const reload = () => {
      if (countdown.value > 0) {
        uiStore.unlockMutex();
        clearInterval(countdownInterval);
        countdown.value = 0;
        return;
      }
      if (uiStore.globalMutexLock) return;
      uiStore.lockMutex();
      countdown.value = 3;
      countdownInterval = setInterval(() => {
        countdown.value--;
        if (countdown.value === 0) {
          clearInterval(countdownInterval);
          uiStore.unlockMutex();
          location.reload();
        }
      }, 1000);
    };

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer,
      isStaging,
      reload,
      countdown,
      uiStore,
    };
  },
});
</script>
