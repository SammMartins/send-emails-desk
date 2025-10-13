#!/bin/bash

# Script de deploy para Send Emails Desk
# Este script automatiza o processo de deploy da aplicação

set -e  # Parar execução em caso de erro

echo "🚀 Iniciando deploy do Send Emails Desk..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARN: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado. Instale o Docker primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado. Instale o Docker Compose primeiro."
    exit 1
fi

# Verificar se .env existe
if [ ! -f .env ]; then
    warn "Arquivo .env não encontrado. Copiando .env.example..."
    cp .env.example .env
    warn "IMPORTANTE: Configure as variáveis de ambiente em .env antes de continuar!"
    read -p "Pressione Enter quando tiver configurado o .env..."
fi

# Parar containers existentes
log "Parando containers existentes..."
docker-compose down

# Remover imagens antigas (opcional)
read -p "Deseja remover imagens antigas para rebuild completo? (y/N): " rebuild
if [[ $rebuild =~ ^[Yy]$ ]]; then
    log "Removendo imagens antigas..."
    docker-compose down --rmi all
fi

# Build das imagens
log "Construindo imagens Docker..."
docker-compose build --no-cache

# Iniciar banco de dados primeiro
log "Iniciando banco de dados..."
docker-compose up -d db redis

# Aguardar banco estar pronto
log "Aguardando banco de dados estar pronto..."
sleep 10

# Executar migrações
log "Executando migrações..."
docker-compose run --rm backend python manage.py migrate

# Criar superusuário se não existir
log "Verificando superusuário..."
docker-compose run --rm backend python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superusuário criado: admin/admin123')
else:
    print('Superusuário já existe')
"

# Coletar arquivos estáticos
log "Coletando arquivos estáticos..."
docker-compose run --rm backend python manage.py collectstatic --noinput

# Criar dados de teste (opcional)
read -p "Deseja criar dados de teste? (y/N): " create_test_data
if [[ $create_test_data =~ ^[Yy]$ ]]; then
    log "Criando dados de teste..."
    docker-compose run --rm backend python manage.py create_test_data
fi

# Iniciar todos os serviços
log "Iniciando todos os serviços..."
docker-compose up -d

# Aguardar serviços estarem prontos
log "Aguardando serviços estarem prontos..."
sleep 15

# Verificar se serviços estão rodando
log "Verificando status dos serviços..."
docker-compose ps

# Testar conexões
log "Testando conectividade..."

# Testar backend
if curl -f http://localhost:8000/admin/ > /dev/null 2>&1; then
    log "✅ Backend está respondendo em http://localhost:8000"
else
    warn "❌ Backend não está respondendo"
fi

# Testar frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log "✅ Frontend está respondendo em http://localhost:3000"
else
    warn "❌ Frontend não está respondendo"
fi

log "🎉 Deploy concluído!"
echo ""
echo "📋 Informações de acesso:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000/api/"
echo "   Admin Django: http://localhost:8000/admin/"
echo "   Usuário admin: admin / admin123"
echo ""
echo "📊 Para monitorar logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Para parar todos os serviços:"
echo "   docker-compose down"
echo ""
echo "🔄 Para atualizar e fazer redeploy:"
echo "   git pull && ./deploy.sh"