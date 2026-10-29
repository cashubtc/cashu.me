<!-- An onboarding slide: a hero (a large icon in a round slot, or the slide's own artwork), a
     title and a description (src/css/elements.scss .welcome-slide__*), then the slide's own
     content. Every step shares one column: the app column (FlowColumn) with one 16px inset,
     the same as the footer's (FlowFooter), so nothing on a step sets its own width or gutter.
     The body scrolls above the footer when a step outgrows the screen. -->
<template>
  <div class="welcome-scaffold">
    <div class="welcome-scaffold__scroll">
      <FlowColumn class="q-px-md welcome-slide__content" data-welcome-column>
        <div v-if="icon || $slots.hero" class="welcome-slide__icon">
          <slot name="hero">
            <IconCircle size="xl">
              <component :is="icon" :size="36" :stroke-width="1.75" />
            </IconCircle>
          </slot>
        </div>

        <h1 class="welcome-slide__title">{{ title }}</h1>

        <CjkText
          v-if="text"
          tag="p"
          class="welcome-slide__description"
          :text="text"
        />

        <slot />
      </FlowColumn>
    </div>
    <!-- The first step's own actions; later steps share the page's Back and Next. -->
    <FlowFooter v-if="$slots.footer">
      <slot name="footer" />
    </FlowFooter>
  </div>
</template>

<script lang="ts">
import CjkText from "src/components/ui/CjkText.vue";
import FlowColumn from "src/components/ui/FlowColumn.vue";
import FlowFooter from "src/components/ui/FlowFooter.vue";
import IconCircle from "src/components/ui/IconCircle.vue";
import { defineComponent, type Component, type PropType } from "vue";

export default defineComponent({
  name: "WelcomeSlideScaffold",
  components: { CjkText, FlowColumn, FlowFooter, IconCircle },
  props: {
    /** A lucide icon for the header circle; leave it out when the hero slot has artwork. */
    icon: {
      type: [Object, Function] as PropType<Component>,
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
  },
});
</script>

<style scoped>
.welcome-scaffold {
  background: var(--app-welcome-bg);
  box-sizing: border-box;
  color: var(--app-text);
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Vertical rhythm only: the side gutter is the column's own 16px inset. */
.welcome-scaffold__scroll {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: 40px 0 20px;
  scroll-padding-block: 24px;
}

.welcome-scaffold__scroll > .flow-column {
  flex: 1 0 auto;
}

@media (max-width: 600px) {
  .welcome-scaffold__scroll {
    padding: 24px 0 16px;
  }
}
</style>
