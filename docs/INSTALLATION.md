# 🚀 Guia de Instalação - Send Emails Desk

## 📋 Pré-requisitos

Antes de iniciar a instalação, certifique-se de ter os seguintes softwares instalados:

### Opção 1: Instalação com Docker (Recomendado)
- [Docker](https://docs.docker.com/get-docker/) (versão 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (versão 2.0+)

### Opção 2: Instalação Manual
- [Python](https://www.python.org/downloads/) (versão 3.8+)
- [Node.js](https://nodejs.org/) (versão 14+)
- [PostgreSQL](https://www.postgresql.org/download/) (versão 12+)
- [Redis](https://redis.io/download) (versão 6+)

---

## 🐳 Instalação com Docker (Recomendado)

### 1. Clone o Repositório
```bash
git clone https://github.com/SammMartins/send-emails-desk.git
cd send-emails-desk
```

### 2. Configure as Variáveis de Ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Django Settings
SECRET_KEY=sua-chave-secreta-aqui
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,seu-dominio.com

# Database Configuration
DB_NAME=send_emails_desk
DB_USER=postgres
DB_PASSWORD=sua-senha-do-postgres
DB_HOST=db
DB_PORT=5432

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-de-app

# IMAP Configuration
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USE_SSL=True
IMAP_USER=seu-email@gmail.com
IMAP_PASSWORD=sua-senha-de-app
```

### 3. Execute o Deploy Automatizado
```bash
chmod +x deploy.sh
./deploy.sh
```

O script irá:
- Construir as imagens Docker
- Configurar o banco de dados
- Executar migrações
- Criar usuário admin
- Iniciar todos os serviços

### 4. Acesse a Aplicação
- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:8000/api/
- **Admin Django**: http://localhost:8000/admin/
- **Credenciais**: admin / admin123
redis-server
```

### Inicie o Celery Worker (em terminal separado)
```bash
celery -A send_emails_desk worker --loglevel=info
```

### Inicie o Celery Beat para tarefas agendadas (opcional)
```bash
celery -A send_emails_desk beat --loglevel=info
```
