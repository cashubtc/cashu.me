<!-- Payment request explorations for the design system board: a static mock of the current
     PaymentRequestDialog (0) and seven whole alternative layouts (1-7). Every variation shows
     the same specimen twice: a full sheet asking for ₿2,500 into mint.example.com, then a
     smaller frame of the open (any amount, any mint) request. Each frame keeps its own local
     state, so the amount, currency, mint, tabs, drawer and steps can be tried on the board.
     Board-only: nothing in the app uses these until one is chosen. Tokens only; the QR keeps
     its white plate. -->
<template>
  <div class="xp" :class="`xp--v${variant}`">
    <figure
      v-for="f in frames"
      :key="f.key"
      class="xp-frame"
      :class="{ 'xp-frame--compact': f.compact }"
    >
      <figcaption class="xp-caption">
        {{ f.compact ? "Open request" : "Fixed amount" }}
      </figcaption>
      <div class="xp-phone">
        <div v-if="!f.compact" class="xp-wallet" aria-hidden="true">
          <span class="xp-wallet__balance">₿48,210</span>
        </div>
        <div class="xp-sheet" :style="{ '--xp-qr': qrSize(f) }">
          <!-- Header: close, title and (in most variations) one trailing action. -->
          <div class="xp-head">
            <q-btn flat round class="xp-icon-btn" aria-label="Close">
              <XIcon :size="22" />
            </q-btn>
            <div class="xp-title">Payment request</div>
            <q-btn
              v-if="headAction(f) === 'new'"
              flat
              round
              class="xp-icon-btn"
              aria-label="New request"
              @click="newRequest(f)"
            >
              <RefreshCwIcon :size="20" />
            </q-btn>
            <q-btn
              v-else-if="headAction(f) === 'share'"
              flat
              round
              class="xp-icon-btn"
              aria-label="Share"
            >
              <ShareIcon :size="20" />
            </q-btn>
            <span v-else class="xp-icon-spacer" />
          </div>

          <!-- 0 Current: QR, amount pill, mint and unit chips, new request, Copy. -->
          <template v-if="variant === 0">
            <QrBlock :value="qrValue(f)" class="xp-qr" />
            <div class="xp-v0-controls">
              <div class="xp-row-center">
                <q-btn
                  outline
                  rounded
                  no-caps
                  class="xp-v0-pill"
                  @click="f.amount === null && addAmount(f)"
                >
                  <PencilLineIcon :size="16" class="q-mr-sm" />
                  {{ amountText(f) || "Add amount" }}
                </q-btn>
                <q-btn
                  v-if="f.amount !== null"
                  flat
                  round
                  class="xp-icon-btn"
                  aria-label="Remove amount"
                  @click="f.amount = null"
                >
                  <XIcon :size="20" />
                </q-btn>
              </div>
              <div class="xp-row-center xp-gap-8">
                <button type="button" class="mint-chip" @click="cycleMint(f)">
                  <LandmarkIcon :size="14" class="mint-chip__icon" />
                  <span class="mint-chip__name">{{ mintText(f) }}</span>
                  <ChevronDownIcon :size="16" class="mint-chip__icon" />
                </button>
                <button type="button" class="mint-chip" @click="cycleUnit(f)">
                  <span class="mint-chip__name">{{ f.unit }}</span>
                  <ChevronDownIcon :size="16" class="mint-chip__icon" />
                </button>
              </div>
              <q-btn
                flat
                rounded
                no-caps
                class="xp-quiet-btn"
                @click="newRequest(f)"
              >
                <RefreshCwIcon :size="16" class="q-mr-sm" />
                New request
              </q-btn>
            </div>
            <div class="xp-foot">
              <q-btn
                unelevated
                rounded
                no-caps
                color="primary"
                class="full-width"
                label="Copy"
              />
            </div>
          </template>

          <!-- 1 Settings rows: QR and text on top, then an inset list like iOS Settings. -->
          <template v-else-if="variant === 1">
            <QrBlock :value="qrValue(f)" class="xp-qr" />
            <div class="xp-code-row">
              <span class="xp-code">{{ codeText(f) }}</span>
              <q-btn flat round class="xp-icon-btn" aria-label="Copy request">
                <CopyIcon :size="18" />
              </q-btn>
            </div>
            <div class="xp-group">
              <button
                type="button"
                class="xp-list-row"
                @click="f.amount === null && addAmount(f)"
              >
                <span class="xp-list-row__label">Amount</span>
                <span
                  class="xp-list-row__value"
                  :class="{ 'xp-muted': f.amount === null }"
                  >{{ amountText(f) || "Any amount" }}</span
                >
                <span
                  v-if="f.amount !== null"
                  role="button"
                  tabindex="0"
                  class="xp-row-clear"
                  aria-label="Remove amount"
                  @click.stop="f.amount = null"
                >
                  <XIcon :size="16" />
                </span>
                <ChevronRightIcon v-else :size="20" class="xp-chev" />
              </button>
              <div class="xp-list-row">
                <span class="xp-list-row__label">Currency</span>
                <div class="xp-seg xp-seg--mini" role="radiogroup">
                  <button
                    v-for="u in units"
                    :key="u"
                    type="button"
                    role="radio"
                    class="xp-seg__item"
                    :aria-checked="f.unit === u"
                    :class="{ 'xp-seg__item--on': f.unit === u }"
                    @click="setUnit(f, u)"
                  >
                    {{ u }}
                  </button>
                </div>
              </div>
              <button type="button" class="xp-list-row" @click="cycleMint(f)">
                <span class="xp-list-row__label">Mint</span>
                <span
                  class="xp-list-row__value"
                  :class="{ 'xp-muted': f.mint === null }"
                  >{{ mintText(f) }}</span
                >
                <ChevronRightIcon :size="20" class="xp-chev" />
              </button>
            </div>
            <div class="xp-group">
              <button
                type="button"
                class="xp-list-row xp-list-row--action"
                @click="newRequest(f)"
              >
                <RefreshCwIcon :size="18" />
                <span class="xp-list-row__label">New request</span>
              </button>
            </div>
            <div class="xp-foot">
              <q-btn
                unelevated
                rounded
                no-caps
                color="primary"
                class="full-width"
                label="Copy request"
              />
            </div>
          </template>

          <!-- 2 Hero amount: the amount is the headline, edited in place above the QR. -->
          <template v-else-if="variant === 2">
            <div class="xp-v2-hero">
              <span class="xp-overline">{{
                f.amount === null ? "Payer chooses the amount" : "Requesting"
              }}</span>
              <div class="xp-row-center">
                <button
                  v-if="f.amount !== null"
                  type="button"
                  class="xp-v2-amount"
                  aria-label="Edit amount"
                >
                  {{ amountText(f) }}
                </button>
                <q-btn
                  v-else
                  outline
                  rounded
                  no-caps
                  class="xp-v2-add"
                  @click="addAmount(f)"
                >
                  <PlusIcon :size="18" class="q-mr-xs" />
                  Add amount
                </q-btn>
                <q-btn
                  v-if="f.amount !== null"
                  flat
                  round
                  class="xp-icon-btn xp-v2-clear"
                  aria-label="Remove amount"
                  @click="f.amount = null"
                >
                  <XIcon :size="18" />
                </q-btn>
              </div>
              <div class="xp-seg" role="radiogroup">
                <button
                  v-for="u in units"
                  :key="u"
                  type="button"
                  role="radio"
                  class="xp-seg__item"
                  :aria-checked="f.unit === u"
                  :class="{ 'xp-seg__item--on': f.unit === u }"
                  @click="setUnit(f, u)"
                >
                  {{ u }}
                </button>
              </div>
            </div>
            <QrBlock :value="qrValue(f)" class="xp-qr" />
            <div class="xp-row-center xp-v2-mint">
              <span class="xp-muted">Into</span>
              <button type="button" class="mint-chip" @click="cycleMint(f)">
                <LandmarkIcon :size="14" class="mint-chip__icon" />
                <span class="mint-chip__name">{{ mintText(f) }}</span>
                <ChevronDownIcon :size="16" class="mint-chip__icon" />
              </button>
            </div>
            <div class="xp-foot xp-foot--pair">
              <q-btn outline rounded no-caps class="full-width">
                <ShareIcon :size="18" class="q-mr-sm" />
                Share
              </q-btn>
              <q-btn
                unelevated
                rounded
                no-caps
                color="primary"
                class="full-width"
              >
                <CopyIcon :size="18" class="q-mr-sm" />
                Copy
              </q-btn>
            </div>
          </template>

          <!-- 3 Segmented header: fixed amount or any amount decides what the form shows. -->
          <template v-else-if="variant === 3">
            <div class="xp-pad">
              <div class="xp-seg xp-seg--wide" role="radiogroup">
                <button
                  type="button"
                  role="radio"
                  class="xp-seg__item"
                  :aria-checked="f.amount !== null"
                  :class="{ 'xp-seg__item--on': f.amount !== null }"
                  @click="f.amount === null && addAmount(f)"
                >
                  Set amount
                </button>
                <button
                  type="button"
                  role="radio"
                  class="xp-seg__item"
                  :aria-checked="f.amount === null"
                  :class="{ 'xp-seg__item--on': f.amount === null }"
                  @click="f.amount = null"
                >
                  Any amount
                </button>
              </div>
              <div class="xp-field xp-v3-amount">
                <span v-if="f.amount !== null" class="xp-v3-figure">{{
                  amountText(f)
                }}</span>
                <span v-else class="xp-v3-hint">The payer chooses</span>
                <button
                  type="button"
                  class="mint-chip xp-v3-unit"
                  @click="cycleUnit(f)"
                >
                  <span class="mint-chip__name">{{ f.unit }}</span>
                  <ChevronDownIcon :size="16" class="mint-chip__icon" />
                </button>
              </div>
              <button
                type="button"
                class="xp-field xp-v3-mint"
                @click="cycleMint(f)"
              >
                <span class="xp-v3-mint__label">Receive into</span>
                <LandmarkIcon :size="16" class="xp-muted" />
                <span class="xp-v3-mint__name">{{ mintText(f) }}</span>
                <ChevronDownIcon :size="20" class="xp-chev" />
              </button>
            </div>
            <QrBlock :value="qrValue(f)" class="xp-qr" />
            <div class="xp-code xp-code--center">{{ codeText(f) }}</div>
            <div class="xp-foot xp-foot--lead">
              <q-btn
                unelevated
                rounded
                no-caps
                color="primary"
                class="full-width"
              >
                <CopyIcon :size="18" class="q-mr-sm" />
                Copy request
              </q-btn>
              <q-btn outline round class="xp-round-52" aria-label="Share"
                ><ShareIcon :size="20"
              /></q-btn>
            </div>
          </template>

          <!-- 4 Tabs: Request (QR, summary, share) and Settings (every control). -->
          <template v-else-if="variant === 4">
            <div class="xp-tabs" role="tablist">
              <button
                v-for="t in ['request', 'settings']"
                :key="t"
                type="button"
                role="tab"
                class="xp-tab"
                :aria-selected="f.tab === t"
                :class="{ 'xp-tab--on': f.tab === t }"
                @click="f.tab = t"
              >
                {{ t === "request" ? "Request" : "Settings" }}
              </button>
            </div>
            <template v-if="f.tab === 'request'">
              <QrBlock :value="qrValue(f)" class="xp-qr" />
              <div class="xp-v4-summary">
                <div class="xp-v4-amount">
                  {{ amountText(f) || "Any amount" }}
                </div>
                <div class="xp-muted">
                  {{ f.unit }} · {{ mintText(f) }}
                  <button
                    type="button"
                    class="xp-link"
                    @click="f.tab = 'settings'"
                  >
                    Edit
                  </button>
                </div>
              </div>
              <div class="xp-code-row">
                <span class="xp-code">{{ codeText(f) }}</span>
                <q-btn flat round class="xp-icon-btn" aria-label="Copy request">
                  <CopyIcon :size="18" />
                </q-btn>
              </div>
              <div class="xp-foot xp-foot--pair">
                <q-btn outline rounded no-caps class="full-width">
                  <ShareIcon :size="18" class="q-mr-sm" />
                  Share
                </q-btn>
                <q-btn
                  unelevated
                  rounded
                  no-caps
                  color="primary"
                  class="full-width"
                >
                  <CopyIcon :size="18" class="q-mr-sm" />
                  Copy
                </q-btn>
              </div>
            </template>
            <div v-else class="xp-pad xp-v4-settings">
              <div class="xp-label">Amount</div>
              <div class="xp-field">
                <span
                  class="xp-v4-field-value"
                  :class="{ 'xp-muted': f.amount === null }"
                  >{{ amountText(f) || "Any amount" }}</span
                >
                <q-btn
                  v-if="f.amount !== null"
                  flat
                  round
                  class="xp-icon-btn"
                  aria-label="Remove amount"
                  @click="f.amount = null"
                  ><XIcon :size="18"
                /></q-btn>
                <button
                  v-else
                  type="button"
                  class="xp-link"
                  @click="addAmount(f)"
                >
                  Add
                </button>
              </div>
              <div class="xp-label">Currency</div>
              <div class="xp-seg xp-seg--wide" role="radiogroup">
                <button
                  v-for="u in units"
                  :key="u"
                  type="button"
                  role="radio"
                  class="xp-seg__item"
                  :aria-checked="f.unit === u"
                  :class="{ 'xp-seg__item--on': f.unit === u }"
                  @click="setUnit(f, u)"
                >
                  {{ u }}
                </button>
              </div>
              <div class="xp-label">Receive into</div>
              <div class="xp-group xp-group--flush" role="radiogroup">
                <button
                  v-for="m in mintChoices"
                  :key="m.label"
                  type="button"
                  role="radio"
                  class="xp-list-row"
                  :aria-checked="f.mint === m.url"
                  @click="f.mint = m.url"
                >
                  <LandmarkIcon :size="18" class="xp-muted" />
                  <span class="xp-list-row__label">{{ m.label }}</span>
                  <CheckIcon
                    v-if="f.mint === m.url"
                    :size="20"
                    class="xp-check"
                  />
                </button>
              </div>
              <q-btn
                flat
                rounded
                no-caps
                class="xp-quiet-btn xp-v4-new"
                @click="newRequest(f)"
              >
                <RefreshCwIcon :size="16" class="q-mr-sm" />
                Start a new request
              </q-btn>
            </div>
          </template>

          <!-- 5 QR first: the code fills the sheet; details live in a drawer at the foot. -->
          <template v-else-if="variant === 5">
            <QrBlock :value="qrValue(f)" class="xp-qr" />
            <div class="xp-code xp-code--center">{{ codeText(f) }}</div>
            <div class="xp-drawer" :class="{ 'xp-drawer--open': f.drawer }">
              <button
                type="button"
                class="xp-drawer__summary"
                :aria-expanded="f.drawer"
                @click="f.drawer = !f.drawer"
              >
                <span class="xp-drawer__grip" aria-hidden="true" />
                <span class="xp-drawer__line">
                  <strong>{{ amountText(f) || "Any amount" }}</strong>
                  <span class="xp-muted"> · {{ mintText(f) }}</span>
                </span>
                <ChevronUpIcon :size="20" class="xp-chev xp-drawer__chev" />
              </button>
              <div v-if="f.drawer" class="xp-drawer__body">
                <div class="xp-list-row xp-list-row--plain">
                  <span class="xp-list-row__label">Amount</span>
                  <span
                    class="xp-list-row__value"
                    :class="{ 'xp-muted': f.amount === null }"
                    >{{ amountText(f) || "Any amount" }}</span
                  >
                  <button
                    type="button"
                    class="xp-link"
                    @click="
                      f.amount === null ? addAmount(f) : (f.amount = null)
                    "
                  >
                    {{ f.amount === null ? "Add" : "Remove" }}
                  </button>
                </div>
                <div class="xp-list-row xp-list-row--plain">
                  <span class="xp-list-row__label">Currency</span>
                  <div class="xp-seg xp-seg--mini" role="radiogroup">
                    <button
                      v-for="u in units"
                      :key="u"
                      type="button"
                      role="radio"
                      class="xp-seg__item"
                      :aria-checked="f.unit === u"
                      :class="{ 'xp-seg__item--on': f.unit === u }"
                      @click="setUnit(f, u)"
                    >
                      {{ u }}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  class="xp-list-row xp-list-row--plain"
                  @click="cycleMint(f)"
                >
                  <span class="xp-list-row__label">Mint</span>
                  <span
                    class="xp-list-row__value"
                    :class="{ 'xp-muted': f.mint === null }"
                    >{{ mintText(f) }}</span
                  >
                  <ChevronRightIcon :size="20" class="xp-chev" />
                </button>
                <button
                  type="button"
                  class="xp-list-row xp-list-row--plain xp-list-row--action"
                  @click="newRequest(f)"
                >
                  <RefreshCwIcon :size="18" />
                  <span class="xp-list-row__label">New request</span>
                </button>
              </div>
              <div class="xp-foot xp-foot--pair xp-foot--inset">
                <q-btn outline rounded no-caps class="full-width">
                  <ShareIcon :size="18" class="q-mr-sm" />
                  Share
                </q-btn>
                <q-btn
                  unelevated
                  rounded
                  no-caps
                  color="primary"
                  class="full-width"
                >
                  <CopyIcon :size="18" class="q-mr-sm" />
                  Copy
                </q-btn>
              </div>
            </div>
          </template>

          <!-- 6 Chip toolbar and a floating action bar: every setting is one chip. -->
          <template v-else-if="variant === 6">
            <QrBlock :value="qrValue(f)" class="xp-qr" />
            <div class="xp-code xp-code--center">{{ codeText(f) }}</div>
            <div class="xp-v6-chips">
              <span v-if="f.amount !== null" class="mint-chip xp-v6-amount">
                <span class="mint-chip__name">{{ amountText(f) }}</span>
                <button
                  type="button"
                  class="xp-v6-chip-x"
                  aria-label="Remove amount"
                  @click="f.amount = null"
                >
                  <XIcon :size="16" />
                </button>
              </span>
              <button
                v-else
                type="button"
                class="mint-chip xp-v6-dashed"
                @click="addAmount(f)"
              >
                <PlusIcon :size="16" class="mint-chip__icon" />
                <span class="mint-chip__name">Amount</span>
              </button>
              <button type="button" class="mint-chip" @click="cycleUnit(f)">
                <span class="mint-chip__name">{{ f.unit }}</span>
                <ChevronDownIcon :size="16" class="mint-chip__icon" />
              </button>
              <button
                type="button"
                class="mint-chip xp-v6-mint"
                @click="cycleMint(f)"
              >
                <LandmarkIcon :size="14" class="mint-chip__icon" />
                <span class="mint-chip__name">{{ mintText(f) }}</span>
                <ChevronDownIcon :size="16" class="mint-chip__icon" />
              </button>
            </div>
            <div class="xp-v6-bar">
              <q-btn
                flat
                round
                class="xp-icon-btn"
                aria-label="New request"
                @click="newRequest(f)"
                ><RefreshCwIcon :size="20"
              /></q-btn>
              <q-btn flat round class="xp-icon-btn" aria-label="Share"
                ><ShareIcon :size="20"
              /></q-btn>
              <q-btn
                unelevated
                rounded
                no-caps
                color="primary"
                class="xp-v6-copy"
              >
                <CopyIcon :size="18" class="q-mr-sm" />
                Copy request
              </q-btn>
            </div>
          </template>

          <!-- 7 Stepper: amount, then mint, then share; each step is one decision. -->
          <template v-else>
            <div class="xp-steps" role="tablist">
              <button
                v-for="(s, i) in ['Amount', 'Mint', 'Share']"
                :key="s"
                type="button"
                role="tab"
                class="xp-step"
                :aria-selected="f.step === i + 1"
                :class="{
                  'xp-step--on': f.step === i + 1,
                  'xp-step--done': f.step > i + 1,
                }"
                @click="f.step = i + 1"
              >
                <span class="xp-step__bar" aria-hidden="true" />
                <span class="xp-step__label">{{ i + 1 }} {{ s }}</span>
              </button>
            </div>
            <div v-if="f.step === 1" class="xp-pad xp-v7-step">
              <div class="xp-v7-question">How much are you asking for?</div>
              <div class="xp-field xp-v7-field">
                <span
                  class="xp-v3-figure"
                  :class="{ 'xp-muted': f.amount === null }"
                  >{{ amountText(f) || unitSymbol(f.unit) + "0" }}</span
                >
              </div>
              <div class="xp-seg xp-seg--wide" role="radiogroup">
                <button
                  v-for="u in units"
                  :key="u"
                  type="button"
                  role="radio"
                  class="xp-seg__item"
                  :aria-checked="f.unit === u"
                  :class="{ 'xp-seg__item--on': f.unit === u }"
                  @click="setUnit(f, u)"
                >
                  {{ u }}
                </button>
              </div>
              <button
                type="button"
                class="xp-option"
                role="checkbox"
                :aria-checked="f.amount === null"
                @click="f.amount === null ? addAmount(f) : (f.amount = null)"
              >
                <span
                  class="xp-box"
                  :class="{ 'xp-box--on': f.amount === null }"
                  aria-hidden="true"
                  ><CheckIcon v-if="f.amount === null" :size="14"
                /></span>
                <span>Let the payer choose the amount</span>
              </button>
              <div class="xp-foot xp-foot--flush">
                <q-btn
                  unelevated
                  rounded
                  no-caps
                  color="primary"
                  class="full-width"
                  label="Next"
                  @click="f.step = 2"
                />
              </div>
            </div>
            <div v-else-if="f.step === 2" class="xp-pad xp-v7-step">
              <div class="xp-v7-question">Which mint should receive it?</div>
              <div class="xp-group xp-group--flush" role="radiogroup">
                <button
                  v-for="m in mintChoices"
                  :key="m.label"
                  type="button"
                  role="radio"
                  class="xp-list-row"
                  :aria-checked="f.mint === m.url"
                  @click="f.mint = m.url"
                >
                  <LandmarkIcon :size="18" class="xp-muted" />
                  <span class="xp-list-row__label">{{ m.label }}</span>
                  <CheckIcon
                    v-if="f.mint === m.url"
                    :size="20"
                    class="xp-check"
                  />
                </button>
              </div>
              <div class="xp-foot xp-foot--flush">
                <q-btn
                  unelevated
                  rounded
                  no-caps
                  color="primary"
                  class="full-width"
                  label="Next"
                  @click="f.step = 3"
                />
              </div>
            </div>
            <template v-else>
              <div class="xp-v7-recap">
                <button
                  type="button"
                  class="xp-v7-recap__item"
                  @click="f.step = 1"
                >
                  <span class="xp-label">Amount</span>
                  <span>{{ amountText(f) || "Any amount" }}</span>
                </button>
                <button
                  type="button"
                  class="xp-v7-recap__item"
                  @click="f.step = 2"
                >
                  <span class="xp-label">Mint</span>
                  <span class="xp-ellipsis">{{ mintText(f) }}</span>
                </button>
              </div>
              <QrBlock :value="qrValue(f)" class="xp-qr" />
              <div class="xp-code xp-code--center">{{ codeText(f) }}</div>
              <div class="xp-foot xp-foot--pair">
                <q-btn outline rounded no-caps class="full-width">
                  <ShareIcon :size="18" class="q-mr-sm" />
                  Share
                </q-btn>
                <q-btn
                  unelevated
                  rounded
                  no-caps
                  color="primary"
                  class="full-width"
                >
                  <CopyIcon :size="18" class="q-mr-sm" />
                  Copy
                </q-btn>
              </div>
            </template>
          </template>
        </div>
      </div>
    </figure>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  ChevronUp as ChevronUpIcon,
  Copy as CopyIcon,
  Landmark as LandmarkIcon,
  PencilLine as PencilLineIcon,
  Plus as PlusIcon,
  RefreshCw as RefreshCwIcon,
  Share as ShareIcon,
  X as XIcon,
} from "lucide-vue-next";
import QrBlock from "src/components/QrBlock.vue";

