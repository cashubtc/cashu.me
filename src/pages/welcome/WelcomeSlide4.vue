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
    <TermsOfServiceText class="settings-card terms-body" />
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

.terms-body {
  padding: 16px;
  text-align: left; /* the English text keeps its own alignment inside an rtl page */
}

.terms-body :deep(p) {
  font-size: 13px;
  line-height: 1.5;
  color: var(--app-text-muted);
  margin: 0 0 12px;
}

.terms-body :deep(p:last-child) {
  margin-bottom: 0;
}

.terms-body :deep(strong) {
  color: var(--app-text);
}

.terms-accept {
  min-height: 56px;
}
</style>
