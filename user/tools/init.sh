#!/bin/bash

echo "initialisation of Django" >> /home/transcendance/logs/setup.log
echo "backend name: $USER_SERVICE_NAME" >> /home/transcendance/logs/setup.log

echo "initialisation of the project "$USER_SERVICE_NAME"" >> /home/transcendance/logs/setup.log

if [ ! -d "/home/transcendance/$USER_SERVICE_NAME" ]; then
    # creation of the new project
    django-admin startproject $USER_SERVICE_NAME

else
    echo "project already initialised" >> /home/transcendance/logs/setup.log
fi

cd /home/transcendance/$USER_SERVICE_NAME

# Creation of the superuser
# echo "creation of superuser $DJANGO_SUPERUSER_USERNAME" >> /home/transcendance/logs/setup.log
# echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD') | python manage.py shell

echo "Waiting for postgres to get up and running..."
while ! nc -z db_transcendence 5434; do
  # where the postgres_container is the hos, in my case, it is a Docker container.
  # You can use localhost for example in case your database is running locally.
  echo "waiting for postgress to be listening..."
  sleep 1
done
echo "PostgreSQL started"
pip install -U 'Twisted[tls,http2]'
python3 manage.py makemigrations
python3 manage.py migrate
# python manage.py runserver 0.0.0.0:8003
daphne -b 0.0.0.0 -p 8003 user_auth_system.asgi:application