export default {
  global: {
    notifications: "Oznámení",
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
      show_seed: {
        label: "Zobrazit seed frázi",
      },
      hide_seed: {
        label: "Skrýt seed frázi",
      },
      scan: {
        label: "Skenovat",
      },
      more_options: {
        label: "Další možnosti",
      },
      clear: {
        label: "Vymazat",
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
  ActivityRow: {
    received: "Přijato",
    sent: "Odesláno",
    receiving: "Přijímá se",
    sending: "Odesílá se",
  },
  common: {
    copied: "Zkopírováno",
    on_chain: "On-chain",
    pending: "Čekající",
    delete: "Smazat",
    copy_npub: "Kopírovat npub",
    back: "Zpět",
    refresh: "Obnovit",
    settings: "Nastavení",
    backspace: "Smazat znak",
    enter_amount_in: "Zadat částku v {fiat}",
    something_went_wrong: "Něco se pokazilo",
  },
  MultinutPicker: {
    dialog_title: "Platba Multinut",
    pay_using_multiple: "Platit pomocí více mintů",
    experimental_title: "Experimentální funkce",
    experimental_text:
      "Tato funkce je vysoce experimentální a nemusí fungovat podle očekávání. Nepokoušejte se zaplatit fakturu, která už byla zaplacena. Mohli byste přijít o prostředky.",
    understand: "Rozumím",
    select_funds: "Vyberte prostředky z více mintů k provedení platby.",
    pay_invoice: "Zaplatit fakturu",
    amount_mismatch: "Chyba výpočtu částky: {calculated} vs {expected}",
    states: {
      requesting: "Žádám...",
      paying: "Platím...",
      success: "Hotovo",
      failed: "Selhalo",
    },
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
      trying_again: "Zkouší se znovu...",
      unsupported_legacy_qr: "Nepodporovaný starší QR kód",
      legacy_qr_not_supported:
        "Tento starší QR kód nepochází od podporovaného obchodníka",
      no_bolt12_mint: "Žádný z vašich mintů nepodporuje BOLT12 nabídky",
      no_bolt11_mint: "Žádný z vašich mintů nepodporuje BOLT11 faktury",
      address_not_paid: "Adresa nebyla zaplacena",
      payment_pending: "Platba nevyřízena",
      invoice_already_paid: "Faktura už byla zaplacena",
      payment_sent: "Platba odeslána",
      payment_failed: "Platba selhala",
      could_not_pay_request: "Požadavek se nepodařilo zaplatit",
      request_unit_unsupported:
        "Mint nepodporuje jednotku v tomto platebním požadavku: {unit}",
      no_onchain_mint: "Žádný z vašich mintů nepodporuje on-chain platby",
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
        mint_validation_error: "Chyba ověření mintu",
        removed: "Mint odebrán",
        error: "Chyba mintu",
      },
    },
  },
  MainHeader: {
    menu: {
      terms: {
        terms: {
          title: "Podmínky",
          caption: "S čím souhlasíte používáním Cashu.me",
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
  Settings: {
    menu: {
      title: "Nastavení",
      backup: {
        title: "Záloha a obnova",
        caption: "Seed fráze a obnovení ecash",
      },
      lightning_address: {
        title: "Lightning adresa",
        caption: "Přijímejte platby na jmeno{'@'}domena",
      },
      nostr: {
        title: "Nostr",
        caption: "Klíče, relaye a Web of Trust",
      },
      payment_requests: {
        title: "Žádosti o platbu",
        caption: "Přijímejte platby v ecash přes Nostr",
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
        title: "Uzamčený ecash",
        caption: "Přijímejte ecash, který odemkne jen váš klíč",
      },
      privacy: {
        title: "Soukromí",
        caption: "Síťové kontroly a cena bitcoinu",
      },
      experimental: {
        title: "Experimentální",
        caption: "Vyzkoušejte nové funkce jako první",
      },
      appearance: {
        title: "Vzhled",
        caption: "Motiv, klávesnice a symbol bitcoinu",
      },
      language: {
        title: "Jazyk",
        caption: "Vyberte si jazyk",
      },
      advanced: {
        title: "Pokročilé",
        caption: "Vývojářské nástroje a reset peněženky",
      },
      about: {
        title: "O aplikaci",
        caption: "Podmínky a odkazy",
      },
    },
    language: {
      title: "Jazyk",
    },
    sections: {
      nostr: {
        relays: {
          already_added: "Relay už je přidán",
          add: {
            title: "Přidat relay",
            description:
              "Vaše peněženka používá tyto relaye pro funkce Nostru, jako jsou žádosti o platbu, Nostr Wallet Connect a zálohy.",
          },
          list: {
            title: "Relaye",
            copy_tooltip: "Kopírovat relay",
            remove_tooltip: "Odebrat relay",
          },
        },
      },
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
          "Obnovte ecash z jiné seed fráze. Vaše současná seed fráze zůstane beze změny.",
      },
    },
    lightning_address: {
      server_url: {
        label: "Název hostitele npub.cash",
        hint: "Zadejte název hostitele nebo HTTPS URL",
        invalid: "Zadejte platnou HTTPS URL serveru",
      },
      title: "Lightning adresa",
      enable: {
        toggle: "Používat Lightning adresu",
        description: "Přijímejte platby na adresu od npub.cash",
      },
      address: {
        label: "Vaše adresa",
        copy_tooltip: "Kopírovat Lightning adresu",
      },
      show_on_receive: {
        toggle: "Zobrazit při přijímání",
        description: "Zobrazit adresu a QR kód.",
      },
      automatic_claim: {
        toggle: "Přijímat automaticky",
        description: "Automaticky přijímat příchozí platby.",
      },
      mint: {
        label: "mint pro npub.cash",
        choose_title: "Vyberte mint pro npub.cash",
        choose_placeholder: "Vyberte mint…",
      },
    },

    nostr_keys: {
      title: "Vaše Nostr klíče",
      description: "Vaše Nostr klíče určují vaši Lightning adresu.",
      wallet_seed: {
        title: "Seed fráze peněženky",
        description: "Vygenerovat pár Nostr klíčů ze seedu peněženky",
        copy_nsec: "Kopírovat soukromý klíč",
      },
      nsec_bunker: {
        title: "Vzdálený podepisovatel",
        description: "Podepisovat přes NIP-46 bunker",
        delete_tooltip: "Odstranit připojení",
      },
      use_nsec: {
        title: "Použít vlastní soukromý klíč",
        description: "Tato metoda je nebezpečná a nedoporučuje se",
        delete_tooltip: "Smazat soukromý klíč",
      },
      signing_extension: {
        title: "Podepisovací rozšíření",
        description: "Použít podepisovací rozšíření NIP-07",
        not_found: "Nenalezeno žádné podepisovací rozšíření NIP-07",
      },
    },

    payment_requests: {
      description:
        "Přijímejte platby přes Nostr. Když je zapnuto, peněženka naslouchá na vašich Nostr relayích.",
      enable_toggle: "Zapnout žádosti o platbu",
      claim_automatically: {
        toggle: "Přijímat automaticky",
        description:
          "Připíše příchozí platby k zůstatku bez ptaní. Když je vypnuto, každou přijímáte sami.",
      },
    },

    nostr_wallet_connect: {
      description:
        "Umožní jiným aplikacím platit z této peněženky přes Nostr Wallet Connect.",
      enable_toggle: "Zapnout Nostr Wallet Connect",
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
        title: "Formát NFC karty",
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
          description: "Ukládat token jako binární data",
        },
        quick_access: {
          toggle: "Rychlý přístup k NFC",
          description:
            "Přidá na obrazovku Přijmout ecash tlačítko NFC pro skenování karet.",
        },
      },
    },

    p2pk_features: {
      description:
        "Experimentální. Používejte malé částky: pokud ztratíte soukromý klíč, nikdo už ecash jím uzamčený neodemkne.",
      generate_button: "Vygenerovat klíč",
      import_button: "Importovat soukromý klíč",
      quick_access: {
        toggle: "Zobrazit zamykací klíč při přijímání",
        description:
          "Zobrazí váš zamykací klíč na obrazovce Přijmout ecash, aby vám odesílatelé mohli ecash uzamknout.",
      },
      keys_expansion: {
        label: "Klikněte pro zobrazení {count} klíčů",
        used_badge: "použito",
      },
    },

    privacy: {
      network_title: "Síťové kontroly",
      description: "Tato nastavení ovlivňují vaše soukromí.",
      check_incoming: {
        toggle: "Kontrolovat příchozí faktury",
        description:
          "Kontroluje vaši poslední fakturu na pozadí. Rychlejší aktualizace, ale snazší fingerprinting.",
      },
      check_startup: {
        toggle: "Kontrolovat čekající faktury při spuštění",
        description: "Při otevření peněženky zkontroluje čekající faktury.",
      },
      check_all: {
        toggle: "Kontrolovat všechny faktury",
        description:
          "Kontroluje nezaplacené faktury na pozadí až dva týdny. Víc aktivity online usnadňuje fingerprinting.",
      },
      check_sent: {
        toggle: "Kontrolovat odeslaný ecash",
        description:
          "Na pozadí kontroluje, zda byl odeslaný ecash přijat. Víc aktivity online usnadňuje fingerprinting.",
      },
      websockets: {
        toggle: "Používat WebSockety",
        description:
          "Udržuje živé spojení s minty pro okamžité informace o platbách. Rychlejší, ale snazší fingerprinting.",
      },
      bitcoin_price: {
        title: "Cena bitcoinu",
        toggle: "Získávat kurz z Coinbase",
        description:
          "Načte cenu bitcoinu z coinbase.com a zobrazí váš zůstatek ve fiat měně.",
        currency: {
          title: "Fiat měna",
          description: "Vyberte fiat měnu pro zobrazení ceny Bitcoinu.",
        },
      },
    },

    experimental: {
      receive_swaps: {
        toggle: "Přijímat swapy",
        badge: "Beta",
        description: "Nabídne swap přijatého ecash do vašeho aktivního mintu.",
      },
      auto_paste: {
        toggle: "Automaticky vkládat ecash",
        description:
          "Při otevření Přijmout ecash vloží ecash ze schránky. Vypněte, pokud na iOS způsobuje chyby zobrazení.",
      },
      auditor: {
        toggle: "Povolit auditora",
        badge: "Beta",
        description:
          "V detailech mintu zobrazí údaje o spolehlivosti od nezávislého auditora mintů.",
        url_label: "URL auditora",
        api_url_label: "API URL auditora",
      },
      multinut: {
        description: "Platí faktury z více mintů najednou.",
      },
      nostr_mint_backup: {
        toggle: "Zálohovat seznam mintů na Nostr",
        description:
          "Zálohuje seznam vašich mintů na vaše Nostr relaye, abyste ho mohli obnovit na jiném zařízení.",
        notifications: {
          enabled: "Záloha mintů na Nostr povolena",
          disabled: "Záloha mintů na Nostr zakázána",
          failed: "Nepodařilo se povolit zálohu mintů na Nostr",
        },
      },
    },
    appearance: {
      mode: {
        title: "Režim",
        dark: "Tmavý",
        light: "Světlý",
      },
      keyboard: {
        title: "Klávesnice na obrazovce",
        toggle: "Použít číselnou klávesnici",
        toggle_description: "Pro zadávání částek použije číselnou klávesnici.",
      },
      theme: {
        title: "Motiv",
        description: "Změňte vzhled své peněženky.",
        tooltips: {
          mono: "Mono",
          cyber: "Cyber",
          freedom: "Svoboda",
          nostr: "Nostr",
          bitcoin: "Bitcoin",
          mint: "Máta",
          nut: "Oříšek",
          blu: "Modrá",
          flamingo: "Plameňák",
        },
      },
      bip177: {
        title: "Symbol Bitcoinu",
        description: "Zobrazovat částky jako ₿2 789 místo 2 789 sats.",
        toggle: "Používat symbol ₿",
      },
    },
    web_of_trust: {
      title: "Web of trust",
      known_pubkeys: "Známé veřejné klíče: {wotCount}",
      continue_crawl: "Pokračovat v procházení",
      crawl_odell: "Importovat Odellovu síť důvěry",
      crawl_wot: "Procházet web of trust",
      pause: "Pozastavit",
      reset: "Resetovat",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    multinut: {
      use_multinut: "Platby z více mintů",
    },
    advanced: {
      backup_files_title: "Záložní soubory",
      danger_zone_title: "Nebezpečná zóna",
      notifications: {
        reserved_unset: "Rezervace všech důkazů zrušena",
        removed_spent: "Odstraněno utracených důkazů: {count}",
        no_spent: "Nebyly nalezeny žádné utracené důkazy",
        invalid_backup: "Neplatný formát souboru zálohy",
        read_error: "Chyba při čtení souboru",
      },
      developer: {
        title: "Vývojářská nastavení",
        description: "Nástroje pro řešení problémů a ladění.",
        new_seed: {
          button: "Vygenerovat novou seed frázi",
          description:
            "Vytvoří novou seed frázi. Poté pošlete zůstatek sami sobě, aby ho nový seed dokázal obnovit.",
          confirm_question: "Opravdu chcete vygenerovat novou seed frázi?",
          cancel: "Zrušit",
          confirm: "Potvrdit",
        },
        remove_spent: {
          button: "Odstranit utracené proofy",
          description:
            "Odstraní ecash, který vaše aktivní minty hlásí jako utracený. Použijte jen tehdy, když peněženka uvízne.",
        },
        design_system: {
          title: "Designový systém",
          description: "Každá komponenta aplikace živě, se zdrojem a použitím.",
        },
        debug_console: {
          button: "Ladicí konzole",
          description:
            "Otevře JavaScriptovou konzoli. Nikdy nevkládejte kód, kterému nerozumíte; podvodníci ji zneužívají ke krádeži peněz.",
        },
        export_proofs: {
          button: "Exportovat aktivní proofy",
          description:
            "Zkopíruje zůstatek aktivního mintu ve vybrané jednotce jako jeden ecash token.",
        },
        keyset_counters: {
          title: "Navýšit čítače keysetů",
          increase: "Zvýšit čítač pro {id}",
          fixes: "Opravuje „outputs have already been signed“",
          keysets: "{n} keyset | Počet keysetů: {n}",
          sheet_hint: "Klepnutím na + zvýšíte čítač keysetu.",
          column: "Čítač",
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
            "Stáhne záložní soubor, který můžete importovat na úvodní obrazovce. Dalším používáním peněženky zastarává.",
        },
        import_wallet: {
          button: "Importovat zálohu peněženky",
          description:
            "Nahradí data této peněženky exportovaným záložním souborem.",
          confirm_question: "Opravdu chcete obnovit data peněženky?",
          cancel: "Zrušit",
          confirm: "IMPORTOVAT ZÁLOHU PENĚŽENKY",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Přidat mint",
    subtitle:
      "Minty vydávají ecash, který tato peněženka drží. Začněte přidáním mintu nebo přijetím ecash z některého z nich.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Přijmout ecash",
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
      expand: "Zobrazit historii a minty",
      collapse: "Skrýt historii a minty",
    },
    tabs: {
      history: {
        label: "Historie",
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
    title: "Cashu.me je otevřené na jiné kartě",
    text: "Zavřete druhou kartu a pak klepněte na Zkusit znovu.",
    actions: {
      retry: {
        label: "Zkusit znovu",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Tato stránka neexistuje",
    actions: {
      home: {
        label: "Zpět domů",
      },
    },
  },
  BalanceView: {
    total_label: "Celkový zůstatek",
    show_balance: "Zobrazit zůstatek v {unit}",
    mintError: {
      label: "Chyba mintu",
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
    terms_agreement: "Pokračováním přijímáte {terms}",
    title: "Vítejte v Cashu.me",
    text: "Cashu.me je bezplatná a open-source bitcoinová peněženka, která používá ecash pro bezpečné a soukromé uchování vašich prostředků.",
  },
  WelcomeSlide2: {
    title: "Nainstalujte Cashu.me",
    alt: {
      pwa_example: "Ukázka instalace PWA",
    },
    installing: "Instaluje se…",
    instruction: {
      intro: {
        text: "Pro nejlepší zážitek používejte tuto peněženku ve webovém prohlížeči vašeho zařízení a nainstalujte ji jako Progressive Web App.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          text: "Klepněte na menu (vpravo nahoře)",
        },
        step2: {
          text: "Stiskněte { buttonText }",
          buttonText: "@:PwaPrompt.android.add",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          text: "Klepněte na sdílení (dole)",
        },
        step2: {
          text: "Stiskněte { buttonText }",
          buttonText: "@:PwaPrompt.ios.add",
        },
      },
      outro: {
        text: "Po instalaci zavřete tuto kartu prohlížeče a otevřete Cashu.me z domovské obrazovky.",
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
  PwaPrompt: {
    title: "Nainstalovat Cashu",
    text: "Otevře se z domovské obrazovky, bez lišty prohlížeče.",
    ios: {
      share: "Klepněte na Sdílet",
      add: "Přidat na domovskou obrazovku",
    },
    android: {
      menu: "Otevřete nabídku prohlížeče",
      add: "Přidat na domovskou obrazovku",
    },
    install: "Nainstalovat",
    notNow: "Teď ne",
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
    english_only: "Právní text je k dispozici pouze v angličtině.",
    title: "Podmínky služby",
    actions: {
      more: {
        label: "Před použitím Cashu.me si je přečtěte",
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
    progress: { words_entered: "Zadáno slov: {count}/12" },
    disclaimer:
      "Vaše seed fráze se používá pouze lokálně pro odvození klíčů peněženky.",
  },
  WelcomeRestoreEcash: {
    title: "Obnovte svůj ecash",
    text: "Skenujte nevyužité proofy na nakonfigurovaných mintech a přidejte je do peněženky.",
  },
  MintRatings: {
    sort_and_filter: "Řazení a filtr",
    reviews_title: "Recenze",
    reviews_count: "{n} recenze | Počet recenzí: {n}",
    web_of_trust_caption: "Počítat jen recenze od lidí z vaší sítě důvěry",
    web_of_trust_hop: "Ve vašem Web of Trust (skok {hop})",
    no_mint_url: "Nebyla zadána URL mintu",
    reviews: "recenze",
    no_reviews: "Zatím žádné recenze",
    your_review: "Vaše recenze",
    no_rating: "Bez hodnocení",
    stars_label: "{rating} z 5 hvězdiček",
    out_of: "z {max}",
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
      "Napište první recenzi tohoto mintu. Vaše zkušenost pomůže ostatním s výběrem.",
    range: "{from}–{to} z {total}",
  },

  CreateMintReview: {
    connect_nostr: "Pro zveřejnění recenze připojte v Nastavení účet Nostr.",
    published: "Recenze zveřejněna",
    publish_failed: "Recenzi se nepodařilo zveřejnit",
    title: "Recenze mintu",
    publishing_as: "Publikujete jako",
    inputs: {
      rating: {
        label: "Hodnocení",
        hint: "Vyberte hodnocení, abyste mohli recenzi zveřejnit.",
      },
      review: { label: "Recenze (volitelně)" },
    },
    actions: {
      publish: { label: "Zveřejnit recenzi", in_progress: "Zveřejňování…" },
    },
  },

  RestoreView: {
    seed_phrase: {
      label: "Obnovit ze seed fráze",
      caption:
        "Před obnovou přidejte všechny minty, které jste s tímto seedem používali.",
      inputs: {
        seed_phrase: {
          label: "Seed fráze",
        },
      },
    },
    information: {
      caption:
        "Tento průvodce obnoví pouze ecash z jiné seed fráze, nebudete moci tuto seed frázi používat ani měnit seed frázi aktuální peněženky. Obnovený ecash tak nebude chráněn vaší aktuální seed frází, dokud ho jednou nepošlete sami sobě.",
    },
    restore_mints: {
      label: "Obnovit minty",
      caption:
        "Vyberte minty k obnově. Chybějící minty nejprve přidejte na kartě Minty.",
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
        label: "Zrušit výběr",
      },
      restore: {
        label: "Obnovit",
        error: "Chyba při obnově mintu: { error }",
      },
      restore_selected_mints: {
        label: "Obnovit vybrané minty ({count})",
        success: "Úspěšně obnoven(a) {count} mint(y)",
        error: "Chyba při obnově vybraných mintů: { error }",
      },
    },
    nostr_mints: {
      label: "Obnovit minty z Nostru",
      caption:
        "Hledejte zálohy mintů uložené na Nostr relays pomocí vaší seed fráze. Pomůže to objevit minty, které jste dříve používali.",
      search_button: "Hledat zálohy mintů",
      select_all: "Vybrat vše",
      deselect_all: "Zrušit výběr",
      backed_up: "Zálohováno",
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
    see_reviews: "Zobrazit recenze",
    add: {
      title: "Přidat mint",
      description:
        "Zadejte URL Cashu mintu, ke kterému se chcete připojit. Tato peněženka není spojena s žádným mintem.",
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "Neplatná URL",
        },
        scan: {
          label: "Naskenovat QR kód",
        },
      },
    },
    discover: {
      title: "Objevte minty",
      caption: "Minty, které ostatní doporučují na Nostru.",
      actions: {
        discover: {
          label: "Objevovat minty",
          in_progress: "Načítá se…",
        },
      },
      add: "Přidat",
      empty: {
        title: "Najít mint",
        text: "Cashu.me se zeptá Nostr relayů na minty, které doporučují ostatní, včetně hodnocení a recenzí.",
      },
      recommendations: {
        overline: "Nalezeno { length } mintů",
        caption: "Než mint použijete, prověřte si ho.",
      },
    },
    swap: {
      title: "Swap",
      actions: {
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
      },
      caption:
        "Přesouvejte prostředky mezi svými minty přes Lightning. Mohou se účtovat poplatky.",
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
    switching_mint: "Přepínání na {mint}",
    reviews_text: "recenze | recenze",
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
    actions: {
      create: {
        label: "Vytvořit fakturu",
        label_blocked: "Vytváří se faktura",
      },
    },
    invoice: {
      caption: "Faktura Lightning",
      status_paid_text: "Zaplaceno",
      actions: {
        copy: {
          label: "Kopírovat fakturu",
        },
      },
    },
  },

  SendDialog: {
    captions: {
      ecash: "Sdílejte token nebo QR kód",
      lightning: "Zaplaťte fakturu nebo adresu",
      onchain: "Pošlete na bitcoinovou adresu",
    },
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
    badge_locked: "zamčeno",
    title: "Odeslat ecash",
    inputs: {
      p2pk_pubkey: {
        label: "Veřejný klíč příjemce",
        invalid: "Zadejte platný veřejný klíč (hex nebo npub)",
      },
    },
    actions: {
      copy_emoji: {
        tooltip_text: "Kopírovat emoji",
      },
      copy_tokens: {
        label: "Kopírovat ecash",
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
        in_progress: "Odesílání…",
      },
      delete: {
        tooltip_text: "Smazat z historie",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "Zapsat na NFC kartu",
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
      pay_failed: "Požadavek se nepodařilo zaplatit",
      no_ecash: "Pro tento platební požadavek není k dispozici žádný ecash",
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
    captions: {
      ecash: "Vložte, naskenujte nebo vyžádejte token",
      lightning: "Vytvořte fakturu a nechte si zaplatit",
      onchain: "Získejte bitcoinovou adresu",
    },
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
    title: "Přijmout ecash",
    actions: {
      paste: {
        label: "Vložit token",
      },
      scan: {
        label: "Naskenovat token",
      },
      request: {
        label: "Požádat o ecash",
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
    receiving_amount: "Přijímání {amount}",
    title: "Přijmout ecash",
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
      receive: {
        label: "@:global.actions.receive.label",
        label_known_mint: "@:ReceiveTokenDialog.actions.receive.label",
        label_adding_mint: "Přidává se mint…",
      },
      swap: {
        label: "Přijmout do důvěryhodného mintu",
        tooltip_text: "Swap do důvěryhodného mintu",
        processing: "Probíhá swap…",
        failed: "Swap selhal",
      },
      cancel_swap: {
        tooltip_text: "Zrušit swap",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
      },
      receive_to_selected_mint: {
        label: "Přijmout do vybraného mintu",
      },
      later: {
        label: "Přijmout později",
        tooltip_text: "Přidat do historie pro pozdější příjem",
        already_in_history_success_text: "Ecash už je v historii",
        added_to_history_success_text: "Ecash přidán do historie",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Přečíst z NFC karty",
        },
      },
    },
  },

  P2PKDialog: {
    p2pk: {
      caption: "Zamykací klíč",
      description: "Přijímat ecash uzamčený tímto klíčem",
      used_warning_text:
        "Varování: Tento klíč byl již použit. Pro lepší soukromí použijte nový klíč.",
    },
    actions: {
      copy: {
        label: "Kopírovat veřejný klíč",
      },
      new_key: {
        label: "Vygenerovat nový klíč",
      },
    },
  },

  PaymentRequestDialog: {
    any_amount: "Libovolná částka",
    payment_request: {
      caption: "Platební požadavek",
    },
    request_index: "Požadavek {index} z {total}",
    received_total: "Celkem přijato",
    no_payments_yet: "Žádné platby dosud",
    actions: {
      set_amount: {
        label: "Nastavit částku",
      },
      copy: {
        label: "@:global.actions.copy.label",
      },
      new_request: {
        label: "Nový požadavek",
      },
      share: {
        label: "Sdílet",
      },
      add_amount: {
        label: "Přidat částku",
      },
      use_active_mint: {
        label: "Libovolný mint",
      },
      remove_amount: {
        label: "Odebrat částku",
      },
      previous: {
        label: "Předchozí požadavek",
      },
      next: {
        label: "Další požadavek",
      },
    },
    inputs: {
      amount: {
        placeholder: "Zadejte částku",
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
    qr: {
      show: "Zobrazit QR kód",
      hide: "Skrýt QR kód",
    },
    contact: {
      title: "Kontakt",
      email: "E-mail",
    },
    details: {
      title: "Detaily mintu",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Podporované funkce",
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
        label: "Jednotka",
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
    nuts: {
      nut7: "Kontrola stavu tokenů",
      nut8: "Přeplacené Lightning poplatky",
      nut9: "Obnova podpisů",
      nut10: "Podmínky utracení",
      nut11: "Pay-to-Pubkey (P2PK)",
      nut12: "DLEQ důkazy",
      nut13: "Deterministická tajemství",
      nut14: "Hashované časové zámky (HTLC)",
      nut15: "Částečné vícecestné platby",
      nut16: "Animované QR kódy",
      nut17: "WebSocket odběry",
      nut18: "Platební požadavky",
      nut19: "Odpovědi v mezipaměti",
      nut20: "Podpis mint nabídky",
      nut21: "Otevřená autentizace",
      nut22: "Slepá autentizace",
    },
  },
  UnitToggle: {
    label: "Jednotka: {unit}, změnit",
    bitcoin: "Bitcoin",
  },
  ChooseMint: {
    open_selector: "Vyberte mint, aktuální mint: {mint}",
    open_selector_empty: "Vyberte mint",
    title: "Vyberte mint",
    placeholder: "Vyberte mint",
    available_text: "v tomto mintu",
    sheet_title: "Vyberte mint",
    badge_mint_error_text: "Chyba",
  },

  HistoryTable: {
    empty_text: "Žádná historie zatím",
    empty_hint: "Zde se zobrazí platby, které odešlete a přijmete.",
    filters: {
      title: "Filtrovat historii",
      direction: "Směr",
      type: "Typ",
      completed: "Dokončeno",
      received: "Přijato",
      sent: "Odesláno",
      reset: "Obnovit",
      clear_all: "Zrušit vše",
      remove: "Odebrat filtr: {label}",
      empty_title: "Žádné platby neodpovídají filtrům",
      clear: "Zrušit filtry",
      count: "{shown} z {total}",
      active: "Filtrovat historii, aktivní: {count}",
    },
    row: {
      type_label: "Ecash",
    },
    actions: {
      check_status: {
        tooltip_text: "Zkontrolovat stav",
      },
      receive: {
        tooltip_text: "Přijmout",
      },
    },
    old_token_not_found_error_text: "Starý token nenalezen",
    labels: {
      onchain_subpayment: "On-chain dílčí platba",
      bolt12_subpayment: "BOLT12 dílčí platba",
    },
  },

  InvoiceTable: {
    row: {
      type_label: "Lightning",
    },
  },

  RemoveMintDialog: {
    title: "Odebrat tento mint?",
    nickname: {
      label: "Přezdívka",
    },
    balances: {
      label: "Zůstatek v tomto mintu",
    },
    warning_text:
      "Váš ecash z tohoto mintu zůstane v tomto zařízení. Vrátí se, když mint znovu přidáte.",
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
      title: "Naskenovat QR kód",
      description: "Namiřte fotoaparát na QR kód",
      caption_address: "Klikněte pro skenování adresy",
      caption_token: "Klikněte pro skenování tokenu",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },

  PayInvoiceDialog: {
    onchain: {
      title: "Platit on-chain",
      address_placeholder: "Bitcoinová adresa",
      choose_speed: "Zvolte rychlost potvrzení",
      blocks: "{n} blok | Počet bloků: {n}",
      estimated_confirmation: "Odhadované potvrzení",
      fee_reserve: "rezerva na poplatek",
    },
    multinut: {
      label: "Platit z více mintů",
    },
    quote: {
      label: "Nabídka",
    },
    input_data: {
      title: "Zaplatit přes Lightning",
      title_bolt12: "Zaplatit Lightning nabídku",
    },
    lnurlpay: {
      amount_exact_label: "{ payee } požaduje { value } { ticker }",
      amount_range_label:
        "{ payee } požaduje{br}mezi { min } a { max } { ticker }",
      sending_to_lightning_address: "Odesílám na { address }",
      inputs: {
        comment: {
          label: "Komentář (volitelné)",
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
          waiting_for_wallet: "Čekání na peněženku…",
        },
      },
    },
  },

  EditMintDialog: {
    title: "Upravit mint",
    inputs: {
      nickname: {
        label: "Přezdívka (nepovinné)",
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
    title: "Důvěřujete tomuto mintu?",
    description:
      "Připojte se k tomuto mintu, jen pokud mu důvěřujete. Pokud ukončí provoz, ecash, který u něj máte, je ztracen.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
        in_progress: "Přidává se mint",
      },
    },
    audit_info: {
      label: "Informace o auditu",
      actions: {
        show: {
          label: "Zobrazit",
        },
        hide: {
          label: "Skrýt",
        },
      },
    },
    unreachable_error_text:
      "Tento mint není dostupný. Zkontrolujte URL a připojení a zkuste to znovu.",
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
    token: "Token",
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
  QuoteInformation: {
    address: "Adresa",
    invoice: "Faktura",
    request: "Požadavek",
    amount: "Částka",
    fee_reserve: "Rezerva na poplatek",
    fee_paid: "Zaplacený poplatek",
    unit: "Jednotka",
    status: "Stav",
    network: "Síť",
    transaction_id: "ID transakce",
    explorer: "Explorer",
    confirmations: "Potvrzení",
    paid_at: "Zaplaceno",
    preimage: "Preimage",
    preimage_copied: "Preimage zkopírován",
    mint: "Mint",
    method: "Metoda",
    lightning_offer: "Lightning nabídka",
    states: {
      waiting: "Čeká na platbu",
      confirming: "Potvrzuje se ({count}/{threshold})",
      issuing: "Vydává se ecash",
      paid: "Zaplaceno",
      unpaid: "Nezaplaceno",
      pending: "Čekající",
      issued: "Vydáno",
      expired: "Vypršelo",
      failed: "Selhalo",
    },
  },
  MintAuditInfo: {
    title: "Informace o auditu",
    loading: "Načítání informací o auditu...",
    not_audited: "Tento mint zatím nebyl auditován.",
    not_audited_text:
      "Chcete-li se dozvědět více o auditorovi nebo podpořit budoucí audit, navštivte {link} nebo klikněte {here} a darujte ecash na zahájení auditu tohoto mintu.",
    here: "zde",
    unavailable: "Informace o auditu nejsou momentálně k dispozici.",
    load_failed: "Nepodařilo se načíst data mintu",
    success_rate: "Úspěšnost",
    swaps_count: "{successful} z {total} swapů",
    average_time: "Průměrná doba",
    average_time_caption: "U úspěšných swapů",
    disclaimer:
      "Data auditu poskytují nezávislé třetí strany, aby pomohla v čase posoudit spolehlivost mintu. Tyto výsledky jsou však pouze informativní a nezaručují bezpečnost, solventnost ani důvěryhodnost žádného mintu. Vždy si udělejte vlastní průzkum a před použitím služeb se ujistěte, že provozovateli mintu důvěřujete.",
    donate_text:
      "Informace o auditu poskytuje {link}. Aktuální zůstatek, který auditor pro tento mint drží, je {balance}, dosud bylo celkem darováno {donations}. Chcete-li podpořit další audity, můžete {press_here} a darovat auditorovi ecash.",
    press_here: "kliknout zde",
    sats_amount: "{amount} sats",
    warnings_title: "Upozornění auditora",
    warnings: {
      last_swap_failed: "Poslední pokus o swap selhal.",
      recent_success:
        "Za posledních {days} dní uspělo {successful} z {total} swapů.",
      reliable:
        "{base} Nicméně {success} Tento mint se zdá spolehlivý, selhání mohou být způsobena přijímajícím mintem.",
      unreliable: "{base} Pouze {success} Tento mint může být nespolehlivý.",
      unknown: "Auditor zatím nedokázal určit kvalitu tohoto mintu.",
      not_enough_data:
        "Auditor nemá o tomto mintu dostatek nedávných dat. Za posledních {days} dní proběhl jen {count} úspěšný swap. | Auditor nemá o tomto mintu dostatek nedávných dat. Počet úspěšných swapů za posledních {days} dní: {count}.",
      low_success:
        "Za posledních {days} dní měl tento mint úspěšnost {rate} %, což je pod doporučenými {threshold} %.",
      inactive:
        "Tento mint neměl žádné swapy po dobu {days} dne. Může být nedostupný. | Tento mint neměl žádné swapy po dobu {days} dní. Může být nedostupný.",
      slow: "Tento mint je pomalý. Platby z něj trvaly v průměru {seconds} s.",
      no_successful:
        "U tohoto mintu nebyl zaznamenán žádný úspěšný swap. Může být nedostupný.",
    },
    chart: {
      now: "Nyní",
      today: "Dnes",
      yesterday: "Včera",
      invalid_date: "Neplatné datum",
      swaps: "Swapy:",
      success_rate: "Úspěšnost:",
      time_range: "Časové rozmezí:",
    },
  },
  DisplayTokenComponent: {
    title: {
      send: "Odeslat ecash",
      sent: "Odeslaný ecash",
      received: "Přijatý ecash",
    },
    qr_speed: "Rychlost QR: {value}",
    qr_density: "Hustota QR: {value}",
    speed: {
      fast: "Rychlá",
      medium: "Střední",
      slow: "Pomalá",
    },
    density: {
      high: "Vysoká",
      medium: "Střední",
      low: "Nízká",
    },
    delete_dialog: {
      title: "Smazat ecash",
      text: "Opravdu chcete tuto transakci smazat z historie?",
      warning:
        "Upozornění: Tuto akci nelze vrátit a token nebude možné obnovit.",
    },
    nfc: {
      read_failed: "Čtení NFC selhalo",
      write_failed: "Zápis NFC selhal",
      error: "Chyba NFC",
      writing: "Zapisování na kartu NFC...",
      success: "Token byl úspěšně zapsán na kartu!",
      capacity:
        "Karta možná nemá dostatečnou kapacitu (potřeba {bytes} bajtů).",
    },
  },
  CreateInvoiceDialog: {
    format_label: "Typ žádosti",
    formats: {
      bolt11: "Faktura",
      bolt12: "Nabídka",
    },
    onchain_title: "Přijmout on-chain",
    bolt12_title: "Přijmout Bolt12",
    mint_unreachable: "Mint je nedostupný",
    mint_unreachable_text: "Pro příjem plateb se znovu připojte k mintu.",
    reconnect_mint: "Znovu připojit mint",
    checking_address: "Kontrola adresy...",
    add_amount: "Přidat částku",
    new_offer: "Nová nabídka",
    create_offer: "Vytvořit nabídku",
    create_new_address: "Vytvořit novou adresu",
    create_address: "Vytvořit adresu",
    onchain_unsupported:
      "Tento mint nepodporuje on-chain vklady v této jednotce.",
    deposit_limits: {
      outside: "Vklady mimo rozsah {min}–{max} nebudou připsány.",
      below: "Vklady pod {min} nebudou připsány.",
      above: "Vklady nad {max} nebudou připsány.",
    },
    amount_errors: {
      positive_decimal:
        "Zadejte kladnou částku v {unit} s nejvýše dvěma desetinnými místy.",
      positive_whole: "Zadejte kladnou celou částku v {unit}.",
      min: "Zadejte alespoň {amount}.",
      max: "Zadejte nejvýše {amount}.",
    },
  },
  storage: {
    notifications: {
      unrecognized_backup: "Nerozpoznaný formát zálohy",
      backup_restored: "Záloha obnovena",
      backup_exported: "Záloha peněženky exportována",
      quota_exceeded: "Místní úložiště je plné. Uvolněte v něm místo.",
      cleaned_up: "Uvolněno {size} bajtů",
    },
  },
  receiveTokens: {
    notifications: {
      already_in_history: "Token už je v historii",
      nfc_read_failed: "Z NFC čipu nelze načíst data",
      scan_error: "Chyba skenování",
      nfc_error: "Chyba NFC",
    },
  },
  nostrMintBackup: {
    notifications: {
      no_relays: "Nejsou nastaveny žádné Nostr relaye",
      backup_failed: "Seznam mintů se nepodařilo zálohovat na Nostr",
      backed_up: "Seznam mintů zálohován na Nostr",
      found:
        "V Nostr zálohách nalezen {count} mint | Počet nalezených mintů v Nostr zálohách: {count}",
      none_found:
        "Pro tuto seed frázi nebyly na Nostru nalezeny žádné zálohy mintů",
      search_failed: "Zálohy mintů se nepodařilo vyhledat",
      add_mint_failed: "Nepodařilo se přidat {mint}",
      added:
        "Do peněženky přidán {count} mint | Počet mintů přidaných do peněženky: {count}",
      none_added: "Nebyly přidány žádné nové minty",
      add_selected_failed: "Vybrané minty se nepodařilo přidat",
    },
  },
  nostr: {
    notifications: {
      nip04_published: "Událost NIP-04 zveřejněna",
      nip04_failed: "Událost NIP-04 se nepodařilo zveřejnit",
      nip17_failed: "Událost NIP-17 se nepodařilo zveřejnit",
      receive_failed: "Příchozí platbu se nepodařilo přijmout",
      ecash_already_in_history: "Ecash už je v historii",
      ecash_added: "Ecash přidán do historie",
    },
  },
  nwc: {
    notifications: {
      melt_quote_failed: "NWC: Nepodařilo se vyžádat melt nabídku",
      unit_must_be_sat: "NWC: Aktivní jednotka musí být sat",
      allowance_exceeded: "NWC: Limit překročen",
    },
  },
  npubcash: {
    notifications: {
      could_not_update_mint: "Mint pro npub.cash se nepodařilo aktualizovat",
      add_mint_first: "Nejdřív přidejte {mint} do peněženky",
    },
  },
};
