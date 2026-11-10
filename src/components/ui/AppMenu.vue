<!-- The overflow menu behind a header's ⋯: a labelled icon button that opens an anchored list
     of labelled actions, the destructive ones last under a hairline; an item can open a grid
     of glyphs in its place (the emoji picker). Behaviour is Reka UI's DropdownMenu (menu roles, arrow keys and typeahead, focus back on the trigger, collision
     placement, mirrored in right-to-left locales); the look is ours (.app-menu in
     src/css/elements.scss).
     Inside a Quasar dialog the list mounts in the dialog itself, since QDialog pulls focus
     back from anything outside it, and Escape closes only the menu, not the dialog. -->
<template>
  <span ref="root" class="app-menu-anchor">
    <!-- On a phone the same actions open as a bottom sheet (shadcn pairs its dropdown with a
         drawer the same way): full-width rows within thumb reach, the destructive one last,
         and a grid item as the sheet's second page behind a back chevron. -->
    <template v-if="asSheet">
      <IconButton
        :icon="icon"
        :label="label"
        :data-testid="testid || undefined"
        aria-haspopup="dialog"
        :class="{ 'app-menu-trigger--open': open }"
        @click="open = true"
      />
      <BottomSheet
        v-model="open"
        :title="page ? page.label : label"
        :back="page ? $t('common.back') : ''"
        @back="page = null"
      >
        <div v-if="page" class="app-menu-sheet__grid" role="group">
          <button
            v-for="cell in page.grid"
            :key="cell.key"
            type="button"
            class="app-menu-sheet__cell"
            :aria-label="cell.label"
            :data-testid="`${page.testid || page.key}-${cell.key}`"
            @click="choose(`${page.key}:${cell.key}`)"
          >
            {{ cell.glyph }}
          </button>
        </div>
        <div v-else class="app-menu-sheet">
          <template v-for="(group, g) in groups" :key="g">
            <div v-if="g > 0" class="app-menu-sheet__separator" />
            <OptionRow
              v-for="item in group"
              :key="item.key"
              icon-size="sm"
              :icon="item.icon"
              :label="item.label"
              :disabled="item.disabled"
              :class="{ 'app-menu-sheet__row--danger': item.danger }"
              :data-testid="item.testid || undefined"
              @click="onSheetSelect(item)"
            >
              <template v-if="item.grid" #trailing>
                <ChevronRightIcon
                  :size="18"
                  class="app-menu__icon app-menu__sub-chevron"
                  aria-hidden="true"
                />
              </template>
            </OptionRow>
          </template>
        </div>
      </BottomSheet>
    </template>
    <DropdownMenuRoot v-else v-model:open="open" :modal="false">
      <DropdownMenuTrigger as-child>
        <IconButton
          :icon="icon"
          :label="label"
          :data-testid="testid || undefined"
          :class="{ 'app-menu-trigger--open': open }"
        />
      </DropdownMenuTrigger>
      <DropdownMenuPortal :to="portalTarget">
        <DropdownMenuContent
          class="app-menu"
          align="end"
          position-strategy="absolute"
          :side-offset="4"
          :collision-padding="12"
          @keydown.esc.stop.prevent="open = false"
        >
          <!-- A grid item's page (the emoji picker) replaces the list in place, under a
               row back to it: there is no room beside the list on a phone. -->
          <template v-if="page">
            <DropdownMenuItem
              class="app-menu__item app-menu__back"
              data-testid="app-menu-back"
              @select.prevent="page = null"
            >
              <ChevronLeftIcon
                :size="18"
                class="app-menu__icon app-menu__back-chevron"
                aria-hidden="true"
              />
              <span class="app-menu__label">{{ page.label }}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator class="app-menu__separator" />
            <div class="app-menu__grid" role="group" :aria-label="page.label">
              <DropdownMenuItem
                v-for="cell in page.grid"
                :key="cell.key"
                class="app-menu__cell"
                :aria-label="cell.label"
                :data-testid="`${page.testid || page.key}-${cell.key}`"
                @select="$emit('select', `${page.key}:${cell.key}`)"
                >{{ cell.glyph }}</DropdownMenuItem
              >
            </div>
          </template>
          <template v-for="(group, g) in groups" v-else :key="g">
            <DropdownMenuSeparator v-if="g > 0" class="app-menu__separator" />
            <DropdownMenuItem
              v-for="item in group"
              :key="item.key"
              class="app-menu__item"
              :class="{ 'app-menu__item--danger': item.danger }"
              :disabled="item.disabled"
              :data-testid="item.testid || undefined"
              @select="onSelect($event, item)"
            >
              <component
                :is="item.icon"
                v-if="item.icon"
                :size="18"
                class="app-menu__icon"
                aria-hidden="true"
              />
              <span class="app-menu__label">{{ item.label }}</span>
              <ChevronRightIcon
                v-if="item.grid"
                :size="16"
                class="app-menu__icon app-menu__sub-chevron"
                aria-hidden="true"
              />
            </DropdownMenuItem>
          </template>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </span>
