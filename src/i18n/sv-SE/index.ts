export default {
  MultinutPicker: {
    dialog_title: "Multinut-betalning",
    pay_using_multiple: "Betala med flera mints",
    experimental_title: "Experimentell funktion",
    experimental_text:
      "Den här funktionen är mycket experimentell och fungerar kanske inte som väntat. Försök inte betala en faktura som redan har betalats. Du kan förlora pengar.",
    understand: "Jag förstår",
    select_funds: "Välj medel från flera mints för att genomföra betalningen.",
    pay_invoice: "Betala faktura",
    amount_mismatch: "Fel vid beloppsberäkning: {calculated} mot {expected}",
    states: {
      requesting: "Begär...",
      paying: "Betalar...",
      success: "Klart",
      failed: "Misslyckades",
    },
    payment: "Multinut-betalning",
    selectMints: "Välj en eller flera mints att betala från.",
    totalSelectedBalance: "Totalt valt saldo",
    multiMintPay: "Betala från flera mints",
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
      pay: { label: "Betala" },
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
      trying_again: "Försöker igen...",
      unsupported_legacy_qr: "QR-kod av äldre typ stöds inte",
      legacy_qr_not_supported:
        "Den här äldre QR-koden kommer inte från en handlare som stöds",
      no_bolt12_mint: "Ingen av dina mints stöder BOLT12-erbjudanden",
      no_bolt11_mint: "Ingen av dina mints stöder BOLT11-fakturor",
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
          caption: "Det här godkänner du genom att använda Cashu.me",
        },
      },
      links: {
        title: "Länkar",
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
    menu: {
      title: "Inställningar",
      backup: {
        title: "Säkerhetskopiering och återställning",
        caption: "Seed-fras och återställning av ecash",
      },
      lightning_address: {
        title: "Lightning-adress",
        caption: "Ta emot betalningar på namn@domän",
      },
      nostr: {
        title: "Nostr",
        caption: "Nycklar, reläer och tillitsnätverk",
      },
      payment_requests: {
        title: "Betalningsförfrågningar",
        caption: "Ta emot ecash-betalningar via Nostr",
      },
      nwc: {
        title: "Nostr Wallet Connect",
        caption: "Använd din plånbok från andra appar",
      },
      hardware: {
        title: "Hårdvara",
        caption: "NFC-inställningar",
      },
      p2pk: {
        title: "Låst ecash",
        caption: "Ta emot ecash som bara din nyckel kan låsa upp",
      },
      privacy: {
        title: "Integritet",
        caption: "Nätverkskontroller och bitcoinpris",
      },
      experimental: {
        title: "Experimentellt",
        caption: "Prova nya funktioner tidigt",
      },
      appearance: {
        title: "Utseende",
        caption: "Tema, tangentbord och bitcoinsymbol",
      },
      language: {
        title: "Språk",
        caption: "Välj ditt språk",
      },
      advanced: {
        title: "Avancerat",
        caption: "Utvecklarverktyg och plånboksåterställning",
      },
      about: {
        title: "Om",
        caption: "Villkor och länkar",
      },
    },
    web_of_trust: {
      title: "Förtroendenätverk",
      known_pubkeys: "Kända publika nycklar: {wotCount}",
      continue_crawl: "Fortsätt genomsökning",
      crawl_odell: "Importera Odells tillitsnätverk",
      crawl_wot: "Genomsök web of trust",
      pause: "Pausa",
      reset: "Återställ",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      copy_lightning_address: "Kopiera Lightning-adress",
    },
    multinut: {
      use_multinut: "Betalningar från flera mints",
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
          already_added: "Reläet är redan tillagt",
          expand_label: "Klicka för att redigera reläer",
          add: {
            title: "Lägg till relä",
            description:
              "Din plånbok använder dessa reläer för Nostr-funktioner som betalningsförfrågningar, Nostr Wallet Connect och säkerhetskopior.",
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
          "Återställ ecash från en annan återställningsfras. Din nuvarande fras påverkas inte.",
        button: "Återställ",
      },
    },
    lightning_address: {
      server_url: {
        label: "Värdnamn för npub.cash",
        hint: "Ange ett värdnamn eller en HTTPS-URL",
        invalid: "Ange en giltig HTTPS-server-URL",
      },
      title: "Lightning-adress",
      description: "Ta emot betalningar till din Lightning-adress.",
      enable: {
        toggle: "Använd en Lightning-adress",
        description: "Ta emot betalningar på en adress från npub.cash",
      },
      address: {
        copy_tooltip: "Kopiera Lightning-adress",
      },
      show_on_receive: {
        toggle: "Visa vid mottagning",
        description: "Visa adress och QR-kod.",
      },
      automatic_claim: {
        toggle: "Hämta automatiskt",
        description: "Ta emot inkommande betalningar automatiskt.",
      },
      mint: {
        label: "npub.cash mint",
        choose_title: "Välj mint för npub.cash",
        choose_placeholder: "Välj en mint...",
      },
    },
    nostr_keys: {
      title: "Dina Nostr-nycklar",
      description: "Dina Nostr-nycklar avgör din Lightning-adress.",
      wallet_seed: {
        title: "Plånbokens återställningsfras",
        description: "Skapa ett Nostr-nyckelpar från plånbokens seed",
        copy_nsec: "Kopiera privat nyckel",
      },
      nsec_bunker: {
        title: "Fjärrsignerare",
        description: "Signera med en NIP-46-bunker",
        delete_tooltip: "Radera anslutning",
      },
      use_nsec: {
        title: "Använd din egen privata nyckel",
        description:
          "Klistra in din privata Nostr-nyckel (nsec) i den här plånboken. Rekommenderas inte.",
        delete_tooltip: "Radera privat nyckel",
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
        "Få betalt via Nostr. När det är på lyssnar plånboken på dina Nostr-reläer.",
      enable_toggle: "Aktivera betalningsförfrågningar",
      claim_automatically: {
        toggle: "Hämta automatiskt",
        description:
          "Lägger till inkommande betalningar i saldot utan att fråga. När det är av hämtar du varje själv.",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Plånboksanslutning (NWC)",
      description:
        "Låter andra appar betala från den här plånboken via Nostr Wallet Connect.",
      enable_toggle: "Aktivera Nostr Wallet Connect",
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
        title: "Format för NFC-kort",
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
          description: "Spara token som binärdata",
        },
        quick_access: {
          toggle: "Snabb åtkomst till NFC",
          description:
            "Lägger till en NFC-knapp på skärmen Ta emot ecash för att skanna kort.",
        },
      },
    },
    p2pk_features: {
      title: "Låst ecash",
      description:
        "Experimentellt. Använd små belopp: om du förlorar den privata nyckeln kan ingen låsa upp ecash som är låst till den.",
      generate_button: "Generera nyckel",
      import_button: "Importera privat nyckel",
      quick_access: {
        toggle: "Visa låsnyckel under Ta emot",
        description:
          "Visar din låsnyckel på skärmen Ta emot ecash, så att avsändare kan låsa ecash till dig.",
      },
      keys_expansion: {
        label: "Klicka för att bläddra bland {count} nycklar",
        used_badge: "använd",
      },
    },
    privacy: {
      title: "Integritet",
      network_title: "Nätverkskontroller",
      description: "Dessa inställningar påverkar din integritet.",
      check_incoming: {
        toggle: "Kontrollera inkommande faktura",
        description:
          "Kontrollerar din senaste faktura i bakgrunden. Snabbare uppdateringar, men lättare att fingeravtrycka.",
      },
      check_startup: {
        toggle: "Kontrollera väntande fakturor vid start",
        description: "Kontrollerar väntande fakturor när plånboken öppnas.",
      },
      check_all: {
        toggle: "Kontrollera alla fakturor",
        description:
          "Kontrollerar obetalda fakturor i bakgrunden i upp till två veckor. Mer aktivitet online gör dig lättare att fingeravtrycka.",
      },
      check_sent: {
        toggle: "Kontrollera skickad ecash",
        description:
          "Kontrollerar i bakgrunden om skickad ecash har hämtats. Mer aktivitet online gör dig lättare att fingeravtrycka.",
      },
      websockets: {
        toggle: "Använd WebSockets",
        description:
          "Håller en liveanslutning till mints för direkta betalningsuppdateringar. Snabbare, men lättare att fingeravtrycka.",
      },
      bitcoin_price: {
        title: "Bitcoinpris",
        toggle: "Hämta växelkurs från Coinbase",
        description:
          "Hämtar bitcoinpriset från coinbase.com för att visa ditt saldo i fiat.",
        currency: {
          title: "Fiatvaluta",
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
        description: "Erbjuder att växla mottagen ecash till din aktiva mint.",
      },
      auto_paste: {
        toggle: "Klistra in ecash automatiskt",
        description:
          "Klistrar in ecash från urklipp när du öppnar Ta emot ecash. Stäng av om det orsakar visningsfel på iOS.",
      },
      auditor: {
        toggle: "Aktivera revisor",
        badge: "Beta",
        description:
          "Visar tillförlitlighetsdata från en extern mint-granskare i mintens detaljer.",
        url_label: "Revisor URL",
        api_url_label: "Revisor API URL",
      },
      multinut: {
        toggle: "Aktivera Multinut",
        description: "Betalar fakturor från flera mints samtidigt.",
      },
      nostr_mint_backup: {
        toggle: "Säkerhetskopiera mintlistan till Nostr",
        description:
          "Säkerhetskopierar din mintlista till dina Nostr-reläer så att du kan återställa den på en annan enhet.",
        notifications: {
          enabled: "Nostr mint-säkerhetskopiering aktiverad",
          disabled: "Nostr mint-säkerhetskopiering inaktiverad",
          failed: "Misslyckades att aktivera Nostr mint-säkerhetskopiering",
        },
      },
    },
    appearance: {
      mode: {
        title: "Läge",
        dark: "Mörkt",
        light: "Ljust",
      },
      keyboard: {
        title: "Skärmtangentbord",
        description: "Använd det numeriska tangentbordet för att ange belopp.",
        toggle: "Använd numeriskt tangentbord",
        toggle_description:
          "Använder det numeriska tangentbordet för att ange belopp.",
      },
      theme: {
        title: "Tema",
        description: "Ändra hur din plånbok ser ut.",
        tooltips: {
          mono: "Mono",
          cyber: "Cyber",
          freedom: "Frihet",
          nostr: "Nostr",
          bitcoin: "Bitcoin",
          mint: "Mynta",
          nut: "Nöt",
          blu: "Blå",
          flamingo: "Flamingo",
        },
      },
      bip177: {
        title: "Bitcoin-symbol",
        description: "Visa belopp som ₿2 789 i stället för 2 789 sats.",
        toggle: "Använd ₿-symbolen",
      },
    },
    advanced: {
      notifications: {
        reserved_unset: "Alla reserverade bevis frigjorda",
        removed_spent: "Tog bort {count} spenderade bevis",
        no_spent: "Inga spenderade bevis hittades",
        invalid_backup: "Ogiltigt format på säkerhetskopian",
        read_error: "Fel vid läsning av fil",
      },
      title: "Avancerade",
      developer: {
        title: "Utvecklarinställningar",
        description: "Verktyg för felsökning.",
        new_seed: {
          button: "Generera ny återställningsfras",
          description:
            "Skapar en ny återställningsfras. Skicka sedan ditt saldo till dig själv så att det nya seedet kan återställa det.",
          confirm_question:
            "Är du säker på att du vill generera en ny återställningsfras?",
          cancel: "Avbryt",
          confirm: "Bekräfta",
        },
        remove_spent: {
          button: "Ta bort spenderade proofs",
          description:
            "Tar bort ecash som dina aktiva mints rapporterar som spenderad. Använd bara om plånboken har fastnat.",
        },
        debug_console: {
          button: "Felsökningskonsol",
          description:
            "Öppnar JavaScript-konsolen. Klistra aldrig in kod du inte förstår; bedragare använder den för att stjäla pengar.",
        },
        export_proofs: {
          button: "Exportera aktiva proofs",
          description:
            "Kopierar den aktiva mintens saldo i vald enhet som en enda ecash-token.",
        },
        keyset_counters: {
          title: "Öka keyset-räknare",
          description:
            'Tryck på ett keyset för att öka dess räknare. Hjälper mot felet "outputs have already been signed".',
          counter: "Räknare: {count}",
          increase: "Öka räknaren för {id}",
        },
        unset_reserved: {
          button: "Avboka alla reserverade tokens",
          description:
            'Frigör ecash som hålls för väntande sändningar så att den kan spenderas igen. Kör sedan "Ta bort spenderade proofs".',
        },
        show_onboarding: {
          button: "Visa introduktion",
          description: "Visa introduktionsskärmen igen.",
        },
        reset_wallet: {
          button: "Återställ plånboksdata",
          description:
            "Raderar all plånboksdata på den här enheten. Exportera en säkerhetskopia först.",
          confirm_question:
            "Är du säker på att du vill radera din plånboksdata?",
          cancel: "Avbryt",
          confirm: "Radera plånbok",
        },
        export_wallet: {
          button: "Exportera plånboksdata",
          description:
            "Laddar ner en säkerhetskopia som du kan importera på välkomstskärmen. Den blir inaktuell när du fortsätter använda plånboken.",
        },
        import_wallet: {
          description:
            "Ersätter plånbokens data med en exporterad säkerhetskopia.",
          button: "Importera säkerhetskopia",
          confirm_question: "Vill du verkligen återställa plånbokens data?",
          cancel: "Avbryt",
          confirm: "IMPORTERA SÄKERHETSKOPIA",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Lägg till en mint",
    subtitle:
      "Mints ger ut den ecash som plånboken håller. Lägg till en mint, eller ta emot ecash från en, för att komma igång.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Ta emot ecash",
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
    title: "Cashu.me är öppet i en annan flik",
    text: "Stäng den andra fliken och tryck sedan på Försök igen.",
    actions: {
      retry: {
        label: "Försök igen",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Sidan finns inte",
    actions: {
      home: {
        label: "Gå tillbaka hem",
      },
    },
  },
  BalanceView: {
    total_label: "Totalt saldo",
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
    terms_agreement: "Genom att fortsätta godkänner du {terms}",
    title: "Välkommen till Cashu.me",
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
    title: "Installera Cashu.me",
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
          buttonText: "@:PwaPrompt.android.add",
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
          buttonText: "@:PwaPrompt.ios.add",
        },
      },
      outro: {
        text: "När appen är installerad stänger du den här webbläsarfliken och öppnar Cashu.me från hemskärmen.",
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
  PwaPrompt: {
    title: "Lägg till Cashu på hemskärmen",
    text: "Öppnas från hemskärmen, utan webbläsarens adressfält.",
    ios: {
      share: "Tryck på Dela",
      add: "Lägg till på hemskärmen",
    },
    android: {
      menu: "Öppna webbläsarens meny",
      add: "Lägg till på hemskärmen",
    },
    install: "Installera",
    notNow: "Inte nu",
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
    english_only: "Den juridiska texten finns endast på engelska.",
    title: "Användarvillkor",
    actions: {
      more: {
        label: "Läs innan du använder Cashu.me",
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
    web_of_trust_caption:
      "Räkna bara recensioner från personer i ditt förtroendenätverk",
    web_of_trust_hop: "I ditt förtroendenätverk (steg {hop})",
    no_mint_url: "Ingen mint-URL angiven",
    title: "Mint-recensioner",
    reviews: "recensioner",
    ratings: "{n} betyg | {n} betyg",
    no_reviews: "Inga recensioner än",
    your_review: "Din recension",
    no_reviews_to_display: "Inga recensioner att visa.",
    no_rating: "Ingen betygsättning",
    stars_label: "{rating} av 5 stjärnor",
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
      "Bli först med att recensera den här minten. Din erfarenhet hjälper andra att välja.",
    range: "{from}–{to} av {total}",
  },
  CreateMintReview: {
    connect_nostr:
      "Anslut ett Nostr-konto under Inställningar för att publicera ett omdöme.",
    published: "Omdöme publicerat",
    publish_failed: "Kunde inte publicera omdömet",
    title: "Recensera mint",
    publishing_as: "Publicerar som",
    inputs: {
      rating: { label: "Betyg" },
      review: { label: "Recension (valfritt)" },
    },
    actions: {
      publish: { label: "Publicera recension", in_progress: "Publicerar…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "Återställ från återställningsfras",
      caption:
        "Lägg till alla mints du använt med den här frasen innan du återställer.",
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
      label: "Återställ mints",
      caption:
        "Välj vilka mints som ska återställas. Lägg först till saknade mints under fliken Mints.",
    },
    actions: {
      paste: {
        error: "Kunde inte läsa urklippsinnehåll.",
      },
      validate: {
        error: "Mnemoniska frasen bör vara minst 12 ord.",
      },
      select_all: {
        label: "Markera alla",
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
        label: "Återställ alla mints",
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
      label: "Återställ mints från Nostr",
      caption:
        "Sök efter mint-säkerhetskopior lagrade på Nostr-reläer med din återställningsfras. Detta hjälper dig att upptäcka mints du tidigare använt.",
      search_button: "Sök efter mint-säkerhetskopior",
      select_all: "Markera alla",
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
    see_reviews: "Visa recensioner",
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
      caption: "Mints som andra rekommenderar på Nostr.",
      actions: {
        discover: {
          label: "Upptäck mints",
          in_progress: "Laddar…",
          error_no_mints: "Inga mints hittades",
          success: "{ length } mints hittades",
        },
      },
      unnamed: "Namnlös mint",
      empty: {
        title: "Hitta en mint",
        text: "Cashu.me frågar Nostr-reläer efter mintar som andra rekommenderar, med betyg och recensioner.",
      },
      recommendations: {
        overline: "{ length } mints hittades",
        caption: "Gör din egen research innan du använder en mint.",
        actions: {
          browse: {
            label: "Klicka för att bläddra bland mints",
          },
        },
      },
    },
    swap: {
      title: "Byt",
      overline: "Växling mellan mints",
      caption:
        "Flytta pengar mellan dina mints via Lightning. Avgifter kan tillkomma.",
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
        receove_to_trusted_mint: { label: "Ta emot till betrodd mint" },
      },
    },
    error_badge: "Fel",
    active_badge: "Aktiv",
    reviews_text: "recension | recensioner",
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
        label_blocked: "Skapar faktura",
        in_progress: "Skapar",
      },
    },
    invoice: {
      caption: "Lightning-faktura",
      status_paid_text: "Betald",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        copy: {
          label: "Kopiera faktura",
        },
      },
    },
  },
  SendDialog: {
    captions: {
      ecash: "Dela en token eller QR-kod",
      lightning: "Betala en faktura eller adress",
      onchain: "Skicka till en bitcoinadress",
    },
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
    badge_locked: "låst",
    title: "Skicka ecash",
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
        tooltip_text: "Kopiera emoji",
      },
      copy_tokens: {
        label: "Kopiera ecash",
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
        in_progress: "Skickar…",
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
      pay: { label: "@:global.actions.pay.label" },
    },
    errors: {
      amount_required: "Ange ett belopp först.",
      serialization_failed: "Det gick inte att förbereda ecash-token.",
      mint_not_allowed_by_request:
        "Den valda minten accepteras inte av den här betalningsförfrågan.",
    },
  },
  ReceiveDialog: {
    captions: {
      ecash: "Klistra in, skanna eller begär en token",
      lightning: "Skapa en faktura för att få betalt",
      onchain: "Få en bitcoinadress",
    },
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
    title: "Ta emot ecash",
    actions: {
      paste: {
        label: "Klistra in token",
      },
      scan: {
        label: "Skanna token",
      },
      request: {
        label: "Begär ecash",
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
    receiving_amount: "Tar emot {amount}",
    title: "Ta emot ecash",
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
        processing: "Växlar…",
        failed: "Växlingen misslyckades",
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
        already_in_history_success_text: "Ecash finns redan i historiken",
        added_to_history_success_text: "Ecash har lagts till i historiken",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Läs från NFC-kort",
          ndef_unsupported_text: "NDEF stöds inte",
        },
      },
      receive_to_selected_mint: { label: "Ta emot till vald mint" },
    },
    unknown_mint_info_text:
      "Okänd mint. Den läggs till när du har tagit emot den här token.",
    swap_section: {
      title: "Växla",
      source_label: "Från",
      destination_label: "Till",
      fee_info: "Den här växlingen medför avgifter i Lightning-nätverket.",
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "Låsnyckel",
      description: "Ta emot ecash låst till denna nyckel",
      used_warning_text:
        "Varning: Denna nyckel användes tidigare. Använd en ny nyckel för bättre integritet.",
    },
    actions: {
      copy: {
        label: "Kopiera publik nyckel",
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
    request_index: "Begäran {index} av {total}",
    requesting: "Begär",
    payer_chooses_amount: "Betalaren väljer belopp",
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
      share: {
        label: "Dela",
      },
      copy_request: {
        label: "Kopiera begäran",
      },
      add_amount: {
        label: "Lägg till belopp",
      },
      use_active_mint: {
        label: "Valfri mint",
      },
      remove_amount: {
        label: "Ta bort belopp",
      },
      previous: {
        label: "Föregående begäran",
      },
      next: {
        label: "Nästa begäran",
      },
    },
    inputs: {
      amount: {
        placeholder: "Ange belopp",
      },
    },
    received_total: "Totalt mottaget",
    no_payments_yet: "Inga betalningar än",
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
    title: "Meddelande från minten",
  },
  MintDetailsDialog: {
    qr: {
      show: "Visa QR-kod",
      hide: "Dölj QR-kod",
    },
    contact: {
      title: "Kontakt",
    },
    details: {
      title: "Mintdetaljer",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Funktioner som stöds",
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
        label: "Enhet",
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
    available_text: "på den här minten",
    sheet_title: "Välj mint",
    placeholder: "Välj en mint",
  },
  HistoryTable: {
    empty_text: "Ingen historik än",
    empty_hint: "Betalningar du skickar och tar emot visas här.",
    row: {
      type_label: "Ecash",
      date_label: "{ value } sedan",
    },
    actions: {
      filter_ecash_only: {
        label: "Bara ecash",
      },
      check_status: {
        tooltip_text: "Kontrollera status",
      },
      receive: {
        tooltip_text: "Ta emot",
      },
      filter_pending: {
        label: "Visa bara väntande",
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
        label: "Visa bara väntande",
      },
      show_all: {
        label: "Visa alla",
      },
    },
  },
  RemoveMintDialog: {
    title: "Ta bort den här minten?",
    nickname: {
      label: "Smeknamn",
    },
    balances: {
      label: "Saldo på den här minten",
    },
    warning_text:
      "Din ecash från den här minten finns kvar på enheten. Den kommer tillbaka om du lägger till minten igen.",
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
      description: "Rikta kameran mot en QR-kod",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    onchain: {
      title: "Betala on-chain",
      address_placeholder: "Bitcoinadress",
      choose_speed: "Välj bekräftelsehastighet",
      blocks: "{n} block | {n} block",
      estimated_confirmation: "Beräknad bekräftelse",
      fee_reserve: "avgiftsreserv",
    },
    multinut: {
      label: "Betala med flera mints",
    },
    quote: {
      label: "Offert",
    },
    input_data: {
      title: "Betala med Lightning",
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
      title_bolt12: "Betala Lightning-erbjudande",
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
          waiting_for_wallet: "Väntar på plånboken…",
          error: "Fel",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Redigera mint",
    inputs: {
      nickname: {
        placeholder: "t.ex. Testnet",
        label: "Smeknamn (valfritt)",
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
      "Gå bara med i den här minten om du litar på den. Om den slutar fungera förloras den ecash du har hos den.",
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
    audit_info: {
      label: "Granskningsinfo",
      actions: {
        show: {
          label: "Visa",
        },
        hide: {
          label: "Dölj",
        },
      },
    },
    unreachable_error_text:
      "Det går inte att nå den här minten. Kontrollera URL:en och din anslutning och försök igen.",
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
  ActivityRow: {
    received: "Mottaget",
    sent: "Skickat",
    receiving: "Tar emot",
    sending: "Skickar",
  },
  common: {
    copied: "Kopierat",
    on_chain: "On-chain",
    pending: "Väntande",
    delete: "Radera",
    copy_npub: "Kopiera npub",
    back: "Tillbaka",
    refresh: "Uppdatera",
    settings: "Inställningar",
    backspace: "Radera tecken",
    swap_input_mode: "Växla mellan belopp och fiat",
    fee: "Avgift",
  },
  SendPaymentRequest: {
    actions: {
      pay: { label: "Betala" },
      pay_via: { label: "Betala via {transport}" },
    },
    info: {
      pay_failed: "Kunde inte betala begäran",
      pay_to: "Betala till {target}",
      invalid_url: "Ogiltig URL",
    },
  },
  PaymentRequestInfo: {
    title_with_transport: "Betalningsförfrågan via {transport}",
    title: "Betalningsförfrågan",
    subtitle: "Betala till {target}",
    subtitle_fallback: "Betalningsförfrågan",
    invalid_url: "Ogiltig URL",
  },
  QuoteInformation: {
    address: "Adress",
    amount: "Belopp",
    fee_reserve: "Avgiftsreserv",
    fee_paid: "Betald avgift",
    unit: "Enhet",
    status: "Status",
    network: "Nätverk",
    transaction_id: "Transaktions-ID",
    chain_status: "Status i kedjan",
    fetching: "Hämtar",
    paid_at: "Betald",
    preimage: "Preimage",
    preimage_copied: "Preimage kopierad",
    mint: "Mint",
    method: "Metod",
    lightning_offer: "Lightning-erbjudande",
    chain_confirmed: "Bekräftad",
    chain_pending: "Väntande",
    states: {
      waiting: "Väntar på betalning",
      paid: "Betald",
      unpaid: "Obetald",
      pending: "Väntande",
      issued: "Utfärdad",
      expired: "Utgången",
      failed: "Misslyckades",
    },
  },
  MintAuditInfo: {
    title: "Granskningsinfo",
    loading: "Läser in granskningsinfo...",
    not_audited: "Denna mint har inte granskats ännu.",
    not_audited_text:
      "Läs mer om granskaren eller stöd en framtida granskning på {link}, eller klicka {here} för att donera ecash och hjälpa till att starta en granskning av denna mint.",
    here: "här",
    unavailable: "Granskningsinfo är inte tillgänglig just nu.",
    load_failed: "Kunde inte läsa in mintdata",
    success_rate: "Lyckandegrad",
    swaps_count: "{successful} av {total} byten",
    average_time: "Genomsnittlig tid",
    average_time_caption: "För lyckade byten",
    disclaimer:
      "Granskningsdata tillhandahålls av oberoende tredje parter för att hjälpa till att bedöma en mints tillförlitlighet över tid. Resultaten är dock endast informativa och garanterar inte säkerheten, solvensen eller pålitligheten hos någon mint. Gör alltid din egen research och se till att du litar på mintens operatör innan du använder dess tjänster.",
    donate_text:
      "Granskningsinformation tillhandahålls av {link}. Granskarens nuvarande saldo för denna mint är {balance}, och totalt har {donations} donerats hittills. För att stödja fortsatt granskning kan du {press_here} för att donera ecash till granskaren.",
    press_here: "trycka här",
    sats_amount: "{amount} sats",
    warnings_title: "Granskarens varningar",
    warnings: {
      last_swap_failed: "Det senaste bytesförsöket misslyckades.",
      recent_success:
        "{successful} av {total} byten de senaste {days} dagarna lyckades.",
      reliable:
        "{base} Dock: {success} Denna mint verkar pålitlig, felen kan bero på den mottagande minten.",
      unreliable: "{base} Endast {success} Denna mint kan vara opålitlig.",
      unknown:
        "Granskaren har ännu inte kunnat avgöra kvaliteten på denna mint.",
      not_enough_data:
        "Granskaren har inte tillräckligt med färsk data om denna mint. Det var bara {count} lyckat byte de senaste {days} dagarna. | Granskaren har inte tillräckligt med färsk data om denna mint. Det var bara {count} lyckade byten de senaste {days} dagarna.",
      low_success:
        "De senaste {days} dagarna hade denna mint en lyckandegrad på {rate} %, under de rekommenderade {threshold} %.",
      inactive:
        "Denna mint har inte haft några byten på {days} dag. Den kan vara onåbar. | Denna mint har inte haft några byten på {days} dagar. Den kan vara onåbar.",
      slow: "Denna mint är långsam. Betalningar från den tog i genomsnitt {seconds} sekunder.",
      no_successful:
        "Inga lyckade byten har registrerats för denna mint. Den kan vara onåbar.",
    },
    chart: {
      now: "Nu",
      today: "Idag",
      yesterday: "Igår",
      invalid_date: "Ogiltigt datum",
      swaps: "Byten:",
      success_rate: "Lyckandegrad:",
      time_range: "Tidsintervall:",
    },
  },
  DisplayTokenComponent: {
    title: {
      send: "Skicka ecash",
      sent: "Skickad ecash",
      received: "Mottagen ecash",
    },
    qr_speed: "QR-hastighet: {value}",
    qr_size: "QR-storlek: {value}",
    speed: {
      fast: "Snabb",
      medium: "Medel",
      slow: "Långsam",
    },
    size: {
      large: "Stor",
      medium: "Medel",
      small: "Liten",
    },
    delete_dialog: {
      title: "Radera ecash",
      text: "Vill du verkligen radera denna transaktion från historiken?",
      warning:
        "Varning: Åtgärden kan inte ångras och token kan inte återställas.",
    },
    nfc: {
      read_failed: "NFC-läsning misslyckades",
      write_failed: "NFC-skrivning misslyckades",
      error: "NFC-fel",
      writing: "Skriver till NFC-kort...",
      success: "Token skrevs till kortet!",
      capacity:
        "Kortet kanske inte har tillräcklig kapacitet ({bytes} byte krävs).",
    },
  },
  CreateInvoiceDialog: {
    formats: {
      bolt11: "Faktura",
      bolt12: "Erbjudande",
    },
    onchain_title: "Ta emot on-chain",
    bolt12_title: "Ta emot Bolt12",
    mint_unreachable: "Minten går inte att nå",
    mint_unreachable_text:
      "Anslut till minten igen för att ta emot betalningar.",
    reconnect_mint: "Återanslut minten",
    checking_address: "Kontrollerar adress...",
    add_amount: "Lägg till belopp",
    new_offer: "Nytt erbjudande",
    create_offer: "Skapa erbjudande",
    create_new_address: "Skapa ny adress",
    create_address: "Skapa adress",
    onchain_unsupported:
      "Denna mint stöder inte on-chain-insättningar i denna enhet.",
    deposit_limits: {
      outside: "Insättningar utanför {min}–{max} krediteras inte.",
      below: "Insättningar under {min} krediteras inte.",
      above: "Insättningar över {max} krediteras inte.",
    },
    amount_errors: {
      positive_decimal:
        "Ange ett positivt belopp i {unit} med högst två decimaler.",
      positive_whole: "Ange ett positivt heltal i {unit}.",
      min: "Ange minst {amount}.",
      max: "Ange högst {amount}.",
    },
  },
};
