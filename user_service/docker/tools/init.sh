#!/bin/bash

echo "initialisation of Django" >> /home/transcendance/logs/setup.log
echo "backend name: $SERVICE_NAME" >> /home/transcendance/logs/setup.log

echo "initialisation of the project "$SERVICE_NAME"" >> /home/transcendance/logs/setup.log

if [ ! -d "/home/transcendance/$SERVICE_NAME" ]; then
    # creation of the new project
    django-admin startproject $SERVICE_NAME
    
else
    echo "project already initialised" >> /home/transcendance/logs/setup.log
fi

cd /home/transcendance/$SERVICE_NAME

python3 manage.py makemigrations
python3 manage.py migrate

# Creation of the superuser
# echo "creation of superuser $DJANGO_SUPERUSER_USERNAME" >> /home/transcendance/logs/setup.log
# echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD') | python manage.py shell

# apply the migrations
python3 manage.py makemigrations
python3 manage.py migrate

echo "initialisation of Django done" >> /home/transcendance/logs/setup.log
./manage.py createsuperuser --no-input

echo "Starting Django server" >> /home/transcendance/logs/setup.log
python manage.py runserver 0.0.0.0:8000
