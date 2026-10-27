export default {
  MultinutPicker: {
    dialog_title: "الدفع من عدة مِنْتات",
    pay_using_multiple: "ادفع باستخدام عدة مِنْتات",
    experimental_title: "ميزة تجريبية",
    experimental_text:
      "هذه الميزة تجريبية جدًا وقد لا تعمل كما هو متوقع. تأكد من عدم محاولة دفع فاتورة سبق دفعها، فقد تفقد أموالك.",
    understand: "فهمت",
    select_funds: "اختر أموالًا من عدة مِنْتات لتنفيذ الدفع.",
    pay_invoice: "دفع الفاتورة",
    amount_mismatch: "خطأ في حساب المبلغ: {calculated} مقابل {expected}",
    states: {
      requesting: "جارٍ الطلب...",
      paying: "جارٍ الدفع...",
      success: "نجح",
      failed: "فشل",
    },
    payment: "الدفع من عدة مِنْتات",
    selectMints: "حدد مِنْتًا واحدًا أو أكثر لتنفيذ الدفع منه.",
    totalSelectedBalance: "إجمالي الرصيد المحدد",
    multiMintPay: "الدفع من عدة مِنْتات",
    balanceNotEnough: "رصيد المِنْتات المتعددة غير كافٍ لدفع هذه الفاتورة",
    failed: "فشل في المعالجة: {error}",
    paid: "تم دفع {amount} عبر Lightning",
  },

  global: {
    copy_to_clipboard: {
      success: "تم النسخ إلى الحافظة!",
    },
    actions: {
      add_mint: {
        label: "إضافة مِنْت",
      },
      cancel: {
        label: "إلغاء",
      },
      copy: {
        label: "نسخ",
      },
      close: {
        label: "إغلاق",
      },
      enter: {
        label: "إدخال",
      },
      lock: {
        label: "قفل",
      },
      paste: {
        label: "لصق",
      },
      receive: {
        label: "استلام",
      },
      scan: {
        label: "مسح ضوئي",
      },
      send: {
        label: "إرسال",
      },
      swap: {
        label: "تبديل",
      },
      update: {
        label: "تحديث",
      },
      pay: { label: "ادفع" },
    },
    inputs: {
      mint_url: {
        label: "عنوان URL للمِنْت",
      },
    },
  },
  wallet: {
    notifications: {
      balance_too_low: "الرصيد منخفض جدًا",
      received: "تم استلام {amount}",
      fee: " (رسوم: {fee})",
      could_not_request_mint: "لا يمكن طلب الإنشاء",
      invoice_still_pending: "الفاتورة لا تزال معلقة",
      paid_lightning: "تم دفع {amount} عبر شبكة لايتنينج",
      payment_pending_refresh: "الدفع معلق. قم بتحديث الفاتورة يدويًا.",
      sent: "تم إرسال {amount}",
      token_still_pending: "الرمز لا يزال معلقًا",
      received_lightning: "تم استلام {amount} عبر شبكة لايتنينج",
      lightning_payment_failed: "فشل الدفع عبر لايتنينج",
      failed_to_decode_invoice: "فشل فك ترميز الفاتورة",
      invalid_lnurl: "LNURL غير صالح",
      lnurl_error: "خطأ في LNURL",
      no_amount: "لا يوجد مبلغ",
      no_lnurl_data: "لا توجد بيانات LNURL",
      no_price_data: "لا توجد بيانات سعرية.",
      please_try_again: "يرجى المحاولة مرة أخرى.",
      trying_again: "جارٍ إعادة المحاولة...",
      unsupported_legacy_qr: "رمز QR قديم غير مدعوم",
      legacy_qr_not_supported: "رمز QR القديم هذا ليس من تاجر مدعوم",
      no_bolt12_mint: "لا يدعم أي من مِنْتاتك عروض BOLT12",
      no_bolt11_mint: "لا يدعم أي من مِنْتاتك فواتير BOLT11",
    },
    mint: {
      notifications: {
        already_added: "تمت إضافة المِنْت بالفعل",
        added: "تمت إضافة المِنْت",
        not_found: "لم يتم العثور على المِنْت",
        activation_failed: "فشل تنشيط المِنْت",
        no_active_mint: "لا يوجد مِنْت نشط",
        unit_activation_failed: "فشل تنشيط الوحدة",
        unit_not_supported: "الوحدة غير مدعومة من المِنْت",
        activated: "تم تنشيط المِنْت",
        could_not_connect: "تعذر الاتصال بالمِنْت",
        could_not_get_info: "تعذر الحصول على معلومات المِنْت",
        could_not_get_keys: "تعذر الحصول على مفاتيح المِنْت",
        could_not_get_keysets: "تعذر الحصول على مجموعات مفاتيح المِنْت",
        mint_validation_error: "خطأ في التحقق من صحة المِنْت",
        removed: "تمت إزالة المِنْت",
        error: "خطأ في المِنْت",
      },
    },
  },
  MainHeader: {
    menu: {
      settings: {
        title: "الإعدادات",
        settings: {
          title: "الإعدادات",
          caption: "تهيئة المحفظة",
        },
      },
      terms: {
        title: "الشروط",
        terms: {
          title: "الشروط",
          caption: "ما توافق عليه باستخدام Cashu.me",
        },
      },
      links: {
        title: "روابط",
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
          title: "تبرع",
          caption: "دعم Cashu",
        },
      },
    },
    offline: {
      warning: {
        text: "غير متصل",
      },
    },
    reload: {
      warning: {
        text: "إعادة التحميل في { countdown }",
      },
    },
    staging: {
      warning: {
        text: "المرحلة التجريبية – لا تستخدم مع أموال حقيقية!",
      },
    },
  },
  FullscreenHeader: {
    actions: {
      back: {
        label: "المحفظة",
      },
    },
  },
  Settings: {
    menu: {
      title: "الإعدادات",
      backup: {
        title: "النسخ الاحتياطي والاستعادة",
        caption: "عبارة البذرة واستعادة الإيكاش",
      },
      lightning_address: {
        title: "عنوان Lightning",
        caption: "استقبل المدفوعات على name@domain",
      },
      nostr: {
        title: "Nostr",
        caption: "المفاتيح والمرحّلات وشبكة الثقة",
      },
      payment_requests: {
        title: "طلبات الدفع",
        caption: "استقبل مدفوعات ecash عبر Nostr",
      },
      nwc: {
        title: "اتصال محفظة Nostr",
        caption: "استخدم محفظتك من تطبيقات أخرى",
      },
      hardware: {
        title: "الأجهزة",
        caption: "إعدادات NFC",
      },
      p2pk: {
        title: "ecash مقفل",
        caption: "استقبل ecash لا يفتحه إلا مفتاحك",
      },
      privacy: {
        title: "الخصوصية",
        caption: "فحوصات الشبكة وسعر البيتكوين",
      },
      experimental: {
        title: "تجريبي",
        caption: "جرّب الميزات الجديدة مبكرًا",
      },
      appearance: {
        title: "المظهر",
        caption: "السمة ولوحة المفاتيح ورمز البيتكوين",
      },
      language: {
        title: "اللغة",
        caption: "اختر لغتك",
      },
      advanced: {
        title: "متقدم",
        caption: "أدوات المطورين وإعادة تعيين المحفظة",
      },
      about: {
        title: "حول",
        caption: "الشروط والروابط",
      },
    },
    language: {
      title: "اللغة",
      description: "الرجاء اختيار لغتك المفضلة من القائمة أدناه.",
    },
    sections: {
      backup_restore: "النسخ الاحتياطي والاستعادة",
      lightning_address: "عنوان LIGHTNING",
      nostr_keys: "مفاتيح NOSTR",
      nostr: {
        title: "NOSTR",
        relays: {
          already_added: "تمت إضافة المرحّل بالفعل",
          expand_label: "انقر لتعديل المرحلات",
          add: {
            title: "إضافة مُرحِل",
            description:
              "تستخدم محفظتك هذه المرحّلات لميزات Nostr مثل طلبات الدفع وNostr Wallet Connect والنسخ الاحتياطية.",
          },
          list: {
            title: "المُرحِلات",
            description: "ستتصل محفظتك بهذه المُرحِلات.",
            copy_tooltip: "نسخ المُرحِل",
            remove_tooltip: "إزالة المُرحِل",
          },
        },
      },
      payment_requests: "طلبات الدفع",
      nostr_wallet_connect: "اتصال محفظة NOSTR",
      hardware_features: "ميزات الأجهزة",
      p2pk_features: "ميزات P2PK",
      privacy: "الخصوصية",
      experimental: "تجريبي",
      appearance: "المظهر",
    },
    backup_restore: {
      backup_seed: {
        title: "نسخ عبارة الاستعادة احتياطيًا",
        description:
          "يمكن لعبارة الاستعادة الخاصة بك استعادة محفظتك. احتفظ بها آمنة وخصوصية.",
        seed_phrase_label: "عبارة الاستعادة",
      },
      restore_ecash: {
        title: "استعادة ecash",
        description:
          "استرد ecash من عبارة استعادة أخرى. تبقى عبارة الاستعادة الحالية دون تغيير.",
        button: "استعادة",
      },
    },
    lightning_address: {
      server_url: {
        label: "اسم مضيف npub.cash",
        hint: "أدخل اسم مضيف أو عنوان HTTPS",
        invalid: "أدخل عنوان URL صالحًا لخادم HTTPS",
      },
      title: "عنوان Lightning",
      description: "استلام المدفوعات إلى عنوان Lightning الخاص بك.",
      enable: {
        toggle: "استخدام عنوان Lightning",
        description: "استقبل المدفوعات على عنوان من npub.cash",
      },
      address: {
        copy_tooltip: "نسخ عنوان Lightning",
      },
      show_on_receive: {
        toggle: "إظهار عند الاستلام",
        description: "إظهار العنوان ورمز QR.",
      },
      automatic_claim: {
        toggle: "المطالبة تلقائيًا",
        description: "استلام المدفوعات الواردة تلقائيًا.",
      },
      mint: {
        label: "مِنْت npub.cash",
        choose_title: "اختر مِنْتًا لـ npub.cash",
        choose_placeholder: "حدد مِنْتًا...",
      },
    },
    nostr_keys: {
      title: "مفاتيح Nostr الخاصة بك",
      description: "مفاتيح Nostr الخاصة بك تحدد عنوان Lightning الخاص بك.",
      wallet_seed: {
        title: "عبارة استعادة المحفظة",
        description: "إنشاء زوج مفاتيح Nostr من عبارة استعادة محفظتك",
        copy_nsec: "نسخ المفتاح الخاص",
      },
      nsec_bunker: {
        title: "موقّع عن بُعد",
        description: "التوقيع باستخدام NIP-46 bunker",
        delete_tooltip: "حذف الاتصال",
      },
      use_nsec: {
        title: "استخدام مفتاحك الخاص",
        description:
          "الصق مفتاح Nostr الخاص بك (nsec) في هذه المحفظة. غير مُستحسن.",
        delete_tooltip: "حذف المفتاح الخاص",
      },
      signing_extension: {
        title: "ملحق التوقيع",
        description: "استخدام ملحق التوقيع NIP-07",
        not_found: "لم يتم العثور على ملحق التوقيع NIP-07",
      },
    },
    payment_requests: {
      title: "طلبات الدفع",
      description:
        "استقبل المدفوعات عبر Nostr. عند التفعيل، تستمع محفظتك إلى مرحّلات Nostr الخاصة بك.",
      enable_toggle: "تفعيل طلبات الدفع",
      claim_automatically: {
        toggle: "المطالبة تلقائيًا",
        description:
          "أضف المدفوعات الواردة إلى رصيدك دون سؤال. عند الإيقاف، تستلم كل دفعة بنفسك.",
      },
    },
    nostr_wallet_connect: {
      title: "اتصال محفظة Nostr (NWC)",
      description:
        "يتيح للتطبيقات الأخرى الدفع من هذه المحفظة عبر Nostr Wallet Connect.",
      enable_toggle: "تفعيل Nostr Wallet Connect",
      payments_note:
        "يمكنك فقط استخدام NWC للمدفوعات من رصيد Bitcoin الخاص بك. ستتم المدفوعات من مِنْتك النشط.",
      connection: {
        copy_tooltip: "نسخ سلسلة الاتصال",
        qr_tooltip: "إظهار رمز QR",
        allowance_label: "المسموح به المتبقي (سات)",
      },
    },
    hardware_features: {
      webnfc: {
        title: "تنسيق بطاقة NFC",
        description: "اختر الترميز للكتابة على بطاقات NFC",
        text: {
          title: "نص",
          description: "تخزين الرمز كنص عادي",
        },
        weburl: {
          title: "URL",
          description: "تخزين URL لهذه المحفظة مع الرمز",
        },
        binary: {
          title: "ثنائي",
          description: "تخزين الرمز كبيانات ثنائية",
        },
        quick_access: {
          toggle: "وصول سريع إلى NFC",
          description: "يضيف زر NFC إلى شاشة استلام ecash لمسح البطاقات.",
        },
      },
    },
    p2pk_features: {
      title: "ecash مقفل",
      description:
        "ميزة تجريبية. استخدم مبالغ صغيرة: إذا فقدت المفتاح الخاص، فلن يستطيع أحد فتح ecash المقفل به.",
      generate_button: "إنشاء مفتاح",
      import_button: "استيراد مفتاح خاص",
      quick_access: {
        toggle: "إظهار مفتاح القفل في شاشة الاستلام",
        description:
          "يعرض مفتاح القفل في شاشة استلام ecash، ليتمكن المرسلون من قفل ecash لك.",
      },
      keys_expansion: {
        label: "انقر لاستعراض {count} مفتاح",
        used_badge: "مستخدم",
      },
    },
    privacy: {
      title: "الخصوصية",
      network_title: "عمليات فحص الشبكة",
      description: "تؤثر هذه الإعدادات على خصوصيتك.",
      check_incoming: {
        toggle: "التحقق من الفاتورة الواردة",
        description:
          "يفحص أحدث فاتورة لك في الخلفية. تحديثات أسرع، لكن يسهل تتبّع بصمتك.",
      },
      check_startup: {
        toggle: "التحقق من الفواتير المعلقة عند بدء التشغيل",
        description: "يفحص الفواتير المعلقة عند فتح المحفظة.",
      },
      check_all: {
        toggle: "التحقق من جميع الفواتير",
        description:
          "يفحص الفواتير غير المدفوعة في الخلفية لمدة تصل إلى أسبوعين. زيادة النشاط عبر الإنترنت تسهّل تتبّع بصمتك.",
      },
      check_sent: {
        toggle: "التحقق من ecash المرسلة",
        description:
          "يتحقق في الخلفية مما إذا تم استلام ecash المرسل. زيادة النشاط عبر الإنترنت تسهّل تتبّع بصمتك.",
      },
      websockets: {
        toggle: "استخدام WebSockets",
        description:
          "يحافظ على اتصال مباشر بالمِنْتات لتحديثات فورية عن المدفوعات. أسرع، لكن يسهل تتبّع بصمتك.",
      },
      bitcoin_price: {
        title: "سعر البيتكوين",
        toggle: "الحصول على سعر الصرف من Coinbase",
        description:
          "يجلب سعر البيتكوين من coinbase.com لعرض رصيدك بالعملة الورقية.",
        currency: {
          title: "العملة الورقية",
          description: "اختر العملة الورقية لعرض سعر البيتكوين.",
        },
      },
    },
    experimental: {
      title: "تجريبي",
      description: "هذه الميزات تجريبية.",
      receive_swaps: {
        toggle: "استلام عمليات التبديل",
        badge: "بيتا",
        description: "يعرض تبديل ecash المستلم إلى المِنْت النشط.",
      },
      auto_paste: {
        toggle: "لصق ecash تلقائيًا",
        description:
          "يلصق ecash من الحافظة عند فتح استلام ecash. أوقفه إذا سبّب مشاكل في العرض على iOS.",
      },
      auditor: {
        toggle: "تمكين المدقق",
        badge: "بيتا",
        description:
          "يعرض بيانات الموثوقية من مدقق مِنْتات خارجي في تفاصيل المِنْت.",
        url_label: "عنوان URL للمدقق",
        api_url_label: "عنوان URL لواجهة برمجة تطبيقات المدقق",
      },
      multinut: {
        toggle: "تمكين Multinut",
        description: "يدفع الفواتير من عدة مِنْتات في آنٍ واحد.",
      },
      nostr_mint_backup: {
        toggle: "نسخ قائمة المِنْتات احتياطيًا إلى Nostr",
        description:
          "ينسخ قائمة المِنْتات احتياطيًا إلى مرحّلات Nostr الخاصة بك لتستعيدها على جهاز آخر.",
        notifications: {
          enabled: "تم تمكين نسخ المِنْتات احتياطيًا إلى Nostr",
          disabled: "تم تعطيل نسخ المِنْتات احتياطيًا إلى Nostr",
          failed: "فشل تمكين نسخ المِنْتات احتياطيًا إلى Nostr",
        },
      },
    },
    appearance: {
      mode: {
        title: "الوضع",
        dark: "داكن",
        light: "فاتح",
      },
      keyboard: {
        title: "لوحة مفاتيح على الشاشة",
        description: "استخدم لوحة المفاتيح الرقمية لإدخال المبالغ.",
        toggle: "استخدام لوحة المفاتيح الرقمية",
        toggle_description: "يستخدم لوحة الأرقام لإدخال المبالغ.",
      },
      theme: {
        title: "السمة",
        description: "تغيير مظهر محفظتك.",
        tooltips: {
          mono: "أحادي",
          cyber: "سايبر",
          freedom: "حرية",
          nostr: "Nostr",
          bitcoin: "بيتكوين",
          mint: "نعناع",
          nut: "جوز",
          blu: "أزرق",
          flamingo: "فلامينجو",
        },
      },
      bip177: {
        title: "رمز البيتكوين",
        description: "اعرض المبالغ بصيغة ₿2,789 بدلًا من 2,789 sats.",
        toggle: "استخدام رمز ₿",
      },
    },
    web_of_trust: {
      title: "شبكة الثقة",
      known_pubkeys: "المفاتيح العامة المعروفة: {wotCount}",
      continue_crawl: "متابعة الزحف",
      crawl_odell: "استيراد شبكة ثقة Odell",
      crawl_wot: "الزحف إلى شبكة الثقة",
      pause: "إيقاف مؤقت",
      reset: "إعادة تعيين",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      copy_lightning_address: "نسخ عنوان Lightning",
    },
    multinut: {
      use_multinut: "الدفع من عدة مِنْتات",
    },
    advanced: {
      notifications: {
        reserved_unset: "أُلغي حجز جميع البراهين",
        removed_spent: "أُزيلت {count} من البراهين المُنفَقة",
        no_spent: "لم يُعثر على براهين مُنفَقة",
        invalid_backup: "تنسيق ملف النسخة الاحتياطية غير صالح",
        read_error: "خطأ في قراءة الملف",
      },
      title: "متقدم",
      developer: {
        title: "إعدادات المطور",
        description: "أدوات لاستكشاف الأخطاء وإصلاحها.",
        new_seed: {
          button: "إنشاء عبارة استعادة جديدة",
          description:
            "ينشئ عبارة استعادة جديدة. أرسل رصيدك إلى نفسك بعد ذلك لتتمكن العبارة الجديدة من استعادته.",
          confirm_question: "هل أنت متأكد أنك تريد إنشاء عبارة استعادة جديدة؟",
          cancel: "إلغاء",
          confirm: "تأكيد",
        },
        remove_spent: {
          button: "إزالة البراهين المستخدمة",
          description:
            "يزيل ecash الذي تُبلغ المِنْتات النشطة أنه مُنفَق. استخدمه فقط إذا علقت محفظتك.",
        },
        debug_console: {
          button: "وحدة تحكم التصحيح",
          description:
            "يفتح وحدة تحكم JavaScript. لا تلصق أبدًا رمزًا لا تفهمه؛ يستخدمه المحتالون لسرقة الأموال.",
        },
        export_proofs: {
          button: "تصدير البراهين النشطة",
          description:
            "ينسخ رصيد المِنْت النشط بالوحدة المحددة كرمز ecash واحد.",
        },
        keyset_counters: {
          title: "زيادة عدادات مجموعة المفاتيح",
          description:
            'اضغط على مجموعة مفاتيح لزيادة عدّادها. يساعد في حل خطأ "outputs have already been signed".',
          counter: "العداد: {count}",
          increase: "زيادة العداد لـ {id}",
        },
        unset_reserved: {
          button: "إلغاء تعيين جميع الرموز المحجوزة",
          description:
            'يحرّر ecash المحجوز للإرسالات المعلقة لتتمكن من إنفاقه مجددًا. شغّل "إزالة البراهين المستخدمة" بعد ذلك.',
        },
        show_onboarding: {
          button: "إظهار شاشة الترحيب",
          description: "إظهار شاشة الترحيب مرة أخرى.",
        },
        reset_wallet: {
          button: "إعادة تعيين بيانات المحفظة",
          description:
            "يحذف جميع بيانات المحفظة على هذا الجهاز. صدّر نسخة احتياطية أولًا.",
          confirm_question: "هل أنت متأكد أنك تريد حذف بيانات محفظتك؟",
          cancel: "إلغاء",
          confirm: "حذف المحفظة",
        },
        export_wallet: {
          button: "تصدير بيانات المحفظة",
          description:
            "ينزّل ملف نسخة احتياطية يمكنك استيراده في شاشة الترحيب. يصبح قديمًا كلما واصلت استخدام المحفظة.",
        },
        import_wallet: {
          description: "يستبدل بيانات هذه المحفظة بملف نسخة احتياطية مُصدَّر.",
          button: "استيراد نسخة احتياطية للمحفظة",
          confirm_question: "هل تريد بالتأكيد استعادة بيانات محفظتك؟",
          cancel: "إلغاء",
          confirm: "استيراد النسخة الاحتياطية",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "أضف مِنْت",
    subtitle:
      "المِنْتات تُصدر ecash الذي تحمله هذه المحفظة. أضف مِنْت، أو استلم ecash من أحدها، للبدء.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "استلام ecash",
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
        label: "السجل",
      },
      invoices: {
        label: "الفواتير",
      },
      mints: {
        label: "المِنْتات",
      },
    },
    install: {
      text: "تثبيت",
      tooltip: "تثبيت Cashu",
    },
  },
  AlreadyRunning: {
    title: "Cashu.me مفتوح في علامة تبويب أخرى",
    text: "أغلق علامة التبويب الأخرى، ثم اضغط على إعادة المحاولة.",
    actions: {
      retry: {
        label: "إعادة المحاولة",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "هذه الصفحة غير موجودة",
    actions: {
      home: {
        label: "العودة إلى الصفحة الرئيسية",
      },
    },
  },
  BalanceView: {
    mintUrl: {
      label: "المِنْت",
    },
    mintBalance: {
      label: "الرصيد",
    },
    mintError: {
      label: "خطأ في المِنْت",
    },
    pending: {
      label: "معلق",
      tooltip: "التحقق من جميع الرموز المعلقة",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "السابق",
      },
      next: {
        label: "التالي",
      },
    },
  },
  WelcomeSlide1: {
    terms_agreement: "بالمتابعة، فإنك توافق على {terms}",
    title: "أهلًا بك في Cashu.me",
    text: "Cashu.me هي محفظة Bitcoin مجانية ومفتوحة المصدر تستخدم ecash للحفاظ على أموالك آمنة وخصوصية.",
    actions: {
      more: {
        label: "انقر لمعرفة المزيد",
      },
    },
    p1: {
      text: "Cashu هو بروتوكول ecash مجاني ومفتوح المصدر لـ Bitcoin. يمكنك معرفة المزيد عنه على { link }.",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "هذه المحفظة غير تابعة لأي مِنْت. لاستخدامها، تحتاج إلى الاتصال بمِنْت Cashu واحد أو أكثر تثق به.",
    },
    p3: {
      text: "تخزن هذه المحفظة ecash لا يمكنك الوصول إليها إلا أنت. إذا قمت بحذف بيانات المتصفح الخاص بك دون نسخ احتياطي لعبارة الاستعادة، فستفقد رموزك.",
    },
    p4: {
      text: "هذه المحفظة في مرحلة بيتا. لا نتحمل أي مسؤولية عن فقدان الأشخاص الوصول إلى أموالهم. استخدم على مسؤوليتك الخاصة! هذا الكود مفتوح المصدر ومرخص تحت رخصة MIT.",
    },
  },
  WelcomeSlide2: {
    title: "ثبّت Cashu.me",
    alt: { pwa_example: "مثال على تثبيت PWA" },
    installing: "جارٍ التثبيت…",
    instruction: {
      intro: {
        text: "للحصول على أفضل تجربة، استخدم هذه المحفظة مع متصفح الويب الأصلي لجهازك لتثبيتها كتطبيق ويب تقدمي. افعل هذا الآن.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "انقر على القائمة (أعلى اليمين)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "اضغط على { buttonText }",
          buttonText: "@:AndroidPWAPrompt.buttonText",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "انقر على مشاركة (أسفل)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "اضغط على { buttonText }",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "بعد التثبيت، أغلق علامة تبويب المتصفح هذه وافتح Cashu.me من شاشتك الرئيسية.",
      },
    },
    pwa: {
      success: {
        title: "نجاح!",
        text: "أنت تستخدم Cashu كتطبيق PWA. أغلق أي نوافذ متصفح أخرى مفتوحة واستخدم التطبيق من شاشتك الرئيسية.",
        nextSteps:
          "يمكنك الآن إغلاق هذا اللسان وفتح التطبيق من الشاشة الرئيسية.",
      },
    },
  },
  iOSPWAPrompt: {
    text: "انقر على { icon } و { buttonText }",
    buttonText: "إضافة إلى الشاشة الرئيسية",
  },
  AndroidPWAPrompt: {
    text: "انقر على { icon } و { buttonText }",
    buttonText: "إضافة إلى الشاشة الرئيسية",
  },
  WelcomeSlide3: {
    title: "عبارة الاستعادة الخاصة بك",
    text: "احفظ عبارة الاستعادة الخاصة بك في مدير كلمات مرور أو على الورق. عبارة الاستعادة الخاصة بك هي الطريقة الوحيدة لاستعادة أموالك إذا فقدت الوصول إلى هذا الجهاز.",
    inputs: {
      seed_phrase: {
        label: "عبارة الاستعادة",
        caption: "يمكنك رؤية عبارة الاستعادة الخاصة بك في الإعدادات.",
      },
      checkbox: {
        label: "لقد كتبتها",
      },
    },
  },
  WelcomeSlide4: {
    english_only: "النص القانوني متوفر باللغة الإنجليزية فقط.",
    title: "شروط الخدمة",
    actions: {
      more: {
        label: "يُرجى القراءة قبل استخدام Cashu.me",
      },
    },
    inputs: {
      checkbox: {
        label: "لقد قرأت وأقبل هذه الشروط والأحكام",
      },
    },
  },
  WelcomeSlideChoice: {
    title: "إعداد محفظتك",
    text: "هل تريد الاستعادة من عبارة الاستعادة أم إنشاء محفظة جديدة؟",
    options: {
      new: {
        title: "إنشاء محفظة جديدة",
        subtitle: "توليد عبارة استعادة جديدة وإضافة مِنْتات.",
      },
      recover: {
        title: "استعادة المحفظة",
        subtitle: "أدخل عبارة الاستعادة، واستعد المِنْتات و ecash.",
      },
    },
  },
  WelcomeMintSetup: {
    title: "إضافة مِنْتات",
    text: "المِنْتات خوادم تساعدك على إرسال واستلام ecash. اختر مِنْتًا مكتشفًا أو أضِف واحدًا يدويًا. يمكنك التخطي والإضافة لاحقًا.",
    sections: { your_mints: "مِنْتاتك" },
    restoring: "جارٍ استعادة المِنْتات…",
    placeholder: { mint_url: "https://" },
  },
  WelcomeRecoverSeed: {
    title: "أدخل عبارة الاستعادة",
    text: "الصق أو اكتب عبارة من 12 كلمة للاستعادة.",
    inputs: { word: "الكلمة { index }" },
    actions: { paste_all: "لصق الكل" },
    disclaimer: "تُستخدم عبارة الاستعادة محليًا فقط لاشتقاق مفاتيح محفظتك.",
  },
  WelcomeRestoreEcash: {
    title: "استعد ecash الخاصة بك",
    text: "ابحث عن البراهين غير المصروفة على المِنْت المُكوَّنة لديك وأضِفها إلى محفظتك.",
  },
  MintRatings: {
    web_of_trust_hop: "ضمن شبكة الثقة الخاصة بك (القفزة {hop})",
    no_mint_url: "لم يُقدَّم عنوان URL للمِنْت",
    title: "مراجعات المِنْت",
    reviews: "مراجعات",
    ratings: "{n} تقييم | {n} تقييمات",
    no_reviews: "لا توجد مراجعات بعد",
    your_review: "مراجعتك",
    no_reviews_to_display: "لا توجد مراجعات للعرض.",
    no_rating: "لا يوجد تقييم",
    stars_label: "{rating} من 5 نجوم",
    out_of: "من",
    rows: "Reviews",
    sort: "ترتيب",
    sort_options: {
      newest: "الأحدث",
      oldest: "الأقدم",
      highest: "الأعلى",
      lowest: "الأقل",
    },
    actions: { write_review: "اكتب مراجعة" },
    empty_state_subtitle:
      "كن أول من يراجع هذا المِنْت. تجربتك تساعد الآخرين على الاختيار.",
    range: "{from}–{to} من {total}",
  },
  CreateMintReview: {
    connect_nostr: "يُرجى ربط حساب Nostr من الإعدادات لنشر مراجعة.",
    published: "تم نشر المراجعة",
    publish_failed: "تعذّر نشر المراجعة",
    title: "مراجعة المِنْت",
    publishing_as: "النشر باسم",
    inputs: {
      rating: { label: "التقييم" },
      review: { label: "مراجعة (اختياري)" },
    },
    actions: {
      publish: { label: "نشر المراجعة", in_progress: "جارٍ النشر…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "الاستعادة من عبارة الاستعادة",
      caption: "أضف كل مِنْت استخدمته مع هذه العبارة قبل الاستعادة.",
      inputs: {
        seed_phrase: {
          label: "عبارة الاستعادة",
          caption: "يمكنك رؤية عبارة الاستعادة الخاصة بك في الإعدادات.",
        },
      },
    },
    information: {
      label: "معلومات",
      caption:
        "سيقوم المعالج فقط باستعادة ecash من عبارة استعادة أخرى، ولن تتمكن من استخدام عبارة الاستعادة هذه أو تغيير عبارة استعادة المحفظة التي تستخدمها حاليًا. هذا يعني أن ecash المستعادة لن تكون محمية بواسطة عبارة الاستعادة الحالية طالما لم ترسل ecash إلى نفسك مرة واحدة.",
    },
    restore_mints: {
      label: "استعادة المِنْتات",
      caption:
        "اختر المِنْتات المراد استعادتها. أضف المِنْتات الناقصة من تبويب المِنْتات أولًا.",
    },
    actions: {
      paste: {
        error: "فشل قراءة محتويات الحافظة.",
      },
      validate: {
        error: "يجب أن تكون الكلمة التذكيرية 12 كلمة على الأقل.",
      },
      select_all: {
        label: "تحديد الكل",
      },
      deselect_all: {
        label: "إلغاء تحديد الكل",
      },
      restore: {
        label: "استعادة",
        in_progress: "جارٍ استعادة المِنْت…",
        error: "خطأ في استعادة المِنْت: { error }",
      },
      restore_all_mints: {
        label: "استعادة كل المِنْتات",
        in_progress: "جارٍ استعادة المِنْت { index } من { length } …",
        success: "تمت الاستعادة بنجاح",
        error: "خطأ في استعادة المِنْتات: { error }",
      },
      restore_selected_mints: {
        label: "استعادة المِنْتات المحددة ({count})",
        in_progress: "جارٍ استعادة المِنْت { index } من { length } …",
        success: "تمت استعادة {count} من المِنْتات بنجاح",
        error: "خطأ في استعادة المِنْتات المحددة: { error }",
      },
    },
    nostr_mints: {
      label: "استعادة المِنْتات من Nostr",
      caption:
        "ابحث عن نسخ احتياطية للمِنْتات مخزنة على مرحّلات Nostr باستخدام عبارة الاستعادة الخاصة بك. سيساعدك هذا على اكتشاف المِنْتات التي استخدمتها سابقًا.",
      search_button: "البحث عن نسخ احتياطية للمِنْتات",
      select_all: "تحديد الكل",
      deselect_all: "إلغاء تحديد الكل",
      backed_up: "تم النسخ الاحتياطي",
      already_added: "مُضاف بالفعل",
      add_selected: "إضافة المحدد ({count})",
      no_backups_found: "لم يتم العثور على نسخ احتياطية للمِنْتات",
      no_backups_hint:
        "تأكد من تمكين نسخ المِنْتات احتياطيًا إلى Nostr في الإعدادات لنسخ قائمة مِنْتاتك احتياطيًا تلقائيًا.",
      invalid_mnemonic: "الرجاء إدخال عبارة استعادة صالحة قبل البحث.",
      search_error: "فشل البحث عن نسخ احتياطية للمِنْتات.",
      add_error: "فشل إضافة المِنْتات المحددة.",
    },
  },
  MintSettings: {
    add: {
      title: "إضافة مِنْت",
      description:
        "أدخل عنوان URL لمِنْت Cashu للاتصال به. هذه المحفظة غير تابعة لأي مِنْت.",
      inputs: {
        nickname: {
          placeholder: "الاسم المستعار (مثلاً Testnet)",
        },
      },
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "عنوان URL غير صالح",
        },
        scan: {
          label: "مسح رمز QR",
        },
      },
    },
    discover: {
      title: "اكتشف المِنْتات",
      overline: "اكتشف",
      caption: "مِنْتات يوصي بها آخرون على Nostr.",
      actions: {
        discover: {
          label: "اكتشف المِنْتات",
          in_progress: "جارٍ التحميل…",
          error_no_mints: "لم يتم العثور على مِنْتات",
          success: "تم العثور على { length } من المِنْتات",
        },
      },
      unnamed: "مِنْت بلا اسم",
      empty: {
        title: "ابحث عن مِنْت",
        text: "يسأل Cashu.me مرحلات Nostr عن المِنْتات التي يوصي بها الآخرون، مع تقييماتها ومراجعاتها.",
      },
      recommendations: {
        overline: "تم العثور على { length } من المِنْتات",
        caption: "ابحث بنفسك قبل استخدام أي مِنْت.",
        actions: {
          browse: {
            label: "انقر لاستعراض المِنْتات",
          },
        },
      },
    },
    swap: {
      title: "تبديل",
      overline: "التبديل بين المِنْتات",
      caption: "انقل الأموال بين مِنْتاتك عبر Lightning. قد تُطبَّق رسوم.",
      inputs: {
        from: {
          label: "من",
        },
        to: {
          label: "إلى",
        },
        amount: {
          label: "المبلغ ({ ticker })",
        },
      },
      actions: {
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
        receove_to_trusted_mint: { label: "الاستلام إلى مِنْت موثوق" },
      },
    },
    error_badge: "خطأ",
    reviews_text: "مراجعة | مراجعات",
    no_reviews_yet: "لا توجد مراجعات بعد",
    discover_mints_button: "اكتشف المِنْتات",
  },
  QrcodeReader: {
    progress: {
      text: "{ percentage }{ addon }",
      percentage: "{ percentage }%",
      keep_scanning_text: " - استمر في المسح الضوئي",
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
    title: "استلام Lightning",
    create_invoice_title: "إنشاء فاتورة",
    inputs: {
      amount: {
        label: "المبلغ ({ ticker }) *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "إنشاء فاتورة",
        label_blocked: "جارٍ إنشاء الفاتورة",
        in_progress: "إنشاء",
      },
    },
    invoice: {
      caption: "فاتورة Lightning",
      status_paid_text: "مدفوعة",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        copy: {
          label: "نسخ الفاتورة",
        },
      },
    },
  },
  SendDialog: {
    captions: {
      ecash: "شارك رمزًا أو رمز QR",
      lightning: "ادفع فاتورة أو عنوانًا",
      onchain: "أرسل إلى عنوان بيتكوين",
    },
    title: "إرسال",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "لا توجد مِنْتات متاحة",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "لا توجد مِنْتات متاحة",
      },
    },
  },
  SendTokenDialog: {
    badge_locked: "مقفل",
    title: "إرسال ecash",
    title_ecash_text: "Ecash",
    badge_offline_text: "غير متصل",
    inputs: {
      amount: {
        label: "المبلغ ({ ticker }) *",
        invalid_too_much_error_text: "أكثر من اللازم",
      },
      p2pk_pubkey: {
        label: "المفتاح العام للمستلم",
        label_invalid: "المفتاح العام للمستلم",
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
        tooltip_text: "نسخ الرمز التعبيري",
      },
      copy_tokens: {
        label: "نسخ ecash",
      },
      copy_link: {
        tooltip_text: "نسخ الرابط",
      },
      share: {
        tooltip_text: "مشاركة ecash",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      paste_p2pk_pubkey: {
        tooltip_text: "@:global.actions.paste.label",
      },
      send: {
        label: "@:global.actions.send.label",
        in_progress: "جارٍ الإرسال…",
      },
      delete: {
        tooltip_text: "حذف من السجل",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "فلاش إلى بطاقة NFC",
          ndef_unsupported_text: "NDEF غير مدعوم",
        },
      },
      pay: { label: "@:global.actions.pay.label" },
    },
    errors: {
      amount_required: "أدخل مبلغًا أولًا.",
      serialization_failed: "تعذّر تجهيز رمز ecash.",
      mint_not_allowed_by_request: "طلب الدفع هذا لا يقبل المِنْت المحدد.",
    },
  },
  ReceiveDialog: {
    captions: {
      ecash: "الصق رمزًا أو امسحه أو اطلبه",
      lightning: "أنشئ فاتورة لتتلقى الدفع",
      onchain: "احصل على عنوان بيتكوين",
    },
    title: "استلام",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "لا توجد مِنْتات متاحة",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "تحتاج إلى الاتصال بمِنْت للاستلام عبر Lightning",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "استلام ecash",
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      scan: {
        label: "@:global.actions.scan.label",
      },
      request: {
        label: "طلب",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      nfc: {
        label: "NFC",
        scanning_text: "مسح ضوئي…",
      },
    },
  },
  ReceiveTokenDialog: {
    receiving_amount: "جارٍ استلام {amount}",
    title: "استلام ecash",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "لصق رمز Cashu",
      },
    },
    errors: {
      invalid_token: {
        label: "رمز غير صالح",
      },
      p2pk_lock_mismatch: {
        label:
          "غير قادر على الاستلام. قفل P2PK لهذا الرمز لا يطابق المفتاح العام الخاص بك.",
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
        label_adding_mint: "جارٍ إضافة المِنْت…",
      },
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "التبديل إلى مِنْت موثوق به",
        caption: "تبديل { value }",
        processing: "جارٍ التبديل…",
        failed: "فشل التبديل",
      },
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "إلغاء التبديل",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      later: {
        label: "استلام لاحقًا",
        tooltip_text: "أضف إلى السجل للاستلام لاحقًا",
        already_in_history_success_text: "ecash موجود بالفعل في السجل",
        added_to_history_success_text: "تمت إضافة ecash إلى السجل",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "القراءة من بطاقة NFC",
          ndef_unsupported_text: "NDEF غير مدعوم",
        },
      },
      receive_to_selected_mint: { label: "الاستلام إلى المِنْت المحدد" },
    },
    unknown_mint_info_text:
      "مِنْت غير معروف. ستتم إضافته بعد استلام هذا الرمز.",
    swap_section: {
      title: "تبديل",
      source_label: "من",
      destination_label: "إلى",
      fee_info: "سيترتب على هذا التبديل رسوم شبكة Lightning.",
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "مفتاح القفل",
      description: "استلام ecash مقفلة بهذا المفتاح",
      used_warning_text:
        "تحذير: تم استخدام هذا المفتاح من قبل. استخدم مفتاحًا جديدًا لخصوصية أفضل.",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_key: {
        label: "إنشاء مفتاح جديد",
      },
    },
  },
  PaymentRequestDialog: {
    payment_request: {
      caption: "طلب دفع",
      description: "استلام المدفوعات عبر Nostr",
    },
    request_index: "الطلب {index} من {total}",
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "طلب جديد",
      },
      add_amount: {
        label: "إضافة مبلغ",
      },
      use_active_mint: {
        label: "أي مِنْت",
      },
      remove_amount: {
        label: "إزالة المبلغ",
      },
      previous: {
        label: "الطلب السابق",
      },
      next: {
        label: "الطلب التالي",
      },
    },
    inputs: {
      amount: {
        placeholder: "أدخل المبلغ",
      },
    },
    received_total: "إجمالي المستلم",
    no_payments_yet: "لا توجد مدفوعات بعد",
  },
  NumericKeyboard: {
    actions: {
      close: {
        label: "@:global.actions.close.label",
        closed_info_text:
          "تم تعطيل لوحة المفاتيح. يمكنك إعادة تمكين لوحة المفاتيح في الإعدادات.",
      },
      enter: {
        label: "@:global.actions.enter.label",
      },
    },
  },
  NWCDialog: {
    nwc: {
      caption: "اتصال محفظة Nostr",
      description:
        "تحكم في محفظتك عن بعد باستخدام NWC. اضغط على رمز الاستجابة السريعة لربط محفظتك بتطبيق متوافق.",
      warning_text:
        "تحذير: أي شخص لديه حق الوصول إلى سلسلة الاتصال هذه يمكنه بدء مدفوعات من محفظتك. لا تشاركها!",
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
    title: "رسالة المِنْت",
  },
  MintDetailsDialog: {
    qr: {
      show: "إظهار رمز QR",
      hide: "إخفاء رمز QR",
    },
    contact: {
      title: "جهة الاتصال",
    },
    details: {
      title: "تفاصيل المِنْت",
      url: {
        label: "URL",
      },
      nuts: {
        label: "NUTs المدعومة",
        actions: {
          show: {
            label: "عرض الكل",
          },
          hide: {
            label: "إخفاء",
          },
        },
      },
      currency: {
        label: "الوحدة",
      },
      currencies: {
        label: "@:MintDetailsDialog.details.currency.label",
      },
      version: {
        label: "الإصدار",
      },
    },
    actions: {
      title: "الإجراءات",
      copy_mint_url: {
        label: "نسخ عنوان URL للمِنْت",
      },
      delete: {
        label: "حذف المِنْت",
      },
      edit: {
        label: "تعديل المِنْت",
      },
    },
  },
  ChooseMint: {
    title: "حدد مِنْتًا",
    badge_mint_error_text: "خطأ",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
    available_text: "في هذا المِنْت",
    sheet_title: "اختر مِنْت",
    placeholder: "اختر مِنْت",
  },
  HistoryTable: {
    empty_text: "لا يوجد سجل حتى الآن",
    row: {
      type_label: "Ecash",
      date_label: "منذ { value }",
    },
    actions: {
      filter_ecash_only: {
        label: "ecash فقط",
      },
      check_status: {
        tooltip_text: "التحقق من الحالة",
      },
      receive: {
        tooltip_text: "استلام",
      },
      filter_pending: {
        label: "إظهار المعلقة فقط",
      },
      show_all: {
        label: "عرض الكل",
      },
    },
    old_token_not_found_error_text: "لم يتم العثور على الرمز القديم",
  },
  InvoiceTable: {
    empty_text: "لا يوجد فواتير حتى الآن",
    row: {
      type_label: "Lightning",
      type_tooltip_text: "انقر للنسخ",
      date_label: "منذ { value }",
    },
    actions: {
      check_status: {
        tooltip_text: "التحقق من الحالة",
      },
      filter_pending: {
        label: "إظهار المعلقة فقط",
      },
      show_all: {
        label: "عرض الكل",
      },
    },
  },
  RemoveMintDialog: {
    title: "إزالة هذا المِنْت؟",
    nickname: {
      label: "الاسم المستعار",
    },
    balances: {
      label: "الأرصدة",
    },
    warning_text:
      "يبقى ecash الخاص بك من هذا المِنْت على هذا الجهاز، ويعود إذا أضفت المِنْت مرة أخرى.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "إزالة المِنْت",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  ParseInputComponent: {
    placeholder: {
      default: "رمز Cashu أو عنوان Lightning",
      receive: "رمز Cashu",
      pay: "عنوان Lightning أو فاتورة",
    },
    qr_scanner: {
      title: "مسح رمز QR",
      description: "وجّه الكاميرا نحو رمز QR",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    onchain: {
      title: "الدفع على السلسلة",
      address_placeholder: "عنوان Bitcoin",
      choose_speed: "اختر سرعة التأكيد",
      blocks: "{n} كتلة",
      estimated_confirmation: "التأكيد المتوقع",
      fee_reserve: "احتياطي الرسوم",
    },
    multinut: {
      label: "الدفع من عدة مِنْتات",
    },
    quote: {
      label: "عرض سعر",
    },
    input_data: {
      title: "الدفع عبر Lightning",
      inputs: {
        invoice_data: {
          label: "فاتورة Lightning أو عنوان",
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
      title_bolt12: "دفع عرض Lightning",
    },
    lnurlpay: {
      amount_exact_label: "{ payee } يطلب { value } { ticker }",
      amount_range_label: "{ payee } يطلب{br}بين { min } و { max } { ticker }",
      sending_to_lightning_address: "إرسال إلى { address }",
      inputs: {
        amount: {
          label: "المبلغ ({ ticker }) *",
        },
        comment: {
          label: "تعليق (اختياري)",
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
      title: "دفع { value }",
      paying: "جاري الدفع",
      paid: "تم الدفع",
      fee: "الرسوم",
      memo: {
        label: "مذكرة",
      },
      processing_info_text: "جاري المعالجة…",
      balance_too_low_warning_text: "الرصيد منخفض جدًا",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        pay: {
          label: "دفع",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
          waiting_for_wallet: "بانتظار المحفظة…",
          error: "خطأ",
        },
      },
    },
  },
  EditMintDialog: {
    title: "تعديل المِنْت",
    inputs: {
      nickname: {
        placeholder: "مثال: Testnet",
        label: "الاسم المستعار",
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
    title: "هل تثق في هذا المِنْت؟",
    description:
      "انضم إلى هذا المِنْت فقط إذا كنت تثق به. إذا توقف عن العمل، تضيع ecash التي تحملها لديه.",
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
        in_progress: "جارٍ إضافة المِنْت",
      },
    },
    audit_info: {
      label: "معلومات التدقيق",
      actions: {
        show: {
          label: "عرض",
        },
        hide: {
          label: "إخفاء",
        },
      },
    },
    unreachable_error_text:
      "تعذّر الوصول إلى هذا المِنْت. تحقق من الرابط واتصالك، ثم حاول مرة أخرى.",
  },
  restore: {
    mnemonic_error_text: "الرجاء إدخال كلمة تذكيرية",
    restore_mint_error_text: "خطأ في استعادة المِنْت: { error }",
    prepare_info_text: "تحضير عملية الاستعادة…",
    restored_proofs_for_keyset_info_text:
      "تم استعادة { restoreCounter } برهان لمجموعة المفاتيح { keysetId }",
    checking_proofs_for_keyset_info_text:
      "التحقق من البراهين من { startIndex } إلى { endIndex } لمجموعة المفاتيح { keysetId }",
    no_proofs_info_text: "لم يتم العثور على براهين للاستعادة",
    restored_amount_success_text: "تم استعادة { amount }",
  },
  swap: {
    in_progress_warning_text: "التبديل قيد التقدم",
    invalid_swap_data_error_text: "بيانات تبديل غير صالحة",
    swap_error_text: "خطأ في التبديل",
  },
  TokenInformation: {
    fee: "الرسوم",
    unit: "الوحدة",
    fiat: "العملة الورقية",
    p2pk: "P2PK",
    locked: "مقفل",
    locked_to_you: "مقفل لك",
    mint: "المِنْت",
    memo: "مذكرة",
    payment_request: "طلب دفع",
    nostr: "Nostr",
    token_copied: "تم نسخ الرمز المميز إلى الحافظة",
  },
  common: {
    copied: "تم النسخ",
    on_chain: "على السلسلة",
    pending: "معلّقة",
    delete: "حذف",
    copy_npub: "نسخ npub",
    back: "رجوع",
    refresh: "تحديث",
    settings: "الإعدادات",
    backspace: "حذف حرف",
    swap_input_mode: "التبديل بين إدخال المبلغ والعملة الورقية",
    fee: "الرسوم",
  },
  SendPaymentRequest: {
    actions: {
      pay: { label: "ادفع" },
      pay_via: { label: "ادفع عبر {transport}" },
    },
    info: {
      pay_failed: "تعذّر دفع الطلب",
      pay_to: "الدفع إلى {target}",
      invalid_url: "رابط غير صالح",
    },
  },
  PaymentRequestInfo: {
    title_with_transport: "طلب دفع عبر {transport}",
    title: "طلب دفع",
    subtitle: "الدفع إلى {target}",
    subtitle_fallback: "طلب دفع",
    invalid_url: "رابط غير صالح",
  },
  QuoteInformation: {
    amount: "المبلغ",
    fee_reserve: "احتياطي الرسوم",
    fee_paid: "الرسوم المدفوعة",
    unit: "الوحدة",
    status: "الحالة",
    network: "الشبكة",
    transaction_id: "معرّف المعاملة",
    chain_status: "حالة السلسلة",
    fetching: "جارٍ الجلب",
    paid_at: "وقت الدفع",
    preimage: "الصورة الأولية",
    preimage_copied: "تم نسخ الصورة الأولية",
    mint: "المِنْت",
    method: "الطريقة",
    lightning_offer: "عرض Lightning",
    chain_confirmed: "مؤكَّدة",
    chain_pending: "معلّقة",
    states: {
      waiting: "في انتظار الدفع",
      paid: "مدفوعة",
      unpaid: "غير مدفوعة",
      pending: "معلّقة",
      issued: "صادرة",
      expired: "منتهية الصلاحية",
      failed: "فشلت",
    },
  },
  MintAuditInfo: {
    title: "معلومات التدقيق",
    loading: "جارٍ تحميل معلومات التدقيق...",
    not_audited: "لم يُدقَّق هذا المِنْت بعد.",
    not_audited_text:
      "لمعرفة المزيد عن المدقق أو دعم تدقيق مستقبلي، زُر {link} أو انقر {here} للتبرع بـ ecash والمساعدة في بدء تدقيق هذا المِنْت.",
    here: "هنا",
    unavailable: "معلومات التدقيق غير متاحة حاليًا.",
    load_failed: "تعذّر تحميل بيانات المِنْت",
    success_rate: "معدل النجاح",
    swaps_count: "{successful} من {total} عمليات تبديل",
    average_time: "متوسط الوقت",
    average_time_caption: "لعمليات التبديل الناجحة",
    disclaimer:
      "تقدّم جهات خارجية مستقلة بيانات التدقيق للمساعدة في تقييم موثوقية المِنْت بمرور الوقت. غير أن هذه النتائج للعلم فقط، ولا تضمن أمان أي مِنْت أو ملاءته أو جدارته بالثقة. ابحث بنفسك دائمًا، وتأكد من ثقتك بمشغّل المِنْت قبل استخدام خدماته.",
    donate_text:
      "يوفّر {link} معلومات التدقيق. الرصيد الحالي الذي يحتفظ به المدقق لهذا المِنْت هو {balance}، وبلغ إجمالي التبرعات حتى الآن {donations}. لدعم استمرار التدقيق، يمكنك {press_here} للتبرع بـ ecash للمدقق.",
    press_here: "الضغط هنا",
    sats_amount: "{amount} ساتوشي",
    warnings_title: "تحذيرات المدقق",
    warnings: {
      last_swap_failed: "فشلت آخر محاولة تبديل.",
      recent_success:
        "نجحت {successful} من {total} عمليات تبديل خلال آخر {days} يومًا.",
      reliable:
        "{base} ومع ذلك، {success} يبدو هذا المِنْت موثوقًا، وقد يعود الفشل إلى المِنْت المستقبِل.",
      unreliable: "{base} فقط {success} قد يكون هذا المِنْت غير موثوق.",
      unknown: "لم يتمكن المدقق بعد من تحديد جودة هذا المِنْت.",
      not_enough_data:
        "لا يملك المدقق بيانات حديثة كافية عن هذا المِنْت. لم تنجح سوى {count} عملية تبديل خلال آخر {days} يومًا.",
      low_success:
        "خلال آخر {days} يومًا، بلغ معدل نجاح هذا المِنْت {rate}%، وهو أقل من النسبة الموصى بها {threshold}%.",
      inactive:
        "لم يُجرِ هذا المِنْت أي عملية تبديل منذ {days} يومًا. قد يتعذّر الوصول إليه.",
      slow: "هذا المِنْت بطيء. استغرقت المدفوعات منه {seconds} ثانية في المتوسط.",
      no_successful:
        "لم تُسجَّل أي عملية تبديل ناجحة لهذا المِنْت. قد يتعذّر الوصول إليه.",
    },
    chart: {
      now: "الآن",
      today: "اليوم",
      yesterday: "أمس",
      invalid_date: "تاريخ غير صالح",
      swaps: "عمليات التبديل:",
      success_rate: "معدل النجاح:",
      time_range: "النطاق الزمني:",
    },
  },
  DisplayTokenComponent: {
    title: {
      send: "إرسال ecash",
      sent: "تم إرسال ecash",
      received: "تم استلام ecash",
    },
    qr_speed: "سرعة QR: {value}",
    qr_size: "حجم QR: {value}",
    speed: {
      fast: "سريعة",
      medium: "متوسطة",
      slow: "بطيئة",
    },
    size: {
      large: "كبير",
      medium: "متوسط",
      small: "صغير",
    },
    delete_dialog: {
      title: "حذف ecash",
      text: "هل أنت متأكد من حذف هذه المعاملة من سجلك؟",
      warning:
        "تحذير: لا يمكن التراجع عن هذا الإجراء، ولا توجد طريقة لاستعادة الرمز.",
    },
    nfc: {
      read_failed: "فشلت قراءة NFC",
      write_failed: "فشلت الكتابة على NFC",
      error: "خطأ في NFC",
      writing: "جارٍ الكتابة على بطاقة NFC...",
      success: "تمت كتابة الرمز على البطاقة بنجاح!",
      capacity: "قد لا تكفي سعة البطاقة (المطلوب {bytes} بايت).",
    },
  },
  CreateInvoiceDialog: {
    onchain_title: "الاستلام على السلسلة",
    bolt12_title: "استلام Bolt12",
    mint_unreachable: "تعذّر الوصول إلى المِنْت",
    mint_unreachable_text: "أعد الاتصال بالمِنْت لاستلام المدفوعات.",
    reconnect_mint: "إعادة الاتصال بالمِنْت",
    checking_address: "جارٍ التحقق من العنوان...",
    add_amount: "إضافة مبلغ",
    new_offer: "عرض جديد",
    create_offer: "إنشاء عرض",
    create_new_address: "إنشاء عنوان جديد",
    create_address: "إنشاء عنوان",
    onchain_unsupported:
      "لا يدعم هذا المِنْت الإيداعات على السلسلة بهذه الوحدة.",
    deposit_limits: {
      outside: "لن تُضاف الإيداعات خارج النطاق {min}–{max}.",
      below: "لن تُضاف الإيداعات الأقل من {min}.",
      above: "لن تُضاف الإيداعات الأعلى من {max}.",
    },
    amount_errors: {
      positive_decimal:
        "أدخل مبلغًا موجبًا بمنزلتين عشريتين كحد أقصى بعملة {unit}.",
      positive_whole: "أدخل مبلغًا صحيحًا موجبًا بوحدة {unit}.",
      min: "أدخل {amount} على الأقل.",
      max: "أدخل {amount} كحد أقصى.",
    },
  },
};
