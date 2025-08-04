<script setup lang="ts">
import { ref } from "vue";
import NavCard from "components/NavCard.vue";

interface NavItem {
  icon: string;
  label: string;
  fan: string;
  creator: string;
  to?: string;
  href?: string;
}

const viewMode = ref<"fan" | "creator">("fan");

const navItems: NavItem[] = [
  {
    icon: "settings",
    label: "Settings",
    fan: "Customize the app to suit your needs.",
    creator: "Manage creator tools and preferences.",
    to: "/settings",
  },
  {
    icon: "search",
    label: "Find Creators",
    fan: "Discover new creators to support.",
    creator: "Promote your profile to potential fans.",
    to: "/find-creators",
  },
  {
    icon: "dashboard",
    label: "Creator Hub",
    fan: "Explore tools designed for creators.",
    creator: "Access your creator dashboard and resources.",
    to: "/creator-hub",
  },
  {
    icon: "person",
    label: "My Profile",
    fan: "View and edit your personal information.",
    creator: "Manage your creator identity and bio.",
    to: "/profile",
  },
  {
    icon: "inbox",
    label: "Buckets",
    fan: "Organize your funds into custom buckets.",
    creator: "Track income streams with bucketed funds.",
    to: "/buckets",
  },
  {
    icon: "subscriptions",
    label: "Subscriptions",
    fan: "Manage the creators you're subscribed to.",
    creator: "Control your subscriber tiers and benefits.",
    to: "/subscriptions",
  },
  {
    icon: "chat",
    label: "Chats",
    fan: "Message creators directly.",
    creator: "Interact with your supporters.",
    to: "/chats",
  },
  {
    icon: "gavel",
    label: "Terms",
    fan: "Review the platform's terms of service.",
    creator: "Review the platform's terms of service.",
    to: "/terms",
  },
  {
    icon: "info",
    label: "About",
    fan: "Learn more about the project.",
    creator: "Learn more about the project.",
    to: "/about",
  },
  {
    icon: "link",
    label: "External links",
    fan: "Visit official resources and documentation.",
    creator: "Visit official resources and documentation.",
    href: "https://cashu.space",
  },
];

const toggleOptions = [
  { label: "Fan", value: "fan" },
  { label: "Creator", value: "creator" },
];

defineExpose({ viewMode });
</script>

<template>
  <div class="about-container q-pa-md">
    <div class="flex justify-center q-mb-md">
      <q-btn-toggle
        v-model="viewMode"
        :options="toggleOptions"
        color="primary"
        toggle-color="primary"
        text-color="white"
        dense
        class="about-toggle"
      />
    </div>

    <div class="row q-col-gutter-md about-grid">
      <div
        v-for="item in navItems"
        :key="item.label"
        class="col-12 col-sm-6 col-md-4"
      >
        <NavCard v-bind="item" :view-mode="viewMode" />
      </div>
    </div>
  </div>
</template>

<style scoped>

.about-container {
  max-width: 900px;
  margin: 0 auto;
}

.about-grid {
  max-width: 900px;
  margin: 0 auto;
}
</style>
