<template>
  <q-btn
    rounded
    outline
    :color="color"
    @click="toggleUnit()"
    :label="activeUnitLabelAdopted"
  />
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { useMintsStore } from "stores/mints";
export default defineComponent({
  name: "ToggleUnit",
  props: {
    balanceView: {
      type: Boolean,
      required: false,
    },
    color: {
      type: String,
      default: "primary",
    },
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
    activeUnitLabelAdopted: function () {
      if (!this.balanceView) {
        return this.activeUnitLabel;
      }
      // if the toggle is in the balance view, we want to show BTC instead of SAT
      if (this.activeUnitLabel === "SAT") {
        return "BTC";
      } else {
        return this.activeUnitLabel;
      }
    },
  },
  methods: {
    ...mapActions(useMintsStore, ["toggleUnit"]),
  },
});
</script>
