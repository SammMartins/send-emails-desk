# 📊 Documentação do Banco de Dados - Send Emails Desk

## 🎯 Visão Geral

O sistema Send Emails Desk utiliza um banco de dados SQLite para desenvolvimento e PostgreSQL para produção. A estrutura foi projetada para suportar um sistema completo de help desk com gestão de tickets, contatos e auditoria.

## 📋 Estrutura Geral

### 🔗 Relacionamentos Principais

```
User (Django Auth) ←→ Ticket ←→ Contact
         ↑              ↓
         └── TicketComment, TicketLog, TicketAttachment
         
Contact ←→ ContactHistory
Ticket ←→ TicketCategory
```

## 📚 Tabelas do Sistema

### 🎫 **ticket_management_ticket**
**Descrição**: Tabela principal do sistema que armazena todos os tickets de suporte.

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | INTEGER | Chave primária (auto-incremento) | ✅ |
| `title` | VARCHAR(255) | Título do ticket | ✅ |
| `description` | TEXT | Descrição detalhada do problema | ✅ |
| `priority` | VARCHAR(10) | Prioridade: low, medium, high, urgent | ✅ |
| `status` | VARCHAR(20) | Status: open, in_progress, waiting_customer, resolved, closed | ✅ |
| `created_at` | DATETIME | Data/hora de criação | ✅ |
| `updated_at` | DATETIME | Data/hora da última atualização | ✅ |
| `sla_deadline` | DATETIME | Prazo limite para resolução (SLA) | ❌ |
| `resolved_at` | DATETIME | Data/hora da resolução | ❌ |
| `closed_at` | DATETIME | Data/hora do fechamento | ❌ |
| `email_thread_id` | VARCHAR(255) | ID da thread de e-mail relacionada | ❌ |
| `sentiment_score` | REAL | Pontuação de sentimento (IA) | ❌ |
| `sentiment_label` | VARCHAR(20) | Rótulo do sentimento: positive, negative, neutral | ❌ |
| `tags` | VARCHAR(500) | Tags separadas por vírgula | ❌ |
| `assigned_to_id` | INTEGER | FK para User (responsável) | ❌ |
| `contact_id` | BIGINT | FK para Contact (solicitante) | ✅ |
| `created_by_id` | INTEGER | FK para User (criador) | ❌ |
| `category_id` | BIGINT | FK para TicketCategory | ❌ |

**Índices**:
- PRIMARY KEY (`id`)
- INDEX (`assigned_to_id`)
- INDEX (`contact_id`)
- INDEX (`created_by_id`)
- INDEX (`category_id`)
- INDEX (`status`)
- INDEX (`priority`)
- INDEX (`created_at`)

---

