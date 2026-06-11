import { useAuthStore } from "src/stores/auth";

export default async ({ app, router }) => {
  const authStore = useAuthStore();

  // Initialize authentication system
  await authStore.initialize();

  // Add router navigation guard to check authentication
  router.beforeEach((to, from, next) => {
    // If auth is enabled and user is not authenticated, show prompt
    if (authStore.needsAuthentication) {
      authStore.showAuthPrompt = true;
      // Allow navigation to continue - the AuthPrompt will overlay the app
    }
    next();
  });
};
