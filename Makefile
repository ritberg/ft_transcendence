compose_file = docker-compose.yml

volume_dir = online/project frontend/test_django databases/db_online nginx/nginx bot/project databases/db_userchat chat_service/ChatApp user/user_auth_system stat/user_statistics

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
