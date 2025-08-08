/**
 * @OnlyCurrentDoc
 * @version 2.0
 * * Este script envia um e-mail de notificação para o cliente quando o status de um projeto
 * é alterado para "Pronto" em uma planilha.
 * * Utiliza o PropertiesService do Google Apps Script para gerenciar configurações e dados
 * sensíveis (como e-mails e nomes de abas), permitindo que o código seja versionado no
 * GitHub de forma segura, sem expor informações privadas.
 */


/**
 * ------------------------------------------------------------------------------------------
 * FUNÇÃO DE CONFIGURAÇÃO - EXECUTAR MANUALMENTE APENAS UMA VEZ
 * ------------------------------------------------------------------------------------------
 * ESTA É A VERSÃO "LIMPA" PARA O GITHUB.
 * Quem for usar o código deve preencher os valores abaixo localmente e executar a função.
 * NÃO FAÇA COMMIT DESTE BLOCO PREENCHIDO COM DADOS REAIS.
 */
function configurarPropriedades() {
  const properties = PropertiesService.getScriptProperties();

  properties.setProperties({
    // --- Configurações da Planilha ---
    'NOME_DA_ABA_PROJETOS': 'INSIRA_NOME_DA_ABA_DE_PROJETOS',
    'NOME_DA_ABA_CLIENTES': 'INSIRA_NOME_DA_ABA_DE_CLIENTES',
    'VALOR_STATUS_PRONTO': 'INSIRA_O_TEXTO_DO_STATUS_PRONTO',
    
    // --- Configurações de E-mail ---
    'REMETENTE_EMAIL': 'insira-seu-email-de-envio@exemplo.com',
    'REMETENTE_NOME': 'Insira o Nome da Sua Empresa ou Remetente'
  });

  SpreadsheetApp.getUi().alert('Propriedades do script configuradas com sucesso!');
}


/**
 * ------------------------------------------------------------------------------------------
 * INÍCIO DO CÓDIGO PRINCIPAL
 * ------------------------------------------------------------------------------------------
 */

// --- CONFIGURAÇÕES GLOBAIS ---
// As configurações agora são lidas do PropertiesService para segurança.
const props = PropertiesService.getScriptProperties();

const NOME_DA_ABA_PROJETOS = props.getProperty('NOME_DA_ABA_PROJETOS'); 
const NOME_DA_ABA_CLIENTES = props.getProperty('NOME_DA_ABA_CLIENTES');
const VALOR_STATUS_PRONTO = props.getProperty('VALOR_STATUS_PRONTO');
const REMETENTE_EMAIL = props.getProperty('REMETENTE_EMAIL');
const REMETENTE_NOME = props.getProperty('REMETENTE_NOME');

// Colunas (geralmente não precisam ser secretas, mas podem ser adicionadas acima se preferir)
const COLUNA_STATUS = 8;
const COLUNA_NOME_CLIENTE = 3;
const COLUNA_ID_PROJETO = 4;
const COLUNA_NOTIFICACAO_ENVIADA = 24;


/**
 * Gatilho que é ativado quando o usuário edita a planilha.
 * @param {object} e O objeto de evento do gatilho onEdit.
 */
function enviarEmailSePronto(e) {
  if (!e || !e.source) {
    return;
  }

  const planilha = e.source.getActiveSheet();
  const celulaEditada = e.range;

  // Condição 1: A edição foi na aba, coluna e com o valor corretos?
  if (planilha.getName() === NOME_DA_ABA_PROJETOS && celulaEditada.getColumn() === COLUNA_STATUS && e.value === VALOR_STATUS_PRONTO) {
    const linhaEditada = celulaEditada.getRow();
    const celulaNotificacao = planilha.getRange(linhaEditada, COLUNA_NOTIFICACAO_ENVIADA);
    
    // Condição 2: A notificação ainda não foi enviada para esta linha?
    if (celulaNotificacao.getValue() == "") {
      const nomeCliente = planilha.getRange(linhaEditada, COLUNA_NOME_CLIENTE).getValue();
      const idProjeto = planilha.getRange(linhaEditada, COLUNA_ID_PROJETO).getValue();
      
      if (nomeCliente) {
        const emailCliente = buscarEmailDoCliente(nomeCliente);
        
        if (emailCliente) {
          const assunto = `Seu pedido (Nº ${idProjeto}) está pronto!`;
          const corpoEmail = `
            <p>Olá, ${nomeCliente},</p>
            <p>Informamos que sua tradução, referente ao Orçamento <strong>Nº ${idProjeto}</strong>, foi concluída e já está pronta para retirada.</p>
            <p>Retiradas podem ser feitas em qualquer dia útil (segunda a sexta), a partir das 16:00 ás 17:15</p>
            <p>Qualquer dúvida, estamos à disposição.</p>
            <br>
            <p>Atenciosamente,</p>
            <p><strong>${REMETENTE_NOME}</strong></p>
          `;
          
          // Envia o e-mail usando as configurações seguras do PropertiesService
          GmailApp.sendEmail(emailCliente, assunto, "", {
              htmlBody: corpoEmail,
              from: REMETENTE_EMAIL,
              name: REMETENTE_NOME // Define o nome que aparece para o destinatário
          });
          
          // Marca a linha como notificada para não enviar novamente
          celulaNotificacao.setValue("Enviado em " + new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"}));
        }
      }
    }
  }
}

/**
 * Busca o email de um cliente na aba "CLIENTES".
 * @param {string} nomeDoCliente O nome do cliente a ser procurado.
 * @return {string|null} O email do cliente ou null se não for encontrado.
 */
function buscarEmailDoCliente(nomeDoCliente) {
  const abaClientes = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOME_DA_ABA_CLIENTES);
  if (!abaClientes) {
    Logger.log(`Aba de clientes "${NOME_DA_ABA_CLIENTES}" não encontrada.`);
    return null;
  }
  const dados = abaClientes.getDataRange().getValues();

  for (let i = 1; i < dados.length; i++) { // Começa em i = 1 para pular o cabeçalho
    if (dados[i][0] && dados[i][0].toString().trim().toLowerCase() === nomeDoCliente.toString().trim().toLowerCase()) {
      return dados[i][1]; // Retorna o email da coluna B
    }
  }
  Logger.log(`E-mail para o cliente "${nomeDoCliente}" não encontrado.`);
  return null;
}
