build:
	docker-compose build
up:
	docker-compose up -d
down:
	docker-compose down
logs:
	docker-compose logs -f --tail 5
rebuild:
	make down && make build && make up
restart:
	make down && make up