export const paymentRequestVariants = [
  "Before: QR, pill and chips (the app now ships V2)",
  "Settings rows",
  "Hero amount",
  "Fixed or any amount",
  "Request and settings tabs",
  "QR first, details drawer",
  "Chips and floating bar",
  "Three steps",
];

type Unit = "BTC" | "USD" | "EUR";
type Frame = {
  key: string;
  compact: boolean;
  amount: number | null; // base units: sats, or cents for fiat
  unit: Unit;
  mint: string | null; // null: any mint
  tab: string;
  drawer: boolean;
  step: number;
};

const MINT = "mint.example.com";
const OTHER_MINT = "ecash.example.org";
const REQUEST =
  "creqApWF0gaNhdGVub3N0cmFheKlucHJvZmlsZTFxeTI4d3VtbjhnaGo3dW45ZDNzaGp0bnl2OWtoMnVld2Q5aHN6OW1od2RlbjV0ZTB3ZmprY2N0ZTljdXJ4dmVuOWVlaHFjdHJ2NWhzenJ0aHdkZW41dGUwZGVoaHh0bnZkYWtxcWd5d3BqNHVhYTYzdWQyeWV5NGZkbmVkZ3Zy";

export default defineComponent({
  name: "PaymentRequestExplorations",
  components: {
    CheckIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    CopyIcon,
    LandmarkIcon,
    PencilLineIcon,
    PlusIcon,
    RefreshCwIcon,
    ShareIcon,
    XIcon,
    QrBlock,
  },
  props: {
    variant: { type: Number, default: 0 },
  },
  data() {
    return {
      units: ["BTC", "USD", "EUR"] as Unit[],
      mintChoices: [
        { label: "Any mint", url: null },
        { label: MINT, url: MINT },
        { label: OTHER_MINT, url: OTHER_MINT },
      ] as { label: string; url: string | null }[],
      frames: [
        {
          key: "amount",
          compact: false,
          amount: 2500,
          unit: "BTC",
          mint: MINT,
          tab: "request",
          drawer: false,
          step: 3,
        },
        {
          key: "open",
          compact: true,
          amount: null,
          unit: "BTC",
          mint: null,
          tab: "settings",
          drawer: true,
          step: 1,
        },
      ] as Frame[],
    };
  },
  methods: {
    // Which trailing header action a variation uses (the rest keep the title centred).
    headAction(f: Frame): string {
      if (this.variant === 1) return "share";
      if ([2, 3, 5].includes(this.variant)) return "new";
      if (this.variant === 7 && f.step === 3) return "new";
      return "";
    },
    qrSize(f: Frame): string {
      const full: Record<number, number> = {
        0: 260,
        1: 216,
        2: 240,
        3: 216,
        4: 296,
        5: 316,
        6: 300,
        7: 256,
      };
      return `${f.compact ? 148 : full[this.variant]}px`;
    },
    qrValue(f: Frame): string {
      return `${REQUEST}${f.amount ?? ""}${f.unit}${f.mint ?? ""}`;
    },
    codeText(f: Frame): string {
      const v = this.qrValue(f);
      return `${v.slice(0, 16)}…${v.slice(-8)}`;
    },
    unitSymbol(unit: Unit): string {
      return { BTC: "₿", USD: "$", EUR: "€" }[unit];
    },
    amountText(f: Frame): string {
      if (f.amount === null) return "";
      if (f.unit === "BTC") {
        return `₿${f.amount.toLocaleString("en-US")}`;
      }
      return `${this.unitSymbol(f.unit)}${(f.amount / 100).toFixed(2)}`;
    },
    mintText(f: Frame): string {
      return f.mint ?? "Any mint";
    },
    addAmount(f: Frame) {
      f.amount = f.unit === "BTC" ? 2500 : 185;
    },
    // A different unit makes a new request without the old denomination's amount.
    setUnit(f: Frame, unit: Unit) {
      if (unit === f.unit) return;
      f.unit = unit;
      f.amount = null;
    },
    cycleUnit(f: Frame) {
      const i = this.units.indexOf(f.unit);
      this.setUnit(f, this.units[(i + 1) % this.units.length]);
    },
    cycleMint(f: Frame) {
      const urls = this.mintChoices.map((m) => m.url);
      f.mint = urls[(urls.indexOf(f.mint) + 1) % urls.length];
    },
    newRequest(f: Frame) {
      f.amount = null;
      f.mint = null;
      f.drawer = false;
      f.step = 1;
    },
  },
});
</script>

