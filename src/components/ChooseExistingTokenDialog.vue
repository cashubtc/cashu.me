<template>
  <q-dialog v-model="model" persistent>
    <q-card class="q-pa-md qcard" style="min-width: 300px">
      <q-card-section class="text-h6">{{
        $t("ChooseExistingTokenDialog.title")
      }}</q-card-section>
      <q-card-section style="max-height: 300px; overflow-y: auto">
        <q-list>
          <q-item
            v-for="t in tokens"
            :key="t.token"
            clickable
            @click="selectToken(t.token)"
          >
            <q-item-section>
              <q-item-label>{{
                formatCurrency(t.amount, t.unit)
              }}</q-item-label>
              <q-item-label caption>{{ t.label }}</q-item-label>
            </q-item-section>
          </q-item>
          <div v-if="!tokens.length" class="text-center text-grey">
            {{ $t("ChooseExistingTokenDialog.empty") }}
          </div>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" @click="back">{{
          $t("global.actions.cancel.label")
        }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useTokensStore } from "stores/tokens";
import { useUiStore } from "stores/ui";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "ChooseExistingTokenDialog",
  props: {
    modelValue: Boolean,
    bucketId: {
      type: String,
      required: true,
    },
  },
  emits: ["update:modelValue", "selected", "back"],
  setup(props, { emit }) {
    const tokensStore = useTokensStore();
    const uiStore = useUiStore();
    const { historyTokens } = storeToRefs(tokensStore);

    const model = computed({
      get: () => props.modelValue,
      set: (v: boolean) => emit("update:modelValue", v),
    });

    const tokens = computed(() =>
      historyTokens.value.filter(
        (t) => t.bucketId === props.bucketId && t.status === "pending",
      ),
    );

    function selectToken(token: string) {
      emit("selected", token);
    }

    function back() {
      emit("back");
    }

    function formatCurrency(amount: number, unit: string) {
      return uiStore.formatCurrency(amount, unit);
    }

    return { model, tokens, selectToken, back, formatCurrency };
  },
});
</script>
