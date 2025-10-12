from rest_framework import serializers
from .models import Contact, ContactHistory
from django.contrib.auth.models import User


class ContactSerializer(serializers.ModelSerializer):
    """Serializer para o modelo Contact"""
    
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    tickets_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Contact
        fields = [
            'id', 'name', 'email', 'phone', 'company', 'department',
            'created_at', 'updated_at', 'created_by', 'created_by_name',
            'is_active', 'notes', 'tickets_count'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']
    
    def get_tickets_count(self, obj):
        """Retorna número de tickets do contato"""
        return obj.tickets.count()


class ContactHistorySerializer(serializers.ModelSerializer):
    """Serializer para o histórico de contatos"""
    
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    interaction_type_display = serializers.CharField(source='get_interaction_type_display', read_only=True)
    
    class Meta:
        model = ContactHistory
        fields = [
            'id', 'contact', 'interaction_type', 'interaction_type_display',
            'description', 'created_at', 'created_by', 'created_by_name',
            'related_ticket'
        ]
        read_only_fields = ['created_at', 'created_by']


class ContactCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de contatos"""
    
    class Meta:
        model = Contact
        fields = [
            'name', 'email', 'phone', 'company', 'department', 'notes'
        ]
    
    def create(self, validated_data):
        # Adicionar usuário que criou
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)