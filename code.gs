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

// --- Constantes de Colunas ---
const COLUNA_STATUS = 8;
const COLUNA_NOME_CLIENTE = 3;
const COLUNA_ID_PROJETO = 4;
const COLUNA_NOTIFICACAO_ENVIADA = 24;


/**
 * GATILHO PRINCIPAL POR EDIÇÃO - Roteador de Ações onEdit.
 * Esta é a ÚNICA função que deve ser configurada como gatilho "Ao editar".
 * @param {object} e O objeto de evento do gatilho onEdit.
 */
function masterOnEdit(e) {
  if (!e || !e.range) return;

  const celula = e.range;
  const planilha = celula.getSheet();
  
  if (planilha.getName() === NOME_DA_ABA_PROJETOS && celula.getColumn() === COLUNA_STATUS) {
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
