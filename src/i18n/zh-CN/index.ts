export default {
  MultinutPicker: {
    dialog_title: "多 Mint 支付",
    pay_using_multiple: "使用多个 Mint 支付",
    experimental_title: "实验性功能",
    experimental_text:
      "此功能处于高度实验阶段，可能无法按预期工作。请勿尝试支付已支付过的发票，否则可能损失资金。",
    understand: "我已了解",
    select_funds: "从多个 Mint 选择资金以完成支付。",
    pay_invoice: "支付发票",
    amount_mismatch: "金额计算错误：{calculated}，应为 {expected}",
    states: {
      requesting: "请求中...",
      paying: "支付中...",
      success: "成功",
      failed: "失败",
    },
    payment: "多 Mint 支付",
    selectMints: "选择一个或多个 Mint 来发起支付。",
    totalSelectedBalance: "所选总余额",
    multiMintPay: "多 Mint 支付",
    balanceNotEnough: "多 Mint 余额不足以支付此发票",
    failed: "处理失败：{error}",
    paid: "通过闪电网络支付了 {amount}",
  },

  global: {
    copy_to_clipboard: {
      success: "已复制到剪贴板！",
    },
    actions: {
      add_mint: {
        label: "添加 Mint",
      },
      cancel: {
        label: "取消",
      },
      copy: {
        label: "复制",
      },
      close: {
        label: "关闭",
      },
      enter: {
        label: "输入",
      },
      lock: {
        label: "锁定",
      },
      paste: {
        label: "粘贴",
      },
      receive: {
        label: "接收",
      },
      show_seed: {
        label: "显示助记词",
      },
      hide_seed: {
        label: "隐藏助记词",
      },
      scan: {
        label: "扫描",
      },
      clear: {
        label: "清除",
      },
      send: {
        label: "发送",
      },
      swap: {
        label: "兑换",
      },
      update: {
        label: "更新",
      },
      pay: { label: "支付" },
    },
    inputs: {
      mint_url: {
        label: "Mint URL",
      },
    },
  },
  wallet: {
    notifications: {
      balance_too_low: "余额不足",
      received: "已收到 {amount}",
      fee: " (手续费: {fee})",
      could_not_request_mint: "无法请求铸造",
      invoice_still_pending: "发票仍在处理中",
      paid_lightning: "通过闪电网络支付了 {amount}",
      payment_pending_refresh: "付款正在处理。请手动刷新发票。",
      sent: "已发送 {amount}",
      token_still_pending: "代币仍在处理中",
      received_lightning: "通过闪电网络收到 {amount}",
      lightning_payment_failed: "闪电网络支付失败",
      failed_to_decode_invoice: "无法解码发票",

      invalid_lnurl: "无效的LNURL",
      lnurl_error: "LNURL错误",
      no_amount: "没有金额",
      no_lnurl_data: "没有LNURL数据",
      no_price_data: "没有价格数据。",
      please_try_again: "请重试。",
      trying_again: "正在重试...",
      unsupported_legacy_qr: "不支持的旧版二维码",
      legacy_qr_not_supported: "此旧版二维码并非来自受支持的商家",
      no_bolt12_mint: "您的 Mint 都不支持 BOLT12 Offer",
      no_bolt11_mint: "您的 Mint 都不支持 BOLT11 发票",
    },
    mint: {
      notifications: {
        already_added: "Mint 已添加",
        added: "Mint 已添加",
        not_found: "未找到 Mint",
        activation_failed: "Mint 激活失败",
        no_active_mint: "没有激活的 Mint",
        unit_activation_failed: "单位激活失败",
        unit_not_supported: "Mint 不支持该单位",
        activated: "Mint 已激活",
        could_not_connect: "无法连接到 Mint",
        could_not_get_info: "无法获取 Mint 信息",
        could_not_get_keys: "无法获取 Mint 密钥",
        could_not_get_keysets: "无法获取 Mint 密钥集",
        removed: "Mint 已移除",
        error: "Mint 错误",
        mint_validation_error: "Mint 验证错误",
      },
    },
  },
  MainHeader: {
    menu: {
      settings: {
        title: "设置",
        settings: {
          title: "设置",
          caption: "钱包配置",
        },
      },
      terms: {
        title: "条款",
        terms: {
          title: "条款",
          caption: "使用 Cashu.me 即表示您同意的内容",
        },
      },
      links: {
        title: "链接",
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
          title: "捐赠",
          caption: "支持 Cashu",
        },
      },
    },
    offline: {
      warning: {
        text: "离线",
      },
    },
    reload: {
      warning: {
        text: "在 { countdown } 后重新加载",
      },
    },
    staging: {
      warning: {
        text: "测试环境 – 请勿使用真实资金！",
      },
    },
  },
  FullscreenHeader: {
    actions: {
      back: {
        label: "钱包",
      },
    },
  },
  Settings: {
    menu: {
      groups: {
        wallet: "钱包",
        connections: "连接",
        preferences: "偏好设置",
        more: "更多",
      },
      title: "设置",
      backup: {
        title: "备份与恢复",
        caption: "助记词与 ecash 恢复",
      },
      lightning_address: {
        title: "闪电地址",
        caption: "通过 name@domain 收款",
      },
      nostr: {
        title: "Nostr",
        caption: "密钥、中继和信任网络",
      },
      payment_requests: {
        title: "付款请求",
        caption: "通过 Nostr 接收 ecash 付款",
      },
      nwc: {
        title: "Nostr 钱包连接",
        caption: "从其他应用程序使用您的钱包",
      },
      hardware: {
        title: "硬件",
        caption: "NFC 设置",
      },
      p2pk: {
        title: "锁定的 ecash",
        caption: "接收只有您的密钥才能解锁的 ecash",
      },
      privacy: {
        title: "隐私",
        caption: "网络检查与比特币价格",
      },
      experimental: {
        title: "实验性",
        caption: "抢先体验新功能",
      },
      appearance: {
        title: "外观",
        caption: "主题、键盘和比特币符号",
      },
      language: {
        title: "语言",
        caption: "选择您的语言",
      },
      advanced: {
        title: "高级",
        caption: "开发者工具与钱包重置",
      },
      about: {
        title: "关于",
        caption: "条款与链接",
      },
    },
    web_of_trust: {
      title: "信任网络",
      known_pubkeys: "已知公钥：{wotCount}",

      continue_crawl: "继续抓取",
      crawl_odell: "导入 Odell 的信任网络",
      crawl_wot: "抓取信任网络",
      pause: "暂停",
      reset: "重置",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      copy_lightning_address: "复制闪电地址",
    },
    multinut: {
      use_multinut: "多 Mint 支付",
    },
    language: {
      title: "语言",
      description: "请从下方列表中选择您的首选语言。",
    },
    sections: {
      backup_restore: "备份与恢复",
      lightning_address: "LIGHTNING 地址",
      nostr_keys: "NOSTR 密钥",
      nostr: {
        title: "NOSTR",
        relays: {
          already_added: "中继已添加",
          expand_label: "点击编辑中继",
          add: {
            title: "添加中继",
            description:
              "您的钱包使用这些中继来实现 Nostr 功能，例如付款请求、Nostr Wallet Connect 和备份。",
          },
          list: {
            title: "中继",
            description: "您的钱包将连接到这些中继。",
            copy_tooltip: "复制中继",
            remove_tooltip: "删除中继",
          },
        },
      },

      payment_requests: "支付请求",
      nostr_wallet_connect: "NOSTR 钱包连接",
      hardware_features: "硬件功能",
      p2pk_features: "P2PK 功能",
      privacy: "隐私",
      experimental: "实验性",
      appearance: "外观",
    },
    backup_restore: {
      backup_seed: {
        title: "备份种子短语",
        description: "您的种子短语可以恢复您的钱包。请务必妥善保管并保密。",
        seed_phrase_label: "种子短语",
      },
      restore_ecash: {
        title: "恢复 ecash",
        description: "从另一个种子短语恢复 ecash。您当前的种子短语保持不变。",
        button: "恢复",
      },
    },
    lightning_address: {
      server_url: {
        label: "npub.cash 主机名",
        hint: "输入主机名或 HTTPS URL",
        invalid: "请输入有效的 HTTPS 服务器 URL",
      },
      title: "Lightning 地址",
      description: "接收支付到您的 Lightning 地址。",
      enable: {
        toggle: "使用闪电地址",
        description: "通过 npub.cash 提供的地址收款",
      },
      address: {
        label: "你的地址",
        copy_tooltip: "复制 Lightning 地址",
      },
      show_on_receive: {
        toggle: "收款时显示",
        description: "显示地址和二维码。",
      },
      automatic_claim: {
        toggle: "自动认领",
        description: "自动接收收到的支付。",
      },
      mint: {
        label: "npub.cash Mint",
        choose_title: "为 npub.cash 选择 Mint",
        choose_placeholder: "选择一个 Mint…",
      },
    },
    nostr_keys: {
      title: "您的 Nostr 密钥",
      description: "您的 Nostr 密钥决定您的闪电地址。",
      wallet_seed: {
        title: "钱包种子短语",
        description: "从您的钱包种子生成 Nostr 密钥对",
        copy_nsec: "复制私钥",
      },
      nsec_bunker: {
        title: "远程签名器",
        description: "使用 NIP-46 bunker 签名",
        delete_tooltip: "删除连接",
      },
      use_nsec: {
        title: "使用您自己的私钥",
        description: "将您的 Nostr 私钥（nsec）粘贴到此钱包。不推荐。",
        delete_tooltip: "删除私钥",
      },
      signing_extension: {
        title: "签名扩展",
        description: "使用 NIP-07 签名扩展",
        not_found: "未找到 NIP-07 签名扩展",
      },
    },

    payment_requests: {
      title: "支付请求",
      description: "通过 Nostr 收款。开启后，您的钱包会监听您的 Nostr 中继。",
      enable_toggle: "启用付款请求",
      claim_automatically: {
        toggle: "自动认领",
        description:
          "无需确认，直接将收到的付款加入余额。关闭时，需要您逐笔领取。",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr 钱包连接 (NWC)",
      description: "允许其他应用通过 Nostr Wallet Connect 从此钱包付款。",
      enable_toggle: "启用 Nostr Wallet Connect",
      payments_note:
        "您只能使用 NWC 从您的比特币余额支付。支付将从您激活的 Mint 进行。",
      connection: {
        copy_tooltip: "复制连接字符串",
        qr_tooltip: "显示二维码",
        allowance_label: "剩余额度 (sat)",
      },
    },
    hardware_features: {
      webnfc: {
        title: "NFC 卡格式",
        description: "选择写入 NFC 卡的编码",
        text: {
          title: "文本",
          description: "以纯文本格式存储 token",
        },
        weburl: {
          title: "URL",
          description: "存储此钱包的 URL 和 token",
        },
        binary: {
          title: "二进制",
          description: "将 token 存储为二进制数据",
        },
        quick_access: {
          toggle: "NFC 快速访问",
          description: "在“接收 ecash”界面添加一个用于扫描卡片的 NFC 按钮。",
        },
      },
    },
    p2pk_features: {
      title: "锁定的 ecash",
      description:
        "实验性功能，请仅用于小额：如果您丢失了私钥，任何人都无法再解锁锁定到它的 ecash。",
      generate_button: "生成密钥",
      import_button: "导入私钥",
      quick_access: {
        toggle: "在“接收”中显示锁定密钥",
        description:
          "在“接收 ecash”界面显示您的锁定密钥，方便对方将 ecash 锁定给您。",
      },
      keys_expansion: {
        label: "点击浏览 {count} 个密钥",
        used_badge: "已使用",
      },
    },
    privacy: {
      title: "隐私",
      network_title: "网络检查",
      description: "这些设置会影响您的隐私。",
      check_incoming: {
        toggle: "检查收到的发票",
        description: "在后台检查您最新的发票。更新更快，但更容易被识别指纹。",
      },
      check_startup: {
        toggle: "启动时检查待处理发票",
        description: "打开钱包时检查待处理的发票。",
      },
      check_all: {
        toggle: "检查所有发票",
        description:
          "在后台检查未付款的发票，最长两周。在线活动越多，越容易被识别指纹。",
      },
      check_sent: {
        toggle: "检查已发送的 ecash",
        description:
          "在后台检查已发送的 ecash 是否已被领取。在线活动越多，越容易被识别指纹。",
      },
      websockets: {
        toggle: "使用 WebSockets",
        description:
          "与 Mint 保持实时连接，即时获取付款更新。更快，但更容易被识别指纹。",
      },
      bitcoin_price: {
        title: "比特币价格",
        toggle: "从 Coinbase 获取汇率",
        description: "从 coinbase.com 获取比特币价格，以法币显示您的余额。",
        currency: {
          title: "法定货币",
          description: "选择用于比特币价格显示的法定货币。",
        },
      },
    },
    experimental: {
      title: "实验性",
      description: "这些功能是实验性的。",
      receive_swaps: {
        toggle: "接收 swaps",
        badge: "测试版",
        description: "提供将收到的 ecash 兑换到您当前 Mint 的选项。",
      },
      auto_paste: {
        toggle: "自动粘贴 ecash",
        description:
          "打开“接收 ecash”时自动粘贴剪贴板中的 ecash。如果在 iOS 上出现显示问题，请关闭。",
      },
      auditor: {
        toggle: "启用审计器",
        badge: "测试版",
        description: "在 Mint 详情中显示第三方 Mint 审计服务提供的可靠性数据。",
        url_label: "审计器 URL",
        api_url_label: "审计器 API URL",
      },
      multinut: {
        toggle: "启用 Multinut",
        description: "同时从多个 Mint 支付发票。",
      },
      nostr_mint_backup: {
        toggle: "将 Mint 列表备份到 Nostr",
        description:
          "将您的 Mint 列表备份到您的 Nostr 中继，以便在其他设备上恢复。",
        notifications: {
          enabled: "Nostr Mint 备份已启用",
          disabled: "Nostr Mint 备份已禁用",
          failed: "无法启用 Nostr Mint 备份",
        },
      },
    },
    appearance: {
      mode: {
        title: "模式",
        dark: "深色",
        light: "浅色",
      },
      keyboard: {
        title: "屏幕键盘",
        description: "使用数字键盘输入金额。",
        toggle: "使用数字键盘",
        toggle_description: "使用数字键盘输入金额。",
      },
      theme: {
        title: "主题",
        description: "更改您钱包的外观。",
        tooltips: {
          mono: "单色",
          cyber: "赛博",
          freedom: "自由",
          nostr: "Nostr",
          bitcoin: "比特币",
          mint: "薄荷",
          nut: "坚果",
          blu: "蓝色",
          flamingo: "火烈鸟",
        },
      },
      bip177: {
        title: "比特币符号",
        description: "将金额显示为 ₿2,789，而不是 2,789 sats。",
        toggle: "使用 ₿ 符号",
      },
    },
    advanced: {
      backup_files_title: "备份文件",
      danger_zone_title: "危险操作",
      notifications: {
        reserved_unset: "已取消所有预留证明",
        removed_spent: "已移除 {count} 个已花费证明",
        no_spent: "未发现已花费证明",
        invalid_backup: "备份文件格式无效",
        read_error: "读取文件出错",
      },
      title: "高级",
      developer: {
        title: "开发者设置",
        description: "用于故障排查和调试的工具。",
        new_seed: {
          button: "生成新的种子短语",
          description:
            "创建新的种子短语。之后请把余额发送给自己，以便新种子短语可以恢复它。",
          confirm_question: "您确定要生成新的种子短语吗？",
          cancel: "取消",
          confirm: "确认",
        },
        remove_spent: {
          button: "删除已花费的证明",
          description:
            "移除您当前 Mint 报告为已花费的 ecash。仅在钱包卡住时使用。",
        },
        design_system: {
          title: "设计系统",
          description: "应用的每个组件，实时呈现，附带源码与用法。",
        },
        debug_console: {
          button: "调试控制台",
          description:
            "打开 JavaScript 控制台。切勿粘贴您不理解的代码，骗子会借此盗取资金。",
        },
        export_proofs: {
          button: "导出活动证明",
          description: "将当前 Mint 中所选单位的余额复制为一个 ecash token。",
        },
        keyset_counters: {
          title: "增加 keyset 计数器",
          increase: "增加 {id} 的计数器",
          fixes: "修复“outputs have already been signed”",
          keysets: "{n} 个密钥集 | {n} 个密钥集",
          sheet_hint: "点按 + 可增加密钥集的计数器。",
          column: "计数器",
        },
        unset_reserved: {
          button: "取消所有保留的 token",
          description:
            "释放为待处理发送而保留的 ecash，使其可以再次使用。之后请运行“删除已花费的证明”。",
        },
        show_onboarding: {
          button: "显示入门指南",
          description: "再次显示入门指南屏幕。",
        },
        reset_wallet: {
          button: "重置钱包数据",
          description: "删除此设备上的所有钱包数据。请先导出备份。",
          confirm_question: "您确定要删除您的钱包数据吗？",
          cancel: "取消",
          confirm: "删除钱包",
        },
        export_wallet: {
          button: "导出钱包数据",
          description:
            "下载一个备份文件，可在欢迎界面导入。继续使用钱包后，该文件会过时。",
        },
        import_wallet: {
          description: "用导出的备份文件替换此钱包的数据。",
          button: "导入钱包备份",
          confirm_question: "确定要恢复您的钱包数据吗？",
          cancel: "取消",
          confirm: "导入钱包备份",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "添加 Mint",
    subtitle:
      "Mint 负责发行此钱包持有的 ecash。添加一个 Mint，或从某个 Mint 接收 ecash，即可开始。",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "接收 ecash",
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
      expand: "显示历史记录和 Mint",
      collapse: "隐藏历史记录和 Mint",
    },
    tabs: {
      history: {
        label: "历史记录",
      },
      invoices: {
        label: "发票",
      },
      mints: {
        label: "Mint",
      },
    },
    install: {
      text: "安装",
      tooltip: "安装 Cashu",
    },
  },
  AlreadyRunning: {
    title: "Cashu.me 已在另一个标签页中打开",
    text: "请关闭另一个标签页，然后点击“重试”。",
    actions: {
      retry: {
        label: "重试",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "此页面不存在",
    actions: {
      home: {
        label: "返回主页",
      },
    },
  },
  BalanceView: {
    total_label: "总余额",
    show_balance: "显示 {unit} 余额",
    mintUrl: {
      label: "Mint",
    },
    mintBalance: {
      label: "余额",
    },
    mintError: {
      label: "Mint 错误",
    },
    pending: {
      label: "待处理",
      tooltip: "检查所有待处理的 token",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "上一步",
      },
      next: {
        label: "下一步",
      },
    },
  },
  WelcomeSlide1: {
    terms_agreement: "继续即表示您同意{terms}",
    title: "欢迎使用 Cashu.me",
    text: "Cashu.me 是一款免费且开源的比特币钱包，使用 ecash 确保您的资金安全和隐私。",
    actions: {
      more: {
        label: "点击了解更多",
      },
    },
    p1: {
      text: "Cashu 是一个免费且开源的比特币 ecash 协议。您可以在 { link } 了解更多。",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "此钱包不隶属于任何 Mint。要使用此钱包，您需要连接到一个或多个您信任的 Cashu Mint。",
    },
    p3: {
      text: "此钱包存储只有您才能访问的 ecash。如果您在没有种子短语备份的情况下删除您的浏览器数据，您将丢失您的 token。",
    },
    p4: {
      text: "此钱包处于测试阶段。我们对用户丢失资金概不负责。使用风险自负！此代码是开源的，并在 MIT 许可证下获得许可。",
    },
  },
  WelcomeSlide2: {
    title: "安装 Cashu.me",
    alt: { pwa_example: "PWA 安装示例" },
    installing: "正在安装…",
    instruction: {
      intro: {
        text: "为了获得最佳体验，请使用您设备的本地网络浏览器将此钱包安装为渐进式 Web 应用程序。请立即执行此操作。",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "点击菜单（右上角）",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "按{ buttonText }",
          buttonText: "@:PwaPrompt.android.add",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "点击分享（底部）",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "按{ buttonText }",
          buttonText: "@:PwaPrompt.ios.add",
        },
      },
      outro: {
        text: "安装完成后，关闭此浏览器标签页，从主屏幕打开 Cashu.me。",
      },
    },
    pwa: {
      success: {
        title: "成功！",
        text: "您正在使用 Cashu 作为 PWA。关闭所有其他打开的浏览器窗口，并从主屏幕使用该应用。",
        nextSteps: "您现在可以关闭此标签页，并从主屏幕打开应用。",
      },
    },
  },
  PwaPrompt: {
    title: "安装 Cashu",
    text: "从主屏幕打开，不显示浏览器地址栏。",
    ios: {
      share: "点击“共享”",
      add: "添加到主屏幕",
    },
    android: {
      menu: "打开浏览器菜单",
      add: "添加到主屏幕",
    },
    install: "安装",
    notNow: "以后再说",
  },
  WelcomeSlide3: {
    title: "您的种子短语",
    text: "将您的种子短语存储在密码管理器或纸上。如果您的设备丢失，您的种子短语是恢复资金的唯一途径。",
    inputs: {
      seed_phrase: {
        label: "种子短语",
        caption: "您可以在设置中查看您的种子短语。",
      },
      checkbox: {
        label: "我已经写下来了",
      },
    },
  },
  WelcomeSlide4: {
    english_only: "法律文本仅提供英文版本。",
    title: "服务条款",
    actions: {
      more: {
        label: "使用 Cashu.me 前请阅读",
      },
    },
    inputs: {
      checkbox: {
        label: "我已阅读并接受这些条款和条件",
      },
    },
  },
  WelcomeSlideChoice: {
    title: "设置您的钱包",
    text: "您想从种子短语恢复，还是创建一个新钱包？",
    options: {
      new: {
        title: "创建新钱包",
        subtitle: "生成新的种子并添加 Mint。",
      },
      recover: {
        title: "恢复钱包",
        subtitle: "输入您的种子短语，恢复 Mint 和 ecash。",
      },
    },
  },
  WelcomeMintSetup: {
    title: "添加 Mint",
    text: "Mint 是帮助您发送和接收 ecash 的服务器。选择一个已发现的 Mint 或手动添加。您也可以稍后添加。",
    sections: { your_mints: "您的 Mint" },
    restoring: "正在恢复 Mint…",
    placeholder: { mint_url: "https://" },
  },
  WelcomeRecoverSeed: {
    title: "输入您的种子短语",
    text: "粘贴或输入您的 12 个词种子短语以进行恢复。",
    inputs: { word: "第 { index } 个词" },
    actions: { paste_all: "全部粘贴" },
    disclaimer: "您的种子短语仅在本地使用，用于派生您的钱包密钥。",
  },
  WelcomeRestoreEcash: {
    title: "恢复您的 ecash",
    text: "扫描您配置的 Mint 上未花费的证明，并将其添加到您的钱包。",
  },
  MintRatings: {
    sort_and_filter: "排序和筛选",
    reviews_title: "评价",
    reviews_count: "{n} 条评价 | {n} 条评价",
    web_of_trust_caption: "只统计你信任网络中的人的评价",
    web_of_trust_hop: "在您的信任网络中（第 {hop} 跳）",
    no_mint_url: "未提供 Mint URL",
    title: "Mint 评价",
    reviews: "条评价",
    ratings: "{n} 个评分",
    no_reviews: "暂无评价",
    your_review: "您的评价",
    no_reviews_to_display: "暂无可显示的评价。",
    no_rating: "暂无评分",
    stars_label: "{rating} / 5 星",
    out_of: "共",
    rows: "Reviews",
    sort: "排序",
    sort_options: {
      newest: "最新",
      oldest: "最旧",
      highest: "最高",
      lowest: "最低",
    },
    actions: { write_review: "撰写评价" },
    empty_state_subtitle:
      "成为第一个评价此 Mint 的人。您的体验能帮助他人做出选择。",
    range: "第 {from}–{to} 条，共 {total} 条",
  },
  CreateMintReview: {
    connect_nostr: "请在设置中连接 Nostr 账户以发布评价。",
    published: "评价已发布",
    publish_failed: "评价发布失败",
    title: "评价 Mint",
    publishing_as: "发布身份",
    inputs: {
      rating: { label: "评分", hint: "选择评分后即可发布评价。" },
      review: { label: "评价（可选）" },
    },
    actions: {
      publish: { label: "发布评价", in_progress: "正在发布…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "从种子短语恢复",
      caption: "恢复前，请先添加您用此种子短语使用过的所有 Mint。",
      inputs: {
        seed_phrase: {
          label: "种子短语",
          caption: "您可以在设置中查看您的种子短语。",
        },
      },
    },
    information: {
      label: "信息",
      caption:
        "该向导仅从另一个种子短语恢复 ecash，您将无法使用此种子短语或更改您当前使用的钱包的种子短语。这意味着，除非您将 ecash 发送给自己一次，否则恢复的 ecash 将不会受到您当前种子短语的保护。",
    },
    restore_mints: {
      label: "恢复 Mint",
      caption: "选择要恢复的 Mint。请先在 Mint 标签页中添加缺少的 Mint。",
    },
    nostr_mints: {
      label: "从 Nostr 恢复 Mint",
      caption:
        "使用您的种子短语在 Nostr 中继上搜索存储的 Mint 备份。这将帮助您发现以前使用过的 Mint。",
      search_button: "搜索 Mint 备份",
      select_all: "全选",
      deselect_all: "取消全选",
      backed_up: "已备份",
      already_added: "已添加",
      add_selected: "添加所选 ({count})",
      no_backups_found: "未找到 Mint 备份",
      no_backups_hint:
        "请确保在设置中启用 Nostr Mint 备份以自动备份您的 Mint 列表。",
      invalid_mnemonic: "请在搜索前输入有效的种子短语。",
      search_error: "搜索 Mint 备份失败。",
      add_error: "添加所选 Mint 失败。",
    },
    actions: {
      paste: {
        error: "读取剪贴板内容失败。",
      },
      validate: {
        error: "助记符应至少包含 12 个词。",
      },
      select_all: {
        label: "全选",
      },
      deselect_all: {
        label: "取消全选",
      },
      restore: {
        label: "恢复",
        in_progress: "正在恢复 Mint…",
        error: "恢复 Mint 错误: { error }",
      },
      restore_all_mints: {
        label: "恢复所有 Mint",
        in_progress: "正在恢复第 { index } 个 Mint，共 { length } 个…",
        success: "恢复成功",
        error: "恢复 Mint 错误: { error }",
      },
      restore_selected_mints: {
        label: "恢复所选 Mint（{count}）",
        in_progress: "正在恢复第 { index } 个 Mint，共 { length } 个…",
        success: "成功恢复 {count} 个 Mint",
        error: "恢复所选 Mint 错误: { error }",
      },
    },
  },
  MintSettings: {
    see_reviews: "查看评价",
    add: {
      title: "添加 Mint",
      description: "输入 Cashu Mint 的 URL 以连接。此钱包不隶属于任何 Mint。",
      inputs: {
        nickname: {
          placeholder: "昵称（例如 Testnet）",
        },
      },
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "无效的 URL",
        },
        scan: {
          label: "扫描二维码",
        },
      },
    },
    discover: {
      title: "发现 Mint",
      overline: "发现",
      caption: "其他人在 Nostr 上推荐的 Mint。",
      actions: {
        discover: {
          label: "发现 Mint",
          in_progress: "正在加载…",
          error_no_mints: "未找到 Mint",
          success: "找到 { length } 个 Mint",
        },
      },
      add: "添加",
      unnamed: "未命名 Mint",
      empty: {
        title: "查找 Mint",
        text: "Cashu.me 会向 Nostr 中继查询其他人推荐的 Mint，以及它们的评分和评价。",
      },
      recommendations: {
        overline: "找到 { length } 个 Mint",
        caption: "使用 Mint 前请自行调查。",
        actions: {
          browse: {
            label: "点击浏览 Mint",
          },
        },
      },
    },
    swap: {
      title: "兑换",
      overline: "多 Mint 兑换",
      caption: "通过闪电网络在您的 Mint 之间转移资金。可能产生费用。",
      inputs: {
        from: {
          label: "从",
        },
        to: {
          label: "到",
        },
        amount: {
          label: "金额（{ ticker }）",
        },
      },
      actions: {
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
        receove_to_trusted_mint: { label: "接收到受信任的 Mint" },
      },
    },
    error_badge: "错误",
    active_badge: "当前",
    reviews_text: "条评价",
    no_reviews_yet: "暂无评论",
    discover_mints_button: "发现 Mint",
  },
  QrcodeReader: {
    progress: {
      text: "{ percentage }{ addon }",
      percentage: "{ percentage }%",
      keep_scanning_text: " - 继续扫描",
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
    title: "接收 Lightning",
    create_invoice_title: "创建发票",
    inputs: {
      amount: {
        label: "金额（{ ticker }） *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "创建发票",
        label_blocked: "正在创建发票",
        in_progress: "正在创建",
      },
    },
    invoice: {
      caption: "Lightning 发票",
      status_paid_text: "已付款",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        copy: {
          label: "复制发票",
        },
      },
    },
  },
  SendDialog: {
    captions: {
      ecash: "分享代币或二维码",
      lightning: "支付发票或地址",
      onchain: "发送到比特币地址",
    },
    title: "发送",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "没有可用的 Mint",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "没有可用的 Mint",
      },
    },
  },
  SendTokenDialog: {
    badge_locked: "已锁定",
    title: "发送 ecash",
    title_ecash_text: "Ecash",
    badge_offline_text: "离线",
    inputs: {
      amount: {
        label: "金额（{ ticker }） *",
        invalid_too_much_error_text: "太多了",
      },
      p2pk_pubkey: {
        label: "接收者公钥",
        label_invalid: "接收者公钥",
        invalid: "请输入有效的公钥（hex 或 npub）",
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
        tooltip_text: "复制表情符号",
      },
      copy_tokens: {
        label: "复制 ecash",
      },
      copy_link: {
        tooltip_text: "复制链接",
      },
      share: {
        tooltip_text: "分享ecash代币",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      paste_p2pk_pubkey: {
        tooltip_text: "@:global.actions.paste.label",
      },
      send: {
        label: "@:global.actions.send.label",
        in_progress: "正在发送…",
      },
      delete: {
        tooltip_text: "从历史记录中删除",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "写入 NFC 卡",
          ndef_unsupported_text: "不支持 NDEF",
        },
      },
      pay: { label: "@:global.actions.pay.label" },
    },
    errors: {
      amount_required: "请先输入金额。",
      serialization_failed: "无法准备 ecash token。",
      mint_not_allowed_by_request: "此付款请求不接受所选的 Mint。",
    },
  },
  ReceiveDialog: {
    captions: {
      ecash: "粘贴、扫描或请求代币",
      lightning: "创建发票以收款",
      onchain: "获取比特币地址",
    },
    title: "接收",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "没有可用的 Mint",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "您需要连接到 Mint 才能通过 Lightning 接收",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "接收 ecash",
    actions: {
      paste: {
        label: "粘贴代币",
      },
      scan: {
        label: "扫描代币",
      },
      request: {
        label: "请求 ecash",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      nfc: {
        label: "NFC",
        scanning_text: "正在扫描…",
      },
    },
  },
  ReceiveTokenDialog: {
    receiving_amount: "正在接收 {amount}",
    title: "接收 ecash",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "粘贴 Cashu token",
      },
    },
    errors: {
      invalid_token: {
        label: "无效的 token",
      },
      p2pk_lock_mismatch: {
        label: "无法接收。此令牌的P2PK锁定与您的公钥不匹配。",
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
        label_adding_mint: "正在添加 Mint…",
      },
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "兑换到信任的 Mint",
        caption: "兑换 { value }",
        processing: "正在兑换…",
        failed: "兑换失败",
      },
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "取消兑换",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      later: {
        label: "稍后接收",
        tooltip_text: "添加到历史记录，稍后接收",
        already_in_history_success_text: "ecash 已在历史记录中",
        added_to_history_success_text: "ecash 已添加到历史记录",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "从 NFC 卡读取",
          ndef_unsupported_text: "不支持 NDEF",
        },
      },
      receive_to_selected_mint: { label: "接收到所选 Mint" },
    },
    unknown_mint_info_text: "未知的 Mint。接收此 token 后会自动添加。",
    swap_section: {
      title: "兑换",
      source_label: "从",
      destination_label: "到",
      fee_info: "此次兑换会产生闪电网络费用。",
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "锁定密钥",
      description: "接收此密钥锁定的 ecash",
      used_warning_text:
        "警告：此密钥已被使用过。请使用新密钥以获得更好的隐私。",
    },
    actions: {
      copy: {
        label: "复制公钥",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_key: {
        label: "生成新密钥",
      },
    },
  },
  PaymentRequestDialog: {
    any_amount: "任意金额",
    payment_request: {
      caption: "付款请求",
      description: "通过 Nostr 接收支付",
    },
    request_index: "第 {index} 个，共 {total} 个请求",
    actions: {
      set_amount: {
        label: "设置金额",
      },
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "新请求",
      },
      share: {
        label: "分享",
      },
      copy_request: {
        label: "复制请求",
      },
      add_amount: {
        label: "添加金额",
      },
      use_active_mint: {
        label: "任何 Mint",
      },
      remove_amount: {
        label: "移除金额",
      },
      previous: {
        label: "上一个请求",
      },
      next: {
        label: "下一个请求",
      },
    },
    inputs: {
      amount: {
        placeholder: "输入金额",
      },
    },
    received_total: "已收到总额",
    no_payments_yet: "暂无付款",
  },
  NumericKeyboard: {
    actions: {
      close: {
        label: "@:global.actions.close.label",
        closed_info_text: "键盘已禁用。您可以在设置中重新启用键盘。",
      },
      enter: {
        label: "@:global.actions.enter.label",
      },
    },
  },
  NWCDialog: {
    nwc: {
      caption: "Nostr 钱包连接",
      description:
        "使用 NWC 远程控制您的钱包。按下二维码将您的钱包与兼容的应用程序链接。",
      warning_text:
        "警告：任何有权访问此连接字符串的人都可以从您的钱包发起支付。请勿分享！",
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
    title: "Mint 消息",
  },
  MintDetailsDialog: {
    qr: {
      show: "显示二维码",
      hide: "隐藏二维码",
    },
    contact: {
      title: "联系",
    },
    details: {
      title: "Mint 详情",
      url: {
        label: "URL",
      },
      nuts: {
        label: "支持的功能",
        actions: {
          show: {
            label: "显示全部",
          },
          hide: {
            label: "隐藏",
          },
        },
      },
      currency: {
        label: "单位",
      },
      currencies: {
        label: "@:MintDetailsDialog.details.currency.label",
      },
      version: {
        label: "版本",
      },
    },
    actions: {
      title: "操作",
      copy_mint_url: {
        label: "复制 Mint URL",
      },
      delete: {
        label: "删除 Mint",
      },
      edit: {
        label: "编辑 Mint",
      },
    },
  },
  ChooseMint: {
    title: "选择 Mint",
    badge_mint_error_text: "错误",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
    available_text: "在此 Mint 中",
    sheet_title: "选择 Mint",
    placeholder: "选择一个 Mint",
  },
  HistoryTable: {
    empty_text: "暂无历史记录",
    empty_hint: "你发送和收到的付款会显示在这里。",
    row: {
      type_label: "Ecash",
      date_label: "{ value } 前",
    },
    actions: {
      filter_ecash_only: {
        label: "仅 ecash",
      },
      check_status: {
        tooltip_text: "检查状态",
      },
      receive: {
        tooltip_text: "接收",
      },
      filter_pending: {
        label: "仅显示待处理",
      },
      show_all: {
        label: "显示全部",
      },
    },
    old_token_not_found_error_text: "未找到旧 token",
  },
  InvoiceTable: {
    empty_text: "暂无发票",
    row: {
      type_label: "Lightning",
      type_tooltip_text: "点击复制",
      date_label: "{ value } 前",
    },
    actions: {
      check_status: {
        tooltip_text: "检查状态",
      },
      filter_pending: {
        label: "仅显示待处理",
      },
      show_all: {
        label: "显示全部",
      },
    },
  },
  RemoveMintDialog: {
    title: "移除此 Mint？",
    nickname: {
      label: "昵称",
    },
    balances: {
      label: "在此 Mint 中的余额",
    },
    warning_text:
      "您在此 Mint 的 ecash 会保留在本设备上。如果再次添加该 Mint，它会重新出现。",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "移除 Mint",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  ParseInputComponent: {
    placeholder: {
      default: "Cashu token 或闪电地址",
      receive: "Cashu token",
      pay: "闪电地址或发票",
    },
    qr_scanner: {
      title: "扫描二维码",
      description: "将相机对准二维码",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    onchain: {
      title: "链上支付",
      address_placeholder: "比特币地址",
      choose_speed: "选择确认速度",
      blocks: "{n} 个区块",
      estimated_confirmation: "预计确认",
      fee_reserve: "预留手续费",
    },
    multinut: {
      label: "使用多个 Mint 支付",
    },
    quote: {
      label: "报价",
    },
    input_data: {
      title: "用闪电支付",
      inputs: {
        invoice_data: {
          label: "Lightning 发票或地址",
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
      title_bolt12: "支付闪电 Offer",
    },
    lnurlpay: {
      amount_exact_label: "{ payee } 请求 { value } { ticker }",
      amount_range_label:
        "{ payee } 请求{br}介于 { min } 和 { max } { ticker } 之间",
      sending_to_lightning_address: "发送至 { address }",
      inputs: {
        amount: {
          label: "金额（{ ticker }） *",
        },
        comment: {
          label: "评论 (可选)",
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
      title: "支付 { value }",
      paying: "支付中",
      paid: "已支付",
      fee: "费用",
      memo: {
        label: "备忘录",
      },
      processing_info_text: "正在处理…",
      balance_too_low_warning_text: "余额不足",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        pay: {
          label: "支付",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
          waiting_for_wallet: "正在等待钱包…",
          error: "错误",
        },
      },
    },
  },
  EditMintDialog: {
    title: "编辑 Mint",
    inputs: {
      nickname: {
        placeholder: "例如 Testnet",
        label: "昵称（可选）",
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
    title: "您信任此 Mint 吗？",
    description:
      "仅在您信任此 Mint 时加入。如果它停止运营，您在其中持有的 ecash 将会丢失。",
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
        in_progress: "正在添加 Mint",
      },
    },
    audit_info: {
      label: "审计信息",
      actions: {
        show: {
          label: "显示",
        },
        hide: {
          label: "隐藏",
        },
      },
    },
    unreachable_error_text: "无法连接此 Mint。请检查网址和网络连接，然后重试。",
  },
  restore: {
    mnemonic_error_text: "请输入助记符",
    restore_mint_error_text: "恢复 Mint 错误: { error }",
    prepare_info_text: "正在准备恢复流程…",
    restored_proofs_for_keyset_info_text:
      "已为 keyset { keysetId } 恢复 { restoreCounter } 个证明",
    checking_proofs_for_keyset_info_text:
      "正在检查 keyset { keysetId } 的证明 { startIndex } 到 { endIndex }",
    no_proofs_info_text: "未找到要恢复的证明",
    restored_amount_success_text: "已恢复 { amount }",
  },
  swap: {
    in_progress_warning_text: "兑换进行中",
    invalid_swap_data_error_text: "无效的兑换数据",
    swap_error_text: "兑换错误",
  },
  TokenInformation: {
    fee: "费用",
    unit: "单位",
    fiat: "法币",
    p2pk: "P2PK",
    locked: "已锁定",
    locked_to_you: "已锁定给您",
    mint: "Mint",
    memo: "备注",
    payment_request: "支付请求",
    nostr: "Nostr",
    token_copied: "令牌已复制到剪贴板",
  },
  ActivityRow: {
    received: "已收到",
    sent: "已发送",
    receiving: "接收中",
    sending: "发送中",
  },
  common: {
    copied: "已复制",
    on_chain: "链上",
    pending: "待处理",
    delete: "删除",
    copy_npub: "复制 npub",
    back: "返回",
    refresh: "刷新",
    settings: "设置",
    backspace: "退格",
    swap_input_mode: "切换金额/法币输入",
    fee: "费用",
  },
  SendPaymentRequest: {
    actions: {
      pay: { label: "支付" },
      pay_via: { label: "通过 {transport} 支付" },
    },
    info: {
      pay_failed: "无法支付请求",
      pay_to: "支付给 {target}",
      invalid_url: "无效的网址",
    },
  },
  PaymentRequestInfo: {
    title_with_transport: "通过 {transport} 的付款请求",
    title: "付款请求",
    subtitle: "支付给 {target}",
    subtitle_fallback: "付款请求",
    invalid_url: "无效的网址",
  },
  QuoteInformation: {
    address: "地址",
    amount: "金额",
    fee_reserve: "预留手续费",
    fee_paid: "已付手续费",
    unit: "单位",
    status: "状态",
    network: "网络",
    transaction_id: "交易 ID",
    chain_status: "链上状态",
    fetching: "获取中",
    paid_at: "支付时间",
    preimage: "原像",
    preimage_copied: "原像已复制",
    mint: "Mint",
    method: "方式",
    lightning_offer: "Lightning Offer",
    chain_confirmed: "已确认",
    chain_pending: "待确认",
    states: {
      waiting: "等待付款",
      paid: "已付款",
      unpaid: "未付款",
      pending: "待处理",
      issued: "已发行",
      expired: "已过期",
      failed: "失败",
    },
  },
  MintAuditInfo: {
    title: "审计信息",
    loading: "正在加载审计信息...",
    not_audited: "此 Mint 尚未经过审计。",
    not_audited_text:
      "如需了解审计方或支持未来的审计，请访问 {link}，或点击{here}捐赠 ecash，帮助启动对此 Mint 的审计。",
    here: "这里",
    unavailable: "审计信息暂时不可用。",
    load_failed: "无法加载 Mint 数据",
    success_rate: "成功率",
    swaps_count: "{total} 次兑换中的 {successful} 次",
    average_time: "平均时间",
    average_time_caption: "成功兑换的平均值",
    disclaimer:
      "审计数据由独立第三方提供，用于帮助评估 Mint 长期的可靠性。但这些结果仅供参考，不保证任何 Mint 的安全性、偿付能力或可信度。使用其服务前，请务必自行研究，并确保您信任该 Mint 的运营者。",
    donate_text:
      "审计信息由 {link} 提供。审计方目前为此 Mint 持有的余额为 {balance}，迄今累计捐赠 {donations}。如需支持持续审计，您可以{press_here}向审计方捐赠 ecash。",
    press_here: "点击这里",
    sats_amount: "{amount} sats",
    warnings_title: "审计警告",
    warnings: {
      last_swap_failed: "最近一次兑换尝试失败。",
      recent_success:
        "过去 {days} 天内 {total} 次兑换中有 {successful} 次成功。",
      reliable:
        "{base} 不过，{success}此 Mint 看起来可靠，失败可能是接收方 Mint 导致的。",
      unreliable: "{base} 仅 {success}此 Mint 可能不可靠。",
      unknown: "审计方尚无法确定此 Mint 的质量。",
      not_enough_data:
        "审计方没有此 Mint 足够的近期数据。过去 {days} 天内仅有 {count} 次成功兑换。",
      low_success:
        "过去 {days} 天内，此 Mint 的成功率为 {rate}%，低于建议的 {threshold}%。",
      inactive: "此 Mint 已有 {days} 天没有兑换记录，可能无法访问。",
      slow: "此 Mint 速度较慢，来自此 Mint 的支付平均耗时 {seconds} 秒。",
      no_successful: "此 Mint 没有成功兑换的记录，可能无法访问。",
    },
    chart: {
      now: "现在",
      today: "今天",
      yesterday: "昨天",
      invalid_date: "无效日期",
      swaps: "兑换次数：",
      success_rate: "成功率：",
      time_range: "时间范围：",
    },
  },
  DisplayTokenComponent: {
    title: {
      send: "发送 ecash",
      sent: "已发送 ecash",
      received: "已收到 ecash",
    },
    qr_speed: "QR 速度：{value}",
    qr_density: "QR 密度：{value}",
    speed: {
      fast: "快",
      medium: "中",
      slow: "慢",
    },
    density: {
      high: "高",
      medium: "中",
      low: "低",
    },
    delete_dialog: {
      title: "删除 ecash",
      text: "确定要从历史记录中删除此交易吗？",
      warning: "警告：此操作无法撤销，且无法恢复该 token。",
    },
    nfc: {
      read_failed: "NFC 读取失败",
      write_failed: "NFC 写入失败",
      error: "NFC 错误",
      writing: "正在写入 NFC 卡...",
      success: "已成功将 token 写入卡片！",
      capacity: "卡片容量可能不足（需要 {bytes} 字节）。",
    },
  },
  CreateInvoiceDialog: {
    format_label: "请求类型",
    formats: {
      bolt11: "发票",
      bolt12: "要约",
    },
    onchain_title: "链上接收",
    bolt12_title: "接收 Bolt12",
    mint_unreachable: "无法连接 Mint",
    mint_unreachable_text: "请重新连接 Mint 以接收付款。",
    reconnect_mint: "重新连接 Mint",
    checking_address: "正在检查地址...",
    add_amount: "添加金额",
    new_offer: "新建 Offer",
    create_offer: "创建 Offer",
    create_new_address: "创建新地址",
    create_address: "创建地址",
    onchain_unsupported: "此 Mint 不支持以该单位进行链上充值。",
    deposit_limits: {
      outside: "超出 {min}–{max} 范围的充值不会入账。",
      below: "低于 {min} 的充值不会入账。",
      above: "高于 {max} 的充值不会入账。",
    },
    amount_errors: {
      positive_decimal: "请输入以 {unit} 计、最多两位小数的正数金额。",
      positive_whole: "请输入以 {unit} 计的正整数金额。",
      min: "请输入至少 {amount}。",
      max: "请输入不超过 {amount}。",
    },
  },
};
