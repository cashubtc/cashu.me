<template>
  <!-- Every UI element on one page, for comparing surface styles (src/css/ui-variants.scss).
       A design tool, not a product screen: its own labels are plain English. -->
  <SettingsPageShell
    title="UI elements"
    caption="Every component on one page. Pick a surface style to compare."
  >
    <div class="ui-kit-switcher" data-testid="ui-kit-switcher">
      <div
        class="ui-kit-switcher__row"
        role="radiogroup"
        aria-label="Surface style"
      >
        <button
          v-for="v in variants"
          :key="v.id"
          type="button"
          role="radio"
          class="ui-kit-chip"
          :class="{ 'ui-kit-chip--on': variant === v.id }"
          :aria-checked="variant === v.id"
          :data-variant="v.id"
          @click="pickVariant(v.id)"
        >
          {{ v.label }}
        </button>
      </div>
      <div class="ui-kit-switcher__row" role="radiogroup" aria-label="Mode">
        <button
          v-for="m in modes"
          :key="m.label"
          type="button"
          role="radio"
          class="ui-kit-chip"
          :class="{ 'ui-kit-chip--on': $q.dark.isActive === m.dark }"
          :aria-checked="$q.dark.isActive === m.dark"
          @click="pickMode(m.dark)"
        >
          {{ m.label }}
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="section-divider q-mt-lg q-mb-md">
      <div class="divider-line"></div>
      <div class="divider-text">Buttons</div>
      <div class="divider-line"></div>
    </div>
    <div class="row no-wrap items-center q-gutter-x-md q-mb-md">
      <q-btn
        rounded
        unelevated
        color="primary"
        class="col wallet-action-btn ui-kit-caps"
      >
        Receive
      </q-btn>
      <q-btn flat round aria-label="Scan">
        <ScanIcon :size="22" />
      </q-btn>
      <q-btn
        rounded
        unelevated
        color="primary"
        class="col wallet-action-btn ui-kit-caps"
      >
        Send
      </q-btn>
    </div>
    <q-btn
      rounded
      unelevated
      no-caps
      color="primary"
      class="full-width add-mint-submit q-mb-md"
    >
      <PlusIcon :size="18" class="q-mr-sm" />
      <span>Add mint</span>
    </q-btn>
    <q-btn
      rounded
      outline
      no-caps
      color="primary"
      class="full-width discover-btn-kit q-mb-md"
    >
      <SearchIcon :size="18" class="q-mr-sm" />
      <span>Discover mints</span>
    </q-btn>
    <div class="row q-gutter-sm q-mb-md">
      <q-btn rounded unelevated no-caps color="primary" disable>Disabled</q-btn>
      <q-btn rounded outline no-caps color="primary">Outline</q-btn>
      <q-btn rounded flat no-caps color="primary">Flat</q-btn>
      <q-btn rounded unelevated no-caps color="negative">Remove mint</q-btn>
    </div>
    <div class="invoice-type-toggle-kit q-mb-md">
      <q-btn-toggle
        v-model="invoiceType"
        rounded
        unelevated
        no-caps
        class="invoice-type-toggle"
        toggle-color="primary"
        :options="[
          { label: 'Invoice', value: 'bolt11' },
          { label: 'Offer', value: 'bolt12' },
        ]"
      />
    </div>

    <!-- Mint picker -->
    <div class="section-divider q-mt-lg q-mb-md">
      <div class="divider-line"></div>
      <div class="divider-text">Mint picker</div>
      <div class="divider-line"></div>
    </div>
    <ChooseMint test-id="ui-kit-mint" />
    <ChooseMint
      test-id="ui-kit-from"
      allow-empty
      :require-active-mint="false"
      label="From"
    />

    <!-- Text fields -->
    <div class="section-divider q-mt-md q-mb-md">
      <div class="divider-line"></div>
      <div class="divider-text">Text fields</div>
      <div class="divider-line"></div>
    </div>
    <q-input rounded outlined v-model="url" label="Mint URL" class="q-mb-md">
      <template v-slot:append>
        <q-btn flat round class="touch-target-44" aria-label="Scan">
          <ScanIcon :size="20" />
        </q-btn>
      </template>
    </q-input>
    <q-input
      rounded
      outlined
      v-model="nickname"
      label="Nickname (optional)"
      class="q-mb-md"
    />
    <q-input outlined v-model="filled" label="Mint URL" class="q-mb-md" />
    <q-input
      outlined
      autogrow
      v-model="memo"
      type="textarea"
      label="Paste a token or invoice"
      class="q-mb-md"
    />
    <q-select
      outlined
      v-model="sort"
      :options="['Newest', 'Oldest', 'Highest rated', 'Lowest rated']"
      label="Sort"
      class="q-mb-md"
    />
    <q-input
      outlined
      v-model="bad"
      label="Amount"
      error
      error-message="More than this mint's balance"
      class="q-mb-md"
    />

    <!-- Mint cards -->
    <div class="section-divider q-mt-lg q-mb-md">
      <div class="divider-line"></div>
      <div class="divider-text">Mint cards</div>
      <div class="divider-line"></div>
    </div>
    <q-item
      v-for="card in cards"
      :key="card.url"
      clickable
      :active="card.active"
      active-class="mint-card--active"
      class="mint-card q-mb-md"
    >
      <div class="mint-card__body">
        <div class="mint-card__head">
          <MintInfoContainer class="col" :name="card.name" :url="card.url" />
          <CircleCheckIcon
            v-if="card.active"
            :size="18"
            class="mint-card__status mint-card__check"
            aria-hidden="true"
          />
          <q-btn flat round dense class="mint-card-more" aria-label="Details">
            <q-icon :name="card.add ? 'add' : 'more_horiz'" size="1.3rem" />
          </q-btn>
        </div>
        <div class="mint-card__foot">
          <div class="mint-card__balances">
            <template v-for="(b, i) in card.balances" :key="b">
              <span v-if="i > 0" class="mint-card__plus" aria-hidden="true"
                >+</span
              >
              <bdi dir="ltr" class="currency-unit-text">{{ b }}</bdi>
            </template>
          </div>
          <div class="mint-review">
            <span class="mint-review-link">{{ card.reviews }}</span>
          </div>
        </div>
      </div>
    </q-item>

    <!-- Lists -->
    <div class="section-divider q-mt-lg q-mb-md">
      <div class="divider-line"></div>
      <div class="divider-text">Lists and rows</div>
      <div class="divider-line"></div>
    </div>
    <q-list class="settings-menu-group q-mb-lg">
      <q-item
        v-for="row in rows"
        :key="row.title"
        clickable
        class="settings-menu-item"
      >
        <q-item-section avatar>
          <div class="settings-menu-icon">
            <component :is="row.icon" :size="20" />
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">{{
            row.title
          }}</q-item-label>
          <q-item-label caption>{{ row.caption }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <ChevronRightIcon :size="18" class="settings-menu-chevron" />
        </q-item-section>
      </q-item>
    </q-list>
    <SettingsSection
      title="Network checks"
      caption="These settings affect your privacy."
    >
      <q-item tag="label">
        <q-item-section>
          <q-item-label>Check incoming invoice</q-item-label>
          <q-item-label caption
            >Checks your latest invoice in the background.</q-item-label
          >
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="toggleOn" color="primary" />
        </q-item-section>
      </q-item>
      <q-item tag="label">
        <q-item-section>
          <q-item-label>Use WebSockets</q-item-label>
          <q-item-label caption>Keeps a live connection to mints.</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="toggleOff" color="primary" />
        </q-item-section>
      </q-item>
    </SettingsSection>
    <SettingsSection
      title="Locked ecash"
      caption="Anyone with this key can unlock ecash sent to it. Keep it private."
      warning
    >
      <q-item>
        <q-item-section>
          <q-item-label>Lock key</q-item-label>
          <q-item-label caption>npub1…k3x9</q-item-label>
        </q-item-section>
      </q-item>
    </SettingsSection>

    <!-- Sheet rows -->
    <div class="section-divider q-mt-lg q-mb-md">
      <div class="divider-line"></div>
      <div class="divider-text">Sheet rows</div>
      <div class="divider-line"></div>
    </div>
    <div class="column q-gutter-y-sm q-mb-lg">
      <SheetOption
        label="Lightning"
        caption="Create an invoice to get paid"
        :selected="sheetPick === 'ln'"
        @select="sheetPick = 'ln'"
      >
        <template #icon><ZapIcon :size="20" /></template>
      </SheetOption>
      <SheetOption
        label="Ecash"
        caption="Paste, scan or request a token"
        :selected="sheetPick === 'ecash'"
        @select="sheetPick = 'ecash'"
      >
        <template #icon><CoinsIcon :size="20" /></template>
      </SheetOption>
    </div>

    <!-- Feedback -->
    <div class="section-divider q-mt-lg q-mb-md">
      <div class="divider-line"></div>
      <div class="divider-text">Tabs, chips and toasts</div>
      <div class="divider-line"></div>
    </div>
    <q-tabs v-model="tab" no-caps class="q-mb-md" active-color="primary">
      <q-tab name="history" label="History" />
      <q-tab name="mints" label="Mints" />
    </q-tabs>
    <div class="row q-gutter-sm q-mb-md items-center">
      <q-badge outline class="q-pa-xs">Beta</q-badge>
      <q-chip outline clickable icon="schedule">Pending only</q-chip>
      <span class="mint-chip"
        ><LandmarkIcon :size="14" class="q-mr-xs" />Mint C</span
      >
    </div>
    <div
      class="q-notification row items-stretch q-notification--standard ui-kit-toast"
    >
      <div class="row items-center no-wrap q-notification__wrapper">
        <q-icon
          name="check_circle"
          size="18px"
          color="positive"
          class="q-notification__icon q-mr-sm"
        />
        <div class="q-notification__message col">Received ₿500</div>
      </div>
    </div>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SettingsPageShell from "src/pages/settings/SettingsPageShell.vue";
import SettingsSection from "src/pages/settings/SettingsSection.vue";
import ChooseMint from "src/components/ChooseMint.vue";
import MintInfoContainer from "src/components/MintInfoContainer.vue";
import SheetOption from "src/components/SheetOption.vue";
import {
  UI_VARIANTS,
  getUiVariant,
  setUiVariant,
  type UiVariantId,
} from "src/js/ui-variant";
import {
  ChevronRight as ChevronRightIcon,
  CircleCheck as CircleCheckIcon,
  Coins as CoinsIcon,
  Landmark as LandmarkIcon,
  Lock as LockIcon,
  Palette as PaletteIcon,
  Plus as PlusIcon,
  Scan as ScanIcon,
  Search as SearchIcon,
  Shield as ShieldIcon,
  Zap as ZapIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "UiKitPage",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    SettingsSection,
    ChooseMint,
    MintInfoContainer,
    SheetOption,
    ChevronRightIcon,
    CircleCheckIcon,
    CoinsIcon,
    LandmarkIcon,
    PlusIcon,
    ScanIcon,
    SearchIcon,
    ZapIcon,
  },
  data() {
    return {
      variants: UI_VARIANTS,
      variant: getUiVariant() as UiVariantId,
      modes: [
        { label: "Dark", dark: true },
        { label: "Light", dark: false },
      ],
      invoiceType: "bolt11",
      url: "",
      nickname: "",
      filled: "https://mint.example.com",
      memo: "",
      sort: "Newest",
      bad: "₿5,000",
      toggleOn: true,
      toggleOff: false,
      sheetPick: "ln",
      tab: "mints",
      cards: [
        {
          url: "https://mint.example.com",
          name: "Example Mint",
          balances: ["₿2,289"],
          reviews: "★ 4.5 · 2 reviews",
          active: true,
        },
        {
          url: "https://mint-c.example.com",
          name: "Mint C",
          balances: ["₿500", "$25.00"],
          reviews: "See reviews",
          active: false,
        },
        {
          url: "https://lantern.example.com",
          name: "Lantern",
          balances: [],
          reviews: "★ 4.0 · 1 review",
          active: false,
          add: true,
        },
      ],
      rows: [
        {
          title: "Locked ecash",
          caption: "Receive ecash only your key can unlock",
          icon: LockIcon,
        },
        {
          title: "Appearance",
          caption: "Theme, keyboard, and bitcoin symbol",
          icon: PaletteIcon,
        },
        {
          title: "Privacy",
          caption: "Network checks and bitcoin price",
          icon: ShieldIcon,
        },
      ],
    };
  },
  methods: {
    pickVariant(id: UiVariantId) {
      setUiVariant(id);
      this.variant = id;
    },
    pickMode(dark: boolean) {
      if (this.$q.dark.isActive !== dark) this.toggleDarkMode();
    },
  },
});
</script>

<style scoped>
.ui-kit-switcher {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ui-kit-switcher__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ui-kit-chip {
  background: var(--app-tint);
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--app-text);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  min-height: 36px;
  padding: 0 14px;
}
.ui-kit-chip--on {
  background: var(--app-text);
  color: var(--app-surface, #000);
}
body.body--light .ui-kit-chip--on {
  color: #fff;
}
.ui-kit-caps {
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 1rem;
}
.discover-btn-kit {
  min-height: 48px;
  font-size: 15px;
  font-weight: 600;
}
.ui-kit-toast {
  position: static;
  margin: 0;
}
</style>
