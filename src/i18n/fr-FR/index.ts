export default {
  MultinutPicker: {
    dialog_title: "Paiement Multinut",
    pay_using_multiple: "Payer avec plusieurs mints",
    experimental_title: "Fonctionnalité expérimentale",
    experimental_text:
      "Cette fonctionnalité est très expérimentale et peut ne pas fonctionner comme prévu. N'essayez pas de payer une facture déjà payée. Vous pourriez perdre des fonds.",
    understand: "J'ai compris",
    select_funds:
      "Sélectionnez des fonds de plusieurs mints pour effectuer le paiement.",
    pay_invoice: "Payer la facture",
    amount_mismatch:
      "Erreur de calcul du montant : {calculated} au lieu de {expected}",
    states: {
      requesting: "Demande...",
      paying: "Paiement...",
      success: "Réussi",
      failed: "Échec",
    },
    paid: "Payé {amount} via Lightning",
  },
  global: {
    notifications: "Notifications",
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
      show_seed: {
        label: "Afficher la phrase de récupération",
      },
      hide_seed: {
        label: "Masquer la phrase de récupération",
      },
      scan: {
        label: "Scanner",
      },
      more_options: {
        label: "Plus d'options",
      },
      clear: {
        label: "Effacer",
      },
      send: {
        label: "Envoyer",
      },
      swap: {
        label: "Échanger",
      },
      update: {
        label: "Mettre à jour",
      },
      pay: { label: "Payer" },
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
      trying_again: "Nouvel essai en cours...",
      unsupported_legacy_qr: "Code QR ancien non pris en charge",
      legacy_qr_not_supported:
        "Ce code QR ancien ne provient pas d'un commerçant pris en charge",
      no_bolt12_mint:
        "Aucune de vos mints ne prend en charge les offres BOLT12",
      no_bolt11_mint:
        "Aucune de vos mints ne prend en charge les factures BOLT11",
      address_not_paid: "Adresse non payée",
      payment_pending: "Paiement en attente",
      invoice_already_paid: "Facture déjà payée",
      payment_sent: "Paiement envoyé",
      payment_failed: "Échec du paiement",
      could_not_pay_request: "Impossible de payer la demande",
      request_unit_unsupported:
        "La mint ne prend pas en charge l'unité de cette demande de paiement : {unit}",
      no_onchain_mint:
        "Aucune de vos mints ne prend en charge les paiements on-chain",
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
        mint_validation_error: "Erreur de validation de la menthe",
        removed: "Mint supprimée",
        error: "Erreur de la mint",
      },
    },
  },
  MainHeader: {
    menu: {
      terms: {
        terms: {
          title: "Conditions",
          caption: "Ce que vous acceptez en utilisant Cashu.me",
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
  Settings: {
    menu: {
      title: "Paramètres",
      backup: {
        title: "Sauvegarde et restauration",
        caption: "Phrase de récupération et restauration d'ecash",
      },
      lightning_address: {
        title: "Adresse Lightning",
        caption: "Recevez des paiements sur nom{'@'}domaine",
      },
      nostr: {
        title: "Nostr",
        caption: "Clés, relais et réseau de confiance",
      },
      payment_requests: {
        title: "Demandes de paiement",
        caption: "Recevez des paiements en ecash via Nostr",
      },
      nwc: {
        title: "Nostr Wallet Connect",
        caption: "Utilisez votre portefeuille depuis d'autres applications",
      },
      hardware: {
        title: "Matériel",
        caption: "Paramètres NFC",
      },
      p2pk: {
        title: "Ecash verrouillé",
        caption: "Recevez de l'ecash que seule votre clé peut déverrouiller",
      },
      privacy: {
        title: "Confidentialité",
        caption: "Vérifications réseau et prix du bitcoin",
      },
      experimental: {
        title: "Expérimental",
        caption: "Essayez les nouvelles fonctionnalités en avant-première",
      },
      appearance: {
        title: "Apparence",
        caption: "Thème, clavier et symbole bitcoin",
      },
      language: {
        title: "Langue",
        caption: "Choisissez votre langue",
      },
      advanced: {
        title: "Avancé",
        caption: "Outils développeur et réinitialisation du portefeuille",
      },
      about: {
        title: "À propos",
        caption: "Conditions et liens",
      },
    },
    sections: {
      nostr: {
        relays: {
          already_added: "Relais déjà ajouté",
          add: {
            title: "Ajouter un relais",
            description:
              "Votre portefeuille utilise ces relais pour les fonctions Nostr comme les demandes de paiement, Nostr Wallet Connect et les sauvegardes.",
          },
          list: {
            title: "Relais",
            copy_tooltip: "Copier le relais",
            remove_tooltip: "Supprimer le relais",
          },
        },
      },
    },
    language: {
      title: "Langue",
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
          "Récupérez de l'ecash depuis une autre phrase de récupération. Votre phrase actuelle reste inchangée.",
      },
    },
    lightning_address: {
      server_url: {
        label: "Nom d'hôte npub.cash",
        hint: "Saisissez un nom d'hôte ou une URL HTTPS",
        invalid: "Saisissez une URL de serveur HTTPS valide",
      },
      title: "Adresse Lightning",
      enable: {
        toggle: "Utiliser une adresse Lightning",
        description:
          "Recevez des paiements sur une adresse fournie par npub.cash",
      },
      address: {
        label: "Votre adresse",
        copy_tooltip: "Copier l'adresse Lightning",
      },
      show_on_receive: {
        toggle: "Afficher à la réception",
        description: "Afficher l'adresse et le code QR.",
      },
      automatic_claim: {
        toggle: "Réclamer automatiquement",
        description: "Recevez les paiements entrants automatiquement.",
      },
      mint: {
        label: "npub.cash mint",
        choose_title: "Choisissez une mint pour npub.cash",
        choose_placeholder: "Sélectionnez une mint...",
      },
    },
    nostr_keys: {
      title: "Vos clés Nostr",
      description: "Vos clés Nostr déterminent votre adresse Lightning.",
      wallet_seed: {
        title: "Phrase de départ du portefeuille",
        description:
          "Générer une paire de clés Nostr à partir de la phrase de récupération de votre portefeuille",
        copy_nsec: "Copier la clé privée",
      },
      nsec_bunker: {
        title: "Signataire distant",
        description: "Signer avec un bunker NIP-46",
        delete_tooltip: "Supprimer la connexion",
      },
      use_nsec: {
        title: "Utiliser votre propre clé privée",
        description: "Cette méthode est dangereuse et non recommandée",
        delete_tooltip: "Supprimer la clé privée",
      },
      signing_extension: {
        title: "Extension de signature",
        description: "Utiliser une extension de signature NIP-07",
        not_found: "Aucune extension de signature NIP-07 trouvée",
      },
    },
    payment_requests: {
      description:
        "Soyez payé via Nostr. Une fois activé, votre portefeuille écoute vos relais Nostr.",
      enable_toggle: "Activer les demandes de paiement",
      claim_automatically: {
        toggle: "Réclamer automatiquement",
        description:
          "Ajoute les paiements entrants à votre solde sans demander. Désactivé, vous les réclamez un par un.",
      },
    },
    nostr_wallet_connect: {
      description:
        "Permet à d'autres applications de payer depuis ce portefeuille via Nostr Wallet Connect.",
      enable_toggle: "Activer Nostr Wallet Connect",
      payments_note:
        "Vous ne pouvez utiliser NWC que pour les paiements à partir de votre solde Bitcoin. Les paiements seront effectués à partir de votre mint active.",
      connection: {
        copy_tooltip: "Copier la chaîne de connexion",
        qr_tooltip: "Afficher le code QR",
        allowance_label: "Montant restant (sat)",
      },
    },
    hardware_features: {
      webnfc: {
        title: "Format des cartes NFC",
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
          title: "Binaire",
          description: "Stocker le jeton en données binaires",
        },
        quick_access: {
          toggle: "Accès rapide à la NFC",
          description:
            "Ajoute un bouton NFC à l'écran Recevoir de l'ecash pour scanner des cartes.",
        },
      },
    },
    p2pk_features: {
      description:
        "Expérimental. Utilisez de petits montants : si vous perdez la clé privée, personne ne pourra déverrouiller l'ecash verrouillé avec elle.",
      generate_button: "Générer une clé",
      import_button: "Importer une clé privée",
      quick_access: {
        toggle: "Afficher la clé de verrouillage dans Recevoir",
        description:
          "Affiche votre clé de verrouillage sur l'écran Recevoir de l'ecash, pour que l'on puisse vous verrouiller de l'ecash.",
      },
      keys_expansion: {
        label: "Cliquez pour parcourir {count} clés",
        used_badge: "utilisée",
      },
    },
    privacy: {
      network_title: "Vérifications réseau",
      description: "Ces paramètres affectent votre confidentialité.",
      check_incoming: {
        toggle: "Vérifier la facture entrante",
        description:
          "Vérifie votre dernière facture en arrière-plan. Mises à jour plus rapides, mais empreinte plus facile à relever.",
      },
      check_startup: {
        toggle: "Vérifier les factures en attente au démarrage",
        description:
          "Vérifie les factures en attente à l'ouverture du portefeuille.",
      },
      check_all: {
        toggle: "Vérifier toutes les factures",
        description:
          "Vérifie les factures impayées en arrière-plan pendant deux semaines maximum. Plus d'activité en ligne rend votre empreinte plus facile à relever.",
      },
      check_sent: {
        toggle: "Vérifier l'ecash envoyé",
        description:
          "Vérifie en arrière-plan si l'ecash envoyé a été réclamé. Plus d'activité en ligne rend votre empreinte plus facile à relever.",
      },
      websockets: {
        toggle: "Utiliser les WebSockets",
        description:
          "Garde une connexion active avec les mints pour des mises à jour de paiement instantanées. Plus rapide, mais empreinte plus facile à relever.",
      },
      bitcoin_price: {
        title: "Prix du bitcoin",
        toggle: "Obtenir le taux de change de Coinbase",
        description:
          "Récupère le prix du bitcoin sur coinbase.com pour afficher votre solde en monnaie fiduciaire.",
        currency: {
          title: "Monnaie fiduciaire",
          description:
            "Choisissez la devise fiat pour l'affichage du prix Bitcoin.",
        },
      },
    },
    experimental: {
      receive_swaps: {
        toggle: "Recevoir des échanges",
        badge: "Bêta",
        description: "Propose d'échanger l'ecash reçu vers votre mint active.",
      },
      auto_paste: {
        toggle: "Coller l'ecash automatiquement",
        description:
          "Colle l'ecash du presse-papiers à l'ouverture de Recevoir de l'ecash. Désactivez-le s'il cause des problèmes d'affichage sur iOS.",
      },
      auditor: {
        toggle: "Activer l'auditeur",
        badge: "Bêta",
        description:
          "Affiche dans les détails de la mint les données de fiabilité d'un auditeur indépendant.",
        url_label: "URL de l'auditeur",
        api_url_label: "URL de l'API de l'auditeur",
      },
      multinut: {
        description: "Paie les factures depuis plusieurs mints à la fois.",
      },
      nostr_mint_backup: {
        toggle: "Sauvegarder la liste des mints sur Nostr",
        description:
          "Sauvegarde votre liste de mints sur vos relais Nostr pour la restaurer sur un autre appareil.",
        notifications: {
          enabled: "Sauvegarde Nostr des mints activée",
          disabled: "Sauvegarde Nostr des mints désactivée",
          failed: "Échec de l'activation de la sauvegarde Nostr des mints",
        },
      },
    },
    multinut: {
      use_multinut: "Paiements multi-mint",
    },
    appearance: {
      mode: {
        title: "Mode",
        dark: "Sombre",
        light: "Clair",
      },
      keyboard: {
        title: "Clavier à l'écran",
        toggle: "Utiliser le clavier numérique",
        toggle_description:
          "Utilise le pavé numérique pour saisir les montants.",
      },
      theme: {
        title: "Thème",
        description: "Changez l'apparence de votre portefeuille.",
        tooltips: {
          mono: "Mono",
          cyber: "Cyber",
          freedom: "Liberté",
          nostr: "Nostr",
          bitcoin: "Bitcoin",
          mint: "Menthe",
          nut: "Noisette",
          blu: "Bleu",
          flamingo: "Flamant",
        },
      },
      bip177: {
        title: "Symbole Bitcoin",
        description:
          "Afficher les montants sous la forme ₿2 789 au lieu de 2 789 sats.",
        toggle: "Utiliser le symbole ₿",
      },
    },
    web_of_trust: {
      title: "Réseau de confiance",
      known_pubkeys: "Clés publiques connues : {wotCount}",
      continue_crawl: "Poursuivre l'exploration",
      crawl_odell: "Importer le réseau de confiance d'Odell",
      crawl_wot: "Explorer le réseau de confiance",
      pause: "Pause",
      reset: "Réinitialiser",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    advanced: {
      backup_files_title: "Fichiers de sauvegarde",
      danger_zone_title: "Zone de danger",
      notifications: {
        reserved_unset: "Toutes les preuves réservées ont été libérées",
        removed_spent: "{count} preuves dépensées supprimées",
        no_spent: "Aucune preuve dépensée trouvée",
        invalid_backup: "Format de fichier de sauvegarde invalide",
        read_error: "Erreur de lecture du fichier",
      },
      developer: {
        title: "Paramètres développeur",
        description: "Outils de dépannage et de débogage.",
        keyset_counters: {
          title: "Incrémenter les compteurs de keyset",
          increase: "Augmenter le compteur de {id}",
          fixes: "Corrige « outputs have already been signed »",
          keysets: "{n} keyset | {n} keysets",
          sheet_hint: "Touchez + pour augmenter le compteur d’un keyset.",
          column: "Compteur",
        },
        new_seed: {
          button: "Générer une nouvelle phrase de départ",
          description:
            "Crée une nouvelle phrase de récupération. Envoyez-vous ensuite votre solde pour que la nouvelle phrase puisse le restaurer.",
          confirm_question:
            "Êtes-vous sûr de vouloir générer une nouvelle phrase de départ ?",
          cancel: "Annuler",
          confirm: "Confirmer",
        },
        remove_spent: {
          button: "Supprimer les preuves dépensées",
          description:
            "Supprime l'ecash que vos mints actives signalent comme dépensé. À utiliser uniquement si votre portefeuille est bloqué.",
        },
        design_system: {
          title: "Système de design",
          description:
            "Chaque composant de l’app, en direct, avec sa source et son usage.",
        },
        debug_console: {
          button: "Console de débogage",
          description:
            "Ouvre la console JavaScript. Ne collez jamais de code que vous ne comprenez pas ; des escrocs s'en servent pour voler des fonds.",
        },
        export_proofs: {
          button: "Exporter les preuves actives",
          description:
            "Copie le solde de la mint active dans l'unité choisie sous forme d'un seul jeton ecash.",
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
            "Télécharge un fichier de sauvegarde à importer depuis l'écran d'accueil. Il devient obsolète à mesure que vous utilisez le portefeuille.",
        },
        import_wallet: {
          description:
            "Remplace les données de ce portefeuille par un fichier de sauvegarde exporté.",
          button: "Importer une sauvegarde",
          confirm_question:
            "Voulez-vous vraiment restaurer les données de votre portefeuille ?",
          cancel: "Annuler",
          confirm: "IMPORTER UNE SAUVEGARDE",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Ajouter une mint",
    subtitle:
      "Les mints émettent l'ecash que contient ce portefeuille. Ajoutez une mint, ou recevez de l'ecash d'une mint, pour commencer.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Recevoir de l'ecash",
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
      expand: "Afficher l’historique et les mints",
      collapse: "Masquer l’historique et les mints",
    },
    tabs: {
      history: {
        label: "Historique",
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
    title: "Cashu.me est ouvert dans un autre onglet",
    text: "Fermez l'autre onglet, puis touchez Réessayer.",
    actions: {
      retry: {
        label: "Réessayer",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Cette page n'existe pas",
    actions: {
      home: {
        label: "Retour à l'accueil",
      },
    },
  },
  BalanceView: {
    total_label: "Solde total",
    show_balance: "Afficher le solde en {unit}",
    mintError: {
      label: "Erreur de la mint",
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
    },
  },
  WelcomeSlide1: {
    terms_agreement: "En continuant, vous acceptez les {terms}",
    title: "Bienvenue sur Cashu.me",
    text: "Cashu.me est un portefeuille Bitcoin gratuit et open-source qui utilise l'ecash pour garder vos fonds sécurisés et privés.",
  },
  WelcomeSlide2: {
    title: "Installer Cashu.me",
    alt: { pwa_example: "Exemple d'installation de la PWA" },
    installing: "Installation…",
    instruction: {
      intro: {
        text: "Pour la meilleure expérience, utilisez ce portefeuille avec le navigateur web natif de votre appareil pour l'installer en tant que Progressive Web App. Faites-le maintenant.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          text: "Appuyez sur le menu (en haut à droite)",
        },
        step2: {
          text: "Appuyez sur { buttonText }",
          buttonText: "@:PwaPrompt.android.add",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          text: "Appuyez sur partager (en bas)",
        },
        step2: {
          text: "Appuyez sur { buttonText }",
          buttonText: "@:PwaPrompt.ios.add",
        },
      },
      outro: {
        text: "Une fois installé, fermez cet onglet du navigateur et ouvrez Cashu.me depuis votre écran d'accueil.",
      },
    },
    pwa: {
      success: {
        title: "Succès !",
        text: "Vous utilisez Cashu comme PWA. Fermez les autres fenêtres de navigateur ouvertes et utilisez l'application depuis votre écran d'accueil.",
        nextSteps:
          "Vous pouvez maintenant fermer cet onglet et ouvrir l’application depuis votre écran d’accueil.",
      },
    },
  },
  PwaPrompt: {
    title: "Installer Cashu",
    text: "S'ouvre depuis votre écran d'accueil, sans la barre du navigateur.",
    ios: {
      share: "Appuyez sur Partager",
      add: "Sur l'écran d'accueil",
    },
    android: {
      menu: "Ouvrez le menu du navigateur",
      add: "Ajouter à l'écran d'accueil",
    },
    install: "Installer",
    notNow: "Pas maintenant",
  },
  WelcomeSlide3: {
    title: "Votre phrase de récupération",
    text: "Stockez votre phrase de départ dans un gestionnaire de mots de passe ou sur papier. Votre phrase de départ est le seul moyen de récupérer vos fonds si vous perdez l'accès à cet appareil.",
    inputs: {
      seed_phrase: {
        label: "Phrase de récupération",
        caption: "Vous pouvez voir votre phrase de départ dans les paramètres.",
      },
      checkbox: {
        label: "Je l'ai écrite",
      },
    },
  },
  WelcomeSlide4: {
    english_only: "Le texte juridique est disponible uniquement en anglais.",
    title: "Conditions d'utilisation",
    actions: {
      more: {
        label: "À lire avant d'utiliser Cashu.me",
      },
    },
    inputs: {
      checkbox: {
        label: "J'ai lu et j'accepte ces termes et conditions",
      },
    },
  },
  WelcomeSlideChoice: {
    title: "Configurez votre portefeuille",
    text: "Souhaitez-vous restaurer à partir d’une phrase de récupération ou créer un nouveau portefeuille ?",
    options: {
      new: {
        title: "Créer un nouveau portefeuille",
        subtitle: "Générez une nouvelle seed et ajoutez des mints.",
      },
      recover: {
        title: "Restaurer le portefeuille",
        subtitle:
          "Saisissez votre phrase de récupération, restaurez les mints et l’ecash.",
      },
    },
  },
  WelcomeMintSetup: {
    title: "Ajouter des mints",
    text: "Les mints sont des serveurs qui vous aident à envoyer et recevoir de l’ecash. Choisissez un mint découvert ou ajoutez-en un manuellement. Vous pouvez passer pour ajouter des mints plus tard.",
    sections: { your_mints: "Vos mints" },
    restoring: "Restauration des mints…",
    placeholder: { mint_url: "https://" },
  },
  WelcomeRecoverSeed: {
    title: "Saisissez votre phrase de récupération",
    text: "Collez ou saisissez votre phrase de 12 mots pour restaurer.",
    inputs: { word: "Mot { index }" },
    actions: { paste_all: "Tout coller" },
    progress: { words_entered: "{count}/12 mots saisis" },
    disclaimer:
      "Votre phrase de récupération est uniquement utilisée localement pour dériver les clés de votre portefeuille.",
  },
  WelcomeRestoreEcash: {
    title: "Restaurez votre ecash",
    text: "Recherchez les preuves non dépensées sur vos mints configurés et ajoutez-les à votre portefeuille.",
  },
  MintRatings: {
    sort_and_filter: "Trier et filtrer",
    reviews_title: "Avis",
    reviews_count: "{n} avis | {n} avis",
    web_of_trust_caption:
      "Ne compter que les avis des personnes de votre réseau de confiance",
    web_of_trust_hop: "Dans votre réseau de confiance (saut {hop})",
    no_mint_url: "Aucune URL de mint fournie",
    reviews: "avis",
    no_reviews: "Aucun avis pour l'instant",
    your_review: "Votre avis",
    no_rating: "Aucune note",
    stars_label: "{rating} sur 5 étoiles",
    out_of: "sur {max}",
    sort: "Trier",
    sort_options: {
      newest: "Plus récents",
      oldest: "Plus anciens",
      highest: "Plus élevées",
      lowest: "Plus basses",
    },
    actions: { write_review: "Rédiger un avis" },
    empty_state_subtitle:
      "Soyez le premier à évaluer cette mint. Votre expérience aide les autres à choisir.",
    range: "{from}–{to} sur {total}",
  },
  CreateMintReview: {
    connect_nostr:
      "Connectez un compte Nostr dans les Paramètres pour publier un avis.",
    published: "Avis publié",
    publish_failed: "Impossible de publier l'avis",
    title: "Évaluer la mint",
    publishing_as: "Publier en tant que",
    inputs: {
      rating: {
        label: "Note",
        hint: "Choisissez une note pour publier votre avis.",
      },
      review: { label: "Avis (facultatif)" },
    },
    actions: {
      publish: { label: "Publier l'avis", in_progress: "Publication…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "Restaurer depuis la phrase de récupération",
      caption:
        "Ajoutez chaque mint utilisée avec cette phrase avant de restaurer.",
      inputs: {
        seed_phrase: {
          label: "Phrase de départ",
        },
      },
    },
    information: {
      caption:
        "L'assistant ne restaurera que l'ecash d'une autre phrase de départ, vous ne pourrez pas utiliser cette phrase de départ ni changer la phrase de départ du portefeuille que vous utilisez actuellement. Cela signifie que l'ecash restauré ne sera pas protégé par votre phrase de départ actuelle tant que vous ne vous enverrez pas l'ecash une fois.",
    },
    restore_mints: {
      label: "Restaurer les mints",
      caption:
        "Choisissez les mints à restaurer. Ajoutez d'abord les mints manquantes depuis l'onglet Mints.",
    },
    actions: {
      paste: {
        error: "Échec de la lecture du contenu du presse-papiers.",
      },
      validate: {
        error: "Le mnémonique doit comporter au moins 12 mots.",
      },
      select_all: {
        label: "Tout sélectionner",
      },
      deselect_all: {
        label: "Tout désélectionner",
      },
      restore: {
        label: "Restaurer",
        error: "Erreur lors de la restauration de la mint : { error }",
      },
      restore_selected_mints: {
        label: "Restaurer les mints sélectionnées ({count})",
        success: "{count} mint(s) restaurée(s) avec succès",
        error:
          "Erreur lors de la restauration des mints sélectionnées: {error}",
      },
    },
    nostr_mints: {
      label: "Restaurer les mints depuis Nostr",
      caption:
        "Recherchez les sauvegardes de mints stockées sur les relais Nostr en utilisant votre phrase de départ. Cela vous aidera à découvrir les mints que vous avez précédemment utilisées.",
      search_button: "Rechercher des sauvegardes de mints",
      select_all: "Tout sélectionner",
      deselect_all: "Tout désélectionner",
      backed_up: "Sauvegardé",
      add_selected: "Ajouter la sélection ({count})",
      no_backups_found: "Aucune sauvegarde de mint trouvée",
      no_backups_hint:
        "Assurez-vous que la sauvegarde de la liste des mints Nostr est activée dans les paramètres pour sauvegarder automatiquement votre liste de mints.",
      invalid_mnemonic:
        "Veuillez entrer une phrase de départ valide avant de rechercher.",
      search_error: "Échec de la recherche des sauvegardes de mints.",
      add_error: "Échec de l'ajout des mints sélectionnées.",
    },
  },
  MintSettings: {
    see_reviews: "Voir les avis",
    add: {
      title: "Ajouter une mint",
      description:
        "Entrez l'URL d'une mint Cashu pour vous y connecter. Ce portefeuille n'est affilié à aucune mint.",
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "URL invalide",
        },
        scan: {
          label: "Scanner un QR code",
        },
      },
    },
    discover: {
      title: "Découvrir les mints",
      caption: "Des mints recommandées par d'autres sur Nostr.",
      actions: {
        discover: {
          label: "Découvrir les mints",
          in_progress: "Chargement…",
        },
      },
      add: "Ajouter",
      empty: {
        title: "Trouver une mint",
        text: "Cashu.me demande aux relais Nostr les mints que d’autres recommandent, avec leurs notes et avis.",
      },
      recommendations: {
        overline: "{ length } mints trouvées",
        caption: "Renseignez-vous avant d’utiliser une mint.",
      },
    },
    swap: {
      title: "Échanger",
      caption:
        "Déplacez des fonds entre vos mints via Lightning. Des frais peuvent s'appliquer.",
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
    error_badge: "Erreur",
    switching_mint: "Passage à {mint}",
    reviews_text: "avis | avis",
    no_reviews_yet: "Aucun avis pour l'instant",
    discover_mints_button: "Découvrir les mints",
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
    title: "Recevoir Lightning",
    actions: {
      create: {
        label: "Créer une facture",
        label_blocked: "Création en cours",
      },
    },
    invoice: {
      caption: "Facture Lightning",
      status_paid_text: "Payée",
      actions: {
        copy: {
          label: "Copier la facture",
        },
      },
    },
  },
  SendDialog: {
    captions: {
      ecash: "Partagez un jeton ou un QR code",
      lightning: "Payez une facture ou une adresse",
      onchain: "Envoyez vers une adresse Bitcoin",
    },
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
    badge_locked: "verrouillé",
    title: "Envoyer de l'ecash",
    inputs: {
      p2pk_pubkey: {
        label: "Clé publique du destinataire",
        invalid: "Saisissez une clé publique valide (hex ou npub)",
      },
    },
    actions: {
      copy_emoji: {
        tooltip_text: "Copier l'emoji",
      },
      copy_tokens: {
        label: "Copier l'ecash",
      },
      copy_link: {
        tooltip_text: "Copier le lien",
      },
      share: {
        tooltip_text: "Partager ecash",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      paste_p2pk_pubkey: {
        tooltip_text: "@:global.actions.paste.label",
      },
      send: {
        label: "@:global.actions.send.label",
        in_progress: "Envoi…",
      },
      delete: {
        tooltip_text: "Supprimer de l'historique",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "Flasher sur carte NFC",
        },
      },
      pay: { label: "@:global.actions.pay.label" },
    },
    errors: {
      amount_required: "Saisissez d'abord un montant.",
      serialization_failed: "Impossible de préparer le jeton ecash.",
      mint_not_allowed_by_request:
        "Cette demande de paiement n'accepte pas la mint sélectionnée.",
    },
  },
  ReceiveDialog: {
    captions: {
      ecash: "Collez, scannez ou demandez un jeton",
      lightning: "Créez une facture pour être payé",
      onchain: "Obtenez une adresse Bitcoin",
    },
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
    title: "Recevoir de l'ecash",
    actions: {
      paste: {
        label: "Coller le jeton",
      },
      scan: {
        label: "Scanner le jeton",
      },
      request: {
        label: "Demander de l'ecash",
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
    receiving_amount: "Réception de {amount}",
    title: "Recevoir de l'ecash",
    errors: {
      invalid_token: {
        label: "Jeton invalide",
      },
      p2pk_lock_mismatch: {
        label:
          "Impossible de recevoir. Le verrouillage P2PK de ce jeton ne correspond pas à votre clé publique.",
      },
    },
    actions: {
      receive: {
        label: "@:global.actions.receive.label",
        label_known_mint: "@:ReceiveTokenDialog.actions.receive.label",
        label_adding_mint: "Ajout de la mint…",
      },
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "Échanger vers une mint de confiance",
        processing: "Échange en cours…",
        failed: "Échec de l'échange",
      },
      cancel_swap: {
        tooltip_text: "Annuler l'échange",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
      },
      later: {
        label: "Recevoir plus tard",
        tooltip_text: "Ajouter à l'historique pour recevoir plus tard",
        already_in_history_success_text: "Ecash déjà dans l'historique",
        added_to_history_success_text: "Ecash ajouté à l'historique",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Lire à partir de la carte NFC",
        },
      },
      receive_to_selected_mint: { label: "Recevoir sur la mint sélectionnée" },
    },
    unknown_mint_info_text:
      "Mint inconnue. Elle sera ajoutée après la réception de ce jeton.",
    swap_section: {
      title: "Échange",
      source_label: "De",
      destination_label: "Vers",
      fee_info: "Cet échange entraînera des frais du réseau Lightning.",
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "Clé de verrouillage",
      description: "Recevoir de l'ecash verrouillé sur cette clé",
      used_warning_text:
        "Attention : Cette clé a déjà été utilisée. Utilisez une nouvelle clé pour une meilleure confidentialité.",
    },
    actions: {
      copy: {
        label: "Copier la clé publique",
      },
      new_key: {
        label: "Générer une nouvelle clé",
      },
    },
  },
  PaymentRequestDialog: {
    any_amount: "Montant libre",
    payment_request: {
      caption: "Demande de paiement",
    },
    request_index: "Demande {index} sur {total}",
    actions: {
      set_amount: {
        label: "Définir le montant",
      },
      copy: {
        label: "@:global.actions.copy.label",
      },
      new_request: {
        label: "Nouvelle demande",
      },
      share: {
        label: "Partager",
      },
      add_amount: {
        label: "Ajouter un montant",
      },
      use_active_mint: {
        label: "N'importe quelle mint",
      },
      remove_amount: {
        label: "Retirer le montant",
      },
      previous: {
        label: "Demande précédente",
      },
      next: {
        label: "Demande suivante",
      },
    },
    inputs: {
      amount: {
        placeholder: "Entrez le montant",
      },
    },
    received_total: "Total reçu",
    no_payments_yet: "Aucun paiement pour l'instant",
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
    title: "Message de la mint",
  },
  MintDetailsDialog: {
    qr: {
      show: "Afficher le code QR",
      hide: "Masquer le code QR",
    },
    contact: {
      title: "Contact",
      email: "E-mail",
    },
    details: {
      title: "Détails de la mint",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Fonctionnalités prises en charge",
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
        label: "Unité",
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
    nuts: {
      nut7: "Vérification de l'état des jetons",
      nut8: "Frais Lightning payés en trop",
      nut9: "Restauration des signatures",
      nut10: "Conditions de dépense",
      nut11: "Pay-to-Pubkey (P2PK)",
      nut12: "Preuves DLEQ",
      nut13: "Secrets déterministes",
      nut14: "Hashed Timelock Contracts (HTLC)",
      nut15: "Paiements multi-chemins partiels",
      nut16: "Codes QR animés",
      nut17: "Abonnements WebSocket",
      nut18: "Demandes de paiement",
      nut19: "Réponses en cache",
      nut20: "Signature du devis de mint",
      nut21: "Authentification en clair",
      nut22: "Authentification aveugle",
    },
  },
  UnitToggle: {
    label: "Unité : {unit}, changer",
    bitcoin: "Bitcoin",
  },
  ChooseMint: {
    open_selector: "Choisir une mint, mint actuelle : {mint}",
    open_selector_empty: "Choisir une mint",
    title: "Sélectionnez une mint",
    badge_mint_error_text: "Erreur",
    available_text: "sur cette mint",
    sheet_title: "Choisir une mint",
    placeholder: "Choisir une mint",
  },
  HistoryTable: {
    empty_text: "Aucun historique pour l'instant",
    empty_hint: "Les paiements envoyés et reçus apparaissent ici.",
    filters: {
      title: "Filtrer l'historique",
      direction: "Sens",
      type: "Type",
      completed: "Terminé",
      received: "Reçu",
      sent: "Envoyé",
      reset: "Réinitialiser",
      clear_all: "Tout effacer",
      remove: "Retirer le filtre : {label}",
      empty_title: "Aucun paiement ne correspond à ces filtres",
      clear: "Effacer les filtres",
      count: "{shown} sur {total}",
      active: "Filtrer l'historique, {count} actifs",
    },
    row: {
      type_label: "Ecash",
    },
    actions: {
      check_status: {
        tooltip_text: "Vérifier le statut",
      },
      receive: {
        tooltip_text: "Recevoir",
      },
    },
    old_token_not_found_error_text: "Ancien jeton introuvable",
    labels: {
      onchain_subpayment: "Paiement partiel on-chain",
      bolt12_subpayment: "Paiement partiel BOLT12",
    },
  },
  InvoiceTable: {
    row: {
      type_label: "Lightning",
    },
  },
  RemoveMintDialog: {
    title: "Retirer cette mint ?",
    nickname: {
      label: "Surnom",
    },
    balances: {
      label: "Solde sur cette mint",
    },
    warning_text:
      "Votre ecash de cette mint reste sur cet appareil. Il réapparaît si vous ajoutez de nouveau la mint.",
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
  ParseInputComponent: {
    placeholder: {
      default: "Token Cashu ou adresse Lightning",
      receive: "Token Cashu",
      pay: "Adresse Lightning ou facture",
    },
    qr_scanner: {
      title: "Scanner un QR code",
      description: "Pointez votre caméra vers un QR code",
      caption_address: "Appuyez pour scanner une adresse",
      caption_token: "Appuyez pour scanner un jeton",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    onchain: {
      title: "Payer on-chain",
      address_placeholder: "Adresse Bitcoin",
      choose_speed: "Choisissez la vitesse de confirmation",
      blocks: "{n} bloc | {n} blocs",
      estimated_confirmation: "Confirmation estimée",
      fee_reserve: "réserve de frais",
    },
    multinut: {
      label: "Payer avec plusieurs mints",
    },
    quote: {
      label: "Devis",
    },
    input_data: {
      title: "Payer avec Lightning",
      title_bolt12: "Payer une offre Lightning",
    },
    lnurlpay: {
      amount_exact_label: "{ payee } demande { value } { ticker }",
      amount_range_label:
        "{ payee } demande{br}entre { min } et { max } { ticker }",
      sending_to_lightning_address: "Envoi à { address }",
      inputs: {
        comment: {
          label: "Commentaire (optionnel)",
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
      paying: "Paiement en cours",
      paid: "Payé",
      fee: "Frais",
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
          waiting_for_wallet: "En attente du portefeuille…",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Modifier la mint",
    inputs: {
      nickname: {
        label: "Surnom (facultatif)",
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
    title: "Faites-vous confiance à cette mint ?",
    description:
      "Rejoignez cette mint uniquement si vous lui faites confiance. Si elle cesse ses activités, l'ecash que vous y détenez est perdu.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
        in_progress: "Ajout de la mint",
      },
    },
    audit_info: {
      label: "Infos d'audit",
      actions: {
        show: {
          label: "Afficher",
        },
        hide: {
          label: "Masquer",
        },
      },
    },
    unreachable_error_text:
      "Cette mint est injoignable. Vérifiez l'URL et votre connexion, puis réessayez.",
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
  swap: {
    in_progress_warning_text: "Échange en cours",
    invalid_swap_data_error_text: "Données d'échange invalides",
    swap_error_text: "Erreur lors de l'échange",
  },
  TokenInformation: {
    fee: "Frais",
    token: "Jeton",
    unit: "Unité",
    fiat: "Fiat",
    p2pk: "P2PK",
    locked: "Verrouillé",
    locked_to_you: "Verrouillé pour vous",
    mint: "Monnaie",
    memo: "Mémo",
    payment_request: "Demande de paiement",
    nostr: "Nostr",
    token_copied: "Token copié dans le presse-papiers",
  },
  ActivityRow: {
    received: "Reçu",
    sent: "Envoyé",
    receiving: "Réception en cours",
    sending: "Envoi en cours",
  },
  common: {
    copied: "Copié",
    on_chain: "On-chain",
    pending: "En attente",
    delete: "Supprimer",
    copy_npub: "Copier le npub",
    back: "Retour",
    refresh: "Actualiser",
    settings: "Paramètres",
    backspace: "Effacer",
    enter_amount_in: "Saisir le montant en {fiat}",
    something_went_wrong: "Une erreur s'est produite",
  },
  SendPaymentRequest: {
    actions: {
      pay: { label: "Payer" },
      pay_via: { label: "Payer via {transport}" },
    },
    info: {
      pay_failed: "Impossible de payer la demande",
      no_ecash: "Aucun ecash disponible pour cette demande de paiement",
    },
  },
  PaymentRequestInfo: {
    title_with_transport: "Demande de paiement via {transport}",
    title: "Demande de paiement",
    subtitle: "Payer {target}",
    subtitle_fallback: "Demande de paiement",
    invalid_url: "URL invalide",
  },
  QuoteInformation: {
    address: "Adresse",
    invoice: "Facture",
    request: "Demande",
    amount: "Montant",
    fee_reserve: "Réserve de frais",
    fee_paid: "Frais payés",
    unit: "Unité",
    status: "Statut",
    network: "Réseau",
    transaction_id: "ID de transaction",
    explorer: "Explorateur",
    confirmations: "Confirmations",
    paid_at: "Payé le",
    preimage: "Préimage",
    preimage_copied: "Préimage copiée",
    mint: "Mint",
    method: "Méthode",
    lightning_offer: "Offre Lightning",
    states: {
      waiting: "En attente du paiement",
      confirming: "Confirmation ({count}/{threshold})",
      issuing: "Émission de l'ecash",
      paid: "Payée",
      unpaid: "Non payée",
      pending: "En attente",
      issued: "Émise",
      expired: "Expirée",
      failed: "Échouée",
    },
  },
  MintAuditInfo: {
    title: "Infos d'audit",
    loading: "Chargement des infos d'audit...",
    not_audited: "Ce mint n'a pas encore été audité.",
    not_audited_text:
      "Pour en savoir plus sur l'auditeur ou soutenir un futur audit, visitez {link} ou cliquez {here} pour donner de l'ecash et aider à lancer un audit de cette mint.",
    here: "ici",
    unavailable: "Les infos d'audit sont indisponibles pour le moment.",
    load_failed: "Impossible de charger les données de la mint",
    success_rate: "Taux de réussite",
    swaps_count: "{successful} sur {total} échanges",
    average_time: "Temps moyen",
    average_time_caption: "Pour les échanges réussis",
    disclaimer:
      "Les données d'audit sont fournies par des tiers indépendants pour aider à évaluer la fiabilité d'une mint dans le temps. Ces résultats sont toutefois purement informatifs et ne garantissent ni la sécurité, ni la solvabilité, ni la fiabilité d'une mint. Faites toujours vos propres recherches et assurez-vous de faire confiance à l'opérateur de la mint avant d'utiliser ses services.",
    donate_text:
      "Les informations d'audit sont fournies par {link}. Le solde actuel détenu par l'auditeur pour cette mint est de {balance}, pour un total de {donations} donnés à ce jour. Pour soutenir la poursuite des audits, vous pouvez {press_here} afin de donner de l'ecash à l'auditeur.",
    press_here: "appuyer ici",
    sats_amount: "{amount} sats",
    warnings_title: "Avertissements de l'auditeur",
    warnings: {
      last_swap_failed: "La dernière tentative d'échange a échoué.",
      recent_success:
        "{successful} échanges sur {total} ont réussi au cours des {days} derniers jours.",
      reliable:
        "{base} Cependant, {success} Cette mint semble fiable, les échecs pourraient venir de la mint destinataire.",
      unreliable:
        "{base} Seulement {success} Cette mint pourrait ne pas être fiable.",
      unknown:
        "L'auditeur n'a pas encore pu déterminer la qualité de cette mint.",
      not_enough_data:
        "L'auditeur ne dispose pas d'assez de données récentes sur cette mint. Il n'y a eu que {count} échange réussi au cours des {days} derniers jours. | L'auditeur ne dispose pas d'assez de données récentes sur cette mint. Il n'y a eu que {count} échanges réussis au cours des {days} derniers jours.",
      low_success:
        "Au cours des {days} derniers jours, cette mint a eu un taux de réussite de {rate} %, inférieur aux {threshold} % recommandés.",
      inactive:
        "Cette mint n'a eu aucun échange depuis {days} jour. Elle est peut-être injoignable. | Cette mint n'a eu aucun échange depuis {days} jours. Elle est peut-être injoignable.",
      slow: "Cette mint est lente. Les paiements depuis cette mint ont pris {seconds} secondes en moyenne.",
      no_successful:
        "Aucun échange réussi enregistré pour cette mint. Elle est peut-être injoignable.",
    },
    chart: {
      now: "Maintenant",
      today: "Aujourd'hui",
      yesterday: "Hier",
      invalid_date: "Date invalide",
      swaps: "Échanges :",
      success_rate: "Taux de réussite :",
      time_range: "Période :",
    },
  },
  DisplayTokenComponent: {
    title: {
      send: "Envoyer de l’ecash",
      sent: "Ecash envoyé",
      received: "Ecash reçu",
    },
    qr_speed: "Vitesse QR : {value}",
    qr_density: "Densité QR : {value}",
    speed: {
      fast: "Rapide",
      medium: "Moyenne",
      slow: "Lente",
    },
    density: {
      high: "Élevée",
      medium: "Moyenne",
      low: "Faible",
    },
    delete_dialog: {
      title: "Supprimer l'ecash",
      text: "Voulez-vous vraiment supprimer cette transaction de votre historique ?",
      warning:
        "Attention : cette action est irréversible et il est impossible de récupérer le jeton.",
    },
    nfc: {
      read_failed: "Échec de la lecture NFC",
      write_failed: "Échec de l'écriture NFC",
      error: "Erreur NFC",
      writing: "Écriture sur la carte NFC...",
      success: "Jeton écrit sur la carte avec succès !",
      capacity:
        "La carte n'a peut-être pas assez de capacité ({bytes} octets nécessaires).",
    },
  },
  CreateInvoiceDialog: {
    format_label: "Type de demande",
    formats: {
      bolt11: "Facture",
      bolt12: "Offre",
    },
    onchain_title: "Recevoir on-chain",
    bolt12_title: "Recevoir Bolt12",
    mint_unreachable: "Mint injoignable",
    mint_unreachable_text:
      "Reconnectez-vous à la mint pour recevoir des paiements.",
    reconnect_mint: "Reconnecter la mint",
    checking_address: "Vérification de l'adresse...",
    add_amount: "Ajouter un montant",
    new_offer: "Nouvelle offre",
    create_offer: "Créer une offre",
    create_new_address: "Créer une nouvelle adresse",
    create_address: "Créer une adresse",
    onchain_unsupported:
      "Cette mint ne prend pas en charge les dépôts on-chain dans cette unité.",
    deposit_limits: {
      outside: "Les dépôts hors de {min}–{max} ne seront pas crédités.",
      below: "Les dépôts inférieurs à {min} ne seront pas crédités.",
      above: "Les dépôts supérieurs à {max} ne seront pas crédités.",
    },
    amount_errors: {
      positive_decimal:
        "Saisissez un montant positif en {unit} avec au plus deux décimales.",
      positive_whole: "Saisissez un montant entier positif en {unit}.",
      min: "Saisissez au moins {amount}.",
      max: "Saisissez au plus {amount}.",
    },
  },
  storage: {
    notifications: {
      unrecognized_backup: "Format de sauvegarde non reconnu",
      backup_restored: "Sauvegarde restaurée",
      backup_exported: "Sauvegarde du portefeuille exportée",
      quota_exceeded:
        "Le stockage local est plein. Libérez de l'espace dans votre stockage local.",
      cleaned_up: "{size} octets libérés",
    },
  },
  receiveTokens: {
    notifications: {
      already_in_history: "Jeton déjà dans l'historique",
      nfc_read_failed: "Impossible de lire les données du tag NFC",
      scan_error: "Erreur de scan",
      nfc_error: "Erreur NFC",
    },
  },
  nostrMintBackup: {
    notifications: {
      no_relays: "Aucun relais Nostr configuré",
      backup_failed: "Impossible de sauvegarder votre liste de mints sur Nostr",
      backed_up: "Liste de mints sauvegardée sur Nostr",
      found:
        "{count} mint trouvée dans les sauvegardes Nostr | {count} mints trouvées dans les sauvegardes Nostr",
      none_found:
        "Aucune sauvegarde de mint trouvée sur Nostr pour cette phrase de récupération",
      search_failed: "Impossible de rechercher les sauvegardes de mints",
      add_mint_failed: "Impossible d'ajouter {mint}",
      added:
        "{count} mint ajoutée à votre portefeuille | {count} mints ajoutées à votre portefeuille",
      none_added: "Aucune nouvelle mint ajoutée",
      add_selected_failed: "Impossible d'ajouter les mints sélectionnées",
    },
  },
  nostr: {
    notifications: {
      nip04_published: "Événement NIP-04 publié",
      nip04_failed: "Impossible de publier l'événement NIP-04",
      nip17_failed: "Impossible de publier l'événement NIP-17",
      receive_failed: "Impossible de recevoir le paiement entrant",
      ecash_already_in_history: "Ecash déjà dans l'historique",
      ecash_added: "Ecash ajouté à l'historique",
    },
  },
  nwc: {
    notifications: {
      melt_quote_failed: "NWC : impossible de demander un devis de melt",
      unit_must_be_sat: "NWC : l'unité active doit être sats",
      allowance_exceeded: "NWC : limite dépassée",
    },
  },
  npubcash: {
    notifications: {
      could_not_update_mint: "Impossible de mettre à jour la mint npub.cash",
      add_mint_first: "Ajoutez d'abord {mint} à votre portefeuille",
    },
  },
};
