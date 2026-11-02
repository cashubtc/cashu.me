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
    paid: "{amount} über Lightning bezahlt",
  },

  global: {
    notifications: "Benachrichtigungen",
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
      show_seed: {
        label: "Seed-Phrase anzeigen",
      },
      hide_seed: {
        label: "Seed-Phrase verbergen",
      },
      scan: {
        label: "Scannen",
      },
      more_options: {
        label: "Weitere Optionen",
      },
      clear: {
        label: "Löschen",
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
      trying_again: "Wird erneut versucht...",
      unsupported_legacy_qr: "Nicht unterstützter alter QR-Code",
      legacy_qr_not_supported:
        "Dieser alte QR-Code stammt nicht von einem unterstützten Händler",
      no_bolt12_mint: "Keine Ihrer Mints unterstützt BOLT12-Angebote",
      no_bolt11_mint: "Keine Ihrer Mints unterstützt BOLT11-Rechnungen",
      address_not_paid: "Adresse nicht bezahlt",
      payment_pending: "Zahlung ausstehend",
      invoice_already_paid: "Rechnung bereits bezahlt",
      payment_sent: "Zahlung gesendet",
      payment_failed: "Zahlung fehlgeschlagen",
      could_not_pay_request: "Anforderung konnte nicht bezahlt werden",
      request_unit_unsupported:
        "Die Mint unterstützt die Einheit dieser Zahlungsanforderung nicht: {unit}",
      no_onchain_mint: "Keine Ihrer Mints unterstützt On-Chain-Zahlungen",
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
        mint_validation_error: "Mint-Validierungsfehler",
        removed: "Mint entfernt",
        error: "Mint-Fehler",
      },
    },
  },
  MainHeader: {
    menu: {
      terms: {
        terms: {
          title: "Bedingungen",
          caption: "Dem stimmen Sie mit der Nutzung von Cashu.me zu",
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
  Settings: {
    menu: {
      groups: {
        wallet: "Wallet",
        connections: "Verbindungen",
        preferences: "Einstellungen",
        more: "Mehr",
      },
      title: "Einstellungen",
      backup: {
        title: "Sichern & Wiederherstellen",
        caption: "Seed-Phrase und Ecash-Wiederherstellung",
      },
      lightning_address: {
        title: "Lightning-Adresse",
        caption: "Zahlungen an name{'@'}domain empfangen",
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
    },
    sections: {
      nostr: {
        relays: {
          already_added: "Relay bereits hinzugefügt",
          add: {
            title: "Relay hinzufügen",
            description:
              "Ihre Wallet nutzt diese Relays für Nostr-Funktionen wie Zahlungsanforderungen, Nostr Wallet Connect und Backups.",
          },
          list: {
            title: "Relays",
            copy_tooltip: "Relay kopieren",
            remove_tooltip: "Relay entfernen",
          },
        },
      },
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
      },
    },
    lightning_address: {
      server_url: {
        label: "npub.cash-Hostname",
        hint: "Gib einen Hostnamen oder eine HTTPS-URL ein",
        invalid: "Gib eine gültige HTTPS-Server-URL ein",
      },
      title: "Lightning Adresse",
      enable: {
        toggle: "Lightning-Adresse verwenden",
        description: "Zahlungen an eine Adresse von npub.cash empfangen",
      },
      address: {
        label: "Deine Adresse",
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
      mode: {
        title: "Modus",
        dark: "Dunkel",
        light: "Hell",
      },
      keyboard: {
        title: "Bildschirmtastatur",
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
      backup_files_title: "Sicherungsdateien",
      danger_zone_title: "Gefahrenbereich",
      notifications: {
        reserved_unset: "Alle reservierten Proofs freigegeben",
        removed_spent: "{count} ausgegebene Proofs entfernt",
        no_spent: "Keine ausgegebenen Proofs gefunden",
        invalid_backup: "Ungültiges Format der Sicherungsdatei",
        read_error: "Fehler beim Lesen der Datei",
      },
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
        design_system: {
          title: "Designsystem",
          description:
            "Jede Komponente der App, live, mit Quelle und Verwendung.",
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
          increase: "Zähler für {id} erhöhen",
          fixes: "Behebt „outputs have already been signed“",
          keysets: "{n} Keyset | {n} Keysets",
          sheet_hint: "Tippe auf +, um den Zähler eines Keysets zu erhöhen.",
          column: "Zähler",
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
    panel: {
      expand: "Verlauf und Mints anzeigen",
      collapse: "Verlauf und Mints ausblenden",
    },
    tabs: {
      history: {
        label: "Verlauf",
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
    total_label: "Gesamtguthaben",
    show_balance: "{unit}-Guthaben anzeigen",
    mintError: {
      label: "Mint-Fehler",
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
          text: "Tippen Sie auf das Menü (oben rechts)",
        },
        step2: {
          text: "Drücken Sie { buttonText }",
          buttonText: "@:PwaPrompt.android.add",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          text: "Tippen Sie auf Teilen (unten)",
        },
        step2: {
          text: "Drücken Sie { buttonText }",
          buttonText: "@:PwaPrompt.ios.add",
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
  PwaPrompt: {
    title: "Cashu installieren",
    text: "Öffnet sich vom Home-Bildschirm, ohne Browserleiste.",
    ios: {
      share: "Tippen Sie auf Teilen",
      add: "Zum Home-Bildschirm",
    },
    android: {
      menu: "Öffnen Sie das Browsermenü",
      add: "Zum Startbildschirm hinzufügen",
    },
    install: "Installieren",
    notNow: "Nicht jetzt",
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
    progress: { words_entered: "{count}/12 Wörter eingegeben" },
    disclaimer:
      "Ihre Seed-Phrase wird nur lokal verwendet, um Ihre Wallet-Schlüssel abzuleiten.",
  },
  WelcomeRestoreEcash: {
    title: "Ihr Ecash wiederherstellen",
    text: "Scannen Sie nach nicht ausgegebenen Nachweisen auf Ihren konfigurierten Mints und fügen Sie sie Ihrer Wallet hinzu.",
  },
  MintRatings: {
    sort_and_filter: "Sortieren und filtern",
    reviews_title: "Bewertungen",
    reviews_count: "{n} Bewertung | {n} Bewertungen",
    web_of_trust_caption:
      "Nur Bewertungen von Personen in deinem Web of Trust zählen",
    web_of_trust_hop: "In deinem Vertrauensnetz (Hop {hop})",
    no_mint_url: "Keine Mint-URL angegeben",
    reviews: "Bewertungen",
    no_reviews: "Noch keine Bewertungen",
    your_review: "Ihre Bewertung",
    no_rating: "Keine Bewertung",
    stars_label: "{rating} von 5 Sternen",
    out_of: "von {max}",
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
      rating: {
        label: "Bewertung",
        hint: "Wähle eine Bewertung, um deine Rezension zu veröffentlichen.",
      },
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
        },
      },
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
        error: "Fehler beim Wiederherstellen der Mint: { error }",
      },
      restore_selected_mints: {
        label: "Ausgewählte Mints wiederherstellen ({count})",
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
    see_reviews: "Bewertungen ansehen",
    add: {
      title: "Mint hinzufügen",
      description:
        "Geben Sie die URL einer Cashu Mint ein, um sich mit ihr zu verbinden. Diese Wallet ist nicht mit einer Mint affiliiert.",
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
      caption: "Mints, die andere auf Nostr empfehlen.",
      actions: {
        discover: {
          label: "Mints entdecken",
          in_progress: "Lädt…",
        },
      },
      add: "Hinzufügen",
      empty: {
        title: "Eine Mint finden",
        text: "Cashu.me fragt Nostr-Relays nach Mints, die andere empfehlen, mit Bewertungen und Rezensionen.",
      },
      recommendations: {
        overline: "{ length } Mints gefunden",
        caption: "Prüfe eine Mint selbst, bevor du sie nutzt.",
      },
    },
    swap: {
      title: "Tauschen",
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
      },
    },
    error_badge: "Fehler",
    switching_mint: "Wechsel zu {mint}",
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
    actions: {
      create: {
        label: "Rechnung erstellen",
        label_blocked: "Rechnung wird erstellt",
      },
    },
    invoice: {
      caption: "Lightning Rechnung",
      status_paid_text: "Bezahlt",
      actions: {
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
    inputs: {
      p2pk_pubkey: {
        label: "Öffentlicher Schlüssel des Empfängers",
        invalid: "Gültigen öffentlichen Schlüssel eingeben (hex oder npub)",
      },
    },
    actions: {
      copy_emoji: {
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
        label: "Token einfügen",
      },
      scan: {
        label: "Token scannen",
      },
      request: {
        label: "Ecash anfordern",
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
      receive: {
        label: "@:global.actions.receive.label",
        label_known_mint: "@:ReceiveTokenDialog.actions.receive.label",
        label_adding_mint: "Mint wird hinzugefügt…",
      },
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "Zu einer vertrauenswürdigen Mint tauschen",
        processing: "Tausch läuft…",
        failed: "Tausch fehlgeschlagen",
      },
      cancel_swap: {
        tooltip_text: "Swap abbrechen",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
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
        label: "Öffentlichen Schlüssel kopieren",
      },
      new_key: {
        label: "Neuen Schlüssel generieren",
      },
    },
  },
  PaymentRequestDialog: {
    any_amount: "Beliebiger Betrag",
    payment_request: {
      caption: "Zahlungsanforderung",
    },
    request_index: "Anfrage {index} von {total}",
    actions: {
      set_amount: {
        label: "Betrag festlegen",
      },
      copy: {
        label: "@:global.actions.copy.label",
      },
      new_request: {
        label: "Neue Anforderung",
      },
      share: {
        label: "Teilen",
      },
      add_amount: {
        label: "Betrag hinzufügen",
      },
      use_active_mint: {
        label: "Beliebige Mint",
      },
      remove_amount: {
        label: "Betrag entfernen",
      },
      previous: {
        label: "Vorherige Anfrage",
      },
      next: {
        label: "Nächste Anfrage",
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
      email: "E-Mail",
    },
    details: {
      title: "Mint Details",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Unterstützte Funktionen",
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
    nuts: {
      nut7: "Token-Statusprüfung",
      nut8: "Überzahlte Lightning-Gebühren",
      nut9: "Signatur-Wiederherstellung",
      nut10: "Ausgabebedingungen",
      nut11: "Pay-to-Pubkey (P2PK)",
      nut12: "DLEQ-Nachweise",
      nut13: "Deterministische Secrets",
      nut14: "Hashed Timelock Contracts (HTLC)",
      nut15: "Partielle Multi-Path-Zahlungen",
      nut16: "Animierte QR-Codes",
      nut17: "WebSocket-Abonnements",
      nut18: "Zahlungsanforderungen",
      nut19: "Zwischengespeicherte Antworten",
      nut20: "Signatur auf Mint-Angebot",
      nut21: "Klare Authentifizierung",
      nut22: "Blinde Authentifizierung",
    },
  },
  UnitToggle: {
    label: "Einheit: {unit}, ändern",
    bitcoin: "Bitcoin",
  },
  ChooseMint: {
    open_selector: "Mint auswählen, aktuelle Mint: {mint}",
    open_selector_empty: "Mint auswählen",
    title: "Wählen Sie eine Mint",
    badge_mint_error_text: "Fehler",
    available_text: "bei dieser Mint",
    sheet_title: "Mint auswählen",
    placeholder: "Mint auswählen",
  },
  HistoryTable: {
    empty_text: "Noch kein Verlauf vorhanden",
    empty_hint: "Zahlungen, die du sendest und empfängst, erscheinen hier.",
    filters: {
      title: "Verlauf filtern",
      direction: "Richtung",
      type: "Art",
      all: "Alle",
      all_mints: "Alle Mints",
      completed: "Abgeschlossen",
      received: "Empfangen",
      sent: "Gesendet",
      show_results: "Ergebnisse anzeigen ({count})",
      reset: "Zurücksetzen",
      clear_all: "Alle entfernen",
      remove: "Filter entfernen: {label}",
      empty_title: "Keine Zahlungen passen zu diesen Filtern",
      clear: "Filter entfernen",
      count: "{shown} von {total}",
      active: "Verlauf filtern, {count} aktiv",
    },
    row: {
      type_label: "Ecash",
    },
    actions: {
      check_status: {
        tooltip_text: "Status prüfen",
      },
      receive: {
        tooltip_text: "Empfangen",
      },
    },
    old_token_not_found_error_text: "Alter Token nicht gefunden",
    labels: {
      onchain_subpayment: "On-Chain-Teilzahlung",
      bolt12_subpayment: "BOLT12-Teilzahlung",
    },
  },
  InvoiceTable: {
    row: {
      type_label: "Lightning",
    },
  },
  RemoveMintDialog: {
    title: "Diese Mint entfernen?",
    nickname: {
      label: "Spitzname",
    },
    balances: {
      label: "Guthaben bei dieser Mint",
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
      caption_address: "Tippen Sie, um eine Adresse zu scannen",
      caption_token: "Tippen Sie, um einen Token zu scannen",
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
      title_bolt12: "Lightning-Angebot bezahlen",
    },
    lnurlpay: {
      amount_exact_label: "{ payee } fordert { value } { ticker } an",
      amount_range_label:
        "{ payee } fordert{br}zwischen { min } und { max } { ticker } an",
      sending_to_lightning_address: "Senden an { address }",
      inputs: {
        comment: {
          label: "Kommentar (optional)",
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
        },
      },
    },
  },
  EditMintDialog: {
    title: "Mint bearbeiten",
    inputs: {
      nickname: {
        label: "Spitzname (optional)",
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
    title: "Vertrauen Sie dieser Mint?",
    description:
      "Treten Sie dieser Mint nur bei, wenn Sie ihr vertrauen. Stellt sie den Betrieb ein, ist Ihr Ecash bei ihr verloren.",
    actions: {
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
    token: "Token",
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
  ActivityRow: {
    received: "Empfangen",
    sent: "Gesendet",
    receiving: "Wird empfangen",
    sending: "Wird gesendet",
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
    enter_amount_in: "Betrag in {fiat} eingeben",
    something_went_wrong: "Etwas ist schiefgelaufen",
  },
  SendPaymentRequest: {
    actions: {
      pay: { label: "Bezahlen" },
      pay_via: { label: "Über {transport} bezahlen" },
    },
    info: {
      pay_failed: "Anfrage konnte nicht bezahlt werden",
      no_ecash: "Kein Ecash für diese Zahlungsanforderung verfügbar",
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
    address: "Adresse",
    invoice: "Rechnung",
    request: "Anfrage",
    amount: "Betrag",
    fee_reserve: "Gebührenreserve",
    fee_paid: "Gezahlte Gebühr",
    unit: "Einheit",
    status: "Status",
    network: "Netzwerk",
    transaction_id: "Transaktions-ID",
    confirmations: "Bestätigungen",
    paid_at: "Bezahlt am",
    preimage: "Preimage",
    preimage_copied: "Preimage kopiert",
    mint: "Mint",
    method: "Methode",
    lightning_offer: "Lightning-Angebot",
    states: {
      waiting: "Warten auf Zahlung",
      confirming: "Wird bestätigt ({count}/{threshold})",
      issuing: "Ecash wird ausgegeben",
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
    qr_density: "QR-Dichte: {value}",
    speed: {
      fast: "Schnell",
      medium: "Mittel",
      slow: "Langsam",
    },
    density: {
      high: "Hoch",
      medium: "Mittel",
      low: "Niedrig",
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
    format_label: "Anfrageart",
    formats: {
      bolt11: "Rechnung",
      bolt12: "Angebot",
    },
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
  storage: {
    notifications: {
      unrecognized_backup: "Unbekanntes Backup-Format",
      backup_restored: "Backup wiederhergestellt",
      backup_exported: "Wallet-Backup exportiert",
      quota_exceeded:
        "Der lokale Speicher ist voll. Bereinigen Sie Ihren lokalen Speicher.",
      cleaned_up: "{size} Bytes bereinigt",
    },
  },
  receiveTokens: {
    notifications: {
      already_in_history: "Token bereits im Verlauf",
      nfc_read_failed: "Daten vom NFC-Tag können nicht gelesen werden",
      scan_error: "Scanfehler",
      nfc_error: "NFC-Fehler",
    },
  },
  nostrMintBackup: {
    notifications: {
      no_relays: "Keine Nostr-Relays konfiguriert",
      backup_failed: "Ihre Mint-Liste konnte nicht auf Nostr gesichert werden",
      backed_up: "Mint-Liste auf Nostr gesichert",
      found:
        "{count} Mint in Nostr-Backups gefunden | {count} Mints in Nostr-Backups gefunden",
      none_found: "Keine Mint-Backups auf Nostr für diese Seed-Phrase gefunden",
      search_failed: "Suche nach Mint-Backups fehlgeschlagen",
      add_mint_failed: "{mint} konnte nicht hinzugefügt werden",
      added:
        "{count} Mint zu Ihrer Wallet hinzugefügt | {count} Mints zu Ihrer Wallet hinzugefügt",
      none_added: "Keine neuen Mints hinzugefügt",
      add_selected_failed:
        "Die ausgewählten Mints konnten nicht hinzugefügt werden",
    },
  },
  nostr: {
    notifications: {
      nip04_published: "NIP-04-Ereignis veröffentlicht",
      nip04_failed: "NIP-04-Ereignis konnte nicht veröffentlicht werden",
      nip17_failed: "NIP-17-Ereignis konnte nicht veröffentlicht werden",
      receive_failed: "Eingehende Zahlung konnte nicht empfangen werden",
      ecash_already_in_history: "Ecash bereits im Verlauf",
      ecash_added: "Ecash zum Verlauf hinzugefügt",
    },
  },
  nwc: {
    notifications: {
      melt_quote_failed: "NWC: Melt-Angebot konnte nicht angefordert werden",
      unit_must_be_sat: "NWC: Die aktive Einheit muss sats sein",
      allowance_exceeded: "NWC: Limit überschritten",
    },
  },
  npubcash: {
    notifications: {
      could_not_update_mint:
        "Die npub.cash-Mint konnte nicht aktualisiert werden",
      add_mint_first: "Fügen Sie zuerst {mint} zu Ihrer Wallet hinzu",
    },
  },
};
