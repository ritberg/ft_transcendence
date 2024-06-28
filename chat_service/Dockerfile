FROM python:3.11-slim

# declaration of service variables environment
ENV CHAT_SERVICE_NAME=${CHAT_SERVICE_NAME}
ARG CHAT_SERVICE_NAME

# declaration of environment variables for python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY ./ChatApp /home/transcendance/${CHAT_SERVICE_NAME}

RUN apt-get update && apt-get install -y netcat-openbsd

RUN mkdir -p /home/transcendance
WORKDIR /home/transcendance

# installation of dependencies
COPY ./conf/requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt \
    && mkdir depedencies && mv requirements.txt depedencies

# copy and execute the initialization script
COPY ./tools/service_setup.sh /home/transcendance/service_setup.sh
RUN chmod +x /home/transcendance/service_setup.sh

# set the final working directory
# WORKDIR /home/transcendance/${CHAT_SERVICE_NAME}

# Command for running the application
CMD ["bash", "/home/transcendance/service_setup.sh"]
