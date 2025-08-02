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
    label: "Wallet",
    fan: "View your balance and recent activity.",
    creator: "Track incoming support and withdraw funds.",
  },
  {
    label: "Send",
    fan: "Tip your favorite creators or friends.",
    creator: "Pay collaborators or move funds.",
  },
  {
    label: "Receive",
    fan: "Collect ecash or lightning payments.",
    creator: "Let fans support you directly.",
  },
  {
    label: "Settings",
    fan: "Customize the app to suit your needs.",
    creator: "Manage creator tools and preferences.",
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
