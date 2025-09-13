export default {
  global: {
    copy_to_clipboard: {
      success: "Copiato negli appunti!",
    },
    actions: {
      add_mint: {
        label: "Aggiungi mint",
      },
      cancel: {
        label: "Annulla",
      },
      copy: {
        label: "Copia",
      },
      close: {
        label: "Chiudi",
      },
      enter: {
        label: "Invio",
      },
      lock: {
        label: "Blocca",
      },
      paste: {
        label: "Incolla",
      },
      receive: {
        label: "Ricevi",
      },
      scan: {
        label: "Scansiona",
      },
      send: {
        label: "Invia",
      },
      swap: {
        label: "Scambia",
      },
      update: {
        label: "Aggiorna",
      },
    },
    inputs: {
      mint_url: {
        label: "URL Mint",
      },
    },
  },
  wallet: {
    notifications: {
      balance_too_low: "Il saldo è troppo basso",
      received: "Ricevuto {amount}",
      fee: " (commissione: {fee})",
      could_not_request_mint: "Impossibile richiedere coniazione",
      invoice_still_pending: "Fattura ancora in attesa",
      paid_lightning: "Pagato {amount} tramite Lightning",
      payment_pending_refresh:
        "Pagamento in attesa. Aggiorna la fattura manualmente.",
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
      please_try_again: "Si prega di riprovare.",
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
        could_not_get_info: "Impossibile ottenere informazioni sul mint",
        could_not_get_keys: "Impossibile ottenere le chiavi del mint",
        could_not_get_keysets: "Impossibile ottenere i keysets del mint",
        removed: "Mint rimosso",
        error: "Errore mint",
      },
    },
  },
  MainHeader: {
    menu: {
      settings: {
        title: "Impostazioni",
        settings: {
          title: "Impostazioni",
          caption: "Configurazione portafoglio",
        },
      },
      terms: {
        title: "Termini",
        terms: {
          title: "Termini",
          caption: "Termini di Servizio",
        },
      },
      links: {
        title: "Link",
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
  FullscreenHeader: {
    actions: {
      back: {
        label: "Portafoglio",
      },
    },
  },
  Settings: {
    language: {
      title: "Lingua",
      description: "Seleziona la tua lingua preferita dall'elenco sottostante.",
    },
    sections: {
      backup_restore: "BACKUP E RIPRISTINO",
      lightning_address: "INDIRIZZO LIGHTNING",
      nostr_keys: "CHIAVI NOSTR",
      nostr: "NOSTR",
      payment_requests: "RICHIESTE DI PAGAMENTO",
      nostr_wallet_connect: "NOSTR WALLET CONNECT",
      hardware_features: "FUNZIONALITÀ HARDWARE",
      p2pk_features: "FUNZIONALITÀ P2PK",
      privacy: "PRIVACY",
      experimental: "SPERIMENTALE",
      appearance: "ASPETTO",
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
          "La procedura guidata di ripristino consente di recuperare ecash perso da una frase mnemonica. La frase seed del tuo portafoglio attuale rimarrà inalterata, la procedura guidata ti consentirà solo di ripristinare ecash da un'altra frase seed.",
        button: "Ripristina",
      },
    },
    lightning_address: {
      title: "Indirizzo Lightning",
      description: "Ricevi pagamenti al tuo indirizzo Lightning.",
      enable: {
        toggle: "Abilita",
        description: "Indirizzo Lightning con npub.cash",
      },
      address: {
        copy_tooltip: "Copia indirizzo Lightning",
      },
      automatic_claim: {
        toggle: "Richiedi automaticamente",
        description: "Ricevi pagamenti in entrata automaticamente.",
      },
    },
    nostr_keys: {
      title: "Le tue chiavi nostr",
      description: "Imposta le chiavi nostr per il tuo indirizzo Lightning.",
      wallet_seed: {
        title: "Frase seed del portafoglio",
        description: "Genera coppia di chiavi nostr dalla seed del portafoglio",
        copy_nsec: "Copia nsec",
      },
      nsec_bunker: {
        title: "Nsec Bunker",
        description: "Usa un bunker NIP-46",
        delete_tooltip: "Elimina connessione",
      },
      use_nsec: {
        title: "Usa la tua nsec",
        description: "Questo metodo è pericoloso e non raccomandato",
        delete_tooltip: "Elimina nsec",
      },
      signing_extension: {
        title: "Estensione di firma",
        description: "Usa un'estensione di firma NIP-07",
        not_found: "Nessuna estensione di firma NIP-07 trovata",
      },
    },
    nostr: {
      title: "NOSTR",
      relays: {
        expand_label: "Clicca per modificare i relay",
        add: {
          title: "Aggiungi relay",
          description:
            "Il tuo portafoglio utilizza questi relay per le operazioni nostr come richieste di pagamento, nostr wallet connect e backup.",
        },
        list: {
          title: "Relay",
          description: "Il tuo portafoglio si connetterà a questi relay.",
          copy_tooltip: "Copia relay",
          remove_tooltip: "Rimuovi relay",
        },
      },
    },
    payment_requests: {
      title: "Richieste di pagamento",
      description:
        "Le richieste di pagamento ti permettono di ricevere pagamenti via nostr. Se abiliti questa opzione, il tuo portafoglio si iscriverà ai tuoi relay nostr.",
      enable_toggle: "Abilita Richieste di Pagamento",
      claim_automatically: {
        toggle: "Richiedi automaticamente",
        description: "Ricevi pagamenti in entrata automaticamente.",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Wallet Connect (NWC)",
      description:
        "Usa NWC per controllare il tuo portafoglio da qualsiasi altra applicazione.",
      enable_toggle: "Abilita NWC",
      payments_note:
        "Puoi usare NWC solo per pagamenti dal tuo saldo Bitcoin. I pagamenti verranno effettuati dal tuo mint attivo.",
      connection: {
        copy_tooltip: "Copia stringa di connessione",
        qr_tooltip: "Mostra codice QR",
        allowance_label: "Limite rimasto (sat)",
      },
      relays: {
        expand_label: "Clicca per modificare i relay",
        add: {
          title: "Aggiungi relay",
          description:
            "Nostr Wallet Connect usa relay nostr per connettere il tuo portafoglio ad altre applicazioni.",
        },
        list: {
          title: "Relay",
          description: "Il tuo portafoglio si connetterà a questi relay.",
          copy_tooltip: "Copia relay",
          remove_tooltip: "Rimuovi relay",
        },
      },
    },
    hardware_features: {
      webnfc: {
        title: "WebNFC",
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
          description: "Memorizza i token come dati binari",
        },
        quick_access: {
          toggle: "Accesso rapido NFC",
          description:
            "Scansiona rapidamente schede NFC nel menu Ricevi Ecash. Questa opzione aggiunge un pulsante NFC al menu Ricevi Ecash.",
        },
      },
    },
    p2pk_features: {
      title: "P2PK",
      description:
        "Genera una coppia di chiavi per ricevere ecash bloccato con P2PK. Attenzione: Questa funzionalità è sperimentale. Usare solo con piccole somme. Se perdi le tue chiavi private, nessuno sarà più in grado di sbloccare l'ecash ad esse associato.",
      generate_button: "Genera chiave",
      import_button: "Importa nsec",
      quick_access: {
        toggle: "Accesso rapido al blocco",
        description:
          "Usa questo per mostrare rapidamente la tua chiave di blocco P2PK nel menu ricevi ecash.",
      },
      keys_expansion: {
        label: "Clicca per sfogliare {count} chiavi",
        used_badge: "usata",
      },
    },
    privacy: {
      title: "Privacy",
      description: "Queste impostazioni influenzano la tua privacy.",
      check_incoming: {
        toggle: "Verifica fattura in entrata",
        description:
          "Se abilitato, il portafoglio verificherà l'ultima fattura in background. Questo aumenta la reattività del portafoglio, rendendo più facile il fingerprinting. Puoi verificare manualmente le fatture non pagate nella scheda Fatture.",
      },
      check_startup: {
        toggle: "Verifica fatture pendenti all'avvio",
        description:
          "Se abilitato, il portafoglio verificherà le fatture pendenti delle ultime 24 ore all'avvio.",
      },
      check_all: {
        toggle: "Verifica tutte le fatture",
        description:
          "Se abilitato, il portafoglio verificherà periodicamente le fatture non pagate in background per un massimo di due settimane. Questo aumenta l'attività online del portafoglio, rendendo più facile il fingerprinting. Puoi verificare manualmente le fatture non pagate nella scheda Fatture.",
      },
      check_sent: {
        toggle: "Verifica ecash inviato",
        description:
          "Se abilitato, il portafoglio userà controlli periodici in background per determinare se i token inviati sono stati riscattati. Questo aumenta l'attività online del portafoglio, rendendo più facile il fingerprinting.",
      },
      websockets: {
        toggle: "Usa WebSockets",
        description:
          "Se abilitato, il portafoglio userà connessioni WebSocket a lunga durata per ricevere aggiornamenti su fatture pagate e token spesi dai mints. Questo aumenta la reattività del portafoglio ma rende anche più facile il fingerprinting.",
      },
      bitcoin_price: {
        toggle: "Ottieni tasso di cambio da Coinbase",
        description:
          "Se abilitato, il tasso di cambio attuale di Bitcoin verrà recuperato da coinbase.com e verrà visualizzato il tuo saldo convertito.",
        currency: {
          title: "Valuta Fiat",
          description:
            "Scegli la valuta fiat per la visualizzazione del prezzo Bitcoin.",
        },
      },
    },
    experimental: {
      title: "Sperimentale",
      description: "Queste funzionalità sono sperimentali.",
      receive_swaps: {
        toggle: "Ricevi scambi",
        badge: "Beta",
        description:
          "Opzione per scambiare Ecash ricevuto al tuo mint attivo nella finestra di dialogo Ricevi Ecash.",
      },
      auto_paste: {
        toggle: "Incolla Ecash automaticamente",
        description:
          "Incolla automaticamente ecash nei tuoi appunti quando premi Ricevi, poi Ecash, poi Incolla. L'incollaggio automatico può causare problemi all'interfaccia utente su iOS, disattivalo se riscontri problemi.",
      },
      auditor: {
        toggle: "Abilita revisore",
        badge: "Beta",
        description:
          "Se abilitato, il portafoglio mostrerà le informazioni del revisore nella finestra di dialogo dei dettagli del mint. Il revisore è un servizio di terze parti che monitora l'affidabilità dei mints.",
        url_label: "URL Revisore",
        api_url_label: "URL API Revisore",
      },
    },
    appearance: {
      keyboard: {
        title: "Tastiera su schermo",
        description: "Usa la tastiera numerica per inserire importi.",
        toggle: "Usa tastiera numerica",
        toggle_description:
          "Se abilitato, verrà utilizzata la tastiera numerica per inserire gli importi.",
      },
      theme: {
        title: "Aspetto",
        description: "Cambia l'aspetto del tuo portafoglio.",
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
    },
    advanced: {
      title: "Avanzato",
      developer: {
        title: "Impostazioni sviluppatore",
        description: "Le seguenti impostazioni sono per sviluppo e debug.",
        new_seed: {
          button: "Genera nuova frase seed",
          description:
            "Questo genererà una nuova frase seed. Devi inviare l'intero saldo a te stesso per poterlo ripristinare con una nuova seed.",
          confirm_question:
            "Sei sicuro di voler generare una nuova frase seed?",
          cancel: "Annulla",
          confirm: "Conferma",
        },
        remove_spent: {
          button: "Rimuovi prove spese",
          description:
            "Verifica se i token ecash dai tuoi mints attivi sono spesi e rimuovi quelli spesi dal tuo portafoglio. Usalo solo se il tuo portafoglio è bloccato.",
        },
        debug_console: {
          button: "Attiva/disattiva Console di Debug",
          description:
            "Apri il terminale di debug Javascript. Non incollare mai nulla in questo terminale che non capisci. Un ladro potrebbe provare a ingannarti facendoti incollare codice malevolo qui.",
        },
        export_proofs: {
          button: "Esporta prove attive",
          description:
            "Copia l'intero saldo dal mint attivo come token Cashu nei tuoi appunti. Questo esporterà solo i token dal mint e unità selezionati. Per un'esportazione completa, seleziona un mint e un'unità diversi ed esporta di nuovo.",
        },
        keyset_counters: {
          title: "Incrementa contatori keyset",
          description:
            "Clicca l'ID del keyset per incrementare i contatori del percorso di derivazione per i keyset nel tuo portafoglio. Questo è utile se vedi l'errore \"le uscite sono già state firmate\".",
        },
        unset_reserved: {
          button: "Annulla prenotazione tutti i token riservati",
          description:
            'Questo portafoglio marca l\'ecash in uscita pendente come riservato (e lo sottrae dal tuo saldo) per prevenire tentativi di doppia spesa. Questo pulsante annullerà la prenotazione di tutti i token riservati così potranno essere usati di nuovo. Se fai questo, il tuo portafoglio potrebbe includere prove spese. Premi il pulsante "Rimuovi prove spese" per eliminarle.',
        },
        show_onboarding: {
          button: "Mostra onboarding",
          description: "Mostra di nuovo la schermata di onboarding.",
        },
        reset_wallet: {
          button: "Resetta dati portafoglio",
          description:
            "Resetta i dati del tuo portafoglio. Attenzione: Questo eliminerà tutto! Assicurati di creare prima un backup.",
          confirm_question:
            "Sei sicuro di voler eliminare i dati del tuo portafoglio?",
          cancel: "Annulla",
          confirm: "Elimina portafoglio",
        },
        export_wallet: {
          button: "Esporta dati portafoglio",
          description:
            "Scarica un dump del tuo portafoglio. Puoi ripristinare il tuo portafoglio da questo file nella schermata di benvenuto di un nuovo portafoglio. Questo file non sarà sincronizzato se continui a usare il tuo portafoglio dopo averlo esportato.",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Unisciti a un mint",
    subtitle:
      "Non ti sei ancora unito a nessun mint Cashu. Aggiungi un URL mint nelle impostazioni o ricevi ecash da un nuovo mint per iniziare.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Ricevi Ecash",
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
        label: "Cronologia",
      },
      invoices: {
        label: "Fatture",
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
    title: "Nope.",
    text: "Un'altra scheda è già in esecuzione. Chiudi questa scheda e riprova.",
    actions: {
      retry: {
        label: "Riprova",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Oops. Niente qui…",
    actions: {
      home: {
        label: "Torna alla home",
      },
    },
  },
  BalanceView: {
    mintUrl: {
      label: "Mint",
    },
    mintBalance: {
      label: "Saldo",
    },
    mintError: {
      label: "Errore mint",
    },
    pending: {
      label: "In attesa",
      tooltip: "Verifica tutti i token in attesa",
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
    title: "Benvenuto in Cashu",
    text: "Cashu.me è un portafoglio Bitcoin gratuito e open-source che utilizza ecash per mantenere i tuoi fondi sicuri e privati.",
    actions: {
      more: {
        label: "Clicca per saperne di più",
      },
    },
    p1: {
      text: "Cashu è un protocollo ecash gratuito e open-source per Bitcoin. Puoi saperne di più su { link }.",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "Questo portafoglio non è affiliato a nessun mint. Per usare questo portafoglio, devi connetterti a uno o più mints Cashu di cui ti fidi.",
    },
    p3: {
      text: "Questo portafoglio conserva ecash a cui solo tu hai accesso. Se elimini i dati del tuo browser senza un backup della frase seed, perderai i tuoi token.",
    },
    p4: {
      text: "Questo portafoglio è in beta. Non ci assumiamo alcuna responsabilità per le persone che perdono l'accesso ai fondi. Usalo a tuo rischio! Questo codice è open-source e licenziato sotto la licenza MIT.",
    },
  },
  WelcomeSlide2: {
    title: "Installa PWA",
    instruction: {
      intro: {
        text: "Per la migliore esperienza, usa questo portafoglio con il browser web nativo del tuo dispositivo per installarlo come App Web Progressiva. Fallo subito.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "Tocca il menu (in alto a destra)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Premi { buttonText }",
          buttonText: "@:AndroidPWAPrompt.buttonText",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "Tocca condividi (in basso)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Premi { buttonText }",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "Una volta installata questa app sul tuo dispositivo, chiudi questa finestra del browser e usa l'app dalla tua schermata home.",
      },
    },
    pwa: {
      success: {
        title: "Successo!",
        text: "Stai usando Cashu come PWA. Chiudi qualsiasi altra finestra del browser aperta e usa l'app dalla tua schermata home.",
      },
    },
  },
  iOSPWAPrompt: {
    text: "Tocca { icon } e { buttonText }",
    buttonText: "Aggiungi alla schermata Home",
  },
  AndroidPWAPrompt: {
    text: "Tocca { icon } e { buttonText }",
    buttonText: "Aggiungi alla schermata Home",
  },
  WelcomeSlide3: {
    title: "La tua Frase Seed",
    text: "Conserva la tua frase seed in un gestore di password o su carta. La tua frase seed è l'unico modo per recuperare i tuoi fondi se perdi l'accesso a questo dispositivo.",
    inputs: {
      seed_phrase: {
        label: "Frase Seed",
        caption: "Puoi vedere la tua frase seed nelle impostazioni.",
      },
      checkbox: {
        label: "L'ho scritta",
      },
    },
  },
  WelcomeSlide4: {
    title: "Termini",
    actions: {
      more: {
        label: "Leggi i Termini di Servizio",
      },
    },
    inputs: {
      checkbox: {
        label: "Ho letto e accetto questi termini e condizioni",
      },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "Ripristina da Frase Seed",
      caption:
        "Inserisci la tua frase seed per ripristinare il tuo portafoglio. Prima di ripristinare, assicurati di aver aggiunto tutti i mints che hai usato in precedenza.",
      inputs: {
        seed_phrase: {
          label: "Frase seed",
          caption: "Puoi vedere la tua frase seed nelle impostazioni.",
        },
      },
    },
    information: {
      label: "Informazioni",
      caption:
        "L'assistente ripristinerà solo ecash da un'altra frase seed, non potrai usare questa frase seed o cambiare la frase seed del portafoglio che stai usando attualmente. Ciò significa che l'ecash ripristinato non sarà protetto dalla tua frase seed attuale finché non invii l'ecash a te stesso una volta.",
    },
    restore_mints: {
      label: "Ripristina Mints",
      caption:
        'Seleziona il mint da ripristinare. Puoi aggiungere altri mints nella schermata principale sotto "Mints" e ripristinarli qui.',
    },
    actions: {
      paste: {
        error: "Impossibile leggere il contenuto degli appunti.",
      },
      validate: {
        error: "Il mnemonico dovrebbe essere di almeno 12 parole.",
      },
      restore: {
        label: "Ripristina",
        in_progress: "Ripristino mint in corso…",
        error: "Errore nel ripristino del mint: { error }",
      },
      restore_all_mints: {
        label: "Ripristina Tutti i Mints",
        in_progress: "Ripristino mint { index } di { length }…",
        success: "Ripristino completato con successo",
        error: "Errore nel ripristino dei mints: { error }",
      },
    },
  },
  MintSettings: {
    add: {
      title: "Aggiungi mint",
      description:
        "Inserisci l'URL di un mint Cashu per connetterti ad esso. Questo portafoglio non è affiliato a nessun mint.",
      inputs: {
        nickname: {
          placeholder: "Nickname (es. Testnet)",
        },
      },
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "URL non valido",
        },
        scan: {
          label: "Scansiona Codice QR",
        },
      },
    },
    discover: {
      title: "Scopri mints",
      overline: "Scopri",
      caption: "Scopri mints che altri utenti hanno raccomandato su nostr.",
      actions: {
        discover: {
          label: "Scopri mints",
          in_progress: "Caricamento…",
          error_no_mints: "Nessun mint trovato",
          success: "Trovati { length } mints",
        },
      },
      recommendations: {
        overline: "Trovati { length } mints",
        caption:
          "Questi mints sono stati raccomandati da altri utenti Nostr. Leggi le recensioni su { link }. Sii cauto e fai le tue ricerche prima di usare un mint.",
        actions: {
          browse: {
            label: "Clicca per sfogliare i mints",
          },
        },
      },
    },
    swap: {
      title: "Scambia",
      overline: "Scambi Multimint",
      caption:
        "Scambia fondi tra mints via Lightning. Nota: Lascia spazio per potenziali commissioni Lightning. Se il pagamento in entrata non riesce, controlla manualmente la fattura.",
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
    title: "Crea Fattura",
    inputs: {
      amount: {
        label: "Importo ({ ticker }) *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "Crea Fattura",
        label_blocked: "Creazione fattura…",
        in_progress: "Creazione",
      },
    },
    invoice: {
      caption: "Fattura Lightning",
      status_paid_text: "Pagata!",
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
    title: "Invia { value }",
    title_ecash_text: "Ecash",
    badge_offline_text: "Offline",
    inputs: {
      amount: {
        label: "Importo ({ ticker }) *",
        invalid_too_much_error_text: "Troppo",
      },
      p2pk_pubkey: {
        label: "Chiave pubblica ricevitore",
        label_invalid: "Chiave pubblica ricevitore non valida",
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
        tooltip_text: "Copia Emoji",
      },
      copy_tokens: {
        label: "@:global.actions.copy.label",
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
      },
      delete: {
        tooltip_text: "Elimina dalla cronologia",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "Scrivi su scheda NFC",
          ndef_unsupported_text: "NDEF non supportato",
        },
      },
    },
  },
  ReceiveDialog: {
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
    title: "Ricevi Ecash",
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      scan: {
        label: "@:global.actions.scan.label",
      },
      request: {
        label: "Richiedi",
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
    title: "Ricevi { value }",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "Incolla token Cashu",
      },
    },
    errors: {
      invalid_token: {
        label: "Token non valido",
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
        label_adding_mint: "Aggiunta mint…",
      },
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "Scambia verso un mint fidato",
        caption: "Scambia { value }",
      },
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "Annulla scambio",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      later: {
        label: "Più tardi",
        tooltip_text: "Aggiungi alla cronologia per ricevere dopo",
        already_in_history_success_text: "Ecash già nella Cronologia",
        added_to_history_success_text: "Ecash aggiunto alla Cronologia",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Leggi da scheda NFC",
          ndef_unsupported_text: "NDEF non supportato",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "Chiave P2PK",
      description: "Ricevi ecash bloccato su questa chiave",
      used_warning_text:
        "Attenzione: Questa chiave è stata usata prima. Usa una chiave nuova per maggiore privacy.",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_key: {
        label: "Genera nuova chiave",
      },
    },
  },
  PaymentRequestDialog: {
    payment_request: {
      caption: "Richiesta di Pagamento",
      description: "Ricevi pagamenti via Nostr",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "Nuova richiesta",
      },
      add_amount: {
        label: "Aggiungi importo",
      },
      use_active_mint: {
        label: "Qualsiasi mint",
      },
    },
    inputs: {
      amount: {
        placeholder: "Inserisci importo",
      },
    },
  },
  NumericKeyboard: {
    actions: {
      close: {
        label: "@:global.actions.close.label",
        closed_info_text:
          "Tastiera disabilitata. Puoi riabilitare la tastiera nelle impostazioni.",
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
    title: "Messaggio del Mint",
  },
  MintDetailsDialog: {
    contact: {
      title: "Contatto",
    },
    details: {
      title: "Dettagli mint",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Nuts",
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
        label: "Valuta",
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
  },
  ChooseMint: {
    title: "Seleziona un mint",
    badge_mint_error_text: "Errore",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
  },
  HistoryTable: {
    empty_text: "Nessuna cronologia ancora",
    row: {
      type_label: "Ecash",
      date_label: "{ value } fa",
    },
    actions: {
      check_status: {
        tooltip_text: "Verifica stato",
      },
      receive: {
        tooltip_text: "Ricevi",
      },
      filter_pending: {
        label: "Filtra pendenti",
      },
      show_all: {
        label: "Mostra tutto",
      },
    },
    old_token_not_found_error_text: "Vecchio token non trovato",
  },
  InvoiceTable: {
    empty_text: "Nessuna fattura ancora",
    row: {
      type_label: "Lightning",
      type_tooltip_text: "Clicca per copiare",
      date_label: "{ value } fa",
    },
    actions: {
      check_status: {
        tooltip_text: "Verifica stato",
      },
      filter_pending: {
        label: "Filtra pendenti",
      },
      show_all: {
        label: "Mostra tutto",
      },
    },
  },
  RemoveMintDialog: {
    title: "Sei sicuro di voler eliminare questo mint?",
    nickname: {
      label: "Nickname",
    },
    balances: {
      label: "Saldi",
    },
    warning_text:
      "Nota: Poiché questo portafoglio è paranoico, il tuo ecash da questo mint non verrà effettivamente eliminato ma rimarrà memorizzato sul tuo dispositivo. Lo vedrai riapparire se aggiungerai nuovamente questo mint in seguito.",
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
  PayInvoiceDialog: {
    input_data: {
      title: "Paga con Lightning",
      inputs: {
        invoice_data: {
          label: "Fattura o indirizzo Lightning",
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
      amount_exact_label: "{ payee } richiede { value } { ticker }",
      amount_range_label:
        "{ payee } richiede{br}tra { min } e { max } { ticker }",
      inputs: {
        amount: {
          label: "Importo ({ ticker }) *",
        },
        comment: {
          label: "Commento (opzionale)",
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
      title: "Paga { value }",
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
          error: "Errore",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Modifica mint",
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
    title: "Ti fidi di questo mint?",
    description:
      "Prima di usare questo mint, assicurati di fidarti. I mints potrebbero diventare malevoli o cessare l'attività in qualsiasi momento.",
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
        in_progress: "Aggiunta mint",
      },
    },
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
};
