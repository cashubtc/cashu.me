<template>
  <q-btn
    rounded
    outline
    color="primary"
    @click="toggleUnit()"
    :label="activeUnitLabel"
  />
</template>
<script>
import { defineComponent } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { mapActions, mapState } from "pinia";
import { useMintsStore } from "stores/mints";
export default defineComponent({
  name: "ToggleUnit",
  mixins: [windowMixin],
  props: {
    tickerShort: String,
  },
  data: function () {
    return {
      chosenMint: null,
    };
  },
  mounted() {},
  watch: {},
  computed: {
    ...mapState(useMintsStore, ["activeUnit", "activeUnitLabel"]),
  },
  methods: {
    ...mapActions(useMintsStore, ["toggleUnit"]),
  },
});
</script>
