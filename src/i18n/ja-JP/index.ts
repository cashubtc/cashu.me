export default {
  MultinutPicker: {
    dialog_title: "複数のミントで支払い",
    pay_using_multiple: "複数のミントを使って支払う",
    experimental_title: "試験的な機能",
    experimental_text:
      "この機能は非常に試験的で、期待どおりに動作しない場合があります。すでに支払い済みの請求書を支払おうとしないでください。資金を失う可能性があります。",
    understand: "理解しました",
    select_funds: "支払いに使うミントを選んでください。",
    pay_invoice: "請求書を支払う",
    amount_mismatch: "金額の計算エラー：{calculated}（想定 {expected}）",
    states: {
      requesting: "リクエスト中…",
      paying: "支払い中…",
      success: "成功",
      failed: "失敗",
    },
    paid: "Lightningで{amount}を支払いました",
  },
  global: {
    notifications: "通知",
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
      show_qr: {
        label: "QRコードを表示",
      },
      show_seed: {
        label: "シードフレーズを表示",
      },
      hide_seed: {
        label: "シードフレーズを隠す",
      },
      scan: {
        label: "スキャン",
      },
      more_options: {
        label: "その他のオプション",
      },
      clear: {
        label: "クリア",
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
      fee: "（手数料：{fee}）",
      could_not_request_mint: "ミントをリクエストできませんでした",
      invoice_still_pending: "請求書はまだ処理中です",
      paid_lightning: "Lightningで{amount}を支払いました",
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
      trying_again: "再試行中...",
      unsupported_legacy_qr: "サポートされていない旧形式の QR コード",
      legacy_qr_not_supported:
        "この旧形式の QR コードは対応している加盟店のものではありません",
      no_bolt12_mint: "BOLT12 オファーに対応しているミントがありません",
      no_bolt11_mint: "BOLT11 請求書に対応しているミントがありません",
      address_not_paid: "アドレスへの支払いはまだありません",
      payment_pending: "支払いは処理中です",
      invoice_already_paid: "請求書はすでに支払われています",
      payment_sent: "支払いを送信しました",
      payment_failed: "支払いに失敗しました",
      could_not_pay_request: "リクエストを支払えませんでした",
      request_unit_unsupported:
        "この支払いリクエストの単位はミントでサポートされていません：{unit}",
      no_onchain_mint: "オンチェーン支払いに対応しているミントがありません",
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
        mint_validation_error: "ミントの検証エラー",
        removed: "ミントが削除されました",
        error: "ミントエラー",
      },
    },
  },
  MainHeader: {
    menu: {
      terms: {
        terms: {
          title: "規約",
          caption: "Cashu.me の利用で同意する内容",
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
  Settings: {
    menu: {
      title: "設定",
      backup: {
        title: "バックアップと復元",
        caption: "シードフレーズとecashの復元",
      },
      lightning_address: {
        title: "ライトニングアドレス",
        caption: "name{'@'}domain で支払いを受け取る",
      },
      nostr: {
        title: "Nostr",
        caption: "鍵、リレー、信頼のウェブ",
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
        caption: "自分の鍵にロックされた ecash を受け取る",
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
    },
    sections: {
      nostr: {
        relays: {
          already_added: "リレーはすでに追加されています",
          add: {
            title: "リレーを追加",
            description:
              "ウォレットは、支払いリクエスト、Nostr Wallet Connect、バックアップなどの Nostr 機能にこれらのリレーを使います。",
          },
          list: {
            title: "リレー",
            copy_tooltip: "リレーをコピー",
            remove_tooltip: "リレーを削除",
          },
        },
      },
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
      },
    },
    lightning_address: {
      server_url: {
        label: "npub.cash サーバー",
        hint: "ホスト名または HTTPS URL を入力",
        invalid: "有効な HTTPS サーバー URL を入力してください",
      },
      title: "ライトニングアドレス",
      enable: {
        toggle: "ライトニングアドレスを使う",
        description: "npub.cash のアドレスで支払いを受け取る",
      },
      address: {
        label: "あなたのアドレス",
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
        copy_nsec: "秘密鍵をコピー（nsec）",
      },
      nsec_bunker: {
        title: "リモート署名",
        description: "NIP-46 バンカーで署名",
        delete_tooltip: "接続を削除",
      },
      use_nsec: {
        title: "自分の Nostr 秘密鍵を使う（nsec）",
        description: "この方法は危険であり推奨されません",
        delete_tooltip: "秘密鍵を削除",
      },
      signing_extension: {
        title: "署名拡張機能",
        description: "NIP-07署名拡張機能を使用",
        not_found: "NIP-07署名拡張機能が見つかりません",
      },
    },
    payment_requests: {
      description:
        "Nostr 経由で支払いを受け取ります。オンにすると、ウォレットが Nostr リレーを監視します。",
      enable_toggle: "支払いリクエストを有効にする",
      claim_automatically: {
        toggle: "自動的に請求",
        description:
          "すでに利用しているミントから届いた支払いを、確認なしで残高に追加します。それ以外の場合は 1 件ずつ確認します。",
      },
    },
    nostr_wallet_connect: {
      description:
        "Nostr Wallet Connect（NWC）を通じて、他のアプリがこのウォレットから支払い、請求書を作成し、残高と履歴を確認できるようにします。",
      enable_toggle: "Nostr Wallet Connect を有効にする",
      payments_note:
        "NWCはBitcoin残高からの支払いにのみ使用できます。支払いはアクティブなミントから行われます。",
      connection: {
        copy_tooltip: "接続文字列をコピー",
        qr_tooltip: "QRコードを表示",
        allowance_label: "残りアローワンス（sat）",
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
      description:
        "鍵を生成またはインポートして、ロックされた ecash（P2PK）を受け取ります。試験的な機能なので、少額で使ってください。秘密鍵をなくすと、その鍵にロックされた ecash を使えなくなる可能性があります。",
      generate_button: "キーを生成",
      import_button: "秘密鍵をインポート（nsec）",
      quick_access: {
        toggle: "「ecash を受け取る」にロックボタンを表示",
        description:
          "「ecash を受け取る」にロックボタンを追加します。開いて公開鍵を共有すると、送信者があなた宛てに ecash をロックできます。",
      },
      keys_expansion: {
        label: "公開鍵（{count}）",
        used_badge: "使用済み",
      },
    },
    privacy: {
      network_title: "ネットワーク確認",
      description: "これらの設定はプライバシーに影響します。",
      check_incoming: {
        toggle: "着信請求書をチェック",
        description:
          "最新の請求書をバックグラウンドで確認します。更新は速くなりますが、フィンガープリントされやすくなります。オフのときは履歴で請求書を自分で確認してください。",
      },
      check_startup: {
        toggle: "起動時に保留中の請求書をチェック",
        description: "ウォレットを開いたときに保留中の請求書を確認します。",
      },
      check_all: {
        toggle: "すべての請求書をチェック",
        description:
          "未払いの請求書を最大 2 週間バックグラウンドで確認します。オンラインでの活動が増え、フィンガープリントされやすくなります。オフのときは履歴で請求書を自分で確認してください。",
      },
      check_sent: {
        toggle: "送信されたecashをチェック",
        description:
          "送った ecash が受け取られたかをバックグラウンドで確認します。オンラインでの活動が増え、フィンガープリントされやすくなります。",
      },
      websockets: {
        toggle: "WebSocketsを使用",
        description:
          "ミントと常時接続し、支払いと使用済み ecash の更新情報を受け取ります。速くなりますが、フィンガープリントされやすくなります。",
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
      receive_swaps: {
        toggle: "スワップを受け取る",
        badge: "ベータ",
        description:
          "受け取った ecash を使用中のミントにスワップできるようにします。",
      },
      auto_paste: {
        toggle: "ecash を自動で貼り付け",
        description:
          "「トークンを貼り付け」をタップすると、クリップボードの ecash を貼り付けます。iOS で不具合が起きる場合はオフにしてください。",
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
        description:
          "Lightning の請求書を支払うときに「複数のミントで支払う」オプションを追加します。",
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
      mode: {
        title: "モード",
        dark: "ダーク",
        light: "ライト",
      },
      keyboard: {
        title: "オンスクリーンキーボード",
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
      crawl_odell: "Odell の信頼のウェブをクロール",
      crawl_wot: "信頼のウェブをクロール",
      pause: "一時停止",
      reset: "リセット",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    multinut: {
      use_multinut: "複数ミントでの支払い",
    },
    advanced: {
      backup_files_title: "バックアップファイル",
      danger_zone_title: "危険ゾーン",
      notifications: {
        reserved_unset: "証明書の予約をすべて解除しました",
        removed_spent: "削除した使用済み証明書：{count}",
        no_spent: "使用済みの証明書は見つかりませんでした",
        invalid_backup: "バックアップファイルの形式が無効です",
        read_error: "ファイルの読み込みエラー",
      },
      developer: {
        title: "開発者設定",
        description: "トラブルシューティングとデバッグ用のツールです。",
        new_seed: {
          button: "新しいシードフレーズを生成",
          description:
            "新しいシードフレーズを作成します。現在の ecash は古いシードフレーズに紐づいたままです。作成後に残高の全額を自分宛てに送らないと、新しいシードフレーズでは復元できません。",
          confirm_question: "新しいシードフレーズを生成してもよろしいですか？",
          cancel: "キャンセル",
          confirm: "確認",
        },
        remove_spent: {
          button: "使用済み証明書を削除",
          description:
            "選択した単位の ecash のうち、使用中のミントが使用済みと報告したものを削除します。ウォレットが動かなくなったときだけ使ってください。",
        },
        design_system: {
          title: "デザインシステム",
          description:
            "アプリの全コンポーネントを、ソースと使用箇所つきでライブ表示します。",
        },
        debug_console: {
          button: "デバッグコンソール",
          description:
            "JavaScript コンソールを開きます。理解できないコードは絶対に貼り付けないでください。詐欺師が資金を盗むのに使います。",
        },
        export_proofs: {
          button: "アクティブな証明書をエクスポート",
          description:
            "使用中のミントの選択した単位の残高を、1 つの ecash トークンとしてクリップボードにコピーします。残りはミントや単位を切り替えて、再度エクスポートしてください。",
        },
        keyset_counters: {
          title: "キーセットカウンターをインクリメント",
          increase: "{id} のカウンターを増やす",
          fixes:
            "「outputs have already been signed」の解消に役立つ場合があります",
          keysets: "{n} 個のキーセット | {n} 個のキーセット",
          sheet_hint: "+ をタップするとキーセットのカウンターが増えます。",
          column: "カウンター",
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
            "ようこそ画面でインポートできるバックアップファイルをダウンロードします。ウォレットを再び使った時点で、ファイルの内容は最新ではなくなります。",
        },
        import_wallet: {
          description:
            "エクスポートしたバックアップファイルをインポートします。バックアップ内の設定と記録が、このウォレットの対応するデータを上書きします。バックアップに含まれていないデータはそのまま残ります。",
          button: "ウォレットのバックアップをインポート",
          confirm_question:
            "このバックアップをウォレットにインポートしますか？",
          cancel: "キャンセル",
          confirm: "ウォレットのバックアップをインポート",
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
    panel: {
      expand: "履歴とミントを表示",
      collapse: "履歴とミントを隠す",
    },
    tabs: {
      history: {
        label: "履歴",
      },
      mints: {
        label: "ミント",
      },
    },
    install: {
      text: "インストール",
      tooltip: "Cashu.me をインストール",
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
    title: "このページは存在しません",
    text: "404",
    actions: {
      home: {
        label: "ホームに戻る",
      },
    },
  },
  BalanceView: {
    total_label: "合計残高",
    show_balance: "{unit}の残高を表示",
    mintError: {
      label: "ミントエラー",
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
          text: "メニューをタップ（右上）",
        },
        step2: {
          text: "{ buttonText }を押す",
          buttonText: "@:PwaPrompt.android.add",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          text: "共有をタップ（下）",
        },
        step2: {
          text: "{ buttonText }を押す",
          buttonText: "@:PwaPrompt.ios.add",
        },
      },
      outro: {
        text: "インストールしたら、このブラウザのタブを閉じて、ホーム画面から Cashu.me を開いてください。",
      },
    },
    pwa: {
      success: {
        title: "成功！",
        text: "Cashu.me を PWA として使用しています。他に開いているブラウザーウィンドウをすべて閉じ、ホーム画面からアプリを使用してください。",
        nextSteps: "このブラウザタブを閉じて、ホーム画面からアプリを開けます。",
      },
    },
  },
  PwaPrompt: {
    title: "Cashu.me をインストール",
    text: "ホーム画面から、ブラウザのバーなしで開けます。",
    ios: {
      share: "共有をタップ",
      add: "ホーム画面に追加",
    },
    android: {
      menu: "ブラウザのメニューを開く",
      add: "ホーム画面に追加",
    },
    install: "インストール",
    notNow: "後で",
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
    progress: { words_entered: "{count}/12 語を入力済み" },
    disclaimer:
      "シードフレーズはローカルでのみ使用され、ウォレットの鍵を導出します。",
  },
  WelcomeRestoreEcash: {
    title: "ecash を復元",
    text: "追加済みのミントで未使用の ecash を探し、ウォレットに復元します。",
  },
  MintRatings: {
    sort_and_filter: "並べ替えとフィルター",
    reviews_title: "レビュー",
    reviews_count: "{n} 件のレビュー | {n} 件のレビュー",
    web_of_trust_caption: "自分の信頼のウェブからのレビューのみ表示",
    web_of_trust_hop: "あなたの信頼のウェブ内（{hop} ホップ）",
    no_mint_url: "ミントの URL が指定されていません",
    reviews: "レビュー",
    no_reviews: "レビューが見つかりません",
    your_review: "あなたのレビュー",
    no_rating: "評価なし",
    stars_label: "5つ星中{rating}",
    out_of: "{max}点満点",
    sort: "並び替え",
    sort_options: {
      newest: "新しい順",
      oldest: "古い順",
      highest: "高い順",
      lowest: "低い順",
    },
    actions: { write_review: "レビューを書く" },
    empty_state_subtitle:
      "このミントでの体験を共有して、他の人の選択に役立てましょう。",
    range: "{total} 件中 {from}–{to} 件",
  },
  CreateMintReview: {
    connect_nostr:
      "レビューを公開するには、設定で Nostr アカウントを接続してください。",
    published: "レビューを公開しました",
    publish_failed: "レビューを公開できませんでした",
    title: "ミントをレビュー",
    publishing_as: "次として公開：",
    inputs: {
      rating: {
        label: "評価",
        hint: "レビューを公開するには評価を選んでください。",
      },
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
        },
      },
    },
    information: {
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
        error: "ミントの復元エラー：{ error }",
      },
      restore_selected_mints: {
        label: "選択したミントを復元（{count}）",
        success: "復元したミント：{count}",
        error: "選択したミントの復元中にエラーが発生しました：{error}",
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
      add_selected: "選択したものを追加（{count}）",
      no_backups_found: "ミントのバックアップが見つかりません",
      no_backups_hint:
        "ミントリストを復元するには、このシードフレーズで以前に作成したバックアップが必要です。今後の変更を保存するには、設定で Nostr のミントバックアップをオンにしてください。",
      invalid_mnemonic: "検索する前に有効なシードフレーズを入力してください。",
      search_error: "ミントのバックアップの検索に失敗しました。",
      add_error: "選択したミントの追加に失敗しました。",
    },
  },
  MintSettings: {
    see_reviews: "レビューを見る",
    add: {
      title: "ミントを追加",
      description:
        "接続するCashuミントのURLを入力します。このウォレットはどのミントにも関連付けられていません。",
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
      caption: "Nostr で他の人がおすすめしているミント。",
      actions: {
        discover: {
          label: "ミントを発見",
          in_progress: "読み込み中…",
        },
      },
      add: "追加",
      empty: {
        title: "ミントを探す",
        text: "Cashu.me は Nostr リレーに、ほかの人がおすすめするミントを評価やレビューと一緒に問い合わせます。",
      },
      recommendations: {
        overline: "{ length }個のミントが見つかりました",
        caption: "ミントを使う前に自分で調べてください。",
      },
    },
    swap: {
      title: "スワップ",
      caption:
        "Lightning 経由でミント間の資金を移動します。Lightning 手数料の分を残してください。資金が届かない場合は、履歴で保留中の請求書を確認してください。",
      inputs: {
        from: {
          label: "から",
        },
        to: {
          label: "へ",
        },
        amount: {
          label: "金額（{ ticker }）",
        },
      },
      actions: {
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
      },
    },
    error_badge: "エラー",
    switching_mint: "{mint} に切り替え中",
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
    actions: {
      create: {
        label: "請求書を作成",
        label_blocked: "作成中…",
      },
    },
    invoice: {
      caption: "Lightning請求書",
      status_paid_text: "支払い済み",
      actions: {
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
    inputs: {
      p2pk_pubkey: {
        label: "受信者の公開鍵",
        invalid: "有効な公開鍵（hex または npub）を入力してください",
      },
    },
    actions: {
      copy_emoji: {
        tooltip_text: "絵文字をコピー",
      },
      copy_tokens: {
        label: "トークンをコピー",
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
        label: "トークンを貼り付け",
      },
      scan: {
        label: "トークンをスキャン",
      },
      request: {
        label: "ecash をリクエスト",
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
      receive: {
        label: "@:global.actions.receive.label",
        label_known_mint: "@:ReceiveTokenDialog.actions.receive.label",
        label_adding_mint: "ミント追加中…",
      },
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "信頼できるミントにスワップ",
        processing: "スワップ中…",
        failed: "スワップに失敗しました",
      },
      cancel_swap: {
        tooltip_text: "スワップをキャンセル",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
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
      caption: "あなたのロック鍵",
      description: "このキーにロックされたecashを受け取る",
      used_warning_text:
        "警告：このキーは以前に使用されています。プライバシー向上のため新しいキーを使用してください。",
    },
    actions: {
      copy: {
        label: "公開鍵をコピー",
      },
      new_key: {
        label: "新しいキーを生成",
      },
    },
  },
  PaymentRequestDialog: {
    any_amount: "金額指定なし",
    payment_request: {
      caption: "支払いリクエスト",
    },
    request_index: "リクエスト {index}/{total}",
    actions: {
      set_amount: {
        label: "金額を設定",
      },
      copy: {
        label: "@:global.actions.copy.label",
      },
      new_request: {
        label: "新しいリクエスト",
      },
      share: {
        label: "共有",
      },
      add_amount: {
        label: "金額を追加",
      },
      use_active_mint: {
        label: "任意のミント",
      },
      remove_amount: {
        label: "金額を削除",
      },
      previous: {
        label: "前のリクエスト",
      },
      next: {
        label: "次のリクエスト",
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
  NWCDialog: {
    nwc: {
      caption: "Nostrウォレットコネクト",
      description:
        "NWCを使用してリモートでウォレットを制御します。互換性のあるアプリでウォレットをリンクするには、QRコードを押してください。",
      warning_text:
        "警告：この接続文字列にアクセスできる人は誰でもウォレットから支払いを開始できます。共有しないでください！",
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
      email: "メール",
    },
    details: {
      title: "ミント詳細",
      url: {
        label: "URL",
      },
      nuts: {
        label: "対応機能",
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
    nuts: {
      nut7: "トークン状態の確認",
      nut8: "ライトニング手数料の過払い分",
      nut9: "署名の復元",
      nut10: "支出条件",
      nut11: "公開鍵への支払い（P2PK）",
      nut12: "DLEQ 証明",
      nut13: "決定論的シークレット",
      nut14: "ハッシュタイムロック契約（HTLC）",
      nut15: "部分マルチパス支払い",
      nut16: "アニメーション QR コード",
      nut17: "WebSocket サブスクリプション",
      nut18: "支払いリクエスト",
      nut19: "キャッシュされたレスポンス",
      nut20: "ミント見積もりへの署名",
      nut21: "クリア認証",
      nut22: "ブラインド認証",
    },
  },
  UnitToggle: {
    label: "単位：{unit}、変更",
    bitcoin: "ビットコイン",
  },
  ChooseMint: {
    open_selector: "ミントを選択、現在のミント：{mint}",
    open_selector_empty: "ミントを選択",
    title: "ミントを選択",
    badge_mint_error_text: "エラー",
    available_text: "（このミント）",
    sheet_title: "ミントを選択",
    placeholder: "ミントを選択",
  },
  HistoryTable: {
    empty_text: "履歴はまだありません",
    empty_hint: "送受信した支払いがここに表示されます。",
    filters: {
      title: "履歴を絞り込む",
      direction: "方向",
      type: "種類",
      completed: "完了",
      received: "受け取り",
      sent: "送金",
      reset: "リセット",
      clear_all: "すべて解除",
      remove: "フィルターを解除：{label}",
      empty_title: "条件に一致する支払いはありません",
      clear: "フィルターを解除",
      count: "{shown} / {total}",
      active: "履歴を絞り込む（{count} 件適用中）",
    },
    row: {
      type_label: "Ecash",
    },
    actions: {
      check_status: {
        tooltip_text: "ステータスを確認",
      },
      receive: {
        tooltip_text: "受け取る",
      },
    },
    old_token_not_found_error_text: "古いトークンが見つかりません",
    labels: {
      onchain_subpayment: "オンチェーンの部分支払い",
      bolt12_subpayment: "BOLT12 の部分支払い",
    },
  },
  InvoiceTable: {
    row: {
      type_label: "Lightning",
    },
  },
  RemoveMintDialog: {
    title: "このミントを削除しますか？",
    nickname: {
      label: "ニックネーム",
    },
    balances: {
      label: "このミントの残高",
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
      caption_address: "タップしてアドレスをスキャン",
      caption_token: "タップしてトークンをスキャン",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    onchain: {
      title: "オンチェーンで支払う",
      address_placeholder: "ビットコインアドレス",
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
      title_bolt12: "ライトニングのオファーを支払う",
    },
    lnurlpay: {
      amount_exact_label:
        "{ payee }が{ value } { ticker }をリクエストしています",
      amount_range_label:
        "{ payee }が{ min }から{ max } { ticker }の間をリクエストしています",
      sending_to_lightning_address: "{ address }に送信中",
      inputs: {
        comment: {
          label: "コメント（任意）",
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
        },
      },
    },
  },
  EditMintDialog: {
    title: "ミントを編集",
    inputs: {
      nickname: {
        label: "ニックネーム（任意）",
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
    title: "このミントを信頼しますか？",
    description:
      "信頼できる場合にのみこのミントを追加してください。いつ運営が停止するかわからず、そこで保有している ecash を失う可能性があります。",
    actions: {
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
    restore_mint_error_text: "ミントの復元エラー：{ error }",
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
    token: "トークン",
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
  ActivityRow: {
    received: "受け取り済み",
    sent: "送金済み",
    receiving: "受け取り中",
    sending: "送金中",
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
    enter_amount_in: "{fiat}で金額を入力",
    something_went_wrong: "問題が発生しました",
  },
  SendPaymentRequest: {
    actions: {
      pay: { label: "支払う" },
      pay_via: { label: "{transport} で支払う" },
    },
    info: {
      pay_failed: "リクエストを支払えませんでした",
      no_ecash: "この支払いリクエストに使える ecash がありません",
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
    address: "アドレス",
    invoice: "請求書",
    request: "リクエスト",
    amount: "金額",
    fee_reserve: "手数料の予備",
    fee_paid: "支払った手数料",
    unit: "単位",
    status: "ステータス",
    network: "ネットワーク",
    transaction_id: "トランザクション ID",
    explorer: "エクスプローラー",
    confirmations: "承認数",
    paid_at: "支払日時",
    preimage: "プリイメージ",
    preimage_copied: "プリイメージをコピーしました",
    mint: "ミント",
    method: "方法",
    lightning_offer: "ライトニングオファー",
    states: {
      waiting: "支払い待ち",
      confirming: "承認中（{count}/{threshold}）",
      issuing: "ecash を発行中",
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
    loading: "監査情報を読み込み中…",
    not_audited: "この監査者には、このミントのデータがありません。",
    not_audited_text:
      "監査者について詳しく知る、または今後の監査を支援するには、{link} にアクセスするか、{here} をクリックして ecash を寄付し、このミントの監査開始を支援してください。",
    here: "こちら",
    unavailable: "現在、監査情報を利用できません。",
    load_failed: "ミントのデータを読み込めませんでした",
    success_rate: "成功率",
    swaps_count: "{total} 件中 {successful} 件のスワップ",
    average_time: "平均時間",
    average_time_caption: "成功したスワップが対象",
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
      swaps: "スワップ：",
      success_rate: "成功率：",
      time_range: "期間：",
    },
  },
  DisplayTokenComponent: {
    title: {
      send: "ecash を送る",
      sent: "ecash 送信済み",
      received: "ecash 受信済み",
    },
    qr_speed: "QR の速度：{value}",
    qr_density: "QR の密度：{value}",
    speed: {
      fast: "速い",
      medium: "普通",
      slow: "遅い",
    },
    density: {
      high: "高",
      medium: "中",
      low: "低",
    },
    delete_dialog: {
      title: "履歴から削除しますか？",
      text: "この取引を履歴から削除してもよろしいですか？",
      warning:
        "警告：この操作は元に戻せず、トークンを復元する方法はありません。",
    },
    nfc: {
      read_failed: "NFC の読み取りに失敗しました",
      write_failed: "NFC の書き込みに失敗しました",
      error: "NFC エラー",
      writing: "NFC カードに書き込み中…",
      success: "トークンを NFC カードに書き込みました",
      capacity:
        "カードの容量が不足している可能性があります（{bytes} バイト必要）。",
    },
  },
  CreateInvoiceDialog: {
    format_label: "リクエストの種類",
    formats: {
      bolt11: "請求書",
      bolt12: "オファー",
    },
    onchain_title: "オンチェーンで受け取る",
    bolt12_title: "Lightning オファーで受け取る",
    mint_unreachable: "ミントに接続できません",
    mint_unreachable_text: "支払いを受け取るにはミントに再接続してください。",
    reconnect_mint: "ミントに再接続",
    checking_address: "アドレスを確認中…",
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
  storage: {
    notifications: {
      unrecognized_backup: "認識できないバックアップ形式です",
      backup_restored: "バックアップを復元しました",
      backup_exported: "ウォレットのバックアップをエクスポートしました",
      quota_exceeded:
        "ブラウザーの保存領域がいっぱいか、利用できません。新しいウォレットデータが保存されない可能性があります。今すぐウォレットをバックアップしてください。",
      cleaned_up: "{size} バイトを整理しました",
    },
  },
  receiveTokens: {
    notifications: {
      already_in_history: "ecash はすでに履歴にあります",
      nfc_read_failed: "NFC タグからデータを読み取れません",
      scan_error: "スキャンエラー",
      nfc_error: "NFC エラー",
    },
  },
  nostrMintBackup: {
    notifications: {
      no_relays: "Nostr リレーが設定されていません",
      backup_failed: "ミント一覧を Nostr にバックアップできませんでした",
      backed_up: "ミント一覧を Nostr にバックアップしました",
      found:
        "Nostr バックアップで {count} 件のミントが見つかりました | Nostr バックアップで {count} 件のミントが見つかりました",
      none_found:
        "このシードフレーズのミントバックアップは Nostr に見つかりませんでした",
      search_failed: "ミントバックアップを検索できませんでした",
      add_mint_failed: "{mint} を追加できませんでした",
      added:
        "{count} 件のミントをウォレットに追加しました | {count} 件のミントをウォレットに追加しました",
      none_added: "新しいミントは追加されませんでした",
      add_selected_failed: "選択したミントを追加できませんでした",
    },
  },
  nostr: {
    notifications: {
      nip04_published: "Nostr にメッセージを公開しました",
      nip04_failed: "Nostr にメッセージを公開できませんでした",
      nip17_failed: "Nostr にメッセージを公開できませんでした",
      receive_failed: "着信した支払いを受け取れませんでした",
      ecash_already_in_history: "ecash はすでに履歴にあります",
      ecash_added: "ecash を履歴に追加しました",
    },
  },
  nwc: {
    notifications: {
      melt_quote_failed:
        "NWC：ミントから支払いの見積もりを取得できませんでした",
      unit_must_be_sat: "NWC：使用中の単位は sats である必要があります",
      allowance_exceeded: "NWC：アローワンスを超えました",
    },
  },
  npubcash: {
    notifications: {
      could_not_update_mint: "npub.cash のミントを更新できませんでした",
      add_mint_first: "先に {mint} をウォレットに追加してください",
    },
  },
};
