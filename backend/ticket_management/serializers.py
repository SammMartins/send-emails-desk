from rest_framework import serializers
from .models import Ticket, TicketCategory, TicketComment, TicketAttachment, TicketLog
from contact_management.serializers import ContactSerializer
from django.contrib.auth.models import User


class TicketCategorySerializer(serializers.ModelSerializer):
    """Serializer para categorias de tickets"""
    
    tickets_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TicketCategory
        fields = ['id', 'name', 'description', 'color', 'is_active', 'created_at', 'tickets_count']
    
    def get_tickets_count(self, obj):
        return obj.ticket_set.filter(status__in=['open', 'in_progress']).count()


class UserSerializer(serializers.ModelSerializer):
    """Serializer básico para usuários"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class TicketCommentSerializer(serializers.ModelSerializer):
    """Serializer para comentários de tickets"""
    
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    comment_type_display = serializers.CharField(source='get_comment_type_display', read_only=True)
    
    class Meta:
        model = TicketComment
        fields = [
            'id', 'ticket', 'comment_type', 'comment_type_display', 'content',
            'created_at', 'created_by', 'created_by_name', 'email_message_id',
            'is_email_response'
        ]
        read_only_fields = ['created_at', 'created_by']


class TicketAttachmentSerializer(serializers.ModelSerializer):
    """Serializer para anexos de tickets"""
    
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TicketAttachment
        fields = [
            'id', 'ticket', 'file', 'file_url', 'filename', 'file_size',
            'content_type', 'uploaded_at', 'uploaded_by', 'uploaded_by_name'
        ]
        read_only_fields = ['uploaded_at', 'uploaded_by', 'file_size', 'content_type']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None


class TicketLogSerializer(serializers.ModelSerializer):
    """Serializer para logs de tickets"""
    
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = TicketLog
        fields = [
            'id', 'ticket', 'action', 'action_display', 'description',
            'old_value', 'new_value', 'created_at', 'created_by',
            'created_by_name', 'ip_address'
        ]
        read_only_fields = ['created_at', 'created_by', 'ip_address']


class TicketListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem de tickets"""
    
    contact_name = serializers.CharField(source='contact.name', read_only=True)
    contact_email = serializers.CharField(source='contact.email', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'priority', 'priority_display', 'status', 'status_display',
            'contact_name', 'contact_email', 'assigned_to_name', 'category_name',
            'created_at', 'updated_at', 'sla_deadline', 'is_overdue'
        ]


class TicketDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para detalhes de tickets"""
    
    contact = ContactSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    category = TicketCategorySerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    
    comments = TicketCommentSerializer(many=True, read_only=True)
    attachments = TicketAttachmentSerializer(many=True, read_only=True, context={'request': None})
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'priority', 'priority_display',
            'status', 'status_display', 'contact', 'assigned_to', 'category',
            'created_at', 'updated_at', 'sla_deadline', 'resolved_at', 'closed_at',
            'created_by', 'email_thread_id', 'sentiment_score', 'sentiment_label',
            'tags', 'is_overdue', 'time_to_resolution', 'comments', 'attachments'
        ]


class TicketCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de tickets"""
    
    class Meta:
        model = Ticket
        fields = [
            'title', 'description', 'priority', 'contact', 'assigned_to',
            'category', 'tags'
        ]
    
    def create(self, validated_data):
        # Adicionar usuário que criou
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class TicketUpdateSerializer(serializers.ModelSerializer):
    """Serializer para atualização de tickets"""
    
    class Meta:
        model = Ticket
        fields = [
            'title', 'description', 'priority', 'status', 'assigned_to',
            'category', 'tags'
        ]
    
    def update(self, instance, validated_data):
        # Registrar mudanças no log
        old_values = {}
        new_values = {}
        
        for field, new_value in validated_data.items():
            old_value = getattr(instance, field)
            if old_value != new_value:
                old_values[field] = str(old_value) if old_value is not None else None
                new_values[field] = str(new_value) if new_value is not None else None
        
        # Atualizar instância
        updated_instance = super().update(instance, validated_data)
        
        # Criar log das mudanças
        if old_values:
            TicketLog.objects.create(
                ticket=updated_instance,
                action='updated',
                description=f"Ticket atualizado: {', '.join(old_values.keys())}",
                old_value=str(old_values),
                new_value=str(new_values),
                created_by=self.context['request'].user
            )
        
        return updated_instance


class TicketStatsSerializer(serializers.Serializer):
    """Serializer para estatísticas de tickets"""
    
    total_tickets = serializers.IntegerField()
    open_tickets = serializers.IntegerField()
    in_progress_tickets = serializers.IntegerField()
    resolved_tickets = serializers.IntegerField()
    overdue_tickets = serializers.IntegerField()
    avg_resolution_time = serializers.FloatField()
    tickets_by_priority = serializers.DictField()
    tickets_by_status = serializers.DictField()
    tickets_by_category = serializers.DictField()
    sla_compliance = serializers.FloatField()