function handleDiscordTraducao(planilha, linha) {
  // ... (lógica para pegar nome e id)
  if (nomeCliente && idProjeto) {
    const mensagem = `O orçamento ${idProjeto} - ${nomeCliente} está em Tradução!`;
    // Passando 'true' para ativar o aviso na planilha em caso de erro
    enviarMensagemDiscord(mensagem, 'WEBHOOK_URL_TRADUCAO', true);
  }
}

function handleDiscordRevisao(planilha, linha) {
  // ... (lógica para pegar nome e id)
  if (nomeCliente && idProjeto) {
    const mensagem = `O orçamento ${idProjeto} - ${nomeCliente} está em Revisão!`;
    // Passando 'true' para ativar o aviso na planilha em caso de erro
    enviarMensagemDiscord(mensagem, 'WEBHOOK_URL_REVISAO', true);
  }
}

// IMPORTANTE: Os outros handlers (handleDiscordAssinatura, handleLembreteMensal)
// não passam 'true', então eles não mostrarão o aviso na tela em caso de erro.
