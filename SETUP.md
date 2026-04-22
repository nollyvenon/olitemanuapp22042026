# OMCLTA Setup Guide

## Backend Setup

```bash
cd backend

# Copy environment
cp .env.example .env

# Install dependencies
composer install

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed initial data
php artisan db:seed --class=AuthSeeder

# Start server
php artisan serve --port=8000
```

## Frontend Setup

```bash
# Install dependencies
npm install

# Create .env.local with backend URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start dev server
npm run dev
```

## Testing

### 1. Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@omclta.com",
    "password": "Admin@123456",
    "device_fingerprint": "test-fp-123",
    "user_agent": "Mozilla/5.0",
    "gps_source": "ip_fallback"
  }'
```

### 2. Access Dashboard
- Navigate to http://localhost:3000
- Login with superadmin@omclta.com / Admin@123456
- Should redirect to /dashboard

### 3. Verify Users API
```bash
curl http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer {access_token}"
```

## Key Endpoints

- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout  
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/users` - List users (requires users.read)
- `POST /api/v1/users` - Create user (requires users.create)
- `GET /api/v1/groups` - List groups
- `GET /api/v1/permissions` - List permissions
- `GET /api/v1/locations` - List locations
