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
    },
    inputs: {
      mint_url: {
        label: "URL del mint",
      },
    },
  },
  MultinutPicker: {
    payment: "Pago Multinut",
    selectMints:
      "Seleccione una o varias casas de moneda para ejecutar un pago.",
    totalSelectedBalance: "Saldo Total Seleccionado",
    multiMintPay: "Pago Multi-Mint",
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
          caption: "Términos de Servicio",
        },
      },
      links: {
        title: "Enlaces",
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
    language: {
      title: "Idioma",
      description: "Por favor, elige tu idioma preferido de la lista de abajo.",
    },
    sections: {
      backup_restore: "COPIA DE SEGURIDAD Y RESTAURACIÓN",
      lightning_address: "DIRECCIÓN LIGHTNING",
      nostr_keys: "CLAVES NOSTR",
      nostr: "NOSTR",
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
          "El asistente de restauración te permite recuperar ecash perdido desde una frase semilla mnemónica. La frase semilla de tu billetera actual no se verá afectada, el asistente solo te permitirá restaurar ecash desde otra frase semilla.",
        button: "Restaurar",
      },
    },
    lightning_address: {
      title: "Dirección Lightning",
      description: "Recibe pagos a tu dirección Lightning.",
      enable: {
        toggle: "Habilitar",
        description: "Dirección Lightning con npub.cash",
      },
      address: {
        copy_tooltip: "Copiar dirección Lightning",
      },
      automatic_claim: {
        toggle: "Reclamar automáticamente",
        description: "Recibir pagos entrantes automáticamente.",
      },
      npc_v2: {
        choose_mint_title: "Elegir mint para npub.cash v2",
        choose_mint_placeholder: "Seleccionar un mint...",
      },
    },
    nostr_keys: {
      title: "Tus claves nostr",
      description: "Establece las claves nostr para tu dirección Lightning.",
      wallet_seed: {
        title: "Frase semilla de la billetera",
        description:
          "Generar par de claves nostr desde la semilla de la billetera",
        copy_nsec: "Copiar nsec",
      },
      nsec_bunker: {
        title: "Nsec Bunker",
        description: "Usar un bunker NIP-46",
        delete_tooltip: "Eliminar conexión",
      },
      use_nsec: {
        title: "Usa tu nsec",
        description: "Este método es peligroso y no se recomienda",
        delete_tooltip: "Eliminar nsec",
      },
      signing_extension: {
        title: "Extensión de firma",
        description: "Usar una extensión de firma NIP-07",
        not_found: "No se encontró ninguna extensión de firma NIP-07",
      },
    },
    nostr: {
      title: "NOSTR",
      relays: {
        expand_label: "Haga clic para editar relays",
        add: {
          title: "Agregar relay",
          description:
            "Su billetera usa estos relays para operaciones de nostr como solicitudes de pago, nostr wallet connect y respaldos.",
        },
        list: {
          title: "Relays",
          description: "Su billetera se conectará a estos relays.",
          copy_tooltip: "Copiar relay",
          remove_tooltip: "Eliminar relay",
        },
      },
    },
    payment_requests: {
      title: "Solicitudes de pago",
      description:
        "Las solicitudes de pago te permiten recibir pagos vía nostr. Si habilitas esto, tu billetera se suscribirá a tus relays nostr.",
      enable_toggle: "Habilitar Solicitudes de Pago",
      claim_automatically: {
        toggle: "Reclamar automáticamente",
        description: "Recibir pagos entrantes automáticamente.",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Wallet Connect (NWC)",
      description:
        "Usa NWC para controlar tu billetera desde cualquier otra aplicación.",
      enable_toggle: "Habilitar NWC",
      payments_note:
        "Solo puedes usar NWC para pagos desde tu saldo de Bitcoin. Los pagos se realizarán desde tu mint activo.",
      connection: {
        copy_tooltip: "Copiar cadena de conexión",
        qr_tooltip: "Mostrar código QR",
        allowance_label: "Límite restante (sat)",
      },
      relays: {
        expand_label: "Haz clic para editar relays",
        add: {
          title: "Añadir relay",
          description:
            "Nostr Wallet Connect usa relays nostr para conectar tu billetera a otras aplicaciones.",
        },
        list: {
          title: "Relays",
          description: "Tu billetera se conectará a estos relays.",
          copy_tooltip: "Copiar relay",
          remove_tooltip: "Eliminar relay",
        },
      },
    },
    hardware_features: {
      webnfc: {
        title: "WebNFC",
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
          description: "Almacenar tokens como datos binarios",
        },
        quick_access: {
          toggle: "Acceso rápido a NFC",
          description:
            "Escanea rápidamente tarjetas NFC en el menú Recibir Ecash. Esta opción añade un botón NFC al menú Recibir Ecash.",
        },
      },
    },
    p2pk_features: {
      title: "P2PK",
      description:
        "Genera un par de claves para recibir ecash bloqueado con P2PK. Advertencia: Esta característica es experimental. Úsala solo con cantidades pequeñas. Si pierdes tus claves privadas, nadie podrá desbloquear el ecash bloqueado con ellas.",
      generate_button: "Generar clave",
      import_button: "Importar nsec",
      quick_access: {
        toggle: "Acceso rápido para bloquear",
        description:
          "Usa esto para mostrar rápidamente tu clave de bloqueo P2PK en el menú recibir ecash.",
      },
      keys_expansion: {
        label: "Haz clic para ver {count} claves",
        used_badge: "usada",
      },
    },
    privacy: {
      title: "Privacidad",
      description: "Estas configuraciones afectan tu privacidad.",
      check_incoming: {
        toggle: "Verificar factura entrante",
        description:
          "Si está habilitado, la billetera verificará la última factura en segundo plano. Esto aumenta la capacidad de respuesta de la billetera, lo que facilita la toma de huellas digitales. Puedes verificar manualmente las facturas no pagadas en la pestaña Facturas.",
      },
      check_startup: {
        toggle: "Verificar facturas pendientes al inicio",
        description:
          "Si está habilitado, la billetera verificará las facturas pendientes de las últimas 24 horas al inicio.",
      },
      check_all: {
        toggle: "Verificar todas las facturas",
        description:
          "Si está habilitado, la billetera verificará periódicamente las facturas no pagadas en segundo plano durante hasta dos semanas. Esto aumenta la actividad en línea de la billetera, lo que facilita la toma de huellas digitales. Puedes verificar manualmente las facturas no pagadas en la pestaña Facturas.",
      },
      check_sent: {
        toggle: "Verificar ecash enviado",
        description:
          "Si está habilitado, la billetera usará verificaciones periódicas en segundo plano para determinar si los tokens enviados han sido canjeados. Esto aumenta la actividad en línea de la billetera, lo que facilita la toma de huellas digitales.",
      },
      websockets: {
        toggle: "Usar WebSockets",
        description:
          "Si está habilitado, la billetera usará conexiones WebSocket de larga duración para recibir actualizaciones sobre facturas pagadas y tokens gastados de los mints. Esto aumenta la capacidad de respuesta de la billetera pero también facilita la toma de huellas digitales.",
      },
      bitcoin_price: {
        toggle: "Obtener tasa de cambio de Coinbase",
        description:
          "Si está habilitado, se obtendrá la tasa de cambio actual de Bitcoin de coinbase.com y se mostrará tu saldo convertido.",
        currency: {
          title: "Moneda Fiat",
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
        description:
          "Opción para intercambiar Ecash recibido a tu mint activo en el diálogo Recibir Ecash.",
      },
      auto_paste: {
        toggle: "Pegar Ecash automáticamente",
        description:
          "Pega automáticamente ecash de tu portapapeles cuando presionas Recibir, luego Ecash, luego Pegar. El pegado automático puede causar fallos en la interfaz de usuario en iOS, desactívalo si experimentas problemas.",
      },
      auditor: {
        toggle: "Habilitar auditor",
        badge: "Beta",
        description:
          "Si está habilitado, la billetera mostrará información del auditor en el diálogo de detalles del mint. El auditor es un servicio de terceros que monitorea la fiabilidad de los mints.",
        url_label: "URL del Auditor",
        api_url_label: "URL API del Auditor",
      },
    },
    appearance: {
      keyboard: {
        title: "Teclado en pantalla",
        description: "Usa el teclado numérico para ingresar cantidades.",
        toggle: "Usar teclado numérico",
        toggle_description:
          "Si está habilitado, se usará el teclado numérico para ingresar cantidades.",
      },
      theme: {
        title: "Apariencia",
        description: "Cambia cómo se ve tu billetera.",
        tooltips: {
          mono: "mono",
          cyber: "ciber",
          freedom: "libertad",
          nostr: "nostr",
          bitcoin: "bitcoin",
          mint: "mint",
          nut: "nuez",
          blu: "azul",
          flamingo: "flamenco",
        },
      },
    },
    advanced: {
      title: "Avanzado",
      developer: {
        title: "Configuración de desarrollador",
        description:
          "Las siguientes configuraciones son para desarrollo y depuración.",
        new_seed: {
          button: "Generar nueva frase semilla",
          description:
            "Esto generará una nueva frase semilla. Debes enviar tu saldo completo a ti mismo para poder restaurarlo con una nueva semilla.",
          confirm_question:
            "¿Estás seguro de que quieres generar una nueva frase semilla?",
          cancel: "Cancelar",
          confirm: "Confirmar",
        },
        remove_spent: {
          button: "Eliminar pruebas gastadas",
          description:
            "Verifica si los tokens ecash de tus mints activos están gastados y elimina los gastados de tu billetera. Solo usa esto si tu billetera está bloqueada.",
        },
        debug_console: {
          button: "Alternar Consola de Depuración",
          description:
            "Abre la terminal de depuración de Javascript. Nunca pegues nada en esta terminal que no entiendas. Un ladrón podría intentar engañarte para que pegues código malicioso aquí.",
        },
        export_proofs: {
          button: "Exportar pruebas activas",
          description:
            "Copia tu saldo completo del mint activo como un token Cashu en tu portapapeles. Esto solo exportará los tokens del mint y unidad seleccionados. Para una exportación completa, selecciona un mint y unidad diferente y exporta de nuevo.",
        },
        keyset_counters: {
          title: "Incrementar contadores de keyset",
          description:
            'Haz clic en el ID del keyset para incrementar los contadores de la ruta de derivación para los keysets en tu billetera. Esto es útil si ves el error "las salidas ya han sido firmadas".',
        },
        unset_reserved: {
          button: "Desmarcar todos los tokens reservados",
          description:
            'Esta billetera marca el ecash saliente pendiente como reservado (y lo resta de tu saldo) para prevenir intentos de doble gasto. Este botón desmarcará todos los tokens reservados para que puedan usarse de nuevo. Si haces esto, tu billetera podría incluir pruebas gastadas. Presiona el botón "Eliminar pruebas gastadas" para deshacerte de ellas.',
        },
        show_onboarding: {
          button: "Mostrar bienvenida",
          description: "Mostrar la pantalla de bienvenida de nuevo.",
        },
        reset_wallet: {
          button: "Restablecer datos de la billetera",
          description:
            "Restablece los datos de tu billetera. Advertencia: ¡Esto borrará todo! Asegúrate de crear una copia de seguridad primero.",
          confirm_question:
            "¿Estás seguro de que quieres eliminar los datos de tu billetera?",
          cancel: "Cancelar",
          confirm: "Eliminar billetera",
        },
        export_wallet: {
          button: "Exportar datos de la billetera",
          description:
            "Descarga un volcado de tu billetera. Puedes restaurar tu billetera arrastrando y soltando este archivo en la pantalla de bienvenida de una nueva billetera. Este archivo estará desactualizado si sigues usando tu billetera después de exportarlo.",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Únete a un mint",
    subtitle:
      "Todavía no te has unido a ningún mint de Cashu. Añade una URL de mint en la configuración o recibe ecash de un nuevo mint para empezar.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Recibir Ecash",
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
    title: "Nop.",
    text: "Otra pestaña ya está en ejecución. Cierra esta pestaña e inténtalo de nuevo.",
    actions: {
      retry: {
        label: "Reintentar",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Oops. Nada por aquí…",
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
    title: "Bienvenido a Cashu",
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
    title: "Instalar PWA",
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
        text: "Una vez que hayas instalado esta aplicación en tu dispositivo, cierra esta ventana del navegador y usa la aplicación desde tu pantalla de inicio.",
      },
    },
    pwa: {
      success: {
        title: "¡Éxito!",
        text: "Estás usando Cashu como una PWA. Cierra cualquier otra ventana del navegador abierta y usa la aplicación desde tu pantalla de inicio.",
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
    title: "Tu Frase Semilla",
    text: "Guarda tu frase semilla en un gestor de contraseñas o en papel. Tu frase semilla es la única forma de recuperar tus fondos si pierdes el acceso a este dispositivo.",
    inputs: {
      seed_phrase: {
        label: "Frase Semilla",
        caption: "Puedes ver tu frase semilla en la configuración.",
      },
      checkbox: {
        label: "La he anotado",
      },
    },
  },
  WelcomeSlide4: {
    title: "Términos",
    actions: {
      more: {
        label: "Leer Términos de Servicio",
      },
    },
    inputs: {
      checkbox: {
        label: "He leído y acepto estos términos y condiciones",
      },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "Restaurar desde Frase Semilla",
      caption:
        "Ingresa tu frase semilla para restaurar tu billetera. Antes de restaurar, asegúrate de haber añadido todos los mints que has usado antes.",
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
      label: "Restaurar Mints",
      caption:
        'Selecciona el mint para restaurar. Puedes añadir más mints en la pantalla principal bajo "Mints" y restaurarlos aquí.',
    },
    actions: {
      paste: {
        error: "Error al leer el contenido del portapapeles.",
      },
      validate: {
        error: "El mnemónico debe tener al menos 12 palabras.",
      },
      restore: {
        label: "Restaurar",
        in_progress: "Restaurando mint…",
        error: "Error restaurando mint: { error }",
      },
      restore_all_mints: {
        label: "Restaurar Todos los Mints",
        in_progress: "Restaurando mint { index } de { length }…",
        success: "Restauración finalizada con éxito",
        error: "Error restaurando mints: { error }",
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
          label: "Escanear Código QR",
        },
      },
    },
    discover: {
      title: "Descubrir mints",
      overline: "Descubrir",
      caption: "Descubre mints que otros usuarios han recomendado en nostr.",
      actions: {
        discover: {
          label: "Descubrir mints",
          in_progress: "Cargando…",
          error_no_mints: "No se encontraron mints",
          success: "Encontrados { length } mints",
        },
      },
      recommendations: {
        overline: "Encontrados { length } mints",
        caption:
          "Estos mints fueron recomendados por otros usuarios de Nostr. Lee reseñas en { link }. Ten cuidado y haz tu propia investigación antes de usar un mint.",
        actions: {
          browse: {
            label: "Haz clic para explorar mints",
          },
        },
      },
    },
    swap: {
      title: "Intercambiar",
      overline: "Intercambios Multimint",
      caption:
        "Intercambia fondos entre mints vía Lightning. Nota: Deja espacio para posibles comisiones de Lightning. Si el pago entrante no tiene éxito, verifica la factura manualmente.",
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
      },
    },
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
    title: "Crear Factura",
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
        label: "Crear Factura",
        label_blocked: "Creando factura…",
        in_progress: "Creando",
      },
    },
    invoice: {
      caption: "Factura Lightning",
      status_paid_text: "¡Pagada!",
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
    title: "Enviar { value }",
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
        tooltip_text: "Copiar Emoji",
      },
      copy_tokens: {
        label: "@:global.actions.copy.label",
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
    },
  },
  ReceiveDialog: {
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
    title: "Recibir Ecash",
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
    title: "Recibir { value }",
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
        label: "Más tarde",
        tooltip_text: "Añadir al historial para recibir más tarde",
        already_in_history_success_text: "Ecash ya está en el Historial",
        added_to_history_success_text: "Ecash añadido al Historial",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Leer desde tarjeta NFC",
          ndef_unsupported_text: "NDEF no soportado",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "Clave P2PK",
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
      caption: "Solicitud de Pago",
      description: "Recibir pagos vía Nostr",
    },
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
    },
    inputs: {
      amount: {
        placeholder: "Ingresar cantidad",
      },
    },
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
    title: "Mensaje del Mint",
  },
  MintDetailsDialog: {
    contact: {
      title: "Contacto",
    },
    details: {
      title: "Detalles del mint",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Nuts",
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
        label: "Moneda",
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
  },
  HistoryTable: {
    empty_text: "Aún no hay historial",
    row: {
      type_label: "Ecash",
      date_label: "hace { value }",
    },
    actions: {
      check_status: {
        tooltip_text: "Verificar estado",
      },
      receive: {
        tooltip_text: "Recibir",
      },
      filter_pending: {
        label: "Filtrar pendientes",
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
        label: "Filtrar pendientes",
      },
      show_all: {
        label: "Mostrar todo",
      },
    },
  },
  RemoveMintDialog: {
    title: "¿Estás seguro de que quieres eliminar este mint?",
    nickname: {
      label: "Apodo",
    },
    balances: {
      label: "Saldos",
    },
    warning_text:
      "Nota: Debido a que esta billetera es paranoica, tu ecash de este mint no se eliminará realmente, sino que permanecerá almacenado en tu dispositivo. Lo verás reaparecer si vuelves a añadir este mint más tarde.",
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
  PayInvoiceDialog: {
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
    },
    lnurlpay: {
      amount_exact_label: "{ payee } está solicitando { value } { ticker }",
      amount_range_label:
        "{ payee } está solicitando{br}entre { min } y { max } { ticker }",
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
          error: "Error",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Editar mint",
    inputs: {
      nickname: {
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
      "Antes de usar este mint, asegúrate de confiar en él. Los mints podrían volverse maliciosos o dejar de operar en cualquier momento.",
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
};
