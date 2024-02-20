<template>
  <!-- ////////////////////// SETTINGS ////////////////// -->
  <div class="q-py-md q-px-xs text-left" on-left>
    <q-list padding>
      <q-item>
        <q-item-section>
          <q-item-label overline>Mints</q-item-label>
          <q-item-label caption
            >You can connect your wallet to multiple Cashu mints. Enter a mint
            URL and select the mint your want to use.</q-item-label
          >
        </q-item-section>
      </q-item>

      <!-- <q-item-label header>Your mints</q-item-label> -->
      <div v-for="mint in mints" :key="mint.url">
        <q-item
          :active="mint.url == activeMintUrl"
          active-class="text-weight-bold text-primary"
        >
          <q-item-section avatar>
            <q-icon
              :color="mint.url == activeMintUrl ? 'primary' : 'grey'"
              :name="
                mint.url == activeMintUrl
                  ? 'check_circle'
                  : 'radio_button_unchecked'
              "
              @click="activateMint(mint.url, (verbose = false))"
              class="cursor-pointer"
            />
          </q-item-section>
          <q-item-section class="q-mx-none q-pl-none" style="max-width: 1.05em">
            <q-icon
              name="content_copy"
              @click="copyText(mint.url)"
              size="1em"
              color="grey"
              class="q-mr-xs cursor-pointer"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label
              lines="1"
              @click="activateMint(mint.url, (verbose = false))"
              >{{ mint.url }}</q-item-label
            >
            <q-item-label caption v-if="mint.url == activeMintUrl"
              >This is your active mint.</q-item-label
            >
          </q-item-section>

          <!--add a q-btn to update url of mint-->
          <q-item-section side>
            <q-btn
              outline
              dense
              color="primary"
              icon="edit"
              @click="showModifyMintDialogWrapper(mint.url)"
              >Update URL
            </q-btn>
          </q-item-section>
          <!--add a button to update url of mint-->
          <!-- <button @click="showModifyMintDialogWrapper(mint.url)"> -->
          <!-- update mint url -->
          <!-- </button> -->

          <q-item-section side>
            <q-badge
              :color="mint.url == activeMintUrl ? 'primary' : 'grey'"
              :label="formatSat(mint.balance) + ' ' + tickerShort"
            />
          </q-item-section>
          <q-item-section side>
            <q-icon
              name="close"
              @click="showRemoveMintDialogWrapper(mint.url)"
              class="cursor-pointer"
            />
          </q-item-section>
        </q-item>

        <q-separator spaced inset="item" />
      </div>
    </q-list>
  </div>
  <div class="q-gutter-md q-pt-md q-px-sm">
    <div class="row-12">
      <q-input
        standout
        bottom-slots
        @keydown.enter.prevent="setShowAddMintDialog(true)"
        v-model="mintToAdd"
        label="Add new mint URL"
      >
        <template v-slot:before>
          <q-icon name="account_balance" />
        </template>

        <!-- <template v-slot:hint> Enter Mint URL</template> -->
        <!-- "addMint(mintToAdd)" -->
        <template v-slot:append>
          <q-btn
            round
            dense
            flat
            color="primary"
            icon="add"
            click
            @click="setShowAddMintDialog(true)"
          />
        </template>
      </q-input>
    </div>
  </div>
  <div class="q-py-sm q-px-xs text-left" on-left>
    <q-list padding>
      <q-item>
        <q-item-section>
          <q-item-label overline>Multimint Swaps</q-item-label>
          <q-item-label caption
            >Swap funds from one mint to another via Lightning. Note: Leave room
            for potential Lightning fees.</q-item-label
          >
        </q-item-section>
      </q-item>
      <q-item>
        <q-select
          clearable
          filled
          dense
          color="primary"
          v-model="swapData.from_url"
          :options="swapDataOptions()"
          option-value="url"
          option-label="shorturl"
          label="Swap from"
          style="min-width: 200px"
        />
      </q-item>
      <q-item>
        <q-select
          clearable
          filled
          dense
          color="primary"
          v-model="swapData.to_url"
          :options="swapDataOptions()"
          option-value="url"
          option-label="shorturl"
          label="Swap to"
          style="min-width: 200px"
        />
      </q-item>
      <q-item>
        <q-input
          filled
          dense
          v-model.number="swapData.amount"
          type="number"
          :label="'Amount (' + tickerShort + ')'"
          style="min-width: 200px"
        ></q-input>
        <q-btn
          class="q-mx-md"
          color="primary"
          @click="
            mintSwap(
              swapData.from_url.url,
              swapData.to_url.url,
              swapData.amount
            )
          "
          :disable="
            !swapData.from_url || !swapData.to_url || !(swapData.amount > 0)
          "
          >Swap</q-btn
        >
      </q-item>
    </q-list>
  </div>
  <div class="q-py-sm q-px-xs text-left" on-left>
    <q-list padding>
      <q-item>
        <q-item-section>
          <q-item-label overline>Advanced</q-item-label>
          <q-item-label caption
            >The following settings are for development and
            debugging.</q-item-label
          >
        </q-item-section>
      </q-item>
      <q-item>
        <q-btn
          dense
          flat
          outline
          color="primary"
          click
          @click="enable_terminal"
        >
          Open debug terminal
        </q-btn>
      </q-item>
    </q-list>
  </div>

  <q-dialog
    v-model="showAddMintDialog"
    @keydown.enter.prevent="addMint(mintToAdd, (verbose = true))"
  >
    <q-card class="q-pa-lg">
      <h6 class="q-my-md text-primary">Do you trust this mint?</h6>
      <p>
        A Cashu mint does not know about your financial activity but it controls
        your funds. Make sure that you trust the operator of this mint.
      </p>
      <q-input
        outlined
        readonly
        v-model="mintToAdd"
        label="Mint URL"
        type="textarea"
        autogrow
        class="q-mb-xs"
      ></q-input>
      <div class="row q-mt-lg">
        <q-btn
          outline
          v-close-popup
          color="primary"
          icon="check"
          @click="addMint(mintToAdd, (verbose = true))"
          >Add mint</q-btn
        >
        <q-btn v-close-popup flat color="grey" class="q-ml-auto">Cancel</q-btn>
      </div>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showRemoveMintDialog">
    <q-card class="q-pa-lg">
      <h6 class="q-my-md text-primary">
        Are you sure you want to delete this mint?
      </h6>
      <div class="row q-mt-lg">
        <q-btn
          outline
          v-close-popup
          color="primary"
          @click="removeMint(mintToRemove, (verbose = true))"
          >Remove mint</q-btn
        >
        <q-btn v-close-popup flat color="grey" class="q-ml-auto">Cancel</q-btn>
      </div>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showModifyMintDialog">
    <q-card class="q-pa-lg">
      <h6 class="q-my-md text-primary">Update mint URL</h6>
      <q-input
        outlined
        v-model="mintUpdate"
        label="Mint URL"
        type="textarea"
        autogrow
        class="q-mb-xs"
      ></q-input>
      <div class="row q-mt-lg">
        <q-btn
          outline
          v-close-popup
          color="primary"
          @click="modifyMint(mintToUpdate, mintUpdate)"
          >Update mint
        </q-btn>
        <q-btn v-close-popup flat color="grey" class="q-ml-auto">Cancel</q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore } from "src/stores/mints";

