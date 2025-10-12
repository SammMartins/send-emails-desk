from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TicketViewSet, TicketCategoryViewSet, TicketCommentViewSet,
    TicketAttachmentViewSet, TicketLogViewSet
)

app_name = 'ticket_management'

router = DefaultRouter()
router.register(r'tickets', TicketViewSet)
router.register(r'categories', TicketCategoryViewSet)
router.register(r'comments', TicketCommentViewSet)
router.register(r'attachments', TicketAttachmentViewSet)
router.register(r'logs', TicketLogViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]