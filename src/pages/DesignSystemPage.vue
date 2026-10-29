<template>
  <div
    ref="page"
    class="settings-sub-page bg-dark text-white q-pa-md ui-kit-page ds-page"
  >
    <!-- The design system board (dev builds only): every canonical component in the app, rendered
         live from the real component or shared class, in the order of src/design-system/registry.ts.
         Each <DsEntry id> reads its name, source, usage and props from the registry and the code,
         so only the sample is written here. A rail on the far left jumps between components. -->
    <DsRail :groups="railGroups" :active="active" :matches="matches" @go="go" />
    <div class="settings-view text-left ui-kit-main">
      <div class="settings-page-header q-pt-sm q-pb-md">
        <h1 class="text-h5 text-weight-bold q-my-none">Design system</h1>
        <div class="text-caption text-grey-6 q-mt-xs">
          The app's component library: each element once, rendered live, with
          its source, where it is used and its props.
        </div>
      </div>

      <!-- Display: surface style, mode and theme for everything below. -->
      <div class="ui-kit-display" data-testid="ui-kit-switcher">
        <SheetSelect
          :model-value="theme"
          :options="themeOptions"
          label="Theme"
          class="ui-kit-display__field"
          @update:model-value="pickTheme"
        />
        <SegmentedControl
          :model-value="$q.dark.isActive"
          label="Mode"
          :options="[
            { label: 'Dark', value: true },
            { label: 'Light', value: false },
          ]"
          @update:model-value="pickMode"
        />
      </div>

      <!-- Sticky: search and jump to a section. -->
      <div class="ui-kit-bar">
        <q-input
          v-model="query"
          outlined
          clearable
          placeholder="Search components, files or tiers"
          aria-label="Search components"
          class="ui-kit-bar__search"
        >
          <template v-slot:prepend><SearchIcon :size="16" /></template>
        </q-input>
        <nav class="ui-kit-bar__sections" aria-label="Sections">
          <AppBadge
            v-for="g in groups"
            :key="g.id"
            tag="a"
            :href="`#ds-group-${g.id}`"
            >{{ g.title }}</AppBadge
          >
        </nav>
      </div>
      <div v-if="query && !anyMatch" class="ui-kit-body text-app-muted q-my-lg">
        Nothing matches “{{ query }}”.
      </div>

      <h2 id="ds-group-foundations" class="ds-section">Foundations</h2>
      <DsEntry id="colour-tokens">
        <div class="ui-kit-swatches">
          <div v-for="t in tokens" :key="t" class="ui-kit-swatch">
            <span
              class="ui-kit-swatch__chip"
              :style="{ background: `var(${t})` }"
            />
            <code>{{ t }}</code>
          </div>
        </div>
      </DsEntry>
      <DsEntry id="shape-tokens">
        <div class="row q-gutter-md items-end">
          <div
            v-for="r in radii"
            :key="r"
            class="ds-radius"
            :style="{ borderRadius: `var(--app-radius-${r})` }"
          >
            <code>{{ r }}</code>
          </div>
          <div class="ds-radius ds-radius--shadow"><code>shadow-md</code></div>
          <div class="ds-radius ds-radius--ring"><code>focus-ring</code></div>
        </div>
      </DsEntry>
      <DsEntry id="type-scale">
        <AmountHeadline>₿2,789</AmountHeadline>
        <div class="text-h5 text-weight-bold">Page title</div>
        <div class="sheet-title">Sheet title</div>
        <div class="ui-kit-body">
          Body text, 15px. Enter the URL of a Cashu mint.
        </div>
        <SectionDivider label="Section title" />
        <div class="text-caption text-app-muted">
          Caption text for rows and help.
        </div>
        <div class="ui-kit-mono">
          cashuBo2FteCJodHRwczovL21pbnQuZXhhbXBsZS5jb20…
        </div>
      </DsEntry>
      <DsEntry id="icon-circle">
        <div class="row q-gutter-md items-center">
          <IconCircle :icon="ZapIcon" size="xs" />
          <IconCircle :icon="ZapIcon" size="sm" />
          <IconCircle :icon="ZapIcon" />
          <IconCircle :icon="ZapIcon" size="lg" />
          <IconCircle :icon="ZapIcon" size="xl" />
        </div>
        <!-- With a picture (mint icon, profile picture), and the glyph it falls back to. -->
        <div class="row q-gutter-md items-center q-mt-sm">
          <IconCircle size="xs" src="icons/icon-128x128.png" />
          <IconCircle size="sm" src="icons/icon-128x128.png" />
          <IconCircle size="lg" src="icons/icon-128x128.png" />
          <IconCircle size="sm" src="missing.png" :icon="MintIcon" />
        </div>
      </DsEntry>
      <DsEntry id="icons">
        <div class="ds-icons">
          <div class="ds-icons__head">
            Lucide · {{ lucideIcons.length }} icons, 20px, 2px stroke
          </div>
          <div class="ds-icons__grid">
            <div
              v-for="ic in lucideIcons"
              :key="ic.name"
              class="ds-icons__cell"
              :title="ic.files.join('\n')"
            >
              <component :is="lucideComponent(ic.name)" :size="20" />
              <span class="ds-icons__name">{{ ic.name }}</span>
              <span class="ds-icons__count">{{ ic.files.length }}</span>
            </div>
          </div>
          <!-- The mint glyph (owner 2026-10-29, item 12: the old one was too sharp). Building2
               ships: rounded corners, no pediment, the least detail at 20px. -->
          <div class="ds-icons__head q-mt-lg">Mint glyph · 20, 24, 36px</div>
          <div class="ds-mint-glyphs">
            <div
              v-for="glyph in mintGlyphs"
              :key="glyph.name"
              class="ds-mint-glyphs__row"
              :class="{ 'ds-mint-glyphs__row--chosen': glyph.chosen }"
            >
              <span class="ds-mint-glyphs__name">{{ glyph.name }}</span>
              <template v-for="size in [20, 24, 36]" :key="size">
                <svg
                  v-if="!glyph.icon"
                  :width="size"
                  :height="size"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"
                  />
                </svg>
                <component :is="glyph.icon" v-else :size="size" />
              </template>
              <IconCircle v-if="glyph.icon" size="sm" :icon="glyph.icon" />
            </div>
          </div>
          <template v-if="materialIcons.length">
            <div class="ds-icons__head q-mt-lg">
              Material (to replace) · {{ materialIcons.length }}
            </div>
            <div class="ds-icons__grid">
              <div
                v-for="ic in materialIcons"
                :key="ic.name"
                class="ds-icons__cell ds-icons__cell--off"
                :title="ic.files.join('\n')"
              >
                <q-icon :name="ic.name" size="20px" />
                <span class="ds-icons__name">{{ ic.name }}</span>
                <span class="ds-icons__count">{{ ic.files.length }}</span>
              </div>
            </div>
          </template>
        </div>
      </DsEntry>
      <DsEntry id="machine-text">
        <div class="app-mono app-mono--wrap text-app-muted">
          lnbc10u1pjxyz0pp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypq
        </div>
      </DsEntry>
      <DsEntry id="cjk-text">
        <div class="ds-frame q-pa-md" style="max-width: 240px">
          <!-- Rendered in the active locale: switch the board to 中文 to see whole words. -->
          <CjkText
            tag="p"
            class="q-ma-none"
            text="Cashu.me 是一款免费且开源的比特币钱包，使用 ecash 确保您的资金安全和隐私。"
          />
        </div>
      </DsEntry>
      <h2 id="ds-group-actions" class="ds-section">Actions and buttons</h2>
      <DsEntry id="wallet-actions">
        <WalletActions />
      </DsEntry>
      <DsEntry id="primary-button">
        <q-btn rounded unelevated color="primary" class="full-width q-mb-sm">
          Continue
        </q-btn>
        <q-btn
          rounded
          unelevated
          color="primary"
          class="full-width add-mint-submit"
        >
          <PlusIcon :size="18" class="q-mr-sm" /> Add mint
        </q-btn>
        <q-btn
          rounded
          unelevated
          color="primary"
          class="full-width q-mt-sm q-mb-sm"
          disable
          >Add mint</q-btn
        >
        <q-btn rounded unelevated color="primary" class="full-width" loading
          >Add mint<template #loading
            ><BusyLabel>Adding mint</BusyLabel></template
          ></q-btn
        >
        <!-- zh, ja, ko, ar and th keep their text as written (no forced capitals). -->
        <q-btn
          rounded
          unelevated
          color="primary"
          class="full-width q-mt-sm"
          lang="zh-CN"
          >添加 Mint</q-btn
        >
      </DsEntry>
      <DsEntry id="secondary-buttons">
        <q-btn rounded outline color="primary" class="full-width q-mb-sm">
          <SearchIcon :size="18" class="q-mr-sm" /> Discover mints
        </q-btn>
        <q-btn
          rounded
          outline
          color="primary"
          class="full-width q-mb-sm"
          disable
          >Search for mint backups</q-btn
        >
        <q-btn
          rounded
          outline
          color="primary"
          class="full-width q-mb-sm"
          loading
          >Search for mint backups<template #loading
            ><BusyLabel>Searching</BusyLabel></template
          ></q-btn
        >
        <!-- Sentence case (15/600) for paired and dialog actions. -->
        <div class="row q-gutter-sm q-mb-sm">
          <q-btn rounded outline color="primary">Cancel</q-btn>
          <q-btn rounded unelevated color="primary">Confirm</q-btn>
        </div>
        <div class="row q-gutter-sm">
          <q-btn rounded outline color="primary">Tonal</q-btn>
          <q-btn rounded flat color="primary">Flat</q-btn>
          <q-btn rounded unelevated color="primary" disable>Disabled</q-btn>
          <q-btn rounded unelevated class="app-btn-danger">Remove mint</q-btn>
        </div>
      </DsEntry>
      <DsEntry id="icon-buttons">
        <div class="row q-gutter-sm items-center">
          <IconButton label="Close" :icon="XIcon" :icon-size="24" />
          <IconButton label="Back" :icon="ChevronLeftIcon" :icon-size="24" />
          <IconButton label="Menu" :icon="MenuIcon" :icon-size="24" />
          <IconButton label="Refresh" :icon="RefreshCwIcon" />
          <IconButton label="More" :icon="EllipsisIcon" />
          <IconButton label="Working" loading />
          <IconButton label="Disabled" :icon="PlusIconRaw" disable />
          <IconButton label="Show seed phrase" :icon="EyeIcon" tooltip />
          <IconButton label="Delete" :icon="Trash2Icon" tooltip />
        </div>
      </DsEntry>
      <DsEntry id="copy-button">
        <div class="row items-center q-gutter-md">
          <CopyButton value="lnurl1example" tooltip="Copy" />
          <CopyButton ref="copied" value="npub1example" tooltip="Copied" />
          <span class="text-app-muted">Ready, and just copied.</span>
        </div>
      </DsEntry>
      <DsEntry id="inline-confirm">
        <q-list class="settings-menu-group settings-view">
          <q-item>
            <q-item-section>
              <q-item-label>Remove spent proofs</q-item-label>
              <InlineConfirm
                question="Remove them from this device?"
                cancel-label="Cancel"
                confirm-label="Remove"
                @confirm="toast('success')"
                @cancel="toast('info')"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </DsEntry>
      <DsEntry id="tonal-chip">
        <div class="ds-frame row items-center q-pa-sm" style="gap: 8px">
          <TonalChip>
            <template #icon><QrCodeIcon :size="18" /></template>
            Show QR code
          </TonalChip>
          <TonalChip>
            <template #icon><GaugeIcon :size="18" /></template>
            QR speed: Fast
          </TonalChip>
          <TonalChip>
            <template #icon><Grid3x3Icon :size="18" /></template>
            QR density: Medium
          </TonalChip>
          <TonalChip disable>Disabled</TonalChip>
        </div>
      </DsEntry>
      <DsEntry id="mint-card-action">
        <div class="ds-frame row items-center no-wrap q-pa-sm" style="gap: 8px">
          <MintCardAction label="Add">
            <template #icon><PlusIcon :size="16" /></template>
          </MintCardAction>
          <MintCardAction label="Add" disable>
            <template #icon><PlusIcon :size="16" /></template>
          </MintCardAction>
          <MintCardAction label="Restore" loading>
            <template #icon><ArchiveRestoreIcon :size="16" /></template>
          </MintCardAction>
        </div>
      </DsEntry>
      <h2 id="ds-group-forms" class="ds-section">Form controls</h2>
      <DsEntry id="text-fields">
        <!-- One outlined field: the label floats and stays visible with content; 16px inset;
             edge 33% on the page, 43% on sheets. Trailing actions sit inside the field. -->
        <q-input outlined v-model="url" label="Mint URL" class="q-mb-md">
          <template v-slot:append>
            <IconButton label="Scan" :icon="ScanIcon" />
          </template>
        </q-input>
        <q-input outlined v-model="filled" label="Mint URL" class="q-mb-md">
          <template v-slot:append>
            <IconButton label="Clear" :icon="XIcon" @click="filled = ''" />
          </template>
        </q-input>
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
          label="Relay"
          class="q-mb-md"
        />
        <!-- Read-only but still the step's field (the welcome seed phrase): it keeps the edge
             (36% in dark, over the quieter read-only fill, to hold 3:1). A masked placeholder only, never a real phrase. -->
        <q-field
          outlined
          readonly
          stack-label
          label="Seed phrase"
          class="readonly-outlined q-mb-md"
        >
          <template #control>
            <div class="ds-seed-mask" dir="ltr">
              ****** ****** ****** ****** ****** ****** ****** ****** ******
              ****** ****** ******
            </div>
          </template>
          <template #append>
            <IconButton label="Show seed phrase" :icon="EyeIcon" />
            <CopyButton class="touch-target-44" value="" tooltip="Copy" />
          </template>
        </q-field>
        <q-input
          outlined
          disable
          model-value="Testnet"
          label="Nickname"
          class="q-mb-md"
        />
        <q-input
          outlined
          autogrow
          v-model="memo"
          type="textarea"
          label="Review (optional)"
          class="q-mb-md"
        />
        <q-input
          outlined
          autogrow
          v-model="longInvoice"
          type="textarea"
          label="Lightning invoice or address"
          class="q-mb-md"
        />
        <!-- The parse field (Pay, Receive): Paste and Scan inside, Clear once filled. -->
        <ParseInputComponent
          v-model="parseText"
          test-id="ui-kit-parse"
          placeholder="Paste a token or invoice"
          has-camera
          :autofocus="false"
        />
      </DsEntry>
      <DsEntry id="copy-field">
        <CopyField
          value="npub1qy352euf40x77qfrg4ncn27dauqjx3t83x4ummcpydzk0zdtehhs5rqk3s@npub.cash"
          label="Your address"
          copy-label="Copy Lightning address"
        />
        <CopyField class="q-mt-md" value="" label="Your address" loading />
      </DsEntry>
      <DsEntry id="select">
        <SheetSelect v-model="sort" :options="sortSheetOptions" label="Sort" />
        <!-- The settings-row variant (Privacy → Fiat currency). -->
        <q-list class="settings-menu-group settings-view q-mt-md">
          <SheetSelect
            row
            v-model="sort"
            :options="sortSheetOptions"
            label="Sort reviews"
            caption="Order of the reviews list"
          />
        </q-list>
      </DsEntry>
      <DsEntry id="mint-picker">
        <!-- Normal (the wallet) and dense (flows and forms) are one recipe at two heights; a
             label adds a line in either. dry-run: picking here doesn't switch the wallet. -->
        <div class="text-app-muted q-mb-sm">Normal</div>
        <ChooseMint test-id="ui-kit-mint" dry-run />
        <ChooseMint
          test-id="ui-kit-mint-labelled"
          dry-run
          :require-active-mint="false"
          label="Mint"
        />
        <div class="text-app-muted q-mb-sm">Dense</div>
        <ChooseMint test-id="ui-kit-mint-dense" dense dry-run />
        <ChooseMint
          test-id="ui-kit-from"
          dense
          allow-empty
          :require-active-mint="false"
          label="From"
        />
        <ChooseMint
          test-id="ui-kit-mint-disabled"
          dense
          dry-run
          disable
          :require-active-mint="false"
          label="To"
        />
      </DsEntry>
      <DsEntry id="amount-entry">
        <div class="ds-keypad q-mx-auto">
          <!-- The app's own amount display (AmountInputComponent), not a stand-in. -->
          <AmountInputComponent
            class="q-mb-md"
            :model-value="keypadAmount ?? 0"
          />
          <AmountKeypadPanel v-model="keypadAmount" />
        </div>
      </DsEntry>
      <DsEntry id="segmented-control">
        <SegmentedControl
          v-model="invoiceType"
          label="Request type"
          :options="[
            { label: 'Invoice', value: 'bolt11' },
            { label: 'Offer', value: 'bolt12' },
          ]"
        />
        <SegmentedControl
          v-model="unitPick"
          class="q-mt-md"
          label="Currency"
          :options="[
            { label: 'BTC', value: 'sat' },
            { label: 'USD', value: 'usd' },
            { label: 'EUR', value: 'eur' },
          ]"
        />
        <SegmentedControl
          :model-value="'bolt11'"
          class="q-mt-md"
          label="Request type"
          disable
          :options="[
            { label: 'Invoice', value: 'bolt11' },
            { label: 'Offer', value: 'bolt12' },
          ]"
        />
      </DsEntry>
      <DsEntry id="toggles">
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
      </DsEntry>
      <DsEntry id="settings-toggle-row">
        <q-list class="settings-menu-group settings-view">
          <SettingsToggleRow
            v-model="toggleOn"
            label="Check incoming invoice"
            caption="Checks your latest invoice in the background."
          />
          <SettingsToggleRow
            v-model="toggleOff"
            label="Receive swaps"
            badge="Beta"
            caption="Offers to swap received ecash to your active mint."
          />
          <SettingsToggleRow
            :model-value="false"
            label="Disabled"
            caption="Not available on this device."
            disable
          />
        </q-list>
      </DsEntry>
      <DsEntry id="checkbox-radio">
        <div class="row q-gutter-md q-mb-sm">
          <q-checkbox v-model="checkOn" label="Selected" />
          <q-checkbox v-model="checkOff" label="Not selected" />
        </div>
        <div class="row q-gutter-md">
          <q-radio v-model="radio" val="Dark" label="Dark" />
          <q-radio v-model="radio" val="Light" label="Light" />
        </div>
      </DsEntry>
      <DsEntry id="settings-radio-row">
        <q-list class="settings-menu-group settings-view">
          <SettingsRadioRow
            v-for="o in ['Dark', 'Light', 'System']"
            :key="o"
            :selected="radio === o"
            :label="o"
            :caption="o === 'System' ? 'Follows your device' : ''"
            @select="radio = o"
          />
        </q-list>
      </DsEntry>
      <DsEntry id="slider-rating">
        <div class="row items-baseline justify-between">
          <span class="text-app-muted">Share from this mint</span>
          <span class="text-weight-medium">{{ slider }}%</span>
        </div>
        <q-slider
          v-model="slider"
          :min="0"
          :max="100"
          color="primary"
          class="q-mb-xl"
        />
        <div class="text-app-muted q-mb-xs">Your rating</div>
        <AppRating v-model="rating" :size="32" label="Rating" />
        <div class="row items-center q-gutter-sm q-mt-lg text-app-muted">
          <AppRating :model-value="4" readonly :size="14" />
          <span>4.0 · in a review list</span>
        </div>
      </DsEntry>
      <!-- Buttons, fields, read-only, disabled and the mint picker as they stack in forms,
           on the page and on a sheet (owner, 2026-10-29: they sit under each other). -->
      <DsEntry id="control-stack">
        <div class="q-mb-lg">
          <q-btn class="full-width q-mb-md" unelevated rounded color="primary"
            >Add mint</q-btn
          >
          <q-btn class="full-width q-mb-md" outline rounded color="primary"
            ><SearchIcon :size="18" class="q-mr-sm" />Discover mints</q-btn
          >
          <q-btn
            class="full-width q-mb-md"
            unelevated
            rounded
            color="primary"
            disable
            >Add mint</q-btn
          >
          <q-btn
            class="full-width q-mb-md"
            unelevated
            rounded
            color="primary"
            loading
            >Add mint<template #loading
              ><BusyLabel>Adding mint</BusyLabel></template
            ></q-btn
          >
          <q-input outlined v-model="url" label="Mint URL" class="q-mb-md">
            <template v-slot:append>
              <IconButton label="Scan" :icon="ScanIcon" />
            </template>
          </q-input>
          <q-input
            outlined
            model-value="https://mint.example.com"
            label="Mint URL"
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
            label="Relay"
            class="q-mb-md"
          />
          <q-input
            outlined
            disable
            model-value="Testnet"
            label="Nickname"
            class="q-mb-md"
          />
          <ChooseMint
            test-id="ui-kit-stack-page"
            dense
            allow-empty
            :require-active-mint="false"
            label="From"
          />
        </div>
        <q-card flat class="ds-frame ds-raised q-pa-md">
          <q-btn class="full-width q-mb-md" unelevated rounded color="primary"
            >Add mint</q-btn
          >
          <q-btn class="full-width q-mb-md" outline rounded color="primary"
            ><SearchIcon :size="18" class="q-mr-sm" />Discover mints</q-btn
          >
          <q-btn
            class="full-width q-mb-md"
            unelevated
            rounded
            color="primary"
            disable
            >Add mint</q-btn
          >
          <q-btn
            class="full-width q-mb-md"
            unelevated
            rounded
            color="primary"
            loading
            >Add mint<template #loading
              ><BusyLabel>Adding mint</BusyLabel></template
            ></q-btn
          >
          <q-input outlined v-model="url" label="Mint URL" class="q-mb-md">
            <template v-slot:append>
              <IconButton label="Scan" :icon="ScanIcon" />
            </template>
          </q-input>
          <q-input
            outlined
            model-value="https://mint.example.com"
            label="Mint URL"
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
            label="Relay"
            class="q-mb-md"
          />
          <q-input
            outlined
            disable
            model-value="Testnet"
            label="Nickname"
            class="q-mb-md"
          />
          <ChooseMint
            test-id="ui-kit-stack-sheet"
            dense
            allow-empty
            :require-active-mint="false"
            label="From"
          />
        </q-card>
        <!-- Light theme (owner, 2026-10-29): L1 (white page) ships; L2 and L3 are shown here
             only, to judge in light mode. L2 would need light-2 #9a2fe0 (classic) and #b34700
             (bitcoin) to keep AA, and a 48% field edge on its page. -->
        <div class="ds-light-variants q-mt-lg">
          <div class="text-app-muted q-mb-sm">
            L2 (board only): #f6f6f7 page, white cards and fields
          </div>
          <div
            class="ds-frame q-pa-md q-mb-md ds-light-variant ds-light-variant--l2"
          >
            <q-btn class="full-width q-mb-md" unelevated rounded color="primary"
              >Add mint</q-btn
            >
            <q-btn class="full-width q-mb-md" outline rounded color="primary"
              >Discover mints</q-btn
            >
            <q-input outlined model-value="" label="Mint URL" class="q-mb-md" />
            <div class="ds-light-variant__card q-pa-md">
              ₿2,289 on this mint
            </div>
          </div>
          <div class="text-app-muted q-mb-sm">
            L3 (board only): warm #faf9f7 page
          </div>
          <div
            class="ds-frame q-pa-md q-mb-md ds-light-variant ds-light-variant--l3"
          >
            <q-btn class="full-width q-mb-md" unelevated rounded color="primary"
              >Add mint</q-btn
            >
            <q-btn class="full-width q-mb-md" outline rounded color="primary"
              >Discover mints</q-btn
            >
            <q-input outlined model-value="" label="Mint URL" class="q-mb-md" />
            <div class="ds-light-variant__card q-pa-md">
              ₿2,289 on this mint
            </div>
          </div>
        </div>
      </DsEntry>
      <h2 id="ds-group-navigation" class="ds-section">Navigation</h2>
      <DsEntry id="tabs">
        <q-tabs
          v-model="tab"
          no-caps
          class="bg-transparent wallet-tabs"
          active-class="wallet-tab--active"
          indicator-color="primary"
        >
          <q-tab name="history" label="History" />
          <q-tab name="mints" label="Mints" />
        </q-tabs>
      </DsEntry>
      <DsEntry id="pagination">
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
      </DsEntry>
      <DsEntry id="settings-link-row">
        <q-list class="settings-menu-group settings-view">
          <SettingsLinkRow
            v-for="row in rows"
            :key="row.title"
            :icon="row.icon"
            :label="row.title"
            :caption="row.caption"
          />
          <SettingsLinkRow
            :icon="CodeIcon"
            label="Source code"
            caption="github.com/cashubtc/cashu.me"
            external
          />
          <SettingsLinkRow
            :icon="GlobeIcon"
            label="Language"
            caption="Choose your language"
            value="English"
          />
        </q-list>
      </DsEntry>
      <DsEntry id="row-value">
        <!-- Every form in use: a value with a chevron, a chevron alone, and an external link. -->
        <q-list class="settings-menu-group settings-view">
          <q-item clickable>
            <q-item-section
              ><q-item-label>Language</q-item-label></q-item-section
            >
            <RowValue value="English" />
          </q-item>
          <q-item clickable>
            <q-item-section
              ><q-item-label>Fiat currency</q-item-label></q-item-section
            >
            <RowValue value="USD" />
          </q-item>
          <q-item clickable>
            <q-item-section
              ><q-item-label>Privacy</q-item-label></q-item-section
            >
            <RowValue />
          </q-item>
          <q-item clickable>
            <q-item-section
              ><q-item-label>Source code</q-item-label></q-item-section
            >
            <RowValue external />
          </q-item>
        </q-list>
      </DsEntry>
      <DsEntry id="settings-action-row">
        <q-list class="settings-menu-group settings-view">
          <SettingsActionRow label="Restore" caption="From a seed phrase" />
          <SettingsActionRow
            label="Export proofs"
            caption="Download a backup file"
          >
            <template #side><DownloadIcon :size="18" /></template>
          </SettingsActionRow>
          <SettingsActionRow
            label="New seed phrase"
            caption="Replaces the phrase this wallet uses"
            caution
          />
          <SettingsActionRow
            label="Delete wallet"
            caption="Removes everything on this device"
            danger
          />
        </q-list>
      </DsEntry>
      <DsEntry id="unit-toggle">
        <!-- Beside the lock action in Send: both bare header actions. -->
        <div class="ds-frame row items-center no-wrap q-pa-sm" style="gap: 4px">
          <IconButton class="lock-toggle-btn" label="Lock to a key">
            <LockIcon :size="20" />
          </IconButton>
          <UnitToggle label="₿" />
          <UnitToggle label="$" />
        </div>
      </DsEntry>
      <DsEntry id="fullscreen-dialog-header">
        <div class="ds-frame">
          <FullscreenDialogHeader title="Receive ecash" balanced />
        </div>
        <div class="ds-frame q-mt-sm">
          <FullscreenDialogHeader title="Lightning invoice">
            <template #actions>
              <div class="sheet-header-actions">
                <IconButton label="More" :icon="EllipsisIcon" />
              </div>
            </template>
          </FullscreenDialogHeader>
        </div>
      </DsEntry>
      <DsEntry id="expansion-row">
        <q-list class="settings-menu-group settings-view">
          <SettingsToggleRow
            v-model="toggleOn"
            label="Lightning address"
            caption="Receive to a reusable address"
          />
          <q-expansion-item label="Advanced">
            <div class="q-px-md q-pb-md text-app-muted">
              Server URL and mint for the address.
            </div>
          </q-expansion-item>
        </q-list>
      </DsEntry>
      <DsEntry id="expansion-indicator">
        <div class="row q-gutter-lg items-center q-mb-md">
          <ExpansionIndicator label="Show history and mints" />
          <ExpansionIndicator expanded label="Hide history and mints" />
        </div>
        <q-expansion-item
          dense
          class="wallet-panel"
          expand-icon-class="hidden"
          header-class="wallet-history-toggle"
          :default-opened="true"
        >
          <template #header="{ expanded }">
            <q-item-section class="items-center">
              <ExpansionIndicator
                :expanded="expanded"
                :label="
                  expanded ? 'Hide history and mints' : 'Show history and mints'
                "
              />
            </q-item-section>
          </template>
          <div class="q-pa-md text-app-muted text-center">
            The wallet's History and Mints panel.
          </div>
        </q-expansion-item>
      </DsEntry>
      <DsEntry id="route-transitions">
        <!-- The real thing: these leave the board through the router, and Back returns here. -->
        <div class="row q-gutter-sm">
          <q-btn rounded outline no-caps to="/settings">Open Settings</q-btn>
          <q-btn rounded outline no-caps to="/no-such-page">
            Open a missing page
          </q-btn>
        </div>
        <div class="text-caption text-app-muted q-mt-sm">
          Then use Back (the header or the browser): the page slides back in.
        </div>
      </DsEntry>
      <h2 id="ds-group-containers" class="ds-section">Cards and containers</h2>
      <DsEntry id="mint-cards">
        <!-- The Mints tab's states (a ring while switching, a check on the selected mint, the
             vertical details button), then Discover's Add and Restore's checkbox, which set
             only the fill. -->
        <MintCard
          v-for="card in cards"
          :key="card.url"
          class="q-mb-md"
          clickable
          :active="card.active || card.check"
          :selected="card.selected"
          :show-selection-status="card.installed"
          :busy="card.busy"
          :name="card.name"
          :icon-url="card.iconUrl"
          :url="card.url"
          :balances="card.balances"
        >
          <template #action>
            <q-checkbox
              v-if="card.check"
              v-model="cardCheck"
              dense
              class="restore-mint-check"
              aria-label="Select"
            />
            <MintCardAction v-else-if="card.add" label="Add">
              <template #icon><PlusIcon :size="16" /></template>
            </MintCardAction>
            <IconButton
              v-else
              class="mint-card-more"
              label="Details"
              :icon="EllipsisVerticalIcon"
            />
          </template>
          <template #meta>
            <MintReviewSummary
              :average="card.average"
              :count="card.count"
              fallback-label="See reviews"
            />
          </template>
        </MintCard>
        <MintCard skeleton />
        <!-- Discover's loading card keeps its Add button's footprint. -->
        <MintCard skeleton skeleton-action />
      </DsEntry>
      <DsEntry id="mint-identity-header">
        <MintIdentityHeader
          url="https://mint.example.com"
          :info="{ name: 'Example Mint' }"
        />
      </DsEntry>
      <DsEntry id="settings-section">
        <SettingsSection
          title="Network checks"
          caption="These settings affect your privacy."
        >
          <SettingsToggleRow
            v-model="toggleOn"
            label="Check incoming invoice"
            caption="Checks your latest invoice in the background."
          />
        </SettingsSection>
        <SettingsSection
          title="Locked ecash"
          caption="Experimental. Use small amounts: if you lose the private key, nobody can unlock the ecash locked to it."
          warning
        >
          <q-item>
            <q-item-section>
              <q-item-label>Lock key</q-item-label>
              <q-item-label caption>npub1…k3x9</q-item-label>
            </q-item-section>
            <q-item-section side>
              <CopyButton value="npub1example" label="Copy lock key" />
            </q-item-section>
          </q-item>
        </SettingsSection>
      </DsEntry>
      <DsEntry id="box">
        <div class="app-box q-pa-md">
          <div class="text-h6 text-weight-bold">₿2,289</div>
          <div class="text-app-muted">on 2 mints</div>
        </div>
      </DsEntry>
      <DsEntry id="section-divider">
        <SectionDivider label="Mint details" />
        <SectionDivider
          label="Swap"
          caption="Move funds between your mints over Lightning. Fees may apply."
        />
        <SectionDivider
          caption="The caption alone, where the page already titles the section."
        />
        <SectionDivider
          align="start"
          label="Rating"
          caption="A single field's label: the same label on the start edge."
        />
        <SectionDivider label="Mints you have added and can swap between" />
      </DsEntry>
      <h2 id="ds-group-data" class="ds-section">Data display</h2>
      <DsEntry id="badges">
        <div class="row q-gutter-sm items-center">
          <AppBadge>Beta</AppBadge>
          <AppBadge tone="primary">60%</AppBadge>
          <AppBadge><LockIcon :size="14" />Locked</AppBadge>
          <AppBadge tone="success">Received</AppBadge>
          <AppBadge tone="warning">Staging</AppBadge>
          <AppBadge tone="danger">Offline</AppBadge>
        </div>
      </DsEntry>
      <DsEntry id="detail-row">
        <!-- 44px rows 4px apart in a .detail-table. Static facts, then the interactive kinds,
             each tinting only its own box: action (placeholder, set, disabled), link, copy,
             and the audit retry idle and busy. -->
        <div class="detail-table">
          <DetailRow
            v-for="d in details"
            :key="d.name"
            :icon="d.icon"
            :label="d.name"
            :value="d.value"
          />
          <DetailRow
            :icon="CoinsIcon"
            label="Amount"
            value="Any amount"
            placeholder
            action
            @click="toast('info')"
          />
          <DetailRow
            :icon="MintIcon"
            label="Mint"
            value="mint.example.com"
            action
            @click="toast('info')"
          />
          <DetailRow
            :icon="CoinsIcon"
            label="Unit"
            value="sat"
            action
            disabled
          />
          <DetailRow
            :icon="GlobeIcon"
            label="Explorer"
            value="mempool.space"
            href="https://mempool.space"
          />
          <DetailRow
            icon-src="/nostr-icon.svg"
            label="Nostr"
            value="npub1qqqq…xyz789"
            copy-value="npub1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqxyz789"
          />
          <DetailRow
            :icon="InfoIcon"
            label="Audit info is unavailable right now."
            value="Refresh"
            action
            action-label="Refresh"
            :chevron="false"
            @click="toast('info')"
          />
          <DetailRow
            :icon="InfoIcon"
            label="Audit info is unavailable right now."
            action
            busy
            action-label="Refresh"
            :chevron="false"
            ><BusyLabel>Refresh</BusyLabel></DetailRow
          >
        </div>
      </DsEntry>
      <DsEntry id="meta-line">
        <!-- Two and three parts, an empty part skipped, and Arabic beside Latin parts. -->
        <div class="column q-gutter-y-sm text-app-muted">
          <MetaLine :parts="['Lightning', 'Today, 14:02']" />
          <MetaLine :parts="['Lightning', 'USD', '5 minutes ago']" />
          <MetaLine :parts="['Ecash', '', 'Yesterday']" />
          <MetaLine :parts="['قبل 5 دقائق', 'Lightning', 'USD']" dir="rtl" />
        </div>
      </DsEntry>
      <DsEntry id="amount-warning">
        <!-- Both uses: the send balance check and the on-chain minimum, each under an amount. -->
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <div class="relative-position text-center q-pb-lg">
              <div class="text-h4 text-weight-bold">₿9,000</div>
              <AmountWarning text="Balance too low" amount-key="9000" />
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="relative-position text-center q-pb-lg">
              <div class="text-h4 text-weight-bold">₿500</div>
              <AmountWarning text="Minimum ₿25,000" amount-key="500" />
            </div>
          </div>
        </div>
      </DsEntry>
      <DsEntry id="activity-row">
        <q-list class="full-width">
          <ActivityRow
            v-for="h in historySpecimen"
            :key="h.caption + h.amount"
            :direction="h.dir"
            :label="h.label"
            :amount="h.amount"
            :caption="h.caption"
            :pending="h.pending"
            :expired="h.expired"
          />
        </q-list>
      </DsEntry>
      <DsEntry id="amounts">
        <div class="column items-center q-gutter-y-sm">
          <AmountHeadline>−₿101</AmountHeadline>
          <div dir="rtl"><AmountHeadline>−₿101</AmountHeadline></div>
          <div class="text-h6 text-app-muted">
            <AnimatedNumber
              :value="2789"
              :format="(n) => '₿' + Math.round(n).toLocaleString('en-US')"
            />
          </div>
          <ToggleUnit />
        </div>
      </DsEntry>
      <DsEntry id="balance-view">
        <!-- The wallet's own balance, from this wallet's state: the unit dots switch it (no
             swipe), a tap on the figure hides it. -->
        <BalanceView v-if="mints.length" />
        <div v-else class="text-app-muted">Add a mint to see the balance.</div>
      </DsEntry>
      <DsEntry id="payment-status">
        <div class="row q-col-gutter-lg justify-center">
          <PaymentStatus state="paid" label="Paid" caption="Fee: ₿1"
            >₿100</PaymentStatus
          >
          <PaymentStatus state="pending" label="Paying">₿100</PaymentStatus>
          <PaymentStatus state="pending" label="Receiving ₿500" />
        </div>
      </DsEntry>
      <DsEntry id="qr-code">
        <QrBlock value="cashu:demo-token" />
      </DsEntry>
      <DsEntry id="qr-copy-line">
        <QrCopyLine
          text="bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"
          :copied="qrCopied"
          @copy="qrCopied = !qrCopied"
        />
        <QrCopyLine text="creqApGF0gaNhd...dWNzYXQ=" copied />
      </DsEntry>
      <DsEntry id="qr-progress">
        <div class="ds-qr-progress q-mx-auto">
          <QrBlock value="cashu:demo-token" />
          <QrProgress active />
          <div class="text-center text-app-muted">Checking for payment</div>
        </div>
      </DsEntry>
      <DsEntry id="tooltip">
        <div class="ds-tooltip-stage">
          <IconButton label="Copy address" :icon="CopyIcon">
            <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]"
              >Copy address</q-tooltip
            >
          </IconButton>
        </div>
      </DsEntry>
      <h2 id="ds-group-feedback" class="ds-section">Feedback and overlays</h2>
      <DsEntry id="callouts">
        <AppCallout
          v-for="c in calloutSpecimen"
          :key="c.variant + c.text"
          :variant="c.variant"
          :title="c.title"
          :text="c.text"
          :dismissible="c.dismissible"
        />
      </DsEntry>
      <DsEntry id="toasts">
        <!-- The real toast classes, static: the same five messages as the variations. -->
        <div class="ds-toast-stack q-mb-md">
          <div
            v-for="t in toastSpecimen"
            :key="t.message"
            class="q-notification row items-stretch q-notification--standard ui-kit-toast"
            :class="`bg-${t.type}`"
          >
            <div
              class="row items-center no-wrap q-notification__wrapper full-width"
            >
              <q-icon
                :name="t.icon"
                size="18px"
                class="q-notification__icon q-mr-sm"
              />
              <div class="q-notification__message col">
                {{ t.message }}
                <div v-if="t.caption" class="q-notification__caption">
                  {{ t.caption }}
                </div>
              </div>
              <div class="q-notification__actions row items-center">
                <q-btn v-if="t.action" flat :label="t.action" />
                <q-btn v-else flat round dense color="grey"
                  ><XIcon :size="16"
                /></q-btn>
              </div>
            </div>
          </div>
        </div>
        <div class="row q-gutter-sm">
          <q-btn rounded outline @click="toast('success')">Success</q-btn>
          <q-btn rounded outline @click="toast('error')">Error</q-btn>
          <q-btn rounded outline @click="toast('warning')">Warning</q-btn>
          <q-btn rounded outline @click="toast('info')">Info</q-btn>
          <q-btn rounded outline no-caps @click="toastBurst()">
            Burst of three
          </q-btn>
        </div>
      </DsEntry>
      <DsEntry id="loading">
        <q-btn
          rounded
          unelevated
          color="primary"
          class="full-width q-mb-md"
          loading
        >
          Continue
          <template #loading><BusyLabel>Creating</BusyLabel></template>
        </q-btn>
        <div class="row items-center q-gutter-sm q-mb-lg text-app-muted">
          <PendingDots />
          <span>Pending or busy: always the three dots</span>
        </div>
        <div class="text-app-muted q-mb-sm">
          Loading: the component draws itself as a skeleton
        </div>
        <MintCard skeleton />
      </DsEntry>
      <DsEntry id="busy-label">
        <div class="column q-gutter-y-sm">
          <q-btn class="full-width" unelevated rounded color="primary" loading
            >Create invoice<template #loading
              ><BusyLabel>Creating invoice</BusyLabel></template
            ></q-btn
          >
          <q-btn class="full-width" outline rounded loading
            >Search for mint backups<template #loading
              ><BusyLabel>Searching</BusyLabel></template
            ></q-btn
          >
          <q-btn flat rounded loading
            >Import<template #loading
              ><BusyLabel>Importing</BusyLabel></template
            ></q-btn
          >
        </div>
      </DsEntry>
      <DsEntry id="empty-state">
        <EmptyState
          :icon="SearchIcon"
          title="No mints found"
          text="Try again, or add a mint you trust by its URL."
        >
          <template #actions>
            <q-btn
              rounded
              unelevated
              color="primary"
              class="full-width app-empty__action"
              >Discover mints</q-btn
            >
          </template>
        </EmptyState>
        <EmptyState
          class="q-mt-md"
          :icon="HistoryIcon"
          title="No history yet"
          text="Payments you send and receive appear here."
        />
      </DsEntry>
      <DsEntry id="blocking-state">
        <BlockingState
          :icon="SearchXIcon"
          title="This page doesn’t exist"
          text="Error 404"
          action="Go back home"
        />
      </DsEntry>
      <DsEntry id="flow-dialog">
        <q-btn rounded outline color="primary" @click="flowOpen = true">
          Open a full-screen flow
        </q-btn>
        <FlowDialog v-model="flowOpen">
          <div class="display-token-fullscreen">
            <FullscreenDialogHeader title="Lightning invoice" />
            <div class="content-area q-px-md">
              <QrBlock value="lnbc1demo" />
              <QrCopyLine text="lnbc10u1p4wytd...spuaqmj0" />
              <AmountHeadline>₿1,000</AmountHeadline>
            </div>
            <FlowFooter>
              <q-btn
                class="full-width"
                unelevated
                color="primary"
                rounded
                @click="flowOpen = false"
                >Copy invoice</q-btn
              >
            </FlowFooter>
          </div>
        </FlowDialog>
      </DsEntry>
      <DsEntry id="bottom-sheet">
        <!-- Shown open in place (inline), with the button that opens the real dialog. -->
        <BottomSheet inline title="Send">
          <template #trailing>
            <IconButton label="Scan" :icon="ScanIcon" />
          </template>
          <div class="column q-gutter-y-sm">
            <SheetOption
              v-for="o in sortOptions"
              :key="o"
              :label="o"
              :selected="sort === o"
              @select="sort = o"
            />
          </div>
        </BottomSheet>
        <q-btn
          rounded
          outline
          color="primary"
          class="q-mt-lg"
          @click="sheetOpen = true"
        >
          Open as a dialog
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
      </DsEntry>
      <DsEntry id="option-row">
        <div class="column q-gutter-y-sm">
          <OptionRow
            label="Lightning"
            caption="Pay or get paid with an invoice"
          >
            <template #icon><ZapIcon :size="24" /></template>
          </OptionRow>
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
      </DsEntry>
      <DsEntry id="confirm-dialog">
        <!-- Shown open in place, with the button that opens the real dialog. -->
        <ConfirmDialog
          inline
          danger
          title="Remove this mint?"
          :summary="[{ label: 'Mint URL', value: 'mint.example.com' }]"
          note="Your ecash from this mint stays on this device."
          confirm-label="Remove mint"
        />
        <q-btn
          rounded
          outline
          color="primary"
          class="q-mt-lg"
          @click="confirmOpen = true"
        >
          Open as a dialog
        </q-btn>
        <ConfirmDialog
          v-model="confirmOpen"
          danger
          title="Remove this mint?"
          :summary="[{ label: 'Mint URL', value: 'mint.example.com' }]"
          note="Your ecash from this mint stays on this device."
          confirm-label="Remove mint"
        />
      </DsEntry>
      <h2 id="ds-group-feature" class="ds-section">Feature components</h2>
      <DsEntry id="history">
        <!-- The current rows (ActivityRow, as HistoryTable draws them) with the same seven
             payments as the variations, then the real empty state. -->
        <q-list class="full-width">
          <ActivityRow
            v-for="h in historySpecimen"
            :key="h.caption + h.amount"
            :direction="h.dir"
            :label="h.label"
            :amount="h.amount"
            :caption="h.caption"
            :pending="h.pending"
            :expired="h.expired"
          />
        </q-list>
        <q-pagination
          :model-value="1"
          :max="7"
          :max-pages="5"
          direction-links
          boundary-numbers
          class="q-mt-md"
        />
        <div class="full-width q-mt-lg"><HistoryTable /></div>
      </DsEntry>
      <DsEntry id="payment-request">
        <!-- The real request body, on a fixed demo request (no store state). -->
        <div class="flow-surface ds-frame ds-frame--screen">
          <PaymentRequestView :request="demoRequest" />
        </div>
      </DsEntry>
      <DsEntry id="mint-review-summary">
        <div class="row q-gutter-lg items-center">
          <MintReviewSummary
            :average="4.5"
            :count="2"
            fallback-label="See reviews"
            @open="toast('info')"
          />
          <MintReviewSummary
            :average="null"
            :count="0"
            fallback-label="No reviews yet"
          />
        </div>
      </DsEntry>
      <DsEntry id="ratings-summary">
        <RatingsSummary :average="4.5" :distribution="{ 5: 8, 4: 3, 3: 1 }" />
        <RatingsSummary skeleton class="q-mt-lg" />
      </DsEntry>
      <DsEntry id="review-item">
        <div class="column">
          <ReviewItem
            author="satoshi"
            date="2 days ago"
            :rating="5"
            comment="Fast and reliable. Swaps settle in seconds."
            :hop="1"
            hop-color="positive"
          />
          <ReviewItem
            author="npub1k3x9…q8h2"
            date="Last week"
            :rating="4"
            comment="Good mint, a little slow at peak times."
            own
          />
          <ReviewItem skeleton />
        </div>
      </DsEntry>
      <DsEntry id="onchain-status">
        <!-- An on-chain receive's one Status row, in order: no deposit yet, confirming,
             confirmed but not yet credited. Paid is the receipt's hero. -->
        <div class="detail-table q-mb-md">
          <DetailRow
            v-for="s in onchainStates"
            :key="s"
            :icon="ActivityIcon"
            label="Status"
            value-class="detail-value--inline"
          >
            <PendingDots size="16px" />{{ s }}
          </DetailRow>
        </div>
        <PaymentStatus state="paid" label="Paid" />
      </DsEntry>
      <DsEntry id="confirmations-row">
        <div class="detail-table">
          <ConfirmationsRow :metadata="null" loading />
          <ConfirmationsRow :metadata="chainPending" />
          <ConfirmationsRow :metadata="chainConfirmed" />
        </div>
      </DsEntry>
      <DsEntry id="pwa-prompt">
        <!-- The prompt is fixed to the viewport; each transformed frame contains one. -->
        <div class="ds-contain ds-phone">
          <div class="ds-phone__balance">₿2,500</div>
          <PwaPrompt ref="pwaIos" platform="ios" />
        </div>
        <div class="ds-contain ds-phone q-mt-md">
          <div class="ds-phone__balance">₿2,500</div>
          <PwaPrompt ref="pwaAndroid" platform="android" />
        </div>
      </DsEntry>
      <DsEntry id="terms-text">
        <div class="ds-scroll settings-card">
          <TermsOfServiceText />
        </div>
      </DsEntry>
      <h2 id="ds-group-layout" class="ds-section">Layout and composition</h2>
      <DsEntry id="reveal-transition">
        <!-- Open and closed, as Mint details' QR code toggles. -->
        <q-btn flat no-caps label="Toggle" @click="revealOpen = !revealOpen" />
        <RevealTransition>
          <div v-if="revealOpen" class="q-pa-md">Revealed block</div>
        </RevealTransition>
      </DsEntry>
      <DsEntry id="flow-column">
        <div class="ds-frame q-py-sm">
          <FlowColumn class="q-px-md">
            <div class="ds-flow-column-sample">Content at the column width</div>
          </FlowColumn>
        </div>
      </DsEntry>
      <DsEntry id="welcome-slide">
        <div class="ds-contain ds-welcome welcome-surface">
          <!-- One column for the body and the footer (16px each side), in the app's mode. -->
          <WelcomeSlideScaffold
            :icon="KeyRoundIcon"
            title="Back up your seed phrase"
            text="Write these words down and keep them somewhere safe. Anyone with them can spend your funds, so never share them or type them into a website."
          >
            <OptionRow
              icon-size="sm"
              label="Restore a wallet"
              caption="From a 12 word seed phrase"
            >
              <template #icon><ZapIcon :size="20" /></template>
            </OptionRow>
            <template #footer>
              <q-btn rounded unelevated color="primary" class="full-width"
                >Next</q-btn
              >
            </template>
          </WelcomeSlideScaffold>
        </div>
      </DsEntry>
      <DsEntry id="flow-footer">
        <!-- Each sample on the flow surface, as in a real flow: one colour, no band. -->
        <div class="column q-gutter-y-md">
          <div class="flow-surface ds-frame">
            <FlowFooter>
              <q-btn class="full-width" unelevated color="primary" rounded
                >Copy invoice</q-btn
              >
            </FlowFooter>
          </div>
          <div class="flow-surface ds-frame">
            <FlowFooter>
              <q-btn
                class="full-width"
                unelevated
                color="primary"
                rounded
                disable
                >Send</q-btn
              >
            </FlowFooter>
          </div>
          <div class="flow-surface ds-frame">
            <FlowFooter>
              <q-btn
                class="full-width"
                unelevated
                rounded
                color="primary"
                loading
                >Pay<template #loading
                  ><BusyLabel>Paying</BusyLabel></template
                ></q-btn
              >
            </FlowFooter>
          </div>
          <div class="flow-surface ds-frame">
            <FlowFooter>
              <!-- The payment request's pair: both full-width halves, both caps. -->
              <div class="row no-wrap" style="gap: 10px">
                <q-btn class="full-width" outline rounded>Share</q-btn>
                <q-btn class="full-width" unelevated rounded color="primary"
                  >Copy</q-btn
                >
              </div>
            </FlowFooter>
          </div>
          <div class="flow-surface ds-frame">
            <FlowFooter>
              <!-- An amount step opened from a preview: back chevron, then the action. -->
              <div class="row no-wrap items-center" style="gap: 8px">
                <q-btn flat round aria-label="Back">
                  <component
                    :is="ChevronLeftIcon"
                    :size="24"
                    class="rtl-flip"
                  />
                </q-btn>
                <q-btn class="full-width" unelevated rounded color="primary"
                  >Create</q-btn
                >
              </div>
            </FlowFooter>
          </div>
          <div class="flow-surface ds-frame">
            <FlowFooter>
              <!-- Receive ecash: later, swap, then receive, stacked. -->
              <q-btn class="full-width q-mb-sm" flat rounded>Later</q-btn>
              <q-btn class="full-width q-mb-sm" outline rounded color="primary"
                >Swap</q-btn
              >
              <q-btn class="full-width" unelevated rounded color="primary"
                >Receive</q-btn
              >
            </FlowFooter>
          </div>
        </div>
      </DsEntry>
    </div>
  </div>
