SOLUTION=Kora.sln
API_PROJECT=src/Kora.Api
STARTUP_PROJECT=src/Kora.Api

LOCAL_CONFIG=$(API_PROJECT)/appsettings.Local.json
LOCAL_CONFIG_EXAMPLE=$(API_PROJECT)/appsettings.Local.example.json

DB_CONTAINER_NAME=kora-postgres

.PHONY: restore build run test migration db-update db-drop clean init-local-config docker-start setup

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