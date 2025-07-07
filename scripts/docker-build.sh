#!/bin/bash

# Build script for Docker image
set -e

echo "🐳 Building Alraseen Tenant Portal Docker Image..."

# Build the Docker image
docker build -t alraseen-tenant-portal:latest .

echo "✅ Docker image built successfully!"

# Optional: Run the container locally for testing
echo "🚀 Starting container for testing..."
docker run -d \
  --name alraseen-test \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://api-dev.alraseen.ae \
  alraseen-tenant-portal:latest

echo "🌐 Application running at http://localhost:3000"
echo "🛑 To stop: docker stop alraseen-test && docker rm alraseen-test"
