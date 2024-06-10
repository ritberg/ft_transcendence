#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
<<<<<<< HEAD:bot/project/manage.py
=======
from user_auth_system.settings import USER_SERVICE_NAME
>>>>>>> origin/stats:user_service/user_auth_system/manage.py


def main():
    """Run administrative tasks."""
<<<<<<< HEAD:bot/project/manage.py
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
=======
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', f'{USER_SERVICE_NAME}.settings')
>>>>>>> origin/stats:user_service/user_auth_system/manage.py
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
