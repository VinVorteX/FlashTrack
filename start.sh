#!/bin/bash

# FlashTrack Quick Start Script

set -e

echo "🚀 FlashTrack - Starting Application..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose plugin is not installed. Please install Docker Compose V2."
    exit 1
fi

# Stop and remove existing containers
echo "🧹 Cleaning up old containers..."
docker compose down 2>/dev/null || true

# Build and start services
echo "🏗️  Building Docker images..."
docker compose build

echo "🚀 Starting services..."
docker compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if services are running
if docker compose ps | grep -q "flashtrack-app.*Up"; then
    echo ""
    echo "✅ FlashTrack is running!"
    echo ""
    echo "🌐 Frontend:"
    echo "   - Dashboard:     http://localhost:3000"
    echo ""
    echo "📝 Backend API:"
    echo "   - API Base:      http://localhost:8081"
    echo "   - Register:      POST http://localhost:8081/auth/register"
    echo "   - Login:         POST http://localhost:8081/auth/login"
    echo "   - Complaints:    POST http://localhost:8081/api/complaints"
    echo ""
    echo "🗄️  Database:"
    echo "   - PostgreSQL:    localhost:5433 (postgres/postgres)"
    echo ""
    echo "🔍 View logs:"
    echo "   docker compose logs -f app"
    echo "   docker compose logs -f frontend"
    echo ""
    echo "🛑 Stop services:"
    echo "   docker compose down"
    echo ""
else
    echo "❌ Failed to start FlashTrack. Check logs:"
    docker compose logs
    exit 1
fi
