/**
 * ESTE ARQUIVO CONTÉM APENAS A LÓGICA DE CONFIGURAÇÃO.
 * Preencha os valores abaixo com seus dados reais e execute a função 'configurarPropriedades'
 * manualmente pelo editor sempre que precisar definir ou atualizar as
 * configurações do projeto.
 * * ATENÇÃO: ESTE ARQUIVO NÃO DEVE SER ENVIADO AO GITHUB COM DADOS REAIS.
 * Após a execução, limpe os valores, deixando apenas os placeholders.
 */

function configurarPropriedades() {
  limparChave()
  const nomeAbaEsperado = `${((MESES[DT.getMonth()]).toUpperCase()).slice(0, 3)} ${(DT.getFullYear().toString()).slice(2, 4)}`;

  const properties = PropertiesService.getScriptProperties();

  properties.setProperties({
    // --- Textos de Status que Ativam as Automações ---
    'NOME_DA_ABA_PROJETOS': nomeAbaEsperado,
    'VALOR_STATUS_PRONTO': '10 Pronto',
    'VALOR_STATUS_TRADUCAO': '03 Tradução',
    'VALOR_STATUS_REVISAO': '04 Revisão',
    'VALOR_STATUS_ASSINAR_DIGITAL': '07 Assinar Digital',
    'VALOR_STATUS_IMPRIMIR' : '05 Imprimir',
    'VALOR_STATUS_ASSINAR_IMPRIMIR' : '08 Assinar e Imprimir',
    'VALOR_STATUS_URGENCIA' : 'SIM',
    'VALOR_STATUS_ESCANEAR': '01 Scan',
    'VALOR_STATUS_NUMERAR': '06 Numerar',
    'VALOR_STATUS_TRADUCAO_EXTERNA': '18 Tradução Externa',
    'ID_DA_PASTA_RAIZ': '0AByEce1yHzEeUk9PVA',

    // --- Configurações de E-mail (para o status "Pronto") ---
    'REMETENTE_EMAIL': "contato@isabellafortunato.com",
    'REMETENTE_NOME': 'Isabella Fortunato Traducões',
    'GOOGLE_DRIVE_LOGO_FILE_ID': '1GGLzG438lDQknJUOlWugLAxi9r1J3n54',

    // --- CONFIGURAÇÕES DA OMIE ---
    // Lembre-se de mover para o PropertiesService para maior segurança depois.
    'OMIE_APP_KEY': '6235577431083',
    'OMIE_APP_SECRET': '6c61b9c33ae815e5d56f7aa011bc34b1',
    'OMIE_URL': 'https://app.omie.com.br/api/v1/geral/clientes/',


    // --- Configurações do Discord (URLs dos Webhooks) ---
    'WEBHOOK_URL_TRADUCAO': 'https://discord.com/api/webhooks/1403089483624218746/R69qLBhPImca-mMsABkP9NO3tMKUr-AZvnXeXryczNikXLRa96SPTC5bA-WjbDr8PZWE',
    'WEBHOOK_URL_REVISAO': 'https://discord.com/api/webhooks/1403090294832103454/ohD5PhaM0j5zSrLAq0BePBwMnv3fOqrJHn8lvccPjNIh6pj76JpD8X42UFEpj3YkvDn8',
    'WEBHOOK_URL_ASSINAR_DIGITAL': 'https://discord.com/api/webhooks/1403089483624218746/R69qLBhPImca-mMsABkP9NO3tMKUr-AZvnXeXryczNikXLRa96SPTC5bA-WjbDr8PZWE',
    'WEBHOOK_URL_LEMBRETE_MENSAL': 'https://discord.com/api/webhooks/1403051502133579798/bIn3tMJ7zC_eh9xr977B0zXdGpH7Ugq7ORTtX-8Bf6GU0uMiABmNkNPwJY1JR9oe71Nb',
    'WEBHOOK_URL_IMPRIMIR' : 'https://discord.com/api/webhooks/1409627991335632916/oe-Thxztmu1IQc_S4_8__VYVc9XcV4r1t0W47_0oVcJbtKhx6DNw5ygHDDCW2kRenvqQ',
    'WEBHOOK_URL_ASSINAR_IMPRIMIR' : 'https://discord.com/api/webhooks/1403043934686679185/BCSPjnDcvm-3iEv2qSMa1pgxZDM3kogy6gdaieLz2zcPOq-44H3zDlOdyPYVRYbh1OXz',
    'WEBHOOK_URL_TESTE': 'https://discord.com/api/webhooks/1402717095598489693/auI8QhujaNSr-R3b209f4kmmpc3clKns-irVrlGMshA3HgLN4lwDKmqrUR9W5Jif08Ts',

    // --- IDs Específicos (para mencionar usuários no Discord) ---
    'DISCORD_USER_ID_PARA_PING': '1384176323672412201',
    'DISCORD_USER_ID_ISABELLA': '730523951708635177'
  });
  verificarPropriedadesSalvas()
}

function limparChave(){
  const props = PropertiesService.getScriptProperties();
  const todasAsChaves = props.getKeys(); // Pega todas as chaves salvas
  todasAsChaves.forEach(function(key) {
  props.deleteProperty(key);
});
}

/**
 * FUNÇÃO DE DIAGNÓSTICO
 */
function verificarPropriedadesSalvas() {
  const props = PropertiesService.getScriptProperties();
  const todasAsChaves = props.getKeys(); // Pega todas as chaves salvas

  if (todasAsChaves.length === 0) {
    Logger.log("NENHUMA propriedade está salva para este script.");
    return;
  }
  
  Logger.log("--- Propriedades Salvas Atualmente ---");
  todasAsChaves.forEach(function(chave) {
    const valor = props.getProperty(chave);
    Logger.log(`CHAVE: '${chave}' | VALOR: '${valor}'`);
  });
  Logger.log("------------------------------------");
}
