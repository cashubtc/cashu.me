export default {
  copied_to_clipboard: "Copied to clipboard!",
  copy_failed: "Copy failed",
  global: {
    copy_to_clipboard: {
      success: "クリップボードにコピーしました！",
    },
    actions: {
      add_mint: {
        label: "ミントを追加",
      },
      cancel: {
        label: "キャンセル",
      },
      copy: {
        label: "コピー",
      },
      close: {
        label: "閉じる",
      },
      ok: {
        label: "OK",
      },
      enter: {
        label: "入力",
      },
      lock: {
        label: "ロック",
      },
      paste: {
        label: "貼り付け",
      },
      receive: {
        label: "受け取る",
      },
      scan: {
        label: "スキャン",
      },
      send: {
        label: "送る",
      },
  creatorHub: {
    publish: "Publish Profile",
    saveDraft: "Save Draft",
    profileHeader: "Profile details",
  },
      swap: {
        label: "スワップ",
      },
      update: {
        label: "更新",
      },
    },
    inputs: {
      mint_url: {
        label: "ミントURL",
      },
    },
  },
  wallet: {
    notifications: {
      balance_too_low: "残高が不足しています",
      received: "{amount}を受け取りました",
      fee: " (手数料: {fee})",
      could_not_request_mint: "ミントをリクエストできませんでした",
      invoice_still_pending: "請求書はまだ処理中です",
      paid_lightning: "Lightningで{amount}を支払いました",
      payment_pending_refresh:
        "支払いは保留中です。請求書を手動で更新してください。",
      sent: "{amount}を送信しました",
      token_still_pending: "トークンはまだ処理中です",
      received_lightning: "Lightningで{amount}を受け取りました",
      lightning_payment_failed: "Lightning支払いに失敗しました",
      failed_to_decode_invoice: "請求書をデコードできませんでした",
      invalid_lnurl: "無効なLNURL",
      lnurl_error: "LNURLエラー",
      no_amount: "金額がありません",
      no_lnurl_data: "LNURLデータがありません",
      no_price_data: "価格データがありません。",
      please_try_again: "もう一度お試しください。",
      nostr_dm_sent: "Nostr DMを送信しました",
      nostr_dm_failed: "Nostr DMの送信に失敗しました",
    },
    mint: {
      notifications: {
        already_added: "ミントはすでに追加されています",
        added: "ミントが追加されました",
        not_found: "ミントが見つかりません",
        activation_failed: "ミントの有効化に失敗しました",
        no_active_mint: "アクティブなミントがありません",
        unit_activation_failed: "単位の有効化に失敗しました",
        unit_not_supported: "この単位はミントでサポートされていません",
        activated: "ミントが有効化されました",
        could_not_connect: "ミントに接続できませんでした",
        could_not_get_info: "ミント情報を取得できませんでした",
        could_not_get_keys: "ミントキーを取得できませんでした",
        could_not_get_keysets: "ミントキーセットを取得できませんでした",
        removed: "ミントが削除されました",
        error: "ミントエラー",
      },
    },
    signer_connected: "Nostr署名者が接続されました",
  },
  MainHeader: {
    menu: {
      settings: {
        title: "設定",
        settings: {
          title: "設定",
          caption: "ウォレット構成",
        },
      },
      terms: {
        title: "規約",
        terms: {
          title: "規約",
          caption: "利用規約",
        },
      },
      about: {
        title: "About",
        about: { title: "About", caption: "About this app" },
      },
      links: {
        title: "リンク集",
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
          title: "寄付する",
          caption: "Cashuをサポートする",
        },
      },
    },
    offline: {
      warning: {
        text: "オフライン",
      },
    },
    reload: {
      warning: {
        text: "{ countdown }後に再読み込み",
      },
    },
    staging: {
      warning: {
        text: "ステージング環境 – 実際の資金では使用しないでください！",
      },
    },
  },
  FullscreenHeader: {
    actions: {
      back: {
        label: "ウォレット",
      },
    },
  },
  Settings: {
    language: {
      title: "言語",
      description: "以下のリストから希望の言語を選択してください。",
    },
    sections: {
      backup_restore: "バックアップと復元",
      lightning_address: "ライトニングアドレス",
      nostr_keys: "ノストルキー",
      payment_requests: "支払いリクエスト",
      nostr_wallet_connect: "ノストルウォレットコネクト",
      hardware_features: "ハードウェア機能",
      p2pk_features: "P2PK機能",
      privacy: "プライバシー",
      experimental: "実験的な機能",
      appearance: "外観",
    },
    backup_restore: {
      backup_seed: {
        title: "シードフレーズをバックアップ",
        description:
          "シードフレーズでウォレットを復元できます。安全に保管してください。",
        seed_phrase_label: "シードフレーズ",
      },
      restore_ecash: {
        title: "ecashを復元",
        description:
          "復元ウィザードを使用すると、ニーモニックシードフレーズから失われたecashを回復できます。現在のウォレットのシードフレーズは影響を受けず、ウィザードでは別のシードフレーズからecashを復元することのみが可能です。",
        button: "復元",
      },
    },
    lightning_address: {
      title: "ライトニングアドレス",
      description: "Lightningアドレスで支払いを受け取ります。",
      enable: {
        toggle: "有効にする",
        description: "npub.cash付きLightningアドレス",
      },
      address: {
        copy_tooltip: "Lightningアドレスをコピー",
      },
      automatic_claim: {
        toggle: "自動的に請求",
        description: "着信支払いを自動的に受け取ります。",
      },
    },
    nostr_keys: {
      title: "あなたのnostrキー",
      description: "Lightningアドレスのnostrキーを設定します。",
      wallet_seed: {
        title: "ウォレットシードフレーズ",
        description: "ウォレットシードからnostrキーペアを生成",
        copy_nsec: "nsecをコピー",
      },
      nsec_bunker: {
        title: "Nsec Bunker",
        description: "NIP-46バンカーを使用",
        delete_tooltip: "接続を削除",
      },
      use_nsec: {
        title: "nsecを使用",
        description: "この方法は危険であり推奨されません",
        delete_tooltip: "nsecを削除",
      },
      signing_extension: {
        title: "署名拡張機能",
        description: "NIP-07署名拡張機能を使用",
        not_found: "NIP-07署名拡張機能が見つかりません",
      },
    },
    payment_requests: {
      title: "支払いリクエスト",
      description:
        "支払いリクエストを使用すると、nostr経由で支払いを受け取ることができます。これを有効にすると、ウォレットはあなたのnostrリレーに購読します。",
      enable_toggle: "支払いリクエストを有効にする",
      claim_automatically: {
        toggle: "自動的に請求",
        description: "着信支払いを自動的に受け取ります。",
      },
    },
    nostr_wallet_connect: {
      title: "Nostrウォレットコネクト (NWC)",
      description:
        "NWCを使用して、他のどのアプリケーションからでもウォレットを制御できます。",
      enable_toggle: "NWCを有効にする",
      payments_note:
        "NWCはBitcoin残高からの支払いにのみ使用できます。支払いはアクティブなミントから行われます。",
      connection: {
        copy_tooltip: "接続文字列をコピー",
        qr_tooltip: "QRコードを表示",
        allowance_label: "残りアローワンス (sat)",
      },
      relays: {
        expand_label: "リレーを編集するにはクリック",
        add: {
          title: "リレーを追加",
          description:
            "Nostrウォレットコネクトは、ウォレットを他のアプリケーションに接続するためにnostrリレーを使用します。",
        },
        list: {
          title: "リレー",
          description: "ウォレットはこれらのリレーに接続します。",
          copy_tooltip: "リレーをコピー",
          remove_tooltip: "リレーを削除",
        },
      },
    },
    hardware_features: {
      webnfc: {
        title: "WebNFC",
        description: "NFCカードへの書き込みエンコーディングを選択",
        text: {
          title: "テキスト",
          description: "トークンをプレーンテキストで保存",
        },
        weburl: {
          title: "URL",
          description: "トークン付きでこのウォレットへのURLを保存",
        },
        binary: {
          title: "生のバイナリ",
          description:
            "Base64の代わりに生のバイト。トークンが約33%短くなります。",
        },
        quick_access: {
          toggle: "NFCへのクイックアクセス",
          description:
            "Ecash受信メニューでNFCカードをすばやくスキャンします。このオプションは、Ecash受信メニューにNFCボタンを追加します。",
        },
      },
    },
    p2pk_features: {
      title: "P2PK",
      description:
        "このキーにロックされたecashを受け取るためのキーペアを生成します。警告: この機能は実験的です。少額のみに使用してください。秘密鍵を紛失した場合、誰にもそれにロックされたecashのロックを解除できなくなります。",
      generate_button: "キーを生成",
      import_button: "nsecをインポート",
      quick_access: {
        toggle: "ロックへのクイックアクセス",
        description:
          "これを使用して、ecash受信メニューでP2PKロックキーをすばやく表示します。",
      },
      keys_expansion: {
        label: "{count}個のキーをブラウズするにはクリック",
        used_badge: "使用済み",
      },
    },
    privacy: {
      title: "プライバシー",
      description: "これらの設定はプライバシーに影響します。",
      check_incoming: {
        toggle: "着信請求書をチェック",
        description:
          "有効にすると、ウォレットはバックグラウンドで最新の請求書をチェックします。これによりウォレットの応答性が向上し、フィンガープリンティングが容易になります。未払い請求書は請求書タブで手動で確認できます。",
      },
      check_startup: {
        toggle: "起動時に保留中の請求書をチェック",
        description:
          "有効にすると、ウォレットは起動時に過去24時間の保留中の請求書をチェックします。",
      },
      check_all: {
        toggle: "すべての請求書をチェック",
        description:
          "有効にすると、ウォレットは最大2週間、未払い請求書をバックグラウンドで定期的にチェックします。これによりウォレットのオンラインアクティビティが増加し、フィンガープリンティングが容易になります。未払い請求書は請求書タブで手動で確認できます。",
      },
      check_sent: {
        toggle: "送信されたecashをチェック",
        description:
          "有効にすると、ウォレットは定期的なバックグラウンドチェックを使用して、送信されたトークンが償還されたかどうかを判断します。これによりウォレットのオンラインアクティビティが増加し、フィンガープリンティングが容易になります。",
      },
      websockets: {
        toggle: "WebSocketsを使用",
        description:
          "有効にすると、ウォレットは長期間のWebSocket接続を使用して、ミントから支払われた請求書や使用済みトークンに関する更新を受け取ります。これによりウォレットの応答性は向上しますが、フィンガープリンティングも容易になります。",
      },
      bitcoin_price: {
        toggle: "Coinbaseから為替レートを取得",
        description:
          "有効にすると、現在のBitcoin為替レートがcoinbase.comから取得され、換算された残高が表示されます。",
      },
    },
    experimental: {
      title: "実験的な機能",
      description: "これらの機能は実験的です。",
      receive_swaps: {
        toggle: "スワップを受け取る",
        badge: "ベータ",
        description:
          "Ecash受信ダイアログで、受信したEcashをアクティブなミントにスワップするオプション。",
      },
      auto_paste: {
        toggle: "Ecashを自動的に貼り付け",
        description:
          "受信、Ecash、貼り付けを押すと、クリップボードのecashを自動的に貼り付けます。自動貼り付けはiOSでUIグリッチを引き起こす可能性があります。問題が発生した場合はオフにしてください。",
      },
      auto_redeem_locked: {
        toggle: "ロックされたトークンを自動的に引き出す",
        description:
          "有効にすると、ロックされたトークンが解除され次第、自動的に引き出します。",
      },
      auditor: {
        toggle: "監査人を有効にする",
        badge: "ベータ",
        description:
          "有効にすると、ウォレットはミントの詳細ダイアログに監査人情報を表示します。監査人はミントの信頼性を監視するサードパーティサービスです。",
        url_label: "監査人URL",
        api_url_label: "監査人API URL",
      },
    },
    appearance: {
      keyboard: {
        title: "オンスクリーンキーボード",
        description: "金額入力に数字キーボードを使用します。",
        toggle: "数字キーボードを使用",
        toggle_description:
          "有効にすると、金額入力に数字キーボードが使用されます。",
      },
      theme: {
        title: "外観",
        description: "ウォレットの外観を変更します。",
        tooltips: {
          mono: "モノラル",
          cyber: "サイバー",
          freedom: "自由",
          nostr: "ノストル",
          bitcoin: "ビットコイン",
          mint: "ミント",
          nut: "ナッツ",
          blu: "ブルー",
          flamingo: "フラミンゴ",
          modern: "modern",
        },
      },
    },
    advanced: {
      title: "高度な設定",
      developer: {
        title: "開発者設定",
        description: "以下の設定は開発およびデバッグ用です。",
        new_seed: {
          button: "新しいシードフレーズを生成",
          description:
            "これにより新しいシードフレーズが生成されます。新しいシードで復元できるように、すべての残高を自分自身に送金する必要があります。",
          confirm_question: "新しいシードフレーズを生成してもよろしいですか？",
          cancel: "キャンセル",
          confirm: "確認",
        },
        remove_spent: {
          button: "使用済み証明書を削除",
          description:
            "アクティブなミントからのecashトークンが使用されているかチェックし、使用済みのものをウォレットから削除します。ウォレットが詰まった場合にのみ使用してください。",
        },
        debug_console: {
          button: "デバッグコンソールを切り替え",
          description:
            "Javascriptデバッグターミナルを開きます。理解できないものをこのターミナルに貼り付けないでください。泥棒が悪意のあるコードを貼り付けさせようとする可能性があります。",
        },
        export_proofs: {
          button: "アクティブな証明書をエクスポート",
          description:
            "アクティブなミントからの全残高をCashuトークンとしてクリップボードにコピーします。これは選択したミントと単位のトークンのみをエクスポートします。完全なエクスポートを行うには、別のミントと単位を選択して再度エクスポートしてください。",
        },
        keyset_counters: {
          title: "キーセットカウンターをインクリメント",
          description:
            "キーセットIDをクリックして、ウォレット内のキーセットの導出パスカウンターをインクリメントします。「出力はすでに署名されています」というエラーが表示される場合に便利です。",
        },
        unset_reserved: {
          button: "すべての予約済みトークンを解除",
          description:
            "このウォレットは、二重支払いを防ぐために、保留中の出金ecashを予約済みとしてマークします（そして残高から差し引きます）。このボタンはすべての予約済みトークンを解除し、再び使用できるようにします。これを行うと、ウォレットに消費済みの証明書が含まれる可能性があります。「消費済み証明書を削除」ボタンを押してそれらを取り除いてください。",
        },
        show_onboarding: {
          button: "オンボーディングを表示",
          description: "オンボーディング画面を再度表示します。",
        },
        reset_wallet: {
          button: "ウォレットデータをリセット",
          description:
            "ウォレットデータをリセットします。警告: これによりすべてが削除されます！まずバックアップを作成してください。",
          confirm_question: "ウォレットデータを削除してもよろしいですか？",
          cancel: "キャンセル",
          confirm: "ウォレットを削除",
        },
        export_wallet: {
          button: "ウォレットデータをエクスポート",
          description:
            "ウォレットのダンプをダウンロードします。新しいウォレットのウェルカム画面でこのファイルからウォレットを復元できます。このファイルは、エクスポート後にウォレットを使い続けると同期がずれます。",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "ミントに参加する",
    subtitle:
      "まだCashuミントに参加していません。始めるには、設定でミントURLを追加するか、新しいミントからecashを受け取ります。",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Ecashを受け取る",
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
        label: "履歴",
      },
      invoices: {
        label: "請求書",
      },
      mints: {
        label: "ミント",
      },
    },
    install: {
      text: "インストール",
      tooltip: "Cashuをインストール",
    },
  },
  AlreadyRunning: {
    title: "ダメです。",
    text: "別のタブがすでに実行中です。このタブを閉じて再試行してください。",
    actions: {
      retry: {
        label: "再試行",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "おっと、何もありません…",
    actions: {
      home: {
        label: "ホームに戻る",
      },
    },
  },
  BalanceView: {
    mintUrl: {
      label: "ミント",
    },
    mintBalance: {
      label: "残高",
    },
    mintError: {
      label: "ミントエラー",
    },
    pending: {
      label: "保留中",
      tooltip: "すべての保留中のトークンを確認",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "前へ",
      },
      next: {
        label: "次へ",
      },
      skip: {
        label: "スキップ",
      },
    },
  },
  WelcomeSlide1: {
    title: "Cashuへようこそ",
    text: "Cashu.meは、ecashを使用して資金を安全かつプライベートに保つための無料のオープンソースBitcoinウォレットです。",
    actions: {
      more: {
        label: "もっと詳しく",
      },
    },
    p1: {
      text: "CashuはBitcoinのための無料のオープンソースecashプロトコルです。{ link }で詳しく知ることができます。",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "このウォレットはどのミントにも関連付けられていません。このウォレットを使用するには、信頼する1つ以上のCashuミントに接続する必要があります。",
    },
    p3: {
      text: "このウォレットは、あなただけがアクセスできるecashを保存します。シードフレーズのバックアップなしにブラウザデータを削除すると、トークンを失います。",
    },
    p4: {
      text: "このウォレットはベータ版です。資金へのアクセスを失うことについて、当社は一切の責任を負いません。ご自身の責任で使用してください！このコードはオープンソースであり、MITライセンスの下でライセンスされています。",
    },
  },
  WelcomeSlide2: {
    title: "PWAをインストール",
    instruction: {
      intro: {
        text: "最高の体験のため、このウォレットをデバイスのネイティブWebブラウザでProgressive Web Appとしてインストールしてください。今すぐこれを行ってください。",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "メニューをタップ (右上)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "{ buttonText }を押す",
          buttonText: "@:AndroidPWAPrompt.buttonText",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "共有をタップ (下)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "{ buttonText }を押す",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "このアプリをデバイスにインストールしたら、このブラウザウィンドウを閉じてホーム画面からアプリを使用してください。",
      },
    },
    pwa: {
      success: {
        title: "成功！",
        text: "CashuをPWAとして使用しています。他の開いているブラウザウィンドウをすべて閉じ、ホーム画面からアプリを使用してください。",
      },
    },
  },
  iOSPWAPrompt: {
    text: "{ icon }と{ buttonText }をタップ",
    buttonText: "ホーム画面に追加",
  },
  AndroidPWAPrompt: {
    text: "{ icon }と{ buttonText }をタップ",
    buttonText: "ホーム画面に追加",
  },
  WelcomeSlide3: {
    title: "あなたのシードフレーズ",
    text: "シードフレーズをパスワードマネージャーまたは紙に保管してください。シードフレーズは、このデバイスへのアクセスを失った場合に資金を回復する唯一の方法です。",
    inputs: {
      seed_phrase: {
        label: "シードフレーズ",
        caption: "設定でシードフレーズを確認できます。",
      },
      checkbox: {
        label: "書き留めました",
      },
    },
  },
  WelcomeSlide4: {
    title: "規約",
    actions: {
      more: {
        label: "利用規約を読む",
      },
    },
    inputs: {
      checkbox: {
        label: "これらの規約と条件を読み、同意します",
      },
    },
  },
  WelcomeSlidePrivacy: {
    title: "Cashu とプライバシー",
    text: "Cashu は盲化トークンを使用するため、ミントはあなたの支払いを追跡できません。",
  },
  WelcomeSlideMints: {
    title: "ミント",
    text: "トークンを受け取るにはミントを追加してください。",
  },
  WelcomeSlideProofs: {
    title: "証明書",
    text: "証明書は送受信できるトークンのことです。",
  },
  WelcomeSlideBuckets: {
    title: "バケツ",
    text: "バケツを使ってトークンを整理しましょう。",
  },
  RestoreView: {
    seed_phrase: {
      label: "シードフレーズから復元",
      caption:
        "ウォレットを復元するには、シードフレーズを入力してください。復元する前に、以前に使用したすべてのミントを追加したことを確認してください。",
      inputs: {
        seed_phrase: {
          label: "シードフレーズ",
          caption: "設定でシードフレーズを確認できます。",
        },
      },
    },
    information: {
      label: "情報",
      caption:
        "ウィザードは別のシードフレーズからのみecashを復元し、現在使用しているウォレットのシードフレーズを使用したり変更したりすることはできません。これは、一度ecashを自分自身に送金しない限り、復元されたecashが現在のシードフレーズによって保護されないことを意味します。",
    },
    restore_mints: {
      label: "ミントを復元",
      caption:
        "復元するミントを選択します。メイン画面の「ミント」でさらにミントを追加し、ここで復元できます。",
    },
    actions: {
      paste: {
        error: "クリップボードの内容の読み取りに失敗しました。",
      },
      validate: {
        error: "ニーモニックは少なくとも12単語である必要があります。",
      },
      restore: {
        label: "復元",
        in_progress: "ミントを復元中…",
        error: "ミントの復元エラー: { error }",
      },
      restore_all_mints: {
        label: "すべてのミントを復元",
        in_progress: "{ length }個のミントのうち{ index }個目を復元中…",
        success: "復元が正常に完了しました",
        error: "ミントの復元エラー: { error }",
      },
    },
  },
  MintSettings: {
    add: {
      title: "ミントを追加",
      description:
        "接続するCashuミントのURLを入力します。このウォレットはどのミントにも関連付けられていません。",
      inputs: {
        nickname: {
          placeholder: "ニックネーム（例：Testnet）",
        },
      },
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "無効なURL",
        },
        scan: {
          label: "QRコードをスキャン",
        },
      },
    },
    discover: {
      title: "ミントを発見",
      overline: "発見",
      caption: "他のユーザーがnostrで推奨したミントを発見します。",
      actions: {
        discover: {
          label: "ミントを発見",
          in_progress: "読み込み中…",
          error_no_mints: "ミントが見つかりませんでした",
          success: "{ length }個のミントが見つかりました",
        },
      },
      recommendations: {
        overline: "{ length }個のミントが見つかりました",
        caption:
          "これらのミントは他のNostrユーザーによって推奨されました。{ link }でレビューを読んでください。ミントを使用する前に注意し、ご自身の調査を行ってください。",
        actions: {
          browse: {
            label: "ミントをブラウズするにはクリック",
          },
        },
      },
    },
  creatorHub: {
    publish: "Publish Profile",
    saveDraft: "Save Draft",
    profileHeader: "Profile details",
  },
    swap: {
      title: "スワップ",
      overline: "マルチミントスワップ",
      caption:
        "Lightning経由でミント間で資金をスワップします。注意：Lightningの手数料の可能性に備えて余裕を持たせてください。着信支払いが成功しない場合は、手動で請求書を確認してください。",
      inputs: {
        from: {
          label: "から",
        },
        to: {
          label: "へ",
        },
        amount: {
          label: "金額 ({ ticker })",
        },
      },
      actions: {
  creatorHub: {
    publish: "Publish Profile",
    saveDraft: "Save Draft",
    profileHeader: "Profile details",
  },
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
      keep_scanning_text: " - スキャンを続行",
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
    title: "請求書の作成",
    inputs: {
      amount: {
        label: "金額 ({ ticker }) *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "請求書を作成",
        label_blocked: "請求書作成中…",
        in_progress: "作成中",
      },
    },
    invoice: {
      caption: "Lightning請求書",
      status_paid_text: "支払い済み！",
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
    title: "送る",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "利用可能なミントがありません",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "利用可能なミントがありません",
      },
    },
  },
  SendTokenDialog: {
    title: "{ value }を送る",
    title_ecash_text: "Ecash",
    badge_offline_text: "オフライン",
    inputs: {
      amount: {
        label: "金額 ({ ticker }) *",
        invalid_too_much_error_text: "多すぎます",
      },
      p2pk_pubkey: {
        label: "受信者の公開鍵",
        label_invalid: "受信者の公開鍵",
        locktime: {
          label: "Unlock time",
        },
        refund_pubkey: {
          label: "Refund public key",
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
        tooltip_text: "絵文字をコピー",
      },
      copy_tokens: {
        label: "@:global.actions.copy.label",
      },
      copy_link: {
        tooltip_text: "リンクをコピー",
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
        tooltip_text: "履歴から削除",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "NFCカードに書き込み",
          ndef_unsupported_text: "NDEF非対応",
        },
      },
    },
  },
  ReceiveDialog: {
    title: "受け取る",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "利用可能なミントがありません",
      },
      lightning: {
        label: "Lightning",
        error_no_mints:
          "Lightning経由で受け取るにはミントに接続する必要があります",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "Ecashを受け取る",
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      scan: {
        label: "@:global.actions.scan.label",
      },
      request: {
        label: "リクエスト",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      nfc: {
        label: "NFC",
        scanning_text: "スキャン中…",
      },
    },
  },
  ReceiveTokenDialog: {
    title: "{ value }を受け取る",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "Cashuトークンを貼り付け",
      },
      bucket: {
        label: "Bucket",
      },
      label: {
        label: "Label",
      },
    },
    errors: {
      invalid_token: {
        timelock: {
          unlock_date_label: "Unlocks { value }",
        },
        label: "無効なトークン",
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
        label_adding_mint: "ミント追加中…",
      },
  creatorHub: {
    publish: "Publish Profile",
    saveDraft: "Save Draft",
    profileHeader: "Profile details",
  },
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "信頼できるミントにスワップ",
        caption: "{ value }をスワップ",
      },
  creatorHub: {
    publish: "Publish Profile",
    saveDraft: "Save Draft",
    profileHeader: "Profile details",
  },
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "スワップをキャンセル",
      },
  creatorHub: {
    publish: "Publish Profile",
    saveDraft: "Save Draft",
    profileHeader: "Profile details",
  },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      later: {
        label: "後で",
        tooltip_text: "後で受け取るために履歴に追加",
        already_in_history_success_text: "Ecashはすでに履歴にあります",
        added_to_history_success_text: "Ecashを履歴に追加しました",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "NFCカードから読み取り",
          ndef_unsupported_text: "NDEF非対応",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "P2PKキー",
      description: "このキーにロックされたecashを受け取る",
      used_warning_text:
        "警告: このキーは以前に使用されています。プライバシー向上のため新しいキーを使用してください。",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_key: {
        label: "新しいキーを生成",
      },
    },
  },
  PaymentRequestDialog: {
    payment_request: {
      caption: "支払いリクエスト",
      description: "Nostr経由で支払いを受け取る",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "新しいリクエスト",
      },
      add_amount: {
        label: "金額を追加",
      },
      use_active_mint: {
        label: "任意のミント",
      },
    },
    inputs: {
      amount: {
        placeholder: "金額を入力",
      },
    },
  },
  NumericKeyboard: {
    actions: {
      close: {
        label: "@:global.actions.close.label",
        closed_info_text:
          "キーボードが無効になりました。設定でキーボードを再度有効にできます。",
      },
      enter: {
        label: "@:global.actions.enter.label",
      },
    },
  },
  NWCDialog: {
    nwc: {
      caption: "Nostrウォレットコネクト",
      description:
        "NWCを使用してリモートでウォレットを制御します。互換性のあるアプリでウォレットをリンクするには、QRコードを押してください。",
      warning_text:
        "警告: この接続文字列にアクセスできる人は誰でもウォレットから支払いを開始できます。共有しないでください！",
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
    title: "ミントメッセージ",
  },
  MintDetailsDialog: {
    contact: {
      title: "連絡先",
    },
    details: {
      title: "ミント詳細",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Nuts",
        actions: {
          show: {
            label: "すべて表示",
          },
          hide: {
            label: "隠す",
          },
        },
      },
      currency: {
        label: "通貨",
      },
      currencies: {
        label: "@:MintDetailsDialog.details.currency.label",
      },
      version: {
        label: "バージョン",
      },
    },
    actions: {
      title: "アクション",
      copy_mint_url: {
        label: "ミントURLをコピー",
      },
      delete: {
        label: "ミントを削除",
      },
      edit: {
        label: "ミントを編集",
      },
    },
  },
  ChooseMint: {
    title: "ミントを選択",
    badge_mint_error_text: "エラー",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
  },
  HistoryTable: {
    empty_text: "履歴はまだありません",
    row: {
      type_label: "Ecash",
      date_label: "{ value }前",
    },
    actions: {
      check_status: {
        tooltip_text: "ステータスを確認",
      },
      receive: {
        tooltip_text: "受け取る",
      },
      filter_pending: {
        label: "保留中をフィルタリング",
      },
      show_all: {
        label: "すべて表示",
      },
    },
    old_token_not_found_error_text: "古いトークンが見つかりません",
  },
  InvoiceTable: {
    empty_text: "請求書はまだありません",
    row: {
      type_label: "Lightning",
      type_tooltip_text: "クリックしてコピー",
      date_label: "{ value }前",
    },
    actions: {
      check_status: {
        tooltip_text: "ステータスを確認",
      },
      filter_pending: {
        label: "保留中をフィルタリング",
      },
      show_all: {
        label: "すべて表示",
      },
    },
  },
  RemoveMintDialog: {
    title: "このミントを削除してもよろしいですか？",
    nickname: {
      label: "ニックネーム",
    },
    balances: {
      label: "残高",
    },
    warning_text:
      "注: このウォレットは偏執的であるため、このミントからのecashは実際には削除されず、デバイスに保存されたままになります。後でこのミントを再度追加すると、再び表示されます。",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "ミントを削除",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  PayInvoiceDialog: {
    input_data: {
      title: "Lightningで支払う",
      inputs: {
        invoice_data: {
          label: "Lightning請求書またはアドレス",
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
      amount_exact_label:
        "{ payee }が{ value } { ticker }をリクエストしています",
      amount_range_label:
        "{ payee }が{ min }から{ max } { ticker }の間をリクエストしています",
      inputs: {
        amount: {
          label: "金額 ({ ticker }) *",
        },
        comment: {
          label: "コメント (任意)",
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
      title: "{ value }を支払う",
      memo: {
        label: "メモ",
      },
      processing_info_text: "処理中…",
      balance_too_low_warning_text: "残高不足",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        pay: {
          label: "支払う",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
          error: "エラー",
        },
      },
    },
  },
  EditMintDialog: {
    title: "ミントを編集",
    inputs: {
      nickname: {
        label: "ニックネーム",
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
    title: "このミントを信頼しますか？",
    description:
      "このミントを使用する前に、信頼できることを確認してください。ミントはいつでも悪意のあるものになるか、運営を停止する可能性があります。",
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
        in_progress: "ミントを追加中",
      },
    },
  },
  BucketManager: {
    tooltips: {
      description:
        "\u30D0\u30B1\u30C3\u30C8\u306F\u30C8\u30FC\u30AF\u30F3\u3092\u5206\u985E\u3059\u308B\u305F\u3081\u306E\u3082\u306E\u3067\u3059",
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
    empty: "No tokens",
    helper: "Move tokens between buckets to organize them.",
  },
  restore: {
    mnemonic_error_text: "ニーモニックを入力してください",
    restore_mint_error_text: "ミントの復元エラー: { error }",
    prepare_info_text: "復元処理を準備中…",
    restored_proofs_for_keyset_info_text:
      "{ keysetId }キーセットの{ restoreCounter }個の証明書を復元しました",
    checking_proofs_for_keyset_info_text:
      "{ keysetId }キーセットの{ startIndex }から{ endIndex }までの証明書を確認中",
    no_proofs_info_text: "復元する証明書が見つかりませんでした",
    restored_amount_success_text: "{ amount }復元しました",
  },
  AboutPage: {
    title: "About Cashu.me",
    video_placeholder: "Video coming soon",
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
  creatorHub: {
    publish: "Publish Profile",
    saveDraft: "Save Draft",
    profileHeader: "Profile details",
    endpointsHeader: "Endpoints",
  },
  swap: {
    in_progress_warning_text: "スワップ進行中",
    invalid_swap_data_error_text: "無効なスワップデータ",
    swap_error_text: "スワップエラー",
  },
  settings: {
    nostr: {
      signing_extension: {
        not_found: "NIP-07署名拡張機能が見つかりません",
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
      status: "ステータスでフィルタ",
      bucket: "バケットでフィルタ",
      frequency: "頻度でフィルタ",
    },
  },
};
