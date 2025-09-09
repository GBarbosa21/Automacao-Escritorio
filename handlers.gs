/**
 * ARQUIVO DE HANDLERS (Manipuladores de Ação)
 * Contém as funções que executam a lógica de negócio principal quando
 * um gatilho é disparado pelo roteador em Code.gs.
 */

/**
 * Lida com a lógica de enviar e-mail quando o status é "Pronto".
 */
function handleEmailPronto(c) {
  if (c[5].getValue() != "") return;

  if (!c[1] || !c[2]) return;

  const emailCliente = buscarEmailClienteOmie(c[1]);

  if (emailCliente) {
    let inlineImages = {};
    const logoFileId = props.getProperty('GOOGLE_DRIVE_LOGO_FILE_ID');

    if (logoFileId) {
      try {
        const logoBlob = DriveApp.getFileById(logoFileId).getBlob();
        inlineImages = { logo: logoBlob };
      } catch (err) {
        Logger.log("Falha ao carregar a imagem da logo do Drive: " + err.toString());
      }
    }

    Logger.log("Entrou em enviar e-mail")
    let nomeCompleto = c[1].split(' ')

    const assunto = `Seu pedido (Nº ${c[2]}) está pronto!`;
    const corpoEmail = `<p>Olá, ${nomeCompleto[0]}!</p><p>Informamos que sua tradução, referente ao orçamento <strong>Nº ${c[2]}</strong>, foi concluída e já está pronta para retirada.</p><p>A retirada pode ser feita em qualquer dia útil (segunda a sexta), a partir das 16:00 às 17:15 no endereço: Rua São José, 40.</p><p>Qualquer dúvida, estamos à disposição.</p><br><p>Atenciosamente,</p><p><strong>${REMETENTE_NOME}</strong></p><br>${logoFileId ? '<img src="cid:logo" width="128" height="128">' : ''}`;

    GmailApp.sendEmail(emailCliente, assunto, "", {
      htmlBody: corpoEmail,
      from: REMETENTE_EMAIL,
      name: REMETENTE_NOME,
      inlineImages: inlineImages
    });

    c[5].setValue("Enviado em " + DT.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }));

  } else {
    c[5].setValue("FALHA: Cliente não encontrado na Omie.");
    Logger.log(`Não foi possível enviar e-mail pois o cliente "${c[1]}" não foi encontrado na Omie.`);
  }
}

/**
 * Lida com a lógica de enviar notificação de "Tradução" para o Discord.
 */
function handleDiscordTraducao(c) {
  if (c[1] && c[2]) {
    mensagem = `**${c[1]} - ${c[2]}** está em Tradução${c[3]}! Data de Entrega: ${formatarData(c[6])}`;
    enviarMensagemDiscord(mensagem, 'WEBHOOK_URL_TRADUCAO');
    moverPasta(c)
  }
}

/**
 * Lida com a lógica de enviar notificação de "Numerar" para o Discord.
 */
function handleDiscordNumerar(c) {
  if (c[1] && c[2]) {
    mensagem = `**${c[1]} - ${c[2]}** está em Numerar${c[3]}!`;
    enviarMensagemDiscord(mensagem, 'WEBHOOK_URL_REVISAO');
    moverPasta(c)
  }
}

function analisarTipoEnvio(c) {
  if (c[9].includes("TRADUÇÃO") && !c[9]== "18 TRADUÇÂO EXTERNA") {
    handleDiscordTraducao(c)
  } else if (c[9].includes("REVISÃO")) {
    handleDiscordRevisao(c)
  } else if (c[9].includes("ASSINAR DIGITAL")) {
    handleDiscordAssinatura(c)
  } else if (c[9].includes("ASSINAR E IMPRIMIR")) {
    handleDiscordAssinarImprimir(c)
  } else if (c[9].includes("IMPRIMIR")) {
    handleDiscordImprimir(c)
  } else if (c[9].includes("NUMERAR")) {
    handleDiscordNumerar(c)
  }
}

function handleDiscordUrgencia(c) {
  if (c[7] == "NÃO" && c[8] == "SIM") {
    c[3] = " SAIU DA URGÊNCIA"
    analisarTipoEnvio(c)
  } else if (c[8] == "SIM") {
    c[3] = " com urgência :rotating_light:"
    analisarTipoEnvio(c)
  }
}

/**
 * Lida com a lógica de enviar notificação de "Revisão" para o Discord.
 */
