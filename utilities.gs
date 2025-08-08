/**
 * ARQUIVO DE UTILITÁRIOS
 * Contém funções auxiliares e reutilizáveis que dão suporte
 * aos handlers e outras partes do código.
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
 * @param {boolean} notificarNaPlanilhaEmCasoDeErro Se verdadeiro, mostrará um aviso "toast" na planilha em caso de falha.
 */
function enviarMensagemDiscord(mensagem, chaveWebhook, notificarNaPlanilhaEmCasoDeErro = false) {
  const WEBHOOK_URL = props.getProperty(chaveWebhook);

  // Se a URL estiver faltando, o erro é interno e não do usuário.
  if (!WEBHOOK_URL || !WEBHOOK_URL.startsWith('https://discord.com')) {
    Logger.log(`ERRO: Webhook para a chave "${chaveWebhook}" não configurado corretamente.`);
    // Opcional: mostrar um toast aqui também se for um erro crítico que o usuário deva saber.
    if (notificarNaPlanilhaEmCasoDeErro) {
       SpreadsheetApp.getActiveSpreadsheet().toast(
         `A URL do webhook "${chaveWebhook}" não foi configurada. Contate o administrador.`, 
         "🚨 Erro de Configuração", 
         10 // segundos
       );
    }
    return;
  }

  const payload = JSON.stringify({ content: mensagem });
  const options = { method: "post", contentType: "application/json", payload: payload, muteHttpExceptions: true };
  
  try {
    const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    // Se a resposta do Discord indicar um erro (ex: webhook deletado)
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
      throw new Error(`O Discord retornou um erro. Código: ${response.getResponseCode()}.`);
    }
  } catch (error) {
    Logger.log(`Falha ao enviar notificação via webhook "${chaveWebhook}". Detalhes: ${error.toString()}`);
    
    // Se a flag for verdadeira, mostra o aviso "toast" na tela do usuário.
    if (notificarNaPlanilhaEmCasoDeErro) {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        "Não foi possível enviar a notificação para o Discord. Verifique a URL do webhook ou a conexão.", 
        "Falha na Notificação", 
        10 // segundos
      );
    }
  }
}
