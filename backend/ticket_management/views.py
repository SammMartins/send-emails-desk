from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, Case, When, FloatField
from django.utils import timezone
from datetime import timedelta
from .models import Ticket, TicketCategory, TicketComment, TicketAttachment, TicketLog
from .serializers import (
    TicketListSerializer, TicketDetailSerializer, TicketCreateSerializer,
    TicketUpdateSerializer, TicketCategorySerializer, TicketCommentSerializer,
    TicketAttachmentSerializer, TicketLogSerializer, TicketStatsSerializer
)


class TicketCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet para categorias de tickets"""
    
    queryset = TicketCategory.objects.filter(is_active=True)
    serializer_class = TicketCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['name']


class TicketViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar tickets"""
    
    queryset = Ticket.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'category', 'assigned_to', 'contact']
    search_fields = ['title', 'description', 'contact__name', 'contact__email']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'sla_deadline']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TicketListSerializer
        elif self.action == 'create':
            return TicketCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TicketUpdateSerializer
        return TicketDetailSerializer
    
    def get_queryset(self):
        queryset = Ticket.objects.select_related(
            'contact', 'assigned_to', 'category', 'created_by'
        ).prefetch_related('comments', 'attachments')
        
        # Filtros específicos
        overdue = self.request.query_params.get('overdue')
        if overdue == 'true':
            queryset = queryset.filter(
                sla_deadline__lt=timezone.now(),
                status__in=['open', 'in_progress', 'waiting_customer']
            )
        
        # Filtro por período
        days = self.request.query_params.get('days')
        if days:
            try:
                days_int = int(days)
                start_date = timezone.now() - timedelta(days=days_int)
                queryset = queryset.filter(created_at__gte=start_date)
            except ValueError:
                pass
        
        # Filtro por sentimento
        sentiment = self.request.query_params.get('sentiment')
        if sentiment:
            queryset = queryset.filter(sentiment_label=sentiment)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Adiciona comentário ao ticket"""
        ticket = self.get_object()
        content = request.data.get('content', '')
        comment_type = request.data.get('comment_type', 'internal')
        
        if not content:
            return Response(
                {'error': 'Conteúdo do comentário é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        comment = TicketComment.objects.create(
            ticket=ticket,
            comment_type=comment_type,
            content=content,
            created_by=request.user
        )
        
        # Registrar no log
        TicketLog.objects.create(
            ticket=ticket,
            action='comment_added',
            description=f"Comentário {comment_type} adicionado",
            created_by=request.user
        )
        
        serializer = TicketCommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Atribui ticket a um usuário"""
        ticket = self.get_object()
        user_id = request.data.get('user_id')
        
        if user_id:
            from django.contrib.auth.models import User
            try:
                user = User.objects.get(id=user_id)
                old_assignee = ticket.assigned_to
                ticket.assigned_to = user
                ticket.save()
                
                # Registrar no log
                TicketLog.objects.create(
                    ticket=ticket,
                    action='assigned',
                    description=f"Ticket atribuído para {user.username}",
                    old_value=old_assignee.username if old_assignee else None,
                    new_value=user.username,
                    created_by=request.user
                )
                
                return Response({'message': 'Ticket atribuído com sucesso'})
            except User.DoesNotExist:
                return Response(
                    {'error': 'Usuário não encontrado'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Desatribuir
            old_assignee = ticket.assigned_to
            ticket.assigned_to = None
            ticket.save()
            
            TicketLog.objects.create(
                ticket=ticket,
                action='unassigned',
                description="Ticket desatribuído",
                old_value=old_assignee.username if old_assignee else None,
                created_by=request.user
            )
            
            return Response({'message': 'Ticket desatribuído com sucesso'})
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """Altera status do ticket"""
        ticket = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Ticket.STATUS_CHOICES):
            return Response(
                {'error': 'Status inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = ticket.status
        ticket.status = new_status
        ticket.save()
        
        # Registrar no log
        TicketLog.objects.create(
            ticket=ticket,
            action='status_changed',
            description=f"Status alterado de {old_status} para {new_status}",
            old_value=old_status,
            new_value=new_status,
            created_by=request.user
        )
        
        return Response({'message': 'Status alterado com sucesso'})
    
    @action(detail=True, methods=['get'])
    def suggestions(self, request, pk=None):
        """Retorna sugestões de resposta para o ticket"""
        ticket = self.get_object()
        
        # Importar aqui para evitar problemas de inicialização
        from ai.response_suggestions import get_response_suggestions
        
        try:
            suggestions = get_response_suggestions(
                ticket.description,
                ticket.category.name if ticket.category else None,
                ticket.priority
            )
            return Response({'suggestions': suggestions})
        except Exception as e:
            return Response(
                {'error': 'Erro ao gerar sugestões', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Retorna estatísticas dos tickets"""
        # Período para análise
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Tickets do período
        tickets = Ticket.objects.filter(created_at__gte=start_date)
        
        # Estatísticas básicas
        total_tickets = tickets.count()
        open_tickets = tickets.filter(status='open').count()
        in_progress_tickets = tickets.filter(status='in_progress').count()
        resolved_tickets = tickets.filter(status='resolved').count()
        overdue_tickets = tickets.filter(
            sla_deadline__lt=timezone.now(),
            status__in=['open', 'in_progress', 'waiting_customer']
        ).count()
        
        # Tempo médio de resolução
        resolved_tickets_with_time = tickets.filter(
            status='resolved',
            resolved_at__isnull=False
        )
        
        avg_resolution_time = 0
        if resolved_tickets_with_time.exists():
            avg_resolution_time = resolved_tickets_with_time.aggregate(
                avg_time=Avg(
                    Case(
                        When(resolved_at__isnull=False, 
                             then=(timezone.now() - timezone.now())),
                        default=0,
                        output_field=FloatField()
                    )
                )
            )['avg_time'] or 0
        
        # Distribuição por prioridade
        tickets_by_priority = dict(
            tickets.values('priority').annotate(count=Count('id')).values_list('priority', 'count')
        )
        
        # Distribuição por status
        tickets_by_status = dict(
            tickets.values('status').annotate(count=Count('id')).values_list('status', 'count')
        )
        
        # Distribuição por categoria
        tickets_by_category = dict(
            tickets.filter(category__isnull=False)
            .values('category__name')
            .annotate(count=Count('id'))
            .values_list('category__name', 'count')
        )
        
        # Compliance SLA
        total_with_sla = tickets.filter(sla_deadline__isnull=False).count()
        on_time = tickets.filter(
            sla_deadline__isnull=False,
            resolved_at__lte=timezone.now()
        ).count() if total_with_sla > 0 else 0
        
        sla_compliance = (on_time / total_with_sla * 100) if total_with_sla > 0 else 100
        
        stats_data = {
            'total_tickets': total_tickets,
            'open_tickets': open_tickets,
            'in_progress_tickets': in_progress_tickets,
            'resolved_tickets': resolved_tickets,
            'overdue_tickets': overdue_tickets,
            'avg_resolution_time': avg_resolution_time,
            'tickets_by_priority': tickets_by_priority,
            'tickets_by_status': tickets_by_status,
            'tickets_by_category': tickets_by_category,
            'sla_compliance': sla_compliance
        }
        
        serializer = TicketStatsSerializer(stats_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_tickets(self, request):
        """Retorna tickets atribuídos ao usuário atual"""
        tickets = self.get_queryset().filter(assigned_to=request.user)
        
        page = self.paginate_queryset(tickets)
        if page is not None:
            serializer = TicketListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = TicketListSerializer(tickets, many=True)
        return Response(serializer.data)


class TicketCommentViewSet(viewsets.ModelViewSet):
    """ViewSet para comentários de tickets"""
    
    queryset = TicketComment.objects.all()
    serializer_class = TicketCommentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['ticket', 'comment_type', 'created_by']
    ordering = ['created_at']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TicketAttachmentViewSet(viewsets.ModelViewSet):
    """ViewSet para anexos de tickets"""
    
    queryset = TicketAttachment.objects.all()
    serializer_class = TicketAttachmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['ticket', 'uploaded_by']
    
    def perform_create(self, serializer):
        # Calcular tamanho e tipo do arquivo
        file_obj = self.request.FILES.get('file')
        if file_obj:
            serializer.save(
                uploaded_by=self.request.user,
                filename=file_obj.name,
                file_size=file_obj.size,
                content_type=file_obj.content_type
            )


class TicketLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para logs de tickets (apenas leitura)"""
    
    queryset = TicketLog.objects.all()
    serializer_class = TicketLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['ticket', 'action', 'created_by']
    ordering = ['-created_at']
