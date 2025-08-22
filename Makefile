.PHONY: help install build dev test clean docker-up docker-down seed

# Default target
help: ## Show this help message
	@echo "EdgeNetIQ Lifecycle & Calendar Platform"
	@echo "========================================"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	@echo "Installing dependencies..."
	pnpm install

build: ## Build all applications
	@echo "Building applications..."
	pnpm build

dev: ## Start development environment
	@echo "Starting development environment..."
	make docker-up
	@echo "Waiting for services to be ready..."
	sleep 10
	@echo "Running database migrations..."
	pnpm exec prisma migrate dev --workspace=svc-calendar
	@echo "Generating Prisma client..."
	pnpm exec prisma generate --workspace=svc-calendar
	@echo "Starting development servers..."
	pnpm dev

test: ## Run tests
	@echo "Running tests..."
	pnpm test

test-calendar: ## Run calendar service tests
	@echo "Running calendar service tests..."
	pnpm test --filter svc-calendar

clean: ## Clean build artifacts and dependencies
	@echo "Cleaning build artifacts..."
	pnpm clean
	docker-compose -f docker-compose.dev.yml down -v
	docker system prune -f

docker-up: ## Start infrastructure services (PostgreSQL, Kafka, etc.)
	@echo "Starting infrastructure services..."
	docker-compose -f docker-compose.dev.yml up -d postgres redpanda neo4j minio minio-setup redis
	@echo "Infrastructure services started"

docker-down: ## Stop all services
	@echo "Stopping all services..."
	docker-compose -f docker-compose.dev.yml down

docker-logs: ## View service logs
	docker-compose -f docker-compose.dev.yml logs -f

seed: ## Seed the database with sample data
	@echo "Seeding database..."
	pnpm seed

migrate: ## Run database migrations
	@echo "Running database migrations..."
	pnpm exec prisma migrate dev --workspace=svc-calendar

migrate-reset: ## Reset database and run migrations
	@echo "Resetting database..."
	pnpm exec prisma migrate reset --workspace=svc-calendar --force

prisma-studio: ## Open Prisma Studio
	@echo "Opening Prisma Studio..."
	pnpm exec prisma studio --workspace=svc-calendar

format: ## Format code
	@echo "Formatting code..."
	pnpm format

lint: ## Lint code
	@echo "Linting code..."
	pnpm lint

typecheck: ## Run TypeScript type checking
	@echo "Running type checks..."
	pnpm typecheck

# Development workflow shortcuts
setup: install docker-up migrate seed ## Complete setup for new development environment

start: docker-up dev ## Quick start (assumes setup is done)

restart: docker-down docker-up ## Restart infrastructure services

status: ## Check service status
	@echo "Service Status:"
	@echo "=============="
	docker-compose -f docker-compose.dev.yml ps

logs-calendar: ## View calendar service logs
	docker-compose -f docker-compose.dev.yml logs -f calendar-service

logs-web: ## View web application logs
	docker-compose -f docker-compose.dev.yml logs -f web

# Agent commands
build-agent: ## Build the Go edge agent
	@echo "Building edge agent..."
	cd apps/agent-edge && ./build.sh

run-agent: ## Run the edge agent
	@echo "Running edge agent..."
	cd apps/agent-edge && ./agent -config config.yaml

# Database utilities
db-backup: ## Backup database
	@echo "Creating database backup..."
	docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U postgres edgenetiq > backup_$(shell date +%Y%m%d_%H%M%S).sql

db-restore: ## Restore database from backup (usage: make db-restore BACKUP=backup_file.sql)
	@echo "Restoring database from $(BACKUP)..."
	docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres edgenetiq < $(BACKUP)

# Production build commands
build-prod: ## Build for production
	@echo "Building for production..."
	docker-compose -f docker-compose.yml build

deploy-prep: build-prod ## Prepare for deployment
	@echo "Preparing deployment artifacts..."
	# Add deployment preparation steps here