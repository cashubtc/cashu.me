// Surface style variations (src/css/ui-variants.scss). Pick one at /ui, or on any page with
// ?ui=<id>; the choice is kept on this device until it is set back to "current".

export const UI_VARIANTS = [
  { id: "current", label: "Tonal (default)" },
  { id: "outlined", label: "Outlined (before)" },
  { id: "soft", label: "Soft hairline" },
  { id: "filled", label: "Filled" },
  { id: "hairline", label: "Fill + hairline" },
  { id: "elevated", label: "Elevated" },
  { id: "tonal", label: "Tonal, no edges" },
  { id: "shadcn", label: "shadcn outline" },
  { id: "shadcn-card", label: "shadcn card" },
  { id: "muted", label: "Muted fills" },
  { id: "tonal-ring", label: "Tonal, ring selection" },
  { id: "underline", label: "Underlined fields" },
  { id: "separated", label: "Separated lists" },
  { id: "rounded", label: "Soft rounded" },
] as const;

export type UiVariantId = (typeof UI_VARIANTS)[number]["id"];

const STORAGE_KEY = "cashu.ui.variant";

export function isUiVariant(id: unknown): id is UiVariantId {
  return UI_VARIANTS.some((v) => v.id === id);
}

export function getUiVariant(): UiVariantId {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isUiVariant(stored) ? stored : "current";
}

export function setUiVariant(id: UiVariantId): void {
  if (id === "current") {
    localStorage.removeItem(STORAGE_KEY);
    delete document.documentElement.dataset.uiVariant;
  } else {
    localStorage.setItem(STORAGE_KEY, id);
    document.documentElement.dataset.uiVariant = id;
  }
}

// At startup: a ?ui= parameter wins and is remembered, otherwise the stored choice applies.
export function applyUiVariant(): void {
  if (typeof window === "undefined") return;
  const param = new URLSearchParams(window.location.search).get("ui");
  if (isUiVariant(param)) setUiVariant(param);
  else setUiVariant(getUiVariant());
}
