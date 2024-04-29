compose_file = docker/docker-compose.yml

volume_dir = backend
data_dir = data_db_user

service = django

all: build up

build:
	mkdir -p $(volume_dir)
	docker-compose -f $(compose_file) build

up:
	mkdir -p $(volume_dir)
	docker-compose -f $(compose_file) up -d --build

down:
	docker-compose -f $(compose_file) down -v

logs:
	docker-compose -f $(compose_file) logs

shell:
	docker-compose -f $(compose_file) exec $(service) /bin/bash

clean:
	docker-compose -f $(compose_file) down --rmi all --volumes
	docker system prune -af

re: clean all

# utils
migrations:
	docker-compose -f $(compose_file) exec $(service) python manage.py makemigrations
	docker-compose -f $(compose_file) exec $(service) python manage.py migrate

.PHONY: all build up down clean flclean re