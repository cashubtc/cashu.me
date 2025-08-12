<template>
  <div class="q-pa-xs" style="max-width: 500px; margin: 0 auto">
    <h6 class="q-mt-none q-mb-md">
      {{ $t("BucketDetail.locked_tokens_heading") }}
    </h6>
    <q-list bordered>
      <q-item v-for="token in paginatedTokens" :key="token.id">
        <q-item-section avatar>
          <q-icon name="lock" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-bold">
            {{ formatCurrency(token.amount, activeUnit) }}
          </q-item-label>
          <q-item-label caption>{{
            token.label || "Locked tokens"
          }}</q-item-label>
          <q-item-label caption>
            {{
              $t("LockedTokensTable.row.receiver_label", {
                value: shortenString(pubkeyNpub(token.pubkey), 15, 6),
              })
            }}
          </q-item-label>
          <q-item-label caption v-if="token.locktime">
            {{
              $t("LockedTokensTable.row.unlock_label", {
                value: formatTs(token.locktime),
              })
            }}
          </q-item-label>
          <q-item-label caption>
            {{
              $t("LockedTokensTable.row.date_label", {
                value: formattedDate(token.date),
              })
            }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge
            v-if="token.redeemed"
            color="positive"
            rounded
            class="q-mr-sm"
            ><q-icon name="check"
          /></q-badge>
          <q-btn
            flat
            dense
            icon="content_copy"
            @click="copy(token.token)"
            :aria-label="$t('LockedTokensTable.actions.copy.tooltip_text')"
            :title="$t('LockedTokensTable.actions.copy.tooltip_text')"
          >
            <q-tooltip>{{
              $t("LockedTokensTable.actions.copy.tooltip_text")
            }}</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-list>
    <div v-if="paginatedTokens.length === 0" class="text-center q-mt-md">
      <q-item-label caption>{{
        $t("LockedTokensTable.empty_text")
      }}</q-item-label>
    </div>
    <div v-else-if="maxPages > 1" class="text-center q-mt-lg">
      <div style="display: flex; justify-content: center">
        <q-pagination
          v-model="currentPage"
          :max="maxPages"
          :max-pages="5"
          direction-links
          boundary-links
        />
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { useClipboard } from "src/composables/useClipboard";
import { formatDistanceToNow, parseISO } from "date-fns";
import { shortenString } from "src/js/string-utils";
import { useLockedTokensStore } from "stores/lockedTokens";
import { useMintsStore } from "stores/mints";
import { nip19 } from "nostr-tools";

export default defineComponent({
  name: "LockedTokensTable",
  mixins: [windowMixin],
  props: {
    bucketId: { type: String, required: true },
  },
  setup() {
    const { copy } = useClipboard();
    return { copy };
  },
  data() {
    return { currentPage: 1, pageSize: 5 };
  },
  computed: {
    ...mapState(useLockedTokensStore, ["lockedTokens"]),
    ...mapState(useMintsStore, ["activeUnit"]),
    filteredTokens() {
      return this.lockedTokens.filter((t) => t.bucketId === this.bucketId);
    },
    maxPages() {
      return Math.ceil(this.filteredTokens.length / this.pageSize);
    },
    paginatedTokens() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredTokens.slice().reverse().slice(start, end);
    },
  },
  methods: {
    shortenString,
    formattedDate(dateStr) {
      const date = parseISO(dateStr);
      return formatDistanceToNow(date, { addSuffix: false });
    },
    formatTs(ts) {
      const d = new Date(ts * 1000);
      return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
        "0" + d.getDate()
      ).slice(-2)} ${("0" + d.getHours()).slice(-2)}:${(
        "0" + d.getMinutes()
      ).slice(-2)}`;
    },
    pubkeyNpub(hex) {
      try {
        if (!hex) return "";
        return nip19.npubEncode(hex);
      } catch (e) {
        return hex;
      }
    },
  },
});
</script>
