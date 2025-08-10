export default {
  copied_to_clipboard: "Copied to clipboard!",
  copy_failed: "Copy failed",
  global: {
    copy_to_clipboard: {
      success: "تم النسخ إلى الحافظة!",
    },
    actions: {
      add_mint: {
        label: "إضافة Mint",
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
      ok: {
        label: "OK",
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
      creatorHub: {
        publish: "Publish Profile",
        profileHeader: "Profile details",
      },
      swap: {
        label: "تبديل",
      },
      update: {
        label: "تحديث",
      },
    },
    inputs: {
      mint_url: {
        label: "عنوان URL للـ Mint",
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
      nostr_dm_sent: "تم إرسال رسالة Nostr",
      nostr_dm_failed: "فشل إرسال رسالة Nostr",
    },
    mint: {
      notifications: {
        already_added: "تمت إضافة الـ Mint بالفعل",
        added: "تمت إضافة الـ Mint",
        not_found: "لم يتم العثور على الـ Mint",
        activation_failed: "فشل تنشيط الـ Mint",
        no_active_mint: "لا يوجد Mint نشط",
        unit_activation_failed: "فشل تنشيط الوحدة",
        unit_not_supported: "الوحدة غير مدعومة من قبل الـ Mint",
        activated: "تم تنشيط الـ Mint",
        could_not_connect: "تعذر الاتصال بالـ Mint",
        could_not_get_info: "تعذر الحصول على معلومات الـ Mint",
        could_not_get_keys: "تعذر الحصول على مفاتيح الـ Mint",
        could_not_get_keysets: "تعذر الحصول على مجموعات مفاتيح الـ Mint",
        removed: "تمت إزالة الـ Mint",
        error: "خطأ في الـ Mint",
      },
    },
    signer_connected: "تم توصيل موقع Nostr",
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
          caption: "شروط الخدمة",
        },
      },
      about: {
        title: "About",
        about: { title: "About", caption: "About this app" },
      },
      links: {
        title: "روابط",
        fundstrCreator: {
          title: "منشئ Fundstr",
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
    language: {
      title: "اللغة",
      description: "الرجاء اختيار لغتك المفضلة من القائمة أدناه.",
    },
    sections: {
      backup_restore: "النسخ الاحتياطي والاستعادة",
      lightning_address: "عنوان LIGHTNING",
      nostr_keys: "مفاتيح NOSTR",
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
          "يتيح لك معالج الاستعادة استرداد ecash المفقود من عبارة استعادة. لن تتأثر عبارة استعادة محفظتك الحالية، وسيسمح لك المعالج فقط باستعادة ecash من عبارة استعادة أخرى.",
        button: "استعادة",
      },
    },
    lightning_address: {
      title: "عنوان Lightning",
      description: "استلام المدفوعات إلى عنوان Lightning الخاص بك.",
      enable: {
        toggle: "تمكين",
        description: "عنوان Lightning مع npub.cash",
      },
      address: {
        copy_tooltip: "نسخ عنوان Lightning",
      },
      automatic_claim: {
        toggle: "المطالبة تلقائيًا",
        description: "استلام المدفوعات الواردة تلقائيًا.",
      },
    },
    nostr_keys: {
      title: "مفاتيح nostr الخاصة بك",
      description: "قم بتعيين مفاتيح nostr لعنوان Lightning الخاص بك.",
      wallet_seed: {
        title: "عبارة استعادة المحفظة",
        description: "إنشاء زوج مفاتيح nostr من عبارة استعادة المحفظة",
        copy_nsec: "نسخ nsec",
      },
      nsec_bunker: {
        title: "Nsec Bunker",
        description: "استخدام مخبأ NIP-46",
        delete_tooltip: "حذف الاتصال",
      },
      use_nsec: {
        title: "استخدام nsec الخاص بك",
        description: "هذه الطريقة خطيرة ولا ينصح بها",
        delete_tooltip: "حذف nsec",
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
        "تسمح لك طلبات الدفع بتلقي المدفوعات عبر nostr. إذا قمت بتمكين هذا، ستقوم محفظتك بالاشتراك في مرحلات nostr الخاصة بك.",
      enable_toggle: "تمكين طلبات الدفع",
      claim_automatically: {
        toggle: "المطالبة تلقائيًا",
        description: "استلام المدفوعات الواردة تلقائيًا.",
      },
    },
    nostr_wallet_connect: {
      title: "اتصال محفظة Nostr (NWC)",
      description: "استخدم NWC للتحكم في محفظتك من أي تطبيق آخر.",
      enable_toggle: "تمكين NWC",
      payments_note:
        "يمكنك فقط استخدام NWC للمدفوعات من رصيد Bitcoin الخاص بك. ستتم المدفوعات من mint النشط الخاص بك.",
      connection: {
        copy_tooltip: "نسخ سلسلة الاتصال",
        qr_tooltip: "إظهار رمز QR",
        allowance_label: "المسموح به المتبقي (سات)",
      },
      relays: {
        expand_label: "انقر لتعديل المرحلات",
        add: {
          title: "إضافة مرحل",
          description:
            "يستخدم Nostr Wallet Connect مرحلات nostr لربط محفظتك بتطبيقات أخرى.",
        },
        list: {
          title: "مرحلات",
          description: "ستتصل محفظتك بهذه المرحلات.",
          copy_tooltip: "نسخ المرحل",
          remove_tooltip: "إزالة المرحل",
        },
      },
    },
    hardware_features: {
      webnfc: {
        title: "WebNFC",
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
          title: "ثنائي خام",
          description:
            "بايتات خام بدلاً من Base64. يجعل الرموز أقصر بحوالي 33%.",
        },
        quick_access: {
          toggle: "وصول سريع إلى NFC",
          description:
            "مسح بطاقات NFC بسرعة في قائمة استلام Ecash. يضيف هذا الخيار زر NFC إلى قائمة استلام Ecash.",
        },
      },
    },
    p2pk_features: {
      title: "P2PK",
      description:
        "إنشاء زوج مفاتيح لاستلام ecash مقفلة بـ P2PK. تحذير: هذه الميزة تجريبية. استخدمها بكميات صغيرة فقط. إذا فقدت مفاتيحك الخاصة، فلن يتمكن أحد من فتح ecash المقفلة بها بعد الآن.",
      generate_button: "إنشاء مفتاح",
      import_button: "استيراد nsec",
      quick_access: {
        toggle: "وصول سريع للقفل",
        description:
          "استخدم هذا لعرض مفتاح قفل P2PK الخاص بك بسرعة في قائمة استلام ecash.",
      },
      keys_expansion: {
        label: "انقر لاستعراض {count} مفتاح",
        used_badge: "مستخدم",
      },
    },
    privacy: {
      title: "الخصوصية",
      description: "تؤثر هذه الإعدادات على خصوصيتك.",
      check_incoming: {
        toggle: "التحقق من الفاتورة الواردة",
        description:
          "إذا تم تمكين هذا، ستقوم المحفظة بفحص أحدث فاتورة في الخلفية. يزيد هذا من استجابة المحفظة مما يسهل عملية البصمة. يمكنك التحقق من الفواتير غير المدفوعة يدويًا في علامة التبويب الفواتير.",
      },
      check_startup: {
        toggle: "التحقق من الفواتير المعلقة عند بدء التشغيل",
        description:
          "إذا تم تمكين هذا، ستقوم المحفظة بفحص الفواتير المعلقة من آخر 24 ساعة عند بدء التشغيل.",
      },
      check_all: {
        toggle: "التحقق من جميع الفواتير",
        description:
          "إذا تم تمكين هذا، ستقوم المحفظة بالتحقق بشكل دوري من الفواتير غير المدفوعة في الخلفية لمدة تصل إلى أسبوعين. يزيد هذا من نشاط المحفظة عبر الإنترنت مما يسهل عملية البصمة. يمكنك التحقق من الفواتير غير المدفوعة يدويًا في علامة التبويب الفواتير.",
      },
      check_sent: {
        toggle: "التحقق من ecash المرسلة",
        description:
          "إذا تم تمكين هذا، ستقوم المحفظة باستخدام فحوصات خلفية دورية لتحديد ما إذا تم استرداد الرموز المرسلة. يزيد هذا من نشاط المحفظة عبر الإنترنت مما يسهل عملية البصمة.",
      },
      websockets: {
        toggle: "استخدام WebSockets",
        description:
          "إذا تم تمكين هذا، ستقوم المحفظة باستخدام اتصالات WebSocket طويلة الأمد لاستلام التحديثات حول الفواتير المدفوعة والرموز المستخدمة من mints. يزيد هذا من استجابة المحفظة ولكنه يسهل أيضًا عملية البصمة.",
      },
      bitcoin_price: {
        toggle: "الحصول على سعر الصرف من Coinbase",
        description:
          "إذا تم تمكين هذا، سيتم جلب سعر صرف Bitcoin الحالي من coinbase.com وسيتم عرض رصيدك المحول.",
      },
    },
    experimental: {
      title: "تجريبي",
      description: "هذه الميزات تجريبية.",
      receive_swaps: {
        toggle: "استلام عمليات التبديل",
        badge: "بيتا",
        description:
          "خيار تبديل Ecash المستلم إلى mint النشط الخاص بك في مربع حوار استلام Ecash.",
      },
      auto_paste: {
        toggle: "لصق Ecash تلقائيًا",
        description:
          "لصق ecash تلقائيًا في الحافظة الخاصة بك عند الضغط على استلام، ثم Ecash، ثم لصق. قد يتسبب اللصق التلقائي في مشاكل في واجهة المستخدم في iOS، قم بإيقاف تشغيله إذا واجهت مشاكل.",
      },
      auto_redeem_locked: {
        toggle: "استرداد الرموز المقفلة تلقائيًا",
        description:
          "إذا تم تمكين هذا، ستسترد المحفظة الرموز المقفلة تلقائيًا بمجرد أن تصبح قابلة للاسترداد.",
      },
      auditor: {
        toggle: "تمكين المدقق",
        badge: "بيتا",
        description:
          "إذا تم تمكين هذا، ستعرض المحفظة معلومات المدقق في مربع حوار تفاصيل mint. المدقق هو خدمة طرف ثالث تراقب موثوقية mints.",
        url_label: "عنوان URL للمدقق",
        api_url_label: "عنوان URL لواجهة برمجة تطبيقات المدقق",
      },
    },
    appearance: {
      keyboard: {
        title: "لوحة مفاتيح على الشاشة",
        description: "استخدم لوحة المفاتيح الرقمية لإدخال المبالغ.",
        toggle: "استخدام لوحة المفاتيح الرقمية",
        toggle_description:
          "إذا تم تمكين هذا، سيتم استخدام لوحة المفاتيح الرقمية لإدخال المبالغ.",
      },
      theme: {
        title: "المظهر",
        description: "تغيير مظهر محفظتك.",
        tooltips: {
          mono: "أحادي",
          cyber: "سايبر",
          freedom: "حرية",
          nostr: "نوستر",
          bitcoin: "بيتكوين",
          mint: "مينت",
          nut: "جوز",
          blu: "أزرق",
          flamingo: "فلامينجو",
          modern: "modern",
        },
      },
    },
    advanced: {
      title: "متقدم",
      developer: {
        title: "إعدادات المطور",
        description: "الإعدادات التالية هي للتطوير والتصحيح.",
        new_seed: {
          button: "إنشاء عبارة استعادة جديدة",
          description:
            "سيؤدي هذا إلى إنشاء عبارة استعادة جديدة. يجب عليك إرسال رصيدك بالكامل إلى نفسك لتتمكن من استعادته باستخدام عبارة استعادة جديدة.",
          confirm_question: "هل أنت متأكد أنك تريد إنشاء عبارة استعادة جديدة؟",
          cancel: "إلغاء",
          confirm: "تأكيد",
        },
        remove_spent: {
          button: "إزالة البراهين المستخدمة",
          description:
            "تحقق مما إذا كانت رموز ecash من mints النشطة الخاصة بك قد تم استخدامها وإزالة المستخدمة من محفظتك. استخدم هذا فقط إذا كانت محفظتك عالقة.",
        },
        debug_console: {
          button: "تبديل وحدة تحكم التصحيح",
          description:
            "افتح طرفية تصحيح Javascript. لا تلصق أبدًا أي شيء في هذه الطرفية لا تفهمه. قد يحاول لص خداعك للصق رمز ضار هنا.",
        },
        export_proofs: {
          button: "تصدير البراهين النشطة",
          description:
            "نسخ رصيدك بالكامل من mint النشط كرمز Cashu إلى الحافظة الخاصة بك. سيؤدي هذا فقط إلى تصدير الرموز من mint والوحدة المحددة. لتصدير كامل، حدد mint ووحدة مختلفين وقم بالتصدير مرة أخرى.",
        },
        keyset_counters: {
          title: "زيادة عدادات مجموعة المفاتيح",
          description:
            'انقر على معرّف مجموعة المفاتيح لزيادة عدادات مسار الاشتقاق لمجموعات المفاتيح في محفظتك. هذا مفيد إذا رأيت خطأ "النواتج تم توقيعها بالفعل".',
        },
        unset_reserved: {
          button: "إلغاء تعيين جميع الرموز المحجوزة",
          description:
            'تضع هذه المحفظة علامة على ecash الصادرة المعلقة كمحجوزة (وتطرحها من رصيدك) لمنع محاولات الإنفاق المزدوج. هذا الزر سيلغي تعيين جميع الرموز المحجوزة بحيث يمكن استخدامها مرة أخرى. إذا قمت بذلك، قد تتضمن محفظتك براهين مستخدمة. اضغط على زر "إزالة البراهين المستخدمة" للتخلص منها.',
        },
        show_onboarding: {
          button: "إظهار شاشة الترحيب",
          description: "إظهار شاشة الترحيب مرة أخرى.",
        },
        reset_wallet: {
          button: "إعادة تعيين بيانات المحفظة",
          description:
            "إعادة تعيين بيانات محفظتك. تحذير: سيؤدي هذا إلى حذف كل شيء! تأكد من إنشاء نسخة احتياطية أولاً.",
          confirm_question: "هل أنت متأكد أنك تريد حذف بيانات محفظتك؟",
          cancel: "إلغاء",
          confirm: "حذف المحفظة",
        },
        export_wallet: {
          button: "تصدير بيانات المحفظة",
          description:
            "تنزيل نسخة من محفظتك. يمكنك استعادة محفظتك من هذا الملف في شاشة الترحيب لمحفظة جديدة. سيكون هذا الملف غير متزامن إذا واصلت استخدام محفظتك بعد تصديره.",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "انضم إلى mint",
    subtitle:
      "لم تنضم إلى أي Cashu mint بعد. أضف عنوان URL لـ mint في الإعدادات أو استلم ecash من mint جديد للبدء.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "استلام Ecash",
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
      scan: {
        tooltip: "Scan a QR code",
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
        label: "Mints",
      },
    },
    install: {
      text: "تثبيت",
      tooltip: "تثبيت Cashu",
    },
  },
  AlreadyRunning: {
    title: "لا.",
    text: "علامة تبويب أخرى قيد التشغيل بالفعل. أغلق هذه العلامة وحاول مرة أخرى.",
    actions: {
      retry: {
        label: "إعادة المحاولة",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "هذه الصفحة غير موجودة. جرّب الروابط أدناه للحصول على مساعدة:",
    links: {
      docs: "الوثائق",
      tips: "نصائح",
    },
    actions: {
      home: {
        label: "العودة إلى الصفحة الرئيسية",
      },
    },
  },
  BalanceView: {
    mintUrl: {
      label: "Mint",
    },
    mintBalance: {
      label: "الرصيد",
    },
    mintError: {
      label: "خطأ في Mint",
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
      skip: {
        label: "تخطي",
      },
    },
  },
  WelcomeSlide1: {
    title: "أهلاً بك في Cashu",
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
      text: "هذه المحفظة غير تابعة لأي mint. لاستخدام هذه المحفظة، تحتاج إلى الاتصال بواحد أو أكثر من Cashu mints التي تثق بها.",
    },
    p3: {
      text: "تخزن هذه المحفظة ecash لا يمكنك الوصول إليها إلا أنت. إذا قمت بحذف بيانات المتصفح الخاص بك دون نسخ احتياطي لعبارة الاستعادة، فستفقد رموزك.",
    },
    p4: {
      text: "هذه المحفظة في مرحلة بيتا. لا نتحمل أي مسؤولية عن فقدان الأشخاص الوصول إلى أموالهم. استخدم على مسؤوليتك الخاصة! هذا الكود مفتوح المصدر ومرخص تحت رخصة MIT.",
    },
  },
  WelcomeSlide2: {
    title: "تثبيت PWA",
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
        text: "بعد تثبيت هذا التطبيق على جهازك، أغلق نافذة المتصفح هذه واستخدم التطبيق من شاشتك الرئيسية.",
      },
    },
    pwa: {
      success: {
        title: "نجاح!",
        text: "أنت تستخدم Cashu كتطبيق PWA. أغلق أي نوافذ متصفح أخرى مفتوحة واستخدم التطبيق من شاشتك الرئيسية.",
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
        tooltip: "This phrase restores your wallet. Keep it private",
      },
      checkbox: {
        label: "لقد كتبتها",
      },
    },
  },
  WelcomeSlide4: {
    title: "الشروط",
    actions: {
      more: {
        label: "قراءة شروط الخدمة",
      },
    },
    inputs: {
      checkbox: {
        label: "لقد قرأت وأقبل هذه الشروط والأحكام",
      },
    },
  },
  WelcomeSlidePrivacy: {
    title: "كاشو والخصوصية",
    text: "يستخدم كاشو رموزاً معماة حتى لا يتمكن المِنت من تتبع مدفوعاتك.",
  },
  WelcomeSlideMints: {
    title: "المِنتات",
    text: "أضف مِنتاً لبدء استلام الرموز.",
  },
  WelcomeSlideProofs: {
    title: "الإثباتات",
    text: "الإثباتات هي الرموز التي يمكنك إرسالها واستلامها.",
  },
  WelcomeSlideBuckets: {
    title: "السلال",
    text: "استخدم السلال لتنظيم رموزك.",
  },
  RestoreView: {
    seed_phrase: {
      label: "استعادة من عبارة الاستعادة",
      caption:
        "أدخل عبارة الاستعادة الخاصة بك لاستعادة محفظتك. قبل الاستعادة، تأكد من أنك أضفت جميع mints التي استخدمتها من قبل.",
      inputs: {
        seed_phrase: {
          label: "عبارة الاستعادة",
          caption: "يمكنك رؤية عبارة الاستعادة الخاصة بك في الإعدادات.",
          tooltip: "Enter the 12-word recovery phrase",
        },
      },
    },
    information: {
      label: "معلومات",
      caption:
        "سيقوم المعالج فقط باستعادة ecash من عبارة استعادة أخرى، ولن تتمكن من استخدام عبارة الاستعادة هذه أو تغيير عبارة استعادة المحفظة التي تستخدمها حاليًا. هذا يعني أن ecash المستعادة لن تكون محمية بواسطة عبارة الاستعادة الحالية طالما لم ترسل ecash إلى نفسك مرة واحدة.",
    },
    restore_mints: {
      label: "استعادة Mints",
      caption:
        'حدد mint للاستعادة. يمكنك إضافة المزيد من mints في الشاشة الرئيسية تحت "Mints" واستعادتها هنا.',
    },
    actions: {
      paste: {
        error: "فشل قراءة محتويات الحافظة.",
      },
      validate: {
        error: "يجب أن تكون الكلمة التذكيرية 12 كلمة على الأقل.",
      },
      restore: {
        label: "استعادة",
        in_progress: "استعادة mint…",
        error: "خطأ في استعادة mint: { error }",
      },
      restore_all_mints: {
        label: "استعادة جميع Mints",
        in_progress: "استعادة mint { index } من { length } …",
        success: "تمت الاستعادة بنجاح",
        error: "خطأ في استعادة mints: { error }",
      },
    },
  },
  MintSettings: {
    add: {
      title: "إضافة mint",
      description:
        "أدخل عنوان URL لـ Cashu mint للاتصال به. هذه المحفظة غير تابعة لأي mint.",
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
      title: "اكتشف mints",
      overline: "اكتشف",
      caption: "اكتشف mints التي أوصى بها المستخدمون الآخرون على nostr.",
      actions: {
        discover: {
          label: "اكتشف mints",
          in_progress: "جارٍ التحميل…",
          error_no_mints: "لم يتم العثور على mints",
          success: "تم العثور على { length } mints",
        },
      },
      recommendations: {
        overline: "تم العثور على { length } mints",
        caption:
          "تمت التوصية بهذه mints من قبل مستخدمي Nostr الآخرين. اقرأ المراجعات على { link }. كن حذرًا وقم ببحثك الخاص قبل استخدام أي mint.",
        actions: {
          browse: {
            label: "انقر لاستعراض mints",
          },
        },
      },
    },
    
    swap: {
      title: "تبديل",
      overline: "تبديل بين عدة Mints",
      caption:
        "تبديل الأموال بين mints عبر Lightning. ملاحظة: اترك مساحة لرسوم Lightning المحتملة. إذا لم تنجح الدفعة الواردة، فتحقق من الفاتورة يدويًا.",
      inputs: {
        from: {
          label: "من",
        },
        to: {
          label: "إلى",
        },
        amount: {
          label: "المبلغ ({ ticker }))",
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
    title: "إنشاء فاتورة",
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
        label_blocked: "جارٍ إنشاء الفاتورة…",
        in_progress: "إنشاء",
      },
    },
    invoice: {
      caption: "فاتورة Lightning",
      status_paid_text: "تم الدفع!",
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
    title: "إرسال",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "لا يوجد mints متوفرة",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "لا يوجد mints متوفرة",
      },
    },
  },
  SendTokenDialog: {
    title: "إرسال { value }",
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
        tooltip_text: "نسخ الرمز التعبيري",
      },
      copy_tokens: {
        label: "@:global.actions.copy.label",
      },
      copy_link: {
        tooltip_text: "نسخ الرابط",
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
        tooltip_text: "حذف من السجل",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "فلاش إلى بطاقة NFC",
          ndef_unsupported_text: "NDEF غير مدعوم",
        },
      },
    },
  },
  ReceiveDialog: {
    title: "استلام",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "لا يوجد mints متوفرة",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "تحتاج إلى الاتصال بـ mint لاستلام عبر Lightning",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "استلام Ecash",
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
    title: "استلام { value }",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "لصق رمز Cashu",
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
        label: "رمز غير صالح",
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
        label_adding_mint: "إضافة mint…",
      },
      
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "التبديل إلى mint موثوق به",
        caption: "تبديل { value }",
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
        label: "لاحقًا",
        tooltip_text: "أضف إلى السجل للاستلام لاحقًا",
        already_in_history_success_text: "Ecash موجود بالفعل في السجل",
        added_to_history_success_text: "تمت إضافة Ecash إلى السجل",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "القراءة من بطاقة NFC",
          ndef_unsupported_text: "NDEF غير مدعوم",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "مفتاح P2PK",
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
        label: "أي mint",
      },
    },
    inputs: {
      amount: {
        placeholder: "أدخل المبلغ",
      },
    },
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
    title: "رسالة Mint",
  },
  MintDetailsDialog: {
    contact: {
      title: "جهة الاتصال",
    },
    details: {
      title: "تفاصيل Mint",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Nuts",
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
        label: "العملة",
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
        label: "نسخ عنوان URL للـ mint",
      },
      delete: {
        label: "حذف mint",
      },
      edit: {
        label: "تعديل mint",
      },
    },
  },
  ChooseMint: {
    title: "حدد mint",
    badge_mint_error_text: "خطأ",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
  },
  HistoryTable: {
    empty_text: "لا يوجد سجل حتى الآن",
    row: {
      type_label: "Ecash",
      date_label: "منذ { value }",
    },
    actions: {
      check_status: {
        tooltip_text: "التحقق من الحالة",
      },
      receive: {
        tooltip_text: "استلام",
      },
      filter_pending: {
        label: "تصفية المعلقة",
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
        label: "تصفية المعلقة",
      },
      show_all: {
        label: "عرض الكل",
      },
    },
  },
  RemoveMintDialog: {
    title: "هل أنت متأكد أنك تريد حذف هذا الـ mint؟",
    nickname: {
      label: "الاسم المستعار",
    },
    balances: {
      label: "الأرصدة",
    },
    warning_text:
      "ملاحظة: نظرًا لأن هذه المحفظة حذرة، فلن يتم حذف ecash الخاص بك من هذا الـ mint فعليًا ولكنه سيظل مخزنًا على جهازك. ستراه يظهر مرة أخرى إذا قمت بإعادة إضافة هذا الـ mint لاحقًا.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "إزالة mint",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  PayInvoiceDialog: {
    input_data: {
      title: "دفع Lightning",
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
    },
    lnurlpay: {
      amount_exact_label: "{ payee } يطلب { value } { ticker }",
      amount_range_label: "{ payee } يطلب{br}بين { min } و { max } { ticker }",
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
          error: "خطأ",
        },
      },
    },
  },
  EditMintDialog: {
    title: "تعديل mint",
    inputs: {
      nickname: {
        label: "الاسم المستعار",
      },
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    tooltips: {
      mint_url: "Update the mint's base URL",
      nickname: "Friendly name for this mint",
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
    title: "هل تثق في هذا الـ mint؟",
    description:
      "قبل استخدام هذا الـ mint، تأكد من أنك تثق به. قد يصبح الـ mints ضارًا أو يتوقف عن العمل في أي وقت.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    tooltips: {
      mint_url: "URL of the mint you want to add",
    },
    actions: {
      cancel: {
        label: "@:global.actions.cancel.label",
      },
      add_mint: {
        label: "@:global.actions.add_mint.label",
        in_progress: "إضافة mint",
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
        "\u062A\u064F\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A \u0644\u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u062A\u0648\u0643\u0646\u0627\u062A",
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
    tooltips: {
      target_bucket: "Choose a bucket to receive the selected tokens",
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
    mnemonic_error_text: "الرجاء إدخال كلمة تذكيرية",
    restore_mint_error_text: "خطأ في استعادة mint: { error }",
    prepare_info_text: "تحضير عملية الاستعادة…",
    restored_proofs_for_keyset_info_text:
      "تم استعادة { restoreCounter } برهان لمجموعة المفاتيح { keysetId }",
    checking_proofs_for_keyset_info_text:
      "التحقق من البراهين من { startIndex } إلى { endIndex } لمجموعة المفاتيح { keysetId }",
    no_proofs_info_text: "لم يتم العثور على براهين للاستعادة",
    restored_amount_success_text: "تم استعادة { amount }",
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
    in_progress_warning_text: "التبديل قيد التقدم",
    invalid_swap_data_error_text: "بيانات تبديل غير صالحة",
    swap_error_text: "خطأ في التبديل",
  },
  settings: {
    nostr: {
      signing_extension: {
        not_found: "لم يتم العثور على ملحق التوقيع NIP-07",
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
      status: "تصفية حسب الحالة",
      bucket: "تصفية حسب الحاوية",
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
      title: "نظرة عامة على الموقع",
      wallet: {
        description: "إدارة رصيد ecash الخاص بك.",
        icon: "account_balance_wallet",
      },
      findCreators: {
        description: "اكتشف المبدعين لدعمهم.",
        icon: "img:icons/find-creators.svg",
      },
      
      myProfile: {
        description: "عرض وتحرير ملفك الشخصي.",
        icon: "person",
      },
      buckets: {
        description: "تنظيم الأموال في حاويات.",
        icon: "inventory_2",
      },
      subscriptions: {
        description: "إدارة اشتراكاتك.",
        icon: "auto_awesome_motion",
      },
      nostrMessengerTitle: "Nostr Messenger",
      nostrMessenger: {
        description: "الدردشة بشكل خاص عبر Nostr.",
        icon: "chat",
      },
      settings: {
        description: "تكوين التطبيق.",
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
