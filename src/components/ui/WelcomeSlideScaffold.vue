<!-- An onboarding slide: the welcome background, a large icon in a round slot, a title and a
     description (src/css/elements.scss .welcome-slide__*), then the slide's own content. -->
<template>
  <div
    class="welcome-scaffold"
    :class="{
      'welcome-scaffold--themed-text': themedText,
      'welcome-scaffold--flush-mobile': !mobileGutter,
    }"
  >
    <div class="welcome-slide__content">
      <div class="welcome-slide__icon">
        <IconCircle size="xl">
          <component :is="icon" :size="36" :stroke-width="1.75" />
        </IconCircle>
      </div>

      <h1 class="welcome-slide__title">{{ title }}</h1>

      <p class="welcome-slide__description">
        {{ text }}
      </p>

      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import IconCircle from "src/components/ui/IconCircle.vue";
import { defineComponent, type Component, type PropType } from "vue";

export default defineComponent({
  name: "WelcomeSlideScaffold",
  components: { IconCircle },
  props: {
    /** A lucide icon component for the header circle (outline, like every other icon). */
    icon: {
      type: [Object, Function] as PropType<Component>,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    /** Body text in the theme ink (var(--app-text)) rather than white. */
    themedText: {
      type: Boolean,
      default: false,
    },
    /** On phones, keep a 16px side gutter; off when the carousel's own inset is enough. */
    mobileGutter: {
      type: Boolean,
      default: true,
    },
  },
});
</script>

<style scoped>
.welcome-scaffold {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background: var(--app-welcome-bg);
  color: white;
  padding: 40px 20px 20px 20px;
  box-sizing: border-box;
}

.welcome-scaffold--themed-text {
  color: var(--app-text);
}

@media (max-width: 600px) {
  .welcome-scaffold {
    padding: 24px 16px 16px 16px;
  }

  /* The carousel slide already insets 16px: the text sits on the shared 16px gutter with
     the footer CTA (R42: 32px read as a different page). */
  .welcome-scaffold--flush-mobile {
    padding: 24px 0 16px;
  }
}
</style>
