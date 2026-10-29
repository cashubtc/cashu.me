<!-- Dev-only: a static lookalike of ChooseMint's dense picker (which needs the mints store),
     drawn with the real .mint-picker recipe so an exploration specimen looks like the screen.
     The `end` slot sits before the chevron; `below` hangs under the field. -->
<template>
  <div class="q-pb-md">
    <div class="row q-mt-xs q-mb-none">
      <div class="col-12 mint-picker mint-picker--dense">
        <IconCircle size="sm" class="mint-picker__avatar" aria-hidden="true">
          <Building2Icon :size="20" class="mint-glyph" />
        </IconCircle>
        <span class="mint-picker__text">
          <span class="mint-picker__name ellipsis">{{ name }}</span>
          <span class="mint-picker__caption">
            <bdi dir="ltr">{{ balance }}</bdi>
            {{ $t("ChooseMint.available_text") }}
          </span>
        </span>
        <slot name="end">
          <IconButton
            type="button"
            class="mint-picker__trigger"
            :label="$t('ChooseMint.sheet_title')"
          >
            <ChevronDownIcon
              :size="20"
              class="mint-picker__chevron"
              aria-hidden="true"
            />
          </IconButton>
        </slot>
      </div>
    </div>
    <slot name="below" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  Building2 as Building2Icon,
  ChevronDown as ChevronDownIcon,
} from "lucide-vue-next";
import IconButton from "src/components/ui/IconButton.vue";
import IconCircle from "src/components/ui/IconCircle.vue";

export default defineComponent({
  name: "ExploreMintPicker",
  components: { Building2Icon, ChevronDownIcon, IconButton, IconCircle },
  props: {
    name: { type: String, default: "mint.minibits.cash" },
    balance: { type: String, default: "₿2,289" },
  },
});
</script>
