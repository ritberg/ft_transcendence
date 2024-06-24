#!/bin/bash

LOGFILE="/home/transcendance/logs/setup.log"
echo "initialisation of Django" >> $LOGFILE
echo "backend name: $STAT_SERVICE_NAME" >> $LOGFILE

echo "initialisation of the project $STAT_SERVICE_NAME" >> $LOGFILE

echo "initialisation of Django done" >> $LOGFILE

echo "Waiting for postgres to get up and running..."
while ! nc -z db_transcendence 5434; do
  # where the postgres_container is the hos, in my case, it is a Docker container.
  # You can use localhost for example in case your database is running locally.
  echo "waiting for postgress to be listening..."
  sleep 1
done
sleep 4
echo "PostgreSQL started"
python3 manage.py makemigrations
python3 manage.py migrate
python manage.py runserver 0.0.0.0:8005