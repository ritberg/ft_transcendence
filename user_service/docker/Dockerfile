FROM python:3.11-slim

# declaration of service variables environment
ENV SERVICE_NAME=${SERVICE_NAME}
ENV DJANGO_SUPERUSER_USERNAME=${DJANGO_SUPERUSER_USERNAME}
ENV DJANGO_SUPERUSER_EMAIL=${DJANGO_SUPERUSER_EMAIL}
ENV DJANGO_SUPERUSER_PASSWORD=${DJANGO_SUPERUSER_PASSWORD}
ARG SERVICE_NAME
ARG DJANGO_SUPERUSER_USERNAME
ARG DJANGO_SUPERUSER_EMAIL
ARG DJANGO_SUPERUSER_PASSWORD

# declaration of environment variables for python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN mkdir -p /home/transcendance
WORKDIR /home/transcendance

# installation of dependencies
COPY ./conf/requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt \
    && mkdir depedencies && mv requirements.txt depedencies

# installation of postgresql-client
RUN apt-get update && apt-get install -y postgresql-client

RUN mkdir -p logs

# copy and execute the initialization script
COPY /tools/init.sh /home/transcendance/init.sh
RUN chmod +x /home/transcendance/init.sh

# set the final working directory
WORKDIR /home/transcendance/${SERVICE_NAME}

# update migrations
# RUN python3 manage.py makemigrations
# RUN python3 manage.py migrate

# Command for running the application
CMD ["/bin/bash", "/home/transcendance/init.sh"]