export default {
  MultinutPicker: {
    dialog_title: "Multinut ödeme",
    pay_using_multiple: "Birden çok mint kullanarak öde",
    experimental_title: "Deneysel özellik",
    experimental_text:
      "Bu özellik oldukça deneyseldir ve beklendiği gibi çalışmayabilir. Daha önce ödenmiş bir faturayı ödemeye çalışmayın. Fon kaybedebilirsiniz.",
    understand: "Anladım",
    select_funds: "Ödemeyi gerçekleştirmek için birden çok mint'ten fon seçin.",
    pay_invoice: "Faturayı öde",
    amount_mismatch: "Tutar hesaplama hatası: {calculated} / {expected}",
    states: {
      requesting: "İsteniyor...",
      paying: "Ödeniyor...",
      success: "Başarılı",
      failed: "Başarısız",
    },
    payment: "Multinut ödeme",
    selectMints: "Ödeme yapmak için bir veya birden fazla mint seçin.",
    totalSelectedBalance: "Seçilen toplam bakiye",
    multiMintPay: "Birden çok mint ile ödeme",
    balanceNotEnough: "Çoklu mint bakiyesi bu faturayı karşılamaya yetmiyor",
    failed: "İşlenemedi: {error}",
    paid: "Lightning ile {amount} ödendi",
  },
  // merged into single Settings block above
  advanced: {
    developer: {},
  },

  global: {
    copy_to_clipboard: {
      success: "Panoya kopyalandı!",
    },
    actions: {
      add_mint: {
        label: "Mint ekle",
      },
      cancel: {
        label: "İptal",
      },
      copy: {
        label: "Kopyala",
      },
      close: {
        label: "Kapat",
      },
      enter: {
        label: "Gir",
      },
      lock: {
        label: "Kilitle",
      },
      paste: {
        label: "Yapıştır",
      },
      receive: {
        label: "Al",
      },
      scan: {
        label: "Tara",
      },
      send: {
        label: "Gönder",
      },
      swap: {
        label: "Değiştir",
      },
      update: {
        label: "Güncelle",
      },
      pay: { label: "Öde" },
    },
    inputs: {
      mint_url: {
        label: "Mint URL'si",
      },
    },
  },
  wallet: {
    notifications: {
      balance_too_low: "Bakiye çok düşük",
      received: "{amount} alındı",
      fee: " (ücret: {fee})",
      could_not_request_mint: "Mint isteği yapılamadı",
      invoice_still_pending: "Fatura hala beklemede",
      paid_lightning: "Lightning üzerinden {amount} ödendi",
      payment_pending_refresh:
        "Ödeme beklemede. Faturayı manuel olarak yenileyin.",
      sent: "{amount} gönderildi",
      token_still_pending: "Token hala beklemede",
      received_lightning: "Lightning üzerinden {amount} alındı",
      lightning_payment_failed: "Lightning ödemesi başarısız oldu",
      failed_to_decode_invoice: "Fatura çözülemedi",

      invalid_lnurl: "Geçersiz LNURL",
      lnurl_error: "LNURL hatası",
      no_amount: "Tutar yok",
      no_lnurl_data: "LNURL verisi yok",
      no_price_data: "Fiyat verisi yok.",
      please_try_again: "Lütfen tekrar deneyin.",
      trying_again: "Tekrar deneniyor...",
      unsupported_legacy_qr: "Desteklenmeyen eski tip QR kodu",
      legacy_qr_not_supported:
        "Bu eski tip QR kodu desteklenen bir satıcıya ait değil",
      no_bolt12_mint:
        "Mint'lerinizin hiçbiri BOLT12 tekliflerini desteklemiyor",
      no_bolt11_mint:
        "Mint'lerinizin hiçbiri BOLT11 faturalarını desteklemiyor",
    },
    mint: {
      notifications: {
        already_added: "Mint zaten eklenmiş",
        added: "Mint eklendi",
        not_found: "Mint bulunamadı",
        activation_failed: "Mint etkinleştirmesi başarısız oldu",
        no_active_mint: "Aktif mint yok",
        unit_activation_failed: "Birim etkinleştirmesi başarısız oldu",
        unit_not_supported: "Birim mint tarafından desteklenmiyor",
        activated: "Mint etkinleştirildi",
        could_not_connect: "Mint'e bağlanılamadı",
        could_not_get_info: "Mint bilgisi alınamadı",
        could_not_get_keys: "Mint anahtarları alınamadı",
        could_not_get_keysets: "Mint anahtar setleri alınamadı",
        removed: "Mint kaldırıldı",
        error: "Mint hatası",
        mint_validation_error: "Mint doğrulama hatası",
      },
    },
  },
  MainHeader: {
    menu: {
      settings: {
        title: "Ayarlar",
        settings: {
          title: "Ayarlar",
          caption: "Cüzdan yapılandırması",
        },
      },
      terms: {
        title: "Şartlar",
        terms: {
          title: "Şartlar",
          caption: "Cashu.me'yi kullanarak kabul ettikleriniz",
        },
      },
      links: {
        title: "Bağlantılar",
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
          title: "Bağış yap",
          caption: "Cashu'yu Destekle",
        },
      },
    },
    offline: {
      warning: {
        text: "Çevrimdışı",
      },
    },
    reload: {
      warning: {
        text: "{ countdown } içinde yeniden yükle",
      },
    },
    staging: {
      warning: {
        text: "Hazırlık aşaması – gerçek fonlarla kullanmayın!",
      },
    },
  },
  FullscreenHeader: {
    actions: {
      back: {
        label: "Cüzdan",
      },
    },
  },
  Settings: {
    menu: {
      title: "Ayarlar",
      backup: {
        title: "Yedekleme ve geri yükleme",
        caption: "Seed kelimeleri ve ecash kurtarma",
      },
      lightning_address: {
        title: "Lightning adresi",
        caption: "isim@alanadi adresinden ödeme alın",
      },
      nostr: {
        title: "Nostr",
        caption: "Anahtarlar, röleler ve güven ağı",
      },
      payment_requests: {
        title: "Ödeme talepleri",
        caption: "Nostr üzerinden ecash ödemeleri alın",
      },
      nwc: {
        title: "Nostr Cüzdan Bağlantısı",
        caption: "Cüzdanınızı diğer uygulamalardan kullanın",
      },
      hardware: {
        title: "Donanım",
        caption: "NFC ayarları",
      },
      p2pk: {
        title: "Kilitli ecash",
        caption: "Yalnızca anahtarınızın açabileceği ecash alın",
      },
      privacy: {
        title: "Gizlilik",
        caption: "Ağ kontrolleri ve bitcoin fiyatı",
      },
      experimental: {
        title: "Deneysel",
        caption: "Yeni özellikleri erkenden deneyin",
      },
      appearance: {
        title: "Görünüm",
        caption: "Tema, klavye ve bitcoin simgesi",
      },
      language: {
        title: "Dil",
        caption: "Dilinizi seçin",
      },
      advanced: {
        title: "Gelişmiş",
        caption: "Geliştirici araçları ve cüzdan sıfırlama",
      },
      about: {
        title: "Hakkında",
        caption: "Koşullar ve bağlantılar",
      },
    },
    language: {
      title: "Dil",
      description: "Lütfen aşağıdaki listeden tercih ettiğiniz dili seçin.",
    },
    sections: {
      backup_restore: "YEDEKLE & GERİ YÜKLE",
      lightning_address: "LIGHTNING ADRESİ",
      nostr_keys: "NOSTR ANAHTARLARI",
      nostr: {
        title: "NOSTR",
        relays: {
          already_added: "Röle zaten eklendi",
          expand_label: "Röleleri düzenlemek için tıklayın",
          add: {
            title: "Röle ekle",
            description:
              "Cüzdanınız bu röleleri ödeme talepleri, Nostr Wallet Connect ve yedeklemeler gibi Nostr özellikleri için kullanır.",
          },
          list: {
            title: "Röleler",
            description: "Cüzdanınız bu rölelere bağlanacak.",
            copy_tooltip: "Röleyi kopyala",
            remove_tooltip: "Röleyi kaldır",
          },
        },
      },

      payment_requests: "ÖDEME TALEPLERİ",
      nostr_wallet_connect: "NOSTR CÜZDAN BAĞLANTISI",
      hardware_features: "DONANIM ÖZELLİKLERİ",
      p2pk_features: "P2PK ÖZELLİKLERİ",
      privacy: "GİZLİLİK",
      experimental: "DENEYSEL",
      appearance: "GÖRÜNÜM",
    },
    backup_restore: {
      backup_seed: {
        title: "Kurtarma kelimelerini yedekle",
        description:
          "Kurtarma kelimeleriniz cüzdanınızı geri yükleyebilir. Güvenli ve gizli tutun.",
        seed_phrase_label: "Kurtarma kelimeleri",
      },
      restore_ecash: {
        title: "Ecash'i geri yükle",
        description:
          "Başka bir kurtarma ifadesinden ecash kurtarın. Mevcut kurtarma ifadeniz değişmez.",
        button: "Geri Yükle",
      },
    },
    lightning_address: {
      server_url: {
        label: "npub.cash ana makine adı",
        hint: "Bir ana makine adı veya HTTPS URL'si girin",
        invalid: "Geçerli bir HTTPS sunucu URL'si girin",
      },
      title: "Lightning adresi",
      description: "Lightning adresinize ödeme alın.",
      enable: {
        toggle: "Lightning adresi kullan",
        description: "npub.cash'ten alınan bir adresle ödeme alın",
      },
      address: {
        label: "Adresin",
        copy_tooltip: "Lightning adresini kopyala",
      },
      show_on_receive: {
        toggle: "Alırken göster",
        description: "Adres ve QR kodunu göster.",
      },
      automatic_claim: {
        toggle: "Otomatik olarak talep et",
        description: "Gelen ödemeleri otomatik olarak alın.",
      },
      mint: {
        label: "npub.cash mint",
        choose_title: "npub.cash için mint seçin",
        choose_placeholder: "Bir mint seçin…",
      },
    },
    nostr_keys: {
      title: "Nostr anahtarlarınız",
      description: "Nostr anahtarlarınız Lightning adresinizi belirler.",
      wallet_seed: {
        title: "Cüzdan kurtarma kelimeleri",
        description: "Cüzdan seed'inizden bir Nostr anahtar çifti oluşturun",
        copy_nsec: "Özel anahtarı kopyala",
      },
      nsec_bunker: {
        title: "Uzak imzalayıcı",
        description: "NIP-46 bunker ile imzalayın",
        delete_tooltip: "Bağlantıyı sil",
      },
      use_nsec: {
        title: "Kendi özel anahtarınızı kullanın",
        description:
          "Nostr özel anahtarınızı (nsec) bu cüzdana yapıştırın. Önerilmez.",
        delete_tooltip: "Özel anahtarı sil",
      },
      signing_extension: {
        title: "İmzalama uzantısı",
        description: "Bir NIP-07 imzalama uzantısı kullanın",
        not_found: "NIP-07 imzalama uzantısı bulunamadı",
      },
    },

    payment_requests: {
      title: "Ödeme talepleri",
      description:
        "Nostr üzerinden ödeme alın. Açıkken cüzdanınız Nostr rölelerinizi dinler.",
      enable_toggle: "Ödeme taleplerini etkinleştir",
      claim_automatically: {
        toggle: "Otomatik olarak talep et",
        description:
          "Gelen ödemeleri sormadan bakiyenize ekler. Kapalıyken her birini siz alırsınız.",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Cüzdan Bağlantısı (NWC)",
      description:
        "Diğer uygulamaların Nostr Wallet Connect ile bu cüzdandan ödeme yapmasını sağlar.",
      enable_toggle: "Nostr Wallet Connect'i etkinleştir",
      payments_note:
        "NWC'yi yalnızca Bitcoin bakiyenizden ödemeler için kullanabilirsiniz. Ödemeler etkin mint'inizden yapılacaktır.",
      connection: {
        copy_tooltip: "Bağlantı dizesini kopyala",
        qr_tooltip: "QR kodunu göster",
        allowance_label: "Kalan ödenek (sat)",
      },
    },
    hardware_features: {
      webnfc: {
        title: "NFC kart biçimi",
        description: "NFC kartlarına yazmak için kodlamayı seçin",
        text: {
          title: "Metin",
          description: "Token'ı düz metin olarak sakla",
        },
        weburl: {
          title: "URL",
          description: "Bu cüzdanın URL'sini token ile sakla",
        },
        binary: {
          title: "İkilik",
          description: "Token'ı ikili veri olarak sakla",
        },
        quick_access: {
          toggle: "NFC'ye hızlı erişim",
          description:
            "Kart taramak için Ecash al ekranına bir NFC düğmesi ekler.",
        },
      },
    },
    p2pk_features: {
      title: "Kilitli ecash",
      description:
        "Deneysel. Küçük tutarlar kullanın: özel anahtarı kaybederseniz, ona kilitli ecash'i kimse açamaz.",
      generate_button: "Anahtar oluştur",
      import_button: "Özel anahtarı içe aktar",
      quick_access: {
        toggle: "Kilit anahtarını Al ekranında göster",
        description:
          "Kilit anahtarınızı Ecash al ekranında gösterir, böylece gönderenler ecash'i size kilitleyebilir.",
      },
      keys_expansion: {
        label: "{count} anahtara göz atmak için tıklayın",
        used_badge: "kullanıldı",
      },
    },
    privacy: {
      title: "Gizlilik",
      network_title: "Ağ kontrolleri",
      description: "Bu ayarlar gizliliğinizi etkiler.",
      check_incoming: {
        toggle: "Gelen faturayı kontrol et",
        description:
          "En son faturanızı arka planda kontrol eder. Daha hızlı güncellemeler, ama parmak izi çıkarmak kolaylaşır.",
      },
      check_startup: {
        toggle: "Başlangıçta bekleyen faturaları kontrol et",
        description: "Cüzdan açıldığında bekleyen faturaları kontrol eder.",
      },
      check_all: {
        toggle: "Tüm faturaları kontrol et",
        description:
          "Ödenmemiş faturaları iki haftaya kadar arka planda kontrol eder. Daha fazla çevrimiçi etkinlik parmak izinizi çıkarmayı kolaylaştırır.",
      },
      check_sent: {
        toggle: "Gönderilen ecash'i kontrol et",
        description:
          "Gönderilen ecash'in alınıp alınmadığını arka planda kontrol eder. Daha fazla çevrimiçi etkinlik parmak izinizi çıkarmayı kolaylaştırır.",
      },
      websockets: {
        toggle: "WebSockets kullan",
        description:
          "Anlık ödeme güncellemeleri için mint'lerle canlı bağlantı tutar. Daha hızlı, ama parmak izi çıkarmak kolaylaşır.",
      },
      bitcoin_price: {
        title: "Bitcoin fiyatı",
        toggle: "Döviz kurunu Coinbase'den al",
        description:
          "Bakiyenizi itibari parayla göstermek için bitcoin fiyatını coinbase.com'dan alır.",
        currency: {
          title: "İtibari para birimi",
          description: "Bitcoin fiyat gösterimi için fiat para birimini seçin.",
        },
      },
    },
    experimental: {
      title: "Deneysel",
      description: "Bu özellikler deneyseldir.",
      receive_swaps: {
        toggle: "Takasları al",
        badge: "Beta",
        description: "Alınan ecash'i etkin mint'inize takas etmeyi önerir.",
      },
      auto_paste: {
        toggle: "Ecash'i otomatik yapıştır",
        description:
          "Ecash al ekranını açtığınızda panodaki ecash'i yapıştırır. iOS'ta görüntü sorunlarına yol açarsa kapatın.",
      },
      auditor: {
        toggle: "Denetleyiciyi etkinleştir",
        badge: "Beta",
        description:
          "Mint ayrıntılarında bağımsız bir mint denetçisinin güvenilirlik verilerini gösterir.",
        url_label: "Denetleyici URL'si",
        api_url_label: "Denetleyici API URL'si",
      },
      multinut: {
        toggle: "Multinut'u Etkinleştir",
        description: "Faturaları aynı anda birden çok mint'ten öder.",
      },
      nostr_mint_backup: {
        toggle: "Mint listesini Nostr'a yedekle",
        description:
          "Mint listenizi Nostr rölelerinize yedekler, böylece başka bir cihazda geri yükleyebilirsiniz.",
        notifications: {
          enabled: "Nostr mint yedeği etkinleştirildi",
          disabled: "Nostr mint yedeği devre dışı bırakıldı",
          failed: "Nostr mint yedeği etkinleştirilemedi",
        },
      },
    },
    appearance: {
      bip177: {
        title: "Bitcoin sembolü",
        description: "Tutarları 2.789 sats yerine ₿2.789 olarak göster.",
        toggle: "₿ sembolünü kullan",
      },
      mode: {
        title: "Mod",
        dark: "Koyu",
        light: "Açık",
      },
      keyboard: {
        title: "Ekran klavyesi",
        description: "Miktarları girmek için sayısal klavyeyi kullanın.",
        toggle: "Sayısal klavye kullan",
        toggle_description: "Tutar girmek için sayısal tuş takımını kullanır.",
      },
      theme: {
        title: "Tema",
        description: "Cüzdanınızın görünümünü değiştirin.",
        tooltips: {
          mono: "Mono",
          cyber: "Siber",
          freedom: "Özgürlük",
          nostr: "Nostr",
          bitcoin: "Bitcoin",
          mint: "Nane",
          nut: "Ceviz",
          blu: "Mavi",
          flamingo: "Flamingo",
        },
      },
    },
    advanced: {
      backup_files_title: "Yedek dosyaları",
      danger_zone_title: "Tehlikeli bölge",
      notifications: {
        reserved_unset: "Tüm ayrılmış kanıtlar serbest bırakıldı",
        removed_spent: "{count} harcanmış kanıt kaldırıldı",
        no_spent: "Harcanmış kanıt bulunamadı",
        invalid_backup: "Geçersiz yedek dosyası biçimi",
        read_error: "Dosya okunurken hata oluştu",
      },
      title: "Gelişmiş",
      developer: {
        title: "Geliştirici ayarları",
        description: "Sorun giderme ve hata ayıklama araçları.",
        new_seed: {
          button: "Yeni kurtarma kelimeleri oluştur",
          description:
            "Yeni bir kurtarma ifadesi oluşturur. Ardından yeni seed'in geri yükleyebilmesi için bakiyenizi kendinize gönderin.",
          confirm_question:
            "Yeni bir kurtarma kelimesi oluşturmak istediğinizden emin misiniz?",
          cancel: "İptal",
          confirm: "Onayla",
        },
        remove_spent: {
          button: "Harcanmış kanıtları kaldır",
          description:
            "Etkin mint'lerinizin harcanmış bildirdiği ecash'i kaldırır. Yalnızca cüzdanınız takılırsa kullanın.",
        },
        design_system: {
          title: "Tasarım sistemi",
          description:
            "Uygulamanın her bileşeni, canlı, kaynağı ve kullanımıyla.",
        },
        debug_console: {
          button: "Hata ayıklama konsolu",
          description:
            "JavaScript konsolunu açar. Anlamadığınız kodu asla yapıştırmayın; dolandırıcılar bunu para çalmak için kullanır.",
        },
        export_proofs: {
          button: "Aktif kanıtları dışa aktar",
          description:
            "Etkin mint'in seçili birimdeki bakiyesini tek bir ecash token'ı olarak kopyalar.",
        },
        keyset_counters: {
          title: "Anahtar kümesi sayaçlarını artır",
          increase: "{id} için sayacı artır",
          fixes: "“outputs have already been signed” hatasını giderir",
          keysets: "{n} keyset | {n} keyset",
          sheet_hint:
            "Bir keyset'in sayacını artırmak için + simgesine dokunun.",
          column: "Sayaç",
        },

        unset_reserved: {
          button: "Tüm ayrılmış token'ları kaldır",
          description:
            'Bekleyen gönderimler için ayrılan ecash\'i yeniden harcanabilmesi için serbest bırakır. Ardından "Harcanmış kanıtları kaldır"ı çalıştırın.',
        },
        show_onboarding: {
          button: "Başlangıç ekranını göster",
          description: "Başlangıç ekranını tekrar gösterin.",
        },
        reset_wallet: {
          button: "Cüzdan verilerini sıfırla",
          description:
            "Bu cihazdaki tüm cüzdan verilerini siler. Önce bir yedek dışa aktarın.",
          confirm_question:
            "Cüzdan verilerinizi silmek istediğinizden emin misiniz?",
          cancel: "İptal",
          confirm: "Cüzdanı sil",
        },
        export_wallet: {
          button: "Cüzdan verilerini dışa aktar",
          description:
            "Karşılama ekranında içe aktarabileceğiniz bir yedek dosyası indirir. Cüzdanı kullanmaya devam ettikçe eskir.",
        },
        import_wallet: {
          description:
            "Bu cüzdanın verilerini dışa aktarılmış bir yedek dosyasıyla değiştirir.",
          button: "Cüzdan yedeğini içe aktar",
          confirm_question:
            "Cüzdan verilerinizi geri yüklemek istediğinizden emin misiniz?",
          cancel: "İptal",
          confirm: "CÜZDAN YEDEĞİNİ İÇE AKTAR",
        },
      },
    },

    web_of_trust: {
      title: "Güven ağı",
      known_pubkeys: "Bilinen açık anahtarlar: {wotCount}",

      continue_crawl: "Taramaya devam et",
      crawl_odell: "Odell'in güven ağını içe aktar",
      crawl_wot: "Web of trust tara",
      pause: "Duraklat",
      reset: "Sıfırla",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      copy_lightning_address: "Lightning adresini kopyala",
    },
    multinut: {
      use_multinut: "Birden çok mint ile ödemeler",
    },
  },
  NoMintWarnBanner: {
    title: "Mint ekle",
    subtitle:
      "Mint'ler bu cüzdandaki ecash'i çıkarır. Başlamak için bir mint ekleyin veya birinden ecash alın.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Ecash al",
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
        label: "Geçmiş",
      },
      invoices: {
        label: "Faturalar",
      },
      mints: {
        label: "Mint'ler",
      },
    },
    install: {
      text: "Yükle",
      tooltip: "Cashu'yu Yükle",
    },
  },
  AlreadyRunning: {
    title: "Cashu.me başka bir sekmede açık",
    text: "Diğer sekmeyi kapatın, ardından Tekrar dene'ye dokunun.",
    actions: {
      retry: {
        label: "Tekrar dene",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Bu sayfa mevcut değil",
    actions: {
      home: {
        label: "Ana sayfaya geri dön",
      },
    },
  },
  BalanceView: {
    total_label: "Toplam bakiye",
    mintUrl: {
      label: "Mint",
    },
    mintBalance: {
      label: "Bakiye",
    },
    mintError: {
      label: "Mint hatası",
    },
    pending: {
      label: "Beklemede",
      tooltip: "Tüm bekleyen token'ları kontrol et",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "Önceki",
      },
      next: {
        label: "Sonraki",
      },
    },
  },
  WelcomeSlide1: {
    terms_agreement: "Devam ederek {terms} kabul etmiş olursunuz",
    title: "Cashu.me'ye hoş geldiniz",
    text: "Cashu.me, fonlarınızı güvenli ve gizli tutmak için ecash kullanan ücretsiz ve açık kaynaklı bir Bitcoin cüzdanıdır.",
    actions: {
      more: {
        label: "Daha fazla bilgi edinmek için tıklayın",
      },
    },
    p1: {
      text: "Cashu, Bitcoin için ücretsiz ve açık kaynaklı bir ecash protokolüdür. { link } adresinden daha fazla bilgi edinebilirsiniz.",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "Bu cüzdan herhangi bir mint'e bağlı değildir. Bu cüzdanı kullanmak için güvendiğiniz bir veya daha fazla Cashu mint'ine bağlanmanız gerekir.",
    },
    p3: {
      text: "Bu cüzdan, yalnızca sizin erişiminiz olan ecash'i saklar. Kurtarma kelimeleri yedeklemesi olmadan tarayıcı verilerinizi silerseniz, token'larınızı kaybedersiniz.",
    },
    p4: {
      text: "Bu cüzdan beta aşamasındadır. Fonlara erişimini kaybeden kişilerden sorumlu değiliz. Kendi sorumluluğunuzda kullanın! Bu kod açık kaynaklıdır ve MIT lisansı altında lisanslanmıştır.",
    },
  },
  WelcomeSlide2: {
    title: "Cashu.me'yi yükleyin",
    alt: { pwa_example: "PWA yükleme örneği" },
    installing: "Yükleniyor…",
    instruction: {
      intro: {
        text: "En iyi deneyim için, cihazınızın yerel web tarayıcısını kullanarak bu cüzdanı Aşamalı Web Uygulaması olarak yükleyin. Bunu hemen yapın.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "Menüye dokunun (sağ üst)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "{ buttonText }'e basın",
          buttonText: "@:PwaPrompt.android.add",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "Paylaş'a dokunun (alt)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "{ buttonText }'e basın",
          buttonText: "@:PwaPrompt.ios.add",
        },
      },
      outro: {
        text: "Yükledikten sonra bu tarayıcı sekmesini kapatın ve Cashu.me'yi ana ekranınızdan açın.",
      },
    },
    pwa: {
      success: {
        title: "Başarılı!",
        text: "Cashu'yu PWA olarak kullanıyorsunuz. Diğer açık tarayıcı pencerelerini kapatın ve uygulamayı ana ekranınızdan kullanın.",
        nextSteps:
          "Artık bu sekmeyi kapatıp uygulamayı ana ekranınızdan açabilirsiniz.",
      },
    },
  },
  PwaPrompt: {
    title: "Cashu'yu yükle",
    text: "Ana ekranınızdan, tarayıcı çubuğu olmadan açılır.",
    ios: {
      share: "Paylaş'a dokunun",
      add: "Ana Ekrana Ekle",
    },
    android: {
      menu: "Tarayıcı menüsünü açın",
      add: "Ana Ekrana Ekle",
    },
    install: "Yükle",
    notNow: "Şimdi değil",
  },
  WelcomeSlide3: {
    title: "Kurtarma ifadeniz",
    text: "Kurtarma kelimelerinizi bir parola yöneticisinde veya kağıt üzerinde saklayın. Cihaza erişiminizi kaybederseniz fonlarınızı kurtarmanın tek yolu kurtarma kelimelerinizdir.",
    inputs: {
      seed_phrase: {
        label: "Kurtarma ifadesi",
        caption: "Kurtarma kelimelerinizi ayarlarda görebilirsiniz.",
      },
      checkbox: {
        label: "Yazdım",
      },
    },
  },
  WelcomeSlide4: {
    english_only: "Yasal metin yalnızca İngilizce olarak mevcuttur.",
    title: "Hizmet Şartları",
    actions: {
      more: {
        label: "Cashu.me'yi kullanmadan önce lütfen okuyun",
      },
    },
    inputs: {
      checkbox: {
        label: "Bu şartları ve koşulları okudum ve kabul ediyorum",
      },
    },
  },
  WelcomeSlideChoice: {
    title: "Cüzdanınızı ayarlayın",
    text: "Bir seed ifadesinden mi kurtarmak istersiniz yoksa yeni bir cüzdan mı oluşturmak istersiniz?",
    options: {
      new: {
        title: "Yeni cüzdan oluştur",
        subtitle: "Yeni bir seed oluşturun ve mint ekleyin.",
      },
      recover: {
        title: "Cüzdanı kurtar",
        subtitle: "Seed ifadenizi girin, mintleri ve ecash'i geri yükleyin.",
      },
    },
  },
  WelcomeMintSetup: {
    title: "Mint ekle",
    text: "Mintler ecash göndermenize ve almanıza yardımcı olan sunuculardır. Keşfedilen bir minti seçin veya manuel ekleyin. Daha sonra da ekleyebilirsiniz.",
    sections: { your_mints: "Mintleriniz" },
    restoring: "Mintler geri yükleniyor…",
    placeholder: { mint_url: "https://" },
  },
  WelcomeRecoverSeed: {
    title: "Seed ifadenizi girin",
    text: "Kurtarmak için 12 kelimelik seed ifadenizi yapıştırın veya yazın.",
    inputs: { word: "Kelime { index }" },
    actions: { paste_all: "Tümünü yapıştır" },
    disclaimer:
      "Seed ifadeniz yalnızca yerelde cüzdan anahtarlarını türetmek için kullanılır.",
  },
  WelcomeRestoreEcash: {
    title: "Ecash'inizi geri yükleyin",
    text: "Yapılandırılmış mintlerinizde harcanmamış kanıtları tarayın ve cüzdanınıza ekleyin.",
  },
  MintRatings: {
    sort_and_filter: "Sırala ve filtrele",
    reviews_title: "Yorumlar",
    reviews_count: "{n} yorum | {n} yorum",
    web_of_trust_caption: "Yalnızca güven ağındaki kişilerin yorumlarını say",
    web_of_trust_hop: "Güven ağınızda ({hop}. adım)",
    no_mint_url: "Mint URL'si belirtilmedi",
    title: "Mint yorumları",
    reviews: "yorum",
    ratings: "{n} puan | {n} puan",
    no_reviews: "Henüz yorum yok",
    your_review: "Yorumunuz",
    no_reviews_to_display: "Gösterilecek yorum yok.",
    no_rating: "Puan yok",
    stars_label: "5 yıldızdan {rating}",
    out_of: "üzerinden",
    rows: "Reviews",
    sort: "Sırala",
    sort_options: {
      newest: "En yeni",
      oldest: "En eski",
      highest: "En yüksek",
      lowest: "En düşük",
    },
    actions: { write_review: "Yorum yaz" },
    empty_state_subtitle:
      "Bu mint'i ilk siz değerlendirin. Deneyiminiz başkalarının seçim yapmasına yardımcı olur.",
    range: "{from}–{to} / {total}",
  },
  CreateMintReview: {
    connect_nostr:
      "Değerlendirme yayımlamak için Ayarlar'dan bir Nostr hesabı bağlayın.",
    published: "Değerlendirme yayımlandı",
    publish_failed: "Değerlendirme yayımlanamadı",
    title: "Mint'i değerlendir",
    publishing_as: "Şu kişi olarak yayımlanıyor",
    inputs: {
      rating: { label: "Puan" },
      review: { label: "Yorum (isteğe bağlı)" },
    },
    actions: {
      publish: { label: "Yorumu yayınla", in_progress: "Yayınlanıyor…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "Kurtarma ifadesinden geri yükle",
      caption:
        "Geri yüklemeden önce bu seed ile kullandığınız tüm mint'leri ekleyin.",
      inputs: {
        seed_phrase: {
          label: "Kurtarma kelimeleri",
          caption: "Kurtarma kelimelerinizi ayarlarda görebilirsiniz.",
        },
      },
    },
    information: {
      label: "Bilgi",
      caption:
        "Sihirbaz yalnızca başka bir kurtarma kelimesinden ecash'i geri yükleyecektir, şu anda kullandığınız cüzdanın kurtarma kelimesini kullanamayacak veya değiştiremeyeceksiniz. Bu, geri yüklenen ecash'in bir kez kendinize göndermediğiniz sürece mevcut kurtarma kelimeniz tarafından korunmayacağı anlamına gelir.",
    },
    restore_mints: {
      label: "Mint'leri geri yükle",
      caption:
        "Geri yüklenecek mint'leri seçin. Eksik mint'leri önce Mint'ler sekmesinden ekleyin.",
    },
    nostr_mints: {
      label: "Mint'leri Nostr'dan geri yükle",
      caption:
        "Seed ifadenizi kullanarak Nostr rölelerinde depolanan mint yedeklerini arayın. Bu, daha önce kullandığınız mint'leri keşfetmenize yardımcı olacaktır.",
      search_button: "Mint yedeklerini ara",
      select_all: "Tümünü seç",
      deselect_all: "Seçimi kaldır",
      backed_up: "Yedeklendi",
      already_added: "Zaten eklendi",
      add_selected: "Seçileni Ekle ({count})",
      no_backups_found: "Mint yedeği bulunamadı",
      no_backups_hint:
        "Mint listenizi otomatik olarak yedeklemek için ayarlarda Nostr mint yedeğinin etkinleştirildiğinden emin olun.",
      invalid_mnemonic: "Lütfen aramadan önce geçerli bir seed ifadesi girin.",
      search_error: "Mint yedekleri aranırken hata oluştu.",
      add_error: "Seçilen mint'ler eklenirken hata oluştu.",
    },
    actions: {
      paste: {
        error: "Pano içeriği okunamadı.",
      },
      validate: {
        error: "Anımsatıcı en az 12 kelime olmalıdır.",
      },
      select_all: {
        label: "Tümünü seç",
      },
      deselect_all: {
        label: "Seçimi kaldır",
      },
      restore: {
        label: "Geri Yükle",
        in_progress: "Mint geri yükleniyor…",
        error: "Mint geri yükleme hatası: { error }",
      },
      restore_all_mints: {
        label: "Tüm mint'leri geri yükle",
        in_progress: "{ length } mint'ten { index } geri yükleniyor…",
        success: "Geri yükleme başarıyla tamamlandı",
        error: "Mint'leri geri yükleme hatası: { error }",
      },
      restore_selected_mints: {
        label: "Seçili mint'leri geri yükle ({count})",
        in_progress: "{ length } mint'ten { index } geri yükleniyor…",
        success: "{count} mint başarıyla geri yüklendi",
        error: "Seçili mint'leri geri yükleme hatası: { error }",
      },
    },
  },
  MintSettings: {
    see_reviews: "Yorumları gör",
    add: {
      title: "Mint ekle",
      description:
        "Bağlanmak için bir Cashu mint'inin URL'sini girin. Bu cüzdan herhangi bir mint'e bağlı değildir.",
      inputs: {
        nickname: {
          placeholder: "Takma ad (örneğin Testnet)",
        },
      },
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "Geçersiz URL",
        },
        scan: {
          label: "QR kodu tara",
        },
      },
    },
    discover: {
      title: "Mint'leri keşfet",
      overline: "Keşfet",
      caption: "Başkalarının Nostr'da önerdiği mint'ler.",
      actions: {
        discover: {
          label: "Mint'leri keşfet",
          in_progress: "Yükleniyor…",
          error_no_mints: "Mint bulunamadı",
          success: "{ length } mint bulundu",
        },
      },
      unnamed: "Adsız mint",
      empty: {
        title: "Bir mint bulun",
        text: "Cashu.me, başkalarının önerdiği mint'leri puanları ve yorumlarıyla birlikte Nostr relay'lerinden sorgular.",
      },
      recommendations: {
        overline: "{ length } mint bulundu",
        caption: "Bir mint'i kullanmadan önce kendi araştırmanı yap.",
        actions: {
          browse: {
            label: "Mint'lere göz atmak için tıklayın",
          },
        },
      },
    },
    swap: {
      title: "Değiştir",
      overline: "Mint'ler arası takas",
      caption:
        "Lightning ile mint'leriniz arasında para taşıyın. Ücret alınabilir.",
      inputs: {
        from: {
          label: "Kimden",
        },
        to: {
          label: "Kime",
        },
        amount: {
          label: "Miktar ({ ticker })",
        },
      },
      actions: {
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
        receove_to_trusted_mint: { label: "Güvenilen mint'e al" },
      },
    },
    error_badge: "Hata",
    active_badge: "Etkin",
    reviews_text: "yorum | yorum",
    no_reviews_yet: "Henüz yorum yok",
    discover_mints_button: "Mint'leri keşfet",
  },
  QrcodeReader: {
    progress: {
      text: "{ percentage }{ addon }",
      percentage: "%{ percentage }",
      keep_scanning_text: " - Taramaya devam et",
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
    title: "Lightning Al",
    create_invoice_title: "Fatura oluştur",
    inputs: {
      amount: {
        label: "Miktar ({ ticker }) *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "Fatura oluştur",
        label_blocked: "Fatura oluşturuluyor",
        in_progress: "Oluşturuluyor",
      },
    },
    invoice: {
      caption: "Lightning faturası",
      status_paid_text: "Ödendi",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        copy: {
          label: "Faturayı kopyala",
        },
      },
    },
  },
  SendDialog: {
    captions: {
      ecash: "Token veya QR kod paylaşın",
      lightning: "Fatura ya da adres ödeyin",
      onchain: "Bitcoin adresine gönderin",
    },
    title: "Gönder",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Mint yok",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "Mint yok",
      },
    },
  },
  SendTokenDialog: {
    badge_locked: "kilitli",
    title: "Ecash gönder",
    title_ecash_text: "Ecash",
    badge_offline_text: "Çevrimdışı",
    inputs: {
      amount: {
        label: "Miktar ({ ticker }) *",
        invalid_too_much_error_text: "Çok fazla",
      },
      p2pk_pubkey: {
        label: "Alıcının genel anahtarı",
        label_invalid: "Alıcının genel anahtarı",
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
        tooltip_text: "Emojiyi kopyala",
      },
      copy_tokens: {
        label: "Ecash'i kopyala",
      },
      copy_link: {
        tooltip_text: "Bağlantıyı kopyala",
      },
      share: {
        tooltip_text: "Ecash'ını paylaş",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      paste_p2pk_pubkey: {
        tooltip_text: "@:global.actions.paste.label",
      },
      send: {
        label: "@:global.actions.send.label",
        in_progress: "Gönderiliyor…",
      },
      delete: {
        tooltip_text: "Geçmişten sil",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "NFC kartına flaşla",
          ndef_unsupported_text: "NDEF desteklenmiyor",
        },
      },
      pay: { label: "@:global.actions.pay.label" },
    },
    errors: {
      amount_required: "Önce bir tutar girin.",
      serialization_failed: "Ecash token'ı hazırlanamadı.",
      mint_not_allowed_by_request:
        "Seçilen mint bu ödeme talebi tarafından kabul edilmiyor.",
    },
  },
  ReceiveDialog: {
    captions: {
      ecash: "Token yapıştırın, tarayın veya isteyin",
      lightning: "Ödeme almak için fatura oluşturun",
      onchain: "Bitcoin adresi alın",
    },
    title: "Al",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Mint yok",
      },
      lightning: {
        label: "Lightning",
        error_no_mints:
          "Lightning aracılığıyla almak için bir mint'e bağlanmanız gerekir",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "Ecash al",
    actions: {
      paste: {
        label: "Token yapıştır",
      },
      scan: {
        label: "Token tara",
      },
      request: {
        label: "Ecash iste",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      nfc: {
        label: "NFC",
        scanning_text: "Taranıyor…",
      },
    },
  },
  ReceiveTokenDialog: {
    receiving_amount: "{amount} alınıyor",
    title: "Ecash al",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "Cashu token'ını yapıştır",
      },
    },
    errors: {
      invalid_token: {
        label: "Geçersiz token",
      },
      p2pk_lock_mismatch: {
        label:
          "Alınamıyor. Bu token'ın P2PK kilidi genel anahtarınızla eşleşmiyor.",
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
        label_adding_mint: "Mint ekleniyor…",
      },
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "Güvenilen bir mint'e takas et",
        caption: "{ value } takas et",
        processing: "Takas yapılıyor…",
        failed: "Takas başarısız",
      },
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "Takası iptal et",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      later: {
        label: "Daha sonra al",
        tooltip_text: "Daha sonra almak için geçmişe ekle",
        already_in_history_success_text: "Ecash zaten geçmişte",
        added_to_history_success_text: "Ecash geçmişe eklendi",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "NFC kartından oku",
          ndef_unsupported_text: "NDEF desteklenmiyor",
        },
      },
      receive_to_selected_mint: { label: "Seçili mint'e al" },
    },
    unknown_mint_info_text:
      "Bilinmeyen mint. Bu token'ı aldıktan sonra eklenecek.",
    swap_section: {
      title: "Takas",
      source_label: "Kaynak",
      destination_label: "Hedef",
      fee_info: "Bu takas Lightning ağ ücretlerine tabidir.",
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "Kilit anahtarı",
      description: "Bu anahtara kilitlenmiş ecash al",
      used_warning_text:
        "Uyarı: Bu anahtar daha önce kullanıldı. Daha iyi gizlilik için yeni bir anahtar kullanın.",
    },
    actions: {
      copy: {
        label: "Açık anahtarı kopyala",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_key: {
        label: "Yeni anahtar oluştur",
      },
    },
  },
  PaymentRequestDialog: {
    any_amount: "Herhangi bir tutar",
    payment_request: {
      caption: "Ödeme talebi",
      description: "Nostr aracılığıyla ödeme al",
    },
    request_index: "İstek {index} / {total}",
    actions: {
      set_amount: {
        label: "Tutarı ayarla",
      },
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "Yeni talep",
      },
      share: {
        label: "Paylaş",
      },
      copy_request: {
        label: "İsteği kopyala",
      },
      add_amount: {
        label: "Miktar ekle",
      },
      use_active_mint: {
        label: "Herhangi bir mint",
      },
      remove_amount: {
        label: "Tutarı kaldır",
      },
      previous: {
        label: "Önceki istek",
      },
      next: {
        label: "Sonraki istek",
      },
    },
    inputs: {
      amount: {
        placeholder: "Miktar girin",
      },
    },
    received_total: "Alınan toplam",
    no_payments_yet: "Henüz ödeme yok",
  },
  NumericKeyboard: {
    actions: {
      close: {
        label: "@:global.actions.close.label",
        closed_info_text:
          "Klavye devre dışı bırakıldı. Klavyeyi ayarlardan yeniden etkinleştirebilirsiniz.",
      },
      enter: {
        label: "@:global.actions.enter.label",
      },
    },
  },
  NWCDialog: {
    nwc: {
      caption: "Nostr Cüzdan Bağlantısı",
      description:
        "NWC ile cüzdanınızı uzaktan kontrol edin. Cüzdanınızı uyumlu bir uygulamayla bağlamak için QR koduna basın.",
      warning_text:
        "Uyarı: Bu bağlantı dizesine erişimi olan herkes cüzdanınızdan ödeme başlatabilir. Paylaşmayın!",
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
    title: "Mint mesajı",
  },
  MintDetailsDialog: {
    qr: {
      show: "QR kodunu göster",
      hide: "QR kodunu gizle",
    },
    contact: {
      title: "İletişim",
    },
    details: {
      title: "Mint detayları",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Desteklenen özellikler",
        actions: {
          show: {
            label: "Tümünü görüntüle",
          },
          hide: {
            label: "Gizle",
          },
        },
      },
      currency: {
        label: "Birim",
      },
      currencies: {
        label: "@:MintDetailsDialog.details.currency.label",
      },
      version: {
        label: "Sürüm",
      },
    },
    actions: {
      title: "Eylemler",
      copy_mint_url: {
        label: "Mint URL'sini kopyala",
      },
      delete: {
        label: "Mint'i sil",
      },
      edit: {
        label: "Mint'i düzenle",
      },
    },
  },
  ChooseMint: {
    title: "Bir mint seçin",
    badge_mint_error_text: "Hata",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
    available_text: "bu mint'te",
    sheet_title: "Mint seç",
    placeholder: "Bir mint seçin",
  },
  HistoryTable: {
    empty_text: "Henüz geçmiş yok",
    empty_hint: "Gönderdiğin ve aldığın ödemeler burada görünür.",
    row: {
      type_label: "Ecash",
      date_label: "{ value } önce",
    },
    actions: {
      filter_ecash_only: {
        label: "Yalnızca ecash",
      },
      check_status: {
        tooltip_text: "Durumu kontrol et",
      },
      receive: {
        tooltip_text: "Al",
      },
      filter_pending: {
        label: "Yalnızca bekleyenleri göster",
      },
      show_all: {
        label: "Tümünü göster",
      },
    },
    old_token_not_found_error_text: "Eski token bulunamadı",
  },
  InvoiceTable: {
    empty_text: "Henüz fatura yok",
    row: {
      type_label: "Lightning",
      type_tooltip_text: "Kopyalamak için tıklayın",
      date_label: "{ value } önce",
    },
    actions: {
      check_status: {
        tooltip_text: "Durumu kontrol et",
      },
      filter_pending: {
        label: "Yalnızca bekleyenleri göster",
      },
      show_all: {
        label: "Tümünü göster",
      },
    },
  },
  RemoveMintDialog: {
    title: "Bu mint kaldırılsın mı?",
    nickname: {
      label: "Takma ad",
    },
    balances: {
      label: "Bu mint'teki bakiye",
    },
    warning_text:
      "Bu mint'teki ecash'iniz bu cihazda kalır. Mint'i tekrar eklerseniz geri gelir.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "Mint'i kaldır",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  ParseInputComponent: {
    placeholder: {
      default: "Cashu token veya Lightning adresi",
      receive: "Cashu token",
      pay: "Lightning adresi veya faturası",
    },
    qr_scanner: {
      title: "QR kodu tara",
      description: "Kameranızı bir QR koduna doğrultun",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    onchain: {
      title: "Zincir üstü öde",
      address_placeholder: "Bitcoin adresi",
      choose_speed: "Onay hızını seçin",
      blocks: "{n} blok",
      estimated_confirmation: "Tahmini onay",
      fee_reserve: "ücret rezervi",
    },
    multinut: {
      label: "Birden çok mint ile öde",
    },
    quote: {
      label: "Teklif al",
    },
    input_data: {
      title: "Lightning ile öde",
      inputs: {
        invoice_data: {
          label: "Lightning faturası veya adresi",
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
      title_bolt12: "Lightning teklifini öde",
    },
    lnurlpay: {
      amount_exact_label: "{ payee }, { value } { ticker } talep ediyor",
      amount_range_label:
        "{ payee }{br} { min } ile { max } { ticker } arasında talep ediyor",
      sending_to_lightning_address: "{ address } adresine gönderiliyor",
      inputs: {
        amount: {
          label: "Miktar ({ ticker }) *",
        },
        comment: {
          label: "Yorum (isteğe bağlı)",
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
      title: "{ value } öde",
      paying: "Ödeniyor",
      paid: "Ödendi",
      fee: "Ücret",
      memo: {
        label: "Memo",
      },
      processing_info_text: "İşleniyor…",
      balance_too_low_warning_text: "Bakiye yetersiz",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        pay: {
          label: "Öde",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
          waiting_for_wallet: "Cüzdan bekleniyor…",
          error: "Hata",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Mint'i düzenle",
    inputs: {
      nickname: {
        placeholder: "ör. Testnet",
        label: "Takma ad (isteğe bağlı)",
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
    title: "Bu mint'e güveniyor musunuz?",
    description:
      "Bu mint'e yalnızca güveniyorsanız katılın. Faaliyetini durdurursa, onda tuttuğunuz ecash kaybolur.",
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
        in_progress: "Mint ekleniyor",
      },
    },
    audit_info: {
      label: "Denetim bilgisi",
      actions: {
        show: {
          label: "Göster",
        },
        hide: {
          label: "Gizle",
        },
      },
    },
    unreachable_error_text:
      "Bu mint'e ulaşılamıyor. URL'yi ve bağlantınızı kontrol edip tekrar deneyin.",
  },
  restore: {
    mnemonic_error_text: "Lütfen bir anımsatıcı girin",
    restore_mint_error_text: "Mint geri yükleme hatası: { error }",
    prepare_info_text: "Geri yükleme süreci hazırlanıyor…",
    restored_proofs_for_keyset_info_text:
      "{ keysetId } anahtar kümesi için { restoreCounter } kanıt geri yüklendi",
    checking_proofs_for_keyset_info_text:
      "{ keysetId } anahtar kümesi için { startIndex } ila { endIndex } kanıtları kontrol ediliyor",
    no_proofs_info_text: "Geri yüklenecek kanıt bulunamadı",
    restored_amount_success_text: "{ amount } geri yüklendi",
  },
  swap: {
    in_progress_warning_text: "Takas devam ediyor",
    invalid_swap_data_error_text: "Geçersiz takas verisi",
    swap_error_text: "Takas hatası",
  },
  TokenInformation: {
    fee: "Ücret",
    unit: "Birim",
    fiat: "Fiat",
    p2pk: "P2PK",
    locked: "Kilitli",
    locked_to_you: "Size kilitli",
    mint: "Mint",
    memo: "Not",
    payment_request: "Ödeme talebi",
    nostr: "Nostr",
    token_copied: "Token panoya kopyalandı",
  },
  ActivityRow: {
    received: "Alındı",
    sent: "Gönderildi",
    receiving: "Alınıyor",
    sending: "Gönderiliyor",
  },
  common: {
    copied: "Kopyalandı",
    on_chain: "Zincir üstü",
    pending: "Bekliyor",
    delete: "Sil",
    copy_npub: "npub'u kopyala",
    back: "Geri",
    refresh: "Yenile",
    settings: "Ayarlar",
    backspace: "Geri sil",
    swap_input_mode: "Tutar/fiat giriş modunu değiştir",
    fee: "Ücret",
  },
  SendPaymentRequest: {
    actions: {
      pay: { label: "Öde" },
      pay_via: { label: "{transport} ile öde" },
    },
    info: {
      pay_failed: "İstek ödenemedi",
      pay_to: "{target} adresine öde",
      invalid_url: "Geçersiz URL",
    },
  },
  PaymentRequestInfo: {
    title_with_transport: "{transport} üzerinden ödeme talebi",
    title: "Ödeme talebi",
    subtitle: "{target} adresine öde",
    subtitle_fallback: "Ödeme talebi",
    invalid_url: "Geçersiz URL",
  },
  QuoteInformation: {
    address: "Adres",
    amount: "Tutar",
    fee_reserve: "Ücret rezervi",
    fee_paid: "Ödenen ücret",
    unit: "Birim",
    status: "Durum",
    network: "Ağ",
    transaction_id: "İşlem kimliği",
    chain_status: "Zincir durumu",
    fetching: "Alınıyor",
    paid_at: "Ödeme zamanı",
    preimage: "Ön görüntü",
    preimage_copied: "Ön görüntü kopyalandı",
    mint: "Mint",
    method: "Yöntem",
    lightning_offer: "Lightning teklifi",
    chain_confirmed: "Onaylandı",
    chain_pending: "Bekliyor",
    states: {
      waiting: "Ödeme bekleniyor",
      paid: "Ödendi",
      unpaid: "Ödenmedi",
      pending: "Bekliyor",
      issued: "Verildi",
      expired: "Süresi doldu",
      failed: "Başarısız",
    },
  },
  MintAuditInfo: {
    title: "Denetim bilgisi",
    loading: "Denetim bilgisi yükleniyor...",
    not_audited: "Bu mint henüz denetlenmedi.",
    not_audited_text:
      "Denetçi hakkında daha fazla bilgi almak veya gelecekteki bir denetimi desteklemek için {link} adresini ziyaret edin ya da {here} tıklayarak ecash bağışlayın ve bu mint'in denetiminin başlatılmasına yardım edin.",
    here: "buraya",
    unavailable: "Denetim bilgisi şu anda kullanılamıyor.",
    load_failed: "Mint verileri yüklenemedi",
    success_rate: "Başarı oranı",
    swaps_count: "{total} takastan {successful} tanesi",
    average_time: "Ortalama süre",
    average_time_caption: "Başarılı takaslar için",
    disclaimer:
      "Denetim verileri, bir mint'in zaman içindeki güvenilirliğini değerlendirmeye yardımcı olmak için bağımsız üçüncü taraflarca sağlanır. Ancak bu sonuçlar yalnızca bilgilendirme amaçlıdır ve hiçbir mint'in güvenliğini, ödeme gücünü veya güvenilirliğini garanti etmez. Hizmetlerini kullanmadan önce her zaman kendi araştırmanızı yapın ve mint işletmecisine güvendiğinizden emin olun.",
    donate_text:
      "Denetim bilgileri {link} tarafından sağlanmaktadır. Denetçinin bu mint için tuttuğu güncel bakiye {balance} olup şimdiye kadar toplam {donations} bağışlandı. Denetimin sürmesini desteklemek için {press_here} ve denetçiye ecash bağışlayabilirsiniz.",
    press_here: "buraya dokunun",
    sats_amount: "{amount} sats",
    warnings_title: "Denetçi uyarıları",
    warnings: {
      last_swap_failed: "Son takas denemesi başarısız oldu.",
      recent_success:
        "Son {days} günde {total} takastan {successful} tanesi başarılı oldu.",
      reliable:
        "{base} Ancak {success} Bu mint güvenilir görünüyor, hatalar alıcı mint'ten kaynaklanıyor olabilir.",
      unreliable: "{base} Yalnızca {success} Bu mint güvenilir olmayabilir.",
      unknown: "Denetçi bu mint'in kalitesini henüz belirleyemedi.",
      not_enough_data:
        "Denetçinin bu mint hakkında yeterli güncel verisi yok. Son {days} günde yalnızca {count} başarılı takas oldu.",
      low_success:
        "Son {days} günde bu mint'in başarı oranı yüzde {rate} oldu; bu, önerilen yüzde {threshold} oranının altında.",
      inactive: "Bu mint'te {days} gündür takas olmadı. Erişilemiyor olabilir.",
      slow: "Bu mint yavaş. Bu mint'ten yapılan ödemeler ortalama {seconds} saniye sürdü.",
      no_successful:
        "Bu mint için kayıtlı başarılı takas yok. Erişilemiyor olabilir.",
    },
    chart: {
      now: "Şimdi",
      today: "Bugün",
      yesterday: "Dün",
      invalid_date: "Geçersiz tarih",
      swaps: "Takaslar:",
      success_rate: "Başarı oranı:",
      time_range: "Zaman aralığı:",
    },
  },
  DisplayTokenComponent: {
    title: {
      send: "Ecash gönder",
      sent: "Ecash gönderildi",
      received: "Ecash alındı",
    },
    qr_speed: "QR hızı: {value}",
    qr_size: "QR boyutu: {value}",
    speed: {
      fast: "Hızlı",
      medium: "Orta",
      slow: "Yavaş",
    },
    size: {
      large: "Büyük",
      medium: "Orta",
      small: "Küçük",
    },
    delete_dialog: {
      title: "Ecash'i sil",
      text: "Bu işlemi geçmişinizden silmek istediğinizden emin misiniz?",
      warning:
        "Uyarı: Bu işlem geri alınamaz ve token'ı kurtarmanın bir yolu yoktur.",
    },
    nfc: {
      read_failed: "NFC okuma başarısız",
      write_failed: "NFC yazma başarısız",
      error: "NFC hatası",
      writing: "NFC karta yazılıyor...",
      success: "Token karta başarıyla yazıldı!",
      capacity: "Kartın kapasitesi yetersiz olabilir ({bytes} bayt gerekli).",
    },
  },
  CreateInvoiceDialog: {
    format_label: "İstek türü",
    formats: {
      bolt11: "Fatura",
      bolt12: "Teklif",
    },
    onchain_title: "Zincir üstü al",
    bolt12_title: "Bolt12 al",
    mint_unreachable: "Mint'e ulaşılamıyor",
    mint_unreachable_text: "Ödeme almak için mint'e yeniden bağlanın.",
    reconnect_mint: "Mint'e yeniden bağlan",
    checking_address: "Adres kontrol ediliyor...",
    add_amount: "Tutar ekle",
    new_offer: "Yeni teklif",
    create_offer: "Teklif oluştur",
    create_new_address: "Yeni adres oluştur",
    create_address: "Adres oluştur",
    onchain_unsupported:
      "Bu mint bu birimde zincir üstü yatırmayı desteklemiyor.",
    deposit_limits: {
      outside: "{min}–{max} aralığı dışındaki yatırmalar hesaba geçmez.",
      below: "{min} altındaki yatırmalar hesaba geçmez.",
      above: "{max} üzerindeki yatırmalar hesaba geçmez.",
    },
    amount_errors: {
      positive_decimal:
        "{unit} cinsinden en fazla iki ondalık basamaklı pozitif bir tutar girin.",
      positive_whole: "{unit} cinsinden pozitif bir tam sayı girin.",
      min: "En az {amount} girin.",
      max: "En fazla {amount} girin.",
    },
  },
};
