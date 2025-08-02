<script setup lang="ts">
import { ref } from "vue";

interface NavItem {
  label: string;
  fan: string;
  creator: string;
}

const viewMode = ref<"fan" | "creator">("fan");

const navItems: NavItem[] = [
  {
    label: "Settings",
    fan: "Customize the app to suit your needs.",
    creator: "Manage creator tools and preferences.",
  },
  {
    label: "Find Creators",
    fan: "Discover new creators to support.",
    creator: "Promote your profile to potential fans.",
  },
  {
    label: "Creator Hub",
    fan: "Explore tools designed for creators.",
    creator: "Access your creator dashboard and resources.",
  },
  {
    label: "My Profile",
    fan: "View and edit your personal information.",
    creator: "Manage your creator identity and bio.",
  },
  {
    label: "Buckets",
    fan: "Organize your funds into custom buckets.",
    creator: "Track income streams with bucketed funds.",
  },
  {
    label: "Subscriptions",
    fan: "Manage the creators you're subscribed to.",
    creator: "Control your subscriber tiers and benefits.",
  },
  {
    label: "Chats",
    fan: "Message creators directly.",
    creator: "Interact with your supporters.",
  },
  {
    label: "Terms",
    fan: "Review the platform's terms of service.",
    creator: "Review the platform's terms of service.",
  },
  {
    label: "About",
    fan: "Learn more about the project.",
    creator: "Learn more about the project.",
  },
  {
    label: "External links",
    fan: "Visit official resources and documentation.",
    creator: "Visit official resources and documentation.",
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

    <q-markup-table flat bordered class="about-table">
      <tbody>
        <tr v-for="item in navItems" :key="item.label">
          <td class="text-weight-medium">{{ item.label }}</td>
          <td>{{ item[viewMode] }}</td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<style scoped>
.about-container {
  max-width: 600px;
  margin: 0 auto;
}

.about-table td:first-child {
  width: 30%;
  white-space: nowrap;
}

.about-table td {
  vertical-align: top;
}
</style>
