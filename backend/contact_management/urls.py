from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactViewSet, ContactHistoryViewSet

app_name = 'contact_management'

router = DefaultRouter()
router.register(r'contacts', ContactViewSet)
router.register(r'contact-history', ContactHistoryViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]