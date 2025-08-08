import { default as defaultLang } from "quasar/lang/en-US";

export const messages = {
  copied_to_clipboard: "Copied to clipboard!",
  copy_failed: "Copy failed",
  global: {
    copy_to_clipboard: {
      success: "Copied to clipboard!",
    },
    actions: {
      add_mint: {
        label: "Add mint",
      },
      cancel: {
        label: "Cancel",
      },
      copy: {
        label: "Copy",
      },
      close: {
        label: "Close",
      },
      ok: {
        label: "OK",
      },
      enter: {
        label: "Enter",
      },
      lock: {
        label: "Lock",
      },
      paste: {
        label: "Paste",
      },
      receive: {
        label: "Receive",
      },
      scan: {
        label: "Scan",
      },
      send: {
        label: "Send",
      },
      save: {
        label: "Save",
      },
      swap: {
        label: "Swap",
      },
      search: {
        label: "Search",
      },
      update: {
        label: "Update",
      },
    },
    inputs: {
      mint_url: {
        label: "Mint URL",
      },
    },
  },
  wallet: {
    notifications: {
      balance_too_low: "Balance is too low",
      received: "Received {amount}",
      fee: " (fee: {fee})",
      could_not_request_mint: "Could not request mint",
      invoice_still_pending: "Invoice still pending",
      paid_lightning: "Paid {amount} via Lightning",
      payment_pending_refresh: "Payment pending. Refresh invoice manually.",
      sent: "Sent {amount}",
      token_still_pending: "Token still pending",
      received_lightning: "Received {amount} via Lightning",
      lightning_payment_failed: "Lightning payment failed",
      failed_to_decode_invoice: "Failed to decode invoice",
      invalid_lnurl: "Invalid LNURL",
      lnurl_error: "LNURL Error",
      no_amount: "No amount",
      no_lnurl_data: "No LNURL data",
      no_price_data: "No price data.",
      please_try_again: "Please try again.",
      lock_not_supported: "Mint does not support locking (NUT-10/11)",
      nostr_dm_sent: "Nostr DM sent",
      nostr_dm_failed: "Failed to send Nostr DM",
    },
    mint: {
      notifications: {
        already_added: "Mint already added",
        added: "Mint added",
        not_found: "Mint not found",
        activation_failed: "Mint activation failed",
        no_active_mint: "No active mint",
        unit_activation_failed: "Unit activation failed",
        unit_not_supported: "Unit not supported by mint",
        activated: "Mint activated",
        could_not_connect: "Could not connect to mint",
        could_not_get_info: "Could not get mint info",
        could_not_get_keys: "Could not get mint keys",
        could_not_get_keysets: "Could not get mint keysets",
        removed: "Mint removed",
        error: "Mint error",
      },
    },
    signer_connected: "Nostr signer connected",
  },
  MainHeader: {
    menu: {
      wallet: { title: "@:FullscreenHeader.actions.back.label" },
      nostrMessenger: { title: "@:AboutPage.siteOverview.nostrMessengerTitle" },
      restore: { title: "@:AboutPage.siteOverview.restoreTitle" },
      alreadyRunning: { title: "@:AboutPage.siteOverview.alreadyRunningTitle" },
      welcome: { title: "@:AboutPage.siteOverview.welcomeTitle" },
      nostrLogin: { title: "@:AboutPage.siteOverview.nostrLoginTitle" },
      settings: {
        title: "Settings",
        settings: {
          title: "Settings",
          caption: "Wallet configuration",
        },
      },
      findCreators: {
        title: "Find Creators",
        findCreators: {
          title: "Find Creators",
          caption: "Discover creators",
        },
      },
      creatorHub: {
        title: "Creator Hub",
        
      },
      myProfile: {
        title: "My Profile",
        myProfile: { title: "My Profile", caption: "View your profile" },
      },
      buckets: {
        title: "Buckets",
        buckets: {
          title: "Buckets",
          caption: "Manage buckets",
        },
      },
      subscriptions: {
        title: "Subscriptions",
        subscriptions: {
          title: "Subscriptions",
          caption: "Overview of your subscriptions",
        },
      },
      terms: {
        title: "Terms",
        terms: {
          title: "Terms",
          caption: "Terms of Service",
        },
      },
      about: {
        title: "About",
        about: { title: "About", caption: "About this app" },
      },
      links: {
        title: "Links",
        fundstrCreator: {
          title: "Fundstr's Creator",
          caption: "primal.net/KalonAxiarch",
        },
        cashuSpace: {
          title: "Cashu.space",
          caption: "cashu.space",
        },
        github: {
          title: "Github",
          caption: "github.com/cashubtc",
        },
        telegram: {
          title: "Telegram",
          caption: "t.me/CashuMe",
        },
        twitter: {
          title: "Twitter",
          caption: "{'@'}CashuBTC",
        },
        donate: {
          title: "Donate",
          caption: "Support Cashu",
        },
      },
    },
    offline: {
      warning: {
        text: "Offline",
      },
    },
    reload: {
      warning: {
        text: "Reload in { countdown }",
      },
      tooltip:
        "Reload the page. A 3 second countdown starts; click again to cancel.",
    },
    staging: {
      warning: {
        text: "Staging – don't use with real funds!",
      },
    },
  },
  FullscreenHeader: {
    actions: {
      back: {
        label: "Wallet",
      },
    },
  },
  Settings: {
    language: {
      title: "Language",
      description: "Please choose your preferred language from the list below.",
    },
    sections: {
      backup_restore: "BACKUP & RESTORE",
      lightning_address: "LIGHTNING ADDRESS",
      nostr_keys: "NOSTR KEYS",
      payment_requests: "PAYMENT REQUESTS",
      nostr_wallet_connect: "NOSTR WALLET CONNECT",
      nostr_relays: "NOSTR RELAYS",
      hardware_features: "HARDWARE FEATURES",
      p2pk_features: "P2PK FEATURES",
      privacy: "PRIVACY",
      experimental: "EXPERIMENTAL",
      appearance: "APPEARANCE",
    },
    backup_restore: {
      backup_seed: {
        title: "Backup seed phrase",
        description:
          "Your seed phrase can restore your wallet. Keep it safe and private.",
        seed_phrase_label: "Seed phrase",
      },
      restore_ecash: {
        title: "Restore ecash",
        description:
          "The restore wizard lets you recover lost ecash from a mnemonic seed phrase. The seed phrase of your current wallet will remain unaffected, the wizard will only allow you to restore ecash from another seed phrase.",
        button: "Restore",
      },
    },
    lightning_address: {
      title: "Lightning address",
      description: "Receive payments to your Lightning address.",
      enable: {
        toggle: "Enable",
        description: "Lightning address with npub.cash",
      },
      address: {
        copy_tooltip: "Copy Lightning address",
      },
      automatic_claim: {
        toggle: "Claim automatically",
        description: "Receive incoming payments automatically.",
      },
    },
    nostr_keys: {
      title: "Your nostr keys",
      description: "Set the nostr keys for your Lightning address.",
      wallet_seed: {
        title: "Wallet seed phrase",
        description: "Generate nostr key pair from wallet seed",
        copy_nsec: "Copy nsec",
      },
      nsec_bunker: {
        title: "Nsec Bunker",
        description: "Use a NIP-46 bunker",
        delete_tooltip: "Delete connection",
      },
      use_nsec: {
        title: "Use your nsec",
        description: "This method is dangerous and not recommended",
        delete_tooltip: "Delete nsec",
      },
      signing_extension: {
        title: "Signing extension",
        description: "Use a NIP-07 signing extension",
        not_found: "No NIP-07 signing extension found",
      },
    },
    payment_requests: {
      title: "Payment requests",
      description:
        "Payment requests allow you to receive payments via nostr. If you enable this, your wallet will subscribe to your nostr relays.",
      enable_toggle: "Enable Payment Requests",
      claim_automatically: {
        toggle: "Claim automatically",
        description: "Receive incoming payments automatically.",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Wallet Connect (NWC)",
      description: "Use NWC to control your wallet from any other application.",
      enable_toggle: "Enable NWC",
      payments_note:
        "You can only use NWC for payments from your Bitcoin balance. Payments will be made from your active mint.",
      connection: {
        copy_tooltip: "Copy connection string",
        qr_tooltip: "Show QR code",
        allowance_label: "Allowance left (sat)",
      },
      relays: {
        expand_label: "Click to edit relays",
        add: {
          title: "Add relay",
          description:
            "Nostr Wallet Connect uses nostr relays to connect your wallet to other applications.",
        },
        list: {
          title: "Relays",
          description: "Your wallet will connect to these relays.",
          copy_tooltip: "Copy relay",
          remove_tooltip: "Remove relay",
        },
      },
    },
    nostr_relays: {
      expand_label: "Click to edit relays",
      add: {
        title: "Add relay",
        description: "Add nostr relay URLs your wallet should connect to.",
      },
      list: {
        title: "Relays",
        description: "Your wallet will connect to these relays.",
        copy_tooltip: "Copy relay",
        remove_tooltip: "Remove relay",
      },
    },
    hardware_features: {
      webnfc: {
        title: "WebNFC",
        description: "Choose the encoding for writing to NFC cards",
        text: {
          title: "Text",
          description: "Store token in plain text",
        },
        weburl: {
          title: "URL",
          description: "Store URL to this wallet with token",
        },
        binary: {
          title: "Raw Binary",
          description:
            "Raw bytes instead of Base64. Makes ~33% shorter tokens.",
        },
        quick_access: {
          toggle: "Quick access to NFC",
          description:
            "Quickly scan NFC cards in the Receive Ecash menu. This option adds an NFC button the Receive Ecash menu.",
        },
      },
    },
    p2pk_features: {
      title: "P2PK",
      description:
        "Generate a key pair to receive P2PK-locked ecash. Warning: This feature is experimental. Only use with small amounts. If you lose your private keys, nobody will be able to unlock the ecash locked to it anymore.",
      generate_button: "Generate key",
      import_button: "Import nsec",
      publish_profile_button: "Publish Nutzap profile",
      quick_access: {
        toggle: "Quick access to lock",
        description:
          "Use this to quickly show your P2PK locking key in the receive ecash menu.",
      },
      keys_expansion: {
        label: "Click to browse {count} keys",
        used_badge: "used",
      },
    },
    privacy: {
      title: "Privacy",
      description: "These settings affect your privacy.",
      check_incoming: {
        toggle: "Check incoming invoice",
        description:
          "If enabled, the wallet will check the latest invoice in the background. This increases the wallet's responsiveness which makes fingerprinting easier. You can manually check unpaid invoices in the Invoices tab.",
      },
      check_startup: {
        toggle: "Check pending invoices on startup",
        description:
          "If enabled, the wallet will check pending invoices from the last 24 hours on startup.",
      },
      check_all: {
        toggle: "Check all invoices",
        description:
          "If enabled, the wallet will periodically check unpaid invoices in the background for up to two weeks. This increases the wallet's online activity which makes fingerprinting easier. You can manually check unpaid invoices in the Invoices tab.",
      },
      check_sent: {
        toggle: "Check sent ecash",
        description:
          "If enabled, the wallet will use periodic background checks to determine if sent tokens have been redeemed. This increases the wallet's online activity which makes fingerprinting easier.",
      },
      websockets: {
        toggle: "Use WebSockets",
        description:
          "If enabled, the wallet will use long-lived WebSocket connections to receive updates on paid invoices and spent tokens from mints. This increases the wallet's responsiveness but also makes fingerprinting easier.",
      },
      bitcoin_price: {
        toggle: "Get exchange rate from Coinbase",
        description:
          "If enabled, the current Bitcoin exchange rate will be fetched from coinbase.com and your converted balance will be displayed.",
      },
    },
    experimental: {
      title: "Experimental",
      description: "These features are experimental.",
      receive_swaps: {
        toggle: "Receive swaps",
        badge: "Beta",
        description:
          "Option to swap received Ecash to your active mint in the Receive Ecash dialog.",
      },
      auto_paste: {
        toggle: "Paste Ecash automatically",
        description:
          "Automatically paste ecash in your clipboard when you press Receive, then Ecash, then Paste. Automatic pasting can cause UI glitches in iOS, turn it off if you experience issues.",
      },
      auto_redeem_locked: {
        toggle: "Redeem locked tokens automatically",
        description:
          "If enabled, the wallet will automatically redeem locked tokens once they become redeemable.",
      },
      auditor: {
        toggle: "Enable auditor",
        badge: "Beta",
        description:
          "If enabled, the wallet will display auditor information in the mint details dialog. The auditor is a third party service that monitors the reliability of mints.",
        url_label: "Auditor URL",
        api_url_label: "Auditor API URL",
      },
    },
    appearance: {
      keyboard: {
        title: "On-screen keyboard",
        description: "Use the numeric keyboard for entering amounts.",
        toggle: "Use numeric keyboard",
        toggle_description:
          "If enabled, the numeric keyboard will be used for entering amounts.",
      },
      theme: {
        title: "Appearance",
        description: "Change how your wallet looks.",
        tooltips: {
          mono: "mono",
          cyber: "cyber",
          freedom: "freedom",
          nostr: "nostr",
          bitcoin: "bitcoin",
          mint: "mint",
          nut: "nut",
          blu: "blu",
          flamingo: "flamingo",
          modern: "modern",
        },
      },
    },
    advanced: {
      title: "Advanced",
      developer: {
        title: "Developer settings",
        description:
          "The following settings are for development and debugging.",
        new_seed: {
          button: "Generate new seed phrase",
          description:
            "This will generate a new seed phrase. You must send your entire balance to yourself in order to be able to restore it with a new seed.",
          confirm_question:
            "Are you sure you want to generate a new seed phrase?",
          cancel: "Cancel",
          confirm: "Confirm",
        },
        remove_spent: {
          button: "Remove spent proofs",
          description:
            "Check if the ecash tokens from your active mints are spent and remove the spent ones from your wallet. Only use this if your wallet is stuck.",
        },
        debug_console: {
          button: "Toggle Debug Console",
          description:
            "Open the Javascript debug terminal. Never paste anything into this terminal that you don't understand. A thief might try to trick you into pasting malicious code here.",
        },
        export_proofs: {
          button: "Export active proofs",
          description:
            "Copy your entire balance from the active mint as a Cashu token into your clipboard. This will only export the tokens from the selected mint and unit. For a full export, select a different mint and unit and export again.",
        },
        keyset_counters: {
          title: "Increment keyset counters",
          description:
            'Click the keyset ID to increment the derivation path counters for the keysets in your wallet. This is useful if you see the "outputs have already been signed" error.',
        },
        unset_reserved: {
          button: "Unset all reserved tokens",
          description:
            'This wallet marks pending outgoing ecash as reserved (and subtracts it from your balance) to prevent double-spend attempts. This button will unset all reserved tokens so they can be used again. If you do this, your wallet might include spent proofs. Press the "Remove spent proofs" button to get rid of them.',
        },
        show_onboarding: {
          button: "Show onboarding",
          description: "Show the onboarding screen again.",
        },
        reset_wallet: {
          button: "Reset wallet data",
          description:
            "Reset your wallet data. Warning: This will delete everything! Make sure you create a backup first.",
          confirm_question: "Are you sure you want to delete your wallet data?",
          cancel: "Cancel",
          confirm: "Delete wallet",
        },
        export_wallet: {
          button: "Export wallet data",
          description:
            "Download a dump of your wallet. You can restore your wallet from this file in the welcome screen of a new wallet. This file will be out of sync if you keep using your wallet after exporting it.",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Join a mint",
    subtitle:
      "You haven't joined any Cashu mint yet. Add a mint URL in the settings or receive ecash from a new mint to get started.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Receive Ecash",
      },
    },
  },
  WalletPage: {
    actions: {
      send: {
        label: "@:global.actions.send.label",
      },
      receive: {
        label: "@:global.actions.receive.label",
      },
      scan: {
        tooltip: "Scan a QR code",
      },
    },
    tabs: {
      history: {
        label: "History",
      },
      invoices: {
        label: "Invoices",
      },
      mints: {
        label: "Mints",
      },
      buckets: {
        label: "Buckets",
      },
    },
    install: {
      text: "Install",
      tooltip: "Install Cashu",
    },
  },
  AlreadyRunning: {
    title: "Nope.",
    text: "Another tab is already running. Close this tab and try again.",
    actions: {
      retry: {
        label: "Retry",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "This page doesn't exist. Try the links below for help:",
    links: {
      docs: "Documentation",
      tips: "Tips & Tricks",
    },
    actions: {
      home: {
        label: "Go back home",
      },
    },
  },
  BalanceView: {
    mintUrl: {
      label: "Mint",
    },
    mintBalance: {
      label: "Balance",
    },
    mintError: {
      label: "Mint error",
    },
    pending: {
      label: "Pending",
      tooltip: "Check all pending tokens",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "Previous",
      },
      next: {
        label: "Next",
      },
      skip: {
        label: "Skip",
      },
    },
  },
  WelcomeSlide1: {
    title: "Welcome to Cashu",
    text: "Cashu.me is a free and open-source Bitcoin wallet that uses ecash to keep your funds secure and private.",
    actions: {
      more: {
        label: "Click to learn more",
      },
    },
    p1: {
      text: "Cashu is a free and open-source ecash protocol for Bitcoin. You can learn more about it at { link }.",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "This wallet is not affiliated with any mint. To use this wallet, you need to connect to one or more Cashu mints that you trust.",
    },
    p3: {
      text: "This wallet stores ecash that only you have access to. If you delete your browser data without a seed phrase backup, you will lose your tokens.",
    },
    p4: {
      text: "This wallet is in beta. We hold no responsibility for people losing access to funds. Use at your own risk! This code is open-source and licensed under the MIT license.",
    },
  },
  WelcomeSlide2: {
    title: "Install PWA",
    instruction: {
      intro: {
        text: "For the best experience, use this wallet with your device's native web browser to install it as a Progressive Web App. Do this right now.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "Tap the menu (top right)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Press { buttonText }",
          buttonText: "@:AndroidPWAPrompt.buttonText",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "Tap share (bottom)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Press { buttonText }",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "Once you installed this app on your device, close this browser window and use the app from your home screen.",
      },
    },
    pwa: {
      success: {
        title: "Success!",
        text: "You are using Cashu as a PWA. Close any other open browser windows and use the app from your home screen.",
      },
    },
  },
  iOSPWAPrompt: {
    text: "Tap { icon } and { buttonText }",
    buttonText: "Add to Home Screen",
  },
  AndroidPWAPrompt: {
    text: "Tap { icon } and { buttonText }",
    buttonText: "Add to Home Screen",
  },
  WelcomeSlide3: {
    title: "Your Seed Phrase",
    text: "Store your seed phrase in a password manager or on paper. Your seed phrase is the only way to recover your funds if you lose access to this device.",
    inputs: {
      seed_phrase: {
        label: "Seed Phrase",
        caption: "You can see your seed phrase in the settings.",
        tooltip: "This phrase restores your wallet. Keep it private",
      },
      checkbox: {
        label: "I have written it down",
      },
    },
  },
  WelcomeSlide4: {
    title: "Terms",
    actions: {
      more: {
        label: "Read Terms of Service",
      },
    },
    inputs: {
      checkbox: {
        label: "I've read and accept these terms and conditions",
      },
    },
  },
  WelcomeSlidePrivacy: {
    title: "Cashu & Privacy",
    text: "Cashu uses blinded tokens so mints can't track your payments.",
  },
  WelcomeSlideMints: {
    title: "Mints",
    text: "Add a mint to start receiving tokens.",
  },
  WelcomeSlideProofs: {
    title: "Proofs",
    text: "Proofs are the tokens you can send and receive.",
  },
  WelcomeSlideBuckets: {
    title: "Buckets",
    text: "Use buckets to organize your tokens.",
  },
  RestoreView: {
    seed_phrase: {
      label: "Restore from Seed Phrase",
      caption:
        "Enter your seed phrase to restore your wallet. Before you restore, make sure you have added all the mints that you have used before.",
      inputs: {
        seed_phrase: {
          label: "Seed phrase",
          caption: "You can see your seed phrase in the settings.",
          tooltip: "Enter the 12-word recovery phrase",
        },
      },
    },
    information: {
      label: "Information",
      caption:
        "The wizard will only restore ecash from another seed phrase, you will not be able to use this seed phrase or change the seed phrase of the wallet that you're currently using. This means that restored ecash will not be protected by your current seed phrase as long as you don't send the ecash to yourself once.",
    },
    restore_mints: {
      label: "Restore Mints",
      caption:
        'Select the mint to restore. You can add more mints in the main screen under "Mints" and restore them here.',
    },
    actions: {
      paste: {
        error: "Failed to read clipboard contents.",
      },
      validate: {
        error: "Mnemonic should be at least 12 words.",
      },
      restore: {
        label: "Restore",
        in_progress: "Restoring mint …",
        error: "Error restoring mint: { error }",
      },
      restore_all_mints: {
        label: "Restore All Mints",
        in_progress: "Restoring mint { index } of { length } …",
        success: "Restore finished successfully",
        error: "Error restoring mints: { error }",
      },
    },
  },
  MintSettings: {
    add: {
      title: "Add mint",
      description:
        "Enter the URL of a Cashu mint to connect to it. This wallet is not affiliated with any mint.",
      inputs: {
        nickname: {
          placeholder: "Nickname (e.g. Testnet)",
        },
      },
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "Invalid URL",
        },
        scan: {
          label: "Scan QR Code",
        },
      },
    },
    discover: {
      title: "Discover mints",
      overline: "Discover",
      caption: "Discover mints other users have recommended on nostr.",
      actions: {
        discover: {
          label: "Discover mints",
          in_progress: "Loading…",
          error_no_mints: "No mints found",
          success: "Found { length } mints",
        },
      },
      recommendations: {
        overline: "Found { length } mints",
        caption:
          "These mints were recommended by other Nostr users. Read reviews at { link }. Be careful and do your own research before using a mint.",
        actions: {
          browse: {
            label: "Click to browse mints",
          },
        },
      },
    },
    swap: {
      title: "Swap",
      overline: "Multimint Swaps",
      caption:
        "Swap funds between mints via Lightning. Note: Leave room for potential Lightning fees. If the incoming payment does not succeed, check the invoice manually.",
      inputs: {
        from: {
          label: "From",
        },
        to: {
          label: "To",
        },
        amount: {
          label: "Amount ({ ticker }))",
        },
      },
      actions: {
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
      },
    },
  },
  QrcodeReader: {
    progress: {
      text: "{ percentage }{ addon }",
      percentage: "{ percentage }%",
      keep_scanning_text: " - Keep scanning",
    },
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
    },
  },
  InvoiceDetailDialog: {
    title: "Create Invoice",
    inputs: {
      amount: {
        label: "Amount ({ ticker }) *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "Create Invoice",
        label_blocked: "Creating invoice…",
        in_progress: "Creating",
      },
    },
    invoice: {
      caption: "Lightning invoice",
      status_paid_text: "Paid!",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        copy: {
          label: "@:global.actions.copy.label",
        },
      },
    },
  },
  SendDialog: {
    title: "Send",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "No mints available",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "No mints available",
      },
    },
  },
  SendTokenDialog: {
    title: "Send { value }",
    title_ecash_text: "Ecash",
    badge_offline_text: "Offline",
    inputs: {
      amount: {
        label: "Amount ({ ticker }) *",
        invalid_too_much_error_text: "Too much",
      },
      p2pk_pubkey: {
        label: "Receiver public key (npub = DM)",
        label_invalid: "Receiver public key (npub = DM)",
      },
      locktime: {
        label: "Unlock time",
      },
      lock_toggle: {
        label: "Lock to pubkey/timelock",
      },
      memo: {
        label: "Message",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      close_card_scanner: {
        label: "@:global.actions.close.label",
      },
      copy_emoji: {
        label: "🥜",
        tooltip_text: "Copy Emoji",
      },
      copy_tokens: {
        label: "@:global.actions.copy.label",
      },
      copy_link: {
        tooltip_text: "Copy link",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      paste_p2pk_pubkey: {
        tooltip_text: "@:global.actions.paste.label",
      },
      send: {
        label: "@:global.actions.send.label",
      },
      delete: {
        tooltip_text: "Delete from history",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "Flash to NFC card",
          ndef_unsupported_text: "NDEF unsupported",
        },
      },
    },
  },
  ReceiveDialog: {
    title: "Receive",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "No mints available",
      },
      lightning: {
        label: "Lightning",
        error_no_mints:
          "You need to connect to a mint to receive via Lightning",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "Receive Ecash",
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      scan: {
        label: "@:global.actions.scan.label",
      },
      request: {
        label: "Request",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      nfc: {
        label: "NFC",
        scanning_text: "Scanning…",
      },
    },
  },
  ReceiveTokenDialog: {
    title: "Receive { value }",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "Paste Cashu token",
      },
      bucket: {
        label: "Destination bucket",
      },
      label: {
        label: "Label",
      },
      description: {
        label: "Description",
      },
    },
    timelock: {
      unlock_date_label: "Unlocks { value }",
      receiver_label: "Receiver { value }",
    },
    errors: {
      invalid_token: {
        label: "Invalid token",
      },
    },
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      scan: {
        label: "@:global.actions.scan.label",
      },
      receive: {
        label: "@:global.actions.receive.label",
        label_known_mint: "@:ReceiveTokenDialog.actions.receive.label",
        label_adding_mint: "Adding mint…",
      },
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "Swap to a trusted mint",
        caption: "Swap { value }",
      },
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "Cancel swap",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      later: {
        label: "Later",
        tooltip_text: "Add to history to receive later",
        already_in_history_success_text: "Ecash already in History",
        added_to_history_success_text: "Ecash added to History",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Read from NFC card",
          ndef_unsupported_text: "NDEF unsupported",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "P2PK Key",
      description: "Receive ecash locked to this key",
      used_warning_text:
        "Warning: This key was used before. Use a new key for better privacy.",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_key: {
        label: "Generate new key",
      },
    },
  },
  PaymentRequestDialog: {
    payment_request: {
      caption: "Payment Request",
      description: "Receive payments via Nostr",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "New request",
      },
      add_amount: {
        label: "Add amount",
      },
      use_active_mint: {
        label: "Any mint",
      },
    },
    inputs: {
      amount: {
        placeholder: "Enter amount",
      },
    },
  },
  SubscriptionReceipt: {
    title: "Subscription Receipt",
    actions: {
      save: {
        label: "@:global.actions.save.label",
      },
      expand_token: { label: "Expand token" },
      collapse_token: { label: "Collapse token" },
    },
  },
  NumericKeyboard: {
    actions: {
      close: {
        label: "@:global.actions.close.label",
        closed_info_text:
          "Keyboard disabled. You can re-enable the keyboard in the settings.",
      },
      enter: {
        label: "@:global.actions.enter.label",
      },
    },
  },
  NWCDialog: {
    nwc: {
      caption: "Nostr Wallet Connect",
      description:
        "Control your wallet remotely with NWC. Press the QR code to link your wallet with a compatible app.",
      warning_text:
        "Warning: anyone with access to this connection string can initiate payments from your wallet. Do not share!",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
    },
  },
  MintMotdMessage: {
    title: "Mint Message",
  },
  MintDetailsDialog: {
    contact: {
      title: "Contact",
    },
    details: {
      title: "Mint details",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Nuts",
        actions: {
          show: {
            label: "View all",
          },
          hide: {
            label: "Hide",
          },
        },
      },
      currency: {
        label: "Currency",
      },
      currencies: {
        label: "@:MintDetailsDialog.details.currency.label",
      },
      version: {
        label: "Version",
      },
    },
    actions: {
      title: "Actions",
      copy_mint_url: {
        label: "Copy mint URL",
      },
      delete: {
        label: "Delete mint",
      },
      edit: {
        label: "Edit mint",
      },
    },
  },
  ChooseMint: {
    title: "Select a mint",
    badge_mint_error_text: "Error",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
  },
  HistoryTable: {
    empty_text: "No history yet",
    row: {
      type_label: "Ecash",
      date_label: "{ value } ago",
    },
    actions: {
      check_status: {
        tooltip_text: "Check status",
      },
      receive: {
        tooltip_text: "Receive",
      },
      filter_pending: {
        label: "Filter pending",
      },
      show_all: {
        label: "Show all",
      },
      edit_label: {
        tooltip_text: "Edit token",
        title: "Edit token",
      },
    },
    old_token_not_found_error_text: "Old token not found",
  },
  InvoiceTable: {
    empty_text: "No invoices yet",
    row: {
      type_label: "Lightning",
      type_tooltip_text: "Click to copy",
      date_label: "{ value } ago",
    },
    actions: {
      check_status: {
        tooltip_text: "Check status",
      },
      filter_pending: {
        label: "Filter pending",
      },
      show_all: {
        label: "Show all",
      },
    },
  },
  RemoveMintDialog: {
    title: "Are you sure you want to delete this mint?",
    nickname: {
      label: "Nickname",
    },
    balances: {
      label: "Balances",
    },
    warning_text:
      "Note: Because this wallet is paranoid, your ecash from this mint will not be actually deleted but will remain stored on your device. You will see it reappear if you re-add this mint later again.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "Remove mint",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  PayInvoiceDialog: {
    input_data: {
      title: "Pay Lightning",
      inputs: {
        invoice_data: {
          label: "Lightning invoice or address",
        },
      },
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        enter: {
          label: "@:global.actions.enter.label",
        },
        paste: {
          label: "@:global.actions.paste.label",
        },
        scan: {
          label: "@:global.actions.scan.label",
        },
      },
    },
    lnurlpay: {
      amount_exact_label: "{ payee } is requesting { value } { ticker }",
      amount_range_label:
        "{ payee } is requesting{br}between { min } and { max } { ticker }",
      inputs: {
        amount: {
          label: "Amount ({ ticker }) *",
        },
        comment: {
          label: "Comment (optional)",
        },
      },
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        send: {
          label: "@:global.actions.send.label",
        },
      },
    },
    invoice: {
      title: "Pay { value }",
      memo: {
        label: "Memo",
      },
      processing_info_text: "Processing…",
      balance_too_low_warning_text: "Balance too low",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        pay: {
          label: "Pay",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
          error: "Error",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Edit mint",
    inputs: {
      nickname: {
        label: "Nickname",
      },
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    tooltips: {
      mint_url: "Update the mint's base URL",
      nickname: "Friendly name for this mint",
    },
    actions: {
      cancel: {
        label: "@:global.actions.cancel.label",
      },
      update: {
        label: "@:global.actions.update.label",
      },
    },
  },
  AddMintDialog: {
    title: "Do you trust this mint?",
    description:
      "Before using this mint, make sure you trust it. Mints could become malicious or cease operation at any time.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    tooltips: {
      mint_url: "URL of the mint you want to add",
    },
    actions: {
      cancel: {
        label: "@:global.actions.cancel.label",
      },
      add_mint: {
        label: "@:global.actions.add_mint.label",
        in_progress: "Adding mint",
      },
    },
  },
  AddTierDialog: {
    helper: {
      media_preview:
        "Supported URL types: HTTPS, IPFS, YouTube, <iframe> snippets and Nostr event links. Only the embedded source URL is stored.",
    },
  },
  FindCreators: {
    inputs: {
      search: {
        label: "Search creators",
        placeholder: "npub or hex public key",
        tooltip: "Search for creators by public key",
      },
    },
    labels: {
      followers: "Followers",
      following: "Following",
      joined: "Joined",
      view_profile_stats: "View profile for stats",
    },
    actions: {
      donate: {
        label: "Donate",
      },
      message: {
        label: "Message",
      },
      view_profile: {
        label: "View Profile",
      },
      back_to_search: {
        label: "Back to search",
      },
    },
    choose_action: {
      title: "Select token",
      existing: "Existing Token",
      new: "Create New",
    },
    notifications: {
      donation_sent: "Donation sent",
      message_sent: "Message sent",
      subscription_success: "Subscription successful",
      invalid_creator_pubkey: "Invalid creator pubkey",
      subscription_failed: "Subscription failed",
    },
  },
  ChooseExistingTokenDialog: {
    title: "Choose token",
    empty: "No pending tokens in this bucket",
  },
  SendMessageDialog: {
    title: "Send message",
    inputs: {
      message: { label: "Message" },
    },
    actions: {
      cancel: { label: "@:global.actions.cancel.label" },
      send: { label: "@:global.actions.send.label" },
    },
  },
  SendBucketDmDialog: {
    title: "Send Bucket Tokens",
    inputs: {
      recipient: { label: "Recipient npub" },
      amount: { label: "Amount" },
      memo: { label: "Memo" },
    },
    options: {
      amount: "Amount",
      proofs: "Select Tokens",
    },
    actions: {
      cancel: { label: "@:global.actions.cancel.label" },
      send: { label: "@:global.actions.send.label" },
    },
    errors: {
      invalid_npub: "Invalid npub",
      invalid_pubkey: "Invalid pubkey",
    },
  },
  DonateDialog: {
    inputs: {
      preset: "Donation months",
      type: "Donation type",
      amount: "Amount",
      message: "Message",
    },
    helper: {
      months: "Number of months (0 = one-time)",
    },
  },
  BucketManager: {
    actions: {
      add: "Create new Bucket",
      delete: "Delete",
      edit: "Edit",
      archive: "Archive",
      unarchive: "Unarchive",
      manage: "Manage",
      view_tokens: "View tokens",
      move: "Move tokens",
      deselect_all: "Deselect All",
    },
    inputs: {
      name: "Name",
      color: "Color",
      description: "Description",
      goal: "Goal (sat)",
      creator_pubkey: "Creator pubkey",
    },
    tooltips: {
      description: "Buckets are for categorizing tokens",
      goal: "Set a target amount for this bucket",
      creator_pubkey: "Nostr pubkey to receive tokens",
      add_button: "Add a new bucket",
      edit_button: "Edit this bucket",
      delete_button: "Remove this bucket",
      move_button: "Move tokens between buckets",
    },
    helper: {
      intro:
        "Buckets let you organize tokens. Drag tokens into a bucket or use the 'Move tokens' button.",
    },
    validation: {
      name: "Name is required",
      goal: "Goal must be positive",
      error: "Please correct the errors before saving",
    },
    delete_confirm: {
      title: "Delete bucket?",
    },
    move_confirm: {
      title: "Move tokens?",
      text: "Move all tokens from {from} to {to}?",
    },
    notifications: {
      move_success: "Tokens moved",
    },
    view: {
      all: "All",
      archived: "Archived",
    },
  },
  BucketDetail: {
    move: "Move tokens",
    send: "Send tokens",
    export: "Export bucket",
    send_to_creator: "Send to creator",
    send_dm: "Send via Nostr DM",
    locked_tokens_heading: "Locked tokens",
    tabs: {
      overview: "Overview",
      history: "History",
    },
    inputs: {
      target_bucket: {
        label: "Move to bucket",
      },
    },
    tooltips: {
      target_bucket: "Choose a bucket to receive the selected tokens",
      send_dm: "Send tokens via Nostr direct message",
    },
    not_found: "Bucket not found.",
  },
  MoveTokens: {
    title: "Move tokens",
    select_tokens: "Select tokens to move",
    empty: "No tokens",
    helper: "Move tokens between buckets to organize them.",
    errors: {
      select_bucket: "Please select a bucket",
    },
  },
  SubscriptionsOverview: {
    title: "Subscriptions",
    summary: {
      monthly: "Monthly outflow",
      total: "Total locked",
    },
    columns: {
      creator: "Creator",
      bucket: "Bucket",
      tierName: "Tier",
      benefits: "Benefits",
      tokensRemaining: "Remaining",
      monthly: "Monthly",
      total: "Total",
      start: "Start",
      end: "Ends",
      total_months: "Total months",
      next_unlock: "Next unlock",
      status: "Status",
      remaining: "Months left",
      actions: "Actions",
    },
    status: {
      active: "Active",
      expired: "Expired",
      unlocked: "Unlocked",
    },
    empty: "No subscriptions",
    discover: "Discover creators",
    view: "View",
    message: "Message",
    renew: "Renew",
    extend: "Extend",
    export: "Export",
    export_csv: "Export CSV",
    cancel: "Cancel",
    cancel_confirm_title: "Cancel subscription",
    cancel_confirm_text: "Delete all future locked tokens?",
    extend_dialog_title: "Extend subscription",
    extend_dialog_text: "Number of additional months",
    soon_unlock: "{ count } subscriptions unlocking within 7 days",
    soon_badge: "Soon",
    filter: {
      status: "Filter by status",
      bucket: "Filter by bucket",
    },
    sort_by: "Sort by",
    sort: {
      end: "End date",
      name: "Name",
      cost: "Cost",
    },
    notifications: {
      cancel_success: "Subscription canceled",
      extend_success: "Subscription extended",
      export_success: "Tokens exported",
    },
    row: {
      next_unlock_label: "Next unlock in { value }",
    },
    pending_retry: "Queued { count } payments for resend",
    actions: {
      retry_now: { label: "Retry now" },
      open_filters: { label: "Open filters" },
      more_actions: { label: "More actions" },
    },
  },
  LockedTokensTable: {
    empty_text: "No locked tokens",
    row: {
      date_label: "{ value } ago",
      unlock_label: "Unlocks { value }",
      receiver_label: "Receiver { value }",
    },
    actions: {
      copy: { tooltip_text: "Copy" },
    },
  },
  CreatorLockedTokensTable: {
    redeem_all: "Redeem all pending",
    status: { redeemed: "Redeemed", pending: "Pending" },
  },
  CreatorSubscribers: {
    filter: {
      placeholder: "Filter",
      startFrom: "Start from",
      startTo: "Start to",
      nextRenewalFrom: "Next renewal from",
      nextRenewalTo: "Next renewal to",
      monthsRemaining: "Periods remaining",
    },
    filters: {
      frequency: "Filter by frequency",
    },
    columns: {
      subscriber: "Subscriber",
      tier: "Tier",
      followers: "Followers",
      following: "Following",
      latestNote: "Latest note",
      start: "Start",
      nextRenewal: "Next renewal",
      months: "Periods",
      remaining: "Remaining",
      status: "Status",
      actions: "Actions",
    },
    frequency: {
      weekly: "Weekly",
      biweekly: "Bi-weekly",
      monthly: "Monthly",
    },
    actions: {
      viewProfile: "View profile",
      sendMessage: "Send message",
      downloadCsv: "Download CSV",
      sendGroupMessage: "Send Group DM",
      exportSelected: "Export selected",
      filters: "Filters",
    },
    toolbar: {
      searchPlaceholder: "Search",
      frequency: "Frequency",
      status: "Status",
      tier: "Tier",
      sort: "Sort",
      compact: "Compact",
      exportCsv: "Export CSV",
    },
    status: {
      active: "Active",
      pending: "Pending",
      ended: "Ended",
    },
    summary: {
      subscribers: "Subscribers",
      active: "Active",
      pending: "Pending",
      receivedPeriods: "Received periods",
      revenue: "Revenue",
      thisWeek: "this week",
      thisMonth: "this month",
    },
    periodsText: "{received} of {total} periods",
    periodsTooltip: "Periods received vs periods purchased",
    startTooltip: "Filter by subscription start date",
    nextRenewalTooltip: "Filter by next renewal date",
    monthsRemainingTooltip: "Filter by remaining periods",
    nextRenewal: "Renews on {date}",
    noData: "No subscribers yet",
    shareProfile: "Share your profile",
    selectionCount: "{count} selected",
    tooltips: {
      noSelection: "Select subscribers first",
      notLoggedIn: "Connect to Nostr to send messages",
    },
    notifications: {
      export_success: "Subscribers exported",
      export_failed: "Failed to export subscribers",
      dm_not_ready: "Messenger not ready",
    },
    drawer: {
      tabs: {
        overview: "Overview",
        payments: "Payments",
        notes: "Notes",
      },
      overview: {
        nip05: "nip05",
        lud16: "lud16",
        about: "about",
        nextRenewal: "Next renewal",
        amountPerInterval: "Amount / interval",
        lifetimeTotal: "Lifetime total",
        since: "Since",
      },
      actions: {
        dm: "DM",
        copyNpub: "Copy npub",
        copyLud16: "Copy lud16",
        openProfile: "Profile",
        cancel: "Cancel",
      },
      payments: {
        noPayments: "No payments",
      },
    },
  },
  restore: {
    mnemonic_error_text: "Please enter a mnemonic",
    restore_mint_error_text: "Error restoring mint: { error }",
    prepare_info_text: "Preparing restore process …",
    restored_proofs_for_keyset_info_text:
      "Restored { restoreCounter } proofs for keyset { keysetId }",
    checking_proofs_for_keyset_info_text:
      "Checking proofs { startIndex } to { endIndex } for keyset { keysetId }",
    no_proofs_info_text: "No proofs found to restore",
    restored_amount_success_text: "Restored { amount }",
  },
  CreatorHub: {
    login: {
      title: "Creator Login",
      nip07: "Login with Nostr Extension",
      nsec: "nsec",
      nsec_button: "Login with nsec",
      nsec_warning:
        "Entering your nsec in a web app is dangerous. Use NIP-07 if possible.",
    },
    dashboard: {
      title: "Creator Dashboard",
      logout: "Logout",
      edit_profile: "Edit Profile",
      manage_tiers: "Manage Tiers",
      add_tier: "Add Tier",
      save_tier: "Save Tier",
      delete_tier: "Delete Tier",
      inputs: {
        title: {
          label: "Title",
        },
        price: {
          label: "Cost / month (sats)",
        },
        description: {
          label: "Description (Markdown)",
        },
      },
      welcome_message: "Welcome Message",
      currency_labels: {
        usd: "USD",
        eur: "EUR",
      },
    },
    profile: {
      back: "Back",
      tiers: "Subscription Tiers",
      edit: "Edit",
    },
  },
  
  swap: {
    in_progress_warning_text: "Swap in progress",
    invalid_swap_data_error_text: "Invalid swap data",
    swap_error_text: "Error swapping",
  },
  settings: {
    nostr: {
      signing_extension: {
        not_found: "No NIP-07 signing extension found",
      },
    },
  },
  bucketManager: {
    actions: { add: "Add bucket" },
    addDialog: { title: "Create new bucket" },
    inputs: {
      search: {
        placeholder: "Search buckets",
      },
    },
  },
  bucket: {
    name: "Name",
    color: "Color",
    goal: "Monthly goal",
    description: "Description",
  },
  AboutPage: {
    siteOverview: {
      title: "Site Overview",
      wallet: {
        description: "Manage your ecash balance.",
        icon: "account_balance_wallet",
      },
      findCreators: {
        description: "Discover creators to support.",
        icon: "img:icons/find-creators.svg",
      },
      
      myProfile: {
        description: "View and edit your profile.",
        icon: "person",
      },
      buckets: {
        description: "Organize funds into buckets.",
        icon: "inventory_2",
      },
      subscriptions: {
        description: "Manage your subscriptions.",
        icon: "auto_awesome_motion",
      },
      nostrMessengerTitle: "Nostr Messenger",
      nostrMessenger: {
        description: "Chat privately with Nostr.",
        icon: "chat",
      },
      settings: {
        description: "Configure the app.",
        icon: "settings",
      },
      restoreTitle: "Restore",
      restore: {
        description: "Recover your wallet from a backup.",
        icon: "settings_backup_restore",
      },
      alreadyRunningTitle: "Already Running",
      alreadyRunning: {
        description: "Warning when another session is active.",
        icon: "warning",
      },
      welcomeTitle: "Welcome",
      welcome: {
        description: "Introductory guide to Fundstr.",
        icon: "info",
      },
      terms: {
        description: "Review the terms of service.",
        icon: "gavel",
      },
      nostrLoginTitle: "Nostr Login",
      nostrLogin: {
        description: "Authenticate using your Nostr keys.",
        icon: "vpn_key",
      },
    },
    navigation: {
      fanPerspective: "Fan perspective",
      creatorPerspective: "Creator perspective",
      items: {
        wallet: {
          fan: "Check balance, send and receive ecash.",
          creator: "Same wallet view—shows supporter payments.",
        },
        settings: {
          fan: "Add / switch mints, choose display unit, set language & theme, import or back-up your 12-word seed, manage Nostr keys & relays.",
          creator:
            "Same, plus Publishing settings: toggle automatic NIP-61 profile updates and set a default “Earnings” bucket.",
        },
        findCreators: {
          fan: "Search or browse Nostr-indexed profiles. View tier prices, previews and public posts. Hit Subscribe or Zap with a single tap.",
          creator:
            "Your public storefront as seen by visitors. Great for a quick audit of how your profile appears worldwide.",
        },
        
        myProfile: {
          fan: "Show off your avatar, npub link and optional NIP-05. Personal stats: total zaps sent & received, bucket balances.",
          creator:
            "Same card plus Edit. Update bio, tags and the secondary P2PK key used by fans to send you locked tokens.",
        },
        buckets: {
          fan: "Drag-and-drop jars for budgeting (“Groceries”, “Fun money”, “Subs”). Move sats with zero fees.",
          creator:
            "Create an “Income” bucket that auto-receives new tips; split out taxes or savings instantly.",
        },
        subscriptions: {
          fan: "See every active plan: tier name, next renewal, cumulative sats spent. Cancel or renew with one click.",
          creator:
            "Quick list of paying supporters, tier breakdown, churn alerts and pending renewals.",
        },
        chats: {
          fan: "End-to-end encrypted DMs (Nostr kind 4). Attach images or Cashu tokens. Green flash means a payment is embedded and auto-redeemed on receipt.",
          creator:
            "Same powerful chat plus a broadcast toggle to message all subs in a tier at once.",
        },
        restore: {
          fan: "Recover your wallet from a 12-word seed.",
          creator: "Same recovery flow for creator profiles.",
        },
        alreadyRunning: {
          fan: "Warns when Fundstr is open in another tab.",
          creator: "Same warning to avoid conflicting sessions.",
        },
        welcome: {
          fan: "Quick guide for new users.",
          creator: "Same introduction including creator tips.",
        },
        terms: {
          fan: "Human-readable, plain-English licence & disclaimers.",
          creator: "Identical — clarifies you keep full custody of funds.",
        },
        about: {
          fan: "Learn everything in one scroll.",
          creator: "Ditto; includes creator-specific FAQs below.",
        },
        externalLinks: {
          fan: "Cashu.space docs, GitHub, Twitter, Telegram, Donate.",
          creator: "Identical — share with collaborators or fans.",
        },
        nostrLogin: {
          fan: "Sign in using your Nostr keys.",
          creator: "Same login method required for posting.",
        },
      },
    },
  },
};

export default {
  ...(defaultLang as any),
  ...messages,
};
