/**
 * @OnlyCurrentDoc
 * @version 9.0
 * ARQUIVO PRINCIPAL
 * Este arquivo contém os gatilhos (roteadores) e a inicialização das
 * configurações globais do projeto.
 */

// --- Leitura das Propriedades Globais ---
const props = PropertiesService.getScriptProperties();

const VALOR_STATUS_PRONTO = props.getProperty('VALOR_STATUS_PRONTO');
const VALOR_STATUS_TRADUCAO = props.getProperty('VALOR_STATUS_TRADUCAO');
const VALOR_STATUS_REVISAO = props.getProperty('VALOR_STATUS_REVISAO');
const VALOR_STATUS_ASSINAR_DIGITAL = props.getProperty('VALOR_STATUS_ASSINAR_DIGITAL');

// --- Constantes de Colunas ---
const COLUNA_STATUS = 8;
const COLUNA_NOME_CLIENTE = 3;
const COLUNA_ID_PROJETO = 4;
const COLUNA_NOTIFICACAO_ENVIADA = 24;
const COLUNA_DATA_ENTREGA = 7;
const COLUNA_DATA_CHECK = 2;
const COLUNA_URGENCIA = 9;


/**
 * GATILHO PRINCIPAL POR EDIÇÃO - Roteador de Ações onEdit.
 * Esta é a ÚNICA função que deve ser configurada como gatilho "Ao editar".
 * @param {object} e O objeto de evento do gatilho onEdit.
 */
function masterOnEdit(e) {
  if (!e || !e.range) return;

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const nomeAbaEsperado = `${(meses[new Date().getMonth()]).toUpperCase()} ${new Date().getFullYear()}`;
  
  const celula = e.range;
  const planilha = celula.getSheet();
  
  if (planilha.getName() === nomeAbaEsperado && celula.getColumn() === COLUNA_STATUS) {
    const linhaEditada = celula.getRow();
    
    // Roteador de Ações
    if (e.value === VALOR_STATUS_PRONTO) {
      handleEmailPronto(planilha, linhaEditada);
    } else if (e.value === VALOR_STATUS_TRADUCAO) {
      handleDiscordTraducao(planilha, linhaEditada);
    } else if (e.value === VALOR_STATUS_REVISAO) {
      handleDiscordRevisao(planilha, linhaEditada);
    } else if (e.value === VALOR_STATUS_ASSINAR_DIGITAL) {
      handleDiscordAssinatura(planilha, linhaEditada);
    }
  }
}

/**
 * GATILHO POR TEMPO - Envia um lembrete mensal para criar pastas.
 * Esta função deve ser configurada com um acionador de tempo (ex: todo dia 25 do mês).
 */
function enviarLembreteMensal() {
  handleLembreteMensal();
}
