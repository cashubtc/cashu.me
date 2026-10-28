<template>
  <!-- One component on the design system board: its name and single source, then a framed stage
       with room around the live sample, the example code under it, and where it is used
       (counted from the code) with its props and events. -->
  <section
    v-show="visible"
    :id="anchor"
    class="ds-entry"
    :class="{ 'ds-entry--active': board.active === id }"
    :data-ds-entry="id"
    tabindex="-1"
    :aria-labelledby="`${anchor}-title`"
  >
    <template v-if="item">
      <header class="ds-entry__head">
        <h3 :id="`${anchor}-title`" class="ds-entry__name">{{ item.name }}</h3>
        <a
          :href="`#${anchor}`"
          class="ds-entry__anchor"
          :aria-label="`Link to ${item.name}`"
          ><LinkIcon :size="16"
        /></a>
        <span class="ds-entry__tier">{{ item.tier }}</span>
        <button
          type="button"
          class="ds-entry__usage"
          :aria-expanded="showUsage"
          :aria-controls="`${anchor}-usage`"
          @click="showUsage = !showUsage"
        >
          {{ usageLabel }}
        </button>
      </header>
      <div class="ds-entry__source">{{ item.source }}</div>
      <ul v-if="showUsage" :id="`${anchor}-usage`" class="ds-entry__places">
        <li v-for="u in usage" :key="u.file">
          {{ u.file }}:{{ u.line }}
          <span v-if="u.count > 1" class="ds-entry__times">×{{ u.count }}</span>
        </li>
        <li v-if="!usage.length">Not used outside its own file.</li>
      </ul>

      <div class="ds-entry__card">
        <!-- Explorations: whole alternative designs of one component, switched in place. -->
        <div
          v-if="variants.length"
          class="ds-entry__variants"
          role="tablist"
          :aria-label="`${item.name} variations`"
        >
          <button
            v-for="n in variantOrder"
            :key="variants[n]"
            type="button"
            role="tab"
            class="ds-entry__variant"
            :class="{ 'ds-entry__variant--on': variant === n }"
            :aria-selected="variant === n"
            :data-ds-variant-tab="n"
            :title="scoreTitle(n)"
            @click="variant = n"
          >
            <span class="ds-entry__variant-n">{{ n === 0 ? "Now" : n }}</span>
            {{ variants[n] }}
            <span v-if="scores" class="ds-entry__variant-score">{{
              mean(n).toFixed(1)
            }}</span>
          </button>
        </div>
        <div
          class="ds-entry__stage"
          :data-ds-variant="variants.length ? variant : null"
        >
          <div class="ds-entry__sample">
            <slot :variant="variant" />
          </div>
        </div>
        <div
          v-if="item.example"
          class="ds-entry__code"
          :class="{ 'ds-entry__code--open': codeOpen || !codeLong }"
        >
          <pre><code><span
            v-for="(line, n) in codeLines"
            :key="n"
            class="ds-entry__line"
          ><span class="ds-entry__ln" aria-hidden="true">{{ n + 1 }}</span>{{ line || " " }}
</span></code></pre>
          <CopyButton
            class="ds-entry__copy"
            :value="item.example"
            label="Copy code"
            color="grey"
          />
          <button
            v-if="codeLong"
            type="button"
            class="ds-entry__expand"
            :aria-expanded="codeOpen"
            @click="codeOpen = !codeOpen"
          >
            {{ codeOpen ? "Collapse code" : "Expand code" }}
          </button>
        </div>
      </div>

      <div v-if="item.note" class="ds-entry__note">{{ item.note }}</div>
      <details v-if="api" class="ds-entry__details">
        <summary>Props and events</summary>
        <table v-if="api.props.length" class="ds-entry__props">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in api.props" :key="p.name">
              <td>
                {{ p.name }}<span v-if="p.required" title="required">*</span>
              </td>
              <td>{{ p.type }}</td>
              <td>{{ p.default }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="ds-entry__emits">No props.</div>
        <div v-if="api.emits.length" class="ds-entry__emits">
          Events: {{ api.emits.join(", ") }}
        </div>
      </details>
    </template>
    <div v-else class="ds-entry__missing">
      Unregistered entry “{{ id }}”: add it to src/design-system/registry.ts.
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, inject, type PropType } from "vue";
import { dsItem, type DsItem } from "src/design-system/registry";
import { apiOf, usageOf, type DsApi } from "src/design-system/usage";
import type { DsBoard } from "src/components/ds/board";
import type { VariantScore } from "src/design-system/explorations/scores";
import CopyButton from "src/components/ui/CopyButton.vue";
import { Link as LinkIcon } from "lucide-vue-next";

