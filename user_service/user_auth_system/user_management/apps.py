from django.apps import AppConfig
from user_auth_system.settings import AUTH_APP_NAME

class AuthUserConfig(AppConfig):
	name = AUTH_APP_NAME
	verbose_name = 'Authentication and Authorization'
