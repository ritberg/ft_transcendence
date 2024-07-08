#!/bin/bash

LOGFILE="/home/transcendance/logs/setup.log"
echo "initialisation of Django" >> $LOGFILE
echo "backend name: $USER_SERVICE_NAME" >> $LOGFILE

echo "initialisation of the project $USER_SERVICE_NAME" >> $LOGFILE

echo "initialisation of Django done" >> $LOGFILE
cd /home/transcendance/$USER_SERVICE_NAME

echo "Waiting for postgres to get up and running..."
while ! nc -z db_transcendence 5434; do
  echo "waiting for postgress to be listening..."
  sleep 1
done
echo "PostgreSQL started"
pip install -U 'Twisted[tls,http2]'
python3 manage.py makemigrations
python3 manage.py migrate
daphne -b 0.0.0.0 -p 8003 user_auth_system.asgi:application