### 🏷️ **ticket_management_ticketcategory**
**Descrição**: Categorias para organizar tickets por tipo de problema.

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | INTEGER | Chave primária (auto-incremento) | ✅ |
| `name` | VARCHAR(100) | Nome da categoria | ✅ |
| `description` | TEXT | Descrição da categoria | ❌ |
| `color` | VARCHAR(7) | Cor hex para interface (#RRGGBB) | ✅ |
| `is_active` | BOOLEAN | Se a categoria está ativa | ✅ |
| `created_at` | DATETIME | Data/hora de criação | ✅ |

**Dados de Exemplo**:
- Suporte Técnico (#f44336)
- Financeiro (#4caf50)
- Reclamações (#ff9800)
- Geral (#2196f3)

---

### 💬 **ticket_management_ticketcomment**
**Descrição**: Comentários e respostas associados aos tickets.

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | INTEGER | Chave primária (auto-incremento) | ✅ |
| `comment_type` | VARCHAR(10) | Tipo: public, private, system | ✅ |
| `content` | TEXT | Conteúdo do comentário | ✅ |
| `created_at` | DATETIME | Data/hora de criação | ✅ |
| `email_message_id` | VARCHAR(255) | ID da mensagem de e-mail original | ❌ |
| `is_email_response` | BOOLEAN | Se o comentário veio de e-mail | ✅ |
| `created_by_id` | INTEGER | FK para User (autor) | ❌ |
| `ticket_id` | BIGINT | FK para Ticket | ✅ |

---

### 📎 **ticket_management_ticketattachment**
**Descrição**: Arquivos anexados aos tickets.

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | INTEGER | Chave primária (auto-incremento) | ✅ |
| `file` | VARCHAR(100) | Caminho do arquivo no sistema | ✅ |
| `filename` | VARCHAR(255) | Nome original do arquivo | ✅ |
| `file_size` | INTEGER | Tamanho do arquivo em bytes | ✅ |
| `content_type` | VARCHAR(100) | MIME type do arquivo | ✅ |
| `uploaded_at` | DATETIME | Data/hora do upload | ✅ |
| `ticket_id` | BIGINT | FK para Ticket | ✅ |
| `uploaded_by_id` | INTEGER | FK para User (quem fez upload) | ❌ |

---

### 📝 **ticket_management_ticketlog**
**Descrição**: Log de auditoria de todas as ações realizadas nos tickets.

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | INTEGER | Chave primária (auto-incremento) | ✅ |
| `action` | VARCHAR(20) | Tipo de ação: created, updated, assigned, closed, etc. | ✅ |
| `description` | TEXT | Descrição detalhada da ação | ✅ |
| `old_value` | TEXT | Valor anterior (JSON) | ❌ |
| `new_value` | TEXT | Novo valor (JSON) | ❌ |
| `created_at` | DATETIME | Data/hora da ação | ✅ |
| `ip_address` | CHAR(39) | Endereço IP de origem | ❌ |
| `created_by_id` | INTEGER | FK para User (quem executou) | ❌ |
| `ticket_id` | BIGINT | FK para Ticket | ✅ |

---

### 👤 **contact_management_contact**
**Descrição**: Informações dos contatos/clientes do sistema.

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | INTEGER | Chave primária (auto-incremento) | ✅ |
| `name` | VARCHAR(255) | Nome completo do contato | ✅ |
| `email` | VARCHAR(254) | E-mail principal (único) | ✅ |
| `phone` | VARCHAR(20) | Telefone de contato | ❌ |
| `company` | VARCHAR(255) | Empresa do contato | ❌ |
| `department` | VARCHAR(100) | Departamento | ❌ |
| `created_at` | DATETIME | Data/hora de criação | ✅ |
| `updated_at` | DATETIME | Data/hora da última atualização | ✅ |
| `is_active` | BOOLEAN | Se o contato está ativo | ✅ |
| `notes` | TEXT | Observações internas | ❌ |
| `created_by_id` | INTEGER | FK para User (criador) | ❌ |

**Restrições**:
- UNIQUE (`email`)
- INDEX (`email`)
- INDEX (`company`)

---

### 📋 **contact_management_contacthistory**
**Descrição**: Histórico de interações com os contatos.

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | INTEGER | Chave primária (auto-incremento) | ✅ |
| `interaction_type` | VARCHAR(20) | Tipo: email, phone, ticket, meeting, other | ✅ |
| `description` | TEXT | Descrição da interação | ✅ |
| `created_at` | DATETIME | Data/hora da interação | ✅ |
| `contact_id` | BIGINT | FK para Contact | ✅ |
| `created_by_id` | INTEGER | FK para User (responsável) | ❌ |
| `related_ticket_id` | BIGINT | FK para Ticket (se aplicável) | ❌ |

---

## 🔐 Tabelas do Django (Sistema)

### **auth_user**
Tabela padrão do Django para autenticação de usuários.

### **django_admin_log**
Log de ações realizadas no painel administrativo.

### **django_session**
Sessões ativas dos usuários.

## 📈 Estatísticas Atuais

| Tabela | Registros | Descrição |
|--------|-----------|-----------|
| Usuários | 3 | admin, agent1, agent2 |
| Tickets | 5 | Tickets de exemplo com diferentes status |
| Categorias | 4 | Financeiro, Geral, Reclamações, Suporte Técnico |
| Comentários | 2 | Comentários nos tickets |
| Contatos | 5 | Contatos de clientes |
| Histórico | 5 | Interações com contatos |

## 🗂️ Enumerações (Choices)

### Priority Choices
```python
PRIORITY_CHOICES = [
    ('low', 'Baixa'),
    ('medium', 'Média'),
    ('high', 'Alta'),
    ('urgent', 'Urgente'),
]
```

### Status Choices
```python
STATUS_CHOICES = [
    ('open', 'Aberto'),
    ('in_progress', 'Em Andamento'),
    ('waiting_customer', 'Aguardando Cliente'),
    ('resolved', 'Resolvido'),
    ('closed', 'Fechado'),
]
```

### Comment Type Choices
```python
COMMENT_TYPE_CHOICES = [
    ('public', 'Público'),
    ('private', 'Privado'),
    ('system', 'Sistema'),
]
```

### Interaction Type Choices
```python
INTERACTION_TYPE_CHOICES = [
    ('email', 'E-mail'),
    ('phone', 'Telefone'),
    ('ticket', 'Ticket'),
    ('meeting', 'Reunião'),
    ('other', 'Outro'),
]
```

## 🚀 Performance e Otimizações

### Índices Criados
- **Tickets**: `status`, `priority`, `created_at`, `assigned_to`, `contact`
- **Contatos**: `email` (único), `company`
- **Comentários**: `ticket_id`, `created_at`
- **Logs**: `ticket_id`, `created_at`, `action`

### Queries Otimizadas
- Uso de `select_related()` para ForeignKeys
- Uso de `prefetch_related()` para relacionamentos M2M
- Paginação implementada na API (20 itens por página)

## 🔒 Segurança

### Validações
- E-mails únicos para contatos
- Validação de campos obrigatórios
- Sanitização de entrada de dados

### Auditoria
- Log completo de ações nos tickets
- Rastreamento de IP para auditoria
- Registro de quem criou/modificou cada registro

## 📝 Migrações

As migrações foram criadas e aplicadas na seguinte ordem:
1. `0001_initial` - Criação inicial das tabelas
2. Migrações automáticas do Django para auth, admin, sessions

## 🔧 Configurações do Banco

### Desenvolvimento (SQLite)
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Produção (PostgreSQL)
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'send_emails_desk',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## 📋 Backup e Restore

### Backup SQLite
```bash
# Backup completo
cp db.sqlite3 backup_$(date +%Y%m%d_%H%M%S).sqlite3

# Backup via Django
python manage.py dumpdata > backup.json
```

### Restore
```bash
# Restore do arquivo JSON
python manage.py loaddata backup.json
```

## 🔍 Queries Úteis

### Tickets por Status
```sql
SELECT status, COUNT(*) as total 
FROM ticket_management_ticket 
GROUP BY status;
```

### Top 5 Contatos com Mais Tickets
```sql
SELECT c.name, c.email, COUNT(t.id) as ticket_count
FROM contact_management_contact c
LEFT JOIN ticket_management_ticket t ON c.id = t.contact_id
GROUP BY c.id, c.name, c.email
ORDER BY ticket_count DESC
LIMIT 5;
```

### Tickets por Prioridade
```sql
SELECT priority, COUNT(*) as total 
FROM ticket_management_ticket 
GROUP BY priority 
ORDER BY 
    CASE priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END;
```

---

*Documentação gerada em: 13 de outubro de 2025*
*Versão do Sistema: 1.0.0*
*Banco de Dados: SQLite (desenvolvimento)*