docker_dir = docker
user_service_dir = user_service
chat_service_dir = chat_service

user_volume_dir = $(shell grep USER_SERVICE_NAME .env | cut -d '=' -f2)
chat_volume_dir = data

service = user_service

all: build up

build:
	mkdir -p $(user_service_dir)/$(user_volume_dir)
	mkdir -p $(chat_service_dir)/$(chat_volume_dir)
	docker-compose build

up:
	mkdir -p $(user_service_dir)/$(user_volume_dir)
	mkdir -p $(chat_service_dir)/$(chat_volume_dir)
	docker-compose up -d --build

down:
	docker-compose down

logs:
	docker-compose logs

shell:
	docker-compose exec $(service) /bin/bash

clean:
	docker-compose down --rmi all --volumes
	docker system prune -af
	rm -rf $(user_service_dir)/$(user_volume_dir)/media

re: clean all

# utils
migrations:
	docker-compose exec $(service) python manage.py makemigrations
	docker-compose exec $(service) python manage.py migrate

.PHONY: all build up down clean flclean re
