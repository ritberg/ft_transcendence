#!/bin/bash

echo "Waiting for postgres to get up and running..."
while ! nc -z db_transcendence 5434; do
  echo "waiting for postgress to be listening..."
  sleep 1
done
#waiting for user to migrate
sleep 5
echo "PostgreSQL started"
pip install -U 'Twisted[tls,http2]'
python3 manage.py makemigrations
python3 manage.py migrate
daphne -b 0.0.0.0 -p 8004 ChatApp.asgi:application