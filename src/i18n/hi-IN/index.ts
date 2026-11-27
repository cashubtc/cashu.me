export default {
  global: {
    copy_to_clipboard: {
      success: "क्लिपबोर्ड पर कॉपी हो गया!",
    },
    actions: {
      add_mint: {
        label: "मिंट जोड़ें",
      },
      cancel: {
        label: "रद्द करें",
      },
      copy: {
        label: "कॉपी करें",
      },
      close: {
        label: "बंद करें",
      },
      enter: {
        label: "दर्ज करें",
      },
      lock: {
        label: "लॉक करें",
      },
      paste: {
        label: "पेस्ट करें",
      },
      receive: {
        label: "प्राप्त करें",
      },
      scan: {
        label: "स्कैन करें",
      },
      send: {
        label: "भेजें",
      },
      pay: {
        label: "भुगतान करें",
      },
      swap: {
        label: "स्वैप करें",
      },
      update: {
        label: "अपडेट करें",
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
    payment: "मल्टीनट भुगतान",
    selectMints: "भुगतान करने के लिए एक या अधिक मिंट चुनें।",
    totalSelectedBalance: "चुना गया कुल बैलेंस",
    multiMintPay: "मल्टी-मिंट भुगतान",
    balanceNotEnough: "इस इनवॉइस के लिए मल्टी-मिंट बैलेंस पर्याप्त नहीं है",
    failed: "प्रक्रिया विफल रही: {error}",
    paid: "लाइटनिंग से {amount} का भुगतान हुआ",
  },
  wallet: {
    notifications: {
      balance_too_low: "बैलेंस बहुत कम है",
      received: "{amount} प्राप्त हुए",
      fee: " (शुल्क: {fee})",
      could_not_request_mint: "मिंट से अनुरोध नहीं हो सका",
      invoice_still_pending: "इनवॉइस अभी भी लंबित है",
      paid_lightning: "लाइटनिंग से {amount} का भुगतान हुआ",
      payment_pending_refresh: "भुगतान लंबित है। इनवॉइस को खुद रीफ़्रेश करें।",
      sent: "{amount} भेजे गए",
      token_still_pending: "टोकन अभी भी लंबित है",
      history_save_failed: "इतिहास में सेव नहीं हो सका",
      history_delete_failed: "इतिहास से हटाया नहीं जा सका",
      received_lightning: "लाइटनिंग से {amount} प्राप्त हुए",
      lightning_payment_failed: "लाइटनिंग भुगतान विफल रहा",
      failed_to_decode_invoice: "इनवॉइस पढ़ा नहीं जा सका",
      unsupported_legacy_qr: "असमर्थित पुराना QR कोड",
      legacy_qr_not_supported:
        "यह पुराना QR कोड किसी समर्थित व्यापारी का नहीं है",
      invalid_lnurl: "अमान्य LNURL",
      lnurl_error: "LNURL त्रुटि",
      no_amount: "कोई राशि नहीं",
      no_lnurl_data: "कोई LNURL डेटा नहीं",
      no_price_data: "कीमत का कोई डेटा नहीं।",
      please_try_again: "कृपया फिर से कोशिश करें।",
      trying_again: "फिर से कोशिश की जा रही है...",
      no_bolt12_mint: "आपका कोई भी मिंट BOLT12 ऑफ़र का समर्थन नहीं करता",
      no_bolt11_mint: "आपका कोई भी मिंट BOLT11 इनवॉइस का समर्थन नहीं करता",
    },
    mint: {
      notifications: {
        already_added: "मिंट पहले से जुड़ा है",
        added: "मिंट जोड़ा गया",
        not_found: "मिंट नहीं मिला",
        activation_failed: "मिंट सक्रिय नहीं हो सका",
        no_active_mint: "कोई सक्रिय मिंट नहीं",
        unit_activation_failed: "यूनिट सक्रिय नहीं हो सकी",
        unit_not_supported: "मिंट इस यूनिट का समर्थन नहीं करता",
        activated: "मिंट सक्रिय हुआ",
        could_not_connect: "मिंट से कनेक्ट नहीं हो सका",
        could_not_get_info: "मिंट की जानकारी नहीं मिल सकी",
        could_not_get_keys: "मिंट की कुंजियाँ नहीं मिल सकीं",
        could_not_get_keysets: "मिंट के कीसेट नहीं मिल सके",
        mint_validation_error: "मिंट सत्यापन त्रुटि",
        removed: "मिंट हटाया गया",
        error: "मिंट त्रुटि",
      },
    },
  },
  MainHeader: {
    menu: {
      settings: {
        title: "सेटिंग्स",
        settings: {
          title: "सेटिंग्स",
          caption: "वॉलेट कॉन्फ़िगरेशन",
        },
      },
      terms: {
        title: "शर्तें",
        terms: {
          title: "शर्तें",
          caption: "सेवा की शर्तें",
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
          title: "दान करें",
          caption: "Cashu का समर्थन करें",
        },
      },
    },
    offline: {
      warning: {
        text: "ऑफ़लाइन",
      },
    },
    reload: {
      warning: {
        text: "{ countdown } में रीलोड होगा",
      },
    },
    staging: {
      warning: {
        text: "स्टेजिंग – असली पैसों के साथ इस्तेमाल न करें!",
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
      title: "सेटिंग्स",
      backup: {
        title: "बैकअप और रीस्टोर",
        caption: "सीड फ़्रेज़ और ई-कैश रिकवरी",
      },
      lightning_address: {
        title: "लाइटनिंग एड्रेस",
        caption: "अपने लाइटनिंग एड्रेस पर भुगतान प्राप्त करें",
      },
      nostr: {
        title: "Nostr",
        caption: "कुंजियाँ, रिले और वेब ऑफ़ ट्रस्ट",
      },
      payment_requests: {
        title: "भुगतान अनुरोध",
        caption: "Nostr के ज़रिए ई-कैश भुगतान प्राप्त करें",
      },
      nwc: {
        title: "Nostr Wallet Connect",
        caption: "दूसरे ऐप्स से अपना वॉलेट इस्तेमाल करें",
      },
      hardware: {
        title: "हार्डवेयर",
        caption: "NFC कार्ड सेटिंग्स",
      },
      p2pk: {
        title: "P2PK",
        caption: "अपनी कुंजियों पर लॉक किया गया ई-कैश प्राप्त करें",
      },
      privacy: {
        title: "गोपनीयता",
        caption: "नेटवर्क जाँच और बिटकॉइन की कीमत",
      },
      experimental: {
        title: "प्रायोगिक",
        caption: "नई सुविधाएँ पहले आज़माएँ",
      },
      appearance: {
        title: "रूप-रंग",
        caption: "थीम, कीबोर्ड और बिटकॉइन चिह्न",
      },
      language: {
        title: "भाषा",
        caption: "अपनी भाषा चुनें",
      },
      advanced: {
        title: "उन्नत",
        caption: "डेवलपर टूल और वॉलेट रीसेट",
      },
      about: {
        title: "परिचय",
        caption: "शर्तें और लिंक",
      },
    },
    language: {
      title: "भाषा",
      description: "कृपया नीचे दी गई सूची से अपनी पसंदीदा भाषा चुनें।",
    },
    sections: {
      backup_restore: "बैकअप और रीस्टोर",
      lightning_address: "लाइटनिंग एड्रेस",
      nostr_keys: "NOSTR कुंजियाँ",
      nostr: {
        title: "NOSTR",
        relays: {
          expand_label: "रिले बदलने के लिए क्लिक करें",
          add: {
            title: "रिले जोड़ें",
            description:
              "आपका वॉलेट भुगतान अनुरोध, Nostr Wallet Connect और बैकअप जैसे Nostr कामों के लिए इन रिले का इस्तेमाल करता है।",
          },
          list: {
            title: "रिले",
            description: "आपका वॉलेट इन रिले से कनेक्ट होगा।",
            copy_tooltip: "रिले कॉपी करें",
            remove_tooltip: "रिले हटाएँ",
          },
        },
      },
      payment_requests: "भुगतान अनुरोध",
      nostr_wallet_connect: "NOSTR WALLET CONNECT",
      hardware_features: "हार्डवेयर सुविधाएँ",
      p2pk_features: "P2PK सुविधाएँ",
      privacy: "गोपनीयता",
      experimental: "प्रायोगिक",
      appearance: "रूप-रंग",
    },
    backup_restore: {
      backup_seed: {
        title: "सीड फ़्रेज़ का बैकअप",
        description:
          "आपकी सीड फ़्रेज़ से आपका वॉलेट वापस पाया जा सकता है। इसे सुरक्षित और निजी रखें।",
        seed_phrase_label: "सीड फ़्रेज़",
      },
      restore_ecash: {
        title: "ई-कैश रीस्टोर करें",
        description:
          "रीस्टोर विज़र्ड से आप किसी सीड फ़्रेज़ से खोया हुआ ई-कैश वापस पा सकते हैं। आपके मौजूदा वॉलेट की सीड फ़्रेज़ नहीं बदलेगी, विज़र्ड सिर्फ़ किसी दूसरी सीड फ़्रेज़ से ई-कैश रीस्टोर करने देगा।",
        button: "रीस्टोर करें",
      },
    },
    lightning_address: {
      title: "लाइटनिंग एड्रेस",
      description: "अपने लाइटनिंग एड्रेस पर भुगतान प्राप्त करें।",
      enable: {
        toggle: "चालू करें",
        description: "npub.cash के साथ लाइटनिंग एड्रेस",
      },
      address: {
        copy_tooltip: "लाइटनिंग एड्रेस कॉपी करें",
      },
      show_on_receive: {
        toggle: "प्राप्त करते समय दिखाएँ",
        description: "एड्रेस और QR कोड दिखाएँ।",
      },
      automatic_claim: {
        toggle: "अपने-आप क्लेम करें",
        description: "आने वाले भुगतान अपने-आप प्राप्त करें।",
      },
      mint: {
        label: "npub.cash मिंट",
        choose_title: "npub.cash के लिए मिंट चुनें",
        choose_placeholder: "एक मिंट चुनें...",
      },
    },
    nostr_keys: {
      title: "आपकी Nostr कुंजियाँ",
      description: "आपकी Nostr कुंजियों से आपका लाइटनिंग एड्रेस तय होगा।",
      wallet_seed: {
        title: "वॉलेट सीड फ़्रेज़",
        description: "वॉलेट सीड से Nostr कुंजी-जोड़ी बनाएँ",
        copy_nsec: "nsec कॉपी करें",
      },
      nsec_bunker: {
        title: "Nsec बंकर",
        description: "NIP-46 बंकर इस्तेमाल करें",
        delete_tooltip: "कनेक्शन हटाएँ",
      },
      use_nsec: {
        title: "अपनी nsec इस्तेमाल करें",
        description: "यह तरीका जोखिम भरा है और इसकी सलाह नहीं दी जाती",
        delete_tooltip: "nsec हटाएँ",
      },
      signing_extension: {
        title: "साइनिंग एक्सटेंशन",
        description: "NIP-07 साइनिंग एक्सटेंशन इस्तेमाल करें",
        not_found: "कोई NIP-07 साइनिंग एक्सटेंशन नहीं मिला",
      },
    },
    payment_requests: {
      title: "भुगतान अनुरोध",
      description:
        "भुगतान अनुरोधों से आप Nostr के ज़रिए भुगतान प्राप्त कर सकते हैं। इसे चालू करने पर आपका वॉलेट आपके Nostr रिले से जुड़ जाएगा।",
      enable_toggle: "भुगतान अनुरोध चालू करें",
      claim_automatically: {
        toggle: "अपने-आप क्लेम करें",
        description: "आने वाले भुगतान अपने-आप प्राप्त करें।",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Wallet Connect (NWC)",
      description: "NWC से किसी भी दूसरे ऐप से अपना वॉलेट चलाएँ।",
      enable_toggle: "NWC चालू करें",
      payments_note:
        "NWC से आप सिर्फ़ अपने बिटकॉइन बैलेंस से भुगतान कर सकते हैं। भुगतान आपके सक्रिय मिंट से होंगे।",
      connection: {
        copy_tooltip: "कनेक्शन स्ट्रिंग कॉपी करें",
        qr_tooltip: "QR कोड दिखाएँ",
        allowance_label: "बची हुई सीमा (sat)",
      },
    },
    hardware_features: {
      webnfc: {
        title: "WebNFC",
        description: "NFC कार्ड पर लिखने के लिए एन्कोडिंग चुनें",
        text: {
          title: "टेक्स्ट",
          description: "टोकन सादे टेक्स्ट में रखें",
        },
        weburl: {
          title: "URL",
          description: "टोकन के साथ इस वॉलेट का URL रखें",
        },
        binary: {
          title: "बाइनरी",
          description: "टोकन बाइनरी डेटा के रूप में रखें",
        },
        quick_access: {
          toggle: "NFC तक जल्दी पहुँच",
          description:
            "'ई-कैश प्राप्त करें' मेन्यू में NFC कार्ड जल्दी स्कैन करें। यह विकल्प 'ई-कैश प्राप्त करें' मेन्यू में एक NFC बटन जोड़ता है।",
        },
      },
    },
    p2pk_features: {
      title: "P2PK",
      description:
        "P2PK-लॉक ई-कैश प्राप्त करने के लिए एक कुंजी-जोड़ी बनाएँ। चेतावनी: यह सुविधा प्रायोगिक है। सिर्फ़ छोटी राशि के साथ इस्तेमाल करें। अगर आपकी निजी कुंजियाँ खो गईं, तो उन पर लॉक किया गया ई-कैश कोई भी अनलॉक नहीं कर पाएगा।",
      generate_button: "कुंजी बनाएँ",
      import_button: "nsec इम्पोर्ट करें",
      quick_access: {
        toggle: "लॉक तक जल्दी पहुँच",
        description:
          "इससे 'ई-कैश प्राप्त करें' मेन्यू में आपकी P2PK लॉकिंग कुंजी जल्दी दिखती है।",
      },
      keys_expansion: {
        label: "{count} कुंजियाँ देखने के लिए क्लिक करें",
        used_badge: "इस्तेमाल हो चुकी",
      },
    },
    privacy: {
      title: "गोपनीयता",
      description: "ये सेटिंग्स आपकी गोपनीयता पर असर डालती हैं।",
      check_incoming: {
        toggle: "आने वाला इनवॉइस जाँचें",
        description:
          "चालू होने पर वॉलेट बैकग्राउंड में नया इनवॉइस जाँचेगा। इससे वॉलेट तेज़ी से जवाब देता है, पर आपकी पहचान (फ़िंगरप्रिंटिंग) आसान हो जाती है। आप 'इनवॉइस' टैब में बिना भुगतान वाले इनवॉइस खुद जाँच सकते हैं।",
      },
      check_startup: {
        toggle: "शुरू होने पर लंबित इनवॉइस जाँचें",
        description: "चालू होने पर वॉलेट शुरू होते ही लंबित इनवॉइस जाँचेगा।",
      },
      check_all: {
        toggle: "सभी इनवॉइस जाँचें",
        description:
          "चालू होने पर वॉलेट दो हफ़्तों तक बैकग्राउंड में समय-समय पर बिना भुगतान वाले इनवॉइस जाँचेगा। इससे वॉलेट की ऑनलाइन गतिविधि बढ़ती है और आपकी पहचान (फ़िंगरप्रिंटिंग) आसान हो जाती है। आप 'इनवॉइस' टैब में बिना भुगतान वाले इनवॉइस खुद जाँच सकते हैं।",
      },
      check_sent: {
        toggle: "भेजा गया ई-कैश जाँचें",
        description:
          "चालू होने पर वॉलेट समय-समय पर बैकग्राउंड में जाँचेगा कि भेजे गए टोकन रिडीम हुए या नहीं। इससे वॉलेट की ऑनलाइन गतिविधि बढ़ती है और आपकी पहचान (फ़िंगरप्रिंटिंग) आसान हो जाती है।",
      },
      websockets: {
        toggle: "WebSockets इस्तेमाल करें",
        description:
          "चालू होने पर वॉलेट मिंट से भुगतान हुए इनवॉइस और खर्च हुए टोकन की जानकारी पाने के लिए लंबे समय तक चलने वाले WebSocket कनेक्शन इस्तेमाल करेगा। इससे वॉलेट तेज़ी से जवाब देता है, पर आपकी पहचान (फ़िंगरप्रिंटिंग) भी आसान हो जाती है।",
      },
      bitcoin_price: {
        toggle: "Coinbase से विनिमय दर लें",
        description:
          "चालू होने पर बिटकॉइन की मौजूदा विनिमय दर coinbase.com से ली जाएगी और आपका बदला हुआ बैलेंस दिखेगा।",
        currency: {
          title: "फ़िएट मुद्रा",
          description: "बिटकॉइन की कीमत दिखाने के लिए फ़िएट मुद्रा चुनें।",
        },
      },
    },
    experimental: {
      title: "प्रायोगिक",
      description: "ये सुविधाएँ प्रायोगिक हैं।",
      receive_swaps: {
        toggle: "प्राप्ति पर स्वैप",
        badge: "बीटा",
        description:
          "'ई-कैश प्राप्त करें' डायलॉग में प्राप्त ई-कैश को अपने सक्रिय मिंट में स्वैप करने का विकल्प।",
      },
      auto_paste: {
        toggle: "ई-कैश अपने-आप पेस्ट करें",
        description:
          "जब आप 'प्राप्त करें', फिर 'ई-कैश', फिर 'पेस्ट करें' दबाते हैं, तो क्लिपबोर्ड का ई-कैश अपने-आप पेस्ट हो जाता है। iOS पर अपने-आप पेस्ट करने से स्क्रीन में गड़बड़ी हो सकती है, दिक्कत हो तो इसे बंद करें।",
      },
      auditor: {
        toggle: "ऑडिटर चालू करें",
        badge: "बीटा",
        description:
          "चालू होने पर वॉलेट मिंट विवरण डायलॉग में ऑडिटर की जानकारी दिखाएगा। ऑडिटर एक तीसरे पक्ष की सेवा है जो मिंट की विश्वसनीयता पर नज़र रखती है।",
        url_label: "ऑडिटर URL",
        api_url_label: "ऑडिटर API URL",
      },
      multinut: {
        toggle: "मल्टीनट चालू करें",
        description:
          "चालू होने पर वॉलेट एक साथ कई मिंट से इनवॉइस का भुगतान करने के लिए मल्टीनट इस्तेमाल करेगा।",
      },
      nostr_mint_backup: {
        toggle: "मिंट सूची का Nostr पर बैकअप",
        description:
          "चालू होने पर आपकी मिंट सूची आपकी Nostr कुंजियों से Nostr रिले पर अपने-आप बैकअप होगी। इससे आप दूसरे डिवाइस पर भी अपनी मिंट सूची वापस पा सकते हैं।",
        notifications: {
          enabled: "Nostr मिंट बैकअप चालू हुआ",
          disabled: "Nostr मिंट बैकअप बंद हुआ",
          failed: "Nostr मिंट बैकअप चालू नहीं हो सका",
        },
      },
    },
    appearance: {
      keyboard: {
        title: "ऑन-स्क्रीन कीबोर्ड",
        description: "राशि डालने के लिए अंकों वाला कीबोर्ड इस्तेमाल करें।",
        toggle: "अंकों वाला कीबोर्ड इस्तेमाल करें",
        toggle_description:
          "चालू होने पर राशि डालने के लिए अंकों वाला कीबोर्ड इस्तेमाल होगा।",
      },
      theme: {
        title: "रूप-रंग",
        description: "बदलें कि आपका वॉलेट कैसा दिखे।",
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
        title: "बिटकॉइन चिह्न",
        description: "sats की जगह ₿ चिह्न इस्तेमाल करें।",
        toggle: "₿ चिह्न इस्तेमाल करें",
      },
    },
    web_of_trust: {
      title: "वेब ऑफ़ ट्रस्ट",
      known_pubkeys: "ज्ञात पब्लिक कुंजियाँ: {wotCount}",
      continue_crawl: "क्रॉल जारी रखें",
      crawl_odell: "ODELL का वेब ऑफ़ ट्रस्ट क्रॉल करें",
      crawl_wot: "वेब ऑफ़ ट्रस्ट क्रॉल करें",
      pause: "रोकें",
      reset: "रीसेट करें",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      copy_lightning_address: "लाइटनिंग एड्रेस कॉपी करें",
    },
    multinut: {
      use_multinut: "मल्टीनट इस्तेमाल करें",
    },
    advanced: {
      title: "उन्नत",
      developer: {
        title: "डेवलपर सेटिंग्स",
        description: "नीचे दी गई सेटिंग्स डेवलपमेंट और डीबगिंग के लिए हैं।",
        new_seed: {
          button: "नई सीड फ़्रेज़ बनाएँ",
          description:
            "इससे एक नई सीड फ़्रेज़ बनेगी। नई सीड से रीस्टोर कर पाने के लिए आपको अपना पूरा बैलेंस खुद को भेजना होगा।",
          confirm_question: "क्या आप वाकई नई सीड फ़्रेज़ बनाना चाहते हैं?",
          cancel: "रद्द करें",
          confirm: "पुष्टि करें",
        },
        remove_spent: {
          button: "खर्च हुए प्रूफ़ हटाएँ",
          description:
            "जाँचें कि आपके सक्रिय मिंट के ई-कैश टोकन खर्च हो चुके हैं या नहीं, और खर्च हुए टोकन वॉलेट से हटाएँ। इसे सिर्फ़ तभी इस्तेमाल करें जब आपका वॉलेट अटक गया हो।",
        },
        debug_console: {
          button: "डीबग कंसोल खोलें/बंद करें",
          description:
            "JavaScript डीबग टर्मिनल खोलें। इस टर्मिनल में ऐसा कुछ भी पेस्ट न करें जिसे आप समझते नहीं हैं। कोई चोर आपको यहाँ नुकसानदेह कोड पेस्ट करवाने की कोशिश कर सकता है।",
        },
        export_proofs: {
          button: "सक्रिय प्रूफ़ एक्सपोर्ट करें",
          description:
            "सक्रिय मिंट का आपका पूरा बैलेंस एक Cashu टोकन के रूप में क्लिपबोर्ड पर कॉपी करें। इससे सिर्फ़ चुने गए मिंट और यूनिट के टोकन एक्सपोर्ट होंगे। पूरे एक्सपोर्ट के लिए दूसरा मिंट और यूनिट चुनकर फिर से एक्सपोर्ट करें।",
        },
        keyset_counters: {
          title: "कीसेट काउंटर बढ़ाएँ",
          description:
            'अपने वॉलेट के कीसेट के डेरिवेशन पाथ काउंटर बढ़ाने के लिए कीसेट ID पर क्लिक करें। अगर आपको "outputs have already been signed" त्रुटि दिखे, तो यह काम आता है।',
          counter: "काउंटर: {count}",
        },
        unset_reserved: {
          button: "सभी आरक्षित टोकन मुक्त करें",
          description:
            'दोबारा खर्च की कोशिश रोकने के लिए यह वॉलेट भेजे जा रहे लंबित ई-कैश को आरक्षित मानता है (और उसे बैलेंस से घटा देता है)। यह बटन सभी आरक्षित टोकन मुक्त कर देगा ताकि उन्हें फिर से इस्तेमाल किया जा सके। ऐसा करने पर आपके वॉलेट में खर्च हुए प्रूफ़ आ सकते हैं। उन्हें हटाने के लिए "खर्च हुए प्रूफ़ हटाएँ" बटन दबाएँ।',
        },
        show_onboarding: {
          button: "शुरुआती परिचय दिखाएँ",
          description: "शुरुआती परिचय स्क्रीन फिर से दिखाएँ।",
        },
        reset_wallet: {
          button: "वॉलेट डेटा रीसेट करें",
          description:
            "अपना वॉलेट डेटा रीसेट करें। चेतावनी: इससे सब कुछ मिट जाएगा! पहले बैकअप ज़रूर बना लें।",
          confirm_question: "क्या आप वाकई अपना वॉलेट डेटा मिटाना चाहते हैं?",
          cancel: "रद्द करें",
          confirm: "वॉलेट मिटाएँ",
        },
        export_wallet: {
          button: "वॉलेट डेटा एक्सपोर्ट करें",
          description:
            "अपने वॉलेट की एक कॉपी डाउनलोड करें। नए वॉलेट की स्वागत स्क्रीन में इस फ़ाइल से आप अपना वॉलेट रीस्टोर कर सकते हैं। एक्सपोर्ट के बाद वॉलेट इस्तेमाल करते रहने पर यह फ़ाइल पुरानी हो जाएगी।",
        },
        import_wallet: {
          button: "वॉलेट बैकअप इम्पोर्ट करें",
          description:
            "पहले एक्सपोर्ट की गई बैकअप फ़ाइल से अपना वॉलेट रीस्टोर करें। इससे आपका मौजूदा वॉलेट डेटा बैकअप से बदल जाएगा।",
          confirm_question:
            "क्या आप वाकई अपना वॉलेट डेटा रीस्टोर करना चाहते हैं?",
          cancel: "रद्द करें",
          confirm: "वॉलेट बैकअप इम्पोर्ट करें",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "एक मिंट से जुड़ें",
    subtitle:
      "आप अभी तक किसी Cashu मिंट से नहीं जुड़े हैं। शुरू करने के लिए सेटिंग्स में मिंट URL जोड़ें या किसी नए मिंट से ई-कैश प्राप्त करें।",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "ई-कैश प्राप्त करें",
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
        label: "इनवॉइस",
      },
      mints: {
        label: "मिंट",
      },
    },
    install: {
      text: "इंस्टॉल करें",
      tooltip: "Cashu इंस्टॉल करें",
    },
  },
  AlreadyRunning: {
    title: "नहीं।",
    text: "एक दूसरा टैब पहले से चल रहा है। यह टैब बंद करें और फिर से कोशिश करें।",
    actions: {
      retry: {
        label: "फिर से कोशिश करें",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "उफ़। यहाँ कुछ नहीं है…",
    actions: {
      home: {
        label: "होम पर वापस जाएँ",
      },
    },
  },
  BalanceView: {
    mintUrl: {
      label: "मिंट",
    },
    mintBalance: {
      label: "बैलेंस",
    },
    mintError: {
      label: "मिंट त्रुटि",
    },
    pending: {
      label: "लंबित",
      tooltip: "सभी लंबित टोकन जाँचें",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "पिछला",
      },
      next: {
        label: "अगला",
      },
    },
  },
  WelcomeSlide1: {
    title: "Cashu में आपका स्वागत है",
    text: "Cashu.me एक मुफ़्त और ओपन-सोर्स बिटकॉइन वॉलेट है जो आपके पैसों को सुरक्षित और निजी रखने के लिए ई-कैश का इस्तेमाल करता है।",
    actions: {
      more: {
        label: "और जानने के लिए क्लिक करें",
      },
    },
    p1: {
      text: "Cashu बिटकॉइन के लिए एक मुफ़्त और ओपन-सोर्स ई-कैश प्रोटोकॉल है। इसके बारे में आप { link } पर और जान सकते हैं।",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "यह वॉलेट किसी भी मिंट से जुड़ा नहीं है। इस वॉलेट को इस्तेमाल करने के लिए आपको एक या अधिक ऐसे Cashu मिंट से कनेक्ट करना होगा जिन पर आपको भरोसा हो।",
    },
    p3: {
      text: "यह वॉलेट ऐसा ई-कैश रखता है जिस तक सिर्फ़ आपकी पहुँच है। अगर आपने सीड फ़्रेज़ का बैकअप लिए बिना ब्राउज़र डेटा मिटा दिया, तो आपके टोकन खो जाएँगे।",
    },
    p4: {
      text: "यह वॉलेट बीटा में है। पैसों तक पहुँच खोने की कोई ज़िम्मेदारी हमारी नहीं है। अपने जोखिम पर इस्तेमाल करें! यह कोड ओपन-सोर्स है और MIT लाइसेंस के तहत उपलब्ध है।",
    },
    terms_agreement: {
      text: "जारी रखकर आप { link } से सहमत होते हैं",
      link: "सेवा की शर्तों",
    },
  },
  WelcomeSlide2: {
    title: "PWA इंस्टॉल करें",
    alt: {
      pwa_example: "PWA इंस्टॉल करने का उदाहरण",
    },
    installing: "इंस्टॉल हो रहा है…",
    instruction: {
      intro: {
        text: "सबसे अच्छे अनुभव के लिए इस वॉलेट को अपने डिवाइस के मूल ब्राउज़र में खोलें और इसे प्रोग्रेसिव वेब ऐप (PWA) के रूप में इंस्टॉल करें।",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "मेन्यू पर टैप करें (ऊपर दाएँ)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "{ buttonText } दबाएँ",
          buttonText: "@:AndroidPWAPrompt.buttonText",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "शेयर पर टैप करें (नीचे)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "{ buttonText } दबाएँ",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "डिवाइस पर ऐप इंस्टॉल हो जाने के बाद यह ब्राउज़र विंडो बंद करें और होम स्क्रीन से ऐप इस्तेमाल करें।",
      },
    },
    pwa: {
      success: {
        title: "सफल!",
        text: "आप Cashu को PWA के रूप में इस्तेमाल कर रहे हैं। बाकी खुली ब्राउज़र विंडो बंद करें और होम स्क्रीन से ऐप इस्तेमाल करें।",
        nextSteps:
          "अब आप यह ब्राउज़र टैब बंद करके होम स्क्रीन से ऐप खोल सकते हैं।",
      },
    },
  },
  iOSPWAPrompt: {
    text: "{ icon } पर टैप करें और { buttonText } चुनें",
    buttonText: "होम स्क्रीन पर जोड़ें",
  },
  AndroidPWAPrompt: {
    text: "{ icon } पर टैप करें और { buttonText } चुनें",
    buttonText: "होम स्क्रीन पर जोड़ें",
  },
  WelcomeSlide3: {
    title: "आपकी सीड फ़्रेज़",
    text: "अपनी सीड फ़्रेज़ किसी पासवर्ड मैनेजर में या कागज़ पर लिखकर रखें। अगर यह डिवाइस आपसे छूट जाए, तो पैसे वापस पाने का यही एकमात्र तरीका है।",
    inputs: {
      seed_phrase: {
        label: "सीड फ़्रेज़",
        caption: "आप अपनी सीड फ़्रेज़ सेटिंग्स में देख सकते हैं।",
      },
      checkbox: {
        label: "मैंने इसे लिख लिया है",
      },
    },
  },
  WelcomeSlide4: {
    title: "शर्तें",
    actions: {
      more: {
        label: "सेवा की शर्तें पढ़ें",
      },
    },
    inputs: {
      checkbox: {
        label: "मैंने ये नियम और शर्तें पढ़ ली हैं और स्वीकार करता/करती हूँ",
      },
    },
  },
  WelcomeSlideChoice: {
    title: "अपना वॉलेट सेट करें",
    text: "क्या आप सीड फ़्रेज़ से वॉलेट वापस पाना चाहते हैं या नया वॉलेट बनाना चाहते हैं?",
    options: {
      new: {
        title: "नया वॉलेट बनाएँ",
        subtitle: "नई सीड बनाएँ और मिंट जोड़ें।",
      },
      recover: {
        title: "वॉलेट वापस पाएँ",
        subtitle: "अपनी सीड फ़्रेज़ डालें, मिंट और ई-कैश रीस्टोर करें।",
      },
    },
  },
  WelcomeMintSetup: {
    title: "मिंट जोड़ें",
    text: "मिंट ऐसे सर्वर हैं जो ई-कैश भेजने और प्राप्त करने में मदद करते हैं। खोजा गया कोई मिंट चुनें या खुद जोड़ें। बाद में जोड़ने के लिए छोड़ दें।",
    sections: {
      your_mints: "आपके मिंट",
    },
    restoring: "मिंट रीस्टोर हो रहे हैं…",
    placeholder: {
      mint_url: "https://",
    },
  },
  WelcomeRecoverSeed: {
    title: "अपनी सीड फ़्रेज़ डालें",
    text: "वॉलेट वापस पाने के लिए अपनी 12 शब्दों की सीड फ़्रेज़ पेस्ट करें या टाइप करें।",
    inputs: {
      word: "शब्द { index }",
    },
    actions: {
      paste_all: "सब पेस्ट करें",
    },
    disclaimer:
      "आपकी सीड फ़्रेज़ सिर्फ़ इसी डिवाइस पर आपकी वॉलेट कुंजियाँ बनाने के लिए इस्तेमाल होती है।",
  },
  WelcomeRestoreEcash: {
    title: "अपना ई-कैश रीस्टोर करें",
    text: "आपके जोड़े गए मिंट पर बिना खर्च हुए प्रूफ़ खोजें और उन्हें अपने वॉलेट में जोड़ें।",
  },
  MintRatings: {
    title: "मिंट समीक्षाएँ",
    reviews: "समीक्षाएँ",
    ratings: "रेटिंग",
    no_reviews: "कोई समीक्षा नहीं मिली",
    your_review: "आपकी समीक्षा",
    no_reviews_to_display: "दिखाने के लिए कोई समीक्षा नहीं।",
    no_rating: "कोई रेटिंग नहीं",
    out_of: "में से",
    rows: "समीक्षाएँ",
    sort: "क्रम",
    sort_options: {
      newest: "सबसे नई",
      oldest: "सबसे पुरानी",
      highest: "सबसे ऊँची",
      lowest: "सबसे नीची",
    },
    actions: {
      write_review: "समीक्षा लिखें",
    },
    empty_state_subtitle:
      "समीक्षा लिखकर मदद करें। इस मिंट के साथ अपना अनुभव साझा करें और दूसरों की मदद करें।",
  },
  CreateMintReview: {
    title: "मिंट की समीक्षा",
    publishing_as: "इस नाम से प्रकाशित",
    inputs: {
      rating: { label: "रेटिंग" },
      review: { label: "समीक्षा (वैकल्पिक)" },
    },
    actions: {
      publish: { label: "समीक्षा भेजें", in_progress: "भेजी जा रही है…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "सीड फ़्रेज़ से रीस्टोर करें",
      caption:
        "अपना वॉलेट रीस्टोर करने के लिए अपनी सीड फ़्रेज़ डालें। रीस्टोर से पहले पक्का कर लें कि आपने पहले इस्तेमाल किए गए सभी मिंट जोड़ दिए हैं।",
      inputs: {
        seed_phrase: {
          label: "सीड फ़्रेज़",
          caption: "आप अपनी सीड फ़्रेज़ सेटिंग्स में देख सकते हैं।",
        },
      },
    },
    information: {
      label: "जानकारी",
      caption:
        "विज़र्ड सिर्फ़ किसी दूसरी सीड फ़्रेज़ से ई-कैश रीस्टोर करेगा। आप इस सीड फ़्रेज़ को इस्तेमाल नहीं कर पाएँगे और न ही अपने मौजूदा वॉलेट की सीड फ़्रेज़ बदल पाएँगे। इसका मतलब है कि जब तक आप रीस्टोर किया गया ई-कैश एक बार खुद को नहीं भेज देते, तब तक वह आपकी मौजूदा सीड फ़्रेज़ से सुरक्षित नहीं होगा।",
    },
    restore_mints: {
      label: "मिंट रीस्टोर करें",
      caption:
        'रीस्टोर करने के लिए मिंट चुनें। आप मुख्य स्क्रीन पर "मिंट" में और मिंट जोड़कर उन्हें यहाँ रीस्टोर कर सकते हैं।',
    },
    actions: {
      paste: {
        error: "क्लिपबोर्ड पढ़ा नहीं जा सका।",
      },
      validate: {
        error: "यह मान्य BIP39 सीड फ़्रेज़ नहीं है।",
      },
      select_all: {
        label: "सभी चुनें",
      },
      deselect_all: {
        label: "सभी हटाएँ",
      },
      restore: {
        label: "रीस्टोर करें",
        in_progress: "मिंट रीस्टोर हो रहा है …",
        error: "मिंट रीस्टोर करने में त्रुटि: { error }",
      },
      restore_all_mints: {
        label: "सभी मिंट रीस्टोर करें",
        in_progress: "{ length } में से मिंट { index } रीस्टोर हो रहा है …",
        success: "रीस्टोर सफलतापूर्वक पूरा हुआ",
        error: "मिंट रीस्टोर करने में त्रुटि: { error }",
      },
      restore_selected_mints: {
        label: "चुने गए मिंट रीस्टोर करें ({count})",
        in_progress: "{ length } में से मिंट { index } रीस्टोर हो रहा है …",
        success: "{count} मिंट सफलतापूर्वक रीस्टोर हुए",
        error: "चुने गए मिंट रीस्टोर करने में त्रुटि: { error }",
      },
    },
    nostr_mints: {
      label: "Nostr से मिंट रीस्टोर करें",
      caption:
        "अपनी सीड फ़्रेज़ से Nostr रिले पर रखे मिंट बैकअप खोजें। इससे पहले इस्तेमाल किए गए मिंट ढूँढने में मदद मिलेगी।",
      search_button: "मिंट बैकअप खोजें",
      select_all: "सभी चुनें",
      deselect_all: "सभी हटाएँ",
      backed_up: "बैकअप हुआ",
      already_added: "पहले से जुड़ा",
      add_selected: "चुने गए जोड़ें ({count})",
      no_backups_found: "कोई मिंट बैकअप नहीं मिला",
      no_backups_hint:
        "अपनी मिंट सूची का अपने-आप बैकअप लेने के लिए सेटिंग्स में Nostr मिंट बैकअप चालू करें।",
      invalid_mnemonic: "खोजने से पहले कृपया एक मान्य सीड फ़्रेज़ डालें।",
      search_error: "मिंट बैकअप खोजे नहीं जा सके।",
      add_error: "चुने गए मिंट जोड़े नहीं जा सके।",
    },
  },
  MintSettings: {
    add: {
      title: "मिंट जोड़ें",
      description:
        "कनेक्ट करने के लिए किसी Cashu मिंट का URL डालें। यह वॉलेट किसी भी मिंट से जुड़ा नहीं है।",
      inputs: {
        nickname: {
          placeholder: "उपनाम (जैसे Testnet)",
        },
      },
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "अमान्य URL",
        },
        scan: {
          label: "QR कोड स्कैन करें",
        },
      },
    },
    discover: {
      title: "मिंट खोजें",
      overline: "खोजें",
      caption:
        "ऐसे मिंट खोजें जिनकी सिफ़ारिश दूसरे उपयोगकर्ताओं ने Nostr पर की है।",
      actions: {
        discover: {
          label: "मिंट खोजें",
          in_progress: "लोड हो रहा है…",
          error_no_mints: "कोई मिंट नहीं मिला",
          success: "{ length } मिंट मिले",
        },
      },
      recommendations: {
        overline: "{ length } मिंट मिले",
        caption:
          "इन मिंट की सिफ़ारिश दूसरे Nostr उपयोगकर्ताओं ने की है। किसी मिंट को इस्तेमाल करने से पहले सावधान रहें और खुद जाँच-पड़ताल करें।",
        actions: {
          browse: {
            label: "मिंट देखने के लिए क्लिक करें",
          },
        },
      },
    },
    swap: {
      title: "स्वैप",
      overline: "मल्टी-मिंट स्वैप",
      actions: {
        receove_to_trusted_mint: {
          label: "भरोसेमंद मिंट में प्राप्त करें",
        },
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
      },
      caption:
        "लाइटनिंग के ज़रिए मिंट के बीच पैसे स्वैप करें। ध्यान दें: लाइटनिंग शुल्क के लिए कुछ गुंजाइश छोड़ें। अगर आने वाला भुगतान सफल न हो, तो इनवॉइस खुद जाँचें।",
      inputs: {
        from: {
          label: "से",
        },
        to: {
          label: "तक",
        },
        amount: {
          label: "राशि ({ ticker })",
        },
      },
    },
    error_badge: "त्रुटि",
    reviews_text: "समीक्षाएँ",
    no_reviews_yet: "अभी कोई समीक्षा नहीं",
    discover_mints_button: "मिंट खोजें",
  },
  QrcodeReader: {
    progress: {
      text: "{ percentage }{ addon }",
      percentage: "{ percentage }%",
      keep_scanning_text: " - स्कैन करते रहें",
    },
    errors: {
      camera_permission:
        "कैमरा इस्तेमाल करने की अनुमति नहीं मिली। QR कोड स्कैन करने के लिए ब्राउज़र या डिवाइस सेटिंग्स में कैमरे की अनुमति दें।",
      camera_not_found: "इस डिवाइस पर कोई कैमरा नहीं मिला।",
      camera_unavailable: "कैमरा शुरू नहीं हो सका।",
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
    title: "लाइटनिंग से प्राप्त करें",
    create_invoice_title: "इनवॉइस बनाएँ",
    inputs: {
      amount: {
        label: "राशि ({ ticker }) *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "इनवॉइस बनाएँ",
        label_blocked: "इनवॉइस बन रहा है…",
        in_progress: "बन रहा है",
      },
    },
    invoice: {
      caption: "लाइटनिंग इनवॉइस",
      status_paid_text: "भुगतान हो गया!",
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
    title: "भेजें",
    actions: {
      ecash: {
        label: "ई-कैश",
        error_no_mints: "कोई मिंट उपलब्ध नहीं",
      },
      lightning: {
        label: "लाइटनिंग",
        error_no_mints: "कोई मिंट उपलब्ध नहीं",
      },
    },
  },
  SendTokenDialog: {
    title: "ई-कैश भेजें",
    title_ecash_text: "ई-कैश",
    badge_offline_text: "ऑफ़लाइन",
    inputs: {
      amount: {
        label: "राशि ({ ticker }) *",
        invalid_too_much_error_text: "बहुत ज़्यादा",
      },
      p2pk_pubkey: {
        label: "प्राप्तकर्ता की पब्लिक कुंजी",
        label_invalid: "प्राप्तकर्ता की पब्लिक कुंजी",
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
        tooltip_text: "इमोजी कॉपी करें",
      },
      copy_tokens: {
        label: "@:global.actions.copy.label",
      },
      copy_link: {
        tooltip_text: "लिंक कॉपी करें",
      },
      share: {
        tooltip_text: "ई-कैश शेयर करें",
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
        in_progress: "भेजा जा रहा है…",
      },
      delete: {
        tooltip_text: "इतिहास से हटाएँ",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "NFC कार्ड पर लिखें",
          ndef_unsupported_text: "NDEF समर्थित नहीं",
        },
      },
    },
    errors: {
      amount_required: "पहले राशि डालें।",
      serialization_failed: "ई-कैश टोकन तैयार नहीं हो सका।",
      mint_not_allowed_by_request:
        "यह भुगतान अनुरोध चुने गए मिंट को स्वीकार नहीं करता।",
      unit_not_matching_request:
        "इस भुगतान अनुरोध का भुगतान {unit} में होना चाहिए।",
      mint_lacks_request_methods:
        "चुना गया मिंट उन भुगतान तरीकों का समर्थन नहीं करता जो इस अनुरोध के लिए ज़रूरी हैं।",
    },
    payment_request: {
      method_fee: "इस मिंट से भुगतान करने पर {fee} का अतिरिक्त शुल्क",
    },
  },
  SendPaymentRequest: {
    actions: {
      pay: {
        label: "भुगतान करें",
      },
      pay_via: {
        label: "{transport} से भुगतान करें",
      },
    },
    info: {
      pay_to: "{target} को भुगतान करें",
      invalid_url: "अमान्य URL",
    },
  },
  PaymentRequestInfo: {
    title_with_transport: "{transport} से भुगतान अनुरोध",
    title: "भुगतान अनुरोध",
    subtitle: "{target} को भुगतान करें",
    subtitle_fallback: "भुगतान अनुरोध",
    invalid_url: "अमान्य URL",
  },
  ReceiveDialog: {
    title: "प्राप्त करें",
    actions: {
      ecash: {
        label: "ई-कैश",
        error_no_mints: "कोई मिंट उपलब्ध नहीं",
      },
      lightning: {
        label: "लाइटनिंग",
        error_no_mints:
          "लाइटनिंग से प्राप्त करने के लिए आपको किसी मिंट से कनेक्ट करना होगा",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "ई-कैश प्राप्त करें",
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      scan: {
        label: "@:global.actions.scan.label",
      },
      request: {
        label: "अनुरोध",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      nfc: {
        label: "NFC",
        scanning_text: "स्कैन हो रहा है…",
      },
    },
  },
  ReceiveTokenDialog: {
    title: "ई-कैश प्राप्त करें",
    title_ecash_text: "ई-कैश",
    inputs: {
      tokens_base64: {
        label: "Cashu टोकन पेस्ट करें",
      },
    },
    errors: {
      invalid_token: {
        label: "अमान्य टोकन",
      },
      p2pk_lock_mismatch: {
        label:
          "प्राप्त नहीं किया जा सकता। इस टोकन का P2PK लॉक आपकी पब्लिक कुंजी से मेल नहीं खाता।",
      },
    },
    unknown_mint_info_text:
      "अनजान मिंट। यह टोकन प्राप्त करने के बाद इसे जोड़ दिया जाएगा।",
    swap_section: {
      title: "स्वैप",
      source_label: "से",
      destination_label: "तक",
      fee_info: "इस स्वैप पर लाइटनिंग नेटवर्क शुल्क लगेगा।",
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
        label_adding_mint: "मिंट जोड़ा जा रहा है…",
      },
      swap: {
        label: "भरोसेमंद मिंट में प्राप्त करें",
        tooltip_text: "भरोसेमंद मिंट में स्वैप करें",
        caption: "{ value } स्वैप करें",
        processing: "स्वैप हो रहा है...",
        failed: "स्वैप विफल रहा",
      },
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "स्वैप रद्द करें",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      receive_to_selected_mint: {
        label: "चुने गए मिंट में प्राप्त करें",
      },
      later: {
        label: "बाद में प्राप्त करें",
        tooltip_text: "बाद में प्राप्त करने के लिए इतिहास में जोड़ें",
        already_in_history_success_text: "ई-कैश पहले से इतिहास में है",
        added_to_history_success_text: "ई-कैश इतिहास में जोड़ा गया",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "NFC कार्ड से पढ़ें",
          ndef_unsupported_text: "NDEF समर्थित नहीं",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "P2PK कुंजी",
      description: "इस कुंजी पर लॉक किया गया ई-कैश प्राप्त करें",
      used_warning_text:
        "चेतावनी: यह कुंजी पहले इस्तेमाल हो चुकी है। बेहतर गोपनीयता के लिए नई कुंजी इस्तेमाल करें।",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_key: {
        label: "नई कुंजी बनाएँ",
      },
    },
  },
  PaymentRequestDialog: {
    payment_request: {
      caption: "भुगतान अनुरोध",
      description: "Nostr के ज़रिए भुगतान प्राप्त करें",
    },
    received_total: "कुल प्राप्त",
    no_payments_yet: "अभी कोई भुगतान नहीं",
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "नया अनुरोध",
      },
      add_amount: {
        label: "राशि जोड़ें",
      },
      use_active_mint: {
        label: "कोई भी मिंट",
      },
      delete: {
        label: "हटाएँ",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
    inputs: {
      amount: {
        placeholder: "राशि डालें",
      },
      description: {
        placeholder: "विवरण जोड़ें",
      },
      lock: {
        label: "मेरी कुंजी पर लॉक करें",
      },
    },
    delete_dialog: {
      title: "अनुरोध हटाएँ",
      text: "इस अनुरोध को सूची से हटाएँ? पहले मिल चुके भुगतान आपके इतिहास में रहेंगे, और इस पर आने वाले भुगतान फिर भी पहुँचेंगे।",
    },
  },
  NumericKeyboard: {
    actions: {
      close: {
        label: "@:global.actions.close.label",
        closed_info_text:
          "कीबोर्ड बंद है। आप इसे सेटिंग्स में फिर से चालू कर सकते हैं।",
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
        "NWC से अपना वॉलेट दूर से चलाएँ। किसी समर्थित ऐप से वॉलेट जोड़ने के लिए QR कोड दबाएँ।",
      warning_text:
        "चेतावनी: जिसके पास भी यह कनेक्शन स्ट्रिंग है, वह आपके वॉलेट से भुगतान कर सकता है। इसे किसी से साझा न करें!",
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
      title: "मिंट विवरण",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Nuts",
        actions: {
          show: {
            label: "सभी देखें",
          },
          hide: {
            label: "छिपाएँ",
          },
        },
      },
      currency: {
        label: "मुद्रा",
      },
      currencies: {
        label: "@:MintDetailsDialog.details.currency.label",
      },
      version: {
        label: "संस्करण",
      },
    },
    actions: {
      title: "कार्रवाइयाँ",
      copy_mint_url: {
        label: "मिंट URL कॉपी करें",
      },
      delete: {
        label: "मिंट हटाएँ",
      },
      edit: {
        label: "मिंट बदलें",
      },
    },
  },
  ChooseMint: {
    title: "एक मिंट चुनें",
    placeholder: "एक मिंट चुनें",
    available_text: "उपलब्ध",
    sheet_title: "मिंट चुनें",
    badge_mint_error_text: "त्रुटि",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
  },
  HistoryTable: {
    empty_text: "अभी कोई इतिहास नहीं",
    row: {
      type_label: "ई-कैश",
      date_label: "{ value } पहले",
    },
    actions: {
      check_status: {
        tooltip_text: "स्थिति जाँचें",
      },
      receive: {
        tooltip_text: "प्राप्त करें",
      },
      filter_pending: {
        label: "लंबित दिखाएँ",
      },
      show_all: {
        label: "सभी दिखाएँ",
      },
    },
    old_token_not_found_error_text: "पुराना टोकन नहीं मिला",
  },
  InvoiceTable: {
    empty_text: "अभी कोई इनवॉइस नहीं",
    row: {
      type_label: "लाइटनिंग",
      type_tooltip_text: "कॉपी करने के लिए क्लिक करें",
      date_label: "{ value } पहले",
    },
    actions: {
      check_status: {
        tooltip_text: "स्थिति जाँचें",
      },
      filter_pending: {
        label: "लंबित दिखाएँ",
      },
      show_all: {
        label: "सभी दिखाएँ",
      },
    },
  },
  RemoveMintDialog: {
    title: "क्या आप वाकई यह मिंट हटाना चाहते हैं?",
    nickname: {
      label: "उपनाम",
    },
    balances: {
      label: "बैलेंस",
    },
    warning_text:
      "ध्यान दें: यह वॉलेट बहुत सावधानी बरतता है, इसलिए इस मिंट का आपका ई-कैश असल में मिटाया नहीं जाएगा, बल्कि आपके डिवाइस पर ही रहेगा। अगर आप बाद में यह मिंट फिर से जोड़ते हैं, तो यह फिर से दिखने लगेगा।",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "मिंट हटाएँ",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  ParseInputComponent: {
    placeholder: {
      default: "Cashu टोकन या लाइटनिंग एड्रेस",
      receive: "Cashu टोकन",
      pay: "लाइटनिंग एड्रेस या इनवॉइस",
    },
    qr_scanner: {
      title: "QR कोड स्कैन करें",
      description: "एड्रेस स्कैन करने के लिए टैप करें",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    input_data: {
      title: "लाइटनिंग से भुगतान करें",
      title_bolt12: "लाइटनिंग Bolt12 से भुगतान करें",
      inputs: {
        invoice_data: {
          label: "लाइटनिंग इनवॉइस या एड्रेस",
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
      amount_exact_label: "{ payee } { value } { ticker } माँग रहे हैं",
      amount_range_label:
        "{ payee } माँग रहे हैं{br}{ min } से { max } { ticker } के बीच",
      sending_to_lightning_address: "{ address } को भेजा जा रहा है",
      inputs: {
        amount: {
          label: "राशि ({ ticker }) *",
        },
        comment: {
          label: "टिप्पणी (वैकल्पिक)",
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
      title: "{ value } का भुगतान करें",
      paying: "भुगतान हो रहा है",
      paid: "भुगतान हो गया",
      fee: "शुल्क",
      memo: {
        label: "मेमो",
      },
      processing_info_text: "प्रक्रिया जारी है…",
      balance_too_low_warning_text: "बैलेंस बहुत कम है",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        pay: {
          label: "भुगतान करें",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
          waiting_for_wallet: "वॉलेट का इंतज़ार…",
          error: "त्रुटि",
        },
      },
    },
  },
  EditMintDialog: {
    title: "मिंट बदलें",
    inputs: {
      nickname: {
        label: "उपनाम",
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
    title: "क्या आपको इस मिंट पर भरोसा है?",
    description:
      "इस मिंट से तभी जुड़ें जब आपको इस पर भरोसा हो। मिंट कभी भी काम बंद कर सकते हैं।",
    unreachable_error_text:
      "इस मिंट तक पहुँचा नहीं जा सका। URL और अपना कनेक्शन जाँचें, फिर से कोशिश करें।",
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
        in_progress: "मिंट जोड़ा जा रहा है",
      },
    },
    audit_info: {
      label: "ऑडिट जानकारी",
      actions: {
        show: {
          label: "दिखाएँ",
        },
        hide: {
          label: "छिपाएँ",
        },
      },
    },
  },
  restore: {
    mnemonic_error_text: "कृपया सीड फ़्रेज़ डालें",
    restore_mint_error_text: "मिंट रीस्टोर करने में त्रुटि: { error }",
    prepare_info_text: "रीस्टोर की तैयारी हो रही है …",
    restored_proofs_for_keyset_info_text:
      "कीसेट { keysetId } के लिए { restoreCounter } प्रूफ़ रीस्टोर हुए",
    checking_proofs_for_keyset_info_text:
      "कीसेट { keysetId } के लिए प्रूफ़ { startIndex } से { endIndex } जाँचे जा रहे हैं",
    no_proofs_info_text: "रीस्टोर करने के लिए कोई प्रूफ़ नहीं मिला",
    restored_amount_success_text: "{ amount } रीस्टोर हुए",
  },
  swap: {
    in_progress_warning_text: "स्वैप जारी है",
    invalid_swap_data_error_text: "अमान्य स्वैप डेटा",
    swap_error_text: "स्वैप में त्रुटि",
  },
  TokenInformation: {
    fee: "शुल्क",
    unit: "यूनिट",
    fiat: "फ़िएट",
    p2pk: "P2PK",
    locked: "लॉक",
    locked_to_you: "आप पर लॉक",
    mint: "मिंट",
    memo: "मेमो",
    payment_request: "भुगतान अनुरोध",
    nostr: "Nostr",
    token_copied: "टोकन क्लिपबोर्ड पर कॉपी हुआ",
  },
};
