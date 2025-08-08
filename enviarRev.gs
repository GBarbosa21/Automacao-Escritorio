/**
 * @OnlyCurrentDoc
 * @version 4.0
 * * Este script automatiza notificações para um fluxo de trabalho de projetos em uma Planilha Google.
 *
 * FUNCIONALIDADES:
 * 1. Envia um e-mail para o cliente quando o status do projeto muda para "Pronto".
 * 2. Envia uma notificação para o Discord quando o status muda para "Tradução".
 * 3. Envia uma notificação para o Discord quando o status muda para "Revisão".
 * * SEGURANÇA:
 * Utiliza o PropertiesService do Google para gerenciar todas as configurações e dados
 * sensíveis (URLs de Webhook, e-mails, nomes de abas), permitindo que o código seja
 * versionado no GitHub de forma segura, sem expor informações privadas.
 */


/**
 * ------------------------------------------------------------------------------------------
 * FUNÇÃO DE CONFIGURAÇÃO - EXECUTAR MANUALMENTE
 * ------------------------------------------------------------------------------------------
 * ESTA É A VERSÃO "LIMPA" PARA O GITHUB.
 * Preencha os valores abaixo com seus dados reais e execute esta função UMA VEZ
 * (ou sempre que adicionar uma nova propriedade) pelo editor do Apps Script.
 * * NÃO FAÇA COMMIT DESTE BLOCO PREENCHIDO COM DADOS REAIS.
 */
function configurarPropriedades() {
  const properties = PropertiesService.getScriptProperties();

  properties.setProperties({
    // --- Configurações Gerais da Planilha ---
    'NOME_DA_ABA_PROJETOS': 'AGOSTO 2025',
    'NOME_DA_ABA_CLIENTES': 'CLIENTES',
    
    // --- Textos de Status ---
    'VALOR_STATUS_PRONTO': '09 Pronto',
    'VALOR_STATUS_TRADUCAO': '03 Tradução',
    'VALOR_STATUS_REVISAO': '04 Revisão', // <-- NOVO
    
    // --- Configurações de E-mail ---
    'REMETENTE_EMAIL': 'insira-seu-email-de-envio@exemplo.com',
    'REMETENTE_NOME': 'Insira o Nome da Sua Empresa ou Remetente',

    // --- Configurações do Discord ---
    'WEBHOOK_URL_TRADUCAO': 'INSIRA_URL_DO_WEBHOOK_DE_TRADUCAO',
    'WEBHOOK_URL_REVISAO': 'INSIRA_URL_DO_WEBHOOK_DE_REVISAO' // <-- NOVO
  });

  SpreadsheetApp.getUi().alert('Propriedades do script configuradas com sucesso!');
}


/**
 * ------------------------------------------------------------------------------------------
 * INÍCIO DO CÓDIGO PRINCIPAL
 * ------------------------------------------------------------------------------------------
 */

// --- Leitura das Propriedades Globais ---
const props = PropertiesService.getScriptProperties();

const NOME_DA_ABA_PROJETOS = props.getProperty('NOME_DA_ABA_PROJETOS');
const VALOR_STATUS_PRONTO = props.getProperty('VALOR_STATUS_PRONTO');
const VALOR_STATUS_TRADUCAO = props.getProperty('VALOR_STATUS_TRADUCAO');
const VALOR_STATUS_REVISAO = props.getProperty('VALOR_STATUS_REVISAO');

// --- Constantes de Colunas ---
const COLUNA_STATUS = 8;
const COLUNA_NOME_CLIENTE = 3;
const COLUNA_ID_PROJETO = 4;
const COLUNA_NOTIFICACAO_ENVIADA = 24;


/**
 * GATILHO PRINCIPAL - Roteador de Ações onEdit.
 * Esta é a ÚNICA função que deve ser configurada como gatilho "Ao editar".
 * @param {object} e O objeto de evento do gatilho onEdit.
 */
function masterOnEdit(e) {
  if (!e || !e.range) return;

  const celula = e.range;
  const planilha = celula.getSheet();
  
  // Roteador: verifica se a edição é relevante antes de prosseguir
  if (planilha.getName() === NOME_DA_ABA_PROJETOS && celula.getColumn() === COLUNA_STATUS) {
    const linhaEditada = celula.getRow();
    
    // Ação 1: Status mudou para "Pronto"?
    if (e.value === VALOR_STATUS_PRONTO) {
      handleEmailPronto(planilha, linhaEditada);
    }
    
    // Ação 2: Status mudou para "Tradução"?
    else if (e.value === VALOR_STATUS_TRADUCAO) {
      handleDiscordTraducao(planilha, linhaEditada);
    }

    // Ação 3: Status mudou para "Revisão"?
    else if (e.value === VALOR_STATUS_REVISAO) {
      handleDiscordRevisao(planilha, linhaEditada);
    }
  }
}

/**
 * Lida com a lógica de enviar e-mail quando o status é "Pronto".
 * @param {GoogleAppsScript.Spreadsheet.Sheet} planilha A aba que foi editada.
 * @param {number} linha O número da linha que foi editada.
 */
