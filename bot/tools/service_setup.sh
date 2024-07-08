#!/bin/bash

pip install -U 'Twisted[tls,http2]'
python3 manage.py makemigrations
python3 manage.py migrate
daphne -b 0.0.0.0 -p 8002 project.asgi:application