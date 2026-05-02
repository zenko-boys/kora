FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /build

COPY ["Kora.sln", "./"]
COPY ["src/Kora.Api/Kora.Api.csproj", "src/Kora.Api/"]
RUN dotnet restore "Kora.sln"

COPY . .
RUN dotnet publish "src/Kora.Api/Kora.Api.csproj" \
    -c Release \
    -o /publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Kora.Api.dll"]