export default defineComponent({
  name: "DsEntry",
  components: { CopyButton, LinkIcon },
  props: {
    /** The registry id (src/design-system/registry.ts). */
    id: { type: String, required: true },
    /** Names of whole alternative designs (the first is the current one); the slot gets the
     *  chosen index as `variant`. */
    variants: { type: Array as PropType<string[]>, default: () => [] },
    /** Council scores per variation (src/design-system/explorations/scores.ts); when given,
     *  the tabs are ordered best first and show the mean. */
    scores: {
      type: Array as PropType<VariantScore[] | undefined>,
      default: undefined,
    },
  },
  setup() {
    return { board: inject<DsBoard>("dsBoard") as DsBoard };
  },
  data() {
    return {
      showUsage: false,
      codeOpen: false,
      api: null as DsApi | null,
      variant: 0,
    };
  },
  computed: {
    variantOrder(): number[] {
      const order = this.variants.map((_, n) => n);
      return this.scores
        ? order.sort((a, b) => this.mean(b) - this.mean(a))
        : order;
    },
    item(): DsItem | undefined {
      return dsItem(this.id);
    },
    codeLines(): string[] {
      return (this.item?.example || "").split("\n");
    },
    // Longer examples start folded to their first lines, like the stage's caption.
    codeLong(): boolean {
      return this.codeLines.length > 3;
    },
    anchor(): string {
      return `ds-${this.id}`;
    },
    usage() {
      return this.item ? usageOf(this.item) : [];
    },
    usageLabel(): string {
      const files = this.usage.length;
      const uses = this.usage.reduce((n, u) => n + u.count, 0);
      return files
        ? `${uses} use${uses === 1 ? "" : "s"} in ${files} file${
            files === 1 ? "" : "s"
          }`
        : "Unused";
    },
    visible(): boolean {
      return this.board.matches(this.id);
    },
  },
  methods: {
    mean(n: number): number {
      const sc = this.scores?.[n];
      return sc ? (sc.sol + sc.opus) / 2 : 0;
    },
    scoreTitle(n: number): string {
      const sc = this.scores?.[n];
      return sc ? `Council: Sol ${sc.sol}, Opus ${sc.opus}` : "";
    },
  },
  async mounted() {
    if (this.item) this.api = await apiOf(this.item);
  },
});
</script>

<style scoped>
.ds-entry {
  margin-bottom: 72px;
  outline: none;
  scroll-margin-top: 112px;
}
.ds-entry__head {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
}
.ds-entry__name {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.25;
  margin: 0;
}
.ds-entry__anchor {
  align-items: center;
  border-radius: var(--app-radius-sm);
  color: var(--app-text-subtle);
  display: inline-flex;
  justify-content: center;
  opacity: 0;
  padding: 4px;
  transition: opacity 0.15s ease;
}
.ds-entry__head:hover .ds-entry__anchor,
.ds-entry__anchor:focus-visible {
  opacity: 1;
}
.ds-entry__tier {
  color: var(--app-text-subtle);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.ds-entry__usage {
  background: none;
  border: 0;
  color: var(--app-text-muted);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  margin-inline-start: auto;
  padding: 4px 0;
  text-decoration: underline dotted;
  text-underline-offset: 3px;
}
.ds-entry__source,
.ds-entry__places,
.ds-entry__code pre,
.ds-entry__props {
  direction: ltr;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  text-align: start;
}
.ds-entry__source {
  color: var(--app-text-subtle);
  font-size: 12px;
  line-height: 1.5;
  margin-top: 4px;
}
.ds-entry__places {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.7;
  margin: 10px 0 0;
  padding-inline-start: 16px;
}
.ds-entry__times {
  color: var(--app-text-subtle);
}

/* The card: a framed stage with generous room around the sample, then the code under a rule.
   The entry the rail points at gets a brighter frame. */
.ds-entry__card {
  border: 1px solid var(--app-border);
  border-radius: 16px;
  margin-top: 20px;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.ds-entry--active .ds-entry__card {
  border-color: var(--app-border-strong);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--app-text) 6%, transparent);
}
.ds-entry__variants {
  border-bottom: 1px solid var(--app-border);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px;
}
.ds-entry__variant {
  align-items: center;
  background: none;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-pill);
  color: var(--app-text-muted);
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: 13px;
  gap: 6px;
  min-height: 32px;
  padding: 0 12px 0 6px;
}
.ds-entry__variant--on {
  background: var(--app-text);
  border-color: var(--app-text);
  color: var(--app-surface);
}
.ds-entry__variant:focus-visible {
  box-shadow: var(--app-focus-ring);
  outline: none;
}
.ds-entry__variant-score {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  opacity: 0.8;
}
.ds-entry__variant-n {
  align-items: center;
  background: color-mix(in srgb, currentColor 14%, transparent);
  border-radius: 999px;
  display: inline-flex;
  font-size: 11px;
  font-weight: 600;
  height: 20px;
  justify-content: center;
  min-width: 20px;
  padding: 0 5px;
}
.ds-entry__stage {
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 280px;
  padding: 64px 48px;
}
/* The sample column: block samples fill it; anything narrower (a lone button, a segmented
   control, a row of chips) is centred in the stage instead of hugging its start edge. */
