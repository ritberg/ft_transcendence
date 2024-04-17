service = db_users

all: build up

build:
	docker-compose build

up:
	docker-compose up --build

down:
	docker-compose down

logs:
	docker-compose logs

shell:
	docker-compose exec $(service) /bin/bash

clean:
	docker-compose down --rmi all --volumes

re: clean all

PHONY: all build up down clean flclean re