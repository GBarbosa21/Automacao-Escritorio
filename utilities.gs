/**
 * ARQUIVO DE UTILITÁRIOS
 * Contém funções auxiliares e reutilizáveis que dão suporte
 * aos handlers e outras partes do código.
 */

/**
 * Busca o e-mail de um cliente na API da Omie usando o nome pois não obtemos CPF.
 */
function buscarEmailClienteOmie(nome) {
  if (!OMIE_APP_KEY || !OMIE_APP_SECRET || !OMIE_URL) {
    Logger.log("ERRO: As credenciais da API da Omie não estão configuradas no Setup.gs");
    return null;
  }

  const payload = {
    "call": "ListarClientes",
    "app_key": OMIE_APP_KEY,
    "app_secret": OMIE_APP_SECRET,
    "param": [{
      "registros_por_pagina": 5000, // Limita a busca para performance
      "clientesFiltro": {
        "nome_fantasia": nome.trim()
      }
    }]
  };

  const options = {
    "method": "POST",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    const response = UrlFetchApp.fetch(OMIE_URL, options);
    const data = JSON.parse(response.getContentText());

    if (response.getResponseCode() !== 200 || data.faultstring) {
      Logger.log("Erro na API Omie: " + (data.faultstring || response.getContentText()));
      return null;
    }

    if (data && data.clientes_cadastro && data.clientes_cadastro.length > 0) {
      // Procura pela correspondência exata para garantir que é o cliente certo
      for (const cliente of data.clientes_cadastro) {
        if (cliente.nome_fantasia.trim().toUpperCase() === nome.trim().toUpperCase()) {
          Logger.log(`Cliente "${nome}" encontrado na Omie. E-mail: ${cliente.email}`);
          return cliente.email; // Retorna o e-mail para o handler usar
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

function formatarData(data) {
  if (data && data.getTime && !isNaN(data.getTime())) {
    let dia = data.getDate().toString().padStart(2, '0');
    let mes = (data.getMonth() + 1).toString().padStart(2, '0'); // getMonth() é base 0, então somamos 1
    return `${dia}/${mes}`;
  }
  return "N/D"; // Retorna "Não Disponível" se a célula estiver vazia ou com erro
}

function testarAcessoAoDrive() {
  try {
    // Tenta a operação mais básica de acesso ao Drive
    const pastas = DriveApp.getFolders();
    Logger.log("SUCESSO: O acesso ao DriveApp está funcionando.");
  } catch (e) {
    Logger.log("FALHA: Erro ao acessar o DriveApp: " + e.toString());
  }
}

/**
 * Encontra a primeira pasta com um nome exato usando a busca nativa do Drive.
 * É muito mais rápido que a busca recursiva.
 * @param {string} nomeDaPasta O nome exato da pasta a ser encontrada.
 * @returns {GoogleAppsScript.Drive.Folder | null} O objeto da pasta ou null se não for encontrado.
 */


function encontrarPastaPorNome(nomeDaPasta) {
  const query = `title = '${nomeDaPasta.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  
  Logger.log(`Executando busca no Drive com a query: ${query}`);
  
  const pastas = DriveApp.searchFolders(query);
  
  if (pastas.hasNext()) {
    const pastaEncontrada = pastas.next();
    Logger.log(`Pasta "${nomeDaPasta}" encontrada com ID: ${pastaEncontrada.getId()}`);
    if (pastas.hasNext()) {
      Logger.log(`AVISO: Múltiplas pastas com o nome "${nomeDaPasta}" foram encontradas. Usando a primeira.`);
    }

    return pastaEncontrada;
    
  } else {
    Logger.log(`AVISO: Nenhuma pasta com o nome "${nomeDaPasta}" foi encontrada na busca.`);
    return null;
  }
}

/**
 * Encontra uma pasta por caminho e fornece logs detalhados em caso de falha.
 */
function getPastaPorCaminhoComLogs(pontoDePartida, caminho) {
  Logger.log(`Iniciando busca pelo caminho "${caminho}" a partir de "${pontoDePartida.getName()}".`);
  const nomesDasPastas = caminho.split('/');
  let pastaAtual = pontoDePartida;

  for (let i = 0; i < nomesDasPastas.length; i++) {
    const nomeDaPasta = nomesDasPastas[i].trim();
    const subpastas = pastaAtual.getFoldersByName(nomeDaPasta);

    if (subpastas.hasNext()) {
      pastaAtual = subpastas.next();
      Logger.log(` -> Encontrado: "${pastaAtual.getName()}"`);
    } else {
      Logger.log(`--> ERRO: Não foi possível encontrar a subpasta "${nomeDaPasta}" dentro de "${pastaAtual.getName()}".`);
      return null; 
    }
  }
  Logger.log('Caminho completo encontrado.');
  return pastaAtual;
}

/**
 * Pega a linha atualmente selecionada, busca a pasta correspondente no Drive
 * e mostra um pop-up com o link para abri-la.
 */

function abrirPastaDaLinhaSelecionada() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getActiveRange();
  
  // Pega a primeira linha da seleção do usuário
  const linhaSelecionada = range.getRow();

  // Garante que o usuário não selecionou o cabeçalho
  if (linhaSelecionada < 2) {
    ui.alert("Por favor, selecione uma linha de projeto válida (abaixo do cabeçalho).");
    return;
  }

  // Pega os dados das colunas C e D da linha selecionada
  const nomeCliente = sheet.getRange(linhaSelecionada, 3).getValue().toString().trim(); // Coluna C
  const idProjeto = sheet.getRange(linhaSelecionada, 4).getValue().toString().trim();   // Coluna D

  if (!idProjeto || !nomeCliente) {
    ui.alert("A linha selecionada não contém um Nº de Orçamento ou Nome de Cliente válidos.");
    return;
  }

  // Monta o nome da pasta usando o padrão correto
  const nomeDaPasta = `Orç_${idProjeto} - ${nomeCliente}`;
  
  // Usa a função GET_FOLDER_URL que já temos para buscar a URL
  const urlDaPasta = GET_FOLDER_URL(idProjeto, nomeCliente);

  if (urlDaPasta.startsWith("http")) {
    // Se encontrou a URL, mostra um pop-up com o link clicável
    const html = `<p>Pasta encontrada! Clique no link abaixo para abrir:</p>
                  <p style="font-size: 14px;">
                    <a href="${urlDaPasta}" target="_blank" onclick="google.script.host.close()">
                      📂 Abrir Pasta: ${nomeDaPasta}
                    </a>
                  </p>`;
    const htmlOutput = HtmlService.createHtmlOutput(html)
        .setWidth(450)
        .setHeight(150);
    ui.showModalDialog(htmlOutput, 'Link da Pasta do Projeto');
  } else {
    // Se não encontrou, avisa o usuário
    ui.alert(`Resultado da busca: ${urlDaPasta}\n\nVerifique se o nome do cliente e o nº do orçamento na planilha correspondem exatamente ao nome da pasta no Drive.`);
  }
}

function processarPasta(pasta, logDeCorrecoes) {
  const nomeOriginal = pasta.getName();
  let nomeCorrigido = nomeOriginal;

  nomeCorrigido = nomeCorrigido.replace(/\s{2,}/g, ' ');
  nomeCorrigido = nomeCorrigido.replace(/\s*-\s*/g, ' - ');
  nomeCorrigido = nomeCorrigido.replace(/(\d+)\s*-\s*(\d+)(?!\s*[a-zA-Z])/g, '$1-$2');
  nomeCorrigido = nomeCorrigido.trim();

  if (nomeOriginal !== nomeCorrigido) {
    try {
      pasta.setName(nomeCorrigido);
      const log = `RENOMEADO: "${nomeOriginal}" -> "${nomeCorrigido}"`;
      logDeCorrecoes.push(log);
    } catch (e) {
      Logger.log(`FALHA AO RENOMEAR: "${nomeOriginal}". Motivo: ${e.message}`);
    }
  }

  const subpastas = pasta.getFolders();
  while (subpastas.hasNext()) {
    processarPasta(subpastas.next(), logDeCorrecoes);
  }
}

/**
 * Procura por uma pasta no Google Drive pelo nome e retorna sua URL.
 * Esta versão é robusta e fornece feedback claro de erro diretamente na célula.
 * @param {string} idProjeto O número do orçamento (ex: da Coluna D).
 * @param {string} nomeCliente O nome do cliente (ex: da Coluna C).
 * @return {string} A URL da pasta ou uma mensagem de erro clara.
 * @customfunction
 */
function GET_FOLDER_URL(idProjeto, nomeCliente) {
  // Verificação 1: Garante que os dados da planilha não estão vazios.
  if (!idProjeto) {
    return "ERRO: Nº do Orçamento está vazio.";
  }
  if (!nomeCliente) {
    return "ERRO: Nome do Cliente está vazio.";
  }

  // Monta o nome exato da pasta que estamos procurando, limpando possíveis espaços extras.
  const nomeDaPasta = `Orç_${String(idProjeto).trim()} - ${String(nomeCliente).trim()}`;
  
  try {
    const pastas = DriveApp.getFoldersByName(nomeDaPasta);
    
    // Verificação 2: Garante que a pasta foi encontrada.
    if (pastas.hasNext()) {
      const pasta = pastas.next();
      return pasta.getUrl(); // SUCESSO! Retorna a URL.
    } else {
      return "Pasta não encontrada"; // Mensagem de erro clara.
    }
  } catch (e) {
    return "Erro de Script: " + e.toString(); // Mensagem de erro para problemas maiores.
  }
}
