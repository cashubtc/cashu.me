<template>
  <q-layout view="lHh Lpr lFf">
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
          <q-btn flat no-caps dense size="lg" type="a" href="/">
            <span><strong>Cashu</strong>.me</span>
          </q-btn>
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
    <!-- <q-header elevated>
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
          Quasar App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header> -->

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";

const linksList = [
  {
    title: "Docs",
    caption: "quasar.dev",
    icon: "school",
    link: "https://quasar.dev",
  },
  {
    title: "Github",
    caption: "github.com/quasarframework",
    icon: "code",
    link: "https://github.com/quasarframework",
  },
  {
    title: "Discord Chat Channel",
    caption: "chat.quasar.dev",
    icon: "chat",
    link: "https://chat.quasar.dev",
  },
  {
    title: "Forum",
    caption: "forum.quasar.dev",
    icon: "record_voice_over",
    link: "https://forum.quasar.dev",
  },
  {
    title: "Twitter",
    caption: "@quasarframework",
    icon: "rss_feed",
    link: "https://twitter.quasar.dev",
  },
  {
    title: "Facebook",
    caption: "@QuasarFramework",
    icon: "public",
    link: "https://facebook.quasar.dev",
  },
  {
    title: "Quasar Awesome",
    caption: "Community Quasar projects",
    icon: "favorite",
    link: "https://awesome.quasar.dev",
  },
];

export default defineComponent({
  name: "MainLayout",
  mixins: [windowMixin],
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
        "cyber",
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

// // themes
// const themes = ["classic", "bitcoin"];
// if (themes && themes.length) {
//   window.allowedThemes = themes.map((str) => str.trim());
// }
</script>
