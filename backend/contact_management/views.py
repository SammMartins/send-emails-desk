from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Contact, ContactHistory
from .serializers import (
    ContactSerializer, ContactHistorySerializer, ContactCreateSerializer
)


class ContactViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar contatos"""
    
    queryset = Contact.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'company', 'department']
    search_fields = ['name', 'email', 'company']
    ordering_fields = ['name', 'email', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ContactCreateSerializer
        return ContactSerializer
    
    def get_queryset(self):
        queryset = Contact.objects.all()
        
        # Filtro por status ativo
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Retorna histórico de interações do contato"""
        contact = self.get_object()
        history = ContactHistory.objects.filter(contact=contact)
        
        # Aplicar filtros de data se fornecidos
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            history = history.filter(created_at__gte=start_date)
        if end_date:
            history = history.filter(created_at__lte=end_date)
        
        # Paginar resultados
        page = self.paginate_queryset(history)
        if page is not None:
            serializer = ContactHistorySerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ContactHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def tickets(self, request, pk=None):
        """Retorna tickets do contato"""
        contact = self.get_object()
        tickets = contact.tickets.all()
        
        # Aplicar filtros
        status_filter = request.query_params.get('status')
        if status_filter:
            tickets = tickets.filter(status=status_filter)
        
        priority_filter = request.query_params.get('priority')
        if priority_filter:
            tickets = tickets.filter(priority=priority_filter)
        
        # Importar aqui para evitar dependência circular
        from ticket_management.serializers import TicketListSerializer
        
        page = self.paginate_queryset(tickets)
        if page is not None:
            serializer = TicketListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = TicketListSerializer(tickets, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Adiciona uma nota ao histórico do contato"""
        contact = self.get_object()
        note_content = request.data.get('note', '')
        
        if not note_content:
            return Response(
                {'error': 'Conteúdo da nota é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        history_entry = ContactHistory.objects.create(
            contact=contact,
            interaction_type='note',
            description=note_content,
            created_by=request.user
        )
        
        serializer = ContactHistorySerializer(history_entry)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Busca avançada de contatos"""
        query = request.query_params.get('q', '')
        
        if not query:
            return Response([])
        
        # Busca em múltiplos campos
        contacts = Contact.objects.filter(
            Q(name__icontains=query) |
            Q(email__icontains=query) |
            Q(company__icontains=query) |
            Q(phone__icontains=query)
        ).filter(is_active=True)[:10]  # Limitar a 10 resultados
        
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data)


class ContactHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para visualizar histórico de contatos"""
    
    queryset = ContactHistory.objects.all()
    serializer_class = ContactHistorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['contact', 'interaction_type', 'related_ticket']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
