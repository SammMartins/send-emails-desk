# Send Emails Desk - Sistema de Help Desk

## Visão Geral

O **Send Emails Desk** é um sistema completo de help desk desktop que integra e-mail, análise de IA e métricas de desempenho em uma única aplicação.

## Funcionalidades Principais

### 1. Dashboard de Métricas 📊

O dashboard oferece uma visão completa do desempenho do sistema de suporte:

**Métricas Exibidas:**
- Tickets por Status (Aberto, Em Progresso, Fechado)
- Tickets por Prioridade (Baixa, Média, Alta, Urgente)
- Conformidade de SLA - Primeira Resposta
  - Percentual de tickets respondidos dentro do prazo
  - Meta configurável (padrão: < 4 horas)
  - Tempo médio de primeira resposta
- Conformidade de SLA - Resolução
  - Percentual de tickets resolvidos dentro do prazo
  - Meta configurável (padrão: < 24 horas)
  - Tempo médio de resolução
- Gráfico de tickets criados nos últimos 30 dias
- Top 10 remetentes de tickets

**Configuração de SLA Parametrizável:**
- Tempo para primeira resposta (em horas)
- Tempo para resolução (em horas)
- Opção de considerar apenas horário comercial (Seg-Sex, 9h-18h)

### 2. Inbox de Tickets 📥

Interface completa para visualização e gerenciamento de tickets:

**Recursos:**
- Tabela com todos os tickets
- Busca em tempo real por:
  - Assunto
  - Descrição
  - E-mail do remetente
- Filtros avançados:
  - Por status (Aberto, Em Progresso, Fechado)
  - Por prioridade (Baixa, Média, Alta, Urgente)
- Ordenação por qualquer coluna:
  - ID
  - Assunto
  - Remetente
  - Status
  - Prioridade
  - Data de criação
- Paginação eficiente (50 tickets por página)
- Indicadores visuais coloridos para status e prioridade

### 3. Detalhes do Ticket 🎫

Visualização completa e interativa de cada ticket:

**Informações Exibidas:**
- Assunto completo
- Informações do remetente (nome e e-mail)
- Status (editável)
- Prioridade (editável)
- Data de criação
- Data da primeira resposta
- Data de resolução (se aplicável)
- Descrição completa do ticket

**Funcionalidades:**
- Alterar status do ticket (Aberto → Em Progresso → Fechado)
- Alterar prioridade (Baixa, Média, Alta, Urgente)
- Adicionar anotações ilimitadas
- Visualizar histórico de anotações
- Análise por IA com um clique

### 4. Análise de IA 🤖

Análise inteligente de texto usando OpenAI:

**Recursos:**
- Análise de sentimento (Positivo, Neutro, Negativo)
- Análise de tom (Profissional, Urgente, Frustrado, Educado)
- Extração automática de palavras-chave
- Sugestões automáticas de respostas profissionais
- Histórico de análises por ticket

**Como Funciona:**
1. Configure sua chave de API do OpenAI nas configurações
2. Abra um ticket e clique em "Analyze with AI"
3. Receba instantaneamente:
   - Sentimento detectado
   - Tom da mensagem
   - Palavras-chave relevantes
   - Sugestão de resposta profissional

### 5. Gestão de Contatos 👥

Sistema completo de gerenciamento de contatos:

**Recursos:**
- Cadastro completo (Nome, E-mail, Telefone, Cidade)
- Busca por nome ou e-mail
- Filtro por cidade para organização geográfica
- Lista de todas as cidades cadastradas
- Edição de contatos existentes
- Sincronização automática com remetentes de e-mails

**Filtros:**
- Todas as cidades
- Filtro individual por cidade
- Busca de texto livre

### 6. Integração com Gmail 📧

Criação automática de tickets a partir de e-mails:

**Como Configurar:**
1. Obtenha credenciais OAuth2 no Google Cloud Console
2. Configure Client ID e Client Secret
3. Complete o fluxo de autenticação OAuth
4. Sincronize e-mails com um clique

**Funcionalidades:**
- Importação de e-mails não lidos
- Criação automática de tickets
- Extração de informações do remetente
- Criação automática de contatos
- Sincronização sob demanda

