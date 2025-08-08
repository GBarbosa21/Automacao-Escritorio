/**
 * ARQUIVO DE UTILITÁRIOS
 * Contém funções auxiliares e reutilizáveis.
 */

/**
 * Busca o e-mail de um cliente na API da Omie usando o nome.
 * @param {string} nome O nome do cliente a ser buscado.
 * @return {string|null} O e-mail do cliente ou nulo se não encontrado.
 */
function buscarEmailClienteOmie(nome) {
  const OMIE_APP_KEY = props.getProperty('OMIE_APP_KEY');
  const OMIE_APP_SECRET = props.getProperty('OMIE_APP_SECRET');
  const OMIE_URL = props.getProperty('OMIE_API_URL');

  if (!OMIE_APP_KEY || !OMIE_APP_SECRET || !OMIE_URL) {
    Logger.log("ERRO: As credenciais da API da Omie não estão configuradas no Setup.gs");
    return null;
  }

  const payload = {
    "call": "ListarClientes", "app_key": OMIE_APP_KEY, "app_secret": OMIE_APP_SECRET,
    "param": [{ "pagina": 1, "registros_por_pagina": 5, "clientesFiltro": { "nome_fantasia": nome } }]
  };

  const options = { "method": "POST", "contentType": "application/json", "payload": JSON.stringify(payload), "muteHttpExceptions": true };

  try {
    const response = UrlFetchApp.fetch(OMIE_URL, options);
    const data = JSON.parse(response.getContentText());

    if (response.getResponseCode() !== 200 || data.faultstring) {
      Logger.log("Erro na API Omie: " + (data.faultstring || response.getContentText()));
      return null;
    }

    if (data && data.clientes_cadastro && data.clientes_cadastro.length > 0) {
      for (const cliente of data.clientes_cadastro) {
        if (cliente.nome_fantasia.trim().toUpperCase() === nome.trim().toUpperCase()) {
          return cliente.email;
        }
      }
    }
    
    Logger.log(`Cliente "${nome}" não encontrado ou sem correspondência exata na Omie.`);
    return null;

  } catch (e) {
    Logger.log("Erro crítico ao consultar a API da Omie: " + e.message);
    return null;
  }
}

/**
 * Envia uma mensagem para um webhook específico do Discord.
 * @param {string} mensagem A mensagem a ser enviada.
 * @param {string} chaveWebhook A chave da propriedade que contém a URL do Webhook.
 * @param {boolean} notificarNaPlanilhaEmCasoDeErro Se verdadeiro, mostrará um aviso "toast" na planilha em caso de falha.
 */
function enviarMensagemDiscord(mensagem, chaveWebhook, notificarNaPlanilhaEmCasoDeErro = false) {
  const WEBHOOK_URL = props.getProperty(chaveWebhook);

  if (!WEBHOOK_URL || !WEBHOOK_URL.startsWith('https://discord.com')) {
    Logger.log(`ERRO: Webhook para a chave "${chaveWebhook}" não configurado corretamente.`);
    if (notificarNaPlanilhaEmCasoDeErro) {
       SpreadsheetApp.getActiveSpreadsheet().toast(`A URL do webhook "${chaveWebhook}" não foi configurada.`, "🚨 Erro de Configuração", 10);
    }
    return;
  }

  const payload = JSON.stringify({ content: mensagem });
  const options = { method: "post", contentType: "application/json", payload: payload, muteHttpExceptions: true };
  
  try {
    const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
      throw new Error(`O Discord retornou um erro. Código: ${response.getResponseCode()}.`);
    }
  } catch (error) {
    Logger.log(`Falha ao enviar notificação via webhook "${chaveWebhook}". Detalhes: ${error.toString()}`);
    if (notificarNaPlanilhaEmCasoDeErro) {
      SpreadsheetApp.getActiveSpreadsheet().toast("Falha ao notificar o Discord. Verifique a URL do webhook.", "Falha na Notificação", 10);
    }
  }
}

/**
 * Formata um objeto de data para o formato "dd/mm".
 * @param {Date} data O objeto de data a ser formatado.
 * @return {string} A data formatada ou "N/D" se a data for inválida.
 */
function formatarData(data) {
  if (data && data.getTime && !isNaN(data.getTime())) {
    let dia = data.getDate().toString().padStart(2, '0');
    let mes = (data.getMonth() + 1).toString().padStart(2, '0');
    return `${dia}/${mes}`;
  }
  return "N/D";
}
