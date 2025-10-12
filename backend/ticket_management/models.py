from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


class TicketCategory(models.Model):
    """Categorias de tickets para melhor organização"""
    
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição")
    color = models.CharField(max_length=7, default="#007bff", verbose_name="Cor (Hex)")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Categoria de Ticket"
        verbose_name_plural = "Categorias de Tickets"
        ordering = ['name']
        
    def __str__(self):
        return self.name


class Ticket(models.Model):
    """Modelo principal para gerenciamento de tickets"""
    
    PRIORITY_CHOICES = [
        ('low', 'Baixa'),
        ('medium', 'Média'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Aberto'),
        ('in_progress', 'Em Andamento'),
        ('waiting_customer', 'Aguardando Cliente'),
        ('waiting_approval', 'Aguardando Aprovação'),
        ('resolved', 'Resolvido'),
        ('closed', 'Fechado'),
        ('cancelled', 'Cancelado'),
    ]
    
    # Campos básicos
    title = models.CharField(max_length=255, verbose_name="Título")
    description = models.TextField(verbose_name="Descrição")
    priority = models.CharField(
        max_length=10, 
        choices=PRIORITY_CHOICES, 
        default='medium',
        verbose_name="Prioridade"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='open',
        verbose_name="Status"
    )
    
    # Relacionamentos
    contact = models.ForeignKey(
        'contact_management.Contact', 
        on_delete=models.CASCADE,
        related_name='tickets',
        verbose_name="Contato"
    )
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_tickets',
        verbose_name="Atribuído para"
    )
    category = models.ForeignKey(
        TicketCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Categoria"
    )
    
    # Campos de tempo e SLA
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    sla_deadline = models.DateTimeField(null=True, blank=True, verbose_name="Prazo SLA")
    resolved_at = models.DateTimeField(null=True, blank=True, verbose_name="Resolvido em")
    closed_at = models.DateTimeField(null=True, blank=True, verbose_name="Fechado em")
    
    # Campos de auditoria
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='tickets_created',
        verbose_name="Criado por"
    )
    
    # Campos adicionais
    email_thread_id = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        verbose_name="ID do Thread de E-mail"
    )
    sentiment_score = models.FloatField(
        null=True, 
        blank=True,
        verbose_name="Score de Sentimento"
    )
    sentiment_label = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        verbose_name="Rótulo de Sentimento"
    )
    tags = models.CharField(
        max_length=500, 
        blank=True, 
        null=True,
        help_text="Tags separadas por vírgula",
        verbose_name="Tags"
    )
    
    class Meta:
        verbose_name = "Ticket"
        verbose_name_plural = "Tickets"
        ordering = ['-created_at']
        
    def __str__(self):
        return f"#{self.id} - {self.title}"
    
    def save(self, *args, **kwargs):
        # Calcular SLA se não foi definido
        if not self.sla_deadline and self.created_at:
            hours_to_add = self.get_sla_hours()
            self.sla_deadline = self.created_at + timedelta(hours=hours_to_add)
        
        # Atualizar campos de resolução/fechamento
        if self.status == 'resolved' and not self.resolved_at:
            self.resolved_at = timezone.now()
        elif self.status == 'closed' and not self.closed_at:
            self.closed_at = timezone.now()
            
        super().save(*args, **kwargs)
    
    def get_sla_hours(self):
        """Retorna horas de SLA baseado na prioridade"""
        sla_mapping = {
            'urgent': 4,    # 4 horas
            'high': 8,      # 8 horas
            'medium': 24,   # 24 horas
            'low': 48,      # 48 horas
        }
        return sla_mapping.get(self.priority, 24)
    
    @property
    def is_overdue(self):
        """Verifica se o ticket está atrasado"""
        if self.sla_deadline and self.status not in ['resolved', 'closed', 'cancelled']:
            return timezone.now() > self.sla_deadline
        return False
    
    @property
    def time_to_resolution(self):
        """Calcula tempo até resolução em horas"""
        if self.resolved_at:
            delta = self.resolved_at - self.created_at
            return delta.total_seconds() / 3600
        return None
    
    @property
    def priority_color(self):
        """Retorna cor baseada na prioridade"""
        colors = {
            'low': '#28a745',
            'medium': '#ffc107',
            'high': '#fd7e14',
            'urgent': '#dc3545',
        }
        return colors.get(self.priority, '#6c757d')


