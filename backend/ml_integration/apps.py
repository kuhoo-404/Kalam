from django.apps import AppConfig


class MlIntegrationConfig(AppConfig):
    default_auto_field = 'django.db.backends.BigAutoField'
    name = 'ml_integration'

    def ready(self):
        import sys
        skip_commands = ['migrate', 'makemigrations', 'collectstatic', 'createsuperuser', 'shell']
        if any(cmd in sys.argv for cmd in skip_commands):
            return

        # Load in background thread so port binds immediately
        import threading
        def load_models():
            try:
                from .ml_service import ml_service
                ml_service.load()
            except Exception as e:
                print(f"Warning: ML models failed to load: {e}")

        thread = threading.Thread(target=load_models, daemon=True)
        thread.start()