/**
 * ESTE ARQUIVO CONTÉM APENAS A LÓGICA DE CONFIGURAÇÃO.
 * Preencha os valores abaixo com seus dados reais e execute a função 'configurarPropriedades'
 * manualmente pelo editor sempre que precisar definir ou atualizar as
 * configurações do projeto.
 */

// --- Variáveis Globais para Configuração ---
// Estas variáveis são usadas apenas dentro desta função de configuração.
const DT = new Date();
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function configurarPropriedades() {
  // Limpa todas as propriedades antigas antes de salvar as novas.
  limparChave(); 
  
  // Calcula o nome da aba para o mês atual e anterior (Ex: SET 25)
  const nomeAbaAtual = `${((MESES[DT.getMonth()]).toUpperCase()).slice(0, 3)} ${(DT.getFullYear().toString()).slice(2, 4)}`;
  const mesAnterior = new Date(DT.getFullYear(), DT.getMonth() - 1, 1);
  const nomeAbaAnterior = `${((MESES[mesAnterior.getMonth()]).toUpperCase()).slice(0, 3)} ${(mesAnterior.getFullYear().toString()).slice(2, 4)}`;

  const properties = PropertiesService.getScriptProperties();

  properties.setProperties({
    // --- Configurações da Planilha ---
    'NOME_DA_ABA_PROJETOS': nomeAbaAtual,
    'NOME_DA_ABA_PROJETOS_ANTERIOR': nomeAbaAnterior,
    'ID_DA_PASTA_RAIZ': 'COLE_O_ID_DA_SUA_PASTA_RAIZ_DO_DRIVE_AQUI',

    // --- Textos de Status que Ativam as Automações (Exemplos) ---
    'VALOR_STATUS_PRONTO': '10 Pronto',
    'VALOR_STATUS_TRADUCAO': '03 Tradução',
    'VALOR_STATUS_REVISAO': '04 Revisão',
    'VALOR_STATUS_ASSINAR_DIGITAL': '07 Assinar Digital',
    'VALOR_STATUS_IMPRIMIR' : '05 Imprimir',
    'VALOR_STATUS_ASSINAR_IMPRIMIR' : '08 Assinar e Imprimir',
    'VALOR_STATUS_ESCANEAR': '01 Scan',
    'VALOR_STATUS_NUMERAR': '06 Numerar',
    'VALOR_STATUS_TRADUCAO_EXTERNA': '18 Tradução Externa',

    // --- Configurações de E-mail ---
    'REMETENTE_EMAIL': "seu-email@exemplo.com",
    'REMETENTE_NOME': 'Nome da Sua Empresa',
    'GOOGLE_DRIVE_LOGO_FILE_ID': 'COLE_O_ID_DO_ARQUIVO_DA_LOGO_AQUI',

    // --- CONFIGURAÇÕES DA OMIE ---
    'OMIE_APP_KEY': 'SUA_OMIE_APP_KEY',
    'OMIE_APP_SECRET': 'SUA_OMIE_APP_SECRET',
    'OMIE_URL': 'https://app.omie.com.br/api/v1/geral/clientes/',

    // --- Configurações do Discord (URLs dos Webhooks) ---
    'WEBHOOK_URL_TRADUCAO': 'COLE_A_URL_DO_SEU_WEBHOOK_AQUI',
    'WEBHOOK_URL_REVISAO': 'COLE_A_URL_DO_SEU_WEBHOOK_AQUI',
    'WEBHOOK_URL_ASSINAR_DIGITAL': 'COLE_A_URL_DO_SEU_WEBHOOK_AQUI',
    'WEBHOOK_URL_LEMBRETE_MENSAL': 'COLE_A_URL_DO_SEU_WEBHOOK_AQUI',
    'WEBHOOK_URL_IMPRIMIR' : 'COLE_A_URL_DO_SEU_WEBHOOK_AQUI',
    'WEBHOOK_URL_ASSINAR_IMPRIMIR' : 'COLE_A_URL_DO_SEU_WEBHOOK_AQUI',
    'WEBHOOK_HISTORICO': 'COLE_A_URL_DO_SEU_WEBHOOK_AQUI',

    // --- IDs Específicos (para mencionar usuários no Discord) ---
    'DISCORD_USER_ID_PARA_PING': 'COLE_O_ID_DO_USUARIO_AQUI',
    'DISCORD_USER_ID_TRADUTOR': 'COLE_O_ID_DO_USUARIO_AQUI'
  });
  
  // Roda a verificação para mostrar no log o que foi salvo.
  verificarPropriedadesSalvas(); 
}

/**
 * Limpa todas as propriedades salvas no script.
 * Útil para garantir que apenas as configurações mais recentes estejam ativas.
 */
function limparChave(){
  const props = PropertiesService.getScriptProperties();
  const todasAsChaves = props.getKeys();
  props.deleteProperties(todasAsChaves);
  Logger.log("Todas as propriedades antigas foram limpas.");
}

/**
 * FUNÇÃO DE DIAGNÓSTICO
 * Mostra no log todas as propriedades que estão salvas no momento.
 */
function verificarPropriedadesSalvas() {
  const props = PropertiesService.getScriptProperties();
  const todasAsChaves = props.getKeys();

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
