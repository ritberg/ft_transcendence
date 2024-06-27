compose_file = docker-compose.yml

volume_dir = db_transcendence/db_transcendence db_transcendence/profile_pictures

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

redo:
	docker-compose -f $(compose_file) down -v
	docker system prune -af
	docker-compose -f $(compose_file) up -d

quick:
	docker-compose -f $(compose_file) down -v
	docker-compose -f $(compose_file) up -d

shutdown:
	docker-compose -f $(compose_file) down -v
	docker system prune -af

re: clean all

.PHONY: all build up down clean flclean re
