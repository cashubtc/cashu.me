
import fs from 'fs'
import path from 'path'

const i18nDir = path.join('src', 'i18n')
const languages = fs.readdirSync(i18nDir).filter(file => {
  const filePath = path.join(i18nDir, file)
  return fs.statSync(filePath).isDirectory()
})

const englishFile = path.join(i18nDir, 'en-US', 'index.ts')

function getKeys(file) {
  const content = fs.readFileSync(file, 'utf8')
  // This regex is a bit simplistic and might not cover all edge cases,
  // but it should work for the current structure of the i18n files.
  const keys = content.match(/(\w+):/g)?.map(key => key.slice(0, -1))
  return new Set(keys)
}

const englishKeys = getKeys(englishFile)

for (const lang of languages) {
  if (lang === 'en-US') {
    continue
  }

  const langFile = path.join(i18nDir, lang, 'index.ts')
  if (!fs.existsSync(langFile)) {
    console.log(`Missing translation file for ${lang}`)
    continue
  }

  const langKeys = getKeys(langFile)
  const missingKeys = []

  for (const key of englishKeys) {
    if (!langKeys.has(key)) {
      missingKeys.push(key)
    }
  }

  if (missingKeys.length > 0) {
    console.log(`Missing keys in ${lang}:`)
    missingKeys.forEach(key => console.log(`  - ${key}`))
  } else {
    console.log(`${lang} is up to date.`)
  }
}
