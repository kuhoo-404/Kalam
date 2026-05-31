from django.apps import AppConfig


class MlIntegrationConfig(AppConfig):
    default_auto_field = 'django.db.backends.BigAutoField'
    name = 'ml_integration'

    def ready(self):
        """Load ML models when Django starts"""
        import sys

        # Skip during management commands like migrate, collectstatic etc.
        skip_commands = ['migrate', 'makemigrations', 'collectstatic', 'createsuperuser', 'shell']
        if any(cmd in sys.argv for cmd in skip_commands):
            return

        try:
            from .ml_service import ml_service
            ml_service.load()
        except Exception as e:
            print(f"Warning: ML models failed to load: {e}")