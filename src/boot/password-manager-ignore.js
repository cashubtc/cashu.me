import { boot } from "quasar/wrappers";

// The app has no logins, but password-manager extensions (1Password, LastPass, Bitwarden,
// Dashlane) still draw their inline badge on every amount, URL and invoice field. Each one
// honours its own opt-out attribute, so mark every text field as it appears. Password fields
// are left alone, so a user can still save a key there on purpose.
const IGNORE_ATTRIBUTES = {
  "data-1p-ignore": "",
  "data-lpignore": "true",
  "data-bwignore": "true",
  "data-form-type": "other",
};

function markField(el) {
  if (el.type === "password") return;
  for (const [name, value] of Object.entries(IGNORE_ATTRIBUTES)) {
    if (!el.hasAttribute(name)) el.setAttribute(name, value);
  }
}

function markWithin(root) {
  if (root.matches?.("input, textarea")) markField(root);
  root.querySelectorAll?.("input, textarea").forEach(markField);
}

export default boot(() => {
  if (typeof document === "undefined") return;
  markWithin(document.body);
  new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) markWithin(node);
      });
    }
  }).observe(document.body, { childList: true, subtree: true });
});
