from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, MeView,
    PoemViewSet,
    UserPreferenceView,
    TemplateListView, TemplateDetailView,
    AnalyzePoemView,
    WordSuggestionsView,
    RhymeSuggestionsView,
    CompleteSuggestionsView,
)

router = DefaultRouter()
router.register(r'poems', PoemViewSet, basename='poem')

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', MeView.as_view(), name='me'),

    # ML endpoints
    path('analyze/', AnalyzePoemView.as_view(), name='analyze'),
    path('suggest/words/', WordSuggestionsView.as_view(), name='suggest-words'),
    path('suggest/rhymes/', RhymeSuggestionsView.as_view(), name='suggest-rhymes'),
    path('suggest/complete/', CompleteSuggestionsView.as_view(), name='suggest-complete'),

    # Poems CRUD
    path('', include(router.urls)),

    # Preferences + Templates
    path('preferences/', UserPreferenceView.as_view(), name='preferences'),
    path('templates/', TemplateListView.as_view(), name='templates'),
    path('templates/<str:genre>/', TemplateDetailView.as_view(), name='template-detail'),
]