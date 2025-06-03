export async function loadMessages(locale: string) {
  return (await import(`./${locale}`)).default
}
