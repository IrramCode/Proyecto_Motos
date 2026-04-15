FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copiar archivos y restaurar
COPY . .
RUN dotnet restore "MotosApi/MotosApi.csproj"
RUN dotnet publish "MotosApi/MotosApi.csproj" -c Release -o out

# Imagen de ejecución
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
ENTRYPOINT ["dotnet", "MotosApi.dll"]