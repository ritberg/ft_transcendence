volume_dir = backend

service = db_users

all: build up

build:
	mkdir -p $(volume_dir)
	docker-compose build

up:
	mkdir -p $(volume_dir)
	docker-compose up -d --build

down:
	docker-compose -v down

logs:
	docker-compose logs

shell:
	docker-compose exec $(service) /bin/bash

clean:
	docker-compose down --rmi all --volumes
	docker system prune -af

re: clean all

.PHONY: all build up down clean flclean re