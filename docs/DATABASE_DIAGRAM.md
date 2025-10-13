# 📊 Diagrama do Banco de Dados - Send Emails Desk

## 🔄 Diagrama Entidade-Relacionamento (ER)

```
                                   ┌─────────────────┐
                                   │    auth_user    │
                                   │─────────────────│
                                   │ id (PK)         │
                                   │ username        │
                                   │ email           │
                                   │ first_name      │
                                   │ last_name       │
                                   │ is_staff        │
                                   │ is_active       │
                                   │ date_joined     │
                                   └─────────────────┘
                                           │ │
                         ┌─────────────────┘ └─────────────────┐
                         │                                     │
                         ▼                                     ▼
           ┌─────────────────────────┐               ┌─────────────────────────┐
           │  contact_management     │               │  ticket_management      │
           │       _contact          │               │   _ticketcategory       │
           │─────────────────────────│               │─────────────────────────│
           │ id (PK)                 │               │ id (PK)                 │
           │ name                    │               │ name                    │
           │ email (UNIQUE)          │               │ description             │
           │ phone                   │               │ color                   │
           │ company                 │               │ is_active               │
           │ department              │               │ created_at              │
           │ created_at              │               └─────────────────────────┘
           │ updated_at              │                           │
           │ is_active               │                           │
           │ notes                   │                           ▼
           │ created_by_id (FK)      │               ┌─────────────────────────┐
           └─────────────────────────┘               │  ticket_management      │
                       │                             │       _ticket           │
                       │                             │─────────────────────────│
                       ▼                             │ id (PK)                 │
           ┌─────────────────────────┐               │ title                   │
           │  contact_management     │               │ description             │
           │   _contacthistory       │               │ priority                │
           │─────────────────────────│               │ status                  │
           │ id (PK)                 │◄──────────────│ contact_id (FK)         │
           │ interaction_type        │               │ category_id (FK)        │
           │ description             │               │ assigned_to_id (FK)     │
           │ created_at              │               │ created_by_id (FK)      │
           │ contact_id (FK)         │               │ created_at              │
           │ created_by_id (FK)      │               │ updated_at              │
           │ related_ticket_id (FK)  │               │ sla_deadline            │
           └─────────────────────────┘               │ resolved_at             │
                                                     │ closed_at               │
                                                     │ email_thread_id         │
                                                     │ sentiment_score         │
                                                     │ sentiment_label         │
                                                     │ tags                    │
                                                     └─────────────────────────┘
                                                                 │
                           ┌─────────────────┬─────────────────┼─────────────────┐
                           │                 │                 │                 │
                           ▼                 ▼                 ▼                 ▼
               ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
               │  ticket_management  │ │  ticket_management  │ │  ticket_management  │ │  ticket_management  │
               │   _ticketcomment    │ │  _ticketattachment  │ │    _ticketlog       │ │   (self-reference)  │
               │─────────────────────│ │─────────────────────│ │─────────────────────│ │─────────────────────│
               │ id (PK)             │ │ id (PK)             │ │ id (PK)             │ │ parent_ticket_id    │
               │ comment_type        │ │ file                │ │ action              │ │ (para sub-tickets)  │
               │ content             │ │ filename            │ │ description         │ │                     │
               │ created_at          │ │ file_size           │ │ old_value           │ │                     │
               │ email_message_id    │ │ content_type        │ │ new_value           │ │                     │
               │ is_email_response   │ │ uploaded_at         │ │ created_at          │ │                     │
               │ created_by_id (FK)  │ │ uploaded_by_id (FK) │ │ ip_address          │ │                     │
               │ ticket_id (FK)      │ │ ticket_id (FK)      │ │ created_by_id (FK)  │ │                     │
               └─────────────────────┘ └─────────────────────┘ │ ticket_id (FK)      │ │                     │
                                                               └─────────────────────┘ └─────────────────────┘
```

## 🔗 Relacionamentos Detalhados

