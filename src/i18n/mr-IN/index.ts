export default {
  global: {
    copy_to_clipboard: {
      success: "क्लिपबोर्डवर कॉपी झाले!",
    },
    actions: {
      add_mint: {
        label: "मिंट जोडा",
      },
      cancel: {
        label: "रद्द करा",
      },
      copy: {
        label: "कॉपी करा",
      },
      close: {
        label: "बंद करा",
      },
      enter: {
        label: "नोंदवा",
      },
      lock: {
        label: "लॉक करा",
      },
      paste: {
        label: "पेस्ट करा",
      },
      receive: {
        label: "मिळवा",
      },
      scan: {
        label: "स्कॅन करा",
      },
      send: {
        label: "पाठवा",
      },
      pay: {
        label: "पैसे भरा",
      },
      swap: {
        label: "स्वॅप करा",
      },
      update: {
        label: "अपडेट करा",
      },
    },
    inputs: {
      mint_url: {
        label: "मिंट URL",
      },
    },
  },
  common: {
    fee: "शुल्क",
  },
  MultinutPicker: {
    payment: "मल्टीनट पेमेंट",
    selectMints: "पेमेंट करण्यासाठी एक किंवा अनेक मिंट निवडा.",
    totalSelectedBalance: "निवडलेली एकूण शिल्लक",
    multiMintPay: "मल्टी-मिंट पेमेंट",
    balanceNotEnough: "या इनव्हॉइससाठी मल्टी-मिंट शिल्लक पुरेशी नाही",
    failed: "प्रक्रिया अयशस्वी: {error}",
    paid: "लाइटनिंगद्वारे {amount} भरले",
  },
  wallet: {
    notifications: {
      balance_too_low: "शिल्लक खूप कमी आहे",
      received: "{amount} मिळाले",
      fee: " (शुल्क: {fee})",
      could_not_request_mint: "मिंटकडे विनंती करता आली नाही",
      invoice_still_pending: "इनव्हॉइस अजून प्रलंबित आहे",
      paid_lightning: "लाइटनिंगद्वारे {amount} भरले",
      payment_pending_refresh:
        "पेमेंट प्रलंबित आहे. इनव्हॉइस स्वतः रिफ्रेश करा.",
      sent: "{amount} पाठवले",
      token_still_pending: "टोकन अजून प्रलंबित आहे",
      history_save_failed: "इतिहासात सेव्ह करता आले नाही",
      history_delete_failed: "इतिहासातून काढता आले नाही",
      received_lightning: "लाइटनिंगद्वारे {amount} मिळाले",
      lightning_payment_failed: "लाइटनिंग पेमेंट अयशस्वी",
      failed_to_decode_invoice: "इनव्हॉइस वाचता आले नाही",
      unsupported_legacy_qr: "असमर्थित जुना QR कोड",
      legacy_qr_not_supported: "हा जुना QR कोड समर्थित व्यापाऱ्याचा नाही",
      invalid_lnurl: "अवैध LNURL",
      lnurl_error: "LNURL त्रुटी",
      no_amount: "रक्कम नाही",
      no_lnurl_data: "LNURL डेटा नाही",
      no_price_data: "किमतीचा डेटा नाही.",
      please_try_again: "कृपया पुन्हा प्रयत्न करा.",
      trying_again: "पुन्हा प्रयत्न करत आहे...",
      no_bolt12_mint: "तुमचा कोणताही मिंट BOLT12 ऑफरला समर्थन देत नाही",
      no_bolt11_mint: "तुमचा कोणताही मिंट BOLT11 इनव्हॉइसला समर्थन देत नाही",
    },
    mint: {
      notifications: {
        already_added: "मिंट आधीच जोडलेला आहे",
        added: "मिंट जोडला",
        not_found: "मिंट सापडला नाही",
        activation_failed: "मिंट सक्रिय करता आला नाही",
        no_active_mint: "कोणताही सक्रिय मिंट नाही",
        unit_activation_failed: "युनिट सक्रिय करता आले नाही",
        unit_not_supported: "मिंट या युनिटला समर्थन देत नाही",
        activated: "मिंट सक्रिय झाला",
        could_not_connect: "मिंटशी कनेक्ट होता आले नाही",
        could_not_get_info: "मिंटची माहिती मिळाली नाही",
        could_not_get_keys: "मिंटच्या की मिळाल्या नाहीत",
        could_not_get_keysets: "मिंटचे कीसेट मिळाले नाहीत",
        mint_validation_error: "मिंट पडताळणी त्रुटी",
        removed: "मिंट काढला",
        error: "मिंट त्रुटी",
      },
    },
  },
  MainHeader: {
    menu: {
      settings: {
        title: "सेटिंग्ज",
        settings: {
          title: "सेटिंग्ज",
          caption: "वॉलेट कॉन्फिगरेशन",
        },
      },
      terms: {
        title: "अटी",
        terms: {
          title: "अटी",
          caption: "सेवेच्या अटी",
        },
      },
      links: {
        title: "लिंक",
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
          title: "देणगी द्या",
          caption: "Cashu ला पाठिंबा द्या",
        },
      },
    },
    offline: {
      warning: {
        text: "ऑफलाइन",
      },
    },
    reload: {
      warning: {
        text: "{ countdown } मध्ये रीलोड होईल",
      },
    },
    staging: {
      warning: {
        text: "स्टेजिंग – खऱ्या पैशांसाठी वापरू नका!",
      },
    },
  },
  FullscreenHeader: {
    actions: {
      back: {
        label: "वॉलेट",
      },
    },
  },
  Settings: {
    menu: {
      title: "सेटिंग्ज",
      backup: {
        title: "बॅकअप आणि रीस्टोर",
        caption: "सीड फ्रेज आणि ई-कॅश रिकव्हरी",
      },
      lightning_address: {
        title: "लाइटनिंग ॲड्रेस",
        caption: "तुमच्या लाइटनिंग ॲड्रेसवर पेमेंट मिळवा",
      },
      nostr: {
        title: "Nostr",
        caption: "की, रिले आणि वेब ऑफ ट्रस्ट",
      },
      payment_requests: {
        title: "पेमेंट विनंत्या",
        caption: "Nostr द्वारे ई-कॅश पेमेंट मिळवा",
      },
      nwc: {
        title: "Nostr Wallet Connect",
        caption: "इतर ॲप्समधून तुमचे वॉलेट वापरा",
      },
      hardware: {
        title: "हार्डवेअर",
        caption: "NFC कार्ड सेटिंग्ज",
      },
      p2pk: {
        title: "P2PK",
        caption: "तुमच्या कीवर लॉक केलेले ई-कॅश मिळवा",
      },
      privacy: {
        title: "गोपनीयता",
        caption: "नेटवर्क तपासणी आणि बिटकॉइनची किंमत",
      },
      experimental: {
        title: "प्रायोगिक",
        caption: "नवीन सुविधा आधी वापरून पाहा",
      },
      appearance: {
        title: "रूप",
        caption: "थीम, कीबोर्ड आणि बिटकॉइन चिन्ह",
      },
      language: {
        title: "भाषा",
        caption: "तुमची भाषा निवडा",
      },
      advanced: {
        title: "प्रगत",
        caption: "डेव्हलपर टूल्स आणि वॉलेट रीसेट",
      },
      about: {
        title: "माहिती",
        caption: "अटी आणि लिंक",
      },
    },
    language: {
      title: "भाषा",
      description: "कृपया खालील यादीतून तुमची आवडती भाषा निवडा.",
    },
    sections: {
      backup_restore: "बॅकअप आणि रीस्टोर",
      lightning_address: "लाइटनिंग ॲड्रेस",
      nostr_keys: "NOSTR की",
      nostr: {
        title: "NOSTR",
        relays: {
          expand_label: "रिले बदलण्यासाठी क्लिक करा",
          add: {
            title: "रिले जोडा",
            description:
              "पेमेंट विनंत्या, Nostr Wallet Connect आणि बॅकअप यांसारख्या Nostr कामांसाठी तुमचे वॉलेट हे रिले वापरते.",
          },
          list: {
            title: "रिले",
            description: "तुमचे वॉलेट या रिलेशी कनेक्ट होईल.",
            copy_tooltip: "रिले कॉपी करा",
            remove_tooltip: "रिले काढा",
          },
        },
      },
      payment_requests: "पेमेंट विनंत्या",
      nostr_wallet_connect: "NOSTR WALLET CONNECT",
      hardware_features: "हार्डवेअर सुविधा",
      p2pk_features: "P2PK सुविधा",
      privacy: "गोपनीयता",
      experimental: "प्रायोगिक",
      appearance: "रूप",
    },
    backup_restore: {
      backup_seed: {
        title: "सीड फ्रेजचा बॅकअप",
        description:
          "तुमच्या सीड फ्रेजने तुमचे वॉलेट परत मिळवता येते. ती सुरक्षित आणि खाजगी ठेवा.",
        seed_phrase_label: "सीड फ्रेज",
      },
      restore_ecash: {
        title: "ई-कॅश रीस्टोर करा",
        description:
          "रीस्टोर विझार्डने तुम्ही एखाद्या सीड फ्रेजमधून हरवलेले ई-कॅश परत मिळवू शकता. तुमच्या सध्याच्या वॉलेटची सीड फ्रेज बदलणार नाही, विझार्ड फक्त दुसऱ्या सीड फ्रेजमधून ई-कॅश रीस्टोर करू देईल.",
        button: "रीस्टोर करा",
      },
    },
    lightning_address: {
      title: "लाइटनिंग ॲड्रेस",
      description: "तुमच्या लाइटनिंग ॲड्रेसवर पेमेंट मिळवा.",
      enable: {
        toggle: "सुरू करा",
        description: "npub.cash सह लाइटनिंग ॲड्रेस",
      },
      address: {
        copy_tooltip: "लाइटनिंग ॲड्रेस कॉपी करा",
      },
      show_on_receive: {
        toggle: "मिळवताना दाखवा",
        description: "ॲड्रेस आणि QR कोड दाखवा.",
      },
      automatic_claim: {
        toggle: "आपोआप क्लेम करा",
        description: "येणारी पेमेंट आपोआप मिळवा.",
      },
      mint: {
        label: "npub.cash मिंट",
        choose_title: "npub.cash साठी मिंट निवडा",
        choose_placeholder: "एक मिंट निवडा...",
      },
    },
    nostr_keys: {
      title: "तुमच्या Nostr की",
      description: "तुमच्या Nostr कीवरून तुमचा लाइटनिंग ॲड्रेस ठरेल.",
      wallet_seed: {
        title: "वॉलेट सीड फ्रेज",
        description: "वॉलेट सीडमधून Nostr की-जोडी तयार करा",
        copy_nsec: "nsec कॉपी करा",
      },
      nsec_bunker: {
        title: "Nsec बंकर",
        description: "NIP-46 बंकर वापरा",
        delete_tooltip: "कनेक्शन काढा",
      },
      use_nsec: {
        title: "तुमची nsec वापरा",
        description: "ही पद्धत धोकादायक आहे आणि तिची शिफारस केली जात नाही",
        delete_tooltip: "nsec काढा",
      },
      signing_extension: {
        title: "साइनिंग एक्सटेन्शन",
        description: "NIP-07 साइनिंग एक्सटेन्शन वापरा",
        not_found: "कोणतेही NIP-07 साइनिंग एक्सटेन्शन सापडले नाही",
      },
    },
    payment_requests: {
      title: "पेमेंट विनंत्या",
      description:
        "पेमेंट विनंत्यांमुळे तुम्ही Nostr द्वारे पेमेंट मिळवू शकता. हे सुरू केल्यास तुमचे वॉलेट तुमच्या Nostr रिलेशी जोडले जाईल.",
      enable_toggle: "पेमेंट विनंत्या सुरू करा",
      claim_automatically: {
        toggle: "आपोआप क्लेम करा",
        description: "येणारी पेमेंट आपोआप मिळवा.",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Wallet Connect (NWC)",
      description: "NWC वापरून इतर कोणत्याही ॲपमधून तुमचे वॉलेट चालवा.",
      enable_toggle: "NWC सुरू करा",
      payments_note:
        "NWC ने तुम्ही फक्त तुमच्या बिटकॉइन शिल्लकेतून पेमेंट करू शकता. पेमेंट तुमच्या सक्रिय मिंटमधून होतील.",
      connection: {
        copy_tooltip: "कनेक्शन स्ट्रिंग कॉपी करा",
        qr_tooltip: "QR कोड दाखवा",
        allowance_label: "उरलेली मर्यादा (sat)",
      },
    },
    hardware_features: {
      webnfc: {
        title: "WebNFC",
        description: "NFC कार्डवर लिहिण्यासाठी एन्कोडिंग निवडा",
        text: {
          title: "मजकूर",
          description: "टोकन साध्या मजकुरात ठेवा",
        },
        weburl: {
          title: "URL",
          description: "टोकनसह या वॉलेटचा URL ठेवा",
        },
        binary: {
          title: "बायनरी",
          description: "टोकन बायनरी डेटा म्हणून ठेवा",
        },
        quick_access: {
          toggle: "NFC जलद वापर",
          description:
            "'ई-कॅश मिळवा' मेनूमध्ये NFC कार्ड पटकन स्कॅन करा. हा पर्याय 'ई-कॅश मिळवा' मेनूमध्ये NFC बटण जोडतो.",
        },
      },
    },
    p2pk_features: {
      title: "P2PK",
      description:
        "P2PK-लॉक ई-कॅश मिळवण्यासाठी की-जोडी तयार करा. सूचना: ही सुविधा प्रायोगिक आहे. फक्त लहान रकमांसाठी वापरा. तुमच्या खाजगी की हरवल्या तर त्यांवर लॉक केलेले ई-कॅश कोणीही अनलॉक करू शकणार नाही.",
      generate_button: "की तयार करा",
      import_button: "nsec इम्पोर्ट करा",
      quick_access: {
        toggle: "लॉक जलद वापर",
        description:
          "यामुळे 'ई-कॅश मिळवा' मेनूमध्ये तुमची P2PK लॉकिंग की पटकन दिसते.",
      },
      keys_expansion: {
        label: "{count} की पाहण्यासाठी क्लिक करा",
        used_badge: "वापरलेली",
      },
    },
    privacy: {
      title: "गोपनीयता",
      description: "या सेटिंग्जचा तुमच्या गोपनीयतेवर परिणाम होतो.",
      check_incoming: {
        toggle: "येणारे इनव्हॉइस तपासा",
        description:
          "सुरू केल्यास वॉलेट पार्श्वभूमीत नवीन इनव्हॉइस तपासेल. यामुळे वॉलेट जलद प्रतिसाद देते, पण तुमची ओळख पटवणे (फिंगरप्रिंटिंग) सोपे होते. न भरलेली इनव्हॉइस तुम्ही 'इनव्हॉइस' टॅबमध्ये स्वतः तपासू शकता.",
      },
      check_startup: {
        toggle: "सुरुवातीला प्रलंबित इनव्हॉइस तपासा",
        description: "सुरू केल्यास वॉलेट सुरू होताच प्रलंबित इनव्हॉइस तपासेल.",
      },
      check_all: {
        toggle: "सर्व इनव्हॉइस तपासा",
        description:
          "सुरू केल्यास वॉलेट दोन आठवड्यांपर्यंत पार्श्वभूमीत वेळोवेळी न भरलेली इनव्हॉइस तपासेल. यामुळे वॉलेटची ऑनलाइन हालचाल वाढते आणि तुमची ओळख पटवणे (फिंगरप्रिंटिंग) सोपे होते. न भरलेली इनव्हॉइस तुम्ही 'इनव्हॉइस' टॅबमध्ये स्वतः तपासू शकता.",
      },
      check_sent: {
        toggle: "पाठवलेले ई-कॅश तपासा",
        description:
          "सुरू केल्यास पाठवलेले टोकन रिडीम झाले की नाही हे वॉलेट पार्श्वभूमीत वेळोवेळी तपासेल. यामुळे वॉलेटची ऑनलाइन हालचाल वाढते आणि तुमची ओळख पटवणे (फिंगरप्रिंटिंग) सोपे होते.",
      },
      websockets: {
        toggle: "WebSockets वापरा",
        description:
          "सुरू केल्यास भरलेली इनव्हॉइस आणि खर्च झालेल्या टोकनची माहिती मिंटकडून मिळवण्यासाठी वॉलेट दीर्घकाळ चालणारी WebSocket कनेक्शन वापरेल. यामुळे वॉलेट जलद प्रतिसाद देते, पण तुमची ओळख पटवणेही (फिंगरप्रिंटिंग) सोपे होते.",
      },
      bitcoin_price: {
        toggle: "Coinbase वरून विनिमय दर घ्या",
        description:
          "सुरू केल्यास बिटकॉइनचा सध्याचा विनिमय दर coinbase.com वरून घेतला जाईल आणि तुमची रूपांतरित शिल्लक दिसेल.",
        currency: {
          title: "फियाट चलन",
          description: "बिटकॉइनची किंमत दाखवण्यासाठी फियाट चलन निवडा.",
        },
      },
    },
    experimental: {
      title: "प्रायोगिक",
      description: "या सुविधा प्रायोगिक आहेत.",
      receive_swaps: {
        toggle: "मिळवताना स्वॅप",
        badge: "बीटा",
        description:
          "'ई-कॅश मिळवा' डायलॉगमध्ये मिळालेले ई-कॅश तुमच्या सक्रिय मिंटमध्ये स्वॅप करण्याचा पर्याय.",
      },
      auto_paste: {
        toggle: "ई-कॅश आपोआप पेस्ट करा",
        description:
          "तुम्ही 'मिळवा', मग 'ई-कॅश', मग 'पेस्ट करा' दाबल्यावर क्लिपबोर्डमधील ई-कॅश आपोआप पेस्ट होते. iOS वर आपोआप पेस्ट केल्याने स्क्रीनवर गडबड होऊ शकते, अडचण आल्यास हे बंद करा.",
      },
      auditor: {
        toggle: "ऑडिटर सुरू करा",
        badge: "बीटा",
        description:
          "सुरू केल्यास वॉलेट मिंट तपशील डायलॉगमध्ये ऑडिटरची माहिती दाखवेल. ऑडिटर ही मिंटच्या विश्वासार्हतेवर लक्ष ठेवणारी त्रयस्थ सेवा आहे.",
        url_label: "ऑडिटर URL",
        api_url_label: "ऑडिटर API URL",
      },
      multinut: {
        toggle: "मल्टीनट सुरू करा",
        description:
          "सुरू केल्यास वॉलेट एकाच वेळी अनेक मिंटमधून इनव्हॉइस भरण्यासाठी मल्टीनट वापरेल.",
      },
      nostr_mint_backup: {
        toggle: "मिंट यादीचा Nostr वर बॅकअप",
        description:
          "सुरू केल्यास तुमची मिंट यादी तुमच्या Nostr की वापरून Nostr रिलेवर आपोआप बॅकअप होईल. यामुळे दुसऱ्या डिव्हाइसवरही तुमची मिंट यादी परत मिळवता येते.",
        notifications: {
          enabled: "Nostr मिंट बॅकअप सुरू झाला",
          disabled: "Nostr मिंट बॅकअप बंद झाला",
          failed: "Nostr मिंट बॅकअप सुरू करता आला नाही",
        },
      },
    },
    appearance: {
      keyboard: {
        title: "ऑन-स्क्रीन कीबोर्ड",
        description: "रक्कम टाकण्यासाठी अंकांचा कीबोर्ड वापरा.",
        toggle: "अंकांचा कीबोर्ड वापरा",
        toggle_description:
          "सुरू केल्यास रक्कम टाकण्यासाठी अंकांचा कीबोर्ड वापरला जाईल.",
      },
      theme: {
        title: "रूप",
        description: "तुमचे वॉलेट कसे दिसावे ते बदला.",
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
        title: "बिटकॉइन चिन्ह",
        description: "sats ऐवजी ₿ चिन्ह वापरा.",
        toggle: "₿ चिन्ह वापरा",
      },
    },
    web_of_trust: {
      title: "वेब ऑफ ट्रस्ट",
      known_pubkeys: "ओळखीच्या पब्लिक की: {wotCount}",
      continue_crawl: "क्रॉल सुरू ठेवा",
      crawl_odell: "ODELL चे वेब ऑफ ट्रस्ट क्रॉल करा",
      crawl_wot: "वेब ऑफ ट्रस्ट क्रॉल करा",
      pause: "थांबवा",
      reset: "रीसेट करा",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      copy_lightning_address: "लाइटनिंग ॲड्रेस कॉपी करा",
    },
    multinut: {
      use_multinut: "मल्टीनट वापरा",
    },
    advanced: {
      title: "प्रगत",
      developer: {
        title: "डेव्हलपर सेटिंग्ज",
        description: "खालील सेटिंग्ज डेव्हलपमेंट आणि डीबगिंगसाठी आहेत.",
        new_seed: {
          button: "नवीन सीड फ्रेज तयार करा",
          description:
            "यामुळे नवीन सीड फ्रेज तयार होईल. नवीन सीडने रीस्टोर करता यावे यासाठी तुम्हाला तुमची संपूर्ण शिल्लक स्वतःला पाठवावी लागेल.",
          confirm_question: "तुम्हाला खरोखर नवीन सीड फ्रेज तयार करायची आहे का?",
          cancel: "रद्द करा",
          confirm: "पुष्टी करा",
        },
        remove_spent: {
          button: "खर्च झालेले प्रूफ काढा",
          description:
            "तुमच्या सक्रिय मिंटचे ई-कॅश टोकन खर्च झाले आहेत का ते तपासा आणि खर्च झालेले टोकन वॉलेटमधून काढा. वॉलेट अडकले असेल तरच हे वापरा.",
        },
        debug_console: {
          button: "डीबग कन्सोल उघडा/बंद करा",
          description:
            "JavaScript डीबग टर्मिनल उघडा. तुम्हाला समजत नाही असे काहीही या टर्मिनलमध्ये पेस्ट करू नका. एखादा चोर तुम्हाला इथे हानिकारक कोड पेस्ट करायला लावण्याचा प्रयत्न करू शकतो.",
        },
        export_proofs: {
          button: "सक्रिय प्रूफ एक्सपोर्ट करा",
          description:
            "सक्रिय मिंटमधील तुमची संपूर्ण शिल्लक Cashu टोकन म्हणून क्लिपबोर्डवर कॉपी करा. यामुळे फक्त निवडलेल्या मिंट आणि युनिटचे टोकन एक्सपोर्ट होतील. पूर्ण एक्सपोर्टसाठी दुसरा मिंट आणि युनिट निवडून पुन्हा एक्सपोर्ट करा.",
        },
        keyset_counters: {
          title: "कीसेट काउंटर वाढवा",
          description:
            'तुमच्या वॉलेटमधील कीसेटचे डेरिव्हेशन पाथ काउंटर वाढवण्यासाठी कीसेट ID वर क्लिक करा. तुम्हाला "outputs have already been signed" त्रुटी दिसत असल्यास हे उपयोगी पडते.',
          counter: "काउंटर: {count}",
        },
        unset_reserved: {
          button: "सर्व राखीव टोकन मोकळे करा",
          description:
            'दुहेरी खर्चाचे प्रयत्न टाळण्यासाठी हे वॉलेट पाठवले जात असलेले प्रलंबित ई-कॅश राखीव मानते (आणि ते शिल्लकेतून वजा करते). हे बटण सर्व राखीव टोकन मोकळे करेल, जेणेकरून ते पुन्हा वापरता येतील. असे केल्यास तुमच्या वॉलेटमध्ये खर्च झालेले प्रूफ येऊ शकतात. ते काढण्यासाठी "खर्च झालेले प्रूफ काढा" बटण दाबा.',
        },
        show_onboarding: {
          button: "सुरुवातीची ओळख दाखवा",
          description: "सुरुवातीची ओळख स्क्रीन पुन्हा दाखवा.",
        },
        reset_wallet: {
          button: "वॉलेट डेटा रीसेट करा",
          description:
            "तुमचा वॉलेट डेटा रीसेट करा. सूचना: यामुळे सर्व काही पुसले जाईल! आधी बॅकअप नक्की घ्या.",
          confirm_question: "तुम्हाला खरोखर तुमचा वॉलेट डेटा पुसायचा आहे का?",
          cancel: "रद्द करा",
          confirm: "वॉलेट पुसा",
        },
        export_wallet: {
          button: "वॉलेट डेटा एक्सपोर्ट करा",
          description:
            "तुमच्या वॉलेटची प्रत डाउनलोड करा. नवीन वॉलेटच्या स्वागत स्क्रीनवर या फाइलमधून तुम्ही तुमचे वॉलेट रीस्टोर करू शकता. एक्सपोर्टनंतर वॉलेट वापरत राहिल्यास ही फाइल जुनी होईल.",
        },
        import_wallet: {
          button: "वॉलेट बॅकअप इम्पोर्ट करा",
          description:
            "आधी एक्सपोर्ट केलेल्या बॅकअप फाइलमधून तुमचे वॉलेट रीस्टोर करा. यामुळे तुमचा सध्याचा वॉलेट डेटा बॅकअपने बदलला जाईल.",
          confirm_question:
            "तुम्हाला खरोखर तुमचा वॉलेट डेटा रीस्टोर करायचा आहे का?",
          cancel: "रद्द करा",
          confirm: "वॉलेट बॅकअप इम्पोर्ट करा",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "एका मिंटशी जोडा",
    subtitle:
      "तुम्ही अजून कोणत्याही Cashu मिंटशी जोडलेले नाही. सुरुवात करण्यासाठी सेटिंग्जमध्ये मिंट URL जोडा किंवा नवीन मिंटकडून ई-कॅश मिळवा.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "ई-कॅश मिळवा",
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
        label: "इतिहास",
      },
      invoices: {
        label: "इनव्हॉइस",
      },
      mints: {
        label: "मिंट",
      },
    },
    install: {
      text: "इन्स्टॉल करा",
      tooltip: "Cashu इन्स्टॉल करा",
    },
  },
  AlreadyRunning: {
    title: "नाही.",
    text: "दुसरा टॅब आधीच चालू आहे. हा टॅब बंद करा आणि पुन्हा प्रयत्न करा.",
    actions: {
      retry: {
        label: "पुन्हा प्रयत्न करा",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "अरेरे. इथे काहीच नाही…",
    actions: {
      home: {
        label: "मुख्यपृष्ठावर परत जा",
      },
    },
  },
  BalanceView: {
    mintUrl: {
      label: "मिंट",
    },
    mintBalance: {
      label: "शिल्लक",
    },
    mintError: {
      label: "मिंट त्रुटी",
    },
    pending: {
      label: "प्रलंबित",
      tooltip: "सर्व प्रलंबित टोकन तपासा",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "मागे",
      },
      next: {
        label: "पुढे",
      },
    },
  },
  WelcomeSlide1: {
    title: "Cashu मध्ये तुमचे स्वागत आहे",
    text: "Cashu.me हे एक मोफत आणि ओपन-सोर्स बिटकॉइन वॉलेट आहे, जे तुमचे पैसे सुरक्षित आणि खाजगी ठेवण्यासाठी ई-कॅश वापरते.",
    actions: {
      more: {
        label: "अधिक जाणून घेण्यासाठी क्लिक करा",
      },
    },
    p1: {
      text: "Cashu हा बिटकॉइनसाठी एक मोफत आणि ओपन-सोर्स ई-कॅश प्रोटोकॉल आहे. त्याबद्दल तुम्ही { link } वर अधिक जाणून घेऊ शकता.",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "हे वॉलेट कोणत्याही मिंटशी संलग्न नाही. हे वॉलेट वापरण्यासाठी तुम्हाला विश्वास असलेल्या एक किंवा अधिक Cashu मिंटशी कनेक्ट व्हावे लागेल.",
    },
    p3: {
      text: "हे वॉलेट असे ई-कॅश ठेवते ज्यापर्यंत फक्त तुमचीच पोहोच आहे. सीड फ्रेजचा बॅकअप न घेता ब्राउझर डेटा पुसल्यास तुमचे टोकन हरवतील.",
    },
    p4: {
      text: "हे वॉलेट बीटा अवस्थेत आहे. पैशांपर्यंतची पोहोच गमावल्यास त्याची जबाबदारी आमची नाही. स्वतःच्या जोखमीवर वापरा! हा कोड ओपन-सोर्स असून MIT परवान्याखाली उपलब्ध आहे.",
    },
    terms_agreement: {
      text: "पुढे जाऊन तुम्ही { link } मान्य करता",
      link: "सेवेच्या अटी",
    },
  },
  WelcomeSlide2: {
    title: "PWA इन्स्टॉल करा",
    alt: {
      pwa_example: "PWA इन्स्टॉल करण्याचे उदाहरण",
    },
    installing: "इन्स्टॉल होत आहे…",
    instruction: {
      intro: {
        text: "सर्वोत्तम अनुभवासाठी हे वॉलेट तुमच्या डिव्हाइसच्या मूळ ब्राउझरमध्ये उघडा आणि प्रोग्रेसिव्ह वेब ॲप (PWA) म्हणून इन्स्टॉल करा.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "मेनूवर टॅप करा (वर उजवीकडे)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "{ buttonText } दाबा",
          buttonText: "@:AndroidPWAPrompt.buttonText",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "शेअरवर टॅप करा (खाली)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "{ buttonText } दाबा",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "डिव्हाइसवर ॲप इन्स्टॉल झाल्यावर ही ब्राउझर विंडो बंद करा आणि होम स्क्रीनवरून ॲप वापरा.",
      },
    },
    pwa: {
      success: {
        title: "यशस्वी!",
        text: "तुम्ही Cashu PWA म्हणून वापरत आहात. इतर उघड्या ब्राउझर विंडो बंद करा आणि होम स्क्रीनवरून ॲप वापरा.",
        nextSteps:
          "आता तुम्ही हा ब्राउझर टॅब बंद करून होम स्क्रीनवरून ॲप उघडू शकता.",
      },
    },
  },
  iOSPWAPrompt: {
    text: "{ icon } वर टॅप करा आणि { buttonText } निवडा",
    buttonText: "होम स्क्रीनवर जोडा",
  },
  AndroidPWAPrompt: {
    text: "{ icon } वर टॅप करा आणि { buttonText } निवडा",
    buttonText: "होम स्क्रीनवर जोडा",
  },
  WelcomeSlide3: {
    title: "तुमची सीड फ्रेज",
    text: "तुमची सीड फ्रेज पासवर्ड मॅनेजरमध्ये किंवा कागदावर लिहून ठेवा. हे डिव्हाइस हातातून गेल्यास पैसे परत मिळवण्याचा हाच एकमेव मार्ग आहे.",
    inputs: {
      seed_phrase: {
        label: "सीड फ्रेज",
        caption: "तुमची सीड फ्रेज तुम्ही सेटिंग्जमध्ये पाहू शकता.",
      },
      checkbox: {
        label: "मी ती लिहून ठेवली आहे",
      },
    },
  },
  WelcomeSlide4: {
    title: "अटी",
    actions: {
      more: {
        label: "सेवेच्या अटी वाचा",
      },
    },
    inputs: {
      checkbox: {
        label: "मी या अटी व शर्ती वाचल्या आहेत आणि मला त्या मान्य आहेत",
      },
    },
  },
  WelcomeSlideChoice: {
    title: "तुमचे वॉलेट सेट करा",
    text: "तुम्हाला सीड फ्रेजमधून वॉलेट परत मिळवायचे आहे की नवीन वॉलेट तयार करायचे आहे?",
    options: {
      new: {
        title: "नवीन वॉलेट तयार करा",
        subtitle: "नवीन सीड तयार करा आणि मिंट जोडा.",
      },
      recover: {
        title: "वॉलेट परत मिळवा",
        subtitle: "तुमची सीड फ्रेज टाका, मिंट आणि ई-कॅश रीस्टोर करा.",
      },
    },
  },
  WelcomeMintSetup: {
    title: "मिंट जोडा",
    text: "मिंट हे ई-कॅश पाठवायला आणि मिळवायला मदत करणारे सर्व्हर आहेत. सापडलेला मिंट निवडा किंवा स्वतः जोडा. नंतर जोडायचे असल्यास वगळा.",
    sections: {
      your_mints: "तुमचे मिंट",
    },
    restoring: "मिंट रीस्टोर होत आहेत…",
    placeholder: {
      mint_url: "https://",
    },
  },
  WelcomeRecoverSeed: {
    title: "तुमची सीड फ्रेज टाका",
    text: "वॉलेट परत मिळवण्यासाठी तुमची 12 शब्दांची सीड फ्रेज पेस्ट करा किंवा टाइप करा.",
    inputs: {
      word: "शब्द { index }",
    },
    actions: {
      paste_all: "सर्व पेस्ट करा",
    },
    disclaimer:
      "तुमची सीड फ्रेज फक्त याच डिव्हाइसवर तुमच्या वॉलेटच्या की तयार करण्यासाठी वापरली जाते.",
  },
  WelcomeRestoreEcash: {
    title: "तुमचे ई-कॅश रीस्टोर करा",
    text: "तुम्ही जोडलेल्या मिंटवर खर्च न झालेले प्रूफ शोधा आणि ते तुमच्या वॉलेटमध्ये जोडा.",
  },
  MintRatings: {
    title: "मिंट परीक्षणे",
    reviews: "परीक्षणे",
    ratings: "रेटिंग",
    no_reviews: "कोणतेही परीक्षण सापडले नाही",
    your_review: "तुमचे परीक्षण",
    no_reviews_to_display: "दाखवण्यासाठी कोणतेही परीक्षण नाही.",
    no_rating: "रेटिंग नाही",
    out_of: "पैकी",
    rows: "परीक्षणे",
    sort: "क्रम",
    sort_options: {
      newest: "सर्वात नवीन",
      oldest: "सर्वात जुने",
      highest: "सर्वाधिक",
      lowest: "सर्वात कमी",
    },
    actions: {
      write_review: "परीक्षण लिहा",
    },
    empty_state_subtitle:
      "परीक्षण लिहून मदत करा. या मिंटबद्दलचा तुमचा अनुभव सांगा आणि इतरांना मदत करा.",
  },
  CreateMintReview: {
    title: "मिंटचे परीक्षण",
    publishing_as: "या नावाने प्रकाशित",
    inputs: {
      rating: { label: "रेटिंग" },
      review: { label: "परीक्षण (ऐच्छिक)" },
    },
    actions: {
      publish: { label: "परीक्षण पाठवा", in_progress: "पाठवत आहे…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "सीड फ्रेजमधून रीस्टोर करा",
      caption:
        "तुमचे वॉलेट रीस्टोर करण्यासाठी तुमची सीड फ्रेज टाका. रीस्टोर करण्यापूर्वी आधी वापरलेले सर्व मिंट जोडले आहेत याची खात्री करा.",
      inputs: {
        seed_phrase: {
          label: "सीड फ्रेज",
          caption: "तुमची सीड फ्रेज तुम्ही सेटिंग्जमध्ये पाहू शकता.",
        },
      },
    },
    information: {
      label: "माहिती",
      caption:
        "विझार्ड फक्त दुसऱ्या सीड फ्रेजमधून ई-कॅश रीस्टोर करेल. तुम्ही ही सीड फ्रेज वापरू शकणार नाही किंवा सध्याच्या वॉलेटची सीड फ्रेज बदलू शकणार नाही. म्हणजेच, रीस्टोर केलेले ई-कॅश तुम्ही एकदा स्वतःला पाठवत नाही तोपर्यंत ते तुमच्या सध्याच्या सीड फ्रेजने सुरक्षित नसेल.",
    },
    restore_mints: {
      label: "मिंट रीस्टोर करा",
      caption:
        'रीस्टोर करण्यासाठी मिंट निवडा. मुख्य स्क्रीनवर "मिंट" मध्ये आणखी मिंट जोडून तुम्ही ते इथे रीस्टोर करू शकता.',
    },
    actions: {
      paste: {
        error: "क्लिपबोर्ड वाचता आला नाही.",
      },
      validate: {
        error: "ही वैध BIP39 सीड फ्रेज नाही.",
      },
      select_all: {
        label: "सर्व निवडा",
      },
      deselect_all: {
        label: "सर्व निवड रद्द करा",
      },
      restore: {
        label: "रीस्टोर करा",
        in_progress: "मिंट रीस्टोर होत आहे …",
        error: "मिंट रीस्टोर करताना त्रुटी: { error }",
      },
      restore_all_mints: {
        label: "सर्व मिंट रीस्टोर करा",
        in_progress: "{ length } पैकी मिंट { index } रीस्टोर होत आहे …",
        success: "रीस्टोर यशस्वीरीत्या पूर्ण झाले",
        error: "मिंट रीस्टोर करताना त्रुटी: { error }",
      },
      restore_selected_mints: {
        label: "निवडलेले मिंट रीस्टोर करा ({count})",
        in_progress: "{ length } पैकी मिंट { index } रीस्टोर होत आहे …",
        success: "{count} मिंट यशस्वीरीत्या रीस्टोर झाले",
        error: "निवडलेले मिंट रीस्टोर करताना त्रुटी: { error }",
      },
    },
    nostr_mints: {
      label: "Nostr वरून मिंट रीस्टोर करा",
      caption:
        "तुमच्या सीड फ्रेजने Nostr रिलेवर ठेवलेले मिंट बॅकअप शोधा. यामुळे आधी वापरलेले मिंट शोधायला मदत होईल.",
      search_button: "मिंट बॅकअप शोधा",
      select_all: "सर्व निवडा",
      deselect_all: "सर्व निवड रद्द करा",
      backed_up: "बॅकअप झाला",
      already_added: "आधीच जोडलेला",
      add_selected: "निवडलेले जोडा ({count})",
      no_backups_found: "कोणताही मिंट बॅकअप सापडला नाही",
      no_backups_hint:
        "तुमच्या मिंट यादीचा आपोआप बॅकअप घेण्यासाठी सेटिंग्जमध्ये Nostr मिंट बॅकअप सुरू करा.",
      invalid_mnemonic: "शोधण्यापूर्वी कृपया वैध सीड फ्रेज टाका.",
      search_error: "मिंट बॅकअप शोधता आले नाहीत.",
      add_error: "निवडलेले मिंट जोडता आले नाहीत.",
    },
  },
  MintSettings: {
    add: {
      title: "मिंट जोडा",
      description:
        "कनेक्ट होण्यासाठी Cashu मिंटचा URL टाका. हे वॉलेट कोणत्याही मिंटशी संलग्न नाही.",
      inputs: {
        nickname: {
          placeholder: "टोपणनाव (उदा. Testnet)",
        },
      },
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "अवैध URL",
        },
        scan: {
          label: "QR कोड स्कॅन करा",
        },
      },
    },
    discover: {
      title: "मिंट शोधा",
      overline: "शोधा",
      caption: "इतर वापरकर्त्यांनी Nostr वर शिफारस केलेले मिंट शोधा.",
      actions: {
        discover: {
          label: "मिंट शोधा",
          in_progress: "लोड होत आहे…",
          error_no_mints: "कोणताही मिंट सापडला नाही",
          success: "{ length } मिंट सापडले",
        },
      },
      recommendations: {
        overline: "{ length } मिंट सापडले",
        caption:
          "या मिंटची शिफारस इतर Nostr वापरकर्त्यांनी केली आहे. कोणताही मिंट वापरण्यापूर्वी सावध राहा आणि स्वतः माहिती घ्या.",
        actions: {
          browse: {
            label: "मिंट पाहण्यासाठी क्लिक करा",
          },
        },
      },
    },
    swap: {
      title: "स्वॅप",
      overline: "मल्टी-मिंट स्वॅप",
      actions: {
        receove_to_trusted_mint: {
          label: "विश्वासू मिंटमध्ये मिळवा",
        },
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
      },
      caption:
        "लाइटनिंगद्वारे मिंटमध्ये पैसे स्वॅप करा. लक्षात ठेवा: लाइटनिंग शुल्कासाठी थोडी जागा ठेवा. येणारे पेमेंट यशस्वी न झाल्यास इनव्हॉइस स्वतः तपासा.",
      inputs: {
        from: {
          label: "कडून",
        },
        to: {
          label: "कडे",
        },
        amount: {
          label: "रक्कम ({ ticker })",
        },
      },
    },
    error_badge: "त्रुटी",
    reviews_text: "परीक्षणे",
    no_reviews_yet: "अजून परीक्षणे नाहीत",
    discover_mints_button: "मिंट शोधा",
  },
  QrcodeReader: {
    progress: {
      text: "{ percentage }{ addon }",
      percentage: "{ percentage }%",
      keep_scanning_text: " - स्कॅन करत राहा",
    },
    errors: {
      camera_permission:
        "कॅमेरा वापरण्याची परवानगी मिळाली नाही. QR कोड स्कॅन करण्यासाठी ब्राउझर किंवा डिव्हाइस सेटिंग्जमध्ये कॅमेऱ्याला परवानगी द्या.",
      camera_not_found: "या डिव्हाइसवर कॅमेरा सापडला नाही.",
      camera_unavailable: "कॅमेरा सुरू करता आला नाही.",
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
    title: "लाइटनिंगने मिळवा",
    create_invoice_title: "इनव्हॉइस तयार करा",
    inputs: {
      amount: {
        label: "रक्कम ({ ticker }) *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "इनव्हॉइस तयार करा",
        label_blocked: "इनव्हॉइस तयार होत आहे…",
        in_progress: "तयार होत आहे",
      },
    },
    invoice: {
      caption: "लाइटनिंग इनव्हॉइस",
      status_paid_text: "भरले!",
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
    title: "पाठवा",
    actions: {
      ecash: {
        label: "ई-कॅश",
        error_no_mints: "कोणताही मिंट उपलब्ध नाही",
      },
      lightning: {
        label: "लाइटनिंग",
        error_no_mints: "कोणताही मिंट उपलब्ध नाही",
      },
    },
  },
  SendTokenDialog: {
    title: "ई-कॅश पाठवा",
    title_ecash_text: "ई-कॅश",
    badge_offline_text: "ऑफलाइन",
    inputs: {
      amount: {
        label: "रक्कम ({ ticker }) *",
        invalid_too_much_error_text: "खूप जास्त",
      },
      p2pk_pubkey: {
        label: "प्राप्तकर्त्याची पब्लिक की",
        label_invalid: "प्राप्तकर्त्याची पब्लिक की",
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
        tooltip_text: "इमोजी कॉपी करा",
      },
      copy_tokens: {
        label: "@:global.actions.copy.label",
      },
      copy_link: {
        tooltip_text: "लिंक कॉपी करा",
      },
      share: {
        tooltip_text: "ई-कॅश शेअर करा",
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
        in_progress: "पाठवत आहे…",
      },
      delete: {
        tooltip_text: "इतिहासातून काढा",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "NFC कार्डवर लिहा",
          ndef_unsupported_text: "NDEF समर्थित नाही",
        },
      },
    },
    errors: {
      amount_required: "आधी रक्कम टाका.",
      serialization_failed: "ई-कॅश टोकन तयार करता आले नाही.",
      mint_not_allowed_by_request:
        "ही पेमेंट विनंती निवडलेला मिंट स्वीकारत नाही.",
      unit_not_matching_request:
        "या पेमेंट विनंतीचे पैसे {unit} मध्ये भरायला हवेत.",
      mint_lacks_request_methods:
        "या विनंतीसाठी लागणाऱ्या पेमेंट पद्धतींना निवडलेला मिंट समर्थन देत नाही.",
    },
    payment_request: {
      method_fee: "या मिंटमधून भरल्यास {fee} अतिरिक्त शुल्क",
    },
  },
  SendPaymentRequest: {
    actions: {
      pay: {
        label: "पैसे भरा",
      },
      pay_via: {
        label: "{transport} द्वारे पैसे भरा",
      },
    },
    info: {
      pay_to: "{target} ला पैसे भरा",
      invalid_url: "अवैध URL",
    },
  },
  PaymentRequestInfo: {
    title_with_transport: "{transport} द्वारे पेमेंट विनंती",
    title: "पेमेंट विनंती",
    subtitle: "{target} ला पैसे भरा",
    subtitle_fallback: "पेमेंट विनंती",
    invalid_url: "अवैध URL",
  },
  ReceiveDialog: {
    title: "मिळवा",
    actions: {
      ecash: {
        label: "ई-कॅश",
        error_no_mints: "कोणताही मिंट उपलब्ध नाही",
      },
      lightning: {
        label: "लाइटनिंग",
        error_no_mints:
          "लाइटनिंगने पैसे मिळवण्यासाठी तुम्हाला एखाद्या मिंटशी कनेक्ट व्हावे लागेल",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "ई-कॅश मिळवा",
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      scan: {
        label: "@:global.actions.scan.label",
      },
      request: {
        label: "विनंती",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      nfc: {
        label: "NFC",
        scanning_text: "स्कॅन होत आहे…",
      },
    },
  },
  ReceiveTokenDialog: {
    title: "ई-कॅश मिळवा",
    title_ecash_text: "ई-कॅश",
    inputs: {
      tokens_base64: {
        label: "Cashu टोकन पेस्ट करा",
      },
    },
    errors: {
      invalid_token: {
        label: "अवैध टोकन",
      },
      p2pk_lock_mismatch: {
        label:
          "मिळवता येत नाही. या टोकनचा P2PK लॉक तुमच्या पब्लिक कीशी जुळत नाही.",
      },
    },
    unknown_mint_info_text: "अनोळखी मिंट. हे टोकन मिळाल्यानंतर तो जोडला जाईल.",
    swap_section: {
      title: "स्वॅप",
      source_label: "कडून",
      destination_label: "कडे",
      fee_info: "या स्वॅपवर लाइटनिंग नेटवर्क शुल्क लागेल.",
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
        label_adding_mint: "मिंट जोडत आहे…",
      },
      swap: {
        label: "विश्वासू मिंटमध्ये मिळवा",
        tooltip_text: "विश्वासू मिंटमध्ये स्वॅप करा",
        caption: "{ value } स्वॅप करा",
        processing: "स्वॅप होत आहे...",
        failed: "स्वॅप अयशस्वी",
      },
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "स्वॅप रद्द करा",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      receive_to_selected_mint: {
        label: "निवडलेल्या मिंटमध्ये मिळवा",
      },
      later: {
        label: "नंतर मिळवा",
        tooltip_text: "नंतर मिळवण्यासाठी इतिहासात जोडा",
        already_in_history_success_text: "ई-कॅश आधीच इतिहासात आहे",
        added_to_history_success_text: "ई-कॅश इतिहासात जोडले",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "NFC कार्डमधून वाचा",
          ndef_unsupported_text: "NDEF समर्थित नाही",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "P2PK की",
      description: "या कीवर लॉक केलेले ई-कॅश मिळवा",
      used_warning_text:
        "सूचना: ही की आधी वापरली गेली आहे. चांगल्या गोपनीयतेसाठी नवीन की वापरा.",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_key: {
        label: "नवीन की तयार करा",
      },
    },
  },
  PaymentRequestDialog: {
    payment_request: {
      caption: "पेमेंट विनंती",
      description: "Nostr द्वारे पेमेंट मिळवा",
    },
    received_total: "एकूण मिळाले",
    no_payments_yet: "अजून कोणतेही पेमेंट नाही",
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "नवीन विनंती",
      },
      add_amount: {
        label: "रक्कम जोडा",
      },
      use_active_mint: {
        label: "कोणताही मिंट",
      },
      delete: {
        label: "काढा",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
    inputs: {
      amount: {
        placeholder: "रक्कम टाका",
      },
      description: {
        placeholder: "वर्णन जोडा",
      },
      lock: {
        label: "माझ्या कीवर लॉक करा",
      },
    },
    delete_dialog: {
      title: "विनंती काढा",
      text: "ही विनंती यादीतून काढायची? आधी मिळालेली पेमेंट तुमच्या इतिहासात राहतील, आणि यावर येणारी पेमेंट तरीही पोहोचतील.",
    },
  },
  NumericKeyboard: {
    actions: {
      close: {
        label: "@:global.actions.close.label",
        closed_info_text:
          "कीबोर्ड बंद आहे. तुम्ही तो सेटिंग्जमध्ये पुन्हा सुरू करू शकता.",
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
        "NWC ने तुमचे वॉलेट दूरून चालवा. सुसंगत ॲपशी वॉलेट जोडण्यासाठी QR कोड दाबा.",
      warning_text:
        "सूचना: ही कनेक्शन स्ट्रिंग ज्याच्याकडे असेल तो तुमच्या वॉलेटमधून पेमेंट करू शकतो. कोणालाही देऊ नका!",
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
    title: "मिंट संदेश",
  },
  MintDetailsDialog: {
    contact: {
      title: "संपर्क",
    },
    details: {
      title: "मिंट तपशील",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Nuts",
        actions: {
          show: {
            label: "सर्व पाहा",
          },
          hide: {
            label: "लपवा",
          },
        },
      },
      currency: {
        label: "चलन",
      },
      currencies: {
        label: "@:MintDetailsDialog.details.currency.label",
      },
      version: {
        label: "आवृत्ती",
      },
    },
    actions: {
      title: "कृती",
      copy_mint_url: {
        label: "मिंट URL कॉपी करा",
      },
      delete: {
        label: "मिंट काढा",
      },
      edit: {
        label: "मिंट संपादित करा",
      },
    },
  },
  ChooseMint: {
    title: "एक मिंट निवडा",
    placeholder: "एक मिंट निवडा",
    available_text: "उपलब्ध",
    sheet_title: "मिंट निवडा",
    badge_mint_error_text: "त्रुटी",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
  },
  HistoryTable: {
    empty_text: "अजून इतिहास नाही",
    row: {
      type_label: "ई-कॅश",
      date_label: "{ value } पूर्वी",
    },
    actions: {
      check_status: {
        tooltip_text: "स्थिती तपासा",
      },
      receive: {
        tooltip_text: "मिळवा",
      },
      filter_pending: {
        label: "प्रलंबित दाखवा",
      },
      show_all: {
        label: "सर्व दाखवा",
      },
    },
    old_token_not_found_error_text: "जुने टोकन सापडले नाही",
  },
  InvoiceTable: {
    empty_text: "अजून इनव्हॉइस नाहीत",
    row: {
      type_label: "लाइटनिंग",
      type_tooltip_text: "कॉपी करण्यासाठी क्लिक करा",
      date_label: "{ value } पूर्वी",
    },
    actions: {
      check_status: {
        tooltip_text: "स्थिती तपासा",
      },
      filter_pending: {
        label: "प्रलंबित दाखवा",
      },
      show_all: {
        label: "सर्व दाखवा",
      },
    },
  },
  RemoveMintDialog: {
    title: "तुम्हाला खरोखर हा मिंट काढायचा आहे का?",
    nickname: {
      label: "टोपणनाव",
    },
    balances: {
      label: "शिल्लक",
    },
    warning_text:
      "लक्षात ठेवा: हे वॉलेट अतिशय काळजी घेते, त्यामुळे या मिंटमधील तुमचे ई-कॅश प्रत्यक्षात पुसले जाणार नाही, तर तुमच्या डिव्हाइसवरच राहील. नंतर हा मिंट पुन्हा जोडल्यास ते पुन्हा दिसू लागेल.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "मिंट काढा",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  ParseInputComponent: {
    placeholder: {
      default: "Cashu टोकन किंवा लाइटनिंग ॲड्रेस",
      receive: "Cashu टोकन",
      pay: "लाइटनिंग ॲड्रेस किंवा इनव्हॉइस",
    },
    qr_scanner: {
      title: "QR कोड स्कॅन करा",
      description: "ॲड्रेस स्कॅन करण्यासाठी टॅप करा",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    input_data: {
      title: "लाइटनिंगने पैसे भरा",
      title_bolt12: "लाइटनिंग Bolt12 ने पैसे भरा",
      inputs: {
        invoice_data: {
          label: "लाइटनिंग इनव्हॉइस किंवा ॲड्रेस",
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
      amount_exact_label: "{ payee } { value } { ticker } मागत आहेत",
      amount_range_label:
        "{ payee } मागत आहेत{br}{ min } ते { max } { ticker } दरम्यान",
      sending_to_lightning_address: "{ address } ला पाठवत आहे",
      inputs: {
        amount: {
          label: "रक्कम ({ ticker }) *",
        },
        comment: {
          label: "टिप्पणी (ऐच्छिक)",
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
      title: "{ value } भरा",
      paying: "भरत आहे",
      paid: "भरले",
      fee: "शुल्क",
      memo: {
        label: "मेमो",
      },
      processing_info_text: "प्रक्रिया सुरू आहे…",
      balance_too_low_warning_text: "शिल्लक खूप कमी आहे",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        pay: {
          label: "पैसे भरा",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
          waiting_for_wallet: "वॉलेटची वाट पाहत आहे…",
          error: "त्रुटी",
        },
      },
    },
  },
  EditMintDialog: {
    title: "मिंट संपादित करा",
    inputs: {
      nickname: {
        label: "टोपणनाव",
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
    title: "तुमचा या मिंटवर विश्वास आहे का?",
    description:
      "या मिंटवर विश्वास असेल तरच जोडा. मिंट कधीही काम बंद करू शकतात.",
    unreachable_error_text:
      "हा मिंट पोहोचण्याजोगा नाही. URL आणि तुमचे कनेक्शन तपासा, मग पुन्हा प्रयत्न करा.",
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
        in_progress: "मिंट जोडत आहे",
      },
    },
    audit_info: {
      label: "ऑडिट माहिती",
      actions: {
        show: {
          label: "दाखवा",
        },
        hide: {
          label: "लपवा",
        },
      },
    },
  },
  restore: {
    mnemonic_error_text: "कृपया सीड फ्रेज टाका",
    restore_mint_error_text: "मिंट रीस्टोर करताना त्रुटी: { error }",
    prepare_info_text: "रीस्टोरची तयारी सुरू आहे …",
    restored_proofs_for_keyset_info_text:
      "कीसेट { keysetId } साठी { restoreCounter } प्रूफ रीस्टोर झाले",
    checking_proofs_for_keyset_info_text:
      "कीसेट { keysetId } साठी प्रूफ { startIndex } ते { endIndex } तपासत आहे",
    no_proofs_info_text: "रीस्टोर करण्यासाठी कोणतेही प्रूफ सापडले नाहीत",
    restored_amount_success_text: "{ amount } रीस्टोर झाले",
  },
  swap: {
    in_progress_warning_text: "स्वॅप सुरू आहे",
    invalid_swap_data_error_text: "अवैध स्वॅप डेटा",
    swap_error_text: "स्वॅप करताना त्रुटी",
  },
  TokenInformation: {
    fee: "शुल्क",
    unit: "युनिट",
    fiat: "फियाट",
    p2pk: "P2PK",
    locked: "लॉक",
    locked_to_you: "तुमच्यावर लॉक",
    mint: "मिंट",
    memo: "मेमो",
    payment_request: "पेमेंट विनंती",
    nostr: "Nostr",
    token_copied: "टोकन क्लिपबोर्डवर कॉपी झाले",
  },
};
