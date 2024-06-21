"""
WSGI config for user_auth_system project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application
from user_auth_system.settings import USER_SERVICE_NAME

os.environ.setdefault('DJANGO_SETTINGS_MODULE', '{USER_SERVICE_NAME}.settings')

application = get_wsgi_application()