</template>

<script lang="ts">
import { defineComponent, markRaw, type Component, type PropType } from "vue";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "reka-ui";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Ellipsis as EllipsisIcon,
} from "lucide-vue-next";
import IconButton from "src/components/ui/IconButton.vue";
import OptionRow from "src/components/ui/OptionRow.vue";
import BottomSheet from "src/components/BottomSheet.vue";

/** One cell of an item's grid: a glyph (an emoji) with its spoken name. */
export type AppMenuCell = { key: string; glyph: string; label: string };

export type AppMenuItem = {
  key: string;
  label: string;
  icon?: Component;
  /** Destructive: drawn in the danger colour, grouped last under a hairline. */
  danger?: boolean;
  disabled?: boolean;
  testid?: string;
  /** Cells shown as a grid in the list's place; choosing one emits "key:cellKey". */
  grid?: AppMenuCell[];
};

export default defineComponent({
  name: "AppMenu",
  components: {
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuRoot,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    ChevronLeftIcon,
    ChevronRightIcon,
    IconButton,
    OptionRow,
    BottomSheet,
  },
  props: {
    /** The trigger's accessible name ("More options"). */
    label: { type: String, required: true },
    items: { type: Array as PropType<AppMenuItem[]>, required: true },
    icon: {
      type: [Object, Function] as PropType<Component>,
      default: () => markRaw(EllipsisIcon),
    },
    testid: { type: String, default: "" },
  },
  emits: ["select"],
  data() {
    return {
      open: false,
      /** The grid item whose page is showing, or null for the list. */
      page: null as AppMenuItem | null,
      portalTarget: "body" as string | HTMLElement,
    };
  },
  watch: {
    open(open: boolean) {
      if (!open) this.page = null;
    },
  },
  computed: {
    /** Below 600px (Quasar's sm breakpoint) the menu is a bottom sheet. */
    asSheet(): boolean {
      return this.$q.screen.lt.sm;
    },
    groups(): AppMenuItem[][] {
      const danger = this.items.filter((item) => item.danger);
      const rest = this.items.filter((item) => !item.danger);
      return [rest, danger].filter((group) => group.length);
    },
  },
  methods: {
    choose(key: string) {
      this.open = false;
      this.$emit("select", key);
    },
    onSheetSelect(item: AppMenuItem) {
      if (item.disabled) return;
      if (item.grid) this.page = item;
      else this.choose(item.key);
    },
    onSelect(event: Event, item: AppMenuItem) {
      if (!item.grid) {
        this.$emit("select", item.key);
        return;
      }
      // Keep the menu open and show the grid, its first cell under the keyboard.
      event.preventDefault();
      this.page = item;
      this.$nextTick(() => {
        const cell = document.querySelector<HTMLElement>(
          ".app-menu .app-menu__cell"
        );
        cell?.focus();
      });
    },
  },
  mounted() {
    const dialog = (this.$refs.root as HTMLElement).closest(".q-dialog__inner");
    if (dialog) this.portalTarget = dialog as HTMLElement;
  },
});
</script>