<style scoped>
.xp {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}
.xp-frame {
  margin: 0;
  max-width: 100%;
  width: 390px;
}
.xp-caption {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
  text-transform: uppercase;
}

/* The phone: a dimmed wallet peeking above a raised bottom sheet. */
.xp-phone {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-xl);
  height: 772px;
  overflow: hidden;
  position: relative;
}
.xp-frame--compact .xp-phone {
  background: var(--app-raised);
  height: auto;
}
.xp-wallet {
  display: flex;
  height: 52px;
  justify-content: center;
  padding-top: 14px;
}
.xp-wallet__balance {
  color: var(--app-text-subtle);
  font-size: 20px;
  font-weight: 700;
  opacity: 0.5;
}
.xp-sheet {
  background: var(--app-raised);
  border-top: 1px solid var(--app-border);
  border-radius: var(--app-radius-xl) var(--app-radius-xl) 0 0;
  box-shadow: 0 -12px 32px color-mix(in srgb, var(--app-surface) 70%, transparent);
  color: var(--app-text);
  display: flex;
  flex-direction: column;
  height: 720px;
  padding-bottom: 20px;
}
.xp-frame--compact .xp-sheet {
  border-top: 0;
  box-shadow: none;
  height: auto;
}

/* Shared pieces. */
.xp-head {
  align-items: center;
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  min-height: 60px;
  padding: 8px;
}
.xp-title {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-align: center;
}
.xp-icon-btn {
  color: var(--app-text);
  height: 44px;
  min-height: 44px;
  min-width: 44px;
  width: 44px;
}
.xp-icon-spacer {
  width: 44px;
}
.xp-qr {
  --app-qr-size: var(--xp-qr);
  flex-shrink: 0;
}
.xp-pad {
  padding: 0 16px;
}
.xp-row-center {
  align-items: center;
  display: flex;
  justify-content: center;
}
.xp-gap-8 {
  gap: 8px;
}
.xp-muted {
  color: var(--app-text-muted);
}
.xp-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.xp-code {
  color: var(--app-text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.xp-code--center {
  margin-top: 10px;
  text-align: center;
}
.xp-code-row {
  align-items: center;
  display: flex;
  gap: 4px;
  justify-content: center;
  margin-top: 4px;
}
.xp-code-row .xp-icon-btn {
  color: var(--app-text-muted);
}
.xp-label {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 600;
}
.xp-link {
  background: none;
  border: 0;
  color: var(--q-primary);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  min-height: 40px;
  padding: 0 8px;
}
.xp-quiet-btn {
  color: var(--app-text-muted);
  min-height: 44px;
}
.xp-chev {
  color: var(--app-text-muted);
  flex-shrink: 0;
}
.xp-check {
  color: var(--q-primary);
  flex-shrink: 0;
  margin-inline-start: auto;
}

/* The pinned action area: always last, pushed to the foot of the sheet. */
.xp-foot {
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding: 16px 16px 4px;
}
.xp-foot--pair > .q-btn {
  flex: 1 1 0;
}
.xp-foot--lead > .full-width {
  flex: 1 1 auto;
  width: auto !important;
}
.xp-foot--flush {
  padding-inline: 0;
}
.xp-round-52 {
  color: var(--app-text);
  flex-shrink: 0;
  height: 52px;
  width: 52px;
}

/* Segmented control: a tinted track, the chosen item lifted on an edge. */
.xp-seg {
  background: var(--app-tint);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-pill);
  display: inline-flex;
  padding: 3px;
}
.xp-seg__item {
  background: none;
  border: 1px solid transparent;
  border-radius: var(--app-radius-pill);
  color: var(--app-text-muted);
  cursor: pointer;
  flex: 1 1 0;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  min-height: 38px;
  padding: 0 16px;
}
.xp-seg__item--on {
  background: var(--app-raised);
  border-color: var(--app-border-strong);
  color: var(--app-text);
}
.xp-seg--wide {
  display: flex;
  width: 100%;
}
.xp-seg--mini .xp-seg__item {
  font-size: 13px;
  min-height: 34px;
  padding: 0 10px;
}

/* Field: the app's filled input box. */
.xp-field {
  align-items: center;
  background: var(--app-group-fill);
  border: 1px solid var(--app-group-edge);
  border-radius: var(--app-radius-lg);
  color: var(--app-text);
  display: flex;
  font: inherit;
  gap: 10px;
  min-height: 56px;
  padding: 0 8px 0 16px;
  text-align: start;
  width: 100%;
}

/* Inset group of list rows. */
.xp-group {
  background: var(--app-group-fill);
  border: 1px solid var(--app-group-edge);
  border-radius: var(--app-radius-lg);
  margin: 16px 16px 0;
  overflow: hidden;
}
.xp-group--flush {
  margin: 0;
}
.xp-list-row {
  align-items: center;
  background: none;
  border: 0;
  color: var(--app-text);
  cursor: pointer;
  display: flex;
  font: inherit;
  font-size: 15px;
  gap: 10px;
  min-height: 52px;
  padding: 0 12px 0 16px;
  text-align: start;
  width: 100%;
}
div.xp-list-row {
  cursor: default;
}
.xp-list-row + .xp-list-row {
  border-top: 1px solid var(--app-group-edge);
}
.xp-list-row__label {
  font-weight: 500;
}
.xp-list-row__value {
  margin-inline-start: auto;
  max-width: 55%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.xp-list-row .xp-seg {
  margin-inline-start: auto;
}
.xp-list-row--action {
  color: var(--q-primary);
}
.xp-row-clear {
  align-items: center;
  border-radius: 50%;
  color: var(--app-text-muted);
  display: inline-flex;
  height: 40px;
  justify-content: center;
  margin: -4px -8px -4px -6px;
  width: 40px;
}

/* 0 Current. */
.xp--v0 .xp-qr {
  margin-top: 4px;
}
.xp-v0-controls {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 20px;
}
.xp-v0-pill {
  min-height: 44px;
}
.xp-v0-controls .mint-chip {
  min-height: 40px;
}

/* 1 Settings rows. */
.xp--v1 .xp-group + .xp-group {
  margin-top: 12px;
}

/* 2 Hero amount. */
.xp-v2-hero {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 16px 18px;
}
.xp-overline {
  color: var(--app-text-muted);
  font-size: 13px;
}
.xp-v2-amount {
  background: none;
  border: 0;
  border-bottom: 2px dashed var(--app-border-strong);
  color: var(--app-text);
  cursor: text;
  font: inherit;
  font-size: 40px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  padding: 0 2px;
}
.xp-v2-clear {
  color: var(--app-text-muted);
  margin-inline-end: -44px;
}
.xp-v2-add {
  margin-block: 2px;
}
.xp-v2-hero .xp-seg {
  margin-top: 8px;
}
.xp-v2-mint {
  gap: 8px;
  margin-top: 16px;
}
.xp-v2-mint .mint-chip {
  min-height: 40px;
}
.xp-frame--compact .xp-v2-add {
  margin-block: 0;
}

/* 3 Fixed or any amount. */
.xp--v3 .xp-pad {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 18px;
}
.xp-v3-amount {
  min-height: 64px;
}
.xp-v3-figure {
  font-size: 28px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.xp-v3-hint {
  color: var(--app-text-muted);
  font-size: 15px;
}
.xp-v3-unit {
  margin-inline-start: auto;
  min-height: 40px;
}
.xp-v3-mint {
  cursor: pointer;
}
.xp-v3-mint__label {
  color: var(--app-text-muted);
  font-size: 13px;
}
.xp-v3-mint__name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.xp-v3-mint .xp-chev {
  margin-inline-end: 4px;
}

/* 4 Tabs. */
.xp-tabs {
  border-bottom: 1px solid var(--app-border);
  display: flex;
  margin: 0 16px 20px;
}
.xp-tab {
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  color: var(--app-text-muted);
  cursor: pointer;
  flex: 1;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: -1px;
  min-height: 44px;
}
.xp-tab--on {
  border-bottom-color: var(--app-text);
  color: var(--app-text);
}
.xp-v4-summary {
  font-size: 14px;
  margin-top: 16px;
  text-align: center;
}
.xp-v4-amount {
  font-size: 28px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.xp-v4-settings {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.xp-v4-settings .xp-label:not(:first-child) {
  margin-top: 8px;
}
.xp-v4-field-value {
  flex: 1;
  font-size: 17px;
  font-weight: 600;
}
.xp-v4-settings .xp-field .xp-muted {
  font-weight: 400;
}
.xp-v4-new {
  align-self: center;
  margin-top: 4px;
}

/* 5 QR first, details drawer. */
.xp--v5 .xp-qr {
  margin-top: 8px;
}
.xp-drawer {
  background: var(--app-group-fill);
  border: 1px solid var(--app-group-edge);
  border-radius: var(--app-radius-xl);
  margin: auto 12px 0;
  padding-bottom: 12px;
}
.xp-frame--compact .xp-drawer {
  margin-top: 20px;
}
.xp-drawer__summary {
  align-items: center;
  background: none;
  border: 0;
  color: var(--app-text);
  cursor: pointer;
  display: flex;
  font: inherit;
  font-size: 15px;
  gap: 8px;
  min-height: 56px;
  padding: 10px 16px 0;
  position: relative;
  text-align: start;
  width: 100%;
}
.xp-drawer__grip {
  background: var(--app-border-strong);
  border-radius: var(--app-radius-pill);
  height: 4px;
  inset-inline-start: calc(50% - 18px);
  position: absolute;
  top: 6px;
  width: 36px;
}
.xp-drawer__line {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.xp-drawer--open .xp-drawer__chev {
  transform: rotate(180deg);
}
.xp-drawer__body {
  border-top: 1px solid var(--app-group-edge);
  margin: 6px 0 0;
}
.xp-list-row--plain {
  min-height: 48px;
}
.xp-list-row--plain .xp-link {
  margin-inline-end: -4px;
}
.xp-foot--inset {
  padding: 8px 12px 0;
}

/* 6 Chips and floating bar. */
.xp-v6-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 18px;
  padding: 0 16px;
}
.xp-v6-chips .mint-chip {
  min-height: 40px;
}
.xp-v6-amount {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  padding-inline-end: 0;
}
.xp-v6-chip-x {
  align-items: center;
  background: none;
  border: 0;
  border-radius: 50%;
  color: var(--app-text-muted);
  cursor: pointer;
  display: inline-flex;
  height: 38px;
  justify-content: center;
  width: 36px;
}
.xp-v6-dashed {
  background: transparent;
  border-style: dashed;
}
.xp-v6-mint {
  max-width: 220px;
}
.xp-v6-bar {
  align-items: center;
  align-self: center;
  background: var(--app-raised);
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-pill);
  display: flex;
  gap: 4px;
  margin-top: auto;
  padding: 5px;
}
.xp-frame--compact .xp-v6-bar {
  margin-top: 20px;
}
.xp-v6-copy {
  min-height: 44px;
  padding-inline: 20px;
}

/* 7 Three steps. */
.xp-steps {
  display: flex;
  gap: 6px;
  margin: 0 16px 16px;
}
.xp-step {
  background: none;
  border: 0;
  color: var(--app-text-muted);
  cursor: pointer;
  display: flex;
  flex: 1;
  flex-direction: column;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  gap: 8px;
  min-height: 44px;
  padding: 6px 0 0;
  text-align: start;
}
.xp-step__bar {
  background: var(--app-tint-strong);
  border-radius: var(--app-radius-pill);
  height: 4px;
  width: 100%;
}
.xp-step--done .xp-step__bar {
  background: color-mix(in srgb, var(--q-primary) 45%, var(--app-tint-strong));
}
.xp-step--on {
  color: var(--app-text);
}
.xp-step--on .xp-step__bar {
  background: var(--q-primary);
}
.xp-v7-step {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
}
.xp-v7-question {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin-bottom: 4px;
}
.xp-v7-field {
  justify-content: center;
  min-height: 72px;
}
.xp-option {
  align-items: center;
  background: none;
  border: 0;
  color: var(--app-text);
  cursor: pointer;
  display: flex;
  font: inherit;
  font-size: 15px;
  gap: 12px;
  min-height: 44px;
  padding: 0;
  text-align: start;
}
.xp-box {
  align-items: center;
  border: 2px solid var(--app-border-strong);
  border-radius: var(--app-radius-sm);
  display: inline-flex;
  height: 22px;
  justify-content: center;
  width: 22px;
}
.xp-box--on {
  background: var(--q-primary);
  border-color: var(--q-primary);
  color: var(--app-on-primary);
}
.xp-v7-recap {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1.4fr;
  margin: 0 16px 18px;
}
.xp-v7-recap__item {
  align-items: flex-start;
  background: var(--app-group-fill);
  border: 1px solid var(--app-group-edge);
  border-radius: var(--app-radius-md);
  color: var(--app-text);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  gap: 2px;
  min-height: 56px;
  min-width: 0;
  padding: 8px 12px;
  text-align: start;
}
.xp-v7-recap__item > span {
  max-width: 100%;
}
</style>
