<!-- Advanced settings' keyset counter tool: one row in the developer card (what it fixes, and
     how many keysets it covers) that opens a sheet with the counters grouped by mint. Each
     keyset row has its id, its counter in one aligned column and a + that increases it.
     Only mints with counters appear; the owner hides the row when there are none. -->
<template>
  <SettingsActionRow
    :label="$t('Settings.advanced.developer.keyset_counters.title')"
    :caption="caption"
    data-testid="keyset-counters"
    @click="open = true"
  />
  <BottomSheet
    v-model="open"
    :title="$t('Settings.advanced.developer.keyset_counters.title')"
  >
    <div class="keysets__hint">
      {{ $t("Settings.advanced.developer.keyset_counters.sheet_hint") }}
    </div>
    <div v-for="group in groups" :key="group.url" class="keysets__group">
      <div class="keysets__mint">
        <IconCircle size="sm" class="keysets__avatar" :src="group.iconUrl">
          <MintIcon :size="16" />
        </IconCircle>
        <span class="ellipsis">{{ group.name }}</span>
        <span aria-hidden="true">·</span>
        <span>{{ group.keysets.length }}</span>
        <!-- One column label for the numbers below, instead of "Counter:" on every row. -->
        <span v-if="group === groups[0]" class="keysets__column">{{
          $t("Settings.advanced.developer.keyset_counters.column")
        }}</span>
      </div>
      <q-list class="settings-card">
        <q-item v-for="k in group.keysets" :key="k.id" class="keysets__row">
          <q-item-section>
            <q-item-label class="app-mono keysets__id" :title="k.id">{{
              short(k.id)
            }}</q-item-label>
          </q-item-section>
          <q-item-section side class="keysets__side">
            <span class="keysets__count">{{ k.counter }}</span>
            <IconButton
              :icon="PlusIcon"
              :label="
                $t('Settings.advanced.developer.keyset_counters.increase', {
                  id: short(k.id),
                })
              "
              class="keysets__plus"
              @click="$emit('increase', k.id)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </BottomSheet>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { Building2 as MintIcon, Plus as PlusIcon } from "lucide-vue-next";
import BottomSheet from "src/components/BottomSheet.vue";
import IconButton from "src/components/ui/IconButton.vue";
import IconCircle from "src/components/ui/IconCircle.vue";
import SettingsActionRow from "src/components/ui/SettingsActionRow.vue";

export type KeysetCounterGroup = {
  url: string;
  name: string;
  iconUrl?: string | null;
  keysets: { id: string; counter: number }[];
};

export default defineComponent({
  name: "KeysetCountersRow",
  components: {
    BottomSheet,
    IconButton,
    IconCircle,
    MintIcon,
    SettingsActionRow,
  },
  props: {
    /** Mints with at least one keyset counter. */
    groups: { type: Array as PropType<KeysetCounterGroup[]>, required: true },
  },
  emits: ["increase"],
  setup() {
    return { PlusIcon };
  },
  data() {
    return { open: false };
  },
  computed: {
    caption(): string {
      const keysets = this.groups.reduce((n, g) => n + g.keysets.length, 0);
      return [
        this.$t("Settings.advanced.developer.keyset_counters.fixes"),
        this.$t("Settings.advanced.developer.keyset_counters.keysets", keysets),
      ].join(" · ");
    },
  },
  methods: {
    short(id: string): string {
      return id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-8)}` : id;
    },
  },
});
</script>

<style scoped>
.keysets__hint {
  color: var(--app-text-muted);
  font-size: 13px;
  line-height: 1.45;
  margin-bottom: 16px;
}
.keysets__group + .keysets__group {
  margin-top: 20px;
}
/* The mint as a small label over its card: avatar, name and how many keysets. */
.keysets__mint {
  align-items: center;
  color: var(--app-text-muted);
  display: flex;
  font-size: 13px;
  font-weight: 600;
  gap: 6px;
  margin-bottom: 8px;
  min-width: 0;
}
.keysets__avatar {
  height: 24px;
  margin-inline-end: 4px;
  width: 24px;
}
.keysets__column {
  font-weight: 500;
  margin-inline-start: auto;
  /* Over the counts: the + column (44px less its 12px pull) sits after them. */
  margin-inline-end: 34px;
}
.keysets__row {
  min-height: 52px;
}
.keysets__id {
  color: var(--app-text);
  font-size: 15px;
}
.keysets__side {
  align-items: center;
  flex-direction: row;
  gap: 2px;
}
.keysets__count {
  color: var(--app-text-muted);
  font-variant-numeric: tabular-nums;
  min-width: 3ch;
  text-align: end;
}
/* The + glyph's ink on the card's 16px end guideline (44px target, 20px glyph). */
.keysets__plus {
  margin-inline-end: -12px !important;
}
</style>
