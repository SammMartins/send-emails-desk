# 🚀 Instalação

## 1. Clone o Repositório
```bash
git clone https://github.com/SammMartins/send-emails-desk.git
cd send-emails-desk
```

## 2. Configure o Backend

### Crie um ambiente virtual Python
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

### Instale as dependências
```bash
pip install -r requirements.txt
```

### Configure o banco de dados
```bash
# Crie um banco PostgreSQL
createdb send_emails_desk

# Execute as migrações
python manage.py migrate
```

### Crie um superusuário
```bash
python manage.py createsuperuser
```

## 3. Configure o Frontend

```bash
cd frontend
npm install
# ou
yarn install
```

## 4. Configure o Celery

### Inicie o Redis (em terminal separado)
```bash
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
