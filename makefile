SOLUTION=Kora.sln
API_PROJECT=src/Kora.Api
STARTUP_PROJECT=src/Kora.Api

LOCAL_CONFIG=$(API_PROJECT)/appsettings.Local.json
LOCAL_CONFIG_EXAMPLE=$(API_PROJECT)/appsettings.Local.example.json

DB_CONTAINER_NAME=kora-postgres

FLY_APP_PROD=koraplay-api
FLY_APP_DEV=koraplay-api-dev
FLY_CONFIG_PROD=fly.toml
FLY_CONFIG_DEV=fly.dev.toml

.PHONY: restore build run test migration db-update db-drop clean init-local-config docker-start setup docker-up docker-down docker-logs docker-clean docker-rebuild deploy

restore:
	dotnet restore $(SOLUTION)

build:
	dotnet build $(SOLUTION)

run:
	dotnet run --project $(API_PROJECT) --launch-profile https

test:
	dotnet test $(SOLUTION)

migration:
	@if [ -z "$(name)" ]; then \
		echo "Usage: make migration name=MigrationName"; \
		exit 1; \
	fi
	dotnet tool run dotnet-ef migrations add $(name) \
		--project $(API_PROJECT) \
		--startup-project $(STARTUP_PROJECT)

db-update:
	dotnet tool run dotnet-ef database update \
		--project $(API_PROJECT) \
		--startup-project $(STARTUP_PROJECT)

db-drop:
	dotnet tool run dotnet-ef database drop \
		--project $(API_PROJECT) \
		--startup-project $(STARTUP_PROJECT)

init-local-config:
	@if [ -f "$(LOCAL_CONFIG)" ]; then \
		echo "$(LOCAL_CONFIG) already exists"; \
	else \
		echo "Creating $(LOCAL_CONFIG) from example..."; \
		cp "$(LOCAL_CONFIG_EXAMPLE)" "$(LOCAL_CONFIG)"; \
	fi

docker-start:
	@if [ "$$(docker ps -aq -f name=$(DB_CONTAINER_NAME))" ]; then \
		echo "Container exists. Starting..."; \
		docker start $(DB_CONTAINER_NAME); \
	else \
		echo "Creating and starting Postgres container..."; \
		docker run --name $(DB_CONTAINER_NAME) \
			-e POSTGRES_USER=postgres \
			-e POSTGRES_PASSWORD=postgres \
			-e POSTGRES_DB=kora \
			-p 5432:5432 \
			-d postgres:16; \
	fi

setup: init-local-config docker-start restore build db-update
	@echo "Setup completed 🚀"

clean:
	dotnet clean $(SOLUTION)

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f api

docker-rebuild:
	docker compose up -d --build --force-recreate api

docker-clean:
	docker compose down -v

deploy:
	@if [ "$(env)" = "dev" ]; then \
		echo "Deploying to DEV ($(FLY_APP_DEV))..."; \
		fly deploy --config $(FLY_CONFIG_DEV) --app $(FLY_APP_DEV); \
	elif [ "$(env)" = "prod" ]; then \
		printf "About to deploy to PROD ($(FLY_APP_PROD)). Continue? [y/N] "; \
		read ans; \
		case "$$ans" in \
			y|Y|yes|YES) \
				echo "Deploying to PROD ($(FLY_APP_PROD))..."; \
				fly deploy --config $(FLY_CONFIG_PROD) --app $(FLY_APP_PROD) ;; \
			*) \
				echo "Aborted."; \
				exit 1 ;; \
		esac; \
	else \
		echo "Usage: make deploy env=dev|prod"; \
		exit 1; \
	fi