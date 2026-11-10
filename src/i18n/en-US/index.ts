export default {
  global: {
    notifications: "Notifications",
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
      show_qr: {
        label: "Show QR code",
      },
      show_seed: {
        label: "Show seed phrase",
      },
      hide_seed: {
        label: "Hide seed phrase",
      },
      scan: {
        label: "Scan",
      },
      more_options: {
        label: "More options",
      },
      clear: {
        label: "Clear",
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
  ActivityRow: {
    received: "Received",
    sent: "Sent",
    receiving: "Receiving",
    sending: "Sending",
  },
  common: {
    copied: "Copied",
    on_chain: "On-chain",
    pending: "Pending",
    delete: "Delete",
    copy_npub: "Copy npub",
    back: "Back",
    refresh: "Refresh",
    settings: "Settings",
    backspace: "Backspace",
    enter_amount_in: "Enter amount in {fiat}",
    something_went_wrong: "Something went wrong",
  },
  MultinutPicker: {
    dialog_title: "Multi-mint payment",
    pay_using_multiple: "Pay using multiple mints",
    experimental_title: "Experimental feature",
    experimental_text:
      "This feature is highly experimental and may not work as expected. Make sure you don't try to pay an invoice that has already been paid before. You could lose funds.",
    understand: "I understand",
    select_funds: "Choose which mints to pay from.",
    pay_invoice: "Pay invoice",
    amount_mismatch: "Amount calculation error: {calculated} vs {expected}",
    states: {
      requesting: "Requesting…",
      paying: "Paying…",
      success: "Success",
      failed: "Failed",
    },
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
      sent: "Sent {amount}",
      token_still_pending: "Token still pending",
      received_lightning: "Received {amount} via Lightning",
      lightning_payment_failed: "Lightning payment failed",
      failed_to_decode_invoice: "Failed to decode invoice",
      unsupported_legacy_qr: "Unsupported Legacy QR code",
      legacy_qr_not_supported:
        "This Legacy QR code is not from a supported merchant",
      invalid_lnurl: "Invalid LNURL",
      lnurl_error: "LNURL Error",
      no_amount: "No amount",
      no_lnurl_data: "No LNURL data",
      no_price_data: "No price data.",
      trying_again: "Trying again...",
      no_bolt12_mint: "None of your mints support BOLT12 offers",
      no_bolt11_mint: "None of your mints support BOLT11 invoices",
      address_not_paid: "No payment received at this address yet",
      payment_pending: "Payment pending",
      invoice_already_paid: "Invoice already paid",
      payment_sent: "Payment sent",
      payment_failed: "Payment failed",
      could_not_pay_request: "Could not pay request",
      request_unit_unsupported:
        "The mint does not support the unit in this payment request: {unit}",
      no_onchain_mint: "None of your mints support on-chain payments",
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
        mint_validation_error: "Mint validation error",
        removed: "Mint removed",
        error: "Mint error",
      },
    },
  },
  MainHeader: {
    menu: {
      terms: {
        terms: {
          title: "Terms",
          caption: "What you agree to by using Cashu.me",
        },
      },
      links: {
        cashuSpace: {
          title: "Cashu.space",
          caption: "cashu.space",
        },
        github: {
          title: "GitHub",
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
  Settings: {
    menu: {
      title: "Settings",
      backup: {
        title: "Backup & restore",
        caption: "Seed phrase and ecash recovery",
      },
      lightning_address: {
        title: "Lightning address",
        caption: "Get paid at name{'@'}domain",
      },
      nostr: {
        title: "Nostr",
        caption: "Keys, relays and web of trust",
      },
      payment_requests: {
        title: "Payment requests",
        caption: "Receive ecash payments via Nostr",
      },
      nwc: {
        title: "Nostr Wallet Connect",
        caption: "Use your wallet from other apps",
      },
      hardware: {
        title: "Hardware",
        caption: "NFC card settings",
      },
      p2pk: {
        title: "Locked ecash",
        caption: "Receive ecash locked to your key",
      },
      privacy: {
        title: "Privacy",
        caption: "Network checks and bitcoin price",
      },
      experimental: {
        title: "Experimental",
        caption: "Try new features early",
      },
      appearance: {
        title: "Appearance",
        caption: "Theme, keyboard and bitcoin symbol",
      },
      language: {
        title: "Language",
        caption: "Choose your language",
      },
      advanced: {
        title: "Advanced",
        caption: "Developer tools and wallet reset",
      },
      about: {
        title: "About",
        caption: "Terms and links",
      },
    },
    language: {
      title: "Language",
    },
    sections: {
      nostr: {
        relays: {
          already_added: "Relay already added",
          add: {
            title: "Add relay",
            description:
              "Your wallet uses these relays for Nostr features such as payment requests, Nostr Wallet Connect and backups.",
          },
          list: {
            title: "Relays",
            copy_tooltip: "Copy relay",
            remove_tooltip: "Remove relay",
          },
        },
      },
    },
    backup_restore: {
      backup_seed: {
        title: "Back up seed phrase",
        description:
          "Your seed phrase can restore your wallet. Keep it safe and private.",
        seed_phrase_label: "Seed phrase",
      },
      restore_ecash: {
        title: "Restore ecash",
        description:
          "Recover ecash from another seed phrase. Your current seed phrase stays unchanged.",
      },
    },
    lightning_address: {
      server_url: {
        label: "npub.cash server",
        hint: "Enter a hostname or HTTPS URL",
        invalid: "Enter a valid HTTPS server URL",
      },
      title: "Lightning address",
      enable: {
        toggle: "Use a Lightning address",
        description: "Get paid at an address from npub.cash",
      },
      address: {
        label: "Your address",
        copy_tooltip: "Copy Lightning address",
      },
      show_on_receive: {
        toggle: "Show when receiving",
        description: "Show address and QR code.",
      },
      automatic_claim: {
        toggle: "Claim automatically",
        description: "Receive incoming payments automatically.",
      },
      mint: {
        label: "npub.cash mint",
        choose_title: "Choose mint for npub.cash",
        choose_placeholder: "Select a mint...",
      },
    },
    nostr_keys: {
      title: "Your Nostr keys",
      description: "Your Nostr keys determine your Lightning address.",
      wallet_seed: {
        title: "Wallet seed phrase",
        description: "Generate a Nostr key pair from your wallet seed",
        copy_nsec: "Copy private key (nsec)",
      },
      nsec_bunker: {
        title: "Remote signer",
        description: "Sign with a NIP-46 bunker",
        delete_tooltip: "Delete connection",
      },
      use_nsec: {
        title: "Use your Nostr private key (nsec)",
        description: "This method is dangerous and not recommended",
        delete_tooltip: "Delete private key",
      },
      signing_extension: {
        title: "Signing extension",
        description: "Use a NIP-07 signing extension",
        not_found: "No NIP-07 signing extension found",
      },
    },
    payment_requests: {
      description:
        "Get paid through Nostr. When on, your wallet listens on your Nostr relays.",
      enable_toggle: "Enable payment requests",
      claim_automatically: {
        toggle: "Claim automatically",
        description:
          "Adds incoming payments from mints you already use to your balance without asking. Otherwise you confirm each one.",
      },
    },
    nostr_wallet_connect: {
      description:
        "Lets other apps pay from this wallet, create invoices, and see your balance and history through Nostr Wallet Connect (NWC).",
      enable_toggle: "Enable Nostr Wallet Connect",
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
        title: "NFC card format",
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
          description: "Store token as binary data",
        },
        quick_access: {
          toggle: "Quick access to NFC",
          description:
            "Adds an NFC button to the Receive ecash screen for scanning cards.",
        },
      },
    },
    p2pk_features: {
      description:
        "Generate or import a key to receive locked ecash (P2PK). Experimental: use small amounts. If you lose the private key, you can lose access to the ecash locked to it.",
      generate_button: "Generate key",
      import_button: "Import private key (nsec)",
      quick_access: {
        toggle: "Show Lock button in Receive ecash",
        description:
          "Adds a Lock button to Receive ecash. Open it to share your public key so senders can lock ecash to you.",
      },
      keys_expansion: {
        label: "Public keys ({count})",
        used_badge: "used",
      },
    },
    privacy: {
      network_title: "Network checks",
      description: "These settings affect your privacy.",
      check_incoming: {
        toggle: "Check incoming invoice",
        description:
          "Checks your latest invoice in the background. Faster updates, but easier to fingerprint. When off, check invoices yourself in History.",
      },
      check_startup: {
        toggle: "Check pending invoices on startup",
        description: "Checks pending invoices when the wallet opens.",
      },
      check_all: {
        toggle: "Check all invoices",
        description:
          "Checks unpaid invoices in the background for up to two weeks. More online activity makes you easier to fingerprint. When off, check invoices yourself in History.",
      },
      check_sent: {
        toggle: "Check sent ecash",
        description:
          "Checks in the background whether sent ecash was claimed. More online activity makes you easier to fingerprint.",
      },
      websockets: {
        toggle: "Use WebSockets",
        description:
          "Keeps a live connection to mints for updates on payments and spent ecash. Faster, but easier to fingerprint.",
      },
      bitcoin_price: {
        title: "Bitcoin price",
        toggle: "Get exchange rate from Coinbase",
        description:
          "Fetches the bitcoin price from coinbase.com to show your balance in fiat.",
        currency: {
          title: "Fiat currency",
          description: "Choose the fiat currency for the bitcoin price.",
        },
      },
    },
    experimental: {
      receive_swaps: {
        toggle: "Receive swaps",
        badge: "Beta",
        description: "Offers to swap received ecash to your active mint.",
      },
      auto_paste: {
        toggle: "Paste ecash automatically",
        description:
          "Pastes ecash from your clipboard when you tap Paste token. Turn off if it causes glitches on iOS.",
      },
      auditor: {
        toggle: "Enable auditor",
        badge: "Beta",
        description:
          "Shows reliability data from a third-party mint auditor on mint details.",
        url_label: "Auditor URL",
        api_url_label: "Auditor API URL",
      },
      multinut: {
        description:
          "Adds a “Pay with multiple mints” option when paying a Lightning invoice.",
      },
      nostr_mint_backup: {
        toggle: "Back up mint list to Nostr",
        description:
          "Backs up your mint list to your Nostr relays so you can restore it on another device.",
        notifications: {
          enabled: "Nostr mint backup enabled",
          disabled: "Nostr mint backup disabled",
          failed: "Failed to enable Nostr mint backup",
        },
      },
    },
    appearance: {
      mode: {
        title: "Mode",
        dark: "Dark",
        light: "Light",
      },
      keyboard: {
        title: "On-screen keyboard",
        toggle: "Use numeric keyboard",
        toggle_description: "Uses the numeric keypad for entering amounts.",
      },
      theme: {
        title: "Theme",
        description: "Change how your wallet looks.",
        tooltips: {
          mono: "Mono",
          cyber: "Cyber",
          freedom: "Freedom",
          nostr: "Nostr",
          bitcoin: "Bitcoin",
          mint: "Mint",
          nut: "Nut",
          blu: "Blu",
          flamingo: "Flamingo",
        },
      },
      bip177: {
        title: "Bitcoin symbol",
        description: "Show amounts as ₿2,789 instead of 2,789 sats.",
        toggle: "Use ₿ symbol",
      },
    },
    web_of_trust: {
      title: "Web of trust",
      known_pubkeys: "Known public keys: {wotCount}",
      continue_crawl: "Continue crawl",
      crawl_odell: "Crawl Odell's web of trust",
      crawl_wot: "Crawl web of trust",
      pause: "Pause",
      reset: "Reset",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    multinut: {
      use_multinut: "Multi-mint payments",
    },
    advanced: {
      backup_files_title: "Backup files",
      danger_zone_title: "Danger zone",
      notifications: {
        reserved_unset: "All proof reservations cleared",
        removed_spent: "Spent proofs removed: {count}",
        no_spent: "No spent proofs found",
        invalid_backup: "Invalid backup file format",
        read_error: "Error reading file",
      },
      developer: {
        title: "Developer settings",
        description: "Tools for troubleshooting and debugging.",
        new_seed: {
          button: "Generate new seed phrase",
          description:
            "Creates a new seed phrase. Your current ecash stays tied to the old one: send your entire balance to yourself afterwards, or the new seed cannot restore it.",
          confirm_question:
            "Are you sure you want to generate a new seed phrase?",
          cancel: "Cancel",
          confirm: "Confirm",
        },
        remove_spent: {
          button: "Remove spent proofs",
          description:
            "Removes ecash the active mint reports as spent, in the selected unit. Use only if your wallet is stuck.",
        },
        design_system: {
          title: "Design system",
          description:
            "Every component of the app, live, with its source and usage.",
        },
        debug_console: {
          button: "Debug console",
          description:
            "Opens the JavaScript console. Never paste code you don't understand; scammers use it to steal funds.",
        },
        export_proofs: {
          button: "Export active proofs",
          description:
            "Copies the active mint's balance in the selected unit to your clipboard as one ecash token. Switch mint or unit and export again for the rest.",
        },
        keyset_counters: {
          title: "Increment keyset counters",
          increase: "Increase counter for {id}",
          fixes: "Can help resolve “outputs have already been signed”",
          keysets: "{n} keyset | {n} keysets",
          sheet_hint: "Tap + to increase a keyset's counter.",
          column: "Counter",
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
            "Downloads a backup file you can import on the welcome screen. It is out of date as soon as you use the wallet again.",
        },
        import_wallet: {
          button: "Import wallet backup",
          description:
            "Imports an exported backup file. Settings and records in the backup overwrite this wallet's; anything not in the backup stays.",
          confirm_question: "Import this backup into the wallet?",
          cancel: "Cancel",
          confirm: "Import wallet backup",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Add a mint",
    subtitle:
      "Mints issue the ecash this wallet holds. Add a mint, or receive ecash from one, to get started.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Receive ecash",
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
    panel: {
      expand: "Show history and mints",
      collapse: "Hide history and mints",
    },
    tabs: {
      history: {
        label: "History",
      },
      mints: {
        label: "Mints",
      },
    },
    install: {
      text: "Install",
      tooltip: "Install Cashu.me",
    },
  },
  AlreadyRunning: {
    title: "Cashu.me is open in another tab",
    text: "Close the other tab, then tap Retry.",
    actions: {
      retry: {
        label: "Retry",
      },
    },
  },
  ErrorNotFound: {
    title: "This page doesn’t exist",
    text: "404",
    actions: {
      home: {
        label: "Go back home",
      },
    },
  },
  BalanceView: {
    total_label: "Total balance",
    show_balance: "Show {unit} balance",
    mintError: {
      label: "Mint error",
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
    terms_agreement: "By continuing, you agree to the {terms}",
    title: "Welcome to Cashu.me",
    text: "Cashu.me is a free and open-source Bitcoin wallet that uses ecash to keep your funds secure and private.",
  },
  WelcomeSlide2: {
    title: "Install Cashu.me",
    alt: {
      pwa_example: "PWA installation example",
    },
    installing: "Installing…",
    instruction: {
      intro: {
        text: "For the best experience, use this wallet with your device's native web browser to install it as a Progressive Web App.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          text: "Tap the menu (top right)",
        },
        step2: {
          text: "Press { buttonText }",
          buttonText: "@:PwaPrompt.android.add",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          text: "Tap share (bottom)",
        },
        step2: {
          text: "Press { buttonText }",
          buttonText: "@:PwaPrompt.ios.add",
        },
      },
      outro: {
        text: "After installing, close this browser tab and open Cashu.me from your home screen.",
      },
    },
    pwa: {
      success: {
        title: "Success!",
        text: "You are using Cashu.me as a PWA. Close any other open browser windows and use the app from your home screen.",
        nextSteps:
          "You can now close this browser tab and open the app from your home screen.",
      },
    },
  },
  PwaPrompt: {
    title: "Install Cashu.me",
    text: "Opens from your home screen, without the browser bar.",
    ios: {
      share: "Tap Share",
      add: "Add to Home Screen",
    },
    android: {
      menu: "Open the browser menu",
      add: "Add to Home Screen",
    },
    install: "Install",
    notNow: "Not now",
  },
  WelcomeSlide3: {
    title: "Your seed phrase",
    text: "Store your seed phrase in a password manager or on paper. Your seed phrase is the only way to recover your funds if you lose access to this device.",
    inputs: {
      seed_phrase: {
        label: "Seed phrase",
        caption: "You can see your seed phrase in the settings.",
      },
      checkbox: {
        label: "I have written it down",
      },
    },
  },
  WelcomeSlide4: {
    english_only: "The legal text is available in English only.",
    title: "Terms of Service",
    actions: {
      more: {
        label: "Please read before using Cashu.me",
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
    progress: {
      words_entered: "{count}/12 words entered",
    },
    disclaimer:
      "Your seed phrase is only used locally to derive your wallet keys.",
  },
  WelcomeRestoreEcash: {
    title: "Restore your ecash",
    text: "Find unspent ecash on your added mints and restore it to your wallet.",
  },
  MintRatings: {
    sort_and_filter: "Sort and filter",
    reviews_title: "Reviews",
    reviews_count: "{n} review | {n} reviews",
    web_of_trust_caption: "Only show reviews from your web of trust",
    web_of_trust_hop: "In your web of trust (hop {hop})",
    no_mint_url: "No mint URL provided",
    reviews: "reviews",
    range: "{from}–{to} of {total}",
    no_reviews: "No reviews found",
    your_review: "Your review",
    no_rating: "No rating",
    stars_label: "{rating} of 5 stars",
    out_of: "out of {max}",
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
      "Share your experience with this mint to help others choose.",
  },
  CreateMintReview: {
    connect_nostr:
      "Please connect a Nostr account in Settings to publish a review.",
    published: "Review published",
    publish_failed: "Failed to publish review",
    title: "Review mint",
    publishing_as: "Publishing as:",
    inputs: {
      rating: {
        label: "Rating",
        hint: "Choose a rating to publish your review.",
      },
      review: { label: "Review (optional)" },
    },
    actions: {
      publish: { label: "Publish review", in_progress: "Publishing…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "Restore from seed phrase",
      caption: "Add every mint you used with this seed before you restore.",
      inputs: {
        seed_phrase: {
          label: "Seed phrase",
        },
      },
    },
    information: {
      caption:
        "The wizard will only restore ecash from another seed phrase, you will not be able to use this seed phrase or change the seed phrase of the wallet that you're currently using. This means that restored ecash will not be protected by your current seed phrase as long as you don't send the ecash to yourself once.",
    },
    restore_mints: {
      label: "Restore mints",
      caption:
        "Choose the mints to restore. Add missing mints from the Mints tab first.",
    },
    actions: {
      paste: {
        error: "Failed to read clipboard contents.",
      },
      validate: {
        error: "Mnemonic is not a valid BIP39 seed phrase.",
      },
      select_all: {
        label: "Select all",
      },
      deselect_all: {
        label: "Deselect all",
      },
      restore: {
        label: "Restore",
        error: "Error restoring mint: { error }",
      },
      restore_selected_mints: {
        label: "Restore selected mints ({count})",
        success: "Mints restored: {count}",
        error: "Error restoring selected mints: { error }",
      },
    },
    nostr_mints: {
      label: "Restore mints from Nostr",
      caption:
        "Search for mint backups stored on Nostr relays using your seed phrase. This will help you discover mints you previously used.",
      search_button: "Search for mint backups",
      select_all: "Select all",
      deselect_all: "Deselect all",
      backed_up: "Backed up",
      add_selected: "Add selected ({count})",
      no_backups_found: "No mint backups found",
      no_backups_hint:
        "A mint list can only be restored from a backup made earlier with this seed phrase. Turn on Nostr mint backup in Settings to save future changes.",
      invalid_mnemonic: "Please enter a valid seed phrase before searching.",
      search_error: "Failed to search for mint backups.",
      add_error: "Failed to add selected mints.",
    },
  },
  MintSettings: {
    see_reviews: "See reviews",
    add: {
      title: "Add mint",
      description:
        "Enter the URL of a Cashu mint to connect to it. This wallet is not affiliated with any mint.",
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "Invalid URL",
        },
        scan: {
          label: "Scan QR code",
        },
      },
    },
    discover: {
      title: "Discover mints",
      caption: "Mints other people recommend on Nostr.",
      actions: {
        discover: {
          label: "Discover mints",
          in_progress: "Loading…",
        },
      },
      add: "Add",
      empty: {
        title: "Find a mint",
        text: "Cashu.me asks Nostr relays for mints other people recommend, with their ratings and reviews.",
      },
      recommendations: {
        overline: "Found { length } mints",
        caption: "Do your own research before using a mint.",
      },
    },
    swap: {
      title: "Swap",
      actions: {
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
      },
      caption:
        "Move funds between your mints over Lightning. Leave room for Lightning fees. If the funds do not arrive, check the pending invoice in History.",
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
    switching_mint: "Switching to {mint}",
    reviews_text: "review | reviews",
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
    actions: {
      create: {
        label: "Create invoice",
        label_blocked: "Creating…",
      },
    },
    invoice: {
      caption: "Lightning invoice",
      status_paid_text: "Paid",
      actions: {
        copy: {
          label: "Copy invoice",
        },
      },
    },
  },
  SendDialog: {
    captions: {
      ecash: "Share a token or QR code",
      lightning: "Pay an invoice or address",
      onchain: "Send to a Bitcoin address",
    },
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
    badge_locked: "locked",
    title: "Send ecash",
    inputs: {
      p2pk_pubkey: {
        label: "Receiver public key",
        invalid: "Enter a valid public key (hex or npub)",
      },
    },
    actions: {
      copy_emoji: {
        tooltip_text: "Copy emoji",
      },
      copy_tokens: {
        label: "Copy token",
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
        in_progress: "Sending…",
      },
      delete: {
        tooltip_text: "Delete from history",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "Write to NFC card",
        },
      },
    },
    errors: {
      amount_required: "Enter an amount first.",
      serialization_failed: "Could not prepare ecash token.",
      mint_not_allowed_by_request:
        "The selected mint is not accepted by this payment request.",
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
      pay_failed: "Could not pay request",
      no_ecash: "No ecash available for this payment request",
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
    captions: {
      ecash: "Paste, scan or request a token",
      lightning: "Create an invoice to get paid",
      onchain: "Get a Bitcoin address",
    },
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
    title: "Receive ecash",
    actions: {
      paste: {
        label: "Paste token",
      },
      scan: {
        label: "Scan token",
      },
      request: {
        label: "Request ecash",
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
    receiving_amount: "Receiving {amount}",
    title: "Receive ecash",
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
      receive: {
        label: "@:global.actions.receive.label",
        label_known_mint: "@:ReceiveTokenDialog.actions.receive.label",
        label_adding_mint: "Adding mint…",
      },
      swap: {
        label: "Receive to trusted mint",
        tooltip_text: "Swap to a trusted mint",
        processing: "Processing swap...",
        failed: "Swap failed",
      },
      cancel_swap: {
        tooltip_text: "Cancel swap",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
      },
      receive_to_selected_mint: {
        label: "Receive to selected mint",
      },
      later: {
        label: "Receive later",
        tooltip_text: "Add to history to receive later",
        already_in_history_success_text: "Ecash already in history",
        added_to_history_success_text: "Ecash added to history",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Read from NFC card",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "Your locking key",
      description: "Receive ecash locked to this key",
      used_warning_text:
        "Warning: This key was used before. Use a new key for better privacy.",
    },
    actions: {
      copy: {
        label: "Copy public key",
      },
      new_key: {
        label: "Generate new key",
      },
    },
  },
  PaymentRequestDialog: {
    any_amount: "Any amount",
    payment_request: {
      caption: "Payment request",
    },
    received_total: "Received total",
    no_payments_yet: "No payments yet",
    request_index: "Request {index} of {total}",
    actions: {
      set_amount: {
        label: "Set amount",
      },
      copy: {
        label: "@:global.actions.copy.label",
      },
      new_request: {
        label: "New request",
      },
      share: {
        label: "Share",
      },
      add_amount: {
        label: "Add amount",
      },
      use_active_mint: {
        label: "Any mint",
      },
      remove_amount: {
        label: "Remove amount",
      },
      previous: {
        label: "Previous request",
      },
      next: {
        label: "Next request",
      },
    },
    inputs: {
      amount: {
        placeholder: "Enter amount",
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
    title: "Mint message",
  },
  MintDetailsDialog: {
    qr: {
      show: "Show QR code",
      hide: "Hide QR code",
    },
    contact: {
      title: "Contact",
      email: "Email",
    },
    details: {
      title: "Mint details",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Supported features",
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
        label: "Unit",
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
        label: "Remove mint",
      },
      edit: {
        label: "Edit mint",
      },
    },
    nuts: {
      nut7: "Token state check",
      nut8: "Overpaid Lightning fees",
      nut9: "Signature restore",
      nut10: "Spending conditions",
      nut11: "Pay-to-Pubkey (P2PK)",
      nut12: "DLEQ proofs",
      nut13: "Deterministic secrets",
      nut14: "Hashed Timelock Contracts (HTLC)",
      nut15: "Partial multi-path payments",
      nut16: "Animated QR codes",
      nut17: "WebSocket subscriptions",
      nut18: "Payment requests",
      nut19: "Cached responses",
      nut20: "Signature on mint quote",
      nut21: "Clear authentication",
      nut22: "Blind authentication",
    },
  },
  UnitToggle: {
    label: "Unit: {unit}, change",
    bitcoin: "Bitcoin",
  },
  ChooseMint: {
    open_selector: "Select mint, current mint: {mint}",
    open_selector_empty: "Select mint",
    title: "Select a mint",
    placeholder: "Select a mint",
    available_text: "on this mint",
    sheet_title: "Select mint",
    badge_mint_error_text: "Error",
  },
  HistoryTable: {
    empty_text: "No history yet",
    empty_hint: "Payments you send and receive appear here.",
    filters: {
      title: "Filter history",
      direction: "Direction",
      type: "Type",
      completed: "Completed",
      received: "Received",
      sent: "Sent",
      reset: "Reset",
      clear_all: "Clear all",
      remove: "Remove filter: {label}",
      empty_title: "No payments match these filters",
      clear: "Clear filters",
      count: "{shown} of {total}",
      active: "Filter history, {count} active",
    },
    row: {
      type_label: "Ecash",
    },
    actions: {
      check_status: {
        tooltip_text: "Check status",
      },
      receive: {
        tooltip_text: "Receive",
      },
    },
    old_token_not_found_error_text: "Old token not found",
    labels: {
      onchain_subpayment: "On-chain subpayment",
      bolt12_subpayment: "BOLT12 subpayment",
    },
  },
  InvoiceTable: {
    row: {
      type_label: "Lightning",
    },
  },
  RemoveMintDialog: {
    title: "Remove this mint?",
    nickname: {
      label: "Nickname",
    },
    balances: {
      label: "Balance on this mint",
    },
    warning_text:
      "Your ecash from this mint stays on this device. It comes back if you add the mint again.",
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
      title: "Scan QR code",
      description: "Point your camera at a QR code",
      caption_address: "Tap to scan an address",
      caption_token: "Tap to scan a token",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    onchain: {
      title: "Pay on-chain",
      address_placeholder: "Bitcoin address",
      choose_speed: "Choose confirmation speed",
      blocks: "{n} block | {n} blocks",
      estimated_confirmation: "Estimated confirmation",
      fee_reserve: "fee reserve",
    },
    multinut: {
      label: "Pay with multiple mints",
    },
    quote: {
      label: "Quote",
    },
    input_data: {
      title: "Pay with Lightning",
      title_bolt12: "Pay Lightning offer",
    },
    lnurlpay: {
      amount_exact_label: "{ payee } is requesting { value } { ticker }",
      amount_range_label:
        "{ payee } is requesting{br}between { min } and { max } { ticker }",
      sending_to_lightning_address: "Sending to { address }",
      inputs: {
        comment: {
          label: "Comment (optional)",
        },
      },
      actions: {
        send: {
          label: "@:global.actions.send.label",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
        },
      },
    },
    invoice: {
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
          waiting_for_wallet: "Waiting for wallet…",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Edit mint",
    inputs: {
      nickname: {
        label: "Nickname (optional)",
      },
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      update: {
        label: "@:global.actions.update.label",
      },
    },
  },
  AddMintDialog: {
    title: "Do you trust this mint?",
    description:
      "Add this mint only if you trust it. It can stop operating at any time, and you could lose the ecash you hold with it.",
    unreachable_error_text:
      "This mint is not reachable. Check the URL and your connection, then try again.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
        in_progress: "Adding mint",
      },
    },
    audit_info: {
      label: "Audit info",
      actions: {
        show: {
          label: "Show",
        },
        hide: {
          label: "Hide",
        },
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
    token: "Token",
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
  QuoteInformation: {
    address: "Address",
    invoice: "Invoice",
    request: "Request",
    amount: "Amount",
    fee_reserve: "Fee reserve",
    fee_paid: "Fee paid",
    unit: "Unit",
    status: "Status",
    network: "Network",
    transaction_id: "Transaction ID",
    explorer: "Explorer",
    confirmations: "Confirmations",
    paid_at: "Paid at",
    preimage: "Preimage",
    preimage_copied: "Preimage copied",
    mint: "Mint",
    method: "Method",
    lightning_offer: "Lightning offer",
    states: {
      waiting: "Waiting for payment",
      confirming: "Confirming ({count}/{threshold})",
      issuing: "Issuing ecash",
      paid: "Paid",
      unpaid: "Unpaid",
      pending: "Pending",
      issued: "Issued",
      expired: "Expired",
      failed: "Failed",
    },
  },
  MintAuditInfo: {
    title: "Audit info",
    loading: "Loading audit info…",
    not_audited: "This auditor has no data for this mint.",
    not_audited_text:
      "To learn more about the auditor or support a future audit, visit {link} or click {here} to donate ecash and help initiate an audit of this mint.",
    here: "here",
    unavailable: "Audit info is unavailable right now.",
    load_failed: "Failed to load mint data",
    success_rate: "Success rate",
    swaps_count: "{successful} of {total} swaps",
    average_time: "Average time",
    average_time_caption: "For successful swaps",
    disclaimer:
      "Audit data is provided by independent third parties to help assess a mint’s reliability over time. However, these results are informational only and do not guarantee the safety, solvency, or trustworthiness of any mint. Always conduct your own research and ensure you trust the mint operator before using their services.",
    donate_text:
      "Audit information is made available by {link}. The current balance held by the auditor for this mint is {balance}, with a total of {donations} donated so far. To support continued auditing, you can {press_here} to donate ecash to the auditor.",
    press_here: "press here",
    sats_amount: "{amount} sats",
    warnings_title: "Auditor warnings",
    warnings: {
      last_swap_failed: "The last swap attempt has failed.",
      recent_success:
        "{successful} of {total} swaps in the last {days} days succeeded.",
      reliable:
        "{base} However, {success} This mint seems reliable, failures might be due to the receiving mint.",
      unreliable: "{base} Only {success} This mint might be unreliable.",
      unknown:
        "The auditor was not able to determine the quality of this mint yet.",
      not_enough_data:
        "The auditor does not have enough recent data on this mint. There was only {count} successful swap in the last {days} days. | The auditor does not have enough recent data on this mint. There were only {count} successful swaps in the last {days} days.",
      low_success:
        "In the last {days} days, this mint had a success rate of {rate}%, below the recommended {threshold}%.",
      inactive:
        "This mint had no swaps for {days} day. It might be unreachable. | This mint had no swaps for {days} days. It might be unreachable.",
      slow: "This mint is slow. Payments from this mint took {seconds} seconds on average.",
      no_successful:
        "No successful swaps recorded for this mint. It might be unreachable.",
    },
    chart: {
      now: "Now",
      today: "Today",
      yesterday: "Yesterday",
      invalid_date: "Invalid date",
      swaps: "Swaps:",
      success_rate: "Success rate:",
      time_range: "Time range:",
    },
  },
  DisplayTokenComponent: {
    title: {
      send: "Send ecash",
      sent: "Sent ecash",
      received: "Received ecash",
    },
    qr_speed: "QR speed: {value}",
    qr_density: "QR density: {value}",
    speed: {
      fast: "Fast",
      medium: "Medium",
      slow: "Slow",
    },
    density: {
      high: "High",
      medium: "Medium",
      low: "Low",
    },
    delete_dialog: {
      title: "Delete from history?",
      text: "Are you sure you want to delete this transaction from your history?",
      warning:
        "Warning: This action cannot be undone and there is no way to recover the token.",
    },
    nfc: {
      read_failed: "NFC read failed",
      write_failed: "NFC write failed",
      error: "NFC error",
      writing: "Writing to NFC card…",
      success: "Token written to NFC card",
      capacity: "The card may not have enough capacity (needed {bytes} bytes).",
    },
  },
  CreateInvoiceDialog: {
    format_label: "Request type",
    formats: {
      bolt11: "Invoice",
      bolt12: "Offer",
    },
    onchain_title: "Receive on-chain",
    bolt12_title: "Receive Lightning offer",
    mint_unreachable: "Mint unreachable",
    mint_unreachable_text: "Reconnect to the mint to receive payments.",
    reconnect_mint: "Reconnect mint",
    checking_address: "Checking address…",
    add_amount: "Add amount",
    new_offer: "New offer",
    create_offer: "Create offer",
    create_new_address: "Create new address",
    create_address: "Create address",
    onchain_unsupported:
      "This mint does not support on-chain deposits in this unit.",
    deposit_limits: {
      outside: "Deposits outside {min}–{max} won't be credited.",
      below: "Deposits below {min} won't be credited.",
      above: "Deposits above {max} won't be credited.",
    },
    amount_errors: {
      positive_decimal:
        "Enter a positive amount with at most two decimal places in {unit}.",
      positive_whole: "Enter a positive whole amount in {unit}.",
      min: "Enter at least {amount}.",
      max: "Enter no more than {amount}.",
    },
  },
  storage: {
    notifications: {
      unrecognized_backup: "Unrecognized backup format",
      backup_restored: "Backup restored",
      backup_exported: "Wallet backup exported",
      quota_exceeded:
        "Browser storage is full or unavailable. New wallet data may not be saved. Back up your wallet now.",
      cleaned_up: "Cleaned up {size} bytes",
    },
  },
  receiveTokens: {
    notifications: {
      already_in_history: "Ecash already in history",
      nfc_read_failed: "Cannot read data from the NFC tag",
      scan_error: "Scan error",
      nfc_error: "NFC error",
    },
  },
  nostrMintBackup: {
    notifications: {
      no_relays: "No Nostr relays configured",
      backup_failed: "Could not back up your mint list to Nostr",
      backed_up: "Mint list backed up to Nostr",
      found:
        "Found {count} mint in Nostr backups | Found {count} mints in Nostr backups",
      none_found: "No mint backups found on Nostr for this seed phrase",
      search_failed: "Could not search for mint backups",
      add_mint_failed: "Could not add {mint}",
      added:
        "Added {count} mint to your wallet | Added {count} mints to your wallet",
      none_added: "No new mints were added",
      add_selected_failed: "Could not add the selected mints",
    },
  },
  nostr: {
    notifications: {
      nip04_published: "Message published to Nostr",
      nip04_failed: "Could not publish message to Nostr",
      nip17_failed: "Could not publish message to Nostr",
      receive_failed: "Could not receive incoming payment",
      ecash_already_in_history: "Ecash already in history",
      ecash_added: "Ecash added to history",
    },
  },
  nwc: {
    notifications: {
      melt_quote_failed: "NWC: Could not get a payment quote from the mint",
      unit_must_be_sat: "NWC: The active unit must be sats",
      allowance_exceeded: "NWC: Allowance exceeded",
    },
  },
  npubcash: {
    notifications: {
      could_not_update_mint: "Could not update the npub.cash mint",
      add_mint_first: "Add {mint} to your wallet first",
    },
  },
};
