<template>
  <!-- Every UI pattern in the app on one page: for comparing surface styles
       (src/css/ui-variants.scss), checking consistency, and finding duplicates
       (src/js/ui-audit.ts). A design tool, not a product screen: its labels are plain English.
       Each entry names the files that implement it; samples use the real components or the
       shared global classes, so they change when the app does. -->
  <SettingsPageShell
    title="UI elements"
    caption="Every pattern in the app, where it lives, and the duplicates to merge."
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
      <div class="ui-kit-switcher__row" role="radiogroup" aria-label="Theme">
        <button
          v-for="t in themes"
          :key="t"
          type="button"
          role="radio"
          class="ui-kit-chip"
          :class="{ 'ui-kit-chip--on': theme === t }"
          :aria-checked="theme === t"
          @click="pickTheme(t)"
        >
          {{ t }}
        </button>
      </div>
      <nav class="ui-kit-toc" aria-label="Sections">
        <a v-for="s in sections" :key="s.id" :href="`#${s.id}`">{{
          s.title
        }}</a>
      </nav>
    </div>

    <!-- 1. Foundations -->
    <h2 :id="sections[0].id" class="ui-kit-section">{{ sections[0].title }}</h2>
    <UiKitItem title="Colour tokens" sources="src/css/base.scss (--app-*)">
      <div class="ui-kit-swatches">
        <div v-for="t in tokens" :key="t" class="ui-kit-swatch">
          <span
            class="ui-kit-swatch__chip"
            :style="{ background: `var(${t})` }"
          />
          <code>{{ t }}</code>
        </div>
      </div>
    </UiKitItem>
    <UiKitItem
      title="Type scale"
      sources="SettingsPageShell .text-h5 · app.scss .amount-headline, .sheet-title · settings.scss .settings-section-title · Quasar captions"
    >
      <div class="amount-headline">₿2,789</div>
      <div class="text-h5 text-weight-bold">Page title</div>
      <div class="sheet-title">Sheet title</div>
      <div class="ui-kit-body">
        Body text, 15px. Enter the URL of a Cashu mint.
      </div>
      <div class="settings-section-title">Section title</div>
      <div class="text-caption text-app-muted">
        Caption text for rows and help.
      </div>
      <div class="ui-kit-mono">
        cashuBo2FteCJodHRwczovL21pbnQuZXhhbXBsZS5jb20…
      </div>
    </UiKitItem>
    <UiKitItem
      title="Section divider"
      sources="app.scss .section-divider · MintSettings, MintDetailsPage, UiKitPage"
    >
      <div class="section-divider">
        <div class="divider-line"></div>
        <div class="divider-text">Mint details</div>
        <div class="divider-line"></div>
      </div>
    </UiKitItem>

    <!-- 2. Buttons -->
    <h2 :id="sections[1].id" class="ui-kit-section">{{ sections[1].title }}</h2>
    <UiKitItem
      title="Wallet actions"
      sources="WalletPage.vue .wallet-action-btn (52px, caps)"
    >
      <div class="row no-wrap items-center q-gutter-x-md">
        <q-btn
          rounded
          unelevated
          color="primary"
          class="col wallet-action-btn ui-kit-caps"
        >
          Receive
        </q-btn>
        <q-btn flat round aria-label="Scan"><ScanIcon :size="22" /></q-btn>
        <q-btn
          rounded
          unelevated
          color="primary"
          class="col wallet-action-btn ui-kit-caps"
        >
          Send
        </q-btn>
      </div>
    </UiKitItem>
    <UiKitItem
      title="Full-width primary"
      sources="app.scss .q-btn--rounded.full-width (52px) · caps inside dialogs (strategic caps rule)"
    >
      <q-btn
        rounded
        unelevated
        no-caps
        color="primary"
        class="full-width q-mb-sm"
      >
        Continue
      </q-btn>
      <q-btn
        rounded
        unelevated
        no-caps
        color="primary"
        class="full-width add-mint-submit"
      >
        <PlusIcon :size="18" class="q-mr-sm" /> Add mint
      </q-btn>
    </UiKitItem>
    <UiKitItem
      title="Secondary, flat, disabled, danger"
      sources="Quasar q-btn outline / flat · app.scss disabled token · busy: CreateInvoiceDialog dots + label, AddMintDialog / MintDiscovery / Restore bare spinner · RemoveMintDialog danger pill"
      note="Busy buttons come in two forms: dots with a label (CreateInvoiceDialog) and a bare spinner (seven other files)."
    >
      <q-btn rounded outline no-caps color="primary" class="full-width q-mb-sm">
        <SearchIcon :size="18" class="q-mr-sm" /> Discover mints
      </q-btn>
      <div class="row q-gutter-sm">
        <q-btn rounded outline no-caps color="primary">Outline</q-btn>
        <q-btn rounded flat no-caps color="primary">Flat</q-btn>
        <q-btn rounded unelevated no-caps color="primary" disable
          >Disabled</q-btn
        >
        <q-btn rounded unelevated no-caps color="primary" loading>
          Busy
          <template v-slot:loading>
            <q-spinner-dots size="20px" class="on-left" /> Creating
          </template>
        </q-btn>
        <q-btn rounded unelevated no-caps color="primary" loading>Busy</q-btn>
        <q-btn rounded unelevated no-caps color="negative">Remove mint</q-btn>
      </div>
    </UiKitItem>
    <UiKitItem
      title="Icon buttons"
      sources="44px header buttons: MainHeader, FullscreenHeader, .floating-close-btn, .drawer-header-btn, BottomSheet close"
    >
      <div class="row q-gutter-sm items-center">
        <q-btn flat round class="touch-target-44" aria-label="Close"
          ><XIcon :size="22"
        /></q-btn>
        <q-btn flat round class="touch-target-44" aria-label="Back"
          ><ChevronLeftIcon :size="24"
        /></q-btn>
        <q-btn flat round class="touch-target-44" aria-label="Menu"
          ><MenuIcon :size="22"
        /></q-btn>
        <q-btn flat round class="touch-target-44" aria-label="Refresh"
          ><RefreshCwIcon :size="20"
        /></q-btn>
        <q-btn flat round class="touch-target-44" aria-label="Refreshing"
          ><RefreshCwIcon :size="20" class="refresh-spin"
        /></q-btn>
        <q-btn flat round dense class="mint-card-more" aria-label="More"
          ><q-icon name="more_horiz" size="1.3rem"
        /></q-btn>
        <q-btn flat round aria-label="Copy"><CopyIcon :size="18" /></q-btn>
      </div>
    </UiKitItem>

    <!-- 3. Headers -->
    <h2 :id="sections[2].id" class="ui-kit-section">{{ sections[2].title }}</h2>
    <UiKitItem
      title="Sheet header"
      sources="app.scss .drawer-header + .sheet-title · SendDialog, ReceiveDialog, ReceiveEcashDrawer"
    >
      <div class="ui-kit-frame">
        <div class="drawer-header row items-center no-wrap">
          <q-btn flat round class="drawer-header-btn" aria-label="Close"
            ><XIcon :size="22"
          /></q-btn>
          <div class="col sheet-title">Receive</div>
          <q-btn flat round class="drawer-header-btn" aria-label="Scan"
            ><ScanIcon :size="20"
          /></q-btn>
        </div>
      </div>
    </UiKitItem>
    <UiKitItem
      title="Bottom sheet"
      sources="BottomSheet.vue + SheetOption.vue · ChooseMint, SheetSelect, sort, currency, language, terms"
    >
      <q-btn rounded outline no-caps color="primary" @click="sheetOpen = true">
        Open bottom sheet
      </q-btn>
      <BottomSheet v-model="sheetOpen" title="Sort reviews">
        <div class="column q-gutter-y-sm">
          <SheetOption
            v-for="o in sortOptions"
            :key="o"
            :label="o"
            :selected="sort === o"
            @select="(sort = o), (sheetOpen = false)"
          />
        </div>
      </BottomSheet>
    </UiKitItem>
    <UiKitItem
      title="Confirm dialog"
      sources="app.scss .council-dialog* · RemoveMintDialog only"
    >
      <q-btn
        rounded
        outline
        no-caps
        color="primary"
        @click="confirmOpen = true"
      >
        Open confirm dialog
      </q-btn>
      <q-dialog v-model="confirmOpen">
        <q-card class="council-dialog q-pa-lg">
          <div class="text-h6 text-weight-bold">Remove this mint?</div>
          <q-list class="council-dialog__summary q-mt-md">
            <q-item>
              <q-item-section>
                <q-item-label caption>Mint URL</q-item-label>
                <q-item-label>mint.example.com</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <p class="council-dialog__note">
            Your ecash from this mint stays on this device.
          </p>
          <div class="council-dialog__actions">
            <q-btn flat rounded no-caps class="col" @click="confirmOpen = false"
              >Cancel</q-btn
            >
            <q-btn
              unelevated
              rounded
              no-caps
              color="negative"
              class="col"
              @click="confirmOpen = false"
            >
              Remove mint
            </q-btn>
          </div>
        </q-card>
      </q-dialog>
    </UiKitItem>

    <!-- 4. Inputs -->
    <h2 :id="sections[3].id" class="ui-kit-section">{{ sections[3].title }}</h2>
    <UiKitItem
      title="Mint picker"
      sources="ChooseMint.vue · app.scss .mint-chip--field · wallet, every amount sheet, swap From/To"
    >
      <ChooseMint test-id="ui-kit-mint" />
      <ChooseMint
        test-id="ui-kit-from"
        allow-empty
        :require-active-mint="false"
        label="From"
      />
    </UiKitItem>
    <UiKitItem
      title="Text fields"
      sources="Quasar q-input outlined · app.scss field radius, edge and fill tokens"
    >
      <q-input rounded outlined v-model="url" label="Mint URL" class="q-mb-md">
        <template v-slot:append>
          <q-btn flat round class="touch-target-44" aria-label="Scan"
            ><ScanIcon :size="20"
          /></q-btn>
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
      <q-input
        outlined
        v-model="bad"
        label="Amount"
        error
        error-message="More than this mint's balance"
        class="q-mb-md"
      />
      <q-input
        outlined
        readonly
        model-value="wss://relay.example.com"
        label="Read-only"
      />
    </UiKitItem>
    <UiKitItem
      title="Select"
      sources="SheetSelect.vue (bottom sheet) · q-select menu (app.scss body .q-menu)"
    >
      <SheetSelect
        v-model="sort"
        :options="sortSheetOptions"
        label="Sort"
        class="q-mb-md"
      />
      <q-select
        outlined
        v-model="sort"
        :options="sortOptions"
        label="Sort (menu)"
      />
    </UiKitItem>
    <UiKitItem
      title="Amount entry and keypad"
      sources="NumericKeyboard.vue · AmountInputComponent, CreateInvoiceDialog, SendTokenDialog, PayInvoiceDialog (duplicated wrappers)"
    >
      <div class="text-center">
        <div class="ui-kit-amount">₿{{ keypad || "0" }}</div>
        <div class="text-app-muted">$0.00</div>
      </div>
      <NumericKeyboard
        v-model="keypad"
        force-visible
        hide-close
        hide-enter
        class="ui-kit-keypad"
      />
    </UiKitItem>

    <!-- 5. Selection -->
    <h2 :id="sections[4].id" class="ui-kit-section">{{ sections[4].title }}</h2>
    <UiKitItem
      title="Segmented control"
      sources="app.scss .invoice-type-toggle · CreateInvoiceDialog"
    >
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
    </UiKitItem>
    <UiKitItem
      title="Toggles"
      sources="app.scss .q-toggle · every settings page"
    >
      <div class="row q-gutter-md items-center">
        <q-toggle v-model="toggleOn" color="primary" label="On" />
        <q-toggle v-model="toggleOff" color="primary" label="Off" />
        <q-toggle
          :model-value="true"
          disable
          color="primary"
          label="Disabled"
        />
      </div>
    </UiKitItem>
    <UiKitItem
      title="Checkbox and radio rows"
      sources="q-checkbox: RestoreView, NostrMintRestore, Multinut, welcome · radio rows: AppearanceSettings, LanguageSettings"
    >
      <div class="row q-gutter-md q-mb-sm">
        <q-checkbox v-model="checkOn" label="Selected" />
        <q-checkbox v-model="checkOff" label="Not selected" />
      </div>
      <q-list class="settings-card">
        <q-item
          v-for="m in ['Dark', 'Light']"
          :key="m"
          clickable
          @click="radio = m"
        >
          <q-item-section avatar>
            <q-icon
              :color="radio === m ? 'primary' : 'grey'"
              :name="radio === m ? 'check_circle' : 'radio_button_unchecked'"
            />
          </q-item-section>
          <q-item-section>{{ m }}</q-item-section>
        </q-item>
      </q-list>
    </UiKitItem>
    <UiKitItem title="Tabs" sources="WalletPage.vue q-tabs · app.scss .q-tab">
      <q-tabs v-model="tab" no-caps active-color="primary">
        <q-tab name="history" label="History" />
        <q-tab name="mints" label="Mints" />
      </q-tabs>
    </UiKitItem>
    <UiKitItem
      title="Chips, badges and pills"
      sources="settings.scss .q-badge outline · HistoryTable pending chip · app.scss .mint-chip · mintlist.css .currency-unit-badge · MintDetailsPage .nut-pill"
      note="Square 4px badges and full pills both label things; see Duplicates."
    >
      <div class="row q-gutter-sm items-center">
        <q-badge outline class="q-pa-xs">Beta</q-badge>
        <q-chip outline clickable icon="schedule">Pending only</q-chip>
        <span class="mint-chip"
          ><LandmarkIcon :size="14" class="q-mr-xs" />Mint C</span
        >
        <span class="app-badge app-badge--solid">₿2,289</span>
        <span class="app-badge">Your review</span>
        <span class="app-badge app-badge--primary">60%</span>
      </div>
    </UiKitItem>
    <UiKitItem
      title="Slider and rating"
      sources="q-slider: MultinutPaymentDialog · q-rating: CreateMintReviewPage, MintRatingsComponent"
    >
      <q-slider
        v-model="slider"
        :min="0"
        :max="100"
        color="primary"
        class="q-mb-md"
      />
      <q-rating
        v-model="rating"
        max="5"
        size="32px"
        color="grey-5"
        color-selected="amber"
        icon="star_border"
        icon-selected="star"
      />
    </UiKitItem>

    <!-- 6. Cards and containers -->
    <h2 :id="sections[5].id" class="ui-kit-section">{{ sections[5].title }}</h2>
    <UiKitItem
      title="Mint cards"
      sources="app.scss .mint-card* · MintSettings (installed), MintDiscovery (add), RestoreView (checkbox)"
    >
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
            <q-checkbox
              v-if="card.check"
              v-model="cardCheck"
              dense
              class="restore-mint-check"
            />
            <q-btn
              v-else
              flat
              round
              dense
              class="mint-card-more"
              aria-label="Details"
            >
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
    </UiKitItem>
    <UiKitItem
      title="Mint identity header"
      sources="MintIdentityHeader.vue · MintDetailsPage, MintRatings, CreateMintReview · near-copy: Multinut .multinut-header"
    >
      <MintIdentityHeader
        url="https://mint.example.com"
        :info="{ name: 'Example Mint' }"
      />
    </UiKitItem>
    <UiKitItem
      title="Settings group and rows"
      sources="settings.scss .settings-menu-group, .settings-menu-item, .settings-card · SettingsSection.vue"
    >
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
          <q-item-section side
            ><ChevronRightIcon :size="18" class="settings-menu-chevron"
          /></q-item-section>
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
          <q-item-section side
            ><q-toggle v-model="toggleOn" color="primary"
          /></q-item-section>
        </q-item>
      </SettingsSection>
    </UiKitItem>
    <UiKitItem
      title="Detail rows"
      sources="app.scss .detail-item · Mint/MeltQuoteInformation, InvoiceDetailDialog, TokenInformation · copies: AddMintDialog, MintDetailsPage"
    >
      <div v-for="d in details" :key="d.name" class="detail-item q-mb-md">
        <div class="detail-label">
          <component :is="d.icon" :size="20" class="detail-icon" />
          <div class="detail-name">{{ d.name }}</div>
        </div>
        <div class="detail-value">{{ d.value }}</div>
      </div>
    </UiKitItem>
    <UiKitItem
      title="Callouts"
      sources="settings.scss --warning · ToolTipInfo.vue · MintMotdMessage.vue (+ MintAuditWarningBox, Multinut, CreateInvoice, ReceiveToken copies)"
      note="Four colour schemes for the same job; see Duplicates."
    >
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
      <ToolTipInfo
        text="Swapping to a mint you trust costs a small Lightning fee."
        class="q-mb-md"
      />
      <MintMotdMessage
        mint-url="https://mint.example.com"
        message="Maintenance tonight from 22:00 UTC."
      />
    </UiKitItem>

    <!-- 7. Rows and lists -->
    <h2 :id="sections[6].id" class="ui-kit-section">{{ sections[6].title }}</h2>
    <UiKitItem
      title="Sheet option rows"
      sources="SheetOption.vue · copies: SendDialog/ReceiveDialog/ReceiveEcashDrawer .action-row, PaymentRequestInfo, ParseInputComponent, WelcomeSlideChoice"
    >
      <div class="column q-gutter-y-sm">
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
    </UiKitItem>
    <UiKitItem
      title="History"
      sources="HistoryTable.vue (.history-row, .direction-badge, pagination) · near-copy: PaymentRequestPayments"
    >
      <HistoryTable />
    </UiKitItem>
    <UiKitItem
      title="Pagination"
      sources="q-pagination: HistoryTable, MintRatingsComponent, PaymentRequestPayments"
    >
      <q-pagination
        v-model="page"
        :max="6"
        :max-pages="5"
        direction-links
        boundary-links
        round
        flat
        active-design="unelevated"
        active-color="primary"
        size="md"
      />
    </UiKitItem>
    <UiKitItem
      title="Expansion row"
      sources="q-expansion-item: WalletPage, LightningAddressSettings"
    >
      <q-expansion-item label="Advanced" icon="tune" dense>
        <div class="q-pa-md text-app-muted">Expanded content.</div>
      </q-expansion-item>
    </UiKitItem>

    <!-- 8. Feedback and loading -->
    <h2 :id="sections[7].id" class="ui-kit-section">{{ sections[7].title }}</h2>
    <UiKitItem
      title="Toasts"
      sources="src/js/notify.ts · app.scss body .q-notification"
    >
      <div
        class="q-notification row items-stretch q-notification--standard ui-kit-toast q-mb-md"
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
      <div class="row q-gutter-sm">
        <q-btn rounded outline no-caps color="primary" @click="toast('success')"
          >Success</q-btn
        >
        <q-btn rounded outline no-caps color="primary" @click="toast('error')"
          >Error</q-btn
        >
        <q-btn rounded outline no-caps color="primary" @click="toast('warning')"
          >Warning</q-btn
        >
        <q-btn rounded outline no-caps color="primary" @click="toast('info')"
          >Info</q-btn
        >
      </div>
    </UiKitItem>
    <UiKitItem
      title="Loading"
      sources="q-spinner-dots: CreateInvoiceDialog, NostrMintRestore, WelcomeMintSetup · q-linear-progress .qr-progress · q-skeleton (MintDiscovery, MintRatings, WalletPage, MintInfoContainer)"
    >
      <div class="row q-gutter-md items-center q-mb-md">
        <q-spinner-dots size="24px" color="primary" />
        <q-spinner size="24px" color="primary" />
        <RefreshCwIcon :size="20" class="refresh-spin" />
      </div>
      <q-linear-progress
        indeterminate
        color="primary"
        class="qr-progress q-mb-md"
      />
      <div class="row items-center no-wrap q-gutter-x-md">
        <q-skeleton type="QAvatar" size="34px" />
        <div class="col">
          <q-skeleton type="text" width="60%" />
          <q-skeleton type="text" width="40%" />
        </div>
      </div>
    </UiKitItem>
    <UiKitItem
      title="Blocking and empty states"
      sources="app.scss .blocking-state (AlreadyRunning, 404) · empty states in MintRatings, MintDiscovery, NoMintWarnBanner, HistoryTable"
    >
      <div
        class="ui-kit-frame blocking-state column flex-center text-center q-pa-lg"
      >
        <div class="blocking-state__title">This page doesn’t exist</div>
        <div class="blocking-state__text q-mt-sm">
          Check the link and try again.
        </div>
        <q-btn
          rounded
          unelevated
          no-caps
          color="primary"
          class="blocking-state__action q-mt-lg"
        >
          Go back home
        </q-btn>
      </div>
    </UiKitItem>
    <UiKitItem
      title="Banner"
      sources="q-banner: SendTokenDialog (payment request mint warning)"
    >
      <q-banner dense rounded class="bg-red-1 text-red-9"
        >This request asks for a different mint.</q-banner
      >
    </UiKitItem>
    <UiKitItem title="Tooltip" sources="q-tooltip in 16 files (hover only)">
      <q-btn rounded outline no-caps color="primary">
        Hover me
        <q-tooltip>Copied to clipboard</q-tooltip>
      </q-btn>
    </UiKitItem>

    <!-- 9. Data display -->
    <h2 :id="sections[8].id" class="ui-kit-section">{{ sections[8].title }}</h2>
    <UiKitItem
      title="Amounts"
      sources="app.scss .amount-headline · AnimatedNumber.vue · ToggleUnit.vue · copies: BalanceView, Multinut .multinut-amount"
    >
      <div class="amount-headline">−₿101</div>
      <div class="text-h4 text-weight-bold">
        <AnimatedNumber
          :value="2789"
          :format="(n) => '₿' + Math.round(n).toLocaleString('en-US')"
        />
      </div>
      <ToggleUnit class="q-mt-sm" />
    </UiKitItem>
    <UiKitItem
      title="QR code"
      sources="vue-qrcode in .app-qr: InvoiceDetail, CreateInvoice, DisplayToken, P2PK, NWC, PaymentRequest, MintDetails"
    >
      <q-responsive :ratio="1" class="app-qr">
        <vue-qrcode
          value="cashu:demo-token"
          :options="{ width: 400 }"
          class="rounded-borders"
          style="width: 100%"
        />
      </q-responsive>
    </UiKitItem>

    <!-- 10. Standard elements (src/css/elements.scss) -->
    <h2 :id="sections[9].id" class="ui-kit-section">{{ sections[9].title }}</h2>
    <p class="ui-kit-body text-app-muted">
      The one implementation of each repeated pattern (src/css/elements.scss).
      New screens use these classes instead of their own copies.
    </p>
    <UiKitItem
      title="Icon circle"
      sources=".app-icon-circle --sm 40 · 48 · --lg 56 · --xl 80"
    >
      <div class="row q-gutter-md items-center">
        <div class="app-icon-circle app-icon-circle--sm">
          <ZapIcon :size="20" />
        </div>
        <div class="app-icon-circle"><ZapIcon :size="24" /></div>
        <div class="app-icon-circle app-icon-circle--lg">
          <ZapIcon :size="26" />
        </div>
        <div class="app-icon-circle app-icon-circle--xl">
          <ZapIcon :size="36" />
        </div>
      </div>
    </UiKitItem>
    <UiKitItem
      title="Option row"
      sources=".app-option-row (+ __label, __caption, --selected) · SheetOption, Send, Receive, Receive ecash, scanner row, payment request, onboarding choice"
    >
      <div class="column q-gutter-y-sm">
        <div class="app-option-row" role="button" tabindex="0">
          <div class="app-icon-circle"><CoinsIcon :size="24" /></div>
          <div class="app-option-row__text">
            <div class="app-option-row__label">Ecash</div>
            <div class="app-option-row__caption">
              Paste, scan or request a token
            </div>
          </div>
        </div>
        <div
          class="app-option-row app-option-row--selected"
          role="button"
          tabindex="0"
        >
          <div class="app-icon-circle"><ZapIcon :size="24" /></div>
          <div class="app-option-row__text">
            <div class="app-option-row__label">Lightning</div>
            <div class="app-option-row__caption">Selected</div>
          </div>
        </div>
      </div>
    </UiKitItem>
    <UiKitItem
      title="Callout"
      sources=".app-callout --info --warning --danger · ToolTipInfo, MintMotdMessage, MintAuditWarningBox, Multinut, CreateInvoice, ReceiveToken"
    >
      <div class="column q-gutter-y-sm">
        <div class="app-callout">
          <q-icon name="info" size="18px" class="app-callout__icon" />
          <div class="app-callout__body app-callout__text">
            Neutral advice for the next step.
          </div>
        </div>
        <div class="app-callout app-callout--info">
          <q-icon name="info" size="18px" class="app-callout__icon" />
          <div class="app-callout__body app-callout__text">
            Swapping costs a small Lightning fee.
          </div>
        </div>
        <div class="app-callout app-callout--warning">
          <q-icon name="warning_amber" size="18px" class="app-callout__icon" />
          <div class="app-callout__body">
            <div class="app-callout__title">Experimental feature</div>
            <div class="app-callout__text">
              Paying from several mints can fail part way.
            </div>
          </div>
        </div>
        <div class="app-callout app-callout--danger">
          <q-icon name="error_outline" size="18px" class="app-callout__icon" />
          <div class="app-callout__body app-callout__text">
            This token is locked to a different key.
          </div>
        </div>
      </div>
    </UiKitItem>
    <UiKitItem
      title="Badge"
      sources=".app-badge --solid --primary · reviews, multi-mint amounts"
    >
      <div class="row q-gutter-sm items-center">
        <span class="app-badge">Your review</span>
        <span class="app-badge app-badge--solid">₿2,289</span>
        <span class="app-badge app-badge--primary">60%</span>
      </div>
    </UiKitItem>
    <UiKitItem
      title="Box and empty state"
      sources=".app-box · .app-empty (+ __title, __text, __action) · MintRatings, MintDiscovery, AddMint preview, confirm summary"
    >
      <div class="app-empty app-box">
        <div class="app-icon-circle app-icon-circle--lg">
          <q-icon name="travel_explore" size="28px" />
        </div>
        <div class="app-empty__title">No mints found</div>
        <div class="app-empty__text">
          Try again, or add a mint you trust by its URL.
        </div>
        <q-btn
          rounded
          unelevated
          no-caps
          color="primary"
          class="full-width app-empty__action"
          >Discover mints</q-btn
        >
      </div>
    </UiKitItem>
    <UiKitItem
      title="Skeleton row"
      sources="SkeletonRow.vue · body .q-skeleton · MintDiscovery, MintRatingsComponent"
    >
      <SkeletonRow avatar="34px" :lines="['55%', '35%', '25%']" />
    </UiKitItem>
    <UiKitItem
      title="Machine text"
      sources=".app-mono (+ --wrap) · invoices, tokens, lock keys"
    >
      <div class="app-mono app-mono--wrap text-app-muted">
        lnbc10u1pjxyz0pp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypq
      </div>
    </UiKitItem>

    <!-- 11. Duplicates -->
    <h2 :id="sections[10].id" class="ui-kit-section">
      {{ sections[10].title }}
    </h2>
    <p class="ui-kit-body text-app-muted">
      Patterns implemented more than once (src/js/ui-audit.ts). Merge each into
      one shared implementation, then delete its entry.
    </p>
    <div v-for="d in duplicates" :key="d.pattern" class="ui-kit-dup">
      <div class="ui-kit-dup__head">
        <span class="ui-kit-item-title">{{ d.pattern }}</span>
        <span class="ui-kit-dup__count">{{ d.places.length }}×</span>
      </div>
      <ul class="ui-kit-dup__places">
        <li v-for="p in d.places" :key="p">{{ p }}</li>
      </ul>
      <div class="ui-kit-dup__differs">{{ d.differs }}</div>
    </div>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SettingsPageShell from "src/pages/settings/SettingsPageShell.vue";
