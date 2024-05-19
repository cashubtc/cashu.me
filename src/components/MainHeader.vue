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
      />
      <q-toolbar-title>
        <!-- <span><strong>Cashu.me</strong></span> -->
      </q-toolbar-title>
      <!-- offline badge if offline is true -->
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
      <q-badge color="yellow" text-color="black" class="q-mr-sm">
        <span v-if="!isStaging()">Beta</span>
        <span v-else>Staging – don't use with real funds!</span>
      </q-badge>
      <q-btn
        flat
        dense
        round
        size="sm"
        icon="refresh"
        aria-label="Refresh"
        @click="reload"
      />
      <!-- profile button -->
      <!-- <q-btn dense round flat color="primary" icon="account_circle"></q-btn> -->
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
    title: "Telegram",
    caption: "t.me/CashuMe",
    icon: "chat",
    link: "https://t.me/CashuMe",
  },
  {
    title: "Twitter",
    caption: "@CashuBTC",
    icon: "rss_feed",
    link: "https://twitter.com/CashuBTC",
  },
  {
    title: "Terms",
    caption: "Terms of service",
    icon: "info_i",
    link: "https://docs.cashu.space/contribute",
  },
  {
    title: "Donate",
    caption: "Support Cashu development",
    icon: "favorite",
    link: "https://docs.cashu.space/contribute",
  },
];

export default defineComponent({
  name: "MainHeader",
  mixins: [windowMixin],
  props: {},
  components: {
    EssentialLink,
  },
  setup() {
    const leftDrawerOpen = ref(false);
    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      isStaging() {
        return location.host.includes("staging");
      },
      reload() {
        location.reload();
      },
    };
  },
});
</script>
