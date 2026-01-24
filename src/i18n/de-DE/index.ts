export default {
  MultinutPicker: {
    payment: "Multinut-Zahlung",
    selectMints:
      "Wählen Sie eine oder mehrere Mints aus, um eine Zahlung auszuführen.",
    totalSelectedBalance: "Gesamtes ausgewähltes Guthaben",
    multiMintPay: "Multi-Mint-Zahlung",
    balanceNotEnough:
      "Das Multi-Mint-Guthaben reicht nicht aus, um diese Rechnung zu begleichen",
    failed: "Verarbeitung fehlgeschlagen: {error}",
    paid: "{amount} über Lightning bezahlt",
  },

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
        mint_validation_error: "Mint-Validierungsfehler",
        removed: "Mint entfernt",
        error: "Mint-Fehler",
      },
    },
  },
  MainHeader: {
    menu: {
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
      nostr: {
        title: "NOSTR",
        relays: {
          expand_label: "Klicken, um Relays zu bearbeiten",
          add: {
            title: "Relay hinzufügen",
            description:
              "Ihre Wallet verwendet diese Relays für Nostr‑Operationen wie Zahlungsanforderungen, Nostr Wallet Connect und Backups.",
          },
          list: {
            title: "Relays",
            description: "Ihre Wallet verbindet sich mit diesen Relays.",
            copy_tooltip: "Relay kopieren",
            remove_tooltip: "Relay entfernen",
          },
        },
      },
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
      npc_v2: {
        choose_mint_title: "Wählen Sie eine Mint für npub.cash v2",
        choose_mint_placeholder: "Wählen Sie eine Mint...",
      },
    },
    web_of_trust: {
      title: "Vertrauensnetzwerk",
      known_pubkeys: "Bekannte Pubkeys: {wotCount}",
      continue_crawl: "Crawl fortsetzen",
      crawl_odell: "ODELL'S WEB OF TRUST crawlen",
      crawl_wot: "Web of Trust crawlen",
      pause: "Pausieren",
      reset: "Zurücksetzen",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      use_npubx: "npubx.cash verwenden",
      copy_lightning_address: "Lightning-Adresse kopieren",
      v2_mint: "npub.cash v2 Mint",
    },
    multinut: {
      use_multinut: "Multinut verwenden",
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
          title: "Binary",
          description: "Token als Binärdaten speichern",
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
        currency: {
          title: "Fiat-Währung",
          description:
            "Wählen Sie die Fiat-Währung für die Bitcoin-Preisanzeige.",
        },
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
      auditor: {
        toggle: "Auditor aktivieren",
        badge: "Beta",
        description:
          "Wenn aktiviert, zeigt die Wallet Auditor-Informationen im Dialog 'Mint-Details' an. Der Auditor ist ein Drittanbieter-Service, der die Zuverlässigkeit von Mints überwacht.",
        url_label: "Auditor URL",
        api_url_label: "Auditor API URL",
      },
      multinut: {
        toggle: "Multinut aktivieren",
        description:
          "Wenn aktiviert, verwendet die Wallet Multinut, um Rechnungen von mehreren Mints gleichzeitig zu bezahlen.",
      },
      nostr_mint_backup: {
        toggle: "Mint-Liste auf Nostr sichern",
        description:
          "Wenn aktiviert, wird Ihre Mint-Liste automatisch auf Nostr-Relays mit Ihren konfigurierten Nostr-Schlüsseln gesichert. Dies ermöglicht es Ihnen, Ihre Mint-Liste auf verschiedenen Geräten wiederherzustellen.",
        notifications: {
          enabled: "Nostr-Mint-Backup aktiviert",
          disabled: "Nostr-Mint-Backup deaktiviert",
          failed: "Fehler beim Aktivieren des Nostr-Mint-Backups",
        },
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
        },
      },
      bip177: {
        title: "Bitcoin-Symbol",
        description: "Verwenden Sie das ₿-Symbol anstelle von sats.",
        toggle: "₿-Symbol verwenden",
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
          counter: "Zähler: {count}",
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
    text: "Ups. Nichts gefunden…",
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
    alt: { pwa_example: "PWA Installationsbeispiel" },
    installing: "Installiere…",
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
        nextSteps:
          "Sie können nun diesen Tab schließen und die App vom Startbildschirm öffnen.",
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
  WelcomeSlideChoice: {
    title: "Richten Sie Ihre Wallet ein",
    text: "Möchten Sie aus einer Seed-Phrase wiederherstellen oder eine neue Wallet erstellen?",
    options: {
      new: {
        title: "Neue Wallet erstellen",
        subtitle: "Neue Seed erzeugen und Mints hinzufügen.",
      },
      recover: {
        title: "Wallet wiederherstellen",
        subtitle: "Seed-Phrase eingeben, Mints und Ecash wiederherstellen.",
      },
    },
  },
  WelcomeMintSetup: {
    title: "Mints hinzufügen",
    text: "Mints sind Server, die beim Senden und Empfangen von Ecash helfen. Wählen Sie eine gefundene Mint oder fügen Sie manuell eine hinzu. Sie können dies auch später tun.",
    sections: { your_mints: "Ihre Mints" },
    restoring: "Mints werden wiederhergestellt…",
    placeholder: { mint_url: "https://" },
  },
  WelcomeRecoverSeed: {
    title: "Seed-Phrase eingeben",
    text: "Fügen Sie Ihre 12 Wörter ein oder tippen Sie sie ein, um wiederherzustellen.",
    inputs: { word: "Wort { index }" },
    actions: { paste_all: "Alle einfügen" },
    disclaimer:
      "Ihre Seed-Phrase wird nur lokal verwendet, um Ihre Wallet-Schlüssel abzuleiten.",
  },
  WelcomeRestoreEcash: {
    title: "Ihr Ecash wiederherstellen",
    text: "Scannen Sie nach nicht ausgegebenen Nachweisen auf Ihren konfigurierten Mints und fügen Sie sie Ihrer Wallet hinzu.",
  },
  MintRatings: {
    title: "Mint-Bewertungen",
    reviews: "Bewertungen",
    ratings: "Bewertungen",
    no_reviews: "Keine Bewertungen gefunden",
    your_review: "Ihre Bewertung",
    no_reviews_to_display: "Keine Bewertungen anzuzeigen.",
    no_rating: "Keine Bewertung",
    out_of: "von",
    rows: "Reviews",
    sort: "Sortieren",
    sort_options: {
      newest: "Neueste",
      oldest: "Älteste",
      highest: "Höchste",
      lowest: "Niedrigste",
    },
    actions: { write_review: "Bewertung schreiben" },
    empty_state_subtitle:
      "Helfen Sie, indem Sie eine Bewertung hinterlassen. Teilen Sie Ihre Erfahrungen mit diesem Mint und helfen Sie anderen, indem Sie eine Bewertung hinterlassen.",
  },
  CreateMintReview: {
    title: "Mint bewerten",
    publishing_as: "Veröffentlichen als",
    inputs: {
      rating: { label: "Bewertung" },
      review: { label: "Rezension (optional)" },
    },
    actions: {
      publish: { label: "Veröffentlichen", in_progress: "Veröffentlichen…" },
    },
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
      select_all: {
        label: "Alle auswählen",
      },
      deselect_all: {
        label: "Alle abwählen",
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
      restore_selected_mints: {
        label: "Ausgewählte Mints wiederherstellen ({count})",
        in_progress: "Mint { index } von { length } wird wiederhergestellt…",
        success: "{count} Mint(s) erfolgreich wiederhergestellt",
        error: "Fehler beim Wiederherstellen ausgewählter Mints: { error }",
      },
    },
    nostr_mints: {
      label: "Mints von Nostr wiederherstellen",
      caption:
        "Suchen Sie nach Mint-Backups, die auf Nostr-Relays mit Ihrer Seed-Phrase gespeichert sind. Dies hilft Ihnen, Mints zu entdecken, die Sie zuvor verwendet haben.",
      search_button: "Nach Mint-Backups suchen",
      select_all: "Alle auswählen",
      deselect_all: "Alle abwählen",
      backed_up: "Gesichert",
      already_added: "Bereits hinzugefügt",
      add_selected: "Ausgewählte hinzufügen ({count})",
      no_backups_found: "Keine Mint-Backups gefunden",
      no_backups_hint:
        "Stellen Sie sicher, dass das Nostr-Mint-Backup in den Einstellungen aktiviert ist, um Ihre Mint-Liste automatisch zu sichern.",
      invalid_mnemonic:
        "Bitte geben Sie eine gültige Seed-Phrase ein, bevor Sie suchen.",
      search_error: "Fehler bei der Suche nach Mint-Backups.",
      add_error: "Fehler beim Hinzufügen ausgewählter Mints.",
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
          "Diese Mints wurden von anderen Nostr-Benutzern empfohlen. Seien Sie vorsichtig und recherchieren Sie selbst, bevor Sie eine Mint verwenden.",
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
    error_badge: "Fehler",
    reviews_text: "Bewertungen",
    no_reviews_yet: "Noch keine Bewertungen",
    discover_mints_button: "Mints entdecken",
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
    title: "Lightning empfangen",
    create_invoice_title: "Rechnung erstellen",
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
    title: "Ecash senden",
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
      share: {
        tooltip_text: "Ecash teilen",
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
    title: "Ecash empfangen",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "Cashu Token einfügen",
      },
    },
    errors: {
      invalid_token: {
        label: "Ungültiger Token",
      },
      p2pk_lock_mismatch: {
        label:
          "Kann nicht empfangen werden. Die P2PK-Sperre dieses Tokens stimmt nicht mit Ihrem öffentlichen Schlüssel überein.",
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
        label: "Später empfangen",
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
  ParseInputComponent: {
    placeholder: {
      default: "Cashu Token oder Lightning-Adresse",
      receive: "Cashu Token",
      pay: "Lightning-Adresse oder Rechnung",
    },
    qr_scanner: {
      title: "QR-Code scannen",
      description: "Tippen Sie, um eine Adresse zu scannen",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
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
      sending_to_lightning_address: "Senden an { address }",
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
      paying: "Wird bezahlt",
      paid: "Bezahlt",
      fee: "Gebühr",
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
  swap: {
    in_progress_warning_text: "Swap läuft",
    invalid_swap_data_error_text: "Ungültige Swap-Daten",
    swap_error_text: "Fehler beim Tauschen",
  },
  TokenInformation: {
    fee: "Gebühr",
    unit: "Einheit",
    fiat: "Fiat",
    p2pk: "P2PK",
    locked: "Gesperrt",
    locked_to_you: "An dich gesperrt",
    mint: "Münzstätte",
    memo: "Notiz",
    payment_request: "Zahlungsanforderung",
    nostr: "Nostr",
    token_copied: "Token in Zwischenablage kopiert",
  },
};
