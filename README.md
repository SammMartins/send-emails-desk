# 📧 Send Emails Desk

Um sistema de help-desk desktop completo e eficiente para gerenciamento de tickets via e-mail. Inclui dashboards de desempenho com análise de SLA, IA para análise de texto, e gestão completa de tickets.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Electron](https://img.shields.io/badge/Electron-191970?style=flat&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

## 🎯 Visão Geral

Send Emails Desk é uma aplicação desktop completa de help desk que integra:

- ✅ Criação automática de tickets via Gmail
- 📊 Dashboard com métricas de SLA configuráveis
- 🤖 Análise de IA para sentimento e sugestões de resposta
- 👥 Gestão de contatos organizada por cidade
- 🔍 Busca avançada com múltiplos filtros
- 📝 Sistema de anotações completo
- 🔐 Sistema auditável com log de todas operações

## 🚀 Início Rápido

```bash
# Clone e instale
git clone https://github.com/SammMartins/send-emails-desk.git
cd send-emails-desk
npm install

# Compile e execute
npm run build
npm run start
```

**➡️ Veja o [QUICKSTART.md](QUICKSTART.md) para começar em 5 minutos!**

## Funcionalidades

### ✅ Sistema Completo de Help Desk
- **Criação automática de tickets** a partir de e-mails do Gmail
- **Inbox com tabela de tickets** com filtros avançados e ordenação
- **Detalhes de tickets** com visualização completa e anotações
- **Sistema de anotações** para adicionar notas e respostas aos tickets
- **Gestão de contatos** organizada por cidade
- **Sistema auditável** com log de todas as ações

### 📊 Dashboard com Métricas de Desempenho
- Estatísticas de tickets por status e prioridade
- **Análise de SLA** com métricas de tempo de primeira resposta
- **Configuração parametrizável** de SLA (horas úteis ou totais)
- Monitoramento de conformidade com SLA
- Gráficos de tickets criados por dia
- Top 10 remetentes de tickets

### 🤖 Análise de Texto por IA
- Integração com OpenAI para análise de sentimento
- Análise de tom e palavreado dos tickets
- **Sugestões automáticas de respostas** profissionais
- Extração de palavras-chave

### 👥 Gestão de Contatos
- Cadastro completo de contatos
- **Filtro por cidade** para organização geográfica
- Busca avançada de contatos
- Sincronização automática com remetentes de e-mails

### 📥 Integração com Gmail
- Autenticação OAuth2 segura
- Sincronização automática de e-mails
- Criação de tickets a partir de e-mails não lidos
- Extração automática de informações do remetente

### 🔍 Busca e Filtros Avançados
- Busca por texto em assunto, descrição e remetente
- Filtros por status (aberto, em progresso, fechado)
- Filtros por prioridade (baixa, média, alta, urgente)
- Ordenação personalizável por qualquer coluna
- Paginação eficiente

## Requisitos

- Node.js 16+
- npm ou yarn

## Instalação

```bash
# Instalar dependências
npm install

# Compilar o código TypeScript
npm run build:main

# Compilar a interface (React)
npm run build:renderer

# Ou compilar tudo de uma vez
npm run build
```

## Desenvolvimento

Para desenvolvimento com hot-reload:

```bash
# Terminal 1: Iniciar o servidor de desenvolvimento do frontend
npm run dev

# Terminal 2: Compilar o código do Electron e iniciar
npm run start
```

## Configuração

### Gmail API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative a API do Gmail
4. Crie credenciais OAuth 2.0
5. Configure o URI de redirecionamento: `http://localhost:3001/api/gmail/auth/callback`
6. No aplicativo, vá em **Settings** e configure:
   - Client ID
   - Client Secret
   - Clique em "Initialize Gmail Authentication"
   - Abra a URL de autorização e complete o fluxo OAuth

### OpenAI

1. Obtenha uma chave de API em [platform.openai.com](https://platform.openai.com/)
2. No aplicativo, vá em **Settings**
3. Insira sua chave de API do OpenAI
4. Clique em "Configure OpenAI"

### Configuração de SLA

No menu **Settings**, você pode parametrizar:
- Tempo máximo para primeira resposta (em horas)
- Tempo máximo para resolução (em horas)
- Se deve considerar apenas horário comercial (Seg-Sex, 9h-18h)

## Uso

### Dashboard
Visualize métricas de desempenho, compliance de SLA e estatísticas gerais.

### Inbox
- Lista todos os tickets com filtros e busca
- Clique em um ticket para ver detalhes
- Use os filtros para encontrar tickets específicos
- Ordene por qualquer coluna clicando no cabeçalho

### Detalhes do Ticket
- Visualize todas as informações do ticket
- Altere status e prioridade
- Adicione anotações
- Use a análise de IA para obter insights e sugestões de resposta

### Contatos
- Gerencie todos os contatos
- Filtre por cidade
- Adicione ou edite informações de contato

### Settings
- Configure integrações (Gmail, OpenAI)
- Ajuste parâmetros de SLA
- Sincronize e-mails do Gmail

## Arquitetura

O sistema utiliza:
- **Electron** para aplicação desktop
- **React** para interface web
- **TypeScript** para type safety
- **Express** para API backend
- **SQLite** para banco de dados local
- **Gmail API** para integração de e-mail
- **OpenAI API** para análise de IA

### Estrutura do Projeto

```
src/
├── main/           # Processo principal do Electron
├── renderer/       # Interface React
│   ├── components/ # Componentes React
│   ├── styles/     # CSS
│   └── utils/      # Utilitários do frontend
├── backend/        # Servidor Express
│   ├── routes/     # Rotas da API
│   └── utils/      # Utilitários do backend
└── preload/        # Script de preload do Electron
```

## Banco de Dados

O sistema utiliza SQLite com as seguintes tabelas:
- **tickets** - Tickets de suporte
- **contacts** - Contatos
- **annotations** - Anotações nos tickets
- **sla_config** - Configuração de SLA
- **audit_log** - Log de auditoria
- **ai_analysis** - Análises de IA

## Sistema Auditável

Todas as operações importantes são registradas no log de auditoria:
- Criação e edição de tickets
- Criação de anotações
- Alterações em contatos
- Mudanças na configuração de SLA

## Licença

ISC
