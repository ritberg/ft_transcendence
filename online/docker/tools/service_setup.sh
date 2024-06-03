#!/bin/bash

if [ ! -d "/home/transcendance/$ONLINE_SERVICE_NAME" ]; then
    # creation of the new project
    django-admin startproject $ONLINE_SERVICE_NAME
else
    echo "project already exists"
fi

cd $ONLINE_SERVICE_NAME

# # Create new app
# python3 manage.py startapp channels_demo
# python manage.py makemigrations
sleep 20
pip install -U 'Twisted[tls,http2]'
python manage.py migrate
daphne -b 0.0.0.0 -p 8001 project.asgi:application
# python manage.py runserver 0.0.0.0:8001