</template>

<script lang="ts">
import PaymentStatus from "src/components/ui/PaymentStatus.vue";
import FlowDialog from "src/components/ui/FlowDialog.vue";
import BusyLabel from "src/components/ui/BusyLabel.vue";
import FlowFooter from "src/components/ui/FlowFooter.vue";
import AmountInputComponent from "src/components/AmountInputComponent.vue";
import ParseInputComponent from "src/components/ParseInputComponent.vue";
import AmountHeadline from "src/components/ui/AmountHeadline.vue";
import { defineComponent, markRaw, reactive } from "vue";
import SettingsSection from "src/pages/settings/SettingsSection.vue";
import AnimatedNumber from "src/components/AnimatedNumber.vue";
import AppRating from "src/components/ui/AppRating.vue";
import AppCallout from "src/components/AppCallout.vue";
import BottomSheet from "src/components/BottomSheet.vue";
import ChooseMint from "src/components/ChooseMint.vue";
import HistoryTable from "src/components/HistoryTable.vue";
import MintIdentityHeader from "src/components/MintIdentityHeader.vue";
import MintInfoContainer from "src/components/MintInfoContainer.vue";
import * as Lucide from "lucide-vue-next";
import { lucideIcons, materialIcons } from "src/design-system/icons";
import { lucideIcon } from "src/js/lucide-icons";
import SheetOption from "src/components/SheetOption.vue";
import SheetSelect from "src/components/SheetSelect.vue";
import MintCard from "src/components/MintCard.vue";
import RatingsSummary from "src/components/RatingsSummary.vue";
import ReviewItem from "src/components/ReviewItem.vue";
import PaymentRequestView from "src/components/PaymentRequestView.vue";
import WalletActions from "src/components/WalletActions.vue";
import AppBadge from "src/components/ui/AppBadge.vue";
import BlockingState from "src/components/ui/BlockingState.vue";
import ConfirmDialog from "src/components/ui/ConfirmDialog.vue";
import CopyField from "src/components/ui/CopyField.vue";
import IconButton from "src/components/ui/IconButton.vue";
import IconCircle from "src/components/ui/IconCircle.vue";
import OptionRow from "src/components/ui/OptionRow.vue";
import PendingDots from "src/components/ui/PendingDots.vue";
import SegmentedControl from "src/components/ui/SegmentedControl.vue";
import { PaymentRequest, PaymentRequestTransportType } from "@cashu/cashu-ts";
import ToggleUnit from "src/components/ToggleUnit.vue";
import ActivityRow from "src/components/ActivityRow.vue";
import AmountKeypadPanel from "src/components/AmountKeypadPanel.vue";
import ConfirmationsRow from "src/components/ConfirmationsRow.vue";
import MintReviewSummary from "src/components/MintReviewSummary.vue";
import PwaPrompt from "src/components/PwaPrompt.vue";
import QrBlock from "src/components/QrBlock.vue";
import QrCopyLine from "src/components/ui/QrCopyLine.vue";
import QrProgress from "src/components/QrProgress.vue";
import TermsOfServiceText from "src/components/TermsOfServiceText.vue";
import CopyButton from "src/components/ui/CopyButton.vue";
import DetailRow from "src/components/ui/DetailRow.vue";
import EmptyState from "src/components/ui/EmptyState.vue";
import FullscreenDialogHeader from "src/components/ui/FullscreenDialogHeader.vue";
import InlineConfirm from "src/components/ui/InlineConfirm.vue";
import SectionDivider from "src/components/ui/SectionDivider.vue";
import SettingsActionRow from "src/components/ui/SettingsActionRow.vue";
import UnitToggle from "src/components/ui/UnitToggle.vue";
import MintCardAction from "src/components/ui/MintCardAction.vue";
import TonalChip from "src/components/ui/TonalChip.vue";
import FlowColumn from "src/components/ui/FlowColumn.vue";
import CjkText from "src/components/ui/CjkText.vue";
import RevealTransition from "src/components/ui/RevealTransition.vue";
import ExpansionIndicator from "src/components/ui/ExpansionIndicator.vue";
import BalanceView from "src/components/BalanceView.vue";
import AmountWarning from "src/components/ui/AmountWarning.vue";
import MetaLine from "src/components/ui/MetaLine.vue";
import RowValue from "src/components/ui/RowValue.vue";
import SettingsLinkRow from "src/components/ui/SettingsLinkRow.vue";
import SettingsRadioRow from "src/components/ui/SettingsRadioRow.vue";
import SettingsToggleRow from "src/components/ui/SettingsToggleRow.vue";
import WelcomeSlideScaffold from "src/components/ui/WelcomeSlideScaffold.vue";
import DsEntry from "src/components/ds/DsEntry.vue";
import DsRail from "src/components/ds/DsRail.vue";
import type { DsBoard } from "src/components/ds/board";
import { DS_GROUPS, DS_ITEMS } from "src/design-system/registry";
import { mapState } from "pinia";
import { useMintsStore } from "src/stores/mints";
import {
  notify,
  notifyError,
  notifySuccess,
  notifyWarning,
} from "src/js/notify";
import {
  ChevronLeft as ChevronLeftIcon,
  Clock as ClockIcon,
  ReceiptText as ReceiptTextIcon,
  Coins as CoinsIcon,
  SearchX as SearchXIcon,
  Copy as CopyIcon,
  Download as DownloadIcon,
  Ellipsis as EllipsisIcon,
  Code as CodeIcon,
  Globe as GlobeIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  KeyRound as KeyRoundIcon,
  Landmark as LandmarkIcon,
  Building2 as MintIcon,
  Vault as VaultIcon,
  EllipsisVertical as EllipsisVerticalIcon,
  Lock as LockIcon,
  Menu as MenuIcon,
  Palette as PaletteIcon,
  Plus as PlusIcon,
  RefreshCw as RefreshCwIcon,
  ScanLine as ScanIcon,
  Search as SearchIcon,
  Shield as ShieldIcon,
  X as XIcon,
  Gauge as GaugeIcon,
  Grid3x3 as Grid3x3Icon,
  Activity as ActivityIcon,
  QrCode as QrCodeIcon,
  ArchiveRestore as ArchiveRestoreIcon,
  Eye as EyeIcon,
  Trash2 as Trash2Icon,
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
  name: "DesignSystemPage",
  mixins: [windowMixin],
  components: {
    RevealTransition,
    ExpansionIndicator,
    BalanceView,
    AmountWarning,
    MetaLine,
    RowValue,
    GaugeIcon,
    Grid3x3Icon,
    QrCodeIcon,
    ArchiveRestoreIcon,
    PaymentStatus,
    FlowDialog,
    BusyLabel,
    FlowFooter,
    AmountHeadline,
    AmountInputComponent,
    ParseInputComponent,
    AppCallout,
    ActivityRow,
    AmountKeypadPanel,
    AnimatedNumber,
    AppRating,
    BottomSheet,
    ConfirmationsRow,
    ChooseMint,
    CopyButton,
    DetailRow,
    DsEntry,
    DsRail,
    EmptyState,
    FullscreenDialogHeader,
    HistoryTable,
    InlineConfirm,
    MintIdentityHeader,
    MintInfoContainer,
    MintReviewSummary,
    PwaPrompt,
    QrBlock,
    QrCopyLine,
    QrProgress,
    SectionDivider,
    SettingsActionRow,
    UnitToggle,
    MintCardAction,
    TonalChip,
    FlowColumn,
    CjkText,
    SettingsLinkRow,
    SettingsRadioRow,
    SettingsSection,
    SettingsToggleRow,
    SheetOption,
    SheetSelect,
    MintCard,
    RatingsSummary,
    ReviewItem,
    PaymentRequestView,
    WalletActions,
    AppBadge,
    BlockingState,
    ConfirmDialog,
    CopyField,
    IconButton,
    IconCircle,
    OptionRow,
    PendingDots,
    SegmentedControl,
    SearchIcon,
    ScanIcon,
    EllipsisIcon,
    XIcon,
    ZapIcon,
    CoinsIcon,
    TermsOfServiceText,
    ToggleUnit,
    WelcomeSlideScaffold,
    DownloadIcon,
    LockIcon,
    PlusIcon,
  },
  setup() {
    // Icons passed as props in the samples.
    return {
      CoinsIcon: markRaw(CoinsIcon),
      CodeIcon: markRaw(CodeIcon),
      GlobeIcon: markRaw(GlobeIcon),
      HistoryIcon: markRaw(HistoryIcon),
      KeyRoundIcon: markRaw(KeyRoundIcon),
      LandmarkIcon: markRaw(LandmarkIcon),
      MintIcon: markRaw(MintIcon),
      VaultIcon: markRaw(VaultIcon),
      EllipsisVerticalIcon: markRaw(EllipsisVerticalIcon),
      InfoIcon: markRaw(InfoIcon),
      SearchIcon: markRaw(SearchIcon),
      ZapIcon: markRaw(ZapIcon),
      XIcon: markRaw(XIcon),
      ChevronLeftIcon: markRaw(ChevronLeftIcon),
      ActivityIcon: markRaw(ActivityIcon),
      MenuIcon: markRaw(MenuIcon),
      RefreshCwIcon: markRaw(RefreshCwIcon),
      EllipsisIcon: markRaw(EllipsisIcon),
      CopyIcon: markRaw(CopyIcon),
      ScanIcon: markRaw(ScanIcon),
      SearchXIcon: markRaw(SearchXIcon),
      PlusIconRaw: markRaw(PlusIcon),
      EyeIcon: markRaw(EyeIcon),
      Trash2Icon: markRaw(Trash2Icon),
    };
  },
  provide() {
    // Entries read the search and the entry in view from here.
    const page = this as unknown as {
      active: string;
      matches: (id: string) => boolean;
    };
    const board: DsBoard = reactive({
      get active() {
        return page.active;
      },
      matches: (id: string) => page.matches(id),
    });
    return { dsBoard: board };
  },
  data() {
    const sortOptions = ["Newest", "Oldest", "Highest rated", "Lowest rated"];
    return {
      revealOpen: true,
      historySpecimen: [
        {
          dir: "in",
          label: "Received",
          amount: "+₿5,000",
          caption: ["Lightning", "Today, 14:02"],
        },
        {
          dir: "out",
          label: "Sending",
          amount: "−₿210",
          caption: ["Ecash", "Today, 13:40"],
          pending: true,
        },
        {
          dir: "out",
          label: "Sent",
          amount: "−₿101",
          caption: ["Lightning", "Yesterday"],
        },
        {
          dir: "in",
          label: "Received",
          amount: "+₿500",
          caption: ["Ecash", "Yesterday"],
        },
        {
          dir: "in",
          label: "Invoice expired",
          amount: "₿1,000",
          caption: ["Lightning", "Mon"],
          expired: true,
        },
        {
          dir: "in",
          label: "Received",
          amount: "+₿2,289",
          caption: ["Lightning", "12 Oct"],
        },
        {
          dir: "out",
          label: "Sent",
          amount: "−₿42",
          caption: ["Ecash", "10 Oct"],
        },
      ],
      calloutSpecimen: [
        { variant: "neutral", text: "Neutral advice for the next step." },
        { variant: "info", text: "Swapping costs a small Lightning fee." },
        { variant: "success", text: "Backup confirmed." },
        {
          variant: "warning",
          title: "Experimental feature",
          text: "Paying from several mints can fail part way.",
        },
        { variant: "danger", text: "This token is locked to a different key." },
        {
          variant: "info",
          title: "Mint message",
          text: "Maintenance tonight from 22:00 UTC.",
          dismissible: true,
        },
      ],
      toastSpecimen: [
        {
          type: "positive",
          icon: lucideIcon(Lucide.CircleCheck),
          message: "Received ₿500",
        },
        {
          type: "negative",
          icon: lucideIcon(Lucide.CircleAlert),
          message: "Payment failed",
          caption: "The mint didn't respond. Try again.",
        },
        {
          type: "warning",
          icon: lucideIcon(Lucide.TriangleAlert),
          message: "Mint is offline",
        },
        {
          type: "info",
          icon: lucideIcon(Lucide.Info),
          message: "Copied to clipboard",
        },
        {
          type: "neutral",
          icon: lucideIcon(Lucide.Trash2),
          message: "Mint removed",
          action: "Undo",
        },
      ],
      lucideIcons,
      materialIcons,
      query: "",
      active: "",
      pinned: "",
      groups: DS_GROUPS,
      radii: ["sm", "md", "lg", "xl", "pill"],
      keypadAmount: 1000 as number | null,
      onchainStates: [
        "Waiting for payment",
        "Confirming (1/3)",
        "Issuing ecash",
      ],
      chainPending: {
        txid: "demo",
        confirmed: false,
        confirmations: 1,
        confirmationThreshold: 3,
        url: "",
      },
      chainConfirmed: {
        txid: "demo",
        confirmed: true,
        confirmations: 3,
        confirmationThreshold: 3,
        url: "",
      },
      modes: [
        { label: "Dark", dark: true },
        { label: "Light", dark: false },
      ],
      themes: THEMES,
      theme: this.$q.localStorage.getItem("cashu.theme") || "monochrome",
      tokens: [
        "--app-text",
        "--app-text-muted",
        "--app-text-subtle",
        "--app-surface",
        "--app-raised",
        "--app-tint",
        "--app-tint-strong",
        "--app-border",
        "--app-border-strong",
        "--q-primary",
        "--app-card-fill-active",
        "--app-field-edge",
        "--app-info",
        "--app-success",
        "--app-warning",
        "--app-danger",
      ],
      sortOptions,
      sortSheetOptions: sortOptions.map((o) => ({ label: o, value: o })),
      sort: "Newest",
      sheetOpen: false,
      flowOpen: false,
      confirmOpen: false,
      invoiceType: "bolt11",
      url: "",
      nickname: "",
      filled: "https://mint.example.com",
      memo: "",
      bad: "₿5,000",
      parseText: "",
      longInvoice:
        "lnbc10u1pjxyz0pp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq5xysxxatsyp3k7enxv4jsxqzpusp5zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zygs",
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
      // A fixed request for the payment request sample: ₿2,500, any mint.
      demoRequest: new PaymentRequest(
        [
          {
            type: PaymentRequestTransportType.NOSTR,
            target: "nprofile1qqsdemo",
            tags: [["n", "17"]],
          },
        ],
        "demo",
        2500,
        "sat"
      ).toEncodedRequest(),
      unitPick: "sat",
      qrCopied: false,
      cards: [
        {
          url: "https://mint.example.com",
          name: "Example Mint",
          balances: ["₿2,289"],
          average: 4.5,
          count: 2,
          installed: true,
          active: true,
          selected: true,
        },
        {
          url: "https://mint-c.example.com",
          name: "Mint C (switching to it)",
          balances: ["₿500", "$0.50"],
          average: null,
          count: 0,
          installed: true,
          busy: true,
        },
        {
          url: "https://selected-busy.example.com",
          name: "Selected and switching: the ring wins",
          balances: ["₿21"],
          average: null,
          count: 0,
          installed: true,
          active: true,
          selected: true,
          busy: true,
        },
        {
          url: "https://a-very-long-mint-host-name.example.com",
          name: "A mint with a very long name that has to end in an ellipsis",
          iconUrl: "missing.png",
          balances: ["₿0"],
          average: 3.5,
          count: 4,
          installed: true,
        },
        {
          url: "https://lantern.example.com",
          name: "Lantern",
          balances: [],
          average: 4.0,
          count: 1,
          add: true,
        },
        {
          url: "https://restore.example.com",
          name: "Restore Mint",
          balances: ["₿1,200"],
          average: null,
          count: 0,
          check: true,
        },
      ],
      mintGlyphs: [
        { name: "account_balance (main)", icon: null, chosen: false },
        { name: "Landmark", icon: markRaw(LandmarkIcon), chosen: false },
        { name: "Building2 (ships)", icon: markRaw(MintIcon), chosen: true },
        { name: "Vault", icon: markRaw(VaultIcon), chosen: false },
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
        { name: "Fee paid", value: "₿1", icon: ReceiptTextIcon },
        { name: "Paid at", value: "Oct 27, 2026, 8:35 AM", icon: ClockIcon },
        { name: "Mint", value: "mint.example.com", icon: MintIcon },
      ],
    };
  },
  computed: {
    ...mapState(useMintsStore, ["mints"]),
    themeOptions() {
      return this.themes.map((t: string) => ({
        value: t,
        label: t.charAt(0).toUpperCase() + t.slice(1),
      }));
    },
    railGroups() {
      return DS_GROUPS.map((g) => ({
        ...g,
        items: DS_ITEMS.filter((i) => i.group === g.id),
      }));
    },
    anyMatch(): boolean {
      return DS_ITEMS.some((i) => this.matches(i.id));
    },
  },
  watch: {
    // Search can hide the entry in view; the next visible one becomes active.
    query() {
      this.$nextTick(() => this.updateActive());
    },
  },
  mounted() {
    // The entry in view is the last one whose top has passed a line a third down the screen.
    window.addEventListener("scroll", this.updateActive, { passive: true });
    window.addEventListener("hashchange", this.followHash);
    for (const e of ["wheel", "touchstart", "keydown"])
      window.addEventListener(e, this.unpin, { passive: true });
    // Follow a deep link once the router has restored its own scroll position.
    this.$router.isReady().then(() => window.setTimeout(this.followHash, 300));
    this.$nextTick(() => {
      this.updateActive();
      // Show the copied state of the second copy button.
      const copied = this.$refs.copied as { copied: boolean } | undefined;
      if (copied) copied.copied = true;
      // The install prompt only opens itself in an installable browser; show it here.
      for (const ref of ["pwaIos", "pwaAndroid"]) {
        const pwa = this.$refs[ref] as { show: boolean } | undefined;
        if (pwa) pwa.show = true;
      }
      // …and give Android a stand-in for the browser's install offer, for its Install button.
      const android = this.$refs.pwaAndroid as
        | { deferredPrompt: unknown }
        | undefined;
      if (android) {
        android.deferredPrompt = {
          prompt: async () => undefined,
          userChoice: new Promise(() => undefined),
        };
      }
    });
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.updateActive);
    window.removeEventListener("hashchange", this.followHash);
    for (const e of ["wheel", "touchstart", "keydown"])
      window.removeEventListener(e, this.unpin);
  },
  methods: {
    lucideComponent(name: string) {
      return (Lucide as unknown as Record<string, unknown>)[name];
    },
    matches(id: string): boolean {
      const q = (this.query || "").trim().toLowerCase();
      if (!q) return true;
      const item = DS_ITEMS.find((i) => i.id === id);
      return (
        !!item &&
        [item.name, item.source, item.tier, item.group, item.id].some((s) =>
          s.toLowerCase().includes(q)
        )
      );
    },
    entries(): HTMLElement[] {
      return Array.from(
        (this.$refs.page as HTMLElement).querySelectorAll<HTMLElement>(
          "[data-ds-entry]"
        )
      ).filter((el) => el.offsetParent !== null);
    },
    unpin() {
      if (this.pinned) {
        this.pinned = "";
        this.updateActive();
      }
    },
    updateActive() {
      if (this.pinned) return;
      const line = window.innerHeight / 3;
      let current = "";
      for (const el of this.entries()) {
        if (el.getBoundingClientRect().top - line > 0) break;
        current = el.dataset.dsEntry || "";
      }
      this.active = current || this.entries()[0]?.dataset.dsEntry || "";
    },
    go(id: string) {
      const el = document.getElementById(`ds-${id}`);
      if (!el) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      el.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
      el.focus({ preventScroll: true });
      history.replaceState(history.state, "", `#ds-${id}`);
      // Hold the clicked entry active while the page scrolls to it (the last entries can't
      // reach the top, so the scroll position alone would pick an earlier one).
      this.active = id;
      this.pinned = id;
      // The pin lifts as soon as the reader scrolls themselves.
      window.setTimeout(() => (this.pinned = ""), reduce ? 50 : 3000);
    },
    followHash() {
      const id = decodeURIComponent(location.hash.replace(/^#ds-/, ""));
      if (id && DS_ITEMS.some((i) => i.id === id)) this.go(id);
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
    // The real queue: three at once keep the newest two, newest on top.
    toastBurst() {
      notifySuccess("Received ₿500");
      notifyWarning("This mint is offline");
      notifyError("Couldn't reach the mint", "Check your connection.");
    },
  },
});
</script>

<!-- Unscoped, as in MintSettings: the shared mint list styles (unit badges, mint names). -->
<style>
@import "src/css/mintlist.css";
</style>

<style scoped>
/* Layout: the board keeps the app's page column, clear of the rail on the far left. */
.ds-page {
  padding-inline-start: 56px !important;
}
@media (max-width: 599px) {
  .ds-page {
    padding-inline-start: 36px !important;
  }
}
/* The board is wider than the app's column so each stage has room around its sample; the
   samples themselves keep the app column inside their stage. */
.ds-page .ui-kit-main {
  margin: 0 auto;
  max-width: 920px;
}
.ds-section {
  color: var(--app-text-muted);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  margin: 96px 0 40px;
  text-transform: uppercase;
  scroll-margin-top: 96px;
}
.ds-radius {
  align-items: flex-end;
  background: var(--app-tint-strong);
  display: flex;
  height: 64px;
  justify-content: center;
  padding-bottom: 6px;
  width: 64px;
}
.ds-radius code {
  font-size: 11px;
}
.ds-radius--shadow {
  background: var(--app-raised);
  border-radius: var(--app-radius-lg);
  box-shadow: var(--app-shadow-md);
}
.ds-radius--ring {
  border-radius: var(--app-radius-lg);
  box-shadow: var(--app-focus-ring);
}
.ds-flow-column-sample {
  background: var(--app-tint);
  border-radius: var(--app-radius-sm);
  padding: 12px;
  text-align: center;
}
.ds-frame {
  border: 1px dashed var(--app-border-strong);
  border-radius: var(--app-radius-lg);
  position: relative;
}
/* Light-theme variants L2 and L3: page colours to compare against L1 in light mode. */
body.body--light .ds-light-variant--l2 {
  --app-field-edge: color-mix(in srgb, var(--app-text) 48%, transparent);
  background: #f6f6f7;
}
body.body--light .ds-light-variant--l2 .ds-light-variant__card {
  background: #fff;
}
body.body--light .ds-light-variant--l3 {
  background: #faf9f7;
}
.ds-light-variant__card {
  background: var(--app-card-fill);
  border-radius: var(--app-radius-lg);
}
/* A sample on the raised (sheet) surface, where fields take the stronger sheet edge. */
.ds-raised {
  background: var(--app-raised) !important;
  box-shadow: none;
}
.ds-keypad {
  max-width: 360px;
}
.ds-qr-progress {
  max-width: 240px;
}
.ds-tooltip-stage {
  display: flex;
  justify-content: center;
  padding-top: 48px;
}
/* A transform makes fixed children (the install prompt) position inside the frame. */
.ds-contain {
  border-radius: var(--app-radius-lg);
  min-height: 140px;
  overflow: hidden;
  position: relative;
  transform: translateZ(0);
}
.ds-welcome {
  height: 560px;
}
.ds-seed-mask {
  font-family: monospace;
  line-height: 1.8;
  padding: 2px 0 12px;
}
/* Scrolling text fades out at the bottom edge, so a cut line reads as "more below". */
.ds-scroll {
  -webkit-mask-image: linear-gradient(black calc(100% - 48px), transparent);
  mask-image: linear-gradient(black calc(100% - 48px), transparent);
  max-height: 320px;
  overflow-y: auto;
  padding: 20px 20px 40px;
}
.ui-kit-display {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ui-kit-display__field {
  flex: 1 1 180px;
}
.ui-kit-bar {
  background: var(--app-surface, #000);
  margin: 12px -16px 0;
  padding: 10px 16px 8px;
  position: sticky;
  top: 0;
  z-index: 5;
  border-bottom: 1px solid var(--app-border);
}
.ui-kit-bar__sections {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}
.ui-kit-bar__sections a {
  flex: none;
  text-decoration: none;
}
.ui-kit-section {
  margin: 40px 0 16px;
  padding-top: 16px;
  border-top: 1px solid var(--app-border);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  scroll-margin-top: 120px;
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
.ui-kit-toast {
  position: static;
  margin: 0;
}
.ui-kit-item-title {
  font-size: 15px;
  font-weight: 600;
}
.ds-icons {
  width: 100%;
}
.ds-mint-glyphs__row {
  align-items: center;
  color: var(--app-text-muted);
  display: flex;
  gap: 16px;
  min-height: 48px;
}
.ds-mint-glyphs__row--chosen {
  color: var(--app-text);
}
.ds-mint-glyphs__name {
  width: 180px;
}
.ds-icons__head {
  color: var(--app-text-muted);
  font-size: 13px;
  margin-bottom: 10px;
}
.ds-icons__grid {
  display: grid;
  gap: 6px;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
}
.ds-icons__cell {
  align-items: center;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  color: var(--app-text);
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 76px;
  padding: 12px 4px 8px;
  position: relative;
}
.ds-icons__cell--off {
  border-style: dashed;
  color: var(--app-text-muted);
}
.ds-icons__name {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ds-icons__count {
  color: var(--app-text-subtle);
  font-size: 10px;
  inset-inline-end: 6px;
  position: absolute;
  top: 4px;
}
.ds-toast-stack {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.ds-phone {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  height: 360px;
  width: 100%;
}
.ds-phone__balance {
  font-size: 28px;
  font-weight: 700;
  padding-top: 48px;
  text-align: center;
}
</style>
