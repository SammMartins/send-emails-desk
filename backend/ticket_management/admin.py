from django.contrib import admin
from .models import Ticket, TicketCategory, TicketComment, TicketAttachment, TicketLog


@admin.register(TicketCategory)
class TicketCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'color', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'contact', 'priority', 'status', 'assigned_to', 'created_at', 'is_overdue']
    list_filter = ['priority', 'status', 'category', 'assigned_to', 'created_at']
    search_fields = ['title', 'description', 'contact__name', 'contact__email']
    readonly_fields = ['created_at', 'updated_at', 'resolved_at', 'closed_at', 'time_to_resolution']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('title', 'description', 'priority', 'status', 'category')
        }),
        ('Relacionamentos', {
            'fields': ('contact', 'assigned_to', 'created_by')
        }),
        ('SLA e Tempo', {
            'fields': ('sla_deadline', 'resolved_at', 'closed_at', 'time_to_resolution')
        }),
        ('Dados Técnicos', {
            'fields': ('email_thread_id', 'sentiment_score', 'sentiment_label', 'tags'),
            'classes': ('collapse',)
        }),
        ('Auditoria', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('contact', 'assigned_to', 'category', 'created_by')


class TicketCommentInline(admin.TabularInline):
    model = TicketComment
    extra = 0
    readonly_fields = ['created_at', 'created_by']


class TicketAttachmentInline(admin.TabularInline):
    model = TicketAttachment
    extra = 0
    readonly_fields = ['uploaded_at', 'uploaded_by', 'file_size']


@admin.register(TicketComment)
class TicketCommentAdmin(admin.ModelAdmin):
    list_display = ['ticket', 'comment_type', 'content', 'created_at', 'created_by']
    list_filter = ['comment_type', 'is_email_response', 'created_at']
    search_fields = ['content', 'ticket__title']
    readonly_fields = ['created_at']


@admin.register(TicketAttachment)
class TicketAttachmentAdmin(admin.ModelAdmin):
    list_display = ['ticket', 'filename', 'file_size', 'content_type', 'uploaded_at', 'uploaded_by']
    list_filter = ['content_type', 'uploaded_at']
    search_fields = ['filename', 'ticket__title']
    readonly_fields = ['uploaded_at', 'file_size', 'content_type']


@admin.register(TicketLog)
class TicketLogAdmin(admin.ModelAdmin):
    list_display = ['ticket', 'action', 'description', 'created_at', 'created_by']
    list_filter = ['action', 'created_at']
    search_fields = ['description', 'ticket__title']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('ticket', 'created_by')
