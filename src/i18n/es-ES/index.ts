export default {
  global: {
    copy_to_clipboard: {
      success: "¡Copiado al portapapeles!",
    },
    actions: {
      add_mint: {
        label: "Añadir mint",
      },
      cancel: {
        label: "Cancelar",
      },
      copy: {
        label: "Copiar",
      },
      close: {
        label: "Cerrar",
      },
      enter: {
        label: "Entrar",
      },
      lock: {
        label: "Bloquear",
      },
      paste: {
        label: "Pegar",
      },
      receive: {
        label: "Recibir",
      },
      scan: {
        label: "Escanear",
      },
      send: {
        label: "Enviar",
      },
      swap: {
        label: "Intercambiar",
      },
      update: {
        label: "Actualizar",
      },
      pay: { label: "Pagar" },
    },
    inputs: {
      mint_url: {
        label: "URL del mint",
      },
    },
  },
  MultinutPicker: {
    dialog_title: "Pago Multinut",
    pay_using_multiple: "Pagar con varios mints",
    experimental_title: "Función experimental",
    experimental_text:
      "Esta función es muy experimental y puede no funcionar como se espera. No intentes pagar una factura que ya se haya pagado. Podrías perder fondos.",
    understand: "Entendido",
    select_funds: "Selecciona fondos de varios mints para realizar el pago.",
    pay_invoice: "Pagar factura",
    amount_mismatch:
      "Error al calcular el importe: {calculated} frente a {expected}",
    states: {
      requesting: "Solicitando...",
      paying: "Pagando...",
      success: "Completado",
      failed: "Fallido",
    },
    payment: "Pago Multinut",
    selectMints:
      "Seleccione una o varias casas de moneda para ejecutar un pago.",
    totalSelectedBalance: "Saldo total seleccionado",
    multiMintPay: "Pago con varios mints",
    balanceNotEnough:
      "El saldo de multi-mint no es suficiente para satisfacer esta factura",
    failed: "Error al procesar: {error}",
    paid: "Pagado {amount} a través de Lightning",
  },
  wallet: {
    notifications: {
      balance_too_low: "El saldo es demasiado bajo",
      received: "Recibido {amount}",
      fee: " (comisión: {fee})",
      could_not_request_mint: "No se pudo solicitar acuñación",
      invoice_still_pending: "Factura aún pendiente",
      paid_lightning: "Pagado {amount} a través de Lightning",
      payment_pending_refresh:
        "Pago pendiente. Actualice la factura manualmente.",
      sent: "Enviado {amount}",
      token_still_pending: "Token aún pendiente",
      received_lightning: "Recibido {amount} a través de Lightning",
      lightning_payment_failed: "Pago Lightning fallido",
      failed_to_decode_invoice: "No se pudo decodificar la factura",
      invalid_lnurl: "LNURL inválido",
      lnurl_error: "Error LNURL",
      no_amount: "Sin cantidad",
      no_lnurl_data: "Sin datos LNURL",
      no_price_data: "Sin datos de precio.",
      please_try_again: "Por favor, inténtelo de nuevo.",
      trying_again: "Intentando de nuevo...",
      unsupported_legacy_qr: "Código QR antiguo no compatible",
      legacy_qr_not_supported:
        "Este código QR antiguo no es de un comercio compatible",
      no_bolt12_mint: "Ninguno de tus mints admite ofertas BOLT12",
      no_bolt11_mint: "Ninguno de tus mints admite facturas BOLT11",
    },
    mint: {
      notifications: {
        already_added: "Mint ya añadido",
        added: "Mint añadido",
        not_found: "Mint no encontrado",
        activation_failed: "Fallo en la activación del mint",
        no_active_mint: "No hay mint activo",
        unit_activation_failed: "Fallo en la activación de la unidad",
        unit_not_supported: "Unidad no soportada por el mint",
        activated: "Mint activado",
        could_not_connect: "No se pudo conectar al mint",
        could_not_get_info: "No se pudo obtener información del mint",
        could_not_get_keys: "No se pudieron obtener las claves del mint",
        could_not_get_keysets: "No se pudieron obtener los keysets del mint",
        mint_validation_error: "Error de validación de Mint",
        removed: "Mint eliminado",
        error: "Error del mint",
      },
    },
  },
  MainHeader: {
    menu: {
      settings: {
        title: "Configuración",
        settings: {
          title: "Configuración",
          caption: "Configuración de la billetera",
        },
      },
      terms: {
        title: "Términos",
        terms: {
          title: "Términos",
          caption: "Lo que aceptas al usar Cashu.me",
        },
      },
      links: {
        title: "Enlaces",
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
          title: "Donar",
          caption: "Apoyar a Cashu",
        },
      },
    },
    offline: {
      warning: {
        text: "Sin conexión",
      },
    },
    reload: {
      warning: {
        text: "Recargar en { countdown }",
      },
    },
    staging: {
      warning: {
        text: "Staging – ¡no usar con fondos reales!",
      },
    },
  },
  FullscreenHeader: {
    actions: {
      back: {
        label: "Billetera",
      },
    },
  },
  Settings: {
    menu: {
      title: "Ajustes",
      backup: {
        title: "Copia de seguridad y restauración",
        caption: "Frase semilla y recuperación de ecash",
      },
      lightning_address: {
        title: "Dirección Lightning",
        caption: "Recibe pagos en nombre@dominio",
      },
      nostr: {
        title: "Nostr",
        caption: "Claves, relays y red de confianza",
      },
      payment_requests: {
        title: "Solicitudes de pago",
        caption: "Recibe pagos en ecash a través de Nostr",
      },
      nwc: {
        title: "Nostr Wallet Connect",
        caption: "Usa tu billetera desde otras aplicaciones",
      },
      hardware: {
        title: "Hardware",
        caption: "Ajustes de NFC",
      },
      p2pk: {
        title: "Ecash bloqueado",
        caption: "Recibe ecash que solo tu clave puede desbloquear",
      },
      privacy: {
        title: "Privacidad",
        caption: "Comprobaciones de red y precio del bitcoin",
      },
      experimental: {
        title: "Experimental",
        caption: "Prueba nuevas funciones antes que nadie",
      },
      appearance: {
        title: "Apariencia",
        caption: "Tema, teclado y símbolo de bitcoin",
      },
      language: {
        title: "Idioma",
        caption: "Elige tu idioma",
      },
      advanced: {
        title: "Avanzado",
        caption: "Herramientas de desarrollador y reinicio de la billetera",
      },
      about: {
        title: "Acerca de",
        caption: "Términos y enlaces",
      },
    },
    language: {
      title: "Idioma",
      description: "Por favor, elige tu idioma preferido de la lista de abajo.",
    },
    sections: {
      backup_restore: "COPIA DE SEGURIDAD Y RESTAURACIÓN",
      lightning_address: "DIRECCIÓN LIGHTNING",
      nostr_keys: "CLAVES NOSTR",
      nostr: {
        title: "NOSTR",
        relays: {
          already_added: "El relé ya está añadido",
          expand_label: "Haga clic para editar relays",
          add: {
            title: "Añadir relay",
            description:
              "Tu billetera usa estos relays para funciones de Nostr como solicitudes de pago, Nostr Wallet Connect y copias de seguridad.",
          },
          list: {
            title: "Relays",
            description: "Su billetera se conectará a estos relays.",
            copy_tooltip: "Copiar relay",
            remove_tooltip: "Eliminar relay",
          },
        },
      },
      payment_requests: "SOLICITUDES DE PAGO",
      nostr_wallet_connect: "NOSTR WALLET CONNECT",
      hardware_features: "CARACTERÍSTICAS DE HARDWARE",
      p2pk_features: "CARACTERÍSTICAS P2PK",
      privacy: "PRIVACIDAD",
      experimental: "EXPERIMENTAL",
      appearance: "APARIENCIA",
    },
    backup_restore: {
      backup_seed: {
        title: "Frase semilla de respaldo",
        description:
          "Tu frase semilla puede restaurar tu billetera. Mantenla segura y privada.",
        seed_phrase_label: "Frase semilla",
      },
      restore_ecash: {
        title: "Restaurar ecash",
        description:
          "Recupera ecash de otra frase semilla. Tu frase semilla actual no cambia.",
        button: "Restaurar",
      },
    },
    lightning_address: {
      server_url: {
        label: "Nombre de host de npub.cash",
        hint: "Introduce un nombre de host o una URL HTTPS",
        invalid: "Introduce una URL de servidor HTTPS válida",
      },
      title: "Dirección Lightning",
      description: "Recibe pagos a tu dirección Lightning.",
      enable: {
        toggle: "Usar una dirección Lightning",
        description: "Recibe pagos en una dirección de npub.cash",
      },
      address: {
        copy_tooltip: "Copiar dirección Lightning",
      },
      show_on_receive: {
        toggle: "Mostrar al recibir",
        description: "Mostrar dirección y código QR.",
      },
      automatic_claim: {
        toggle: "Reclamar automáticamente",
        description: "Recibir pagos entrantes automáticamente.",
      },
      mint: {
        label: "npub.cash mint",
        choose_title: "Elegir mint para npub.cash",
        choose_placeholder: "Seleccionar un mint...",
      },
    },
    nostr_keys: {
      title: "Tus claves de Nostr",
      description: "Tus claves de Nostr determinan tu dirección Lightning.",
      wallet_seed: {
        title: "Frase semilla de la billetera",
        description:
          "Generar un par de claves de Nostr a partir de la semilla de tu billetera",
        copy_nsec: "Copiar clave privada",
      },
      nsec_bunker: {
        title: "Firmante remoto",
        description: "Firmar con un bunker NIP-46",
        delete_tooltip: "Eliminar conexión",
      },
      use_nsec: {
        title: "Usar tu propia clave privada",
        description:
          "Pega tu clave privada de Nostr (nsec) en esta billetera. No recomendado.",
        delete_tooltip: "Eliminar clave privada",
      },
      signing_extension: {
        title: "Extensión de firma",
        description: "Usar una extensión de firma NIP-07",
        not_found: "No se encontró ninguna extensión de firma NIP-07",
      },
    },
    payment_requests: {
      title: "Solicitudes de pago",
      description:
        "Recibe pagos a través de Nostr. Si lo activas, tu billetera escucha en tus relays de Nostr.",
      enable_toggle: "Activar solicitudes de pago",
      claim_automatically: {
        toggle: "Reclamar automáticamente",
        description:
          "Añade los pagos entrantes a tu saldo sin preguntar. Si está desactivado, reclamas cada uno.",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Wallet Connect (NWC)",
      description:
        "Permite que otras apps paguen desde esta billetera con Nostr Wallet Connect.",
      enable_toggle: "Activar Nostr Wallet Connect",
      payments_note:
        "Solo puedes usar NWC para pagos desde tu saldo de Bitcoin. Los pagos se realizarán desde tu mint activo.",
      connection: {
        copy_tooltip: "Copiar cadena de conexión",
        qr_tooltip: "Mostrar código QR",
        allowance_label: "Límite restante (sat)",
      },
    },
    hardware_features: {
      webnfc: {
        title: "Formato de tarjeta NFC",
        description: "Elige la codificación para escribir en tarjetas NFC",
        text: {
          title: "Texto",
          description: "Almacenar token en texto plano",
        },
        weburl: {
          title: "URL",
          description: "Almacenar URL a esta billetera con el token",
        },
        binary: {
          title: "Binario",
          description: "Guardar el token como datos binarios",
        },
        quick_access: {
          toggle: "Acceso rápido a NFC",
          description:
            "Añade un botón NFC a la pantalla Recibir ecash para escanear tarjetas.",
        },
      },
    },
    p2pk_features: {
      title: "Ecash bloqueado",
      description:
        "Experimental. Usa cantidades pequeñas: si pierdes la clave privada, nadie podrá desbloquear el ecash bloqueado con ella.",
      generate_button: "Generar clave",
      import_button: "Importar clave privada",
      quick_access: {
        toggle: "Mostrar clave de bloqueo en Recibir",
        description:
          "Muestra tu clave de bloqueo en la pantalla Recibir ecash, para que te puedan enviar ecash bloqueado.",
      },
      keys_expansion: {
        label: "Haz clic para ver {count} claves",
        used_badge: "usada",
      },
    },
    privacy: {
      title: "Privacidad",
      network_title: "Comprobaciones de red",
      description: "Estas configuraciones afectan tu privacidad.",
      check_incoming: {
        toggle: "Verificar factura entrante",
        description:
          "Comprueba tu última factura en segundo plano. Actualizaciones más rápidas, pero más fácil de rastrear.",
      },
      check_startup: {
        toggle: "Verificar facturas pendientes al inicio",
        description: "Comprueba las facturas pendientes al abrir la billetera.",
      },
      check_all: {
        toggle: "Verificar todas las facturas",
        description:
          "Comprueba las facturas sin pagar en segundo plano durante hasta dos semanas. Más actividad en línea te hace más fácil de rastrear.",
      },
      check_sent: {
        toggle: "Verificar ecash enviado",
        description:
          "Comprueba en segundo plano si el ecash enviado fue reclamado. Más actividad en línea te hace más fácil de rastrear.",
      },
      websockets: {
        toggle: "Usar WebSockets",
        description:
          "Mantiene una conexión en vivo con los mints para recibir al instante el estado de los pagos. Más rápido, pero más fácil de rastrear.",
      },
      bitcoin_price: {
        title: "Precio de bitcoin",
        toggle: "Obtener tasa de cambio de Coinbase",
        description:
          "Obtiene el precio del bitcoin de coinbase.com para mostrar tu saldo en moneda fiat.",
        currency: {
          title: "Moneda fiat",
          description:
            "Elija la moneda fiat para mostrar el precio de Bitcoin.",
        },
      },
    },
    experimental: {
      title: "Experimental",
      description: "Estas características son experimentales.",
      receive_swaps: {
        toggle: "Recibir intercambios",
        badge: "Beta",
        description: "Ofrece cambiar el ecash recibido a tu mint activo.",
      },
      auto_paste: {
        toggle: "Pegar ecash automáticamente",
        description:
          "Pega el ecash del portapapeles al abrir Recibir ecash. Desactívalo si causa fallos visuales en iOS.",
      },
      auditor: {
        toggle: "Habilitar auditor",
        badge: "Beta",
        description:
          "Muestra datos de fiabilidad de un auditor de mints externo en los detalles del mint.",
        url_label: "URL del Auditor",
        api_url_label: "URL API del Auditor",
      },
      multinut: {
        toggle: "Habilitar Multinut",
        description: "Paga facturas desde varios mints a la vez.",
      },
      nostr_mint_backup: {
        toggle: "Guardar la lista de mints en Nostr",
        description:
          "Guarda una copia de tu lista de mints en tus relays de Nostr para restaurarla en otro dispositivo.",
        notifications: {
          enabled: "Copia de seguridad de la ceca de Nostr activada",
          disabled: "Copia de seguridad de la ceca de Nostr desactivada",
          failed: "Error al activar la copia de seguridad de la ceca de Nostr",
        },
      },
    },
    appearance: {
      mode: {
        title: "Modo",
        dark: "Oscuro",
        light: "Claro",
      },
      keyboard: {
        title: "Teclado en pantalla",
        description: "Usa el teclado numérico para ingresar cantidades.",
        toggle: "Usar teclado numérico",
        toggle_description: "Usa el teclado numérico para introducir importes.",
      },
      theme: {
        title: "Tema",
        description: "Cambia cómo se ve tu billetera.",
        tooltips: {
          mono: "Mono",
          cyber: "Cyber",
          freedom: "Libertad",
          nostr: "Nostr",
          bitcoin: "Bitcoin",
          mint: "Menta",
          nut: "Nuez",
          blu: "Azul",
          flamingo: "Flamenco",
        },
      },
      bip177: {
        title: "Símbolo de Bitcoin",
        description: "Muestra los importes como ₿2.789 en lugar de 2.789 sats.",
        toggle: "Utilice el símbolo ₿",
      },
    },
    web_of_trust: {
      title: "Red de confianza",
      known_pubkeys: "Claves públicas conocidas: {wotCount}",
      continue_crawl: "Continuar rastreo",
      crawl_odell: "Importar la red de confianza de Odell",
      crawl_wot: "Rastrear red de confianza",
      pause: "Pausa",
      reset: "Reiniciar",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      copy_lightning_address: "Copiar dirección Lightning",
    },
    multinut: {
      use_multinut: "Pagos con varios mints",
    },
    advanced: {
      notifications: {
        reserved_unset: "Todas las pruebas reservadas liberadas",
        removed_spent: "Se eliminaron {count} pruebas gastadas",
        no_spent: "No se encontraron pruebas gastadas",
        invalid_backup: "Formato de archivo de copia de seguridad no válido",
        read_error: "Error al leer el archivo",
      },
      title: "Avanzado",
      developer: {
        title: "Configuración de desarrollador",
        description: "Herramientas para solucionar problemas y depurar.",

        new_seed: {
          button: "Generar nueva frase semilla",
          description:
            "Crea una nueva frase semilla. Después, envíate tu saldo para que la nueva semilla pueda restaurarlo.",
          confirm_question:
            "¿Estás seguro de que quieres generar una nueva frase semilla?",
          cancel: "Cancelar",
          confirm: "Confirmar",
        },
        remove_spent: {
          button: "Eliminar pruebas gastadas",
          description:
            "Elimina el ecash que tus mints activos marcan como gastado. Úsalo solo si tu billetera se queda bloqueada.",
        },
        debug_console: {
          button: "Consola de depuración",
          description:
            "Abre la consola de JavaScript. Nunca pegues código que no entiendas; los estafadores la usan para robar fondos.",
        },
        export_proofs: {
          button: "Exportar pruebas activas",
          description:
            "Copia el saldo del mint activo en la unidad seleccionada como un solo token de ecash.",
        },
        keyset_counters: {
          title: "Incrementar contadores de keyset",
          description:
            'Toca un keyset para aumentar su contador. Ayuda con el error "outputs have already been signed".',
          counter: "contador: {count}",
          increase: "Aumentar el contador de {id}",
        },
        unset_reserved: {
          button: "Desmarcar todos los tokens reservados",
          description:
            'Libera el ecash reservado para envíos pendientes para poder gastarlo de nuevo. Después, ejecuta "Eliminar pruebas gastadas".',
        },
        show_onboarding: {
          button: "Mostrar bienvenida",
          description: "Mostrar la pantalla de bienvenida de nuevo.",
        },
        reset_wallet: {
          button: "Restablecer datos de la billetera",
          description:
            "Elimina todos los datos de la billetera en este dispositivo. Exporta antes una copia de seguridad.",
          confirm_question:
            "¿Estás seguro de que quieres eliminar los datos de tu billetera?",
          cancel: "Cancelar",
          confirm: "Eliminar billetera",
        },
        export_wallet: {
          button: "Exportar datos de la billetera",
          description:
            "Descarga un archivo de copia de seguridad que puedes importar en la pantalla de bienvenida. Queda desactualizado a medida que usas la billetera.",
        },
        import_wallet: {
          description:
            "Reemplaza los datos de esta billetera con un archivo de copia de seguridad exportado.",
          button: "Importar copia de seguridad",
          confirm_question:
            "¿Seguro que quieres restaurar los datos de tu billetera?",
          cancel: "Cancelar",
          confirm: "IMPORTAR COPIA DE SEGURIDAD",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Añadir un mint",
    subtitle:
      "Los mints emiten el ecash que guarda esta billetera. Añade un mint, o recibe ecash de uno, para empezar.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Recibir ecash",
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
        label: "Historial",
      },
      invoices: {
        label: "Facturas",
      },
      mints: {
        label: "Mints",
      },
    },
    install: {
      text: "Instalar",
      tooltip: "Instalar Cashu",
    },
  },
  AlreadyRunning: {
    title: "Cashu.me está abierto en otra pestaña",
    text: "Cierra la otra pestaña y luego toca Reintentar.",
    actions: {
      retry: {
        label: "Reintentar",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Esta página no existe",
    actions: {
      home: {
        label: "Volver al inicio",
      },
    },
  },
  BalanceView: {
    mintUrl: {
      label: "Mint",
    },
    mintBalance: {
      label: "Saldo",
    },
    mintError: {
      label: "Error del mint",
    },
    pending: {
      label: "Pendiente",
      tooltip: "Verificar todos los tokens pendientes",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "Anterior",
      },
      next: {
        label: "Siguiente",
      },
    },
  },
  WelcomeSlide1: {
    terms_agreement: "Al continuar, aceptas los {terms}",
    title: "Te damos la bienvenida a Cashu.me",
    text: "Cashu.me es una billetera de Bitcoin gratuita y de código abierto que utiliza ecash para mantener tus fondos seguros y privados.",
    actions: {
      more: {
        label: "Haz clic para saber más",
      },
    },
    p1: {
      text: "Cashu es un protocolo ecash gratuito y de código abierto para Bitcoin. Puedes aprender más en { link }.",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "Esta billetera no está afiliada a ningún mint. Para usar esta billetera, necesitas conectarte a uno o más mints de Cashu en los que confíes.",
    },
    p3: {
      text: "Esta billetera almacena ecash al que solo tú tienes acceso. Si eliminas los datos de tu navegador sin una copia de seguridad de la frase semilla, perderás tus tokens.",
    },
    p4: {
      text: "Esta billetera está en beta. No nos hacemos responsables de las personas que pierdan el acceso a sus fondos. ¡Úsala bajo tu propio riesgo! Este código es de código abierto y está licenciado bajo la licencia MIT.",
    },
  },
  WelcomeSlide2: {
    title: "Instala Cashu.me",
    alt: { pwa_example: "Ejemplo de instalación de la PWA" },
    installing: "Instalando…",
    instruction: {
      intro: {
        text: "Para la mejor experiencia, usa esta billetera con el navegador web nativo de tu dispositivo para instalarla como una Aplicación Web Progresiva. Haz esto ahora mismo.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "Toca el menú (arriba a la derecha)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Presiona { buttonText }",
          buttonText: "@:AndroidPWAPrompt.buttonText",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "Toca compartir (abajo)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Presiona { buttonText }",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "Después de instalarla, cierra esta pestaña del navegador y abre Cashu.me desde tu pantalla de inicio.",
      },
    },
    pwa: {
      success: {
        title: "¡Éxito!",
        text: "Estás usando Cashu como una PWA. Cierra cualquier otra ventana del navegador abierta y usa la aplicación desde tu pantalla de inicio.",
        nextSteps:
          "Ahora puedes cerrar esta pestaña del navegador y abrir la app desde tu pantalla de inicio.",
      },
    },
  },
  iOSPWAPrompt: {
    text: "Toca { icon } y { buttonText }",
    buttonText: "Añadir a pantalla de inicio",
  },
  AndroidPWAPrompt: {
    text: "Toca { icon } y { buttonText }",
    buttonText: "Añadir a pantalla de inicio",
  },
  WelcomeSlide3: {
    title: "Tu frase semilla",
    text: "Guarda tu frase semilla en un gestor de contraseñas o en papel. Tu frase semilla es la única forma de recuperar tus fondos si pierdes el acceso a este dispositivo.",
    inputs: {
      seed_phrase: {
        label: "Frase semilla",
        caption: "Puedes ver tu frase semilla en la configuración.",
      },
      checkbox: {
        label: "La he anotado",
      },
    },
  },
  WelcomeSlide4: {
    english_only: "El texto legal solo está disponible en inglés.",
    title: "Términos del servicio",
    actions: {
      more: {
        label: "Léelos antes de usar Cashu.me",
      },
    },
    inputs: {
      checkbox: {
        label: "He leído y acepto estos términos y condiciones",
      },
    },
  },
  WelcomeSlideChoice: {
    title: "Configura tu billetera",
    text: "¿Quieres recuperar desde una frase semilla o crear una billetera nueva?",
    options: {
      new: {
        title: "Crear billetera nueva",
        subtitle: "Genera una semilla nueva y añade mints.",
      },
      recover: {
        title: "Recuperar billetera",
        subtitle: "Ingresa tu frase semilla, restaura mints y ecash.",
      },
    },
  },
  WelcomeMintSetup: {
    title: "Añadir mints",
    text: "Los mints son servidores que te ayudan a enviar y recibir ecash. Elige un mint descubierto o añade uno manualmente. Puedes hacerlo más tarde.",
    sections: { your_mints: "Tus mints" },
    restoring: "Restaurando mints…",
    placeholder: { mint_url: "https://" },
  },
  WelcomeRecoverSeed: {
    title: "Ingresa tu frase semilla",
    text: "Pega o escribe tu frase semilla de 12 palabras para recuperar.",
    inputs: { word: "Palabra { index }" },
    actions: { paste_all: "Pegar todo" },
    disclaimer:
      "Tu frase semilla solo se usa localmente para derivar las claves de tu billetera.",
  },
  WelcomeRestoreEcash: {
    title: "Restaura tu ecash",
    text: "Busca comprobantes no gastados en tus mints configurados y agrégalos a tu billetera.",
  },
  MintRatings: {
    web_of_trust_hop: "En tu red de confianza (salto {hop})",
    no_mint_url: "No se proporcionó la URL del mint",
    title: "Reseñas del mint",
    reviews: "reseñas",
    ratings: "{n} valoración | {n} valoraciones",
    no_reviews: "Aún no hay reseñas",
    your_review: "Tu reseña",
    no_reviews_to_display: "No hay reseñas para mostrar.",
    no_rating: "Sin calificación",
    stars_label: "{rating} de 5 estrellas",
    out_of: "de",
    rows: "Reviews",
    sort: "Ordenar",
    sort_options: {
      newest: "Más recientes",
      oldest: "Más antiguas",
      highest: "Más altas",
      lowest: "Más bajas",
    },
    actions: { write_review: "Escribir una reseña" },
    empty_state_subtitle:
      "Sé el primero en reseñar este mint. Tu experiencia ayuda a otros a elegir.",
    range: "{from}–{to} de {total}",
  },
  CreateMintReview: {
    connect_nostr:
      "Conecta una cuenta de Nostr en Ajustes para publicar una reseña.",
    published: "Reseña publicada",
    publish_failed: "No se pudo publicar la reseña",
    title: "Reseñar mint",
    publishing_as: "Publicando como",
    inputs: {
      rating: { label: "Calificación" },
      review: { label: "Reseña (opcional)" },
    },
    actions: {
      publish: { label: "Publicar reseña", in_progress: "Publicando…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "Restaurar desde la frase semilla",
      caption:
        "Antes de restaurar, añade todos los mints que usaste con esta semilla.",
      inputs: {
        seed_phrase: {
          label: "Frase semilla",
          caption: "Puedes ver tu frase semilla en la configuración.",
        },
      },
    },
    information: {
      label: "Información",
      caption:
        "El asistente solo restaurará ecash desde otra frase semilla, no podrás usar esta frase semilla ni cambiar la frase semilla de la billetera que estás usando actualmente. Esto significa que el ecash restaurado no estará protegido por tu frase semilla actual mientras no te envíes el ecash a ti mismo una vez.",
    },
    restore_mints: {
      label: "Restaurar mints",
      caption:
        "Elige los mints que quieres restaurar. Primero añade los que falten desde la pestaña Mints.",
    },
    nostr_mints: {
      label: "Restaurar mints desde Nostr",
      caption:
        "Busque copias de seguridad de mints almacenadas en relés de Nostr utilizando su frase semilla. Esto le ayudará a descubrir mints que utilizó anteriormente.",
      search_button: "Buscar copias de seguridad de mints",
      select_all: "Seleccionar todo",
      deselect_all: "Deseleccionar todo",
      backed_up: "Copia de seguridad realizada",
      already_added: "Ya añadido",
      add_selected: "Añadir seleccionados ({count})",
      no_backups_found: "No se han encontrado copias de seguridad de mints",
      no_backups_hint:
        "Asegúrese de que la copia de seguridad de Nostr mint está activada en los ajustes para hacer una copia de seguridad automática de su lista de mints.",
      invalid_mnemonic:
        "Por favor, introduzca una frase semilla válida antes de buscar.",
      search_error: "Error al buscar copias de seguridad de mints.",
      add_error: "Error al añadir los mints seleccionados.",
    },
    actions: {
      paste: {
        error: "Error al leer el contenido del portapapeles.",
      },
      validate: {
        error: "El mnemónico debe tener al menos 12 palabras.",
      },
      select_all: {
        label: "Seleccionar todo",
      },
      deselect_all: {
        label: "Deseleccionar todo",
      },
      restore: {
        label: "Restaurar",
        in_progress: "Restaurando mint…",
        error: "Error restaurando mint: { error }",
      },
      restore_all_mints: {
        label: "Restaurar todos los mints",
        in_progress: "Restaurando mint { index } de { length }…",
        success: "Restauración finalizada con éxito",
        error: "Error restaurando mints: { error }",
      },
      restore_selected_mints: {
        label: "Restaurar mints seleccionados ({count})",
        in_progress: "Restaurando mint { index } de { length }…",
        success: "Se han restaurado correctamente {count} mint(s)",
        error: "Error al restaurar los mints seleccionados: { error }",
      },
    },
  },
  MintSettings: {
    add: {
      title: "Añadir mint",
      description:
        "Ingresa la URL de un mint de Cashu para conectarte a él. Esta billetera no está afiliada a ningún mint.",
      inputs: {
        nickname: {
          placeholder: "Apodo (ej. Testnet)",
        },
      },
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "URL inválida",
        },
        scan: {
          label: "Escanear código QR",
        },
      },
    },
    discover: {
      title: "Descubrir mints",
      overline: "Descubrir",
      caption: "Mints que otras personas recomiendan en Nostr.",
      actions: {
        discover: {
          label: "Descubrir mints",
          in_progress: "Cargando…",
          error_no_mints: "No se encontraron mints",
          success: "Encontrados { length } mints",
        },
      },
      unnamed: "Mint sin nombre",
      empty: {
        title: "Encuentra una mint",
        text: "Cashu.me consulta a los relays de Nostr las mints que otras personas recomiendan, con sus valoraciones y reseñas.",
      },
      recommendations: {
        overline: "Encontrados { length } mints",
        caption: "Investiga por tu cuenta antes de usar un mint.",
        actions: {
          browse: {
            label: "Haz clic para explorar mints",
          },
        },
      },
    },
    swap: {
      title: "Intercambiar",
      overline: "Intercambios entre mints",
      caption:
        "Mueve fondos entre tus mints a través de Lightning. Puede haber comisiones.",
      inputs: {
        from: {
          label: "Desde",
        },
        to: {
          label: "Hasta",
        },
        amount: {
          label: "Cantidad ({ ticker })",
        },
      },
      actions: {
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
        receove_to_trusted_mint: { label: "Recibir en un mint de confianza" },
      },
    },
    error_badge: "Error",
    reviews_text: "reseña | reseñas",
    no_reviews_yet: "Aún no hay reseñas",
    discover_mints_button: "Descubrir mints",
  },
  QrcodeReader: {
    progress: {
      text: "{ percentage }{ addon }",
      percentage: "{ percentage }%",
      keep_scanning_text: " - Sigue escaneando",
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
    title: "Recibir Lightning",
    create_invoice_title: "Crear factura",
    inputs: {
      amount: {
        label: "Cantidad ({ ticker }) *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "Crear factura",
        label_blocked: "Creando factura",
        in_progress: "Creando",
      },
    },
    invoice: {
      caption: "Factura Lightning",
      status_paid_text: "Pagada",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        copy: {
          label: "Copiar factura",
        },
      },
    },
  },
  SendDialog: {
    captions: {
      ecash: "Comparte un token o código QR",
      lightning: "Paga una factura o dirección",
      onchain: "Envía a una dirección de Bitcoin",
    },
    title: "Enviar",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "No hay mints disponibles",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "No hay mints disponibles",
      },
    },
  },
  SendTokenDialog: {
    badge_locked: "bloqueado",
    title: "Enviar ecash",
    title_ecash_text: "Ecash",
    badge_offline_text: "Sin conexión",
    inputs: {
      amount: {
        label: "Cantidad ({ ticker }) *",
        invalid_too_much_error_text: "Demasiado",
      },
      p2pk_pubkey: {
        label: "Clave pública del receptor",
        label_invalid: "Clave pública del receptor inválida",
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
        tooltip_text: "Copiar emoji",
      },
      copy_tokens: {
        label: "Copiar ecash",
      },
      copy_link: {
        tooltip_text: "Copiar enlace",
      },
      share: {
        tooltip_text: "Compartir ecash",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      paste_p2pk_pubkey: {
        tooltip_text: "@:global.actions.paste.label",
      },
      send: {
        label: "@:global.actions.send.label",
        in_progress: "Enviando…",
      },
      delete: {
        tooltip_text: "Eliminar del historial",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "Grabar en tarjeta NFC",
          ndef_unsupported_text: "NDEF no soportado",
        },
      },
      pay: { label: "@:global.actions.pay.label" },
    },
    errors: {
      amount_required: "Introduce primero un importe.",
      serialization_failed: "No se pudo preparar el token de ecash.",
      mint_not_allowed_by_request:
        "Esta solicitud de pago no acepta el mint seleccionado.",
    },
  },
  ReceiveDialog: {
    captions: {
      ecash: "Pega, escanea o solicita un token",
      lightning: "Crea una factura para cobrar",
      onchain: "Obtén una dirección de Bitcoin",
    },
    title: "Recibir",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "No hay mints disponibles",
      },
      lightning: {
        label: "Lightning",
        error_no_mints:
          "Necesitas conectarte a un mint para recibir vía Lightning",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "Recibir ecash",
    actions: {
      paste: {
        label: "@:global.actions.paste.label",
      },
      scan: {
        label: "@:global.actions.scan.label",
      },
      request: {
        label: "Solicitar",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      nfc: {
        label: "NFC",
        scanning_text: "Escaneando…",
      },
    },
  },
  ReceiveTokenDialog: {
    receiving_amount: "Recibiendo {amount}",
    title: "Recibir ecash",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "Pegar token Cashu",
      },
    },
    errors: {
      invalid_token: {
        label: "Token inválido",
      },
      p2pk_lock_mismatch: {
        label:
          "No se puede recibir. El bloqueo P2PK de este token no coincide con su clave pública.",
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
        label_adding_mint: "Añadiendo mint…",
      },
      swap: {
        label: "@:global.actions.swap.label",
        tooltip_text: "Intercambiar a un mint de confianza",
        caption: "Intercambiar { value }",
        processing: "Procesando intercambio…",
        failed: "Error en el intercambio",
      },
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "Cancelar intercambio",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      later: {
        label: "Recibir más tarde",
        tooltip_text: "Añadir al historial para recibir más tarde",
        already_in_history_success_text: "El ecash ya está en el historial",
        added_to_history_success_text: "Ecash añadido al historial",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Leer desde tarjeta NFC",
          ndef_unsupported_text: "NDEF no soportado",
        },
      },
      receive_to_selected_mint: { label: "Recibir en el mint seleccionado" },
    },
    unknown_mint_info_text:
      "Mint desconocido. Se añadirá cuando recibas este token.",
    swap_section: {
      title: "Intercambio",
      source_label: "De",
      destination_label: "A",
      fee_info: "Este intercambio tendrá comisiones de la red Lightning.",
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "Clave de bloqueo",
      description: "Recibir ecash bloqueado con esta clave",
      used_warning_text:
        "Advertencia: Esta clave se usó antes. Usa una clave nueva para mayor privacidad.",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_key: {
        label: "Generar nueva clave",
      },
    },
  },
  PaymentRequestDialog: {
    payment_request: {
      caption: "Solicitud de pago",
      description: "Recibir pagos vía Nostr",
    },
    request_index: "Solicitud {index} de {total}",
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "Nueva solicitud",
      },
      add_amount: {
        label: "Añadir cantidad",
      },
      use_active_mint: {
        label: "Cualquier mint",
      },
      remove_amount: {
        label: "Quitar importe",
      },
      previous: {
        label: "Solicitud anterior",
      },
      next: {
        label: "Solicitud siguiente",
      },
    },
    inputs: {
      amount: {
        placeholder: "Ingresar cantidad",
      },
    },
    received_total: "Total recibido",
    no_payments_yet: "Aún no hay pagos",
  },
  NumericKeyboard: {
    actions: {
      close: {
        label: "@:global.actions.close.label",
        closed_info_text:
          "Teclado desactivado. Puedes reactivar el teclado en la configuración.",
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
        "Controla tu billetera remotamente con NWC. Presiona el código QR para vincular tu billetera con una aplicación compatible.",
      warning_text:
        "Advertencia: cualquiera con acceso a esta cadena de conexión puede iniciar pagos desde tu billetera. ¡No la compartas!",
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
    title: "Mensaje del mint",
  },
  MintDetailsDialog: {
    qr: {
      show: "Mostrar código QR",
      hide: "Ocultar código QR",
    },
    contact: {
      title: "Contacto",
    },
    details: {
      title: "Detalles del mint",
      url: {
        label: "URL",
      },
      nuts: {
        label: "NUTs compatibles",
        actions: {
          show: {
            label: "Ver todo",
          },
          hide: {
            label: "Ocultar",
          },
        },
      },
      currency: {
        label: "Unidad",
      },
      currencies: {
        label: "@:MintDetailsDialog.details.currency.label",
      },
      version: {
        label: "Versión",
      },
    },
    actions: {
      title: "Acciones",
      copy_mint_url: {
        label: "Copiar URL del mint",
      },
      delete: {
        label: "Eliminar mint",
      },
      edit: {
        label: "Editar mint",
      },
    },
  },
  ChooseMint: {
    title: "Selecciona un mint",
    badge_mint_error_text: "Error",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
    available_text: "en este mint",
    sheet_title: "Seleccionar mint",
    placeholder: "Selecciona un mint",
  },
  HistoryTable: {
    empty_text: "Aún no hay historial",
    row: {
      type_label: "Ecash",
      date_label: "hace { value }",
    },
    actions: {
      filter_ecash_only: {
        label: "Solo ecash",
      },
      check_status: {
        tooltip_text: "Verificar estado",
      },
      receive: {
        tooltip_text: "Recibir",
      },
      filter_pending: {
        label: "Mostrar solo pendientes",
      },
      show_all: {
        label: "Mostrar todo",
      },
    },
    old_token_not_found_error_text: "Token antiguo no encontrado",
  },
  InvoiceTable: {
    empty_text: "Aún no hay facturas",
    row: {
      type_label: "Lightning",
      type_tooltip_text: "Haz clic para copiar",
      date_label: "hace { value }",
    },
    actions: {
      check_status: {
        tooltip_text: "Verificar estado",
      },
      filter_pending: {
        label: "Mostrar solo pendientes",
      },
      show_all: {
        label: "Mostrar todo",
      },
    },
  },
  RemoveMintDialog: {
    title: "¿Quitar este mint?",
    nickname: {
      label: "Apodo",
    },
    balances: {
      label: "Saldos",
    },
    warning_text:
      "Tu ecash de este mint se queda en este dispositivo. Vuelve a aparecer si añades el mint de nuevo.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "Eliminar mint",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  ParseInputComponent: {
    placeholder: {
      default: "Token Cashu o dirección Lightning",
      receive: "Token Cashu",
      pay: "Dirección Lightning o factura",
    },
    qr_scanner: {
      title: "Escanear código QR",
      description: "Apunta la cámara a un código QR",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    onchain: {
      title: "Pagar en cadena",
      address_placeholder: "Dirección de Bitcoin",
      choose_speed: "Elige la velocidad de confirmación",
      blocks: "{n} bloque | {n} bloques",
      estimated_confirmation: "Confirmación estimada",
      fee_reserve: "reserva de comisión",
    },
    multinut: {
      label: "Pagar con varios mints",
    },
    quote: {
      label: "Cotizar",
    },
    input_data: {
      title: "Pagar con Lightning",
      inputs: {
        invoice_data: {
          label: "Factura o dirección Lightning",
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
      title_bolt12: "Pagar oferta Lightning",
    },
    lnurlpay: {
      amount_exact_label: "{ payee } está solicitando { value } { ticker }",
      amount_range_label:
        "{ payee } está solicitando{br}entre { min } y { max } { ticker }",
      sending_to_lightning_address: "Enviando a { address }",
      inputs: {
        amount: {
          label: "Cantidad ({ ticker }) *",
        },
        comment: {
          label: "Comentario (opcional)",
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
      title: "Pagar { value }",
      paying: "Pagando",
      paid: "Pagado",
      fee: "Tarifa",
      memo: {
        label: "Memo",
      },
      processing_info_text: "Procesando…",
      balance_too_low_warning_text: "Saldo demasiado bajo",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        pay: {
          label: "Pagar",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
          waiting_for_wallet: "Esperando la billetera…",
          error: "Error",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Editar mint",
    inputs: {
      nickname: {
        placeholder: "p. ej. Testnet",
        label: "Apodo",
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
    title: "¿Confías en este mint?",
    description:
      "Únete a este mint solo si confías en él. Si deja de funcionar, el ecash que tengas en él se pierde.",
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
        in_progress: "Añadiendo mint",
      },
    },
    audit_info: {
      label: "Información de auditoría",
      actions: {
        show: {
          label: "Mostrar",
        },
        hide: {
          label: "Ocultar",
        },
      },
    },
    unreachable_error_text:
      "No se puede conectar con este mint. Revisa la URL y tu conexión e inténtalo de nuevo.",
  },
  restore: {
    mnemonic_error_text: "Por favor, ingresa un mnemónico",
    restore_mint_error_text: "Error restaurando mint: { error }",
    prepare_info_text: "Preparando proceso de restauración…",
    restored_proofs_for_keyset_info_text:
      "Restauradas { restoreCounter } pruebas para el keyset { keysetId }",
    checking_proofs_for_keyset_info_text:
      "Verificando pruebas { startIndex } a { endIndex } para el keyset { keysetId }",
    no_proofs_info_text: "No se encontraron pruebas para restaurar",
    restored_amount_success_text: "Restaurado { amount }",
  },
  swap: {
    in_progress_warning_text: "Intercambio en progreso",
    invalid_swap_data_error_text: "Datos de intercambio inválidos",
    swap_error_text: "Error al intercambiar",
  },
  TokenInformation: {
    fee: "Tarifa",
    unit: "Unidad",
    fiat: "Fiat",
    p2pk: "P2PK",
    locked: "Bloqueado",
    locked_to_you: "Bloqueado para ti",
    mint: "Casa de moneda",
    memo: "Memo",
    payment_request: "Solicitud de pago",
    nostr: "Nostr",
    token_copied: "Token copiado al portapapeles",
  },
  common: {
    copied: "Copiado",
    on_chain: "En cadena",
    pending: "Pendiente",
    delete: "Eliminar",
    copy_npub: "Copiar npub",
    back: "Atrás",
    refresh: "Actualizar",
    settings: "Ajustes",
    backspace: "Borrar",
    swap_input_mode: "Cambiar entre importe y moneda fiat",
    fee: "Comisión",
  },
  SendPaymentRequest: {
    actions: {
      pay: { label: "Pagar" },
      pay_via: { label: "Pagar con {transport}" },
    },
    info: {
      pay_failed: "No se pudo pagar la solicitud",
      pay_to: "Pagar a {target}",
      invalid_url: "URL no válida",
    },
  },
  PaymentRequestInfo: {
    title_with_transport: "Solicitud de pago por {transport}",
    title: "Solicitud de pago",
    subtitle: "Pagar a {target}",
    subtitle_fallback: "Solicitud de pago",
    invalid_url: "URL no válida",
  },
  QuoteInformation: {
    amount: "Importe",
    fee_reserve: "Reserva de comisión",
    fee_paid: "Comisión pagada",
    unit: "Unidad",
    status: "Estado",
    network: "Red",
    transaction_id: "ID de transacción",
    chain_status: "Estado en la cadena",
    fetching: "Obteniendo",
    paid_at: "Pagado el",
    preimage: "Preimagen",
    preimage_copied: "Preimagen copiada",
    mint: "Mint",
    method: "Método",
    lightning_offer: "Oferta Lightning",
    chain_confirmed: "Confirmada",
    chain_pending: "Pendiente",
    states: {
      waiting: "Esperando el pago",
      paid: "Pagada",
      unpaid: "Sin pagar",
      pending: "Pendiente",
      issued: "Emitida",
      expired: "Caducada",
      failed: "Fallida",
    },
  },
  MintAuditInfo: {
    title: "Información de auditoría",
    loading: "Cargando información de auditoría...",
    not_audited: "Este mint aún no ha sido auditado.",
    not_audited_text:
      "Para saber más sobre el auditor o apoyar una futura auditoría, visita {link} o haz clic {here} para donar ecash y ayudar a iniciar una auditoría de este mint.",
    here: "aquí",
    unavailable:
      "La información de auditoría no está disponible en este momento.",
    load_failed: "No se pudieron cargar los datos del mint",
    success_rate: "Tasa de éxito",
    swaps_count: "{successful} de {total} intercambios",
    average_time: "Tiempo medio",
    average_time_caption: "En intercambios exitosos",
    disclaimer:
      "Los datos de auditoría los proporcionan terceros independientes para ayudar a evaluar la fiabilidad de un mint con el tiempo. Sin embargo, estos resultados son solo informativos y no garantizan la seguridad, solvencia ni fiabilidad de ningún mint. Investiga siempre por tu cuenta y asegúrate de confiar en el operador del mint antes de usar sus servicios.",
    donate_text:
      "La información de auditoría la ofrece {link}. El saldo actual del auditor para este mint es de {balance}, con un total de {donations} donados hasta ahora. Para apoyar la auditoría continua, puedes {press_here} para donar ecash al auditor.",
    press_here: "pulsar aquí",
    sats_amount: "{amount} sats",
    warnings_title: "Avisos del auditor",
    warnings: {
      last_swap_failed: "El último intento de intercambio ha fallado.",
      recent_success:
        "{successful} de {total} intercambios en los últimos {days} días tuvieron éxito.",
      reliable:
        "{base} Sin embargo, {success} Este mint parece fiable; los fallos podrían deberse al mint receptor.",
      unreliable: "{base} Solo {success} Este mint podría no ser fiable.",
      unknown:
        "El auditor aún no ha podido determinar la calidad de este mint.",
      not_enough_data:
        "El auditor no tiene suficientes datos recientes de este mint. Solo hubo {count} intercambio exitoso en los últimos {days} días. | El auditor no tiene suficientes datos recientes de este mint. Solo hubo {count} intercambios exitosos en los últimos {days} días.",
      low_success:
        "En los últimos {days} días, este mint tuvo una tasa de éxito del {rate} %, por debajo del {threshold} % recomendado.",
      inactive:
        "Este mint no ha tenido intercambios durante {days} día. Puede que no esté accesible. | Este mint no ha tenido intercambios durante {days} días. Puede que no esté accesible.",
      slow: "Este mint es lento. Los pagos desde él tardaron {seconds} segundos de media.",
      no_successful:
        "No hay intercambios exitosos registrados para este mint. Puede que no esté accesible.",
    },
    chart: {
      now: "Ahora",
      today: "Hoy",
      yesterday: "Ayer",
      invalid_date: "Fecha no válida",
      swaps: "Intercambios:",
      success_rate: "Tasa de éxito:",
      time_range: "Intervalo de tiempo:",
    },
  },
  DisplayTokenComponent: {
    title: {
      send: "Enviar ecash",
      sent: "Ecash enviado",
      received: "Ecash recibido",
    },
    qr_speed: "Velocidad QR: {value}",
    qr_size: "Tamaño QR: {value}",
    speed: {
      fast: "Rápida",
      medium: "Media",
      slow: "Lenta",
    },
    size: {
      large: "Grande",
      medium: "Mediano",
      small: "Pequeño",
    },
    delete_dialog: {
      title: "Eliminar ecash",
      text: "¿Seguro que quieres eliminar esta transacción de tu historial?",
      warning:
        "Aviso: esta acción no se puede deshacer y no hay forma de recuperar el token.",
    },
    nfc: {
      read_failed: "Error al leer NFC",
      write_failed: "Error al escribir NFC",
      error: "Error de NFC",
      writing: "Escribiendo en la tarjeta NFC...",
      success: "¡Token escrito en la tarjeta correctamente!",
      capacity:
        "Puede que la tarjeta no tenga capacidad suficiente (se necesitan {bytes} bytes).",
    },
  },
  CreateInvoiceDialog: {
    onchain_title: "Recibir en cadena",
    bolt12_title: "Recibir Bolt12",
    mint_unreachable: "Mint inaccesible",
    mint_unreachable_text: "Vuelve a conectarte al mint para recibir pagos.",
    reconnect_mint: "Reconectar mint",
    checking_address: "Comprobando dirección...",
    add_amount: "Añadir importe",
    new_offer: "Nueva oferta",
    create_offer: "Crear oferta",
    create_new_address: "Crear nueva dirección",
    create_address: "Crear dirección",
    onchain_unsupported:
      "Este mint no admite depósitos en cadena en esta unidad.",
    deposit_limits: {
      outside: "Los depósitos fuera de {min}–{max} no se acreditarán.",
      below: "Los depósitos inferiores a {min} no se acreditarán.",
      above: "Los depósitos superiores a {max} no se acreditarán.",
    },
    amount_errors: {
      positive_decimal:
        "Introduce un importe positivo en {unit} con dos decimales como máximo.",
      positive_whole: "Introduce un importe entero positivo en {unit}.",
      min: "Introduce al menos {amount}.",
      max: "Introduce como máximo {amount}.",
    },
  },
};
