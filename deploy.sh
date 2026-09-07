#!/bin/bash
set -e

echo "==> Pulling latest changes..."
git pull

echo "==> Stopping existing containers..."
docker compose down

echo "==> Building and starting containers..."
docker compose up -d --build

echo "==> Done. App running at http://localhost:5002"
