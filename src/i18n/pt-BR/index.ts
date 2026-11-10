export default {
  global: {
    notifications: "Notificações",
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
      show_qr: {
        label: "Mostrar QR code",
      },
      show_seed: {
        label: "Mostrar frase de recuperação",
      },
      hide_seed: {
        label: "Ocultar frase de recuperação",
      },
      scan: {
        label: "Escanear",
      },
      more_options: {
        label: "Mais opções",
      },
      clear: {
        label: "Limpar",
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
    },
    inputs: {
      mint_url: {
        label: "URL do mint",
      },
    },
  },
  ActivityRow: {
    received: "Recebido",
    sent: "Enviado",
    receiving: "Recebendo",
    sending: "Enviando",
  },
  common: {
    copied: "Copiado",
    on_chain: "On-chain",
    pending: "Pendente",
    delete: "Excluir",
    copy_npub: "Copiar npub",
    back: "Voltar",
    refresh: "Atualizar",
    settings: "Configurações",
    backspace: "Apagar",
    enter_amount_in: "Inserir valor em {fiat}",
    something_went_wrong: "Algo deu errado",
  },
  MultinutPicker: {
    dialog_title: "Pagamento com vários mints",
    pay_using_multiple: "Pagar usando vários mints",
    experimental_title: "Recurso experimental",
    experimental_text:
      "Este recurso é altamente experimental e pode não funcionar como esperado. Não tente pagar uma fatura que já foi paga. Você pode perder fundos.",
    understand: "Entendi",
    select_funds: "Escolha com quais mints pagar.",
    pay_invoice: "Pagar fatura",
    amount_mismatch: "Erro no cálculo do valor: {calculated} vs {expected}",
    states: {
      requesting: "Solicitando…",
      paying: "Pagando…",
      success: "Sucesso",
      failed: "Falhou",
    },
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
      trying_again: "Tentando novamente...",
      no_bolt12_mint: "Nenhum dos seus mints aceita ofertas BOLT12",
      no_bolt11_mint: "Nenhum dos seus mints aceita faturas BOLT11",
      address_not_paid: "Nenhum pagamento recebido neste endereço ainda",
      payment_pending: "Pagamento pendente",
      invoice_already_paid: "Fatura já paga",
      payment_sent: "Pagamento enviado",
      payment_failed: "Falha no pagamento",
      could_not_pay_request: "Não foi possível pagar a solicitação",
      request_unit_unsupported:
        "O mint não suporta a unidade desta solicitação de pagamento: {unit}",
      no_onchain_mint: "Nenhum dos seus mints suporta pagamentos on-chain",
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
        mint_validation_error: "Erro de validação do mint",
        removed: "Mint removido",
        error: "Erro no mint",
      },
    },
  },
  MainHeader: {
    menu: {
      terms: {
        terms: {
          title: "Termos",
          caption: "O que você aceita ao usar o Cashu.me",
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
  Settings: {
    menu: {
      title: "Configurações",
      backup: {
        title: "Backup e restauração",
        caption: "Frase semente e recuperação de ecash",
      },
      lightning_address: {
        title: "Endereço Lightning",
        caption: "Receba pagamentos em nome{'@'}dominio",
      },
      nostr: {
        title: "Nostr",
        caption: "Chaves, relays e rede de confiança",
      },
      payment_requests: {
        title: "Solicitações de pagamento",
        caption: "Receba pagamentos em ecash pelo Nostr",
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
        title: "Ecash bloqueado",
        caption: "Receba ecash bloqueado à sua chave",
      },
      privacy: {
        title: "Privacidade",
        caption: "Verificações de rede e preço do bitcoin",
      },
      experimental: {
        title: "Experimental",
        caption: "Experimente novos recursos antes",
      },
      appearance: {
        title: "Aparência",
        caption: "Tema, teclado e símbolo do bitcoin",
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
    },
    sections: {
      nostr: {
        relays: {
          already_added: "Relay já adicionado",
          add: {
            title: "Adicionar relay",
            description:
              "Sua carteira usa estes relays para recursos do Nostr, como solicitações de pagamento, Nostr Wallet Connect e backups.",
          },
          list: {
            title: "Relays",
            copy_tooltip: "Copiar relay",
            remove_tooltip: "Remover relay",
          },
        },
      },
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
          "Recupere ecash de outra frase de recuperação. Sua frase atual não muda.",
      },
    },
    lightning_address: {
      server_url: {
        label: "Servidor npub.cash",
        hint: "Insira um nome de host ou URL HTTPS",
        invalid: "Insira uma URL de servidor HTTPS válida",
      },
      title: "Endereço Lightning",
      enable: {
        toggle: "Usar um endereço Lightning",
        description: "Receba pagamentos em um endereço do npub.cash",
      },
      address: {
        label: "Seu endereço",
        copy_tooltip: "Copiar endereço Lightning",
      },
      show_on_receive: {
        toggle: "Mostrar ao receber",
        description: "Mostrar endereço e código QR.",
      },
      automatic_claim: {
        toggle: "Reivindicar automaticamente",
        description: "Receba pagamentos recebidos automaticamente.",
      },
      mint: {
        label: "Mint npub.cash",
        choose_title: "Escolha o mint para npub.cash",
        choose_placeholder: "Selecione um mint...",
      },
    },
    nostr_keys: {
      title: "Suas chaves Nostr",
      description: "Suas chaves Nostr definem seu endereço Lightning.",
      wallet_seed: {
        title: "Frase de recuperação da carteira",
        description:
          "Gerar um par de chaves Nostr a partir da frase de recuperação da sua carteira",
        copy_nsec: "Copiar chave privada (nsec)",
      },
      nsec_bunker: {
        title: "Assinador remoto",
        description: "Assinar com um bunker NIP-46",
        delete_tooltip: "Excluir conexão",
      },
      use_nsec: {
        title: "Usar sua chave privada Nostr (nsec)",
        description: "Este método é perigoso e não recomendado",
        delete_tooltip: "Excluir chave privada",
      },
      signing_extension: {
        title: "Extensão de assinatura",
        description: "Usar uma extensão de assinatura NIP-07",
        not_found: "Nenhuma extensão de assinatura NIP-07 encontrada",
      },
    },
    payment_requests: {
      description:
        "Receba pagamentos pelo Nostr. Quando ativado, sua carteira escuta seus relays Nostr.",
      enable_toggle: "Ativar solicitações de pagamento",
      claim_automatically: {
        toggle: "Reivindicar automaticamente",
        description:
          "Adiciona ao seu saldo, sem perguntar, os pagamentos recebidos de mints que você já usa. Nos outros casos, você confirma cada um.",
      },
    },
    nostr_wallet_connect: {
      description:
        "Permite que outros apps paguem com esta carteira, criem faturas e vejam seu saldo e histórico pelo Nostr Wallet Connect (NWC).",
      enable_toggle: "Ativar Nostr Wallet Connect",
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
        title: "Formato do cartão NFC",
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
          description: "Armazenar o token como dados binários",
        },
        quick_access: {
          toggle: "Acesso rápido ao NFC",
          description:
            "Adiciona um botão NFC à tela Receber ecash para ler cartões.",
        },
      },
    },
    p2pk_features: {
      description:
        "Gere ou importe uma chave para receber ecash bloqueado (P2PK). Experimental: use valores pequenos. Se você perder a chave privada, pode perder o acesso ao ecash bloqueado a ela.",
      generate_button: "Gerar chave",
      import_button: "Importar chave privada (nsec)",
      quick_access: {
        toggle: "Mostrar o botão Bloquear em Receber ecash",
        description:
          "Adiciona um botão Bloquear a Receber ecash. Abra-o para compartilhar sua chave pública, para que remetentes possam bloquear ecash para você.",
      },
      keys_expansion: {
        label: "Chaves públicas ({count})",
        used_badge: "usada",
      },
    },
    privacy: {
      network_title: "Verificações de rede",
      description: "Estas configurações afetam sua privacidade.",
      check_incoming: {
        toggle: "Verificar fatura recebida",
        description:
          "Verifica sua fatura mais recente em segundo plano. Atualizações mais rápidas, mas mais fácil de rastrear. Quando desativado, verifique você mesmo as faturas em Histórico.",
      },
      check_startup: {
        toggle: "Verificar faturas pendentes na inicialização",
        description: "Verifica faturas pendentes quando a carteira abre.",
      },
      check_all: {
        toggle: "Verificar todas as faturas",
        description:
          "Verifica faturas não pagas em segundo plano por até duas semanas. Mais atividade online deixa você mais fácil de rastrear. Quando desativado, verifique você mesmo as faturas em Histórico.",
      },
      check_sent: {
        toggle: "Verificar ecash enviado",
        description:
          "Verifica em segundo plano se o ecash enviado foi resgatado. Mais atividade online deixa você mais fácil de rastrear.",
      },
      websockets: {
        toggle: "Usar WebSockets",
        description:
          "Mantém uma conexão ao vivo com os mints para atualizações sobre pagamentos e ecash gasto. Mais rápido, mas mais fácil de rastrear.",
      },
      bitcoin_price: {
        title: "Preço do bitcoin",
        toggle: "Obter taxa de câmbio da Coinbase",
        description:
          "Busca o preço do bitcoin em coinbase.com para mostrar seu saldo em moeda fiduciária.",
        currency: {
          title: "Moeda fiduciária",
          description: "Escolha a moeda fiduciária para o preço do bitcoin.",
        },
      },
    },
    experimental: {
      receive_swaps: {
        toggle: "Receber swaps",
        badge: "Beta",
        description: "Oferece trocar o ecash recebido para o seu mint ativo.",
      },
      auto_paste: {
        toggle: "Colar ecash automaticamente",
        description:
          "Cola o ecash da área de transferência ao tocar em Colar token. Desative se causar falhas visuais no iOS.",
      },
      auditor: {
        toggle: "Ativar auditor",
        badge: "Beta",
        description:
          "Mostra nos detalhes do mint dados de confiabilidade de um auditor de mints independente.",
        url_label: "URL do auditor",
        api_url_label: "URL da API do auditor",
      },
      multinut: {
        description:
          "Adiciona a opção “Pagar com vários mints” ao pagar uma fatura Lightning.",
      },
      nostr_mint_backup: {
        toggle: "Fazer backup da lista de mints no Nostr",
        description:
          "Faz backup da sua lista de mints nos seus relays Nostr para você restaurá-la em outro dispositivo.",
        notifications: {
          enabled: "Backup de mints no Nostr ativado",
          disabled: "Backup de mints no Nostr desativado",
          failed: "Falha ao ativar backup de mints no Nostr",
        },
      },
    },
    appearance: {
      mode: {
        title: "Modo",
        dark: "Escuro",
        light: "Claro",
      },
      keyboard: {
        title: "Teclado na tela",
        toggle: "Usar teclado numérico",
        toggle_description: "Usa o teclado numérico para digitar valores.",
      },
      theme: {
        title: "Tema",
        description: "Altere a aparência da sua carteira.",
        tooltips: {
          mono: "Mono",
          cyber: "Cyber",
          freedom: "Liberdade",
          nostr: "Nostr",
          bitcoin: "Bitcoin",
          mint: "Menta",
          nut: "Noz",
          blu: "Azul",
          flamingo: "Flamingo",
        },
      },
      bip177: {
        title: "Símbolo do Bitcoin",
        description: "Mostrar valores como ₿2.789 em vez de 2.789 sats.",
        toggle: "Usar símbolo ₿",
      },
    },
    web_of_trust: {
      title: "Rede de confiança",
      known_pubkeys: "Chaves públicas conhecidas: {wotCount}",
      continue_crawl: "Continuar varredura",
      crawl_odell: "Varrer a rede de confiança do Odell",
      crawl_wot: "Varrer teia de confiança",
      pause: "Pausar",
      reset: "Redefinir",
      progress: "{crawlProcessed} / {crawlTotal}",
    },
    multinut: {
      use_multinut: "Pagamentos com vários mints",
    },
    advanced: {
      backup_files_title: "Arquivos de backup",
      danger_zone_title: "Zona de perigo",
      notifications: {
        reserved_unset: "Todas as reservas de provas foram liberadas",
        removed_spent: "Provas gastas removidas: {count}",
        no_spent: "Nenhuma prova gasta encontrada",
        invalid_backup: "Formato de arquivo de backup inválido",
        read_error: "Erro ao ler o arquivo",
      },
      developer: {
        title: "Configurações de desenvolvedor",
        description: "Ferramentas para solução de problemas e depuração.",
        new_seed: {
          button: "Gerar nova frase de recuperação",
          description:
            "Cria uma nova frase de recuperação. Seu ecash atual continua ligado à antiga: depois, envie todo o seu saldo para você mesmo, ou a nova frase não poderá restaurá-lo.",
          confirm_question:
            "Tem certeza de que deseja gerar uma nova frase de recuperação?",
          cancel: "Cancelar",
          confirm: "Confirmar",
        },
        remove_spent: {
          button: "Remover provas gastas",
          description:
            "Remove o ecash que o mint ativo informa como gasto, na unidade selecionada. Use apenas se sua carteira travar.",
        },
        design_system: {
          title: "Sistema de design",
          description:
            "Cada componente do app, ao vivo, com seu código-fonte e exemplos de uso.",
        },
        debug_console: {
          button: "Console de depuração",
          description:
            "Abre o console JavaScript. Nunca cole código que você não entende; golpistas usam isso para roubar fundos.",
        },
        export_proofs: {
          button: "Exportar provas ativas",
          description:
            "Copia para a área de transferência o saldo do mint ativo na unidade selecionada como um único token de ecash. Troque de mint ou de unidade e exporte de novo para o restante.",
        },
        keyset_counters: {
          title: "Incrementar contadores de keyset",
          increase: "Aumentar o contador de {id}",
          fixes: "Pode ajudar a resolver “outputs have already been signed”",
          keysets: "{n} keyset | {n} keysets",
          sheet_hint: "Toque em + para aumentar o contador de um keyset.",
          column: "Contador",
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
            "Baixa um arquivo de backup que você pode importar na tela de boas-vindas. Ele fica desatualizado assim que você usa a carteira de novo.",
        },
        import_wallet: {
          button: "Importar backup da carteira",
          description:
            "Importa um arquivo de backup exportado. As configurações e os registros do backup substituem os desta carteira; o que não estiver no backup é mantido.",
          confirm_question: "Importar este backup para a carteira?",
          cancel: "Cancelar",
          confirm: "Importar backup da carteira",
        },
      },
    },
  },
  NoMintWarnBanner: {
    title: "Adicionar um mint",
    subtitle:
      "Mints emitem o ecash que esta carteira guarda. Adicione um mint, ou receba ecash de um, para começar.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
      },
      receive: {
        label: "Receber ecash",
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
      expand: "Mostrar histórico e mints",
      collapse: "Ocultar histórico e mints",
    },
    tabs: {
      history: {
        label: "Histórico",
      },
      mints: {
        label: "Mints",
      },
    },
    install: {
      text: "Instalar",
      tooltip: "Instalar Cashu.me",
    },
  },
  AlreadyRunning: {
    title: "O Cashu.me está aberto em outra aba",
    text: "Feche a outra aba e toque em Tentar novamente.",
    actions: {
      retry: {
        label: "Tentar novamente",
      },
    },
  },
  ErrorNotFound: {
    title: "Esta página não existe",
    text: "404",
    actions: {
      home: {
        label: "Voltar ao início",
      },
    },
  },
  BalanceView: {
    total_label: "Saldo total",
    show_balance: "Mostrar saldo em {unit}",
    mintError: {
      label: "Erro no mint",
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
    terms_agreement: "Ao continuar, você concorda com os {terms}",
    title: "Boas-vindas ao Cashu.me",
    text: "Cashu.me é uma carteira Bitcoin gratuita e de código aberto que usa ecash para manter seus fundos seguros e privados.",
  },
  WelcomeSlide2: {
    title: "Instale o Cashu.me",
    alt: {
      pwa_example: "Exemplo de instalação do PWA",
    },
    installing: "Instalando…",
    instruction: {
      intro: {
        text: "Para a melhor experiência, use esta carteira com o navegador nativo do seu dispositivo para instalá-la como um Aplicativo Web Progressivo.",
      },
      android: {
        title: "Android (Chrome)",
        step1: {
          text: "Toque no menu (canto superior direito)",
        },
        step2: {
          text: "Pressione { buttonText }",
          buttonText: "@:PwaPrompt.android.add",
        },
      },
      ios: {
        title: "iOS (Safari)",
        step1: {
          text: "Toque em compartilhar (parte inferior)",
        },
        step2: {
          text: "Pressione { buttonText }",
          buttonText: "@:PwaPrompt.ios.add",
        },
      },
      outro: {
        text: "Depois de instalar, feche esta aba do navegador e abra o Cashu.me pela tela inicial.",
      },
    },
    pwa: {
      success: {
        title: "Sucesso!",
        text: "Você está usando o Cashu.me como PWA. Feche qualquer outra janela do navegador aberta e use o aplicativo pela tela inicial.",
        nextSteps:
          "Agora você pode fechar esta aba do navegador e abrir o aplicativo pela tela inicial.",
      },
    },
  },
  PwaPrompt: {
    title: "Instalar Cashu.me",
    text: "Abre pela tela de início, sem a barra do navegador.",
    ios: {
      share: "Toque em Compartilhar",
      add: "Adicionar à Tela de Início",
    },
    android: {
      menu: "Abra o menu do navegador",
      add: "Adicionar à Tela de Início",
    },
    install: "Instalar",
    notNow: "Agora não",
  },
  WelcomeSlide3: {
    title: "Sua frase de recuperação",
    text: "Guarde sua frase de recuperação em um gerenciador de senhas ou no papel. Sua frase de recuperação é a única forma de recuperar seus fundos caso perca o acesso a este dispositivo.",
    inputs: {
      seed_phrase: {
        label: "Frase de recuperação",
        caption: "Você pode ver sua frase de recuperação nas configurações.",
      },
      checkbox: {
        label: "Já a anotei",
      },
    },
  },
  WelcomeSlide4: {
    english_only: "O texto legal está disponível apenas em inglês.",
    title: "Termos de Serviço",
    actions: {
      more: {
        label: "Leia antes de usar o Cashu.me",
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
    progress: { words_entered: "{count}/12 palavras inseridas" },
    disclaimer:
      "Sua frase de recuperação é usada apenas localmente para derivar as chaves da sua carteira.",
  },
  WelcomeRestoreEcash: {
    title: "Restaurar seu ecash",
    text: "Encontre ecash não gasto nos mints que você adicionou e restaure-o na sua carteira.",
  },
  MintRatings: {
    sort_and_filter: "Ordenar e filtrar",
    reviews_title: "Avaliações",
    reviews_count: "{n} avaliação | {n} avaliações",
    web_of_trust_caption: "Mostrar apenas avaliações da sua rede de confiança",
    web_of_trust_hop: "Na sua rede de confiança (salto {hop})",
    no_mint_url: "Nenhuma URL de mint fornecida",
    reviews: "avaliações",
    no_reviews: "Nenhuma avaliação encontrada",
    your_review: "Sua avaliação",
    no_rating: "Sem avaliação",
    stars_label: "{rating} de 5 estrelas",
    out_of: "de {max}",
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
      "Compartilhe sua experiência com este mint para ajudar outras pessoas a escolher.",
    range: "{from}–{to} de {total}",
  },
  CreateMintReview: {
    connect_nostr:
      "Conecte uma conta Nostr nas Configurações para publicar uma avaliação.",
    published: "Avaliação publicada",
    publish_failed: "Falha ao publicar avaliação",
    title: "Avaliar mint",
    publishing_as: "Publicando como:",
    inputs: {
      rating: {
        label: "Avaliação",
        hint: "Escolha uma nota para publicar sua avaliação.",
      },
      review: { label: "Comentário (opcional)" },
    },
    actions: {
      publish: { label: "Publicar avaliação", in_progress: "Publicando…" },
    },
  },
  RestoreView: {
    seed_phrase: {
      label: "Restaurar pela frase de recuperação",
      caption:
        "Adicione todos os mints que você usou com esta frase de recuperação antes de restaurar.",
      inputs: {
        seed_phrase: {
          label: "Frase de recuperação",
        },
      },
    },
    information: {
      caption:
        "O assistente só restaurará ecash de outra frase de recuperação; você não poderá usar esta frase de recuperação nem alterar a frase de recuperação da carteira que está usando atualmente. Isso significa que o ecash restaurado não estará protegido pela sua frase de recuperação atual enquanto você não o enviar para si mesmo uma vez.",
    },
    restore_mints: {
      label: "Restaurar mints",
      caption:
        "Escolha os mints para restaurar. Adicione os que faltam na aba Mints primeiro.",
    },
    actions: {
      paste: {
        error: "Falha ao ler o conteúdo da área de transferência.",
      },
      validate: {
        error: "O mnemônico não é uma frase de recuperação BIP39 válida.",
      },
      select_all: {
        label: "Selecionar tudo",
      },
      deselect_all: {
        label: "Desmarcar tudo",
      },
      restore: {
        label: "Restaurar",
        error: "Erro ao restaurar mint: { error }",
      },
      restore_selected_mints: {
        label: "Restaurar mints selecionados ({count})",
        success: "Mints restaurados: {count}",
        error: "Erro ao restaurar mints selecionados: { error }",
      },
    },
    nostr_mints: {
      label: "Restaurar mints do Nostr",
      caption:
        "Busque backups de mints armazenados nos relays Nostr usando sua frase de recuperação. Isso ajudará você a buscar os mints que usou anteriormente.",
      search_button: "Buscar backups de mints",
      select_all: "Selecionar tudo",
      deselect_all: "Desmarcar tudo",
      backed_up: "Com backup",
      add_selected: "Adicionar selecionados ({count})",
      no_backups_found: "Nenhum backup de mint encontrado",
      no_backups_hint:
        "Uma lista de mints só pode ser restaurada de um backup feito antes com esta frase de recuperação. Ative o backup de mints no Nostr em Configurações para salvar as próximas alterações.",
      invalid_mnemonic:
        "Por favor, insira uma frase de recuperação válida antes de buscar.",
      search_error: "Falha ao buscar backups de mints.",
      add_error: "Falha ao adicionar os mints selecionados.",
    },
  },
  MintSettings: {
    see_reviews: "Ver avaliações",
    add: {
      title: "Adicionar mint",
      description:
        "Digite a URL de um mint Cashu para se conectar. Esta carteira não é afiliada a nenhum mint.",
      actions: {
        add_mint: {
          label: "@:global.actions.add_mint.label",
          error_invalid_url: "URL inválida",
        },
        scan: {
          label: "Ler código QR",
        },
      },
    },
    discover: {
      title: "Buscar mints",
      caption: "Mints que outras pessoas recomendam no Nostr.",
      actions: {
        discover: {
          label: "Buscar mints",
          in_progress: "Carregando…",
        },
      },
      add: "Adicionar",
      empty: {
        title: "Encontre um mint",
        text: "O Cashu.me consulta relays Nostr em busca de mints recomendados por outras pessoas, com notas e avaliações.",
      },
      recommendations: {
        overline: "Encontrado(s) { length } mint(s)",
        caption: "Pesquise por conta própria antes de usar um mint.",
      },
    },
    swap: {
      title: "Swap",
      actions: {
        swap: {
          label: "@:global.actions.swap.label",
          in_progress: "@:MintSettings.swap.actions.swap.label",
        },
      },
      caption:
        "Mova fundos entre seus mints pela Lightning. Deixe uma margem para as taxas da Lightning. Se os fundos não chegarem, confira a fatura pendente em Histórico.",
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
    switching_mint: "Mudando para {mint}",
    reviews_text: "avaliação | avaliações",
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
    actions: {
      create: {
        label: "Criar fatura",
        label_blocked: "Criando…",
      },
    },
    invoice: {
      caption: "Fatura Lightning",
      status_paid_text: "Paga",
      actions: {
        copy: {
          label: "Copiar fatura",
        },
      },
    },
  },
  SendDialog: {
    captions: {
      ecash: "Compartilhe um token ou QR code",
      lightning: "Pague uma fatura ou endereço",
      onchain: "Envie para um endereço Bitcoin",
    },
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
    badge_locked: "bloqueado",
    title: "Enviar ecash",
    inputs: {
      p2pk_pubkey: {
        label: "Chave pública do destinatário",
        invalid: "Insira uma chave pública válida (hex ou npub)",
      },
    },
    actions: {
      copy_emoji: {
        tooltip_text: "Copiar emoji",
      },
      copy_tokens: {
        label: "Copiar token",
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
        in_progress: "Enviando…",
      },
      delete: {
        tooltip_text: "Excluir do histórico",
      },
      write_tokens_to_card: {
        tooltips: {
          ndef_supported_text: "Gravar no cartão NFC",
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
      pay_failed: "Não foi possível pagar a solicitação",
      no_ecash: "Nenhum ecash disponível para esta solicitação de pagamento",
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
    captions: {
      ecash: "Cole, escaneie ou solicite um token",
      lightning: "Crie uma fatura para receber",
      onchain: "Obtenha um endereço Bitcoin",
    },
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
    title: "Receber ecash",
    actions: {
      paste: {
        label: "Colar token",
      },
      scan: {
        label: "Escanear token",
      },
      request: {
        label: "Solicitar ecash",
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
    receiving_amount: "Recebendo {amount}",
    title: "Receber ecash",
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
      receive: {
        label: "@:global.actions.receive.label",
        label_known_mint: "@:ReceiveTokenDialog.actions.receive.label",
        label_adding_mint: "Adicionando mint…",
      },
      swap: {
        label: "Receber para mint confiável",
        tooltip_text: "Swap para um mint confiável",
        processing: "Processando swap...",
        failed: "Swap falhou",
      },
      cancel_swap: {
        tooltip_text: "Cancelar swap",
      },
      confirm_swap: {
        label: "@:ReceiveTokenDialog.actions.swap.label",
        tooltip_text: "@:ReceiveTokenDialog.actions.swap.tooltip_text",
      },
      receive_to_selected_mint: {
        label: "Receber para o mint selecionado",
      },
      later: {
        label: "Receber depois",
        tooltip_text: "Adicionar ao histórico para receber depois",
        already_in_history_success_text: "Ecash já está no histórico",
        added_to_history_success_text: "Ecash adicionado ao histórico",
      },
      nfc: {
        label: "NFC",
        tooltips: {
          ndef_supported_text: "Ler do cartão NFC",
        },
      },
    },
  },
  P2PKDialog: {
    p2pk: {
      caption: "Sua chave de bloqueio",
      description: "Receber ecash bloqueado a esta chave",
      used_warning_text:
        "Aviso: Esta chave já foi usada. Use uma nova chave para melhor privacidade.",
    },
    actions: {
      copy: {
        label: "Copiar chave pública",
      },
      new_key: {
        label: "Gerar nova chave",
      },
    },
  },
  PaymentRequestDialog: {
    any_amount: "Qualquer valor",
    payment_request: {
      caption: "Solicitação de pagamento",
    },
    request_index: "Solicitação {index} de {total}",
    received_total: "Total recebido",
    no_payments_yet: "Nenhum pagamento ainda",
    actions: {
      set_amount: {
        label: "Definir valor",
      },
      copy: {
        label: "@:global.actions.copy.label",
      },
      new_request: {
        label: "Nova solicitação",
      },
      share: {
        label: "Compartilhar",
      },
      add_amount: {
        label: "Adicionar valor",
      },
      use_active_mint: {
        label: "Qualquer mint",
      },
      remove_amount: {
        label: "Remover valor",
      },
      previous: {
        label: "Solicitação anterior",
      },
      next: {
        label: "Próxima solicitação",
      },
    },
    inputs: {
      amount: {
        placeholder: "Digite o valor",
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
    title: "Mensagem do mint",
  },
  MintDetailsDialog: {
    qr: {
      show: "Mostrar QR code",
      hide: "Ocultar QR code",
    },
    contact: {
      title: "Contato",
      email: "E-mail",
    },
    details: {
      title: "Detalhes do mint",
      url: {
        label: "URL",
      },
      nuts: {
        label: "Recursos compatíveis",
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
        label: "Unidade",
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
        label: "Remover mint",
      },
      edit: {
        label: "Editar mint",
      },
    },
    nuts: {
      nut7: "Verificação do estado de tokens",
      nut8: "Taxas Lightning pagas a mais",
      nut9: "Restauração de assinaturas",
      nut10: "Condições de gasto",
      nut11: "Pay-to-Pubkey (P2PK)",
      nut12: "Provas DLEQ",
      nut13: "Segredos determinísticos",
      nut14: "Hashed Timelock Contracts (HTLC)",
      nut15: "Pagamentos multicaminho parciais",
      nut16: "Códigos QR animados",
      nut17: "Assinaturas WebSocket",
      nut18: "Solicitações de pagamento",
      nut19: "Respostas em cache",
      nut20: "Assinatura na cotação de mint",
      nut21: "Autenticação aberta",
      nut22: "Autenticação cega",
    },
  },
  UnitToggle: {
    label: "Unidade: {unit}, alterar",
    bitcoin: "Bitcoin",
  },
  ChooseMint: {
    open_selector: "Selecionar mint, mint atual: {mint}",
    open_selector_empty: "Selecionar mint",
    title: "Selecione um mint",
    placeholder: "Selecione um mint",
    available_text: "neste mint",
    sheet_title: "Selecionar mint",
    badge_mint_error_text: "Erro",
  },
  HistoryTable: {
    empty_text: "Nenhum histórico ainda",
    empty_hint: "Os pagamentos que você envia e recebe aparecem aqui.",
    filters: {
      title: "Filtrar histórico",
      direction: "Direção",
      type: "Tipo",
      completed: "Concluído",
      received: "Recebido",
      sent: "Enviado",
      reset: "Redefinir",
      clear_all: "Limpar tudo",
      remove: "Remover filtro: {label}",
      empty_title: "Nenhum pagamento corresponde a esses filtros",
      clear: "Limpar filtros",
      count: "{shown} de {total}",
      active: "Filtrar histórico, {count} ativos",
    },
    row: {
      type_label: "Ecash",
    },
    actions: {
      check_status: {
        tooltip_text: "Verificar status",
      },
      receive: {
        tooltip_text: "Receber",
      },
    },
    old_token_not_found_error_text: "Token antigo não encontrado",
    labels: {
      onchain_subpayment: "Subpagamento on-chain",
      bolt12_subpayment: "Subpagamento BOLT12",
    },
  },
  InvoiceTable: {
    row: {
      type_label: "Lightning",
    },
  },
  RemoveMintDialog: {
    title: "Remover este mint?",
    nickname: {
      label: "Apelido",
    },
    balances: {
      label: "Saldo neste mint",
    },
    warning_text:
      "Seu ecash deste mint continua neste dispositivo. Ele volta se você adicionar o mint de novo.",
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
      title: "Ler código QR",
      description: "Aponte a câmera para um código QR",
      caption_address: "Toque para escanear um endereço",
      caption_token: "Toque para escanear um token",
    },
    paste_button: {
      label: "@:global.actions.paste.label",
    },
  },
  PayInvoiceDialog: {
    onchain: {
      title: "Pagar on-chain",
      address_placeholder: "Endereço Bitcoin",
      choose_speed: "Escolha a velocidade de confirmação",
      blocks: "{n} bloco | {n} blocos",
      estimated_confirmation: "Confirmação estimada",
      fee_reserve: "reserva de taxa",
    },
    multinut: {
      label: "Pagar com vários mints",
    },
    quote: {
      label: "Cotação",
    },
    input_data: {
      title: "Pagar com Lightning",
      title_bolt12: "Pagar oferta Lightning",
    },
    lnurlpay: {
      amount_exact_label: "{ payee } está solicitando { value } { ticker }",
      amount_range_label:
        "{ payee } está solicitando{br}entre { min } e { max } { ticker }",
      sending_to_lightning_address: "Enviando para { address }",
      inputs: {
        comment: {
          label: "Comentário (opcional)",
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
          waiting_for_wallet: "Aguardando a carteira…",
        },
      },
    },
  },
  EditMintDialog: {
    title: "Editar mint",
    inputs: {
      nickname: {
        label: "Apelido (opcional)",
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
    title: "Você confia neste mint?",
    description:
      "Adicione este mint só se você confiar nele. Ele pode parar de operar a qualquer momento, e você pode perder o ecash que tem nele.",
    actions: {
      add_mint: {
        label: "@:global.actions.add_mint.label",
        in_progress: "Adicionando mint",
      },
    },
    audit_info: {
      label: "Informações de auditoria",
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
      "Não foi possível acessar este mint. Verifique a URL e sua conexão e tente novamente.",
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
    token: "Token",
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
  QuoteInformation: {
    address: "Endereço",
    invoice: "Fatura",
    request: "Solicitação",
    amount: "Valor",
    fee_reserve: "Reserva de taxa",
    fee_paid: "Taxa paga",
    unit: "Unidade",
    status: "Status",
    network: "Rede",
    transaction_id: "ID da transação",
    explorer: "Explorador",
    confirmations: "Confirmações",
    paid_at: "Pago em",
    preimage: "Pré-imagem",
    preimage_copied: "Pré-imagem copiada",
    mint: "Mint",
    method: "Método",
    lightning_offer: "Oferta Lightning",
    states: {
      waiting: "Aguardando pagamento",
      confirming: "Confirmando ({count}/{threshold})",
      issuing: "Emitindo ecash",
      paid: "Paga",
      unpaid: "Não paga",
      pending: "Pendente",
      issued: "Emitida",
      expired: "Expirada",
      failed: "Falhou",
    },
  },
  MintAuditInfo: {
    title: "Informações de auditoria",
    loading: "Carregando informações de auditoria…",
    not_audited: "Este auditor não tem dados sobre este mint.",
    not_audited_text:
      "Para saber mais sobre o auditor ou apoiar uma futura auditoria, visite {link} ou clique {here} para doar ecash e ajudar a iniciar uma auditoria deste mint.",
    here: "aqui",
    unavailable:
      "As informações de auditoria não estão disponíveis no momento.",
    load_failed: "Falha ao carregar dados do mint",
    success_rate: "Taxa de sucesso",
    swaps_count: "{successful} de {total} trocas",
    average_time: "Tempo médio",
    average_time_caption: "Em trocas bem-sucedidas",
    disclaimer:
      "Os dados de auditoria são fornecidos por terceiros independentes para ajudar a avaliar a confiabilidade de um mint ao longo do tempo. No entanto, esses resultados são apenas informativos e não garantem a segurança, solvência ou confiabilidade de nenhum mint. Sempre faça sua própria pesquisa e certifique-se de confiar no operador do mint antes de usar seus serviços.",
    donate_text:
      "As informações de auditoria são disponibilizadas por {link}. O saldo atual mantido pelo auditor para este mint é de {balance}, com um total de {donations} doados até agora. Para apoiar a auditoria contínua, você pode {press_here} para doar ecash ao auditor.",
    press_here: "tocar aqui",
    sats_amount: "{amount} sats",
    warnings_title: "Avisos do auditor",
    warnings: {
      last_swap_failed: "A última tentativa de troca falhou.",
      recent_success:
        "{successful} de {total} trocas nos últimos {days} dias foram bem-sucedidas.",
      reliable:
        "{base} No entanto, {success} Este mint parece confiável; as falhas podem ser do mint de destino.",
      unreliable: "{base} Apenas {success} Este mint pode não ser confiável.",
      unknown:
        "O auditor ainda não conseguiu determinar a qualidade deste mint.",
      not_enough_data:
        "O auditor não tem dados recentes suficientes sobre este mint. Houve apenas {count} troca bem-sucedida nos últimos {days} dias. | O auditor não tem dados recentes suficientes sobre este mint. Houve apenas {count} trocas bem-sucedidas nos últimos {days} dias.",
      low_success:
        "Nos últimos {days} dias, este mint teve uma taxa de sucesso de {rate}%, abaixo dos {threshold}% recomendados.",
      inactive:
        "Este mint não teve trocas por {days} dia. Ele pode estar inacessível. | Este mint não teve trocas por {days} dias. Ele pode estar inacessível.",
      slow: "Este mint é lento. Os pagamentos dele levaram {seconds} segundos em média.",
      no_successful:
        "Nenhuma troca bem-sucedida registrada para este mint. Ele pode estar inacessível.",
    },
    chart: {
      now: "Agora",
      today: "Hoje",
      yesterday: "Ontem",
      invalid_date: "Data inválida",
      swaps: "Trocas:",
      success_rate: "Taxa de sucesso:",
      time_range: "Intervalo de tempo:",
    },
  },
  DisplayTokenComponent: {
    title: {
      send: "Enviar ecash",
      sent: "Ecash enviado",
      received: "Ecash recebido",
    },
    qr_speed: "Velocidade do QR: {value}",
    qr_density: "Densidade do QR: {value}",
    speed: {
      fast: "Rápida",
      medium: "Média",
      slow: "Lenta",
    },
    density: {
      high: "Alta",
      medium: "Média",
      low: "Baixa",
    },
    delete_dialog: {
      title: "Excluir do histórico?",
      text: "Tem certeza de que deseja excluir esta transação do histórico?",
      warning:
        "Aviso: esta ação não pode ser desfeita e não há como recuperar o token.",
    },
    nfc: {
      read_failed: "Falha na leitura NFC",
      write_failed: "Falha na gravação NFC",
      error: "Erro de NFC",
      writing: "Gravando no cartão NFC…",
      success: "Token gravado no cartão NFC",
      capacity:
        "O cartão pode não ter capacidade suficiente (necessários {bytes} bytes).",
    },
  },
  CreateInvoiceDialog: {
    format_label: "Tipo de solicitação",
    formats: {
      bolt11: "Fatura",
      bolt12: "Oferta",
    },
    onchain_title: "Receber on-chain",
    bolt12_title: "Receber oferta Lightning",
    mint_unreachable: "Mint inacessível",
    mint_unreachable_text: "Reconecte-se ao mint para receber pagamentos.",
    reconnect_mint: "Reconectar mint",
    checking_address: "Verificando endereço…",
    add_amount: "Adicionar valor",
    new_offer: "Nova oferta",
    create_offer: "Criar oferta",
    create_new_address: "Criar novo endereço",
    create_address: "Criar endereço",
    onchain_unsupported:
      "Este mint não aceita depósitos on-chain nesta unidade.",
    deposit_limits: {
      outside: "Depósitos fora de {min}–{max} não serão creditados.",
      below: "Depósitos abaixo de {min} não serão creditados.",
      above: "Depósitos acima de {max} não serão creditados.",
    },
    amount_errors: {
      positive_decimal:
        "Insira um valor positivo em {unit} com no máximo duas casas decimais.",
      positive_whole: "Insira um valor inteiro positivo em {unit}.",
      min: "Insira pelo menos {amount}.",
      max: "Insira no máximo {amount}.",
    },
  },
  storage: {
    notifications: {
      unrecognized_backup: "Formato de backup não reconhecido",
      backup_restored: "Backup restaurado",
      backup_exported: "Backup da carteira exportado",
      quota_exceeded:
        "O armazenamento do navegador está cheio ou indisponível. Novos dados da carteira podem não ser salvos. Faça backup da sua carteira agora.",
      cleaned_up: "{size} bytes liberados",
    },
  },
  receiveTokens: {
    notifications: {
      already_in_history: "O ecash já está no histórico",
      nfc_read_failed: "Não foi possível ler os dados da tag NFC",
      scan_error: "Erro ao escanear",
      nfc_error: "Erro de NFC",
    },
  },
  nostrMintBackup: {
    notifications: {
      no_relays: "Nenhum relay Nostr configurado",
      backup_failed:
        "Não foi possível fazer backup da sua lista de mints no Nostr",
      backed_up: "Backup da lista de mints feito no Nostr",
      found:
        "{count} mint encontrado nos backups do Nostr | {count} mints encontrados nos backups do Nostr",
      none_found:
        "Nenhum backup de mints encontrado no Nostr para esta frase de recuperação",
      search_failed: "Não foi possível buscar backups de mints",
      add_mint_failed: "Não foi possível adicionar {mint}",
      added:
        "{count} mint adicionado à sua carteira | {count} mints adicionados à sua carteira",
      none_added: "Nenhum mint novo foi adicionado",
      add_selected_failed: "Não foi possível adicionar os mints selecionados",
    },
  },
  nostr: {
    notifications: {
      nip04_published: "Mensagem publicada no Nostr",
      nip04_failed: "Não foi possível publicar a mensagem no Nostr",
      nip17_failed: "Não foi possível publicar a mensagem no Nostr",
      receive_failed: "Não foi possível receber o pagamento",
      ecash_already_in_history: "Ecash já está no histórico",
      ecash_added: "Ecash adicionado ao histórico",
    },
  },
  nwc: {
    notifications: {
      melt_quote_failed:
        "NWC: Não foi possível obter uma cotação de pagamento do mint",
      unit_must_be_sat: "NWC: A unidade ativa deve ser sats",
      allowance_exceeded: "NWC: Limite excedido",
    },
  },
  npubcash: {
    notifications: {
      could_not_update_mint: "Não foi possível atualizar o mint do npub.cash",
      add_mint_first: "Adicione {mint} à sua carteira primeiro",
    },
  },
};
