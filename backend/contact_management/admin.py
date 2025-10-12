from django.contrib import admin
from .models import Contact, ContactHistory


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'company', 'department', 'is_active', 'created_at']
    list_filter = ['is_active', 'company', 'department', 'created_at']
    search_fields = ['name', 'email', 'company']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Informações Profissionais', {
            'fields': ('company', 'department')
        }),
        ('Configurações', {
            'fields': ('is_active', 'notes')
        }),
        ('Auditoria', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ContactHistory)
class ContactHistoryAdmin(admin.ModelAdmin):
    list_display = ['contact', 'interaction_type', 'description', 'created_at', 'created_by']
    list_filter = ['interaction_type', 'created_at']
    search_fields = ['contact__name', 'contact__email', 'description']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('contact', 'created_by', 'related_ticket')
