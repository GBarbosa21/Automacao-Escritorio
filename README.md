# Sistema de Automação Avançada com Google Sheets & Apps Script

![Google Apps Script](https://img.shields.io/badge/Google-Apps%20Script-4285F4?style=for-the-badge&logo=google)
![Google Sheets](https://img.shields.io/badge/Google-Sheets-34A853?style=for-the-badge&logo=googlesheets)

Este projeto transforma uma Planilha Google de controle de status em uma central de automação de fluxo de trabalho. Utilizando Google Apps Script, ele se integra com serviços externos (Omie, Discord), automatiza tarefas no Google Drive e aprimora a interface da planilha com funcionalidades interativas.

## ✨ Funcionalidades

### Automações de Fluxo de Trabalho
-   **Notificações em Tempo Real:** Dispara notificações para um bot em Python (e consequentemente para o Discord) quando o status de um projeto é alterado.
-   **Envio de E-mails para Clientes:** Envia e-mails formatados em HTML, com a logo da empresa embutida, quando um projeto é finalizado.
-   **Organização Automática de Pastas:** Move a pasta de um projeto no Google Drive para uma nova pasta de destino correspondente ao seu novo status (ex: de "03 Traduzir" para "04 Revisar").
-   **Atualização Diária de Datas:** Um gatilho diário atualiza a "Data de Entrega" de projetos que não estão em fases críticas de trabalho, mantendo a planilha sempre relevante.

### Integrações Externas
-   **API da Omie:** Conecta-se diretamente à API da Omie para buscar o e-mail de um cliente em tempo real a partir do seu nome, eliminando a necessidade de uma base de dados manual.
-   **Integração com Bot Python:** Centraliza o envio de notificações para o Discord através de um bot externo, permitindo funcionalidades mais avançadas na plataforma.

### Interface da Planilha
-   **Dashboard de Análise:** Uma aba de "Dashboard" dedicada que calcula e resume automaticamente as métricas do mês, como total de documentos, assinaturas físicas vs. digitais e controle de estoque de folhas.
-   **Menu e Botões Personalizados:**
    -   Um menu "Ações do Ajudante" que permite abrir a pasta de um projeto no Drive com base na linha selecionada.
    -   Botões de `+1` e `-1` para facilitar a contagem de erros de impressão no Dashboard.
-   **Formatação Condicional Dinâmica:** Colore automaticamente as células de data de entrega para destacar os projetos da semana atual e da próxima.
-   **Links Dinâmicos para Pastas:** Utiliza uma função personalizada (`@customfunction`) para gerar um link clicável para a pasta de cada projeto diretamente na linha correspondente.

## 📂 Estrutura do Projeto

O código é organizado de forma modular para facilitar a manutenção:
</br>.
</br>├── Code.gs             # Arquivo principal, contém o gatilho onEdit (roteador).
</br>├── Handlers.gs         # Contém a lógica principal para cada ação (enviar e-mail, mover pasta, etc.).
</br>├── Utilities.gs        # Funções auxiliares reutilizáveis (busca na API, formatação de data, etc.).
</br>├── Setup.gs            # Script para configurar todas as variáveis de ambiente no PropertiesService.
</br>├── Menu.gs             # Contém o código para a criação do menu personalizado e botões.
</br>└── AutomacoesDiarias.gs # Contém os scripts acionados por tempo (gatilhos diários).


## 🚀 Instalação e Configuração

### Passo 1: Cópia e Configuração
1.  **Copie a Planilha** e o **Projeto Apps Script** para a sua conta Google.
2.  Abra o editor de script e vá para o arquivo `Setup.gs`.
3.  Preencha **todas** as propriedades na função `configurarPropriedades()` com seus dados reais (chaves de API, IDs, etc.).
4.  No editor, selecione a função `configurarPropriedades` e clique em **Executar**.

### Passo 2: Permissões e Gatilhos
1.  **Ative os Serviços:** No editor de script, no menu à esquerda, clique em **Serviços (+)** e garanta que as APIs **Google Drive API** e **Gmail API** estejam ativadas.
2.  **Configure os Gatilhos:** No menu **Acionadores (⏰)**, crie os gatilhos necessários:
    -   **Gatilho 1 (principal):** Função `masterOnEdit`, Evento `Da planilha`, Tipo `Ao editar`.
    -   **Gatilho 2 (diário):** Função `atualizarDatasDeEntrega`, Evento `Acionador de tempo`, Tipo `Dia`, Horário `Meia-noite à 1h`.

### Passo 3: Estrutura do Google Drive
Para a função de mover pastas funcionar, crie uma pasta "raiz" no seu Drive e, dentro dela, crie subpastas com os nomes exatos dos status da sua planilha (ex: "01 Scan", "03 Traduzir", "04 Revisar", etc.). O ID da pasta raiz deve ser inserido no `Setup.gs`.

## ⚙️ Referência de Propriedades (Setup.gs)

| Chave da Propriedade | Descrição |
| :--- | :--- |
| `OMIE_APP_KEY` / `_SECRET` / `_URL` | Credenciais para a API da Omie. |
| `PYTHON_BOT_URL` | URL do seu bot Python no Render para receber notificações. |
| `NOTIFY_SECRET_KEY` | Senha secreta para autorizar a comunicação com o bot. |
| `ID_DA_PASTA_RAIZ` | ID da pasta principal no Drive que contém as subpastas de status. |
| `REMETENTE_EMAIL` / `_NOME` | E-mail (configurado como alias) e nome para o envio de e-mails. |
| `GOOGLE_DRIVE_LOGO_FILE_ID` | ID do arquivo de imagem da logo, armazenado no Google Drive. |
| `DISCORD_USER_ID_...` | IDs de usuários do Discord para menções específicas. |
| `WEBHOOK_...` | URLs de webhooks para notificações específicas (se usadas). |


## ⚖️ Licença
Distribuído sob a Licença MIT.
