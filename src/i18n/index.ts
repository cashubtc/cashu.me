const messageModules = import.meta.glob<{ default: any }>("./*/index.ts");
const jsonModules = import.meta.glob<{ default: any }>("./*.json");

export async function loadMessages(locale: string) {
  const jsonLoader = jsonModules[`./${locale}.json`];
  if (jsonLoader) {
    return (await jsonLoader()).default;
  }

  const loader = messageModules[`./${locale}/index.ts`];
  if (!loader) {
    throw new Error(`Locale messages not found: ${locale}`);
  }
  return (await loader()).default;
}
