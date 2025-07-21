<template>
  <q-drawer
    v-model="opened"
    show-if-above
    bordered
    :mini="mini"
    class="app-sidebar"
  >
    <q-scroll-area class="fit q-pa-sm">
      <q-list>
        <q-item-label class="section-header" caption>Navigation</q-item-label>
        <q-item v-for="link in navLinks" :key="link.to" clickable :to="link.to">
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.label }}</q-item-section>
        </q-item>
        <q-separator class="q-my-sm" />
        <q-item-label class="section-header" caption>Account</q-item-label>
        <q-item
          v-for="link in accountLinks"
          :key="link.to"
          clickable
          :to="link.to"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.label }}</q-item-section>
        </q-item>
        <q-separator class="q-my-sm" />
        <q-item-label class="section-header" caption>Docs</q-item-label>
        <q-item v-for="link in docLinks" :key="link.to" clickable :to="link.to">
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<script setup lang="ts">
import { ref } from "vue";

const opened = ref(true);
const mini = ref(false);

const navLinks = [
  { to: "/wallet", label: "Wallet", icon: "account_balance_wallet" },
  { to: "/find-creators", label: "Find Creators", icon: "search" },
  { to: "/nostr-messenger", label: "Chats", icon: "chat" },
];

const accountLinks = [
  { to: "/my-profile", label: "Profile", icon: "person" },
  { to: "/subscriptions", label: "Subscriptions", icon: "auto_awesome_motion" },
];

const docLinks = [
  { to: "/terms", label: "Terms", icon: "gavel" },
  { to: "/about", label: "About", icon: "info" },
];
</script>

<style scoped lang="scss">
.app-sidebar {
  transition: width 0.2s ease;
  padding: $spacing-base;
}
.section-header {
  font-size: $caption-size;
  padding: $spacing-base 0;
}
</style>
