<template>
  <div class="q-pa-xs" style="max-width: 500px; margin: 0 auto">
    <q-list>
      <q-item
        v-for="token in paginatedTokens"
        :key="token.id"
        clickable
        v-ripple
        class="q-px-md"
      >
        <q-item-section avatar>
          <q-icon name="circle" :style="{ color: token.color || 'grey' }" />
        </q-item-section>
        <q-item-section
          side
          @click="showTokenDialog(token)"
          style="width: 140px"
          class="q-pr-none items-center"
        >
          <q-item-label class="text-weight-bold">
            <q-icon
              :name="token.amount >= 0 ? 'call_received' : 'call_made'"
              :color="
                token.status === 'paid'
                  ? token.amount >= 0
                    ? 'green'
                    : 'red'
                  : ''
              "
              class="q-mr-xs"
              size="xs"
            />
            <span> {{ formatCurrency(token.amount, token.unit) }} </span>
          </q-item-label>
        </q-item-section>

        <q-item-section
          class="items-center q-pl-lg"
          @click="showTokenDialog(token)"
          style="width: 300px"
        >
          <q-item-label>
            <!-- {{
              token.token.slice(0, 10) + "..." + token.token.slice(-8)
            }} -->
            {{ $t("HistoryTable.row.type_label") }}
          </q-item-label>
          <q-item-label caption>
            {{
              $t("HistoryTable.row.date_label", {
                value: formattedDate(token.date),
              })
            }}
          </q-item-label>
          <q-item-label caption v-if="token.label">
            {{ token.label }}
          </q-item-label>
          <q-item-label caption v-if="token.description">
            {{ token.description }}
          </q-item-label>
        </q-item-section>

        <q-item-section side top class="q-gutter-xs">
          <q-btn
            flat
            dense
            icon="edit"
            @click.stop="openEditLabel(token)"
            class="cursor-pointer"
            :aria-label="$t('HistoryTable.actions.edit_label.tooltip_text')"
            :title="$t('HistoryTable.actions.edit_label.tooltip_text')"
          >
            <q-tooltip>{{
              $t("HistoryTable.actions.edit_label.tooltip_text")
            }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            icon="sync"
            @click="checkTokenSpendable(token)"
            class="cursor-pointer"
            v-if="token.status === 'pending' && token.amount < 0"
            :aria-label="$t('HistoryTable.actions.check_status.tooltip_text')"
            :title="$t('HistoryTable.actions.check_status.tooltip_text')"
          >
            <q-tooltip>{{
              $t("HistoryTable.actions.check_status.tooltip_text")
            }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            icon="arrow_circle_down"
            @click="receiveToken(token.token)"
            class="cursor-pointer"
            v-if="token.status === 'pending' && token.amount > 0"
            :aria-label="$t('HistoryTable.actions.receive.tooltip_text')"
            :title="$t('HistoryTable.actions.receive.tooltip_text')"
          >
            <q-tooltip>{{
              $t("HistoryTable.actions.receive.tooltip_text")
            }}</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-list>
    <div class="text-center q-mt-lg">
      <q-btn
        rounded
        outline
        dense
        @click="filterPending = !filterPending"
        :color="filterPending ? 'primary' : 'grey'"
        :label="
          $t(
            filterPending
              ? 'HistoryTable.actions.show_all.label'
              : 'HistoryTable.actions.filter_pending.label'
          )
        "
        class="q-ml-sm q-px-md"
        size="sm"
      />
    </div>
    <div v-if="paginatedTokens.length === 0" class="text-center q-mt-lg">
      <q-item-label caption class="text-primary">{{
        $t("HistoryTable.empty_text")
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
          @input="handlePageChange"
        />
      </div>
    </div>
    <q-dialog v-model="editDialog.show">
      <q-card class="q-pa-md" style="max-width: 400px">
        <h6 class="q-mt-none q-mb-md">
          {{ $t("HistoryTable.actions.edit_label.title") }}
        </h6>
        <q-input
          v-model="editDialog.label"
          outlined
          :label="$t('ReceiveTokenDialog.inputs.label.label')"
        />
        <q-input
          v-model="editDialog.color"
          outlined
          type="color"
          class="q-mt-md"
          :label="$t('bucket.color')"
        />
        <q-input
          v-model="editDialog.description"
          outlined
          class="q-mt-md"
          :label="$t('ReceiveTokenDialog.inputs.description.label')"
        />
        <div class="row q-mt-md">
          <q-btn color="primary" rounded @click="saveLabel">{{
            $t("global.actions.update.label")
          }}</q-btn>
          <q-btn flat rounded color="grey" class="q-ml-auto" v-close-popup>{{
            $t("global.actions.cancel.label")
          }}</q-btn>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { debug } from "src/js/logger";
import { defineComponent } from "vue";
import { shortenString } from "src/js/string-utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useTokensStore } from "src/stores/tokens";
import { mapState, mapWritableState, mapActions } from "pinia";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { useWalletStore } from "src/stores/wallet";
import { useSendTokensStore } from "src/stores/sendTokensStore";
import token from "../js/token";
import { notify } from "src/js/notify";
import { DEFAULT_COLOR } from "src/js/constants";

export default defineComponent({
  name: "HistoryTable",
  mixins: [windowMixin],
  props: {
    bucketId: {
      type: String,
      default: null,
    },
  },
  data: function () {
    return {
      currentPage: 1,
      pageSize: 5,
      filterPending: false,
      editDialog: {
        show: false,
        label: "",
        color: DEFAULT_COLOR,
        description: "",
        token: null,
      },
    };
  },
  watch: {
    filterPending: function () {
      this.currentPage = 1;
    },
    bucketId() {
      this.currentPage = 1;
    },
  },
  computed: {
    ...mapState(useTokensStore, ["historyTokens"]),
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
    ]),
    ...mapWritableState(useSendTokensStore, [
      "showSendTokens",
      "sendData",
      "showLockInput",
    ]),
    filteredTokens() {
      if (this.bucketId) {
        return this.historyTokens.filter((t) => t.bucketId === this.bucketId);
      }
      return this.historyTokens;
    },
    maxPages() {
      return Math.ceil(this.filteredTokens.length / this.pageSize);
    },
    paginatedTokens() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      if (this.filterPending) {
        return this.filteredTokens
          .filter((historyToken) => historyToken.status === "pending")
          .slice()
          .reverse()
          .slice(start, end);
      }
      return this.filteredTokens.slice().reverse().slice(start, end);
    },
  },
  methods: {
    ...mapActions(useWalletStore, ["checkTokenSpendable"]),
    ...mapActions(useTokensStore, ["editHistoryToken"]),
    formattedDate(date_str) {
      const date = parseISO(date_str); // Convert string to date object
      return formatDistanceToNow(date, { addSuffix: false }); // "6 hours ago"
    },
    shortenString: function (s) {
      return shortenString(s, 20, 10);
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    receiveToken(tokenStr) {
      this.receiveData.tokensBase64 = tokenStr;
      this.showReceiveTokens = true;
    },
    showTokenDialog: function (historyToken) {
      if (historyToken.token === undefined) {
        notify(this.$i18n.t("HistoryTable.old_token_not_found_error_text"));
        return;
      }
      const tokensBase64 = historyToken.token;
      debug("##### showTokenDialog");
      const tokenObj = token.decode(tokensBase64);
      this.sendData.tokens = token.getProofs(tokenObj);
      this.sendData.tokensBase64 = tokensBase64;
      this.sendData.paymentRequest = historyToken.paymentRequest;
      this.sendData.historyAmount = historyToken.amount;
      this.sendData.historyToken = historyToken;
      this.showSendTokens = true;
    },
    openEditLabel(token) {
      this.editDialog.token = token;
      this.editDialog.label = token.label || "";
      this.editDialog.color = token.color || DEFAULT_COLOR;
      this.editDialog.description = token.description || "";
      this.editDialog.show = true;
    },
    saveLabel() {
      if (!this.editDialog.token) return;
      this.editHistoryToken(this.editDialog.token.token, {
        newLabel: this.editDialog.label,
        newColor: this.editDialog.color,
        newDescription: this.editDialog.description,
      });
      this.editDialog.show = false;
    },
  },
  created: function () {},
});
</script>
