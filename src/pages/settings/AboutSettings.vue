<template>
  <SettingsPageShell
    :title="$t('Settings.menu.about.title')"
    :caption="$t('Settings.menu.about.caption')"
  >
    <!-- Terms first, then the project links, in one group. -->
    <q-list class="settings-menu-group">
      <SettingsLinkRow
        to="/terms"
        :icon="scaleIcon"
        :label="$t('MainHeader.menu.terms.terms.title')"
        :caption="$t('MainHeader.menu.terms.terms.caption')"
      />
      <SettingsLinkRow
        v-for="link in links"
        :key="link.link"
        tag="a"
        target="_blank"
        :href="link.link"
        :icon="link.icon"
        :label="link.title"
        external
      >
        <template #caption
          ><bdi>{{ link.caption }}</bdi></template
        >
      </SettingsLinkRow>
    </q-list>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent, markRaw } from "vue";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsLinkRow from "src/components/ui/SettingsLinkRow.vue";
import {
  Scale as ScaleIcon,
  Globe as GlobeIcon,
  Code as CodeIcon,
  MessageCircle as MessageCircleIcon,
  AtSign as AtSignIcon,
  Heart as HeartIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "AboutSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    SettingsLinkRow,
  },
  data: function () {
    return {
      scaleIcon: markRaw(ScaleIcon),
    };
  },
  computed: {
    links() {
      return [
        {
          title: this.$t("MainHeader.menu.links.cashuSpace.title"),
          caption: this.$t("MainHeader.menu.links.cashuSpace.caption"),
          icon: markRaw(GlobeIcon),
          link: "https://cashu.space",
        },
        {
          title: this.$t("MainHeader.menu.links.github.title"),
          caption: this.$t("MainHeader.menu.links.github.caption"),
          icon: markRaw(CodeIcon),
          link: "https://github.com/cashubtc/cashu.me",
        },
        {
          title: this.$t("MainHeader.menu.links.telegram.title"),
          caption: this.$t("MainHeader.menu.links.telegram.caption"),
          icon: markRaw(MessageCircleIcon),
          link: "https://t.me/CashuMe",
        },
        {
          title: this.$t("MainHeader.menu.links.twitter.title"),
          caption: this.$t("MainHeader.menu.links.twitter.caption"),
          icon: markRaw(AtSignIcon),
          link: "https://twitter.com/CashuBTC",
        },
        {
          title: this.$t("MainHeader.menu.links.donate.title"),
          caption: this.$t("MainHeader.menu.links.donate.caption"),
          icon: markRaw(HeartIcon),
          link: "https://docs.cashu.space/contribute",
        },
      ];
    },
  },
});
</script>
