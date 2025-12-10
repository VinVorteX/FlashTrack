# FlashTrack Deployment Guide 🚀

## Quick Deployment Options

### Option 1: VPS/Cloud Server (Recommended)
Deploy on DigitalOcean, AWS EC2, Linode, or any VPS with Docker support.

### Option 2: Free Hosting
Deploy on Render, Railway, or Fly.io (with limitations).

---

## 🌐 VPS Deployment (Production Ready)

### Prerequisites
- Ubuntu 20.04+ or similar Linux server
- Domain name (optional but recommended)
- Minimum 2GB RAM, 2 CPU cores

### Step 1: Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 2: Clone & Configure

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/flashtrack.git
cd flashtrack

# Create production .env file
nano .env
```

**Production .env:**
```env
# Database
DB_URL=postgresql://postgres:STRONG_PASSWORD_HERE@flashtrack-db:5432/flashtrack?sslmode=disable

# Server
PORT=8080

# JWT Secret (MUST be 32+ characters)
JWT_SECRET=your-super-secure-random-secret-key-min-32-chars-production

# Environment
NODE_ENV=production
```

### Step 3: Update docker-compose.yml for Production

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: flashtrack-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: STRONG_PASSWORD_HERE
      POSTGRES_DB: flashtrack
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - flashtrack-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    container_name: flashtrack-app
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DB_URL: postgresql://postgres:STRONG_PASSWORD_HERE@flashtrack-db:5432/flashtrack?sslmode=disable
      PORT: 8080
      JWT_SECRET: ${JWT_SECRET}
    networks:
      - flashtrack-network
    restart: unless-stopped

  frontend:
    build: ./flashtrack-dashboard
    container_name: flashtrack-frontend
    depends_on:
      - app
    networks:
      - flashtrack-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: flashtrack-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
      - frontend
    networks:
      - flashtrack-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  flashtrack-network:
    driver: bridge
```

### Step 4: Create Nginx Configuration

```bash
nano nginx.conf
```

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server flashtrack-app:8080;
    }

    upstream frontend {
        server flashtrack-frontend:80;
    }

    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;

        # Redirect HTTP to HTTPS (after SSL setup)
        # return 301 https://$server_name$request_uri;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Backend API
        location /api {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_cache_bypass $http_upgrade;
        }

        # Auth endpoints
        location /auth {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }

    # HTTPS configuration (after SSL setup)
    # server {
    #     listen 443 ssl http2;
    #     server_name your-domain.com www.your-domain.com;
    #
    #     ssl_certificate /etc/nginx/ssl/fullchain.pem;
    #     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    #
    #     # Same location blocks as above
    # }
}
```

### Step 5: Deploy

```bash
# Build and start all services
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Verify all containers are running
docker-compose ps
```

### Step 6: Setup SSL (Free with Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

### Step 7: Seed Initial Data

```bash
# Run seed script
./seed-data.sh

# Or manually create first admin
docker exec -it flashtrack-app curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@yourdomain.com",
    "password": "secure_password",
    "role": "admin",
    "society_id": 1
  }'
```

---

## 🆓 Free Hosting Options

### Option A: Render.com

1. **Create account** at render.com
2. **New Web Service** → Connect GitHub repo
3. **Configure:**
   - Build Command: `docker build -t flashtrack-app .`
   - Start Command: `./flashtrack`
   - Add PostgreSQL database (free tier)
4. **Environment Variables:**
   - Add DB_URL, JWT_SECRET, PORT
5. **Deploy** → Auto-deploys on git push

### Option B: Railway.app

1. **Create account** at railway.app
2. **New Project** → Deploy from GitHub
3. **Add PostgreSQL** from marketplace
4. **Configure services:**
   - Backend: Dockerfile deployment
   - Frontend: Dockerfile deployment
5. **Auto-deploys** on git push

### Option C: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Launch app
flyctl launch

# Deploy
flyctl deploy
```

---

## 📊 Monitoring & Maintenance

### Check Application Health

```bash
# View logs
docker-compose logs -f app
docker-compose logs -f frontend

# Check container status
docker-compose ps

# Restart services
docker-compose restart

# Update application
git pull
docker-compose up -d --build
```

### Database Backup

```bash
# Backup
docker exec flashtrack-db pg_dump -U postgres flashtrack > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i flashtrack-db psql -U postgres flashtrack < backup_20231210.sql
```

### Auto-Backup Script

```bash
# Create backup script
nano /root/backup-flashtrack.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/root/flashtrack-backups"
mkdir -p $BACKUP_DIR
docker exec flashtrack-db pg_dump -U postgres flashtrack > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql
# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

```bash
# Make executable
chmod +x /root/backup-flashtrack.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /root/backup-flashtrack.sh
```

---

## 🔒 Security Checklist

- ✅ Use strong passwords for database
- ✅ Change default JWT_SECRET (32+ characters)
- ✅ Enable SSL/HTTPS
- ✅ Configure firewall (UFW)
- ✅ Regular backups
- ✅ Keep Docker images updated
- ✅ Use environment variables for secrets
- ✅ Disable root SSH login
- ✅ Setup fail2ban for SSH protection

### Firewall Setup

```bash
# Enable UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 🎯 Production URLs

After deployment, your app will be accessible at:

- **Frontend**: `http://your-domain.com` or `https://your-domain.com`
- **Backend API**: `http://your-domain.com/api`
- **Auth**: `http://your-domain.com/auth`

---

## 🆘 Troubleshooting

### Container won't start
```bash
docker-compose logs app
docker-compose logs frontend
```

### Database connection issues
```bash
# Check database is running
docker exec flashtrack-db psql -U postgres -c "SELECT 1"

# Verify DB_URL in .env
```

### Port already in use
```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :8080

# Kill process or change port
```

### Out of disk space
```bash
# Clean Docker
docker system prune -a --volumes

# Check disk usage
df -h
```

---

## 📞 Support

For issues or questions:
- GitHub Issues: https://github.com/YOUR_USERNAME/flashtrack/issues
- Email: your-email@example.com

---

**Happy Deploying! 🚀**
