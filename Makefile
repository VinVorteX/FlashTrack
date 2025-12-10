.PHONY: help build run stop clean docker-build docker-up docker-down docker-logs test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the application
	go build -o bin/flashtrack ./cmd/server

run: ## Run the application locally
	go run cmd/server/main.go

test: ## Run tests
	go test -v ./...

clean: ## Clean build artifacts
	rm -rf bin/
	go clean

docker-build: ## Build Docker image
	docker build -t flashtrack:latest .

docker-up: ## Start all services with docker-compose
	docker compose up -d

docker-down: ## Stop all services
	docker compose down

docker-logs: ## Show application logs
	docker compose logs -f app

docker-restart: ## Restart the application container
	docker compose restart app

docker-clean: ## Remove all containers, volumes, and images
	docker compose down -v
	docker rmi flashtrack:latest 2>/dev/null || true

docker-rebuild: docker-clean docker-build docker-up ## Rebuild and restart everything

dev: ## Start development environment
	docker compose up postgres -d
	@echo "Waiting for PostgreSQL..."
	@sleep 3
	go run cmd/server/main.go

dev-frontend: ## Run frontend in development mode
	cd flashtrack-dashboard && npm run dev

dev-full: ## Start backend and open frontend dev in background
	@make dev &
	@sleep 5
	@cd flashtrack-dashboard && npm run dev

.DEFAULT_GOAL := help
