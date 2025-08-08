Com certeza.

Eu não consigo gerar um arquivo para download direto, mas posso fornecer o conteúdo completo e formatado. Você só precisa copiar o bloco de texto abaixo e colar em um novo arquivo de texto.

Instruções:
Copie todo o conteúdo do bloco de código abaixo.

No seu computador, na pasta do seu projeto, crie um novo arquivo.

Nomeie o arquivo exatamente como README.md (a extensão .md é importante).

Cole o conteúdo que você copiou dentro deste novo arquivo e salve.

Pronto! Ao fazer isso, você terá o arquivo de documentação perfeito para o seu repositório no GitHub.

Conteúdo para o arquivo README.md
Markdown

# Automação de Projetos com Google Sheets e Discord

![Google Apps Script](https://img.shields.io/badge/Google-Apps%20Script-blue?style=for-the-badge&logo=google)

Este projeto em Google Apps Script monitora uma planilha de controle de projetos e envia notificações automáticas via E-mail e Discord com base na alteração de status, otimizando a comunicação e o acompanhamento do fluxo de trabalho.

## ✨ Funcionalidades

- **Notificação por E-mail:** Envia um e-mail formatado em HTML para o cliente final quando um projeto é marcado como "Pronto".
- **Notificações no Discord:** Publica mensagens em canais específicos do Discord quando um projeto entra nos status de "Tradução", "Revisão" e "Assinar Digital".
- **Lembrete Mensal:** Envia uma mensagem agendada para um canal do Discord, mencionando um usuário específico para realizar tarefas administrativas (como criar pastas do mês).
- **Gestão Segura de Configurações:** Utiliza o `PropertiesService` nativo do Google para armazenar de forma segura todas as informações sensíveis (URLs de webhook, e-mails, etc.), mantendo o código-fonte limpo e seguro.
- **Notificação de Erros na Tela:** Informa o usuário diretamente na interface da planilha com uma notificação "toast" caso ocorra uma falha no envio de notificações críticas para o Discord.

## 📂 Estrutura do Projeto

O código é organizado de forma modular para facilitar a manutenção e a escalabilidade:

.
├── Code.gs             # Arquivo principal, contém os gatilhos e constantes globais.
├── Handlers.gs         # Contém a lógica de negócio para cada tipo de notificação.
├── Utilities.gs        # Funções auxiliares reutilizáveis (envio de mensagem, busca de e-mail).
└── Setup.gs            # Script para configuração inicial do ambiente (NÃO ENVIAR COM DADOS).


## 🚀 Instalação e Configuração

Siga estes passos para configurar o projeto em seu próprio ambiente Google.

**1. Copie o Código:**
   - Crie um novo projeto no [Google Apps Script](https://script.google.com).
   - Crie os 4 arquivos de script (`Code.gs`, `Handlers.gs`, `Utilities.gs`, `Setup.gs`) e copie o conteúdo correspondente para cada um.

**2. Configure as Propriedades:**
   - Abra o arquivo `Setup.gs`.
   - Preencha os valores das propriedades (URLs, e-mails, etc.) com suas informações reais.
   - No editor do Apps Script, selecione a função `configurarPropriedades` na barra de ferramentas e clique em **Executar**. Isso salvará suas configurações de forma segura.
   - **IMPORTANTE:** Após a execução, apague seus dados do arquivo `Setup.gs`, deixando apenas os textos de exemplo (`INSIRA_...`). Isso garante que nenhuma informação sensível será enviada ao GitHub.

**3. Configure os Gatilhos (Acionadores):**
   - No menu à esquerda, clique em **Acionadores** (ícone de relógio).
   - Clique em **Adicionar acionador** e configure os dois gatilhos necessários:
     - **Gatilho 1 (para edições na planilha):**
       - Escolha a função a ser executada: `masterOnEdit`
       - Escolha a implantação: `Head`
       - Selecione a fonte do evento: `Da planilha`
       - Selecione o tipo de evento: `Ao editar`
       - Salve.
     - **Gatilho 2 (para o lembrete mensal):**
       - Escolha a função a ser executada: `enviarLembreteMensal`
       - Escolha a implantação: `Head`
       - Selecione a fonte do evento: `Acionador de tempo`
       - Selecione o tipo de acionador baseado em tempo: `Mensal`
       - Selecione o dia do mês (ex: `Todo dia 25`) e um horário.
       - Salve.

## 🛠️ Detalhamento das Funções

### 📄 `Code.gs` (Arquivo Principal)
- **`masterOnEdit(e)`**: É o coração do projeto, acionado a cada edição na planilha. Ele atua como um **roteador**, verificando se a célula editada corresponde a um dos status monitorados e, em caso positivo, chama o *handler* apropriado para executar a ação.
- **`enviarLembreteMensal()`**: Função projetada para ser acionada por um gatilho de tempo. Sua única responsabilidade é chamar o *handler* que envia o lembrete mensal.

### 📄 `Handlers.gs` (Lógica das Ações)
- **`handleEmailPronto(planilha, linha)`**: Monta e envia o e-mail de "Projeto Pronto" para o cliente, buscando os dados necessários na linha editada.
- **`handleDiscordTraducao(planilha, linha)`**: Monta a mensagem "em Tradução" e solicita o envio para o Discord, ativando a notificação de erro em caso de falha.
- **`handleDiscordRevisao(planilha, linha)`**: Monta a mensagem "em Revisão" e solicita o envio para o Discord, ativando a notificação de erro em caso de falha.
- **`handleDiscordAssinatura(planilha, linha)`**: Monta a mensagem "Assinar Digital" e solicita o envio para o Discord (sem notificação de erro na tela).
- **`handleLembreteMensal()`**: Monta a mensagem de lembrete mensal, mencionando o usuário configurado, e solicita o envio para o Discord.

### 📄 `Utilities.gs` (Funções Auxiliares)
- **`buscarEmailDoCliente(nomeDoCliente)`**: Realiza uma busca na aba "CLIENTES" para encontrar o e-mail correspondente a um nome de cliente.
- **`enviarMensagemDiscord(mensagem, chaveWebhook, notificarNaPlanilhaEmCasoDeErro)`**: Função genérica e reutilizável que envia qualquer mensagem de texto para uma URL de webhook do Discord. O terceiro parâmetro opcional controla se uma notificação "toast" deve ser exibida na planilha em caso de falha.

### 📄 `Setup.gs` (Configuração)
- **`configurarPropriedades()`**: Função de uso único para salvar todas as configurações e chaves secretas no `PropertiesService` do Google, mantendo o código principal limpo e seguro.

## ⚙️ Referência de Propriedades

A tabela abaixo detalha todas as chaves que devem ser configuradas no arquivo `Setup.gs`.

| Chave da Propriedade                | Descrição                                                                         | Exemplo                                                |
| ----------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `NOME_DA_ABA_PROJETOS`              | Nome da aba principal que será monitorada.                                        | `AGOSTO 2025`                                          |
| `NOME_DA_ABA_CLIENTES`              | Nome da aba que contém a lista de clientes e seus e-mails.                        | `CLIENTES`                                             |
| `VALOR_STATUS_PRONTO`               | Texto exato do status que dispara o envio de e-mail.                              | `09 Pronto`                                            |
| `VALOR_STATUS_TRADUCAO`             | Texto exato do status que dispara a notificação de "Tradução" no Discord.         | `03 Tradução`                                          |
| `VALOR_STATUS_REVISAO`              | Texto exato do status que dispara a notificação de "Revisão" no Discord.          | `04 Revisão`                                           |
| `VALOR_STATUS_ASSINAR_DIGITAL`      | Texto exato do status que dispara a notificação de "Assinar Digital" no Discord.  | `07 Assinar Digital`                                   |
| `REMETENTE_EMAIL`                   | E-mail (configurado como alias no Gmail) que será usado para enviar as notificações. | `contato@suaempresa.com`                               |
| `REMETENTE_NOME`                    | Nome que aparecerá como remetente do e-mail.                                      | `Nome da Sua Empresa`                                  |
| `WEBHOOK_URL_TRADUCAO`              | URL do Webhook do Discord para notificações de "Tradução".                        | `https://discord.com/api/webhooks/...`                 |
| `WEBHOOK_URL_REVISAO`               | URL do Webhook do Discord para notificações de "Revisão".                         | `https://discord.com/api/webhooks/...`                 |
| `WEBHOOK_URL_ASSINAR_DIGITAL`       | URL do Webhook do Discord para notificações de "Assinar Digital".                 | `https://discord.com/api/webhooks/...`                 |
| `WEBHOOK_URL_LEMBRETE_MENSAL`       | URL do Webhook do Discord para o lembrete mensal.                                 | `https://discord.com/api/webhooks/...`                 |
| `DISCORD_USER_ID_PARA_PING`         | ID do usuário do Discord que será mencionado no lembrete mensal.                  | `1384176323672412201`                                  |

## ⚖️ Licença

Distribuído sob a licença MIT.
