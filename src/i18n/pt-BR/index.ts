export default {
  global: {
    copy_to_clipboard: {
      success: "Copiado para a área de transferência!",
    },
    actions: {
      add_mint: {
        label: "Adicionar mint",
      },
      cancel: {
        label: "Cancelar",
      },
      copy: {
        label: "Copiar",
      },
      close: {
        label: "Fechar",
      },
      enter: {
        label: "Confirmar",
      },
      lock: {
        label: "Bloquear",
      },
      paste: {
        label: "Colar",
      },
      receive: {
        label: "Receber",
      },
      scan: {
        label: "Escanear",
      },
      send: {
        label: "Enviar",
      },
      pay: {
        label: "Pagar",
      },
      swap: {
        label: "Swap",
      },
      update: {
        label: "Atualizar",
      },
      dismiss: {
        label: "Dispensar",
      },
    },
    inputs: {
      mint_url: {
        label: "URL do mint",
      },
    },
  },
  common: {
    fee: "Taxa",
  },
  MultinutPicker: {
    payment: "Pagamento multi-mint",
    selectMints: "Selecione um ou mais mints para realizar um pagamento.",
    totalSelectedBalance: "Saldo total selecionado",
    multiMintPay: "Pagamento multi-mint",
    balanceNotEnough: "Saldo multi-mint insuficiente para cobrir esta fatura",
    failed: "Falha ao processar: {error}",
    paid: "Pago {amount} via Lightning",
  },
  wallet: {
    notifications: {
      balance_too_low: "Saldo insuficiente",
      received: "Recebido {amount}",
      fee: " (taxa: {fee})",
      could_not_request_mint: "Não foi possível solicitar ao mint",
      invoice_still_pending: "Fatura ainda pendente",
      paid_lightning: "Pago {amount} via Lightning",
      payment_pending_refresh:
        "Pagamento pendente. Atualize a fatura manualmente.",
      sent: "Enviado {amount}",
      token_still_pending: "Token ainda pendente",
      received_lightning: "Recebido {amount} via Lightning",
      lightning_payment_failed: "Pagamento Lightning falhou",
      failed_to_decode_invoice: "Falha ao decodificar fatura",
      unsupported_legacy_qr: "QR code legado não suportado",
      legacy_qr_not_supported:
        "Este QR code legado não é de um comerciante suportado",
      invalid_lnurl: "LNURL inválido",
      lnurl_error: "Erro de LNURL",
      no_amount: "Sem valor",
      no_lnurl_data: "Sem dados LNURL",
      no_price_data: "Sem dados de preço.",
      please_try_again: "Por favor, tente novamente.",
      trying_again: "Tentando novamente...",
    },
    mint: {
      notifications: {
        already_added: "Mint já adicionado",
        added: "Mint adicionado",
        not_found: "Mint não encontrado",
        activation_failed: "Falha ao ativar mint",
        no_active_mint: "Nenhum mint ativo",
        unit_activation_failed: "Falha ao ativar unidade",
        unit_not_supported: "Unidade não suportada pelo mint",
        activated: "Mint ativado",
        could_not_connect: "Não foi possível conectar ao mint",
        could_not_get_info: "Não foi possível obter informações do mint",
        could_not_get_keys: "Não foi possível obter chaves do mint",
        could_not_get_keysets: "Não foi possível obter keysets do mint",
        mint_validation_error: "Erro de validação do mint",
        removed: "Mint removido",
        error: "Erro no mint",
      },
    },
  },
  MainHeader: {
    menu: {
      settings: {
        title: "Configurações",
        settings: {
          title: "Configurações",
          caption: "Configuração da carteira",
        },
      },
      terms: {
        title: "Termos",
        terms: {
          title: "Termos",
          caption: "Termos de Serviço",
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
          title: "Doar",
          caption: "Apoie o Cashu",
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
        text: "Recarregando em { countdown }",
      },
    },
    staging: {
      warning: {
        text: "Staging – não use com fundos reais!",
      },
    },
  },
  FullscreenHeader: {
    actions: {
      back: {
        label: "Carteira",
      },
    },
  },
  Settings: {
    menu: {
      title: "Configurações",
      backup: {
        title: "Backup e restauração",
        caption: "Frase semente e recuperação de ecash",
      },
      lightning_address: {
        title: "Endereço Lightning",
        caption: "Receba pagamentos no seu endereço Lightning",
      },
      nostr: {
        title: "Nostr",
        caption: "Chaves, relays e Web of Trust",
      },
      payment_requests: {
        title: "Solicitações de pagamento",
        caption: "Receba pagamentos de ecash via nostr",
      },
      nwc: {
        title: "Nostr Wallet Connect",
        caption: "Use sua carteira em outros aplicativos",
      },
      hardware: {
        title: "Hardware",
        caption: "Configurações de NFC",
      },
      p2pk: {
        title: "P2PK",
        caption: "Receba ecash bloqueado nas suas chaves",
      },
      privacy: {
        title: "Privacidade",
        caption: "Verificações de rede e preço do Bitcoin",
      },
      experimental: {
        title: "Experimental",
        caption: "Experimente novos recursos antes",
      },
      appearance: {
        title: "Aparência",
        caption: "Tema, teclado e símbolo do Bitcoin",
      },
      language: {
        title: "Idioma",
        caption: "Escolha seu idioma",
      },
      advanced: {
        title: "Avançado",
        caption: "Ferramentas de desenvolvedor e redefinição da carteira",
      },
      about: {
        title: "Sobre",
        caption: "Termos e links",
      },
    },
    language: {
      title: "Idioma",
      description:
        "Por favor, escolha o idioma de sua preferência na lista abaixo.",
    },
    sections: {
      backup_restore: "BACKUP E RESTAURAÇÃO",
      lightning_address: "ENDEREÇO LIGHTNING",
      nostr_keys: "CHAVES NOSTR",
      nostr: {
        title: "NOSTR",
        relays: {
          expand_label: "Clique para editar os relays",
          add: {
            title: "Adicionar relay",
            description:
              "Sua carteira usa esses relays para operações Nostr como solicitações de pagamento, Nostr Wallet Connect e backups.",
          },
          list: {
            title: "Relays",
            description: "Sua carteira se conectará a esses relays.",
            copy_tooltip: "Copiar relay",
            remove_tooltip: "Remover relay",
          },
        },
      },
      payment_requests: "SOLICITAÇÕES DE PAGAMENTO",
      nostr_wallet_connect: "NOSTR WALLET CONNECT",
      hardware_features: "RECURSOS DE HARDWARE",
      p2pk_features: "RECURSOS P2PK",
      privacy: "PRIVACIDADE",
      experimental: "EXPERIMENTAL",
      appearance: "APARÊNCIA",
    },
    backup_restore: {
      backup_seed: {
        title: "Fazer backup da frase de recuperação",
        description:
          "Sua frase de recuperação pode restaurar sua carteira. Mantenha-a segura e privada.",
        seed_phrase_label: "Frase de recuperação",
      },
      restore_ecash: {
        title: "Restaurar ecash",
        description:
          "O assistente de restauração permite recuperar ecash perdido a partir de uma frase de recuperação mnemônica. A frase de recuperação da sua carteira atual permanecerá inalterada; o assistente só permitirá restaurar ecash de outra frase de recuperação.",
        button: "Restaurar",
      },
    },
    lightning_address: {
      title: "Endereço Lightning",
      description: "Receba pagamentos no seu endereço Lightning.",
      enable: {
        toggle: "Ativar",
        description: "Endereço Lightning com npub.cash",
      },
      address: {
        copy_tooltip: "Copiar endereço Lightning",
      },
      automatic_claim: {
        toggle: "Reivindicar automaticamente",
        description: "Receba pagamentos recebidos automaticamente.",
      },
      npc_v2: {
        choose_mint_title: "Escolha o mint para npub.cash v2",
        choose_mint_placeholder: "Selecione um mint...",
      },
    },
    nostr_keys: {
      title: "Suas chaves Nostr",
      description:
        "Suas chaves Nostr serão usadas para determinar seu endereço Lightning.",
      wallet_seed: {
        title: "Frase de recuperação da carteira",
        description:
          "Gerar par de chaves Nostr a partir da frase de recuperação",
        copy_nsec: "Copiar nsec",
      },
      nsec_bunker: {
        title: "Nsec Bunker",
        description: "Usar um bunker NIP-46",
        delete_tooltip: "Excluir conexão",
      },
      use_nsec: {
        title: "Usar seu nsec",
        description: "Este método é perigoso e não recomendado",
        delete_tooltip: "Excluir nsec",
      },
      signing_extension: {
        title: "Extensão de assinatura",
        description: "Usar uma extensão de assinatura NIP-07",
        not_found: "Nenhuma extensão de assinatura NIP-07 encontrada",
      },
    },
    payment_requests: {
      title: "Solicitações de pagamento",
      description:
        "As solicitações de pagamento permitem receber pagamentos via Nostr. Se ativado, sua carteira se inscreverá nos seus relays Nostr.",
      enable_toggle: "Ativar Solicitações de Pagamento",
      claim_automatically: {
        toggle: "Reivindicar automaticamente",
        description: "Receba pagamentos recebidos automaticamente.",
      },
    },
    nostr_wallet_connect: {
      title: "Nostr Wallet Connect (NWC)",
      description:
        "Use NWC para controlar sua carteira a partir de qualquer outro aplicativo.",
      enable_toggle: "Ativar NWC",
      payments_note:
        "Você só pode usar NWC para pagamentos do seu saldo em Bitcoin. Os pagamentos serão feitos a partir do seu mint ativo.",
      connection: {
        copy_tooltip: "Copiar string de conexão",
        qr_tooltip: "Mostrar QR code",
        allowance_label: "Limite restante (sat)",
      },
    },
    hardware_features: {
      webnfc: {
        title: "WebNFC",
        description: "Escolha a codificação para gravar em cartões NFC",
        text: {
          title: "Texto",
          description: "Armazenar token em texto simples",
        },
        weburl: {
          title: "URL",
          description: "Armazenar URL desta carteira com o token",
        },
        binary: {
          title: "Binário",
          description: "Armazenar tokens como dados binários",
        },
        quick_access: {
          toggle: "Acesso rápido ao NFC",
          description:
            "Escaneie rapidamente cartões NFC no menu Receber Ecash. Esta opção adiciona um botão NFC ao menu Receber Ecash.",
        },
      },
    },
    p2pk_features: {
      title: "P2PK",
      description:
        "Gere um par de chaves para receber ecash bloqueado por P2PK. Aviso: Este recurso é experimental. Use apenas com pequenas quantias. Se perder suas chaves privadas, ninguém poderá desbloquear o ecash vinculado a elas.",
      generate_button: "Gerar chave",
      import_button: "Importar nsec",
      quick_access: {
        toggle: "Acesso rápido ao bloqueio",
        description:
          "Use isto para mostrar rapidamente sua chave de bloqueio P2PK no menu de recebimento de ecash.",
      },
      keys_expansion: {
        label: "Clique para ver {count} chaves",
        used_badge: "usada",
      },
    },
    privacy: {
      title: "Privacidade",
      description: "Estas configurações afetam sua privacidade.",
      check_incoming: {
        toggle: "Verificar fatura recebida",
        description:
          "Se ativado, a carteira verificará a última fatura em segundo plano. Isso aumenta a responsividade da carteira, facilitando a identificação. Você pode verificar manualmente as faturas não pagas na aba Faturas.",
      },
      check_startup: {
        toggle: "Verificar faturas pendentes na inicialização",
        description:
          "Se ativado, a carteira verificará faturas pendentes das últimas 24 horas na inicialização.",
      },
      check_all: {
        toggle: "Verificar todas as faturas",
        description:
          "Se ativado, a carteira verificará periodicamente em segundo plano faturas não pagas por até duas semanas. Isso aumenta a atividade online da carteira, facilitando a identificação. Você pode verificar manualmente as faturas não pagas na aba Faturas.",
      },
      check_sent: {
        toggle: "Verificar ecash enviado",
        description:
          "Se ativado, a carteira usará verificações periódicas em segundo plano para determinar se os tokens enviados foram resgatados. Isso aumenta a atividade online da carteira, facilitando a identificação.",
      },
      websockets: {
        toggle: "Usar WebSockets",
        description:
          "Se ativado, a carteira usará conexões WebSocket de longa duração para receber atualizações sobre faturas pagas e tokens gastos dos mints. Isso aumenta a responsividade da carteira, mas também facilita a identificação.",
      },
      bitcoin_price: {
        toggle: "Obter taxa de câmbio da Coinbase",
        description:
          "Se ativado, a taxa de câmbio atual do Bitcoin será obtida de coinbase.com e seu saldo convertido será exibido.",
        currency: {
          title: "Moeda Fiduciária",
          description:
            "Escolha a moeda fiduciária para exibição do preço do Bitcoin.",
        },
      },
    },
    experimental: {
      title: "Experimental",
      description: "Estes recursos são experimentais.",
      receive_swaps: {
        toggle: "Receber swaps",
        badge: "Beta",
        description:
          "Opção para fazer swap do ecash recebido para o seu mint ativo no diálogo Receber Ecash.",
      },
      auto_paste: {
        toggle: "Colar ecash automaticamente",
        description:
          "Colar automaticamente o ecash da sua área de transferência ao pressionar Receber, depois Ecash, depois Colar. A colagem automática pode causar falhas na interface no iOS; desative se tiver problemas.",
      },
      auditor: {
        toggle: "Ativar auditor",
        badge: "Beta",
        description:
          "Se ativado, a carteira exibirá informações do auditor no diálogo de detalhes do mint. O auditor é um serviço de terceiros que monitora a confiabilidade dos mints.",
        url_label: "URL do auditor",
        api_url_label: "URL da API do auditor",
      },
      multinut: {
        toggle: "Ativar Multinut",
        description:
          "Se ativado, a carteira usará o Multinut para pagar faturas de múltiplos mints simultaneamente.",
      },
      nostr_mint_backup: {
        toggle: "Fazer backup da lista de mints no Nostr",
        description:
          "Se ativado, sua lista de mints será automaticamente salva nos relays Nostr usando suas chaves Nostr configuradas. Isso permite restaurar sua lista de mints em outros dispositivos.",
        notifications: {
          enabled: "Backup de mints no Nostr ativado",
          disabled: "Backup de mints no Nostr desativado",
          failed: "Falha ao ativar backup de mints no Nostr",
        },
      },
    },
    appearance: {
      keyboard: {
        title: "Teclado na tela",
        description: "Use o teclado numérico para inserir valores.",
        toggle: "Usar teclado numérico",
        toggle_description:
          "Se ativado, o teclado numérico será usado para inserir valores.",
      },
      theme: {
        title: "Aparência",
        description: "Altere a aparência da sua carteira.",
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
        title: "Símbolo do Bitcoin",
        description: "Usar o símbolo ₿ em vez de sats.",
        toggle: "Usar símbolo ₿",
      },
    },
    web_of_trust: {
      title: "Rede de confiança",
      known_pubkeys: "Chaves públicas conhecidas: {wotCount}",
      continue_crawl: "Continuar varredura",
      crawl_odell: "Varrer a TEIA DE CONFIANÇA DO ODELL",
      crawl_wot: "Varrer teia de confiança",
      pause: "Pausar",
      reset: "Redefinir",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    npub_cash: {
      use_npubx: "Usar npubx.cash",
      copy_lightning_address: "Copiar endereço Lightning",
      v2_mint: "Mint npub.cash v2",
    },
    multinut: {
      use_multinut: "Usar Multinut",
    },
    advanced: {
      title: "Avançado",
      developer: {
        title: "Configurações de desenvolvedor",
        description:
          "As configurações a seguir são para desenvolvimento e depuração.",
        new_seed: {
          button: "Gerar nova frase de recuperação",
          description:
            "Isso gerará uma nova frase de recuperação. Você deve enviar todo o seu saldo para si mesmo para poder restaurá-lo com uma nova frase de recuperação.",
          confirm_question:
            "Tem certeza de que deseja gerar uma nova frase de recuperação?",
          cancel: "Cancelar",
          confirm: "Confirmar",
        },
        remove_spent: {
          button: "Remover provas gastas",
          description:
            "Verifique se os tokens ecash dos seus mints ativos foram gastos e remova os gastos da sua carteira. Use isso somente se sua carteira estiver travada.",
        },
        debug_console: {
          button: "Alternar Console de Depuração",
          description:
            "Abra o terminal de depuração JavaScript. Nunca cole nada neste terminal que você não entenda. Um ladrão pode tentar induzi-lo a colar código malicioso aqui.",
        },
        export_proofs: {
          button: "Exportar provas ativas",
          description:
            "Copie seu saldo completo do mint ativo como um token Cashu para sua área de transferência. Isso exportará apenas os tokens do mint e unidade selecionados. Para uma exportação completa, selecione um mint e unidade diferentes e exporte novamente.",
        },
        keyset_counters: {
          title: "Incrementar contadores de keyset",
          description:
            'Clique no ID do keyset para incrementar os contadores de caminho de derivação dos keysets na sua carteira. Isso é útil se você ver o erro "outputs have already been signed".',
          counter: "contador: {count}",
        },
        unset_reserved: {
          button: "Desmarcar todos os tokens reservados",
          description:
            'Esta carteira marca o ecash sainte pendente como reservado (e o subtrai do seu saldo) para evitar tentativas de gasto duplo. Este botão desmarcará todos os tokens reservados para que possam ser usados novamente. Se fizer isso, sua carteira pode incluir provas gastas. Pressione o botão "Remover provas gastas" para eliminá-las.',
        },
        show_onboarding: {
          button: "Mostrar integração",
          description: "Mostrar a tela de integração novamente.",
        },
        reset_wallet: {
          button: "Redefinir dados da carteira",
          description:
            "Redefina os dados da sua carteira. Aviso: Isso apagará tudo! Certifique-se de criar um backup primeiro.",
          confirm_question:
            "Tem certeza de que deseja excluir os dados da sua carteira?",
          cancel: "Cancelar",
          confirm: "Excluir carteira",
        },
        export_wallet: {
          button: "Exportar dados da carteira",
          description:
            "Baixe um dump da sua carteira. Você pode restaurar sua carteira a partir deste arquivo na tela de boas-vindas de uma nova carteira. Este arquivo ficará desatualizado se você continuar usando a carteira após a exportação.",
        },
        import_wallet: {
          button: "Importar backup da carteira",
          description:
            "Restaure sua carteira a partir de um arquivo de backup exportado anteriormente. Isso substituirá os dados atuais da sua carteira pelo backup.",
          confirm_question:
            "Tem certeza de que deseja restaurar os dados da sua carteira?",
          cancel: "Cancelar",
          confirm: "IMPORTAR BACKUP DA CARTEIRA",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Entre em um mint",
    subtitle:
      "Você ainda não entrou em nenhum mint Cashu. Adicione uma URL de mint nas configurações ou receba ecash de um novo mint para começar.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Receber Ecash",
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
        label: "Histórico",
      },
      invoices: {
        label: "Faturas",
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
  PwaInstallBanner: {
    title: "Adicione o Cashu à tela inicial",
    description: {
      ios: "Toque no ícone de compartilhar no Safari e depois em Adicionar à Tela de Início.",
      android: "Abra o menu do navegador e escolha Adicionar à tela inicial.",
      android_prompt: "Instale o Cashu para acesso mais rápido e tela cheia.",
    },
  },
  AlreadyRunning: {
    title: "Ops.",
    text: "Outra aba já está em execução. Feche esta aba e tente novamente.",
    actions: {
      retry: {
        label: "Tentar novamente",
      },
    },
  },
  ErrorNotFound: {
    title: "404",
    text: "Ops. Nada aqui…",
    actions: {
      home: {
        label: "Voltar ao início",
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
      label: "Erro no mint",
    },
    pending: {
      label: "Pendente",
      tooltip: "Verificar todos os tokens pendentes",
    },
  },
  WelcomePage: {
    actions: {
      previous: {
        label: "Anterior",
      },
      next: {
        label: "Próximo",
      },
    },
  },
  WelcomeSlide1: {
    title: "Bem-vindo ao Cashu",
    text: "Cashu.me é uma carteira Bitcoin gratuita e de código aberto que usa ecash para manter seus fundos seguros e privados.",
    actions: {
      more: {
        label: "Clique para saber mais",
      },
    },
    p1: {
      text: "Cashu é um protocolo de ecash gratuito e de código aberto para Bitcoin. Saiba mais em { link }.",
      link: {
        text: "cashu.space",
      },
    },
    p2: {
      text: "Esta carteira não é afiliada a nenhum mint. Para usá-la, você precisa se conectar a um ou mais mints Cashu em que confia.",
    },
    p3: {
      text: "Esta carteira armazena ecash ao qual somente você tem acesso. Se você excluir os dados do navegador sem um backup da frase de recuperação, perderá seus tokens.",
    },
    p4: {
      text: "Esta carteira está em beta. Não nos responsabilizamos por pessoas que perdem acesso a fundos. Use por sua conta e risco! Este código é de código aberto e licenciado sob a licença MIT.",
    },
  },
  WelcomeSlide2: {
    title: "Instalar PWA",
    alt: {
      pwa_example: "Exemplo de Instalação de PWA",
    },
    installing: "Instalando…",
    instruction: {
      intro: {
        text: "Para a melhor experiência, use esta carteira com o navegador nativo do seu dispositivo para instalá-la como um Aplicativo Web Progressivo.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          item: "1. { icon } { text }",
          text: "Toque no menu (canto superior direito)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Pressione { buttonText }",
          buttonText: "@:AndroidPWAPrompt.buttonText",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          item: "1. { icon } { text }",
          text: "Toque em compartilhar (parte inferior)",
        },
        step2: {
          item: "2. { icon } { text }",
          text: "Pressione { buttonText }",
          buttonText: "@:iOSPWAPrompt.buttonText",
        },
      },
      outro: {
        text: "Após instalar o aplicativo no seu dispositivo, feche esta janela do navegador e use o aplicativo pela tela inicial.",
      },
    },
    pwa: {
      success: {
        title: "Sucesso!",
        text: "Você está usando o Cashu como PWA. Feche qualquer outra janela do navegador aberta e use o aplicativo pela tela inicial.",
        nextSteps:
          "Agora você pode fechar esta aba do navegador e abrir o aplicativo pela tela inicial.",
      },
    },
  },
  iOSPWAPrompt: {
    text: "Toque em { icon } e { buttonText }",
    buttonText: "Adicionar à Tela de Início",
  },
  AndroidPWAPrompt: {
    text: "Toque em { icon } e { buttonText }",
    buttonText: "Adicionar à Tela de Início",
  },
  WelcomeSlide3: {
    title: "Sua Frase de Recuperação",
    text: "Guarde sua frase de recuperação em um gerenciador de senhas ou no papel. Sua frase de recuperação é a única forma de recuperar seus fundos caso perca o acesso a este dispositivo.",
    inputs: {
      seed_phrase: {
        label: "Frase de Recuperação",
        caption: "Você pode ver sua frase de recuperação nas configurações.",
      },
      checkbox: {
        label: "Já a anotei",
      },
    },
  },
  WelcomeSlide4: {
    title: "Termos",
    actions: {
      more: {
        label: "Ler Termos de Serviço",
      },
    },
    inputs: {
      checkbox: {
        label: "Li e aceito estes termos e condições",
      },
    },
  },
  WelcomeSlideChoice: {
    title: "Configure sua carteira",
    text: "Você deseja recuperar a partir de uma frase de recuperação ou criar uma nova carteira?",
    options: {
      new: {
        title: "Criar nova carteira",
        subtitle: "Gerar uma nova frase de recuperação e adicionar mints.",
      },
      recover: {
        title: "Recuperar carteira",
        subtitle: "Digite sua frase de recuperação, restaure mints e ecash.",
      },
    },
  },
  WelcomeMintSetup: {
    title: "Adicionar mints",
    text: "Mints são servidores que ajudam você a enviar e receber ecash. Escolha um mint descoberto ou adicione um manualmente. Pule para adicionar mints depois.",
    sections: {
      your_mints: "Seus mints",
    },
    restoring: "Restaurando mints…",
    placeholder: {
      mint_url: "https://",
    },
  },
  WelcomeRecoverSeed: {
    title: "Digite sua frase de recuperação",
    text: "Cole ou digite sua frase de recuperação de 12 palavras para recuperar.",
    inputs: {
      word: "Palavra { index }",
    },
    actions: {
      paste_all: "Colar tudo",
    },
    disclaimer:
      "Sua frase de recuperação é usada apenas localmente para derivar as chaves da sua carteira.",
  },
  WelcomeRestoreEcash: {
    title: "Restaurar seu ecash",
    text: "Busque provas não gastas nos seus mints configurados e adicione-as à sua carteira.",
  },
  MintRatings: {
    title: "Avaliações do Mint",
    reviews: "avaliações",
    ratings: "Avaliações",
    no_reviews: "Nenhuma avaliação encontrada",
    your_review: "Sua avaliação",
    no_reviews_to_display: "Nenhuma avaliação para exibir.",
    no_rating: "Sem avaliação",
    out_of: "de",
    rows: "Avaliações",
    sort: "Ordenar",
    sort_options: {
      newest: "Mais recente",
      oldest: "Mais antiga",
      highest: "Maior",
      lowest: "Menor",
    },
    actions: {
      write_review: "Escrever uma avaliação",
    },
    empty_state_subtitle:
      "Ajude deixando uma avaliação. Compartilhe sua experiência com este mint e ajude outros deixando uma avaliação.",
  },
  CreateMintReview: {
    title: "Avaliar Mint",
    publishing_as: "Publicando como",
    inputs: {
      rating: { label: "Avaliação" },
      review: { label: "Comentário (opcional)" },
    },
    actions: {
      publish: { label: "Enviar Avaliação", in_progress: "Enviando…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "Restaurar a partir da Frase de Recuperação",
      caption:
        "Digite sua frase de recuperação para restaurar sua carteira. Antes de restaurar, certifique-se de ter adicionado todos os mints que usou anteriormente.",
      inputs: {
        seed_phrase: {
          label: "Frase de recuperação",
          caption: "Você pode ver sua frase de recuperação nas configurações.",
        },
      },
    },
    information: {
      label: "Informação",
      caption:
        "O assistente só restaurará ecash de outra frase de recuperação; você não poderá usar esta frase de recuperação nem alterar a frase de recuperação da carteira que está usando atualmente. Isso significa que o ecash restaurado não estará protegido pela sua frase de recuperação atual enquanto você não o enviar para si mesmo uma vez.",
    },
    restore_mints: {
      label: "Restaurar Mints",
      caption:
        'Selecione o mint para restaurar. Você pode adicionar mais mints na tela principal em "Mints" e restaurá-los aqui.',
    },
    actions: {
      paste: {
        error: "Falha ao ler o conteúdo da área de transferência.",
      },
      validate: {
        error: "O mnemônico não é uma frase de recuperação BIP39 válida.",
      },
      select_all: {
        label: "Selecionar Todos",
      },
      deselect_all: {
        label: "Desselecionar Todos",
      },
      restore: {
        label: "Restaurar",
        in_progress: "Restaurando mint …",
        error: "Erro ao restaurar mint: { error }",
      },
      restore_all_mints: {
        label: "Restaurar Todos os Mints",
        in_progress: "Restaurando mint { index } de { length } …",
        success: "Restauração concluída com sucesso",
        error: "Erro ao restaurar mints: { error }",
      },
      restore_selected_mints: {
        label: "Restaurar Mints Selecionados ({count})",
        in_progress: "Restaurando mint { index } de { length } …",
        success: "Restaurado(s) com sucesso {count} mint(s)",
        error: "Erro ao restaurar mints selecionados: { error }",
      },
    },
    nostr_mints: {
      label: "Restaurar Mints do Nostr",
      caption:
        "Busque backups de mints armazenados nos relays Nostr usando sua frase de recuperação. Isso ajudará você a buscar os mints que usou anteriormente.",
      search_button: "Buscar Backups de Mints",
      select_all: "Selecionar Todos",
      deselect_all: "Desselecionar Todos",
      backed_up: "Com backup",
      already_added: "Já adicionado",
      add_selected: "Adicionar Selecionados ({count})",
      no_backups_found: "Nenhum backup de mint encontrado",
      no_backups_hint:
        "Certifique-se de que o backup de mints no Nostr está ativado nas configurações para fazer backup automático da sua lista de mints.",
      invalid_mnemonic:
        "Por favor, insira uma frase de recuperação válida antes de buscar.",
      search_error: "Falha ao buscar backups de mints.",
      add_error: "Falha ao adicionar os mints selecionados.",
    },
  },
  MintSettings: {
    add: {
      title: "Adicionar mint",
      description:
        "Digite a URL de um mint Cashu para se conectar. Esta carteira não é afiliada a nenhum mint.",
      inputs: {
        nickname: {
          placeholder: "Apelido (ex.: Testnet)",
        },
      },
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "URL inválida",
        },
        scan: {
          label: "Escanear QR Code",
        },
      },
    },
    discover: {
      title: "Buscar mints",
      overline: "Buscar",
      caption: "Descubra mints que outros usuários recomendaram no Nostr.",
      actions: {
        discover: {
          label: "Buscar mints",
          in_progress: "Carregando…",
          error_no_mints: "Nenhum mint encontrado",
          success: "Encontrado(s) { length } mint(s)",
        },
      },
      recommendations: {
        overline: "Encontrado(s) { length } mint(s)",
        caption:
          "Esses mints foram recomendados por outros usuários do Nostr. Tome cuidado e faça sua própria pesquisa antes de usar um mint.",
        actions: {
          browse: {
            label: "Clique para ver os mints",
          },
        },
      },
    },
    swap: {
      title: "Swap",
      overline: "Swap Multi-mint",
      actions: {
        receove_to_trusted_mint: {
          label: "Receber para mint confiável",
        },
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
      },
      caption:
        "Faça swap de fundos entre mints via Lightning. Nota: Deixe margem para possíveis taxas Lightning. Se o pagamento recebido não for bem-sucedido, verifique a fatura manualmente.",
      inputs: {
        from: {
          label: "De",
        },
        to: {
          label: "Para",
        },
        amount: {
          label: "Valor ({ ticker })",
        },
      },
    },
    error_badge: "Erro",
    reviews_text: "avaliações",
    no_reviews_yet: "Ainda sem avaliações",
    discover_mints_button: "Buscar mints",
  },
  QrcodeReader: {
    progress: {
      text: "{ percentage }{ addon }",
      percentage: "{ percentage }%",
      keep_scanning_text: " - Continue escaneando",
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
    title: "Receber Lightning",
    create_invoice_title: "Criar Fatura",
    inputs: {
      amount: {
        label: "Valor ({ ticker }) *",
      },
    },
    actions: {
      close: {
        label: "@:global.actions.close.label",
      },
      create: {
        label: "Criar Fatura",
        label_blocked: "Criando fatura…",
        in_progress: "Criando",
      },
    },
    invoice: {
      caption: "Fatura Lightning",
      status_paid_text: "Pago!",
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
        error_no_mints: "Nenhum mint disponível",
      },
      lightning: {
        label: "Lightning",
        error_no_mints: "Nenhum mint disponível",
      },
    },
  },
  SendTokenDialog: {
    title: "Enviar Ecash",
    title_ecash_text: "Ecash",
    badge_offline_text: "Offline",
    inputs: {
      amount: {
        label: "Valor ({ ticker }) *",
        invalid_too_much_error_text: "Valor muito alto",
      },
      p2pk_pubkey: {
        label: "Chave pública do destinatário",
        label_invalid: "Chave pública do destinatário",
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
        tooltip_text: "Copiar link",
      },
      share: {
        tooltip_text: "Compartilhar ecash",
      },
      lock: {
        label: "@:global.actions.lock.label",
      },
      paste_p2pk_pubkey: {
        tooltip_text: "@:global.actions.paste.label",
      },
      pay: {
        label: "@:global.actions.pay.label",
      },
      send: {
        label: "@:global.actions.send.label",
      },
      delete: {
        tooltip_text: "Excluir do histórico",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "Gravar no cartão NFC",
          ndef_unsupported_text: "NDEF não suportado",
        },
      },
    },
    errors: {
      amount_required: "Insira um valor primeiro.",
      serialization_failed: "Não foi possível preparar o token ecash.",
      mint_not_allowed_by_request:
        "O mint selecionado não é aceito por esta solicitação de pagamento.",
    },
  },
  SendPaymentRequest: {
    actions: {
      pay: {
        label: "Pagar",
      },
      pay_via: {
        label: "Pagar via {transport}",
      },
    },
    info: {
      pay_to: "Pagar para {target}",
      invalid_url: "URL inválida",
    },
  },
  PaymentRequestInfo: {
    title_with_transport: "Solicitação de pagamento via {transport}",
    title: "Solicitação de pagamento",
    subtitle: "Pagar para {target}",
    subtitle_fallback: "Solicitação de pagamento",
    invalid_url: "URL inválida",
  },
  ReceiveDialog: {
    title: "Receber",
    actions: {
      ecash: {
        label: "Ecash",
        error_no_mints: "Nenhum mint disponível",
      },
      lightning: {
        label: "Lightning",
        error_no_mints:
          "Você precisa se conectar a um mint para receber via Lightning",
      },
    },
  },
  ReceiveEcashDrawer: {
    title: "Receber Ecash",
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
    title: "Receber Ecash",
    title_ecash_text: "Ecash",
    inputs: {
      tokens_base64: {
        label: "Colar token Cashu",
      },
    },
    errors: {
      invalid_token: {
        label: "Token inválido",
      },
      p2pk_lock_mismatch: {
        label:
          "Não foi possível receber. O bloqueio P2PK deste token não corresponde à sua chave pública.",
      },
    },
    unknown_mint_info_text:
      "Mint desconhecido. Será adicionado após você receber este token.",
    swap_section: {
      title: "Swap",
      source_label: "De",
      destination_label: "Para",
      fee_info: "Este swap incorrerá em taxas da rede Lightning.",
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
        label_adding_mint: "Adicionando mint…",
      },
      swap: {
        label: "Receber para mint confiável",
        tooltip_text: "Swap para um mint confiável",
        caption: "Swap { value }",
        processing: "Processando swap...",
        failed: "Swap falhou",
      },
      cancel_swap: {
        label: "@:global.actions.cancel.label",
        tooltip_text: "Cancelar swap",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
        in_progress: "@:ReceiveTokenDialog.actions.confirm_swap.label",
      },
      receive_to_selected_mint: {
        label: "Receber para o mint selecionado",
      },
      later: {
        label: "Receber depois",
        tooltip_text: "Adicionar ao histórico para receber depois",
        already_in_history_success_text: "Ecash já está no Histórico",
        added_to_history_success_text: "Ecash adicionado ao Histórico",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Ler do cartão NFC",
          ndef_unsupported_text: "NDEF não suportado",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "Chave P2PK",
      description: "Receber ecash bloqueado a esta chave",
      used_warning_text:
        "Aviso: Esta chave já foi usada. Use uma nova chave para melhor privacidade.",
    },
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_key: {
        label: "Gerar nova chave",
      },
    },
  },
  PaymentRequestDialog: {
    payment_request: {
      caption: "Solicitação de Pagamento",
      description: "Receba pagamentos via Nostr",
    },
    received_total: "Total recebido",
    no_payments_yet: "Nenhum pagamento ainda",
    actions: {
      copy: {
        label: "@:global.actions.copy.label",
      },
      close: {
        label: "@:global.actions.close.label",
      },
      new_request: {
        label: "Nova solicitação",
      },
      add_amount: {
        label: "Adicionar valor",
      },
      use_active_mint: {
        label: "Qualquer mint",
      },
    },
    inputs: {
      amount: {
        placeholder: "Digite o valor",
      },
    },
  },
  NumericKeyboard: {
    actions: {
      close: {
        label: "@:global.actions.close.label",
        closed_info_text:
          "Teclado desativado. Você pode reativar o teclado nas configurações.",
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
        "Controle sua carteira remotamente com NWC. Pressione o QR code para vincular sua carteira a um aplicativo compatível.",
      warning_text:
        "Aviso: qualquer pessoa com acesso a esta string de conexão pode iniciar pagamentos da sua carteira. Não compartilhe!",
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
    title: "Mensagem do Mint",
  },
  MintDetailsDialog: {
    contact: {
      title: "Contato",
    },
    details: {
      title: "Detalhes do mint",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Nuts",
        actions: {
          show: {
            label: "Ver todos",
          },
          hide: {
            label: "Ocultar",
          },
        },
      },
      currency: {
        label: "Moeda",
      },
      currencies: {
        label: "@:MintDetailsDialog.details.currency.label",
      },
      version: {
        label: "Versão",
      },
    },
    actions: {
      title: "Ações",
      copy_mint_url: {
        label: "Copiar URL do mint",
      },
      delete: {
        label: "Excluir mint",
      },
      edit: {
        label: "Editar mint",
      },
    },
  },
  ChooseMint: {
    title: "Selecione um mint",
    placeholder: "Selecione um mint",
    available_text: "disponível",
    sheet_title: "Selecionar Mint",
    badge_mint_error_text: "Erro",
    badge_option_mint_error_text: "@:ChooseMint.badge_mint_error_text",
  },
  HistoryTable: {
    empty_text: "Nenhum histórico ainda",
    row: {
      type_label: "Ecash",
      date_label: "há { value }",
    },
    actions: {
      check_status: {
        tooltip_text: "Verificar status",
      },
      receive: {
        tooltip_text: "Receber",
      },
      filter_pending: {
        label: "Filtrar pendentes",
      },
      show_all: {
        label: "Mostrar todos",
      },
    },
    old_token_not_found_error_text: "Token antigo não encontrado",
  },
  InvoiceTable: {
    empty_text: "Nenhuma fatura ainda",
    row: {
      type_label: "Lightning",
      type_tooltip_text: "Clique para copiar",
      date_label: "há { value }",
    },
    actions: {
      check_status: {
        tooltip_text: "Verificar status",
      },
      filter_pending: {
        label: "Filtrar pendentes",
      },
      show_all: {
        label: "Mostrar todos",
      },
    },
  },
  RemoveMintDialog: {
    title: "Tem certeza de que deseja excluir este mint?",
    nickname: {
      label: "Apelido",
    },
    balances: {
      label: "Saldos",
    },
    warning_text:
      "Nota: Como esta carteira é precavida, seu ecash deste mint não será realmente excluído, mas permanecerá armazenado no seu dispositivo. Você o verá reaparecer se adicionar novamente este mint.",
    inputs: {
      mint_url: {
        label: "@:global.inputs.mint_url.label",
      },
    },
    actions: {
      confirm: {
        label: "Remover mint",
      },
      cancel: {
        label: "@:global.actions.cancel.label",
      },
    },
  },
  ParseInputComponent: {
    placeholder: {
      default: "Token Cashu ou endereço Lightning",
      receive: "Token Cashu",
      pay: "Endereço Lightning ou fatura",
    },
    qr_scanner: {
      title: "Escanear QR Code",
      description: "Toque para escanear um endereço",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    input_data: {
      title: "Pagar Lightning",
      inputs: {
        invoice_data: {
          label: "Fatura ou endereço Lightning",
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
        "{ payee } está solicitando{br}entre { min } e { max } { ticker }",
      sending_to_lightning_address: "Enviando para { address }",
      inputs: {
        amount: {
          label: "Valor ({ ticker }) *",
        },
        comment: {
          label: "Comentário (opcional)",
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
      paid: "Pago",
      fee: "Taxa",
      memo: {
        label: "Memo",
      },
      processing_info_text: "Processando…",
      balance_too_low_warning_text: "Saldo insuficiente",
      actions: {
        close: {
          label: "@:global.actions.close.label",
        },
        pay: {
          label: "Pagar",
          in_progress: "@:PayInvoiceDialog.invoice.processing_info_text",
          error: "Erro",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Editar mint",
    inputs: {
      nickname: {
        label: "Apelido",
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
    title: "Você confia neste mint?",
    description:
      "Antes de usar este mint, certifique-se de que confia nele. Os mints podem se tornar maliciosos ou encerrar as operações a qualquer momento.",
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
        in_progress: "Adicionando mint",
      },
    },
  },
  restore: {
    mnemonic_error_text: "Por favor, insira um mnemônico",
    restore_mint_error_text: "Erro ao restaurar mint: { error }",
    prepare_info_text: "Preparando processo de restauração …",
    restored_proofs_for_keyset_info_text:
      "Restaurado(s) { restoreCounter } prova(s) para o keyset { keysetId }",
    checking_proofs_for_keyset_info_text:
      "Verificando provas { startIndex } a { endIndex } para o keyset { keysetId }",
    no_proofs_info_text: "Nenhuma prova encontrada para restaurar",
    restored_amount_success_text: "Restaurado { amount }",
  },
  swap: {
    in_progress_warning_text: "Swap em andamento",
    invalid_swap_data_error_text: "Dados de swap inválidos",
    swap_error_text: "Erro no swap",
  },
  TokenInformation: {
    fee: "Taxa",
    unit: "Unidade",
    fiat: "Moeda fiduciária",
    p2pk: "P2PK",
    locked: "Bloqueado",
    locked_to_you: "Bloqueado para você",
    mint: "Mint",
    memo: "Memo",
    payment_request: "Solicitação de pagamento",
    nostr: "Nostr",
    token_copied: "Token copiado para a área de transferência",
  },
};
