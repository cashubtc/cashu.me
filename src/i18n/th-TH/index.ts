export default {
  MultinutPicker: {
    payment: "การชำระเงิน Multinut",
    selectMints: "เลือกหนึ่งหรือหลาย mint เพื่อทำการชำระเงิน",
    totalSelectedBalance: "ยอดคงเหลือที่เลือกทั้งหมด",
    multiMintPay: "จ่ายแบบหลาย Mint",
    balanceNotEnough: "ยอดหลาย mint ไม่เพียงพอสำหรับใบแจ้งหนี้นี้",
    failed: "ไม่สามารถประมวลผล: {error}",
    paid: "จ่าย {amount} ผ่าน Lightning",
  },

  global: {
    copy_to_clipboard: {
      success: "คัดลอกไปยังคลิปบอร์ดแล้ว!",
    },
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
      scan: {
        label: "สแกน",
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
      payment_pending_refresh:
        "การชำระเงินอยู่ระหว่างดำเนินการ รีเฟรชใบแจ้งหนี้ด้วยตนเอง",
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
      please_try_again: "โปรดลองอีกครั้ง",
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
        could_not_get_info: "ไม่สามารถดึงข้อมูล Mint ได้",
        could_not_get_keys: "ไม่สามารถดึงคีย์ Mint ได้",
        could_not_get_keysets: "ไม่สามารถดึงชุดคีย์ Mint ได้",
        mint_validation_error: "ข้อผิดพลาดในการตรวจสอบ mint",
        removed: "ลบ Mint แล้ว",
        error: "ข้อผิดพลาด Mint",
      },
    },
  },
  MainHeader: {
    menu: {
      settings: {
        title: "การตั้งค่า",
        settings: {
          title: "การตั้งค่า",
          caption: "การกำหนดค่า Wallet",
        },
      },
      terms: {
        title: "เงื่อนไข",
        terms: {
          title: "เงื่อนไข",
          caption: "ข้อกำหนดในการให้บริการ",
        },
      },
      links: {
        title: "ลิงก์",
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
  FullscreenHeader: {
    actions: {
      back: {
        label: "Wallet",
      },
    },
  },
  Settings: {
    web_of_trust: {
      title: "เครือข่ายที่เชื่อถือได้",
      known_pubkeys: "Pubkey ที่รู้จัก: {wotCount}",
      continue_crawl: "ดำเนินการสำรวจต่อ",
      crawl_odell: "สำรวจ ODELL'S WEB OF TRUST",
      crawl_wot: "สำรวจ web of trust",
      pause: "หยุดชั่วคราว",
      reset: "รีเซ็ต",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      use_npubx: "ใช้ npubx.cash",
      copy_lightning_address: "คัดลอกที่อยู่ Lightning",
      v2_mint: "npub.cash v2 mint",
    },
    multinut: {
      use_multinut: "ใช้ Multinut",
    },
    language: {
      title: "ภาษา",
      description: "โปรดเลือกภาษาที่คุณต้องการจากรายการด้านล่าง",
    },
    sections: {
      backup_restore: "สำรองข้อมูล & กู้คืน",
      lightning_address: "ที่อยู่ LIGHTNING",
      nostr_keys: "คีย์ NOSTR",
      nostr: {
        title: "NOSTR",
        relays: {
          expand_label: "คลิกเพื่อแก้ไขรีเลย์",
          add: {
            title: "เพิ่มรีเลย์",
            description:
              "กระเป๋าเงินของคุณใช้รีเลย์เหล่านี้สำหรับการดำเนินงาน nostr เช่น คำขอชำระเงิน nostr wallet connect และการสำรองข้อมูล",
          },
          list: {
            title: "รีเลย์",
            description: "กระเป๋าเงินของคุณจะเชื่อมต่อกับรีเลย์เหล่านี้",
            copy_tooltip: "คัดลอกรีเลย์",
            remove_tooltip: "ลบรีเลย์",
          },
        },
      },
      payment_requests: "คำขอชำระเงิน",
      nostr_wallet_connect: "NOSTR WALLET CONNECT",
      hardware_features: "คุณสมบัติฮาร์ดแวร์",
      p2pk_features: "คุณสมบัติ P2PK",
      privacy: "ความเป็นส่วนตัว",
      experimental: "ทดลอง",
      appearance: "รูปลักษณ์",
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
          "วิซาร์ดการกู้คืนช่วยให้คุณกู้คืน ecash ที่สูญหายจากวลีกู้คืนแบบ Mnemonic ได้ วลีกู้คืนของ Wallet ปัจจุบันของคุณจะไม่ได้รับผลกระทบ วิซาร์ดจะอนุญาตให้คุณ <i>กู้คืน</i> ecash จากวลีกู้คืนอื่นเท่านั้น",
        button: "กู้คืน",
      },
    },
    lightning_address: {
      title: "ที่อยู่ Lightning",
      description: "รับการชำระเงินไปยังที่อยู่ Lightning ของคุณ",
      enable: {
        toggle: "เปิดใช้งาน",
        description: "ที่อยู่ Lightning กับ npub.cash",
      },
      address: {
        copy_tooltip: "คัดลอกที่อยู่ Lightning",
      },
      automatic_claim: {
        toggle: "รับอัตโนมัติ",
        description: "รับการชำระเงินขาเข้าโดยอัตโนมัติ",
      },
      npc_v2: {
        choose_mint_title: "เลือก mint สำหรับ npub.cash v2",
        choose_mint_placeholder: "เลือก mint...",
      },
    },
    nostr_keys: {
      title: "คีย์ Nostr ของคุณ",
      description: "ตั้งค่าคีย์ nostr สำหรับที่อยู่ Lightning ของคุณ",
      wallet_seed: {
        title: "วลีสำหรับกู้คืน Wallet",
        description: "สร้างคู่คีย์ nostr จากวลีสำหรับกู้คืน Wallet",
        copy_nsec: "คัดลอก nsec",
      },
      nsec_bunker: {
        title: "Nsec Bunker",
        description: "ใช้ NIP-46 bunker",
        delete_tooltip: "ลบการเชื่อมต่อ",
      },
      use_nsec: {
        title: "ใช้ nsec ของคุณ",
        description: "วิธีนี้อันตรายและไม่แนะนำ",
        delete_tooltip: "ลบ nsec",
      },
      signing_extension: {
        title: "ส่วนขยายการลงนาม",
        description: "ใช้ส่วนขยายการลงนาม NIP-07",
        not_found: "ไม่พบส่วนขยายการลงนาม NIP-07",
      },
    },
    payment_requests: {
      title: "คำขอชำระเงิน",
      description:
        "คำขอชำระเงินช่วยให้คุณรับการชำระเงินผ่าน nostr ได้ หากเปิดใช้งาน Wallet ของคุณจะสมัครสมาชิก Nostr relays ของคุณ",
      enable_toggle: "เปิดใช้งานคำขอชำระเงิน",
      claim_automatically: {
        toggle: "รับอัตโนมัติ",
        description: "รับการชำระเงินขาเข้าโดยอัตโนมัติ",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Wallet Connect (NWC)",
      description: "ใช้ NWC เพื่อควบคุม Wallet ของคุณจากแอปพลิเคชันอื่นใด",
      enable_toggle: "เปิดใช้งาน NWC",
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
        title: "WebNFC",
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
          description: "จัดเก็บโทเค็นเป็นข้อมูลไบนารี",
        },
        quick_access: {
          toggle: "เข้าถึง NFC ด่วน",
          description:
            "สแกนการ์ด NFC ได้อย่างรวดเร็วในเมนู รับ Ecash ตัวเลือกนี้จะเพิ่มปุ่ม NFC ในเมนู รับ Ecash",
        },
      },
    },
    p2pk_features: {
      title: "P2PK",
      description:
        "สร้างคู่คีย์เพื่อรับ ecash ที่ล็อกด้วย P2PK คำเตือน: คุณสมบัตินี้เป็นการทดลอง ใช้เฉพาะกับจำนวนเล็กน้อยเท่านั้น หากคุณทำคีย์ส่วนตัวของคุณหาย จะไม่มีใครสามารถปลดล็อก ecash ที่ล็อกด้วยคีย์นั้นได้อีกต่อไป",
      generate_button: "สร้างคีย์",
      import_button: "นำเข้า nsec",
      quick_access: {
        toggle: "เข้าถึงล็อกด่วน",
        description:
          "ใช้สิ่งนี้เพื่อแสดงคีย์ล็อก P2PK ของคุณอย่างรวดเร็วในเมนูรับ ecash",
      },
      keys_expansion: {
        label: "คลิกเพื่อเรียกดู {count} คีย์",
        used_badge: "ใช้แล้ว",
      },
    },
    privacy: {
      title: "ความเป็นส่วนตัว",
      description: "การตั้งค่าเหล่านี้ส่งผลต่อความเป็นส่วนตัวของคุณ",
      check_incoming: {
        toggle: "ตรวจสอบใบแจ้งหนี้ขาเข้า",
        description:
          "หากเปิดใช้งาน Wallet จะตรวจสอบใบแจ้งหนี้ล่าสุดในเบื้องหลัง ซึ่งช่วยเพิ่มความสามารถในการตอบสนองของ Wallet ทำให้การสร้างรอยนิ้วมือทำได้ง่ายขึ้น คุณสามารถตรวจสอบใบแจ้งหนี้ที่ยังไม่ได้ชำระด้วยตนเองได้ในแท็บใบแจ้งหนี้",
      },
      check_startup: {
        toggle: "ตรวจสอบใบแจ้งหนี้ที่รอดำเนินการเมื่อเริ่มต้น",
        description:
          "หากเปิดใช้งาน Wallet จะตรวจสอบใบแจ้งหนี้ที่รอดำเนินการในช่วง 24 ชั่วโมงที่ผ่านมาเมื่อเริ่มต้น",
      },
      check_all: {
        toggle: "ตรวจสอบใบแจ้งหนี้ทั้งหมด",
        description:
          "หากเปิดใช้งาน Wallet จะตรวจสอบใบแจ้งหนี้ที่ยังไม่ได้ชำระเป็นระยะๆ ในเบื้องหลังเป็นเวลาสูงสุดสองสัปดาห์ ซึ่งช่วยเพิ่มกิจกรรมออนไลน์ของ Wallet ทำให้การสร้างรอยนิ้วมือทำได้ง่ายขึ้น คุณสามารถตรวจสอบใบแจ้งหนี้ที่ยังไม่ได้ชำระด้วยตนเองได้ในแท็บใบแจ้งหนี้",
      },
      check_sent: {
        toggle: "ตรวจสอบ ecash ที่ส่ง",
        description:
          "หากเปิดใช้งาน Wallet จะใช้การตรวจสอบเบื้องหลังเป็นระยะๆ เพื่อพิจารณาว่าโทเค็นที่ส่งถูกแลกแล้วหรือไม่ ซึ่งเพิ่มกิจกรรมออนไลน์ของ Wallet ทำให้การสร้างรอยนิ้วมือทำได้ง่ายขึ้น",
      },
      websockets: {
        toggle: "ใช้ WebSockets",
        description:
          "หากเปิดใช้งาน Wallet จะใช้การเชื่อมต่อ WebSocket ที่มีอายุยืนยาวเพื่อรับการอัปเดตเกี่ยวกับใบแจ้งหนี้ที่ชำระแล้วและโทเค็นที่ใช้จ่ายจาก Mints ซึ่งเพิ่มความสามารถในการตอบสนองของ Wallet แต่ก็ทำให้การสร้างรอยนิ้วมือทำได้ง่ายขึ้นเช่นกัน",
      },
      bitcoin_price: {
        toggle: "รับอัตราแลกเปลี่ยนจาก Coinbase",
        description:
          "หากเปิดใช้งาน จะดึงอัตราแลกเปลี่ยน Bitcoin ปัจจุบันจาก coinbase.com และแสดงยอดคงเหลือที่แปลงแล้วของคุณ",
        currency: {
          title: "สกุลเงินเฟียต",
          description: "เลือกสกุลเงินเฟียตสำหรับการแสดงราคา Bitcoin",
        },
      },
    },
    experimental: {
      title: "ทดลอง",
      description: "คุณสมบัติเหล่านี้เป็นคุณสมบัติทดลอง",
      receive_swaps: {
        toggle: "รับ swaps",
        badge: "เบต้า",
        description:
          "ตัวเลือกในการแลกเปลี่ยน Ecash ที่ได้รับไปยัง Mint ที่เปิดใช้งานของคุณในกล่องโต้ตอบ รับ Ecash",
      },
      auto_paste: {
        toggle: "วาง Ecash โดยอัตโนมัติ",
        description:
          "วาง ecash ในคลิปบอร์ดของคุณโดยอัตโนมัติเมื่อคุณกด รับ, จากนั้น Ecash, จากนั้น วาง การวางอัตโนมัติอาจทำให้เกิดความผิดปกติของ UI ใน iOS ให้ปิดหากคุณประสบปัญหา",
      },
      auditor: {
        toggle: "เปิดใช้งานผู้ตรวจสอบ",
        badge: "เบต้า",
        description:
          "หากเปิดใช้งาน Wallet จะแสดงข้อมูลผู้ตรวจสอบในกล่องโต้ตอบรายละเอียด Mint ผู้ตรวจสอบคือบริการบุคคลที่สามที่ตรวจสอบความน่าเชื่อถือของ Mints",
        url_label: "URL ผู้ตรวจสอบ",
        api_url_label: "URL API ผู้ตรวจสอบ",
      },
      multinut: {
        toggle: "เปิดใช้งาน Multinut",
        description:
          "หากเปิดใช้งาน Wallet จะใช้ Multinut เพื่อชำระค่าใบแจ้งหนี้จากหลาย mints พร้อมกัน",
      },
      nostr_mint_backup: {
        toggle: "สำรองข้อมูล Mint list บน Nostr",
        description:
          "หากเปิดใช้งาน รายการ Mint ของคุณจะถูกสำรองข้อมูลไปยัง Nostr relays โดยอัตโนมัติโดยใช้คีย์ Nostr ที่กำหนดค่าไว้ สิ่งนี้ช่วยให้คุณสามารถกู้คืนรายการ Mint ของคุณในอุปกรณ์ต่างๆ ได้",
        notifications: {
          enabled: "เปิดใช้งานการสำรองข้อมูล Nostr mint แล้ว",
          disabled: "ปิดใช้งานการสำรองข้อมูล Nostr mint แล้ว",
          failed: "ไม่สามารถเปิดใช้งานการสำรองข้อมูล Nostr mint ได้",
        },
      },
    },
    appearance: {
      keyboard: {
        title: "แป้นพิมพ์บนหน้าจอ",
        description: "ใช้แป้นพิมพ์ตัวเลขสำหรับการป้อนจำนวนเงิน",
        toggle: "ใช้แป้นพิมพ์ตัวเลข",
        toggle_description:
          "หากเปิดใช้งาน จะใช้แป้นพิมพ์ตัวเลขสำหรับการป้อนจำนวนเงิน",
      },
      theme: {
        title: "รูปลักษณ์",
        description: "เปลี่ยนรูปลักษณ์ของ Wallet ของคุณ",
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
        title: "สัญลักษณ์ Bitcoin",
        description: "ใช้สัญลักษณ์ ₿ แทน sats",
        toggle: "ใช้สัญลักษณ์ ₿",
      },
    },
    advanced: {
      title: "ขั้นสูง",
      developer: {
        title: "การตั้งค่าสำหรับนักพัฒนา",
        description: "การตั้งค่าต่อไปนี้มีไว้สำหรับการพัฒนาและการดีบั๊ก",
        new_seed: {
          button: "สร้างวลีสำหรับกู้คืนใหม่",
          description:
            "สิ่งนี้จะสร้างวลีสำหรับกู้คืนใหม่ คุณต้องส่งยอดเงินทั้งหมดของคุณไปให้ตัวเองเพื่อที่จะกู้คืนด้วยวลีสำหรับกู้คืนใหม่ได้",
          confirm_question:
            "คุณแน่ใจหรือไม่ว่าต้องการสร้างวลีสำหรับกู้คืนใหม่?",
          cancel: "ยกเลิก",
          confirm: "ยืนยัน",
        },
        remove_spent: {
          button: "ลบหลักฐานที่ใช้แล้ว",
          description:
            "ตรวจสอบว่าโทเค็น ecash จาก mints ที่เปิดใช้งานของคุณถูกใช้ไปแล้วหรือไม่ และลบโทเค็นที่ใช้แล้วออกจาก Wallet ของคุณ ใช้สิ่งนี้เฉพาะเมื่อ Wallet ของคุณติดค้าง",
        },
        debug_console: {
          button: "สลับคอนโซลดีบั๊ก",
          description:
            "เปิดเทอร์มินัลดีบั๊ก Javascript ห้ามวางสิ่งใดๆ ลงในเทอร์มินัลนี้ที่คุณไม่เข้าใจ ขโมยอาจพยายามหลอกให้คุณวางโค้ดที่เป็นอันตรายที่นี่",
        },
        export_proofs: {
          button: "ส่งออกหลักฐานที่ใช้งานอยู่",
          description:
            "คัดลอกยอดคงเหลือทั้งหมดของคุณจาก mint ที่เปิดใช้งานเป็นโทเค็น Cashu ไปยังคลิปบอร์ดของคุณ นี่จะส่งออกเฉพาะโทเค็นจาก mint และหน่วยที่เลือก สำหรับการส่งออกทั้งหมด ให้เลือก mint และหน่วยอื่นแล้วส่งออกอีกครั้ง",
        },
        keyset_counters: {
          title: "เพิ่มเคาน์เตอร์ keyset",
          description:
            'คลิกที่ Keyset ID เพื่อเพิ่มเคาน์เตอร์ derivation path สำหรับ keysets ใน Wallet ของคุณ สิ่งนี้มีประโยชน์หากคุณเห็นข้อผิดพลาด "outputs have already been signed"',
          counter: "ตัวนับ: {count}",
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
            "ดาวน์โหลดข้อมูล Wallet ของคุณ คุณสามารถกู้คืน Wallet ของคุณจากไฟล์นี้บนหน้าจอต้อนรับของ Wallet ใหม่ ไฟล์นี้จะไม่ตรงกันหากคุณยังคงใช้ Wallet ของคุณหลังจากส่งออก",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "เข้าร่วม Mint",
    subtitle:
      "คุณยังไม่ได้เข้าร่วม Cashu mint ใด ๆ เพิ่ม URL ของ mint ในการตั้งค่าหรือรับ ecash จาก mint ใหม่เพื่อเริ่มต้น",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "รับ Ecash",
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
        label: "ประวัติ",
      },
      invoices: {
        label: "ใบแจ้งหนี้",
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
    title: "ไม่.",
    text: "มีแท็บอื่นกำลังทำงานอยู่แล้ว ปิดแท็บนี้แล้วลองอีกครั้ง",
    actions: {
      retry: {
        label: "ลองใหม่",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "อุ๊บส์. ไม่มีอะไรที่นี่…",
    actions: {
      home: {
        label: "กลับหน้าหลัก",
      },
    },
  },
  BalanceView: {
    mintUrl: {
      label: "Mint",
    },
    mintBalance: {
      label: "ยอดเงินคงเหลือ",
    },
    mintError: {
      label: "ข้อผิดพลาด Mint",
    },
    pending: {
      label: "รอดำเนินการ",
      tooltip: "ตรวจสอบโทเค็นที่รอดำเนินการทั้งหมด",
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
    title: "ยินดีต้อนรับสู่ Cashu",
    text: "Cashu.me คือ Wallet Bitcoin ที่ฟรีและเป็นโอเพนซอร์ส ซึ่งใช้ ecash เพื่อรักษาความปลอดภัยและความเป็นส่วนตัวของเงินของคุณ",
    actions: {
      more: {
        label: "คลิกเพื่อเรียนรู้เพิ่มเติม",
      },
    },
    p1: {
      text: "Cashu เป็นโปรโตคอล ecash ที่ฟรีและเป็นโอเพนซอร์สสำหรับ Bitcoin คุณสามารถเรียนรู้เพิ่มเติมได้ที่ { link }",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "Wallet นี้ไม่มีส่วนเกี่ยวข้องกับ Mint ใด ๆ ในการใช้ Wallet นี้ คุณต้องเชื่อมต่อกับ Mint Cashu ที่คุณเชื่อถืออย่างน้อยหนึ่งแห่ง",
    },
    p3: {
      text: "Wallet นี้จัดเก็บ ecash ที่มีเพียงคุณเท่านั้นที่เข้าถึงได้ หากคุณลบข้อมูลเบราว์เซอร์ของคุณโดยไม่มีการสำรองวลีสำหรับกู้คืน คุณจะสูญเสียโทเค็นของคุณ",
    },
    p4: {
      text: "Wallet นี้อยู่ในช่วงเบต้า เราไม่รับผิดชอบต่อบุคคลที่สูญเสียการเข้าถึงเงินทุน ใช้งานด้วยความเสี่ยงของคุณเอง! รหัสนี้เป็นโอเพนซอร์สและได้รับอนุญาตภายใต้ใบอนุญาต MIT",
    },
  },
  WelcomeSlide2: {
    title: "ติดตั้ง PWA",
    alt: { pwa_example: "ตัวอย่างการติดตั้ง PWA" },
    installing: "กำลังติดตั้ง…",
    instruction: {
      intro: {
        text: "เพื่อประสบการณ์ที่ดีที่สุด ใช้ Wallet นี้กับเว็บเบราว์เซอร์พื้นฐานของอุปกรณ์ของคุณเพื่อติดตั้งเป็น Progressive Web App ทำสิ่งนี้ทันที",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "แตะเมนู (มุมขวาบน)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "กด { buttonText }",
          buttonText: "@:AndroidPWAPrompt.buttonText",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "แตะ แชร์ (ด้านล่าง)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "กด { buttonText }",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "เมื่อคุณติดตั้งแอปนี้บนอุปกรณ์ของคุณแล้ว ให้ปิดหน้าต่างเบราว์เซอร์นี้และใช้แอปจากหน้าจอหลักของคุณ",
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
  iOSPWAPrompt: {
    text: "แตะ { icon } และ { buttonText }",
    buttonText: "เพิ่มไปยังหน้าจอหลัก",
  },
  AndroidPWAPrompt: {
    text: "แตะ { icon } และ { buttonText }",
    buttonText: "เพิ่มไปยังหน้าจอหลัก",
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
    title: "เงื่อนไข",
    actions: {
      more: {
        label: "อ่านข้อกำหนดในการให้บริการ",
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
    disclaimer:
      "วลีสำหรับกู้คืนใช้เฉพาะในเครื่องเพื่อสร้างคีย์กระเป๋าเงินของคุณ",
  },
  WelcomeRestoreEcash: {
    title: "กู้คืน ecash ของคุณ",
    text: "สแกนหา proof ที่ยังไม่ถูกใช้บน Mint ที่กำหนดค่าไว้และเพิ่มลงในกระเป๋าเงินของคุณ",
  },
  MintRatings: {
    title: "รีวิว Mint",
    reviews: "รีวิว",
    ratings: "คะแนน",
    no_reviews: "ไม่พบบทรีวิว",
    your_review: "รีวิวของคุณ",
    no_reviews_to_display: "ไม่มีรีวิวที่จะแสดง",
    no_rating: "ไม่มีคะแนน",
    out_of: "จาก",
    rows: "Reviews",
    sort: "เรียงลำดับ",
    sort_options: {
      newest: "ใหม่ที่สุด",
      oldest: "เก่าที่สุด",
      highest: "สูงที่สุด",
      lowest: "ต่ำที่สุด",
    },
    actions: { write_review: "เขียนรีวิว" },
    empty_state_subtitle:
      "ช่วยเหลือโดยการเขียนรีวิว แบ่งปันประสบการณ์ของคุณกับ Mint นี้และช่วยเหลือผู้อื่นโดยการเขียนรีวิว",
  },
  CreateMintReview: {
    title: "รีวิว Mint",
    publishing_as: "เผยแพร่เป็น",
    inputs: {
      rating: { label: "คะแนน" },
      review: { label: "รีวิว (ไม่บังคับ)" },
    },
    actions: {
      publish: { label: "เผยแพร่", in_progress: "กำลังเผยแพร่…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "กู้คืนจากวลีสำหรับกู้คืน",
      caption:
        "ป้อนวลีสำหรับกู้คืนของคุณเพื่อกู้คืน Wallet ของคุณ ก่อนที่จะกู้คืน ตรวจสอบให้แน่ใจว่าคุณได้เพิ่ม Mint ทั้งหมดที่คุณเคยใช้มาก่อน",
      inputs: {
        seed_phrase: {
          label: "วลีสำหรับกู้คืน",
          caption: "คุณสามารถดูวลีสำหรับกู้คืนของคุณได้ในการตั้งค่า",
        },
      },
    },
    information: {
      label: "ข้อมูล",
      caption:
        "วิซาร์ดจะกู้คืน ecash จากวลีสำหรับกู้คืนอื่นเท่านั้น คุณจะไม่สามารถใช้วลีสำหรับกู้คืนนี้หรือเปลี่ยนวลีสำหรับกู้คืนของ Wallet ที่คุณกำลังใช้อยู่ได้ ซึ่งหมายความว่า ecash ที่กู้คืนจะไม่ได้รับการป้องกันโดยวลีสำหรับกู้คืนปัจจุบันของคุณ ตราบใดที่คุณยังไม่ได้ส่ง ecash ให้ตัวเองหนึ่งครั้ง",
    },
    restore_mints: {
      label: "กู้คืน Mints",
      caption:
        'เลือก Mint ที่จะกู้คืน คุณสามารถเพิ่ม Mint เพิ่มเติมในหน้าจอหลักภายใต้ "Mints" และกู้คืนได้ที่นี่',
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
        label: "ไม่เลือกทั้งหมด",
      },
      restore: {
        label: "กู้คืน",
        in_progress: "กำลังกู้คืน Mint…",
        error: "ข้อผิดพลาดในการกู้คืน Mint: { error }",
      },
      restore_all_mints: {
        label: "กู้คืน Mints ทั้งหมด",
        in_progress: "กำลังกู้คืน Mint { index } จาก { length }…",
        success: "กู้คืนสำเร็จ",
        error: "ข้อผิดพลาดในการกู้คืน Mints: { error }",
      },
      restore_selected_mints: {
        label: "กู้คืน Mint ที่เลือก ({count})",
        in_progress: "กำลังกู้คืน Mint {index} จาก {length} ...",
        success: "กู้คืน {count} Mint(s) สำเร็จ",
        error: "ข้อผิดพลาดในการกู้คืน Mint ที่เลือก: {error}",
      },
    },
    nostr_mints: {
      label: "กู้คืน Mint จาก Nostr",
      caption:
        "ค้นหาการสำรองข้อมูล Mint ที่เก็บไว้ใน Nostr relays โดยใช้วลีสำหรับกู้คืนของคุณ สิ่งนี้จะช่วยให้คุณค้นพบ Mint ที่คุณเคยใช้มาก่อน",
      search_button: "ค้นหาการสำรองข้อมูล Mint",
      select_all: "เลือกทั้งหมด",
      deselect_all: "ไม่เลือกทั้งหมด",
      backed_up: "สำรองแล้ว",
      already_added: "เพิ่มแล้ว",
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
    add: {
      title: "เพิ่ม Mint",
      description:
        "ป้อน URL ของ Cashu mint เพื่อเชื่อมต่อ Wallet นี้ไม่มีส่วนเกี่ยวข้องกับ Mint ใดๆ",
      inputs: {
        nickname: {
          placeholder: "ชื่อเล่น (เช่น Testnet)",
        },
      },
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
      overline: "สำรวจ",
      caption: "สำรวจ Mints ที่ผู้ใช้คนอื่นแนะนำบน nostr",
      actions: {
        discover: {
          label: "สำรวจ Mints",
          in_progress: "กำลังโหลด…",
          error_no_mints: "ไม่พบ Mints",
          success: "พบ { length } Mints",
        },
      },
      recommendations: {
        overline: "พบ { length } Mints",
        caption:
          "Mints เหล่านี้ถูกแนะนำโดยผู้ใช้ Nostr คนอื่น ๆ โปรดใช้ความระมัดระวังและทำการวิจัยของคุณเองก่อนใช้ Mint",
        actions: {
          browse: {
            label: "คลิกเพื่อเรียกดู Mints",
          },
        },
      },
    },
    swap: {
      title: "แลกเปลี่ยน",
      overline: "การแลกเปลี่ยนระหว่าง Mints",
      caption:
        "แลกเปลี่ยนเงินระหว่าง Mints ผ่าน Lightning หมายเหตุ: เผื่อค่าธรรมเนียม Lightning ที่อาจเกิดขึ้น หากการชำระเงินขาเข้าไม่สำเร็จ ให้ตรวจสอบใบแจ้งหนี้ด้วยตนเอง",
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
    create_invoice_title: "สร้างใบแจ้งหนี้",
    inputs: {
      amount: {
        label: "จำนวน ({ ticker }) *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "สร้างใบแจ้งหนี้",
        label_blocked: "กำลังสร้างใบแจ้งหนี้…",
        in_progress: "กำลังสร้าง",
      },
    },
    invoice: {
      caption: "ใบแจ้งหนี้ Lightning",
      status_paid_text: "ชำระแล้ว!",
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
    title: "ส่ง Ecash",
    title_ecash_text: "Ecash",
    badge_offline_text: "ออฟไลน์",
    inputs: {
      amount: {
        label: "จำนวน ({ ticker }) *",
        invalid_too_much_error_text: "มากเกินไป",
      },
      p2pk_pubkey: {
        label: "คีย์สาธารณะของผู้รับ",
        label_invalid: "คีย์สาธารณะของผู้รับ",
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
        tooltip_text: "คัดลอก Emoji",
      },
      copy_tokens: {
        label: "@:global.actions.copy.label",
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
      },
      delete: {
        tooltip_text: "ลบออกจากประวัติ",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "แฟลชไปยังการ์ด NFC",
          ndef_unsupported_text: "ไม่รองรับ NDEF",
        },
      },
    },
  },
  ReceiveDialog: {
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
    title: "รับ Ecash",
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      scan: {
        label: "@:global.actions.scan.label",
      },
      request: {
        label: "ขอ",
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
    title: "รับ Ecash",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "วางโทเค็น Cashu",
      },
    },
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
        label_adding_mint: "กำลังเพิ่ม Mint…",
      },
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "แลกเปลี่ยนไปยัง Mint ที่เชื่อถือได้",
        caption: "แลกเปลี่ยน { value }",
      },
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "ยกเลิกการแลกเปลี่ยน",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      later: {
        label: "รับภายหลัง",
        tooltip_text: "เพิ่มไปยังประวัติเพื่อรับภายหลัง",
        already_in_history_success_text: "Ecash อยู่ในประวัติแล้ว",
        added_to_history_success_text: "เพิ่ม Ecash ในประวัติแล้ว",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "อ่านจากการ์ด NFC",
          ndef_unsupported_text: "ไม่รองรับ NDEF",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "คีย์ P2PK",
      description: "รับ ecash ที่ล็อกด้วยคีย์นี้",
      used_warning_text:
        "คำเตือน: คีย์นี้เคยถูกใช้มาก่อน ใช้คีย์ใหม่เพื่อความเป็นส่วนตัวที่ดีขึ้น",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_key: {
        label: "สร้างคีย์ใหม่",
      },
    },
  },
  PaymentRequestDialog: {
    payment_request: {
      caption: "คำขอชำระเงิน",
      description: "รับการชำระเงินผ่าน Nostr",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "คำขอใหม่",
      },
      add_amount: {
        label: "เพิ่มจำนวนเงิน",
      },
      use_active_mint: {
        label: "Mint ใดก็ได้",
      },
    },
    inputs: {
      amount: {
        placeholder: "ป้อนจำนวนเงิน",
      },
    },
  },
  NumericKeyboard: {
    actions: {
      close: {
        label: "@:global.actions.close.label",
        closed_info_text:
          "ปิดใช้งานแป้นพิมพ์แล้ว คุณสามารถเปิดใช้งานแป้นพิมพ์ได้อีกครั้งในการตั้งค่า",
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
    contact: {
      title: "ติดต่อ",
    },
    details: {
      title: "รายละเอียด Mint",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Nuts",
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
        label: "สกุลเงิน",
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
  },
  ChooseMint: {
    title: "เลือก Mint",
    badge_mint_error_text: "ข้อผิดพลาด",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
  },
  HistoryTable: {
    empty_text: "ยังไม่มีประวัติ",
    row: {
      type_label: "Ecash",
      date_label: "{ value } ที่ผ่านมา",
    },
    actions: {
      check_status: {
        tooltip_text: "ตรวจสอบสถานะ",
      },
      receive: {
        tooltip_text: "รับ",
      },
      filter_pending: {
        label: "กรองที่รอดำเนินการ",
      },
      show_all: {
        label: "แสดงทั้งหมด",
      },
    },
    old_token_not_found_error_text: "ไม่พบโทเค็นเก่า",
  },
  InvoiceTable: {
    empty_text: "ยังไม่มีใบแจ้งหนี้",
    row: {
      type_label: "Lightning",
      type_tooltip_text: "คลิกเพื่อคัดลอก",
      date_label: "{ value } ที่ผ่านมา",
    },
    actions: {
      check_status: {
        tooltip_text: "ตรวจสอบสถานะ",
      },
      filter_pending: {
        label: "กรองที่รอดำเนินการ",
      },
      show_all: {
        label: "แสดงทั้งหมด",
      },
    },
  },
  RemoveMintDialog: {
    title: "คุณแน่ใจหรือไม่ว่าต้องการลบ Mint นี้?",
    nickname: {
      label: "ชื่อเล่น",
    },
    balances: {
      label: "ยอดเงินคงเหลือ",
    },
    warning_text:
      "หมายเหตุ: เนื่องจาก Wallet นี้มีความระมัดระวังสูง ecash ของคุณจาก Mint นี้จะไม่ถูกลบจริง แต่จะยังคงเก็บไว้ในอุปกรณ์ของคุณ คุณจะเห็นมันปรากฏขึ้นอีกครั้งหากคุณเพิ่ม Mint นี้อีกครั้งในภายหลัง",
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
      description: "แตะเพื่อสแกนที่อยู่",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    input_data: {
      title: "ชำระเงิน Lightning",
      inputs: {
        invoice_data: {
          label: "ใบแจ้งหนี้หรือที่อยู่ Lightning",
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
      amount_exact_label: "{ payee } กำลังขอ { value } { ticker }",
      amount_range_label:
        "{ payee } กำลังขอ{br}ระหว่าง { min } และ { max } { ticker }",
      sending_to_lightning_address: "กำลังส่งไปยัง { address }",
      inputs: {
        amount: {
          label: "จำนวน ({ ticker }) *",
        },
        comment: {
          label: "ความคิดเห็น (ไม่บังคับ)",
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
      title: "ชำระเงิน { value }",
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
          error: "ข้อผิดพลาด",
        },
      },
    },
  },
  EditMintDialog: {
    title: "แก้ไข Mint",
    inputs: {
      nickname: {
        label: "ชื่อเล่น",
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
    title: "คุณเชื่อถือ Mint นี้หรือไม่?",
    description:
      "ก่อนที่จะใช้ Mint นี้ ตรวจสอบให้แน่ใจว่าคุณเชื่อถือได้ Mints อาจกลายเป็นอันตรายหรือหยุดดำเนินการได้ทุกเมื่อ",
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
        in_progress: "กำลังเพิ่ม Mint",
      },
    },
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
};
