<template>
  <SettingsPageShell
    :title="$t('Settings.menu.about.title')"
    :caption="$t('Settings.menu.about.caption')"
  >
    <!-- terms -->
    <q-list class="settings-menu-group q-mb-md">
      <q-item clickable v-ripple to="/terms" class="settings-menu-item">
        <q-item-section avatar>
          <div class="settings-menu-icon">
            <ScaleIcon :size="20" />
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            $t("MainHeader.menu.terms.terms.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("MainHeader.menu.terms.terms.caption")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <ChevronRightIcon :size="18" class="settings-menu-chevron" />
        </q-item-section>
      </q-item>
    </q-list>

    <!-- links -->
    <q-list class="settings-menu-group">
      <q-item
        v-for="link in links"
        :key="link.link"
        clickable
        v-ripple
        tag="a"
        target="_blank"
        :href="link.link"
        class="settings-menu-item"
      >
        <q-item-section avatar>
          <div class="settings-menu-icon">
            <component :is="link.icon" :size="20" />
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            link.title
          }}</q-item-label>
          <q-item-label caption>{{ link.caption }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <ExternalLinkIcon :size="18" class="settings-menu-chevron" />
        </q-item-section>
      </q-item>
    </q-list>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent, markRaw } from "vue";
import SettingsPageShell from "./SettingsPageShell.vue";
import {
  Scale as ScaleIcon,
  Globe as GlobeIcon,
  Code as CodeIcon,
  MessageCircle as MessageCircleIcon,
  Rss as RssIcon,
  Heart as HeartIcon,
  ExternalLink as ExternalLinkIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "AboutSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    ScaleIcon,
    ExternalLinkIcon,
    ChevronRightIcon,
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
          icon: markRaw(RssIcon),
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
