from django.apps import AppConfig


class MlIntegrationConfig(AppConfig):
    default_auto_field = 'django.db.backends.BigAutoField'
    name = 'ml_integration'

    def ready(self):
        """Load ML models when Django starts"""
        # Skip during migrations/management commands
        import sys
        if 'runserver' in sys.argv or 'gunicorn' in sys.argv[0:1]:
            from .ml_service import ml_service
            ml_service.load()