.PHONY: dev migrate test logs clean

# Start the full local development stack
dev:
	docker compose up --build -d
	@echo "Haspataal is running!"
	@echo "Patient Portal: http://localhost"
	@echo "Hospital HMS: http://localhost/hospital"
	@echo "Admin Panel: http://localhost/admin"
	@echo "API Gateway: http://localhost/api"

# Run Prisma migrations locally
migrate:
	npx prisma migrate dev

# Run all unit and integration tests
test:
	npm run test

# View logs for all docker containers
logs:
	docker compose logs -f

# Shut down the stack and remove volumes
clean:
	docker compose down -v
