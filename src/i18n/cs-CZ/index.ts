export default {
  global: {
    copy_to_clipboard: {
      success: "Zkopírováno do schránky!",
    },
    actions: {
      add_mint: {
        label: "Přidat mint",
      },
      cancel: {
        label: "Zrušit",
      },
      copy: {
        label: "Kopírovat",
      },
      close: {
        label: "Zavřít",
      },
      enter: {
        label: "Potvrdit",
      },
      lock: {
        label: "Uzamknout",
      },
      paste: {
        label: "Vložit",
      },
      receive: {
        label: "Přijmout",
      },
      scan: {
        label: "Skenovat",
      },
      send: {
        label: "Odeslat",
      },
      pay: {
        label: "Zaplatit",
      },
      swap: {
        label: "Směnit",
      },
      update: {
        label: "Aktualizovat",
      },
    },
    inputs: {
      mint_url: {
        label: "URL mintu",
      },
    },
  },
  common: {
    fee: "Poplatek",
  },
  MultinutPicker: {
    payment: "Platba Multinut",
    selectMints:
      "Vyberte jeden nebo více mintů, ze kterých se má platba provést.",
    totalSelectedBalance: "Celkový vybraný zůstatek",
    multiMintPay: "Platba z více mintů",
    balanceNotEnough: "Zůstatek napříč minty nestačí k uhrazení této faktury",
    failed: "Zpracování selhalo: {error}",
    paid: "Zaplaceno {amount} přes Lightning",
  },
  wallet: {
    notifications: {
      balance_too_low: "Zůstatek je příliš nízký",
      received: "Přijato {amount}",
      fee: " (poplatek: {fee})",
      could_not_request_mint: "Nepodařilo se požádat mint",
      invoice_still_pending: "Faktura zatím nevyřízena",
      paid_lightning: "Zaplaceno {amount} přes Lightning",
      payment_pending_refresh: "Platba nevyřízena. Obnovte fakturu ručně.",
      sent: "Odesláno {amount}",
      token_still_pending: "Token stále nevyřízen",
      received_lightning: "Přijato {amount} přes Lightning",
      lightning_payment_failed: "Lightning platba selhala",
      failed_to_decode_invoice: "Nepodařilo se dekódovat fakturu",
      invalid_lnurl: "Neplatné LNURL",
      lnurl_error: "Chyba LNURL",
      no_amount: "Nebyla zadána částka",
      no_lnurl_data: "Žádná LNURL data",
      no_price_data: "Žádná cenová data.",
      please_try_again: "Zkuste to prosím znovu.",
      trying_again: "Zkouší se znovu...",
    },
    mint: {
      notifications: {
        already_added: "Mint je již přidán",
        added: "Mint přidán",
        not_found: "Mint nebyl nalezen",
        activation_failed: "Aktivace mintu selhala",
        no_active_mint: "Žádný aktivní mint",
        unit_activation_failed: "Aktivace jednotky selhala",
        unit_not_supported: "Jednotka není mintem podporována",
        activated: "Mint aktivován",
        could_not_connect: "Nelze se připojit k mintu",
        could_not_get_info: "Nelze získat informace o mintu",
        could_not_get_keys: "Nelze získat klíče mintu",
        could_not_get_keysets: "Nelze získat keysety mintu",
        mint_validation_error: "Chyba ověření mintu",
        removed: "Mint odebrán",
        error: "Chyba mintu",
      },
    },
  },
  MainHeader: {
    menu: {
      settings: {
        title: "Nastavení",
        settings: {
          title: "Nastavení",
          caption: "Nastavení peněženky",
        },
      },
      terms: {
        title: "Podmínky",
        terms: {
          title: "Podmínky",
          caption: "Podmínky služby",
        },
      },
      links: {
        title: "Odkazy",
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
          title: "Darovat",
          caption: "Podpořit Cashu",
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
        text: "Obnovení za { countdown }",
      },
    },
    staging: {
      warning: {
        text: "Staging – nepoužívejte se skutečnými prostředky!",
      },
    },
  },
  FullscreenHeader: {
    actions: {
      back: {
        label: "Peněženka",
      },
    },
  },
  Settings: {
    menu: {
      title: "Nastavení",
      backup: {
        title: "Záloha a obnovení",
        caption: "Seed fráze a obnovení ecash",
      },
      lightning_address: {
        title: "Lightning adresa",
        caption: "Přijímejte platby na svou Lightning adresu",
      },
      nostr: {
        title: "Nostr",
        caption: "Klíče, relaye a Web of Trust",
      },
      payment_requests: {
        title: "Platební požadavky",
        caption: "Přijímejte ecash platby přes nostr",
      },
      nwc: {
        title: "Nostr Wallet Connect",
        caption: "Používejte peněženku z jiných aplikací",
      },
      hardware: {
        title: "Hardware",
        caption: "Nastavení NFC",
      },
      p2pk: {
        title: "P2PK",
        caption: "Přijímejte ecash uzamčený na vaše klíče",
      },
      privacy: {
        title: "Soukromí",
        caption: "Síťové kontroly a cena Bitcoinu",
      },
      experimental: {
        title: "Experimentální",
        caption: "Vyzkoušejte nové funkce jako první",
      },
      appearance: {
        title: "Vzhled",
        caption: "Motiv, klávesnice a symbol Bitcoinu",
      },
      language: {
        title: "Jazyk",
        caption: "Vyberte si jazyk",
      },
      advanced: {
        title: "Pokročilé",
        caption: "Vývojářské nástroje a reset peněženky",
      },
    },
    language: {
      title: "Jazyk",
      description: "Vyberte si preferovaný jazyk ze seznamu níže.",
    },
    sections: {
      backup_restore: "ZÁLOHA A OBNOVA",
      lightning_address: "LIGHTNING ADRESA",
      nostr_keys: "NOSTR KLÍČE",
      nostr: {
        title: "NOSTR",
        relays: {
          expand_label: "Klikněte pro úpravu relayů",
          add: {
            title: "Přidat relay",
            description:
              "Vaše peněženka používá tyto relaye pro Nostr operace, jako jsou žádosti o platbu, Nostr Wallet Connect a zálohy.",
          },
          list: {
            title: "Relaye",
            description: "Vaše peněženka se připojí k těmto relayům.",
            copy_tooltip: "Kopírovat relay",
            remove_tooltip: "Odebrat relay",
          },
        },
      },
      payment_requests: "ŽÁDOSTI O PLATBU",
      nostr_wallet_connect: "NOSTR WALLET CONNECT",
      hardware_features: "HARDWAROVÉ FUNKCE",
      p2pk_features: "P2PK FUNKCE",
      privacy: "SOUKROMÍ",
      experimental: "EXPERIMENTÁLNÍ",
      appearance: "VZHLED",
    },
    backup_restore: {
      backup_seed: {
        title: "Záloha seed fráze",
        description:
          "Seed fráze umožňuje obnovit vaši peněženku. Uchovávejte ji v bezpečí a v soukromí.",
        seed_phrase_label: "Seed fráze",
      },
      restore_ecash: {
        title: "Obnovit ecash",
        description:
          "Průvodce obnovou vám umožní obnovit ztracený ecash pomocí mnemotechnické seed fráze. Seed fráze vaší aktuální peněženky zůstane nedotčena – průvodce umožňuje obnovu ecashe pouze z jiné seed fráze.",
        button: "Obnovit",
      },
    },
    lightning_address: {
      title: "Lightning adresa",
      description: "Přijímejte platby na svou Lightning adresu.",
      enable: {
        toggle: "Povolit",
        description: "Lightning adresa s npub.cash",
      },
      address: {
        copy_tooltip: "Kopírovat Lightning adresu",
      },
      automatic_claim: {
        toggle: "Přijímat automaticky",
        description: "Automaticky přijímat příchozí platby.",
      },
      npc_v2: {
        choose_mint_title: "Vyberte mint pro npub.cash v2",
        choose_mint_placeholder: "Vyberte mint…",
      },
    },

    nostr_keys: {
      title: "Vaše Nostr klíče",
      description:
        "Vaše Nostr klíče budou použity k určení vaší Lightning adresy.",
      wallet_seed: {
        title: "Seed fráze peněženky",
        description: "Vygenerovat Nostr klíčový pár ze seedu peněženky",
        copy_nsec: "Kopírovat nsec",
      },
      nsec_bunker: {
        title: "Nsec Bunker",
        description: "Použít NIP-46 bunker",
        delete_tooltip: "Odstranit připojení",
      },
      use_nsec: {
        title: "Použít vlastní nsec",
        description: "Tato metoda je nebezpečná a nedoporučuje se",
        delete_tooltip: "Odstranit nsec",
      },
      signing_extension: {
        title: "Podepisovací rozšíření",
        description: "Použít podepisovací rozšíření NIP-07",
        not_found: "Nenalezeno žádné podepisovací rozšíření NIP-07",
      },
    },

    payment_requests: {
      title: "Žádosti o platbu",
      description:
        "Žádosti o platbu vám umožňují přijímat platby přes Nostr. Pokud tuto funkci povolíte, vaše peněženka se přihlásí k odběru vašich Nostr relayů.",
      enable_toggle: "Povolit žádosti o platbu",
      claim_automatically: {
        toggle: "Přijímat automaticky",
        description: "Automaticky přijímat příchozí platby.",
      },
    },

    nostr_wallet_connect: {
      title: "Nostr Wallet Connect (NWC)",
      description:
        "Použijte NWC k ovládání své peněženky z jakékoli jiné aplikace.",
      enable_toggle: "Povolit NWC",
      payments_note:
        "NWC lze použít pouze pro platby z vašeho bitcoinového zůstatku. Platby budou prováděny z aktivního mintu.",
      connection: {
        copy_tooltip: "Kopírovat připojovací řetězec",
        qr_tooltip: "Zobrazit QR kód",
        allowance_label: "Zbývající limit (sat)",
      },
    },

    hardware_features: {
      webnfc: {
        title: "WebNFC",
        description: "Vyberte kódování pro zápis na NFC karty",
        text: {
          title: "Text",
          description: "Uložit token jako prostý text",
        },
        weburl: {
          title: "URL",
          description: "Uložit URL této peněženky spolu s tokenem",
        },
        binary: {
          title: "Binární",
          description: "Uložit tokeny jako binární data",
        },
        quick_access: {
          toggle: "Rychlý přístup k NFC",
          description:
            "Rychlé skenování NFC karet v nabídce Přijmout ecash. Tato volba přidá tlačítko NFC do nabídky Přijmout ecash.",
        },
      },
    },

    p2pk_features: {
      title: "P2PK",
      description:
        "Vygenerujte klíčový pár pro příjem ecashe uzamčeného pomocí P2PK. Varování: Tato funkce je experimentální. Používejte ji pouze s malými částkami. Pokud ztratíte své soukromé klíče, nikdo už nebude schopen ecash uzamčený k nim odemknout.",
      generate_button: "Vygenerovat klíč",
      import_button: "Importovat nsec",
      quick_access: {
        toggle: "Rychlý přístup k uzamčení",
        description:
          "Použijte tuto možnost pro rychlé zobrazení vašeho P2PK uzamykacího klíče v nabídce Přijmout ecash.",
      },
      keys_expansion: {
        label: "Klikněte pro zobrazení {count} klíčů",
        used_badge: "použito",
      },
    },

    privacy: {
      title: "Soukromí",
      description: "Tato nastavení ovlivňují vaše soukromí.",
      check_incoming: {
        toggle: "Kontrolovat příchozí faktury",
        description:
          "Pokud je povoleno, peněženka bude na pozadí kontrolovat nejnovější fakturu. To zvyšuje odezvu peněženky, ale také usnadňuje fingerprinting. Nezaplacené faktury můžete kontrolovat ručně na kartě Faktury.",
      },
      check_startup: {
        toggle: "Kontrolovat čekající faktury při spuštění",
        description:
          "Pokud je povoleno, peněženka při spuštění zkontroluje čekající faktury z posledních 24 hodin.",
      },
      check_all: {
        toggle: "Kontrolovat všechny faktury",
        description:
          "Pokud je povoleno, peněženka bude až po dobu dvou týdnů periodicky kontrolovat nezaplacené faktury na pozadí. To zvyšuje síťovou aktivitu peněženky a usnadňuje fingerprinting. Nezaplacené faktury můžete kontrolovat ručně na kartě Faktury.",
      },
      check_sent: {
        toggle: "Kontrolovat odeslaný ecash",
        description:
          "Pokud je povoleno, peněženka bude pomocí periodických kontrol na pozadí zjišťovat, zda byly odeslané tokeny uplatněny. To zvyšuje síťovou aktivitu peněženky a usnadňuje fingerprinting.",
      },
      websockets: {
        toggle: "Používat WebSockety",
        description:
          "Pokud je povoleno, peněženka bude používat dlouhodobá WebSocket připojení pro přijímání aktualizací o zaplacených fakturách a utracených tokenech z mintů. To zvyšuje odezvu peněženky, ale také usnadňuje fingerprinting.",
      },
      bitcoin_price: {
        toggle: "Získávat kurz z Coinbase",
        description:
          "Pokud je povoleno, aktuální kurz Bitcoinu bude načítán z coinbase.com a převedený zůstatek bude zobrazen.",
        currency: {
          title: "Fiat měna",
          description: "Vyberte fiat měnu pro zobrazení ceny Bitcoinu.",
        },
      },
    },

    experimental: {
      title: "Experimentální",
      description: "Tyto funkce jsou experimentální.",
      receive_swaps: {
        toggle: "Přijímat swapy",
        badge: "Beta",
        description:
          "Možnost směnit přijatý ecash na váš aktivní mint v dialogu Přijmout ecash.",
      },
      auto_paste: {
        toggle: "Automaticky vkládat ecash",
        description:
          "Automaticky vloží ecash ze schránky při stisknutí Přijmout → Ecash → Vložit. Automatické vkládání může na iOS způsobovat problémy v UI – pokud k nim dochází, vypněte tuto funkci.",
      },
      auditor: {
        toggle: "Povolit auditora",
        badge: "Beta",
        description:
          "Pokud je povoleno, peněženka zobrazí informace o auditorovi v dialogu detailů mintu. Auditor je služba třetí strany, která sleduje spolehlivost mintů.",
        url_label: "URL auditora",
        api_url_label: "API URL auditora",
      },
      multinut: {
        toggle: "Povolit Multinut",
        description:
          "Pokud je povoleno, peněženka použije Multinut k placení faktur z více mintů najednou.",
      },
      nostr_mint_backup: {
        toggle: "Zálohovat seznam mintů na Nostr",
        description:
          "Pokud je povoleno, váš seznam mintů bude automaticky zálohován na Nostr relaye pomocí nakonfigurovaných Nostr klíčů. To umožňuje obnovu seznamu mintů napříč zařízeními.",
        notifications: {
          enabled: "Záloha mintů na Nostr povolena",
          disabled: "Záloha mintů na Nostr zakázána",
          failed: "Nepodařilo se povolit zálohu mintů na Nostr",
        },
      },
    },
    appearance: {
      keyboard: {
        title: "Klávesnice na obrazovce",
        description: "Použít číselnou klávesnici pro zadávání částek.",
        toggle: "Použít číselnou klávesnici",
        toggle_description:
          "Pokud je povoleno, pro zadávání částek bude použita číselná klávesnice.",
      },
      theme: {
        title: "Vzhled",
        description: "Změňte vzhled své peněženky.",
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
        title: "Symbol Bitcoinu",
        description: "Používat symbol ₿ místo satů.",
        toggle: "Používat symbol ₿",
      },
    },
    web_of_trust: {
      title: "Web of trust",
      known_pubkeys: "Známé pubkey: {wotCount}",
      continue_crawl: "Pokračovat v procházení",
      crawl_odell: "Procházet ODELLŮV WEB OF TRUST",
      crawl_wot: "Procházet web of trust",
      pause: "Pozastavit",
      reset: "Resetovat",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      use_npubx: "Použít npubx.cash",
      copy_lightning_address: "Kopírovat Lightning adresu",
      v2_mint: "mint pro npub.cash v2",
    },
    multinut: {
      use_multinut: "Použít Multinut",
    },
    advanced: {
      title: "Pokročilé",
      developer: {
        title: "Vývojářská nastavení",
        description: "Následující nastavení slouží pro vývoj a ladění.",
        new_seed: {
          button: "Vygenerovat novou seed frázi",
          description:
            "Tímto se vygeneruje nová seed fráze. Abyste ji mohli později obnovit, musíte si nejprve poslat celý zůstatek sami sobě.",
          confirm_question: "Opravdu chcete vygenerovat novou seed frázi?",
          cancel: "Zrušit",
          confirm: "Potvrdit",
        },
        remove_spent: {
          button: "Odstranit utracené proofy",
          description:
            "Zkontroluje, zda jsou ecash tokeny z vašich aktivních mintů utracené, a odstraní ty utracené z peněženky. Používejte pouze v případě, že je peněženka zaseknutá.",
        },
        debug_console: {
          button: "Přepnout ladicí konzoli",
          description:
            "Otevře ladicí Javascript konzoli. Nikdy sem nevkládejte nic, čemu nerozumíte. Útočník by vás mohl přimět vložit sem škodlivý kód.",
        },
        export_proofs: {
          button: "Exportovat aktivní proofy",
          description:
            "Zkopíruje celý váš zůstatek z aktivního mintu jako Cashu token do schránky. Exportuje se pouze vybraný mint a jednotka. Pro kompletní export vyberte jiný mint a jednotku a export opakujte.",
        },
        keyset_counters: {
          title: "Navýšit čítače keysetů",
          description:
            "Kliknutím na ID keysetu zvýšíte čítače derivační cesty pro keysety ve vaší peněžence. To je užitečné, pokud se zobrazí chyba „outputs have already been signed“.",
          counter: "čítač: {count}",
        },
        unset_reserved: {
          button: "Zrušit rezervaci všech tokenů",
          description:
            "Tato peněženka označuje čekající odchozí ecash jako rezervovaný (a odečítá jej ze zůstatku), aby zabránila pokusům o double-spend. Toto tlačítko zruší rezervaci všech tokenů, aby je bylo možné znovu použít. Pokud tak učiníte, peněženka může obsahovat utracené proofy. Pro jejich odstranění použijte tlačítko „Odstranit utracené proofy“.",
        },
        show_onboarding: {
          button: "Zobrazit onboarding",
          description: "Znovu zobrazí úvodní obrazovky.",
        },
        reset_wallet: {
          button: "Resetovat data peněženky",
          description:
            "Resetuje data vaší peněženky. Varování: Tímto dojde ke smazání všeho! Nezapomeňte si nejprve vytvořit zálohu.",
          confirm_question: "Opravdu chcete smazat data peněženky?",
          cancel: "Zrušit",
          confirm: "Smazat peněženku",
        },
        export_wallet: {
          button: "Exportovat data peněženky",
          description:
            "Stáhne výpis vaší peněženky. Z tohoto souboru můžete obnovit peněženku na úvodní obrazovce nové peněženky. Pokud budete peněženku po exportu dál používat, soubor nebude aktuální.",
        },
        import_wallet: {
          button: "Importovat zálohu peněženky",
          description:
            "Obnoví peněženku z dříve exportovaného záložního souboru. Tímto nahradíte aktuální data peněženky daty ze zálohy.",
          confirm_question: "Opravdu chcete obnovit data peněženky?",
          cancel: "Zrušit",
          confirm: "IMPORTOVAT ZÁLOHU PENĚŽENKY",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Připojte mint",
    subtitle:
      "Ještě jste se nepřipojili k žádnému Cashu mintu. Přidejte URL mintu v nastavení nebo přijměte ecash z nového mintu, abyste mohli začít.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Přijmout Ecash",
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
        label: "Historie",
      },
      invoices: {
        label: "Faktury",
      },
      mints: {
        label: "Minty",
      },
    },
    install: {
      text: "Instalovat",
      tooltip: "Nainstalovat Cashu",
    },
  },
  AlreadyRunning: {
    title: "Ne.",
    text: "Jiná karta už běží. Zavřete ji a zkuste to znovu.",
    actions: {
      retry: {
        label: "Zkusit znovu",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Oops. Nic tu není…",
    actions: {
      home: {
        label: "Zpět domů",
      },
    },
  },
  BalanceView: {
    mintUrl: {
      label: "Mint",
    },
    mintBalance: {
      label: "Zůstatek",
    },
    mintError: {
      label: "Chyba mintu",
    },
    pending: {
      label: "Čekající",
      tooltip: "Zkontrolovat všechny čekající tokeny",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "Předchozí",
      },
      next: {
        label: "Další",
      },
    },
  },
  WelcomeSlide1: {
    title: "Vítejte v Cashu",
    text: "Cashu.me je bezplatná a open-source bitcoinová peněženka, která používá ecash pro bezpečné a soukromé uchování vašich prostředků.",
    actions: {
      more: {
        label: "Klikněte pro více informací",
      },
    },
    p1: {
      text: "Cashu je bezplatný a open-source ecash protokol pro Bitcoin. Více informací najdete na { link }.",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "Tato peněženka není spojena s žádným mintem. Chcete-li ji používat, musíte se připojit k jednomu nebo více Cashu mintům, kterým důvěřujete.",
    },
    p3: {
      text: "Tato peněženka uchovává ecash, ke kterému máte přístup pouze vy. Pokud smažete data prohlížeče bez zálohy seed fráze, ztratíte své tokeny.",
    },
    p4: {
      text: "Tato peněženka je v beta verzi. Nenese odpovědnost za ztrátu přístupu k prostředkům. Používejte na vlastní riziko! Tento kód je open-source a licencován pod licencí MIT.",
    },
  },
  WelcomeSlide2: {
    title: "Nainstalujte PWA",
    alt: {
      pwa_example: "Příklad instalace PWA",
    },
    installing: "Instaluje se…",
    instruction: {
      intro: {
        text: "Pro nejlepší zážitek používejte tuto peněženku ve webovém prohlížeči vašeho zařízení a nainstalujte ji jako Progressive Web App.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "Klepněte na menu (vpravo nahoře)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Stiskněte { buttonText }",
          buttonText: "@:AndroidPWAPrompt.buttonText",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "Klepněte na sdílení (dole)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Stiskněte { buttonText }",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "Jakmile tuto aplikaci nainstalujete, zavřete okno prohlížeče a používejte aplikaci z domovské obrazovky.",
      },
    },
    pwa: {
      success: {
        title: "Úspěch!",
        text: "Používáte Cashu jako PWA. Zavřete všechny ostatní okna prohlížeče a používejte aplikaci z domovské obrazovky.",
        nextSteps:
          "Nyní můžete zavřít tuto kartu prohlížeče a otevřít aplikaci z domovské obrazovky.",
      },
    },
  },
  iOSPWAPrompt: {
    text: "Klepněte na { icon } a { buttonText }",
    buttonText: "Přidat na domovskou obrazovku",
  },
  AndroidPWAPrompt: {
    text: "Klepněte na { icon } a { buttonText }",
    buttonText: "Přidat na domovskou obrazovku",
  },
  WelcomeSlide3: {
    title: "Vaše seed fráze",
    text: "Uložte svou seed frázi do správce hesel nebo na papír. Vaše seed fráze je jediný způsob, jak obnovit prostředky, pokud ztratíte přístup k tomuto zařízení.",
    inputs: {
      seed_phrase: {
        label: "Seed fráze",
        caption: "Seed frázi najdete v nastavení.",
      },
      checkbox: {
        label: "Zapsal(a) jsem si ji",
      },
    },
  },
  WelcomeSlide4: {
    title: "Podmínky",
    actions: {
      more: {
        label: "Přečíst Podmínky služby",
      },
    },
    inputs: {
      checkbox: {
        label: "Přečetl(a) jsem a souhlasím s těmito podmínkami",
      },
    },
  },
  WelcomeSlideChoice: {
    title: "Nastavte svou peněženku",
    text: "Chcete obnovit ze seed fráze nebo vytvořit novou peněženku?",
    options: {
      new: {
        title: "Vytvořit novou peněženku",
        subtitle: "Vygenerovat nový seed a přidat minty.",
      },
      recover: {
        title: "Obnovit peněženku",
        subtitle: "Zadejte svou seed frázi, obnovte minty a ecash.",
      },
    },
  },
  WelcomeMintSetup: {
    title: "Přidat minty",
    text: "Minty jsou servery, které vám pomáhají odesílat a přijímat ecash. Vyberte nalezený mint nebo přidejte ručně. Přeskočte a přidejte minty později.",
    sections: {
      your_mints: "Vaše minty",
    },
    restoring: "Obnovují se minty…",
    placeholder: {
      mint_url: "https://",
    },
  },
  WelcomeRecoverSeed: {
    title: "Zadejte seed frázi",
    text: "Vložte nebo napište svou 12slovnou seed frázi pro obnovení.",
    inputs: {
      word: "Slovo { index }",
    },
    actions: {
      paste_all: "Vložit vše",
    },
    disclaimer:
      "Vaše seed fráze se používá pouze lokálně pro odvození klíčů peněženky.",
  },
  WelcomeRestoreEcash: {
    title: "Obnovte svůj ecash",
    text: "Skenujte nevyužité proofy na nakonfigurovaných mintech a přidejte je do peněženky.",
  },
  MintRatings: {
    title: "Recenze mintu",
    reviews: "recenze",
    ratings: "Hodnocení",
    no_reviews: "Žádné recenze nebyly nalezeny",
    your_review: "Vaše recenze",
    no_reviews_to_display: "Žádné recenze k zobrazení.",
    no_rating: "Bez hodnocení",
    out_of: "z",
    rows: "Recenze",
    sort: "Třídit",
    sort_options: {
      newest: "Nejnovější",
      oldest: "Nejstarší",
      highest: "Nejvyšší",
      lowest: "Nejnižší",
    },
    actions: {
      write_review: "Napsat recenzi",
    },
    empty_state_subtitle:
      "Pomozte tím, že napíšete recenzi. Sdílejte svou zkušenost s tímto mintem a pomozte ostatním.",
  },

  CreateMintReview: {
    title: "Recenze mintu",
    publishing_as: "Publikujete jako",
    inputs: {
      rating: { label: "Hodnocení" },
      review: { label: "Recenze (volitelně)" },
    },
    actions: {
      publish: { label: "Odeslat recenzi", in_progress: "Odesílání…" },
    },
  },

  RestoreView: {
    seed_phrase: {
      label: "Obnovit ze seed fráze",
      caption:
        "Zadejte svou seed frázi pro obnovení peněženky. Před obnovením se ujistěte, že jste přidali všechny minty, které jste dříve používali.",
      inputs: {
        seed_phrase: {
          label: "Seed fráze",
          caption: "Seed frázi najdete v nastavení.",
        },
      },
    },
    information: {
      label: "Informace",
      caption:
        "Tento průvodce obnoví pouze ecash z jiné seed fráze, nebudete moci tuto seed frázi používat ani měnit seed frázi aktuální peněženky. Obnovený ecash tak nebude chráněn vaší aktuální seed frází, dokud ho jednou nepošlete sami sobě.",
    },
    restore_mints: {
      label: "Obnovit minty",
      caption:
        'Vyberte mint k obnovení. Další minty můžete přidat na hlavní obrazovce pod "Minty" a obnovit je zde.',
    },
    actions: {
      paste: {
        error: "Nepodařilo se načíst obsah schránky.",
      },
      validate: {
        error: "Mnemonic musí mít alespoň 12 slov.",
      },
      select_all: {
        label: "Vybrat vše",
      },
      deselect_all: {
        label: "Odznačit vše",
      },
      restore: {
        label: "Obnovit",
        in_progress: "Obnovuje se mint …",
        error: "Chyba při obnově mintu: { error }",
      },
      restore_all_mints: {
        label: "Obnovit všechny minty",
        in_progress: "Obnovuje se mint { index } z { length } …",
        success: "Obnova dokončena úspěšně",
        error: "Chyba při obnově mintů: { error }",
      },
      restore_selected_mints: {
        label: "Obnovit vybrané minty ({count})",
        in_progress: "Obnovuje se mint { index } z { length } …",
        success: "Úspěšně obnoven(a) {count} mint(y)",
        error: "Chyba při obnově vybraných mintů: { error }",
      },
    },
    nostr_mints: {
      label: "Obnovit minty z Nostr",
      caption:
        "Hledejte zálohy mintů uložené na Nostr relays pomocí vaší seed fráze. Pomůže to objevit minty, které jste dříve používali.",
      search_button: "Hledat zálohy mintů",
      select_all: "Vybrat vše",
      deselect_all: "Odznačit vše",
      backed_up: "Zálohováno",
      already_added: "Již přidáno",
      add_selected: "Přidat vybrané ({count})",
      no_backups_found: "Nenalezeny žádné zálohy mintů",
      no_backups_hint:
        "Ujistěte se, že záloha mintů na Nostr je v nastavení povolena, aby se váš seznam mintů automaticky zálohoval.",
      invalid_mnemonic: "Než budete hledat, zadejte platnou seed frázi.",
      search_error: "Nepodařilo se vyhledat zálohy mintů.",
      add_error: "Nepodařilo se přidat vybrané minty.",
    },
  },

  MintSettings: {
    add: {
      title: "Přidat mint",
      description:
        "Zadejte URL Cashu mintu, ke kterému se chcete připojit. Tato peněženka není spojena s žádným mintem.",
      inputs: {
        nickname: {
          placeholder: "Přezdívka (např. Testnet)",
        },
      },
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "Neplatná URL",
        },
        scan: {
          label: "Skenovat QR kód",
        },
      },
    },
    discover: {
      title: "Objevte minty",
      overline: "Objevovat",
      caption: "Objevte minty, které doporučili jiní uživatelé na Nostr.",
      actions: {
        discover: {
          label: "Objevovat minty",
          in_progress: "Načítá se…",
          error_no_mints: "Nenalezeny žádné minty",
          success: "Nalezeno { length } mintů",
        },
      },
      recommendations: {
        overline: "Nalezeno { length } mintů",
        caption:
          "Tyto minty doporučili ostatní uživatelé Nostr. Buďte opatrní a prověřte mint před použitím.",
        actions: {
          browse: {
            label: "Klikněte pro prohlížení mintů",
          },
        },
      },
    },
    swap: {
      title: "Swap",
      overline: "Multimint Swapy",
      actions: {
        receove_to_trusted_mint: {
          label: "Přijmout do důvěryhodného mintu",
        },
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
      },
      caption:
        "Prohození prostředků mezi minty přes Lightning. Poznámka: Nechte rezervu na poplatky Lightning. Pokud příchozí platba neproběhne, zkontrolujte fakturu manuálně.",
      inputs: {
        from: {
          label: "Odesílatel",
        },
        to: {
          label: "Příjemce",
        },
        amount: {
          label: "Částka ({ ticker })",
        },
      },
    },
    error_badge: "Chyba",
    reviews_text: "recenze",
    no_reviews_yet: "Žádné recenze",
    discover_mints_button: "Objevovat minty",
  },

  QrcodeReader: {
    progress: {
      text: "{ percentage }{ addon }",
      percentage: "{ percentage }%",
      keep_scanning_text: " - Pokračovat ve skenování",
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
    title: "Přijmout Lightning",
    create_invoice_title: "Vytvořit fakturu",
    inputs: {
      amount: {
        label: "Částka ({ ticker }) *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "Vytvořit fakturu",
        label_blocked: "Vytváří se faktura…",
        in_progress: "Vytváří se",
      },
    },
    invoice: {
      caption: "Faktura Lightning",
      status_paid_text: "Zaplaceno!",
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
    title: "Odeslat",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Žádné minty k dispozici",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "Žádné minty k dispozici",
      },
    },
  },

  SendTokenDialog: {
    title: "Odeslat Ecash",
    title_ecash_text: "Ecash",
    badge_offline_text: "Offline",
    inputs: {
      amount: {
        label: "Částka ({ ticker }) *",
        invalid_too_much_error_text: "Příliš mnoho",
      },
      p2pk_pubkey: {
        label: "Veřejný klíč příjemce",
        label_invalid: "Neplatný veřejný klíč příjemce",
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
        tooltip_text: "Kopírovat emoji",
      },
      copy_tokens: {
        label: "@:global.actions.copy.label",
      },
      copy_link: {
        tooltip_text: "Kopírovat odkaz",
      },
      share: {
        tooltip_text: "Sdílet ecash",
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
      },
      delete: {
        tooltip_text: "Smazat z historie",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "Zapsat na NFC kartu",
          ndef_unsupported_text: "NDEF není podporováno",
        },
      },
    },
    errors: {
      amount_required: "Nejprve zadejte částku.",
      serialization_failed: "Nepodařilo se připravit ecash token.",
      mint_not_allowed_by_request:
        "Vybraný mint není tímto platebním požadavkem přijímán.",
    },
  },

  SendPaymentRequest: {
    actions: {
      pay: {
        label: "Zaplatit",
      },
      pay_via: {
        label: "Zaplatit přes {transport}",
      },
    },
    info: {
      pay_to: "Zaplatit {target}",
      invalid_url: "Neplatná URL",
    },
  },

  PaymentRequestInfo: {
    title_with_transport: "Platební požadavek přes {transport}",
    title: "Platební požadavek",
    subtitle: "Zaplatit {target}",
    subtitle_fallback: "Platební požadavek",
    invalid_url: "Neplatná URL",
  },

  ReceiveDialog: {
    title: "Přijmout",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Žádné minty k dispozici",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "Pro příjem přes Lightning se musíte připojit k mintu",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "Přijmout Ecash",
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      scan: {
        label: "@:global.actions.scan.label",
      },
      request: {
        label: "Požádat",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      nfc: {
        label: "NFC",
        scanning_text: "Skenuje se…",
      },
    },
  },

  ReceiveTokenDialog: {
    title: "Přijmout Ecash",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "Vložit Cashu token",
      },
    },
    errors: {
      invalid_token: {
        label: "Neplatný token",
      },
      p2pk_lock_mismatch: {
        label:
          "Nelze přijmout. P2PK zámek tohoto tokenu neodpovídá vašemu veřejnému klíči.",
      },
    },
    unknown_mint_info_text:
      "Neznámý mint. Bude přidán po přijetí tohoto tokenu.",
    swap_section: {
      title: "Swap",
      source_label: "Odesílatel",
      destination_label: "Příjemce",
      fee_info: "Tento swap podléhá poplatkům Lightning sítě.",
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
        label_adding_mint: "Přidává se mint…",
      },
      swap: {
        label: "Přijmout do důvěryhodného mintu",
        tooltip_text: "Swap do důvěryhodného mintu",
        caption: "Swap { value }",
        processing: "Probíhá swap…",
        failed: "Swap selhal",
      },
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "Zrušit swap",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      receive_to_selected_mint: {
        label: "Přijmout do vybraného mintu",
      },
      later: {
        label: "Přijmout později",
        tooltip_text: "Přidat do historie pro pozdější příjem",
        already_in_history_success_text: "Ecash již v historii",
        added_to_history_success_text: "Ecash přidán do historie",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Přečíst z NFC karty",
          ndef_unsupported_text: "NDEF není podporováno",
        },
      },
    },
  },

  P2PKDialog: {
    p2pk: {
      caption: "P2PK klíč",
      description: "Přijímat ecash uzamčený tímto klíčem",
      used_warning_text:
        "Varování: Tento klíč byl již použit. Pro lepší soukromí použijte nový klíč.",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_key: {
        label: "Vygenerovat nový klíč",
      },
    },
  },

  PaymentRequestDialog: {
    payment_request: {
      caption: "Platební požadavek",
      description: "Přijímat platby přes Nostr",
    },
    received_total: "Celkem přijato",
    no_payments_yet: "Žádné platby dosud",
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "Nový požadavek",
      },
      add_amount: {
        label: "Přidat částku",
      },
      use_active_mint: {
        label: "Libovolný mint",
      },
    },
    inputs: {
      amount: {
        placeholder: "Zadejte částku",
      },
    },
  },

  NumericKeyboard: {
    actions: {
      close: {
        label: "@:global.actions.close.label",
        closed_info_text:
          "Klávesnice zakázána. Opět ji můžete povolit v nastavení.",
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
        "Ovládejte svou peněženku vzdáleně pomocí NWC. Stiskněte QR kód pro propojení peněženky s kompatibilní aplikací.",
      warning_text:
        "Varování: kdokoli s přístupem k tomuto spojovacímu řetězci může provádět platby z vaší peněženky. Nesdílejte!",
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
    title: "Zpráva mintu",
  },

  MintDetailsDialog: {
    contact: {
      title: "Kontakt",
    },
    details: {
      title: "Detaily mintu",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Nuts",
        actions: {
          show: {
            label: "Zobrazit vše",
          },
          hide: {
            label: "Skrýt",
          },
        },
      },
      currency: {
        label: "Měna",
      },
      currencies: {
        label: "@:MintDetailsDialog.details.currency.label",
      },
      version: {
        label: "Verze",
      },
    },
    actions: {
      title: "Akce",
      copy_mint_url: {
        label: "Kopírovat URL mintu",
      },
      delete: {
        label: "Smazat mint",
      },
      edit: {
        label: "Upravit mint",
      },
    },
  },
  ChooseMint: {
    title: "Vyberte mint",
    placeholder: "Vyberte mint",
    available_text: "dostupný",
    sheet_title: "Vybrat mint",
    badge_mint_error_text: "Chyba",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
  },

  HistoryTable: {
    empty_text: "Žádná historie zatím",
    row: {
      type_label: "Ecash",
      date_label: "před { value }",
    },
    actions: {
      check_status: {
        tooltip_text: "Zkontrolovat stav",
      },
      receive: {
        tooltip_text: "Přijmout",
      },
      filter_pending: {
        label: "Filtrovat čekající",
      },
      show_all: {
        label: "Zobrazit vše",
      },
    },
    old_token_not_found_error_text: "Starý token nenalezen",
  },

  InvoiceTable: {
    empty_text: "Žádné faktury zatím",
    row: {
      type_label: "Lightning",
      type_tooltip_text: "Klikněte pro kopírování",
      date_label: "před { value }",
    },
    actions: {
      check_status: {
        tooltip_text: "Zkontrolovat stav",
      },
      filter_pending: {
        label: "Filtrovat čekající",
      },
      show_all: {
        label: "Zobrazit vše",
      },
    },
  },

  RemoveMintDialog: {
    title: "Opravdu chcete smazat tento mint?",
    nickname: {
      label: "Přezdívka",
    },
    balances: {
      label: "Zůstatky",
    },
    warning_text:
      "Poznámka: Protože je tato peněženka paranoidní, váš ecash z tohoto mintu nebude skutečně smazán, ale zůstane uložen na zařízení. Uvidíte ho znovu, pokud tento mint později znovu přidáte.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "Odstranit mint",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },

  ParseInputComponent: {
    placeholder: {
      default: "Cashu token nebo Lightning adresa",
      receive: "Cashu token",
      pay: "Lightning adresa nebo faktura",
    },
    qr_scanner: {
      title: "Skenovat QR kód",
      description: "Klikněte pro skenování adresy",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },

  PayInvoiceDialog: {
    input_data: {
      title: "Zaplatit Lightning",
      inputs: {
        invoice_data: {
          label: "Lightning faktura nebo adresa",
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
      amount_exact_label: "{ payee } požaduje { value } { ticker }",
      amount_range_label:
        "{ payee } požaduje{br}mezi { min } a { max } { ticker }",
      sending_to_lightning_address: "Odesílám na { address }",
      inputs: {
        amount: {
          label: "Částka ({ ticker }) *",
        },
        comment: {
          label: "Komentář (volitelné)",
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
      title: "Zaplatit { value }",
      paying: "Probíhá platba",
      paid: "Zaplaceno",
      fee: "Poplatek",
      memo: {
        label: "Poznámka",
      },
      processing_info_text: "Zpracovává se…",
      balance_too_low_warning_text: "Zůstatek příliš nízký",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        pay: {
          label: "Zaplatit",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
          error: "Chyba",
        },
      },
    },
  },

  EditMintDialog: {
    title: "Upravit mint",
    inputs: {
      nickname: {
        label: "Přezdívka",
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
    title: "Důvěřujete tomuto mintu?",
    description:
      "Před použitím tohoto mintu se ujistěte, že mu důvěřujete. Mints mohou kdykoli přestat fungovat nebo se stát škodlivými.",
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
        in_progress: "Přidává se mint",
      },
    },
  },
  restore: {
    mnemonic_error_text: "Zadejte mnemotechnickou frázi",
    restore_mint_error_text: "Chyba při obnově mintu: { error }",
    prepare_info_text: "Připravuji proces obnovy…",
    restored_proofs_for_keyset_info_text:
      "Obnoveno { restoreCounter } důkazů pro keyset { keysetId }",
    checking_proofs_for_keyset_info_text:
      "Kontroluji důkazy { startIndex } až { endIndex } pro keyset { keysetId }",
    no_proofs_info_text: "Nebyly nalezeny žádné důkazy k obnově",
    restored_amount_success_text: "Obnoveno { amount }",
  },
  swap: {
    in_progress_warning_text: "Probíhá swap",
    invalid_swap_data_error_text: "Neplatná data pro swap",
    swap_error_text: "Chyba při swapu",
  },
  TokenInformation: {
    fee: "Poplatek",
    unit: "Jednotka",
    fiat: "Fiat",
    p2pk: "P2PK",
    locked: "Uzamčeno",
    locked_to_you: "Uzamčeno pro vás",
    mint: "Mint",
    memo: "Poznámka",
    payment_request: "Platební požadavek",
    nostr: "Nostr",
    token_copied: "Token zkopírován do schránky",
  },
};
