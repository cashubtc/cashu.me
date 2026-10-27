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
    copied: "Zkopírováno",
    on_chain: "On-chain",
    pending: "Čeká",
    delete: "Smazat",
    copy_npub: "Kopírovat npub",
    back: "Zpět",
    refresh: "Obnovit",
    settings: "Nastavení",
    backspace: "Smazat znak",
    swap_input_mode: "Přepnout zadávání částky/fiat",
    fee: "Poplatek",
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
      unsupported_legacy_qr: "Nepodporovaný starší QR kód",
      legacy_qr_not_supported:
        "Tento starší QR kód nepochází od podporovaného obchodníka",
      no_bolt12_mint: "Žádný z vašich mintů nepodporuje BOLT12 nabídky",
      no_bolt11_mint: "Žádný z vašich mintů nepodporuje BOLT11 faktury",
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
          caption: "S čím souhlasíte používáním Cashu.me",
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
        title: "Záloha a obnova",
        caption: "Seed fráze a obnovení ecash",
      },
      lightning_address: {
        title: "Lightning adresa",
        caption: "Přijímejte platby na jmeno@domena",
      },
      nostr: {
        title: "Nostr",
        caption: "Klíče, relaye a síť důvěry",
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
      description: "Vyberte si preferovaný jazyk ze seznamu níže.",
    },
    sections: {
      backup_restore: "ZÁLOHA A OBNOVA",
      lightning_address: "LIGHTNING ADRESA",
      nostr_keys: "NOSTR KLÍČE",
      nostr: {
        title: "NOSTR",
        relays: {
          already_added: "Relay už je přidán",
          expand_label: "Klikněte pro úpravu relayů",
          add: {
            title: "Přidat relay",
            description:
              "Vaše peněženka používá tyto relaye pro funkce Nostru, jako jsou žádosti o platbu, Nostr Wallet Connect a zálohy.",
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
          "Obnovte ecash z jiné seed fráze. Vaše současná seed fráze zůstane beze změny.",
        button: "Obnovit",
      },
    },
    lightning_address: {
      server_url: {
        label: "Název hostitele npub.cash",
        hint: "Zadejte název hostitele nebo HTTPS URL",
        invalid: "Zadejte platnou HTTPS URL serveru",
      },
      title: "Lightning adresa",
      description: "Přijímejte platby na svou Lightning adresu.",
      enable: {
        toggle: "Používat Lightning adresu",
        description: "Přijímejte platby na adresu od npub.cash",
      },
      address: {
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
        description:
          "Vložte svůj soukromý Nostr klíč (nsec) do této peněženky. Nedoporučujeme.",
        delete_tooltip: "Smazat soukromý klíč",
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
        "Přijímejte platby přes Nostr. Když je zapnuto, peněženka naslouchá na vašich Nostr relayích.",
      enable_toggle: "Zapnout žádosti o platbu",
      claim_automatically: {
        toggle: "Přijímat automaticky",
        description:
          "Připíše příchozí platby k zůstatku bez ptaní. Když je vypnuto, každou přijímáte sami.",
      },
    },

    nostr_wallet_connect: {
      title: "Nostr Wallet Connect (NWC)",
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
      title: "Uzamčený ecash",
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
      title: "Soukromí",
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
      title: "Experimentální",
      description: "Tyto funkce jsou experimentální.",
      receive_swaps: {
        toggle: "Přijímat swapy",
        badge: "Beta",
        description:
          "Nabídne výměnu přijatého ecash do vašeho aktivního mintu.",
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
        toggle: "Povolit Multinut",
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
        description: "Použít číselnou klávesnici pro zadávání částek.",
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
    npub_cash: {
      copy_lightning_address: "Kopírovat Lightning adresu",
    },
    multinut: {
      use_multinut: "Platby z více mintů",
    },
    advanced: {
      notifications: {
        reserved_unset: "Rezervace všech důkazů zrušena",
        removed_spent: "Odstraněno utracených důkazů: {count}",
        no_spent: "Nebyly nalezeny žádné utracené důkazy",
        invalid_backup: "Neplatný formát souboru zálohy",
        read_error: "Chyba při čtení souboru",
      },
      title: "Pokročilé",
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
          description:
            "Klepnutím na keyset zvýšíte jeho čítač. Pomáhá při chybě „outputs have already been signed“.",
          counter: "čítač: {count}",
          increase: "Zvýšit čítač pro {id}",
        },
        unset_reserved: {
          button: "Zrušit rezervaci všech tokenů",
          description:
            "Uvolní ecash držený pro čekající odeslání, aby šel znovu utratit. Poté spusťte „Odstranit utracené proofy“.",
        },
        show_onboarding: {
          button: "Zobrazit onboarding",
          description: "Znovu zobrazí úvodní obrazovky.",
        },
        reset_wallet: {
          button: "Resetovat data peněženky",
          description:
            "Smaže všechna data peněženky v tomto zařízení. Nejdřív exportujte zálohu.",
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
    terms_agreement: "Pokračováním souhlasíte s {terms}",
    title: "Vítejte v Cashu.me",
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
    disclaimer:
      "Vaše seed fráze se používá pouze lokálně pro odvození klíčů peněženky.",
  },
  WelcomeRestoreEcash: {
    title: "Obnovte svůj ecash",
    text: "Skenujte nevyužité proofy na nakonfigurovaných mintech a přidejte je do peněženky.",
  },
  MintRatings: {
    web_of_trust_hop: "Ve vaší síti důvěry (skok {hop})",
    no_mint_url: "Nebyla zadána URL mintu",
    title: "Recenze mintu",
    reviews: "recenze",
    ratings: "{n} hodnocení | {n} hodnocení",
    no_reviews: "Zatím žádné recenze",
    your_review: "Vaše recenze",
    no_reviews_to_display: "Žádné recenze k zobrazení.",
    no_rating: "Bez hodnocení",
    stars_label: "{rating} z 5 hvězdiček",
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
      rating: { label: "Hodnocení" },
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
      label: "Obnovit minty z Nostru",
      caption:
        "Hledejte zálohy mintů uložené na Nostr relays pomocí vaší seed fráze. Pomůže to objevit minty, které jste dříve používali.",
      search_button: "Hledat zálohy mintů",
      select_all: "Vybrat vše",
      deselect_all: "Zrušit výběr",
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
          label: "Naskenovat QR kód",
        },
      },
    },
    discover: {
      title: "Objevte minty",
      overline: "Objevovat",
      caption: "Minty, které ostatní doporučují na Nostru.",
      actions: {
        discover: {
          label: "Objevovat minty",
          in_progress: "Načítá se…",
          error_no_mints: "Nenalezeny žádné minty",
          success: "Nalezeno { length } mintů",
        },
      },
      unnamed: "Mint bez názvu",
      empty: {
        title: "Najít mint",
        text: "Cashu.me se zeptá Nostr relayů na minty, které doporučují ostatní, včetně hodnocení a recenzí.",
      },
      recommendations: {
        overline: "Nalezeno { length } mintů",
        caption: "Než mint použijete, prověřte si ho.",
        actions: {
          browse: {
            label: "Klikněte pro prohlížení mintů",
          },
        },
      },
    },
    swap: {
      title: "Swap",
      overline: "Výměny mezi minty",
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
        label_blocked: "Vytváří se faktura",
        in_progress: "Vytváří se",
      },
    },
    invoice: {
      caption: "Faktura Lightning",
      status_paid_text: "Zaplaceno",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
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
      pay_failed: "Požadavek se nepodařilo zaplatit",
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
    receiving_amount: "Přijímání {amount}",
    title: "Přijmout ecash",
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
        already_in_history_success_text: "Ecash už je v historii",
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
      caption: "Zamykací klíč",
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
      caption: "Žádost o platbu",
      description: "Přijímat platby přes Nostr",
    },
    request_index: "Požadavek {index} z {total}",
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
    qr: {
      show: "Zobrazit QR kód",
      hide: "Skrýt QR kód",
    },
    contact: {
      title: "Kontakt",
    },
    details: {
      title: "Detaily mintu",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Podporované NUTy",
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
  },
  ChooseMint: {
    title: "Vyberte mint",
    placeholder: "Vyberte mint",
    available_text: "v tomto mintu",
    sheet_title: "Vyberte mint",
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
      filter_ecash_only: {
        label: "Jen ecash",
      },
      check_status: {
        tooltip_text: "Zkontrolovat stav",
      },
      receive: {
        tooltip_text: "Přijmout",
      },
      filter_pending: {
        label: "Jen čekající",
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
        label: "Jen čekající",
      },
      show_all: {
        label: "Zobrazit vše",
      },
    },
  },

  RemoveMintDialog: {
    title: "Odebrat tento mint?",
    nickname: {
      label: "Přezdívka",
    },
    balances: {
      label: "Zůstatky",
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
      blocks: "{n} blok | {n} bloků",
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
      title_bolt12: "Zaplatit Lightning nabídku",
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
          waiting_for_wallet: "Čekání na peněženku…",
          error: "Chyba",
        },
      },
    },
  },

  EditMintDialog: {
    title: "Upravit mint",
    inputs: {
      nickname: {
        placeholder: "např. Testnet",
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
      "Připojte se k tomuto mintu, jen pokud mu důvěřujete. Pokud ukončí provoz, ecash, který u něj máte, je ztracen.",
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
    amount: "Částka",
    fee_reserve: "Rezerva na poplatek",
    fee_paid: "Zaplacený poplatek",
    unit: "Jednotka",
    status: "Stav",
    network: "Síť",
    transaction_id: "ID transakce",
    chain_status: "Stav v blockchainu",
    fetching: "Načítání",
    paid_at: "Zaplaceno",
    preimage: "Preimage",
    preimage_copied: "Preimage zkopírován",
    mint: "Mint",
    method: "Metoda",
    lightning_offer: "Lightning nabídka",
    chain_confirmed: "Potvrzeno",
    chain_pending: "Čeká",
    states: {
      waiting: "Čeká na platbu",
      paid: "Zaplaceno",
      unpaid: "Nezaplaceno",
      pending: "Čeká",
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
    swaps_count: "{successful} z {total} výměn",
    average_time: "Průměrná doba",
    average_time_caption: "U úspěšných výměn",
    disclaimer:
      "Data auditu poskytují nezávislé třetí strany, aby pomohla v čase posoudit spolehlivost mintu. Tyto výsledky jsou však pouze informativní a nezaručují bezpečnost, solventnost ani důvěryhodnost žádného mintu. Vždy si udělejte vlastní průzkum a před použitím služeb se ujistěte, že provozovateli mintu důvěřujete.",
    donate_text:
      "Informace o auditu poskytuje {link}. Aktuální zůstatek, který auditor pro tento mint drží, je {balance}, dosud bylo celkem darováno {donations}. Chcete-li podpořit další audity, můžete {press_here} a darovat auditorovi ecash.",
    press_here: "kliknout zde",
    sats_amount: "{amount} sats",
    warnings_title: "Upozornění auditora",
    warnings: {
      last_swap_failed: "Poslední pokus o výměnu selhal.",
      recent_success:
        "Za posledních {days} dní uspělo {successful} z {total} výměn.",
      reliable:
        "{base} Nicméně {success} Tento mint se zdá spolehlivý, selhání mohou být způsobena přijímajícím mintem.",
      unreliable: "{base} Pouze {success} Tento mint může být nespolehlivý.",
      unknown: "Auditor zatím nedokázal určit kvalitu tohoto mintu.",
      not_enough_data:
        "Auditor nemá o tomto mintu dostatek nedávných dat. Za posledních {days} dní proběhlo jen {count} úspěšných výměn.",
      low_success:
        "Za posledních {days} dní měl tento mint úspěšnost {rate} %, což je pod doporučenými {threshold} %.",
      inactive:
        "Tento mint neměl žádné výměny {days} dní. Může být nedostupný.",
      slow: "Tento mint je pomalý. Platby z něj trvaly v průměru {seconds} s.",
      no_successful:
        "U tohoto mintu nebyla zaznamenána žádná úspěšná výměna. Může být nedostupný.",
    },
    chart: {
      now: "Nyní",
      today: "Dnes",
      yesterday: "Včera",
      invalid_date: "Neplatné datum",
      swaps: "Výměny:",
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
    qr_size: "Velikost QR: {value}",
    speed: {
      fast: "Rychlá",
      medium: "Střední",
      slow: "Pomalá",
    },
    size: {
      large: "Velká",
      medium: "Střední",
      small: "Malá",
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
};
