# 🏗️ Arquitetura do Sistema

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        Gmail / IMAP                              │
│                    (Recebimento de E-mails)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Monitor Python (imaplib)                      │
│         Script que monitora a caixa de e-mail                    │
│         periodicamente e detecta novos e-mails                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Fila de Tarefas (Celery)                      │
│              Gerenciamento assíncrono de tarefas                 │
│                    (Redis/RabbitMQ)                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Celery Worker                                 │
│    Processa e-mails, cria/atualiza tickets no BD                │
│    Executa análise de IA e envia respostas                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Banco de Dados PostgreSQL                       │
│         Armazena tickets, contatos, notas, logs                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              Backend API REST (Django/Flask)                     │
│    Lógica de negócio, autenticação, autorização                 │
│    Endpoints para CRUD de tickets, métricas, etc.               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              Frontend Desktop (React/Vue)                        │
│    Interface do usuário, dashboards, formulários                │
│    Visualização de tickets, métricas e relatórios               │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SMTP (Envio de E-mails)                        │
│         Respostas aos clientes via smtplib                       │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxo de Trabalho

### 1. Recebimento de E-mail
1. Cliente envia e-mail para o endereço de suporte
2. Script Python com `imaplib` monitora a caixa de entrada
3. Novo e-mail detectado é enviado para fila do Celery

### 2. Processamento Assíncrono
1. Celery Worker pega a tarefa da fila
2. Processa o conteúdo do e-mail
3. Cria ou atualiza ticket no PostgreSQL
4. Executa análise de IA (sentimento, categorização)
5. Armazena resultados no banco de dados

### 3. Interface do Usuário
1. Frontend consome API REST do backend
2. Exibe tickets em dashboard organizado
3. Agente visualiza detalhes e histórico
4. Aplica filtros e busca avançada

### 4. Resposta ao Cliente
1. Agente redige resposta no frontend
2. IA pode sugerir respostas automáticas
3. Tarefa assíncrona é criada para envio
4. `smtplib` envia e-mail ao cliente
5. Análise de IA processa texto da resposta
6. Ticket é atualizado com nova interação

## 🔧 Componentes do Sistema

### 1. Monitor de E-mails (Python/imaplib)
```python
# Monitora caixa de entrada
# Detecta novos e-mails
# Envia para fila Celery
```

**Responsabilidades:**
- Conexão segura com servidor IMAP
- Polling periódico de novos e-mails
- Extração de metadados (remetente, assunto, corpo)
- Criação de tarefas Celery

### 2. Celery Workers
```python
# Processa tarefas assíncronas
# Cria/atualiza tickets
# Executa análise de IA
```

**Responsabilidades:**
- Processamento de e-mails recebidos
- Criação e atualização de tickets
- Análise de IA em textos
- Envio de e-mails de resposta
- Execução de tarefas agendadas

### 3. API REST (Django/Flask)
```python
# Endpoints REST
# Lógica de negócio
# Autenticação e autorização
```

**Responsabilidades:**
- CRUD de tickets, contatos, usuários
- Cálculo de métricas e SLA
- Autenticação JWT
- Validação de dados
- Logs de auditoria

### 4. Banco de Dados (PostgreSQL)
```sql
-- Tabelas principais:
-- tickets, contacts, users, notes, logs, sla_metrics
```

**Estrutura:**
- Tickets com relacionamentos
- Contatos e histórico
- Usuários e permissões
- Notas e comentários
- Logs de auditoria
- Métricas de SLA

### 5. Frontend Desktop (React/Vue)
```javascript
// Interface do usuário
// Dashboards interativos
// Formulários e busca
```

**Componentes:**
- Dashboard principal com métricas
- Lista e detalhes de tickets
- Formulários de criação/edição
- Sistema de busca e filtros
- Gerenciamento de contatos
- Visualização de logs

## 📁 Estrutura do Projeto

```
send-emails-desk/
├── backend/
│   ├── api/
│   │   ├── views.py          # Endpoints da API
│   │   ├── serializers.py    # Serialização de dados
│   │   └── urls.py           # Rotas da API
│   ├── tickets/
│   │   ├── models.py         # Modelos de dados
│   │   ├── services.py       # Lógica de negócio
│   │   └── tasks.py          # Tarefas Celery
│   ├── contacts/
│   │   └── models.py         # Modelo de contatos
│   ├── ai/
│   │   ├── sentiment.py      # Análise de sentimento
│   │   └── suggestions.py    # Sugestões de resposta
│   └── manage.py             # CLI do Django
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React/Vue
│   │   ├── views/            # Páginas da aplicação
│   │   ├── services/         # Serviços de API
│   │   └── App.js            # Componente principal
│   ├── public/
│   └── package.json
├── scripts/
│   └── email_monitor.py      # Monitor de e-mails
├── config/
│   ├── celery.py             # Configuração Celery
│   └── settings.py           # Configurações gerais
├── requirements.txt          # Dependências Python
├── .env.example              # Exemplo de variáveis de ambiente
├── docker-compose.yml        # Configuração Docker
└── README.md                 # Este arquivo
```
