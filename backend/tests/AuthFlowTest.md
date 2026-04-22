# Auth Flow Test Plan

## Prerequisites
- Database migrated: `php artisan migrate`
- Seeder run: `php artisan db:seed --class=AuthSeeder`
- Laravel server running on http://localhost:8000
- Frontend running on http://localhost:3000

## Test Cases

### 1. Login Success
```
POST /api/v1/auth/login
{
  "email": "superadmin@omclta.com",
  "password": "Admin@123456",
  "device_fingerprint": "test-fingerprint-123",
  "user_agent": "Mozilla/5.0...",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "gps_source": "gps"
}
Expected: 200, access_token, refresh_token, user object
```

### 2. Login Missing GPS
```
POST /api/v1/auth/login
{
  "email": "superadmin@omclta.com",
  "password": "Admin@123456",
  "device_fingerprint": "test-fingerprint-123",
  "user_agent": "Mozilla/5.0...",
  "gps_source": "ip_fallback"
}
Expected: 200, tokens, location resolved from IP
```

### 3. Permission Check
```
GET /api/v1/users
Authorization: Bearer {access_token}
Expected: 200, users list (if has users.read permission)
```

### 4. Wildcard Permission Match
- User with admin.* should access any admin.X endpoint
- Test: POST /api/v1/locations with admin user should succeed

### 5. Token Refresh
```
POST /api/v1/auth/refresh
Authorization: Bearer {refresh_token}
Expected: 200, new access_token
```

### 6. Logout
```
POST /api/v1/auth/logout
Authorization: Bearer {access_token}
Expected: 200, session revoked in DB
```

### 7. Invalid Token
```
GET /api/v1/users
Authorization: Bearer invalid-token
Expected: 401 Unauthorized
```

### 8. Insufficient Permissions
```
GET /api/v1/users
Authorization: Bearer {sales_manager_token}
Expected: 403 Forbidden (unless sales.users.read exists)
```
