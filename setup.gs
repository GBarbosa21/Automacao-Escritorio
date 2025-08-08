/**
 * ESTE ARQUIVO CONTÉM APENAS A LÓGICA DE CONFIGURAÇÃO.
 * Preencha os valores abaixo e execute esta função manualmente sempre
 * que precisar definir ou atualizar as configurações do projeto.
 * * ATENÇÃO: ESTE ARQUIVO NÃO DEVE SER ENVIADO AO GITHUB COM DADOS REAIS.
 * Após a execução, limpe os valores, deixando apenas os placeholders.
 */
function configurarPropriedades() {
  const properties = PropertiesService.getScriptProperties();

  properties.setProperties({
    // --- Configurações Gerais da Planilha ---
    'NOME_DA_ABA_CLIENTES': 'CLIENTES', // Usado para funções que ainda podem precisar
    
    // --- Textos de Status que Ativam as Automações ---
    'VALOR_STATUS_PRONTO': '09 Pronto',
    'VALOR_STATUS_TRADUCAO': '03 Tradução',
    'VALOR_STATUS_REVISAO': '04 Revisão',
    'VALOR_STATUS_ASSINAR_DIGITAL': '07 Assinar Digital',

    // --- Configurações de E-mail (para o status "Pronto") ---
    'REMETENTE_EMAIL': 'seu-email-de-envio@exemplo.com',
    'REMETENTE_NOME': 'Nome da Sua Empresa ou Remetente',
    'GOOGLE_DRIVE_LOGO_FILE_ID': 'INSIRA_O_ID_DA_IMAGEM_DA_LOGO_DO_DRIVE',

    // --- Configurações da API da OMIE ---
    'OMIE_APP_KEY': 'INSIRA_SUA_OMIE_APP_KEY',
    'OMIE_APP_SECRET': 'INSIRA_SUA_OMIE_APP_SECRET',
    'OMIE_API_URL': 'https://app.omie.com.br/api/v1/geral/clientes/',
    
    // --- Configurações do Discord (URLs dos Webhooks) ---
    'WEBHOOK_URL_TRADUCAO': 'INSIRA_URL_DO_WEBHOOK_DE_TRADUCAO',
    'WEBHOOK_URL_REVISAO': 'INSIRA_URL_DO_WEBHOOK_DE_REVISAO',
    'WEBHOOK_URL_ASSINAR_DIGITAL': 'INSIRA_URL_DO_WEBHOOK_ASSINAR_DIGITAL',
    'WEBHOOK_URL_LEMBRETE_MENSAL': 'INSIRA_A_URL_DO_WEBHOOK_PARA_LEMBRETES',

    // --- IDs Específicos (para mencionar usuários no Discord) ---
    'DISCORD_USER_ID_PARA_PING': 'INSIRA_O_ID_DO_USUARIO_A_SER_MENCIONADO'
  });

  SpreadApp.getUi().alert('Propriedades do script configuradas com sucesso!');
}
