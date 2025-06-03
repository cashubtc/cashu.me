import { Notify, copyToClipboard, LocalStorage, Dark, QNotifyCreateOptions } from 'quasar'
import { Clipboard } from '@capacitor/clipboard'
import { useUiStore } from 'stores/ui'

function changeColor(newValue: string) {
  document.body.setAttribute('data-theme', newValue)
  LocalStorage.set('cashu.theme', newValue)
}

function changeLanguage(lang: string) {
  LocalStorage.set('cashu.language', lang)
}

function toggleDarkMode() {
  Dark.toggle()
  LocalStorage.set('cashu.darkMode', Dark.isActive)
}

function copyText(
  text: string,
  message?: string,
  position: QNotifyCreateOptions['position'] = 'bottom'
) {
  copyToClipboard(text).then(() => {
    Notify.create({
      message: message || 'Copied to clipboard!',
      position
    })
  })
}

async function pasteFromClipboard(): Promise<string> {
  let text = ''
  if (window?.Capacitor) {
    const { value } = await Clipboard.read()
    text = value
  } else if (navigator.clipboard?.readText) {
    text = await navigator.clipboard.readText()
  }
  return text
}

function formatSat(value: number) {
  value = parseInt(String(value))
  return new Intl.NumberFormat(navigator.language).format(value) + ' sat'
}

function fromMsat(value: number) {
  value = parseInt(String(value))
  return new Intl.NumberFormat(navigator.language).format(value) + ' msat'
}

function formatCurrency(value: number, currency = 'sat', showBalance = false) {
  const uiStore = useUiStore()
  if (uiStore.hideBalance && !showBalance) {
    return '****'
  }
  if (currency === 'sat') return formatSat(value)
  if (currency === 'msat') return fromMsat(value)
  if (currency === 'usd' || currency === 'eur') value = value / 100
  return new Intl.NumberFormat(navigator.language, { style: 'currency', currency }).format(value)
}

export {
  changeColor,
  changeLanguage,
  toggleDarkMode,
  copyText,
  pasteFromClipboard,
  formatCurrency,
  formatSat,
  fromMsat
}

export * from './notify'
