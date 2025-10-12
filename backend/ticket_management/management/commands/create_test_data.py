"""
Script para criar dados de teste
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from contact_management.models import Contact, ContactHistory
from ticket_management.models import Ticket, TicketCategory, TicketComment
from datetime import datetime, timedelta
from django.utils import timezone
import random


class Command(BaseCommand):
    help = 'Cria dados de teste para o sistema'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Criando dados de teste...'))

        # Criar usuários de teste
        if not User.objects.filter(username='agent1').exists():
            User.objects.create_user('agent1', 'agent1@example.com', 'password123')
        if not User.objects.filter(username='agent2').exists():
            User.objects.create_user('agent2', 'agent2@example.com', 'password123')

        agents = User.objects.filter(username__in=['agent1', 'agent2'])

        # Criar categorias
        categories_data = [
            {'name': 'Suporte Técnico', 'description': 'Problemas técnicos e bugs', 'color': '#f44336'},
            {'name': 'Financeiro', 'description': 'Questões de faturamento e pagamento', 'color': '#4caf50'},
            {'name': 'Geral', 'description': 'Dúvidas e informações gerais', 'color': '#2196f3'},
            {'name': 'Reclamações', 'description': 'Reclamações e feedback negativo', 'color': '#ff9800'},
        ]

        categories = []
        for cat_data in categories_data:
            category, created = TicketCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            categories.append(category)

        # Criar contatos
        contacts_data = [
            {'name': 'João Silva', 'email': 'joao.silva@empresa.com', 'company': 'Empresa A', 'department': 'TI'},
            {'name': 'Maria Santos', 'email': 'maria.santos@empresa.com', 'company': 'Empresa A', 'department': 'Financeiro'},
            {'name': 'Pedro Oliveira', 'email': 'pedro@startup.com', 'company': 'Startup XYZ', 'department': 'Desenvolvimento'},
            {'name': 'Ana Costa', 'email': 'ana.costa@gmail.com', 'company': 'Freelancer', 'department': 'Design'},
            {'name': 'Carlos Ferreira', 'email': 'carlos@comercio.com', 'company': 'Comércio ABC', 'department': 'Vendas'},
        ]

        contacts = []
        for contact_data in contacts_data:
            contact, created = Contact.objects.get_or_create(
                email=contact_data['email'],
                defaults=contact_data
            )
            contacts.append(contact)

        # Criar tickets
        tickets_data = [
            {
                'title': 'Sistema não carrega após atualização',
                'description': 'Após a última atualização, o sistema não está carregando. Aparece uma tela branca.',
                'priority': 'high',
                'status': 'open',
            },
            {
                'title': 'Erro ao gerar relatório financeiro',
                'description': 'Não consigo gerar o relatório mensal. O sistema retorna erro 500.',
                'priority': 'medium',
                'status': 'in_progress',
            },
            {
                'title': 'Dúvida sobre funcionalidade de backup',
                'description': 'Como configurar o backup automático dos dados?',
                'priority': 'low',
                'status': 'waiting_customer',
            },
            {
                'title': 'Cobrança indevida na fatura',
                'description': 'Fui cobrado por um serviço que não contratei. Preciso de esclarecimentos.',
                'priority': 'urgent',
                'status': 'open',
            },
            {
                'title': 'Performance lenta do sistema',
                'description': 'O sistema está muito lento, principalmente na parte de relatórios.',
                'priority': 'medium',
                'status': 'resolved',
            },
        ]

        for i, ticket_data in enumerate(tickets_data):
            contact = contacts[i % len(contacts)]
            category = categories[i % len(categories)]
            assigned_to = random.choice(agents) if random.choice([True, False]) else None
            
            # Calcular datas
            created_at = timezone.now() - timedelta(days=random.randint(1, 30))
            
            ticket = Ticket.objects.create(
                title=ticket_data['title'],
                description=ticket_data['description'],
                priority=ticket_data['priority'],
                status=ticket_data['status'],
                contact=contact,
                category=category,
                assigned_to=assigned_to,
                created_at=created_at,
                sentiment_score=random.uniform(-1, 1),
                sentiment_label=random.choice(['positive', 'negative', 'neutral'])
            )

            # Adicionar alguns comentários
            if random.choice([True, False]):
                TicketComment.objects.create(
                    ticket=ticket,
                    comment_type='internal',
                    content='Ticket analisado, iniciando investigação.',
                    created_by=random.choice(agents),
                    created_at=created_at + timedelta(hours=2)
                )

            # Adicionar histórico no contato
            ContactHistory.objects.create(
                contact=contact,
                interaction_type='ticket_created',
                description=f'Ticket #{ticket.id} criado: {ticket.title}',
                related_ticket=ticket,
                created_at=created_at
            )

        self.stdout.write(
            self.style.SUCCESS(f'Dados de teste criados com sucesso!')
        )
        self.stdout.write(f'- {len(categories)} categorias')
        self.stdout.write(f'- {len(contacts)} contatos')
        self.stdout.write(f'- {len(tickets_data)} tickets')
        self.stdout.write(f'- Usuários: admin/admin123, agent1/password123, agent2/password123')