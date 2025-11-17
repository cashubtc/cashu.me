export default {
  MultinutPicker: {
    payment: "Πληρωμή Multinut",
    selectMints:
      "Επιλέξτε ένα ή περισσότερα mints για να εκτελέσετε μια πληρωμή.",
    totalSelectedBalance: "Συνολικό επιλεγμένο υπόλοιπο",
    multiMintPay: "Πληρωμή Multi-Mint",
    balanceNotEnough:
      "Το υπόλοιπο πολλών νομισματοκοπείων δεν επαρκεί για την κάλυψη αυτού του τιμολογίου",
    failed: "Η επεξεργασία απέτυχε: {error}",
    paid: "Πληρώθηκε {amount} μέσω Lightning",
  },
  global: {
    copy_to_clipboard: {
      success: "Αντιγράφηκε στο πρόχειρο!",
    },
    actions: {
      add_mint: {
        label: "Προσθήκη mint",
      },
      cancel: {
        label: "Ακύρωση",
      },
      copy: {
        label: "Αντιγραφή",
      },
      close: {
        label: "Κλείσιμο",
      },
      enter: {
        label: "Είσοδος",
      },
      lock: {
        label: "Κλείδωμα",
      },
      paste: {
        label: "Επικόλληση",
      },
      receive: {
        label: "Λήψη",
      },
      scan: {
        label: "Σάρωση",
      },
      send: {
        label: "Αποστολή",
      },
      swap: {
        label: "Ανταλλαγή",
      },
      update: {
        label: "Ενημέρωση",
      },
    },
    inputs: {
      mint_url: {
        label: "URL Mint",
      },
    },
  },
  wallet: {
    notifications: {
      balance_too_low: "Το υπόλοιπο είναι πολύ χαμηλό",
      received: "Λήφθηκε {amount}",
      fee: " (προμήθεια: {fee})",
      could_not_request_mint: "Δεν ήταν δυνατή η αίτηση στο mint",
      invoice_still_pending: "Το τιμολόγιο εκκρεμεί ακόμα",
      paid_lightning: "Πληρώθηκε {amount} μέσω Lightning",
      payment_pending_refresh:
        "Πληρωμή σε εκκρεμότητα. Ανανεώστε το τιμολόγιο χειροκίνητα.",
      sent: "Στάλθηκε {amount}",
      token_still_pending: "Το token εκκρεμεί ακόμα",
      received_lightning: "Λήφθηκε {amount} μέσω Lightning",
      lightning_payment_failed: "Η πληρωμή Lightning απέτυχε",
      failed_to_decode_invoice: "Αποτυχία αποκωδικοποίησης τιμολογίου",
      invalid_lnurl: "Μη έγκυρο LNURL",
      lnurl_error: "Σφάλμα LNURL",
      no_amount: "Δεν υπάρχει ποσό",
      no_lnurl_data: "Δεν υπάρχουν δεδομένα LNURL",
      no_price_data: "Δεν υπάρχουν δεδομένα τιμής.",
      please_try_again: "Παρακαλώ προσπαθήστε ξανά.",
    },
    mint: {
      notifications: {
        already_added: "Το mint έχει ήδη προστεθεί",
        added: "Το mint προστέθηκε",
        not_found: "Το mint δεν βρέθηκε",
        activation_failed: "Η ενεργοποίηση του mint απέτυχε",
        no_active_mint: "Δεν υπάρχει ενεργό mint",
        unit_activation_failed: "Η ενεργοποίηση μονάδας απέτυχε",
        unit_not_supported: "Η μονάδα δεν υποστηρίζεται από το mint",
        activated: "Το mint ενεργοποιήθηκε",
        could_not_connect: "Δεν ήταν δυνατή η σύνδεση στο mint",
        could_not_get_info: "Δεν ήταν δυνατή η λήψη πληροφοριών mint",
        could_not_get_keys: "Δεν ήταν δυνατή η λήψη κλειδιών mint",
        could_not_get_keysets: "Δεν ήταν δυνατή η λήψη συνόλων κλειδιών mint",
        mint_validation_error: "Σφάλμα επικύρωσης Mint",
        removed: "Το mint αφαιρέθηκε",
        error: "Σφάλμα mint",
      },
    },
  },
  MainHeader: {
    menu: {
      settings: {
        title: "Ρυθμίσεις",
        settings: {
          title: "Ρυθμίσεις",
          caption: "Διαμόρφωση πορτοφολιού",
        },
      },
      terms: {
        title: "Όροι",
        terms: {
          title: "Όροι",
          caption: "Όροι Παροχής Υπηρεσιών",
        },
      },
      links: {
        title: "Σύνδεσμοι",
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
          title: "Δωρεά",
          caption: "Υποστήριξη Cashu",
        },
      },
    },
    offline: {
      warning: {
        text: "Εκτός σύνδεσης",
      },
    },
    reload: {
      warning: {
        text: "Επαναφόρτωση σε { countdown }",
      },
    },
    staging: {
      warning: {
        text: "Staging – μην το χρησιμοποιείτε με πραγματικά κεφάλαια!",
      },
    },
  },
  FullscreenHeader: {
    actions: {
      back: {
        label: "Πορτοφόλι",
      },
    },
  },
  Settings: {
    language: {
      title: "Γλώσσα",
      description:
        "Παρακαλώ επιλέξτε την προτιμώμενη γλώσσα σας από την παρακάτω λίστα.",
    },
    sections: {
      backup_restore: "ΑΝΤΙΓΡΑΦΟ ΑΣΦΑΛΕΙΑΣ & ΕΠΑΝΑΦΟΡΑ",
      lightning_address: "ΔΙΕΥΘΥΝΣΗ LIGHTNING",
      nostr_keys: "ΚΛΕΙΔΙΑ NOSTR",
      nostr: {
        title: "NOSTR",
        relays: {
          expand_label: "Κάντε κλικ για να επεξεργαστείτε τα relays",
          add: {
            title: "Προσθήκη relay",
            description:
              "Το πορτοφόλι σας χρησιμοποιεί αυτά τα relays για λειτουργίες nostr όπως αιτήματα πληρωμής, nostr wallet connect και αντίγραφα ασφαλείας.",
          },
          list: {
            title: "Relays",
            description: "Το πορτοφόλι σας θα συνδεθεί σε αυτά τα relays.",
            copy_tooltip: "Αντιγραφή relay",
            remove_tooltip: "Κατάργηση relay",
          },
        },
      },
      payment_requests: "ΑΙΤΗΜΑΤΑ ΠΛΗΡΩΜΗΣ",
      nostr_wallet_connect: "NOSTR WALLET CONNECT",
      hardware_features: "ΧΑΡΑΚΤΗΡΙΣΤΙΚΑ ΥΛΙΚΟΥ",
      p2pk_features: "ΧΑΡΑΚΤΗΡΙΣΤΙΚΑ P2PK",
      privacy: "ΑΠΟΡΡΗΤΟ",
      experimental: "ΠΕΙΡΑΜΑΤΙΚΟ",
      appearance: "ΕΜΦΑΝΙΣΗ",
    },
    backup_restore: {
      backup_seed: {
        title: "Φράση seed αντιγράφου ασφαλείας",
        description:
          "Η φράση seed σας μπορεί να επαναφέρει το πορτοφόλι σας. Κρατήστε την ασφαλή και ιδιωτική.",
        seed_phrase_label: "Φράση seed",
      },
      restore_ecash: {
        title: "Επαναφορά ecash",
        description:
          "Ο οδηγός επαναφοράς σάς επιτρέπει να ανακτήσετε χαμένο ecash από μια μνημονική φράση seed. Η φράση seed του τρέχοντος πορτοφολιού σας θα παραμείνει ανεπηρέαστη, ο οδηγός θα σας επιτρέψει μόνο να επαναφέρετε ecash από μια άλλη φράση seed.",
        button: "Επαναφορά",
      },
    },
    lightning_address: {
      title: "Διεύθυνση Lightning",
      description: "Λάβετε πληρωμές στη διεύθυνση Lightning σας.",
      enable: {
        toggle: "Ενεργοποίηση",
        description: "Διεύθυνση Lightning με npub.cash",
      },
      address: {
        copy_tooltip: "Αντιγραφή διεύθυνσης Lightning",
      },
      automatic_claim: {
        toggle: "Αυτόματη διεκδίκηση",
        description: "Λήψη εισερχόμενων πληρωμών αυτόματα.",
      },
      npc_v2: {
        choose_mint_title: "Επιλέξτε mint για npub.cash v2",
        choose_mint_placeholder: "Επιλέξτε ένα mint...",
      },
    },
    nostr_keys: {
      title: "Τα κλειδιά σας nostr",
      description: "Ορίστε τα κλειδιά nostr για τη διεύθυνση Lightning σας.",
      wallet_seed: {
        title: "Φράση seed πορτοφολιού",
        description:
          "Δημιουργία ζεύγους κλειδιών nostr από τη seed του πορτοφολιού",
        copy_nsec: "Αντιγραφή nsec",
      },
      nsec_bunker: {
        title: "Nsec Bunker",
        description: "Χρήση bunker NIP-46",
        delete_tooltip: "Διαγραφή σύνδεσης",
      },
      use_nsec: {
        title: "Χρησιμοποιήστε το nsec σας",
        description: "Αυτή η μέθοδος είναι επικίνδυνη και δεν συνιστάται",
        delete_tooltip: "Διαγραφή nsec",
      },
      signing_extension: {
        title: "Επέκταση υπογραφής",
        description: "Χρήση επέκτασης υπογραφής NIP-07",
        not_found: "Δεν βρέθηκε επέκταση υπογραφής NIP-07",
      },
    },
    payment_requests: {
      title: "Αιτήματα πληρωμής",
      description:
        "Τα αιτήματα πληρωμής σάς επιτρέπουν να λαμβάνετε πληρωμές μέσω nostr. Εάν το ενεργοποιήσετε, το πορτοφόλι σας θα εγγραφεί στα relays nostr σας.",
      enable_toggle: "Ενεργοποίηση Αιτημάτων Πληρωμής",
      claim_automatically: {
        toggle: "Αυτόματη διεκδίκηση",
        description: "Λήψη εισερχόμενων πληρωμών αυτόματα.",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Wallet Connect (NWC)",
      description:
        "Χρησιμοποιήστε το NWC για να ελέγξετε το πορτοφόλι σας από οποιαδήποτε άλλη εφαρμογή.",
      enable_toggle: "Ενεργοποίηση NWC",
      payments_note:
        "Μπορείτε να χρησιμοποιήσετε το NWC μόνο για πληρωμές από το υπόλοιπο Bitcoin σας. Οι πληρωμές θα γίνονται από το ενεργό σας mint.",
      connection: {
        copy_tooltip: "Αντιγραφή συμβολοσειράς σύνδεσης",
        qr_tooltip: "Εμφάνιση κωδικού QR",
        allowance_label: "Υπολειπόμενο όριο (sat)",
      },
    },
    hardware_features: {
      webnfc: {
        title: "WebNFC",
        description: "Επιλέξτε την κωδικοποίηση για εγγραφή σε κάρτες NFC",
        text: {
          title: "Κείμενο",
          description: "Αποθήκευση token σε απλό κείμενο",
        },
        weburl: {
          title: "URL",
          description: "Αποθήκευση URL σε αυτό το πορτοφόλι με token",
        },
        binary: {
          title: "Δυαδικό",
          description: "Αποθήκευση tokens ως δυαδικά δεδομένα",
        },
        quick_access: {
          toggle: "Γρήγορη πρόσβαση σε NFC",
          description:
            "Γρήγορη σάρωση καρτών NFC στο μενού Λήψη Ecash. Αυτή η επιλογή προσθέτει ένα κουμπί NFC στο μενού Λήψη Ecash.",
        },
      },
    },
    p2pk_features: {
      title: "P2PK",
      description:
        "Δημιουργία ζεύγους κλειδιών για λήψη ecash κλειδωμένου με P2PK. Προειδοποίηση: Αυτή η δυνατότητα είναι πειραματική. Χρησιμοποιήστε μόνο με μικρά ποσά. Εάν χάσετε τα ιδιωτικά σας κλειδιά, κανείς δεν θα μπορεί πλέον να ξεκλειδώσει το ecash που είναι κλειδωμένο σε αυτά.",
      generate_button: "Δημιουργία κλειδιού",
      import_button: "Εισαγωγή nsec",
      quick_access: {
        toggle: "Γρήγορη πρόσβαση στο κλείδωμα",
        description:
          "Χρησιμοποιήστε το για να εμφανίσετε γρήγορα το κλειδί κλειδώματος P2PK στο μενού λήψης ecash.",
      },
      keys_expansion: {
        label: "Κάντε κλικ για περιήγηση σε {count} κλειδιά",
        used_badge: "χρησιμοποιημένο",
      },
    },
    privacy: {
      title: "Απόρρητο",
      description: "Αυτές οι ρυθμίσεις επηρεάζουν το απόρρητό σας.",
      check_incoming: {
        toggle: "Έλεγχος εισερχόμενου τιμολογίου",
        description:
          "Εάν είναι ενεργοποιημένο, το πορτοφόλι θα ελέγχει το τελευταίο τιμολόγιο στο παρασκήνιο. Αυτό αυξάνει την απόκριση του πορτοφολιού, καθιστώντας ευκολότερο το fingerprinting. Μπορείτε να ελέγξετε μη αυτόματα τα απλήρωτα τιμολόγια στην καρτέλα Τιμολόγια.",
      },
      check_startup: {
        toggle: "Έλεγχος εκκρεμών τιμολογίων κατά την εκκίνηση",
        description:
          "Εάν είναι ενεργοποιημένο, το πορτοφόλι θα ελέγχει τα εκκρεμή τιμολόγια των τελευταίων 24 ωρών κατά την εκκίνηση.",
      },
      check_all: {
        toggle: "Έλεγχος όλων των τιμολογίων",
        description:
          "Εάν είναι ενεργοποιημένο, το πορτοφόλι θα ελέγχει περιοδικά τα απλήρωτα τιμολόγια στο παρασκήνιο για έως και δύο εβδομάδες. Αυτό αυξάνει τη διαδικτυακή δραστηριότητα του πορτοφολιού, καθιστώντας ευκολότερο το fingerprinting. Μπορείτε να ελέγξετε μη αυτόματα τα απλήρωτα τιμολόγια στην καρτέλα Τιμολόγια.",
      },
      check_sent: {
        toggle: "Έλεγχος απεσταλμένου ecash",
        description:
          "Εάν είναι ενεργοποιημένο, το πορτοφόλι θα χρησιμοποιεί περιοδικούς ελέγχους παρασκηνίου για να προσδιορίσει εάν τα απεσταλμένα token έχουν εξαργυρωθεί. Αυτό αυξάνει τη διαδικτυακή δραστηριότητα του πορτοφολιού, καθιστώντας ευκολότερο το fingerprinting.",
      },
      websockets: {
        toggle: "Χρήση WebSockets",
        description:
          "Εάν είναι ενεργοποιημένο, το πορτοφόλι θα χρησιμοποιεί μακροχρόνιες συνδέσεις WebSocket για λήψη ενημερώσεων σχετικά με πληρωμένα τιμολόγια και δαπανημένα token από τα mints. Αυτό αυξάνει την απόκριση του πορτοφολιού αλλά καθιστά επίσης ευκολότερο το fingerprinting.",
      },
      bitcoin_price: {
        toggle: "Λήψη συναλλαγματικής ισοτιμίας από Coinbase",
        description:
          "Εάν είναι ενεργοποιημένο, η τρέχουσα συναλλαγματική ισοτιμία Bitcoin θα ληφθεί από το coinbase.com και θα εμφανιστεί το μετατραπέν υπόλοιπό σας.",
        currency: {
          title: "Νόμισμα Fiat",
          description:
            "Επιλέξτε το νόμισμα fiat για την εμφάνιση της τιμής Bitcoin.",
        },
      },
    },
    experimental: {
      title: "Πειραματικό",
      description: "Αυτές οι δυνατότητες είναι πειραματικές.",
      receive_swaps: {
        toggle: "Λήψη ανταλλαγών",
        badge: "Beta",
        description:
          "Επιλογή ανταλλαγής του ληφθέντος Ecash στο ενεργό σας mint στον διάλογο Λήψη Ecash.",
      },
      auto_paste: {
        toggle: "Αυτόματη επικόλληση Ecash",
        description:
          "Αυτόματη επικόλληση του ecash στο πρόχειρό σας όταν πατάτε Λήψη, μετά Ecash, μετά Επικόλληση. Η αυτόματη επικόλληση μπορεί να προκαλέσει δυσλειτουργίες στο UI στο iOS, απενεργοποιήστε την εάν αντιμετωπίζετε προβλήματα.",
      },
      auditor: {
        toggle: "Ενεργοποίηση ελεγκτή",
        badge: "Beta",
        description:
          "Εάν είναι ενεργοποιημένο, το πορτοφόλι θα εμφανίζει πληροφορίες ελεγκτή στον διάλογο λεπτομερειών του mint. Ο ελεγκτής είναι μια υπηρεσία τρίτου μέρους που παρακολουθεί την αξιοπιστία των mints.",
        url_label: "URL Ελεγκτή",
        api_url_label: "URL API Ελεγκτή",
      },
      multinut: {
        toggle: "Ενεργοποίηση Multinut",
        description:
          "Εάν είναι ενεργοποιημένο, το πορτοφόλι θα χρησιμοποιεί το Multinut για την πληρωμή τιμολογίων από πολλαπλά mints ταυτόχρονα.",
      },
      nostr_mint_backup: {
        toggle: "Δημιουργία αντιγράφων ασφαλείας της λίστας mint στο Nostr",
        description:
          "Εάν είναι ενεργοποιημένο, η λίστα mint σας θα δημιουργείται αυτόματα αντίγραφα ασφαλείας στα ρελέ Nostr χρησιμοποιώντας τα διαμορφωμένα κλειδιά Nostr. Αυτό σας επιτρέπει να επαναφέρετε τη λίστα mint σας σε όλες τις συσκευές.",
        notifications: {
          enabled: "Ενεργοποιήθηκε το αντίγραφο ασφαλείας Nostr mint",
          disabled: "Απενεργοποιήθηκε το αντίγραφο ασφαλείας Nostr mint",
          failed: "Αποτυχία ενεργοποίησης του αντιγράφου ασφαλείας Nostr mint",
        },
      },
    },
    appearance: {
      keyboard: {
        title: "Πληκτρολόγιο οθόνης",
        description:
          "Χρησιμοποιήστε το αριθμητικό πληκτρολόγιο για την εισαγωγή ποσών.",
        toggle: "Χρήση αριθμητικού πληκτρολογίου",
        toggle_description:
          "Εάν είναι ενεργοποιημένο, θα χρησιμοποιείται το αριθμητικό πληκτρολόγιο για την εισαγωγή ποσών.",
      },
      theme: {
        title: "Εμφάνιση",
        description: "Αλλάξτε την εμφάνιση του πορτοφολιού σας.",
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
        title: "Σύμβολο Bitcoin",
        description: "Χρησιμοποιήστε το σύμβολο ₿ αντί για sats.",
        toggle: "Χρήση συμβόλου ₿",
      },
    },
    web_of_trust: {
      title: "Δίκτυο εμπιστοσύνης",
      known_pubkeys: "Γνωστά pubkeys: {wotCount}",
      continue_crawl: "Συνέχιση ανίχνευσης",
      crawl_odell: "Ανίχνευση ODELL'S WEB OF TRUST",
      crawl_wot: "Ανίχνευση web of trust",
      pause: "Παύση",
      reset: "Επαναφορά",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      use_npubx: "Χρήση npubx.cash",
      copy_lightning_address: "Αντιγραφή διεύθυνσης Lightning",
      v2_mint: "npub.cash v2 mint",
    },
    multinut: {
      use_multinut: "Χρήση Multinut",
    },
    advanced: {
      title: "Για προχωρημένους",
      developer: {
        title: "Ρυθμίσεις προγραμματιστή",
        description:
          "Οι ακόλουθες ρυθμίσεις είναι για ανάπτυξη και εντοπισμό σφαλμάτων.",
        new_seed: {
          button: "Δημιουργία νέας φράσης seed",
          description:
            "Αυτό θα δημιουργήσει μια νέα φράση seed. Πρέπει να στείλετε ολόκληρο το υπόλοιπό σας στον εαυτό σας για να μπορέσετε να το επαναφέρετε με μια νέα seed.",
          confirm_question:
            "Είστε βέβαιοι ότι θέλετε να δημιουργήσετε μια νέα φράση seed;",
          cancel: "Ακύρωση",
          confirm: "Επιβεβαίωση",
        },
        remove_spent: {
          button: "Αφαίρεση δαπανημένων αποδείξεων",
          description:
            "Ελέγξτε εάν τα token ecash από τα ενεργά σας mints έχουν δαπανηθεί και αφαιρέστε τα δαπανημένα από το πορτοφόλι σας. Χρησιμοποιήστε το μόνο εάν το πορτοφόλι σας έχει κολλήσει.",
        },
        debug_console: {
          button: "Εναλλαγή Κονσόλας Εντοπισμού Σφαλμάτων",
          description:
            "Ανοίξτε το τερματικό εντοπισμού σφαλμάτων Javascript. Ποτέ μην επικολλάτε τίποτα σε αυτό το τερματικό που δεν καταλαβαίνετε. Ένας κλέφτης μπορεί να προσπαθήσει να σας εξαπατήσει για να επικολλήσετε κακόβουλο κώδικα εδώ.",
        },
        export_proofs: {
          button: "Εξαγωγή ενεργών αποδείξεων",
          description:
            "Αντιγράψτε ολόκληρο το υπόλοιπό σας από το ενεργό mint ως token Cashu στο πρόχειρό σας. Αυτό θα εξάγει μόνο τα token από το επιλεγμένο mint και μονάδα. Για πλήρη εξαγωγή, επιλέξτε διαφορετικό mint και μονάδα και εξάγετε ξανά.",
        },
        keyset_counters: {
          title: "Αύξηση μετρητών keyset",
          description:
            'Κάντε κλικ στο ID του keyset για να αυξήσετε τους μετρητές διαδρομής παραγωγής για τα keysets στο πορτοφόλι σας. Αυτό είναι χρήσιμο εάν βλέπετε το σφάλμα "οι εξόδοι έχουν ήδη υπογραφεί".',
          counter: "μετρητής: {count}",
        },
        unset_reserved: {
          button: "Κατάργηση δέσμευσης όλων των δεσμευμένων token",
          description:
            'Αυτό το πορτοφόλι επισημαίνει το εκκρεμές εξερχόμενο ecash ως δεσμευμένο (και το αφαιρεί από το υπόλοιπό σας) για να αποτρέψει προσπάθειες διπλής δαπάνης. Αυτό το κουμπί θα καταργήσει τη δέσμευση όλων των δεσμευμένων token ώστε να μπορούν να χρησιμοποιηθούν ξανά. Εάν το κάνετε αυτό, το πορτοφόλι σας μπορεί να περιλαμβάνει δαπανημένες αποδείξεις. Πατήστε το κουμπί "Αφαίρεση δαπανημένων αποδείξεων" για να τις αφαιρέσετε.',
        },
        show_onboarding: {
          button: "Εμφάνιση onboarding",
          description: "Εμφάνιση ξανά της οθόνης onboarding.",
        },
        reset_wallet: {
          button: "Επαναφορά δεδομένων πορτοφολιού",
          description:
            "Επαναφορά των δεδομένων του πορτοφολιού σας. Προειδοποίηση: Αυτό θα διαγράψει τα πάντα! Βεβαιωθείτε ότι έχετε δημιουργήσει πρώτα ένα αντίγραφο ασφαλείας.",
          confirm_question:
            "Είστε βέβαιοι ότι θέλετε να διαγράψετε τα δεδομένα του πορτοφολιού σας;",
          cancel: "Ακύρωση",
          confirm: "Διαγραφή πορτοφολιού",
        },
        export_wallet: {
          button: "Εξαγωγή δεδομένων πορτοφολιού",
          description:
            "Λήψη ενός dump του πορτοφολιού σας. Μπορείτε να επαναφέρετε το πορτοφόλι σας από αυτό το αρχείο στην οθόνη καλωσορίσματος ενός νέου πορτοφολιού. Αυτό το αρχείο θα είναι εκτός συγχρονισμού εάν συνεχίσετε να χρησιμοποιείτε το πορτοφόλι σας μετά την εξαγωγή του.",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Συμμετοχή σε mint",
    subtitle:
      "Δεν έχετε συνδεθεί ακόμα σε κανένα Cashu mint. Προσθέστε ένα URL mint στις ρυθμίσεις ή λάβετε ecash από ένα νέο mint για να ξεκινήσετε.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Λήψη Ecash",
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
        label: "Ιστορικό",
      },
      invoices: {
        label: "Τιμολόγια",
      },
      mints: {
        label: "Mints",
      },
    },
    install: {
      text: "Εγκατάσταση",
      tooltip: "Εγκατάσταση Cashu",
    },
  },
  AlreadyRunning: {
    title: "Όχι.",
    text: "Μια άλλη καρτέλα εκτελείται ήδη. Κλείστε αυτήν την καρτέλα και δοκιμάστε ξανά.",
    actions: {
      retry: {
        label: "Επανάληψη",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Ωχ. Τίποτα εδώ…",
    actions: {
      home: {
        label: "Επιστροφή στην αρχική σελίδα",
      },
    },
  },
  BalanceView: {
    mintUrl: {
      label: "Mint",
    },
    mintBalance: {
      label: "Υπόλοιπο",
    },
    mintError: {
      label: "Σφάλμα mint",
    },
    pending: {
      label: "Εκκρεμεί",
      tooltip: "Έλεγχος όλων των εκκρεμών token",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "Προηγούμενο",
      },
      next: {
        label: "Επόμενο",
      },
    },
  },
  WelcomeSlide1: {
    title: "Καλώς ήρθατε στο Cashu",
    text: "Το Cashu.me είναι ένα δωρεάν και ανοιχτού κώδικα πορτοφόλι Bitcoin που χρησιμοποιεί ecash για να διατηρεί τα κεφάλαιά σας ασφαλή και ιδιωτικά.",
    actions: {
      more: {
        label: "Κάντε κλικ για να μάθετε περισσότερα",
      },
    },
    p1: {
      text: "Το Cashu είναι ένα δωρεάν και ανοιχτού κώδικα πρωτόκολλο ecash για Bitcoin. Μπορείτε να μάθετε περισσότερα γι' αυτό στο { link }.",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "Αυτό το πορτοφόλι δεν είναι συνδεδεμένο με κανένα mint. Για να χρησιμοποιήσετε αυτό το πορτοφόλι, πρέπει να συνδεθείτε σε ένα ή περισσότερα Cashu mints που εμπιστεύεστε.",
    },
    p3: {
      text: "Αυτό το πορτοφόλι αποθηκεύει ecash στο οποίο έχετε πρόσβαση μόνο εσείς. Εάν διαγράψετε τα δεδομένα του προγράμματος περιήγησής σας χωρίς αντίγραφο ασφαλείας της φράσης seed, θα χάσετε τα token σας.",
    },
    p4: {
      text: "Αυτό το πορτοφόλι βρίσκεται σε έκδοση beta. Δεν φέρουμε καμία ευθύνη για άτομα που χάνουν την πρόσβαση στα κεφάλαιά τους. Χρησιμοποιήστε το με δική σας ευθύνη! Αυτός ο κώδικας είναι ανοιχτού κώδικα και διατίθεται με άδεια MIT.",
    },
  },
  WelcomeSlide2: {
    title: "Εγκατάσταση PWA",
    alt: { pwa_example: "Παράδειγμα εγκατάστασης PWA" },
    installing: "Γίνεται εγκατάσταση…",
    instruction: {
      intro: {
        text: "Για την καλύτερη εμπειρία, χρησιμοποιήστε αυτό το πορτοφόλι με το εγγενές πρόγραμμα περιήγησης ιστού της συσκευής σας για να το εγκαταστήσετε ως Προοδευτική Εφαρμογή Ιστού. Κάντε το αυτό τώρα.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "Πατήστε το μενού (πάνω δεξιά)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Πατήστε { buttonText }",
          buttonText: "@:AndroidPWAPrompt.buttonText",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "Πατήστε κοινοποίηση (κάτω)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Πατήστε { buttonText }",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "Μόλις εγκαταστήσετε αυτήν την εφαρμογή στη συσκευή σας, κλείστε αυτό το παράθυρο του προγράμματος περιήγησης και χρησιμοποιήστε την εφαρμογή από την αρχική σας οθόνη.",
      },
    },
    pwa: {
      success: {
        title: "Επιτυχία!",
        text: "Χρησιμοποιείτε το Cashu ως PWA. Κλείστε τυχόν άλλα ανοιχτά παράθυρα προγράμματος περιήγησης και χρησιμοποιήστε την εφαρμογή από την αρχική σας οθόνη.",
        nextSteps:
          "Τώρα μπορείτε να κλείσετε αυτήν την καρτέλα και να ανοίξετε την εφαρμογή από την αρχική οθόνη.",
      },
    },
  },
  iOSPWAPrompt: {
    text: "Πατήστε { icon } και { buttonText }",
    buttonText: "Προσθήκη στην αρχική οθόνη",
  },
  AndroidPWAPrompt: {
    text: "Πατήστε { icon } και { buttonText }",
    buttonText: "Προσθήκη στην αρχική οθόνη",
  },
  WelcomeSlide3: {
    title: "Η Φράση Seed σας",
    text: "Αποθηκεύστε τη φράση seed σας σε έναν διαχειριστή κωδικών πρόσβασης ή σε χαρτί. Η φράση seed σας είναι ο μόνος τρόπος για να ανακτήσετε τα κεφάλαιά σας εάν χάσετε την πρόσβαση σε αυτήν τη συσκευή.",
    inputs: {
      seed_phrase: {
        label: "Φράση Seed",
        caption: "Μπορείτε να δείτε τη φράση seed σας στις ρυθμίσεις.",
      },
      checkbox: {
        label: "Την έχω γράψει",
      },
    },
  },
  WelcomeSlide4: {
    title: "Όροι",
    actions: {
      more: {
        label: "Διαβάστε τους Όρους Παροχής Υπηρεσιών",
      },
    },
    inputs: {
      checkbox: {
        label: "Έχω διαβάσει και αποδέχομαι αυτούς τους όρους και προϋποθέσεις",
      },
    },
  },
  WelcomeSlideChoice: {
    title: "Ρύθμιση πορτοφολιού",
    text: "Θέλετε να επαναφέρετε από φράση seed ή να δημιουργήσετε νέο πορτοφόλι;",
    options: {
      new: {
        title: "Δημιουργία νέου πορτοφολιού",
        subtitle: "Δημιουργήστε νέα seed και προσθέστε mints.",
      },
      recover: {
        title: "Επαναφορά πορτοφολιού",
        subtitle: "Εισαγάγετε τη φράση seed, επαναφέρετε mints και ecash.",
      },
    },
  },
  WelcomeMintSetup: {
    title: "Προσθήκη mints",
    text: "Τα mints είναι διακομιστές που βοηθούν στην αποστολή και λήψη ecash. Επιλέξτε ένα εντοπισμένο mint ή προσθέστε ένα χειροκίνητα. Μπορείτε να παραλείψετε και να προσθέσετε αργότερα.",
    sections: { your_mints: "Τα mints σας" },
    restoring: "Επαναφορά mints…",
    placeholder: { mint_url: "https://" },
  },
  WelcomeRecoverSeed: {
    title: "Εισαγάγετε τη φράση seed",
    text: "Επικολλήστε ή πληκτρολογήστε τη φράση 12 λέξεων για επαναφορά.",
    inputs: { word: "Λέξη { index }" },
    actions: { paste_all: "Επικόλληση όλων" },
    disclaimer:
      "Η φράση seed χρησιμοποιείται μόνο τοπικά για παραγωγή κλειδιών πορτοφολιού.",
  },
  WelcomeRestoreEcash: {
    title: "Επαναφορά ecash",
    text: "Σαρώστε για μη δαπανημένες αποδείξεις (proofs) στα ρυθμισμένα mints και προσθέστε τες στο πορτοφόλι σας.",
  },
  MintRatings: {
    title: "Κριτικές mint",
    reviews: "κριτικές",
    ratings: "Βαθμολογίες",
    no_reviews: "Δεν βρέθηκαν κριτικές",
    your_review: "Η κριτική σας",
    no_reviews_to_display: "Καμία κριτική προς εμφάνιση.",
    no_rating: "Χωρίς βαθμολογία",
    out_of: "από",
    rows: "Reviews",
    sort: "Ταξινόμηση",
    sort_options: {
      newest: "Νεότερες",
      oldest: "Παλαιότερες",
      highest: "Υψηλότερες",
      lowest: "Χαμηλότερες",
    },
    actions: { write_review: "Γράψτε κριτική" },
    empty_state_subtitle:
      "Βοηθήστε αφήνοντας μια κριτική. Μοιραστείτε την εμπειρία σας με αυτό το mint και βοηθήστε άλλους αφήνοντας μια κριτική.",
  },
  CreateMintReview: {
    title: "Κριτική mint",
    publishing_as: "Δημοσίευση ως",
    inputs: {
      rating: { label: "Βαθμολογία" },
      review: { label: "Κριτική (προαιρετικά)" },
    },
    actions: {
      publish: { label: "Δημοσίευση", in_progress: "Γίνεται δημοσίευση…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "Επαναφορά από Φράση Seed",
      caption:
        "Εισαγάγετε τη φράση seed σας για να επαναφέρετε το πορτοφόλι σας. Πριν την επαναφορά, βεβαιωθείτε ότι έχετε προσθέσει όλα τα mints που έχετε χρησιμοποιήσει στο παρελθόν.",
      inputs: {
        seed_phrase: {
          label: "Φράση seed",
          caption: "Μπορείτε να δείτε τη φράση seed σας στις ρυθμίσεις.",
        },
      },
    },
    information: {
      label: "Πληροφορίες",
      caption:
        "Ο οδηγός θα επαναφέρει μόνο ecash από μια άλλη φράση seed, δεν θα μπορείτε να χρησιμοποιήσετε αυτήν τη φράση seed ή να αλλάξετε τη φράση seed του πορτοφολιού που χρησιμοποιείτε αυτήν τη στιγμή. Αυτό σημαίνει ότι το επαναφερμένο ecash δεν θα προστατεύεται από την τρέχουσα φράση seed σας εφόσον δεν στείλετε το ecash στον εαυτό σας μία φορά.",
    },
    restore_mints: {
      label: "Επαναφορά Mints",
      caption:
        'Επιλέξτε το mint για επαναφορά. Μπορείτε να προσθέσετε περισσότερα mints στην κύρια οθόνη κάτω από το "Mints" και να τα επαναφέρετε εδώ.',
    },
    actions: {
      paste: {
        error: "Αποτυχία ανάγνωσης περιεχομένων προχείρου.",
      },
      validate: {
        error: "Το μνημονικό πρέπει να είναι τουλάχιστον 12 λέξεις.",
      },
      select_all: {
        label: "Επιλογή όλων",
      },
      deselect_all: {
        label: "Αποεπιλογή όλων",
      },
      restore: {
        label: "Επαναφορά",
        in_progress: "Επαναφορά mint…",
        error: "Σφάλμα κατά την επαναφορά του mint: { error }",
      },
      restore_all_mints: {
        label: "Επαναφορά Όλων των Mints",
        in_progress: "Επαναφορά mint { index } από { length }…",
        success: "Η επαναφορά ολοκληρώθηκε με επιτυχία",
        error: "Σφάλμα κατά την επαναφορά των mints: { error }",
      },
      restore_selected_mints: {
        label: "Επαναφορά επιλεγμένων Mints ({count})",
        in_progress: "Επαναφορά mint { index } από { length }…",
        success: "Επιτυχής επαναφορά {count} mint(s)",
        error: "Σφάλμα κατά την επαναφορά των mints: { error }",
      },
    },
    nostr_mints: {
      label: "Επαναφορά Mints από το Nostr",
      caption:
        "Αναζητήστε αντίγραφα ασφαλείας mint που είναι αποθηκευμένα σε ρελέ Nostr χρησιμοποιώντας τη φράση-κλειδί σας. Αυτό θα σας βοηθήσει να ανακαλύψετε νομισματοκοπεία που χρησιμοποιήσατε προηγουμένως.",
      search_button: "Αναζήτηση για αντίγραφα ασφαλείας Mint",
      select_all: "Επιλογή όλων",
      deselect_all: "Αποεπιλογή όλων",
      backed_up: "Δημιουργήθηκαν αντίγραφα ασφαλείας",
      already_added: "Έχει ήδη προστεθεί",
      add_selected: "Προσθήκη επιλεγμένων ({count})",
      no_backups_found: "Δεν βρέθηκαν αντίγραφα ασφαλείας mint",
      no_backups_hint:
        "Βεβαιωθείτε ότι η δημιουργία αντιγράφων ασφαλείας του Nostr mint είναι ενεργοποιημένη στις ρυθμίσεις για την αυτόματη δημιουργία αντιγράφων ασφαλείας της λίστας mint σας.",
      invalid_mnemonic:
        "Εισαγάγετε μια έγκυρη φράση-κλειδί πριν από την αναζήτηση.",
      search_error: "Αποτυχία αναζήτησης αντιγράφων ασφαλείας mint.",
      add_error: "Αποτυχία προσθήκης επιλεγμένων mints.",
    },
  },
  MintSettings: {
    add: {
      title: "Προσθήκη mint",
      description:
        "Εισαγάγετε το URL ενός Cashu mint για να συνδεθείτε σε αυτό. Αυτό το πορτοφόλι δεν είναι συνδεδεμένο με κανένα mint.",
      inputs: {
        nickname: {
          placeholder: "Ψευδώνυμο (π.χ. Testnet)",
        },
      },
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "Μη έγκυρο URL",
        },
        scan: {
          label: "Σάρωση Κωδικού QR",
        },
      },
    },
    discover: {
      title: "Ανακάλυψη mints",
      overline: "Ανακάλυψη",
      caption: "Ανακαλύψτε mints που άλλοι χρήστες έχουν προτείνει στο nostr.",
      actions: {
        discover: {
          label: "Ανακάλυψη mints",
          in_progress: "Φόρτωση…",
          error_no_mints: "Δεν βρέθηκαν mints",
          success: "Βρέθηκαν { length } mints",
        },
      },
      recommendations: {
        overline: "Βρέθηκαν { length } mints",
        caption:
          "Αυτά τα mints προτάθηκαν από άλλους χρήστες Nostr. Να είστε προσεκτικοί και κάντε τη δική σας έρευνα πριν χρησιμοποιήσετε ένα mint.",
        actions: {
          browse: {
            label: "Κάντε κλικ για περιήγηση στα mints",
          },
        },
      },
    },
    swap: {
      title: "Ανταλλαγή",
      overline: "Ανταλλαγές Multimint",
      caption:
        "Ανταλλάξτε κεφάλαια μεταξύ mints μέσω Lightning. Σημείωση: Αφήστε χώρο για πιθανές χρεώσεις Lightning. Εάν η εισερχόμενη πληρωμή δεν επιτύχει, ελέγξτε το τιμολόγιο μη αυτόματα.",
      inputs: {
        from: {
          label: "Από",
        },
        to: {
          label: "Προς",
        },
        amount: {
          label: "Ποσό ({ ticker })",
        },
      },
      actions: {
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
      },
    },
    error_badge: "Σφάλμα",
    reviews_text: "κριτικές",
    no_reviews_yet: "Δεν υπάρχουν κριτικές ακόμα",
    discover_mints_button: "Ανακαλύψτε mints",
  },
  QrcodeReader: {
    progress: {
      text: "{ percentage }{ addon }",
      percentage: "{ percentage }%",
      keep_scanning_text: " - Συνέχεια σάρωσης",
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
    title: "Λήψη Lightning",
    create_invoice_title: "Δημιουργία Τιμολογίου",
    inputs: {
      amount: {
        label: "Ποσό ({ ticker }) *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "Δημιουργία Τιμολογίου",
        label_blocked: "Δημιουργία τιμολογίου…",
        in_progress: "Δημιουργία",
      },
    },
    invoice: {
      caption: "Τιμολόγιο Lightning",
      status_paid_text: "Πληρώθηκε!",
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
    title: "Αποστολή",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Δεν υπάρχουν διαθέσιμα mints",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "Δεν υπάρχουν διαθέσιμα mints",
      },
    },
  },
  SendTokenDialog: {
    title: "Αποστολή Ecash",
    title_ecash_text: "Ecash",
    badge_offline_text: "Εκτός σύνδεσης",
    inputs: {
      amount: {
        label: "Ποσό ({ ticker }) *",
        invalid_too_much_error_text: "Πάρα πολύ",
      },
      p2pk_pubkey: {
        label: "Δημόσιο κλειδί παραλήπτη",
        label_invalid: "Μη έγκυρο δημόσιο κλειδί παραλήπτη",
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
        tooltip_text: "Αντιγραφή Emoji",
      },
      copy_tokens: {
        label: "@:global.actions.copy.label",
      },
      copy_link: {
        tooltip_text: "Αντιγραφή συνδέσμου",
      },
      share: {
        tooltip_text: "Κοινοποίηση ecash",
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
        tooltip_text: "Διαγραφή από το ιστορικό",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "Εγγραφή στην κάρτα NFC",
          ndef_unsupported_text: "Το NDEF δεν υποστηρίζεται",
        },
      },
    },
  },
  ReceiveDialog: {
    title: "Λήψη",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Δεν υπάρχουν διαθέσιμα mints",
      },
      lightning: {
        label: "Lightning",
        error_no_mints:
          "Πρέπει να συνδεθείτε σε ένα mint για λήψη μέσω Lightning",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "Λήψη Ecash",
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      scan: {
        label: "@:global.actions.scan.label",
      },
      request: {
        label: "Αίτημα",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      nfc: {
        label: "NFC",
        scanning_text: "Σάρωση…",
      },
    },
  },
  ReceiveTokenDialog: {
    title: "Λήψη Ecash",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "Επικολλήστε το token Cashu",
      },
    },
    errors: {
      invalid_token: {
        label: "Μη έγκυρο token",
      },
      p2pk_lock_mismatch: {
        label:
          "Δεν είναι δυνατή η λήψη. Το κλείδωμα P2PK αυτού του token δεν ταιριάζει με το δημόσιο κλειδί σας.",
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
        label_adding_mint: "Προσθήκη mint…",
      },
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "Ανταλλαγή σε αξιόπιστο mint",
        caption: "Ανταλλαγή { value }",
      },
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "Ακύρωση ανταλλαγής",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      later: {
        label: "Λήψη αργότερα",
        tooltip_text: "Προσθήκη στο ιστορικό για λήψη αργότερα",
        already_in_history_success_text: "Το Ecash είναι ήδη στο Ιστορικό",
        added_to_history_success_text: "Το Ecash προστέθηκε στο Ιστορικό",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Ανάγνωση από κάρτα NFC",
          ndef_unsupported_text: "Το NDEF δεν υποστηρίζεται",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "Κλειδί P2PK",
      description: "Λήψη ecash κλειδωμένο σε αυτό το κλειδί",
      used_warning_text:
        "Προειδοποίηση: Αυτό το κλειδί χρησιμοποιήθηκε στο παρελθόν. Χρησιμοποιήστε ένα νέο κλειδί για καλύτερο απόρρητο.",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_key: {
        label: "Δημιουργία νέου κλειδιού",
      },
    },
  },
  PaymentRequestDialog: {
    payment_request: {
      caption: "Αίτημα Πληρωμής",
      description: "Λήψη πληρωμών μέσω Nostr",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "Νέο αίτημα",
      },
      add_amount: {
        label: "Προσθήκη ποσού",
      },
      use_active_mint: {
        label: "Οποιοδήποτε mint",
      },
    },
    inputs: {
      amount: {
        placeholder: "Εισαγωγή ποσού",
      },
    },
  },
  NumericKeyboard: {
    actions: {
      close: {
        label: "@:global.actions.close.label",
        closed_info_text:
          "Πληκτρολόγιο απενεργοποιημένο. Μπορείτε να ενεργοποιήσετε ξανά το πληκτρολόγιο στις ρυθμίσεις.",
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
        "Ελέγξτε το πορτοφόλι σας απομακρυσμένα με το NWC. Πατήστε τον κωδικό QR για να συνδέσετε το πορτοφόλι σας με μια συμβατή εφαρμογή.",
      warning_text:
        "Προειδοποίηση: οποιοσδήποτε με πρόσβαση σε αυτήν τη συμβολοσειρά σύνδεσης μπορεί να ξεκινήσει πληρωμές από το πορτοφόλι σας. Μην την κοινοποιείτε!",
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
    title: "Μήνυμα Mint",
  },
  MintDetailsDialog: {
    contact: {
      title: "Επαφή",
    },
    details: {
      title: "Λεπτομέρειες mint",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Nuts",
        actions: {
          show: {
            label: "Προβολή όλων",
          },
          hide: {
            label: "Απόκρυψη",
          },
        },
      },
      currency: {
        label: "Νόμισμα",
      },
      currencies: {
        label: "@:MintDetailsDialog.details.currency.label",
      },
      version: {
        label: "Έκδοση",
      },
    },
    actions: {
      title: "Ενέργειες",
      copy_mint_url: {
        label: "Αντιγραφή URL mint",
      },
      delete: {
        label: "Διαγραφή mint",
      },
      edit: {
        label: "Επεξεργασία mint",
      },
    },
  },
  ChooseMint: {
    title: "Επιλέξτε ένα mint",
    badge_mint_error_text: "Σφάλμα",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
  },
  HistoryTable: {
    empty_text: "Δεν υπάρχει ακόμη ιστορικό",
    row: {
      type_label: "Ecash",
      date_label: "πριν από { value }",
    },
    actions: {
      check_status: {
        tooltip_text: "Έλεγχος κατάστασης",
      },
      receive: {
        tooltip_text: "Λήψη",
      },
      filter_pending: {
        label: "Φιλτράρισμα εκκρεμών",
      },
      show_all: {
        label: "Εμφάνιση όλων",
      },
    },
    old_token_not_found_error_text: "Παλιό token δεν βρέθηκε",
  },
  InvoiceTable: {
    empty_text: "Δεν υπάρχουν ακόμη τιμολόγια",
    row: {
      type_label: "Lightning",
      type_tooltip_text: "Κάντε κλικ για αντιγραφή",
      date_label: "πριν από { value }",
    },
    actions: {
      check_status: {
        tooltip_text: "Έλεγχος κατάστασης",
      },
      filter_pending: {
        label: "Φιλτράρισμα εκκρεμών",
      },
      show_all: {
        label: "Εμφάνιση όλων",
      },
    },
  },
  RemoveMintDialog: {
    title: "Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το mint?",
    nickname: {
      label: "Ψευδώνυμο",
    },
    balances: {
      label: "Υπόλοιπα",
    },
    warning_text:
      "Σημείωση: Επειδή αυτό το πορτοφόλι είναι παρανοϊκό, το ecash σας από αυτό το mint δεν θα διαγραφεί στην πραγματικότητα, αλλά θα παραμείνει αποθηκευμένο στη συσκευή σας. Θα το δείτε να εμφανίζεται ξανά εάν προσθέσετε ξανά αυτό το mint αργότερα.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "Αφαίρεση mint",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  ParseInputComponent: {
    placeholder: {
      default: "Token Cashu ή διεύθυνση Lightning",
      receive: "Token Cashu",
      pay: "Διεύθυνση Lightning ή τιμολόγιο",
    },
    qr_scanner: {
      title: "Σάρωση Κωδικού QR",
      description: "Πατήστε για σάρωση διεύθυνσης",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    input_data: {
      title: "Πληρωμή με Lightning",
      inputs: {
        invoice_data: {
          label: "Τιμολόγιο ή διεύθυνση Lightning",
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
      amount_exact_label: "Ο { payee } ζητά { value } { ticker }",
      amount_range_label:
        "Ο { payee } ζητά{br}μεταξύ { min } και { max } { ticker }",
      sending_to_lightning_address: "Αποστολή σε { address }",
      inputs: {
        amount: {
          label: "Ποσό ({ ticker }) *",
        },
        comment: {
          label: "Σχόλιο (προαιρετικό)",
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
      title: "Πληρωμή { value }",
      paying: "Πληρώνεται",
      paid: "Πληρώθηκε",
      fee: "Χρέωση",
      memo: {
        label: "Σημείωμα",
      },
      processing_info_text: "Επεξεργασία…",
      balance_too_low_warning_text: "Το υπόλοιπο είναι πολύ χαμηλό",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        pay: {
          label: "Πληρωμή",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
          error: "Σφάλμα",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Επεξεργασία mint",
    inputs: {
      nickname: {
        label: "Ψευδώνυμο",
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
    title: "Εμπιστεύεστε αυτό το mint;",
    description:
      "Πριν χρησιμοποιήσετε αυτό το mint, βεβαιωθείτε ότι το εμπιστεύεστε. Τα mints μπορεί να γίνουν κακόβουλα ή να σταματήσουν τη λειτουργία τους ανά πάσα στιγμή.",
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
        in_progress: "Προσθήκη mint",
      },
    },
  },
  restore: {
    mnemonic_error_text: "Παρακαλώ εισαγάγετε ένα μνημονικό",
    restore_mint_error_text: "Σφάλμα κατά την επαναφορά του mint: { error }",
    prepare_info_text: "Προετοιμασία διαδικασίας επαναφοράς…",
    restored_proofs_for_keyset_info_text:
      "Επαναφέρθηκαν { restoreCounter } αποδείξεις για το keyset { keysetId }",
    checking_proofs_for_keyset_info_text:
      "Έλεγχος αποδείξεων { startIndex } έως { endIndex } για το keyset { keysetId }",
    no_proofs_info_text: "Δεν βρέθηκαν αποδείξεις για επαναφορά",
    restored_amount_success_text: "Επαναφέρθηκε { amount }",
  },
  swap: {
    in_progress_warning_text: "Η ανταλλαγή βρίσκεται σε εξέλιξη",
    invalid_swap_data_error_text: "Μη έγκυρα δεδομένα ανταλλαγής",
    swap_error_text: "Σφάλμα κατά την ανταλλαγή",
  },
  TokenInformation: {
    fee: "Χρέωση",
    unit: "Μονάδα",
    fiat: "Fiat",
    p2pk: "P2PK",
    locked: "Κλειδωμένο",
    locked_to_you: "Κλειδωμένο για εσάς",
    mint: "Νομισματοκοπείο",
    memo: "Σημείωση",
    payment_request: "Αίτημα πληρωμής",
    nostr: "Nostr",
    token_copied: "Το token αντιγράφηκε στο πρόχειρο",
  },
};
