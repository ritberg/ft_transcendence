"""
ASGI config for user_auth_system project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from .settings import USER_SERVICE_NAME

os.environ.setdefault('DJANGO_SETTINGS_MODULE', f'{USER_SERVICE_NAME}.settings')

application = get_asgi_application()
