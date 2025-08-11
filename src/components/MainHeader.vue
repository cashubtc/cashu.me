<template>
  <q-header class="bg-transparent z-10">
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
      <q-btn
        v-if="showBackButton"
        flat
        dense
        rounded
        icon="arrow_back_ios_new"
        :to="backRoute"
        color="primary"
        aria-label="Back"
        no-caps
        class="q-ml-sm"
      >
        <span class="q-mx-md text-weight-bold">
          {{ $t("FullscreenHeader.actions.back.label") }}
        </span>
      </q-btn>
      <q-toolbar-title></q-toolbar-title>
      <q-btn
        v-if="isMessengerPage"
        flat
        dense
        round
        icon="menu"
        color="primary"
        aria-label="Toggle Chat Menu"
        @click.stop="toggleMessengerDrawer"
        class="q-mr-sm"
      />
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
          <span>{{ $t("MainHeader.offline.warning.text") }}</span>
        </q-badge>
      </transition>
      <q-badge
        v-if="isStaging()"
        color="yellow"
        text-color="black"
        class="q-mr-sm"
      >
        <span>{{ $t("MainHeader.staging.warning.text") }}</span>
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
          {{ $t("MainHeader.reload.warning.text", { countdown }) }}
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
        @click.stop="reload"
        :loading="reloading"
        :disable="uiStore.globalMutexLock && countdown === 0"
      >
        <q-tooltip>{{ $t('MainHeader.reload.tooltip') }}</q-tooltip>
        <template v-slot:loading>
          <q-spinner size="xs" />
        </template>
      </q-btn>
      <q-btn
        flat
        dense
        round
        size="0.8em"
        :icon="darkIcon"
        color="primary"
        aria-label="Toggle Dark Mode"
        @click.stop="toggleDarkMode"
        class="q-ml-sm"
      />
    </q-toolbar>
  </q-header>

  <!-- Drawer positioned on the left for main navigation -->
  <q-drawer v-model="leftDrawerOpen" side="left" bordered>
    <q-list>
      <q-item-label header>{{
        $t("MainHeader.menu.settings.title")
      }}</q-item-label>
      <q-item clickable @click="gotoWallet">
        <q-item-section avatar>
          <q-icon name="account_balance_wallet" />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ $t("FullscreenHeader.actions.back.label") }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable to="/settings">
        <q-item-section avatar>
          <q-icon name="settings" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{
            $t("MainHeader.menu.settings.settings.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("MainHeader.menu.settings.settings.caption")
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable @click="gotoFindCreators">
        <q-item-section avatar>
          <q-icon name="img:icons/find-creators.svg" color="white" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{
            $t("MainHeader.menu.findCreators.findCreators.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("MainHeader.menu.findCreators.findCreators.caption")
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable @click="gotoCreatorHub">
        <q-item-section avatar>
          <q-icon name="img:icons/creator-hub.svg" color="white" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{
            $t("MainHeader.menu.creatorHub.creatorHub.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("MainHeader.menu.creatorHub.creatorHub.caption")
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable @click="gotoMyProfile">
        <q-item-section avatar>
          <q-icon name="person" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{
            $t("MainHeader.menu.myProfile.myProfile.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("MainHeader.menu.myProfile.myProfile.caption")
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable @click="gotoBuckets">
        <q-item-section avatar>
          <q-icon name="inventory_2" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{
            $t("MainHeader.menu.buckets.buckets.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("MainHeader.menu.buckets.buckets.caption")
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable @click="gotoSubscriptions">
        <q-item-section avatar>
          <q-icon name="auto_awesome_motion" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{
            $t("MainHeader.menu.subscriptions.subscriptions.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("MainHeader.menu.subscriptions.subscriptions.caption")
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable @click="gotoChats">
        <q-item-section avatar>
          <q-icon name="chat" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Chats</q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="needsNostrLogin" clickable @click="gotoNostrLogin">
        <q-item-section avatar>
          <q-icon name="vpn_key" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Setup Nostr Identity</q-item-label>
        </q-item-section>
      </q-item>
      <q-item-label header>{{
        $t("MainHeader.menu.terms.title")
      }}</q-item-label>
      <q-item clickable to="/terms">
        <q-item-section avatar>
          <q-icon name="gavel" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{
            $t("MainHeader.menu.terms.terms.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("MainHeader.menu.terms.terms.caption")
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item-label header>{{
        $t("MainHeader.menu.about.title")
      }}</q-item-label>
      <q-item clickable to="/about">
        <q-item-section avatar>
          <q-icon name="info" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{
            $t("MainHeader.menu.about.about.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("MainHeader.menu.about.about.caption")
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item-label header>{{
        $t("MainHeader.menu.links.title")
      }}</q-item-label>
      <EssentialLink
        v-for="link in essentialLinks"
        :key="link.title"
        v-bind="link"
      />
    </q-list>
  </q-drawer>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onUnmounted,
  getCurrentInstance,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import EssentialLink from "components/EssentialLink.vue";
import { useUiStore } from "src/stores/ui";
import { useNostrStore } from "src/stores/nostr";
import { useMessengerStore } from "src/stores/messenger";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "MainHeader",
  mixins: [windowMixin],
  components: {
    EssentialLink,
  },
  setup() {
    const vm = getCurrentInstance()?.proxy;
    const leftDrawerOpen = ref(false);
    const uiStore = useUiStore();
    const { t } = useI18n();
    const router = useRouter();
    const route = useRoute();
    const nostrStore = useNostrStore();
    const messenger = useMessengerStore();
    const $q = useQuasar();
    const toggleDarkMode = () => {
      console.log("toggleDarkMode", $q.dark.isActive);
      $q.dark.toggle();
      $q.localStorage.set("cashu.darkMode", $q.dark.isActive);
      vm?.notifySuccess(
        $q.dark.isActive ? "Dark mode enabled" : "Dark mode disabled"
      );
    };
    const darkIcon = computed(() =>
      $q.dark.isActive ? "wb_sunny" : "brightness_3"
    );
    const needsNostrLogin = computed(
      () => !nostrStore.privateKeySignerPrivateKey
    );
    const isMessengerPage = computed(() =>
      route.path.startsWith("/nostr-messenger")
    );
    const showBackButton = computed(() => isMessengerPage.value);
    const backRoute = computed(() => "/wallet");
    const countdown = ref(0);
    const reloading = ref(false);
    let countdownInterval;

    const essentialLinks = [
      {
        title: t("MainHeader.menu.links.fundstrCreator.title"),
        caption: t("MainHeader.menu.links.fundstrCreator.caption"),
        icon: "web",
        link: "https://primal.net/KalonAxiarch",
      },
      {
        title: t("MainHeader.menu.links.cashuSpace.title"),
        caption: t("MainHeader.menu.links.cashuSpace.caption"),
        icon: "web",
        link: "https://cashu.space",
      },
      {
        title: t("MainHeader.menu.links.github.title"),
        caption: t("MainHeader.menu.links.github.caption"),
        icon: "code",
        link: "https://github.com/cashubtc/cashu.me",
      },
      {
        title: t("MainHeader.menu.links.telegram.title"),
        caption: t("MainHeader.menu.links.telegram.caption"),
        icon: "chat",
        link: "https://t.me/CashuMe",
      },
      {
        title: t("MainHeader.menu.links.twitter.title"),
        caption: t("MainHeader.menu.links.twitter.caption"),
        icon: "rss_feed",
        link: "https://twitter.com/CashuBTC",
      },
      {
        title: t("MainHeader.menu.links.donate.title"),
        caption: t("MainHeader.menu.links.donate.caption"),
        icon: "favorite",
        link: "https://docs.cashu.space/contribute",
      },
    ];

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    onMounted(() => {
      window.addEventListener("toggle-left-drawer", toggleLeftDrawer);
    });

    onUnmounted(() => {
      window.removeEventListener("toggle-left-drawer", toggleLeftDrawer);
    });

    const toggleMessengerDrawer = () => {
      console.log("toggleMessengerDrawer", messenger.drawerOpen);
      messenger.toggleDrawer();
      vm?.notify(
        messenger.drawerOpen ? "Messenger closed" : "Messenger opened"
      );
    };

    const isStaging = () => {
      return location.host.includes("staging");
    };

    const reload = () => {
      console.log(
        "reload",
        "countdown:",
        countdown.value,
        "mutex:",
        uiStore.globalMutexLock
      );
      if (countdown.value > 0) {
        try {
          clearInterval(countdownInterval);
          countdown.value = 0;
          reloading.value = false;
          vm?.notifyWarning("Reload cancelled");
        } finally {
          uiStore.unlockMutex();
        }
        return;
      }
      if (uiStore.globalMutexLock) return;
      uiStore.lockMutex();
      reloading.value = true;
      countdown.value = 3;
      vm?.notify("Reloading in 3 seconds…");
      countdownInterval = setInterval(() => {
        countdown.value--;
        if (countdown.value === 0) {
          clearInterval(countdownInterval);
          vm?.notifyRefreshed("Reloading…");
          try {
            location.reload();
          } finally {
            uiStore.unlockMutex();
          }
        }
      }, 1000);
    };

    const gotoBuckets = () => {
      router.push("/buckets");
      leftDrawerOpen.value = false;
    };

    const gotoFindCreators = () => {
      router.push("/find-creators");
      leftDrawerOpen.value = false;
    };

    const gotoCreatorHub = () => {
      router.push("/creator-hub");
      leftDrawerOpen.value = false;
    };

    const gotoMyProfile = () => {
      router.push("/my-profile");
      leftDrawerOpen.value = false;
    };

    const gotoSubscriptions = () => {
      router.push("/subscriptions");
      leftDrawerOpen.value = false;
    };

    const gotoChats = () => {
      router.push("/nostr-messenger");
      leftDrawerOpen.value = false;
    };

    const gotoNostrLogin = () => {
      router.push("/nostr-login");
      leftDrawerOpen.value = false;
    };

    const gotoWallet = () => {
      router.push("/wallet");
      leftDrawerOpen.value = false;
    };

    return {
      essentialLinks,
      leftDrawerOpen,
      toggleLeftDrawer,
      isStaging,
      reload,
      countdown,
      reloading,
      uiStore,
      gotoBuckets,
      gotoFindCreators,
      gotoCreatorHub,
      gotoMyProfile,
      gotoSubscriptions,
      gotoChats,
      gotoNostrLogin,
      gotoWallet,
      showBackButton,
      backRoute,
      needsNostrLogin,
      toggleMessengerDrawer,
      isMessengerPage,
      toggleDarkMode,
      darkIcon,
    };
  },
});
</script>
<style scoped>
.q-header {
  position: sticky; /* or fixed */
  top: 0;
  z-index: 1000; /* ensures header stays above page content */
  overflow-x: hidden;
}

.q-toolbar {
  flex-wrap: nowrap;
  min-height: 50px; /* Ensure consistent height */
}

.q-toolbar-title {
  flex: 0 1 auto; /* Allow title to shrink */
}

/* Make badges container handle overflow properly */
.q-toolbar > .q-badge {
  flex-shrink: 0;
}
</style>