### 1. **User ↔ Ticket** (N:N via FKs múltiplas)
```sql
-- Um usuário pode:
- Criar múltiplos tickets (created_by_id)
- Ser responsável por múltiplos tickets (assigned_to_id)
- Fazer comentários em múltiplos tickets
- Fazer uploads em múltiplos tickets

-- Um ticket pode:
- Ter um criador (created_by_id)
- Ter um responsável (assigned_to_id)
- Ter múltiplos comentários de diferentes usuários
- Ter múltiplos anexos de diferentes usuários
```

### 2. **Contact ↔ Ticket** (1:N)
```sql
-- Um contato pode:
- Ter múltiplos tickets associados
- Ter histórico de múltiplas interações

-- Um ticket deve:
- Pertencer a exatamente um contato
```

### 3. **Ticket ↔ Category** (N:1)
```sql
-- Uma categoria pode:
- Ser aplicada a múltiplos tickets

-- Um ticket pode:
- Pertencer a uma categoria (opcional)
```

### 4. **Ticket ↔ Comments/Attachments/Logs** (1:N)
```sql
-- Um ticket pode ter:
- Múltiplos comentários
- Múltiplos anexos
- Múltiplos logs de auditoria

-- Cada comentário/anexo/log pertence a:
- Exatamente um ticket
```

## 📐 Cardinalidades

| Relacionamento | Cardinalidade | Descrição |
|----------------|---------------|-----------|
| User → Ticket (created_by) | 1:N | Um usuário pode criar vários tickets |
| User → Ticket (assigned_to) | 1:N | Um usuário pode ser responsável por vários tickets |
| Contact → Ticket | 1:N | Um contato pode ter vários tickets |
| Category → Ticket | 1:N | Uma categoria pode ter vários tickets |
| Ticket → Comment | 1:N | Um ticket pode ter vários comentários |
| Ticket → Attachment | 1:N | Um ticket pode ter vários anexos |
| Ticket → Log | 1:N | Um ticket pode ter vários logs |
| Contact → ContactHistory | 1:N | Um contato pode ter várias interações |
| User → Comment | 1:N | Um usuário pode fazer vários comentários |
| User → Attachment | 1:N | Um usuário pode fazer vários uploads |
| User → Log | 1:N | Um usuário pode executar várias ações |

## 🔑 Chaves e Índices

### Chaves Primárias
- Todas as tabelas possuem `id` como chave primária auto-incremento

### Chaves Estrangeiras
```sql
-- ticket_management_ticket
FOREIGN KEY (contact_id) REFERENCES contact_management_contact(id)
FOREIGN KEY (category_id) REFERENCES ticket_management_ticketcategory(id)
FOREIGN KEY (assigned_to_id) REFERENCES auth_user(id)
FOREIGN KEY (created_by_id) REFERENCES auth_user(id)

-- ticket_management_ticketcomment
FOREIGN KEY (ticket_id) REFERENCES ticket_management_ticket(id)
FOREIGN KEY (created_by_id) REFERENCES auth_user(id)

-- ticket_management_ticketattachment
FOREIGN KEY (ticket_id) REFERENCES ticket_management_ticket(id)
FOREIGN KEY (uploaded_by_id) REFERENCES auth_user(id)

-- ticket_management_ticketlog
FOREIGN KEY (ticket_id) REFERENCES ticket_management_ticket(id)
FOREIGN KEY (created_by_id) REFERENCES auth_user(id)

-- contact_management_contact
FOREIGN KEY (created_by_id) REFERENCES auth_user(id)

-- contact_management_contacthistory
FOREIGN KEY (contact_id) REFERENCES contact_management_contact(id)
FOREIGN KEY (created_by_id) REFERENCES auth_user(id)
FOREIGN KEY (related_ticket_id) REFERENCES ticket_management_ticket(id)
```

