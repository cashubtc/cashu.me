export default {
  MultinutPicker: {
    dialog_title: "Πληρωμή Multinut",
    pay_using_multiple: "Πληρωμή με πολλά mints",
    experimental_title: "Πειραματική λειτουργία",
    experimental_text:
      "Αυτή η λειτουργία είναι εντελώς πειραματική και ίσως δεν λειτουργεί όπως αναμένεται. Μην προσπαθήσετε να πληρώσετε τιμολόγιο που έχει ήδη πληρωθεί. Μπορεί να χάσετε κεφάλαια.",
    understand: "Κατανοώ",
    select_funds:
      "Επιλέξτε κεφάλαια από πολλά mints για να εκτελέσετε την πληρωμή.",
    pay_invoice: "Πληρωμή τιμολογίου",
    amount_mismatch: "Σφάλμα υπολογισμού ποσού: {calculated} έναντι {expected}",
    states: {
      requesting: "Αίτημα...",
      paying: "Πληρωμή...",
      success: "Επιτυχία",
      failed: "Απέτυχε",
    },
    payment: "Πληρωμή Multinut",
    selectMints:
      "Επιλέξτε ένα ή περισσότερα mints για να εκτελέσετε μια πληρωμή.",
    totalSelectedBalance: "Συνολικό επιλεγμένο υπόλοιπο",
    multiMintPay: "Πληρωμή από πολλά mint",
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
      pay: { label: "Πληρωμή" },
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
      trying_again: "Γίνεται νέα προσπάθεια...",
      unsupported_legacy_qr: "Μη υποστηριζόμενος παλαιός κωδικός QR",
      legacy_qr_not_supported:
        "Αυτός ο παλαιός κωδικός QR δεν προέρχεται από υποστηριζόμενο έμπορο",
      no_bolt12_mint: "Κανένα από τα mint σας δεν υποστηρίζει προσφορές BOLT12",
      no_bolt11_mint: "Κανένα από τα mint σας δεν υποστηρίζει τιμολόγια BOLT11",
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
          caption: "Τι αποδέχεστε χρησιμοποιώντας το Cashu.me",
        },
      },
      links: {
        title: "Σύνδεσμοι",
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
    menu: {
      title: "Ρυθμίσεις",
      backup: {
        title: "Αντίγραφα ασφαλείας και επαναφορά",
        caption: "Φράση seed και ανάκτηση ecash",
      },
      lightning_address: {
        title: "Διεύθυνση Lightning",
        caption: "Λάβετε πληρωμές στο όνομα@domain",
      },
      nostr: {
        title: "Nostr",
        caption: "Κλειδιά, relays και δίκτυο εμπιστοσύνης",
      },
      payment_requests: {
        title: "Αιτήματα πληρωμής",
        caption: "Λάβετε πληρωμές ecash μέσω Nostr",
      },
      nwc: {
        title: "Nostr Wallet Connect",
        caption: "Χρησιμοποιήστε το πορτοφόλι σας από άλλες εφαρμογές",
      },
      hardware: {
        title: "Υλικό",
        caption: "Ρυθμίσεις NFC",
      },
      p2pk: {
        title: "Κλειδωμένο ecash",
        caption: "Λάβετε ecash που μόνο το κλειδί σας ξεκλειδώνει",
      },
      privacy: {
        title: "Απόρρητο",
        caption: "Έλεγχοι δικτύου και τιμή bitcoin",
      },
      experimental: {
        title: "Πειραματικά",
        caption: "Δοκιμάστε πρώτοι νέες λειτουργίες",
      },
      appearance: {
        title: "Εμφάνιση",
        caption: "Θέμα, πληκτρολόγιο και σύμβολο bitcoin",
      },
      language: {
        title: "Γλώσσα",
        caption: "Επιλέξτε τη γλώσσα σας",
      },
      advanced: {
        title: "Για προχωρημένους",
        caption: "Εργαλεία προγραμματιστών και επαναφορά πορτοφολιού",
      },
      about: {
        title: "Σχετικά",
        caption: "Όροι και σύνδεσμοι",
      },
    },
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
          already_added: "Ο αναμεταδότης έχει ήδη προστεθεί",
          expand_label: "Κάντε κλικ για να επεξεργαστείτε τα relays",
          add: {
            title: "Προσθήκη relay",
            description:
              "Το πορτοφόλι σας χρησιμοποιεί αυτά τα relays για λειτουργίες Nostr, όπως αιτήματα πληρωμής, Nostr Wallet Connect και αντίγραφα ασφαλείας.",
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
          "Ανακτήστε ecash από άλλη φράση seed. Η τρέχουσα φράση seed σας μένει ως έχει.",
        button: "Επαναφορά",
      },
    },
    lightning_address: {
      server_url: {
        label: "Όνομα κεντρικού υπολογιστή npub.cash",
        hint: "Εισαγάγετε όνομα κεντρικού υπολογιστή ή URL HTTPS",
        invalid: "Εισαγάγετε έγκυρο URL διακομιστή HTTPS",
      },
      title: "Διεύθυνση Lightning",
      description: "Λάβετε πληρωμές στη διεύθυνση Lightning σας.",
      enable: {
        toggle: "Χρήση διεύθυνσης Lightning",
        description: "Λάβετε πληρωμές σε διεύθυνση από το npub.cash",
      },
      address: {
        copy_tooltip: "Αντιγραφή διεύθυνσης Lightning",
      },
      show_on_receive: {
        toggle: "Εμφάνιση κατά τη λήψη",
        description: "Εμφάνιση διεύθυνσης και κωδικού QR.",
      },
      automatic_claim: {
        toggle: "Αυτόματη διεκδίκηση",
        description: "Λήψη εισερχόμενων πληρωμών αυτόματα.",
      },
      mint: {
        label: "npub.cash mint",
        choose_title: "Επιλέξτε mint για npub.cash",
        choose_placeholder: "Επιλέξτε ένα mint...",
      },
    },
    nostr_keys: {
      title: "Τα κλειδιά Nostr σας",
      description:
        "Τα κλειδιά Nostr σας καθορίζουν τη διεύθυνση Lightning σας.",
      wallet_seed: {
        title: "Φράση seed πορτοφολιού",
        description:
          "Δημιουργία ζεύγους κλειδιών Nostr από το seed του πορτοφολιού σας",
        copy_nsec: "Αντιγραφή ιδιωτικού κλειδιού",
      },
      nsec_bunker: {
        title: "Απομακρυσμένος υπογράφων",
        description: "Υπογραφή με bunker NIP-46",
        delete_tooltip: "Διαγραφή σύνδεσης",
      },
      use_nsec: {
        title: "Χρήση δικού σας ιδιωτικού κλειδιού",
        description:
          "Επικολλήστε το ιδιωτικό κλειδί Nostr σας (nsec) σε αυτό το πορτοφόλι. Δεν συνιστάται.",
        delete_tooltip: "Διαγραφή ιδιωτικού κλειδιού",
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
        "Πληρωθείτε μέσω Nostr. Όταν είναι ενεργό, το πορτοφόλι σας ακούει στα relays Nostr σας.",
      enable_toggle: "Ενεργοποίηση αιτημάτων πληρωμής",
      claim_automatically: {
        toggle: "Αυτόματη διεκδίκηση",
        description:
          "Προσθέτει τις εισερχόμενες πληρωμές στο υπόλοιπό σας χωρίς ερώτηση. Όταν είναι ανενεργό, τις παραλαμβάνετε μία μία.",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Wallet Connect (NWC)",
      description:
        "Επιτρέπει σε άλλες εφαρμογές να πληρώνουν από αυτό το πορτοφόλι μέσω Nostr Wallet Connect.",
      enable_toggle: "Ενεργοποίηση Nostr Wallet Connect",
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
        title: "Μορφή κάρτας NFC",
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
          description: "Αποθήκευση token ως δυαδικά δεδομένα",
        },
        quick_access: {
          toggle: "Γρήγορη πρόσβαση σε NFC",
          description:
            "Προσθέτει κουμπί NFC στην οθόνη Λήψη ecash για σάρωση καρτών.",
        },
      },
    },
    p2pk_features: {
      title: "Κλειδωμένο ecash",
      description:
        "Πειραματικό. Χρησιμοποιήστε μικρά ποσά: αν χάσετε το ιδιωτικό κλειδί, κανείς δεν μπορεί να ξεκλειδώσει το ecash που είναι κλειδωμένο σε αυτό.",
      generate_button: "Δημιουργία κλειδιού",
      import_button: "Εισαγωγή ιδιωτικού κλειδιού",
      quick_access: {
        toggle: "Εμφάνιση κλειδιού κλειδώματος στη Λήψη",
        description:
          "Εμφανίζει το κλειδί κλειδώματος στην οθόνη Λήψη ecash, ώστε οι αποστολείς να κλειδώνουν ecash για εσάς.",
      },
      keys_expansion: {
        label: "Κάντε κλικ για περιήγηση σε {count} κλειδιά",
        used_badge: "χρησιμοποιημένο",
      },
    },
    privacy: {
      title: "Απόρρητο",
      network_title: "Έλεγχοι δικτύου",
      description: "Αυτές οι ρυθμίσεις επηρεάζουν το απόρρητό σας.",
      check_incoming: {
        toggle: "Έλεγχος εισερχόμενου τιμολογίου",
        description:
          "Ελέγχει το πιο πρόσφατο τιμολόγιό σας στο παρασκήνιο. Γρηγορότερες ενημερώσεις, αλλά ευκολότερο fingerprinting.",
      },
      check_startup: {
        toggle: "Έλεγχος εκκρεμών τιμολογίων κατά την εκκίνηση",
        description: "Ελέγχει τα εκκρεμή τιμολόγια όταν ανοίγει το πορτοφόλι.",
      },
      check_all: {
        toggle: "Έλεγχος όλων των τιμολογίων",
        description:
          "Ελέγχει τα απλήρωτα τιμολόγια στο παρασκήνιο για έως δύο εβδομάδες. Περισσότερη διαδικτυακή δραστηριότητα διευκολύνει το fingerprinting.",
      },
      check_sent: {
        toggle: "Έλεγχος απεσταλμένου ecash",
        description:
          "Ελέγχει στο παρασκήνιο αν το απεσταλμένο ecash έχει παραληφθεί. Περισσότερη διαδικτυακή δραστηριότητα διευκολύνει το fingerprinting.",
      },
      websockets: {
        toggle: "Χρήση WebSockets",
        description:
          "Διατηρεί ζωντανή σύνδεση με τα mint για άμεσες ενημερώσεις πληρωμών. Γρηγορότερο, αλλά ευκολότερο fingerprinting.",
      },
      bitcoin_price: {
        title: "Τιμή bitcoin",
        toggle: "Λήψη συναλλαγματικής ισοτιμίας από Coinbase",
        description:
          "Λαμβάνει την τιμή του bitcoin από το coinbase.com για να εμφανίζει το υπόλοιπό σας σε fiat.",
        currency: {
          title: "Νόμισμα fiat",
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
          "Προτείνει ανταλλαγή του ληφθέντος ecash στο ενεργό σας mint.",
      },
      auto_paste: {
        toggle: "Αυτόματη επικόλληση ecash",
        description:
          "Επικολλά ecash από το πρόχειρο όταν ανοίγετε τη Λήψη ecash. Απενεργοποιήστε το αν προκαλεί προβλήματα εμφάνισης στο iOS.",
      },
      auditor: {
        toggle: "Ενεργοποίηση ελεγκτή",
        badge: "Beta",
        description:
          "Εμφανίζει στα στοιχεία του mint δεδομένα αξιοπιστίας από ανεξάρτητο ελεγκτή mint.",
        url_label: "URL Ελεγκτή",
        api_url_label: "URL API Ελεγκτή",
      },
      multinut: {
        toggle: "Ενεργοποίηση Multinut",
        description: "Πληρώνει τιμολόγια από πολλά mint ταυτόχρονα.",
      },
      nostr_mint_backup: {
        toggle: "Αντίγραφο λίστας mint στο Nostr",
        description:
          "Κρατά αντίγραφο της λίστας mint σας στα relays Nostr σας, ώστε να την επαναφέρετε σε άλλη συσκευή.",
        notifications: {
          enabled: "Ενεργοποιήθηκε το αντίγραφο ασφαλείας Nostr mint",
          disabled: "Απενεργοποιήθηκε το αντίγραφο ασφαλείας Nostr mint",
          failed: "Αποτυχία ενεργοποίησης του αντιγράφου ασφαλείας Nostr mint",
        },
      },
    },
    appearance: {
      mode: {
        title: "Λειτουργία",
        dark: "Σκοτεινή",
        light: "Φωτεινή",
      },
      keyboard: {
        title: "Πληκτρολόγιο οθόνης",
        description:
          "Χρησιμοποιήστε το αριθμητικό πληκτρολόγιο για την εισαγωγή ποσών.",
        toggle: "Χρήση αριθμητικού πληκτρολογίου",
        toggle_description:
          "Χρησιμοποιεί το αριθμητικό πληκτρολόγιο για την εισαγωγή ποσών.",
      },
      theme: {
        title: "Θέμα",
        description: "Αλλάξτε την εμφάνιση του πορτοφολιού σας.",
        tooltips: {
          mono: "Mono",
          cyber: "Cyber",
          freedom: "Ελευθερία",
          nostr: "Nostr",
          bitcoin: "Bitcoin",
          mint: "Μέντα",
          nut: "Καρύδι",
          blu: "Μπλε",
          flamingo: "Φλαμίνγκο",
        },
      },
      bip177: {
        title: "Σύμβολο Bitcoin",
        description: "Εμφάνιση ποσών ως ₿2.789 αντί για 2.789 sats.",
        toggle: "Χρήση συμβόλου ₿",
      },
    },
    web_of_trust: {
      title: "Δίκτυο εμπιστοσύνης",
      known_pubkeys: "Γνωστά δημόσια κλειδιά: {wotCount}",
      continue_crawl: "Συνέχιση ανίχνευσης",
      crawl_odell: "Εισαγωγή του δικτύου εμπιστοσύνης του Odell",
      crawl_wot: "Ανίχνευση web of trust",
      pause: "Παύση",
      reset: "Επαναφορά",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      copy_lightning_address: "Αντιγραφή διεύθυνσης Lightning",
    },
    multinut: {
      use_multinut: "Πληρωμές από πολλά mint",
    },
    advanced: {
      notifications: {
        reserved_unset: "Όλες οι δεσμευμένες αποδείξεις αποδεσμεύτηκαν",
        removed_spent: "Αφαιρέθηκαν {count} δαπανημένες αποδείξεις",
        no_spent: "Δεν βρέθηκαν δαπανημένες αποδείξεις",
        invalid_backup: "Μη έγκυρη μορφή αρχείου αντιγράφου ασφαλείας",
        read_error: "Σφάλμα ανάγνωσης αρχείου",
      },
      title: "Για προχωρημένους",
      developer: {
        title: "Ρυθμίσεις προγραμματιστή",
        description: "Εργαλεία αντιμετώπισης προβλημάτων και αποσφαλμάτωσης.",
        new_seed: {
          button: "Δημιουργία νέας φράσης seed",
          description:
            "Δημιουργεί νέα φράση seed. Στη συνέχεια στείλτε το υπόλοιπό σας στον εαυτό σας, ώστε το νέο seed να μπορεί να το επαναφέρει.",
          confirm_question:
            "Είστε βέβαιοι ότι θέλετε να δημιουργήσετε μια νέα φράση seed;",
          cancel: "Ακύρωση",
          confirm: "Επιβεβαίωση",
        },
        remove_spent: {
          button: "Αφαίρεση δαπανημένων αποδείξεων",
          description:
            "Αφαιρεί το ecash που τα ενεργά σας mint αναφέρουν ως δαπανημένο. Χρησιμοποιήστε το μόνο αν το πορτοφόλι κολλήσει.",
        },
        debug_console: {
          button: "Κονσόλα αποσφαλμάτωσης",
          description:
            "Ανοίγει την κονσόλα JavaScript. Μην επικολλάτε ποτέ κώδικα που δεν καταλαβαίνετε· οι απατεώνες τη χρησιμοποιούν για να κλέψουν χρήματα.",
        },
        export_proofs: {
          button: "Εξαγωγή ενεργών αποδείξεων",
          description:
            "Αντιγράφει το υπόλοιπο του ενεργού mint στην επιλεγμένη μονάδα ως ένα token ecash.",
        },
        keyset_counters: {
          title: "Αύξηση μετρητών keyset",
          description:
            "Πατήστε ένα keyset για να αυξήσετε τον μετρητή του. Βοηθά με το σφάλμα «outputs have already been signed».",
          counter: "Μετρητής: {count}",
          increase: "Αύξηση μετρητή για {id}",
        },
        unset_reserved: {
          button: "Κατάργηση δέσμευσης όλων των δεσμευμένων token",
          description:
            "Αποδεσμεύει το ecash που κρατείται για εκκρεμείς αποστολές, ώστε να ξοδευτεί ξανά. Μετά εκτελέστε «Αφαίρεση δαπανημένων αποδείξεων».",
        },
        show_onboarding: {
          button: "Εμφάνιση onboarding",
          description: "Εμφάνιση ξανά της οθόνης onboarding.",
        },
        reset_wallet: {
          button: "Επαναφορά δεδομένων πορτοφολιού",
          description:
            "Διαγράφει όλα τα δεδομένα του πορτοφολιού σε αυτή τη συσκευή. Εξαγάγετε πρώτα αντίγραφο ασφαλείας.",
          confirm_question:
            "Είστε βέβαιοι ότι θέλετε να διαγράψετε τα δεδομένα του πορτοφολιού σας;",
          cancel: "Ακύρωση",
          confirm: "Διαγραφή πορτοφολιού",
        },
        export_wallet: {
          button: "Εξαγωγή δεδομένων πορτοφολιού",
          description:
            "Κατεβάζει ένα αρχείο αντιγράφου ασφαλείας που μπορείτε να εισαγάγετε στην οθόνη καλωσορίσματος. Παλιώνει όσο συνεχίζετε να χρησιμοποιείτε το πορτοφόλι.",
        },
        import_wallet: {
          description:
            "Αντικαθιστά τα δεδομένα αυτού του πορτοφολιού με ένα εξαγόμενο αρχείο αντιγράφου ασφαλείας.",
          button: "Εισαγωγή αντιγράφου πορτοφολιού",
          confirm_question:
            "Θέλετε σίγουρα να επαναφέρετε τα δεδομένα του πορτοφολιού σας;",
          cancel: "Ακύρωση",
          confirm: "ΕΙΣΑΓΩΓΗ ΑΝΤΙΓΡΑΦΟΥ ΠΟΡΤΟΦΟΛΙΟΥ",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Προσθήκη mint",
    subtitle:
      "Τα mint εκδίδουν το ecash που κρατά αυτό το πορτοφόλι. Προσθέστε ένα mint, ή λάβετε ecash από κάποιο, για να ξεκινήσετε.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Λήψη ecash",
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
    title: "Το Cashu.me είναι ανοιχτό σε άλλη καρτέλα",
    text: "Κλείστε την άλλη καρτέλα και πατήστε Επανάληψη.",
    actions: {
      retry: {
        label: "Επανάληψη",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Αυτή η σελίδα δεν υπάρχει",
    actions: {
      home: {
        label: "Επιστροφή στην αρχική σελίδα",
      },
    },
  },
  BalanceView: {
    total_label: "Συνολικό υπόλοιπο",
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
    terms_agreement: "Συνεχίζοντας, αποδέχεστε τους {terms}",
    title: "Καλώς ήρθατε στο Cashu.me",
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
    title: "Εγκατάσταση του Cashu.me",
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
        text: "Μετά την εγκατάσταση, κλείστε αυτή την καρτέλα του προγράμματος περιήγησης και ανοίξτε το Cashu.me από την αρχική οθόνη.",
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
    title: "Η φράση seed σας",
    text: "Αποθηκεύστε τη φράση seed σας σε έναν διαχειριστή κωδικών πρόσβασης ή σε χαρτί. Η φράση seed σας είναι ο μόνος τρόπος για να ανακτήσετε τα κεφάλαιά σας εάν χάσετε την πρόσβαση σε αυτήν τη συσκευή.",
    inputs: {
      seed_phrase: {
        label: "Φράση seed",
        caption: "Μπορείτε να δείτε τη φράση seed σας στις ρυθμίσεις.",
      },
      checkbox: {
        label: "Την έχω γράψει",
      },
    },
  },
  WelcomeSlide4: {
    english_only: "Το νομικό κείμενο είναι διαθέσιμο μόνο στα αγγλικά.",
    title: "Όροι Χρήσης",
    actions: {
      more: {
        label: "Διαβάστε πριν χρησιμοποιήσετε το Cashu.me",
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
    web_of_trust_hop: "Στο δίκτυο εμπιστοσύνης σας (βήμα {hop})",
    no_mint_url: "Δεν δόθηκε URL mint",
    title: "Κριτικές mint",
    reviews: "κριτικές",
    ratings: "{n} βαθμολογία | {n} βαθμολογίες",
    no_reviews: "Δεν υπάρχουν ακόμα κριτικές",
    your_review: "Η κριτική σας",
    no_reviews_to_display: "Καμία κριτική προς εμφάνιση.",
    no_rating: "Χωρίς βαθμολογία",
    stars_label: "{rating} από 5 αστέρια",
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
      "Γράψτε την πρώτη κριτική για αυτό το mint. Η εμπειρία σας βοηθά τους άλλους να επιλέξουν.",
    range: "{from}–{to} από {total}",
  },
  CreateMintReview: {
    connect_nostr:
      "Συνδέστε έναν λογαριασμό Nostr στις Ρυθμίσεις για να δημοσιεύσετε αξιολόγηση.",
    published: "Η αξιολόγηση δημοσιεύτηκε",
    publish_failed: "Αποτυχία δημοσίευσης αξιολόγησης",
    title: "Κριτική mint",
    publishing_as: "Δημοσίευση ως",
    inputs: {
      rating: { label: "Βαθμολογία" },
      review: { label: "Κριτική (προαιρετικά)" },
    },
    actions: {
      publish: { label: "Δημοσίευση κριτικής", in_progress: "Δημοσίευση…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "Επαναφορά από φράση seed",
      caption:
        "Προσθέστε κάθε mint που χρησιμοποιήσατε με αυτό το seed πριν από την επαναφορά.",
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
      label: "Επαναφορά mint",
      caption:
        "Επιλέξτε τα mint για επαναφορά. Προσθέστε πρώτα όσα λείπουν από την καρτέλα Mints.",
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
        label: "Επαναφορά όλων των mint",
        in_progress: "Επαναφορά mint { index } από { length }…",
        success: "Η επαναφορά ολοκληρώθηκε με επιτυχία",
        error: "Σφάλμα κατά την επαναφορά των mints: { error }",
      },
      restore_selected_mints: {
        label: "Επαναφορά επιλεγμένων mint ({count})",
        in_progress: "Επαναφορά mint { index } από { length }…",
        success: "Επιτυχής επαναφορά {count} mint(s)",
        error: "Σφάλμα κατά την επαναφορά των mints: { error }",
      },
    },
    nostr_mints: {
      label: "Επαναφορά mint από το Nostr",
      caption:
        "Αναζητήστε αντίγραφα ασφαλείας mint που είναι αποθηκευμένα σε ρελέ Nostr χρησιμοποιώντας τη φράση-κλειδί σας. Αυτό θα σας βοηθήσει να ανακαλύψετε νομισματοκοπεία που χρησιμοποιήσατε προηγουμένως.",
      search_button: "Αναζήτηση αντιγράφων ασφαλείας mint",
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
          label: "Σάρωση κωδικού QR",
        },
      },
    },
    discover: {
      title: "Ανακάλυψη mints",
      overline: "Ανακάλυψη",
      caption: "Mint που προτείνουν άλλοι στο Nostr.",
      actions: {
        discover: {
          label: "Ανακάλυψη mints",
          in_progress: "Φόρτωση…",
          error_no_mints: "Δεν βρέθηκαν mints",
          success: "Βρέθηκαν { length } mints",
        },
      },
      unnamed: "Mint χωρίς όνομα",
      empty: {
        title: "Βρείτε ένα mint",
        text: "Το Cashu.me ρωτά τα relays του Nostr για mints που προτείνουν άλλοι, με βαθμολογίες και κριτικές.",
      },
      recommendations: {
        overline: "Βρέθηκαν { length } mints",
        caption: "Κάντε τη δική σας έρευνα πριν χρησιμοποιήσετε ένα mint.",
        actions: {
          browse: {
            label: "Κάντε κλικ για περιήγηση στα mints",
          },
        },
      },
    },
    swap: {
      title: "Ανταλλαγή",
      overline: "Ανταλλαγές μεταξύ mint",
      caption:
        "Μεταφέρετε χρήματα μεταξύ των mint σας μέσω Lightning. Ενδέχεται να ισχύουν χρεώσεις.",
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
        receove_to_trusted_mint: { label: "Λήψη σε αξιόπιστο mint" },
      },
    },
    error_badge: "Σφάλμα",
    reviews_text: "κριτική | κριτικές",
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
    create_invoice_title: "Δημιουργία τιμολογίου",
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
        label: "Δημιουργία τιμολογίου",
        label_blocked: "Δημιουργία τιμολογίου",
        in_progress: "Δημιουργία",
      },
    },
    invoice: {
      caption: "Τιμολόγιο Lightning",
      status_paid_text: "Πληρώθηκε",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        copy: {
          label: "Αντιγραφή τιμολογίου",
        },
      },
    },
  },
  SendDialog: {
    captions: {
      ecash: "Μοιραστείτε token ή κωδικό QR",
      lightning: "Πληρώστε τιμολόγιο ή διεύθυνση",
      onchain: "Στείλτε σε διεύθυνση Bitcoin",
    },
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
    badge_locked: "κλειδωμένο",
    title: "Αποστολή ecash",
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
        tooltip_text: "Αντιγραφή emoji",
      },
      copy_tokens: {
        label: "Αντιγραφή ecash",
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
        in_progress: "Αποστολή…",
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
      pay: { label: "@:global.actions.pay.label" },
    },
    errors: {
      amount_required: "Εισαγάγετε πρώτα ένα ποσό.",
      serialization_failed: "Δεν ήταν δυνατή η προετοιμασία του token ecash.",
      mint_not_allowed_by_request:
        "Το επιλεγμένο mint δεν γίνεται δεκτό από αυτό το αίτημα πληρωμής.",
    },
  },
  ReceiveDialog: {
    captions: {
      ecash: "Επικολλήστε, σαρώστε ή ζητήστε token",
      lightning: "Δημιουργήστε τιμολόγιο για να πληρωθείτε",
      onchain: "Λάβετε διεύθυνση Bitcoin",
    },
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
    title: "Λήψη ecash",
    actions: {
      paste: {
        label: "Επικόλληση token",
      },
      scan: {
        label: "Σάρωση token",
      },
      request: {
        label: "Αίτημα ecash",
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
    receiving_amount: "Λήψη {amount}",
    title: "Λήψη ecash",
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
        processing: "Ανταλλαγή σε εξέλιξη…",
        failed: "Η ανταλλαγή απέτυχε",
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
        already_in_history_success_text: "Το ecash υπάρχει ήδη στο ιστορικό",
        added_to_history_success_text: "Το ecash προστέθηκε στο ιστορικό",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Ανάγνωση από κάρτα NFC",
          ndef_unsupported_text: "Το NDEF δεν υποστηρίζεται",
        },
      },
      receive_to_selected_mint: { label: "Λήψη στο επιλεγμένο mint" },
    },
    unknown_mint_info_text:
      "Άγνωστο mint. Θα προστεθεί αφού λάβετε αυτό το token.",
    swap_section: {
      title: "Ανταλλαγή",
      source_label: "Από",
      destination_label: "Προς",
      fee_info: "Αυτή η ανταλλαγή θα έχει χρεώσεις δικτύου Lightning.",
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "Κλειδί κλειδώματος",
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
      caption: "Αίτημα πληρωμής",
      description: "Λήψη πληρωμών μέσω Nostr",
    },
    request_index: "Αίτημα {index} από {total}",
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
      remove_amount: {
        label: "Αφαίρεση ποσού",
      },
      previous: {
        label: "Προηγούμενο αίτημα",
      },
      next: {
        label: "Επόμενο αίτημα",
      },
    },
    inputs: {
      amount: {
        placeholder: "Εισαγωγή ποσού",
      },
    },
    received_total: "Σύνολο ληφθέντων",
    no_payments_yet: "Δεν υπάρχουν ακόμα πληρωμές",
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
    title: "Μήνυμα mint",
  },
  MintDetailsDialog: {
    qr: {
      show: "Εμφάνιση κωδικού QR",
      hide: "Απόκρυψη κωδικού QR",
    },
    contact: {
      title: "Επαφή",
    },
    details: {
      title: "Λεπτομέρειες mint",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Υποστηριζόμενα NUT",
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
        label: "Μονάδα",
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
    available_text: "σε αυτό το mint",
    sheet_title: "Επιλογή mint",
    placeholder: "Επιλέξτε ένα mint",
  },
  HistoryTable: {
    empty_text: "Δεν υπάρχει ακόμη ιστορικό",
    row: {
      type_label: "Ecash",
      date_label: "πριν από { value }",
    },
    actions: {
      filter_ecash_only: {
        label: "Μόνο ecash",
      },
      check_status: {
        tooltip_text: "Έλεγχος κατάστασης",
      },
      receive: {
        tooltip_text: "Λήψη",
      },
      filter_pending: {
        label: "Μόνο εκκρεμή",
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
        label: "Μόνο εκκρεμή",
      },
      show_all: {
        label: "Εμφάνιση όλων",
      },
    },
  },
  RemoveMintDialog: {
    title: "Αφαίρεση αυτού του mint;",
    nickname: {
      label: "Ψευδώνυμο",
    },
    balances: {
      label: "Υπόλοιπο σε αυτό το mint",
    },
    warning_text:
      "Το ecash σας από αυτό το mint μένει σε αυτή τη συσκευή. Επιστρέφει αν προσθέσετε ξανά το mint.",
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
      title: "Σάρωση κωδικού QR",
      description: "Στρέψτε την κάμερα σε έναν κωδικό QR",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    onchain: {
      title: "Πληρωμή on-chain",
      address_placeholder: "Διεύθυνση Bitcoin",
      choose_speed: "Επιλέξτε ταχύτητα επιβεβαίωσης",
      blocks: "{n} μπλοκ | {n} μπλοκ",
      estimated_confirmation: "Εκτιμώμενη επιβεβαίωση",
      fee_reserve: "αποθεματικό τελών",
    },
    multinut: {
      label: "Πληρωμή με πολλά mints",
    },
    quote: {
      label: "Προσφορά",
    },
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
      title_bolt12: "Πληρωμή προσφοράς Lightning",
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
          waiting_for_wallet: "Αναμονή για το πορτοφόλι…",
          error: "Σφάλμα",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Επεξεργασία mint",
    inputs: {
      nickname: {
        placeholder: "π.χ. Testnet",
        label: "Ψευδώνυμο (προαιρετικό)",
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
      "Συνδεθείτε σε αυτό το mint μόνο αν το εμπιστεύεστε. Αν σταματήσει να λειτουργεί, το ecash που έχετε σε αυτό χάνεται.",
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
    audit_info: {
      label: "Πληροφορίες ελέγχου",
      actions: {
        show: {
          label: "Εμφάνιση",
        },
        hide: {
          label: "Απόκρυψη",
        },
      },
    },
    unreachable_error_text:
      "Δεν είναι δυνατή η σύνδεση με αυτό το mint. Ελέγξτε το URL και τη σύνδεσή σας και δοκιμάστε ξανά.",
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
  common: {
    copied: "Αντιγράφηκε",
    on_chain: "On-chain",
    pending: "Σε εκκρεμότητα",
    delete: "Διαγραφή",
    copy_npub: "Αντιγραφή npub",
    back: "Πίσω",
    refresh: "Ανανέωση",
    settings: "Ρυθμίσεις",
    backspace: "Διαγραφή χαρακτήρα",
    swap_input_mode: "Εναλλαγή εισαγωγής ποσού/fiat",
    fee: "Χρέωση",
  },
  SendPaymentRequest: {
    actions: {
      pay: { label: "Πληρωμή" },
      pay_via: { label: "Πληρωμή μέσω {transport}" },
    },
    info: {
      pay_failed: "Δεν ήταν δυνατή η πληρωμή του αιτήματος",
      pay_to: "Πληρωμή σε {target}",
      invalid_url: "Μη έγκυρο URL",
    },
  },
  PaymentRequestInfo: {
    title_with_transport: "Αίτημα πληρωμής μέσω {transport}",
    title: "Αίτημα πληρωμής",
    subtitle: "Πληρωμή σε {target}",
    subtitle_fallback: "Αίτημα πληρωμής",
    invalid_url: "Μη έγκυρο URL",
  },
  QuoteInformation: {
    address: "Διεύθυνση",
    amount: "Ποσό",
    fee_reserve: "Αποθεματικό τελών",
    fee_paid: "Τέλος που πληρώθηκε",
    unit: "Μονάδα",
    status: "Κατάσταση",
    network: "Δίκτυο",
    transaction_id: "Αναγνωριστικό συναλλαγής",
    chain_status: "Κατάσταση στην αλυσίδα",
    fetching: "Ανάκτηση",
    paid_at: "Πληρώθηκε στις",
    preimage: "Προεικόνα",
    preimage_copied: "Η προεικόνα αντιγράφηκε",
    mint: "Mint",
    method: "Μέθοδος",
    lightning_offer: "Προσφορά Lightning",
    chain_confirmed: "Επιβεβαιώθηκε",
    chain_pending: "Σε εκκρεμότητα",
    states: {
      waiting: "Αναμονή πληρωμής",
      paid: "Πληρώθηκε",
      unpaid: "Απλήρωτη",
      pending: "Σε εκκρεμότητα",
      issued: "Εκδόθηκε",
      expired: "Έληξε",
      failed: "Απέτυχε",
    },
  },
  MintAuditInfo: {
    title: "Πληροφορίες ελέγχου",
    loading: "Φόρτωση πληροφοριών ελέγχου...",
    not_audited: "Αυτό το mint δεν έχει ελεγχθεί ακόμη.",
    not_audited_text:
      "Για να μάθετε περισσότερα για τον ελεγκτή ή να υποστηρίξετε έναν μελλοντικό έλεγχο, επισκεφθείτε το {link} ή πατήστε {here} για να δωρίσετε ecash και να βοηθήσετε να ξεκινήσει ο έλεγχος αυτού του mint.",
    here: "εδώ",
    unavailable: "Οι πληροφορίες ελέγχου δεν είναι διαθέσιμες αυτή τη στιγμή.",
    load_failed: "Αποτυχία φόρτωσης δεδομένων mint",
    success_rate: "Ποσοστό επιτυχίας",
    swaps_count: "{successful} από {total} ανταλλαγές",
    average_time: "Μέσος χρόνος",
    average_time_caption: "Για επιτυχείς ανταλλαγές",
    disclaimer:
      "Τα δεδομένα ελέγχου παρέχονται από ανεξάρτητους τρίτους για να βοηθήσουν στην αξιολόγηση της αξιοπιστίας ενός mint με την πάροδο του χρόνου. Ωστόσο, τα αποτελέσματα είναι μόνο ενημερωτικά και δεν εγγυώνται την ασφάλεια, τη φερεγγυότητα ή την αξιοπιστία κανενός mint. Κάνετε πάντα τη δική σας έρευνα και βεβαιωθείτε ότι εμπιστεύεστε τον διαχειριστή του mint πριν χρησιμοποιήσετε τις υπηρεσίες του.",
    donate_text:
      "Οι πληροφορίες ελέγχου παρέχονται από το {link}. Το τρέχον υπόλοιπο του ελεγκτή για αυτό το mint είναι {balance}, με συνολικές δωρεές έως τώρα {donations}. Για να υποστηρίξετε τη συνέχιση των ελέγχων, μπορείτε να {press_here} για να δωρίσετε ecash στον ελεγκτή.",
    press_here: "πατήσετε εδώ",
    sats_amount: "{amount} sats",
    warnings_title: "Προειδοποιήσεις ελεγκτή",
    warnings: {
      last_swap_failed: "Η τελευταία απόπειρα ανταλλαγής απέτυχε.",
      recent_success:
        "{successful} από {total} ανταλλαγές τις τελευταίες {days} ημέρες ήταν επιτυχείς.",
      reliable:
        "{base} Ωστόσο, {success} Αυτό το mint φαίνεται αξιόπιστο, οι αποτυχίες ίσως οφείλονται στο mint παραλήπτη.",
      unreliable:
        "{base} Μόνο {success} Αυτό το mint ίσως δεν είναι αξιόπιστο.",
      unknown:
        "Ο ελεγκτής δεν μπόρεσε ακόμη να προσδιορίσει την ποιότητα αυτού του mint.",
      not_enough_data:
        "Ο ελεγκτής δεν έχει αρκετά πρόσφατα δεδομένα για αυτό το mint. Υπήρξε μόνο {count} επιτυχής ανταλλαγή τις τελευταίες {days} ημέρες. | Ο ελεγκτής δεν έχει αρκετά πρόσφατα δεδομένα για αυτό το mint. Υπήρξαν μόνο {count} επιτυχείς ανταλλαγές τις τελευταίες {days} ημέρες.",
      low_success:
        "Τις τελευταίες {days} ημέρες, αυτό το mint είχε ποσοστό επιτυχίας {rate}%, κάτω από το συνιστώμενο {threshold}%.",
      inactive:
        "Αυτό το mint δεν είχε ανταλλαγές για {days} ημέρα. Ίσως δεν είναι προσβάσιμο. | Αυτό το mint δεν είχε ανταλλαγές για {days} ημέρες. Ίσως δεν είναι προσβάσιμο.",
      slow: "Αυτό το mint είναι αργό. Οι πληρωμές από αυτό διήρκεσαν κατά μέσο όρο {seconds} δευτερόλεπτα.",
      no_successful:
        "Δεν καταγράφηκαν επιτυχείς ανταλλαγές για αυτό το mint. Ίσως δεν είναι προσβάσιμο.",
    },
    chart: {
      now: "Τώρα",
      today: "Σήμερα",
      yesterday: "Χθες",
      invalid_date: "Μη έγκυρη ημερομηνία",
      swaps: "Ανταλλαγές:",
      success_rate: "Ποσοστό επιτυχίας:",
      time_range: "Χρονικό διάστημα:",
    },
  },
  DisplayTokenComponent: {
    title: {
      send: "Αποστολή ecash",
      sent: "Εστάλη ecash",
      received: "Ελήφθη ecash",
    },
    qr_speed: "Ταχύτητα QR: {value}",
    qr_size: "Μέγεθος QR: {value}",
    speed: {
      fast: "Γρήγορη",
      medium: "Μεσαία",
      slow: "Αργή",
    },
    size: {
      large: "Μεγάλο",
      medium: "Μεσαίο",
      small: "Μικρό",
    },
    delete_dialog: {
      title: "Διαγραφή ecash",
      text: "Θέλετε σίγουρα να διαγράψετε αυτή τη συναλλαγή από το ιστορικό σας;",
      warning:
        "Προσοχή: Αυτή η ενέργεια δεν αναιρείται και δεν υπάρχει τρόπος ανάκτησης του token.",
    },
    nfc: {
      read_failed: "Η ανάγνωση NFC απέτυχε",
      write_failed: "Η εγγραφή NFC απέτυχε",
      error: "Σφάλμα NFC",
      writing: "Εγγραφή στην κάρτα NFC...",
      success: "Το token γράφτηκε επιτυχώς στην κάρτα!",
      capacity:
        "Η κάρτα ίσως δεν έχει αρκετή χωρητικότητα (απαιτούνται {bytes} byte).",
    },
  },
  CreateInvoiceDialog: {
    formats: {
      bolt11: "Τιμολόγιο",
      bolt12: "Προσφορά",
    },
    onchain_title: "Λήψη on-chain",
    bolt12_title: "Λήψη Bolt12",
    mint_unreachable: "Το mint δεν είναι προσβάσιμο",
    mint_unreachable_text:
      "Επανασυνδεθείτε στο mint για να λαμβάνετε πληρωμές.",
    reconnect_mint: "Επανασύνδεση mint",
    checking_address: "Έλεγχος διεύθυνσης...",
    add_amount: "Προσθήκη ποσού",
    new_offer: "Νέα προσφορά",
    create_offer: "Δημιουργία προσφοράς",
    create_new_address: "Δημιουργία νέας διεύθυνσης",
    create_address: "Δημιουργία διεύθυνσης",
    onchain_unsupported:
      "Αυτό το mint δεν υποστηρίζει καταθέσεις on-chain σε αυτή τη μονάδα.",
    deposit_limits: {
      outside: "Καταθέσεις εκτός {min}–{max} δεν θα πιστωθούν.",
      below: "Καταθέσεις κάτω από {min} δεν θα πιστωθούν.",
      above: "Καταθέσεις πάνω από {max} δεν θα πιστωθούν.",
    },
    amount_errors: {
      positive_decimal:
        "Εισαγάγετε θετικό ποσό σε {unit} με έως δύο δεκαδικά ψηφία.",
      positive_whole: "Εισαγάγετε θετικό ακέραιο ποσό σε {unit}.",
      min: "Εισαγάγετε τουλάχιστον {amount}.",
      max: "Εισαγάγετε έως {amount}.",
    },
  },
};
