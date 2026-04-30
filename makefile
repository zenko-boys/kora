SOLUTION=Kora.sln
API_PROJECT=src/Kora.Api
STARTUP_PROJECT=src/Kora.Api

.PHONY: restore build run test migration db-update db-drop clean

restore:
	dotnet restore $(SOLUTION)

build:
	dotnet build $(SOLUTION)

run:
	dotnet run --project $(API_PROJECT)

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

clean:
	dotnet clean $(SOLUTION)