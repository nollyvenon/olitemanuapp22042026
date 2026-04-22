# OMCLTA ERP - Deployment Guide

## Prerequisites
- Docker & Docker Compose
- 4GB RAM minimum
- 10GB disk space

## Quick Start (Local)

```bash
# Clone & navigate
git clone <repo> omclta && cd omclta

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Generate Laravel key
docker-compose run backend php artisan key:generate

# Start services
docker-compose up -d

# Run migrations & seeders
docker-compose exec backend php artisan migrate --seed

# Access
- API: http://localhost:8000
- Frontend: http://localhost:3000
- Default login: superadmin@omclta.com / Admin@123456
```

## Production Deployment

### 1. Environment Setup
```bash
# Set production env vars
export APP_ENV=production
export APP_DEBUG=false
export DB_PASSWORD=<strong_password>
export JWT_SECRET=<generate_random_key>
export REDIS_PASSWORD=<redis_password>
```

### 2. Database
- Use managed PostgreSQL (RDS, CloudSQL)
- Enable SSL connections
- Daily automated backups
- Connection pooling (pgbouncer)

### 3. Redis Caching
- Use managed Redis (ElastiCache, MemoryStore)
- Eviction policy: `allkeys-lru`
- Min 2GB for production

### 4. Security Hardening
- [ ] Update JWT_SECRET in production
- [ ] Enable CORS_ALLOWED_ORIGINS whitelist
- [ ] Set APP_KEY via artisan key:generate
- [ ] Enable HTTPS/SSL
- [ ] Setup firewall rules
- [ ] Enable audit logging (AUDIT_ASYNC=true for queue processing)
- [ ] Use environment variables for all secrets
- [ ] Setup rate limiting on login endpoint

### 5. Docker Compose for Production

```yaml
# Use in production-compose.yml
version: '3.8'
services:
  backend:
    image: omclta-backend:latest
    restart: always
    environment:
      APP_ENV: production
      APP_DEBUG: false
    depends_on:
      - postgres
      - redis
    health_check:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
  frontend:
    image: omclta-frontend:latest
    restart: always
```

### 6. Scaling
- Use Kubernetes or Docker Swarm for multi-node
- Scale backend workers: `docker-compose up -d --scale backend=3`
- Load balance via nginx or cloud provider LB
- Queue workers: `php artisan queue:work redis --queue=default`

### 7. Monitoring & Logging
- Setup centralized logging (ELK, DataDog)
- Monitor Redis memory & connection pool
- Setup alerts for failed jobs queue
- Monitor audit_logs table growth
- Check slow query logs on PostgreSQL

### 8. Backup & Recovery
```bash
# Daily DB backup
docker-compose exec postgres pg_dump -U postgres omclta > backup_$(date +%Y%m%d).sql

# Restore from backup
docker-compose exec postgres psql -U postgres omclta < backup_20250422.sql
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login with GPS
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token

### Core Modules
- `GET|POST /api/v1/users` - User management
- `GET|POST /api/v1/orders` - Sales orders
- `GET|POST /api/v1/stock/items` - Inventory
- `GET|POST /api/v1/vouchers` - Accounting entries
- `GET|POST /api/v1/kyc` - Customer onboarding
- `GET /api/v1/reports` - Report generation
- `GET /api/v1/audit-logs` - Audit trail
- `GET /api/v1/notifications` - User notifications

## Troubleshooting

### Migrations fail
```bash
docker-compose exec backend php artisan migrate:reset
docker-compose exec backend php artisan migrate --seed
```

### Redis connection errors
```bash
docker-compose logs redis
docker-compose restart redis
```

### Queue jobs backing up
```bash
docker-compose exec backend php artisan queue:retry all
docker-compose exec backend php artisan queue:failed
```

### Database locks
```bash
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

## Compliance & Security

- ✅ All actions logged with before/after snapshots
- ✅ GPS-based location tracking
- ✅ Device fingerprinting
- ✅ JWT token expiration (8hr access, 30day refresh)
- ✅ RBAC with DAG group inheritance
- ✅ Audit trail immutable (no delete)
- ✅ Backdated transactions require override reason
- ✅ Negative stock prevention
- ✅ Double-entry accounting

## Support
Email: support@omclta.com
Docs: https://docs.omclta.com
