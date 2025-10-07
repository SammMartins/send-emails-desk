const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create a temporary database for demo
const dbPath = path.join(__dirname, '../demo-helpdesk.db');

// Remove existing demo database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_id TEXT UNIQUE,
    subject TEXT NOT NULL,
    description TEXT,
    sender_email TEXT NOT NULL,
    sender_name TEXT,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    first_response_at DATETIME,
    resolved_at DATETIME,
    assigned_to TEXT
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    city TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS annotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
  );

  CREATE TABLE IF NOT EXISTS sla_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    first_response_hours REAL DEFAULT 4.0,
    resolution_hours REAL DEFAULT 24.0,
    business_hours_only INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    user TEXT,
    changes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ai_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    sentiment TEXT,
    tone_analysis TEXT,
    suggested_response TEXT,
    keywords TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
  );

  INSERT INTO sla_config (id, name, first_response_hours, resolution_hours, business_hours_only)
  VALUES (1, 'default', 4.0, 24.0, 1);

  CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
  CREATE INDEX IF NOT EXISTS idx_tickets_sender ON tickets(sender_email);
  CREATE INDEX IF NOT EXISTS idx_tickets_created ON tickets(created_at);
  CREATE INDEX IF NOT EXISTS idx_contacts_city ON contacts(city);
  CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
  CREATE INDEX IF NOT EXISTS idx_annotations_ticket ON annotations(ticket_id);
  CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
