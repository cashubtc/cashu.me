// The app's languages, each named in its own script: the one list behind the onboarding
// language sheet, Settings → Language and the settings menu's current-language value.
export const LANGUAGE_OPTIONS: { label: string; value: string }[] = [
  { label: "English", value: "en-US" },
  { label: "Español", value: "es-ES" },
  { label: "Italiano", value: "it-IT" },
  { label: "Deutsch", value: "de-DE" },
  { label: "Français", value: "fr-FR" },
  { label: "Čeština", value: "cs-CZ" },
  { label: "Português (Brasil)", value: "pt-BR" },
  { label: "Svenska", value: "sv-SE" },
  { label: "Ελληνικά", value: "el-GR" },
  { label: "Türkçe", value: "tr-TR" },
  { label: "ไทย", value: "th-TH" },
  { label: "العربية", value: "ar-SA" },
  { label: "简体中文", value: "zh-CN" },
  { label: "日本語", value: "ja-JP" },
];

/** The language's own name for a locale, falling back to English. */
export function languageLabel(locale: string): string {
  return (
    LANGUAGE_OPTIONS.find((option) => option.value === locale)?.label ??
    "English"
  );
}
