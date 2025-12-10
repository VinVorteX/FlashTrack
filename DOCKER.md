# 🐳 FlashTrack Docker Deployment Guide

## ✅ Successfully Deployed!

Your FlashTrack application is now fully containerized and running!

## 📊 Current Setup

- **Application URL:** http://localhost:8081
- **Database:** PostgreSQL on localhost:5433
- **Docker Compose:** V2 (Modern version)

### Running Services

```bash
docker compose ps
```

You should see:

- `flashtrack-app` - Go API server (port 8081)
- `flashtrack-db` - PostgreSQL 16 (port 5433)

## 🚀 Quick Commands

### Start/Stop Services

```bash
# Start everything
make docker-up

# Stop everything
make docker-down

# View logs
make docker-logs

# Restart app only
make docker-restart
```

### Manual Docker Compose Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs (follow mode)
docker compose logs -f app

# Rebuild after code changes
docker compose up -d --build

# Remove everything including volumes
docker compose down -v
```

## 🧪 Testing the API

### Quick Test with cURL

**Register a user:**

```bash
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user",
    "society_id": 1
  }'
```

**Login:**

```bash
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Automated Test Script

Run the test suite:

```bash
./test-api.sh
```

## 🔧 Port Configuration

**Note:** Ports were changed to avoid conflicts with existing services:

- **Application:** 8081 (instead of 8080)
- **PostgreSQL:** 5433 (instead of 5432)

To change ports, edit `docker-compose.yml`:

```yaml
ports:
  - "YOUR_PORT:8080" # For app
  - "YOUR_PORT:5432" # For database
```

## 📝 Database Access

Connect to PostgreSQL:

```bash
# Using psql
psql -h localhost -p 5433 -U postgres -d flashtrack

# Or via Docker
docker compose exec postgres psql -U postgres -d flashtrack
```

**Credentials:**

- User: `postgres`
- Password: `postgres`
- Database: `flashtrack`

## 🐛 Troubleshooting

### Port Already in Use

If you get "port already allocated" errors:

1. Check what's using the port:

   ```bash
   sudo lsof -i :8081
   sudo lsof -i :5433
   ```

2. Either stop the conflicting service or change ports in `docker-compose.yml`

### View Application Logs

```bash
docker compose logs -f app
```

### Database Connection Issues

```bash
# Check if PostgreSQL is healthy
docker compose ps

# Test database connection
docker compose exec postgres pg_isready -U postgres
```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker compose down -v

# Rebuild from scratch
make docker-rebuild
```

## 📁 Project Files Created

- ✅ `Dockerfile` - Multi-stage build configuration
- ✅ `docker-compose.yml` - Service orchestration
- ✅ `.dockerignore` - Optimized build context
- ✅ `Makefile` - Developer commands
- ✅ `start.sh` - One-click deployment
- ✅ `test-api.sh` - API integration tests

## 🎯 Next Steps

1. **Production Deployment:**

   - Change JWT secret in environment variables
   - Use stronger database passwords
   - Enable SSL for database connections
   - Set `GIN_MODE=release`

2. **Scaling:**

   - Add nginx reverse proxy
   - Implement rate limiting
   - Add Redis for caching
   - Set up monitoring (Prometheus/Grafana)

3. **CI/CD:**
   - GitHub Actions for automated builds
   - Automated testing pipeline
   - Docker image versioning

## 🔒 Security Notes

- Current setup uses default passwords - **DO NOT use in production**
- JWT secret should be at least 32 characters
- Enable PostgreSQL SSL in production
- Consider using Docker secrets for sensitive data

## ✨ Features

- ✅ Multi-stage Docker build (small image size)
- ✅ Health checks for database
- ✅ Automatic database migrations
- ✅ Volume persistence for data
- ✅ Network isolation
- ✅ Docker Compose V2 support

---

**Happy Coding! 🚀**