`);

console.log('Database schema created successfully!');

// Seed contacts
const contacts = [
  { email: 'joao.silva@empresa.com.br', name: 'João Silva', phone: '(11) 98765-4321', city: 'São Paulo' },
  { email: 'maria.santos@empresa.com.br', name: 'Maria Santos', phone: '(21) 97654-3210', city: 'Rio de Janeiro' },
  { email: 'pedro.oliveira@empresa.com.br', name: 'Pedro Oliveira', phone: '(31) 96543-2109', city: 'Belo Horizonte' },
  { email: 'ana.costa@empresa.com.br', name: 'Ana Costa', phone: '(11) 95432-1098', city: 'São Paulo' },
  { email: 'carlos.ferreira@empresa.com.br', name: 'Carlos Ferreira', phone: '(51) 94321-0987', city: 'Porto Alegre' },
  { email: 'julia.almeida@empresa.com.br', name: 'Júlia Almeida', phone: '(41) 93210-9876', city: 'Curitiba' },
  { email: 'ricardo.souza@empresa.com.br', name: 'Ricardo Souza', phone: '(71) 92109-8765', city: 'Salvador' },
  { email: 'patricia.lima@empresa.com.br', name: 'Patrícia Lima', phone: '(85) 91098-7654', city: 'Fortaleza' },
  { email: 'marcos.rocha@empresa.com.br', name: 'Marcos Rocha', phone: '(11) 90987-6543', city: 'São Paulo' },
  { email: 'fernanda.dias@empresa.com.br', name: 'Fernanda Dias', phone: '(21) 89876-5432', city: 'Rio de Janeiro' }
];

const insertContact = db.prepare('INSERT INTO contacts (email, name, phone, city) VALUES (?, ?, ?, ?)');
contacts.forEach(contact => {
  insertContact.run(contact.email, contact.name, contact.phone, contact.city);
});

console.log(`Inserted ${contacts.length} contacts`);

// Seed tickets
const tickets = [
  {
    email_id: 'msg001',
    subject: 'Não consigo acessar o sistema',
    description: 'Olá, estou tentando fazer login no sistema mas aparece uma mensagem de erro. Pode me ajudar?',
    sender_email: 'joao.silva@empresa.com.br',
    sender_name: 'João Silva',
    status: 'open',
    priority: 'high',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    email_id: 'msg002',
    subject: 'Solicitação de nova funcionalidade',
    description: 'Gostaria de sugerir uma nova funcionalidade no sistema de relatórios. Seria possível adicionar filtros por data?',
    sender_email: 'maria.santos@empresa.com.br',
    sender_name: 'Maria Santos',
    status: 'in_progress',
    priority: 'medium',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    first_response_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    email_id: 'msg003',
    subject: 'Erro ao gerar relatório',
    description: 'Quando tento gerar o relatório mensal, o sistema trava. Já tentei várias vezes.',
    sender_email: 'pedro.oliveira@empresa.com.br',
    sender_name: 'Pedro Oliveira',
    status: 'open',
    priority: 'urgent',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
  },
  {
    email_id: 'msg004',
    subject: 'Dúvida sobre cobrança',
    description: 'Recebi uma cobrança duplicada. Pode verificar?',
    sender_email: 'ana.costa@empresa.com.br',
    sender_name: 'Ana Costa',
    status: 'closed',
    priority: 'high',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    first_response_at: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    email_id: 'msg005',
    subject: 'Reset de senha',
    description: 'Esqueci minha senha e preciso resetar. Como faço?',
    sender_email: 'carlos.ferreira@empresa.com.br',
    sender_name: 'Carlos Ferreira',
    status: 'closed',
    priority: 'low',
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
    first_response_at: new Date(Date.now() - 71 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 70 * 60 * 60 * 1000).toISOString()
  },
  {
    email_id: 'msg006',
    subject: 'Sistema lento',
    description: 'O sistema está muito lento hoje. Isso é normal?',
    sender_email: 'julia.almeida@empresa.com.br',
    sender_name: 'Júlia Almeida',
    status: 'in_progress',
    priority: 'medium',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    first_response_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    email_id: 'msg007',
    subject: 'Parabéns pelo sistema!',
    description: 'Só queria parabenizar pela qualidade do sistema. Muito bom!',
    sender_email: 'ricardo.souza@empresa.com.br',
    sender_name: 'Ricardo Souza',
    status: 'closed',
    priority: 'low',
    created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), // 4 days ago
    first_response_at: new Date(Date.now() - 95 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 94 * 60 * 60 * 1000).toISOString()
  },
  {
    email_id: 'msg008',
    subject: 'Problema com impressão',
    description: 'Não consigo imprimir os documentos. A impressora está configurada corretamente?',
    sender_email: 'patricia.lima@empresa.com.br',
    sender_name: 'Patrícia Lima',
    status: 'open',
    priority: 'medium',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
  },
  {
    email_id: 'msg009',
    subject: 'Erro 500',
    description: 'Estou recebendo erro 500 ao tentar salvar dados. URGENTE!',
    sender_email: 'marcos.rocha@empresa.com.br',
    sender_name: 'Marcos Rocha',
    status: 'in_progress',
    priority: 'urgent',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    first_response_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    email_id: 'msg010',
    subject: 'Atualização de dados cadastrais',
    description: 'Preciso atualizar meu endereço no cadastro. Como faço?',
    sender_email: 'fernanda.dias@empresa.com.br',
    sender_name: 'Fernanda Dias',
    status: 'open',
    priority: 'low',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
  }
];

const insertTicket = db.prepare(`
  INSERT INTO tickets (email_id, subject, description, sender_email, sender_name, status, priority, created_at, first_response_at, resolved_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

tickets.forEach(ticket => {
  insertTicket.run(
    ticket.email_id,
    ticket.subject,
    ticket.description,
    ticket.sender_email,
    ticket.sender_name,
    ticket.status,
    ticket.priority,
    ticket.created_at,
    ticket.first_response_at || null,
    ticket.resolved_at || null
  );
});

console.log(`Inserted ${tickets.length} tickets`);

// Seed annotations
const annotations = [
  { ticket_id: 2, content: 'Entraremos em contato com a equipe de desenvolvimento para avaliar a viabilidade.', created_by: 'Suporte' },
  { ticket_id: 2, content: 'A funcionalidade está planejada para o próximo release.', created_by: 'Desenvolvimento' },
  { ticket_id: 4, content: 'Verificado o sistema de cobrança. Realmente houve duplicação. Estorno será processado.', created_by: 'Financeiro' },
  { ticket_id: 5, content: 'Link de reset enviado por e-mail.', created_by: 'Suporte' },
  { ticket_id: 6, content: 'Identificamos um problema no servidor. Equipe técnica já está trabalhando na solução.', created_by: 'TI' },
  { ticket_id: 7, content: 'Obrigado pelo feedback!', created_by: 'Suporte' },
  { ticket_id: 9, content: 'Erro identificado no banco de dados. Correção em andamento.', created_by: 'Desenvolvimento' }
];

const insertAnnotation = db.prepare('INSERT INTO annotations (ticket_id, content, created_by) VALUES (?, ?, ?)');
annotations.forEach(annotation => {
  insertAnnotation.run(annotation.ticket_id, annotation.content, annotation.created_by);
});

console.log(`Inserted ${annotations.length} annotations`);

// Seed AI analysis
const aiAnalyses = [
  {
    ticket_id: 1,
    sentiment: 'neutral',
    tone_analysis: 'polite',
    suggested_response: 'Olá João, obrigado por entrar em contato. Vamos verificar o problema de acesso. Por favor, pode me informar qual é a mensagem de erro exata que aparece?',
    keywords: 'login, erro, acesso'
  },
  {
    ticket_id: 3,
    sentiment: 'negative',
    tone_analysis: 'frustrated',
    suggested_response: 'Olá Pedro, lamentamos pelo inconveniente. Entendemos a urgência. Nossa equipe técnica já foi notificada e está investigando o problema com o relatório. Manteremos você informado.',
    keywords: 'relatório, erro, trava'
  },
  {
    ticket_id: 7,
    sentiment: 'positive',
    tone_analysis: 'satisfied',
    suggested_response: 'Olá Ricardo, muito obrigado pelo feedback positivo! Ficamos muito felizes em saber que o sistema está atendendo suas necessidades.',
    keywords: 'parabéns, qualidade, positivo'
  }
];

const insertAIAnalysis = db.prepare(`
  INSERT INTO ai_analysis (ticket_id, sentiment, tone_analysis, suggested_response, keywords)
  VALUES (?, ?, ?, ?, ?)
`);

aiAnalyses.forEach(analysis => {
  insertAIAnalysis.run(
    analysis.ticket_id,
    analysis.sentiment,
    analysis.tone_analysis,
    analysis.suggested_response,
    analysis.keywords
  );
});

console.log(`Inserted ${aiAnalyses.length} AI analyses`);

db.close();

console.log('\n✅ Database seeded successfully!');
console.log(`Database location: ${dbPath}`);
console.log('\nYou can now copy this database to your Electron userData directory to test the application with sample data.');
