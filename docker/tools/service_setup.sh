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

# Creation of the superuser
echo "creation of superuser $DJANGO_SUPERUSER_USERNAME" >> /home/transcendance/logs/setup.log
python3 manage.py createsuperuser --noinput --username="$DJANGO_SUPERUSER_USERNAME" --email="$DJANGO_SUPERUSER_EMAIL" --password="$DJANGO_SUPERUSER_PASSWORD"

# apply the migrations
python3 manage.py makemigrations
python3 manage.py migrate

echo "initialisation of Django done" >> /home/transcendance/logs/setup.log