function handleEmailPronto(planilha, linha) {
  const celulaNotificacao = planilha.getRange(linha, COLUNA_NOTIFICACAO_ENVIADA);
  if (celulaNotificacao.getValue() != "") return;

  const nomeCliente = planilha.getRange(linha, COLUNA_NOME_CLIENTE).getValue();
  const idProjeto = planilha.getRange(linha, COLUNA_ID_PROJETO).getValue();
  if (!nomeCliente || !idProjeto) return;

  const emailCliente = buscarEmailDoCliente(nomeCliente);
  if (!emailCliente) return;

  const REMETENTE_EMAIL = props.getProperty('REMETENTE_EMAIL');
  const REMETENTE_NOME = props.getProperty('REMETENTE_NOME');
  const assunto = `Seu pedido (Nº ${idProjeto}) está pronto!`;
  const corpoEmail = `<p>Olá, ${nomeCliente},</p><p>Informamos que sua tradução, referente ao Orçamento <strong>Nº ${idProjeto}</strong>, foi concluída e já está pronta para retirada.</p><p>Retiradas podem ser feitas em qualquer dia útil (segunda a sexta), a partir das 16:00 ás 17:15</p><p>Qualquer dúvida, estamos à disposição.</p><br><p>Atenciosamente,</p><p><strong>${REMETENTE_NOME}</strong></p>`;
  
  GmailApp.sendEmail(emailCliente, assunto, "", { htmlBody: corpoEmail, from: REMETENTE_EMAIL, name: REMETENTE_NOME });
  celulaNotificacao.setValue("Enviado em " + new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"}));
}

/**
 * Lida com a lógica de enviar notificação de "Tradução" para o Discord.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} planilha A aba que foi editada.
 * @param {number} linha O número da linha que foi editada.
 */
function handleDiscordTraducao(planilha, linha) {
  const nomeCliente = planilha.getRange(linha, COLUNA_NOME_CLIENTE).getValue();
  const idProjeto = planilha.getRange(linha, COLUNA_ID_PROJETO).getValue();
  if (nomeCliente && idProjeto) {
    const mensagem = `O orçamento ${idProjeto} - ${nomeCliente} está em Tradução!`;
    enviarMensagemDiscord(mensagem, 'WEBHOOK_URL_TRADUCAO');
  }
}

/**
 * Lida com a lógica de enviar notificação de "Revisão" para o Discord.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} planilha A aba que foi editada.
 * @param {number} linha O número da linha que foi editada.
 */
function handleDiscordRevisao(planilha, linha) {
  const nomeCliente = planilha.getRange(linha, COLUNA_NOME_CLIENTE).getValue();
  const idProjeto = planilha.getRange(linha, COLUNA_ID_PROJETO).getValue();
  if (nomeCliente && idProjeto) {
    const mensagem = `O orçamento ${idProjeto} - ${nomeCliente} está em Revisão!`;
    enviarMensagemDiscord(mensagem, 'WEBHOOK_URL_REVISAO');
  }
}


/** ------------------------------------------------------------------------------------------
 * FUNÇÕES AUXILIARES
 * ------------------------------------------------------------------------------------------
 */

/**
 * Busca o email de um cliente na aba "CLIENTES".
 * @param {string} nomeDoCliente O nome do cliente a ser procurado.
 * @return {string|null} O email do cliente ou null se não for encontrado.
 */
function buscarEmailDoCliente(nomeDoCliente) {
  const NOME_DA_ABA_CLIENTES = props.getProperty('NOME_DA_ABA_CLIENTES');
  const abaClientes = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOME_DA_ABA_CLIENTES);
  if (!abaClientes) return null;
  const dados = abaClientes.getDataRange().getValues();
  for (let i = 1; i < dados.length; i++) {
    if (dados[i][0] && dados[i][0].toString().trim().toLowerCase() === nomeDoCliente.toString().trim().toLowerCase()) {
      return dados[i][1];
    }
  }
  return null;
}

/**
 * Envia uma mensagem para um webhook específico do Discord.
 * @param {string} mensagem A mensagem a ser enviada.
 * @param {string} chaveWebhook A chave da propriedade que contém a URL do Webhook.
 */
function enviarMensagemDiscord(mensagem, chaveWebhook) {
  const WEBHOOK_URL = props.getProperty(chaveWebhook);

  if (!WEBHOOK_URL || !WEBHOOK_URL.startsWith('https://discord.com')) {
    Logger.log(`ERRO: Webhook para a chave "${chaveWebhook}" não configurado corretamente.`);
    return;
  }

  const payload = JSON.stringify({ content: mensagem });
  const options = { method: "post", contentType: "application/json", payload: payload, muteHttpExceptions: true };
  try {
    UrlFetchApp.fetch(WEBHOOK_URL, options);
  } catch (error) {
    Logger.log(`Falha crítica ao enviar mensagem para o Discord via ${chaveWebhook}: ${error.toString()}`);
  }
}+
