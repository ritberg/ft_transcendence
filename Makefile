compose_file = docker/docker-compose.yml

volume_dir = app

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

start:
	@docker-compose -f $(compose_file) start

stop:
	@docker-compose -f $(compose_file) stop

status:
	@docker ps

logs:
	docker-compose -f $(compose_file) logs

shell:
	docker-compose -f $(compose_file) exec $(service) /bin/bash

clean:
	docker-compose -f $(compose_file) down --rmi all --volumes
	docker system prune -af

fclean:
	@docker-compose -f ./docker-compose.yml down -v
	@docker system prune -af
	@rm -rf ./app/*

restart: clean all

.PHONY: all build up down start stop logs shell clean flclean re