### Índices de Performance
```sql
-- Índices para queries frequentes
CREATE INDEX idx_ticket_status ON ticket_management_ticket(status);
CREATE INDEX idx_ticket_priority ON ticket_management_ticket(priority);
CREATE INDEX idx_ticket_created_at ON ticket_management_ticket(created_at);
CREATE INDEX idx_ticket_assigned_to ON ticket_management_ticket(assigned_to_id);
CREATE INDEX idx_ticket_contact ON ticket_management_ticket(contact_id);

CREATE UNIQUE INDEX idx_contact_email ON contact_management_contact(email);
CREATE INDEX idx_contact_company ON contact_management_contact(company);

CREATE INDEX idx_comment_ticket ON ticket_management_ticketcomment(ticket_id);
CREATE INDEX idx_comment_created_at ON ticket_management_ticketcomment(created_at);

CREATE INDEX idx_log_ticket ON ticket_management_ticketlog(ticket_id);
CREATE INDEX idx_log_created_at ON ticket_management_ticketlog(created_at);
```

## 📊 Modelo Lógico de Dados

### Entidades Principais
1. **User** (Django padrão) - Usuários do sistema
2. **Contact** - Clientes/solicitantes
3. **Ticket** - Solicitações de suporte
4. **TicketCategory** - Categorização dos tickets

### Entidades de Apoio
1. **TicketComment** - Comentários nos tickets
2. **TicketAttachment** - Anexos dos tickets
3. **TicketLog** - Auditoria de ações
4. **ContactHistory** - Histórico de interações

### Regras de Negócio Implementadas
1. **Integridade Referencial**: Todas as FKs com CASCADE ou SET_NULL apropriados
2. **Unicidade**: Email do contato deve ser único
3. **Auditoria**: Todas as ações são logadas
4. **Timestamps**: Campos de data/hora em todas as entidades principais
5. **Soft Delete**: Contatos podem ser desativados (is_active)

## 🔄 Fluxo de Dados

### Criação de Ticket
```
1. E-mail recebido → EmailMonitor
2. EmailMonitor → Extrai dados → Contact (busca/cria)
3. Contact + Dados → Ticket (criação)
4. Ticket → TicketLog (log de criação)
5. Ticket → AI Analysis → sentiment_score/label
6. Ticket → Notificação para agentes
```

### Atualização de Ticket
```
1. Agente faz alteração → API REST
2. API → Valida alteração → Ticket (update)
3. Ticket (update) → TicketLog (log da alteração)
4. Se comentário → TicketComment (criação)
5. Se anexo → TicketAttachment (upload)
6. Contact → ContactHistory (nova interação)
```

## 📈 Consultas Otimizadas

### Dashboard - Tickets por Status
```sql
SELECT 
    status,
    COUNT(*) as total,
    COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_count
FROM ticket_management_ticket 
WHERE created_at >= DATE('now', '-30 days')
GROUP BY status;
```

### Top Contatos com Mais Tickets
```sql
SELECT 
    c.name,
    c.email,
    c.company,
    COUNT(t.id) as ticket_count,
    MAX(t.created_at) as last_ticket
FROM contact_management_contact c
LEFT JOIN ticket_management_ticket t ON c.id = t.contact_id
GROUP BY c.id, c.name, c.email, c.company
ORDER BY ticket_count DESC, last_ticket DESC
LIMIT 10;
```

### SLA Performance
```sql
SELECT 
    AVG(
        CASE 
            WHEN resolved_at IS NOT NULL 
            THEN julianday(resolved_at) - julianday(created_at)
            ELSE NULL 
        END
    ) * 24 as avg_resolution_hours,
    COUNT(CASE WHEN resolved_at <= sla_deadline OR sla_deadline IS NULL THEN 1 END) * 100.0 / COUNT(*) as sla_compliance_percent
FROM ticket_management_ticket
WHERE status IN ('resolved', 'closed');
```

---

*Diagrama atualizado em: 13 de outubro de 2025*  
*Versão do Sistema: 1.0.0*  
*Banco: SQLite (dev) / PostgreSQL (prod)*