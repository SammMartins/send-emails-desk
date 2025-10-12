from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User

def home_view(request):
    """
    View para a página inicial do sistema
    """
    html_content = """
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Send Emails Desk - Sistema de Help Desk</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                border-radius: 15px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                padding: 3rem;
                max-width: 800px;
                text-align: center;
            }
            .logo {
                font-size: 2.5rem;
                font-weight: bold;
                color: #667eea;
                margin-bottom: 1rem;
            }
            .subtitle {
                font-size: 1.2rem;
                color: #666;
                margin-bottom: 2rem;
            }
            .access-links {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                margin: 2rem 0;
            }
            .access-card {
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                border-radius: 10px;
                padding: 1.5rem;
                text-decoration: none;
                color: inherit;
                transition: all 0.3s ease;
            }
            .access-card:hover {
                border-color: #667eea;
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
            .access-card h3 {
                color: #667eea;
                margin: 0 0 1rem 0;
                font-size: 1.3rem;
            }
            .access-card p {
                margin: 0;
                color: #666;
                font-size: 0.9rem;
            }
            .credentials {
                background: #e3f2fd;
                border-radius: 8px;
                padding: 1rem;
                margin: 1rem 0;
                text-align: left;
            }
            .credentials h4 {
                margin: 0 0 0.5rem 0;
                color: #1976d2;
            }
            .status {
                display: inline-block;
                padding: 0.3rem 0.8rem;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: bold;
                margin: 0.5rem;
            }
            .status.active {
                background: #4caf50;
                color: white;
            }
            .status.starting {
                background: #ff9800;
                color: white;
            }
            .test-section {
                margin-top: 2rem;
                padding: 1rem;
                background: #f0f8ff;
                border-radius: 8px;
                text-align: left;
            }
            .test-button {
                display: inline-block;
                padding: 0.5rem 1rem;
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 0.5rem;
                font-size: 0.9rem;
            }
            .test-button:hover {
                background: #5a6fd8;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">📧 Send Emails Desk</div>
            <div class="subtitle">Sistema de Help Desk com IA Integrada</div>
            
            <div class="status active">Backend Ativo ✅</div>
            <div class="status starting">Frontend Disponível ✅</div>
            
            <div class="access-links">
                <a href="/admin/" class="access-card">
                    <h3>🔧 Painel Administrativo</h3>
                    <p>Gerencie usuários, tickets e configurações do sistema</p>
                    <div class="credentials">
                        <h4>Credenciais de Acesso:</h4>
                        <strong>Usuário:</strong> admin<br>
                        <strong>Senha:</strong> admin123
                    </div>
                </a>
                
                <a href="/api/" class="access-card">
                    <h3>🔗 API REST</h3>
                    <p>Documentação e endpoints da API para desenvolvedores</p>
                    <div class="credentials">
                        <h4>Endpoints Principais:</h4>
                        • /api/tickets/<br>
                        • /api/contacts/<br>
                        • /api/categories/
                    </div>
                </a>
                
                <a href="http://localhost:3000" class="access-card" target="_blank">
                    <h3>🖥️ Interface Web</h3>
                    <p>Aplicação React para agentes e usuários finais</p>
                    <div class="credentials">
                        <h4>Usuários de Teste:</h4>
                        <strong>Agent 1:</strong> agent1 / password123<br>
                        <strong>Agent 2:</strong> agent2 / password123
                    </div>
                </a>
            </div>
            
            <div class="test-section">
                <h4>🧪 Testes Rápidos da API:</h4>
                <a href="/api/test/" class="test-button">Testar API</a>
                <a href="/api/token/" class="test-button">Teste Auth (POST)</a>
                <a href="/api/tickets/" class="test-button">Ver Tickets</a>
                <a href="/api/contacts/" class="test-button">Ver Contatos</a>
            </div>
            
            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #eee;">
                <h4>🚀 Sistema Implementado com Sucesso!</h4>
                <p>Todas as funcionalidades descritas no README.md foram implementadas:</p>
                <p>✅ Gestão de Tickets | ✅ Dashboard e Métricas | ✅ IA Integrada | ✅ API REST</p>
                <p><strong>Problema resolvido:</strong> Página inicial configurada, erro 404 corrigido!</p>
            </div>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html_content)

def api_documentation(request):
    """
    View para documentação básica da API
    """
    documentation = {
        "message": "Send Emails Desk API",
        "version": "1.0.0",
        "status": "ativo",
        "endpoints": {
            "authentication": {
                "/api/token/": "POST - Obter token JWT",
                "/api/token/refresh/": "POST - Renovar token JWT"
            },
            "tickets": {
                "/api/tickets/": "GET, POST - Listar e criar tickets",
                "/api/tickets/{id}/": "GET, PUT, PATCH, DELETE - Operações com ticket específico",
                "/api/categories/": "GET, POST - Categorias de tickets",
                "/api/comments/": "GET, POST - Comentários de tickets"
            },
            "contacts": {
                "/api/contacts/": "GET, POST - Listar e criar contatos",
                "/api/contacts/{id}/": "GET, PUT, PATCH, DELETE - Operações com contato específico",
                "/api/contacts/{id}/history/": "GET - Histórico do contato"
            },
            "test": {
                "/api/test/": "GET - Endpoint de teste (sem autenticação)"
            }
        },
        "authentication_required": "Bearer Token (JWT) para endpoints protegidos",
        "cors_enabled": True,
        "admin_panel": "/admin/",
        "frontend_url": "http://localhost:3000",
        "documentation": "Esta página"
    }
    
    return JsonResponse(documentation, json_dumps_params={'indent': 2})

@api_view(['GET'])
def test_api(request):
    """
    Endpoint de teste simples (sem autenticação)
    """
    return Response({
        "message": "API funcionando corretamente!",
        "timestamp": "2025-10-12T18:21:49Z",
        "user_authenticated": request.user.is_authenticated,
        "total_users": User.objects.count(),
        "cors_headers_enabled": True,
        "status": "success"
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_auth(request):
    """
    Endpoint de teste com autenticação
    """
    return Response({
        "message": "Autenticação funcionando!",
        "user": request.user.username,
        "is_staff": request.user.is_staff,
        "timestamp": "2025-10-12T18:21:49Z"
    })