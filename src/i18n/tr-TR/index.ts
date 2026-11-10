export default {
  MultinutPicker: {
    dialog_title: "Birden çok mint ile ödeme",
    pay_using_multiple: "Birden çok mint kullanarak öde",
    experimental_title: "Deneysel özellik",
    experimental_text:
      "Bu özellik oldukça deneyseldir ve beklendiği gibi çalışmayabilir. Daha önce ödenmiş bir faturayı ödemeye çalışmayın. Fon kaybedebilirsiniz.",
    understand: "Anladım",
    select_funds: "Hangi mint'lerden ödeneceğini seçin.",
    pay_invoice: "Faturayı öde",
    amount_mismatch: "Tutar hesaplama hatası: {calculated} / {expected}",
    states: {
      requesting: "İsteniyor…",
      paying: "Ödeniyor…",
      success: "Başarılı",
      failed: "Başarısız",
    },
    paid: "Lightning ile {amount} ödendi",
  },

  global: {
    notifications: "Bildirimler",
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
      show_qr: {
        label: "QR kodunu göster",
      },
      show_seed: {
        label: "Kurtarma ifadesini göster",
      },
      hide_seed: {
        label: "Kurtarma ifadesini gizle",
      },
      scan: {
        label: "Tara",
      },
      more_options: {
        label: "Diğer seçenekler",
      },
      clear: {
        label: "Temizle",
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
      trying_again: "Tekrar deneniyor...",
      unsupported_legacy_qr: "Desteklenmeyen eski tip QR kodu",
      legacy_qr_not_supported:
        "Bu eski tip QR kodu desteklenen bir satıcıya ait değil",
      no_bolt12_mint:
        "Mint'lerinizin hiçbiri BOLT12 tekliflerini desteklemiyor",
      no_bolt11_mint:
        "Mint'lerinizin hiçbiri BOLT11 faturalarını desteklemiyor",
      address_not_paid: "Bu adrese henüz ödeme gelmedi",
      payment_pending: "Ödeme beklemede",
      invoice_already_paid: "Fatura zaten ödenmiş",
      payment_sent: "Ödeme gönderildi",
      payment_failed: "Ödeme başarısız oldu",
      could_not_pay_request: "İstek ödenemedi",
      request_unit_unsupported:
        "Mint, bu ödeme talebindeki birimi desteklemiyor: {unit}",
      no_onchain_mint:
        "Mint'lerinizin hiçbiri zincir üstü ödemeleri desteklemiyor",
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
        removed: "Mint kaldırıldı",
        error: "Mint hatası",
        mint_validation_error: "Mint doğrulama hatası",
      },
    },
  },
  MainHeader: {
    menu: {
      terms: {
        terms: {
          title: "Şartlar",
          caption: "Cashu.me'yi kullanarak kabul ettikleriniz",
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
  Settings: {
    menu: {
      title: "Ayarlar",
      backup: {
        title: "Yedekleme ve geri yükleme",
        caption: "Seed kelimeleri ve ecash kurtarma",
      },
      lightning_address: {
        title: "Lightning adresi",
        caption: "isim{'@'}alanadi adresinden ödeme alın",
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
        caption: "Anahtarınıza kilitli ecash alın",
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
    },
    sections: {
      nostr: {
        relays: {
          already_added: "Röle zaten eklendi",
          add: {
            title: "Röle ekle",
            description:
              "Cüzdanınız bu röleleri ödeme talepleri, Nostr Wallet Connect ve yedeklemeler gibi Nostr özellikleri için kullanır.",
          },
          list: {
            title: "Röleler",
            copy_tooltip: "Röleyi kopyala",
            remove_tooltip: "Röleyi kaldır",
          },
        },
      },
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
      },
    },
    lightning_address: {
      server_url: {
        label: "npub.cash sunucusu",
        hint: "Bir ana makine adı veya HTTPS URL'si girin",
        invalid: "Geçerli bir HTTPS sunucu URL'si girin",
      },
      title: "Lightning adresi",
      enable: {
        toggle: "Lightning adresi kullan",
        description: "npub.cash'ten alınan bir adresle ödeme alın",
      },
      address: {
        label: "Adresiniz",
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
        description:
          "Cüzdanınızın kurtarma kelimelerinden bir Nostr anahtar çifti oluşturun",
        copy_nsec: "Özel anahtarı kopyala (nsec)",
      },
      nsec_bunker: {
        title: "Uzak imzalayıcı",
        description: "NIP-46 bunker ile imzalayın",
        delete_tooltip: "Bağlantıyı sil",
      },
      use_nsec: {
        title: "Nostr özel anahtarınızı (nsec) kullanın",
        description: "Bu yöntem tehlikelidir ve önerilmez",
        delete_tooltip: "Özel anahtarı sil",
      },
      signing_extension: {
        title: "İmzalama uzantısı",
        description: "Bir NIP-07 imzalama uzantısı kullanın",
        not_found: "NIP-07 imzalama uzantısı bulunamadı",
      },
    },

    payment_requests: {
      description:
        "Nostr üzerinden ödeme alın. Açıkken cüzdanınız Nostr rölelerinizi dinler.",
      enable_toggle: "Ödeme taleplerini etkinleştir",
      claim_automatically: {
        toggle: "Otomatik olarak talep et",
        description:
          "Zaten kullandığınız mint'lerden gelen ödemeleri sormadan bakiyenize ekler. Diğer durumlarda her birini siz onaylarsınız.",
      },
    },
    nostr_wallet_connect: {
      description:
        "Diğer uygulamaların Nostr Wallet Connect (NWC) ile bu cüzdandan ödeme yapmasını, fatura oluşturmasını ve bakiyenizle geçmişinizi görmesini sağlar.",
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
      description:
        "Kilitli ecash (P2PK) almak için bir anahtar oluşturun veya içe aktarın. Deneysel: küçük tutarlar kullanın. Özel anahtarı kaybederseniz, ona kilitli ecash'e erişiminizi kaybedebilirsiniz.",
      generate_button: "Anahtar oluştur",
      import_button: "nsec içe aktar",
      quick_access: {
        toggle: "Ecash al ekranında Kilitle düğmesini göster",
        description:
          "Ecash al ekranına bir Kilitle düğmesi ekler. Gönderenlerin ecash'i size kilitleyebilmesi için bu düğmeyle açık anahtarınızı paylaşın.",
      },
      keys_expansion: {
        label: "Açık anahtarlar ({count})",
        used_badge: "kullanıldı",
      },
    },
    privacy: {
      network_title: "Ağ kontrolleri",
      description:
        "Bu kontroller arka planda çalışır. Ödemeleri güncel tutarlar, ama daha fazla çevrimiçi etkinlik cüzdanınızın parmak izini çıkarmayı kolaylaştırır. Bir kontrol kapalıyken faturaları Geçmiş'ten kendiniz kontrol edebilirsiniz.",
      check_incoming: {
        toggle: "Gelen faturayı kontrol et",
        description: "En son faturanızı arka planda kontrol eder.",
      },
      check_startup: {
        toggle: "Başlangıçta bekleyen faturaları kontrol et",
        description: "Cüzdan açıldığında bekleyen faturaları kontrol eder.",
      },
      check_all: {
        toggle: "Tüm faturaları kontrol et",
        description:
          "Ödenmemiş faturaları iki haftaya kadar arka planda kontrol eder.",
      },
      check_sent: {
        toggle: "Gönderilen ecash'i kontrol et",
        description:
          "Gönderilen ecash'in alınıp alınmadığını arka planda kontrol eder.",
      },
      websockets: {
        toggle: "WebSockets kullan",
        description:
          "Ödemeler ve harcanan ecash ile ilgili güncellemeler için mint'lerle canlı bağlantı tutar.",
      },
      bitcoin_price: {
        title: "Bitcoin fiyatı",
        toggle: "Döviz kurunu Coinbase'den al",
        description:
          "Bakiyenizi itibari parayla göstermek için bitcoin fiyatını coinbase.com'dan alır.",
        currency: {
          title: "İtibari para birimi",
          description: "Bitcoin fiyatı için fiat para birimini seçin.",
        },
      },
    },
    experimental: {
      receive_swaps: {
        toggle: "Takasları al",
        badge: "Beta",
        description: "Alınan ecash'i etkin mint'inize takas etmeyi önerir.",
      },
      auto_paste: {
        toggle: "Ecash'i otomatik yapıştır",
        description:
          "Token yapıştır'a dokunduğunuzda panodaki ecash'i yapıştırır. iOS'ta görüntü sorunlarına yol açarsa kapatın.",
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
        description:
          "Lightning faturası öderken “Birden çok mint ile öde” seçeneğini ekler.",
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
        reserved_unset: "Tüm kanıt ayırmaları kaldırıldı",
        removed_spent: "Kaldırılan harcanmış kanıt sayısı: {count}",
        no_spent: "Harcanmış kanıt bulunamadı",
        invalid_backup: "Geçersiz yedek dosyası biçimi",
        read_error: "Dosya okunurken hata oluştu",
      },
      developer: {
        title: "Geliştirici ayarları",
        description: "Sorun giderme ve hata ayıklama araçları.",
        new_seed: {
          button: "Yeni kurtarma kelimeleri oluştur",
          description:
            "Yeni kurtarma kelimeleri oluşturur. Mevcut ecash'iniz eskilerine bağlı kalır: ardından tüm bakiyenizi kendinize gönderin, yoksa yeni kelimeler onu geri yükleyemez.",
          confirm_question:
            "Yeni bir kurtarma kelimesi oluşturmak istediğinizden emin misiniz?",
          cancel: "İptal",
          confirm: "Onayla",
        },
        remove_spent: {
          button: "Harcanmış kanıtları kaldır",
          description:
            "Etkin mint'in harcanmış bildirdiği, seçili birimdeki ecash'i kaldırır. Yalnızca cüzdanınız takılırsa kullanın.",
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
            "Etkin mint'in seçili birimdeki bakiyesini tek bir ecash token'ı olarak panoya kopyalar. Kalanı için mint'i veya birimi değiştirip yeniden dışa aktarın.",
        },
        keyset_counters: {
          title: "Anahtar kümesi sayaçlarını artır",
          increase: "{id} için sayacı artır",
          fixes:
            "“outputs have already been signed” hatasını gidermeye yardımcı olabilir",
          keysets: "{n} keyset | {n} keyset",
          sheet_hint:
            "Bir keyset'in sayacını artırmak için + simgesine dokunun.",
          column: "Sayaç",
        },

        unset_reserved: {
          button: "Tüm ayrılmış token'ları kaldır",
          description:
            "Bekleyen gönderimler için ayrılmış ecash'i serbest bırakır, böylece tekrar harcanabilir. Cüzdanınız bunun ardından harcanmış ecash içerebilir: sonrasında “Harcanmış kanıtları kaldır” işlemini çalıştırın.",
        },
        show_onboarding: {
          button: "Başlangıç ekranını göster",
          description: "Başlangıç ekranını tekrar gösterin.",
        },
        reset_wallet: {
          button: "Cüzdan verilerini sıfırla",
          description:
            "Ecash'iniz dahil bu cüzdandaki her şeyi siler. Önce bir yedek oluşturun.",
          confirm_question:
            "Cüzdan verilerinizi silmek istediğinizden emin misiniz?",
          cancel: "İptal",
          confirm: "Cüzdanı sil",
        },
        export_wallet: {
          button: "Cüzdan verilerini dışa aktar",
          description:
            "Karşılama ekranında içe aktarabileceğiniz bir yedek dosyası indirir. Cüzdanı yeniden kullandığınız anda güncelliğini yitirir.",
        },
        import_wallet: {
          description:
            "Dışa aktarılmış bir yedek dosyasını içe aktarır. Yedekteki ayarlar ve kayıtlar bu cüzdandakilerin üzerine yazılır; yedekte olmayanlar olduğu gibi kalır.",
          button: "Cüzdan yedeğini içe aktar",
          confirm_question: "Bu yedek cüzdana aktarılsın mı?",
          cancel: "İptal",
          confirm: "Cüzdan yedeğini içe aktar",
        },
      },
    },

    web_of_trust: {
      title: "Güven ağı",
      known_pubkeys: "Bilinen açık anahtarlar: {wotCount}",

      continue_crawl: "Taramaya devam et",
      crawl_odell: "Odell'in güven ağını tara",
      crawl_wot: "Web of trust tara",
      pause: "Duraklat",
      reset: "Sıfırla",
      progress: "{crawlProcessed} / {crawlTotal}",
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
    panel: {
      expand: "Geçmişi ve mint'leri göster",
      collapse: "Geçmişi ve mint'leri gizle",
    },
    tabs: {
      history: {
        label: "Geçmiş",
      },
      mints: {
        label: "Mint'ler",
      },
    },
    install: {
      text: "Yükle",
      tooltip: "Cashu.me'yi yükle",
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
    title: "Bu sayfa mevcut değil",
    text: "404",
    actions: {
      home: {
        label: "Ana sayfaya geri dön",
      },
    },
  },
  BalanceView: {
    total_label: "Toplam bakiye",
    show_balance: "{unit} bakiyesini göster",
    mintError: {
      label: "Mint hatası",
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
    terms_agreement: "Devam ederek {terms} metnini kabul etmiş olursunuz.",
    title: "Cashu.me'ye hoş geldiniz",
    text: "Cashu.me, fonlarınızı güvenli ve gizli tutmak için ecash kullanan ücretsiz ve açık kaynaklı bir Bitcoin cüzdanıdır.",
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
          text: "Menüye dokunun (sağ üst)",
        },
        step2: {
          text: "{ buttonText }'e basın",
          buttonText: "@:PwaPrompt.android.add",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          text: "Paylaş'a dokunun (alt)",
        },
        step2: {
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
        text: "Cashu.me'yi PWA olarak kullanıyorsunuz. Diğer açık tarayıcı pencerelerini kapatın ve uygulamayı ana ekranınızdan kullanın.",
        nextSteps:
          "Artık bu sekmeyi kapatıp uygulamayı ana ekranınızdan açabilirsiniz.",
      },
    },
  },
  PwaPrompt: {
    title: "Cashu.me'yi yükle",
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
    progress: { words_entered: "{count}/12 kelime girildi" },
    disclaimer:
      "Seed ifadeniz yalnızca yerelde cüzdan anahtarlarını türetmek için kullanılır.",
  },
  WelcomeRestoreEcash: {
    title: "Ecash'inizi geri yükleyin",
    text: "Eklediğiniz mint'lerde harcanmamış ecash'i bulun ve cüzdanınıza geri yükleyin.",
  },
  MintRatings: {
    sort_and_filter: "Sırala ve filtrele",
    reviews_title: "Yorumlar",
    reviews_count: "{n} yorum | {n} yorum",
    web_of_trust_caption: "Yalnızca güven ağınızdaki yorumları göster",
    web_of_trust_hop: "Güven ağınızda ({hop}. adım)",
    no_mint_url: "Mint URL'si belirtilmedi",
    reviews: "yorum",
    no_reviews: "Yorum bulunamadı",
    your_review: "Yorumunuz",
    no_rating: "Puan yok",
    stars_label: "5 yıldızdan {rating}",
    out_of: "{max} üzerinden",
    sort: "Sırala",
    sort_options: {
      newest: "En yeni",
      oldest: "En eski",
      highest: "En yüksek",
      lowest: "En düşük",
    },
    actions: { write_review: "Yorum yaz" },
    empty_state_subtitle:
      "Başkalarının seçim yapmasına yardımcı olmak için bu mint'le ilgili deneyiminizi paylaşın.",
    range: "{from}–{to} / {total}",
  },
  CreateMintReview: {
    connect_nostr:
      "Değerlendirme yayımlamak için Ayarlar'dan bir Nostr hesabı bağlayın.",
    published: "Değerlendirme yayımlandı",
    publish_failed: "Değerlendirme yayımlanamadı",
    title: "Mint'i değerlendir",
    publishing_as: "Şu kişi olarak yayımlanıyor:",
    inputs: {
      rating: {
        label: "Puan",
        hint: "Yorumunuzu yayımlamak için bir puan seçin.",
      },
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
        "Geri yüklemeden önce bu kurtarma ifadesiyle kullandığınız tüm mint'leri ekleyin.",
      inputs: {
        seed_phrase: {
          label: "Kurtarma kelimeleri",
        },
      },
    },
    information: {
      caption:
        "Bu işlem yalnızca başka bir kurtarma kelimesinden ecash kurtarır; bu cüzdanın kurtarma kelimesini değiştirmez. Geri yüklenen ecash'i mevcut kurtarma kelimenizle korumak için sonrasında onu bir kez kendinize gönderin.",
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
      add_selected: "Seçilenleri ekle ({count})",
      no_backups_found: "Mint yedeği bulunamadı",
      no_backups_hint:
        "Mint listesi yalnızca bu kurtarma ifadesiyle daha önce alınmış bir yedekten geri yüklenebilir. Sonraki değişiklikleri kaydetmek için Ayarlar'da Nostr mint yedeğini açın.",
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
        error: "Mint geri yükleme hatası: { error }",
      },
      restore_selected_mints: {
        label: "Seçili mint'leri geri yükle ({count})",
        success: "Geri yüklenen mint sayısı: {count}",
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
      caption: "Başkalarının Nostr'da önerdiği mint'ler.",
      actions: {
        discover: {
          label: "Mint'leri keşfet",
          in_progress: "Yükleniyor…",
        },
      },
      add: "Ekle",
      empty: {
        title: "Bir mint bulun",
        text: "Cashu.me, başkalarının önerdiği mint'leri puanları ve yorumlarıyla birlikte Nostr rölelerinden sorgular.",
      },
      recommendations: {
        overline: "{ length } mint bulundu",
        caption: "Bir mint'i kullanmadan önce kendi araştırmanızı yapın.",
      },
    },
    swap: {
      title: "Değiştir",
      caption:
        "Lightning ile mint'leriniz arasında para taşıyın. Lightning ücretleri için pay bırakın. Para ulaşmazsa Geçmiş'teki bekleyen faturayı kontrol edin.",
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
      },
    },
    error_badge: "Hata",
    switching_mint: "Geçiliyor: {mint}",
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
    actions: {
      create: {
        label: "Fatura oluştur",
        label_blocked: "Oluşturuluyor…",
      },
    },
    invoice: {
      caption: "Lightning faturası",
      status_paid_text: "Ödendi",
      actions: {
        copy: {
          label: "Faturayı kopyala",
        },
      },
    },
  },
  SendDialog: {
    captions: {
      ecash: "Token veya QR kod paylaşın",
      lightning: "Faturaya veya adrese ödeme yapın",
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
    inputs: {
      p2pk_pubkey: {
        label: "Alıcının genel anahtarı",
        invalid: "Geçerli bir açık anahtar girin (hex veya npub)",
      },
    },
    actions: {
      copy_emoji: {
        tooltip_text: "Emojiyi kopyala",
      },
      copy_tokens: {
        label: "Token'ı kopyala",
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
          ndef_supported_text: "NFC karta yaz",
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
      receive: {
        label: "@:global.actions.receive.label",
        label_known_mint: "@:ReceiveTokenDialog.actions.receive.label",
        label_adding_mint: "Mint ekleniyor…",
      },
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "Güvenilen bir mint'e takas et",
        processing: "Takas yapılıyor…",
        failed: "Takas başarısız",
      },
      cancel_swap: {
        tooltip_text: "Takası iptal et",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
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
      caption: "Kilit anahtarınız",
      description: "Bu anahtara kilitlenmiş ecash al",
      used_warning_text:
        "Uyarı: Bu anahtar daha önce kullanıldı. Daha iyi gizlilik için yeni bir anahtar kullanın.",
    },
    actions: {
      copy: {
        label: "Açık anahtarı kopyala",
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
    },
    request_index: "İstek {index} / {total}",
    actions: {
      set_amount: {
        label: "Tutarı ayarla",
      },
      copy: {
        label: "@:global.actions.copy.label",
      },
      new_request: {
        label: "Yeni talep",
      },
      share: {
        label: "Paylaş",
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
      email: "E-posta",
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
        label: "Mint'i kaldır",
      },
      edit: {
        label: "Mint'i düzenle",
      },
    },
    nuts: {
      nut7: "Token durumu kontrolü",
      nut8: "Fazla ödenen Lightning ücretleri",
      nut9: "İmza geri yükleme",
      nut10: "Harcama koşulları",
      nut11: "Pay-to-Pubkey (P2PK)",
      nut12: "DLEQ kanıtları",
      nut13: "Deterministik sırlar",
      nut14: "Hash'li zaman kilitli sözleşmeler (HTLC)",
      nut15: "Kısmi çok yollu ödemeler",
      nut16: "Animasyonlu QR kodları",
      nut17: "WebSocket abonelikleri",
      nut18: "Ödeme talepleri",
      nut19: "Önbelleğe alınmış yanıtlar",
      nut20: "Mint teklifinde imza",
      nut21: "Açık kimlik doğrulama",
      nut22: "Kör kimlik doğrulama",
    },
  },
  UnitToggle: {
    label: "Birim: {unit}, değiştir",
    bitcoin: "Bitcoin",
  },
  ChooseMint: {
    open_selector: "Mint seç, geçerli mint: {mint}",
    open_selector_empty: "Mint seç",
    title: "Bir mint seçin",
    badge_mint_error_text: "Hata",
    available_text: "bu mint'te",
    sheet_title: "Mint seç",
    placeholder: "Bir mint seçin",
  },
  HistoryTable: {
    empty_text: "Henüz geçmiş yok",
    empty_hint: "Gönderdiğiniz ve aldığınız ödemeler burada görünür.",
    filters: {
      title: "Geçmişi filtrele",
      direction: "Yön",
      type: "Tür",
      completed: "Tamamlandı",
      received: "Alındı",
      sent: "Gönderildi",
      reset: "Sıfırla",
      clear_all: "Tümünü temizle",
      remove: "Filtreyi kaldır: {label}",
      empty_title: "Bu filtrelere uyan ödeme yok",
      clear: "Filtreleri temizle",
      count: "{shown} / {total}",
      active: "Geçmişi filtrele, {count} etkin",
    },
    row: {
      type_label: "Ecash",
    },
    actions: {
      check_status: {
        tooltip_text: "Durumu kontrol et",
      },
      receive: {
        tooltip_text: "Al",
      },
    },
    old_token_not_found_error_text: "Eski token bulunamadı",
    labels: {
      onchain_subpayment: "Zincir üstü alt ödeme",
      bolt12_subpayment: "BOLT12 alt ödemesi",
    },
  },
  InvoiceTable: {
    row: {
      type_label: "Lightning",
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
      caption_address: "Bir adresi taramak için dokunun",
      caption_token: "Bir token taramak için dokunun",
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
      blocks: "{n} blok | {n} blok",
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
      title_bolt12: "Lightning teklifini öde",
    },
    lnurlpay: {
      amount_exact_label: "{ payee }, { value } { ticker } talep ediyor",
      amount_range_label:
        "{ payee }{br} { min } ile { max } { ticker } arasında talep ediyor",
      sending_to_lightning_address: "{ address } adresine gönderiliyor",
      inputs: {
        comment: {
          label: "Yorum (isteğe bağlı)",
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
        },
      },
    },
  },
  EditMintDialog: {
    title: "Mint'i düzenle",
    inputs: {
      nickname: {
        label: "Takma ad (isteğe bağlı)",
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
    title: "Bu mint'e güveniyor musunuz?",
    description:
      "Bu mint'i yalnızca güveniyorsanız ekleyin. Faaliyetini her an durdurabilir ve onda tuttuğunuz ecash'i kaybedebilirsiniz.",
    actions: {
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
    token: "Token",
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
    enter_amount_in: "Tutarı {fiat} cinsinden gir",
    something_went_wrong: "Bir şeyler ters gitti",
  },
  SendPaymentRequest: {
    actions: {
      pay: { label: "Öde" },
      pay_via: { label: "{transport} ile öde" },
    },
    info: {
      pay_failed: "İstek ödenemedi",
      no_ecash: "Bu ödeme talebi için kullanılabilir ecash yok",
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
    invoice: "Fatura",
    request: "İstek",
    amount: "Tutar",
    fee_reserve: "Ücret rezervi",
    fee_paid: "Ödenen ücret",
    unit: "Birim",
    status: "Durum",
    network: "Ağ",
    transaction_id: "İşlem kimliği",
    explorer: "Blok gezgini",
    confirmations: "Onaylar",
    paid_at: "Ödeme zamanı",
    preimage: "Ön görüntü",
    preimage_copied: "Ön görüntü kopyalandı",
    mint: "Mint",
    method: "Yöntem",
    lightning_offer: "Lightning teklifi",
    states: {
      waiting: "Ödeme bekleniyor",
      confirming: "Onaylanıyor ({count}/{threshold})",
      issuing: "Ecash veriliyor",
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
    loading: "Denetim bilgisi yükleniyor…",
    not_audited: "Bu denetçinin bu mint hakkında verisi yok.",
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
        "Denetçinin bu mint hakkında yeterli güncel verisi yok. Son {days} günde yalnızca {count} başarılı takas oldu. | Denetçinin bu mint hakkında yeterli güncel verisi yok. Son {days} günde yalnızca {count} başarılı takas oldu.",
      low_success:
        "Son {days} günde bu mint'in başarı oranı yüzde {rate} oldu; bu, önerilen yüzde {threshold} oranının altında.",
      inactive:
        "Bu mint'te {days} gündür takas olmadı. Erişilemiyor olabilir. | Bu mint'te {days} gündür takas olmadı. Erişilemiyor olabilir.",
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
    qr_density: "QR yoğunluğu: {value}",
    speed: {
      fast: "Hızlı",
      medium: "Orta",
      slow: "Yavaş",
    },
    density: {
      high: "Yüksek",
      medium: "Orta",
      low: "Düşük",
    },
    delete_dialog: {
      title: "Geçmişten silinsin mi?",
      text: "Bu işlemi geçmişinizden silmek istediğinizden emin misiniz?",
      warning:
        "Uyarı: Bu işlem geri alınamaz ve token'ı kurtarmanın bir yolu yoktur.",
    },
    nfc: {
      read_failed: "NFC okuma başarısız",
      write_failed: "NFC yazma başarısız",
      error: "NFC hatası",
      writing: "NFC karta yazılıyor…",
      success: "Token NFC karta yazıldı",
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
    bolt12_title: "Lightning teklifi al",
    mint_unreachable: "Mint'e ulaşılamıyor",
    mint_unreachable_text: "Ödeme almak için mint'e yeniden bağlanın.",
    reconnect_mint: "Mint'e yeniden bağlan",
    checking_address: "Adres kontrol ediliyor…",
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
  storage: {
    notifications: {
      unrecognized_backup: "Tanınmayan yedek biçimi",
      backup_restored: "Yedek geri yüklendi",
      backup_exported: "Cüzdan yedeği dışa aktarıldı",
      quota_exceeded:
        "Tarayıcı depolaması dolu veya kullanılamıyor. Yeni cüzdan verileri kaydedilmeyebilir. Cüzdanınızı şimdi yedekleyin.",
      cleaned_up: "{size} bayt temizlendi",
    },
  },
  receiveTokens: {
    notifications: {
      already_in_history: "Ecash zaten geçmişte",
      nfc_read_failed: "NFC etiketinden veri okunamıyor",
      scan_error: "Tarama hatası",
      nfc_error: "NFC hatası",
    },
  },
  nostrMintBackup: {
    notifications: {
      no_relays: "Yapılandırılmış Nostr rölesi yok",
      backup_failed: "Mint listeniz Nostr'a yedeklenemedi",
      backed_up: "Mint listesi Nostr'a yedeklendi",
      found:
        "Nostr yedeklerinde {count} mint bulundu | Nostr yedeklerinde {count} mint bulundu",
      none_found: "Bu kurtarma ifadesi için Nostr'da mint yedeği bulunamadı",
      search_failed: "Mint yedekleri aranamadı",
      add_mint_failed: "{mint} eklenemedi",
      added:
        "Cüzdanınıza {count} mint eklendi | Cüzdanınıza {count} mint eklendi",
      none_added: "Yeni mint eklenmedi",
      add_selected_failed: "Seçili mint'ler eklenemedi",
    },
  },
  nostr: {
    notifications: {
      nip04_published: "Mesaj Nostr'da yayımlandı",
      nip04_failed: "Mesaj Nostr'da yayımlanamadı",
      nip17_failed: "Mesaj Nostr'da yayımlanamadı",
      receive_failed: "Gelen ödeme alınamadı",
      ecash_already_in_history: "Ecash zaten geçmişte",
      ecash_added: "Ecash geçmişe eklendi",
    },
  },
  nwc: {
    notifications: {
      melt_quote_failed: "NWC: Mint'ten ödeme teklifi alınamadı",
      unit_must_be_sat: "NWC: Etkin birim sat olmalıdır",
      allowance_exceeded: "NWC: Ödenek aşıldı",
    },
  },
  npubcash: {
    notifications: {
      could_not_update_mint: "npub.cash mint'i güncellenemedi",
      add_mint_first: "Önce {mint} öğesini cüzdanınıza ekleyin",
    },
  },
};
