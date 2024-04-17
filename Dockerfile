#alpine 3.19 requires virutal environements
FROM alpine:3.18

RUN apk update

RUN apk add vim curl

#python installation
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python

#uncomment line below to create a virtual environment if needed
#RUN python3 -m venv .venv
#RUN source .venv/bin/activate

#installs ensurepip needed for virutal environements
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

RUN mkdir -p /home/transcendance

WORKDIR /home/transcendance
#install depedencies (django/daphne/channels/djangorestframework)
COPY ./requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

RUN cd /home/transcendance && django-admin startproject projectName 
WORKDIR /home/transcendance/projectName

#starts new app and migrates changes
RUN python3 manage.py startapp channels_demo
RUN python3 manage.py makemigrations
RUN python3 manage.py migrate

#run server on localhost:8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]