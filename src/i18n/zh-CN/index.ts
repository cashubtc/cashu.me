export default {
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
      scan: {
        label: "扫描",
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
          caption: "服务条款",
        },
      },
      links: {
        title: "链接",
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
    language: {
      title: "语言",
      description: "请从下方列表中选择您的首选语言。",
    },
    sections: {
      backup_restore: "备份与恢复",
      lightning_address: "LIGHTNING 地址",
      nostr_keys: "NOSTR 密钥",
      nostr: "NOSTR",
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
        description:
          "恢复向导允许您从助记符种子短语中恢复丢失的 ecash。您当前钱包的种子短语不会受到影响，该向导仅允许您从另一个种子短语中 恢复 ecash。",
        button: "恢复",
      },
    },
    lightning_address: {
      title: "Lightning 地址",
      description: "接收支付到您的 Lightning 地址。",
      enable: {
        toggle: "启用",
        description: "带有 npub.cash 的 Lightning 地址",
      },
      address: {
        copy_tooltip: "复制 Lightning 地址",
      },
      automatic_claim: {
        toggle: "自动认领",
        description: "自动接收收到的支付。",
      },
    },
    nostr_keys: {
      title: "您的 Nostr 密钥",
      description: "为您的 Lightning 地址设置 Nostr 密钥。",
      wallet_seed: {
        title: "钱包种子短语",
        description: "从钱包种子生成 Nostr 密钥对",
        copy_nsec: "复制 nsec",
      },
      nsec_bunker: {
        title: "Nsec Bunker",
        description: "使用 NIP-46 bunker",
        delete_tooltip: "删除连接",
      },
      use_nsec: {
        title: "使用您的 nsec",
        description: "这种方法很危险，不建议使用",
        delete_tooltip: "删除 nsec",
      },
      signing_extension: {
        title: "签名扩展",
        description: "使用 NIP-07 签名扩展",
        not_found: "未找到 NIP-07 签名扩展",
      },
    },
    nostr: {
      title: "NOSTR",
      relays: {
        expand_label: "点击编辑中继",
        add: {
          title: "添加中继",
          description:
            "您的钱包使用这些中继进行nostr操作，例如付款请求、nostr钱包连接和备份。",
        },
        list: {
          title: "中继",
          description: "您的钱包将连接到这些中继。",
          copy_tooltip: "复制中继",
          remove_tooltip: "删除中继",
        },
      },
    },
    payment_requests: {
      title: "支付请求",
      description:
        "支付请求允许您通过 Nostr 接收支付。如果您启用此功能，您的钱包将订阅您的 Nostr 中继。",
      enable_toggle: "启用支付请求",
      claim_automatically: {
        toggle: "自动认领",
        description: "自动接收收到的支付。",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr 钱包连接 (NWC)",
      description: "使用 NWC 从任何其他应用程序控制您的钱包。",
      enable_toggle: "启用 NWC",
      payments_note:
        "您只能使用 NWC 从您的比特币余额支付。支付将从您激活的 Mint 进行。",
      connection: {
        copy_tooltip: "复制连接字符串",
        qr_tooltip: "显示二维码",
        allowance_label: "剩余额度 (sat)",
      },
      relays: {
        expand_label: "点击编辑中继",
        add: {
          title: "添加中继",
          description:
            "Nostr 钱包连接使用 Nostr 中继将您的钱包连接到其他应用程序。",
        },
        list: {
          title: "中继",
          description: "您的钱包将连接到这些中继。",
          copy_tooltip: "复制中继",
          remove_tooltip: "删除中继",
        },
      },
    },
    hardware_features: {
      webnfc: {
        title: "WebNFC",
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
          description: "将令牌存储为二进制数据",
        },
        quick_access: {
          toggle: "NFC 快速访问",
          description:
            "在 '接收 Ecash' 菜单中快速扫描 NFC 卡。此选项会在 '接收 Ecash' 菜单中添加一个 NFC 按钮。",
        },
      },
    },
    p2pk_features: {
      title: "P2PK",
      description:
        "生成密钥对以接收 P2PK 锁定的 ecash。警告：此功能是实验性的。仅用于小额。如果您丢失了您的私钥，将没有人能够再解锁锁定到它的 ecash。",
      generate_button: "生成密钥",
      import_button: "导入 nsec",
      quick_access: {
        toggle: "快速访问锁定",
        description:
          "使用此功能在 '接收 Ecash' 菜单中快速显示您的 P2PK 锁定密钥。",
      },
      keys_expansion: {
        label: "点击浏览 {count} 个密钥",
        used_badge: "已使用",
      },
    },
    privacy: {
      title: "隐私",
      description: "这些设置会影响您的隐私。",
      check_incoming: {
        toggle: "检查收到的发票",
        description:
          "如果启用，钱包会在后台检查最新的发票。这增加了钱包的响应速度，但也使指纹识别更容易。您可以在发票标签中手动检查未付款的发票。",
      },
      check_startup: {
        toggle: "启动时检查待处理发票",
        description: "如果启用，钱包会在启动时检查过去 24 小时内待处理的发票。",
      },
      check_all: {
        toggle: "检查所有发票",
        description:
          "如果启用，钱包会在后台定期检查未付款的发票，最长可达两周。这增加了钱包的在线活动，从而使指纹识别更容易。您可以在发票标签中手动检查未付款的发票。",
      },
      check_sent: {
        toggle: "检查已发送的 ecash",
        description:
          "如果启用，钱包会使用周期性后台检查来确定已发送的 token 是否已被兑换。这增加了钱包的在线活动，从而使指纹识别更容易。",
      },
      websockets: {
        toggle: "使用 WebSockets",
        description:
          "如果启用，钱包将使用长连接的 WebSocket 来接收有关已付款发票和已花费 token 的更新信息。这增加了钱包的响应速度，但也使指纹识别更容易。",
      },
      bitcoin_price: {
        toggle: "从 Coinbase 获取汇率",
        description:
          "如果启用，将从 coinbase.com 获取当前比特币汇率并显示您的转换后余额。",
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
        description:
          "在接收 Ecash 对话框中，选择将接收到的 Ecash 兑换为您的激活 Mint。",
      },
      auto_paste: {
        toggle: "自动粘贴 Ecash",
        description:
          "当您按接收，然后Ecash，然后粘贴时，自动粘贴剪贴板中的 ecash。自动粘贴可能会导致 iOS 中的 UI 故障，如果您遇到问题，请关闭此功能。",
      },
      auditor: {
        toggle: "启用审计器",
        badge: "测试版",
        description:
          "如果启用，钱包将在 Mint 详细信息对话框中显示审计器信息。审计器是第三方服务，用于监控 Mint 的可靠性。",
        url_label: "审计器 URL",
        api_url_label: "审计器 API URL",
      },
    },
    appearance: {
      keyboard: {
        title: "屏幕键盘",
        description: "使用数字键盘输入金额。",
        toggle: "使用数字键盘",
        toggle_description: "如果启用，将使用数字键盘输入金额。",
      },
      theme: {
        title: "外观",
        description: "更改您钱包的外观。",
        tooltips: {
          mono: "单色",
          cyber: "赛博",
          freedom: "自由",
          nostr: "nostr",
          bitcoin: "比特币",
          mint: "薄荷",
          nut: "坚果",
          blu: "蓝色",
          flamingo: "火烈鸟",
        },
      },
    },
    advanced: {
      title: "高级",
      developer: {
        title: "开发者设置",
        description: "以下设置为开发和调试用途。",
        new_seed: {
          button: "生成新的种子短语",
          description:
            "这将生成一个新的种子短语。您必须将您的全部余额发送给自己，以便能够使用新的种子恢复。",
          confirm_question: "您确定要生成新的种子短语吗？",
          cancel: "取消",
          confirm: "确认",
        },
        remove_spent: {
          button: "删除已花费的证明",
          description:
            "检查您的活动 Mint 中的 ecash token 是否已花费，并从您的钱包中删除已花费的 token。仅当您的钱包卡住时使用此功能。",
        },
        debug_console: {
          button: "切换调试控制台",
          description:
            "打开 Javascript 调试终端。切勿向此终端粘贴您不理解的任何内容。小偷可能会试图欺骗您在此处粘贴恶意代码。",
        },
        export_proofs: {
          button: "导出活动证明",
          description:
            "将活动 Mint 中的全部余额作为 Cashu token 复制到剪贴板。这只会导出所选 Mint 和单位的 token。要进行完全导出，请选择不同的 Mint 和单位并再次导出。",
        },
        keyset_counters: {
          title: "增加 keyset 计数器",
          description:
            "点击 keyset ID 以增加您钱包中 keysets 的 derivation path 计数器。如果您看到输出已被签名错误，这将很有用。",
        },
        unset_reserved: {
          button: "取消所有保留的 token",
          description:
            "此钱包会将待处理的传出 ecash 标记为已保留（并从您的余额中扣除），以防止双重支付尝试。此按钮将取消所有保留的 token，以便可以再次使用它们。如果您执行此操作，您的钱包可能会包含已花费的证明。按删除已花费的证明按钮以清除它们。",
        },
        show_onboarding: {
          button: "显示入门指南",
          description: "再次显示入门指南屏幕。",
        },
        reset_wallet: {
          button: "重置钱包数据",
          description:
            "重置您的钱包数据。警告：这将删除所有内容！请务必先创建备份。",
          confirm_question: "您确定要删除您的钱包数据吗？",
          cancel: "取消",
          confirm: "删除钱包",
        },
        export_wallet: {
          button: "导出钱包数据",
          description:
            "下载您的钱包数据。您可以通过将此文件拖放到新钱包的欢迎屏幕上来恢复您的钱包。如果您在导出后继续使用您的钱包，该文件将不同步。",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "加入 Mint",
    subtitle:
      "您还没有加入任何 Cashu Mint。请在设置中添加 Mint URL 或接收来自新 Mint 的 ecash 以开始。",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "接收 Ecash",
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
        label: "历史记录",
      },
      invoices: {
        label: "发票",
      },
      mints: {
        label: "Mints",
      },
    },
    install: {
      text: "安装",
      tooltip: "安装 Cashu",
    },
  },
  AlreadyRunning: {
    title: "不行。",
    text: "另一个标签页正在运行。请关闭此标签页并重试。",
    actions: {
      retry: {
        label: "重试",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "哎呀。这里什么都没有…",
    actions: {
      home: {
        label: "返回主页",
      },
    },
  },
  BalanceView: {
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
    title: "欢迎使用 Cashu",
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
    title: "安装 PWA",
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
          text: "按 { buttonText }",
          buttonText: "@:AndroidPWAPrompt.buttonText",
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
          text: "按 { buttonText }",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "在您的设备上安装此应用后，关闭此浏览器窗口并从主屏幕使用该应用。",
      },
    },
    pwa: {
      success: {
        title: "成功！",
        text: "您正在使用 Cashu 作为 PWA。关闭所有其他打开的浏览器窗口，并从主屏幕使用该应用。",
      },
    },
  },
  iOSPWAPrompt: {
    text: "点击 { icon } 和 { buttonText }",
    buttonText: "添加到主屏幕",
  },
  AndroidPWAPrompt: {
    text: "点击 { icon } 和 { buttonText }",
    buttonText: "添加到主屏幕",
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
    title: "条款",
    actions: {
      more: {
        label: "阅读服务条款",
      },
    },
    inputs: {
      checkbox: {
        label: "我已阅读并接受这些条款和条件",
      },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "从种子短语恢复",
      caption:
        "输入您的种子短语以恢复您的钱包。在恢复之前，请确保您已添加所有您之前使用过的 Mint。",
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
      label: "恢复 Mints",
      caption:
        "选择要恢复的 Mint。您可以在主屏幕的Mints下添加更多 Mint 并在此处恢复它们。",
    },
    actions: {
      paste: {
        error: "读取剪贴板内容失败。",
      },
      validate: {
        error: "助记符应至少包含 12 个词。",
      },
      restore: {
        label: "恢复",
        in_progress: "正在恢复 Mint…",
        error: "恢复 Mint 错误: { error }",
      },
      restore_all_mints: {
        label: "恢复所有 Mints",
        in_progress: "正在恢复第 { index } 个 Mint，共 { length } 个…",
        success: "恢复成功",
        error: "恢复 Mints 错误: { error }",
      },
    },
  },
  MintSettings: {
    add: {
      title: "添加 Mint",
      description: "输入 Cashu Mint 的 URL 以连接。此钱包不隶属于任何 Mint。",
      inputs: {
        nickname: {
          placeholder: "昵称 (例如 Testnet)",
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
      title: "发现 Mints",
      overline: "发现",
      caption: "发现其他用户在 Nostr 上推荐的 Mints。",
      actions: {
        discover: {
          label: "发现 Mints",
          in_progress: "正在加载…",
          error_no_mints: "未找到 Mints",
          success: "找到 { length } 个 Mints",
        },
      },
      recommendations: {
        overline: "找到 { length } 个 Mints",
        caption:
          "这些 Mints 是由其他 Nostr 用户推荐的。请在 { link } 查看评论。请小心谨慎，并在使用 Mint 之前自行研究。",
        actions: {
          browse: {
            label: "点击浏览 Mints",
          },
        },
      },
    },
    swap: {
      title: "兑换",
      overline: "多 Mint 兑换",
      caption:
        "通过 Lightning 在 Mints 之间兑换资金。注意：留出潜在的 Lightning 费用。如果收到的支付不成功，请手动检查发票。",
      inputs: {
        from: {
          label: "从",
        },
        to: {
          label: "到",
        },
        amount: {
          label: "金额 ({ ticker })",
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
    title: "创建发票",
    inputs: {
      amount: {
        label: "金额 ({ ticker }) *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "创建发票",
        label_blocked: "正在创建发票…",
        in_progress: "正在创建",
      },
    },
    invoice: {
      caption: "Lightning 发票",
      status_paid_text: "已付款！",
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
    title: "发送",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "没有可用的 Mints",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "没有可用的 Mints",
      },
    },
  },
  SendTokenDialog: {
    title: "发送 { value }",
    title_ecash_text: "Ecash",
    badge_offline_text: "离线",
    inputs: {
      amount: {
        label: "金额 ({ ticker }) *",
        invalid_too_much_error_text: "太多了",
      },
      p2pk_pubkey: {
        label: "接收者公钥",
        label_invalid: "接收者公钥",
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
        tooltip_text: "复制 Emoji",
      },
      copy_tokens: {
        label: "@:global.actions.copy.label",
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
    },
  },
  ReceiveDialog: {
    title: "接收",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "没有可用的 Mints",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "您需要连接到 Mint 才能通过 Lightning 接收",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "接收 Ecash",
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      scan: {
        label: "@:global.actions.scan.label",
      },
      request: {
        label: "请求",
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
    title: "接收 { value }",
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
        label: "稍后",
        tooltip_text: "添加到历史记录，稍后接收",
        already_in_history_success_text: "Ecash 已在历史记录中",
        added_to_history_success_text: "Ecash 已添加到历史记录",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "从 NFC 卡读取",
          ndef_unsupported_text: "不支持 NDEF",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "P2PK 密钥",
      description: "接收此密钥锁定的 ecash",
      used_warning_text:
        "警告：此密钥已被使用过。请使用新密钥以获得更好的隐私。",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
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
    payment_request: {
      caption: "支付请求",
      description: "通过 Nostr 接收支付",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "新请求",
      },
      add_amount: {
        label: "添加金额",
      },
      use_active_mint: {
        label: "任何 Mint",
      },
    },
    inputs: {
      amount: {
        placeholder: "输入金额",
      },
    },
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
    contact: {
      title: "联系",
    },
    details: {
      title: "Mint 详情",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Nuts",
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
        label: "货币",
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
  },
  HistoryTable: {
    empty_text: "暂无历史记录",
    row: {
      type_label: "Ecash",
      date_label: "{ value } 前",
    },
    actions: {
      check_status: {
        tooltip_text: "检查状态",
      },
      receive: {
        tooltip_text: "接收",
      },
      filter_pending: {
        label: "过滤待处理",
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
        label: "过滤待处理",
      },
      show_all: {
        label: "显示全部",
      },
    },
  },
  RemoveMintDialog: {
    title: "您确定要删除此 Mint 吗？",
    nickname: {
      label: "昵称",
    },
    balances: {
      label: "余额",
    },
    warning_text:
      "注意：由于此钱包是偏执的，您的此 Mint 中的 ecash 不会真正删除，但会保留在您的设备上。如果您稍后再次添加此 Mint，您会再次看到它。",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "删除 Mint",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  PayInvoiceDialog: {
    input_data: {
      title: "支付 Lightning",
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
    },
    lnurlpay: {
      amount_exact_label: "{ payee } 请求 { value } { ticker }",
      amount_range_label:
        "{ payee } 请求{br}介于 { min } 和 { max } { ticker } 之间",
      inputs: {
        amount: {
          label: "金额 ({ ticker }) *",
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
          error: "错误",
        },
      },
    },
  },
  EditMintDialog: {
    title: "编辑 Mint",
    inputs: {
      nickname: {
        label: "昵称",
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
      "在使用此 Mint 之前，请确保您信任它。Mints 随时可能变得恶意或停止运营。",
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
};