.ds-entry__sample {
  align-items: center;
  display: flex;
  flex-direction: column;
  max-width: 480px;
  width: 100%;
}
.ds-entry__sample > * {
  max-width: 100%;
}
.ds-entry__sample
  > :not(.q-btn):not(.q-btn-group):not(.q-toggle):not(.q-checkbox):not(
    .q-radio
  ):not(.star-rating):not(.app-badge):not(span):not(a) {
  align-self: stretch;
}
.ds-entry__sample > .row {
  justify-content: center;
}
.ds-entry__code {
  --ds-code-bg: color-mix(in srgb, var(--app-text) 3%, var(--app-surface));
  background: var(--ds-code-bg);
  border-top: 1px solid var(--app-border);
  max-height: 120px;
  overflow: hidden;
  position: relative;
}
.ds-entry__code--open {
  max-height: none;
}
.ds-entry__code pre {
  color: var(--app-text);
  font-size: 13px;
  line-height: 1.7;
  margin: 0;
  overflow-x: auto;
  padding: 20px 64px 20px 20px;
  white-space: pre;
}
.ds-entry__line {
  display: block;
}
.ds-entry__ln {
  color: var(--app-text-subtle);
  display: inline-block;
  margin-inline-end: 20px;
  text-align: end;
  user-select: none;
  width: 1.5em;
}
/* Sits over long lines, so it keeps the panel's own background. */
.ds-entry__copy {
  background: var(--ds-code-bg);
  inset-inline-end: 12px;
  position: absolute;
  top: 12px;
}
/* Folded code fades into the card, with the expand pill over the fade. */
.ds-entry__code:not(.ds-entry__code--open)::after {
  background: linear-gradient(transparent, var(--ds-code-bg) 85%);
  bottom: 0;
  content: "";
  height: 72px;
  inset-inline: 0;
  pointer-events: none;
  position: absolute;
}
.ds-entry__expand {
  background: var(--app-tint-strong);
  border: 0;
  border-radius: var(--app-radius-pill);
  bottom: 12px;
  color: var(--app-text);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  inset-inline-start: 50%;
  padding: 8px 18px;
  position: absolute;
  transform: translateX(-50%);
  z-index: 1;
}
.ds-entry__code--open .ds-entry__expand {
  bottom: auto;
  margin: 0 auto 16px;
  position: relative;
  display: block;
  inset-inline-start: auto;
  transform: none;
}
.ds-entry__expand:focus-visible {
  outline: 2px solid var(--q-primary);
  outline-offset: 2px;
}

.ds-entry__note {
  color: var(--app-text-muted);
  font-size: 14px;
  line-height: 1.5;
  margin-top: 14px;
}
.ds-entry__details {
  color: var(--app-text-muted);
  font-size: 14px;
  margin-top: 14px;
}
.ds-entry__details summary {
  cursor: pointer;
  display: list-item;
  width: fit-content;
}
.ds-entry__props {
  border-collapse: collapse;
  font-size: 12px;
  margin-top: 10px;
  width: 100%;
}
.ds-entry__props th,
.ds-entry__props td {
  border-bottom: 1px solid var(--app-border);
  padding: 6px 12px 6px 0;
  vertical-align: top;
}
.ds-entry__props th {
  color: var(--app-text-subtle);
  font-weight: 500;
  text-align: start;
}
.ds-entry__emits {
  margin-top: 10px;
}
.ds-entry__missing {
  color: var(--q-negative);
}
@media (max-width: 599px) {
  .ds-entry {
    margin-bottom: 56px;
  }
  .ds-entry__name {
    font-size: 19px;
  }
  .ds-entry__stage {
    min-height: 200px;
    padding: 40px 20px;
  }
  .ds-entry__code pre {
    padding: 16px 56px 16px 12px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ds-entry__card,
  .ds-entry__anchor {
    transition: none;
  }
}
</style>
