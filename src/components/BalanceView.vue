<template>
  <q-card class="q-my-md q-py-sm">
    <q-card-section class="q-mt-sm q-py-xs">
      <div>
        <div class="row">
          <div class="col-12">
            <h3 class="q-my-none q-py-none">
              <strong> {{ getTotalBalance }} </strong>
              {{ tickerShort }}
            </h3>
          </div>
        </div>
        <div class="row q-mt-xs q-mb-none" v-if="mints.length > 1">
          <div class="col-12">
            <a class="text-weight-light">
              Balance on active mint:
              <b>{{ getBalance() }} {{ tickerShort }} </b></a
            >
          </div>
        </div>
        <div class="row q-mt-none q-mb-none" v-if="activeMintUrl">
          <div class="col-12">
            <a class="text-weight-light">
              Mint: <b>{{ getActiveMintUrlShort }}</b></a
            >
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
<script>
import { defineComponent, ref } from "vue";
export default defineComponent({
  name: "BalanceView",
  props: {
    proofs: Array,
    activeProofs: Array,
    mints: Array,
    tickerShort: String,
    activeMintUrl: String,
  },
  computed: {
    balance: function () {
      return this.activeProofs
        .map((t) => t)
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
    },
    getTotalBalance: function () {
      return this.proofs
        .map((t) => t)
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
    },
    getActiveMintUrlShort: function () {
      return this.getShortUrl(this.activeMintUrl);
    },
  },
  methods: {
    getShortUrl: function (url) {
      url = url.replace("https://", "");
      const cut_param = 46;
      if (url.length > cut_param && url.indexOf("/") != -1) {
        url =
          url.substring(0, url.indexOf("/") + 1) +
          "..." +
          url.substring(url.length - cut_param / 2, url.length);
      }
      return url;
    },
  },
});
</script>
