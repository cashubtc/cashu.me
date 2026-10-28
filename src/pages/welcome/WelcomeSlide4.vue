<template>
  <SettingsPageShell
    :title="$t('WelcomeSlide4.title')"
    :caption="$t('WelcomeSlide4.actions.more.label')"
  >
    <p
      v-if="!$i18n.locale.startsWith('en')"
      class="terms-english-only text-caption"
    >
      {{ $t("WelcomeSlide4.english_only") }}
    </p>
    <TermsOfServiceText class="terms-body" />
    <div class="settings-card q-mt-md">
      <q-item tag="label" clickable class="terms-accept">
        <q-item-section side>
          <q-checkbox v-model="welcomeStore.termsAccepted" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{
            $t("WelcomeSlide4.inputs.checkbox.label")
          }}</q-item-label>
        </q-item-section>
      </q-item>
    </div>
  </SettingsPageShell>
</template>

<script lang="ts">
import { useWelcomeStore } from "src/stores/welcome";
import SettingsPageShell from "src/pages/settings/SettingsPageShell.vue";
import TermsOfServiceText from "src/components/TermsOfServiceText.vue";

export default {
  name: "WelcomeSlide4",
  components: { SettingsPageShell, TermsOfServiceText },
  setup() {
    const welcomeStore = useWelcomeStore();

    const acceptTerms = () => {
      welcomeStore.acceptTerms();
      welcomeStore.closeWelcome();
    };

    return {
      welcomeStore,
      acceptTerms,
    };
  },
};
</script>

<style scoped>
.terms-english-only {
  color: var(--app-text-muted);
  margin: 0 0 12px;
}

/* Long-form text reads on the page at the content gutter, not boxed in a card; only the
   acceptance row below is a card. */
.terms-body {
  padding: 4px 0 0;
}

.terms-accept {
  min-height: 56px;
}
</style>
