export default {
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
        label: "Växla",
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
  MainHeader: {
    menu: {
      settings: {
        title: "Inställningar",
        settings: {
          title: "Inställningar",
          caption: "Plånbokens konfiguration",
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
    language: {
      title: "Språk",
      description: "Välj önskat språk från listan nedan.",
    },
    sections: {
      backup_restore: "SÄKERHETSKOPIERING & ÅTERSTÄLLNING",
      lightning_address: "LIGHTNING ADRESS",
      nostr_keys: "NOSTR NYCKLAR",
      payment_requests: "BETALNINGSFÖRFRÅGNINGAR",
      nostr_wallet_connect: "NOSTR WALLET CONNECT",
      hardware_features: "HARDWARE FUNKTIONER",
      p2pk_features: "P2PK FUNKTIONER",
      privacy: "INTEGRITET",
      experimental: "EXPERIMENTELLT",
      appearance: "UTSEENDE"
    },
    backup_restore: {
      backup_seed: {
        title: "Säkerhetskopiera seed-fras",
        description: "Din seed-fras kan återställa din plånbok. Håll den säker och privat.",
        seed_phrase_label: "Seed-fras",
      },
      restore_ecash: {
        title: "Återställ ecash",
        description: "Återställningsguiden låter dig återställa förlorad ecash från en mnemonic seed-fras. Din nuvarande plånboks seed-fras kommer inte att påverkas, guiden låter dig bara återställa ecash från en annan seed-fras.",
        button: "Återställ"
      }
    },
    lightning_address: {
      title: "Lightning adress",
      description: "Ta emot betalningar till din Lightning adress.",
      enable: {
        toggle: "Aktivera",
        description: "Lightning adress med npub.cash"
      },
      address: {
        copy_tooltip: "Kopiera Lightning adress"
      },
      automatic_claim: {
        toggle: "Kräv automatiskt",
        description: "Ta emot inkommande betalningar automatiskt."
      }
    },
    nostr_keys: {
      title: "Dina Nostr-nycklar",
      description: "Ställ in Nostr-nycklarna för din Lightning-adress.",
      wallet_seed: {
        title: "Plånbokens seed-fras",
        description: "Generera Nostr-nyckelpar från plånbokens seed",
        copy_nsec: "Kopiera nsec"
      },
      nsec_bunker: {
        title: "Nsec Bunker",
        description: "Använd en NIP-46 bunker",
        delete_tooltip: "Radera anslutning"
      },
      use_nsec: {
        title: "Använd din nsec",
        description: "Denna metod är farlig och rekommenderas inte",
        delete_tooltip: "Radera nsec"
      },
      signing_extension: {
        title: "Signeringsutökning",
        description: "Använd en NIP-07 signeringsutökning",
        not_found: "Ingen NIP-07 signeringsutökning hittades"
      }
    },
    payment_requests: {
      title: "Betalningsförfrågningar",
      description: "Betalningsförfrågningar låter dig ta emot betalningar via nostr. Om du aktiverar detta kommer din plånbok att prenumerera på dina nostr-relays.",
      enable_toggle: "Aktivera betalningsförfrågningar",
      claim_automatically: {
        toggle: "Kräv automatiskt",
        description: "Ta emot inkommande betalningar automatiskt."
      }
    },
    nostr_wallet_connect: {
      title: "Nostr Wallet Connect (NWC)",
      description: "Använd NWC för att styra din plånbok från vilken annan applikation som helst.",
      enable_toggle: "Aktivera NWC",
      payments_note: "Du kan endast använda NWC för betalningar från ditt Bitcoin-saldo. Betalningar kommer att göras från din aktiva mint.",
      connection: {
        copy_tooltip: "Kopiera anslutningssträng",
        qr_tooltip: "Visa QR-kod",
        allowance_label: "Tillåtet kvar (sat)"
      },
      relays: {
        expand_label: "Klicka för att redigera relays",
        add: {
          title: "Lägg till relay",
          description: "Nostr Wallet Connect använder nostr-relays för att ansluta din plånbok till andra applikationer."
        },
        list: {
          title: "Relays",
          description: "Din plånbok kommer att ansluta till dessa relays.",
          copy_tooltip: "Kopiera relay",
          remove_tooltip: "Ta bort relay"
        }
      }
    },
    hardware_features: {
      webnfc: {
        title: "WebNFC",
        description: "Välj kodning för att skriva till NFC-kort",
        text: {
          title: "Text",
          description: "Lagra token som klartext"
        },
        weburl: {
          title: "URL",
          description: "Lagra URL till denna plånbok med token"
        },
        binary: {
          title: "Rå binär",
          description: "Råa byte istället för Base64. Gör token ~33% kortare."
        },
        quick_access: {
          toggle: "Snabbåtkomst till NFC",
          description: "Skanna snabbt NFC-kort i menyn 'Ta emot Ecash'. Detta alternativ lägger till en NFC-knapp i menyn 'Ta emot Ecash'."
        }
      }
    },
    p2pk_features: {
      title: "P2PK",
      description: "Generera ett nyckelpar för att ta emot P2PK-låst ecash. Varning: Denna funktion är experimentell. Använd endast med små belopp. Om du förlorar dina privata nycklar kommer ingen att kunna låsa upp den ecash som är låst till den längre.",
      generate_button: "Generera nyckel",
      import_button: "Importera nsec",
      quick_access: {
        toggle: "Snabbåtkomst till lås",
        description: "Använd detta för att snabbt visa din P2PK-låsnyckel i menyn 'Ta emot Ecash'."
      },
      keys_expansion: {
        label: "Klicka för att bläddra bland {count} nycklar",
        used_badge: "använd"
      }
    },
    privacy: {
      title: "Integritet",
      description: "Dessa inställningar påverkar din integritet.",
      check_incoming: {
        toggle: "Kontrollera inkommande faktura",
        description: "Om aktiverad kommer plånboken att kontrollera den senaste fakturan i bakgrunden. Detta ökar plånbokens responsivitet vilket gör fingeravtryckning enklare. Du kan manuellt kontrollera obetalda fakturor i fliken Fakturor."
      },
      check_startup: {
        toggle: "Kontrollera väntande fakturor vid start",
        description: "Om aktiverad kommer plånboken att kontrollera väntande fakturor från de senaste 24 timmarna vid start."
      },
      check_all: {
        toggle: "Kontrollera alla fakturor",
        description: "Om aktiverad kommer plånboken periodvis att kontrollera obetalda fakturor i bakgrunden i upp till två veckor. Detta ökar plånbokens online-aktivitet vilket gör fingeravtryckning enklare. Du kan manuellt kontrollera obetalda fakturor i fliken Fakturor."
      },
      check_sent: {
        toggle: "Kontrollera skickad ecash",
        description: "Om aktiverad kommer plånboken att använda periodiska bakgrundskontroller för att avgöra om skickade token har lösts in. Detta ökar plånbokens online-aktivitet vilket gör fingeravtryckning enklare."
      },
      websockets: {
        toggle: "Använd WebSockets",
        description: "Om aktiverad kommer plånboken att använda långlivade WebSocket-anslutningar för att ta emot uppdateringar om betalda fakturor och spenderade token från mints. Detta ökar plånbokens responsivitet men gör också fingeravtryckning enklare."
      },
      bitcoin_price: {
        toggle: "Hämta växelkurs från Coinbase",
        description: "Om aktiverad kommer den aktuella Bitcoin-växelkursen att hämtas från coinbase.com och ditt konverterade saldo visas."
      }
    },
    experimental: {
      title: "Experimentellt",
      description: "Dessa funktioner är experimentella.",
      receive_swaps: {
        toggle: "Ta emot swaps",
        badge: "Beta",
        description: "Möjlighet att växla mottagen Ecash till din aktiva mint i dialogrutan 'Ta emot Ecash'."
      },
      auto_paste: {
        toggle: "Klistra in Ecash automatiskt",
        description: "Klistra automatiskt in ecash från ditt urklipp när du trycker på 'Ta emot', sedan 'Ecash', sedan 'Klistra in'. Automatisk inklistring kan orsaka UI-problem i iOS, stäng av det om du upplever problem."
      },
      auditor: {
        toggle: "Aktivera granskare",
        badge: "Beta",
        description: "Om aktiverad visar plånboken granskarens information i dialogrutan 'Mintdetaljer'. Granskaren är en tredjepartstjänst som övervakar mints tillförlitlighet.",
        url_label: "Granskarens URL",
        api_url_label: "Granskarens API URL"
      }
    },
    appearance: {
      keyboard: {
        title: "Skärmtangentbord",
        description: "Använd det numeriska tangentbordet för att ange belopp.",
        toggle: "Använd numeriskt tangentbord",
        toggle_description: "Om aktiverad kommer det numeriska tangentbordet att användas för att ange belopp."
      },
      theme: {
        title: "Utseende",
        description: "Ändra hur din plånbok ser ut.",
        tooltips: {
          mono: "mono",
          cyber: "cyber",
          freedom: "freedom",
          nostr: "nostr",
          bitcoin: "bitcoin",
          mint: "mint",
          nut: "nut",
          blu: "blu",
          flamingo: "flamingo"
        }
      }
    },
    advanced: {
      title: "Avancerat",
      developer: {
        title: "Utvecklarinställningar",
        description: "Följande inställningar är för utveckling och felsökning.",
        new_seed: {
          button: "Generera ny seed-fras",
          description: "Detta genererar en ny seed-fras. Du måste skicka hela ditt saldo till dig själv för att kunna återställa det med en ny seed.",
          confirm_question: "Är du säker på att du vill generera en ny seed-fras?",
          cancel: "Avbryt",
          confirm: "Bekräfta"
        },
        remove_spent: {
          button: "Ta bort spenderade bevis",
          description: "Kontrollera om ecash-token från dina aktiva mints är spenderade och ta bort de spenderade från din plånbok. Använd detta endast om din plånbok har fastnat."
        },
        debug_console: {
          button: "Växla debug-konsol",
          description: "Öppna Javascript debug terminal. Klistra aldrig in något i denna terminal som du inte förstår. En tjuv kan försöka lura dig att klistra in skadlig kod här."
        },
        export_proofs: {
          button: "Exportera aktiva bevis",
          description: "Kopiera hela ditt saldo från den aktiva minten som en Cashu-token till ditt urklipp. Detta kommer endast att exportera token från den valda minten och enheten. För en fullständig export, välj en annan mint och enhet och exportera igen."
        },
        keyset_counters: {
          title: "Öka keyset-räknare",
          description: "Klicka på keyset-ID för att öka derivation path-räknarna för keysets i din plånbok. Detta är användbart om du ser felet \"outputs have already been signed\"."
        },
        unset_reserved: {
          button: "Frigör alla reserverade token",
          description: "Denna plånbok markerar väntande utgående ecash som reserverat (och drar av det från ditt saldo) för att förhindra double-spend-försök. Denna knapp frigör alla reserverade token så att de kan användas igen. Om du gör detta kan din plånbok inkludera spenderade bevis. Tryck på knappen \"Ta bort spenderade bevis\" för att bli av med dem."
        },
        show_onboarding: {
          button: "Visa introduktion",
          description: "Visa introduktionsskärmen igen."
        },
        reset_wallet: {
          button: "Återställ plånboksdata",
          description: "Återställ dina plånboksdata. Varning: Detta kommer att radera allt! Se till att du skapar en säkerhetskopia först.",
          confirm_question: "Är du säker på att du vill radera dina plånboksdata?",
          cancel: "Avbryt",
          confirm: "Radera plånbok"
        },
        export_wallet: {
          button: "Exportera plånboksdata",
          description: "Ladda ner en dump av din plånbok. Du kan återställa din plånbok från denna fil på välkomstskärmen för en ny plånbok. Denna fil kommer att vara osynkroniserad om du fortsätter att använda din plånbok efter exporten."
        }
      }
    }
  },
  NoMintWarnBanner: {
    title: "Gå med i en mint",
    subtitle:
      "Du har inte gått med i någon Cashu mint än. Lägg till en mint URL i inställningarna eller ta emot ecash från en ny mint för att komma igång.",
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
    text: "En annan flik körs redan. Stäng denna flik och försök igen.",
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
      label: "Mint-fel",
    },
    pending: {
      label: "Väntar",
      tooltip: "Kontrollera alla väntande token",
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
    text: "Cashu.me är en gratis och öppen källkod Bitcoin-plånbok som använder ecash för att hålla dina pengar säkra och privata.",
    actions: {
      more: {
        label: "Klicka för att lära dig mer",
      },
    },
    p1: {
      text: "Cashu är ett gratis och öppen källkod ecash-protokoll för Bitcoin. Du kan lära dig mer om det på { link }.",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "Denna plånbok är inte kopplad till någon mint. För att använda denna plånbok måste du ansluta till en eller flera Cashu mints som du litar på.",
    },
    p3: {
      text: "Denna plånbok lagrar ecash som bara du har tillgång till. Om du raderar din webbläsardata utan en seed-fras säkerhetskopia, kommer du att förlora dina token.",
    },
    p4: {
      text: "Denna plånbok är i beta. Vi tar inget ansvar för personer som förlorar tillgång till pengar. Använd på egen risk! Denna kod är öppen källkod och licensierad under MIT-licensen.",
    },
  },
  WelcomeSlide2: {
    title: "Installera PWA",
    instruction: {
      intro: {
        text: "För bästa upplevelse, använd denna plånbok med din enhets inbyggda webbläsare för att installera den som en Progressive Web App. Gör detta nu.",
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
          text: "Tryck på dela (längst ner)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Tryck på { buttonText }",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "När du har installerat denna app på din enhet, stäng detta webbläsarfönster och använd appen från din hemskärm.",
      },
    },
    pwa: {
      success: {
        title: "Lyckades!",
        text: "Du använder Cashu som en PWA. Stäng alla andra öppna webbläsarfönster och använd appen från din hemskärm.",
      },
    },
  },
  iOSPWAPrompt: {
    text: "Tryck på { icon } och { buttonText }",
    buttonText: "Lägg till på hemskärmen",
  },
  AndroidPWAPrompt: {
    text: "Tryck på { icon } och { buttonText }",
    buttonText: "Lägg till på startskärmen",
  },
  WelcomeSlide3: {
    title: "Din Seed-fras",
    text: "Lagra din seed-fras i en lösenordshanterare eller på papper. Din seed-fras är det enda sättet att återställa dina pengar om du förlorar åtkomst till denna enhet.",
    inputs: {
      seed_phrase: {
        label: "Seed-fras",
        caption: "Du kan se din seed-fras i inställningarna.",
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
        label: "Läs Användarvillkor",
      },
    },
    inputs: {
      checkbox: {
        label: "Jag har läst och accepterar dessa villkor",
      },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "Återställ från Seed-fras",
      caption:
        "Ange din seed-fras för att återställa din plånbok. Innan du återställer, se till att du har lagt till alla mints som du har använt tidigare.",
      inputs: {
        seed_phrase: {
          label: "Seed-fras",
          caption: "Du kan se din seed-fras i inställningarna.",
        },
      },
    },
    information: {
      label: "Information",
      caption:
        "Assistenten kommer endast att återställa ecash från en annan seed-fras, du kommer inte att kunna använda denna seed-fras eller ändra seed-frasen för plånboken du använder för närvarande. Detta innebär att återställd ecash inte kommer att skyddas av din nuvarande seed-fras så länge du inte skickar ecash till dig själv en gång.",
    },
    restore_mints: {
      label: "Återställ Mints",
      caption:
        'Välj minten att återställa. Du kan lägga till fler mints i huvudskärmen under "Mints" och återställa dem här.',
    },
    actions: {
      paste: {
        error: "Misslyckades att läsa urklippets innehåll.",
      },
      validate: {
        error: "Mnemonisk fras bör vara minst 12 ord lång.",
      },
      restore: {
        label: "Återställ",
        in_progress: "Återställer mint…",
        error: "Fel vid återställning av mint: { error }",
      },
      restore_all_mints: {
        label: "Återställ alla Mints",
        in_progress: "Återställer mint { index } av { length }…",
        success: "Återställning slutförd framgångsrikt",
        error: "Fel vid återställning av mints: { error }",
      },
    },
  },
  MintSettings: {
    add: {
      title: "Lägg till mint",
      description:
        "Ange URL:en till en Cashu mint för att ansluta till den. Denna plånbok är inte kopplad till någon mint.",
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
          "Dessa mints rekommenderades av andra Nostr-användare. Läs recensioner på { link }. Var försiktig och gör din egen forskning innan du använder en mint.",
        actions: {
          browse: {
            label: "Klicka för att bläddra bland mints",
          },
        },
      },
    },
    swap: {
      title: "Växla",
      overline: "Multimint-växlingar",
      caption:
        "Växla pengar mellan mints via Lightning. Notera: Lämna utrymme för potentiella Lightning-avgifter. Om den inkommande betalningen inte lyckas, kontrollera fakturan manuellt.",
      inputs: {
        from: {
          label: "Från",
        },
        to: {
          label: "Till",
        },
        amount: {
          label: "Belopp ({ ticker }))",
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
    title: "Skapa faktura",
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
    title: "Skicka { value }",
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
        tooltip_text: "Radera från historik",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "Skriv till NFC-kort",
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
    title: "Ta emot { value }",
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
        tooltip_text: "Växla till en betrodd mint",
        caption: "Växla { value }",
      },
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "Avbryt växling",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      later: {
        label: "Senare",
        tooltip_text: "Lägg till historik för att ta emot senare",
        already_in_history_success_text: "Ecash redan i historiken",
        added_to_history_success_text: "Ecash tillagd i historiken",
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
      caption: "P2PK-nyckel",
      description: "Ta emot ecash låst till denna nyckel",
      used_warning_text:
        "Varning: Denna nyckel har använts tidigare. Använd en ny nyckel för bättre integritet.",
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
        label: "Vilken mint som helst",
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
          "Tangentbord inaktiverat. Du kan återaktivera tangentbordet i inställningarna.",
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
        "Styr din plånbok på distans med NWC. Tryck på QR-koden för att länka din plånbok med en kompatibel app.",
      warning_text:
        "Varning: vem som helst med åtkomst till denna anslutningssträng kan initiera betalningar från din plånbok. Dela inte!",
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
    title: "Meddelande från Mint",
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
    empty_text: "Ingen historik ännu",
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
    empty_text: "Inga fakturor ännu",
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
      "Obs: Eftersom denna plånbok är paranoid kommer din ecash från denna mint inte att raderas permanent utan kommer att förbli lagrad på din enhet. Du kommer att se den dyka upp igen om du lägger till minten igen senare.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "Radera mint",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
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
    prepare_info_text: "Förbereder återställningsprocess…",
    restored_proofs_for_keyset_info_text:
      "{ restoreCounter } bevis återställda för keyset { keysetId }",
    checking_proofs_for_keyset_info_text:
      "Kontrollerar bevis { startIndex } till { endIndex } för keyset { keysetId }",
    no_proofs_info_text: "Inga bevis att återställa hittades",
    restored_amount_success_text: "{ amount } återställt",
  },
  swap: {
    in_progress_warning_text: "Växling pågår",
    invalid_swap_data_error_text: "Ogiltig växlingsdata",
    swap_error_text: "Fel vid växling",
  },
};
