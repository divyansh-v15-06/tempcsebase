#!/bin/bash
set -e

echo "=== 1. Checking for .env file ==/bin/bash"
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "Created .env from .env.example. Please update your passwords/secrets inside .env before proceeding if necessary!"
  else
    echo "Error: .env file not found and no .env.example available."
    exit 1
  fi
fi

echo "=== 2. Stopping any existing containers ==="
sudo docker compose down --remove-orphans || true

echo "=== 3. Building and starting the Docker stack ==="
sudo docker compose up -d --build

echo "=== 4. Waiting for MySQL to initialize and become healthy ==="
echo "Checking container health status..."
until sudo docker compose ps mysql | grep -q "healthy"; do
  sleep 3
  echo -n "."
done
echo ""
echo "MySQL container is up and healthy!"

echo "=== 5. Restoring live database export (if available) ==="
if [ -f schema-design/live_export.sql ]; then
  echo "Importing live database dump into MySQL container..."
  sudo docker compose exec -T mysql mysql -u root -p'$(grep MYSQL_ROOT_PASSWORD .env | cut -d '=' -f2)' cse_department < schema-design/live_export.sql
  echo "Live database import completed successfully!"
else
  echo "No live_export.sql found, skipping manual import (schema default seeds will be used)."
fi

echo "=== Deployment Complete! ==="
echo "Your app should now be running. Check status with: sudo docker compose ps"