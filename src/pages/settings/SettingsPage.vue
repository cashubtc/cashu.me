<template>
  <SettingsPageShell :title="$t('Settings.menu.title')">
    <template v-for="group in visibleGroups" :key="group.name">
      <!-- Every group is named (council R75); the last gathers the rest. -->
      <SectionDivider :label="$t(`Settings.menu.groups.${group.name}`)" />
      <q-list class="settings-menu-group q-mb-lg">
        <SettingsLinkRow
          v-for="entry in group.entries"
          :key="entry.path"
          :to="entry.path"
          :icon="entry.icon"
          :label="$t(`Settings.menu.${entry.key}.title`)"
          :caption="$t(`Settings.menu.${entry.key}.caption`)"
          :value="entry.key === 'language' ? languageLabel($i18n.locale) : ''"
        />
      </q-list>
    </template>
  </SettingsPageShell>
</template>

<script lang="ts">
import SectionDivider from "src/components/ui/SectionDivider.vue";
import { languageLabel } from "src/js/languages";
import { defineComponent, markRaw } from "vue";
import { mapState } from "pinia";
import { useUiStore } from "src/stores/ui";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsLinkRow from "src/components/ui/SettingsLinkRow.vue";
import {
  ArchiveRestore as ArchiveRestoreIcon,
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
} from "lucide-vue-next";

export default defineComponent({
  name: "SettingsMenuPage",
  mixins: [windowMixin],
  components: {
    SectionDivider,
    SettingsPageShell,
    SettingsLinkRow,
  },
  methods: { languageLabel },
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
              icon: markRaw(ArchiveRestoreIcon),
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
          name: "more",
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
