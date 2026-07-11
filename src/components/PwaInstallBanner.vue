<template>
  <transition
    appear
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
  >
    <div
      v-if="showBanner"
      class="pwa-install-banner"
      :class="
        $q.dark.isActive
          ? 'pwa-install-banner--dark'
          : 'pwa-install-banner--light'
      "
    >
      <div class="pwa-install-banner__icon">
        <HomeIcon :size="18" />
      </div>
      <div class="pwa-install-banner__body">
        <div class="pwa-install-banner__title">
          {{ $t("PwaInstallBanner.title") }}
        </div>
        <div class="pwa-install-banner__description">
          {{ description }}
        </div>
        <div class="pwa-install-banner__actions">
          <q-btn
            v-if="canPromptInstall"
            flat
            dense
            no-caps
            color="primary"
            class="pwa-install-banner__action"
            :label="$t('WalletPage.install.text')"
            :loading="isInstalling"
            @click="onInstall"
          />
          <q-btn
            flat
            dense
            no-caps
            :color="$q.dark.isActive ? 'grey-5' : 'grey-7'"
            class="pwa-install-banner__action"
            :label="$t('global.actions.dismiss.label')"
            @click="dismissBanner"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { usePwaStore } from "src/stores/pwa";
import { Home as HomeIcon } from "lucide-vue-next";

export default defineComponent({
  name: "PwaInstallBanner",
  components: {
    HomeIcon,
  },
  computed: {
    ...mapState(usePwaStore, [
      "showBanner",
      "canPromptInstall",
      "isInstalling",
      "isIos",
    ]),
    description(): string {
      if (this.isIos) {
        return this.$t("PwaInstallBanner.description.ios");
      }
      if (this.canPromptInstall) {
        return this.$t("PwaInstallBanner.description.android_prompt");
      }
      return this.$t("PwaInstallBanner.description.android");
    },
  },
  methods: {
    ...mapActions(usePwaStore, ["dismissBanner", "promptInstall"]),
    async onInstall() {
      await this.promptInstall();
    },
  },
});
</script>

<style scoped>
.pwa-install-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
  border-radius: 14px;
  padding: 14px 16px 10px;
}

.pwa-install-banner--dark {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.pwa-install-banner--light {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.pwa-install-banner__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--q-primary);
  background: rgba(25, 118, 210, 0.12);
}

.pwa-install-banner__body {
  min-width: 0;
  flex: 1;
}

.pwa-install-banner__title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
}

.pwa-install-banner--dark .pwa-install-banner__title {
  color: rgba(255, 255, 255, 0.92);
}

.pwa-install-banner--light .pwa-install-banner__title {
  color: rgba(0, 0, 0, 0.87);
}

.pwa-install-banner__description {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.4;
}

.pwa-install-banner--dark .pwa-install-banner__description {
  color: rgba(255, 255, 255, 0.55);
}

.pwa-install-banner--light .pwa-install-banner__description {
  color: rgba(0, 0, 0, 0.55);
}

.pwa-install-banner__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: 4px;
  margin-left: -8px;
}

.pwa-install-banner__action {
  font-weight: 600;
  min-height: 36px;
}
</style>
