export default {
  MainHeader: {
    menu: {
      settings: {
        title: "Settings",
        settings: {
          title: "Settings",
          caption: "Wallet configuration",
        },
      },
      terms: {
        title: "Terms",
        terms: {
          title: "Terms",
          caption: "Terms of Service",
        },
      },
      links: {
        title: "Links",
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
          title: "Donate",
          caption: "Support Cashu",
        },
      },
    },
    offline: {
      warning: {
        text: "Offline",
      },
    },
    reload: {
      warning: {
        text: "Reload in { countdown }",
      },
    },
    staging: {
      warning: {
        text: "Staging – don't use with real funds!",
      },
    },
  },
  Settings: {
    language: {
      title: "Language",
      description: "Please choose your preferred language from the list below.",
    },
  },
  NoMintWarnBanner: {
    title: "Join a mint",
    subtitle:
      "You haven't joined any Cashu mint yet. Add a mint URL in the settings or receive ecash from a new mint to get started.",
    actions: {
      addMint: {
        label: "Add mint",
      },
      receive: {
        label: "Receive Ecash",
      },
    },
  },
  WalletPage: {
    actions: {
      send: {
        label: "Send",
      },
      receive: {
        label: "Receive",
      },
    },
    tabs: {
      history: {
        label: "History",
      },
      invoices: {
        label: "Invoices",
      },
      mints: {
        label: "Mints",
      },
    },
    install: {
      text: "Install",
      tooltip: "Install Cashu",
    },
  },
  AlreadyRunning: {
    title: "Nope.",
    text: "Another tab is already running. Close this tab and try again.",
    actions: {
      retry: {
        label: "Retry",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Oops. Nothing here…",
    actions: {
      home: {
        label: "Go back home",
      },
    },
  },
  BalanceView: {
    mintUrl: {
      label: "Mint",
    },
    mintBalance: {
      label: "Balance",
    },
    mintError: {
      label: "Mint error",
    },
    pending: {
      label: "Pending",
      tooltip: "Check all pending tokens",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "Previous",
      },
      next: {
        label: "Next",
      },
    },
  },
  WelcomeSlide1: {
    title: "Welcome to Cashu",
    main: "Cashu.me is a free and open-source Bitcoin wallet that uses ecash to keep your funds secure and private.",
    actions: {
      more: {
        label: "Click to learn more",
      },
    },
    p1: {
      text: "Cashu is a free and open-source ecash protocol for Bitcoin. You can learn more about it at { link }.",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "This wallet is not affiliated with any mint. To use this wallet, you need to connect to one or more Cashu mints that you trust.",
    },
    p3: {
      text: "This wallet stores ecash that only you have access to. If you delete your browser data without a seed phrase backup, you will lose your tokens.",
    },
    p4: {
      text: "This wallet is in beta. We hold no responsibility for people losing access to funds. Use at your own risk! This code is open-source and licensed under the MIT license.",
    },
  },
  WelcomeSlide2: {
    title: "Install PWA",
    instruction: {
      intro: {
        text: "For the best experience, use this wallet with your device's native web browser to install it as a Progressive Web App. Do this right now.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "Tap the menu (top right)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Press { buttonText }",
          buttonText: "Add to Home screen",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "Tap share (bottom)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Press { buttonText }",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "Once you installed this app on your device, close this browser window and use the app from your home screen.",
      },
    },
    pwa: {
      success: {
        title: "Success!",
        text: "You are using Cashu as a PWA. Close any other open browser windows and use the app from your home screen.",
      },
    },
  },
  iOSPWAPrompt: {
    text: "Tap { icon } and { buttonText }",
    buttonText: "Add to Home Screen",
  },
};
