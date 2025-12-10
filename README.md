# FlashTrack 🏢

A full-stack multi-tenant complaint management system for housing societies built with Go, React, and PostgreSQL.

## Features

- 🔐 **JWT Authentication** - Secure login/register
- 🏘️ **Multi-tenancy** - Society-based data isolation
- 📝 **Complaint Management** - Create, track, and assign complaints
- 👥 **Role-based Access** - User, Admin, and Staff roles
- ⚡ **Fast & Scalable** - Built with Gin framework
- 🎨 **Modern UI** - React + TypeScript + TailwindCSS + shadcn/ui

## Tech Stack

**Backend:**

- **Go** 1.24.1
- **Gin** - HTTP web framework
- **GORM** - ORM for PostgreSQL
- **JWT** - Token-based authentication
- **PostgreSQL** - Database

**Frontend:**

- **React** 18 + TypeScript
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library
- **Nginx** - Production server

## Project Structure

```
FlashTrack/
├── cmd/server/          # Application entry point
├── config/              # Configuration management
├── internal/
│   ├── controllers/     # HTTP request handlers
│   ├── services/        # Business logic
│   ├── repository/      # Data access layer
│   ├── models/          # Database models
│   ├── middleware/      # Auth & tenant middleware
│   └── utils/           # Helper utilities (JWT, hashing)
└── pkg/database/        # Database connection
```

## Getting Started

### Prerequisites

**Option 1: Docker (Recommended)**

- Docker 20.10+
- Docker Compose 2.0+

**Option 2: Local Development**

- Go 1.24.1 or higher
- PostgreSQL 13+

### Quick Start with Docker 🐳

1. Clone the repository:

```bash
git clone https://github.com/VinVorteX/flashtrack.git
cd flashtrack
```

2. Start with Docker Compose:

```bash
docker-compose up -d
```

That's it! The app will be running on `http://localhost:8080` with PostgreSQL automatically configured.

**Available Make commands:**

```bash
make help           # Show all commands
make docker-up      # Start all services
make docker-down    # Stop all services
make docker-logs    # View application logs
make docker-rebuild # Rebuild and restart
```

### Local Development Setup

1. Install dependencies:

```bash
go mod download
```

2. Start only PostgreSQL with Docker:

```bash
docker-compose up postgres -d
```

Or use `make dev` to start PostgreSQL and run the app locally.

3. Set up environment variables (edit `.env`):

```bash
DB_URL=postgresql://postgres:postgres@localhost:5432/flashtrack?sslmode=disable
PORT=8080
JWT_SECRET=your-super-secret-key-min-32-characters
```

4. Run the application:

```bash
go run cmd/server/main.go
# or
make run
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive JWT token

### Complaints (Requires Authentication)

- `POST /api/complaints` - Create a new complaint
- `PUT /api/admin/assign` - Assign staff to complaint (Admin only)

### Example Requests

**Register:**

```bash
curl -X POST http://localhost:8080/auth/register \
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
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Create Complaint:**

````bash
curl -X POST http://localhost:8080/api/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Water leakage",
## Development

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Clean everything (including volumes)
docker-compose down -v
````

### Local Development

Build the project:

```bash
make build
# or
go build -o bin/flashtrack ./cmd/server
```

Run tests:

```bash
make test
# or
go test ./...
```

Run locally:

````bash
make run
# or
go run cmd/server/main.go
``` Complaint
- ID, Title, Description, Status, ResidentID, StaffID, SocietyID, CategoryID

### Society
- ID, Name, Address, Plan

### Category
- ID, Name, SocietyID, SLAHours

## Development

Build the project:
```bash
go build -o bin/flashtrack ./cmd/server
````

Run tests:

```bash
go test ./...
```

## Environment Variables

| Variable     | Description                  | Example                                                            |
| ------------ | ---------------------------- | ------------------------------------------------------------------ |
| `DB_URL`     | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/flashtrack?sslmode=disable` |
| `PORT`       | Server port                  | `8080`                                                             |
| `JWT_SECRET` | Secret key for JWT signing   | `your-secret-key-min-32-chars`                                     |

## Security Notes

- Always use strong JWT secrets in production (minimum 32 characters)
- Use environment variables for sensitive data
- Enable SSL for database connections in production
- Implement rate limiting for authentication endpoints

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first.
