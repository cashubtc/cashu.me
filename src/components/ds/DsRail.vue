<template>
  <!-- The board's navigator: a thin rail on the far left with one tick per component, grouped
       by section. The tick in view is longer and brighter; hovering or focusing a tick shows the
       component's name. Ticks are links (#ds-<id>), so they deep link and work without script;
       arrow keys, Home and End move between them. -->
  <nav
    ref="rail"
    class="ds-rail"
    aria-label="Components"
    :style="{ '--ds-ticks': tickCount, '--ds-groups': groups.length }"
  >
    <ol class="ds-rail__groups">
      <li
        v-for="g in groups"
        v-show="g.items.some((i) => matches(i.id))"
        :key="g.id"
        class="ds-rail__group"
      >
        <span class="ds-rail__group-name">{{ g.title }}</span>
        <ol class="ds-rail__ticks" :aria-label="g.title">
          <li v-for="i in g.items" v-show="matches(i.id)" :key="i.id">
            <a
              :href="`#ds-${i.id}`"
              class="ds-rail__tick"
              :class="{ 'ds-rail__tick--active': active === i.id }"
              :aria-current="active === i.id ? 'location' : undefined"
              :data-ds-tick="i.id"
              @click.prevent="$emit('go', i.id)"
              @keydown="onKey"
            >
              <span class="ds-rail__mark" aria-hidden="true" />
              <span class="ds-rail__label">{{ i.name }}</span>
            </a>
          </li>
        </ol>
      </li>
    </ol>
  </nav>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

type RailGroup = {
  id: string;
  title: string;
  items: Array<{ id: string; name: string }>;
};

export default defineComponent({
  name: "DsRail",
  props: {
    groups: { type: Array as PropType<RailGroup[]>, required: true },
    active: { type: String, default: "" },
    matches: {
      type: Function as PropType<(id: string) => boolean>,
      required: true,
    },
  },
  emits: ["go"],
  computed: {
    tickCount(): number {
      return this.groups.reduce((n, g) => n + g.items.length, 0);
    },
  },
  methods: {
    onKey(e: KeyboardEvent) {
      const ticks = Array.from(
        (this.$refs.rail as HTMLElement).querySelectorAll<HTMLElement>(
          ".ds-rail__tick"
        )
      ).filter((t) => t.offsetParent !== null);
      const at = ticks.indexOf(e.currentTarget as HTMLElement);
      const to =
        e.key === "ArrowDown"
          ? at + 1
          : e.key === "ArrowUp"
          ? at - 1
          : e.key === "Home"
          ? 0
          : e.key === "End"
          ? ticks.length - 1
          : -2;
      if (to === -2) return;
      e.preventDefault();
      ticks[Math.max(0, Math.min(ticks.length - 1, to))]?.focus();
    },
  },
});
</script>

<style scoped>
.ds-rail {
  bottom: 0;
  display: flex;
  flex-direction: column;
  inset-inline-start: 0;
  justify-content: center;
  padding: 24px 0;
  position: fixed;
  top: 0;
  width: 44px;
  z-index: 10;
}
.ds-rail__groups,
.ds-rail__ticks {
  list-style: none;
  margin: 0;
  padding: 0;
}
.ds-rail__group + .ds-rail__group {
  margin-top: 10px;
}
.ds-rail__group-name {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  overflow: hidden;
  position: absolute;
  width: 1px;
}
/* Each tick is a 44px wide target up to 9px tall; on a short screen the ticks share the height
   left after the group gaps, so a long inventory never scrolls or clips the names. */
.ds-rail__tick {
  align-items: center;
  display: flex;
  height: clamp(
    3px,
    calc((100vh - 48px - var(--ds-groups) * 10px) / var(--ds-ticks)),
    9px
  );
  outline: none;
  padding-inline-start: 14px;
  position: relative;
  text-decoration: none;
  width: 44px;
}
.ds-rail__mark {
  background: var(--app-text-subtle);
  border-radius: 1px;
  height: 2px;
  opacity: 0.55;
  transition: width 0.18s ease, opacity 0.18s ease, background-color 0.18s ease;
  width: 10px;
}
.ds-rail__tick:hover .ds-rail__mark,
.ds-rail__tick:focus-visible .ds-rail__mark {
  opacity: 1;
  width: 16px;
}
.ds-rail__tick--active .ds-rail__mark {
  background: var(--app-text);
  opacity: 1;
  width: 20px;
}
.ds-rail__label {
  background: var(--app-raised);
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-sm);
  box-shadow: var(--app-shadow-md);
  color: var(--app-text);
  font-size: 12px;
  inset-inline-start: 40px;
  line-height: 1;
  opacity: 0;
  padding: 5px 8px;
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translate(-4px, -50%);
  transition: opacity 0.12s ease, transform 0.12s ease;
  white-space: nowrap;
}
.ds-rail__tick:hover .ds-rail__label,
.ds-rail__tick:focus-visible .ds-rail__label {
  opacity: 1;
  transform: translate(0, -50%);
}
.ds-rail__tick:focus-visible .ds-rail__mark {
  outline: 2px solid var(--q-primary);
  outline-offset: 3px;
}
@media (max-width: 599px) {
  .ds-rail {
    width: 28px;
  }
  .ds-rail__tick {
    padding-inline-start: 8px;
    width: 28px;
  }
  .ds-rail__label {
    inset-inline-start: 28px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ds-rail__mark,
  .ds-rail__label {
    transition: none;
  }
}
</style>