### 7. Sistema de Anotações 📝

Registro detalhado de interações e respostas:

**Recursos:**
- Adicionar notas ilimitadas a cada ticket
- Registro de autor e data/hora
- Histórico completo preservado
- Automação de primeira resposta
- Suporte para texto formatado

**Casos de Uso:**
- Registro de comunicações com o cliente
- Notas internas da equipe
- Histórico de ações tomadas
- Atualizações de progresso

### 8. Sistema Auditável 🔍

Log completo de todas as operações:

**O que é Registrado:**
- Criação de tickets
- Edição de tickets (status, prioridade)
- Criação de anotações
- Criação/edição de contatos
- Alterações na configuração de SLA
- Usuário que realizou a ação
- Data/hora da operação
- Dados alterados (antes/depois)

**Benefícios:**
- Rastreabilidade completa
- Compliance e auditoria
- Resolução de disputas
- Análise de desempenho da equipe

## Arquitetura Técnica

### Stack Tecnológico

**Frontend:**
- React 19 - Interface de usuário
- TypeScript - Type safety
- CSS moderno - Estilização responsiva

**Backend:**
- Electron - Aplicação desktop
- Express - API REST
- SQLite - Banco de dados local
- Node.js - Runtime

**Integrações:**
- Gmail API - Integração de e-mail
- OpenAI API - Análise de IA
- OAuth2 - Autenticação segura

### Banco de Dados

**Tabelas:**
1. `tickets` - Informações de tickets
2. `contacts` - Cadastro de contatos
3. `annotations` - Anotações em tickets
4. `sla_config` - Configuração de SLA
5. `audit_log` - Log de auditoria
6. `ai_analysis` - Análises de IA

**Relacionamentos:**
- Tickets ↔ Anotações (1:N)
- Tickets ↔ Análises IA (1:N)
- Contatos ↔ Tickets (1:N via e-mail)

### Segurança

- Armazenamento local seguro (SQLite)
- OAuth2 para autenticação Gmail
- API keys criptografadas
- Contexto isolado no Electron
- Sem exposição de dados sensíveis

## Fluxo de Trabalho Típico

1. **Configuração Inicial:**
   - Configure SLA desejado
   - Conecte ao Gmail (opcional)
   - Configure OpenAI (opcional)

2. **Criação de Tickets:**
   - Automática via Gmail, ou
   - Manual através da API

3. **Gerenciamento:**
   - Visualize tickets no Inbox
   - Filtre por status/prioridade
   - Abra detalhes do ticket

4. **Análise e Resposta:**
   - Use análise de IA para insights
   - Adicione anotações
   - Atualize status conforme progresso

5. **Monitoramento:**
   - Acompanhe métricas no Dashboard
   - Verifique compliance de SLA
   - Identifique gargalos

## Benefícios

✅ **Eficiência:** Centralização de todos os tickets em um só lugar
✅ **Inteligência:** Sugestões de IA para respostas mais rápidas
✅ **Métricas:** Acompanhamento de desempenho em tempo real
✅ **Organização:** Gestão de contatos por localização
✅ **Rastreabilidade:** Sistema 100% auditável
✅ **Integração:** Conexão direta com Gmail
✅ **Flexibilidade:** SLA configurável por necessidade
✅ **Desktop:** Aplicação nativa, rápida e offline-first

## Casos de Uso

- **Suporte Técnico:** Gerenciamento de chamados técnicos
- **Atendimento ao Cliente:** Central de relacionamento
- **Help Desk Interno:** Suporte para funcionários
- **Service Desk:** Gestão de serviços de TI
- **Ouvidoria:** Canal de comunicação com usuários

## Próximas Funcionalidades Sugeridas

- [ ] Relatórios exportáveis (PDF, Excel)
- [ ] Categorização automática de tickets por IA
- [ ] Respostas automáticas baseadas em templates
- [ ] Integração com Slack/Teams
- [ ] Base de conhecimento integrada
- [ ] SLA diferenciado por prioridade
- [ ] Notificações push
- [ ] Modo escuro
- [ ] Multi-idiomas
- [ ] Dashboard customizável
