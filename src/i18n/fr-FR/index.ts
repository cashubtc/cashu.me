export default {
  copied_to_clipboard: "Copied to clipboard!",
  copy_failed: "Copy failed",
  global: {
    copy_to_clipboard: {
      success: "Copié dans le presse-papiers !",
    },
    actions: {
      add_mint: {
        label: "Ajouter une mint",
      },
      cancel: {
        label: "Annuler",
      },
      copy: {
        label: "Copier",
      },
      close: {
        label: "Fermer",
      },
      ok: {
        label: "OK",
      },
      enter: {
        label: "Entrer",
      },
      lock: {
        label: "Verrouiller",
      },
      paste: {
        label: "Coller",
      },
      receive: {
        label: "Recevoir",
      },
      scan: {
        label: "Scanner",
      },
      send: {
        label: "Envoyer",
      },
      creatorHub: {
        publish: "Publish Profile",
        profileHeader: "Profile details",
      },
      swap: {
        label: "Échanger",
      },
      update: {
        label: "Mettre à jour",
      },
    },
    inputs: {
      mint_url: {
        label: "URL de la mint",
      },
    },
  },
  wallet: {
    notifications: {
      balance_too_low: "Le solde est trop bas",
      received: "Reçu {amount}",
      fee: " (frais: {fee})",
      could_not_request_mint: "Impossible de demander à la Mint",
      invoice_still_pending: "Facture toujours en attente",
      paid_lightning: "Payé {amount} via Lightning",
      payment_pending_refresh:
        "Paiement en attente. Rafraîchissez la facture manuellement.",
      sent: "Envoyé {amount}",
      token_still_pending: "Token toujours en attente",
      received_lightning: "Reçu {amount} via Lightning",
      lightning_payment_failed: "Paiement Lightning échoué",
      failed_to_decode_invoice: "Impossible de décoder la facture",
      invalid_lnurl: "LNURL invalide",
      lnurl_error: "Erreur LNURL",
      no_amount: "Pas de montant",
      no_lnurl_data: "Pas de données LNURL",
      no_price_data: "Pas de données de prix.",
      please_try_again: "Veuillez réessayer.",
      nostr_dm_sent: "DM Nostr envoyé",
      nostr_dm_failed: "Échec de l'envoi du DM Nostr",
    },
    mint: {
      notifications: {
        already_added: "Mint déjà ajoutée",
        added: "Mint ajoutée",
        not_found: "Mint introuvable",
        activation_failed: "L'activation de la mint a échoué",
        no_active_mint: "Aucune mint active",
        unit_activation_failed: "L'activation de l'unité a échoué",
        unit_not_supported: "Unité non prise en charge par la mint",
        activated: "Mint activée",
        could_not_connect: "Impossible de se connecter à la mint",
        could_not_get_info: "Impossible d'obtenir les informations de la mint",
        could_not_get_keys: "Impossible d'obtenir les clés de la mint",
        could_not_get_keysets: "Impossible d'obtenir les keysets de la mint",
        removed: "Mint supprimée",
        error: "Erreur de la mint",
      },
    },
    signer_connected: "Signer Nostr connecté",
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
        title: "Paramètres",
        settings: {
          title: "Paramètres",
          caption: "Configuration du portefeuille",
        },
      },
      terms: {
        title: "Conditions",
        terms: {
          title: "Conditions",
          caption: "Conditions de Service",
        },
      },
      about: {
        title: "About",
        about: { title: "About", caption: "About this app" },
      },
      links: {
        title: "Liens",
        fundstrCreator: {
          title: "Créateur de Fundstr",
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
          title: "Faire un don",
          caption: "Soutenir Cashu",
        },
      },
    },
    offline: {
      warning: {
        text: "Hors ligne",
      },
    },
    reload: {
      warning: {
        text: "Recharger dans { countdown }",
      },
    },
    staging: {
      warning: {
        text: "Staging – ne pas utiliser avec de vrais fonds !",
      },
    },
  },
  FullscreenHeader: {
    actions: {
      back: {
        label: "Portefeuille",
      },
    },
  },
  Settings: {
    language: {
      title: "Langue",
      description:
        "Veuillez choisir votre langue préférée dans la liste ci-dessous.",
    },
    sections: {
      backup_restore: "SAUVEGARDE & RESTAURATION",
      lightning_address: "ADRESSE LIGHTNING",
      nostr_keys: "CLÉS NOSTR",
      payment_requests: "DEMANDES DE PAIEMENT",
      nostr_wallet_connect: "NOSTR WALLET CONNECT",
      hardware_features: "FONCTIONNALITÉS MATÉRIELLES",
      p2pk_features: "FONCTIONNALITÉS P2PK",
      privacy: "CONFIDENTIALITÉ",
      experimental: "EXPÉRIMENTAL",
      appearance: "APPARENCE",
    },
    backup_restore: {
      backup_seed: {
        title: "Sauvegarder la phrase de départ",
        description:
          "Votre phrase de départ peut restaurer votre portefeuille. Gardez-la en sécurité et privée.",
        seed_phrase_label: "Phrase de départ",
      },
      restore_ecash: {
        title: "Restaurer ecash",
        description:
          "L'assistant de restauration vous permet de récupérer l'ecash perdu à partir d'une phrase mnémonique. La phrase de départ de votre portefeuille actuel ne sera pas affectée, l'assistant vous permettra uniquement de restaurer l'ecash à partir d'une autre phrase de départ.",
        button: "Restaurer",
      },
    },
    lightning_address: {
      title: "Adresse Lightning",
      description: "Recevez des paiements sur votre adresse Lightning.",
      enable: {
        toggle: "Activer",
        description: "Adresse Lightning avec npub.cash",
      },
      address: {
        copy_tooltip: "Copier l'adresse Lightning",
      },
      automatic_claim: {
        toggle: "Réclamer automatiquement",
        description: "Recevez les paiements entrants automatiquement.",
      },
    },
    nostr_keys: {
      title: "Vos clés Nostr",
      description: "Définissez les clés nostr pour votre adresse Lightning.",
      wallet_seed: {
        title: "Phrase de départ du portefeuille",
        description:
          "Générer une paire de clés nostr à partir de la phrase de départ du portefeuille",
        copy_nsec: "Copier nsec",
      },
      nsec_bunker: {
        title: "Nsec Bunker",
        description: "Utiliser un bunker NIP-46",
        delete_tooltip: "Supprimer la connexion",
      },
      use_nsec: {
        title: "Utiliser votre nsec",
        description: "Cette méthode est dangereuse et non recommandée",
        delete_tooltip: "Supprimer nsec",
      },
      signing_extension: {
        title: "Extension de signature",
        description: "Utiliser une extension de signature NIP-07",
        not_found: "Aucune extension de signature NIP-07 trouvée",
      },
    },
    payment_requests: {
      title: "Demandes de paiement",
      description:
        "Les demandes de paiement vous permettent de recevoir des paiements via nostr. Si vous activez cela, votre portefeuille s'abonnera à vos relais nostr.",
      enable_toggle: "Activer les demandes de paiement",
      claim_automatically: {
        toggle: "Réclamer automatiquement",
        description: "Recevez les paiements entrants automatiquement.",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Wallet Connect (NWC)",
      description:
        "Utilisez NWC pour contrôler votre portefeuille depuis n'importe quelle autre application.",
      enable_toggle: "Activer NWC",
      payments_note:
        "Vous ne pouvez utiliser NWC que pour les paiements à partir de votre solde Bitcoin. Les paiements seront effectués à partir de votre mint active.",
      connection: {
        copy_tooltip: "Copier la chaîne de connexion",
        qr_tooltip: "Afficher le code QR",
        allowance_label: "Montant restant (sat)",
      },
      relays: {
        expand_label: "Cliquez pour modifier les relais",
        add: {
          title: "Ajouter un relais",
          description:
            "Nostr Wallet Connect utilise les relais nostr pour connecter votre portefeuille à d'autres applications.",
        },
        list: {
          title: "Relais",
          description: "Votre portefeuille se connectera à ces relais.",
          copy_tooltip: "Copier le relais",
          remove_tooltip: "Supprimer le relais",
        },
      },
    },
    hardware_features: {
      webnfc: {
        title: "WebNFC",
        description: "Choisissez l'encodage pour l'écriture sur les cartes NFC",
        text: {
          title: "Texte",
          description: "Stocker le jeton en texte brut",
        },
        weburl: {
          title: "URL",
          description: "Stocker l'URL de ce portefeuille avec le jeton",
        },
        binary: {
          title: "Binaire brut",
          description:
            "Octets bruts au lieu de Base64. Rend les jetons ~33% plus courts.",
        },
        quick_access: {
          toggle: "Accès rapide à la NFC",
          description:
            "Scannez rapidement les cartes NFC dans le menu Recevoir Ecash. Cette option ajoute un bouton NFC au menu Recevoir Ecash.",
        },
      },
    },
    p2pk_features: {
      title: "P2PK",
      description:
        "Générez une paire de clés pour recevoir de l'ecash verrouillé P2PK. Attention : Cette fonctionnalité est expérimentale. N'utilisez qu'avec de petits montants. Si vous perdez vos clés privées, personne ne pourra plus déverrouiller l'ecash qui y est verrouillé.",
      generate_button: "Générer une clé",
      import_button: "Importer nsec",
      quick_access: {
        toggle: "Accès rapide au verrouillage",
        description:
          "Utilisez ceci pour afficher rapidement votre clé de verrouillage P2PK dans le menu Recevoir Ecash.",
      },
      keys_expansion: {
        label: "Cliquez pour parcourir {count} clés",
        used_badge: "utilisée",
      },
    },
    privacy: {
      title: "Confidentialité",
      description: "Ces paramètres affectent votre confidentialité.",
      check_incoming: {
        toggle: "Vérifier la facture entrante",
        description:
          "Si activé, le portefeuille vérifiera la dernière facture en arrière-plan. Cela augmente la réactivité du portefeuille, ce qui rend le fingerprinting plus facile. Vous pouvez vérifier manuellement les factures impayées dans l'onglet Factures.",
      },
      check_startup: {
        toggle: "Vérifier les factures en attente au démarrage",
        description:
          "Si activé, le portefeuille vérifiera les factures en attente des dernières 24 heures au démarrage.",
      },
      check_all: {
        toggle: "Vérifier toutes les factures",
        description:
          "Si activé, le portefeuille vérifiera périodiquement les factures impayées en arrière-plan pendant jusqu'à deux semaines. Cela augmente l'activité en ligne du portefeuille, ce qui rend le fingerprinting plus facile. Vous pouvez vérifier manuellement les factures impayées dans l'onglet Factures.",
      },
      check_sent: {
        toggle: "Vérifier l'ecash envoyé",
        description:
          "Si activé, le portefeuille utilisera des vérifications périodiques en arrière-plan pour déterminer si les jetons envoyés ont été utilisés. Cela augmente l'activité en ligne du portefeuille, ce qui rend le fingerprinting plus facile.",
      },
      websockets: {
        toggle: "Utiliser les WebSockets",
        description:
          "Si activé, le portefeuille utilisera des connexions WebSocket de longue durée pour recevoir des mises à jour sur les factures payées et les jetons dépensés des mints. Cela augmente la réactivité du portefeuille mais rend également le fingerprinting plus facile.",
      },
      bitcoin_price: {
        toggle: "Obtenir le taux de change de Coinbase",
        description:
          "Si activé, le taux de change actuel du Bitcoin sera récupéré de coinbase.com et votre solde converti sera affiché.",
      },
    },
    experimental: {
      title: "Expérimental",
      description: "Ces fonctionnalités sont expérimentales.",
      receive_swaps: {
        toggle: "Recevoir des échanges",
        badge: "Bêta",
        description:
          "Option pour échanger l'Ecash reçu vers votre mint active dans la boîte de dialogue Recevoir Ecash.",
      },
      auto_paste: {
        toggle: "Coller l'Ecash automatiquement",
        description:
          "Coller automatiquement l'ecash dans votre presse-papiers lorsque vous appuyez sur Recevoir, puis Ecash, puis Coller. Le collage automatique peut causer des problèmes d'interface utilisateur dans iOS, désactivez-le si vous rencontrez des problèmes.",
      },
      auto_redeem_locked: {
        toggle: "Récupérer automatiquement les tokens verrouillés",
        description:
          "Si activé, le portefeuille récupérera automatiquement les tokens verrouillés dès qu'ils seront déverrouillés.",
      },
      auditor: {
        toggle: "Activer l'auditeur",
        badge: "Bêta",
        description:
          "Si activé, le portefeuille affichera les informations de l'auditeur dans la boîte de dialogue des détails de la mint. L'auditeur est un service tiers qui surveille la fiabilité des mints.",
        url_label: "URL de l'auditeur",
        api_url_label: "URL de l'API de l'auditeur",
      },
    },
    appearance: {
      keyboard: {
        title: "Clavier à l'écran",
        description: "Utilisez le clavier numérique pour saisir les montants.",
        toggle: "Utiliser le clavier numérique",
        toggle_description:
          "Si activé, le clavier numérique sera utilisé pour saisir les montants.",
      },
      theme: {
        title: "Apparence",
        description: "Changez l'apparence de votre portefeuille.",
        tooltips: {
          mono: "mono",
          cyber: "cyber",
          freedom: "liberté",
          nostr: "nostr",
          bitcoin: "bitcoin",
          mint: "mint",
          nut: "nut",
          blu: "blu",
          flamingo: "flamingo",
          modern: "modern",
        },
      },
    },
    advanced: {
      title: "Avancé",
      developer: {
        title: "Paramètres développeur",
        description:
          "Les paramètres suivants sont pour le développement et le débogage.",
        new_seed: {
          button: "Générer une nouvelle phrase de départ",
          description:
            "Cela générera une nouvelle phrase de départ. Vous devez vous envoyer votre solde entier pour pouvoir le restaurer avec une nouvelle phrase de départ.",
          confirm_question:
            "Êtes-vous sûr de vouloir générer une nouvelle phrase de départ ?",
          cancel: "Annuler",
          confirm: "Confirmer",
        },
        remove_spent: {
          button: "Supprimer les preuves dépensées",
          description:
            "Vérifiez si les jetons ecash de vos mints actives sont dépensés et supprimez les jetons dépensés de votre portefeuille. N'utilisez ceci que si votre portefeuille est bloqué.",
        },
        debug_console: {
          button: "Basculer la console de débogage",
          description:
            "Ouvrez le terminal de débogage Javascript. Ne collez jamais rien dans ce terminal que vous ne comprenez pas. Un voleur pourrait essayer de vous piéger en y collant du code malveillant.",
        },
        export_proofs: {
          button: "Exporter les preuves actives",
          description:
            "Copiez votre solde entier de la mint active en tant que jeton Cashu dans votre presse-papiers. Cela n'exportera que les jetons de la mint et de l'unité sélectionnées. Pour un export complet, sélectionnez une mint et une unité différentes et exportez à nouveau.",
        },
        keyset_counters: {
          title: "Incrémenter les compteurs de keyset",
          description:
            "Cliquez sur l'ID du keyset pour incrémenter les compteurs du chemin de dérivation pour les keysets de votre portefeuille. Ceci est utile si vous voyez l'erreur \"les sorties ont déjà été signées\".",
        },
        unset_reserved: {
          button: "Annuler la réservation de tous les jetons réservés",
          description:
            "Ce portefeuille marque l'ecash sortant en attente comme réservé (et le soustrait de votre solde) pour éviter les tentatives de double dépense. Ce bouton annulera la réservation de tous les jetons réservés afin qu'ils puissent être utilisés à nouveau. Si vous faites cela, votre portefeuille pourrait inclure des preuves dépensées. Appuyez sur le bouton \"Supprimer les preuves dépensées\" pour vous en débarrasser.",
        },
        show_onboarding: {
          button: "Afficher l'accueil",
          description: "Afficher à nouveau l'écran d'accueil.",
        },
        reset_wallet: {
          button: "Réinitialiser les données du portefeuille",
          description:
            "Réinitialisez les données de votre portefeuille. Attention : Cela supprimera tout ! Assurez-vous de faire une sauvegarde d'abord.",
          confirm_question:
            "Êtes-vous sûr de vouloir supprimer les données de votre portefeuille ?",
          cancel: "Annuler",
          confirm: "Supprimer le portefeuille",
        },
        export_wallet: {
          button: "Exporter les données du portefeuille",
          description:
            "Téléchargez un dump de votre portefeuille. Vous pouvez restaurer votre portefeuille à partir de ce fichier sur l'écran d'accueil d'un nouveau portefeuille. Ce fichier sera désynchronisé si vous continuez à utiliser votre portefeuille après l'exportation.",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Rejoindre une mint",
    subtitle:
      "Vous n'avez pas encore rejoint de mint Cashu. Ajoutez une URL de mint dans les paramètres ou recevez de l'ecash d'une nouvelle mint pour commencer.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Recevoir Ecash",
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
        label: "Historique",
      },
      invoices: {
        label: "Factures",
      },
      mints: {
        label: "Mints",
      },
    },
    install: {
      text: "Installer",
      tooltip: "Installer Cashu",
    },
  },
  AlreadyRunning: {
    title: "Non.",
    text: "Un autre onglet est déjà en cours d'exécution. Fermez cet onglet et réessayez.",
    actions: {
      retry: {
        label: "Réessayer",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Cette page n'existe pas. Utilisez les liens ci-dessous pour obtenir de l'aide :",
    links: {
      docs: "Documentation",
      tips: "Astuces",
    },
    actions: {
      home: {
        label: "Retour à l'accueil",
      },
    },
  },
  BalanceView: {
    mintUrl: {
      label: "Mint",
    },
    mintBalance: {
      label: "Solde",
    },
    mintError: {
      label: "Erreur de la mint",
    },
    pending: {
      label: "En attente",
      tooltip: "Vérifier tous les jetons en attente",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "Précédent",
      },
      next: {
        label: "Suivant",
      },
      skip: {
        label: "Passer",
      },
    },
  },
  WelcomeSlide1: {
    title: "Bienvenue sur Cashu",
    text: "Cashu.me est un portefeuille Bitcoin gratuit et open-source qui utilise l'ecash pour garder vos fonds sécurisés et privés.",
    actions: {
      more: {
        label: "Cliquez pour en savoir plus",
      },
    },
    p1: {
      text: "Cashu est un protocole ecash gratuit et open-source pour Bitcoin. Vous pouvez en savoir plus sur { link }.",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "Ce portefeuille n'est affilié à aucune mint. Pour utiliser ce portefeuille, vous devez vous connecter à une ou plusieurs mints Cashu auxquelles vous faites confiance.",
    },
    p3: {
      text: "Ce portefeuille stocke l'ecash auquel vous seul avez accès. Si vous supprimez les données de votre navigateur sans sauvegarde de la phrase de départ, vous perdrez vos jetons.",
    },
    p4: {
      text: "Ce portefeuille est en version bêta. Nous déclinons toute responsabilité en cas de perte d'accès aux fonds. Utilisez à vos propres risques ! Ce code est open-source et sous licence MIT.",
    },
  },
  WelcomeSlide2: {
    title: "Installer la PWA",
    instruction: {
      intro: {
        text: "Pour la meilleure expérience, utilisez ce portefeuille avec le navigateur web natif de votre appareil pour l'installer en tant que Progressive Web App. Faites-le maintenant.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "Appuyez sur le menu (en haut à droite)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Appuyez sur { buttonText }",
          buttonText: "@:AndroidPWAPrompt.buttonText",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "Appuyez sur partager (en bas)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Appuyez sur { buttonText }",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "Une fois que vous avez installé cette application sur votre appareil, fermez cette fenêtre de navigateur et utilisez l'application depuis votre écran d'accueil.",
      },
    },
    pwa: {
      success: {
        title: "Succès !",
        text: "Vous utilisez Cashu comme PWA. Fermez les autres fenêtres de navigateur ouvertes et utilisez l'application depuis votre écran d'accueil.",
      },
    },
  },
  iOSPWAPrompt: {
    text: "Appuyez sur { icon } et { buttonText }",
    buttonText: "Sur l'écran d'accueil",
  },
  AndroidPWAPrompt: {
    text: "Appuyez sur { icon } et { buttonText }",
    buttonText: "Ajouter à l'écran d'accueil",
  },
  WelcomeSlide3: {
    title: "Votre Phrase de Départ",
    text: "Stockez votre phrase de départ dans un gestionnaire de mots de passe ou sur papier. Votre phrase de départ est le seul moyen de récupérer vos fonds si vous perdez l'accès à cet appareil.",
    inputs: {
      seed_phrase: {
        label: "Phrase de départ",
        caption: "Vous pouvez voir votre phrase de départ dans les paramètres.",
      },
      checkbox: {
        label: "Je l'ai écrite",
      },
    },
  },
  WelcomeSlide4: {
    title: "Conditions",
    actions: {
      more: {
        label: "Lire les Conditions de Service",
      },
    },
    inputs: {
      checkbox: {
        label: "J'ai lu et j'accepte ces termes et conditions",
      },
    },
  },
  WelcomeSlidePrivacy: {
    title: "Cashu et confidentialité",
    text: "Cashu utilise des tokens aveugles pour que les mints ne puissent pas suivre vos paiements.",
  },
  WelcomeSlideMints: {
    title: "Mints",
    text: "Ajoutez un mint pour commencer à recevoir des tokens.",
  },
  WelcomeSlideProofs: {
    title: "Preuves",
    text: "Les preuves sont les tokens que vous pouvez envoyer et recevoir.",
  },
  WelcomeSlideBuckets: {
    title: "Compartiments",
    text: "Utilisez les compartiments pour organiser vos tokens.",
  },
  RestoreView: {
    seed_phrase: {
      label: "Restaurer à partir de la Phrase de Départ",
      caption:
        "Entrez votre phrase de départ pour restaurer votre portefeuille. Avant de restaurer, assurez-vous d'avoir ajouté toutes les mints que vous avez utilisées auparavant.",
      inputs: {
        seed_phrase: {
          label: "Phrase de départ",
          caption:
            "Vous pouvez voir votre phrase de départ dans les paramètres.",
        },
      },
    },
    information: {
      label: "Information",
      caption:
        "L'assistant ne restaurera que l'ecash d'une autre phrase de départ, vous ne pourrez pas utiliser cette phrase de départ ni changer la phrase de départ du portefeuille que vous utilisez actuellement. Cela signifie que l'ecash restauré ne sera pas protégé par votre phrase de départ actuelle tant que vous ne vous enverrez pas l'ecash une fois.",
    },
    restore_mints: {
      label: "Restaurer les Mints",
      caption:
        "Sélectionnez la mint à restaurer. Vous pouvez ajouter d'autres mints dans l'écran principal sous \"Mints\" et les restaurer ici.",
    },
    actions: {
      paste: {
        error: "Échec de la lecture du contenu du presse-papiers.",
      },
      validate: {
        error: "Le mnémonique doit comporter au moins 12 mots.",
      },
      restore: {
        label: "Restaurer",
        in_progress: "Restauration de la mint…",
        error: "Erreur lors de la restauration de la mint : { error }",
      },
      restore_all_mints: {
        label: "Restaurer toutes les mints",
        in_progress: "Restauration de la mint { index } sur { length }…",
        success: "Restauration terminée avec succès",
        error: "Erreur lors de la restauration des mints : { error }",
      },
    },
  },
  MintSettings: {
    add: {
      title: "Ajouter une mint",
      description:
        "Entrez l'URL d'une mint Cashu pour vous y connecter. Ce portefeuille n'est affilié à aucune mint.",
      inputs: {
        nickname: {
          placeholder: "Surnom (ex. Testnet)",
        },
      },
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "URL invalide",
        },
        scan: {
          label: "Scanner le Code QR",
        },
      },
    },
    discover: {
      title: "Découvrir les mints",
      overline: "Découvrir",
      caption:
        "Découvrez les mints que d'autres utilisateurs ont recommandées sur nostr.",
      actions: {
        discover: {
          label: "Découvrir les mints",
          in_progress: "Chargement…",
          error_no_mints: "Aucune mint trouvée",
          success: "{ length } mints trouvées",
        },
      },
      recommendations: {
        overline: "{ length } mints trouvées",
        caption:
          "Ces mints ont été recommandées par d'autres utilisateurs Nostr. Lisez les avis sur { link }. Soyez prudent et faites vos propres recherches avant d'utiliser une mint.",
        actions: {
          browse: {
            label: "Cliquez pour parcourir les mints",
          },
        },
      },
    },
    
    swap: {
      title: "Échanger",
      overline: "Échanges Multi-mints",
      caption:
        "Échangez des fonds entre mints via Lightning. Note : Prévoyez de la place pour les frais Lightning potentiels. Si le paiement entrant ne réussit pas, vérifiez la facture manuellement.",
      inputs: {
        from: {
          label: "De",
        },
        to: {
          label: "À",
        },
        amount: {
          label: "Montant ({ ticker }) )",
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
      keep_scanning_text: " - Continuer à scanner",
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
    title: "Créer une Facture",
    inputs: {
      amount: {
        label: "Montant ({ ticker }) *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "Créer une Facture",
        label_blocked: "Création en cours…",
        in_progress: "Création",
      },
    },
    invoice: {
      caption: "Facture Lightning",
      status_paid_text: "Payée !",
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
    title: "Envoyer",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Aucune mint disponible",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "Aucune mint disponible",
      },
    },
  },
  SendTokenDialog: {
    title: "Envoyer { value }",
    title_ecash_text: "Ecash",
    badge_offline_text: "Hors ligne",
    inputs: {
      amount: {
        label: "Montant ({ ticker }) *",
        invalid_too_much_error_text: "Trop élevé",
      },
      p2pk_pubkey: {
        label: "Clé publique du destinataire",
        label_invalid: "Clé publique du destinataire",
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
        tooltip_text: "Copier l'Emoji",
      },
      copy_tokens: {
        label: "@:global.actions.copy.label",
      },
      copy_link: {
        tooltip_text: "Copier le lien",
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
        tooltip_text: "Supprimer de l'historique",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "Flasher sur carte NFC",
          ndef_unsupported_text: "NDEF non pris en charge",
        },
      },
    },
  },
  ReceiveDialog: {
    title: "Recevoir",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Aucune mint disponible",
      },
      lightning: {
        label: "Lightning",
        error_no_mints:
          "Vous devez vous connecter à une mint pour recevoir via Lightning",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "Recevoir Ecash",
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      scan: {
        label: "@:global.actions.scan.label",
      },
      request: {
        label: "Demander",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      nfc: {
        label: "NFC",
        scanning_text: "Scan en cours…",
      },
    },
  },
  ReceiveTokenDialog: {
    title: "Recevoir { value }",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "Coller le jeton Cashu",
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
        label: "Jeton invalide",
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
        label_adding_mint: "Ajout de la mint…",
      },
      
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "Échanger vers une mint de confiance",
        caption: "Échanger { value }",
      },
      
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "Annuler l'échange",
      },
      
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      later: {
        label: "Plus tard",
        tooltip_text: "Ajouter à l'historique pour recevoir plus tard",
        already_in_history_success_text: "Ecash déjà dans l'historique",
        added_to_history_success_text: "Ecash ajouté à l'historique",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Lire à partir de la carte NFC",
          ndef_unsupported_text: "NDEF non pris en charge",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "Clé P2PK",
      description: "Recevoir de l'ecash verrouillé sur cette clé",
      used_warning_text:
        "Attention : Cette clé a déjà été utilisée. Utilisez une nouvelle clé pour une meilleure confidentialité.",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_key: {
        label: "Générer une nouvelle clé",
      },
    },
  },
  PaymentRequestDialog: {
    payment_request: {
      caption: "Demande de Paiement",
      description: "Recevoir des paiements via Nostr",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "Nouvelle demande",
      },
      add_amount: {
        label: "Ajouter un montant",
      },
      use_active_mint: {
        label: "N'importe quelle mint",
      },
    },
    inputs: {
      amount: {
        placeholder: "Entrez le montant",
      },
    },
  },
  NumericKeyboard: {
    actions: {
      close: {
        label: "@:global.actions.close.label",
        closed_info_text:
          "Clavier désactivé. Vous pouvez réactiver le clavier dans les paramètres.",
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
        "Contrôlez votre portefeuille à distance avec NWC. Appuyez sur le code QR pour lier votre portefeuille à une application compatible.",
      warning_text:
        "Attention : toute personne ayant accès à cette chaîne de connexion peut initier des paiements depuis votre portefeuille. Ne la partagez pas !",
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
    title: "Message de la Mint",
  },
  MintDetailsDialog: {
    contact: {
      title: "Contact",
    },
    details: {
      title: "Détails de la mint",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Nuts",
        actions: {
          show: {
            label: "Tout afficher",
          },
          hide: {
            label: "Masquer",
          },
        },
      },
      currency: {
        label: "Devise",
      },
      currencies: {
        label: "@:MintDetailsDialog.details.currency.label",
      },
      version: {
        label: "Version",
      },
    },
    actions: {
      title: "Actions",
      copy_mint_url: {
        label: "Copier l'URL de la mint",
      },
      delete: {
        label: "Supprimer la mint",
      },
      edit: {
        label: "Modifier la mint",
      },
    },
  },
  ChooseMint: {
    title: "Sélectionnez une mint",
    badge_mint_error_text: "Erreur",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
  },
  HistoryTable: {
    empty_text: "Aucun historique pour l'instant",
    row: {
      type_label: "Ecash",
      date_label: "Il y a { value }",
    },
    actions: {
      check_status: {
        tooltip_text: "Vérifier le statut",
      },
      receive: {
        tooltip_text: "Recevoir",
      },
      filter_pending: {
        label: "Filtrer en attente",
      },
      show_all: {
        label: "Tout afficher",
      },
    },
    old_token_not_found_error_text: "Ancien jeton introuvable",
  },
  InvoiceTable: {
    empty_text: "Aucune facture pour l'instant",
    row: {
      type_label: "Lightning",
      type_tooltip_text: "Cliquez pour copier",
      date_label: "Il y a { value }",
    },
    actions: {
      check_status: {
        tooltip_text: "Vérifier le statut",
      },
      filter_pending: {
        label: "Filtrer en attente",
      },
      show_all: {
        label: "Tout afficher",
      },
    },
  },
  RemoveMintDialog: {
    title: "Êtes-vous sûr de vouloir supprimer cette mint ?",
    nickname: {
      label: "Surnom",
    },
    balances: {
      label: "Soldes",
    },
    warning_text:
      "Note : Comme ce portefeuille est paranoïaque, votre ecash de cette mint ne sera pas réellement supprimé mais restera stocké sur votre appareil. Vous le verrez réapparaître si vous réajoutez cette mint plus tard.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "Supprimer la mint",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  PayInvoiceDialog: {
    input_data: {
      title: "Payer Lightning",
      inputs: {
        invoice_data: {
          label: "Facture ou adresse Lightning",
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
      amount_exact_label: "{ payee } demande { value } { ticker }",
      amount_range_label:
        "{ payee } demande{br}entre { min } et { max } { ticker }",
      inputs: {
        amount: {
          label: "Montant ({ ticker }) *",
        },
        comment: {
          label: "Commentaire (optionnel)",
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
      title: "Payer { value }",
      memo: {
        label: "Mémo",
      },
      processing_info_text: "Traitement…",
      balance_too_low_warning_text: "Solde trop faible",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        pay: {
          label: "Payer",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
          error: "Erreur",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Modifier la mint",
    inputs: {
      nickname: {
        label: "Surnom",
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
    title: "Faites-vous confiance à cette mint ?",
    description:
      "Avant d'utiliser cette mint, assurez-vous de lui faire confiance. Les mints pourraient devenir malveillantes ou cesser leurs opérations à tout moment.",
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
        in_progress: "Ajout de la mint",
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
        "Les compartiments servent \u00e0 cat\u00e9goriser les jetons",
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
    select_tokens: "Select tokens to move",
    empty: "No tokens",
    helper: "Move tokens between buckets to organize them.",
  },
  restore: {
    mnemonic_error_text: "Veuillez entrer un mnémonique",
    restore_mint_error_text:
      "Erreur lors de la restauration de la mint : { error }",
    prepare_info_text: "Préparation du processus de restauration…",
    restored_proofs_for_keyset_info_text:
      "{ restoreCounter } preuves restaurées pour le keyset { keysetId }",
    checking_proofs_for_keyset_info_text:
      "Vérification des preuves { startIndex } à { endIndex } pour le keyset { keysetId }",
    no_proofs_info_text: "Aucune preuve trouvée à restaurer",
    restored_amount_success_text: "{ amount } restauré",
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
    in_progress_warning_text: "Échange en cours",
    invalid_swap_data_error_text: "Données d'échange invalides",
    swap_error_text: "Erreur lors de l'échange",
  },
  settings: {
    nostr: {
      signing_extension: {
        not_found: "Aucune extension de signature NIP-07 trouvée",
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
      status: "Filtrer par statut",
      bucket: "Filtrer par bucket",
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
      title: "Aperçu du site",
      wallet: {
        description: "Gérez votre solde ecash.",
        icon: "account_balance_wallet",
      },
      findCreators: {
        description: "Découvrez des créateurs à soutenir.",
        icon: "img:icons/find-creators.svg",
      },
      
      myProfile: {
        description: "Affichez et modifiez votre profil.",
        icon: "person",
      },
      buckets: {
        description: "Organisez les fonds en catégories.",
        icon: "inventory_2",
      },
      subscriptions: {
        description: "Gérez vos abonnements.",
        icon: "auto_awesome_motion",
      },
      nostrMessengerTitle: "Nostr Messenger",
      nostrMessenger: {
        description: "Discutez en privé avec Nostr.",
        icon: "chat",
      },
      settings: {
        description: "Configurez l'application.",
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
