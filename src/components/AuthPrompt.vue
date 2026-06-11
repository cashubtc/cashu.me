<template>
  <q-dialog
    v-model="showAuthPrompt"
    persistent
    maximized
    transition-show="fade"
    transition-hide="fade"
    @show="onDialogShow"
  >
    <q-card class="auth-card bg-dark text-white">
      <q-card-section class="auth-content">
        <!-- Lock Icon -->
        <div class="auth-icon-container">
          <q-icon
            :name="authStore.hasBiometrics ? 'fingerprint' : 'lock'"
            size="80px"
            color="primary"
          />
        </div>

        <!-- Title -->
        <h5 class="auth-title">{{ title }}</h5>

        <!-- Description -->
        <p class="auth-description">
          {{ description }}
        </p>

        <!-- Biometric Type Info -->
        <div v-if="authStore.hasBiometrics" class="auth-type-info">
          <q-chip color="primary" text-color="white" icon="security">
            {{ authStore.biometricTypeLabel }} Available
          </q-chip>
        </div>
        <div v-else class="auth-type-info">
          <q-chip color="primary" text-color="white" icon="pin">
            Device PIN/Password
          </q-chip>
        </div>

        <!-- Authenticate Button -->
        <q-btn
          unelevated
          rounded
          size="lg"
          color="primary"
          :loading="authStore.isAuthenticating"
          :disable="authStore.isAuthenticating"
          @click="handleAuthenticate"
          class="auth-button"
        >
          <q-icon
            :name="authStore.hasBiometrics ? 'fingerprint' : 'lock_open'"
            left
          />
          {{ authStore.hasBiometrics ? "Authenticate" : "Enter PIN/Password" }}
        </q-btn>

        <!-- Cancel/Disable Option (only if not required) -->
        <div
          v-if="!authStore.requireAuthOnStartup || canDisable"
          class="auth-footer"
        >
          <q-btn
            flat
            dense
            color="grey"
            @click="handleCancel"
            :disable="authStore.isAuthenticating"
          >
            {{ canDisable ? "Disable Authentication" : "Cancel" }}
          </q-btn>
        </div>

        <!-- Error Display -->
        <div v-if="errorMessage" class="auth-error">
          <q-banner dense rounded class="bg-red text-white">
            <template v-slot:avatar>
              <q-icon name="error" color="white" />
            </template>
            {{ errorMessage }}
          </q-banner>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useAuthStore } from "src/stores/auth";
import { mapState, mapWritableState } from "pinia";

export default defineComponent({
  name: "AuthPrompt",
  props: {
    title: {
      type: String,
      default: "Authentication Required",
    },
    description: {
      type: String,
      default: "Please authenticate to access your wallet",
    },
    canDisable: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const authStore = useAuthStore();
    const errorMessage = ref("");

    const handleAuthenticate = async () => {
      errorMessage.value = "";

      const success = await authStore.promptAuthentication();

      if (!success && !authStore.isAuthenticated) {
        errorMessage.value = "Authentication failed. Please try again.";
      }
    };

    const handleCancel = () => {
      if (props.canDisable) {
        authStore.disableAuth();
      }
      authStore.showAuthPrompt = false;
    };

    // Auto-trigger authentication when dialog opens
    const onDialogShow = () => {
      errorMessage.value = "";
      // Small delay to ensure dialog is fully rendered
      setTimeout(() => {
        handleAuthenticate();
      }, 300);
    };

    return {
      authStore,
      errorMessage,
      handleAuthenticate,
      handleCancel,
      onDialogShow,
    };
  },
  computed: {
    ...mapWritableState(useAuthStore, ["showAuthPrompt"]),
  },
});
</script>

<style scoped>
.auth-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.auth-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

.auth-icon-container {
  margin-bottom: 2rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.auth-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.auth-type-info {
  margin-bottom: 2rem;
}

.auth-button {
  width: 100%;
  max-width: 280px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.auth-footer {
  margin-top: 2rem;
}

.auth-error {
  margin-top: 1.5rem;
  width: 100%;
}
</style>