function handleDiscordRevisao(c) {
  moverPasta(c)
  const dataDaPlanilha = new Date(c[6]);

  if (isNaN(dataDaPlanilha.getTime())) {
    Logger.log("Data inválida");
    return;
  }
  
  DT.setHours(0, 0, 0, 0);
  console.log("DATA: " + dataDaPlanilha.getTime())
  console.log(DT.getTime())
  console.log(dataDaPlanilha.getTime() !== DT.getTime())

  if (dataDaPlanilha.getTime() !== DT.getTime()) {
    Logger.log(`Ação 'Revisão' ignorada para a linha ${c[0]}: A data (${dataDaPlanilha.toLocaleDateString('pt-BR')}) não é a de hoje.`);
    return;
  }

  if (c[1] && c[2]) {
    mensagem = `**${c[1]} - ${c[2]}** está em Revisão${c[3]}!`;
    enviarMensagemDiscord(mensagem, 'WEBHOOK_URL_REVISAO');
  }
}

/**
 * Lida com a lógica de enviar notificação de "Assinar Digital" para o Discord.
 */
function handleDiscordAssinatura(c) {
  if (c[1] && c[2]) {
    const mensagem = `**${c[1]} - ${c[2]}** está pronto para ser assinado${c[3]}!`;
    enviarMensagemDiscord(mensagem, 'WEBHOOK_URL_ASSINAR_DIGITAL');
    moverPasta(c)
  }
}

/**
 * Lida com a lógica de enviar notificação de "Assinar e Impirimir" para o Discord.
 */
function handleDiscordAssinarImprimir(c) {
  if (!USER_ISABELLA) {
    Logger.log('ERRO: ID de usuário do Discord não configurado em Setup.gs.');
    return;
  }
  if (c[1] && c[2]) {
    const mensagem = `**${c[1]} - ${c[2]}** está pronto para ser assinado digitalmente e impresso${c[3]}! \n\n<@${USER_ISABELLA}>`;
    enviarMensagemDiscord(mensagem, 'WEBHOOK_URL_ASSINAR_IMPRIMIR');
    moverPasta(c)
  }
}

/**
 * Lida com a lógica de enviar notificação de "Imprimir" para o Discord.
 */
function handleDiscordImprimir(c) {
  if (c[1] && c[2]) {
    const mensagem = `**${c[1]} - ${c[2]}** liberado${c[3]}!`;
    enviarMensagemDiscord(mensagem, 'WEBHOOK_URL_IMPRIMIR');
    moverPasta(c)
  }
}

/**
 * Lida com a lógica de construir e enviar o lembrete mensal para o Discord.
 */
function handleLembreteMensal() {
  if (!USER_GUSTAVO) {
    Logger.log('ERRO: ID de usuário do Discord para ping não configurado em Setup.gs.');
    return;
  }
  const proximoMes = (DT.getMonth() === 11) ? MESES[0] : MESES[DT.getMonth() + 1];
  const mensagem = `<@${USER_GUSTAVO}>, Crie as pastas e a planilha do mês de ${proximoMes}`;
  enviarMensagemDiscord(mensagem, 'WEBHOOK_URL_LEMBRETE_MENSAL');
}

/**
 * Procura por uma pasta com um nome específico de forma recursiva (em todas as subpastas).
 */
function buscarPastaRecursivamente(pastaPai, nomeDaPasta) {
  const pastas = pastaPai.getFoldersByName(nomeDaPasta);
  if (pastas.hasNext()) {
    return pastas.next(); // Encontrou e retorna a pasta.
  }

  // procurar dentro de subpastas caso não encontre na principal
  const subPastas = pastaPai.getFolders();
  while (subPastas.hasNext()) {
    const subPasta = subPastas.next();
    const pastaEncontrada = buscarPastaRecursivamente(subPasta, nomeDaPasta);
    if (pastaEncontrada) {
      return pastaEncontrada; // Encontrou em uma das subpastas!
    }
  }
  return null;
}

/**
 * Move uma pasta de projeto com base em um status definido em uma planilha.
 * A função realiza uma busca global pela pasta de origem e uma busca local (dentro de uma pasta raiz) pela pasta de destino.
 */
