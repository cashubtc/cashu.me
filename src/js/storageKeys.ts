export const STORAGE_KEYS = {
  // UI related
  UI_HIDE_BALANCE: 'cashu.ui.hideBalance',
  UI_TAB: 'cashu.ui.tab',
  UI_EXPAND_HISTORY: 'cashu.ui.expandHistory',
  UI_SHOW_DEBUG_CONSOLE: 'cashu.ui.showDebugConsole',
  UI_LAST_BALANCE_CACHED: 'cashu.ui.lastBalanceCached',
  UI_SHOW_NFC_BUTTON_IN_DRAWER: 'cashu.ui.showNfcButtonInDrawer',
  // NWC
  NWC_ENABLED: 'cashu.nwc.enabled',
  NWC_CONNECTIONS: 'cashu.nwc.connections',
  NWC_SEEN_COMMANDS_UNTIL: 'cashu.nwc.seenCommandsUntil',
  NWC_RELAYS: 'cashu.nwc.relays',
  // Buckets
  BUCKETS: 'cashu.buckets',
  BUCKET_RULES: 'cashu.bucketRules',
  // Creator hub
  CREATOR_HUB_LOGGED_IN_NPUB: 'creatorHub.loggedInNpub',
  CREATOR_HUB_TIERS: 'creatorHub.tiers',
  // Storage utilities
  LAST_LOCAL_STORAGE_CLEANUP: 'cashu.lastLocalStorageCleanUp',
  DEXIE_PROOFS_BACKUP: 'cashu.dexie.db.proofs',
  STORAGE_TEST: 'cashu.test',
  SPENT_PROOFS: 'cashu.spentProofs',
  // DM chats
  DM_CHATS: 'cashu.dmChats',
  DM_CHATS_UNREAD: 'cashu.dmChats.unread',
  // Dexie
  DEXIE_MIGRATED: 'cashu.dexie.migrated',
  PROOFS: 'cashu.proofs',
  // NPC/Npub.cash
  NPC_ENABLED: 'cashu.npc.enabled',
  NPC_AUTOMATIC_CLAIM: 'cashu.npc.automaticClaim',
  NPC_ADDRESS: 'cashu.npc.address',
  NPC_DOMAIN: 'cashu.npc.domain',
  NPC_BASE_URL: 'cashu.npc.baseURL',
  // Nostr/NDK
  NDK_PUBKEY: 'cashu.ndk.pubkey',
  NDK_SIGNER_TYPE: 'cashu.ndk.signerType',
  NDK_NIP46_TOKEN: 'cashu.ndk.nip46Token',
  NDK_PRIVATEKEY_SIGNER_PRIVATEKEY: 'cashu.ndk.privateKeySignerPrivateKey',
  NDK_SEED_SIGNER_PRIVATEKEY: 'cashu.ndk.seedSignerPrivateKey',
  NDK_SEED_SIGNER_PUBLICKEY: 'cashu.ndk.seedSignerPublicKey',
  NDK_MINT_RECOMMENDATIONS: 'cashu.ndk.mintRecommendations',
  NDK_LAST_EVENT_TIMESTAMP: 'cashu.ndk.lastEventTimestamp',
  NDK_NIP17_EVENT_IDS_WE_HAVE_SEEN: 'cashu.ndk.nip17EventIdsWeHaveSeen',
  NDK_PROFILES: 'cashu.ndk.profiles',
  // Mints
  ACTIVE_UNIT: 'cashu.activeUnit',
  ACTIVE_MINT_URL: 'cashu.activeMintUrl',
  MINTS: 'cashu.mints',
  // Settings
  SETTINGS_GET_BITCOIN_PRICE: 'cashu.settings.getBitcoinPrice',
  SETTINGS_CHECK_SENT_TOKENS: 'cashu.settings.checkSentTokens',
  SETTINGS_CHECK_INCOMING_INVOICES: 'cashu.settings.checkIncomingInvoices',
  SETTINGS_PERIODICALLY_CHECK_INCOMING_INVOICES:
    'cashu.settings.periodicallyCheckIncomingInvoices',
  SETTINGS_CHECK_INVOICES_ON_STARTUP: 'cashu.settings.checkInvoicesOnStartup',
  SETTINGS_USE_WEBSOCKETS: 'cashu.settings.useWebsockets',
  SETTINGS_DEFAULT_NOSTR_RELAYS: 'cashu.settings.defaultNostrRelays',
  SETTINGS_INCLUDE_FEES_IN_SEND_AMOUNT: 'cashu.settings.includeFeesInSendAmount',
  SETTINGS_NFC_ENCODING: 'cashu.settings.nfcEncoding',
  SETTINGS_USE_NUMERIC_KEYBOARD: 'cashu.settings.useNumericKeyboard',
  SETTINGS_ENABLE_RECEIVE_SWAPS: 'cashu.settings.enableReceiveSwaps',
  SETTINGS_AUTO_PASTE_ECASH_RECEIVE: 'cashu.settings.autoPasteEcashReceive',
  SETTINGS_AUDITOR_ENABLED: 'cashu.settings.auditorEnabled',
  SETTINGS_AUDITOR_URL: 'cashu.settings.auditorUrl',
  SETTINGS_AUDITOR_API_URL: 'cashu.settings.auditorApiUrl',
  // Migrations
  MIGRATIONS_VERSION: 'cashu.migrations.version',
  // Locked tokens
  LOCKED_TOKENS: 'cashu.lockedTokens',
  // Wallet
  MNEMONIC: 'cashu.mnemonic',
  INVOICE_HISTORY: 'cashu.invoiceHistory',
  KEYSET_COUNTERS: 'cashu.keysetCounters',
  OLD_MNEMONIC_COUNTERS: 'cashu.oldMnemonicCounters',
  // NPC / Npub.cash ??? not exactly: Already above
  // P2PK
  P2PK_KEYS: 'cashu.P2PKKeys',
  P2PK_SHOW_BUTTON_IN_DRAWER: 'cashu.p2pk.showP2PkButtonInDrawer',
  // Welcome
  WELCOME_SHOW_WELCOME: 'cashu.welcome.showWelcome',
  WELCOME_CURRENT_SLIDE: 'cashu.welcome.currentSlide',
  WELCOME_SEED_PHRASE_VALIDATED: 'cashu.welcome.seedPhraseValidated',
  WELCOME_TERMS_ACCEPTED: 'cashu.welcome.termsAccepted',
  // Donation presets
  DONATION_PRESETS: 'cashu.donationPresets',
  // Price
  PRICE_BITCOIN_PRICE: 'cashu.price.bitcoinPrice',
  PRICE_BITCOIN_PRICE_LAST_UPDATED: 'cashu.price.bitcoinPriceLastUpdated',
  // Tokens
  HISTORY_TOKENS: 'cashu.historyTokens',
  // Invoice worker
  WORKER_INVOICE_QUOTES_QUEUE: 'cashu.worker.invoices.quotesQueue',
  WORKER_LAST_PENDING_INVOICE_CHECK: 'cashu.worker.invoices.lastPendingInvoiceCheck',
  // Restore
  RESTORE_SHOW_RESTORE_DIALOG: 'cashu.restore.showRestoreDialog',
  RESTORE_MNEMONIC_TO_RESTORE: 'cashu.restore.mnemonicToRestore',
  // Payment request
  PR_ENABLE: 'cashu.pr.enable',
  PR_RECEIVE: 'cashu.pr.receive',
};
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
