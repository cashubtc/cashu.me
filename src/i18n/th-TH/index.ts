export default {
  MultinutPicker: {
    dialog_title: "การชำระเงิน Multinut",
    pay_using_multiple: "ชำระโดยใช้หลาย Mint",
    experimental_title: "ฟีเจอร์ทดลอง",
    experimental_text:
      "ฟีเจอร์นี้ยังอยู่ในขั้นทดลองอย่างมากและอาจทำงานไม่เป็นไปตามที่คาด อย่าพยายามชำระใบแจ้งหนี้ที่เคยชำระไปแล้ว คุณอาจสูญเสียเงินได้",
    understand: "ฉันเข้าใจแล้ว",
    select_funds: "เลือกเงินจากหลาย Mint เพื่อทำการชำระเงิน",
    pay_invoice: "ชำระใบแจ้งหนี้",
    amount_mismatch: "คำนวณจำนวนผิดพลาด: {calculated} เทียบกับ {expected}",
    states: {
      requesting: "กำลังขอ...",
      paying: "กำลังชำระ...",
      success: "สำเร็จ",
      failed: "ล้มเหลว",
    },
    paid: "จ่าย {amount} ผ่าน Lightning",
  },

  global: {
    notifications: "การแจ้งเตือน",
    actions: {
      add_mint: {
        label: "เพิ่ม Mint",
      },
      cancel: {
        label: "ยกเลิก",
      },
      copy: {
        label: "คัดลอก",
      },
      close: {
        label: "ปิด",
      },
      enter: {
        label: "ป้อน",
      },
      lock: {
        label: "ล็อก",
      },
      paste: {
        label: "วาง",
      },
      receive: {
        label: "รับ",
      },
      show_seed: {
        label: "แสดงวลีสำหรับกู้คืน",
      },
      hide_seed: {
        label: "ซ่อนวลีสำหรับกู้คืน",
      },
      scan: {
        label: "สแกน",
      },
      more_options: {
        label: "ตัวเลือกเพิ่มเติม",
      },
      clear: {
        label: "ล้าง",
      },
      send: {
        label: "ส่ง",
      },
      swap: {
        label: "แลกเปลี่ยน",
      },
      update: {
        label: "อัปเดต",
      },
      pay: { label: "จ่าย" },
    },
    inputs: {
      mint_url: {
        label: "Mint URL",
      },
    },
  },
  wallet: {
    notifications: {
      balance_too_low: "ยอดคงเหลือน้อยเกินไป",
      received: "ได้รับ {amount}",
      fee: " (ค่าธรรมเนียม: {fee})",
      could_not_request_mint: "ไม่สามารถขอ mint ได้",
      invoice_still_pending: "ใบแจ้งหนี้ยังอยู่ระหว่างดำเนินการ",
      paid_lightning: "จ่าย {amount} ผ่าน Lightning",
      sent: "ส่ง {amount}",
      token_still_pending: "โทเค็นยังอยู่ระหว่างดำเนินการ",
      received_lightning: "ได้รับ {amount} ผ่าน Lightning",
      lightning_payment_failed: "การชำระเงิน Lightning ล้มเหลว",
      failed_to_decode_invoice: "ไม่สามารถถอดรหัสใบแจ้งหนี้",
      invalid_lnurl: "LNURL ไม่ถูกต้อง",
      lnurl_error: "ข้อผิดพลาด LNURL",
      no_amount: "ไม่มียอดเงิน",
      no_lnurl_data: "ไม่มีข้อมูล LNURL",
      no_price_data: "ไม่มีข้อมูลราคา",
      trying_again: "กำลังลองอีกครั้ง...",
      unsupported_legacy_qr: "ไม่รองรับรหัส QR แบบเก่า",
      legacy_qr_not_supported: "รหัส QR แบบเก่านี้ไม่ได้มาจากร้านค้าที่รองรับ",
      no_bolt12_mint: "ไม่มี Mint ของคุณที่รองรับข้อเสนอ BOLT12",
      no_bolt11_mint: "ไม่มี Mint ของคุณที่รองรับใบแจ้งหนี้ BOLT11",
      address_not_paid: "ที่อยู่นี้ยังไม่ได้รับการชำระเงิน",
      payment_pending: "การชำระเงินอยู่ระหว่างดำเนินการ",
      invoice_already_paid: "ใบแจ้งหนี้ชำระแล้ว",
      payment_sent: "ส่งการชำระเงินแล้ว",
      payment_failed: "การชำระเงินล้มเหลว",
      could_not_pay_request: "ไม่สามารถชำระคำขอได้",
      request_unit_unsupported: "Mint ไม่รองรับหน่วยในคำขอชำระเงินนี้: {unit}",
      no_onchain_mint: "ไม่มี Mint ของคุณที่รองรับการชำระเงินแบบออนเชน",
    },
    mint: {
      notifications: {
        already_added: "เพิ่ม Mint แล้ว",
        added: "เพิ่ม Mint แล้ว",
        not_found: "ไม่พบ Mint",
        activation_failed: "การเปิดใช้งาน Mint ล้มเหลว",
        no_active_mint: "ไม่มี Mint ที่ใช้งานอยู่",
        unit_activation_failed: "การเปิดใช้งานหน่วยล้มเหลว",
        unit_not_supported: "หน่วยไม่รองรับโดย Mint",
        activated: "เปิดใช้งาน Mint แล้ว",
        could_not_connect: "ไม่สามารถเชื่อมต่อกับ Mint ได้",
        mint_validation_error: "ข้อผิดพลาดในการตรวจสอบ mint",
        removed: "ลบ Mint แล้ว",
        error: "ข้อผิดพลาด Mint",
      },
    },
  },
  MainHeader: {
    menu: {
      terms: {
        terms: {
          title: "เงื่อนไข",
          caption: "สิ่งที่คุณยอมรับเมื่อใช้ Cashu.me",
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
          title: "บริจาค",
          caption: "สนับสนุน Cashu",
        },
      },
    },
    offline: {
      warning: {
        text: "ออฟไลน์",
      },
    },
    reload: {
      warning: {
        text: "โหลดใหม่ใน { countdown }",
      },
    },
    staging: {
      warning: {
        text: "กำลังทดสอบ – ห้ามใช้กับเงินจริง!",
      },
    },
  },
  Settings: {
    menu: {
      title: "การตั้งค่า",
      backup: {
        title: "สำรองและกู้คืน",
        caption: "Seed phrase และการกู้คืน ecash",
      },
      lightning_address: {
        title: "Lightning Address",
        caption: "รับเงินที่ name{'@'}domain",
      },
      nostr: {
        title: "Nostr",
        caption: "กุญแจ, รีเลย์ และเครือข่ายที่เชื่อถือได้",
      },
      payment_requests: {
        title: "คำขอชำระเงิน",
        caption: "รับการชำระเงินด้วย ecash ผ่าน Nostr",
      },
      nwc: {
        title: "Nostr Wallet Connect",
        caption: "ใช้ Wallet ของคุณจากแอปอื่น",
      },
      hardware: {
        title: "ฮาร์ดแวร์",
        caption: "การตั้งค่า NFC",
      },
      p2pk: {
        title: "ecash ที่ล็อกไว้",
        caption: "รับ ecash ที่มีเพียงกุญแจของคุณเท่านั้นที่ปลดล็อกได้",
      },
      privacy: {
        title: "ความเป็นส่วนตัว",
        caption: "การตรวจสอบเครือข่ายและราคา Bitcoin",
      },
      experimental: {
        title: "ทดลอง",
        caption: "ลองใช้ฟีเจอร์ใหม่ก่อนใคร",
      },
      appearance: {
        title: "รูปลักษณ์",
        caption: "ธีม แป้นพิมพ์ และสัญลักษณ์บิตคอยน์",
      },
      language: {
        title: "ภาษา",
        caption: "เลือกภาษาของคุณ",
      },
      advanced: {
        title: "ขั้นสูง",
        caption: "เครื่องมือนักพัฒนาและการรีเซ็ต Wallet",
      },
      about: {
        title: "เกี่ยวกับ",
        caption: "ข้อกำหนดและลิงก์",
      },
    },
    web_of_trust: {
      title: "เครือข่ายที่เชื่อถือได้",
      known_pubkeys: "กุญแจสาธารณะที่รู้จัก: {wotCount}",
      continue_crawl: "ดำเนินการสำรวจต่อ",
      crawl_odell: "นำเข้าเครือข่ายความไว้วางใจของ Odell",
      crawl_wot: "สำรวจ web of trust",
      pause: "หยุดชั่วคราว",
      reset: "รีเซ็ต",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    multinut: {
      use_multinut: "การชำระเงินจากหลาย Mint",
    },
    language: {
      title: "ภาษา",
    },
    sections: {
      nostr: {
        relays: {
          already_added: "เพิ่มรีเลย์นี้แล้ว",
          add: {
            title: "เพิ่มรีเลย์",
            description:
              "Wallet ของคุณใช้รีเลย์เหล่านี้สำหรับฟีเจอร์ของ Nostr เช่น คำขอชำระเงิน Nostr Wallet Connect และการสำรองข้อมูล",
          },
          list: {
            title: "รีเลย์",
            copy_tooltip: "คัดลอกรีเลย์",
            remove_tooltip: "ลบรีเลย์",
          },
        },
      },
    },
    backup_restore: {
      backup_seed: {
        title: "สำรองวลีกู้คืน",
        description:
          "วลีกู้คืนของคุณสามารถกู้คืน Wallet ของคุณได้ เก็บไว้ให้ปลอดภัยและเป็นส่วนตัว",
        seed_phrase_label: "วลีกู้คืน",
      },
      restore_ecash: {
        title: "กู้คืน ecash",
        description:
          "กู้คืน ecash จากวลีสำหรับกู้คืนชุดอื่น วลีสำหรับกู้คืนปัจจุบันของคุณจะไม่เปลี่ยนแปลง",
      },
    },
    lightning_address: {
      server_url: {
        label: "ชื่อโฮสต์ npub.cash",
        hint: "ป้อนชื่อโฮสต์หรือ URL แบบ HTTPS",
        invalid: "ป้อน URL เซิร์ฟเวอร์ HTTPS ที่ถูกต้อง",
      },
      title: "ที่อยู่ Lightning",
      enable: {
        toggle: "ใช้ Lightning Address",
        description: "รับเงินที่ที่อยู่จาก npub.cash",
      },
      address: {
        label: "ที่อยู่ของคุณ",
        copy_tooltip: "คัดลอกที่อยู่ Lightning",
      },
      show_on_receive: {
        toggle: "แสดงเมื่อรับเงิน",
        description: "แสดงที่อยู่และรหัส QR",
      },
      automatic_claim: {
        toggle: "รับอัตโนมัติ",
        description: "รับการชำระเงินขาเข้าโดยอัตโนมัติ",
      },
      mint: {
        label: "npub.cash mint",
        choose_title: "เลือก mint สำหรับ npub.cash",
        choose_placeholder: "เลือก mint...",
      },
    },
    nostr_keys: {
      title: "กุญแจ Nostr ของคุณ",
      description: "กุญแจ Nostr ของคุณเป็นตัวกำหนด Lightning Address ของคุณ",
      wallet_seed: {
        title: "วลีสำหรับกู้คืน Wallet",
        description: "สร้างคู่กุญแจ Nostr จากวลีสำหรับกู้คืนของ Wallet",
        copy_nsec: "คัดลอกกุญแจส่วนตัว",
      },
      nsec_bunker: {
        title: "ตัวลงนามระยะไกล",
        description: "ลงนามด้วย NIP-46 bunker",
        delete_tooltip: "ลบการเชื่อมต่อ",
      },
      use_nsec: {
        title: "ใช้กุญแจส่วนตัวของคุณเอง",
        description: "วิธีนี้อันตรายและไม่แนะนำ",
        delete_tooltip: "ลบกุญแจส่วนตัว",
      },
      signing_extension: {
        title: "ส่วนขยายการลงนาม",
        description: "ใช้ส่วนขยายการลงนาม NIP-07",
        not_found: "ไม่พบส่วนขยายการลงนาม NIP-07",
      },
    },
    payment_requests: {
      description:
        "รับเงินผ่าน Nostr เมื่อเปิดไว้ Wallet จะคอยรับข้อมูลจากรีเลย์ Nostr ของคุณ",
      enable_toggle: "เปิดใช้คำขอชำระเงิน",
      claim_automatically: {
        toggle: "รับอัตโนมัติ",
        description:
          "เพิ่มการชำระเงินที่เข้ามาลงในยอดเงินโดยไม่ต้องถาม เมื่อปิดไว้ คุณต้องกดรับทีละรายการ",
      },
    },
    nostr_wallet_connect: {
      description: "ให้แอปอื่นจ่ายเงินจาก Wallet นี้ผ่าน Nostr Wallet Connect",
      enable_toggle: "เปิดใช้ Nostr Wallet Connect",
      payments_note:
        "คุณสามารถใช้ NWC สำหรับการชำระเงินจากยอดคงเหลือ Bitcoin ของคุณเท่านั้น การชำระเงินจะทำจาก Mint ที่เปิดใช้งานของคุณ",
      connection: {
        copy_tooltip: "คัดลอกสตริงการเชื่อมต่อ",
        qr_tooltip: "แสดงรหัส QR",
        allowance_label: "ยอดคงเหลือที่เหลือ (sat)",
      },
    },
    hardware_features: {
      webnfc: {
        title: "รูปแบบการ์ด NFC",
        description: "เลือกการเข้ารหัสสำหรับการเขียนลงในการ์ด NFC",
        text: {
          title: "ข้อความ",
          description: "เก็บ token ในรูปแบบข้อความธรรมดา",
        },
        weburl: {
          title: "URL",
          description: "เก็บ URL ไปยัง Wallet นี้พร้อม token",
        },
        binary: {
          title: "ไบนารี",
          description: "เก็บโทเค็นเป็นข้อมูลไบนารี",
        },
        quick_access: {
          toggle: "เข้าถึง NFC ด่วน",
          description: "เพิ่มปุ่ม NFC ในหน้ารับ ecash สำหรับสแกนการ์ด",
        },
      },
    },
    p2pk_features: {
      description:
        "ฟีเจอร์ทดลอง ใช้กับจำนวนเงินน้อยๆ เท่านั้น หากคุณทำกุญแจส่วนตัวหาย จะไม่มีใครปลดล็อก ecash ที่ล็อกไว้กับกุญแจนั้นได้",
      generate_button: "สร้างคีย์",
      import_button: "นำเข้ากุญแจส่วนตัว",
      quick_access: {
        toggle: "แสดงกุญแจล็อกในหน้ารับ",
        description:
          "แสดงกุญแจล็อกของคุณในหน้ารับ ecash เพื่อให้ผู้ส่งล็อก ecash ให้คุณได้",
      },
      keys_expansion: {
        label: "คลิกเพื่อเรียกดู {count} คีย์",
        used_badge: "ใช้แล้ว",
      },
    },
    privacy: {
      network_title: "การตรวจสอบเครือข่าย",
      description: "การตั้งค่าเหล่านี้ส่งผลต่อความเป็นส่วนตัวของคุณ",
      check_incoming: {
        toggle: "ตรวจสอบใบแจ้งหนี้ขาเข้า",
        description:
          "ตรวจสอบใบแจ้งหนี้ล่าสุดของคุณในเบื้องหลัง อัปเดตเร็วขึ้น แต่ถูกระบุตัวตนได้ง่ายขึ้น",
      },
      check_startup: {
        toggle: "ตรวจสอบใบแจ้งหนี้ที่รอดำเนินการเมื่อเริ่มต้น",
        description: "ตรวจสอบใบแจ้งหนี้ที่รอดำเนินการเมื่อเปิด Wallet",
      },
      check_all: {
        toggle: "ตรวจสอบใบแจ้งหนี้ทั้งหมด",
        description:
          "ตรวจสอบใบแจ้งหนี้ที่ยังไม่ชำระในเบื้องหลังนานสูงสุดสองสัปดาห์ กิจกรรมออนไลน์ที่มากขึ้นทำให้ถูกระบุตัวตนได้ง่ายขึ้น",
      },
      check_sent: {
        toggle: "ตรวจสอบ ecash ที่ส่ง",
        description:
          "ตรวจสอบในเบื้องหลังว่า ecash ที่ส่งไปถูกรับแล้วหรือยัง กิจกรรมออนไลน์ที่มากขึ้นทำให้ถูกระบุตัวตนได้ง่ายขึ้น",
      },
      websockets: {
        toggle: "ใช้ WebSockets",
        description:
          "เชื่อมต่อกับ Mint ตลอดเวลาเพื่อรับสถานะการชำระเงินทันที เร็วขึ้น แต่ถูกระบุตัวตนได้ง่ายขึ้น",
      },
      bitcoin_price: {
        title: "ราคา Bitcoin",
        toggle: "รับอัตราแลกเปลี่ยนจาก Coinbase",
        description:
          "ดึงราคา Bitcoin จาก coinbase.com เพื่อแสดงยอดเงินของคุณเป็นสกุลเงินเฟียต",
        currency: {
          title: "สกุลเงินเฟียต",
          description: "เลือกสกุลเงินเฟียตสำหรับการแสดงราคา Bitcoin",
        },
      },
    },
    experimental: {
      receive_swaps: {
        toggle: "รับ swaps",
        badge: "เบต้า",
        description:
          "เสนอให้แลกเปลี่ยน ecash ที่ได้รับไปยัง Mint ที่ใช้งานอยู่",
      },
      auto_paste: {
        toggle: "วาง ecash อัตโนมัติ",
        description:
          "วาง ecash จากคลิปบอร์ดเมื่อเปิดหน้ารับ ecash ปิดไว้หากทำให้หน้าจอแสดงผลผิดปกติบน iOS",
      },
      auditor: {
        toggle: "เปิดใช้งานผู้ตรวจสอบ",
        badge: "เบต้า",
        description:
          "แสดงข้อมูลความน่าเชื่อถือจากผู้ตรวจสอบ Mint ภายนอกในรายละเอียดของ Mint",
        url_label: "URL ผู้ตรวจสอบ",
        api_url_label: "URL API ผู้ตรวจสอบ",
      },
      multinut: {
        description: "จ่ายใบแจ้งหนี้จากหลาย Mint พร้อมกัน",
      },
      nostr_mint_backup: {
        toggle: "สำรองรายการ Mint ไปยัง Nostr",
        description:
          "สำรองรายการ Mint ของคุณไปยังรีเลย์ Nostr เพื่อกู้คืนบนอุปกรณ์อื่นได้",
        notifications: {
          enabled: "เปิดใช้งานการสำรองข้อมูล Nostr mint แล้ว",
          disabled: "ปิดใช้งานการสำรองข้อมูล Nostr mint แล้ว",
          failed: "ไม่สามารถเปิดใช้งานการสำรองข้อมูล Nostr mint ได้",
        },
      },
    },
    appearance: {
      mode: {
        title: "โหมด",
        dark: "มืด",
        light: "สว่าง",
      },
      keyboard: {
        title: "แป้นพิมพ์บนหน้าจอ",
        toggle: "ใช้แป้นพิมพ์ตัวเลข",
        toggle_description: "ใช้แป้นตัวเลขสำหรับป้อนจำนวนเงิน",
      },
      theme: {
        title: "ธีม",
        description: "เปลี่ยนรูปลักษณ์ของ Wallet ของคุณ",
        tooltips: {
          mono: "โมโน",
          cyber: "ไซเบอร์",
          freedom: "อิสรภาพ",
          nostr: "Nostr",
          bitcoin: "Bitcoin",
          mint: "มินต์",
          nut: "ถั่ว",
          blu: "น้ำเงิน",
          flamingo: "ฟลามิงโก",
        },
      },
      bip177: {
        title: "สัญลักษณ์ Bitcoin",
        description: "แสดงจำนวนเงินเป็น ₿2,789 แทน 2,789 sats",
        toggle: "ใช้สัญลักษณ์ ₿",
      },
    },
    advanced: {
      backup_files_title: "ไฟล์สำรองข้อมูล",
      danger_zone_title: "โซนอันตราย",
      notifications: {
        reserved_unset: "ยกเลิกการจองหลักฐานทั้งหมดแล้ว",
        removed_spent: "ลบหลักฐานที่ใช้แล้ว {count} รายการ",
        no_spent: "ไม่พบหลักฐานที่ใช้แล้ว",
        invalid_backup: "รูปแบบไฟล์สำรองข้อมูลไม่ถูกต้อง",
        read_error: "อ่านไฟล์ผิดพลาด",
      },
      developer: {
        title: "การตั้งค่าสำหรับนักพัฒนา",
        description: "เครื่องมือสำหรับแก้ไขปัญหาและดีบัก",
        new_seed: {
          button: "สร้างวลีสำหรับกู้คืนใหม่",
          description:
            "สร้างวลีสำหรับกู้คืนชุดใหม่ จากนั้นส่งยอดเงินของคุณให้ตัวเอง เพื่อให้ seed ใหม่กู้คืนได้",
          confirm_question:
            "คุณแน่ใจหรือไม่ว่าต้องการสร้างวลีสำหรับกู้คืนใหม่?",
          cancel: "ยกเลิก",
          confirm: "ยืนยัน",
        },
        remove_spent: {
          button: "ลบหลักฐานที่ใช้แล้ว",
          description:
            "ลบ ecash ที่ Mint ที่ใช้งานอยู่แจ้งว่าใช้ไปแล้ว ใช้เฉพาะเมื่อ Wallet ค้างเท่านั้น",
        },
        design_system: {
          title: "ระบบการออกแบบ",
          description: "ทุกคอมโพเนนต์ของแอป แบบสด พร้อมซอร์สและการใช้งาน",
        },
        debug_console: {
          button: "คอนโซลดีบัก",
          description:
            "เปิดคอนโซล JavaScript อย่าวางโค้ดที่คุณไม่เข้าใจเด็ดขาด มิจฉาชีพใช้วิธีนี้ขโมยเงิน",
        },
        export_proofs: {
          button: "ส่งออกหลักฐานที่ใช้งานอยู่",
          description:
            "คัดลอกยอดเงินของ Mint ที่ใช้งานอยู่ในหน่วยที่เลือกเป็นโทเค็น ecash เดียว",
        },
        keyset_counters: {
          title: "เพิ่มเคาน์เตอร์ keyset",
          increase: "เพิ่มตัวนับสำหรับ {id}",
          fixes: "แก้ปัญหา “outputs have already been signed”",
          keysets: "{n} คีย์เซ็ต | {n} คีย์เซ็ต",
          sheet_hint: "แตะ + เพื่อเพิ่มตัวนับของคีย์เซ็ต",
          column: "ตัวนับ",
        },
        unset_reserved: {
          button: "ยกเลิกการสำรองโทเค็นทั้งหมด",
          description:
            'Wallet นี้จะทำเครื่องหมาย ecash ขาออกที่รอดำเนินการว่าถูกสำรอง (และหักออกจากยอดคงเหลือของคุณ) เพื่อป้องกันความพยายามในการใช้จ่ายซ้ำ ปุ่มนี้จะยกเลิกการสำรองโทเค็นทั้งหมดเพื่อให้สามารถใช้ได้อีกครั้ง หากคุณทำเช่นนี้ Wallet ของคุณอาจมีหลักฐานที่ใช้แล้ว กดปุ่ม "ลบหลักฐานที่ใช้แล้ว" เพื่อกำจัดออกไป',
        },
        show_onboarding: {
          button: "แสดงหน้าแนะนำ",
          description: "แสดงหน้าจอแนะนำอีกครั้ง",
        },
        reset_wallet: {
          button: "รีเซ็ตข้อมูล Wallet",
          description:
            "รีเซ็ตข้อมูล Wallet ของคุณ คำเตือน: สิ่งนี้จะลบทุกอย่าง! ตรวจสอบให้แน่ใจว่าคุณสร้างการสำรองข้อมูลก่อน",
          confirm_question: "คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล Wallet ของคุณ?",
          cancel: "ยกเลิก",
          confirm: "ลบ Wallet",
        },
        export_wallet: {
          button: "ส่งออกข้อมูล Wallet",
          description:
            "ดาวน์โหลดไฟล์สำรองที่นำเข้าได้ในหน้าต้อนรับ ไฟล์จะล้าสมัยเมื่อคุณใช้ Wallet ต่อไป",
        },
        import_wallet: {
          description: "แทนที่ข้อมูลของ Wallet นี้ด้วยไฟล์สำรองที่ส่งออกไว้",
          button: "นำเข้าข้อมูลสำรอง Wallet",
          confirm_question: "ต้องการกู้คืนข้อมูล Wallet ของคุณใช่ไหม",
          cancel: "ยกเลิก",
          confirm: "นำเข้าข้อมูลสำรอง",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "เพิ่ม Mint",
    subtitle:
      "Mint เป็นผู้ออก ecash ที่ Wallet นี้เก็บไว้ เพิ่ม Mint หรือรับ ecash จาก Mint เพื่อเริ่มต้น",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "รับ ecash",
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
      expand: "แสดงประวัติและ Mints",
      collapse: "ซ่อนประวัติและ Mints",
    },
    tabs: {
      history: {
        label: "ประวัติ",
      },
      mints: {
        label: "Mints",
      },
    },
    install: {
      text: "ติดตั้ง",
      tooltip: "ติดตั้ง Cashu",
    },
  },
  AlreadyRunning: {
    title: "Cashu.me เปิดอยู่ในแท็บอื่น",
    text: "ปิดแท็บอื่น แล้วแตะลองใหม่",
    actions: {
      retry: {
        label: "ลองใหม่",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "ไม่มีหน้านี้",
    actions: {
      home: {
        label: "กลับหน้าหลัก",
      },
    },
  },
  BalanceView: {
    total_label: "ยอดคงเหลือรวม",
    show_balance: "แสดงยอดคงเหลือ {unit}",
    mintError: {
      label: "ข้อผิดพลาด Mint",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "ก่อนหน้า",
      },
      next: {
        label: "ถัดไป",
      },
    },
  },
  WelcomeSlide1: {
    terms_agreement: "เมื่อดำเนินการต่อ ถือว่าคุณยอมรับ{terms}",
    title: "ยินดีต้อนรับสู่ Cashu.me",
    text: "Cashu.me คือ Wallet Bitcoin ที่ฟรีและเป็นโอเพนซอร์ส ซึ่งใช้ ecash เพื่อรักษาความปลอดภัยและความเป็นส่วนตัวของเงินของคุณ",
  },
  WelcomeSlide2: {
    title: "ติดตั้ง Cashu.me",
    alt: { pwa_example: "ตัวอย่างการติดตั้ง PWA" },
    installing: "กำลังติดตั้ง…",
    instruction: {
      intro: {
        text: "เพื่อประสบการณ์ที่ดีที่สุด ใช้ Wallet นี้กับเว็บเบราว์เซอร์พื้นฐานของอุปกรณ์ของคุณเพื่อติดตั้งเป็น Progressive Web App ทำสิ่งนี้ทันที",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          text: "แตะเมนู (มุมขวาบน)",
        },
        step2: {
          text: "กด { buttonText }",
          buttonText: "@:PwaPrompt.android.add",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          text: "แตะ แชร์ (ด้านล่าง)",
        },
        step2: {
          text: "กด { buttonText }",
          buttonText: "@:PwaPrompt.ios.add",
        },
      },
      outro: {
        text: "หลังติดตั้งแล้ว ให้ปิดแท็บเบราว์เซอร์นี้และเปิด Cashu.me จากหน้าจอหลัก",
      },
    },
    pwa: {
      success: {
        title: "สำเร็จ!",
        text: "คุณกำลังใช้ Cashu เป็น PWA ปิดหน้าต่างเบราว์เซอร์อื่นที่เปิดอยู่และใช้แอปจากหน้าจอหลักของคุณ",
        nextSteps: "ตอนนี้คุณสามารถปิดแท็บนี้และเปิดแอปจากหน้าจอหลักได้",
      },
    },
  },
  PwaPrompt: {
    title: "ติดตั้ง Cashu",
    text: "เปิดจากหน้าจอหลักได้เลย โดยไม่มีแถบเบราว์เซอร์",
    ios: {
      share: "แตะ แชร์",
      add: "เพิ่มไปยังหน้าจอหลัก",
    },
    android: {
      menu: "เปิดเมนูของเบราว์เซอร์",
      add: "เพิ่มไปยังหน้าจอหลัก",
    },
    install: "ติดตั้ง",
    notNow: "ไว้ทีหลัง",
  },
  WelcomeSlide3: {
    title: "วลีสำหรับกู้คืนของคุณ",
    text: "จัดเก็บวลีสำหรับกู้คืนของคุณไว้ในตัวจัดการรหัสผ่านหรือบนกระดาษ วลีสำหรับกู้คืนของคุณเป็นวิธีเดียวที่จะกู้คืนเงินทุนของคุณได้หากคุณสูญเสียการเข้าถึงอุปกรณ์นี้",
    inputs: {
      seed_phrase: {
        label: "วลีสำหรับกู้คืน",
        caption: "คุณสามารถดูวลีสำหรับกู้คืนของคุณได้ในการตั้งค่า",
      },
      checkbox: {
        label: "ฉันได้จดไว้แล้ว",
      },
    },
  },
  WelcomeSlide4: {
    english_only: "ข้อความทางกฎหมายมีให้เป็นภาษาอังกฤษเท่านั้น",
    title: "ข้อกำหนดการให้บริการ",
    actions: {
      more: {
        label: "โปรดอ่านก่อนใช้ Cashu.me",
      },
    },
    inputs: {
      checkbox: {
        label: "ฉันได้อ่านและยอมรับข้อกำหนดและเงื่อนไขเหล่านี้",
      },
    },
  },
  WelcomeSlideChoice: {
    title: "ตั้งค่ากระเป๋าเงินของคุณ",
    text: "คุณต้องการกู้คืนจากวลีสำหรับกู้คืนหรือสร้างกระเป๋าเงินใหม่?",
    options: {
      new: {
        title: "สร้างกระเป๋าเงินใหม่",
        subtitle: "สร้างวลีสำหรับกู้คืนใหม่และเพิ่ม Mint",
      },
      recover: {
        title: "กู้คืนกระเป๋าเงิน",
        subtitle: "ป้อนวลีสำหรับกู้คืนของคุณ กู้คืน Mint และ ecash",
      },
    },
  },
  WelcomeMintSetup: {
    title: "เพิ่ม Mint",
    text: "Mint คือเซิร์ฟเวอร์ที่ช่วยให้คุณส่งและรับ ecash เลือก Mint ที่ค้นพบหรือเพิ่มด้วยตนเอง คุณสามารถข้ามและเพิ่มในภายหลังได้",
    sections: { your_mints: "Mint ของคุณ" },
    restoring: "กำลังกู้คืน Mint…",
    placeholder: { mint_url: "https://" },
  },
  WelcomeRecoverSeed: {
    title: "ป้อนวลีสำหรับกู้คืนของคุณ",
    text: "วางหรือพิมพ์วลี 12 คำเพื่อกู้คืน",
    inputs: { word: "คำ { index }" },
    actions: { paste_all: "วางทั้งหมด" },
    progress: { words_entered: "ป้อนแล้ว {count}/12 คำ" },
    disclaimer:
      "วลีสำหรับกู้คืนใช้เฉพาะในเครื่องเพื่อสร้างคีย์กระเป๋าเงินของคุณ",
  },
  WelcomeRestoreEcash: {
    title: "กู้คืน ecash ของคุณ",
    text: "สแกนหา proof ที่ยังไม่ถูกใช้บน Mint ที่กำหนดค่าไว้และเพิ่มลงในกระเป๋าเงินของคุณ",
  },
  MintRatings: {
    sort_and_filter: "เรียงและกรอง",
    reviews_title: "รีวิว",
    reviews_count: "{n} รีวิว | {n} รีวิว",
    web_of_trust_caption: "นับเฉพาะรีวิวจากคนในเครือข่ายความไว้วางใจของคุณ",
    web_of_trust_hop: "อยู่ในเครือข่ายที่เชื่อถือได้ของคุณ (ลำดับ {hop})",
    no_mint_url: "ไม่ได้ระบุ URL ของ Mint",
    reviews: "รีวิว",
    no_reviews: "ยังไม่มีรีวิว",
    your_review: "รีวิวของคุณ",
    no_rating: "ไม่มีคะแนน",
    stars_label: "{rating} จาก 5 ดาว",
    out_of: "จาก {max}",
    sort: "เรียงลำดับ",
    sort_options: {
      newest: "ใหม่ที่สุด",
      oldest: "เก่าที่สุด",
      highest: "สูงที่สุด",
      lowest: "ต่ำที่สุด",
    },
    actions: { write_review: "เขียนรีวิว" },
    empty_state_subtitle:
      "มาเป็นคนแรกที่รีวิว Mint นี้ ประสบการณ์ของคุณช่วยให้คนอื่นเลือกได้",
    range: "{from}–{to} จาก {total}",
  },
  CreateMintReview: {
    connect_nostr: "โปรดเชื่อมต่อบัญชี Nostr ในการตั้งค่าเพื่อเผยแพร่รีวิว",
    published: "เผยแพร่รีวิวแล้ว",
    publish_failed: "เผยแพร่รีวิวไม่สำเร็จ",
    title: "รีวิว Mint",
    publishing_as: "เผยแพร่เป็น",
    inputs: {
      rating: { label: "คะแนน", hint: "เลือกคะแนนเพื่อเผยแพร่รีวิวของคุณ" },
      review: { label: "รีวิว (ไม่บังคับ)" },
    },
    actions: {
      publish: { label: "เผยแพร่รีวิว", in_progress: "กำลังเผยแพร่…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "กู้คืนจากวลีสำหรับกู้คืน",
      caption: "เพิ่มทุก Mint ที่คุณเคยใช้กับวลีสำหรับกู้คืนนี้ก่อนกู้คืน",
      inputs: {
        seed_phrase: {
          label: "วลีสำหรับกู้คืน",
        },
      },
    },
    information: {
      caption:
        "วิซาร์ดจะกู้คืน ecash จากวลีสำหรับกู้คืนอื่นเท่านั้น คุณจะไม่สามารถใช้วลีสำหรับกู้คืนนี้หรือเปลี่ยนวลีสำหรับกู้คืนของ Wallet ที่คุณกำลังใช้อยู่ได้ ซึ่งหมายความว่า ecash ที่กู้คืนจะไม่ได้รับการป้องกันโดยวลีสำหรับกู้คืนปัจจุบันของคุณ ตราบใดที่คุณยังไม่ได้ส่ง ecash ให้ตัวเองหนึ่งครั้ง",
    },
    restore_mints: {
      label: "กู้คืน Mint",
      caption: "เลือก Mint ที่จะกู้คืน เพิ่ม Mint ที่ขาดไปจากแท็บ Mints ก่อน",
    },
    actions: {
      paste: {
        error: "อ่านเนื้อหาในคลิปบอร์ดไม่สำเร็จ",
      },
      validate: {
        error: "Mnemonic ควรมีอย่างน้อย 12 คำ",
      },
      select_all: {
        label: "เลือกทั้งหมด",
      },
      deselect_all: {
        label: "ยกเลิกการเลือกทั้งหมด",
      },
      restore: {
        label: "กู้คืน",
        error: "ข้อผิดพลาดในการกู้คืน Mint: { error }",
      },
      restore_selected_mints: {
        label: "กู้คืน Mint ที่เลือก ({count})",
        success: "กู้คืน {count} Mint(s) สำเร็จ",
        error: "ข้อผิดพลาดในการกู้คืน Mint ที่เลือก: {error}",
      },
    },
    nostr_mints: {
      label: "กู้คืน Mint จาก Nostr",
      caption:
        "ค้นหาการสำรองข้อมูล Mint ที่เก็บไว้ใน Nostr relays โดยใช้วลีสำหรับกู้คืนของคุณ สิ่งนี้จะช่วยให้คุณค้นพบ Mint ที่คุณเคยใช้มาก่อน",
      search_button: "ค้นหาข้อมูลสำรองของ Mint",
      select_all: "เลือกทั้งหมด",
      deselect_all: "ยกเลิกการเลือกทั้งหมด",
      backed_up: "สำรองแล้ว",
      add_selected: "เพิ่มที่เลือก ({count})",
      no_backups_found: "ไม่พบการสำรองข้อมูล Mint",
      no_backups_hint:
        "ตรวจสอบให้แน่ใจว่าได้เปิดใช้งานการสำรองข้อมูล Nostr mint ในการตั้งค่าเพื่อสำรองข้อมูลรายการ Mint ของคุณโดยอัตโนมัติ",
      invalid_mnemonic: "โปรดป้อนวลีสำหรับกู้คืนที่ถูกต้องก่อนค้นหา",
      search_error: "ไม่สามารถค้นหาการสำรองข้อมูล Mint ได้",
      add_error: "ไม่สามารถเพิ่ม Mint ที่เลือกได้",
    },
  },
  MintSettings: {
    see_reviews: "ดูรีวิว",
    add: {
      title: "เพิ่ม Mint",
      description:
        "ป้อน URL ของ Cashu mint เพื่อเชื่อมต่อ Wallet นี้ไม่มีส่วนเกี่ยวข้องกับ Mint ใดๆ",
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "URL ไม่ถูกต้อง",
        },
        scan: {
          label: "สแกนรหัส QR",
        },
      },
    },
    discover: {
      title: "สำรวจ Mints",
      caption: "Mint ที่คนอื่นแนะนำบน Nostr",
      actions: {
        discover: {
          label: "สำรวจ Mints",
          in_progress: "กำลังโหลด…",
        },
      },
      add: "เพิ่ม",
      empty: {
        title: "ค้นหา Mint",
        text: "Cashu.me จะสอบถามรีเลย์ Nostr เพื่อหา Mint ที่ผู้อื่นแนะนำ พร้อมคะแนนและรีวิว",
      },
      recommendations: {
        overline: "พบ { length } Mints",
        caption: "ศึกษาข้อมูลด้วยตัวเองก่อนใช้ Mint",
      },
    },
    swap: {
      title: "แลกเปลี่ยน",
      caption: "ย้ายเงินระหว่าง Mint ของคุณผ่าน Lightning อาจมีค่าธรรมเนียม",
      inputs: {
        from: {
          label: "จาก",
        },
        to: {
          label: "ถึง",
        },
        amount: {
          label: "จำนวน ({ ticker }) )",
        },
      },
      actions: {
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
      },
    },
    error_badge: "ข้อผิดพลาด",
    switching_mint: "กำลังสลับไปที่ {mint}",
    reviews_text: "รีวิว",
    no_reviews_yet: "ยังไม่มีรีวิว",
    discover_mints_button: "สำรวจ Mints",
  },
  QrcodeReader: {
    progress: {
      text: "{ percentage }{ addon }",
      percentage: "{ percentage }%",
      keep_scanning_text: " - สแกนต่อไป",
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
    title: "รับ Lightning",
    actions: {
      create: {
        label: "สร้างใบแจ้งหนี้",
        label_blocked: "กำลังสร้างใบแจ้งหนี้",
      },
    },
    invoice: {
      caption: "ใบแจ้งหนี้ Lightning",
      status_paid_text: "ชำระแล้ว",
      actions: {
        copy: {
          label: "คัดลอกใบแจ้งหนี้",
        },
      },
    },
  },
  SendDialog: {
    captions: {
      ecash: "แชร์โทเค็นหรือรหัส QR",
      lightning: "ชำระใบแจ้งหนี้หรือที่อยู่",
      onchain: "ส่งไปยังที่อยู่ Bitcoin",
    },
    title: "ส่ง",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "ไม่มี Mints ให้เลือก",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "ไม่มี Mints ให้เลือก",
      },
    },
  },
  SendTokenDialog: {
    badge_locked: "ล็อกแล้ว",
    title: "ส่ง ecash",
    inputs: {
      p2pk_pubkey: {
        label: "คีย์สาธารณะของผู้รับ",
        invalid: "ป้อนกุญแจสาธารณะที่ถูกต้อง (hex หรือ npub)",
      },
    },
    actions: {
      copy_emoji: {
        tooltip_text: "คัดลอกอีโมจิ",
      },
      copy_tokens: {
        label: "คัดลอก ecash",
      },
      copy_link: {
        tooltip_text: "คัดลอกลิงก์",
      },
      share: {
        tooltip_text: "แชร์ ecash",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      paste_p2pk_pubkey: {
        tooltip_text: "@:global.actions.paste.label",
      },
      send: {
        label: "@:global.actions.send.label",
        in_progress: "กำลังส่ง…",
      },
      delete: {
        tooltip_text: "ลบออกจากประวัติ",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "แฟลชไปยังการ์ด NFC",
        },
      },
      pay: { label: "@:global.actions.pay.label" },
    },
    errors: {
      amount_required: "ป้อนจำนวนเงินก่อน",
      serialization_failed: "ไม่สามารถเตรียมโทเค็น ecash ได้",
      mint_not_allowed_by_request: "คำขอชำระเงินนี้ไม่รับ Mint ที่เลือก",
    },
  },
  ReceiveDialog: {
    captions: {
      ecash: "วาง สแกน หรือขอโทเค็น",
      lightning: "สร้างใบแจ้งหนี้เพื่อรับเงิน",
      onchain: "รับที่อยู่ Bitcoin",
    },
    title: "รับ",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "ไม่มี Mints ให้เลือก",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "คุณต้องเชื่อมต่อกับ Mint เพื่อรับผ่าน Lightning",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "รับ ecash",
    actions: {
      paste: {
        label: "วางโทเค็น",
      },
      scan: {
        label: "สแกนโทเค็น",
      },
      request: {
        label: "ขอ ecash",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      nfc: {
        label: "NFC",
        scanning_text: "กำลังสแกน…",
      },
    },
  },
  ReceiveTokenDialog: {
    receiving_amount: "กำลังรับ {amount}",
    title: "รับ ecash",
    errors: {
      invalid_token: {
        label: "โทเค็นไม่ถูกต้อง",
      },
      p2pk_lock_mismatch: {
        label:
          "ไม่สามารถรับได้ คีย์ล็อก P2PK ของโทเค็นนี้ไม่ตรงกับคีย์สาธารณะของคุณ",
      },
    },
    actions: {
      receive: {
        label: "@:global.actions.receive.label",
        label_known_mint: "@:ReceiveTokenDialog.actions.receive.label",
        label_adding_mint: "กำลังเพิ่ม Mint…",
      },
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "แลกเปลี่ยนไปยัง Mint ที่เชื่อถือได้",
        processing: "กำลังแลกเปลี่ยน…",
        failed: "แลกเปลี่ยนไม่สำเร็จ",
      },
      cancel_swap: {
        tooltip_text: "ยกเลิกการแลกเปลี่ยน",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
      },
      later: {
        label: "รับภายหลัง",
        tooltip_text: "เพิ่มไปยังประวัติเพื่อรับภายหลัง",
        already_in_history_success_text: "ecash อยู่ในประวัติแล้ว",
        added_to_history_success_text: "เพิ่ม ecash ลงในประวัติแล้ว",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "อ่านจากการ์ด NFC",
        },
      },
      receive_to_selected_mint: { label: "รับไปยัง Mint ที่เลือก" },
    },
    unknown_mint_info_text:
      "Mint ที่ไม่รู้จัก จะถูกเพิ่มหลังจากคุณรับโทเค็นนี้",
    swap_section: {
      title: "แลกเปลี่ยน",
      source_label: "จาก",
      destination_label: "ไปยัง",
      fee_info: "การแลกเปลี่ยนนี้มีค่าธรรมเนียมเครือข่าย Lightning",
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "กุญแจล็อก",
      description: "รับ ecash ที่ล็อกด้วยคีย์นี้",
      used_warning_text:
        "คำเตือน: คีย์นี้เคยถูกใช้มาก่อน ใช้คีย์ใหม่เพื่อความเป็นส่วนตัวที่ดีขึ้น",
    },
    actions: {
      copy: {
        label: "คัดลอกกุญแจสาธารณะ",
      },
      new_key: {
        label: "สร้างคีย์ใหม่",
      },
    },
  },
  PaymentRequestDialog: {
    any_amount: "จำนวนใดก็ได้",
    payment_request: {
      caption: "คำขอชำระเงิน",
    },
    request_index: "คำขอที่ {index} จาก {total}",
    actions: {
      set_amount: {
        label: "กำหนดจำนวน",
      },
      copy: {
        label: "@:global.actions.copy.label",
      },
      new_request: {
        label: "คำขอใหม่",
      },
      share: {
        label: "แชร์",
      },
      add_amount: {
        label: "เพิ่มจำนวนเงิน",
      },
      use_active_mint: {
        label: "Mint ใดก็ได้",
      },
      remove_amount: {
        label: "ลบจำนวนเงิน",
      },
      previous: {
        label: "คำขอก่อนหน้า",
      },
      next: {
        label: "คำขอถัดไป",
      },
    },
    inputs: {
      amount: {
        placeholder: "ป้อนจำนวนเงิน",
      },
    },
    received_total: "ยอดรับรวม",
    no_payments_yet: "ยังไม่มีการชำระเงิน",
  },
  NWCDialog: {
    nwc: {
      caption: "Nostr Wallet Connect",
      description:
        "ควบคุม Wallet ของคุณจากระยะไกลด้วย NWC กดที่รหัส QR เพื่อเชื่อมโยง Wallet ของคุณกับแอปพลิเคชันที่เข้ากันได้",
      warning_text:
        "คำเตือน: ใครก็ตามที่เข้าถึงสตริงการเชื่อมต่อนี้สามารถเริ่มการชำระเงินจาก Wallet ของคุณได้ ห้ามแบ่งปัน!",
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
    title: "ข้อความจาก Mint",
  },
  MintDetailsDialog: {
    qr: {
      show: "แสดงรหัส QR",
      hide: "ซ่อนรหัส QR",
    },
    contact: {
      title: "ติดต่อ",
      email: "อีเมล",
    },
    details: {
      title: "รายละเอียด Mint",
      url: {
        label: "URL",
      },
      nuts: {
        label: "ฟีเจอร์ที่รองรับ",
        actions: {
          show: {
            label: "แสดงทั้งหมด",
          },
          hide: {
            label: "ซ่อน",
          },
        },
      },
      currency: {
        label: "หน่วย",
      },
      currencies: {
        label: "@:MintDetailsDialog.details.currency.label",
      },
      version: {
        label: "เวอร์ชัน",
      },
    },
    actions: {
      title: "การดำเนินการ",
      copy_mint_url: {
        label: "คัดลอก Mint URL",
      },
      delete: {
        label: "ลบ Mint",
      },
      edit: {
        label: "แก้ไข Mint",
      },
    },
    nuts: {
      nut7: "ตรวจสอบสถานะโทเค็น",
      nut8: "ค่าธรรมเนียม Lightning ที่จ่ายเกิน",
      nut9: "กู้คืนลายเซ็น",
      nut10: "เงื่อนไขการใช้จ่าย",
      nut11: "จ่ายไปยังกุญแจสาธารณะ (P2PK)",
      nut12: "หลักฐาน DLEQ",
      nut13: "ความลับแบบกำหนดได้",
      nut14: "สัญญาล็อกเวลาแบบแฮช (HTLC)",
      nut15: "การชำระเงินหลายเส้นทางบางส่วน",
      nut16: "รหัส QR แบบเคลื่อนไหว",
      nut17: "การสมัครรับข้อมูล WebSocket",
      nut18: "คำขอชำระเงิน",
      nut19: "การตอบกลับที่แคชไว้",
      nut20: "ลายเซ็นบนใบเสนอราคา mint",
      nut21: "การยืนยันตัวตนแบบเปิดเผย",
      nut22: "การยืนยันตัวตนแบบบลายด์",
    },
  },
  UnitToggle: {
    label: "หน่วย: {unit}, เปลี่ยน",
    bitcoin: "Bitcoin",
  },
  ChooseMint: {
    open_selector: "เลือก Mint, Mint ปัจจุบัน: {mint}",
    open_selector_empty: "เลือก Mint",
    title: "เลือก Mint",
    badge_mint_error_text: "ข้อผิดพลาด",
    available_text: "ใน Mint นี้",
    sheet_title: "เลือก Mint",
    placeholder: "เลือก Mint",
  },
  HistoryTable: {
    empty_text: "ยังไม่มีประวัติ",
    empty_hint: "การชำระเงินที่คุณส่งและรับจะแสดงที่นี่",
    filters: {
      title: "กรองประวัติ",
      direction: "ทิศทาง",
      type: "ประเภท",
      completed: "เสร็จสิ้น",
      received: "ได้รับ",
      sent: "ส่งแล้ว",
      reset: "รีเซ็ต",
      clear_all: "ล้างทั้งหมด",
      remove: "ลบตัวกรอง: {label}",
      empty_title: "ไม่มีการชำระเงินที่ตรงกับตัวกรอง",
      clear: "ล้างตัวกรอง",
      count: "{shown} จาก {total}",
      active: "กรองประวัติ ใช้งาน {count} รายการ",
    },
    row: {
      type_label: "Ecash",
    },
    actions: {
      check_status: {
        tooltip_text: "ตรวจสอบสถานะ",
      },
      receive: {
        tooltip_text: "รับ",
      },
    },
    old_token_not_found_error_text: "ไม่พบโทเค็นเก่า",
    labels: {
      onchain_subpayment: "การชำระเงินย่อยแบบออนเชน",
      bolt12_subpayment: "การชำระเงินย่อย BOLT12",
    },
  },
  InvoiceTable: {
    row: {
      type_label: "Lightning",
    },
  },
  RemoveMintDialog: {
    title: "นำ Mint นี้ออกไหม",
    nickname: {
      label: "ชื่อเล่น",
    },
    balances: {
      label: "ยอดคงเหลือใน Mint นี้",
    },
    warning_text:
      "ecash ของคุณจาก Mint นี้ยังอยู่บนอุปกรณ์นี้ และจะกลับมาเมื่อคุณเพิ่ม Mint นี้อีกครั้ง",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "ลบ Mint",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  ParseInputComponent: {
    placeholder: {
      default: "Cashu token หรือที่อยู่ Lightning",
      receive: "Cashu token",
      pay: "ที่อยู่ Lightning หรือใบแจ้งหนี้",
    },
    qr_scanner: {
      title: "สแกนรหัส QR",
      description: "หันกล้องไปที่รหัส QR",
      caption_address: "แตะเพื่อสแกนที่อยู่",
      caption_token: "แตะเพื่อสแกนโทเค็น",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    onchain: {
      title: "ชำระแบบออนเชน",
      address_placeholder: "ที่อยู่ Bitcoin",
      choose_speed: "เลือกความเร็วในการยืนยัน",
      blocks: "{n} บล็อก",
      estimated_confirmation: "เวลายืนยันโดยประมาณ",
      fee_reserve: "ค่าธรรมเนียมสำรอง",
    },
    multinut: {
      label: "ชำระด้วยหลาย Mint",
    },
    quote: {
      label: "ขอราคา",
    },
    input_data: {
      title: "จ่ายด้วย Lightning",
      title_bolt12: "จ่ายข้อเสนอ Lightning",
    },
    lnurlpay: {
      amount_exact_label: "{ payee } กำลังขอ { value } { ticker }",
      amount_range_label:
        "{ payee } กำลังขอ{br}ระหว่าง { min } และ { max } { ticker }",
      sending_to_lightning_address: "กำลังส่งไปยัง { address }",
      inputs: {
        comment: {
          label: "ความคิดเห็น (ไม่บังคับ)",
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
      paying: "กำลังชำระเงิน",
      paid: "ชำระแล้ว",
      fee: "ค่าธรรมเนียม",
      memo: {
        label: "บันทึก",
      },
      processing_info_text: "กำลังประมวลผล…",
      balance_too_low_warning_text: "ยอดเงินคงเหลือต่ำเกินไป",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        pay: {
          label: "ชำระเงิน",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
          waiting_for_wallet: "กำลังรอกระเป๋าเงิน…",
        },
      },
    },
  },
  EditMintDialog: {
    title: "แก้ไข Mint",
    inputs: {
      nickname: {
        label: "ชื่อเล่น (ไม่บังคับ)",
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
    title: "คุณเชื่อถือ Mint นี้หรือไม่?",
    description:
      "เข้าร่วม Mint นี้เฉพาะเมื่อคุณไว้ใจเท่านั้น หาก Mint หยุดให้บริการ ecash ที่คุณถืออยู่ที่นั่นจะสูญหาย",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
        in_progress: "กำลังเพิ่ม Mint",
      },
    },
    audit_info: {
      label: "ข้อมูลการตรวจสอบ",
      actions: {
        show: {
          label: "แสดง",
        },
        hide: {
          label: "ซ่อน",
        },
      },
    },
    unreachable_error_text:
      "ไม่สามารถเชื่อมต่อ Mint นี้ได้ ตรวจสอบ URL และการเชื่อมต่อ แล้วลองอีกครั้ง",
  },
  restore: {
    mnemonic_error_text: "โปรดป้อน mnemonic",
    restore_mint_error_text: "ข้อผิดพลาดในการกู้คืน Mint: { error }",
    prepare_info_text: "กำลังเตรียมกระบวนการกู้คืน…",
    restored_proofs_for_keyset_info_text:
      "กู้คืน { restoreCounter } proofs สำหรับ keyset { keysetId }",
    checking_proofs_for_keyset_info_text:
      "กำลังตรวจสอบ proofs { startIndex } ถึง { endIndex } สำหรับ keyset { keysetId }",
    no_proofs_info_text: "ไม่พบ proofs ที่จะกู้คืน",
    restored_amount_success_text: "กู้คืน { amount }",
  },
  swap: {
    in_progress_warning_text: "กำลังดำเนินการแลกเปลี่ยน",
    invalid_swap_data_error_text: "ข้อมูลการแลกเปลี่ยนไม่ถูกต้อง",
    swap_error_text: "ข้อผิดพลาดในการแลกเปลี่ยน",
  },
  TokenInformation: {
    fee: "ค่าธรรมเนียม",
    token: "โทเค็น",
    unit: "หน่วย",
    fiat: "สกุลเงิน",
    p2pk: "P2PK",
    locked: "ล็อค",
    locked_to_you: "ล็อคให้คุณ",
    mint: "โรงกษาปณ์",
    memo: "บันทึก",
    payment_request: "คำขอชำระเงิน",
    nostr: "Nostr",
    token_copied: "คัดลอกโทเค็นไปยังคลิปบอร์ดแล้ว",
  },
  ActivityRow: {
    received: "ได้รับแล้ว",
    sent: "ส่งแล้ว",
    receiving: "กำลังรับ",
    sending: "กำลังส่ง",
  },
  common: {
    copied: "คัดลอกแล้ว",
    on_chain: "ออนเชน",
    pending: "รอดำเนินการ",
    delete: "ลบ",
    copy_npub: "คัดลอก npub",
    back: "ย้อนกลับ",
    refresh: "รีเฟรช",
    settings: "การตั้งค่า",
    backspace: "ลบตัวอักษร",
    enter_amount_in: "ป้อนจำนวนเป็น {fiat}",
    something_went_wrong: "เกิดข้อผิดพลาดบางอย่าง",
  },
  SendPaymentRequest: {
    actions: {
      pay: { label: "จ่าย" },
      pay_via: { label: "จ่ายผ่าน {transport}" },
    },
    info: {
      pay_failed: "ชำระคำขอไม่สำเร็จ",
      no_ecash: "ไม่มี ecash สำหรับคำขอชำระเงินนี้",
    },
  },
  PaymentRequestInfo: {
    title_with_transport: "คำขอชำระเงินผ่าน {transport}",
    title: "คำขอชำระเงิน",
    subtitle: "จ่ายให้ {target}",
    subtitle_fallback: "คำขอชำระเงิน",
    invalid_url: "URL ไม่ถูกต้อง",
  },
  QuoteInformation: {
    address: "ที่อยู่",
    invoice: "ใบแจ้งหนี้",
    request: "คำขอ",
    amount: "จำนวน",
    fee_reserve: "ค่าธรรมเนียมสำรอง",
    fee_paid: "ค่าธรรมเนียมที่จ่าย",
    unit: "หน่วย",
    status: "สถานะ",
    network: "เครือข่าย",
    transaction_id: "รหัสธุรกรรม",
    explorer: "Explorer",
    confirmations: "การยืนยัน",
    paid_at: "ชำระเมื่อ",
    preimage: "พรีอิมเมจ",
    preimage_copied: "คัดลอกพรีอิมเมจแล้ว",
    mint: "Mint",
    method: "วิธีการ",
    lightning_offer: "ข้อเสนอ Lightning",
    states: {
      waiting: "กำลังรอการชำระเงิน",
      confirming: "กำลังยืนยัน ({count}/{threshold})",
      issuing: "กำลังออก ecash",
      paid: "ชำระแล้ว",
      unpaid: "ยังไม่ชำระ",
      pending: "รอดำเนินการ",
      issued: "ออกแล้ว",
      expired: "หมดอายุ",
      failed: "ล้มเหลว",
    },
  },
  MintAuditInfo: {
    title: "ข้อมูลการตรวจสอบ",
    loading: "กำลังโหลดข้อมูลการตรวจสอบ...",
    not_audited: "Mint นี้ยังไม่ได้รับการตรวจสอบ",
    not_audited_text:
      "หากต้องการเรียนรู้เพิ่มเติมเกี่ยวกับผู้ตรวจสอบหรือสนับสนุนการตรวจสอบในอนาคต ให้ไปที่ {link} หรือคลิก{here}เพื่อบริจาค ecash และช่วยเริ่มการตรวจสอบ Mint นี้",
    here: "ที่นี่",
    unavailable: "ข้อมูลการตรวจสอบไม่พร้อมใช้งานในขณะนี้",
    load_failed: "โหลดข้อมูล Mint ไม่สำเร็จ",
    success_rate: "อัตราความสำเร็จ",
    swaps_count: "แลกเปลี่ยนสำเร็จ {successful} จาก {total} ครั้ง",
    average_time: "เวลาเฉลี่ย",
    average_time_caption: "สำหรับการแลกเปลี่ยนที่สำเร็จ",
    disclaimer:
      "ข้อมูลการตรวจสอบจัดทำโดยบุคคลที่สามที่เป็นอิสระ เพื่อช่วยประเมินความน่าเชื่อถือของ Mint เมื่อเวลาผ่านไป อย่างไรก็ตาม ผลลัพธ์เหล่านี้มีไว้เพื่อเป็นข้อมูลเท่านั้น และไม่รับประกันความปลอดภัย ความสามารถในการชำระหนี้ หรือความน่าเชื่อถือของ Mint ใด ๆ โปรดศึกษาด้วยตนเองเสมอ และตรวจสอบให้แน่ใจว่าคุณไว้วางใจผู้ดำเนินการ Mint ก่อนใช้บริการ",
    donate_text:
      "ข้อมูลการตรวจสอบจัดทำโดย {link} ยอดคงเหลือปัจจุบันที่ผู้ตรวจสอบถือไว้สำหรับ Mint นี้คือ {balance} และมียอดบริจาครวมจนถึงตอนนี้ {donations} หากต้องการสนับสนุนการตรวจสอบต่อไป คุณสามารถ{press_here}เพื่อบริจาค ecash ให้ผู้ตรวจสอบ",
    press_here: "กดที่นี่",
    sats_amount: "{amount} sats",
    warnings_title: "คำเตือนจากผู้ตรวจสอบ",
    warnings: {
      last_swap_failed: "การแลกเปลี่ยนครั้งล่าสุดล้มเหลว",
      recent_success:
        "การแลกเปลี่ยน {successful} จาก {total} ครั้งในช่วง {days} วันที่ผ่านมาสำเร็จ",
      reliable:
        "{base} อย่างไรก็ตาม {success} Mint นี้ดูน่าเชื่อถือ ความล้มเหลวอาจเกิดจาก Mint ปลายทาง",
      unreliable: "{base} มีเพียง {success} Mint นี้อาจไม่น่าเชื่อถือ",
      unknown: "ผู้ตรวจสอบยังไม่สามารถประเมินคุณภาพของ Mint นี้ได้",
      not_enough_data:
        "ผู้ตรวจสอบมีข้อมูลล่าสุดของ Mint นี้ไม่เพียงพอ ในช่วง {days} วันที่ผ่านมามีการแลกเปลี่ยนที่สำเร็จเพียง {count} ครั้ง",
      low_success:
        "ในช่วง {days} วันที่ผ่านมา Mint นี้มีอัตราความสำเร็จ {rate}% ต่ำกว่าที่แนะนำ {threshold}%",
      inactive:
        "Mint นี้ไม่มีการแลกเปลี่ยนมา {days} วันแล้ว อาจไม่สามารถเข้าถึงได้",
      slow: "Mint นี้ทำงานช้า การชำระเงินจาก Mint นี้ใช้เวลาเฉลี่ย {seconds} วินาที",
      no_successful:
        "ไม่มีการบันทึกการแลกเปลี่ยนที่สำเร็จสำหรับ Mint นี้ อาจไม่สามารถเข้าถึงได้",
    },
    chart: {
      now: "ตอนนี้",
      today: "วันนี้",
      yesterday: "เมื่อวาน",
      invalid_date: "วันที่ไม่ถูกต้อง",
      swaps: "การแลกเปลี่ยน:",
      success_rate: "อัตราความสำเร็จ:",
      time_range: "ช่วงเวลา:",
    },
  },
  DisplayTokenComponent: {
    title: {
      send: "ส่ง ecash",
      sent: "ส่ง ecash แล้ว",
      received: "ได้รับ ecash แล้ว",
    },
    qr_speed: "ความเร็ว QR: {value}",
    qr_density: "ความหนาแน่น QR: {value}",
    speed: {
      fast: "เร็ว",
      medium: "ปานกลาง",
      slow: "ช้า",
    },
    density: {
      high: "สูง",
      medium: "กลาง",
      low: "ต่ำ",
    },
    delete_dialog: {
      title: "ลบ ecash",
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบธุรกรรมนี้ออกจากประวัติ",
      warning:
        "คำเตือน: การดำเนินการนี้ไม่สามารถย้อนกลับได้ และไม่มีทางกู้คืนโทเค็น",
    },
    nfc: {
      read_failed: "อ่าน NFC ไม่สำเร็จ",
      write_failed: "เขียน NFC ไม่สำเร็จ",
      error: "ข้อผิดพลาด NFC",
      writing: "กำลังเขียนลงการ์ด NFC...",
      success: "เขียนโทเค็นลงการ์ดสำเร็จ!",
      capacity: "การ์ดอาจมีความจุไม่พอ (ต้องการ {bytes} ไบต์)",
    },
  },
  CreateInvoiceDialog: {
    format_label: "ประเภทคำขอ",
    formats: {
      bolt11: "ใบแจ้งหนี้",
      bolt12: "ข้อเสนอ",
    },
    onchain_title: "รับแบบออนเชน",
    bolt12_title: "รับ Bolt12",
    mint_unreachable: "เข้าถึง Mint ไม่ได้",
    mint_unreachable_text: "เชื่อมต่อ Mint อีกครั้งเพื่อรับการชำระเงิน",
    reconnect_mint: "เชื่อมต่อ Mint อีกครั้ง",
    checking_address: "กำลังตรวจสอบที่อยู่...",
    add_amount: "เพิ่มจำนวน",
    new_offer: "ข้อเสนอใหม่",
    create_offer: "สร้างข้อเสนอ",
    create_new_address: "สร้างที่อยู่ใหม่",
    create_address: "สร้างที่อยู่",
    onchain_unsupported: "Mint นี้ไม่รองรับการฝากแบบออนเชนในหน่วยนี้",
    deposit_limits: {
      outside: "การฝากที่อยู่นอกช่วง {min}–{max} จะไม่ได้รับการเครดิต",
      below: "การฝากที่ต่ำกว่า {min} จะไม่ได้รับการเครดิต",
      above: "การฝากที่สูงกว่า {max} จะไม่ได้รับการเครดิต",
    },
    amount_errors: {
      positive_decimal:
        "ป้อนจำนวนที่เป็นบวกเป็น {unit} โดยมีทศนิยมไม่เกินสองตำแหน่ง",
      positive_whole: "ป้อนจำนวนเต็มบวกเป็น {unit}",
      min: "ป้อนอย่างน้อย {amount}",
      max: "ป้อนไม่เกิน {amount}",
    },
  },
  storage: {
    notifications: {
      unrecognized_backup: "ไม่รู้จักรูปแบบข้อมูลสำรอง",
      backup_restored: "กู้คืนข้อมูลสำรองแล้ว",
      backup_exported: "ส่งออกข้อมูลสำรอง Wallet แล้ว",
      quota_exceeded:
        "พื้นที่จัดเก็บในเครื่องเต็ม โปรดล้างพื้นที่จัดเก็บในเครื่อง",
      cleaned_up: "ล้างข้อมูลแล้ว {size} ไบต์",
    },
  },
  receiveTokens: {
    notifications: {
      already_in_history: "โทเค็นอยู่ในประวัติแล้ว",
      nfc_read_failed: "ไม่สามารถอ่านข้อมูลจากแท็ก NFC ได้",
      scan_error: "ข้อผิดพลาดในการสแกน",
      nfc_error: "ข้อผิดพลาด NFC",
    },
  },
  nostrMintBackup: {
    notifications: {
      no_relays: "ยังไม่ได้ตั้งค่ารีเลย์ Nostr",
      backup_failed: "ไม่สามารถสำรองรายการ Mint ไปยัง Nostr ได้",
      backed_up: "สำรองรายการ Mint ไปยัง Nostr แล้ว",
      found:
        "พบ {count} Mint ในข้อมูลสำรอง Nostr | พบ {count} Mint ในข้อมูลสำรอง Nostr",
      none_found: "ไม่พบข้อมูลสำรอง Mint บน Nostr สำหรับวลีกู้คืนนี้",
      search_failed: "ไม่สามารถค้นหาข้อมูลสำรอง Mint ได้",
      add_mint_failed: "ไม่สามารถเพิ่ม {mint} ได้",
      added:
        "เพิ่ม {count} Mint ลงใน Wallet ของคุณแล้ว | เพิ่ม {count} Mint ลงใน Wallet ของคุณแล้ว",
      none_added: "ไม่มีการเพิ่ม Mint ใหม่",
      add_selected_failed: "ไม่สามารถเพิ่ม Mint ที่เลือกได้",
    },
  },
  nostr: {
    notifications: {
      nip04_published: "เผยแพร่อีเวนต์ NIP-04 แล้ว",
      nip04_failed: "ไม่สามารถเผยแพร่อีเวนต์ NIP-04 ได้",
      nip17_failed: "ไม่สามารถเผยแพร่อีเวนต์ NIP-17 ได้",
      receive_failed: "ไม่สามารถรับการชำระเงินขาเข้าได้",
      ecash_already_in_history: "ecash อยู่ในประวัติแล้ว",
      ecash_added: "เพิ่ม ecash ลงในประวัติแล้ว",
    },
  },
  nwc: {
    notifications: {
      melt_quote_failed: "NWC: ไม่สามารถขอใบเสนอราคา melt ได้",
      unit_must_be_sat: "NWC: หน่วยที่ใช้งานต้องเป็น sats",
      allowance_exceeded: "NWC: เกินวงเงินที่อนุญาต",
    },
  },
  npubcash: {
    notifications: {
      could_not_update_mint: "ไม่สามารถอัปเดต npub.cash mint ได้",
      add_mint_first: "เพิ่ม {mint} ลงใน Wallet ของคุณก่อน",
    },
  },
};