import SettingsSection from "src/pages/settings/SettingsSection.vue";
import AnimatedNumber from "src/components/AnimatedNumber.vue";
import BottomSheet from "src/components/BottomSheet.vue";
import ChooseMint from "src/components/ChooseMint.vue";
import HistoryTable from "src/components/HistoryTable.vue";
import MintIdentityHeader from "src/components/MintIdentityHeader.vue";
import MintInfoContainer from "src/components/MintInfoContainer.vue";
import MintMotdMessage from "src/components/MintMotdMessage.vue";
import NumericKeyboard from "src/components/NumericKeyboard.vue";
import SheetOption from "src/components/SheetOption.vue";
import SheetSelect from "src/components/SheetSelect.vue";
import SkeletonRow from "src/components/SkeletonRow.vue";
import ToggleUnit from "src/components/ToggleUnit.vue";
import ToolTipInfo from "src/components/ToolTipInfo.vue";
import UiKitItem from "src/components/UiKitItem.vue";
import { UI_DUPLICATES } from "src/js/ui-audit";
import {
  UI_VARIANTS,
  getUiVariant,
  setUiVariant,
  type UiVariantId,
} from "src/js/ui-variant";
import {
  notify,
  notifyError,
  notifySuccess,
  notifyWarning,
} from "src/js/notify";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CircleCheck as CircleCheckIcon,
  Clock as ClockIcon,
  Coins as CoinsIcon,
  Copy as CopyIcon,
  Landmark as LandmarkIcon,
  Lock as LockIcon,
  Menu as MenuIcon,
  Palette as PaletteIcon,
  Plus as PlusIcon,
  RefreshCw as RefreshCwIcon,
  Scan as ScanIcon,
  Search as SearchIcon,
  Shield as ShieldIcon,
  X as XIcon,
  Zap as ZapIcon,
} from "lucide-vue-next";

