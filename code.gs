/**
 * @OnlyCurrentDoc
 * @version 8.0
 * ARQUIVO PRINCIPAL
 * Este arquivo contém os gatilhos (roteadores) e a inicialização das
 * configurações globais do projeto.
 */

// --- Leitura das Propriedades Globais ---
const props = PropertiesService.getScriptProperties();

const NOME_DA_ABA_PROJETOS = props.getProperty('NOME_DA_ABA_PROJETOS');
const VALOR_STATUS_PRONTO = props.getProperty('VALOR_STATUS_PRONTO');
const VALOR_STATUS_TRADUCAO = props.getProperty('VALOR_STATUS_TRADUCAO');
const VALOR_STATUS_REVISAO = props.getProperty('VALOR_STATUS_REVISAO');
const VALOR_STATUS_ASSINAR_DIGITAL = props.getProperty('VALOR_STATUS_ASSINAR_DIGITAL');
const VALOR_STATUS_IMPRIMIR = props.getProperty('VALOR_STATUS_IMPRIMIR');
const VALOR_STATUS_ASSINAR_IMPRIMIR = props.getProperty('VALOR_STATUS_ASSINAR_IMPRIMIR');
const VALOR_STATUS_ESCANEAR = props.getProperty('VALOR_STATUS_ESCANEAR');
const VALOR_STATUS_NUMERAR = props.getProperty('VALOR_STATUS_NUMERAR');
const VALOR_STATUS_TRADUCAO_EXTERNA = props.getProperty('VALOR_STATUS_TRADUCAO_EXTERNA');
const ID_DA_PASTA_RAIZ = props.getProperty('ID_DA_PASTA_RAIZ');
const OMIE_APP_KEY = props.getProperty('OMIE_APP_KEY');
const OMIE_APP_SECRET = props.getProperty('OMIE_APP_SECRET');
const OMIE_URL = props.getProperty('OMIE_URL');
const REMETENTE_EMAIL = props.getProperty('REMETENTE_EMAIL');
const REMETENTE_NOME = props.getProperty('REMETENTE_NOME');
const USER_ISABELLA = props.getProperty('DISCORD_USER_ID_ISABELLA');
const USER_GUSTAVO = props.getProperty('DISCORD_USER_ID_PARA_PING');

// --- Constantes de Colunas ---
const COLUNA_STATUS = 8;
const COLUNA_NOME_CLIENTE = 3;
const COLUNA_DATA_ENTREGA = 2;
const COLUNA_ID_PROJETO = 4;
const COLUNA_NOTIFICACAO_ENVIADA = 24;
const COLUNA_URGENCIA = 9;
const COLUNA_TIPO_ENTREGA = 19;
const DT = new Date();
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

/**
 * GATILHO PRINCIPAL POR EDIÇÃO - Roteador de Ações onEdit.
 * Esta é a ÚNICA função que deve ser configurada como gatilho "Ao editar".
 * @param {object} e O objeto de evento do gatilho onEdit.
 */
function masterOnEdit(e) {
  if (!e || !e.range) return;

  // --- INÍCIO DO NOVO BLOCO DE DEBUG ---
  try {
    const valorEditado = e.value;
    const nomeAba = e.range.getSheet().getName();
    const colunaEditada = e.range.getColumn();
    
    Logger.log("--- Nova Edição Detectada ---");
    Logger.log("Nome da aba da planilha: " + NOME_DA_ABA_PROJETOS);
    Logger.log("Aba editada: " + nomeAba);
    Logger.log("Coluna editada: " + colunaEditada);
    Logger.log("Valor inserido: " + valorEditado);
  } catch(err) {
    Logger.log("Erro ao tentar ler as propriedades do evento de edição");
    return;
  }

  const celula = e.range;
  const planilha = celula.getSheet();

  // --- FIM DO NOVO BLOCO DE DEBUG ---

  if (planilha.getName() === NOME_DA_ABA_PROJETOS && (celula.getColumn() === COLUNA_STATUS || celula.getColumn() === COLUNA_URGENCIA)) {
    
    const linhaEditada = celula.getRow();
    const nomeCliente = planilha.getRange(linhaEditada, COLUNA_NOME_CLIENTE).getValue().trim();
    const idProjeto = planilha.getRange(linhaEditada, COLUNA_ID_PROJETO).getValue();
    const celulaNotificacao = planilha.getRange(linhaEditada, COLUNA_NOTIFICACAO_ENVIADA);
    const dataEntregaObj = planilha.getRange(linhaEditada, COLUNA_DATA_ENTREGA).getValue();
    const statusCliente = planilha.getRange(linhaEditada, COLUNA_STATUS).getValue().toUpperCase();
    let urgencia = planilha.getRange(linhaEditada, COLUNA_URGENCIA).getValue();

    if(urgencia === "SIM"){ urgencia = " com urgência :rotating_light:"; } else { urgencia = ""; }

    const m = (DT.getMonth() + 1) < 10 ? "0" + (DT.getMonth() + 1) : (DT.getMonth() + 1);
    const mesFormatado = `${m} ${NOME_DA_ABA_PROJETOS}`;

    const cliente = [linhaEditada, nomeCliente, idProjeto, urgencia, mesFormatado, celulaNotificacao, dataEntregaObj, e.value, e.oldValue, statusCliente];
    console.log(cliente[6])
  
    // Roteador de Ações
    if (cliente[7] === VALOR_STATUS_PRONTO || cliente[7] === "09 Pronto") {
      handleEmailPronto(cliente);
    } else if (cliente[7] === VALOR_STATUS_TRADUCAO || cliente[7] === "03 Traduzir") {
      handleDiscordTraducao(cliente);
    } else if (cliente[7] === VALOR_STATUS_REVISAO) {
      handleDiscordRevisao(cliente);
    } else if (cliente[7] === VALOR_STATUS_ASSINAR_DIGITAL) {
      handleDiscordAssinatura(cliente);
    } else if (cliente[7] === VALOR_STATUS_IMPRIMIR) {
      handleDiscordImprimir(cliente);
    } else if (cliente[7] === VALOR_STATUS_ASSINAR_IMPRIMIR) {
      handleDiscordAssinarImprimir(cliente);
    } else if (cliente[7] === VALOR_STATUS_ESCANEAR || cliente[7] === "01 Escanear") {
      moverPasta(cliente);
    } else if (cliente[7] === VALOR_STATUS_NUMERAR) {
      moverPasta(cliente);
    } else if (cliente[7] === VALOR_STATUS_TRADUCAO_EXTERNA) {
      moverPasta(cliente);
    } else if (celula.getColumn() === COLUNA_URGENCIA) {
      handleDiscordUrgencia(cliente);
    } else {
      Logger.log("A condição inicial (nome da aba ou coluna) não foi atendida. Encerrando.");
    }
  }
}

/**
 * GATILHO POR TEMPO - Envia um lembrete mensal para criar pastas.
 * Esta função deve ser configurada com um acionador de tempo (ex: todo dia 25 do mês).
 */
function enviarLembreteMensal() { handleLembreteMensal(); }
