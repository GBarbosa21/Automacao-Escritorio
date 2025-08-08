/**
 * ARQUIVO DE HANDLERS (Manipuladores de Ação)
 * Contém as funções que executam a lógica de negócio principal quando
 * um gatilho é disparado pelo roteador em Code.gs.
 */

/**
 * Lida com a lógica de enviar e-mail quando o status é "Pronto", buscando o e-mail na API da Omie.
 */
function handleEmailPronto(planilha, linha) {
  const celulaNotificacao = planilha.getRange(linha, COLUNA_NOTIFICACAO_ENVIADA);
  if (celulaNotificacao.getValue() != "") return;

  const nomeClienteRaw = planilha.getRange(linha, COLUNA_NOME_CLIENTE).getValue();
  const nomeCliente = nomeClienteRaw.toString().trim();
  const idProjeto = planilha.getRange(linha, COLUNA_ID_PROJETO).getValue();
  
  if (!nomeCliente || !idProjeto) return;

  const emailCliente = buscarEmailClienteOmie(nomeCliente);
  
  if (emailCliente) {
    let inlineImages = {};
    const logoFileId = props.getProperty('GOOGLE_DRIVE_LOGO_FILE_ID');

    if (logoFileId) {
      try {
        const logoBlob = DriveApp.getFileById(logoFileId).getBlob();
        inlineImages = { logo: logoBlob };
      } catch(err) {
        Logger.log("Falha ao carregar a imagem da logo do Drive: " + err.toString());
      }
    }
    
    const REMETENTE_EMAIL = props.getProperty('REMETENTE_EMAIL');
    const REMETENTE_NOME = props.getProperty('REMETENTE_NOME');
    const assunto = `Seu pedido (Nº ${idProjeto}) está pronto!`;
    const corpoEmail = `<p>Olá, ${nomeCliente},</p><p>Informamos que sua tradução, referente ao Orçamento <strong>Nº ${idProjeto}</strong>, foi concluída e já está pronta para retirada.</p><p>Retiradas podem ser feitas em qualquer dia útil (segunda a sexta), a partir das 16:00 ás 17:15</p><p>Qualquer dúvida, estamos à disposição.</p><br><p>Atenciosamente,</p><p><strong>${REMETENTE_NOME}</strong></p><br>${logoFileId ? '<img src="cid:logo" width="64" height="64">' : ''}`;
    
    GmailApp.sendEmail(emailCliente, assunto, "", { 
      htmlBody: corpoEmail, 
      from: REMETENTE_EMAIL, 
      name: REMETENTE_NOME,
      inlineImages: inlineImages
    });
    
    celulaNotificacao.setValue("Enviado em " + new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"}));

  } else {
    celulaNotificacao.setValue("FALHA: Cliente não encontrado na Omie.");
    Logger.log(`Não foi possível enviar e-mail pois o cliente "${nomeCliente}" não foi encontrado na Omie.`);
  }
}

/**
 * Lida com a lógica de enviar notificação de "Tradução" para o Discord.
 */
function handleDiscordTraducao(planilha, linha) {
  const nomeCliente = planilha.getRange(linha, COLUNA_NOME_CLIENTE).getValue();
  const idProjeto = planilha.getRange(linha, COLUNA_ID_PROJETO).getValue();
  const dataEntregaObj = planilha.getRange(linha, COLUNA_DATA_ENTREGA).getValue();
  const dataFormatada = formatarData(dataEntregaObj);

  if (nomeCliente && idProjeto) {
    const mensagem = `O orçamento ${idProjeto} - ${nomeCliente} está em Tradução! Data de Entrega: ${dataFormatada}`;
    enviarMensagemDiscord(mensagem, 'WEBHOOK_URL_TRADUCAO', true);
  }
}

/**
 * Lida com a lógica de enviar notificação de "Revisão" para o Discord.
 */
function handleDiscordRevisao(planilha, linha) {
  const valorDataDaPlanilha = planilha.getRange(linha, COLUNA_DATA_CHECK).getValue();
  if (!(valorDataDaPlanilha instanceof Date)) {
    return; 
  }

  const dataDaPlanilha = new Date(valorDataDaPlanilha);
  dataDaPlanilha.setHours(0, 0, 0, 0);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (dataDaPlanilha.getTime() !== hoje.getTime()) {
    return;
  }
  
  const nomeCliente = planilha.getRange(linha, COLUNA_NOME_CLIENTE).getValue();
  const idProjeto = planilha.getRange(linha, COLUNA_ID_PROJETO).getValue();
  if (nomeCliente && idProjeto) {
    const valorUrgencia = planilha.getRange(linha, COLUNA_URGENCIA).getValue();
    let mensagem;
    if (valorUrgencia) {
      mensagem = `**${nomeCliente} - ${idProjeto}** está em Revisão com urgência!`;
    } else {
      mensagem = `**${nomeCliente} - ${idProjeto}** está em Revisão!`;
    }
    enviarMensagemDiscord(mensagem, 'WEBHOOK_URL_REVISAO', true);
  }
}

/**
 * Lida com a lógica de enviar notificação de "Assinar Digital" para o Discord.
 */
function handleDiscordAssinatura(planilha, linha) {
  const nomeCliente = planilha.getRange(linha, COLUNA_NOME_CLIENTE).getValue();
  const idProjeto = planilha.getRange(linha, COLUNA_ID_PROJETO).getValue();
  if (nomeCliente && idProjeto) {
    const mensagem = `O orçamento ${idProjeto} - ${nomeCliente} está pronto para ser assinado digitalmente!`;
    enviarMensagemDiscord(mensagem, 'WEBHOOK_URL_ASSINAR_DIGITAL', false);
  }
}

/**
 * Lida com a lógica de construir e enviar o lembrete mensal para o Discord.
 */
function handleLembreteMensal() {
  const userId = props.getProperty('DISCORD_USER_ID_PARA_PING');
  if (!userId) return;

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dataAtual = new Date();
  const proximoMes = (dataAtual.getMonth() === 11) ? meses[0] : meses[dataAtual.getMonth() + 1];
  const mensagem = `<@${userId}> Crie as pastas e a planilha do mês de ${proximoMes}`;
  enviarMensagemDiscord(mensagem, 'WEBHOOK_URL_LEMBRETE_MENSAL', false);
}
