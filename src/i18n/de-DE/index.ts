export default {
  MultinutPicker: {
    dialog_title: "Multinut-Zahlung",
    pay_using_multiple: "Mit mehreren Mints bezahlen",
    experimental_title: "Experimentelle Funktion",
    experimental_text:
      "Diese Funktion ist sehr experimentell und funktioniert möglicherweise nicht wie erwartet. Versuche nicht, eine bereits bezahlte Rechnung erneut zu bezahlen. Du könntest Guthaben verlieren.",
    understand: "Verstanden",
    select_funds:
      "Wähle Guthaben aus mehreren Mints, um die Zahlung auszuführen.",
    pay_invoice: "Rechnung bezahlen",
    amount_mismatch:
      "Fehler bei der Betragsberechnung: {calculated} statt {expected}",
    states: {
      requesting: "Wird angefragt...",
      paying: "Wird bezahlt...",
      success: "Erfolgreich",
      failed: "Fehlgeschlagen",
    },
    payment: "Multinut-Zahlung",
    selectMints:
      "Wählen Sie eine oder mehrere Mints aus, um eine Zahlung auszuführen.",
    totalSelectedBalance: "Ausgewähltes Gesamtguthaben",
    multiMintPay: "Mit mehreren Mints zahlen",
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
      pay: { label: "Bezahlen" },
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
      trying_again: "Wird erneut versucht...",
      unsupported_legacy_qr: "Nicht unterstützter alter QR-Code",
      legacy_qr_not_supported:
        "Dieser alte QR-Code stammt nicht von einem unterstützten Händler",
      no_bolt12_mint: "Keine Ihrer Mints unterstützt BOLT12-Angebote",
      no_bolt11_mint: "Keine Ihrer Mints unterstützt BOLT11-Rechnungen",
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
          caption: "Dem stimmen Sie mit der Nutzung von Cashu.me zu",
        },
      },
      links: {
        title: "Links",
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
    menu: {
      title: "Einstellungen",
      backup: {
        title: "Sichern & Wiederherstellen",
        caption: "Seed-Phrase und Ecash-Wiederherstellung",
      },
      lightning_address: {
        title: "Lightning-Adresse",
        caption: "Zahlungen an name@domain empfangen",
      },
      nostr: {
        title: "Nostr",
        caption: "Schlüssel, Relays und Web of Trust",
      },
      payment_requests: {
        title: "Zahlungsanforderungen",
        caption: "Ecash-Zahlungen über Nostr empfangen",
      },
      nwc: {
        title: "Nostr Wallet Connect",
        caption: "Wallet aus anderen Apps verwenden",
      },
      hardware: {
        title: "Hardware",
        caption: "NFC-Einstellungen",
      },
      p2pk: {
        title: "Gesperrtes Ecash",
        caption: "Ecash empfangen, das nur Ihr Schlüssel entsperren kann",
      },
      privacy: {
        title: "Privatsphäre",
        caption: "Netzwerkprüfungen und Bitcoin-Kurs",
      },
      experimental: {
        title: "Experimentell",
        caption: "Neue Funktionen früher ausprobieren",
      },
      appearance: {
        title: "Aussehen",
        caption: "Design, Tastatur und Bitcoin-Symbol",
      },
      language: {
        title: "Sprache",
        caption: "Wähle deine Sprache",
      },
      advanced: {
        title: "Erweitert",
        caption: "Entwicklerwerkzeuge und Wallet-Reset",
      },
      about: {
        title: "Über",
        caption: "Nutzungsbedingungen und Links",
      },
    },
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
          already_added: "Relay bereits hinzugefügt",
          expand_label: "Klicken, um Relays zu bearbeiten",
          add: {
            title: "Relay hinzufügen",
            description:
              "Ihre Wallet nutzt diese Relays für Nostr-Funktionen wie Zahlungsanforderungen, Nostr Wallet Connect und Backups.",
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
          "Ecash aus einer anderen Seed-Phrase wiederherstellen. Ihre aktuelle Seed-Phrase bleibt unverändert.",
        button: "Wiederherstellen",
      },
    },
    lightning_address: {
      server_url: {
        label: "npub.cash-Hostname",
        hint: "Gib einen Hostnamen oder eine HTTPS-URL ein",
        invalid: "Gib eine gültige HTTPS-Server-URL ein",
      },
      title: "Lightning Adresse",
      description: "Zahlungen an Ihre Lightning Adresse empfangen.",
      enable: {
        toggle: "Lightning-Adresse verwenden",
        description: "Zahlungen an eine Adresse von npub.cash empfangen",
      },
      address: {
        copy_tooltip: "Lightning Adresse kopieren",
      },
      show_on_receive: {
        toggle: "Beim Empfangen anzeigen",
        description: "Adresse und QR-Code anzeigen.",
      },
      automatic_claim: {
        toggle: "Automatisch beanspruchen",
        description: "Eingehende Zahlungen automatisch empfangen.",
      },
      mint: {
        label: "npub.cash Mint",
        choose_title: "Wählen Sie eine Mint für npub.cash",
        choose_placeholder: "Wählen Sie eine Mint...",
      },
    },
    web_of_trust: {
      title: "Vertrauensnetzwerk",
      known_pubkeys: "Bekannte öffentliche Schlüssel: {wotCount}",
      continue_crawl: "Crawl fortsetzen",
      crawl_odell: "Odells Web of Trust importieren",
      crawl_wot: "Web of Trust crawlen",
      pause: "Pausieren",
      reset: "Zurücksetzen",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      copy_lightning_address: "Lightning-Adresse kopieren",
    },
    multinut: {
      use_multinut: "Zahlungen aus mehreren Mints",
    },
    nostr_keys: {
      title: "Ihre Nostr-Schlüssel",
      description: "Ihre Nostr-Schlüssel bestimmen Ihre Lightning-Adresse.",
      wallet_seed: {
        title: "Wallet Seed-Phrase",
        description: "Ein Nostr-Schlüsselpaar aus Ihrem Wallet-Seed erzeugen",
        copy_nsec: "Privaten Schlüssel kopieren",
      },
      nsec_bunker: {
        title: "Externer Signierer",
        description: "Mit einem NIP-46-Bunker signieren",
        delete_tooltip: "Verbindung löschen",
      },
      use_nsec: {
        title: "Eigenen privaten Schlüssel verwenden",
        description:
          "Fügen Sie Ihren privaten Nostr-Schlüssel (nsec) in diese Wallet ein. Nicht empfohlen.",
        delete_tooltip: "Privaten Schlüssel löschen",
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
        "Zahlungen über Nostr empfangen. Wenn aktiv, lauscht Ihre Wallet auf Ihren Nostr-Relays.",
      enable_toggle: "Zahlungsanforderungen aktivieren",
      claim_automatically: {
        toggle: "Automatisch beanspruchen",
        description:
          "Eingehende Zahlungen ohne Nachfrage Ihrem Guthaben hinzufügen. Wenn aus, nehmen Sie jede selbst an.",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Wallet Connect (NWC)",
      description:
        "Erlaubt anderen Apps, über Nostr Wallet Connect aus dieser Wallet zu bezahlen.",
      enable_toggle: "Nostr Wallet Connect aktivieren",
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
        title: "NFC-Kartenformat",
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
            "Fügt dem Bildschirm „Ecash empfangen“ eine NFC-Schaltfläche zum Scannen von Karten hinzu.",
        },
      },
    },
    p2pk_features: {
      title: "Gesperrtes Ecash",
      description:
        "Experimentell. Nur kleine Beträge verwenden: Wenn Sie den privaten Schlüssel verlieren, kann niemand das damit gesperrte Ecash entsperren.",
      generate_button: "Schlüssel generieren",
      import_button: "Privaten Schlüssel importieren",
      quick_access: {
        toggle: "Sperrschlüssel beim Empfangen zeigen",
        description:
          "Zeigt Ihren Sperrschlüssel im Bildschirm „Ecash empfangen“, damit Absender Ecash für Sie sperren können.",
      },
      keys_expansion: {
        label: "Klicken, um {count} Schlüssel zu durchsuchen",
        used_badge: "verwendet",
      },
    },
    privacy: {
      title: "Datenschutz",
      network_title: "Netzwerkabfragen",
      description: "Diese Einstellungen beeinflussen Ihren Datenschutz.",
      check_incoming: {
        toggle: "Eingehende Rechnung prüfen",
        description:
          "Prüft Ihre neueste Rechnung im Hintergrund. Schnellere Updates, aber leichteres Fingerprinting.",
      },
      check_startup: {
        toggle: "Ausstehende Rechnungen beim Start prüfen",
        description: "Prüft ausstehende Rechnungen beim Öffnen der Wallet.",
      },
      check_all: {
        toggle: "Alle Rechnungen prüfen",
        description:
          "Prüft unbezahlte Rechnungen bis zu zwei Wochen lang im Hintergrund. Mehr Online-Aktivität erleichtert Fingerprinting.",
      },
      check_sent: {
        toggle: "Gesendeten Ecash prüfen",
        description:
          "Prüft im Hintergrund, ob gesendetes Ecash eingelöst wurde. Mehr Online-Aktivität erleichtert Fingerprinting.",
      },
      websockets: {
        toggle: "WebSockets verwenden",
        description:
          "Hält eine Live-Verbindung zu Mints für sofortige Zahlungsupdates. Schneller, aber leichteres Fingerprinting.",
      },
      bitcoin_price: {
        title: "Bitcoin-Kurs",
        toggle: "Wechselkurs von Coinbase abrufen",
        description:
          "Ruft den Bitcoin-Kurs von coinbase.com ab, um Ihr Guthaben in Fiat anzuzeigen.",
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
          "Bietet an, empfangenes Ecash zu Ihrer aktiven Mint zu tauschen.",
      },
      auto_paste: {
        toggle: "Ecash automatisch einfügen",
        description:
          "Fügt Ecash aus der Zwischenablage ein, wenn Sie „Ecash empfangen“ öffnen. Deaktivieren, falls es unter iOS Anzeigefehler verursacht.",
      },
      auditor: {
        toggle: "Auditor aktivieren",
        badge: "Beta",
        description:
          "Zeigt Zuverlässigkeitsdaten eines unabhängigen Mint-Auditors in den Mint-Details.",
        url_label: "Auditor URL",
        api_url_label: "Auditor API URL",
      },
      multinut: {
        toggle: "Multinut aktivieren",
        description: "Bezahlt Rechnungen aus mehreren Mints gleichzeitig.",
      },
      nostr_mint_backup: {
        toggle: "Mint-Liste auf Nostr sichern",
        description:
          "Sichert Ihre Mint-Liste auf Ihren Nostr-Relays, damit Sie sie auf einem anderen Gerät wiederherstellen können.",
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
          "Verwendet den Ziffernblock zur Eingabe von Beträgen.",
      },
      theme: {
        title: "Design",
        description: "Ändern Sie das Aussehen Ihrer Wallet.",
        tooltips: {
          mono: "Mono",
          cyber: "Cyber",
          freedom: "Freiheit",
          nostr: "Nostr",
          bitcoin: "Bitcoin",
          mint: "Minze",
          nut: "Nuss",
          blu: "Blau",
          flamingo: "Flamingo",
        },
      },
      bip177: {
        title: "Bitcoin-Symbol",
        description: "Beträge als ₿2.789 statt 2.789 sats anzeigen.",
        toggle: "₿-Symbol verwenden",
      },
    },
    advanced: {
      notifications: {
        reserved_unset: "Alle reservierten Proofs freigegeben",
        removed_spent: "{count} ausgegebene Proofs entfernt",
        no_spent: "Keine ausgegebenen Proofs gefunden",
        invalid_backup: "Ungültiges Format der Sicherungsdatei",
        read_error: "Fehler beim Lesen der Datei",
      },
      title: "Erweitert",
      developer: {
        title: "Entwickler-Einstellungen",
        description: "Werkzeuge zur Fehlersuche und Fehlerbehebung.",
        new_seed: {
          button: "Neue Seed-Phrase generieren",
          description:
            "Erstellt eine neue Seed-Phrase. Senden Sie Ihr Guthaben danach an sich selbst, damit der neue Seed es wiederherstellen kann.",
          confirm_question:
            "Sind Sie sicher, dass Sie eine neue Seed-Phrase generieren möchten?",
          cancel: "Abbrechen",
          confirm: "Bestätigen",
        },
        remove_spent: {
          button: "Ausgegebene Nachweise entfernen",
          description:
            "Entfernt Ecash, das Ihre aktiven Mints als ausgegeben melden. Nur verwenden, wenn Ihre Wallet hängt.",
        },
        debug_console: {
          button: "Debug-Konsole",
          description:
            "Öffnet die JavaScript-Konsole. Fügen Sie nie Code ein, den Sie nicht verstehen; Betrüger nutzen sie, um Geld zu stehlen.",
        },
        export_proofs: {
          button: "Aktive Nachweise exportieren",
          description:
            "Kopiert das Guthaben der aktiven Mint in der gewählten Einheit als ein Ecash-Token.",
        },
        keyset_counters: {
          title: "Keyset-Zähler erhöhen",
          description:
            "Tippen Sie auf ein Keyset, um seinen Zähler zu erhöhen. Hilft beim Fehler „outputs have already been signed“.",
          counter: "Zähler: {count}",
        },
        unset_reserved: {
          button: "Alle reservierten Token freigeben",
          description:
            "Gibt für ausstehende Sendungen reserviertes Ecash wieder frei. Führen Sie danach „Ausgegebene Nachweise entfernen“ aus.",
        },
        show_onboarding: {
          button: "Onboarding anzeigen",
          description: "Zeigen Sie den Onboarding-Bildschirm erneut an.",
        },
        reset_wallet: {
          button: "Wallet-Daten zurücksetzen",
          description:
            "Löscht alle Wallet-Daten auf diesem Gerät. Exportieren Sie vorher ein Backup.",
          confirm_question:
            "Sind Sie sicher, dass Sie Ihre Wallet-Daten löschen möchten?",
          cancel: "Abbrechen",
          confirm: "Wallet löschen",
        },
        export_wallet: {
          button: "Wallet-Daten exportieren",
          description:
            "Lädt eine Backup-Datei herunter, die Sie im Willkommensbildschirm importieren können. Sie veraltet, wenn Sie die Wallet weiter nutzen.",
        },
        import_wallet: {
          description:
            "Ersetzt die Daten dieser Wallet durch eine exportierte Backup-Datei.",
          button: "Wallet-Backup importieren",
          confirm_question:
            "Möchten Sie Ihre Wallet-Daten wirklich wiederherstellen?",
          cancel: "Abbrechen",
          confirm: "WALLET-BACKUP IMPORTIEREN",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Mint hinzufügen",
    subtitle:
      "Mints geben das Ecash aus, das diese Wallet verwahrt. Fügen Sie eine Mint hinzu oder empfangen Sie Ecash von einer, um zu starten.",
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
    title: "Cashu.me ist in einem anderen Tab geöffnet",
    text: "Schließen Sie den anderen Tab und tippen Sie dann auf „Erneut versuchen“.",
    actions: {
      retry: {
        label: "Erneut versuchen",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Diese Seite gibt es nicht",
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
    terms_agreement: "Wenn du fortfährst, stimmst du den {terms} zu",
    title: "Willkommen bei Cashu.me",
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
    title: "Cashu.me installieren",
    alt: { pwa_example: "Beispiel für die PWA-Installation" },
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
        text: "Schließen Sie nach der Installation diesen Browser-Tab und öffnen Sie Cashu.me über Ihren Startbildschirm.",
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
    english_only: "Der Rechtstext ist nur auf Englisch verfügbar.",
    title: "Nutzungsbedingungen",
    actions: {
      more: {
        label: "Bitte vor der Nutzung von Cashu.me lesen",
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
    web_of_trust_hop: "In deinem Vertrauensnetz (Hop {hop})",
    no_mint_url: "Keine Mint-URL angegeben",
    title: "Mint-Bewertungen",
    reviews: "Bewertungen",
    ratings: "{n} Bewertung | {n} Bewertungen",
    no_reviews: "Noch keine Bewertungen",
    your_review: "Ihre Bewertung",
    no_reviews_to_display: "Keine Bewertungen anzuzeigen.",
    no_rating: "Keine Bewertung",
    stars_label: "{rating} von 5 Sternen",
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
      "Geben Sie die erste Bewertung für diese Mint ab. Ihre Erfahrung hilft anderen bei der Wahl.",
    range: "{from}–{to} von {total}",
  },
  CreateMintReview: {
    connect_nostr:
      "Bitte verbinde in den Einstellungen ein Nostr-Konto, um eine Bewertung zu veröffentlichen.",
    published: "Bewertung veröffentlicht",
    publish_failed: "Bewertung konnte nicht veröffentlicht werden",
    title: "Mint bewerten",
    publishing_as: "Veröffentlichen als",
    inputs: {
      rating: { label: "Bewertung" },
      review: { label: "Rezension (optional)" },
    },
    actions: {
      publish: {
        label: "Bewertung veröffentlichen",
        in_progress: "Wird veröffentlicht…",
      },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "Aus Seed-Phrase wiederherstellen",
      caption:
        "Fügen Sie vor der Wiederherstellung jede Mint hinzu, die Sie mit diesem Seed genutzt haben.",
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
        "Wählen Sie die Mints zur Wiederherstellung. Fehlende Mints zuerst im Tab „Mints“ hinzufügen.",
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
        label: "Auswahl aufheben",
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
      label: "Mints aus Nostr wiederherstellen",
      caption:
        "Suchen Sie nach Mint-Backups, die auf Nostr-Relays mit Ihrer Seed-Phrase gespeichert sind. Dies hilft Ihnen, Mints zu entdecken, die Sie zuvor verwendet haben.",
      search_button: "Nach Mint-Backups suchen",
      select_all: "Alle auswählen",
      deselect_all: "Auswahl aufheben",
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
      caption: "Mints, die andere auf Nostr empfehlen.",
      actions: {
        discover: {
          label: "Mints entdecken",
          in_progress: "Lädt…",
          error_no_mints: "Keine Mints gefunden",
          success: "{ length } Mints gefunden",
        },
      },
      unnamed: "Mint ohne Namen",
      empty: {
        title: "Eine Mint finden",
        text: "Cashu.me fragt Nostr-Relays nach Mints, die andere empfehlen, mit Bewertungen und Rezensionen.",
      },
      recommendations: {
        overline: "{ length } Mints gefunden",
        caption: "Prüfe eine Mint selbst, bevor du sie nutzt.",
        actions: {
          browse: {
            label: "Klicken, um Mints zu durchsuchen",
          },
        },
      },
    },
    swap: {
      title: "Tauschen",
      overline: "Tausch zwischen Mints",
      caption:
        "Guthaben über Lightning zwischen Ihren Mints verschieben. Es können Gebühren anfallen.",
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
        receove_to_trusted_mint: {
          label: "Auf vertrauenswürdige Mint empfangen",
        },
      },
    },
    error_badge: "Fehler",
    reviews_text: "Bewertung | Bewertungen",
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
        label_blocked: "Rechnung wird erstellt",
        in_progress: "Erstellt",
      },
    },
    invoice: {
      caption: "Lightning Rechnung",
      status_paid_text: "Bezahlt",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        copy: {
          label: "Rechnung kopieren",
        },
      },
    },
  },
  SendDialog: {
    captions: {
      ecash: "Token oder QR-Code teilen",
      lightning: "Rechnung oder Adresse bezahlen",
      onchain: "An eine Bitcoin-Adresse senden",
    },
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
    badge_locked: "gesperrt",
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
        label: "Ecash kopieren",
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
        in_progress: "Wird gesendet…",
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
      pay: { label: "@:global.actions.pay.label" },
    },
    errors: {
      amount_required: "Geben Sie zuerst einen Betrag ein.",
      serialization_failed: "Ecash-Token konnte nicht erstellt werden.",
      mint_not_allowed_by_request:
        "Die ausgewählte Mint wird von dieser Zahlungsanforderung nicht akzeptiert.",
    },
  },
  ReceiveDialog: {
    captions: {
      ecash: "Token einfügen, scannen oder anfordern",
      lightning: "Rechnung erstellen und bezahlt werden",
      onchain: "Bitcoin-Adresse erhalten",
    },
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
    receiving_amount: "Empfange {amount}",
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
        processing: "Tausch läuft…",
        failed: "Tausch fehlgeschlagen",
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
      receive_to_selected_mint: { label: "Auf ausgewählte Mint empfangen" },
    },
    unknown_mint_info_text:
      "Unbekannte Mint. Sie wird hinzugefügt, nachdem Sie diesen Token empfangen haben.",
    swap_section: {
      title: "Tauschen",
      source_label: "Von",
      destination_label: "Nach",
      fee_info: "Für diesen Tausch fallen Lightning-Netzwerkgebühren an.",
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "Sperrschlüssel",
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
    received_total: "Insgesamt empfangen",
    no_payments_yet: "Noch keine Zahlungen",
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
    title: "Nachricht der Mint",
  },
  MintDetailsDialog: {
    qr: {
      show: "QR-Code anzeigen",
      hide: "QR-Code ausblenden",
    },
    contact: {
      title: "Kontakt",
    },
    details: {
      title: "Mint Details",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Unterstützte NUTs",
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
        label: "Einheit",
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
    available_text: "bei dieser Mint",
    sheet_title: "Mint auswählen",
    placeholder: "Mint auswählen",
  },
  HistoryTable: {
    empty_text: "Noch kein Verlauf vorhanden",
    row: {
      type_label: "Ecash",
      date_label: "Vor { value }",
    },
    actions: {
      filter_ecash_only: {
        label: "Nur Ecash",
      },
      check_status: {
        tooltip_text: "Status prüfen",
      },
      receive: {
        tooltip_text: "Empfangen",
      },
      filter_pending: {
        label: "Nur ausstehende zeigen",
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
        label: "Nur ausstehende zeigen",
      },
      show_all: {
        label: "Alle anzeigen",
      },
    },
  },
  RemoveMintDialog: {
    title: "Diese Mint entfernen?",
    nickname: {
      label: "Spitzname",
    },
    balances: {
      label: "Guthaben",
    },
    warning_text:
      "Ihr Ecash von dieser Mint bleibt auf diesem Gerät. Es erscheint wieder, wenn Sie die Mint erneut hinzufügen.",
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
      description: "Richten Sie die Kamera auf einen QR-Code",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    onchain: {
      title: "On-Chain bezahlen",
      address_placeholder: "Bitcoin-Adresse",
      choose_speed: "Bestätigungsgeschwindigkeit wählen",
      blocks: "{n} Block | {n} Blöcke",
      estimated_confirmation: "Geschätzte Bestätigung",
      fee_reserve: "Gebührenreserve",
    },
    multinut: {
      label: "Mit mehreren Mints bezahlen",
    },
    quote: {
      label: "Angebot",
    },
    input_data: {
      title: "Mit Lightning bezahlen",
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
      title_bolt12: "Lightning-Angebot bezahlen",
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
          waiting_for_wallet: "Warte auf Wallet…",
          error: "Fehler",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Mint bearbeiten",
    inputs: {
      nickname: {
        placeholder: "z. B. Testnet",
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
      "Treten Sie dieser Mint nur bei, wenn Sie ihr vertrauen. Stellt sie den Betrieb ein, ist Ihr Ecash bei ihr verloren.",
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
    audit_info: {
      label: "Audit-Infos",
      actions: {
        show: {
          label: "Anzeigen",
        },
        hide: {
          label: "Ausblenden",
        },
      },
    },
    unreachable_error_text:
      "Diese Mint ist nicht erreichbar. Prüfen Sie die URL und Ihre Verbindung und versuchen Sie es erneut.",
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
  common: {
    copied: "Kopiert",
    on_chain: "On-Chain",
    pending: "Ausstehend",
    delete: "Löschen",
    copy_npub: "npub kopieren",
    back: "Zurück",
    refresh: "Aktualisieren",
    settings: "Einstellungen",
    backspace: "Rücktaste",
    swap_input_mode: "Zwischen Betrag und Fiat wechseln",
    fee: "Gebühr",
  },
  SendPaymentRequest: {
    actions: {
      pay: { label: "Bezahlen" },
      pay_via: { label: "Über {transport} bezahlen" },
    },
    info: {
      pay_failed: "Anfrage konnte nicht bezahlt werden",
      pay_to: "An {target} zahlen",
      invalid_url: "Ungültige URL",
    },
  },
  PaymentRequestInfo: {
    title_with_transport: "Zahlungsanforderung über {transport}",
    title: "Zahlungsanforderung",
    subtitle: "An {target} zahlen",
    subtitle_fallback: "Zahlungsanforderung",
    invalid_url: "Ungültige URL",
  },
  QuoteInformation: {
    amount: "Betrag",
    fee_reserve: "Gebührenreserve",
    fee_paid: "Gezahlte Gebühr",
    unit: "Einheit",
    status: "Status",
    network: "Netzwerk",
    transaction_id: "Transaktions-ID",
    chain_status: "Status auf der Chain",
    fetching: "Wird abgerufen",
    paid_at: "Bezahlt am",
    preimage: "Preimage",
    preimage_copied: "Preimage kopiert",
    mint: "Mint",
    method: "Methode",
    lightning_offer: "Lightning-Angebot",
    chain_confirmed: "Bestätigt",
    chain_pending: "Ausstehend",
    states: {
      paid: "Bezahlt",
      unpaid: "Unbezahlt",
      pending: "Ausstehend",
      issued: "Ausgegeben",
      expired: "Abgelaufen",
      failed: "Fehlgeschlagen",
    },
  },
  MintAuditInfo: {
    title: "Audit-Infos",
    loading: "Audit-Infos werden geladen...",
    not_audited: "Diese Mint wurde noch nicht geprüft.",
    not_audited_text:
      "Mehr über den Prüfer erfahren oder eine künftige Prüfung unterstützen: Besuche {link} oder klicke {here}, um ecash zu spenden und eine Prüfung dieser Mint anzustoßen.",
    here: "hier",
    unavailable: "Audit-Infos sind gerade nicht verfügbar.",
    load_failed: "Mint-Daten konnten nicht geladen werden",
    success_rate: "Erfolgsquote",
    swaps_count: "{successful} von {total} Swaps",
    average_time: "Durchschnittliche Zeit",
    average_time_caption: "Für erfolgreiche Swaps",
    disclaimer:
      "Prüfdaten werden von unabhängigen Dritten bereitgestellt, um die Zuverlässigkeit einer Mint über die Zeit einzuschätzen. Die Ergebnisse dienen jedoch nur zur Information und garantieren weder Sicherheit, Zahlungsfähigkeit noch Vertrauenswürdigkeit einer Mint. Recherchiere immer selbst und stelle sicher, dass du dem Betreiber vertraust, bevor du seine Dienste nutzt.",
    donate_text:
      "Audit-Infos werden von {link} bereitgestellt. Der aktuelle Saldo des Prüfers für diese Mint beträgt {balance}, insgesamt wurden bisher {donations} gespendet. Um weitere Prüfungen zu unterstützen, kannst du {press_here}, um dem Prüfer ecash zu spenden.",
    press_here: "hier tippen",
    sats_amount: "{amount} sats",
    warnings_title: "Prüfer-Warnungen",
    warnings: {
      last_swap_failed: "Der letzte Swap-Versuch ist fehlgeschlagen.",
      recent_success:
        "{successful} von {total} Swaps in den letzten {days} Tagen waren erfolgreich.",
      reliable:
        "{base} Allerdings: {success} Diese Mint scheint zuverlässig, Fehler könnten an der empfangenden Mint liegen.",
      unreliable: "{base} Nur {success} Diese Mint könnte unzuverlässig sein.",
      unknown:
        "Der Prüfer konnte die Qualität dieser Mint noch nicht bestimmen.",
      not_enough_data:
        "Der Prüfer hat nicht genug aktuelle Daten zu dieser Mint. In den letzten {days} Tagen gab es nur {count} erfolgreichen Swap. | Der Prüfer hat nicht genug aktuelle Daten zu dieser Mint. In den letzten {days} Tagen gab es nur {count} erfolgreiche Swaps.",
      low_success:
        "In den letzten {days} Tagen hatte diese Mint eine Erfolgsquote von {rate} %, unter den empfohlenen {threshold} %.",
      inactive:
        "Diese Mint hatte seit {days} Tag keine Swaps. Sie ist möglicherweise nicht erreichbar. | Diese Mint hatte seit {days} Tagen keine Swaps. Sie ist möglicherweise nicht erreichbar.",
      slow: "Diese Mint ist langsam. Zahlungen von ihr dauerten im Schnitt {seconds} Sekunden.",
      no_successful:
        "Für diese Mint wurden keine erfolgreichen Swaps erfasst. Sie ist möglicherweise nicht erreichbar.",
    },
    chart: {
      now: "Jetzt",
      today: "Heute",
      yesterday: "Gestern",
      invalid_date: "Ungültiges Datum",
      swaps: "Swaps:",
      success_rate: "Erfolgsquote:",
      time_range: "Zeitraum:",
    },
  },
  DisplayTokenComponent: {
    title: {
      send: "Ecash senden",
      sent: "Ecash gesendet",
      received: "Ecash empfangen",
    },
    qr_speed: "QR-Tempo: {value}",
    qr_size: "QR-Größe: {value}",
    speed: {
      fast: "Schnell",
      medium: "Mittel",
      slow: "Langsam",
    },
    size: {
      large: "Groß",
      medium: "Mittel",
      small: "Klein",
    },
    delete_dialog: {
      title: "Ecash löschen",
      text: "Möchtest du diese Transaktion wirklich aus deinem Verlauf löschen?",
      warning:
        "Warnung: Diese Aktion kann nicht rückgängig gemacht werden, und der Token lässt sich nicht wiederherstellen.",
    },
    nfc: {
      read_failed: "NFC-Lesen fehlgeschlagen",
      write_failed: "NFC-Schreiben fehlgeschlagen",
      error: "NFC-Fehler",
      writing: "Schreibe auf NFC-Karte...",
      success: "Token erfolgreich auf die Karte geschrieben!",
      capacity:
        "Die Karte hat möglicherweise nicht genug Speicher (benötigt: {bytes} Bytes).",
    },
  },
  CreateInvoiceDialog: {
    onchain_title: "On-Chain empfangen",
    bolt12_title: "Bolt12 empfangen",
    mint_unreachable: "Mint nicht erreichbar",
    mint_unreachable_text:
      "Verbinde dich erneut mit der Mint, um Zahlungen zu empfangen.",
    reconnect_mint: "Mint neu verbinden",
    checking_address: "Adresse wird geprüft...",
    add_amount: "Betrag hinzufügen",
    new_offer: "Neues Angebot",
    create_offer: "Angebot erstellen",
    create_new_address: "Neue Adresse erstellen",
    create_address: "Adresse erstellen",
    onchain_unsupported:
      "Diese Mint unterstützt keine On-Chain-Einzahlungen in dieser Einheit.",
    deposit_limits: {
      outside:
        "Einzahlungen außerhalb von {min}–{max} werden nicht gutgeschrieben.",
      below: "Einzahlungen unter {min} werden nicht gutgeschrieben.",
      above: "Einzahlungen über {max} werden nicht gutgeschrieben.",
    },
    amount_errors: {
      positive_decimal:
        "Gib einen positiven Betrag in {unit} mit höchstens zwei Nachkommastellen ein.",
      positive_whole: "Gib einen positiven ganzzahligen Betrag in {unit} ein.",
      min: "Gib mindestens {amount} ein.",
      max: "Gib höchstens {amount} ein.",
    },
  },
};
