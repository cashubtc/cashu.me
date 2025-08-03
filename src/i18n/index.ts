const messageModules = import.meta.glob<{ default: any }>("./*/index.ts");

export async function loadMessages(locale: string) {
  const loader = messageModules[`./${locale}/index.ts`];
  if (!loader) {
    throw new Error(`Locale messages not found: ${locale}`);
  }
  return (await loader()).default;
}