const THEMES = [
  "monochrome",
  "classic",
  "bitcoin",
  "mint",
  "autumn",
  "salvador",
  "freedom",
  "cyber",
  "flamingo",
];

export default defineComponent({
  name: "UiKitPage",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    SettingsSection,
    AnimatedNumber,
    BottomSheet,
    ChooseMint,
    HistoryTable,
    MintIdentityHeader,
    MintInfoContainer,
    MintMotdMessage,
    NumericKeyboard,
    SheetOption,
    SheetSelect,
    SkeletonRow,
    ToggleUnit,
    ToolTipInfo,
    UiKitItem,
    ChevronLeftIcon,
    ChevronRightIcon,
    CircleCheckIcon,
    CoinsIcon,
    CopyIcon,
    LandmarkIcon,
    MenuIcon,
    PlusIcon,
    RefreshCwIcon,
    ScanIcon,
    SearchIcon,
    XIcon,
    ZapIcon,
  },
  data() {
    const sortOptions = ["Newest", "Oldest", "Highest rated", "Lowest rated"];
    return {
      variants: UI_VARIANTS,
      variant: getUiVariant() as UiVariantId,
      modes: [
        { label: "Dark", dark: true },
        { label: "Light", dark: false },
      ],
      themes: THEMES,
      theme: this.$q.localStorage.getItem("cashu.theme") || "monochrome",
      sections: [
        { id: "foundations", title: "Foundations" },
        { id: "buttons", title: "Buttons" },
        { id: "headers", title: "Headers, sheets and dialogs" },
        { id: "inputs", title: "Inputs" },
        { id: "selection", title: "Selection" },
        { id: "containers", title: "Cards and containers" },
        { id: "rows", title: "Rows and lists" },
        { id: "feedback", title: "Feedback and loading" },
        { id: "data", title: "Data display" },
        { id: "standard", title: "Standard elements" },
        { id: "duplicates", title: "Duplicates" },
      ],
      tokens: [
        "--app-text",
        "--app-text-muted",
        "--app-text-subtle",
        "--app-text-disabled",
        "--app-surface",
        "--app-raised",
        "--app-tint",
        "--app-tint-strong",
        "--app-border",
        "--app-border-strong",
        "--app-accent",
        "--q-primary",
        "--q-positive",
        "--q-negative",
        "--app-card-fill",
        "--app-card-fill-active",
        "--app-card-edge-active",
        "--app-field-edge",
      ],
      duplicates: UI_DUPLICATES,
      sortOptions,
      sortSheetOptions: sortOptions.map((o) => ({ label: o, value: o })),
      sort: "Newest",
      sheetOpen: false,
      confirmOpen: false,
      invoiceType: "bolt11",
      url: "",
      nickname: "",
      filled: "https://mint.example.com",
      memo: "",
      bad: "₿5,000",
      keypad: "",
      toggleOn: true,
      toggleOff: false,
      checkOn: true,
      checkOff: false,
      radio: "Dark",
      slider: 40,
      rating: 4,
      page: 2,
      sheetPick: "ln",
      tab: "mints",
      cardCheck: true,
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
        },
        {
          url: "https://lantern.example.com",
          name: "Lantern",
          balances: [],
          reviews: "★ 4.0 · 1 review",
          add: true,
        },
        {
          url: "https://restore.example.com",
          name: "Restore Mint",
          balances: ["₿1,200"],
          reviews: "",
          check: true,
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
      details: [
        { name: "Fee paid", value: "₿1", icon: CoinsIcon },
        { name: "Paid at", value: "Oct 27, 2026, 8:35 AM", icon: ClockIcon },
        { name: "Mint", value: "mint.example.com", icon: LandmarkIcon },
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
    pickTheme(theme: string) {
      this.changeColor(theme);
      this.theme = theme;
    },
    toast(kind: string) {
      if (kind === "success") notifySuccess("Received ₿500");
      else if (kind === "error") notifyError("Couldn't reach the mint");
      else if (kind === "warning") notifyWarning("This mint is offline");
      else notify("Copied");
    },
  },
});
</script>

<!-- Unscoped, as in MintSettings: the shared mint list styles (unit badges, mint names). -->
<style>
@import "src/css/mintlist.css";
</style>

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
  text-transform: capitalize;
}
.ui-kit-chip--on {
  background: var(--app-text);
  color: var(--app-surface, #000);
}
body.body--light .ui-kit-chip--on {
  color: #fff;
}
.ui-kit-toc {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin-top: 8px;
  font-size: 13px;
}
.ui-kit-toc a {
  color: var(--app-text-muted);
  text-decoration: underline;
}
.ui-kit-section {
  margin: 40px 0 16px;
  padding-top: 16px;
  border-top: 1px solid var(--app-border);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  scroll-margin-top: 64px;
}
.ui-kit-body {
  font-size: 15px;
}
.ui-kit-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: var(--app-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ui-kit-swatches {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
}
.ui-kit-swatch {
  align-items: center;
  display: flex;
  gap: 8px;
  font-size: 11px;
  min-width: 0;
}
.ui-kit-swatch code {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ui-kit-swatch__chip {
  border: 1px solid var(--app-border);
  border-radius: 6px;
  flex-shrink: 0;
  height: 24px;
  width: 24px;
}
.ui-kit-caps {
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 1rem;
}
.ui-kit-48 {
  min-height: 48px;
  font-size: 15px;
  font-weight: 600;
}
.ui-kit-frame {
  border: 1px dashed var(--app-border);
  border-radius: 12px;
  overflow: hidden;
}
.ui-kit-amount {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;
}
.ui-kit-keypad {
  position: static !important;
}
.ui-kit-toast {
  position: static;
  margin: 0;
}
.ui-kit-dup {
  border-top: 1px solid var(--app-border);
  padding: 14px 0;
}
.ui-kit-dup__head {
  align-items: baseline;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.ui-kit-item-title {
  font-size: 15px;
  font-weight: 600;
}
.ui-kit-dup__count {
  color: var(--q-negative);
  font-size: 13px;
  font-weight: 700;
}
.ui-kit-dup__places {
  margin: 6px 0;
  padding-inline-start: 18px;
  font-size: 12px;
  color: var(--app-text-muted);
}
.ui-kit-dup__differs {
  font-size: 13px;
}
</style>
