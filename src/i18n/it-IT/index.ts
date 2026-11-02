export default {
  MultinutPicker: {
    dialog_title: "Pagamento Multinut",
    pay_using_multiple: "Paga usando più mint",
    experimental_title: "Funzione sperimentale",
    experimental_text:
      "Questa funzione è altamente sperimentale e potrebbe non funzionare come previsto. Non tentare di pagare una fattura già pagata. Potresti perdere fondi.",
    understand: "Ho capito",
    select_funds: "Seleziona fondi da più mint per eseguire il pagamento.",
    pay_invoice: "Paga fattura",
    amount_mismatch:
      "Errore nel calcolo dell'importo: {calculated} invece di {expected}",
    states: {
      requesting: "Richiesta...",
      paying: "Pagamento...",
      success: "Riuscito",
      failed: "Non riuscito",
    },
    paid: "Pagato {amount} via Lightning",
  },
  global: {
    notifications: "Notifiche",
    actions: {
      add_mint: { label: "Aggiungi mint" },
      cancel: { label: "Annulla" },
      copy: { label: "Copia" },
      close: { label: "Chiudi" },
      enter: { label: "Invio" },
      lock: { label: "Blocca" },
      paste: { label: "Incolla" },
      receive: { label: "Ricevi" },
      show_seed: {
        label: "Mostra frase seed",
      },
      hide_seed: {
        label: "Nascondi frase seed",
      },
      scan: { label: "Scansiona" },
      more_options: { label: "Altre opzioni" },
      clear: { label: "Cancella" },
      send: { label: "Invia" },
      swap: { label: "Scambia" },
      update: { label: "Aggiorna" },
      pay: { label: "Paga" },
    },
    inputs: { mint_url: { label: "URL Mint" } },
  },

  wallet: {
    notifications: {
      balance_too_low: "Il saldo è troppo basso",
      received: "Ricevuto {amount}",
      fee: " (commissione: {fee})",
      could_not_request_mint: "Impossibile richiedere coniazione",
      invoice_still_pending: "Fattura ancora in attesa",
      paid_lightning: "Pagato {amount} tramite Lightning",
      sent: "Inviato {amount}",
      token_still_pending: "Token ancora in attesa",
      received_lightning: "Ricevuto {amount} tramite Lightning",
      lightning_payment_failed: "Pagamento Lightning fallito",
      failed_to_decode_invoice: "Impossibile decodificare la fattura",
      invalid_lnurl: "LNURL non valido",
      lnurl_error: "Errore LNURL",
      no_amount: "Nessun importo",
      no_lnurl_data: "Nessun dato LNURL",
      no_price_data: "Nessun dato di prezzo.",
      trying_again: "Nuovo tentativo in corso...",
      unsupported_legacy_qr: "Codice QR legacy non supportato",
      legacy_qr_not_supported:
        "Questo codice QR legacy non proviene da un esercente supportato",
      no_bolt12_mint: "Nessuno dei tuoi mint supporta le offerte BOLT12",
      no_bolt11_mint: "Nessuno dei tuoi mint supporta le fatture BOLT11",
      address_not_paid: "Indirizzo non pagato",
      payment_pending: "Pagamento in attesa",
      invoice_already_paid: "Fattura già pagata",
      payment_sent: "Pagamento inviato",
      payment_failed: "Pagamento fallito",
      could_not_pay_request: "Impossibile pagare la richiesta",
      request_unit_unsupported:
        "Il mint non supporta l'unità di questa richiesta di pagamento: {unit}",
      no_onchain_mint: "Nessuno dei tuoi mint supporta i pagamenti on-chain",
    },
    mint: {
      notifications: {
        already_added: "Mint già aggiunto",
        added: "Mint aggiunto",
        not_found: "Mint non trovato",
        activation_failed: "Attivazione mint fallita",
        no_active_mint: "Nessun mint attivo",
        unit_activation_failed: "Attivazione unità fallita",
        unit_not_supported: "Unità non supportata dal mint",
        activated: "Mint attivato",
        could_not_connect: "Impossibile connettersi al mint",
        mint_validation_error: "Errore di validazione del mint",
        removed: "Mint rimosso",
        error: "Errore mint",
      },
    },
  },
  MainHeader: {
    menu: {
      terms: {
        terms: {
          title: "Termini",
          caption: "Cosa accetti usando Cashu.me",
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
          title: "Dona",
          caption: "Supporta Cashu",
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
        text: "Ricarica tra { countdown }",
      },
    },
    staging: {
      warning: {
        text: "Staging – non usare con fondi reali!",
      },
    },
  },
  Settings: {
    menu: {
      groups: {
        wallet: "Portafoglio",
        connections: "Connessioni",
        preferences: "Preferenze",
        more: "Altro",
      },
      title: "Impostazioni",
      backup: {
        title: "Backup e ripristino",
        caption: "Frase seed e recupero degli ecash",
      },
      lightning_address: {
        title: "Indirizzo Lightning",
        caption: "Ricevi pagamenti su nome{'@'}dominio",
      },
      nostr: {
        title: "Nostr",
        caption: "Chiavi, relay e rete di fiducia",
      },
      payment_requests: {
        title: "Richieste di pagamento",
        caption: "Ricevi pagamenti in ecash tramite Nostr",
      },
      nwc: {
        title: "Nostr Wallet Connect",
        caption: "Usa il tuo portafoglio da altre app",
      },
      hardware: {
        title: "Hardware",
        caption: "Impostazioni NFC",
      },
      p2pk: {
        title: "Ecash bloccato",
        caption: "Ricevi ecash che solo la tua chiave può sbloccare",
      },
      privacy: {
        title: "Privacy",
        caption: "Controlli di rete e prezzo del bitcoin",
      },
      experimental: {
        title: "Sperimentale",
        caption: "Prova le nuove funzionalità in anteprima",
      },
      appearance: {
        title: "Aspetto",
        caption: "Tema, tastiera e simbolo del bitcoin",
      },
      language: {
        title: "Lingua",
        caption: "Scegli la tua lingua",
      },
      advanced: {
        title: "Avanzate",
        caption: "Strumenti per sviluppatori e reset del portafoglio",
      },
      about: {
        title: "Informazioni",
        caption: "Termini e link",
      },
    },
    language: {
      title: "Lingua",
    },
    sections: {
      nostr: {
        relays: {
          already_added: "Relay già aggiunto",
          add: {
            title: "Aggiungi relay",
            description:
              "Il tuo portafoglio usa questi relay per le funzioni Nostr come richieste di pagamento, Nostr Wallet Connect e backup.",
          },
          list: {
            title: "Relay",
            copy_tooltip: "Copia relay",
            remove_tooltip: "Rimuovi relay",
          },
        },
      },
    },
    backup_restore: {
      backup_seed: {
        title: "Backup frase seed",
        description:
          "La tua frase seed può ripristinare il tuo portafoglio. Conservala al sicuro e privata.",
        seed_phrase_label: "Frase seed",
      },
      restore_ecash: {
        title: "Ripristina ecash",
        description:
          "Recupera ecash da un'altra frase seed. La tua frase seed attuale resta invariata.",
      },
    },
    lightning_address: {
      server_url: {
        label: "Nome host npub.cash",
        hint: "Inserisci un nome host o un URL HTTPS",
        invalid: "Inserisci un URL del server HTTPS valido",
      },
      title: "Indirizzo Lightning",
      enable: {
        toggle: "Usa un indirizzo Lightning",
        description: "Ricevi pagamenti su un indirizzo di npub.cash",
      },
      address: {
        label: "Il tuo indirizzo",
        copy_tooltip: "Copia indirizzo Lightning",
      },
      show_on_receive: {
        toggle: "Mostra durante la ricezione",
        description: "Mostra indirizzo e codice QR.",
      },
      automatic_claim: {
        toggle: "Richiedi automaticamente",
        description: "Ricevi pagamenti in entrata automaticamente.",
      },
      mint: {
        label: "npub.cash mint",
        choose_title: "Scegli mint per npub.cash",
        choose_placeholder: "Seleziona un mint...",
      },
    },
    nostr_keys: {
      title: "Le tue chiavi Nostr",
      description:
        "Le tue chiavi Nostr determinano il tuo indirizzo Lightning.",
      wallet_seed: {
        title: "Frase seed del portafoglio",
        description:
          "Genera una coppia di chiavi Nostr dal seed del tuo portafoglio",
        copy_nsec: "Copia chiave privata",
      },
      nsec_bunker: {
        title: "Firmatario remoto",
        description: "Firma con un bunker NIP-46",
        delete_tooltip: "Elimina connessione",
      },
      use_nsec: {
        title: "Usa la tua chiave privata",
        description:
          "Incolla la tua chiave privata Nostr (nsec) in questo portafoglio. Sconsigliato.",
        delete_tooltip: "Elimina chiave privata",
      },
      signing_extension: {
        title: "Estensione di firma",
        description: "Usa un'estensione di firma NIP-07",
        not_found: "Nessuna estensione di firma NIP-07 trovata",
      },
    },
    payment_requests: {
      description:
        "Ricevi pagamenti tramite Nostr. Se attivo, il portafoglio resta in ascolto sui tuoi relay Nostr.",
      enable_toggle: "Attiva richieste di pagamento",
      claim_automatically: {
        toggle: "Richiedi automaticamente",
        description:
          "Aggiunge i pagamenti in arrivo al saldo senza chiedere. Se disattivato, li riscuoti uno per uno.",
      },
    },
    nostr_wallet_connect: {
      description:
        "Permette ad altre app di pagare da questo portafoglio tramite Nostr Wallet Connect.",
      enable_toggle: "Attiva Nostr Wallet Connect",
      payments_note:
        "Puoi usare NWC solo per pagamenti dal tuo saldo Bitcoin. I pagamenti verranno effettuati dal tuo mint attivo.",
      connection: {
        copy_tooltip: "Copia stringa di connessione",
        qr_tooltip: "Mostra codice QR",
        allowance_label: "Limite rimasto (sat)",
      },
    },
    hardware_features: {
      webnfc: {
        title: "Formato carta NFC",
        description: "Scegli la codifica per scrivere su schede NFC",
        text: {
          title: "Testo",
          description: "Memorizza token in testo semplice",
        },
        weburl: {
          title: "URL",
          description: "Memorizza URL a questo portafoglio con token",
        },
        binary: {
          title: "Binario",
          description: "Salva il token come dati binari",
        },
        quick_access: {
          toggle: "Accesso rapido NFC",
          description:
            "Aggiunge un pulsante NFC alla schermata Ricevi ecash per scansionare le carte.",
        },
      },
    },
    p2pk_features: {
      description:
        "Sperimentale. Usa piccoli importi: se perdi la chiave privata, nessuno potrà sbloccare l'ecash bloccato con essa.",
      generate_button: "Genera chiave",
      import_button: "Importa chiave privata",
      quick_access: {
        toggle: "Mostra la chiave di blocco in Ricevi",
        description:
          "Mostra la tua chiave di blocco nella schermata Ricevi ecash, così chi invia può bloccare ecash per te.",
      },
      keys_expansion: {
        label: "Clicca per sfogliare {count} chiavi",
        used_badge: "usata",
      },
    },
    privacy: {
      network_title: "Controlli di rete",
      description: "Queste impostazioni influenzano la tua privacy.",
      check_incoming: {
        toggle: "Verifica fattura in entrata",
        description:
          "Controlla la tua ultima fattura in background. Aggiornamenti più rapidi, ma fingerprinting più facile.",
      },
      check_startup: {
        toggle: "Verifica fatture pendenti all'avvio",
        description:
          "Controlla le fatture in sospeso all'apertura del portafoglio.",
      },
      check_all: {
        toggle: "Verifica tutte le fatture",
        description:
          "Controlla le fatture non pagate in background per un massimo di due settimane. Più attività online rende più facile il fingerprinting.",
      },
      check_sent: {
        toggle: "Verifica ecash inviato",
        description:
          "Controlla in background se l'ecash inviato è stato riscattato. Più attività online rende più facile il fingerprinting.",
      },
      websockets: {
        toggle: "Usa WebSockets",
        description:
          "Mantiene una connessione attiva con i mint per aggiornamenti istantanei sui pagamenti. Più veloce, ma fingerprinting più facile.",
      },
      bitcoin_price: {
        title: "Prezzo del bitcoin",
        toggle: "Ottieni tasso di cambio da Coinbase",
        description:
          "Recupera il prezzo del bitcoin da coinbase.com per mostrare il saldo in valuta fiat.",
        currency: {
          title: "Valuta fiat",
          description:
            "Scegli la valuta fiat per la visualizzazione del prezzo Bitcoin.",
        },
      },
    },
    experimental: {
      receive_swaps: {
        toggle: "Ricevi scambi",
        badge: "Beta",
        description:
          "Propone di scambiare l'ecash ricevuto verso il tuo mint attivo.",
      },
      auto_paste: {
        toggle: "Incolla ecash automaticamente",
        description:
          "Incolla l'ecash dagli appunti quando apri Ricevi ecash. Disattivalo se causa problemi di visualizzazione su iOS.",
      },
      auditor: {
        toggle: "Abilita revisore",
        badge: "Beta",
        description:
          "Mostra nei dettagli del mint i dati di affidabilità di un revisore esterno.",
        url_label: "URL Revisore",
        api_url_label: "URL API Revisore",
      },
      multinut: {
        description: "Paga le fatture da più mint contemporaneamente.",
      },
      nostr_mint_backup: {
        toggle: "Backup dell'elenco mint su Nostr",
        description:
          "Salva una copia dell'elenco dei tuoi mint sui tuoi relay Nostr, così puoi ripristinarlo su un altro dispositivo.",
        notifications: {
          enabled: "Backup mint Nostr abilitato",
          disabled: "Backup mint Nostr disabilitato",
          failed: "Impossibile abilitare il backup mint Nostr",
        },
      },
    },
    appearance: {
      mode: {
        title: "Modalità",
        dark: "Scura",
        light: "Chiara",
      },
      keyboard: {
        title: "Tastiera su schermo",
        toggle: "Usa tastiera numerica",
        toggle_description:
          "Usa il tastierino numerico per inserire gli importi.",
      },
      theme: {
        title: "Tema",
        description: "Cambia l'aspetto del tuo portafoglio.",
        tooltips: {
          mono: "Mono",
          cyber: "Cyber",
          freedom: "Libertà",
          nostr: "Nostr",
          bitcoin: "Bitcoin",
          mint: "Menta",
          nut: "Nocciola",
          blu: "Blu",
          flamingo: "Fenicottero",
        },
      },
      bip177: {
        title: "Simbolo Bitcoin",
        description: "Mostra gli importi come ₿2.789 invece di 2.789 sats.",
        toggle: "Usa il simbolo ₿",
      },
    },
    web_of_trust: {
      title: "Rete di fiducia",
      known_pubkeys: "Chiavi pubbliche note: {wotCount}",
      continue_crawl: "Continua scansione",
      crawl_odell: "Importa la rete di fiducia di Odell",
      crawl_wot: "Scansiona web of trust",
      pause: "Pausa",
      reset: "Reset",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    multinut: {
      use_multinut: "Pagamenti da più mint",
    },
    advanced: {
      backup_files_title: "File di backup",
      danger_zone_title: "Zona pericolosa",
      notifications: {
        reserved_unset: "Tutte le prove riservate sono state liberate",
        removed_spent: "Rimosse {count} prove spese",
        no_spent: "Nessuna prova spesa trovata",
        invalid_backup: "Formato del file di backup non valido",
        read_error: "Errore durante la lettura del file",
      },
      developer: {
        title: "Impostazioni sviluppatore",
        description: "Strumenti per la risoluzione dei problemi e il debug.",
        new_seed: {
          button: "Genera nuova frase seed",
          description:
            "Crea una nuova frase seed. Poi invia il saldo a te stesso, così il nuovo seed potrà ripristinarlo.",
          confirm_question:
            "Sei sicuro di voler generare una nuova frase seed?",
          cancel: "Annulla",
          confirm: "Conferma",
        },
        remove_spent: {
          button: "Rimuovi prove spese",
          description:
            "Rimuove l'ecash che i tuoi mint attivi segnalano come speso. Usalo solo se il portafoglio è bloccato.",
        },
        design_system: {
          title: "Design system",
          description:
            "Ogni componente dell’app, dal vivo, con sorgente e utilizzo.",
        },
        debug_console: {
          button: "Console di debug",
          description:
            "Apre la console JavaScript. Non incollare mai codice che non capisci: i truffatori la usano per rubare fondi.",
        },
        export_proofs: {
          button: "Esporta prove attive",
          description:
            "Copia il saldo del mint attivo nell'unità selezionata come un unico token ecash.",
        },
        keyset_counters: {
          title: "Incrementa contatori keyset",
          increase: "Aumenta il contatore di {id}",
          fixes: "Risolve «outputs have already been signed»",
          keysets: "{n} keyset | {n} keyset",
          sheet_hint: "Tocca + per aumentare il contatore di un keyset.",
          column: "Contatore",
        },
        unset_reserved: {
          button: "Annulla prenotazione tutti i token riservati",
          description:
            'Libera l\'ecash riservato agli invii in sospeso, così puoi spenderlo di nuovo. Poi esegui "Rimuovi prove spese".',
        },
        show_onboarding: {
          button: "Mostra onboarding",
          description: "Mostra di nuovo la schermata di onboarding.",
        },
        reset_wallet: {
          button: "Resetta dati portafoglio",
          description:
            "Elimina tutti i dati del portafoglio su questo dispositivo. Esporta prima un backup.",
          confirm_question:
            "Sei sicuro di voler eliminare i dati del tuo portafoglio?",
          cancel: "Annulla",
          confirm: "Elimina portafoglio",
        },
        export_wallet: {
          button: "Esporta dati portafoglio",
          description:
            "Scarica un file di backup da importare nella schermata di benvenuto. Diventa obsoleto man mano che usi il portafoglio.",
        },
        import_wallet: {
          description:
            "Sostituisce i dati di questo portafoglio con un file di backup esportato.",
          button: "Importa backup del portafoglio",
          confirm_question: "Vuoi davvero ripristinare i dati del portafoglio?",
          cancel: "Annulla",
          confirm: "IMPORTA BACKUP DEL PORTAFOGLIO",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Aggiungi un mint",
    subtitle:
      "I mint emettono l'ecash che questo portafoglio custodisce. Aggiungi un mint, o ricevi ecash da uno, per iniziare.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Ricevi ecash",
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
      expand: "Mostra cronologia e mints",
      collapse: "Nascondi cronologia e mints",
    },
    tabs: {
      history: {
        label: "Cronologia",
      },
      mints: {
        label: "Mints",
      },
    },
    install: {
      text: "Installa",
      tooltip: "Installa Cashu",
    },
  },
  AlreadyRunning: {
    title: "Cashu.me è aperto in un'altra scheda",
    text: "Chiudi l'altra scheda, poi tocca Riprova.",
    actions: {
      retry: {
        label: "Riprova",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Questa pagina non esiste",
    actions: {
      home: {
        label: "Torna alla home",
      },
    },
  },
  BalanceView: {
    total_label: "Saldo totale",
    show_balance: "Mostra saldo in {unit}",
    mintError: {
      label: "Errore mint",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "Precedente",
      },
      next: {
        label: "Successivo",
      },
    },
  },
  WelcomeSlide1: {
    terms_agreement: "Continuando, accetti i {terms}",
    title: "Benvenuto in Cashu.me",
    text: "Cashu.me è un portafoglio Bitcoin gratuito e open-source che utilizza ecash per mantenere i tuoi fondi sicuri e privati.",
  },
  WelcomeSlide2: {
    title: "Installa Cashu.me",
    alt: { pwa_example: "Esempio di installazione della PWA" },
    installing: "Installazione…",
    instruction: {
      intro: {
        text: "Per la migliore esperienza, usa questo portafoglio con il browser web nativo del tuo dispositivo per installarlo come App Web Progressiva. Fallo subito.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          text: "Tocca il menu (in alto a destra)",
        },
        step2: {
          text: "Premi { buttonText }",
          buttonText: "@:PwaPrompt.android.add",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          text: "Tocca condividi (in basso)",
        },
        step2: {
          text: "Premi { buttonText }",
          buttonText: "@:PwaPrompt.ios.add",
        },
      },
      outro: {
        text: "Dopo l'installazione, chiudi questa scheda del browser e apri Cashu.me dalla schermata Home.",
      },
    },
    pwa: {
      success: {
        title: "Successo!",
        text: "Stai usando Cashu come PWA. Chiudi qualsiasi altra finestra del browser aperta e usa l'app dalla tua schermata home.",
        nextSteps:
          "Ora puoi chiudere questa scheda del browser e aprire l’app dalla schermata Home.",
      },
    },
  },
  PwaPrompt: {
    title: "Installa Cashu",
    text: "Si apre dalla schermata Home, senza la barra del browser.",
    ios: {
      share: "Tocca Condividi",
      add: "Aggiungi alla schermata Home",
    },
    android: {
      menu: "Apri il menu del browser",
      add: "Aggiungi alla schermata Home",
    },
    install: "Installa",
    notNow: "Non ora",
  },
  WelcomeSlide3: {
    title: "La tua frase seed",
    text: "Conserva la tua frase seed in un gestore di password o su carta. La tua frase seed è l'unico modo per recuperare i tuoi fondi se perdi l'accesso a questo dispositivo.",
    inputs: {
      seed_phrase: {
        label: "Frase seed",
        caption: "Puoi vedere la tua frase seed nelle impostazioni.",
      },
      checkbox: {
        label: "L'ho scritta",
      },
    },
  },
  WelcomeSlide4: {
    english_only: "Il testo legale è disponibile solo in inglese.",
    title: "Termini di servizio",
    actions: {
      more: {
        label: "Leggili prima di usare Cashu.me",
      },
    },
    inputs: {
      checkbox: {
        label: "Ho letto e accetto questi termini e condizioni",
      },
    },
  },
  WelcomeSlideChoice: {
    title: "Configura il tuo portafoglio",
    text: "Vuoi recuperare da una frase seed o creare un nuovo portafoglio?",
    options: {
      new: {
        title: "Crea nuovo portafoglio",
        subtitle: "Genera una nuova seed e aggiungi mints.",
      },
      recover: {
        title: "Recupera portafoglio",
        subtitle: "Inserisci la tua frase seed, ripristina mints ed ecash.",
      },
    },
  },
  WelcomeMintSetup: {
    title: "Aggiungi mints",
    text: "I mints sono server che ti aiutano a inviare e ricevere ecash. Scegli un mint scoperto o aggiungine uno manualmente. Puoi saltare per aggiungere mints più tardi.",
    sections: { your_mints: "I tuoi mints" },
    restoring: "Ripristino mints…",
    placeholder: { mint_url: "https://" },
  },
  WelcomeRecoverSeed: {
    title: "Inserisci la tua frase seed",
    text: "Incolla o digita la tua frase seed di 12 parole per recuperare.",
    inputs: { word: "Parola { index }" },
    actions: { paste_all: "Incolla tutto" },
    progress: { words_entered: "{count}/12 parole inserite" },
    disclaimer:
      "La tua frase seed è usata solo localmente per derivare le chiavi del portafoglio.",
  },
  WelcomeRestoreEcash: {
    title: "Ripristina il tuo ecash",
    text: "Scansiona le proofs non spese sui mints configurati e aggiungile al tuo portafoglio.",
  },
  MintRatings: {
    sort_and_filter: "Ordina e filtra",
    reviews_title: "Recensioni",
    reviews_count: "{n} recensione | {n} recensioni",
    web_of_trust_caption:
      "Conta solo le recensioni delle persone nella tua rete di fiducia",
    web_of_trust_hop: "Nella tua rete di fiducia (salto {hop})",
    no_mint_url: "Nessun URL del mint fornito",
    reviews: "recensioni",
    no_reviews: "Ancora nessuna recensione",
    your_review: "La tua recensione",
    no_rating: "Nessuna valutazione",
    stars_label: "{rating} su 5 stelle",
    out_of: "su {max}",
    sort: "Ordina",
    sort_options: {
      newest: "Più recenti",
      oldest: "Più vecchie",
      highest: "Più alte",
      lowest: "Più basse",
    },
    actions: { write_review: "Scrivi una recensione" },
    empty_state_subtitle:
      "Scrivi la prima recensione di questo mint. La tua esperienza aiuta gli altri a scegliere.",
    range: "{from}–{to} di {total}",
  },
  CreateMintReview: {
    connect_nostr:
      "Collega un account Nostr nelle Impostazioni per pubblicare una recensione.",
    published: "Recensione pubblicata",
    publish_failed: "Impossibile pubblicare la recensione",
    title: "Recensisci il mint",
    publishing_as: "Pubblicazione come",
    inputs: {
      rating: {
        label: "Valutazione",
        hint: "Scegli una valutazione per pubblicare la tua recensione.",
      },
      review: { label: "Recensione (opzionale)" },
    },
    actions: {
      publish: { label: "Pubblica recensione", in_progress: "Pubblicazione…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "Ripristina da frase seed",
      caption:
        "Prima di ripristinare, aggiungi tutti i mint che hai usato con questo seed.",
      inputs: {
        seed_phrase: {
          label: "Frase seed",
        },
      },
    },
    restore_mints: {
      label: "Ripristina mint",
      caption:
        "Scegli i mint da ripristinare. Aggiungi prima quelli mancanti dalla scheda Mints.",
    },
    actions: {
      paste: {
        error: "Impossibile leggere il contenuto degli appunti.",
      },
      validate: {
        error: "Il mnemonico dovrebbe essere di almeno 12 parole.",
      },
      select_all: {
        label: "Seleziona tutto",
      },
      deselect_all: {
        label: "Deseleziona tutto",
      },
      restore: {
        label: "Ripristina",
        error: "Errore nel ripristino del mint: { error }",
      },
      restore_selected_mints: {
        label: "Ripristina i mint selezionati ({count})",
        success: "{count} mint(s) ripristinati con successo",
        error: "Errore nel ripristino dei mints selezionati: { error }",
      },
    },
    nostr_mints: {
      label: "Ripristina mint da Nostr",
      caption:
        "Cerca i backup dei mints memorizzati sui relay Nostr usando la tua frase seed. Questo ti aiuterà a scoprire i mints che hai usato in precedenza.",
      search_button: "Cerca backup dei mint",
      select_all: "Seleziona tutto",
      deselect_all: "Deseleziona tutto",
      backed_up: "Backup effettuato",
      add_selected: "Aggiungi selezionati ({count})",
      no_backups_found: "Nessun backup mint trovato",
      no_backups_hint:
        "Assicurati che il backup mint Nostr sia abilitato nelle impostazioni per eseguire automaticamente il backup della tua lista mint.",
      invalid_mnemonic: "Inserisci una frase seed valida prima di cercare.",
      search_error: "Impossibile cercare i backup dei mints.",
      add_error: "Impossibile aggiungere i mints selezionati.",
    },
  },
  MintSettings: {
    see_reviews: "Vedi recensioni",
    add: {
      title: "Aggiungi mint",
      description:
        "Inserisci l'URL di un mint Cashu per connetterti ad esso. Questo portafoglio non è affiliato a nessun mint.",
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "URL non valido",
        },
        scan: {
          label: "Scansiona codice QR",
        },
      },
    },
    discover: {
      title: "Scopri mints",
      caption: "Mint consigliati da altri su Nostr.",
      actions: {
        discover: {
          label: "Scopri mints",
          in_progress: "Caricamento…",
        },
      },
      add: "Aggiungi",
      empty: {
        title: "Trova una mint",
        text: "Cashu.me chiede ai relay Nostr le mint consigliate da altre persone, con valutazioni e recensioni.",
      },
      recommendations: {
        overline: "Trovati { length } mints",
        caption: "Informati prima di usare un mint.",
      },
    },
    swap: {
      title: "Scambia",
      caption:
        "Sposta fondi tra i tuoi mint tramite Lightning. Potrebbero esserci commissioni.",
      inputs: {
        from: {
          label: "Da",
        },
        to: {
          label: "A",
        },
        amount: {
          label: "Importo ({ ticker })",
        },
      },
      actions: {
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
      },
    },
    error_badge: "Errore",
    switching_mint: "Passaggio a {mint}",
    reviews_text: "recensione | recensioni",
    no_reviews_yet: "Nessuna recensione ancora",
    discover_mints_button: "Scopri mints",
  },
  QrcodeReader: {
    progress: {
      text: "{ percentage }{ addon }",
      percentage: "{ percentage }%",
      keep_scanning_text: " - Continua a scansionare",
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
    title: "Ricevi Lightning",
    actions: {
      create: {
        label: "Crea fattura",
        label_blocked: "Creazione fattura",
      },
    },
    invoice: {
      caption: "Fattura Lightning",
      status_paid_text: "Pagata",
      actions: {
        copy: {
          label: "Copia fattura",
        },
      },
    },
  },
  SendDialog: {
    captions: {
      ecash: "Condividi un token o un codice QR",
      lightning: "Paga una fattura o un indirizzo",
      onchain: "Invia a un indirizzo Bitcoin",
    },
    title: "Invia",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Nessun mint disponibile",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "Nessun mint disponibile",
      },
    },
  },
  SendTokenDialog: {
    badge_locked: "bloccato",
    title: "Invia ecash",
    inputs: {
      p2pk_pubkey: {
        label: "Chiave pubblica ricevitore",
        invalid: "Inserisci una chiave pubblica valida (hex o npub)",
      },
    },
    actions: {
      copy_emoji: {
        tooltip_text: "Copia emoji",
      },
      copy_tokens: {
        label: "Copia ecash",
      },
      copy_link: {
        tooltip_text: "Copia link",
      },
      share: {
        tooltip_text: "Condividi ecash",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      paste_p2pk_pubkey: {
        tooltip_text: "@:global.actions.paste.label",
      },
      send: {
        label: "@:global.actions.send.label",
        in_progress: "Invio…",
      },
      delete: {
        tooltip_text: "Elimina dalla cronologia",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "Scrivi su scheda NFC",
        },
      },
      pay: { label: "@:global.actions.pay.label" },
    },
    errors: {
      amount_required: "Inserisci prima un importo.",
      serialization_failed: "Impossibile preparare il token ecash.",
      mint_not_allowed_by_request:
        "Il mint selezionato non è accettato da questa richiesta di pagamento.",
    },
  },
  ReceiveDialog: {
    captions: {
      ecash: "Incolla, scansiona o richiedi un token",
      lightning: "Crea una fattura per farti pagare",
      onchain: "Ottieni un indirizzo Bitcoin",
    },
    title: "Ricevi",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Nessun mint disponibile",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "Devi connetterti a un mint per ricevere via Lightning",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "Ricevi ecash",
    actions: {
      paste: {
        label: "Incolla token",
      },
      scan: {
        label: "Scansiona token",
      },
      request: {
        label: "Richiedi ecash",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      nfc: {
        label: "NFC",
        scanning_text: "Scansione…",
      },
    },
  },
  ReceiveTokenDialog: {
    receiving_amount: "Ricezione di {amount}",
    title: "Ricevi ecash",
    errors: {
      invalid_token: {
        label: "Token non valido",
      },
      p2pk_lock_mismatch: {
        label:
          "Impossibile ricevere. Il blocco P2PK di questo token non corrisponde alla tua chiave pubblica.",
      },
    },
    actions: {
      receive: {
        label: "@:global.actions.receive.label",
        label_known_mint: "@:ReceiveTokenDialog.actions.receive.label",
        label_adding_mint: "Aggiunta mint…",
      },
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "Scambia verso un mint fidato",
        processing: "Scambio in corso…",
        failed: "Scambio non riuscito",
      },
      cancel_swap: {
        tooltip_text: "Annulla scambio",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
      },
      later: {
        label: "Ricevi più tardi",
        tooltip_text: "Aggiungi alla cronologia per ricevere dopo",
        already_in_history_success_text: "Ecash già nella cronologia",
        added_to_history_success_text: "Ecash aggiunto alla cronologia",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Leggi da scheda NFC",
        },
      },
      receive_to_selected_mint: { label: "Ricevi sul mint selezionato" },
    },
    unknown_mint_info_text:
      "Mint sconosciuto. Verrà aggiunto dopo che avrai ricevuto questo token.",
    swap_section: {
      title: "Scambio",
      source_label: "Da",
      destination_label: "A",
      fee_info: "Questo scambio comporta commissioni della rete Lightning.",
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "Chiave di blocco",
      description: "Ricevi ecash bloccato su questa chiave",
      used_warning_text:
        "Attenzione: Questa chiave è stata usata prima. Usa una chiave nuova per maggiore privacy.",
    },
    actions: {
      copy: {
        label: "Copia chiave pubblica",
      },
      new_key: {
        label: "Genera nuova chiave",
      },
    },
  },
  PaymentRequestDialog: {
    any_amount: "Qualsiasi importo",
    payment_request: {
      caption: "Richiesta di pagamento",
    },
    request_index: "Richiesta {index} di {total}",
    actions: {
      set_amount: {
        label: "Imposta importo",
      },
      copy: {
        label: "@:global.actions.copy.label",
      },
      new_request: {
        label: "Nuova richiesta",
      },
      share: {
        label: "Condividi",
      },
      add_amount: {
        label: "Aggiungi importo",
      },
      use_active_mint: {
        label: "Qualsiasi mint",
      },
      remove_amount: {
        label: "Rimuovi importo",
      },
      previous: {
        label: "Richiesta precedente",
      },
      next: {
        label: "Richiesta successiva",
      },
    },
    inputs: {
      amount: {
        placeholder: "Inserisci importo",
      },
    },
    received_total: "Totale ricevuto",
    no_payments_yet: "Ancora nessun pagamento",
  },
  NWCDialog: {
    nwc: {
      caption: "Nostr Wallet Connect",
      description:
        "Controlla il tuo portafoglio remotamente con NWC. Premi il codice QR per collegare il tuo portafoglio con un'app compatibile.",
      warning_text:
        "Attenzione: chiunque abbia accesso a questa stringa di connessione può avviare pagamenti dal tuo portafoglio. Non condividerla!",
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
    title: "Messaggio del mint",
  },
  MintDetailsDialog: {
    qr: {
      show: "Mostra codice QR",
      hide: "Nascondi codice QR",
    },
    contact: {
      title: "Contatto",
      email: "Email",
    },
    details: {
      title: "Dettagli mint",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Funzioni supportate",
        actions: {
          show: {
            label: "Vedi tutto",
          },
          hide: {
            label: "Nascondi",
          },
        },
      },
      currency: {
        label: "Unità",
      },
      currencies: {
        label: "@:MintDetailsDialog.details.currency.label",
      },
      version: {
        label: "Versione",
      },
    },
    actions: {
      title: "Azioni",
      copy_mint_url: {
        label: "Copia URL mint",
      },
      delete: {
        label: "Elimina mint",
      },
      edit: {
        label: "Modifica mint",
      },
    },
    nuts: {
      nut7: "Verifica dello stato dei token",
      nut8: "Commissioni Lightning pagate in eccesso",
      nut9: "Ripristino delle firme",
      nut10: "Condizioni di spesa",
      nut11: "Pay-to-Pubkey (P2PK)",
      nut12: "Prove DLEQ",
      nut13: "Segreti deterministici",
      nut14: "Hashed Timelock Contracts (HTLC)",
      nut15: "Pagamenti multi-percorso parziali",
      nut16: "Codici QR animati",
      nut17: "Sottoscrizioni WebSocket",
      nut18: "Richieste di pagamento",
      nut19: "Risposte in cache",
      nut20: "Firma sul preventivo di mint",
      nut21: "Autenticazione in chiaro",
      nut22: "Autenticazione cieca",
    },
  },
  UnitToggle: {
    label: "Unità: {unit}, cambia",
    bitcoin: "Bitcoin",
  },
  ChooseMint: {
    open_selector: "Seleziona mint, mint attuale: {mint}",
    open_selector_empty: "Seleziona mint",
    title: "Seleziona un mint",
    badge_mint_error_text: "Errore",
    available_text: "su questo mint",
    sheet_title: "Seleziona mint",
    placeholder: "Seleziona un mint",
  },
  HistoryTable: {
    empty_text: "Nessuna cronologia ancora",
    empty_hint: "Qui compaiono i pagamenti che invii e ricevi.",
    filters: {
      title: "Filtra cronologia",
      direction: "Direzione",
      type: "Tipo",
      all: "Tutti",
      all_mints: "Tutte le mint",
      completed: "Completato",
      received: "Ricevuto",
      sent: "Inviato",
      show_results: "Mostra risultati ({count})",
      reset: "Reimposta",
      clear_all: "Rimuovi tutto",
      remove: "Rimuovi filtro: {label}",
      empty_title: "Nessun pagamento corrisponde ai filtri",
      clear: "Rimuovi filtri",
      count: "{shown} di {total}",
      active: "Filtra cronologia, {count} attivi",
    },
    row: {
      type_label: "Ecash",
    },
    actions: {
      check_status: {
        tooltip_text: "Verifica stato",
      },
      receive: {
        tooltip_text: "Ricevi",
      },
    },
    old_token_not_found_error_text: "Vecchio token non trovato",
    labels: {
      onchain_subpayment: "Pagamento parziale on-chain",
      bolt12_subpayment: "Pagamento parziale BOLT12",
    },
  },
  InvoiceTable: {
    row: {
      type_label: "Lightning",
    },
  },
  RemoveMintDialog: {
    title: "Rimuovere questo mint?",
    nickname: {
      label: "Nickname",
    },
    balances: {
      label: "Saldo su questo mint",
    },
    warning_text:
      "Il tuo ecash di questo mint resta su questo dispositivo. Riappare se aggiungi di nuovo il mint.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "Rimuovi mint",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  ParseInputComponent: {
    placeholder: {
      default: "Token Cashu o indirizzo Lightning",
      receive: "Token Cashu",
      pay: "Indirizzo Lightning o fattura",
    },
    qr_scanner: {
      title: "Scansiona codice QR",
      description: "Inquadra un codice QR con la fotocamera",
      caption_address: "Tocca per scansionare un indirizzo",
      caption_token: "Tocca per scansionare un token",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    onchain: {
      title: "Paga on-chain",
      address_placeholder: "Indirizzo Bitcoin",
      choose_speed: "Scegli la velocità di conferma",
      blocks: "{n} blocco | {n} blocchi",
      estimated_confirmation: "Conferma stimata",
      fee_reserve: "riserva commissioni",
    },
    multinut: {
      label: "Paga con più mint",
    },
    quote: {
      label: "Preventivo",
    },
    input_data: {
      title: "Paga con Lightning",
      title_bolt12: "Paga un'offerta Lightning",
    },
    lnurlpay: {
      amount_exact_label: "{ payee } richiede { value } { ticker }",
      amount_range_label:
        "{ payee } richiede{br}tra { min } e { max } { ticker }",
      sending_to_lightning_address: "Invio a { address }",
      inputs: {
        comment: {
          label: "Commento (opzionale)",
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
      paying: "Pagamento in corso",
      paid: "Pagato",
      fee: "Commissione",
      memo: {
        label: "Memo",
      },
      processing_info_text: "Elaborazione…",
      balance_too_low_warning_text: "Saldo troppo basso",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        pay: {
          label: "Paga",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
          waiting_for_wallet: "In attesa del portafoglio…",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Modifica mint",
    inputs: {
      nickname: {
        label: "Soprannome (facoltativo)",
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
    title: "Ti fidi di questo mint?",
    description:
      "Unisciti a questo mint solo se ti fidi. Se smette di operare, l'ecash che hai presso di esso va perso.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
        in_progress: "Aggiunta mint",
      },
    },
    audit_info: {
      label: "Info di audit",
      actions: {
        show: {
          label: "Mostra",
        },
        hide: {
          label: "Nascondi",
        },
      },
    },
    unreachable_error_text:
      "Questo mint non è raggiungibile. Controlla l'URL e la connessione, poi riprova.",
  },
  restore: {
    mnemonic_error_text: "Inserisci un mnemonico",
    restore_mint_error_text: "Errore nel ripristino del mint: { error }",
    prepare_info_text: "Preparazione processo di ripristino…",
    restored_proofs_for_keyset_info_text:
      "Ripristinate { restoreCounter } prove per keyset { keysetId }",
    checking_proofs_for_keyset_info_text:
      "Verifica prove da { startIndex } a { endIndex } per keyset { keysetId }",
    no_proofs_info_text: "Nessuna prova trovata da ripristinare",
    restored_amount_success_text: "Ripristinato { amount }",
  },
  swap: {
    in_progress_warning_text: "Scambio in corso",
    invalid_swap_data_error_text: "Dati di scambio non validi",
    swap_error_text: "Errore durante lo scambio",
  },
  TokenInformation: {
    fee: "Commissione",
    token: "Token",
    unit: "Unità",
    fiat: "Fiat",
    p2pk: "P2PK",
    locked: "Bloccato",
    locked_to_you: "Bloccato per te",
    mint: "Zecca",
    memo: "Memo",
    payment_request: "Richiesta di pagamento",
    nostr: "Nostr",
    token_copied: "Token copiato negli appunti",
  },
  ActivityRow: {
    received: "Ricevuto",
    sent: "Inviato",
    receiving: "In ricezione",
    sending: "In invio",
  },
  common: {
    copied: "Copiato",
    on_chain: "On-chain",
    pending: "In sospeso",
    delete: "Elimina",
    copy_npub: "Copia npub",
    back: "Indietro",
    refresh: "Aggiorna",
    settings: "Impostazioni",
    backspace: "Cancella",
    enter_amount_in: "Inserisci l'importo in {fiat}",
    something_went_wrong: "Qualcosa è andato storto",
  },
  SendPaymentRequest: {
    actions: {
      pay: { label: "Paga" },
      pay_via: { label: "Paga tramite {transport}" },
    },
    info: {
      pay_failed: "Impossibile pagare la richiesta",
      no_ecash: "Nessun ecash disponibile per questa richiesta di pagamento",
    },
  },
  PaymentRequestInfo: {
    title_with_transport: "Richiesta di pagamento tramite {transport}",
    title: "Richiesta di pagamento",
    subtitle: "Paga a {target}",
    subtitle_fallback: "Richiesta di pagamento",
    invalid_url: "URL non valido",
  },
  QuoteInformation: {
    address: "Indirizzo",
    invoice: "Fattura",
    request: "Richiesta",
    amount: "Importo",
    fee_reserve: "Riserva commissioni",
    fee_paid: "Commissione pagata",
    unit: "Unità",
    status: "Stato",
    network: "Rete",
    transaction_id: "ID transazione",
    confirmations: "Conferme",
    paid_at: "Pagato il",
    preimage: "Preimmagine",
    preimage_copied: "Preimmagine copiata",
    mint: "Mint",
    method: "Metodo",
    lightning_offer: "Offerta Lightning",
    states: {
      waiting: "In attesa di pagamento",
      confirming: "Conferma in corso ({count}/{threshold})",
      issuing: "Emissione ecash",
      paid: "Pagata",
      unpaid: "Non pagata",
      pending: "In sospeso",
      issued: "Emessa",
      expired: "Scaduta",
      failed: "Non riuscita",
    },
  },
  MintAuditInfo: {
    title: "Info audit",
    loading: "Caricamento info audit...",
    not_audited: "Questo mint non è ancora stato verificato.",
    not_audited_text:
      "Per saperne di più sul revisore o sostenere una futura verifica, visita {link} oppure fai clic {here} per donare ecash e aiutare ad avviare la verifica di questo mint.",
    here: "qui",
    unavailable: "Le info audit non sono disponibili al momento.",
    load_failed: "Impossibile caricare i dati del mint",
    success_rate: "Tasso di successo",
    swaps_count: "{successful} su {total} scambi",
    average_time: "Tempo medio",
    average_time_caption: "Per gli scambi riusciti",
    disclaimer:
      "I dati di verifica sono forniti da terze parti indipendenti per aiutare a valutare l'affidabilità di un mint nel tempo. Tuttavia, questi risultati sono solo informativi e non garantiscono la sicurezza, la solvibilità o l'affidabilità di alcun mint. Fai sempre le tue ricerche e assicurati di fidarti del gestore del mint prima di usarne i servizi.",
    donate_text:
      "Le informazioni di verifica sono fornite da {link}. Il saldo attuale detenuto dal revisore per questo mint è di {balance}, con un totale di {donations} donati finora. Per sostenere le verifiche, puoi {press_here} per donare ecash al revisore.",
    press_here: "premere qui",
    sats_amount: "{amount} sats",
    warnings_title: "Avvisi del revisore",
    warnings: {
      last_swap_failed: "L'ultimo tentativo di scambio non è riuscito.",
      recent_success:
        "{successful} scambi su {total} negli ultimi {days} giorni sono riusciti.",
      reliable:
        "{base} Tuttavia, {success} Questo mint sembra affidabile, gli errori potrebbero dipendere dal mint ricevente.",
      unreliable:
        "{base} Solo {success} Questo mint potrebbe non essere affidabile.",
      unknown:
        "Il revisore non è ancora riuscito a determinare la qualità di questo mint.",
      not_enough_data:
        "Il revisore non ha abbastanza dati recenti su questo mint. C'è stato solo {count} scambio riuscito negli ultimi {days} giorni. | Il revisore non ha abbastanza dati recenti su questo mint. Ci sono stati solo {count} scambi riusciti negli ultimi {days} giorni.",
      low_success:
        "Negli ultimi {days} giorni, questo mint ha avuto un tasso di successo del {rate}%, inferiore al {threshold}% consigliato.",
      inactive:
        "Questo mint non ha avuto scambi per {days} giorno. Potrebbe essere irraggiungibile. | Questo mint non ha avuto scambi per {days} giorni. Potrebbe essere irraggiungibile.",
      slow: "Questo mint è lento. I pagamenti da questo mint hanno richiesto in media {seconds} secondi.",
      no_successful:
        "Nessuno scambio riuscito registrato per questo mint. Potrebbe essere irraggiungibile.",
    },
    chart: {
      now: "Ora",
      today: "Oggi",
      yesterday: "Ieri",
      invalid_date: "Data non valida",
      swaps: "Scambi:",
      success_rate: "Tasso di successo:",
      time_range: "Intervallo di tempo:",
    },
  },
  DisplayTokenComponent: {
    title: {
      send: "Invia ecash",
      sent: "Ecash inviato",
      received: "Ecash ricevuto",
    },
    qr_speed: "Velocità QR: {value}",
    qr_density: "Densità QR: {value}",
    speed: {
      fast: "Veloce",
      medium: "Media",
      slow: "Lenta",
    },
    density: {
      high: "Alta",
      medium: "Media",
      low: "Bassa",
    },
    delete_dialog: {
      title: "Elimina ecash",
      text: "Vuoi davvero eliminare questa transazione dalla cronologia?",
      warning:
        "Attenzione: questa azione non può essere annullata e non sarà possibile recuperare il token.",
    },
    nfc: {
      read_failed: "Lettura NFC non riuscita",
      write_failed: "Scrittura NFC non riuscita",
      error: "Errore NFC",
      writing: "Scrittura sulla carta NFC...",
      success: "Token scritto sulla carta con successo!",
      capacity:
        "La carta potrebbe non avere capacità sufficiente (servono {bytes} byte).",
    },
  },
  CreateInvoiceDialog: {
    format_label: "Tipo di richiesta",
    formats: {
      bolt11: "Fattura",
      bolt12: "Offerta",
    },
    onchain_title: "Ricevi on-chain",
    bolt12_title: "Ricevi Bolt12",
    mint_unreachable: "Mint irraggiungibile",
    mint_unreachable_text: "Riconnettiti al mint per ricevere pagamenti.",
    reconnect_mint: "Riconnetti mint",
    checking_address: "Verifica dell'indirizzo...",
    add_amount: "Aggiungi importo",
    new_offer: "Nuova offerta",
    create_offer: "Crea offerta",
    create_new_address: "Crea nuovo indirizzo",
    create_address: "Crea indirizzo",
    onchain_unsupported:
      "Questo mint non supporta depositi on-chain in questa unità.",
    deposit_limits: {
      outside:
        "I depositi al di fuori di {min}–{max} non verranno accreditati.",
      below: "I depositi inferiori a {min} non verranno accreditati.",
      above: "I depositi superiori a {max} non verranno accreditati.",
    },
    amount_errors: {
      positive_decimal:
        "Inserisci un importo positivo in {unit} con al massimo due decimali.",
      positive_whole: "Inserisci un importo intero positivo in {unit}.",
      min: "Inserisci almeno {amount}.",
      max: "Inserisci al massimo {amount}.",
    },
  },
  storage: {
    notifications: {
      unrecognized_backup: "Formato di backup non riconosciuto",
      backup_restored: "Backup ripristinato",
      backup_exported: "Backup del portafoglio esportato",
      quota_exceeded:
        "La memoria locale è piena. Libera spazio nella memoria locale.",
      cleaned_up: "Liberati {size} byte",
    },
  },
  receiveTokens: {
    notifications: {
      already_in_history: "Token già nella cronologia",
      nfc_read_failed: "Impossibile leggere i dati dal tag NFC",
      scan_error: "Errore di scansione",
      nfc_error: "Errore NFC",
    },
  },
  nostrMintBackup: {
    notifications: {
      no_relays: "Nessun relay Nostr configurato",
      backup_failed: "Impossibile eseguire il backup dell'elenco mint su Nostr",
      backed_up: "Backup dell'elenco mint salvato su Nostr",
      found:
        "Trovato {count} mint nei backup Nostr | Trovati {count} mint nei backup Nostr",
      none_found:
        "Nessun backup dei mint trovato su Nostr per questa frase seed",
      search_failed: "Impossibile cercare i backup dei mint",
      add_mint_failed: "Impossibile aggiungere {mint}",
      added:
        "Aggiunto {count} mint al tuo portafoglio | Aggiunti {count} mint al tuo portafoglio",
      none_added: "Nessun nuovo mint aggiunto",
      add_selected_failed: "Impossibile aggiungere i mint selezionati",
    },
  },
  nostr: {
    notifications: {
      nip04_published: "Evento NIP-04 pubblicato",
      nip04_failed: "Impossibile pubblicare l'evento NIP-04",
      nip17_failed: "Impossibile pubblicare l'evento NIP-17",
      receive_failed: "Impossibile ricevere il pagamento in arrivo",
      ecash_already_in_history: "Ecash già nella cronologia",
      ecash_added: "Ecash aggiunto alla cronologia",
    },
  },
  nwc: {
    notifications: {
      melt_quote_failed: "NWC: impossibile richiedere un preventivo di melt",
      unit_must_be_sat: "NWC: l'unità attiva deve essere sats",
      allowance_exceeded: "NWC: limite superato",
    },
  },
  npubcash: {
    notifications: {
      could_not_update_mint: "Impossibile aggiornare il mint npub.cash",
      add_mint_first: "Aggiungi prima {mint} al tuo portafoglio",
    },
  },
};
