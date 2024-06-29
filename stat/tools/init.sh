#!/bin/bash

LOGFILE="/home/transcendance/logs/setup.log"
echo "initialisation of Django" >> $LOGFILE
echo "backend name: $STAT_SERVICE_NAME" >> $LOGFILE

echo "initialisation of the project $STAT_SERVICE_NAME" >> $LOGFILE

echo "initialisation of Django done" >> $LOGFILE

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
daphne -b 0.0.0.0 -p 8005 user_statistics.asgi:application