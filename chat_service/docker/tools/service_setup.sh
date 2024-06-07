#!/bin/bash

echo "Démarrage de l'initialisation de Django"
echo "backend name: $CHAT_SERVICE_NAME"

echo "Installation de Django"

if [ ! -d "/home/transcendance/$CHAT_SERVICE_NAME" ]; then
    # creation of the new project
    django-admin startproject $CHAT_SERVICE_NAME
else
    echo "Le répertoire du projet existe déjà"
fi

cd $CHAT_SERVICE_NAME

# # Create new app
# python3 manage.py startapp channels_demo
echo "Waiting for postgres to get up and running..."
while ! nc -z db_userchat 5434; do
  # where the postgres_container is the hos, in my case, it is a Docker container.
  # You can use localhost for example in case your database is running locally.
  echo "waiting for postgress to be listening..."
  sleep 1
done
sleep 5
echo "PostgreSQL started"

python3 manage.py makemigrations
python3 manage.py migrate

python manage.py runserver 0.0.0.0:8004
