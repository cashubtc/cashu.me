export default {
  copied_to_clipboard: "Copied to clipboard!",
  copy_failed: "Copy failed",
  global: {
    copy_to_clipboard: {
      success: "In die Zwischenablage kopiert!",
    },
    actions: {
      add_mint: {
        label: "Mint hinzufügen",
      },
      cancel: {
        label: "Abbrechen",
      },
      copy: {
        label: "Kopieren",
      },
      close: {
        label: "Schließen",
      },
      ok: {
        label: "OK",
      },
      enter: {
        label: "Eingeben",
      },
      lock: {
        label: "Sperren",
      },
      paste: {
        label: "Einfügen",
      },
      receive: {
        label: "Empfangen",
      },
      scan: {
        label: "Scannen",
      },
      send: {
        label: "Senden",
      },
      creatorHub: {
        publish: "Publish Profile",
        profileHeader: "Profile details",
      },
      swap: {
        label: "Tauschen",
      },
      update: {
        label: "Aktualisieren",
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
      balance_too_low: "Guthaben ist zu niedrig",
      received: "{amount} empfangen",
      fee: " (Gebühr: {fee})",
      could_not_request_mint: "Mint konnte nicht angefordert werden",
      invoice_still_pending: "Rechnung noch ausstehend",
      paid_lightning: "{amount} über Lightning bezahlt",
      payment_pending_refresh:
        "Zahlung ausstehend. Rechnung manuell aktualisieren.",
      sent: "{amount} gesendet",
      token_still_pending: "Token noch ausstehend",
      received_lightning: "{amount} über Lightning empfangen",
      lightning_payment_failed: "Lightning-Zahlung fehlgeschlagen",
      failed_to_decode_invoice: "Rechnung konnte nicht dekodiert werden",
      invalid_lnurl: "Ungültige LNURL",
      lnurl_error: "LNURL Fehler",
      no_amount: "Kein Betrag",
      no_lnurl_data: "Keine LNURL-Daten",
      no_price_data: "Keine Preisdaten.",
      please_try_again: "Bitte versuchen Sie es erneut.",
      nostr_dm_sent: "Nostr-DM gesendet",
      nostr_dm_failed: "Nostr-DM konnte nicht gesendet werden",
    },
    mint: {
      notifications: {
        already_added: "Mint bereits hinzugefügt",
        added: "Mint hinzugefügt",
        not_found: "Mint nicht gefunden",
        activation_failed: "Mint-Aktivierung fehlgeschlagen",
        no_active_mint: "Kein aktives Mint",
        unit_activation_failed: "Einheiten-Aktivierung fehlgeschlagen",
        unit_not_supported: "Einheit wird von Mint nicht unterstützt",
        activated: "Mint aktiviert",
        could_not_connect: "Verbindung zum Mint nicht möglich",
        could_not_get_info: "Mint-Information konnte nicht abgerufen werden",
        could_not_get_keys: "Mint-Schlüssel konnten nicht abgerufen werden",
        could_not_get_keysets: "Mint-Keysets konnten nicht abgerufen werden",
        removed: "Mint entfernt",
        error: "Mint-Fehler",
      },
    },
    signer_connected: "Nostr-Signer verbunden",
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
        title: "Einstellungen",
        settings: {
          title: "Einstellungen",
          caption: "Wallet-Konfiguration",
        },
      },
      terms: {
        title: "Bedingungen",
        terms: {
          title: "Bedingungen",
          caption: "Nutzungsbedingungen",
        },
      },
      about: {
        title: "About",
        about: { title: "About", caption: "About this app" },
      },
      links: {
        title: "Links",
        fundstrCreator: {
          title: "Ersteller von Fundstr",
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
          title: "Spenden",
          caption: "Cashu unterstützen",
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
        text: "Neu laden in { countdown }",
      },
    },
    staging: {
      warning: {
        text: "Staging – nicht mit echten Geldern verwenden!",
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
      title: "Sprache",
      description:
        "Bitte wählen Sie Ihre bevorzugte Sprache aus der Liste unten.",
    },
    sections: {
      backup_restore: "SICHERUNG & WIEDERHERSTELLUNG",
      lightning_address: "LIGHTNING ADRESSE",
      nostr_keys: "NOSTR SCHLÜSSEL",
      payment_requests: "ZAHLUNGSANFORDERUNGEN",
      nostr_wallet_connect: "NOSTR WALLET CONNECT",
      hardware_features: "HARDWARE FUNKTIONEN",
      p2pk_features: "P2PK FUNKTIONEN",
      privacy: "DATENSCHUTZ",
      experimental: "EXPERIMENTELL",
      appearance: "AUSSEHEN",
    },
    backup_restore: {
      backup_seed: {
        title: "Seed-Phrase sichern",
        description:
          "Ihre Seed-Phrase kann Ihre Wallet wiederherstellen. Bewahren Sie sie sicher und privat auf.",
        seed_phrase_label: "Seed-Phrase",
      },
      restore_ecash: {
        title: "Ecash wiederherstellen",
        description:
          "Der Wiederherstellungs-Assistent ermöglicht es Ihnen, verlorenes Ecash von einer mnemonischen Seed-Phrase wiederherzustellen. Die Seed-Phrase Ihrer aktuellen Wallet bleibt unverändert, der Assistent erlaubt es Ihnen lediglich, Ecash von einer anderen Seed-Phrase zu restaurieren.",
        button: "Wiederherstellen",
      },
    },
    lightning_address: {
      title: "Lightning Adresse",
      description: "Zahlungen an Ihre Lightning Adresse empfangen.",
      enable: {
        toggle: "Aktivieren",
        description: "Lightning Adresse mit npub.cash",
      },
      address: {
        copy_tooltip: "Lightning Adresse kopieren",
      },
      automatic_claim: {
        toggle: "Automatisch beanspruchen",
        description: "Eingehende Zahlungen automatisch empfangen.",
      },
    },
    nostr_keys: {
      title: "Ihre Nostr-Schlüssel",
      description:
        "Legen Sie die Nostr-Schlüssel für Ihre Lightning-Adresse fest.",
      wallet_seed: {
        title: "Wallet Seed-Phrase",
        description: "Nostr-Schlüsselpaar aus Wallet-Seed generieren",
        copy_nsec: "Nsec kopieren",
      },
      nsec_bunker: {
        title: "Nsec Bunker",
        description: "Einen NIP-46 Bunker verwenden",
        delete_tooltip: "Verbindung löschen",
      },
      use_nsec: {
        title: "Ihren Nsec verwenden",
        description: "Diese Methode ist gefährlich und wird nicht empfohlen",
        delete_tooltip: "Nsec löschen",
      },
      signing_extension: {
        title: "Signaturerweiterung",
        description: "Eine NIP-07 Signaturerweiterung verwenden",
        not_found: "Keine NIP-07 Signaturerweiterung gefunden",
      },
    },
    payment_requests: {
      title: "Zahlungsanforderungen",
      description:
        "Zahlungsanforderungen ermöglichen es Ihnen, Zahlungen über Nostr zu empfangen. Wenn Sie dies aktivieren, abonniert Ihre Wallet Ihre Nostr-Relays.",
      enable_toggle: "Zahlungsanforderungen aktivieren",
      claim_automatically: {
        toggle: "Automatisch beanspruchen",
        description: "Eingehende Zahlungen automatisch empfangen.",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Wallet Connect (NWC)",
      description:
        "Verwenden Sie NWC, um Ihre Wallet von jeder anderen Anwendung aus zu steuern.",
      enable_toggle: "NWC aktivieren",
      payments_note:
        "Sie können NWC nur für Zahlungen von Ihrem Bitcoin-Guthaben verwenden. Zahlungen werden von Ihrer aktiven Mint vorgenommen.",
      connection: {
        copy_tooltip: "Verbindungsstring kopieren",
        qr_tooltip: "QR-Code anzeigen",
        allowance_label: "Restliches Guthaben (sat)",
      },
      relays: {
        expand_label: "Klicken, um Relays zu bearbeiten",
        add: {
          title: "Relay hinzufügen",
          description:
            "Nostr Wallet Connect verwendet Nostr-Relays, um Ihre Wallet mit anderen Anwendungen zu verbinden.",
        },
        list: {
          title: "Relays",
          description: "Ihre Wallet wird sich mit diesen Relays verbinden.",
          copy_tooltip: "Relay kopieren",
          remove_tooltip: "Relay entfernen",
        },
      },
    },
    hardware_features: {
      webnfc: {
        title: "WebNFC",
        description:
          "Wählen Sie die Kodierung für das Schreiben auf NFC-Karten",
        text: {
          title: "Text",
          description: "Token als Klartext speichern",
        },
        weburl: {
          title: "URL",
          description: "URL zu dieser Wallet mit Token speichern",
        },
        binary: {
          title: "Rohdaten (Binary)",
          description:
            "Rohe Bytes anstelle von Base64. Macht Token ~33% kürzer.",
        },
        quick_access: {
          toggle: "Schnellzugriff auf NFC",
          description:
            "Schnelles Scannen von NFC-Karten im Ecash empfangen-Menü. Diese Option fügt einen NFC-Button zum Ecash empfangen-Menü hinzu.",
        },
      },
    },
    p2pk_features: {
      title: "P2PK",
      description:
        "Generieren Sie ein Schlüsselpaar, um P2PK-gesperrten Ecash zu erhalten. Warnung: Diese Funktion ist experimentell. Nur mit kleinen Beträgen verwenden. Wenn Sie Ihre privaten Schlüssel verlieren, kann niemand mehr den darauf gesperrten Ecash freischalten.",
      generate_button: "Schlüssel generieren",
      import_button: "Nsec importieren",
      quick_access: {
        toggle: "Schnellzugriff auf Sperre",
        description:
          "Verwenden Sie dies, um Ihren P2PK-Sperrschlüssel schnell im Ecash empfangen-Menü anzuzeigen.",
      },
      keys_expansion: {
        label: "Klicken, um {count} Schlüssel zu durchsuchen",
        used_badge: "verwendet",
      },
    },
    privacy: {
      title: "Datenschutz",
      description: "Diese Einstellungen beeinflussen Ihren Datenschutz.",
      check_incoming: {
        toggle: "Eingehende Rechnung prüfen",
        description:
          "Wenn aktiviert, prüft die Wallet die neueste Rechnung im Hintergrund. Dies erhöht die Reaktionsfähigkeit der Wallet, was das Fingerprinting erleichtert. Sie können unbezahlte Rechnungen manuell im Reiter 'Rechnungen' prüfen.",
      },
      check_startup: {
        toggle: "Ausstehende Rechnungen beim Start prüfen",
        description:
          "Wenn aktiviert, prüft die Wallet beim Start ausstehende Rechnungen der letzten 24 Stunden.",
      },
      check_all: {
        toggle: "Alle Rechnungen prüfen",
        description:
          "Wenn aktiviert, prüft die Wallet unbezahlte Rechnungen im Hintergrund für bis zu zwei Wochen. Dies erhöht die Online-Aktivität der Wallet, was das Fingerprinting erleichtert. Sie können unbezahlte Rechnungen manuell im Reiter 'Rechnungen' prüfen.",
      },
      check_sent: {
        toggle: "Gesendeten Ecash prüfen",
        description:
          "Wenn aktiviert, verwendet die Wallet periodische Hintergrundprüfungen, um festzustellen, ob gesendete Token eingelöst wurden. Dies erhöht die Online-Aktivität der Wallet, was das Fingerprinting erleichtert.",
      },
      websockets: {
        toggle: "WebSockets verwenden",
        description:
          "Wenn aktiviert, verwendet die Wallet langlebige WebSocket-Verbindungen, um Updates zu bezahlten Rechnungen und ausgegebenen Token von Mints zu erhalten. Dies erhöht die Reaktionsfähigkeit der Wallet, macht aber auch das Fingerprinting einfacher.",
      },
      bitcoin_price: {
        toggle: "Wechselkurs von Coinbase abrufen",
        description:
          "Wenn aktiviert, wird der aktuelle Bitcoin-Wechselkurs von coinbase.com abgerufen und Ihr umgerechnetes Guthaben angezeigt.",
      },
    },
    experimental: {
      title: "Experimentell",
      description: "Diese Funktionen sind experimentell.",
      receive_swaps: {
        toggle: "Swaps empfangen",
        badge: "Beta",
        description:
          "Option, empfangenen Ecash in Ihrer aktiven Mint im Dialog 'Ecash empfangen' zu tauschen.",
      },
      auto_paste: {
        toggle: "Ecash automatisch einfügen",
        description:
          "Fügt Ecash automatisch aus Ihrer Zwischenablage ein, wenn Sie auf 'Empfangen', dann 'Ecash', dann 'Einfügen' drücken. Automatisches Einfügen kann auf iOS zu UI-Fehlern führen. Deaktivieren Sie dies, wenn Sie Probleme haben.",
      },
      auto_redeem_locked: {
        toggle: "Gesperrte Tokens automatisch einlösen",
        description:
          "Wenn aktiviert, wird die Wallet gesperrte Tokens automatisch einlösen, sobald sie freigeschaltet sind.",
      },
      auditor: {
        toggle: "Auditor aktivieren",
        badge: "Beta",
        description:
          "Wenn aktiviert, zeigt die Wallet Auditor-Informationen im Dialog 'Mint-Details' an. Der Auditor ist ein Drittanbieter-Service, der die Zuverlässigkeit von Mints überwacht.",
        url_label: "Auditor URL",
        api_url_label: "Auditor API URL",
      },
    },
    appearance: {
      keyboard: {
        title: "Bildschirmtastatur",
        description:
          "Verwenden Sie die Zifferntastatur zur Eingabe von Beträgen.",
        toggle: "Numerische Tastatur verwenden",
        toggle_description:
          "Wenn aktiviert, wird die numerische Tastatur zur Eingabe von Beträgen verwendet.",
      },
      theme: {
        title: "Aussehen",
        description: "Ändern Sie das Aussehen Ihrer Wallet.",
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
      title: "Erweitert",
      developer: {
        title: "Entwickler-Einstellungen",
        description:
          "Die folgenden Einstellungen sind für Entwicklung und Debugging.",
        new_seed: {
          button: "Neue Seed-Phrase generieren",
          description:
            "Dies generiert eine neue Seed-Phrase. Sie müssen Ihr gesamtes Guthaben an sich selbst senden, um es mit einer neuen Seed wiederherstellen zu können.",
          confirm_question:
            "Sind Sie sicher, dass Sie eine neue Seed-Phrase generieren möchten?",
          cancel: "Abbrechen",
          confirm: "Bestätigen",
        },
        remove_spent: {
          button: "Ausgegebene Nachweise entfernen",
          description:
            "Überprüfen Sie, ob die Ecash-Token von Ihren aktiven Mints ausgegeben wurden und entfernen Sie die ausgegebenen aus Ihrer Wallet. Verwenden Sie dies nur, wenn Ihre Wallet festhängt.",
        },
        debug_console: {
          button: "Debug-Konsole umschalten",
          description:
            "Öffnen Sie das Javascript-Debug-Terminal. Fügen Sie niemals etwas in dieses Terminal ein, das Sie nicht verstehen. Ein Dieb könnte versuchen, Sie dazu zu bringen, bösartigen Code hier einzufügen.",
        },
        export_proofs: {
          button: "Aktive Nachweise exportieren",
          description:
            "Kopieren Sie Ihr gesamtes Guthaben von der aktiven Mint als Cashu-Token in Ihre Zwischenablage. Dies exportiert nur die Token der ausgewählten Mint und Einheit. Für einen vollständigen Export wählen Sie eine andere Mint und Einheit und exportieren Sie erneut.",
        },
        keyset_counters: {
          title: "Keyset-Zähler erhöhen",
          description:
            'Klicken Sie auf die Keyset-ID, um die Ableitungspfad-Zähler für die Keysets in Ihrer Wallet zu erhöhen. Dies ist nützlich, wenn Sie die Fehlermeldung "outputs have already been signed" sehen.',
        },
        unset_reserved: {
          button: "Alle reservierten Token freigeben",
          description:
            'Diese Wallet markiert ausstehenden ausgehenden Ecash als reserviert (und zieht es von Ihrem Guthaben ab), um Double-Spend-Versuche zu verhindern. Dieser Button gibt alle reservierten Token frei, damit sie wieder verwendet werden können. Wenn Sie dies tun, könnte Ihre Wallet ausgegebene Nachweise enthalten. Drücken Sie auf den Button "Ausgegebene Nachweise entfernen", um sie loszuwerden.',
        },
        show_onboarding: {
          button: "Onboarding anzeigen",
          description: "Zeigen Sie den Onboarding-Bildschirm erneut an.",
        },
        reset_wallet: {
          button: "Wallet-Daten zurücksetzen",
          description:
            "Setzen Sie Ihre Wallet-Daten zurück. Warnung: Dies löscht alles! Stellen Sie sicher, dass Sie vorher eine Sicherung erstellen.",
          confirm_question:
            "Sind Sie sicher, dass Sie Ihre Wallet-Daten löschen möchten?",
          cancel: "Abbrechen",
          confirm: "Wallet löschen",
        },
        export_wallet: {
          button: "Wallet-Daten exportieren",
          description:
            "Laden Sie einen Dump Ihrer Wallet herunter. Sie können Ihre Wallet aus dieser Datei auf dem Willkommensbildschirm einer neuen Wallet wiederherstellen. Diese Datei ist nicht synchron, wenn Sie Ihre Wallet nach dem Export weiter verwenden.",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Einer Mint beitreten",
    subtitle:
      "Sie sind noch keiner Cashu Mint beigetreten. Fügen Sie eine Mint URL in den Einstellungen hinzu oder empfangen Sie Ecash von einer neuen Mint, um zu beginnen.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Ecash empfangen",
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
        label: "Verlauf",
      },
      invoices: {
        label: "Rechnungen",
      },
      mints: {
        label: "Mints",
      },
    },
    install: {
      text: "Installieren",
      tooltip: "Cashu installieren",
    },
  },
  AlreadyRunning: {
    title: "Nein.",
    text: "Ein anderer Tab läuft bereits. Schließen Sie diesen Tab und versuchen Sie es erneut.",
    actions: {
      retry: {
        label: "Erneut versuchen",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Diese Seite existiert nicht. Verwenden Sie die Links unten zur Hilfe:",
    links: {
      docs: "Dokumentation",
      tips: "Tipps",
    },
    actions: {
      home: {
        label: "Zurück zur Startseite",
      },
    },
  },
  BalanceView: {
    mintUrl: {
      label: "Mint",
    },
    mintBalance: {
      label: "Guthaben",
    },
    mintError: {
      label: "Mint-Fehler",
    },
    pending: {
      label: "Ausstehend",
      tooltip: "Alle ausstehenden Token prüfen",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "Zurück",
      },
      next: {
        label: "Weiter",
      },
      skip: {
        label: "Überspringen",
      },
    },
  },
  WelcomeSlide1: {
    title: "Willkommen bei Cashu",
    text: "Cashu.me ist eine kostenlose und quelloffene Bitcoin-Wallet, die Ecash verwendet, um Ihre Gelder sicher und privat zu halten.",
    actions: {
      more: {
        label: "Klicken, um mehr zu erfahren",
      },
    },
    p1: {
      text: "Cashu ist ein kostenloses und quelloffenes Ecash-Protokoll für Bitcoin. Mehr dazu erfahren Sie unter { link }.",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "Diese Wallet ist nicht mit einer Mint affiliiert. Um diese Wallet zu nutzen, müssen Sie sich mit einer oder mehreren Cashu Mints verbinden, denen Sie vertrauen.",
    },
    p3: {
      text: "Diese Wallet speichert Ecash, auf das nur Sie Zugriff haben. Wenn Sie Ihre Browserdaten ohne Seed-Phrase-Sicherung löschen, verlieren Sie Ihre Token.",
    },
    p4: {
      text: "Diese Wallet ist in Beta. Wir übernehmen keine Verantwortung für den Verlust des Zugangs zu Geldern. Nutzung auf eigenes Risiko! Dieser Code ist quelloffen und unter der MIT-Lizenz lizenziert.",
    },
  },
  WelcomeSlide2: {
    title: "PWA installieren",
    instruction: {
      intro: {
        text: "Für die beste Erfahrung verwenden Sie diese Wallet mit dem nativen Webbrowser Ihres Geräts, um sie als Progressive Web App zu installieren. Machen Sie dies jetzt.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "Tippen Sie auf das Menü (oben rechts)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Drücken Sie { buttonText }",
          buttonText: "@:AndroidPWAPrompt.buttonText",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "Tippen Sie auf Teilen (unten)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Drücken Sie { buttonText }",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "Nachdem Sie diese App auf Ihrem Gerät installiert haben, schließen Sie dieses Browserfenster und verwenden Sie die App von Ihrem Startbildschirm aus.",
      },
    },
    pwa: {
      success: {
        title: "Erfolg!",
        text: "Sie verwenden Cashu als PWA. Schließen Sie alle anderen geöffneten Browserfenster und verwenden Sie die App von Ihrem Startbildschirm aus.",
      },
    },
  },
  iOSPWAPrompt: {
    text: "Tippen Sie auf { icon } und { buttonText }",
    buttonText: "Zum Home-Bildschirm",
  },
  AndroidPWAPrompt: {
    text: "Tippen Sie auf { icon } und { buttonText }",
    buttonText: "Zum Startbildschirm hinzufügen",
  },
  WelcomeSlide3: {
    title: "Ihre Seed-Phrase",
    text: "Speichern Sie Ihre Seed-Phrase in einem Passwortmanager oder auf Papier. Ihre Seed-Phrase ist der einzige Weg, Ihre Gelder wiederherzustellen, wenn Sie den Zugriff auf dieses Gerät verlieren.",
    inputs: {
      seed_phrase: {
        label: "Seed-Phrase",
        caption: "Sie können Ihre Seed-Phrase in den Einstellungen sehen.",
      },
      checkbox: {
        label: "Ich habe sie aufgeschrieben",
      },
    },
  },
  WelcomeSlide4: {
    title: "Bedingungen",
    actions: {
      more: {
        label: "Nutzungsbedingungen lesen",
      },
    },
    inputs: {
      checkbox: {
        label: "Ich habe diese Bedingungen gelesen und akzeptiere sie",
      },
    },
  },
  WelcomeSlidePrivacy: {
    title: "Cashu & Datenschutz",
    text: "Cashu verwendet geblindete Token, sodass Mints deine Zahlungen nicht verfolgen können.",
  },
  WelcomeSlideMints: {
    title: "Mints",
    text: "Füge einen Mint hinzu, um Token zu empfangen.",
  },
  WelcomeSlideProofs: {
    title: "Proofs",
    text: "Proofs sind die Token, die du senden und empfangen kannst.",
  },
  WelcomeSlideBuckets: {
    title: "Buckets",
    text: "Mit Buckets organisierst du deine Token.",
  },
  RestoreView: {
    seed_phrase: {
      label: "Aus Seed-Phrase wiederherstellen",
      caption:
        "Geben Sie Ihre Seed-Phrase ein, um Ihre Wallet wiederherzustellen. Stellen Sie vor der Wiederherstellung sicher, dass Sie alle Mints hinzugefügt haben, die Sie zuvor verwendet haben.",
      inputs: {
        seed_phrase: {
          label: "Seed-Phrase",
          caption: "Sie können Ihre Seed-Phrase in den Einstellungen sehen.",
        },
      },
    },
    information: {
      label: "Information",
      caption:
        "Der Assistent stellt nur Ecash von einer anderen Seed-Phrase wieder her. Sie können diese Seed-Phrase nicht verwenden oder die Seed-Phrase der aktuell verwendeten Wallet ändern. Das bedeutet, dass wiederhergestellter Ecash nicht durch Ihre aktuelle Seed-Phrase geschützt ist, solange Sie den Ecash nicht einmal an sich selbst senden.",
    },
    restore_mints: {
      label: "Mints wiederherstellen",
      caption:
        'Wählen Sie die Mint zur Wiederherstellung aus. Sie können weitere Mints im Hauptbildschirm unter "Mints" hinzufügen und sie hier wiederherstellen.',
    },
    actions: {
      paste: {
        error: "Zwischenablage-Inhalt konnte nicht gelesen werden.",
      },
      validate: {
        error: "Mnemonisch muss mindestens 12 Wörter enthalten.",
      },
      restore: {
        label: "Wiederherstellen",
        in_progress: "Mint wird wiederhergestellt…",
        error: "Fehler beim Wiederherstellen der Mint: { error }",
      },
      restore_all_mints: {
        label: "Alle Mints wiederherstellen",
        in_progress: "Mint { index } von { length } wird wiederhergestellt…",
        success: "Wiederherstellung erfolgreich abgeschlossen",
        error: "Fehler beim Wiederherstellen der Mints: { error }",
      },
    },
  },
  MintSettings: {
    add: {
      title: "Mint hinzufügen",
      description:
        "Geben Sie die URL einer Cashu Mint ein, um sich mit ihr zu verbinden. Diese Wallet ist nicht mit einer Mint affiliiert.",
      inputs: {
        nickname: {
          placeholder: "Spitzname (z.B. Testnet)",
        },
      },
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "Ungültige URL",
        },
        scan: {
          label: "QR-Code scannen",
        },
      },
    },
    discover: {
      title: "Mints entdecken",
      overline: "Entdecken",
      caption:
        "Entdecken Sie Mints, die andere Benutzer auf Nostr empfohlen haben.",
      actions: {
        discover: {
          label: "Mints entdecken",
          in_progress: "Lädt…",
          error_no_mints: "Keine Mints gefunden",
          success: "{ length } Mints gefunden",
        },
      },
      recommendations: {
        overline: "{ length } Mints gefunden",
        caption:
          "Diese Mints wurden von anderen Nostr-Benutzern empfohlen. Lesen Sie Bewertungen unter { link }. Seien Sie vorsichtig und recherchieren Sie selbst, bevor Sie eine Mint verwenden.",
        actions: {
          browse: {
            label: "Klicken, um Mints zu durchsuchen",
          },
        },
      },
    },
    
    swap: {
      title: "Tauschen",
      overline: "Multimint-Swaps",
      caption:
        "Tauschen Sie Gelder zwischen Mints über Lightning. Hinweis: Lassen Sie Platz für potenzielle Lightning-Gebühren. Wenn die eingehende Zahlung nicht erfolgreich ist, überprüfen Sie die Rechnung manuell.",
      inputs: {
        from: {
          label: "Von",
        },
        to: {
          label: "Nach",
        },
        amount: {
          label: "Betrag ({ ticker }))",
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
      keep_scanning_text: " - Weiter scannen",
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
    title: "Rechnung erstellen",
    inputs: {
      amount: {
        label: "Betrag ({ ticker }) *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "Rechnung erstellen",
        label_blocked: "Rechnung wird erstellt…",
        in_progress: "Erstellt",
      },
    },
    invoice: {
      caption: "Lightning Rechnung",
      status_paid_text: "Bezahlt!",
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
    title: "Senden",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Keine Mints verfügbar",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "Keine Mints verfügbar",
      },
    },
  },
  SendTokenDialog: {
    title: "Senden { value }",
    title_ecash_text: "Ecash",
    badge_offline_text: "Offline",
    inputs: {
      amount: {
        label: "Betrag ({ ticker }) *",
        invalid_too_much_error_text: "Zu viel",
      },
      p2pk_pubkey: {
        label: "Öffentlicher Schlüssel des Empfängers",
        label_invalid: "Öffentlicher Schlüssel des Empfängers",
      },
      locktime: {
        label: "Unlock time",
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
        tooltip_text: "Emoji kopieren",
      },
      copy_tokens: {
        label: "@:global.actions.copy.label",
      },
      copy_link: {
        tooltip_text: "Link kopieren",
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
        tooltip_text: "Aus Verlauf löschen",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "Auf NFC-Karte schreiben",
          ndef_unsupported_text: "NDEF nicht unterstützt",
        },
      },
    },
  },
  ReceiveDialog: {
    title: "Empfangen",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Keine Mints verfügbar",
      },
      lightning: {
        label: "Lightning",
        error_no_mints:
          "Sie müssen sich mit einer Mint verbinden, um über Lightning zu empfangen",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "Ecash empfangen",
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      scan: {
        label: "@:global.actions.scan.label",
      },
      request: {
        label: "Anfordern",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      nfc: {
        label: "NFC",
        scanning_text: "Scannt…",
      },
    },
  },
  ReceiveTokenDialog: {
    title: "Empfangen { value }",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "Cashu Token einfügen",
      },
      bucket: {
        label: "Bucket",
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
    },
    errors: {
      invalid_token: {
        label: "Ungültiger Token",
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
        label_adding_mint: "Mint wird hinzugefügt…",
      },
      
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "Zu einer vertrauenswürdigen Mint tauschen",
        caption: "Tauschen { value }",
      },
      
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "Swap abbrechen",
      },
      
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      later: {
        label: "Später",
        tooltip_text: "Zum Verlauf hinzufügen, um später zu empfangen",
        already_in_history_success_text: "Ecash bereits im Verlauf",
        added_to_history_success_text: "Ecash zum Verlauf hinzugefügt",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Von NFC-Karte lesen",
          ndef_unsupported_text: "NDEF nicht unterstützt",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "P2PK Schlüssel",
      description: "Ecash empfangen, der auf diesen Schlüssel gesperrt ist",
      used_warning_text:
        "Warnung: Dieser Schlüssel wurde bereits verwendet. Verwenden Sie einen neuen Schlüssel für besseren Datenschutz.",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_key: {
        label: "Neuen Schlüssel generieren",
      },
    },
  },
  PaymentRequestDialog: {
    payment_request: {
      caption: "Zahlungsanforderung",
      description: "Zahlungen über Nostr empfangen",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "Neue Anforderung",
      },
      add_amount: {
        label: "Betrag hinzufügen",
      },
      use_active_mint: {
        label: "Beliebige Mint",
      },
    },
    inputs: {
      amount: {
        placeholder: "Betrag eingeben",
      },
    },
  },
  NumericKeyboard: {
    actions: {
      close: {
        label: "@:global.actions.close.label",
        closed_info_text:
          "Tastatur deaktiviert. Sie können die Tastatur in den Einstellungen wieder aktivieren.",
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
        "Steuern Sie Ihre Wallet per Fernzugriff mit NWC. Tippen Sie auf den QR-Code, um Ihre Wallet mit einer kompatiblen App zu verknüpfen.",
      warning_text:
        "Warnung: Jeder, der Zugriff auf diesen Verbindungsstring hat, kann Zahlungen von Ihrer Wallet initiieren. Nicht teilen!",
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
    title: "Mint Nachricht",
  },
  MintDetailsDialog: {
    contact: {
      title: "Kontakt",
    },
    details: {
      title: "Mint Details",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Nuts",
        actions: {
          show: {
            label: "Alle anzeigen",
          },
          hide: {
            label: "Ausblenden",
          },
        },
      },
      currency: {
        label: "Währung",
      },
      currencies: {
        label: "@:MintDetailsDialog.details.currency.label",
      },
      version: {
        label: "Version",
      },
    },
    actions: {
      title: "Aktionen",
      copy_mint_url: {
        label: "Mint URL kopieren",
      },
      delete: {
        label: "Mint löschen",
      },
      edit: {
        label: "Mint bearbeiten",
      },
    },
  },
  ChooseMint: {
    title: "Wählen Sie eine Mint",
    badge_mint_error_text: "Fehler",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
  },
  HistoryTable: {
    empty_text: "Noch kein Verlauf vorhanden",
    row: {
      type_label: "Ecash",
      date_label: "Vor { value }",
    },
    actions: {
      check_status: {
        tooltip_text: "Status prüfen",
      },
      receive: {
        tooltip_text: "Empfangen",
      },
      filter_pending: {
        label: "Ausstehende filtern",
      },
      show_all: {
        label: "Alle anzeigen",
      },
    },
    old_token_not_found_error_text: "Alter Token nicht gefunden",
  },
  InvoiceTable: {
    empty_text: "Noch keine Rechnungen vorhanden",
    row: {
      type_label: "Lightning",
      type_tooltip_text: "Zum Kopieren klicken",
      date_label: "Vor { value }",
    },
    actions: {
      check_status: {
        tooltip_text: "Status prüfen",
      },
      filter_pending: {
        label: "Ausstehende filtern",
      },
      show_all: {
        label: "Alle anzeigen",
      },
    },
  },
  RemoveMintDialog: {
    title: "Sind Sie sicher, dass Sie diese Mint löschen möchten?",
    nickname: {
      label: "Spitzname",
    },
    balances: {
      label: "Guthaben",
    },
    warning_text:
      "Hinweis: Da diese Wallet paranoid ist, wird Ihr Ecash von dieser Mint nicht wirklich gelöscht, sondern auf Ihrem Gerät gespeichert bleiben. Sie werden ihn wieder sehen, wenn Sie diese Mint später erneut hinzufügen.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "Mint entfernen",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  PayInvoiceDialog: {
    input_data: {
      title: "Lightning bezahlen",
      inputs: {
        invoice_data: {
          label: "Lightning-Rechnung oder Adresse",
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
      amount_exact_label: "{ payee } fordert { value } { ticker } an",
      amount_range_label:
        "{ payee } fordert{br}zwischen { min } und { max } { ticker } an",
      inputs: {
        amount: {
          label: "Betrag ({ ticker }) *",
        },
        comment: {
          label: "Kommentar (optional)",
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
      title: "{ value } bezahlen",
      memo: {
        label: "Memo",
      },
      processing_info_text: "Wird verarbeitet…",
      balance_too_low_warning_text: "Guthaben zu niedrig",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        pay: {
          label: "Bezahlen",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
          error: "Fehler",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Mint bearbeiten",
    inputs: {
      nickname: {
        label: "Spitzname",
      },
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    tooltips: {
      mint_url: "Basis-URL der Mint",
      nickname: "Bezeichner für diese Mint",
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
    title: "Vertrauen Sie dieser Mint?",
    description:
      "Bevor Sie diese Mint verwenden, stellen Sie sicher, dass Sie ihr vertrauen. Mints könnten bösartig werden oder jederzeit den Betrieb einstellen.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    tooltips: {
      mint_url: "URL der hinzuzufügenden Mint",
    },
    actions: {
      cancel: {
        label: "@:global.actions.cancel.label",
      },
      add_mint: {
        label: "@:global.actions.add_mint.label",
        in_progress: "Mint wird hinzugefügt",
      },
    },
  },
  AddTierDialog: {
    helper: {
      media_preview:
        "Supported URL types: HTTPS, IPFS, YouTube, <iframe> snippets and Nostr event links. Only the embedded source URL is stored.",
    },
  },
  BucketManager: {
    tooltips: {
      description: "Buckets dienen zur Kategorisierung von Token",
    },
  },
  BucketDetail: {
    move: "Move tokens",
    send: "Send tokens",
    inputs: {
      target_bucket: {
        label: "Move to bucket",
      },
    },
    tooltips: {
      target_bucket: "Wähle einen Bucket für die Tokens",
    },
    not_found: "Bucket not found.",
  },
  MoveTokens: {
    title: "Move tokens",
    select_tokens: "Select tokens to move",
    empty: "No tokens",
    helper: "Move tokens between buckets to organize them.",
  },
  restore: {
    mnemonic_error_text: "Bitte geben Sie ein Mnemonisch ein",
    restore_mint_error_text: "Fehler beim Wiederherstellen der Mint: { error }",
    prepare_info_text: "Wiederherstellungsprozess wird vorbereitet…",
    restored_proofs_for_keyset_info_text:
      "{ restoreCounter } Nachweise für Keyset { keysetId } wiederhergestellt",
    checking_proofs_for_keyset_info_text:
      "Prüfe Nachweise { startIndex } bis { endIndex } für Keyset { keysetId }",
    no_proofs_info_text: "Keine Nachweise zum Wiederherstellen gefunden",
    restored_amount_success_text: "{ amount } wiederhergestellt",
  },
  CreatorHub: {
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
  },
  
  swap: {
    in_progress_warning_text: "Swap läuft",
    invalid_swap_data_error_text: "Ungültige Swap-Daten",
    swap_error_text: "Fehler beim Tauschen",
  },
  settings: {
    nostr: {
      signing_extension: {
        not_found: "Keine NIP-07 Signaturerweiterung gefunden",
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
  SubscriptionsOverview: {
    export_csv: "Export CSV",
    filter: {
      status: "Nach Status filtern",
      bucket: "Nach Bucket filtern",
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
  AboutPage: {
    siteOverview: {
      title: "Website-Übersicht",
      wallet: {
        description: "Verwalten Sie Ihr Ecash-Guthaben.",
        icon: "account_balance_wallet",
      },
      findCreators: {
        description: "Entdecken Sie Creator zur Unterstützung.",
        icon: "img:icons/find-creators.svg",
      },
      
      myProfile: {
        description: "Sehen und bearbeiten Sie Ihr Profil.",
        icon: "person",
      },
      buckets: {
        description: "Organisieren Sie Mittel in Buckets.",
        icon: "inventory_2",
      },
      subscriptions: {
        description: "Verwalten Sie Ihre Abonnements.",
        icon: "auto_awesome_motion",
      },
      nostrMessengerTitle: "Nostr Messenger",
      nostrMessenger: {
        description: "Chatten Sie privat mit Nostr.",
        icon: "chat",
      },
      settings: {
        description: "Konfigurieren Sie die App.",
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
      status: "Status",
      tier: "Tier",
      sort: "Sort",
      clear: "Clear",
      apply: "Apply",
      sortOptions: {
        next: "Next renewal",
        first: "First seen",
        amount: "Lifetime sats",
      },
    },
    columns: {
      subscriber: "Subscriber",
      tier: "Tier",
      frequency: "Freq",
      status: "Status",
      amount: "Amount",
      nextRenewal: "Next renewal",
      lifetime: "Lifetime",
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
      retry: "Retry",
      clear: "Clear",
      openDetails: "Open details",
    },
    toolbar: {
      searchPlaceholder: "Search",
      frequency: "Frequency",
      status: "Status",
      tier: "Tier",
      sort: "Sort",
      tableView: "Table view",
      cardView: "Card view",
      comfortable: "Comfortable",
      compact: "Compact",
      exportCsv: "Export CSV",
    },
    status: {
      any: "Any",
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
      lifetimeRevenue: "Lifetime revenue",
      thisPeriod: "This period",
      thisWeek: "this week",
      thisMonth: "this month",
      nextWeek: "Next week",
      nextMonth: "Next month",
    },
    charts: {
      frequency: "Frequency",
      status: "Status",
      newSubs: "New subs",
      revenueOverTime: "Revenue over time",
      frequencyMix: "Frequency mix",
      statusByFrequency: "Status by frequency",
      revenueSummary: "Total revenue {total} sat",
      frequencySummary:
        "Weekly: {weekly}, Bi-weekly: {biweekly}, Monthly: {monthly}",
      statusSummary:
        "Weekly - Active {weeklyActive}, Pending {weeklyPending}, Ended {weeklyEnded}; Bi-weekly - Active {biweeklyActive}, Pending {biweeklyPending}, Ended {biweeklyEnded}; Monthly - Active {monthlyActive}, Pending {monthlyPending}, Ended {monthlyEnded}",
    },
    renewalProgress: "Renewal progress",
    tabs: {
      all: "All",
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
      activity: "Activity",
    },
  },
  SubscriberDrawer: {
    tabs: {
      overview: "Overview",
      payments: "Payments",
      notes: "Notes",
    },
    actions: {
      dm: "DM",
      copyNpub: "Copy npub",
      copyLud16: "Copy lud16",
      openProfile: "Profile",
      cancel: "Cancel",
    },
    notifications: {
      note_saved: "Note saved",
      note_save_failed: "Failed to save note",
    },
  },
};