export default defineComponent({
  name: "SettingsView",
  mixins: [windowMixin],
  props: {
    tickerShort: String,
    requestMint: Function,
    decodeRequest: Function,
    melt: Function,
    invoiceCheckWorker: Function,
    payInvoiceData: Object,
    showMintDialog: Boolean,
    mintToAddWalletPage: String,
  },
  data: function () {
    return {
      swapData: {
        from_url: "",
        to_url: "",
        amount: 0,
      },
      addMintDialog: {
        show: false,
      },
    };
  },
  computed: {
    ...mapState(useMintsStore, ["activeMintUrl", "mints"]),
    ...mapWritableState(useMintsStore, [
      "mintToAdd",
      "mintToRemove",
      "mintToUpdate",
      "showAddMintDialog",
      "showRemoveMintDialog",
      "showModifyMintDialog",
    ]),
  },
  watch: {
    showMintDialog: function () {
      this.addMintDialog.show = this.showMintDialog;
    },
    mintToAddWalletPage: function () {
      if (this.mintToAddWalletPage.length > 0) {
        this.mintToAdd = this.mintToAddWalletPage;
      }
    },
  },
  methods: {
    ...mapActions(useMintsStore, [
      "addMint",
      "removeMint",
      "modifyMint",
      "activateMint",
      "setMintToRemove",
      "setMintToUpdate",
      "setShowAddMintDialog",
      "setShowRemoveMintDialog",
      "setShowModifyMintDialog",
    ]),
    swapDataOptions: function () {
      let options = [];
      for (const [i, m] of Object.entries(this.mints)) {
        options.push({ url: m.url, shorturl: getShortUrl(m.url) });
      }
      return options;
    },
    showRemoveMintDialogWrapper: function (mint) {
      this.setMintToRemove(mint);
      this.setShowRemoveMintDialog(true);
    },
    showModifyMintDialogWrapper: function (mint) {
      this.setMintToUpdate(mint);
      this.setShowModifyMintDialog(true);
    },
    mintSwap: async function (from_url, to_url, amount) {
      // get invoice
      await this.activateMint(to_url);
      let invoice = await this.requestMint(amount);

      // pay invoice
      await this.activateMint(from_url);
      await this.decodeRequest(invoice.pr);
      await this.melt();

      // settle invoice on other side
      await this.activateMint(to_url);
      await this.invoiceCheckWorker();
      this.notifySuccess("Swap successful!");
    },
    enable_terminal: function () {
      // enable debug terminal
      var script = document.createElement("script");
      script.src = "//cdn.jsdelivr.net/npm/eruda";
      document.body.appendChild(script);
      script.onload = function () {
        eruda.init();
      };
    },
  },
  created: function () {},
});
</script>
