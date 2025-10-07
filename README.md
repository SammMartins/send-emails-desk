# Send Emails Desk

Um sistema de help-desk interno focado em eficiência, que cria tickets automaticamente via e-mail. Inclui dashboards de desempenho com análise de SLA, IA para análise de texto e sugestões de resposta, e gestão completa de tickets.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Características Principais](#características-principais)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Componentes do Sistema](#componentes-do-sistema)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🎯 Visão Geral

**Send Emails Desk** é uma aplicação desktop completa de help desk que integra múltiplos canais de comunicação e ferramentas de gestão para proporcionar um atendimento eficiente e organizado. O sistema automatiza a criação de tickets a partir de e-mails recebidos, oferece análise de IA em tempo real e permite um gerenciamento completo do fluxo de atendimento.

## ✨ Características Principais

### 🎫 Gestão de Tickets
- **Criação automática de tickets via Gmail**: Monitora caixa de e-mail e cria tickets automaticamente
- **Sistema de prioridades**: Organização por urgência e importância
- **Status configurável**: Acompanhamento do ciclo de vida completo dos tickets
- **Atribuição de agentes**: Distribuição inteligente de trabalho

### 📊 Dashboard e Métricas
- **Métricas de SLA configuráveis**: Defina e monitore acordos de nível de serviço
- **Dashboards em tempo real**: Visualize desempenho da equipe instantaneamente
- **Relatórios personalizados**: Análise detalhada de performance
- **Indicadores de desempenho**: KPIs para tomada de decisão

### 🤖 Inteligência Artificial
- **Análise de sentimento**: Identifica o tom emocional das mensagens
- **Sugestões de resposta**: IA gera respostas contextuais automáticas
- **Análise de texto**: Extração de informações relevantes
- **Classificação automática**: Categorização inteligente de tickets

### 👥 Gestão de Contatos
- **Base de contatos centralizada**: Todos os clientes em um único lugar
- **Organização por cidade**: Filtros geográficos para melhor gestão
- **Histórico completo**: Visualize todas as interações anteriores
- **Perfis detalhados**: Informações completas de cada contato

### 🔍 Busca Avançada
- **Múltiplos filtros**: Busque por status, prioridade, data, agente, etc.
- **Busca full-text**: Encontre tickets por conteúdo
- **Filtros combinados**: Refine resultados com múltiplos critérios
- **Busca rápida**: Interface responsiva e ágil

### 📝 Sistema de Anotações
- **Notas internas**: Comunicação entre agentes
- **Comentários ao cliente**: Atualizações visíveis ao solicitante
- **Histórico completo**: Timeline de todas as interações
- **Anexos**: Suporte para arquivos e imagens

### 🔒 Auditoria e Segurança
- **Log de todas operações**: Rastreabilidade completa
- **Sistema auditável**: Conformidade e transparência
- **Controle de acesso**: Permissões por perfil de usuário
- **Histórico de alterações**: Quem fez o quê e quando

## 🏗️ Arquitetura do Sistema

### Visão Geral da Arquitetura (Opção 1)

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

### Fluxo de Trabalho

#### 1. Recebimento de E-mail
1. Cliente envia e-mail para o endereço de suporte
2. Script Python com `imaplib` monitora a caixa de entrada
3. Novo e-mail detectado é enviado para fila do Celery

#### 2. Processamento Assíncrono
1. Celery Worker pega a tarefa da fila
2. Processa o conteúdo do e-mail
3. Cria ou atualiza ticket no PostgreSQL
4. Executa análise de IA (sentimento, categorização)
5. Armazena resultados no banco de dados

#### 3. Interface do Usuário
1. Frontend consome API REST do backend
2. Exibe tickets em dashboard organizado
3. Agente visualiza detalhes e histórico
4. Aplica filtros e busca avançada

#### 4. Resposta ao Cliente
1. Agente redige resposta no frontend
2. IA pode sugerir respostas automáticas
3. Tarefa assíncrona é criada para envio
4. `smtplib` envia e-mail ao cliente
5. Análise de IA processa texto da resposta
6. Ticket é atualizado com nova interação

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.8+**: Linguagem principal do backend
- **Django/Flask**: Framework web para API REST
- **Celery**: Processamento assíncrono de tarefas
- **PostgreSQL**: Banco de dados relacional
- **Redis/RabbitMQ**: Message broker para Celery
- **imaplib**: Recebimento de e-mails via IMAP
- **smtplib**: Envio de e-mails via SMTP

### Frontend
- **React/Vue.js**: Framework JavaScript para UI
- **HTML5/CSS3**: Marcação e estilização
- **Axios**: Cliente HTTP para consumir API
- **Chart.js/D3.js**: Visualização de dados e gráficos

### Infraestrutura
- **Docker**: Containerização da aplicação
- **Nginx**: Servidor web e proxy reverso
- **Linux**: Sistema operacional do servidor

### IA e Machine Learning
- **Natural Language Processing (NLP)**: Análise de texto
- **Sentiment Analysis**: Detecção de emoções
- **ML Models**: Sugestões de resposta e categorização

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

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Python 3.8 ou superior**
- **Node.js 14+ e npm/yarn**
- **PostgreSQL 12+**
- **Redis** (para Celery)
- **Git**

## 🚀 Instalação

### 1. Clone o Repositório
```bash
git clone https://github.com/SammMartins/send-emails-desk.git
cd send-emails-desk
```

### 2. Configure o Backend

#### Crie um ambiente virtual Python
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

#### Instale as dependências
```bash
pip install -r requirements.txt
```

#### Configure o banco de dados
```bash
# Crie um banco PostgreSQL
createdb send_emails_desk

# Execute as migrações
python manage.py migrate
```

#### Crie um superusuário
```bash
python manage.py createsuperuser
```

### 3. Configure o Frontend

```bash
cd frontend
npm install
# ou
yarn install
```

### 4. Configure o Celery

#### Inicie o Redis (em terminal separado)
```bash
redis-server
```

#### Inicie o Celery Worker (em terminal separado)
```bash
celery -A send_emails_desk worker --loglevel=info
```

#### Inicie o Celery Beat para tarefas agendadas (opcional)
```bash
celery -A send_emails_desk beat --loglevel=info
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Django/Flask
SECRET_KEY=sua-chave-secreta-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=send_emails_desk
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432

# Email Configuration (IMAP)
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-ou-app-password
EMAIL_USE_SSL=True

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-ou-app-password
SMTP_USE_TLS=True

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# AI Configuration (opcional)
AI_API_KEY=sua-chave-api-ia
AI_MODEL=gpt-3.5-turbo

# SLA Configuration
DEFAULT_SLA_HOURS=24
URGENT_SLA_HOURS=4
HIGH_PRIORITY_SLA_HOURS=8
```

### Configuração do Gmail

Para usar o Gmail como servidor de e-mail:

1. Ative a **autenticação de dois fatores** na sua conta Google
2. Gere uma **senha de aplicativo**:
   - Acesse https://myaccount.google.com/security
   - Em "Fazer login no Google", selecione "Senhas de app"
   - Gere uma senha para "E-mail" em "Outro"
   - Use essa senha no arquivo `.env`

### Configuração de SLA

Edite o arquivo de configuração para definir seus SLAs:

```python
# config/sla_settings.py
SLA_LEVELS = {
    'urgent': 4,      # 4 horas
    'high': 8,        # 8 horas
    'medium': 24,     # 24 horas
    'low': 72,        # 72 horas
}
```

## 🎮 Uso

### Iniciar o Backend
```bash
# Ative o ambiente virtual
source venv/bin/activate

# Inicie o servidor Django/Flask
python manage.py runserver
# ou
flask run
```

### Iniciar o Frontend
```bash
cd frontend
npm start
# ou
yarn start
```

### Iniciar o Monitor de E-mails
```bash
python scripts/email_monitor.py
```

### Acessar a Aplicação

Abra seu navegador e acesse:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin**: http://localhost:8000/admin

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

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga estes passos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes de Contribuição

- Escreva código limpo e documentado
- Siga as convenções de estilo do projeto
- Adicione testes para novas funcionalidades
- Atualize a documentação conforme necessário

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 📞 Contato e Suporte

Para dúvidas, sugestões ou reportar problemas:

- **Issues**: [GitHub Issues](https://github.com/SammMartins/send-emails-desk/issues)
- **Discussões**: [GitHub Discussions](https://github.com/SammMartins/send-emails-desk/discussions)

---

## 🙏 Agradecimentos

Agradecimentos especiais a todos os contribuidores que ajudam a tornar este projeto melhor!

---

**Desenvolvido com ❤️ por SammMartins**
