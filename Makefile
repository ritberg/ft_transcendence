compose_file = docker/docker-compose.yml

volume_dir = data db

service = chats

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

.PHONY: all build up down clean flclean re