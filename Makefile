redo:
	docker-compose down -v
	docker system prune -af
	docker-compose up -d

quick:
	docker-compose down -v
	docker-compose up -d

shutdown:
	docker-compose down -v
	docker system prune -af

up:
	docker-compose up -d