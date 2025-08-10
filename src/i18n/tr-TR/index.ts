export default {
  copied_to_clipboard: "Copied to clipboard!",
  copy_failed: "Copy failed",
  global: {
    copy_to_clipboard: {
      success: "Panoya kopyalandı!",
    },
    actions: {
      add_mint: {
        label: "Nane ekle",
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
      ok: {
        label: "OK",
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
      creatorHub: {
        publish: "Publish Profile",
        profileHeader: "Profile details",
      },
      swap: {
        label: "Değiştir",
      },
      update: {
        label: "Güncelle",
      },
    },
    inputs: {
      mint_url: {
        label: "Nane URL'si",
      },
    },
  },
  wallet: {
    notifications: {
      balance_too_low: "Bakiye çok düşük",
      received: "{amount} alındı",
      fee: " (ücret: {fee})",
      could_not_request_mint: "Nane isteği yapılamadı",
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
      nostr_dm_sent: "Nostr DM gönderildi",
      nostr_dm_failed: "Nostr DM gönderilemedi",
    },
    mint: {
      notifications: {
        already_added: "Nane zaten eklenmiş",
        added: "Nane eklendi",
        not_found: "Nane bulunamadı",
        activation_failed: "Nane etkinleştirmesi başarısız oldu",
        no_active_mint: "Aktif nane yok",
        unit_activation_failed: "Birim etkinleştirmesi başarısız oldu",
        unit_not_supported: "Birim nane tarafından desteklenmiyor",
        activated: "Nane etkinleştirildi",
        could_not_connect: "Naneye bağlanılamadı",
        could_not_get_info: "Nane bilgisi alınamadı",
        could_not_get_keys: "Nane anahtarları alınamadı",
        could_not_get_keysets: "Nane anahtar setleri alınamadı",
        removed: "Nane kaldırıldı",
        error: "Nane hatası",
      },
    },
    signer_connected: "Nostr imzalayıcı bağlandı",
  },
  MainHeader: {
    menu: {
      wallet: { title: "@:FullscreenHeader.actions.back.label" },
      nostrMessenger: { title: "@:AboutPage.siteOverview.nostrMessengerTitle" },
      restore: { title: "@:AboutPage.siteOverview.restoreTitle" },
      alreadyRunning: { title: "@:AboutPage.siteOverview.alreadyRunningTitle" },
      welcome: { title: "@:AboutPage.siteOverview.welcomeTitle" },
      nostrLogin: { title: "@:AboutPage.siteOverview.nostrLoginTitle" },
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
          caption: "Hizmet Şartları",
        },
      },
      about: {
        title: "About",
        about: { title: "About", caption: "About this app" },
      },
      links: {
        title: "Bağlantılar",
        fundstrCreator: {
          title: "Fundstr'nin Kurucusu",
          caption: "primal.net/KalonAxiarch",
        },
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
    language: {
      title: "Dil",
      description: "Lütfen aşağıdaki listeden tercih ettiğiniz dili seçin.",
    },
    sections: {
      backup_restore: "YEDEKLE & GERİ YÜKLE",
      lightning_address: "LIGHTNING ADRESİ",
      nostr_keys: "NOSTR ANAHTARLARI",
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
          "Geri yükleme sihirbazı, kayıp ecash'inizi anımsatıcı kurtarma kelimelerinden kurtarmanıza olanak tanır. Mevcut cüzdanınızın kurtarma kelimeleri etkilenmeyecektir, sihirbaz yalnızca başka bir kurtarma kelimesinden ecash'i geri yüklemenizi sağlayacaktır.",
        button: "Geri Yükle",
      },
    },
    lightning_address: {
      title: "Lightning adresi",
      description: "Lightning adresinize ödeme alın.",
      enable: {
        toggle: "Etkinleştir",
        description: "npub.cash ile Lightning adresi",
      },
      address: {
        copy_tooltip: "Lightning adresini kopyala",
      },
      automatic_claim: {
        toggle: "Otomatik olarak talep et",
        description: "Gelen ödemeleri otomatik olarak alın.",
      },
    },
    nostr_keys: {
      title: "Nostr anahtarlarınız",
      description: "Lightning adresiniz için nostr anahtarlarını ayarlayın.",
      wallet_seed: {
        title: "Cüzdan kurtarma kelimeleri",
        description:
          "Cüzdan kurtarma kelimelerinden nostr anahtar çifti oluştur",
        copy_nsec: "nsec'i kopyala",
      },
      nsec_bunker: {
        title: "Nsec Bunker",
        description: "Bir NIP-46 bunker kullanın",
        delete_tooltip: "Bağlantıyı sil",
      },
      use_nsec: {
        title: "nsec'inizi kullanın",
        description: "Bu yöntem tehlikelidir ve önerilmez",
        delete_tooltip: "nsec'i sil",
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
        "Ödeme talepleri, nostr aracılığıyla ödeme almanıza olanak tanır. Bunu etkinleştirirseniz, cüzdanınız nostr rölelerinize abone olacaktır.",
      enable_toggle: "Ödeme Taleplerini Etkinleştir",
      claim_automatically: {
        toggle: "Otomatik olarak talep et",
        description: "Gelen ödemeleri otomatik olarak alın.",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Cüzdan Bağlantısı (NWC)",
      description:
        "NWC'yi kullanarak cüzdanınızı başka herhangi bir uygulamadan kontrol edin.",
      enable_toggle: "NWC'yi Etkinleştir",
      payments_note:
        "NWC'yi yalnızca Bitcoin bakiyenizden ödemeler için kullanabilirsiniz. Ödemeler etkin nanenizden yapılacaktır.",
      connection: {
        copy_tooltip: "Bağlantı dizesini kopyala",
        qr_tooltip: "QR kodunu göster",
        allowance_label: "Kalan ödenek (sat)",
      },
      relays: {
        expand_label: "Röleleri düzenlemek için tıklayın",
        add: {
          title: "Röle ekle",
          description:
            "Nostr Cüzdan Bağlantısı, cüzdanınızı diğer uygulamalara bağlamak için nostr rölelerini kullanır.",
        },
        list: {
          title: "Röleler",
          description: "Cüzdanınız bu rölelere bağlanacaktır.",
          copy_tooltip: "Röleyi kopyala",
          remove_tooltip: "Röleyi kaldır",
        },
      },
    },
    hardware_features: {
      webnfc: {
        title: "WebNFC",
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
          title: "Ham İkilik",
          description:
            "Base64 yerine ham baytlar. Token'ları yaklaşık %33 daha kısa yapar.",
        },
        quick_access: {
          toggle: "NFC'ye hızlı erişim",
          description:
            "Ecash Al menüsünde NFC kartlarını hızlıca tarayın. Bu seçenek Ecash Al menüsüne bir NFC düğmesi ekler.",
        },
      },
    },
    p2pk_features: {
      title: "P2PK",
      description:
        "P2PK kilitli ecash almak için bir anahtar çifti oluşturun. Uyarı: Bu özellik deneyseldir. Yalnızca küçük miktarlarla kullanın. Özel anahtarlarınızı kaybederseniz, artık kimse ona kilitlenmiş ecash'in kilidini açamaz.",
      generate_button: "Anahtar oluştur",
      import_button: "nsec'i içe aktar",
      quick_access: {
        toggle: "Kilitlemeye hızlı erişim",
        description:
          "Bunu, P2PK kilitleme anahtarınızı ecash alma menüsünde hızlıca göstermek için kullanın.",
      },
      keys_expansion: {
        label: "{count} anahtara göz atmak için tıklayın",
        used_badge: "kullanıldı",
      },
    },
    privacy: {
      title: "Gizlilik",
      description: "Bu ayarlar gizliliğinizi etkiler.",
      check_incoming: {
        toggle: "Gelen faturayı kontrol et",
        description:
          "Etkinleştirilirse, cüzdan arka planda en son faturayı kontrol edecektir. Bu, parmak izi almayı kolaylaştıran cüzdanın tepkiselliğini artırır. Ödenmemiş faturaları Faturalar sekmesinde manuel olarak kontrol edebilirsiniz.",
      },
      check_startup: {
        toggle: "Başlangıçta bekleyen faturaları kontrol et",
        description:
          "Etkinleştirilirse, cüzdan başlangıçta son 24 saat içindeki bekleyen faturaları kontrol edecektir.",
      },
      check_all: {
        toggle: "Tüm faturaları kontrol et",
        description:
          "Etkinleştirilirse, cüzdan iki haftaya kadar ödenmemiş faturaları arka planda periyodik olarak kontrol edecektir. Bu, parmak izi almayı kolaylaştıran cüzdanın çevrimiçi aktivitesini artırır. Ödenmemiş faturaları Faturalar sekmesinde manuel olarak kontrol edebilirsiniz.",
      },
      check_sent: {
        toggle: "Gönderilen ecash'i kontrol et",
        description:
          "Etkinleştirilirse, cüzdan gönderilen token'ların kullanılıp kullanılmadığını belirlemek için periyodik arka plan kontrollerini kullanacaktır. Bu, parmak izi almayı kolaylaştıran cüzdanın çevrimiçi aktivitesini artırır.",
      },
      websockets: {
        toggle: "WebSockets kullan",
        description:
          "Etkinleştirilirse, cüzdan ödenen faturalar ve nane'lerden harcanan token'larla ilgili güncellemeleri almak için uzun ömürlü WebSocket bağlantıları kullanacaktır. Bu, cüzdanın tepkiselliğini artırır ancak parmak izi almayı da kolaylaştırır.",
      },
      bitcoin_price: {
        toggle: "Döviz kurunu Coinbase'den al",
        description:
          "Etkinleştirilirse, güncel Bitcoin döviz kuru coinbase.com'dan alınacak ve dönüştürülmüş bakiyeniz görüntülenecektir.",
      },
    },
    experimental: {
      title: "Deneysel",
      description: "Bu özellikler deneyseldir.",
      receive_swaps: {
        toggle: "Takasları al",
        badge: "Beta",
        description:
          "Ecash Al iletişim kutusunda alınan Ecash'i etkin nanenizle takas etme seçeneği.",
      },
      auto_paste: {
        toggle: "Ecash'i otomatik yapıştır",
        description:
          "Al, sonra Ecash, sonra Yapıştır düğmesine bastığınızda panonuzdaki ecash'i otomatik olarak yapıştırın. Otomatik yapıştırma iOS'ta UI hatalarına neden olabilir, sorun yaşıyorsanız kapatın.",
      },
      auto_redeem_locked: {
        toggle: "Kilitli tokenları otomatik kullan",
        description:
          "Etkinleştirilirse, cüzdan kilidi açıldığında tokenları otomatik olarak kullanır.",
      },
      auditor: {
        toggle: "Denetleyiciyi etkinleştir",
        badge: "Beta",
        description:
          "Etkinleştirilirse, cüzdan nane detayları iletişim kutusunda denetleyici bilgilerini görüntüler. Denetleyici, nane'lerin güvenilirliğini izleyen üçüncü taraf bir hizmettir.",
        url_label: "Denetleyici URL'si",
        api_url_label: "Denetleyici API URL'si",
      },
    },
    appearance: {
      keyboard: {
        title: "Ekran klavyesi",
        description: "Miktarları girmek için sayısal klavyeyi kullanın.",
        toggle: "Sayısal klavye kullan",
        toggle_description:
          "Etkinleştirilirse, miktarları girmek için sayısal klavye kullanılacaktır.",
      },
      theme: {
        title: "Görünüm",
        description: "Cüzdanınızın görünümünü değiştirin.",
        tooltips: {
          mono: "mono",
          cyber: "siber",
          freedom: "özgürlük",
          nostr: "nostr",
          bitcoin: "bitcoin",
          mint: "nane",
          nut: "ceviz",
          blu: "mavi",
          flamingo: "flamingo",
          modern: "modern",
        },
      },
    },
    advanced: {
      title: "Gelişmiş",
      developer: {
        title: "Geliştirici ayarları",
        description: "Aşağıdaki ayarlar geliştirme ve hata ayıklama içindir.",
        new_seed: {
          button: "Yeni kurtarma kelimeleri oluştur",
          description:
            "Bu, yeni bir kurtarma kelimesi oluşturacaktır. Yeni bir kurtarma kelimesiyle geri yükleyebilmek için tüm bakiyenizi kendinize göndermelisiniz.",
          confirm_question:
            "Yeni bir kurtarma kelimesi oluşturmak istediğinizden emin misiniz?",
          cancel: "İptal",
          confirm: "Onayla",
        },
        remove_spent: {
          button: "Harcanmış kanıtları kaldır",
          description:
            "Etkin nane'lerinizden ecash token'larının harcanıp harcanmadığını kontrol edin ve harcananları cüzdanınızdan kaldırın. Bunu yalnızca cüzdanınız takılı kalırsa kullanın.",
        },
        debug_console: {
          button: "Hata Ayıklama Konsolunu Aç/Kapat",
          description:
            "Javascript hata ayıklama terminalini açın. Anlamadığınız hiçbir şeyi bu terminale yapıştırmayın. Bir hırsız sizi buraya kötü amaçlı kod yapıştırmaya kandırmaya çalışabilir.",
        },
        export_proofs: {
          button: "Aktif kanıtları dışa aktar",
          description:
            "Aktif nane'den tüm bakiyenizi bir Cashu token'ı olarak panonuza kopyalayın. Bu yalnızca seçilen nane ve birimin token'larını dışa aktaracaktır. Tam bir dışa aktarma için farklı bir nane ve birim seçin ve tekrar dışa aktarın.",
        },
        keyset_counters: {
          title: "Anahtar kümesi sayaçlarını artır",
          description:
            'Cüzdanınızdaki anahtar kümeleri için türetme yolu sayaçlarını artırmak için anahtar kümesi kimliğine tıklayın. Bu, "çıktılar zaten imzalandı" hatasını görüyorsanız yararlıdır.',
        },
        unset_reserved: {
          button: "Tüm ayrılmış token'ları kaldır",
          description:
            "Bu cüzdan, çifte harcama girişimlerini önlemek için bekleyen giden ecash'i ayrılmış olarak işaretler (ve bakiyenizden düşer). Bu düğme tüm ayrılmış token'ları kaldıracaktır, böylece tekrar kullanılabilirler. Bunu yaparsanız, cüzdanınız harcanmış kanıtlar içerebilir. Onlardan kurtulmak için \"Harcanmış kanıtları kaldır\" düğmesine basın.",
        },
        show_onboarding: {
          button: "Başlangıç ekranını göster",
          description: "Başlangıç ekranını tekrar gösterin.",
        },
        reset_wallet: {
          button: "Cüzdan verilerini sıfırla",
          description:
            "Cüzdan verilerinizi sıfırlayın. Uyarı: Bu her şeyi siler! Önce bir yedek oluşturduğunuzdan emin olun.",
          confirm_question:
            "Cüzdan verilerinizi silmek istediğinizden emin misiniz?",
          cancel: "İptal",
          confirm: "Cüzdanı sil",
        },
        export_wallet: {
          button: "Cüzdan verilerini dışa aktar",
          description:
            "Cüzdanınızın bir dökümünü indirin. Yeni bir cüzdanın karşılama ekranından bu dosyadan cüzdanınızı geri yükleyebilirsiniz. Bu dosya, dışa aktardıktan sonra cüzdanınızı kullanmaya devam ederseniz senkronize olmayacaktır.",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Bir nane'ye katılın",
    subtitle:
      "Henüz bir Cashu nane'sine katılmadınız. Başlamak için ayarlardan bir nane URL'si ekleyin veya yeni bir nane'den ecash alın.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Ecash Al",
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
        label: "Naneler",
      },
    },
    install: {
      text: "Yükle",
      tooltip: "Cashu'yu Yükle",
    },
  },
  AlreadyRunning: {
    title: "Hayır.",
    text: "Başka bir sekme zaten çalışıyor. Bu sekmeyi kapatın ve tekrar deneyin.",
    actions: {
      retry: {
        label: "Tekrar dene",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Bu sayfa mevcut değil. Yardım için aşağıdaki bağlantıları deneyin:",
    links: {
      docs: "Dokümantasyon",
      tips: "İpuçları",
    },
    actions: {
      home: {
        label: "Ana sayfaya geri dön",
      },
    },
  },
  BalanceView: {
    mintUrl: {
      label: "Nane",
    },
    mintBalance: {
      label: "Bakiye",
    },
    mintError: {
      label: "Nane hatası",
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
      skip: {
        label: "Atla",
      },
    },
  },
  WelcomeSlide1: {
    title: "Cashu'ya hoş geldiniz",
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
      text: "Bu cüzdan herhangi bir nane'ye bağlı değildir. Bu cüzdanı kullanmak için güvendiğiniz bir veya daha fazla Cashu nane'sine bağlanmanız gerekir.",
    },
    p3: {
      text: "Bu cüzdan, yalnızca sizin erişiminiz olan ecash'i saklar. Kurtarma kelimeleri yedeklemesi olmadan tarayıcı verilerinizi silerseniz, token'larınızı kaybedersiniz.",
    },
    p4: {
      text: "Bu cüzdan beta aşamasındadır. Fonlara erişimini kaybeden kişilerden sorumlu değiliz. Kendi sorumluluğunuzda kullanın! Bu kod açık kaynaklıdır ve MIT lisansı altında lisanslanmıştır.",
    },
  },
  WelcomeSlide2: {
    title: "PWA Yükle",
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
          buttonText: "@:AndroidPWAPrompt.buttonText",
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
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "Bu uygulamayı cihazınıza yükledikten sonra bu tarayıcı penceresini kapatın ve uygulamayı ana ekranınızdan kullanın.",
      },
    },
    pwa: {
      success: {
        title: "Başarılı!",
        text: "Cashu'yu PWA olarak kullanıyorsunuz. Diğer açık tarayıcı pencerelerini kapatın ve uygulamayı ana ekranınızdan kullanın.",
      },
    },
  },
  iOSPWAPrompt: {
    text: "{ icon } ve { buttonText }'e dokunun",
    buttonText: "Ana Ekrana Ekle",
  },
  AndroidPWAPrompt: {
    text: "{ icon } ve { buttonText }'e dokunun",
    buttonText: "Ana Ekrana Ekle",
  },
  WelcomeSlide3: {
    title: "Kurtarma Kelimeleriniz",
    text: "Kurtarma kelimelerinizi bir parola yöneticisinde veya kağıt üzerinde saklayın. Cihaza erişiminizi kaybederseniz fonlarınızı kurtarmanın tek yolu kurtarma kelimelerinizdir.",
    inputs: {
      seed_phrase: {
        label: "Kurtarma Kelimeleri",
        caption: "Kurtarma kelimelerinizi ayarlarda görebilirsiniz.",
      },
      checkbox: {
        label: "Yazdım",
      },
    },
  },
  WelcomeSlide4: {
    title: "Şartlar",
    actions: {
      more: {
        label: "Hizmet Şartlarını Oku",
      },
    },
    inputs: {
      checkbox: {
        label: "Bu şartları ve koşulları okudum ve kabul ediyorum",
      },
    },
  },
  WelcomeSlidePrivacy: {
    title: "Cashu ve gizlilik",
    text: "Cashu, mintlerin ödemelerinizi takip edememesi için kör tokenler kullanır.",
  },
  WelcomeSlideMints: {
    title: "Mintler",
    text: "Token almaya başlamak için bir mint ekleyin.",
  },
  WelcomeSlideProofs: {
    title: "Kanıtlar",
    text: "Kanıtlar gönderip alabileceğiniz tokenlerdir.",
  },
  WelcomeSlideBuckets: {
    title: "Kovalar",
    text: "Tokenlerinizi düzenlemek için kovaları kullanın.",
  },
  RestoreView: {
    seed_phrase: {
      label: "Kurtarma Kelimelerinden Geri Yükle",
      caption:
        "Cüzdanınızı geri yüklemek için kurtarma kelimelerinizi girin. Geri yüklemeden önce, daha önce kullandığınız tüm nane'leri eklediğinizden emin olun.",
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
      label: "Nane'leri Geri Yükle",
      caption:
        "Geri yüklenecek nane'yi seçin. Ana ekranda 'Naneler' altında daha fazla nane ekleyebilir ve buradan geri yükleyebilirsiniz.",
    },
    actions: {
      paste: {
        error: "Pano içeriği okunamadı.",
      },
      validate: {
        error: "Anımsatıcı en az 12 kelime olmalıdır.",
      },
      restore: {
        label: "Geri Yükle",
        in_progress: "Nane geri yükleniyor…",
        error: "Nane geri yükleme hatası: { error }",
      },
      restore_all_mints: {
        label: "Tüm Nane'leri Geri Yükle",
        in_progress: "{ length } nane'den { index } geri yükleniyor…",
        success: "Geri yükleme başarıyla tamamlandı",
        error: "Nane'leri geri yükleme hatası: { error }",
      },
    },
  },
  MintSettings: {
    add: {
      title: "Nane ekle",
      description:
        "Bağlanmak için bir Cashu nane'sinin URL'sini girin. Bu cüzdan herhangi bir nane'ye bağlı değildir.",
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
          label: "QR Kodu Tara",
        },
      },
    },
    discover: {
      title: "Nane'leri keşfet",
      overline: "Keşfet",
      caption: "Diğer kullanıcıların nostr'da önerdiği nane'leri keşfet.",
      actions: {
        discover: {
          label: "Nane'leri keşfet",
          in_progress: "Yükleniyor…",
          error_no_mints: "Nane bulunamadı",
          success: "{ length } nane bulundu",
        },
      },
      recommendations: {
        overline: "{ length } nane bulundu",
        caption:
          "Bu nane'ler diğer Nostr kullanıcıları tarafından önerildi. { link } adresinde yorumları okuyun. Dikkatli olun ve bir nane kullanmadan önce kendi araştırmanızı yapın.",
        actions: {
          browse: {
            label: "Nane'lere göz atmak için tıklayın",
          },
        },
      },
    },
    
    swap: {
      title: "Değiştir",
      overline: "Çoklu Nane Takasları",
      caption:
        "Fonları Lightning aracılığıyla nane'ler arasında değiştirin. Not: Potansiyel Lightning ücretleri için yer bırakın. Gelen ödeme başarılı olmazsa, faturayı manuel olarak kontrol edin.",
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
    title: "Fatura Oluştur",
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
        label: "Fatura Oluştur",
        label_blocked: "Fatura oluşturuluyor…",
        in_progress: "Oluşturuluyor",
      },
    },
    invoice: {
      caption: "Lightning faturası",
      status_paid_text: "Ödendi!",
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
    title: "Gönder",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Nane yok",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "Nane yok",
      },
    },
  },
  SendTokenDialog: {
    title: "{ value } gönder",
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
        locktime: {
          label: "Unlock time",
        },
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
        tooltip_text: "Emoji kopyala",
      },
      copy_tokens: {
        label: "@:global.actions.copy.label",
      },
      copy_link: {
        tooltip_text: "Bağlantıyı kopyala",
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
        tooltip_text: "Geçmişten sil",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "NFC kartına flaşla",
          ndef_unsupported_text: "NDEF desteklenmiyor",
        },
      },
    },
  },
  ReceiveDialog: {
    title: "Al",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Nane yok",
      },
      lightning: {
        label: "Lightning",
        error_no_mints:
          "Lightning aracılığıyla almak için bir nane'ye bağlanmanız gerekir",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "Ecash Al",
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      scan: {
        label: "@:global.actions.scan.label",
      },
      request: {
        label: "Talep et",
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
    title: "{ value } al",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "Cashu token'ını yapıştır",
      },
      bucket: {
        label: "Bucket",
      },
      label: {
        label: "Label",
      },
      description: {
        label: "Description",
      },
    },
    errors: {
      invalid_token: {
        timelock: {
          unlock_date_label: "Unlocks { value }",
        },
        label: "Geçersiz token",
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
        label_adding_mint: "Nane ekleniyor…",
      },
      
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "Güvenilen bir nane'ye takas et",
        caption: "{ value } takas et",
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
        label: "Daha sonra",
        tooltip_text: "Daha sonra almak için geçmişe ekle",
        already_in_history_success_text: "Ecash zaten Geçmişte",
        added_to_history_success_text: "Ecash Geçmişe eklendi",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "NFC kartından oku",
          ndef_unsupported_text: "NDEF desteklenmiyor",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "P2PK Anahtarı",
      description: "Bu anahtara kilitlenmiş ecash al",
      used_warning_text:
        "Uyarı: Bu anahtar daha önce kullanıldı. Daha iyi gizlilik için yeni bir anahtar kullanın.",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
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
    payment_request: {
      caption: "Ödeme Talebi",
      description: "Nostr aracılığıyla ödeme al",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "Yeni talep",
      },
      add_amount: {
        label: "Miktar ekle",
      },
      use_active_mint: {
        label: "Herhangi bir nane",
      },
    },
    inputs: {
      amount: {
        placeholder: "Miktar girin",
      },
    },
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
    title: "Nane Mesajı",
  },
  MintDetailsDialog: {
    contact: {
      title: "İletişim",
    },
    details: {
      title: "Nane detayları",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Kurallar",
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
        label: "Para Birimi",
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
        label: "Nane URL'sini kopyala",
      },
      delete: {
        label: "Nane'yi sil",
      },
      edit: {
        label: "Nane'yi düzenle",
      },
    },
  },
  ChooseMint: {
    title: "Bir nane seçin",
    badge_mint_error_text: "Hata",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
  },
  HistoryTable: {
    empty_text: "Henüz geçmiş yok",
    row: {
      type_label: "Ecash",
      date_label: "{ value } önce",
    },
    actions: {
      check_status: {
        tooltip_text: "Durumu kontrol et",
      },
      receive: {
        tooltip_text: "Al",
      },
      filter_pending: {
        label: "Bekleyenleri filtrele",
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
        label: "Bekleyenleri filtrele",
      },
      show_all: {
        label: "Tümünü göster",
      },
    },
  },
  RemoveMintDialog: {
    title: "Bu nane'yi silmek istediğinizden emin misiniz?",
    nickname: {
      label: "Takma ad",
    },
    balances: {
      label: "Bakiyeler",
    },
    warning_text:
      "Not: Bu cüzdan paranoyak olduğu için, bu nane'den ecash'iniz aslında silinmeyecek, ancak cihazınızda saklanmaya devam edecektir. Bu nane'yi daha sonra tekrar eklerseniz yeniden göründüğünü göreceksiniz.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "Nane'yi kaldır",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  PayInvoiceDialog: {
    input_data: {
      title: "Lightning öde",
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
    },
    lnurlpay: {
      amount_exact_label: "{ payee }, { value } { ticker } talep ediyor",
      amount_range_label:
        "{ payee }{br} { min } ile { max } { ticker } arasında talep ediyor",
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
          error: "Hata",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Nane'yi düzenle",
    inputs: {
      nickname: {
        label: "Takma ad",
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
    title: "Bu nane'ye güveniyor musunuz?",
    description:
      "Bu nane'yi kullanmadan önce güvendiğinizden emin olun. Nane'ler herhangi bir zamanda kötü niyetli hale gelebilir veya faaliyetlerini durdurabilir.",
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
        in_progress: "Nane ekleniyor",
      },
    },
  },
  AddTierDialog: {
    helper: {
      media_preview:
        "Supported URL types: HTTPS, IPFS, YouTube, <iframe> snippets and Nostr event links. Only the embedded source URL is stored.",
    },
  },
  BucketManager: {
    tooltips: {
      description:
        "Bucket'lar tokenleri kategorize etmek i\u00e7in kullan\u0131l\u0131r",
    },
  },
  BucketDetail: {
    move: "Move tokens",
    send: "Send tokens",
    inputs: {
      target_bucket: {
        label: "Move to bucket",
      },
    },
    not_found: "Bucket not found.",
  },
  MoveTokens: {
    title: "Move tokens",
    select_tokens: "Select tokens to move",
    empty: "No tokens",
    helper: "Move tokens between buckets to organize them.",
  },
  restore: {
    mnemonic_error_text: "Lütfen bir anımsatıcı girin",
    restore_mint_error_text: "Nane geri yükleme hatası: { error }",
    prepare_info_text: "Geri yükleme süreci hazırlanıyor…",
    restored_proofs_for_keyset_info_text:
      "{ keysetId } anahtar kümesi için { restoreCounter } kanıt geri yüklendi",
    checking_proofs_for_keyset_info_text:
      "{ keysetId } anahtar kümesi için { startIndex } ila { endIndex } kanıtları kontrol ediliyor",
    no_proofs_info_text: "Geri yüklenecek kanıt bulunamadı",
    restored_amount_success_text: "{ amount } geri yüklendi",
  },
  CreatorHub: {
    dashboard: {
      title: "Creator Dashboard",
      logout: "Logout",
      edit_profile: "Edit Profile",
      manage_tiers: "Manage Tiers",
      add_tier: "Add Tier",
      save_tier: "Save Tier",
      delete_tier: "Delete Tier",
      inputs: {
        title: {
          label: "Title",
        },
        price: {
          label: "Cost / month (sats)",
        },
        description: {
          label: "Description (Markdown)",
        },
      },
      welcome_message: "Welcome Message",
      currency_labels: {
        usd: "USD",
        eur: "EUR",
      },
    },
  },
  
  swap: {
    in_progress_warning_text: "Takas devam ediyor",
    invalid_swap_data_error_text: "Geçersiz takas verisi",
    swap_error_text: "Takas hatası",
  },
  settings: {
    nostr: {
      signing_extension: {
        not_found: "NIP-07 imzalama uzantısı bulunamadı",
      },
    },
  },
  bucketManager: {
    actions: { add: "Add bucket" },
    addDialog: { title: "Create new bucket" },
    inputs: {
      search: {
        placeholder: "Search buckets",
      },
    },
  },
  bucket: {
    name: "Name",
    color: "Color",
    goal: "Monthly goal",
    description: "Description",
  },
  SubscriptionsOverview: {
    export_csv: "Export CSV",
    filter: {
      status: "Duruma göre filtrele",
      bucket: "Buckete göre filtrele",
    },
  },
  SendBucketDmDialog: {
    title: "Send Bucket Tokens",
    inputs: {
      recipient: { label: "Recipient npub" },
      amount: { label: "Amount" },
      memo: { label: "Memo" },
    },
    options: {
      amount: "Amount",
      proofs: "Select Tokens",
    },
    actions: {
      cancel: { label: "@:global.actions.cancel.label" },
      send: { label: "@:global.actions.send.label" },
    },
    errors: {
      invalid_npub: "Invalid npub",
      invalid_pubkey: "Invalid pubkey",
    },
  },
  AboutPage: {
    siteOverview: {
      title: "Siteye Genel Bakış",
      wallet: {
        description: "Ecash bakiyenizi yönetin.",
        icon: "account_balance_wallet",
      },
      findCreators: {
        description: "Destekleyecek yaratıcılar keşfedin.",
        icon: "img:icons/find-creators.svg",
      },
      
      myProfile: {
        description: "Profilinizi görüntüleyin ve düzenleyin.",
        icon: "person",
      },
      buckets: {
        description: "Fonları kovalar halinde düzenleyin.",
        icon: "inventory_2",
      },
      subscriptions: {
        description: "Aboneliklerinizi yönetin.",
        icon: "auto_awesome_motion",
      },
      nostrMessengerTitle: "Nostr Messenger",
      nostrMessenger: {
        description: "Nostr ile özel olarak sohbet edin.",
        icon: "chat",
      },
      settings: {
        description: "Uygulamayı yapılandırın.",
        icon: "settings",
      },
      restoreTitle: "Restore",
      restore: {
        description: "Recover your wallet from a backup.",
        icon: "settings_backup_restore",
      },
      alreadyRunningTitle: "Already Running",
      alreadyRunning: {
        description: "Warning when another session is active.",
        icon: "warning",
      },
      welcomeTitle: "Welcome",
      welcome: {
        description: "Introductory guide to Fundstr.",
        icon: "info",
      },
      terms: {
        description: "Review the terms of service.",
        icon: "gavel",
      },
      nostrLoginTitle: "Nostr Login",
      nostrLogin: {
        description: "Authenticate using your Nostr keys.",
        icon: "vpn_key",
      },
    },
    navigation: {
      fanPerspective: "Fan perspective",
      creatorPerspective: "Creator perspective",
      items: {
        wallet: {
          fan: "Check balance, send and receive ecash.",
          creator: "Same wallet view—shows supporter payments.",
        },
        settings: {
          fan: "Add / switch mints, choose display unit, set language & theme, import or back-up your 12-word seed, manage Nostr keys & relays.",
          creator:
            "Same, plus Publishing settings: toggle automatic NIP-61 profile updates and set a default “Earnings” bucket.",
        },
        findCreators: {
          fan: "Search or browse Nostr-indexed profiles. View tier prices, previews and public posts. Hit Subscribe or Zap with a single tap.",
          creator:
            "Your public storefront as seen by visitors. Great for a quick audit of how your profile appears worldwide.",
        },
        
        myProfile: {
          fan: "Show off your avatar, npub link and optional NIP-05. Personal stats: total zaps sent & received, bucket balances.",
          creator:
            "Same card plus Edit. Update bio, tags and the secondary P2PK key used by fans to send you locked tokens.",
        },
        buckets: {
          fan: "Drag-and-drop jars for budgeting (“Groceries”, “Fun money”, “Subs”). Move sats with zero fees.",
          creator:
            "Create an “Income” bucket that auto-receives new tips; split out taxes or savings instantly.",
        },
        subscriptions: {
          fan: "See every active plan: tier name, next renewal, cumulative sats spent. Cancel or renew with one click.",
          creator:
            "Quick list of paying supporters, tier breakdown, churn alerts and pending renewals.",
        },
        chats: {
          fan: "End-to-end encrypted DMs (Nostr kind 4). Attach images or Cashu tokens. Green flash means a payment is embedded and auto-redeemed on receipt.",
          creator:
            "Same powerful chat plus a broadcast toggle to message all subs in a tier at once.",
        },
        restore: {
          fan: "Recover your wallet from a 12-word seed.",
          creator: "Same recovery flow for creator profiles.",
        },
        alreadyRunning: {
          fan: "Warns when Fundstr is open in another tab.",
          creator: "Same warning to avoid conflicting sessions.",
        },
        welcome: {
          fan: "Quick guide for new users.",
          creator: "Same introduction including creator tips.",
        },
        terms: {
          fan: "Human-readable, plain-English licence & disclaimers.",
          creator: "Identical — clarifies you keep full custody of funds.",
        },
        about: {
          fan: "Learn everything in one scroll.",
          creator: "Ditto; includes creator-specific FAQs below.",
        },
        externalLinks: {
          fan: "Cashu.space docs, GitHub, Twitter, Telegram, Donate.",
          creator: "Identical — share with collaborators or fans.",
        },
        nostrLogin: {
          fan: "Sign in using your Nostr keys.",
          creator: "Same login method required for posting.",
        },
      },
    },
  },
  CreatorSubscribers: {
    filter: {
      placeholder: "Filter",
      startFrom: "Start from",
      startTo: "Start to",
      nextRenewalFrom: "Next renewal from",
      nextRenewalTo: "Next renewal to",
      monthsRemaining: "Periods remaining",
    },
    filters: {
      frequency: "Filter by frequency",
      status: "Status",
      tier: "Tier",
      sort: "Sort",
      clear: "Clear",
      apply: "Apply",
      sortOptions: {
        next: "Next renewal",
        first: "First seen",
        amount: "Lifetime sats",
      },
    },
    columns: {
      subscriber: "Subscriber",
      tier: "Tier",
      frequency: "Freq",
      status: "Status",
      amount: "Amount",
      nextRenewal: "Next renewal",
      lifetime: "Lifetime",
      actions: "Actions",
    },
    frequency: {
      weekly: "Weekly",
      biweekly: "Bi-weekly",
      monthly: "Monthly",
    },
    actions: {
      viewProfile: "View profile",
      sendMessage: "Send message",
      downloadCsv: "Download CSV",
      sendGroupMessage: "Send Group DM",
      exportSelected: "Export selected",
      filters: "Filters",
      retry: "Retry",
      clear: "Clear",
      openDetails: "Open details",
    },
    toolbar: {
      searchPlaceholder: "Search",
      frequency: "Frequency",
      status: "Status",
      tier: "Tier",
      sort: "Sort",
      tableView: "Table view",
      cardView: "Card view",
      comfortable: "Comfortable",
      compact: "Compact",
      exportCsv: "Export CSV",
    },
    status: {
      any: "Any",
      active: "Active",
      pending: "Pending",
      ended: "Ended",
    },
    summary: {
      subscribers: "Subscribers",
      active: "Active",
      pending: "Pending",
      receivedPeriods: "Received periods",
      revenue: "Revenue",
      lifetimeRevenue: "Lifetime revenue",
      thisPeriod: "This period",
      thisWeek: "this week",
      thisMonth: "this month",
      nextWeek: "Next week",
      nextMonth: "Next month",
    },
    charts: {
      frequency: "Frequency",
      status: "Status",
      newSubs: "New subs",
      revenueOverTime: "Revenue over time",
      frequencyMix: "Frequency mix",
      statusByFrequency: "Status by frequency",
      revenueSummary: "Total revenue {total} sat",
      frequencySummary:
        "Weekly: {weekly}, Bi-weekly: {biweekly}, Monthly: {monthly}",
      statusSummary:
        "Weekly - Active {weeklyActive}, Pending {weeklyPending}, Ended {weeklyEnded}; Bi-weekly - Active {biweeklyActive}, Pending {biweeklyPending}, Ended {biweeklyEnded}; Monthly - Active {monthlyActive}, Pending {monthlyPending}, Ended {monthlyEnded}",
    },
    renewalProgress: "Renewal progress",
    tabs: {
      all: "All",
    },
    periodsText: "{received} of {total} periods",
    periodsTooltip: "Periods received vs periods purchased",
    startTooltip: "Filter by subscription start date",
    nextRenewalTooltip: "Filter by next renewal date",
    monthsRemainingTooltip: "Filter by remaining periods",
    nextRenewal: "Renews on {date}",
    noData: "No subscribers yet",
    shareProfile: "Share your profile",
    selectionCount: "{count} selected",
    tooltips: {
      noSelection: "Select subscribers first",
      notLoggedIn: "Connect to Nostr to send messages",
    },
    notifications: {
      export_success: "Subscribers exported",
      export_failed: "Failed to export subscribers",
      dm_not_ready: "Messenger not ready",
    },
    drawer: {
      tabs: {
        overview: "Overview",
        payments: "Payments",
        notes: "Notes",
      },
      overview: {
        nip05: "nip05",
        lud16: "lud16",
        about: "about",
        nextRenewal: "Next renewal",
        amountPerInterval: "Amount / interval",
        lifetimeTotal: "Lifetime total",
        since: "Since",
      },
      actions: {
        dm: "DM",
        copyNpub: "Copy npub",
        copyLud16: "Copy lud16",
        openProfile: "Profile",
        cancel: "Cancel",
      },
      payments: {
        noPayments: "No payments",
      },
      activity: "Activity",
    },
  },
  SubscriberDrawer: {
    tabs: {
      overview: "Overview",
      payments: "Payments",
      notes: "Notes",
    },
    actions: {
      dm: "DM",
      copyNpub: "Copy npub",
      copyLud16: "Copy lud16",
      openProfile: "Profile",
      cancel: "Cancel",
    },
    notifications: {
      note_saved: "Note saved",
      note_save_failed: "Failed to save note",
    },
  },
};
