from django.db import models
from django.contrib.auth.models import User


class Contact(models.Model):
    """Modelo para gerenciar contatos do sistema de help desk"""
    
    name = models.CharField(max_length=255, verbose_name="Nome")
    email = models.EmailField(unique=True, verbose_name="E-mail")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Telefone")
    company = models.CharField(max_length=255, blank=True, null=True, verbose_name="Empresa")
    department = models.CharField(max_length=100, blank=True, null=True, verbose_name="Departamento")
    
    # Campos de auditoria
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='contacts_created',
        verbose_name="Criado por"
    )
    
    # Campos adicionais
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    notes = models.TextField(blank=True, null=True, verbose_name="Observações")
    
    class Meta:
        verbose_name = "Contato"
        verbose_name_plural = "Contatos"
        ordering = ['name']
        
    def __str__(self):
        return f"{self.name} ({self.email})"
    
    @property
    def full_info(self):
        """Retorna informações completas do contato"""
        info = f"{self.name} - {self.email}"
        if self.company:
            info += f" - {self.company}"
        return info


class ContactHistory(models.Model):
    """Histórico de interações com contatos"""
    
    INTERACTION_TYPES = [
        ('email_received', 'E-mail Recebido'),
        ('email_sent', 'E-mail Enviado'),
        ('phone_call', 'Ligação Telefônica'),
        ('meeting', 'Reunião'),
        ('note', 'Nota/Observação'),
        ('ticket_created', 'Ticket Criado'),
        ('ticket_updated', 'Ticket Atualizado'),
    ]
    
    contact = models.ForeignKey(
        Contact, 
        on_delete=models.CASCADE, 
        related_name='history',
        verbose_name="Contato"
    )
    interaction_type = models.CharField(
        max_length=20, 
        choices=INTERACTION_TYPES,
        verbose_name="Tipo de Interação"
    )
    description = models.TextField(verbose_name="Descrição")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data da Interação")
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Registrado por"
    )
    
    # Campo para referenciar tickets relacionados
    related_ticket = models.ForeignKey(
        'ticket_management.Ticket',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Ticket Relacionado"
    )
    
    class Meta:
        verbose_name = "Histórico de Contato"
        verbose_name_plural = "Históricos de Contatos"
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.contact.name} - {self.get_interaction_type_display()} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"
