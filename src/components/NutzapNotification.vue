<template>
  <div
    v-if="entries.length"
    class="q-pa-xs"
    style="max-width: 500px; margin: 0 auto"
  >
    <q-list bordered>
      <q-item v-for="entry in entries" :key="entry.ev.id">
        <q-item-section>
          <q-item-label class="text-weight-bold"
            >{{ entry.amount }} sats</q-item-label
          >
          <q-item-label caption>{{ entry.tier }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat
            dense
            color="primary"
            label="Claim"
            @click="claim(entry.ev)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useNutzapStore } from "stores/nutzap";
import token from "src/js/token";

export default defineComponent({
  name: "NutzapNotification",
  setup() {
    const store = useNutzapStore();
    const entries = computed(() => {
      return store.incoming.map((ev) => {
        let amount = 0;
        try {
          const decoded = token.decode(ev.content.trim());
          amount = decoded
            ? token.getProofs(decoded).reduce((s, p) => (s += p.amount), 0)
            : 0;
        } catch {}
        return { ev, amount, tier: "Nutzap" };
      });
    });

    const claim = (ev: any) => {
      store.claim(ev);
    };

    return { entries, claim };
  },
});
</script>
