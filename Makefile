up:
	mkdir volume
	docker-compose up -d

down:
	docker-compose down -v

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

rm_dir:
	rm -Rf volume