function moverPasta(c) {
  let v = c[7];

  if (!v) {
    Logger.log("Status limpo. Nenhuma ação necessária.");
    return;
  }

  // Normalização dos nomes
  if (v == '08 Assinar e Imprimir') { v = '07 Assinar digitalmente' }

  try {
    const nomePastaParaMover = `Orç_${c[2]} - ${c[1]}`;
    const nomePastaDestinoPrincipal = v;

    Logger.log(`Iniciando processo para mover a pasta que contém "${nomePastaParaMover}" para a pasta que contém "${nomePastaDestinoPrincipal}".`);

    // 1. Encontra a pasta de ORIGEM (busca GLOBAL, sem passar o segundo parâmetro)
    //    Esta busca é feita em todo o Google Drive do usuário.
    const pastaOrigem = encontrarPasta(nomePastaParaMover);

    if (!pastaOrigem) {
      Logger.log(`ERRO CRÍTICO: A pasta de origem contendo "${nomePastaParaMover}" não foi encontrada no Drive. A execução será interrompida.`);
      let mensagem = `ERRO CRÍTICO: A pasta de origem contendo "${nomePastaParaMover}" não foi encontrada no Drive. A execução será interrompida.`;
      enviarMensagemDiscord(mensagem, 'WEBHOOK_HISTORICO');
      return;
    }

    // 2. Acessa a pasta raiz do projeto a partir do seu ID.
    const pastaRaiz = DriveApp.getFolderById(ID_DA_PASTA_RAIZ);
    
    // 3. Procura a pasta de destino (busca LOCAL, passando a 'pastaRaiz' como segundo parâmetro)
    //    Esta busca é mais rápida, pois só procura dentro da pasta raiz do projeto.
    let pastaDestinoFinal = encontrarPasta(nomePastaDestinoPrincipal, pastaRaiz);
    
    // 4. Lógica para a subpasta do mês
    if (c[4] && pastaDestinoFinal && v == VALOR_STATUS_TRADUCAO_EXTERNA) {
      Logger.log(`Status é "${VALOR_STATUS_TRADUCAO_EXTERNA}", procurando subpasta do mês: "${c[4]}".`);

      let pastaDoMes;
      // Para a subpasta do mês, uma busca exata é mais segura e eficiente.
      const pastasFilhas = pastaDestinoFinal.getFoldersByName(c[4]);

      if (pastasFilhas.hasNext()) {
        pastaDoMes = pastasFilhas.next();
        Logger.log(`Subpasta do mês encontrada: "${pastaDoMes.getName()}".`);
      }

      pastaDestinoFinal = pastaDoMes;
    }

    // 5. Move a pasta para o destino final, se um destino válido foi encontrado
    if (pastaDestinoFinal) {
      // Pega a pasta pai atual da pasta de origem para verificar se a movimentação é necessária
      const pastaPaiOrigem = pastaOrigem.getParents().next(); 
      
      if (pastaPaiOrigem.getId() === pastaDestinoFinal.getId()) {
        Logger.log(`AVISO: A pasta "${pastaOrigem.getName()}" já está no diretório de destino "${pastaDestinoFinal.getName()}". Nenhuma ação é necessária.`);
        return; 
      }

      // Move a pasta para o destino final
      pastaOrigem.moveTo(pastaDestinoFinal);
      Logger.log(`SUCESSO: A pasta "${pastaOrigem.getName()}" foi movida para "${pastaDestinoFinal.getName()}".`);
      const mensagem = `-------------------------\nPasta: ${pastaOrigem.getName()}\nMovida: ${pastaDestinoFinal.getName()}\nStatus inserido: ${v}\n-------------------------`;
      enviarMensagemDiscord(mensagem, 'WEBHOOK_HISTORICO');
    } else {
      Logger.log(`ERRO FINAL: A pasta de destino contendo "${nomePastaDestinoPrincipal}" não pôde ser encontrada dentro da pasta raiz. A pasta de origem não foi movida.`);
    }

  } catch (error) {
    Logger.log(`Ocorreu um erro geral: ${error.toString()}\n${error.stack}`);
  }
}

/**
 * Limpa espaços duplos
 */
function corrigirNomesAutomaticamente() {
  const mesNumero = DT.getMonth() + 1;
  const mes = mesNumero < 10 ? "0" + mesNumero : mesNumero.toString();
  const ano = DT.getFullYear();
  const nomeDoMes = MESES[mesNumero - 1];

  // O script vai procurar por este padrão de caminho:
  const caminhoDaPasta = `08 Atendimento/01. Orçamentos em aprovação/Em aprovação ${ano}/${mes} Em aprovação ${nomeDoMes} ${ano}`;

  try {
    const pastaRaiz = DriveApp.getFolderById(ID_DA_PASTA_RAIZ);
    
    // Tenta encontrar a pasta alvo com logs detalhados
    const pastaAlvo = getPastaPorCaminhoComLogs(pastaRaiz, caminhoDaPasta);

    if (pastaAlvo) {
      Logger.log(`--- INICIANDO VERIFICAÇÃO EM: "${pastaAlvo.getName()}" ---`);
      let corrigidos = [];
      processarPasta(pastaAlvo, corrigidos);
      Logger.log('--- VERIFICAÇÃO COMPLETA ---');

      if (corrigidos.length > 0) {
        let mensagemFinal = "Pastas corrigidas:\n" + corrigidos.join('\n');
        Logger.log(mensagemFinal);
      } else {
        Logger.log("Nenhuma pasta precisou ser renomeada.");
      }
    } else {
      Logger.log(`--- OPERAÇÃO CANCELADA: Não foi possível encontrar o caminho completo.`);
    }
  } catch (e) {
    Logger.log(`ERRO CRÍTICO: Não foi possível acessar a pasta inicial com o ID "${ID_DA_PASTA_RAIZ}". Verifique o ID. Erro: ${e.message}`);
  }
}
