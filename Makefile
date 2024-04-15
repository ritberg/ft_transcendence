service = db_users

all: build up

build:
	docker-compose build

up:
	docker-compose up

down:
	docker-compose down

clean:
	docker-compose down --rmi all --volumes

flclean: clean
#	sudo -k && sudo rm -rf ~/path of volumes

re: clean all

PHONY: all build up down clean flclean re