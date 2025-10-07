# ⚙️ Configuração

## Variáveis de Ambiente

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

## Configuração do Gmail

Para usar o Gmail como servidor de e-mail:

1. Ative a **autenticação de dois fatores** na sua conta Google
2. Gere uma **senha de aplicativo**:
   - Acesse https://myaccount.google.com/security
   - Em "Fazer login no Google", selecione "Senhas de app"
   - Gere uma senha para "E-mail" em "Outro"
   - Use essa senha no arquivo `.env`

## Configuração de SLA

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
