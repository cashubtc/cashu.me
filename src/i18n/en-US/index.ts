export default {
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
      pay: {
        label: "Pay",
      },
      swap: {
        label: "Swap",
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
  common: {
    fee: "Fee",
  },
  MultinutPicker: {
    payment: "Multinut payment",
    selectMints: "Select one or multiple mints to execute a payment from.",
    totalSelectedBalance: "Total Selected Balance",
    multiMintPay: "Multi-Mint Pay",
    balanceNotEnough: "Multi-mint balance not enough to satisfy this invoice",
    failed: "Failed to process: {error}",
    paid: "Paid {amount} via Lightning",
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
        mint_validation_error: "Mint validation error",
        removed: "Mint removed",
        error: "Mint error",
      },
    },
  },
  MainHeader: {
    menu: {
      settings: {
        title: "Settings",
        settings: {
          title: "Settings",
          caption: "Wallet configuration",
        },
      },
      terms: {
        title: "Terms",
        terms: {
          title: "Terms",
          caption: "Terms of Service",
        },
      },
      links: {
        title: "Links",
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
      nostr: {
        title: "NOSTR",
        relays: {
          expand_label: "Click to edit relays",
          add: {
            title: "Add relay",
            description:
              "Your wallet uses these relays for nostr operations such as payment requests, nostr wallet connect, and backups.",
          },
          list: {
            title: "Relays",
            description: "Your wallet will connect to these relays.",
            copy_tooltip: "Copy relay",
            remove_tooltip: "Remove relay",
          },
        },
      },
      payment_requests: "PAYMENT REQUESTS",
      nostr_wallet_connect: "NOSTR WALLET CONNECT",
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
      npc_v2: {
        choose_mint_title: "Choose mint for npub.cash v2",
        choose_mint_placeholder: "Select a mint...",
      },
    },
    nostr_keys: {
      title: "Your nostr keys",
      description:
        "Your nostr keys will be used to determine your Lightning address.",
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
          title: "Binary",
          description: "Store tokens as binary data",
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
        currency: {
          title: "Fiat Currency",
          description: "Choose the fiat currency for Bitcoin price display.",
        },
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
      auditor: {
        toggle: "Enable auditor",
        badge: "Beta",
        description:
          "If enabled, the wallet will display auditor information in the mint details dialog. The auditor is a third party service that monitors the reliability of mints.",
        url_label: "Auditor URL",
        api_url_label: "Auditor API URL",
      },
      multinut: {
        toggle: "Enable Multinut",
        description:
          "If enabled, the wallet will use Multinut to pay invoices from multiple mints at once.",
      },
      nostr_mint_backup: {
        toggle: "Backup mint list on Nostr",
        description:
          "If enabled, your mint list will be automatically backed up to Nostr relays using your configured Nostr keys. This allows you to restore your mint list across devices.",
        notifications: {
          enabled: "Nostr mint backup enabled",
          disabled: "Nostr mint backup disabled",
          failed: "Failed to enable Nostr mint backup",
        },
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
        },
      },
      bip177: {
        title: "Bitcoin symbol",
        description: "Use ₿ symbol instead of sats.",
        toggle: "Use ₿ symbol",
      },
    },
    web_of_trust: {
      title: "Web of trust",
      known_pubkeys: "Known pubkeys: {wotCount}",
      continue_crawl: "Continue crawl",
      crawl_odell: "Crawl ODELL'S WEB OF TRUST",
      crawl_wot: "Crawl web of trust",
      pause: "Pause",
      reset: "Reset",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      use_npubx: "Use npubx.cash",
      copy_lightning_address: "Copy Lightning address",
      v2_mint: "npub.cash v2 mint",
    },
    multinut: {
      use_multinut: "Use Multinut",
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
          counter: "counter: {count}",
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
    text: "Oops. Nothing here…",
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
    alt: {
      pwa_example: "PWA Installation Example",
    },
    installing: "Installing…",
    instruction: {
      intro: {
        text: "For the best experience, use this wallet with your device's native web browser to install it as a Progressive Web App.",
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
        nextSteps:
          "You can now close this browser tab and open the app from your home screen.",
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
  WelcomeSlideChoice: {
    title: "Set up your wallet",
    text: "Do you want to recover from a seed phrase or create a new wallet?",
    options: {
      new: {
        title: "Create new wallet",
        subtitle: "Generate a new seed and add mints.",
      },
      recover: {
        title: "Recover wallet",
        subtitle: "Enter your seed phrase, restore mints and ecash.",
      },
    },
  },
  WelcomeMintSetup: {
    title: "Add mints",
    text: "Mints are servers that help you send and receive ecash. Choose a discovered mint or add one manually. Skip to add mints later.",
    sections: {
      your_mints: "Your mints",
    },
    restoring: "Restoring mints…",
    placeholder: {
      mint_url: "https://",
    },
  },
  WelcomeRecoverSeed: {
    title: "Enter your seed phrase",
    text: "Paste or type your 12 word seed phrase to recover.",
    inputs: {
      word: "Word { index }",
    },
    actions: {
      paste_all: "Paste all",
    },
    disclaimer:
      "Your seed phrase is only used locally to derive your wallet keys.",
  },
  WelcomeRestoreEcash: {
    title: "Restore your ecash",
    text: "Scan for unspent proofs on your configured mints and add them to your wallet.",
  },
  MintRatings: {
    title: "Mint Reviews",
    reviews: "reviews",
    ratings: "Ratings",
    no_reviews: "No reviews found",
    your_review: "Your review",
    no_reviews_to_display: "No reviews to display.",
    no_rating: "No rating",
    out_of: "out of",
    rows: "Reviews",
    sort: "Sort",
    sort_options: {
      newest: "Newest",
      oldest: "Oldest",
      highest: "Highest",
      lowest: "Lowest",
    },
    actions: {
      write_review: "Write a review",
    },
    empty_state_subtitle:
      "Help by leaving a review. Share your experience with this mint and help others by leaving a review.",
  },
  CreateMintReview: {
    title: "Review Mint",
    publishing_as: "Publishing as",
    inputs: {
      rating: { label: "Rating" },
      review: { label: "Review (optional)" },
    },
    actions: {
      publish: { label: "Submit Review", in_progress: "Submitting…" },
    },
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
      select_all: {
        label: "Select All",
      },
      deselect_all: {
        label: "Deselect All",
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
      restore_selected_mints: {
        label: "Restore Selected Mints ({count})",
        in_progress: "Restoring mint { index } of { length } …",
        success: "Successfully restored {count} mint(s)",
        error: "Error restoring selected mints: { error }",
      },
    },
    nostr_mints: {
      label: "Restore Mints from Nostr",
      caption:
        "Search for mint backups stored on Nostr relays using your seed phrase. This will help you discover mints you previously used.",
      search_button: "Search for Mint Backups",
      select_all: "Select All",
      deselect_all: "Deselect All",
      backed_up: "Backed up",
      already_added: "Already Added",
      add_selected: "Add Selected ({count})",
      no_backups_found: "No mint backups found",
      no_backups_hint:
        "Make sure Nostr mint backup is enabled in settings to automatically backup your mint list.",
      invalid_mnemonic: "Please enter a valid seed phrase before searching.",
      search_error: "Failed to search for mint backups.",
      add_error: "Failed to add selected mints.",
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
          "These mints were recommended by other Nostr users. Be careful and do your own research before using a mint.",
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
      actions: {
        receove_to_trusted_mint: {
          label: "Receive to trusted mint",
        },
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
      },
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
          label: "Amount ({ ticker })",
        },
      },
    },
    error_badge: "Error",
    reviews_text: "reviews",
    no_reviews_yet: "No reviews yet",
    discover_mints_button: "Discover mints",
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
    title: "Receive Lightning",
    create_invoice_title: "Create Invoice",
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
    title: "Send Ecash",
    title_ecash_text: "Ecash",
    badge_offline_text: "Offline",
    inputs: {
      amount: {
        label: "Amount ({ ticker }) *",
        invalid_too_much_error_text: "Too much",
      },
      p2pk_pubkey: {
        label: "Receiver public key",
        label_invalid: "Receiver public key",
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
      share: {
        tooltip_text: "Share ecash",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      paste_p2pk_pubkey: {
        tooltip_text: "@:global.actions.paste.label",
      },
      pay: {
        label: "@:global.actions.pay.label",
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
    errors: {
      amount_required: "Enter an amount first.",
      serialization_failed: "Could not prepare ecash token.",
    },
  },
  SendPaymentRequest: {
    actions: {
      pay: {
        label: "Pay",
      },
      pay_via: {
        label: "Pay via {transport}",
      },
    },
    info: {
      pay_to: "Pay to {target}",
      invalid_url: "Invalid URL",
    },
  },
  PaymentRequestInfo: {
    title_with_transport: "Payment request via {transport}",
    title: "Payment request",
    subtitle: "Pay to {target}",
    subtitle_fallback: "Payment request",
    invalid_url: "Invalid URL",
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
    title: "Receive Ecash",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "Paste Cashu token",
      },
    },
    errors: {
      invalid_token: {
        label: "Invalid token",
      },
      p2pk_lock_mismatch: {
        label:
          "Unable to receive. This token's P2PK lock doesn't match your public key.",
      },
    },
    unknown_mint_info_text:
      "Unknown mint. It will be added after you receive this token.",
    swap_section: {
      title: "Swap",
      source_label: "From",
      destination_label: "To",
      fee_info: "This swap will incur Lightning network fees.",
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
        label: "Receive to trusted mint",
        tooltip_text: "Swap to a trusted mint",
        caption: "Swap { value }",
        processing: "Processing swap...",
        failed: "Swap failed",
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
      receive_to_selected_mint: {
        label: "Receive to selected mint",
      },
      later: {
        label: "Receive later",
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
    received_total: "Received total",
    no_payments_yet: "No payments yet",
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
    placeholder: "Select a mint",
    available_text: "available",
    sheet_title: "Select Mint",
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
  ParseInputComponent: {
    placeholder: {
      default: "Cashu token or Lightning address",
      receive: "Cashu token",
      pay: "Lightning address or invoice",
    },
    qr_scanner: {
      title: "Scan QR Code",
      description: "Tap to scan an address",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
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
      sending_to_lightning_address: "Sending to { address }",
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
      paying: "Paying",
      paid: "Paid",
      fee: "Fee",
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
  swap: {
    in_progress_warning_text: "Swap in progress",
    invalid_swap_data_error_text: "Invalid swap data",
    swap_error_text: "Error swapping",
  },
  TokenInformation: {
    fee: "Fee",
    unit: "Unit",
    fiat: "Fiat",
    p2pk: "P2PK",
    locked: "Locked",
    locked_to_you: "Locked to you",
    mint: "Mint",
    memo: "Memo",
    payment_request: "Payment request",
    nostr: "Nostr",
    token_copied: "Token copied to clipboard",
  },
};
