export default {
  MultinutPicker: {
    dialog_title: "マルチナット支払い",
    pay_using_multiple: "複数のミントを使って支払う",
    experimental_title: "試験的な機能",
    experimental_text:
      "この機能は非常に試験的で、期待どおりに動作しない場合があります。すでに支払い済みの請求書を支払おうとしないでください。資金を失う可能性があります。",
    understand: "理解しました",
    select_funds: "複数のミントから資金を選んで支払いを実行します。",
    pay_invoice: "請求書を支払う",
    amount_mismatch: "金額の計算エラー: {calculated}（想定 {expected}）",
    states: {
      requesting: "リクエスト中...",
      paying: "支払い中...",
      success: "成功",
      failed: "失敗",
    },
    payment: "マルチナット支払い",
    selectMints: "支払いに使用するミントを一つ以上選択してください。",
    totalSelectedBalance: "選択した残高の合計",
    multiMintPay: "複数ミントで支払う",
    balanceNotEnough: "複数ミントの残高がこの請求書を満たすには不十分です",
    failed: "処理に失敗しました: {error}",
    paid: "Lightningで{amount}を支払いました",
  },
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
      swap: {
        label: "スワップ",
      },
      update: {
        label: "更新",
      },
      pay: { label: "支払う" },
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
      trying_again: "再試行中...",
      unsupported_legacy_qr: "サポートされていない旧形式の QR コード",
      legacy_qr_not_supported:
        "この旧形式の QR コードは対応している加盟店のものではありません",
      no_bolt12_mint: "BOLT12 オファーに対応しているミントがありません",
      no_bolt11_mint: "BOLT11 請求書に対応しているミントがありません",
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
        mint_validation_error: "ミントの検証エラー",
        removed: "ミントが削除されました",
        error: "ミントエラー",
      },
    },
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
          caption: "Cashu.me の利用で同意する内容",
        },
      },
      links: {
        title: "リンク集",
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
    menu: {
      title: "設定",
      backup: {
        title: "バックアップと復元",
        caption: "シードフレーズとecashの復元",
      },
      lightning_address: {
        title: "ライトニングアドレス",
        caption: "name@domain で支払いを受け取る",
      },
      nostr: {
        title: "Nostr",
        caption: "鍵、リレー、信頼の輪",
      },
      payment_requests: {
        title: "支払いリクエスト",
        caption: "Nostr 経由で ecash の支払いを受け取る",
      },
      nwc: {
        title: "Nostrウォレットコネクト",
        caption: "他のアプリからウォレットを使用する",
      },
      hardware: {
        title: "ハードウェア",
        caption: "NFC設定",
      },
      p2pk: {
        title: "ロックされた ecash",
        caption: "自分の鍵でしか開けられない ecash を受け取る",
      },
      privacy: {
        title: "プライバシー",
        caption: "ネットワークチェックとビットコイン価格",
      },
      experimental: {
        title: "実験的機能",
        caption: "新機能をいち早く試す",
      },
      appearance: {
        title: "外観",
        caption: "テーマ、キーボード、ビットコイン記号",
      },
      language: {
        title: "言語",
        caption: "言語を選択",
      },
      advanced: {
        title: "詳細設定",
        caption: "開発者ツールとウォレットのリセット",
      },
      about: {
        title: "アプリについて",
        caption: "利用規約とリンク",
      },
    },
    language: {
      title: "言語",
      description: "以下のリストから希望の言語を選択してください。",
    },
    sections: {
      backup_restore: "バックアップと復元",
      lightning_address: "ライトニングアドレス",
      nostr_keys: "ノストルキー",
      nostr: {
        title: "NOSTR",
        relays: {
          already_added: "リレーはすでに追加されています",
          expand_label: "クリックしてリレーを編集",
          add: {
            title: "リレーを追加",
            description:
              "ウォレットは、支払いリクエスト、Nostr Wallet Connect、バックアップなどの Nostr 機能にこれらのリレーを使います。",
          },
          list: {
            title: "リレー",
            description: "あなたのウォレットはこれらのリレーに接続します。",
            copy_tooltip: "リレーをコピー",
            remove_tooltip: "リレーを削除",
          },
        },
      },
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
          "別のシードフレーズから ecash を復元します。現在のシードフレーズは変わりません。",
        button: "復元",
      },
    },
    lightning_address: {
      server_url: {
        label: "npub.cash のホスト名",
        hint: "ホスト名または HTTPS URL を入力",
        invalid: "有効な HTTPS サーバー URL を入力してください",
      },
      title: "ライトニングアドレス",
      description: "Lightningアドレスで支払いを受け取ります。",
      enable: {
        toggle: "ライトニングアドレスを使う",
        description: "npub.cash のアドレスで支払いを受け取る",
      },
      address: {
        copy_tooltip: "Lightningアドレスをコピー",
      },
      show_on_receive: {
        toggle: "受け取り時に表示",
        description: "アドレスとQRコードを表示",
      },
      automatic_claim: {
        toggle: "自動的に請求",
        description: "着信支払いを自動的に受け取ります。",
      },
      mint: {
        label: "npub.cashミント",
        choose_title: "npub.cashのミントを選択",
        choose_placeholder: "ミントを選択...",
      },
    },
    nostr_keys: {
      title: "あなたの Nostr 鍵",
      description: "Nostr 鍵によってライトニングアドレスが決まります。",
      wallet_seed: {
        title: "ウォレットシードフレーズ",
        description: "ウォレットのシードから Nostr 鍵ペアを生成",
        copy_nsec: "秘密鍵をコピー",
      },
      nsec_bunker: {
        title: "リモート署名",
        description: "NIP-46 バンカーで署名",
        delete_tooltip: "接続を削除",
      },
      use_nsec: {
        title: "自分の秘密鍵を使う",
        description:
          "Nostr の秘密鍵（nsec）をこのウォレットに貼り付けます。おすすめしません。",
        delete_tooltip: "秘密鍵を削除",
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
        "Nostr 経由で支払いを受け取ります。オンにすると、ウォレットが Nostr リレーを監視します。",
      enable_toggle: "支払いリクエストを有効にする",
      claim_automatically: {
        toggle: "自動的に請求",
        description:
          "受け取った支払いを確認なしで残高に追加します。オフのときは 1 件ずつ受け取ります。",
      },
    },
    nostr_wallet_connect: {
      title: "Nostrウォレットコネクト (NWC)",
      description:
        "Nostr Wallet Connect で、他のアプリがこのウォレットから支払えるようにします。",
      enable_toggle: "Nostr Wallet Connect を有効にする",
      payments_note:
        "NWCはBitcoin残高からの支払いにのみ使用できます。支払いはアクティブなミントから行われます。",
      connection: {
        copy_tooltip: "接続文字列をコピー",
        qr_tooltip: "QRコードを表示",
        allowance_label: "残りアローワンス (sat)",
      },
    },
    hardware_features: {
      webnfc: {
        title: "NFC カードの形式",
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
          title: "バイナリ",
          description: "トークンをバイナリデータとして保存",
        },
        quick_access: {
          toggle: "NFCへのクイックアクセス",
          description:
            "「ecash を受け取る」画面にカード読み取り用の NFC ボタンを追加します。",
        },
      },
    },
    p2pk_features: {
      title: "ロックされた ecash",
      description:
        "試験的な機能です。少額で使ってください。秘密鍵をなくすと、その鍵でロックされた ecash は誰も開けられなくなります。",
      generate_button: "キーを生成",
      import_button: "秘密鍵をインポート",
      quick_access: {
        toggle: "受け取り画面にロック鍵を表示",
        description:
          "「ecash を受け取る」画面にロック鍵を表示し、送信者があなた宛てに ecash をロックできるようにします。",
      },
      keys_expansion: {
        label: "{count}個のキーをブラウズするにはクリック",
        used_badge: "使用済み",
      },
    },
    privacy: {
      title: "プライバシー",
      network_title: "ネットワーク確認",
      description: "これらの設定はプライバシーに影響します。",
      check_incoming: {
        toggle: "着信請求書をチェック",
        description:
          "最新の請求書をバックグラウンドで確認します。更新は速くなりますが、フィンガープリントされやすくなります。",
      },
      check_startup: {
        toggle: "起動時に保留中の請求書をチェック",
        description: "ウォレットを開いたときに保留中の請求書を確認します。",
      },
      check_all: {
        toggle: "すべての請求書をチェック",
        description:
          "未払いの請求書を最大 2 週間バックグラウンドで確認します。オンラインでの活動が増え、フィンガープリントされやすくなります。",
      },
      check_sent: {
        toggle: "送信されたecashをチェック",
        description:
          "送った ecash が受け取られたかをバックグラウンドで確認します。オンラインでの活動が増え、フィンガープリントされやすくなります。",
      },
      websockets: {
        toggle: "WebSocketsを使用",
        description:
          "ミントと常時接続し、支払いの状況をすぐに受け取ります。速くなりますが、フィンガープリントされやすくなります。",
      },
      bitcoin_price: {
        title: "ビットコイン価格",
        toggle: "Coinbaseから為替レートを取得",
        description:
          "coinbase.com からビットコイン価格を取得し、残高を法定通貨で表示します。",
        currency: {
          title: "法定通貨",
          description: "Bitcoin価格表示用の法定通貨を選択してください。",
        },
      },
    },
    experimental: {
      title: "実験的な機能",
      description: "これらの機能は実験的です。",
      receive_swaps: {
        toggle: "スワップを受け取る",
        badge: "ベータ",
        description:
          "受け取った ecash を使用中のミントにスワップできるようにします。",
      },
      auto_paste: {
        toggle: "ecash を自動で貼り付け",
        description:
          "「ecash を受け取る」を開くと、クリップボードの ecash を貼り付けます。iOS で表示が乱れる場合はオフにしてください。",
      },
      auditor: {
        toggle: "監査人を有効にする",
        badge: "ベータ",
        description:
          "第三者のミント監査サービスによる信頼性データをミントの詳細に表示します。",
        url_label: "監査人URL",
        api_url_label: "監査人API URL",
      },
      multinut: {
        toggle: "マルチナットを有効にする",
        description: "複数のミントから同時に請求書を支払います。",
      },
      nostr_mint_backup: {
        toggle: "ミント一覧を Nostr にバックアップ",
        description:
          "ミント一覧を Nostr リレーにバックアップし、別のデバイスで復元できるようにします。",
        notifications: {
          enabled: "Nostrミントのバックアップが有効になりました",
          disabled: "Nostrミントのバックアップが無効になりました",
          failed: "Nostrミントのバックアップを有効にできませんでした",
        },
      },
    },
    appearance: {
      keyboard: {
        title: "オンスクリーンキーボード",
        description: "金額入力に数字キーボードを使用します。",
        toggle: "数字キーボードを使用",
        toggle_description: "金額の入力に数字キーパッドを使います。",
      },
      theme: {
        title: "テーマ",
        description: "ウォレットの外観を変更します。",
        tooltips: {
          mono: "モノ",
          cyber: "サイバー",
          freedom: "フリーダム",
          nostr: "Nostr",
          bitcoin: "ビットコイン",
          mint: "ミント",
          nut: "ナッツ",
          blu: "ブルー",
          flamingo: "フラミンゴ",
        },
      },
      bip177: {
        title: "ビットコインシンボル",
        description: "金額を 2,789 sats ではなく ₿2,789 と表示します。",
        toggle: "₿シンボルを使用",
      },
    },
    web_of_trust: {
      title: "信頼のウェブ",
      known_pubkeys: "既知の公開鍵：{wotCount}",
      continue_crawl: "クロールを続行",
      crawl_odell: "Odell の信頼の輪をインポート",
      crawl_wot: "信頼のウェブをクロール",
      pause: "一時停止",
      reset: "リセット",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      copy_lightning_address: "Lightningアドレスをコピー",
    },
    multinut: {
      use_multinut: "複数ミントでの支払い",
    },
    advanced: {
      notifications: {
        reserved_unset: "予約済みのプルーフをすべて解除しました",
        removed_spent: "使用済みのプルーフを {count} 件削除しました",
        no_spent: "使用済みのプルーフは見つかりませんでした",
        invalid_backup: "バックアップファイルの形式が無効です",
        read_error: "ファイルの読み込みエラー",
      },
      title: "高度な設定",
      developer: {
        title: "開発者設定",
        description: "トラブルシューティングとデバッグ用のツールです。",
        new_seed: {
          button: "新しいシードフレーズを生成",
          description:
            "新しいシードフレーズを作成します。その後、新しいシードで復元できるよう残高を自分宛てに送ってください。",
          confirm_question: "新しいシードフレーズを生成してもよろしいですか？",
          cancel: "キャンセル",
          confirm: "確認",
        },
        remove_spent: {
          button: "使用済み証明書を削除",
          description:
            "使用中のミントが使用済みと報告した ecash を削除します。ウォレットが動かなくなったときだけ使ってください。",
        },
        debug_console: {
          button: "デバッグコンソール",
          description:
            "JavaScript コンソールを開きます。理解できないコードは絶対に貼り付けないでください。詐欺師が資金を盗むのに使います。",
        },
        export_proofs: {
          button: "アクティブな証明書をエクスポート",
          description:
            "使用中のミントの選択した単位の残高を、1 つの ecash トークンとしてコピーします。",
        },
        keyset_counters: {
          title: "キーセットカウンターをインクリメント",
          description:
            "キーセットをタップするとカウンターが増えます。「outputs have already been signed」エラーの対処に役立ちます。",
          counter: "カウンター: {count}",
        },
        unset_reserved: {
          button: "すべての予約済みトークンを解除",
          description:
            "保留中の送金のために確保された ecash を解放し、再び使えるようにします。その後「使用済み証明書を削除」を実行してください。",
        },
        show_onboarding: {
          button: "オンボーディングを表示",
          description: "オンボーディング画面を再度表示します。",
        },
        reset_wallet: {
          button: "ウォレットデータをリセット",
          description:
            "このデバイス上のウォレットデータをすべて削除します。先にバックアップをエクスポートしてください。",
          confirm_question: "ウォレットデータを削除してもよろしいですか？",
          cancel: "キャンセル",
          confirm: "ウォレットを削除",
        },
        export_wallet: {
          button: "ウォレットデータをエクスポート",
          description:
            "ようこそ画面でインポートできるバックアップファイルをダウンロードします。ウォレットを使い続けると内容が古くなります。",
        },
        import_wallet: {
          description:
            "このウォレットのデータを、エクスポートしたバックアップファイルで置き換えます。",
          button: "ウォレットのバックアップをインポート",
          confirm_question: "ウォレットデータを復元してもよろしいですか？",
          cancel: "キャンセル",
          confirm: "バックアップをインポート",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "ミントを追加",
    subtitle:
      "このウォレットが保持する ecash はミントが発行します。始めるには、ミントを追加するか、ミントから ecash を受け取ってください。",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "ecash を受け取る",
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
    title: "Cashu.me は別のタブで開いています",
    text: "もう一方のタブを閉じてから「再試行」をタップしてください。",
    actions: {
      retry: {
        label: "再試行",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "このページは存在しません",
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
    },
  },
  WelcomeSlide1: {
    terms_agreement: "続行すると、{terms}に同意したことになります",
    title: "Cashu.me へようこそ",
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
    title: "Cashu.me をインストール",
    alt: { pwa_example: "PWA のインストール例" },
    installing: "インストール中…",
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
        text: "インストールしたら、このブラウザのタブを閉じて、ホーム画面から Cashu.me を開いてください。",
      },
    },
    pwa: {
      success: {
        title: "成功！",
        text: "CashuをPWAとして使用しています。他の開いているブラウザウィンドウをすべて閉じ、ホーム画面からアプリを使用してください。",
        nextSteps: "このブラウザタブを閉じて、ホーム画面からアプリを開けます。",
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
    english_only: "法的文書は英語のみで提供されています。",
    title: "利用規約",
    actions: {
      more: {
        label: "Cashu.me を使う前にお読みください",
      },
    },
    inputs: {
      checkbox: {
        label: "これらの規約と条件を読み、同意します",
      },
    },
  },
  WelcomeSlideChoice: {
    title: "ウォレットをセットアップ",
    text: "シードフレーズから復元しますか？ それとも新しいウォレットを作成しますか？",
    options: {
      new: {
        title: "新しいウォレットを作成",
        subtitle: "新しいシードを生成してミントを追加します。",
      },
      recover: {
        title: "ウォレットを復元",
        subtitle: "シードフレーズを入力し、ミントとecashを復元します。",
      },
    },
  },
  WelcomeMintSetup: {
    title: "ミントを追加",
    text: "ミントはecashの送受信を助けるサーバーです。検出されたミントを選ぶか、手動で追加できます。後で追加することもできます。",
    sections: { your_mints: "あなたのミント" },
    restoring: "ミントを復元中…",
    placeholder: { mint_url: "https://" },
  },
  WelcomeRecoverSeed: {
    title: "シードフレーズを入力",
    text: "復元のために12語のシードフレーズを貼り付けるか入力してください。",
    inputs: { word: "単語 { index }" },
    actions: { paste_all: "すべて貼り付け" },
    disclaimer:
      "シードフレーズはローカルでのみ使用され、ウォレットの鍵を導出します。",
  },
  WelcomeRestoreEcash: {
    title: "ecash を復元",
    text: "設定済みミントで未使用のproofをスキャンし、ウォレットに追加します。",
  },
  MintRatings: {
    web_of_trust_hop: "あなたの信頼の輪の中（{hop} ホップ）",
    no_mint_url: "ミントの URL が指定されていません",
    title: "ミントのレビュー",
    reviews: "レビュー",
    ratings: "{n} 件の評価",
    no_reviews: "まだレビューはありません",
    your_review: "あなたのレビュー",
    no_reviews_to_display: "表示するレビューはありません。",
    no_rating: "評価なし",
    stars_label: "5つ星中{rating}",
    out_of: "のうち",
    rows: "Reviews",
    sort: "並び替え",
    sort_options: {
      newest: "新しい順",
      oldest: "古い順",
      highest: "高い順",
      lowest: "低い順",
    },
    actions: { write_review: "レビューを書く" },
    empty_state_subtitle:
      "このミントの最初のレビューを書きましょう。あなたの体験が他の人の選択に役立ちます。",
    range: "{total} 件中 {from}–{to} 件",
  },
  CreateMintReview: {
    connect_nostr:
      "レビューを公開するには、設定で Nostr アカウントを接続してください。",
    published: "レビューを公開しました",
    publish_failed: "レビューを公開できませんでした",
    title: "ミントをレビュー",
    publishing_as: "次として公開",
    inputs: {
      rating: { label: "評価" },
      review: { label: "レビュー（任意）" },
    },
    actions: {
      publish: { label: "レビューを公開", in_progress: "公開中…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "シードフレーズから復元",
      caption:
        "復元する前に、このシードで使ったすべてのミントを追加してください。",
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
        "復元するミントを選んでください。足りないミントは先に「ミント」タブから追加してください。",
    },
    actions: {
      paste: {
        error: "クリップボードの内容の読み取りに失敗しました。",
      },
      validate: {
        error: "ニーモニックは少なくとも12単語である必要があります。",
      },
      select_all: {
        label: "すべて選択",
      },
      deselect_all: {
        label: "すべて選択解除",
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
      restore_selected_mints: {
        label: "選択したミントを復元（{count}）",
        in_progress: "{length}個のミントのうち{index}個を復元しています…",
        success: "{count}個のミントを正常に復元しました",
        error: "選択したミントの復元中にエラーが発生しました: {error}",
      },
    },
    nostr_mints: {
      label: "Nostr からミントを復元",
      caption:
        "シードフレーズを使用してNostrリレーに保存されているミントのバックアップを検索します。これにより、以前使用したミントを発見できます。",
      search_button: "ミントのバックアップを検索",
      select_all: "すべて選択",
      deselect_all: "すべて選択解除",
      backed_up: "バックアップ済み",
      already_added: "追加済み",
      add_selected: "選択したものを追加 ({count})",
      no_backups_found: "ミントのバックアップが見つかりません",
      no_backups_hint:
        "ミントリストを自動的にバックアップするには、設定でNostrミントのバックアップが有効になっていることを確認してください。",
      invalid_mnemonic: "検索する前に有効なシードフレーズを入力してください。",
      search_error: "ミントのバックアップの検索に失敗しました。",
      add_error: "選択したミントの追加に失敗しました。",
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
          label: "QR コードをスキャン",
        },
      },
    },
    discover: {
      title: "ミントを発見",
      overline: "発見",
      caption: "Nostr で他の人がおすすめしているミント。",
      actions: {
        discover: {
          label: "ミントを発見",
          in_progress: "読み込み中…",
          error_no_mints: "ミントが見つかりませんでした",
          success: "{ length }個のミントが見つかりました",
        },
      },
      unnamed: "名前のないミント",
      empty: {
        title: "ミントを探す",
        text: "Cashu.me は Nostr リレーに、ほかの人がおすすめするミントを評価やレビューと一緒に問い合わせます。",
      },
      recommendations: {
        overline: "{ length }個のミントが見つかりました",
        caption: "ミントを使う前に自分で調べてください。",
        actions: {
          browse: {
            label: "ミントをブラウズするにはクリック",
          },
        },
      },
    },
    swap: {
      title: "スワップ",
      overline: "ミント間スワップ",
      caption:
        "ライトニング経由でミント間の資金を移動します。手数料がかかる場合があります。",
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
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
        receove_to_trusted_mint: { label: "信頼できるミントで受け取る" },
      },
    },
    error_badge: "エラー",
    reviews_text: "件のレビュー",
    no_reviews_yet: "まだレビューはありません",
    discover_mints_button: "ミントを発見",
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
    title: "Lightningを受け取る",
    create_invoice_title: "請求書を作成",
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
        label_blocked: "請求書作成中",
        in_progress: "作成中",
      },
    },
    invoice: {
      caption: "Lightning請求書",
      status_paid_text: "支払い済み",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        copy: {
          label: "請求書をコピー",
        },
      },
    },
  },
  SendDialog: {
    captions: {
      ecash: "トークンまたは QR コードを共有",
      lightning: "請求書またはアドレスに支払う",
      onchain: "ビットコインアドレスへ送金",
    },
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
    badge_locked: "ロック済み",
    title: "ecash を送る",
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
        label: "ecash をコピー",
      },
      copy_link: {
        tooltip_text: "リンクをコピー",
      },
      share: {
        tooltip_text: "ecashトークンを共有",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      paste_p2pk_pubkey: {
        tooltip_text: "@:global.actions.paste.label",
      },
      send: {
        label: "@:global.actions.send.label",
        in_progress: "送信中…",
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
      pay: { label: "@:global.actions.pay.label" },
    },
    errors: {
      amount_required: "先に金額を入力してください。",
      serialization_failed: "ecash トークンを準備できませんでした。",
      mint_not_allowed_by_request:
        "選択したミントはこの支払いリクエストでは使えません。",
    },
  },
  ReceiveDialog: {
    captions: {
      ecash: "トークンを貼り付け、スキャン、またはリクエスト",
      lightning: "請求書を作成して受け取る",
      onchain: "ビットコインアドレスを取得",
    },
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
    title: "ecash を受け取る",
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
    receiving_amount: "{amount} を受け取り中",
    title: "ecash を受け取る",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "Cashuトークンを貼り付け",
      },
    },
    errors: {
      invalid_token: {
        label: "無効なトークン",
      },
      p2pk_lock_mismatch: {
        label:
          "受信できません。このトークンのP2PKロックがあなたの公開鍵と一致しません。",
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
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "信頼できるミントにスワップ",
        caption: "{ value }をスワップ",
        processing: "スワップ中…",
        failed: "スワップに失敗しました",
      },
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "スワップをキャンセル",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      later: {
        label: "後で受け取る",
        tooltip_text: "後で受け取るために履歴に追加",
        already_in_history_success_text: "ecash はすでに履歴にあります",
        added_to_history_success_text: "ecash を履歴に追加しました",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "NFCカードから読み取り",
          ndef_unsupported_text: "NDEF非対応",
        },
      },
      receive_to_selected_mint: { label: "選択したミントで受け取る" },
    },
    unknown_mint_info_text:
      "不明なミントです。このトークンを受け取ると追加されます。",
    swap_section: {
      title: "スワップ",
      source_label: "送金元",
      destination_label: "送金先",
      fee_info:
        "このスワップにはライトニングネットワークの手数料がかかります。",
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "ロック鍵",
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
    received_total: "受け取り合計",
    no_payments_yet: "まだ支払いはありません",
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
    title: "ミントからのメッセージ",
  },
  MintDetailsDialog: {
    qr: {
      show: "QRコードを表示",
      hide: "QRコードを隠す",
    },
    contact: {
      title: "連絡先",
    },
    details: {
      title: "ミント詳細",
      url: {
        label: "URL",
      },
      nuts: {
        label: "対応 NUT",
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
        label: "単位",
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
    available_text: "（このミント）",
    sheet_title: "ミントを選択",
    placeholder: "ミントを選択",
  },
  HistoryTable: {
    empty_text: "履歴はまだありません",
    row: {
      type_label: "Ecash",
      date_label: "{ value }前",
    },
    actions: {
      filter_ecash_only: {
        label: "ecash のみ",
      },
      check_status: {
        tooltip_text: "ステータスを確認",
      },
      receive: {
        tooltip_text: "受け取る",
      },
      filter_pending: {
        label: "保留中のみ表示",
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
        label: "保留中のみ表示",
      },
      show_all: {
        label: "すべて表示",
      },
    },
  },
  RemoveMintDialog: {
    title: "このミントを削除しますか？",
    nickname: {
      label: "ニックネーム",
    },
    balances: {
      label: "残高",
    },
    warning_text:
      "このミントの ecash はこのデバイスに残ります。ミントを再度追加すると元に戻ります。",
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
  ParseInputComponent: {
    placeholder: {
      default: "CashuトークンまたはLightningアドレス",
      receive: "Cashuトークン",
      pay: "Lightningアドレスまたは請求書",
    },
    qr_scanner: {
      title: "QR コードをスキャン",
      description: "カメラを QR コードに向けてください",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    onchain: {
      title: "オンチェーンで支払う",
      address_placeholder: "Bitcoin アドレス",
      choose_speed: "承認速度を選択",
      blocks: "{n} ブロック",
      estimated_confirmation: "推定承認時間",
      fee_reserve: "手数料の予備",
    },
    multinut: {
      label: "複数のミントで支払う",
    },
    quote: {
      label: "見積もり",
    },
    input_data: {
      title: "ライトニングで支払う",
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
      title_bolt12: "ライトニングのオファーを支払う",
    },
    lnurlpay: {
      amount_exact_label:
        "{ payee }が{ value } { ticker }をリクエストしています",
      amount_range_label:
        "{ payee }が{ min }から{ max } { ticker }の間をリクエストしています",
      sending_to_lightning_address: "{ address }に送信中",
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
      paying: "支払い中",
      paid: "支払い済み",
      fee: "手数料",
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
          waiting_for_wallet: "ウォレットを待機中…",
          error: "エラー",
        },
      },
    },
  },
  EditMintDialog: {
    title: "ミントを編集",
    inputs: {
      nickname: {
        placeholder: "例: Testnet",
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
      "信頼できる場合にのみこのミントに参加してください。運営が止まると、そこで保有している ecash は失われます。",
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
    audit_info: {
      label: "監査情報",
      actions: {
        show: {
          label: "表示",
        },
        hide: {
          label: "隠す",
        },
      },
    },
    unreachable_error_text:
      "このミントに接続できません。URL と接続を確認して、もう一度お試しください。",
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
  swap: {
    in_progress_warning_text: "スワップ進行中",
    invalid_swap_data_error_text: "無効なスワップデータ",
    swap_error_text: "スワップエラー",
  },
  TokenInformation: {
    fee: "手数料",
    unit: "単位",
    fiat: "フィアット",
    p2pk: "P2PK",
    locked: "ロック済み",
    locked_to_you: "あなたにロック済み",
    mint: "ミント",
    memo: "メモ",
    payment_request: "支払いリクエスト",
    nostr: "Nostr",
    token_copied: "トークンをクリップボードにコピーしました",
  },
  common: {
    copied: "コピーしました",
    on_chain: "オンチェーン",
    pending: "保留中",
    delete: "削除",
    copy_npub: "npub をコピー",
    back: "戻る",
    refresh: "更新",
    settings: "設定",
    backspace: "1文字削除",
    swap_input_mode: "金額/法定通貨の入力を切り替え",
    fee: "手数料",
  },
  SendPaymentRequest: {
    actions: {
      pay: { label: "支払う" },
      pay_via: { label: "{transport} で支払う" },
    },
    info: {
      pay_failed: "リクエストを支払えませんでした",
      pay_to: "{target} に支払う",
      invalid_url: "無効な URL",
    },
  },
  PaymentRequestInfo: {
    title_with_transport: "{transport} 経由の支払いリクエスト",
    title: "支払いリクエスト",
    subtitle: "{target} に支払う",
    subtitle_fallback: "支払いリクエスト",
    invalid_url: "無効な URL",
  },
  QuoteInformation: {
    amount: "金額",
    fee_reserve: "手数料の予備",
    fee_paid: "支払った手数料",
    unit: "単位",
    status: "ステータス",
    network: "ネットワーク",
    transaction_id: "トランザクション ID",
    chain_status: "チェーン上の状態",
    fetching: "取得中",
    paid_at: "支払日時",
    preimage: "プリイメージ",
    preimage_copied: "プリイメージをコピーしました",
    mint: "ミント",
    method: "方法",
    lightning_offer: "Lightning オファー",
    chain_confirmed: "承認済み",
    chain_pending: "保留中",
    states: {
      paid: "支払い済み",
      unpaid: "未払い",
      pending: "保留中",
      issued: "発行済み",
      expired: "期限切れ",
      failed: "失敗",
    },
  },
  MintAuditInfo: {
    title: "監査情報",
    loading: "監査情報を読み込み中...",
    not_audited: "このミントはまだ監査されていません。",
    not_audited_text:
      "監査者について詳しく知る、または今後の監査を支援するには、{link} にアクセスするか、{here} をクリックして ecash を寄付し、このミントの監査開始を支援してください。",
    here: "こちら",
    unavailable: "現在、監査情報を利用できません。",
    load_failed: "ミントのデータを読み込めませんでした",
    success_rate: "成功率",
    swaps_count: "{total} 件中 {successful} 件のスワップ",
    average_time: "平均時間",
    average_time_caption: "成功したスワップ",
    disclaimer:
      "監査データは、ミントの信頼性を長期的に評価するために独立した第三者によって提供されています。ただし、これらの結果は参考情報にすぎず、いかなるミントの安全性、支払能力、信頼性も保証するものではありません。サービスを利用する前に、必ずご自身で調査し、ミント運営者を信頼できることを確認してください。",
    donate_text:
      "監査情報は {link} によって提供されています。このミントについて監査者が現在保有している残高は {balance} で、これまでの寄付総額は {donations} です。継続的な監査を支援するには、{press_here}して監査者に ecash を寄付できます。",
    press_here: "こちらをタップ",
    sats_amount: "{amount} sats",
    warnings_title: "監査者の警告",
    warnings: {
      last_swap_failed: "直近のスワップは失敗しました。",
      recent_success:
        "過去 {days} 日間のスワップ {total} 件中 {successful} 件が成功しました。",
      reliable:
        "{base} ただし、{success} このミントは信頼できるようです。失敗の原因は受信側のミントかもしれません。",
      unreliable: "{base} {success} このミントは信頼性が低い可能性があります。",
      unknown: "監査者はまだこのミントの品質を判断できていません。",
      not_enough_data:
        "監査者はこのミントに関する最近のデータを十分に持っていません。過去 {days} 日間に成功したスワップは {count} 件のみです。",
      low_success:
        "過去 {days} 日間、このミントの成功率は {rate}% で、推奨値の {threshold}% を下回っています。",
      inactive:
        "このミントでは {days} 日間スワップがありません。接続できない可能性があります。",
      slow: "このミントは低速です。このミントからの支払いには平均 {seconds} 秒かかりました。",
      no_successful:
        "このミントで成功したスワップの記録はありません。接続できない可能性があります。",
    },
    chart: {
      now: "現在",
      today: "今日",
      yesterday: "昨日",
      invalid_date: "無効な日付",
      swaps: "スワップ:",
      success_rate: "成功率:",
      time_range: "期間:",
    },
  },
  DisplayTokenComponent: {
    title: {
      send: "ecash を送る",
      sent: "ecash 送信済み",
      received: "ecash 受信済み",
    },
    qr_speed: "QR の速度: {value}",
    qr_size: "QR のサイズ: {value}",
    speed: {
      fast: "速い",
      medium: "普通",
      slow: "遅い",
    },
    size: {
      large: "大",
      medium: "中",
      small: "小",
    },
    delete_dialog: {
      title: "ecash を削除",
      text: "この取引を履歴から削除してもよろしいですか？",
      warning:
        "警告: この操作は元に戻せず、トークンを復元する方法はありません。",
    },
    nfc: {
      read_failed: "NFC の読み取りに失敗しました",
      write_failed: "NFC の書き込みに失敗しました",
      error: "NFC エラー",
      writing: "NFC カードに書き込み中...",
      success: "トークンをカードに書き込みました！",
      capacity:
        "カードの容量が不足している可能性があります（{bytes} バイト必要）。",
    },
  },
  CreateInvoiceDialog: {
    onchain_title: "オンチェーンで受け取る",
    bolt12_title: "Bolt12 で受け取る",
    mint_unreachable: "ミントに接続できません",
    mint_unreachable_text: "支払いを受け取るにはミントに再接続してください。",
    reconnect_mint: "ミントに再接続",
    checking_address: "アドレスを確認中...",
    add_amount: "金額を追加",
    new_offer: "新しいオファー",
    create_offer: "オファーを作成",
    create_new_address: "新しいアドレスを作成",
    create_address: "アドレスを作成",
    onchain_unsupported:
      "このミントはこの単位でのオンチェーン入金に対応していません。",
    deposit_limits: {
      outside: "{min}–{max} の範囲外の入金は反映されません。",
      below: "{min} 未満の入金は反映されません。",
      above: "{max} を超える入金は反映されません。",
    },
    amount_errors: {
      positive_decimal:
        "{unit} で小数点以下 2 桁までの正の金額を入力してください。",
      positive_whole: "{unit} で正の整数の金額を入力してください。",
      min: "{amount} 以上を入力してください。",
      max: "{amount} 以下を入力してください。",
    },
  },
};
