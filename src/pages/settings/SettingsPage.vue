<template>
  <SettingsPageShell :title="$t('Settings.menu.title')">
    <q-list
      v-for="group in visibleGroups"
      :key="group.name"
      class="settings-menu-group q-mb-md"
    >
      <q-item
        v-for="entry in group.entries"
        :key="entry.path"
        clickable
        v-ripple
        :to="entry.path"
        class="settings-menu-item"
      >
        <q-item-section avatar>
          <div class="settings-menu-icon">
            <component :is="entry.icon" :size="20" />
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t(`Settings.menu.${entry.key}.title`)
          }}</q-item-label>
          <q-item-label caption>{{
            $t(`Settings.menu.${entry.key}.caption`)
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <ChevronRightIcon :size="18" class="settings-menu-chevron" />
        </q-item-section>
      </q-item>
    </q-list>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent, markRaw } from "vue";
import { mapState } from "pinia";
import { useUiStore } from "src/stores/ui";
import SettingsPageShell from "./SettingsPageShell.vue";
import {
  Vault as VaultIcon,
  AtSign as AtSignIcon,
  KeyRound as KeyRoundIcon,
  Inbox as InboxIcon,
  Cable as CableIcon,
  Nfc as NfcIcon,
  Lock as LockIcon,
  Shield as ShieldIcon,
  FlaskConical as FlaskConicalIcon,
  Palette as PaletteIcon,
  Globe as GlobeIcon,
  Terminal as TerminalIcon,
  Info as InfoIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "SettingsMenuPage",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    ChevronRightIcon,
  },
  computed: {
    ...mapState(useUiStore, ["ndefSupported"]),
    visibleGroups() {
      const groups = [
        {
          name: "wallet",
          entries: [
            {
              key: "backup",
              path: "/settings/backup",
              icon: markRaw(VaultIcon),
            },
            {
              key: "lightning_address",
              path: "/settings/lightning-address",
              icon: markRaw(AtSignIcon),
            },
            {
              key: "nostr",
              path: "/settings/nostr",
              icon: markRaw(KeyRoundIcon),
            },
          ],
        },
        {
          name: "connections",
          entries: [
            {
              key: "payment_requests",
              path: "/settings/payment-requests",
              icon: markRaw(InboxIcon),
            },
            {
              key: "nwc",
              path: "/settings/nwc",
              icon: markRaw(CableIcon),
            },
            {
              key: "p2pk",
              path: "/settings/p2pk",
              icon: markRaw(LockIcon),
            },
            ...(this.ndefSupported
              ? [
                  {
                    key: "hardware",
                    path: "/settings/hardware",
                    icon: markRaw(NfcIcon),
                  },
                ]
              : []),
          ],
        },
        {
          name: "preferences",
          entries: [
            {
              key: "appearance",
              path: "/settings/appearance",
              icon: markRaw(PaletteIcon),
            },
            {
              key: "language",
              path: "/settings/language",
              icon: markRaw(GlobeIcon),
            },
            {
              key: "privacy",
              path: "/settings/privacy",
              icon: markRaw(ShieldIcon),
            },
          ],
        },
        {
          name: "advanced",
          entries: [
            {
              key: "experimental",
              path: "/settings/experimental",
              icon: markRaw(FlaskConicalIcon),
            },
            {
              key: "advanced",
              path: "/settings/advanced",
              icon: markRaw(TerminalIcon),
            },
          ],
        },
        {
          name: "about",
          entries: [
            {
              key: "about",
              path: "/settings/about",
              icon: markRaw(InfoIcon),
            },
          ],
        },
      ];
      return groups.filter((group) => group.entries.length > 0);
    },
  },
});
</script>
