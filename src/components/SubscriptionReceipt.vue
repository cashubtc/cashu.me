<template>
  <q-dialog
    v-model="model"
    persistent
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="q-pa-md qcard" style="min-width: 300px; max-width: 500px">
      <q-card-section class="text-h6">{{
        $t("SubscriptionReceipt.title")
      }}</q-card-section>
      <q-card-section style="max-height: 300px">
        <q-carousel
          v-if="receipts.length"
          v-model="activeSlide"
          :height="260"
          animated
          swipeable
          control-color="primary"
        >
          <q-carousel-slide
            v-for="(r, i) in receipts"
            :name="i + 1"
            :key="r.id"
            class="q-pa-md"
          >
            <div class="q-mb-sm"><strong>Amount:</strong> {{ r.amount }}</div>
            <div class="q-mb-sm">
              <strong>Date:</strong> {{ formatDate(r) }}
            </div>
            <div class="q-mb-sm">
              <div class="row items-center no-wrap">
                <span
                  >{{ r.tokenString.slice(0, 16)
                  }}<span v-if="r.tokenString.length > 16">…</span></span
                >
                <q-btn
                  flat
                  dense
                  size="sm"
                  :icon="expanded[r.id] ? 'expand_less' : 'expand_more'"
                  class="q-ml-xs"
                  @click.stop="toggle(r.id)"
                  :aria-label="
                    expanded[r.id]
                      ? $t('SubscriptionReceipt.actions.collapse_token.label')
                      : $t('SubscriptionReceipt.actions.expand_token.label')
                  "
                />
              </div>
              <q-slide-transition>
                <div
                  v-if="expanded[r.id]"
                  class="text-caption q-mt-xs token-full"
                >
                  {{ r.tokenString }}
                </div>
              </q-slide-transition>
            </div>
            <div class="text-right q-mt-sm">
              <q-btn
                flat
                color="primary"
                size="sm"
                @click="copyToken(r.tokenString)"
              >
                {{ $t("global.actions.copy.label") }}
              </q-btn>
              <q-btn
                flat
                color="primary"
                size="sm"
                @click="saveToken(r.tokenString)"
              >
                {{ $t("SubscriptionReceipt.actions.save.label") }}
              </q-btn>
            </div>
          </q-carousel-slide>
        </q-carousel>
        <div v-else class="text-center text-grey">No receipts</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn v-close-popup flat color="grey">{{
          $t("global.actions.close.label")
        }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useClipboard } from "src/composables/useClipboard";

export default defineComponent({
  name: "SubscriptionReceipt",
  mixins: [windowMixin],
  props: {
    modelValue: Boolean,
    receipts: {
      type: Array,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup() {
    const { copy } = useClipboard();
    return { copy };
  },
  data() {
    return {
      expanded: {} as Record<string, boolean>,
      activeSlide: 1,
    };
  },
  computed: {
    model: {
      get(): boolean {
        return this.modelValue;
      },
      set(v: boolean) {
        this.$emit("update:modelValue", v);
      },
    },
  },
  watch: {
    modelValue(val: boolean) {
      if (val) this.activeSlide = 1;
    },
    receipts() {
      this.activeSlide = 1;
    },
  },
  methods: {
    copyToken(token: string) {
      this.copy(token);
    },
    saveToken(token: string) {
      const blob = new Blob([token], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "subscription_token.txt";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    toggle(id: string) {
      this.$set(this.expanded, id, !this.expanded[id]);
    },
    formatDate(r: any) {
      if (r.locktime) {
        const d = new Date(r.locktime * 1000);
        return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
          "0" + d.getDate()
        ).slice(-2)} ${("0" + d.getHours()).slice(-2)}:${(
          "0" + d.getMinutes()
        ).slice(-2)}`;
      }
      try {
        return new Date(r.date).toISOString();
      } catch {
        return r.date;
      }
    },
  },
});
</script>

<style scoped>
.token-full {
  word-break: break-all;
  font-family: monospace;
  font-size: 0.9em;
}
</style>
