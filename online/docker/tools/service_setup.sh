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
echo "Waiting for postgres to get up and running..."
while ! nc -z db_online 5433; do
  # where the postgres_container is the hos, in my case, it is a Docker container.
  # You can use localhost for example in case your database is running locally.
  echo "waiting for postgress to be listening..."
  sleep 1
done
echo "PostgreSQL started"
pip install -U 'Twisted[tls,http2]'
python manage.py migrate
# daphne -b 0.0.0.0 -p 8001 project.asgi:application
python manage.py runserver 0.0.0.0:8001