#!/bin/bash

if [ ! -d "/home/transcendance/$SERVICE_NAME_ONLINE" ]; then
    # creation of the new project
    django-admin startproject $SERVICE_NAME_ONLINE
else
    echo "project already exists"
fi

cd $SERVICE_NAME_ONLINE

# # Create new app
# python3 manage.py startapp channels_demo
# python manage.py makemigrations
sleep 20
pip install -U 'Twisted[tls,http2]'
python manage.py migrate
daphne -b 0.0.0.0 -p 8001 project.asgi:application
# python manage.py runserver 0.0.0.0:8001