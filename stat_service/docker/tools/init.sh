#!/bin/bash

LOGFILE="/home/transcendance/logs/setup.log"
echo "initialisation of Django" >> $LOGFILE
echo "backend name: $STAT_SERVICE_NAME" >> $LOGFILE

echo "initialisation of the project $STAT_SERVICE_NAME" >> $LOGFILE

echo "initialisation of Django done" >> $LOGFILE

# apply the migrations
python3 manage.py makemigrations
python3 manage.py migrate

echo "initialisation of Django done" >> $LOGFILE
./manage.py createsuperuser --no-input

echo "Starting Django server" >> $LOGFILE
python manage.py runserver 0.0.0.0:8005

# while true; do
#   sleep 86400
# done