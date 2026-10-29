<!-- A mint as a card (Mints tab, Discover, Restore): the identity row (avatar, name, host)
     with a status and an action on its end, then the holdings and the review line on the
     same edges. `skeleton` draws the same card with placeholders, so a loading list has
     exactly the loaded list's boxes. Styles: src/css/app.scss .mint-card. -->
<template>
  <q-item
    class="mint-card"
    :class="{ 'mint-card--host-only': !name && !loading && !skeleton }"
    :active="active"
    active-class="mint-card--active"
    :clickable="clickable && !skeleton"
    :aria-hidden="skeleton || undefined"
  >
    <slot name="overlay" />
    <div class="mint-card__body">
      <div class="mint-card__head">
        <MintInfoContainer
          class="col"
          :icon-url="iconUrl || undefined"
          :name="name || undefined"
          :url="url"
          :loading="loading"
          :unnamed-label="unnamedLabel"
          :skeleton="skeleton"
        />
        <template v-if="!skeleton">
          <PendingDots v-if="busy" class="mint-card__status" size="18px" />
          <slot v-else name="status" />
          <slot name="action" />
        </template>
      </div>
      <div
        v-if="balances.length || $slots.meta || skeleton"
        class="mint-card__foot"
        :class="{ 'mint-card__foot--meta': !balances.length }"
      >
        <!-- One order for several holdings in every direction ("₿500 + $25.00"). -->
        <div v-if="balances.length" class="mint-card__balances" dir="ltr">
          <template v-for="(balance, i) in balances" :key="balance">
            <!-- Several unit balances read as separate holdings joined by a plus; a middle dot
                 read as "₿500, worth $25.00" (council R68-R69). -->
            <span v-if="i > 0" class="mint-card__plus" aria-hidden="true"
              >+</span
            >
            <bdi dir="ltr" class="currency-unit-text">{{ balance }}</bdi>
          </template>
        </div>
        <MintReviewSummary v-if="skeleton" skeleton />
        <slot v-else name="meta" />
      </div>
      <slot />
    </div>
  </q-item>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import MintInfoContainer from "src/components/MintInfoContainer.vue";
import MintReviewSummary from "src/components/MintReviewSummary.vue";
import PendingDots from "src/components/ui/PendingDots.vue";

export default defineComponent({
  name: "MintCard",
  components: { MintInfoContainer, MintReviewSummary, PendingDots },
  props: {
    url: { type: String, default: "" },
    name: { type: String as PropType<string | null>, default: null },
    iconUrl: { type: String as PropType<string | null>, default: null },
    /** Formatted balances, one per unit held ("₿2,500", "$1.20"). */
    balances: { type: Array as PropType<string[]>, default: () => [] },
    /** The active or selected mint: the stronger fill. */
    active: { type: Boolean, default: false },
    clickable: { type: Boolean, default: false },
    /** The mint's info is still loading: the name line waits, the host stays. */
    loading: { type: Boolean, default: false },
    /** Working on this mint (switching to it, fetching it): the dots take the status slot. */
    busy: { type: Boolean, default: false },
    unnamedLabel: { type: String, default: "" },
    skeleton: { type: Boolean, default: false },
  },
});
</script>
