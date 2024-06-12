from django.apps import AppConfig
from user_statistics.settings import STAT_APP_NAME


class StatManagementConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = f'{STAT_APP_NAME}'

    def ready(self):
        import stat_management.signals
