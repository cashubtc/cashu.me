<!-- Text that never breaks inside a Chinese or Japanese word. CJK text may wrap between any
     two characters, so a short word like 钱包 split across lines; here each
     word from Intl.Segmenter is kept whole (src/css/elements.scss .cjk-word), so lines break
     only between words. Other locales, and browsers without Intl.Segmenter, render the text
     unchanged. -->
<template>
  <component :is="tag">
    <template v-if="words">
      <span v-for="(word, i) in words" :key="i" class="cjk-word">{{
        word
      }}</span>
    </template>
    <template v-else>{{ text }}</template>
  </component>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CjkText",
  props: {
    text: { type: String, required: true },
    tag: { type: String, default: "span" },
  },
  computed: {
    words(): string[] | null {
      // No i18n (a bare unit mount) reads as a non-CJK locale.
      const locale: string = (this as any).$i18n?.locale ?? "";
      if (!/^(zh|ja)/.test(locale) || typeof Intl === "undefined") return null;
      const Segmenter = (Intl as any).Segmenter;
      if (!Segmenter) return null;
      const segmenter = new Segmenter(locale, { granularity: "word" });
      return Array.from(
        segmenter.segment(this.text) as Iterable<{ segment: string }>,
        (part) => part.segment
      );
    },
  },
});
</script>
