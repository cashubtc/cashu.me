<template>
  <q-header bordered class="bg-marginal-bg">
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        icon="menu"
        aria-label="Menu"
        @click="toggleLeftDrawer"
      />
      <q-toolbar-title>
        <span><strong>Cashu</strong></span>
      </q-toolbar-title>
      <q-badge color="yellow" text-color="black" class="gt-sm q-mr-md">
        <span>Warning: Cashu is beta software</span>
      </q-badge>

      <q-btn-dropdown
        v-if="themes && themes.length > 1"
        dense
        flat
        round
        size="sm"
        icon="dashboard_customize"
        class="q-pl-md"
      >
        <div class="row no-wrap q-pa-md">
          <q-btn
            v-if="themes.includes('classic')"
            dense
            flat
            @click="changeColor('classic')"
            icon="format_color_fill"
            color="deep-purple"
            size="md"
            ><q-tooltip>classic</q-tooltip>
          </q-btn>
          <q-btn
            v-if="themes.includes('bitcoin')"
            dense
            flat
            @click="changeColor('bitcoin')"
            icon="format_color_fill"
            color="orange"
            size="md"
            ><q-tooltip>bitcoin</q-tooltip>
          </q-btn>
          <q-btn
            v-if="themes.includes('mint')"
            dense
            flat
            @click="changeColor('mint')"
            icon="format_color_fill"
            color="green"
            size="md"
            ><q-tooltip>mint</q-tooltip> </q-btn
          ><q-btn
            v-if="themes.includes('autumn')"
            dense
            flat
            @click="changeColor('autumn')"
            icon="format_color_fill"
            color="brown"
            size="md"
            ><q-tooltip>autumn</q-tooltip>
          </q-btn>
          <q-btn
            v-if="themes.includes('monochrome')"
            dense
            flat
            @click="changeColor('monochrome')"
            icon="format_color_fill"
            color="grey"
            size="md"
            ><q-tooltip>monochrome</q-tooltip>
          </q-btn>
          <q-btn
            v-if="themes.includes('salvador')"
            dense
            flat
            @click="changeColor('salvador')"
            icon="format_color_fill"
            color="blue-10"
            size="md"
            ><q-tooltip>elSalvador</q-tooltip>
          </q-btn>
          <q-btn
            v-if="themes.includes('freedom')"
            dense
            flat
            @click="changeColor('freedom')"
            icon="format_color_fill"
            color="pink-13"
            size="md"
            ><q-tooltip>freedom</q-tooltip>
          </q-btn>
          <q-btn
            v-if="themes.includes('cyber')"
            dense
            flat
            @click="changeColor('cyber')"
            icon="format_color_fill"
            color="light-green-9"
            size="md"
            ><q-tooltip>cyber</q-tooltip>
          </q-btn>
          <q-btn
            v-if="themes.includes('flamingo')"
            dense
            flat
            @click="changeColor('flamingo')"
            icon="format_color_fill"
            color="pink-3"
            size="md"
            ><q-tooltip>flamingo</q-tooltip>
          </q-btn>
        </div>
      </q-btn-dropdown>

      <q-btn
        dense
        flat
        round
        @click="toggleDarkMode"
        :icon="$q.dark.isActive ? 'brightness_3' : 'wb_sunny'"
        size="sm"
      >
        <q-tooltip>Toggle Dark Mode</q-tooltip>
      </q-btn>
    </q-toolbar>
  </q-header>

  <q-drawer v-model="leftDrawerOpen" bordered>
    <q-list>
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
    title: "Documentation",
    caption: "docs.cashu.space",
    icon: "school",
    link: "https://docs.cashu.space",
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
    title: "Faucet",
    caption: "gandlaf.com/faucet",
    icon: "generating_tokens",
    link: "https://www.gandlaf.com/faucet/anarchy",
  },
  {
    title: "Redeem",
    caption: "redeem.cashu.me",
    icon: "money",
    link: "https://redeem.cashu.me/",
  },
  {
    title: "Twitter",
    caption: "@CashuBTC",
    icon: "rss_feed",
    link: "https://twitter.com/CashuBTC",
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
      themes: [
        "classic",
        "bitcoin",
        "mint",
        "autumn",
        "monochrome",
        "salvador",
        "freedom",
        // "cyber",
        "flamingo",
      ],
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
