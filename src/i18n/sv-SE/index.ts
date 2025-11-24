export default {
  MultinutPicker: {
    payment: "Multinut-betalning",
    selectMints: "Välj en eller flera mints att betala från.",
    totalSelectedBalance: "Totalt valt saldo",
    multiMintPay: "Multi-Mint-betalning",
    balanceNotEnough: "Multi-mint-saldo räcker inte för denna faktura",
    failed: "Misslyckades att behandla: {error}",
    paid: "Betalat {amount} via Lightning",
  },

  global: {
    copy_to_clipboard: {
      success: "Kopierat till urklipp!",
    },
    actions: {
      add_mint: {
        label: "Lägg till mint",
      },
      cancel: {
        label: "Avbryt",
      },
      copy: {
        label: "Kopiera",
      },
      close: {
        label: "Stäng",
      },
      enter: {
        label: "Ange",
      },
      lock: {
        label: "Lås",
      },
      paste: {
        label: "Klistra in",
      },
      receive: {
        label: "Ta emot",
      },
      scan: {
        label: "Skanna",
      },
      send: {
        label: "Skicka",
      },
      swap: {
        label: "Byt",
      },
      update: {
        label: "Uppdatera",
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
      balance_too_low: "Saldot är för lågt",
      received: "Mottaget {amount}",
      fee: " (avgift: {fee})",
      could_not_request_mint: "Kunde inte begära prägling",
      invoice_still_pending: "Fakturan väntar fortfarande",
      paid_lightning: "Betalat {amount} via Lightning",
      payment_pending_refresh: "Betalning väntar. Uppdatera fakturan manuellt.",
      sent: "Skickat {amount}",
      token_still_pending: "Token väntar fortfarande",
      received_lightning: "Mottaget {amount} via Lightning",
      lightning_payment_failed: "Lightning-betalning misslyckades",
      failed_to_decode_invoice: "Kunde inte avkoda fakturan",
      invalid_lnurl: "Ogiltig LNURL",
      lnurl_error: "LNURL-fel",
      no_amount: "Inget belopp",
      no_lnurl_data: "Ingen LNURL-data",
      no_price_data: "Ingen prisdata.",
      please_try_again: "Försök igen.",
    },
    mint: {
      notifications: {
        already_added: "Mint redan tillagd",
        added: "Mint tillagd",
        not_found: "Mint hittades inte",
        activation_failed: "Aktivering av mint misslyckades",
        no_active_mint: "Ingen aktiv mint",
        unit_activation_failed: "Aktivering av enhet misslyckades",
        unit_not_supported: "Enheten stöds inte av mint",
        activated: "Mint aktiverad",
        could_not_connect: "Kunde inte ansluta till mint",
        could_not_get_info: "Kunde inte hämta mint-information",
        could_not_get_keys: "Kunde inte hämta mint-nycklar",
        could_not_get_keysets: "Kunde inte hämta mint-nyckeluppsättningar",
        mint_validation_error: "Mint-valideringsfel",
        removed: "Mint borttagen",
        error: "Mint-fel",
      },
    },
  },
  MainHeader: {
    menu: {
      settings: {
        title: "Inställningar",
        settings: {
          title: "Inställningar",
          caption: "Plånboksinställningar",
        },
      },
      terms: {
        title: "Villkor",
        terms: {
          title: "Villkor",
          caption: "Användarvillkor",
        },
      },
      links: {
        title: "Länkar",
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
          title: "Donera",
          caption: "Stöd Cashu",
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
        text: "Laddar om om { countdown }",
      },
    },
    staging: {
      warning: {
        text: "Staging – använd inte med riktiga pengar!",
      },
    },
  },
  FullscreenHeader: {
    actions: {
      back: {
        label: "Plånbok",
      },
    },
  },
  Settings: {
    web_of_trust: {
      title: "Förtroendenätverk",
      known_pubkeys: "Kända pubkeys: {wotCount}",
      continue_crawl: "Fortsätt genomsökning",
      crawl_odell: "Genomsök ODELL'S WEB OF TRUST",
      crawl_wot: "Genomsök web of trust",
      pause: "Pausa",
      reset: "Återställ",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      use_npubx: "Använd npubx.cash",
      copy_lightning_address: "Kopiera Lightning-adress",
      v2_mint: "npub.cash v2 mint",
    },
    multinut: {
      use_multinut: "Använd Multinut",
    },
    language: {
      title: "Språk",
      description: "Välj önskat språk från listan nedan.",
    },
    sections: {
      backup_restore: "SÄKERHETSKOPIERING & ÅTERSTÄLLNING",
      lightning_address: "LIGHTNING ADRESS",
      nostr_keys: "NOSTR NYCKLAR",
      nostr: {
        title: "NOSTR",
        relays: {
          expand_label: "Klicka för att redigera reläer",
          add: {
            title: "Lägg till relä",
            description:
              "Din plånbok använder dessa reläer för nostr-operationer som betalningsförfrågningar, nostr wallet connect och säkerhetskopior.",
          },
          list: {
            title: "Reläer",
            description: "Din plånbok kommer att ansluta till dessa reläer.",
            copy_tooltip: "Kopiera relä",
            remove_tooltip: "Ta bort relä",
          },
        },
      },
      payment_requests: "BETALNINGSFÖRFRÅGNINGAR",
      nostr_wallet_connect: "NOSTR PLÅNBOKSANSLUTNING",
      hardware_features: "MASKINVARA FUNKTIONER",
      p2pk_features: "P2PK FUNKTIONER",
      privacy: "INTEGRITET",
      experimental: "EXPERIMENTELLA",
      appearance: "UTSEENDE",
    },
    backup_restore: {
      backup_seed: {
        title: "Säkerhetskopiera återställningsfras",
        description:
          "Din återställningsfras kan återställa din plånbok. Håll den säker och privat.",
        seed_phrase_label: "Återställningsfras",
      },
      restore_ecash: {
        title: "Återställ ecash",
        description:
          "Återställningsguiden låter dig återställa förlorad ecash från en mnemonisk återställningsfras. Din nuvarande plånboks återställningsfras kommer inte att påverkas, guiden tillåter dig endast att återställa ecash från en annan återställningsfras.",
        button: "Återställ",
      },
    },
    lightning_address: {
      title: "Lightning-adress",
      description: "Ta emot betalningar till din Lightning-adress.",
      enable: {
        toggle: "Aktivera",
        description: "Lightning-adress med npub.cash",
      },
      address: {
        copy_tooltip: "Kopiera Lightning-adress",
      },
      automatic_claim: {
        toggle: "Hämta automatiskt",
        description: "Ta emot inkommande betalningar automatiskt.",
      },
      npc_v2: {
        choose_mint_title: "Välj mint för npub.cash v2",
        choose_mint_placeholder: "Välj en mint...",
      },
    },
    nostr_keys: {
      title: "Dina nostr-nycklar",
      description: "Ställ in nostr-nycklarna för din Lightning-adress.",
      wallet_seed: {
        title: "Plånbokens återställningsfras",
        description:
          "Generera nostr nyckelpar från plånbokens återställningsfras",
        copy_nsec: "Kopiera nsec",
      },
      nsec_bunker: {
        title: "Nsec Bunker",
        description: "Använd en NIP-46 bunker",
        delete_tooltip: "Radera anslutning",
      },
      use_nsec: {
        title: "Använd din nsec",
        description: "Denna metod är farlig och rekommenderas inte",
        delete_tooltip: "Radera nsec",
      },
      signing_extension: {
        title: "Signeringsutökning",
        description: "Använd en NIP-07 signeringsutökning",
        not_found: "Ingen NIP-07 signeringsutökning hittades",
      },
    },
    payment_requests: {
      title: "Betalningsförfrågningar",
      description:
        "Betalningsförfrågningar gör det möjligt att ta emot betalningar via nostr. Om du aktiverar detta prenumererar din plånbok på dina nostr-reläer.",
      enable_toggle: "Aktivera betalningsförfrågningar",
      claim_automatically: {
        toggle: "Hämta automatiskt",
        description: "Ta emot inkommande betalningar automatiskt.",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Plånboksanslutning (NWC)",
      description:
        "Använd NWC för att styra din plånbok från valfri annan applikation.",
      enable_toggle: "Aktivera NWC",
      payments_note:
        "Du kan endast använda NWC för betalningar från ditt Bitcoin-saldo. Betalningar kommer att göras från din aktiva mint.",
      connection: {
        copy_tooltip: "Kopiera anslutningssträng",
        qr_tooltip: "Visa QR-kod",
        allowance_label: "Tillåtelse kvar (sat)",
      },
    },
    hardware_features: {
      webnfc: {
        title: "WebNFC",
        description: "Välj kodning för att skriva till NFC-kort",
        text: {
          title: "Text",
          description: "Spara token i klartext",
        },
        weburl: {
          title: "URL",
          description: "Spara URL till denna plånbok med token",
        },
        binary: {
          title: "Binär",
          description: "Lagra tokens som binärdata",
        },
        quick_access: {
          toggle: "Snabb åtkomst till NFC",
          description:
            "Skanna snabbt NFC-kort i Ta emot Ecash-menyn. Detta alternativ lägger till en NFC-knapp i Ta emot Ecash-menyn.",
        },
      },
    },
    p2pk_features: {
      title: "P2PK",
      description:
        "Generera ett nyckelpar för att ta emot P2PK-låst ecash. Varning: Denna funktion är experimentell. Använd endast med små belopp. Om du förlorar dina privata nycklar kommer ingen att kunna låsa upp ecash som är låst till den längre.",
      generate_button: "Generera nyckel",
      import_button: "Importera nsec",
      quick_access: {
        toggle: "Snabb åtkomst till lås",
        description:
          "Använd detta för att snabbt visa din P2PK låsningsnyckel i menyn för att ta emot ecash.",
      },
      keys_expansion: {
        label: "Klicka för att bläddra bland {count} nycklar",
        used_badge: "använd",
      },
    },
    privacy: {
      title: "Integritet",
      description: "Dessa inställningar påverkar din integritet.",
      check_incoming: {
        toggle: "Kontrollera inkommande faktura",
        description:
          "Om aktiverat kommer plånboken att kontrollera den senaste fakturan i bakgrunden. Detta ökar plånbokens responsivitet vilket gör fingeravtryckning enklare. Du kan manuellt kontrollera obetalda fakturor under fliken Fakturor.",
      },
      check_startup: {
        toggle: "Kontrollera väntande fakturor vid start",
        description:
          "Om aktiverat kommer plånboken att kontrollera väntande fakturor från de senaste 24 timmarna vid start.",
      },
      check_all: {
        toggle: "Kontrollera alla fakturor",
        description:
          "Om aktiverat kommer plånboken periodvis att kontrollera obetalda fakturor i bakgrunden i upp till två veckor. Detta ökar plånbokens online-aktivitet vilket gör fingeravtryckning enklare. Du kan manuellt kontrollera obetalda fakturor under fliken Fakturor.",
      },
      check_sent: {
        toggle: "Kontrollera skickad ecash",
        description:
          "Om aktiverat kommer plånboken att använda periodiska bakgrundskontroller för att avgöra om skickade tokens har lösts in. Detta ökar plånbokens online-aktivitet vilket gör fingeravtryckning enklare.",
      },
      websockets: {
        toggle: "Använd WebSockets",
        description:
          "Om aktiverat kommer plånboken att använda långlivade WebSocket-anslutningar för att ta emot uppdateringar om betalda fakturor och spenderade tokens från mints. Detta ökar plånbokens responsivitet men gör också fingeravtryckning enklare.",
      },
      bitcoin_price: {
        toggle: "Hämta växelkurs från Coinbase",
        description:
          "Om aktiverat kommer aktuell Bitcoin-växelkurs att hämtas från coinbase.com och ditt konverterade saldo kommer att visas.",
        currency: {
          title: "Fiat-valuta",
          description: "Välj fiat-valuta för Bitcoin-prisvisning.",
        },
      },
    },
    experimental: {
      title: "Experimentella",
      description: "Dessa funktioner är experimentella.",
      receive_swaps: {
        toggle: "Ta emot byten",
        badge: "Beta",
        description:
          "Möjlighet att byta mottagen Ecash till din aktiva mint i dialogrutan Ta emot Ecash.",
      },
      auto_paste: {
        toggle: "Klistra in Ecash automatiskt",
        description:
          "Klistra in ecash från ditt urklipp automatiskt när du trycker på Ta emot, sedan Ecash, sedan Klistra in. Automatisk inklistring kan orsaka UI-problem i iOS, stäng av det om du upplever problem.",
      },
      auditor: {
        toggle: "Aktivera revisor",
        badge: "Beta",
        description:
          "Om aktiverat kommer plånboken att visa revisorsinformation i dialogrutan för mintdetaljer. Revisorn är en tredjepartstjänst som övervakar mints pålitlighet.",
        url_label: "Revisor URL",
        api_url_label: "Revisor API URL",
      },
      multinut: {
        toggle: "Aktivera Multinut",
        description:
          "Om aktiverat kommer plånboken att använda Multinut för att betala fakturor från flera mints samtidigt.",
      },
      nostr_mint_backup: {
        toggle: "Säkerhetskopiera mintlista på Nostr",
        description:
          "Om aktiverat kommer din mintlista automatiskt att säkerhetskopieras till Nostr-reläer med dina konfigurerade Nostr-nycklar. Detta gör att du kan återställa din mintlista över enheter.",
        notifications: {
          enabled: "Nostr mint-säkerhetskopiering aktiverad",
          disabled: "Nostr mint-säkerhetskopiering inaktiverad",
          failed: "Misslyckades att aktivera Nostr mint-säkerhetskopiering",
        },
      },
    },
    appearance: {
      keyboard: {
        title: "Skärmtangentbord",
        description: "Använd det numeriska tangentbordet för att ange belopp.",
        toggle: "Använd numeriskt tangentbord",
        toggle_description:
          "Om aktiverat kommer det numeriska tangentbordet att användas för att ange belopp.",
      },
      theme: {
        title: "Utseende",
        description: "Ändra hur din plånbok ser ut.",
        tooltips: {
          mono: "mono",
          cyber: "cyber",
          freedom: "frihet",
          nostr: "nostr",
          bitcoin: "bitcoin",
          mint: "mint",
          nut: "nöt",
          blu: "blå",
          flamingo: "flamingo",
        },
      },
      bip177: {
        title: "Bitcoin-symbol",
        description: "Använd ₿-symbolen istället för sats.",
        toggle: "Använd ₿-symbolen",
      },
    },
    advanced: {
      title: "Avancerade",
      developer: {
        title: "Utvecklarinställningar",
        description: "Följande inställningar är för utveckling och felsökning.",
        new_seed: {
          button: "Generera ny återställningsfras",
          description:
            "Detta kommer att generera en ny återställningsfras. Du måste skicka hela ditt saldo till dig själv för att kunna återställa det med en ny återställningsfras.",
          confirm_question:
            "Är du säker på att du vill generera en ny återställningsfras?",
          cancel: "Avbryt",
          confirm: "Bekräfta",
        },
        remove_spent: {
          button: "Ta bort spenderade proofs",
          description:
            "Kontrollera om ecash-tokens från dina aktiva mints är spenderade och ta bort de spenderade från din plånbok. Använd detta endast om din plånbok har fastnat.",
        },
        debug_console: {
          button: "Visa/dölj debugkonsol",
          description:
            "Öppna Javascript debugterminalen. Klistra aldrig in något i den här terminalen som du inte förstår. En tjuv kan försöka lura dig att klistra in skadlig kod här.",
        },
        export_proofs: {
          button: "Exportera aktiva proofs",
          description:
            "Kopiera hela ditt saldo från den aktiva minten som en Cashu-token till ditt urklipp. Detta exporterar endast tokens från den valda minten och enheten. För en fullständig export, välj en annan mint och enhet och exportera igen.",
        },
        keyset_counters: {
          title: "Öka keyset-räknare",
          description:
            'Klicka på keyset-ID för att öka härledningsvägsräknarna för keysets i din plånbok. Detta är användbart om du ser felet "outputs have already been signed".',
          counter: "räknare: {count}",
        },
        unset_reserved: {
          button: "Avboka alla reserverade tokens",
          description:
            'Denna plånbok markerar väntande utgående ecash som reserverad (och drar av den från ditt saldo) för att förhindra försök till dubbelspending. Den här knappen kommer att avboka alla reserverade tokens så att de kan användas igen. Om du gör detta kan din plånbok inkludera spenderade proofs. Tryck på knappen "Ta bort spenderade proofs" för att bli av med dem.',
        },
        show_onboarding: {
          button: "Visa introduktion",
          description: "Visa introduktionsskärmen igen.",
        },
        reset_wallet: {
          button: "Återställ plånboksdata",
          description:
            "Återställ dina plånboksdata. Varning: Detta kommer att radera allt! Se till att du skapar en säkerhetskopia först.",
          confirm_question:
            "Är du säker på att du vill radera din plånboksdata?",
          cancel: "Avbryt",
          confirm: "Radera plånbok",
        },
        export_wallet: {
          button: "Exportera plånboksdata",
          description:
            "Ladda ner en dump av din plånbok. Du kan återställa din plånbok från den här filen i välkomstskärmen på en ny plånbok. Den här filen kommer att vara osynkroniserad om du fortsätter att använda din plånbok efter att ha exporterat den.",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Gå med i en mint",
    subtitle:
      "Du har inte gått med i någon Cashu mint ännu. Lägg till en mint URL i inställningarna eller ta emot ecash från en ny mint för att komma igång.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Ta emot Ecash",
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
        label: "Historik",
      },
      invoices: {
        label: "Fakturor",
      },
      mints: {
        label: "Mints",
      },
    },
    install: {
      text: "Installera",
      tooltip: "Installera Cashu",
    },
  },
  AlreadyRunning: {
    title: "Nej.",
    text: "En annan flik körs redan. Stäng den här fliken och försök igen.",
    actions: {
      retry: {
        label: "Försök igen",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Oops. Ingenting här…",
    actions: {
      home: {
        label: "Gå tillbaka hem",
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
      label: "Mint fel",
    },
    pending: {
      label: "Väntande",
      tooltip: "Kontrollera alla väntande tokens",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "Föregående",
      },
      next: {
        label: "Nästa",
      },
    },
  },
  WelcomeSlide1: {
    title: "Välkommen till Cashu",
    text: "Cashu.me är en gratis och öppen källkods Bitcoin-plånbok som använder ecash för att hålla dina pengar säkra och privata.",
    actions: {
      more: {
        label: "Klicka för att lära dig mer",
      },
    },
    p1: {
      text: "Cashu är ett gratis och öppet källkods ecash-protokoll för Bitcoin. Du kan lära dig mer om det på { link }.",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "Denna plånbok är inte ansluten till någon mint. För att använda denna plånbok måste du ansluta till en eller flera Cashu mints som du litar på.",
    },
    p3: {
      text: "Denna plånbok lagrar ecash som endast du har åtkomst till. Om du raderar dina webbläsardata utan en säkerhetskopia av återställningsfrasen kommer du att förlora dina tokens.",
    },
    p4: {
      text: "Denna plånbok är i beta. Vi tar inget ansvar för att personer förlorar åtkomst till medel. Använd på egen risk! Denna kod är öppen källkod och licensierad under MIT-licensen.",
    },
  },
  WelcomeSlide2: {
    title: "Installera PWA",
    alt: { pwa_example: "Exempel på PWA-installation" },
    installing: "Installerar…",
    instruction: {
      intro: {
        text: "För bästa upplevelsen, använd denna plånbok med din enhets webbläsare för att installera den som en Progressive Web App. Gör detta nu.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "Tryck på menyn (uppe till höger)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Tryck på { buttonText }",
          buttonText: "@:AndroidPWAPrompt.buttonText",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "Tryck på dela (nere)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Tryck på { buttonText }",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "När du har installerat denna app på din enhet, stäng detta webbläsarfönster och använd appen från din startskärm.",
      },
    },
    pwa: {
      success: {
        title: "Klart!",
        text: "Du använder Cashu som en PWA. Stäng alla andra öppna webbläsarfönster och använd appen från din startskärm.",
        nextSteps:
          "Du kan nu stänga denna flik och öppna appen från hemskärmen.",
      },
    },
  },
  iOSPWAPrompt: {
    text: "Tryck på { icon } och { buttonText }",
    buttonText: "Lägg till på hemskärmen",
  },
  AndroidPWAPrompt: {
    text: "Tryck på { icon } och { buttonText }",
    buttonText: "Lägg till på hemskärmen",
  },
  WelcomeSlide3: {
    title: "Din återställningsfras",
    text: "Spara din återställningsfras i en lösenordshanterare eller på papper. Din återställningsfras är det enda sättet att återställa dina pengar om du förlorar åtkomst till denna enhet.",
    inputs: {
      seed_phrase: {
        label: "Återställningsfras",
        caption: "Du kan se din återställningsfras i inställningarna.",
      },
      checkbox: {
        label: "Jag har skrivit ner den",
      },
    },
  },
  WelcomeSlide4: {
    title: "Villkor",
    actions: {
      more: {
        label: "Läs användarvillkoren",
      },
    },
    inputs: {
      checkbox: {
        label: "Jag har läst och accepterar dessa villkor",
      },
    },
  },
  WelcomeSlideChoice: {
    title: "Ställ in din plånbok",
    text: "Vill du återställa från en återställningsfras eller skapa en ny plånbok?",
    options: {
      new: {
        title: "Skapa ny plånbok",
        subtitle: "Generera en ny fras och lägg till mints.",
      },
      recover: {
        title: "Återställ plånbok",
        subtitle: "Ange din återställningsfras, återställ mints och ecash.",
      },
    },
  },
  WelcomeMintSetup: {
    title: "Lägg till mints",
    text: "Mints är servrar som hjälper dig skicka och ta emot ecash. Välj en upptäckt mint eller lägg till en manuellt. Du kan hoppa över och lägga till senare.",
    sections: { your_mints: "Dina mints" },
    restoring: "Återställer mints…",
    placeholder: { mint_url: "https://" },
  },
  WelcomeRecoverSeed: {
    title: "Ange din återställningsfras",
    text: "Klistra in eller skriv din 12 ord långa fras för att återställa.",
    inputs: { word: "Ord { index }" },
    actions: { paste_all: "Klistra in alla" },
    disclaimer:
      "Din fras används endast lokalt för att härleda dina plånboksnycklar.",
  },
  WelcomeRestoreEcash: {
    title: "Återställ ditt ecash",
    text: "Sök efter ospenderade proofs på dina konfigurerade mints och lägg till dem i plånboken.",
  },
  MintRatings: {
    title: "Mint-recensioner",
    reviews: "recensioner",
    ratings: "Betyg",
    no_reviews: "Inga recensioner hittades",
    your_review: "Din recension",
    no_reviews_to_display: "Inga recensioner att visa.",
    no_rating: "Ingen betygsättning",
    out_of: "av",
    rows: "Reviews",
    sort: "Sortera",
    sort_options: {
      newest: "Nyaste",
      oldest: "Äldsta",
      highest: "Högsta",
      lowest: "Lägsta",
    },
    actions: { write_review: "Skriv en recension" },
    empty_state_subtitle:
      "Hjälp genom att lämna en recension. Dela din upplevelse med denna mint och hjälp andra genom att lämna en recension.",
  },
  CreateMintReview: {
    title: "Recensera mint",
    publishing_as: "Publicerar som",
    inputs: {
      rating: { label: "Betyg" },
      review: { label: "Recension (valfritt)" },
    },
    actions: {
      publish: { label: "Publicera", in_progress: "Publicerar…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "Återställ från återställningsfras",
      caption:
        "Ange din återställningsfras för att återställa din plånbok. Innan du återställer, se till att du har lagt till alla mints som du har använt tidigare.",
      inputs: {
        seed_phrase: {
          label: "Återställningsfras",
          caption: "Du kan se din återställningsfras i inställningarna.",
        },
      },
    },
    information: {
      label: "Information",
      caption:
        "Guiden kommer endast att återställa ecash från en annan återställningsfras, du kommer inte att kunna använda denna återställningsfras eller ändra återställningsfrasen för plånboken du för närvarande använder. Detta innebär att återställd ecash inte kommer att skyddas av din nuvarande återställningsfras så länge du inte skickar ecash till dig själv en gång.",
    },
    restore_mints: {
      label: "Återställ Mints",
      caption:
        'Välj mint att återställa. Du kan lägga till fler mints på huvudskärmen under "Mints" och återställa dem här.',
    },
    actions: {
      paste: {
        error: "Kunde inte läsa urklippsinnehåll.",
      },
      validate: {
        error: "Mnemoniska frasen bör vara minst 12 ord.",
      },
      select_all: {
        label: "Välj alla",
      },
      deselect_all: {
        label: "Avmarkera alla",
      },
      restore: {
        label: "Återställ",
        in_progress: "Återställer mint…",
        error: "Fel vid återställning av mint: { error }",
      },
      restore_all_mints: {
        label: "Återställ Alla Mints",
        in_progress: "Återställer mint { index } av { length } …",
        success: "Återställning slutfördes framgångsrikt",
        error: "Fel vid återställning av mints: { error }",
      },
      restore_selected_mints: {
        label: "Återställ valda mints ({count})",
        in_progress: "Återställer mint {index} av {length} ...",
        success: "Lyckades återställa {count} mint(s)",
        error: "Fel vid återställning av valda mints: {error}",
      },
    },
    nostr_mints: {
      label: "Återställ Mints från Nostr",
      caption:
        "Sök efter mint-säkerhetskopior lagrade på Nostr-reläer med din återställningsfras. Detta hjälper dig att upptäcka mints du tidigare använt.",
      search_button: "Sök efter Mint-säkerhetskopior",
      select_all: "Välj alla",
      deselect_all: "Avmarkera alla",
      backed_up: "Säkerhetskopierad",
      already_added: "Redan tillagd",
      add_selected: "Lägg till valda ({count})",
      no_backups_found: "Inga mint-säkerhetskopior hittades",
      no_backups_hint:
        "Se till att Nostr mint-säkerhetskopiering är aktiverat i inställningarna för att automatiskt säkerhetskopiera din mintlista.",
      invalid_mnemonic: "Ange en giltig återställningsfras innan du söker.",
      search_error: "Misslyckades att söka efter mint-säkerhetskopior.",
      add_error: "Misslyckades att lägga till valda mints.",
    },
  },
  MintSettings: {
    add: {
      title: "Lägg till mint",
      description:
        "Ange URL:en för en Cashu mint för att ansluta till den. Denna plånbok är inte ansluten till någon mint.",
      inputs: {
        nickname: {
          placeholder: "Smeknamn (t.ex. Testnet)",
        },
      },
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "Ogiltig URL",
        },
        scan: {
          label: "Skanna QR-kod",
        },
      },
    },
    discover: {
      title: "Upptäck mints",
      overline: "Upptäck",
      caption: "Upptäck mints som andra användare har rekommenderat på nostr.",
      actions: {
        discover: {
          label: "Upptäck mints",
          in_progress: "Laddar…",
          error_no_mints: "Inga mints hittades",
          success: "{ length } mints hittades",
        },
      },
      recommendations: {
        overline: "{ length } mints hittades",
        caption:
          "Dessa mints rekommenderades av andra Nostr-användare. Var försiktig och gör din egen research innan du använder en mint.",
        actions: {
          browse: {
            label: "Klicka för att bläddra bland mints",
          },
        },
      },
    },
    swap: {
      title: "Byt",
      overline: "Multimint-byten",
      caption:
        "Byt medel mellan mints via Lightning. Obs: Lämna utrymme för eventuella Lightning-avgifter. Om den inkommande betalningen inte lyckas, kontrollera fakturan manuellt.",
      inputs: {
        from: {
          label: "Från",
        },
        to: {
          label: "Till",
        },
        amount: {
          label: "Belopp ({ ticker })",
        },
      },
      actions: {
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
      },
    },
    error_badge: "Fel",
    reviews_text: "recensioner",
    no_reviews_yet: "Inga recensioner ännu",
    discover_mints_button: "Upptäck mints",
  },
  QrcodeReader: {
    progress: {
      text: "{ percentage }{ addon }",
      percentage: "{ percentage }%",
      keep_scanning_text: " - Fortsätt skanna",
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
    title: "Ta emot Lightning",
    create_invoice_title: "Skapa faktura",
    inputs: {
      amount: {
        label: "Belopp ({ ticker }) *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "Skapa faktura",
        label_blocked: "Skapar faktura…",
        in_progress: "Skapar",
      },
    },
    invoice: {
      caption: "Lightning-faktura",
      status_paid_text: "Betald!",
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
    title: "Skicka",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Inga mints tillgängliga",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "Inga mints tillgängliga",
      },
    },
  },
  SendTokenDialog: {
    title: "Skicka Ecash",
    title_ecash_text: "Ecash",
    badge_offline_text: "Offline",
    inputs: {
      amount: {
        label: "Belopp ({ ticker }) *",
        invalid_too_much_error_text: "För mycket",
      },
      p2pk_pubkey: {
        label: "Mottagarens publika nyckel",
        label_invalid: "Mottagarens publika nyckel",
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
        tooltip_text: "Kopiera Emoji",
      },
      copy_tokens: {
        label: "@:global.actions.copy.label",
      },
      copy_link: {
        tooltip_text: "Kopiera länk",
      },
      share: {
        tooltip_text: "Dela ecash",
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
        tooltip_text: "Ta bort från historik",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "Flash till NFC-kort",
          ndef_unsupported_text: "NDEF stöds inte",
        },
      },
    },
  },
  ReceiveDialog: {
    title: "Ta emot",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Inga mints tillgängliga",
      },
      lightning: {
        label: "Lightning",
        error_no_mints:
          "Du måste ansluta till en mint för att ta emot via Lightning",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "Ta emot Ecash",
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      scan: {
        label: "@:global.actions.scan.label",
      },
      request: {
        label: "Begär",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      nfc: {
        label: "NFC",
        scanning_text: "Skannar…",
      },
    },
  },
  ReceiveTokenDialog: {
    title: "Ta emot Ecash",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "Klistra in Cashu token",
      },
    },
    errors: {
      invalid_token: {
        label: "Ogiltig token",
      },
      p2pk_lock_mismatch: {
        label:
          "Kan inte ta emot. Denna tokens P2PK-lås matchar inte din publika nyckel.",
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
        label_adding_mint: "Lägger till mint…",
      },
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "Byt till en betrodd mint",
        caption: "Byt { value }",
      },
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "Avbryt byte",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      later: {
        label: "Ta emot senare",
        tooltip_text: "Lägg till i historik för att ta emot senare",
        already_in_history_success_text: "Ecash redan i historik",
        added_to_history_success_text: "Ecash lades till i historik",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Läs från NFC-kort",
          ndef_unsupported_text: "NDEF stöds inte",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "P2PK Nyckel",
      description: "Ta emot ecash låst till denna nyckel",
      used_warning_text:
        "Varning: Denna nyckel användes tidigare. Använd en ny nyckel för bättre integritet.",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_key: {
        label: "Generera ny nyckel",
      },
    },
  },
  PaymentRequestDialog: {
    payment_request: {
      caption: "Betalningsförfrågan",
      description: "Ta emot betalningar via Nostr",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "Ny förfrågan",
      },
      add_amount: {
        label: "Lägg till belopp",
      },
      use_active_mint: {
        label: "Valfri mint",
      },
    },
    inputs: {
      amount: {
        placeholder: "Ange belopp",
      },
    },
  },
  NumericKeyboard: {
    actions: {
      close: {
        label: "@:global.actions.close.label",
        closed_info_text:
          "Tangentbordet inaktiverat. Du kan återaktivera tangentbordet i inställningarna.",
      },
      enter: {
        label: "@:global.actions.enter.label",
      },
    },
  },
  NWCDialog: {
    nwc: {
      caption: "Nostr Plånboksanslutning",
      description:
        "Styr din plånbok på distans med NWC. Tryck på QR-koden för att länka din plånbok med en kompatibel app.",
      warning_text:
        "Varning: den som har åtkomst till denna anslutningssträng kan initiera betalningar från din plånbok. Dela inte!",
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
    title: "Mintmeddelande",
  },
  MintDetailsDialog: {
    contact: {
      title: "Kontakt",
    },
    details: {
      title: "Mintdetaljer",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Nuts",
        actions: {
          show: {
            label: "Visa alla",
          },
          hide: {
            label: "Dölj",
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
        label: "Version",
      },
    },
    actions: {
      title: "Åtgärder",
      copy_mint_url: {
        label: "Kopiera mint URL",
      },
      delete: {
        label: "Radera mint",
      },
      edit: {
        label: "Redigera mint",
      },
    },
  },
  ChooseMint: {
    title: "Välj en mint",
    badge_mint_error_text: "Fel",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
  },
  HistoryTable: {
    empty_text: "Ingen historik än",
    row: {
      type_label: "Ecash",
      date_label: "{ value } sedan",
    },
    actions: {
      check_status: {
        tooltip_text: "Kontrollera status",
      },
      receive: {
        tooltip_text: "Ta emot",
      },
      filter_pending: {
        label: "Filtrera väntande",
      },
      show_all: {
        label: "Visa alla",
      },
    },
    old_token_not_found_error_text: "Gammal token hittades inte",
  },
  InvoiceTable: {
    empty_text: "Inga fakturor än",
    row: {
      type_label: "Lightning",
      type_tooltip_text: "Klicka för att kopiera",
      date_label: "{ value } sedan",
    },
    actions: {
      check_status: {
        tooltip_text: "Kontrollera status",
      },
      filter_pending: {
        label: "Filtrera väntande",
      },
      show_all: {
        label: "Visa alla",
      },
    },
  },
  RemoveMintDialog: {
    title: "Är du säker på att du vill radera denna mint?",
    nickname: {
      label: "Smeknamn",
    },
    balances: {
      label: "Saldon",
    },
    warning_text:
      "Obs: Eftersom denna plånbok är paranoid, kommer din ecash från denna mint inte att raderas helt utan förbli lagrad på din enhet. Du kommer att se den återkomma om du lägger till denna mint igen senare.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "Ta bort mint",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  ParseInputComponent: {
    placeholder: {
      default: "Cashu token eller Lightning-adress",
      receive: "Cashu token",
      pay: "Lightning-adress eller faktura",
    },
    qr_scanner: {
      title: "Skanna QR-kod",
      description: "Tryck för att skanna en adress",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    input_data: {
      title: "Betala Lightning",
      inputs: {
        invoice_data: {
          label: "Lightning-faktura eller adress",
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
      amount_exact_label: "{ payee } begär { value } { ticker }",
      amount_range_label:
        "{ payee } begär{br}mellan { min } och { max } { ticker }",
      sending_to_lightning_address: "Skickar till { address }",
      inputs: {
        amount: {
          label: "Belopp ({ ticker }) *",
        },
        comment: {
          label: "Kommentar (valfritt)",
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
      title: "Betala { value }",
      paying: "Betalar",
      paid: "Betald",
      fee: "Avgift",
      memo: {
        label: "Memo",
      },
      processing_info_text: "Bearbetar…",
      balance_too_low_warning_text: "Saldot för lågt",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        pay: {
          label: "Betala",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
          error: "Fel",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Redigera mint",
    inputs: {
      nickname: {
        label: "Smeknamn",
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
    title: "Litar du på denna mint?",
    description:
      "Innan du använder denna mint, se till att du litar på den. Mints kan bli skadliga eller upphöra med sin verksamhet när som helst.",
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
        in_progress: "Lägger till mint",
      },
    },
  },
  restore: {
    mnemonic_error_text: "Ange en mnemonisk fras",
    restore_mint_error_text: "Fel vid återställning av mint: { error }",
    prepare_info_text: "Förbereder återställningsprocessen…",
    restored_proofs_for_keyset_info_text:
      "Återställde { restoreCounter } proofs för keyset { keysetId }",
    checking_proofs_for_keyset_info_text:
      "Kontrollerar proofs { startIndex } till { endIndex } för keyset { keysetId }",
    no_proofs_info_text: "Inga proofs hittades att återställa",
    restored_amount_success_text: "Återställde { amount }",
  },
  swap: {
    in_progress_warning_text: "Byte pågår",
    invalid_swap_data_error_text: "Ogiltig bytesdata",
    swap_error_text: "Fel vid byte",
  },
  TokenInformation: {
    fee: "Avgift",
    unit: "Enhet",
    fiat: "Fiat",
    p2pk: "P2PK",
    locked: "Låst",
    locked_to_you: "Låst till dig",
    mint: "Myntverk",
    memo: "Memo",
    payment_request: "Betalningsförfrågan",
    nostr: "Nostr",
    token_copied: "Token kopierad till urklipp",
  },
};
