/**
 * @name check-i18n
 * @description This script checks for missing and extra translation keys in the i18n files.
 *
 * @param {string} [lang] - Optional language to check. If not provided, all languages will be checked.
 *
 * @example
 * # Check all languages
 * node scripts/check-i18n.mjs
 *
 * @example
 * # Check only Spanish
 * node scripts/check-i18n.mjs es
 *
 * @output
 * The script outputs a list of missing and extra keys for each language.
 * For missing keys, the output includes the file path of the English file, the line number where the key is defined, and the missing key.
 * For extra keys, the output includes the file path of the language file, the line number where the key is defined, and the extra key.
 *
 * Example output for a missing key:
 * Missing keys in es:
 *   - /Users/cc/git/cashu-me/src/i18n/en-US/index.ts:10: my_key
 *
 * Example output for an extra key:
 * Extra keys in es:
 *  - /Users/cc/git/cashu-me/src/i18n/es/index.ts:12: my_extra_key
 */
import fs from 'fs'
import path from 'path'

const i18nDir = path.join('src', 'i18n')
const languages = fs.readdirSync(i18nDir).filter(file => {
  const filePath = path.join(i18nDir, file)
  return fs.statSync(filePath).isDirectory()
})

const englishFile = path.join(i18nDir, 'en-US', 'index.ts')

function getKeysWithLines(file) {
  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split('\n')
  const keys = new Map()
  // This regex is a bit simplistic and might not cover all edge cases,
  // but it should work for the current structure of the i18n files.
  const regex = /(\w+):/g
  for (let i = 0; i < lines.length; i++) {
    const match = regex.exec(lines[i])
    if (match) {
      keys.set(match[1], i + 1)
    }
  }
  return keys
}

const englishKeys = getKeysWithLines(englishFile)

const targetLang = process.argv[2]

for (const lang of languages) {
  if (targetLang && lang !== targetLang) {
    continue
  }
  if (lang === 'en-US') {
    continue
  }

  const langFile = path.join(i18nDir, lang, 'index.ts')
  if (!fs.existsSync(langFile)) {
    console.log(`Missing translation file for ${lang}`)
    continue
  }

  const langKeys = getKeysWithLines(langFile)
  const missingKeys = []
  const extraKeys = []

  for (const [key, line] of englishKeys.entries()) {
    if (!langKeys.has(key)) {
      missingKeys.push({ key, line })
    }
  }

  for (const [key, line] of langKeys.entries()) {
    if (!englishKeys.has(key)) {
      extraKeys.push({ key, line })
    }
  }

  let upToDate = true
  if (missingKeys.length > 0) {
    upToDate = false
    console.log(`Missing keys in ${lang}:`)
    missingKeys.forEach(({ key, line }) =>
      console.log(`  - ${path.resolve(englishFile)}:${line}: ${key}`)
    )
  }

  if (extraKeys.length > 0) {
    upToDate = false
    console.log(`Extra keys in ${lang}:`)
    extraKeys.forEach(({ key, line }) =>
      console.log(`  - ${path.resolve(langFile)}:${line}: ${key}`)
    )
  }

  if (upToDate) {
    console.log(`${lang} is up to date.`) 
  }
}