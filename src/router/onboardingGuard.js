// Pages that need a wallet. Until onboarding is finished they send the
// visitor to the welcome page instead of mounting against an empty seed.
const needsWallet = (path) =>
  path === "/" || path === "/settings" || path.startsWith("/settings/");

/**
 * Returns the location to redirect to, or undefined to let the navigation
 * through. Mirrors the rule WalletPage applied after mounting: the welcome
 * page is due while it is still flagged, or while the terms are not accepted.
 */
export function onboardingRedirect(to, welcome) {
  if (!needsWallet(to.path)) return undefined;
  if (!welcome.termsAccepted) welcome.showWelcome = true;
  if (!welcome.showWelcome) return undefined;
  // keep the query and hash so a shared link survives onboarding
  return { path: "/welcome", query: to.query, hash: to.hash };
}