class TicketComment(models.Model):
    """Comentários e notas nos tickets"""
    
    COMMENT_TYPES = [
        ('internal', 'Nota Interna'),
        ('public', 'Resposta Pública'),
        ('system', 'Sistema'),
    ]
    
    ticket = models.ForeignKey(
        Ticket, 
        on_delete=models.CASCADE, 
        related_name='comments',
        verbose_name="Ticket"
    )
    comment_type = models.CharField(
        max_length=10, 
        choices=COMMENT_TYPES, 
        default='internal',
        verbose_name="Tipo"
    )
    content = models.TextField(verbose_name="Conteúdo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        verbose_name="Criado por"
    )
    
    # Campos para e-mails
    email_message_id = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        verbose_name="ID da Mensagem de E-mail"
    )
    is_email_response = models.BooleanField(
        default=False,
        verbose_name="É Resposta de E-mail"
    )
    
    class Meta:
        verbose_name = "Comentário do Ticket"
        verbose_name_plural = "Comentários dos Tickets"
        ordering = ['created_at']
        
    def __str__(self):
        return f"Comentário em {self.ticket} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"


class TicketAttachment(models.Model):
    """Anexos dos tickets"""
    
    ticket = models.ForeignKey(
        Ticket, 
        on_delete=models.CASCADE, 
        related_name='attachments',
        verbose_name="Ticket"
    )
    file = models.FileField(
        upload_to='ticket_attachments/%Y/%m/%d/',
        verbose_name="Arquivo"
    )
    filename = models.CharField(max_length=255, verbose_name="Nome do Arquivo")
    file_size = models.PositiveIntegerField(verbose_name="Tamanho do Arquivo (bytes)")
    content_type = models.CharField(max_length=100, verbose_name="Tipo de Conteúdo")
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="Enviado em")
    uploaded_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        verbose_name="Enviado por"
    )
    
    class Meta:
        verbose_name = "Anexo do Ticket"
        verbose_name_plural = "Anexos dos Tickets"
        ordering = ['-uploaded_at']
        
    def __str__(self):
        return f"{self.filename} - {self.ticket}"


class TicketLog(models.Model):
    """Log de auditoria para mudanças nos tickets"""
    
    ACTION_TYPES = [
        ('created', 'Criado'),
        ('updated', 'Atualizado'),
        ('status_changed', 'Status Alterado'),
        ('priority_changed', 'Prioridade Alterada'),
        ('assigned', 'Atribuído'),
        ('unassigned', 'Desatribuído'),
        ('comment_added', 'Comentário Adicionado'),
        ('attachment_added', 'Anexo Adicionado'),
        ('email_received', 'E-mail Recebido'),
        ('email_sent', 'E-mail Enviado'),
    ]
    
    ticket = models.ForeignKey(
        Ticket, 
        on_delete=models.CASCADE, 
        related_name='logs',
        verbose_name="Ticket"
    )
    action = models.CharField(
        max_length=20, 
        choices=ACTION_TYPES,
        verbose_name="Ação"
    )
    description = models.TextField(verbose_name="Descrição")
    old_value = models.TextField(blank=True, null=True, verbose_name="Valor Anterior")
    new_value = models.TextField(blank=True, null=True, verbose_name="Novo Valor")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data")
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        verbose_name="Usuário"
    )
    ip_address = models.GenericIPAddressField(
        null=True, 
        blank=True,
        verbose_name="Endereço IP"
    )
    
    class Meta:
        verbose_name = "Log do Ticket"
        verbose_name_plural = "Logs dos Tickets"
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.ticket} - {self.get_action_display()} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"
