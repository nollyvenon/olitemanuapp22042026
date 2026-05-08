# RBAC System API Documentation

## Overview

The enterprise-grade Role-Based Access Control (RBAC) system provides granular permission management through a hierarchy of users → groups → roles → permissions.

**Core Principle**: Users never receive permissions directly. All permissions flow through groups and roles.

## Authentication

All API endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

## Base Endpoints

All endpoints are prefixed with `/api/v1/`

---

## Roles Management

### GET `/roles`
List all system roles with permissions.

**Query Parameters:**
- `per_page` (int): Items per page (default: 20)
- `page` (int): Page number (default: 1)

**Response:**
```json
{
  "data": [
    {
      "id": "role-uuid",
      "name": "Sales Officer",
      "description": "Can create and submit orders",
      "permissions": [
        { "id": "perm-uuid", "name": "sales.create", "module": "sales" }
      ],
      "created_at": "2026-05-08T10:30:00Z"
    }
  ],
  "pagination": { "total": 10, "per_page": 20, "page": 1 }
}
```

**Permissions Required:** `analytics.view` or `admin.view`

---

### POST `/roles`
Create a new role.

**Request Body:**
```json
{
  "name": "Inventory Supervisor",
  "description": "Supervises inventory operations"
}
```

**Response:** `201 Created`
```json
{
  "id": "role-uuid",
  "name": "Inventory Supervisor",
  "description": "Supervises inventory operations",
  "permissions": [],
  "created_at": "2026-05-08T10:30:00Z"
}
```

**Permissions Required:** `admin.edit`

---

### PATCH `/roles/{id}`
Update an existing role.

**Request Body:**
```json
{
  "name": "Updated Role Name",
  "description": "Updated description"
}
```

**Response:** `200 OK`

**Permissions Required:** `admin.edit`

---

### DELETE `/roles/{id}`
Delete a role.

**Response:** `204 No Content`

**Permissions Required:** `admin.edit`

---

### POST `/roles/{id}/permissions`
Attach permissions to a role.

**Request Body:**
```json
{
  "permission_ids": ["perm-uuid-1", "perm-uuid-2"]
}
```

**Response:** `200 OK`
```json
{
  "id": "role-uuid",
  "permissions": [
    { "id": "perm-uuid-1", "name": "sales.create", "module": "sales" },
    { "id": "perm-uuid-2", "name": "sales.approve", "module": "sales" }
  ]
}
```

**Permissions Required:** `admin.edit`

---

### DELETE `/roles/{id}/permissions/{permissionId}`
Remove a permission from a role.

**Response:** `200 OK`

**Permissions Required:** `admin.edit`

---

## Groups Management

### GET `/groups`
List all groups with members and permissions.

**Query Parameters:**
- `per_page` (int): Items per page (default: 20)
- `page` (int): Page number (default: 1)
- `search` (string): Filter by name

**Response:**
```json
{
  "data": [
    {
      "id": "group-uuid",
      "name": "Sales Team",
      "description": "Regional sales officers",
      "is_active": true,
      "users_count": 5,
      "permissions": [
        { "id": "perm-uuid", "name": "sales.create", "module": "sales" }
      ],
      "parent_group_id": null,
      "created_at": "2026-05-08T10:30:00Z"
    }
  ]
}
```

**Permissions Required:** `admin.view` or module-specific access

---

### POST `/groups`
Create a new group.

**Request Body:**
```json
{
  "name": "Finance Team",
  "description": "Finance department staff",
  "parent_group_id": null
}
```

**Response:** `201 Created`

**Permissions Required:** `admin.edit`

---

### PATCH `/groups/{id}`
Update a group.

**Request Body:**
```json
{
  "name": "Updated Group Name",
  "description": "Updated description",
  "is_active": true
}
```

**Response:** `200 OK`

**Permissions Required:** `admin.edit`

---

### DELETE `/groups/{id}`
Delete a group.

**Response:** `204 No Content`

**Permissions Required:** `admin.edit`

---

### POST `/groups/{id}/users`
Add users to a group.

**Request Body:**
```json
{
  "user_ids": ["user-uuid-1", "user-uuid-2"]
}
```

**Response:** `200 OK`
```json
{
  "id": "group-uuid",
  "users_added": 2,
  "users": [
    { "id": "user-uuid-1", "name": "John Doe", "email": "john@example.com" }
  ]
}
```

**Permissions Required:** `admin.edit`

---

### DELETE `/groups/{id}/users/{userId}`
Remove a user from a group.

**Response:** `200 OK`

**Permissions Required:** `admin.edit`

---

### POST `/groups/{id}/permissions`
Assign permissions to a group.

**Request Body:**
```json
{
  "permission_ids": ["perm-uuid-1", "perm-uuid-2"]
}
```

**Response:** `200 OK`
```json
{
  "id": "group-uuid",
  "permissions_granted": 2,
  "permissions": [...]
}
```

**Permissions Required:** `admin.edit`

---

### DELETE `/groups/{id}/permissions/{permissionId}`
Remove a permission from a group.

**Response:** `200 OK`

**Permissions Required:** `admin.edit`

---

### POST `/groups/{id}/locations`
Assign locations to a group.

**Request Body:**
```json
{
  "location_ids": ["location-uuid-1", "location-uuid-2"]
}
```

**Response:** `200 OK`

**Permissions Required:** `admin.edit`

---

## Users Management

### GET `/users`
List all users with their group assignments.

**Query Parameters:**
- `per_page` (int): Items per page (default: 20)
- `page` (int): Page number (default: 1)
- `search` (string): Filter by name/email

**Response:**
```json
{
  "data": [
    {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "is_active": true,
      "groups": [
        { "id": "group-uuid", "name": "Sales Team" }
      ],
      "effective_permissions": ["sales.create", "sales.submit"],
      "locations": [
        { "id": "loc-uuid", "name": "Lagos Branch" }
      ]
    }
  ]
}
```

**Permissions Required:** `admin.view`

---

### POST `/users`
Create a new user.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePassword123",
  "group_ids": ["group-uuid-1"]
}
```

**Response:** `201 Created`

**Permissions Required:** `admin.edit`

---

### PATCH `/users/{id}`
Update a user.

**Request Body:**
```json
{
  "name": "Updated Name",
  "is_active": true,
  "group_ids": ["group-uuid-1", "group-uuid-2"]
}
```

**Response:** `200 OK`

**Permissions Required:** `admin.edit`

---

### DELETE `/users/{id}`
Delete a user.

**Response:** `204 No Content`

**Permissions Required:** `admin.edit`

---

### GET `/users/{id}/permissions`
Get all effective permissions for a user (merged from groups and roles).

**Response:**
```json
{
  "user_id": "user-uuid",
  "permissions": ["sales.create", "sales.submit", "inventory.view"],
  "module_access": ["sales", "inventory"],
  "locations": ["loc-uuid-1", "loc-uuid-2"]
}
```

**Permissions Required:** `admin.view`

---

### POST `/users/{id}/locations`
Assign locations to a user.

**Request Body:**
```json
{
  "location_ids": ["location-uuid-1", "location-uuid-2"]
}
```

**Response:** `200 OK`

**Permissions Required:** `admin.edit`

---

## Permissions Management

### GET `/permissions`
List all available permissions.

**Query Parameters:**
- `module` (string): Filter by module (sales, inventory, etc.)

**Response:**
```json
{
  "data": [
    {
      "id": "perm-uuid",
      "name": "sales.create",
      "module": "sales",
      "description": "Can create new sales orders"
    }
  ]
}
```

**Permissions Required:** `admin.view`

---

### POST `/permissions`
Create a new permission.

**Request Body:**
```json
{
  "name": "reports.export",
  "module": "reports",
  "description": "Can export reports to CSV/PDF"
}
```

**Response:** `201 Created`

**Permissions Required:** `admin.edit`

---

### DELETE `/permissions/{id}`
Delete a permission.

**Response:** `204 No Content`

**Permissions Required:** `admin.edit`

---

## Locations Management

### GET `/locations`
List all locations.

**Response:**
```json
{
  "data": [
    {
      "id": "location-uuid",
      "name": "Lagos Branch",
      "address": "123 Lekki Road",
      "city": "Lagos",
      "state": "Lagos",
      "is_active": true,
      "users_count": 5
    }
  ]
}
```

---

### POST `/locations`
Create a location.

**Request Body:**
```json
{
  "name": "Abuja Office",
  "address": "456 Abuja Street",
  "city": "Abuja",
  "state": "FCT"
}
```

**Response:** `201 Created`

**Permissions Required:** `admin.edit`

---

### PATCH `/locations/{id}`
Update a location.

**Response:** `200 OK`

**Permissions Required:** `admin.edit`

---

### DELETE `/locations/{id}`
Delete a location.

**Response:** `204 No Content`

**Permissions Required:** `admin.edit`

---

## Temporary Access Management

### POST `/temporary-access`
Grant temporary access (time-limited group/role assignment).

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "group_id": "group-uuid",
  "expires_at": "2026-05-15T23:59:59Z",
  "reason": "Covering for absent colleague"
}
```

**Response:** `201 Created`
```json
{
  "id": "temp-access-uuid",
  "user_id": "user-uuid",
  "group_id": "group-uuid",
  "assigned_by": "admin-uuid",
  "expires_at": "2026-05-15T23:59:59Z",
  "is_active": true,
  "created_at": "2026-05-08T10:30:00Z"
}
```

**Permissions Required:** `admin.edit`

---

### GET `/temporary-access`
List all active temporary access grants.

**Query Parameters:**
- `user_id` (string): Filter by user
- `active_only` (bool): Show only active (default: true)

**Response:**
```json
{
  "data": [
    {
      "id": "temp-access-uuid",
      "user_id": "user-uuid",
      "group_id": "group-uuid",
      "expires_at": "2026-05-15T23:59:59Z",
      "is_active": true
    }
  ]
}
```

**Permissions Required:** `admin.view` or `audit.view`

---

### DELETE `/temporary-access/{id}`
Revoke temporary access immediately.

**Response:** `200 OK`
```json
{
  "id": "temp-access-uuid",
  "revoked_at": "2026-05-08T11:00:00Z",
  "revoked_by": "admin-uuid"
}
```

**Permissions Required:** `admin.edit`

---

## Access Audit & Reporting

### GET `/access-audit`
View RBAC changes and access history.

**Query Parameters:**
- `user_id` (string): Filter by user
- `action_type` (string): Filter by action (assign, revoke, etc.)
- `from` (date): Start date
- `to` (date): End date
- `per_page` (int): Items per page

**Response:**
```json
{
  "data": [
    {
      "id": "audit-uuid",
      "user_id": "admin-uuid",
      "action_type": "assign_permission",
      "target_user_id": "user-uuid",
      "target_group_id": "group-uuid",
      "permission_id": "perm-uuid",
      "before_snapshot": {},
      "after_snapshot": {},
      "created_at": "2026-05-08T10:30:00Z"
    }
  ]
}
```

**Permissions Required:** `audit.view`

---

### GET `/access-audit/{id}`
Get details of a single audit entry.

**Response:** `200 OK`

**Permissions Required:** `audit.view`

---

### GET `/access-audit/user/{userId}`
View all access changes for a specific user.

**Response:** Same as `/access-audit`

**Permissions Required:** `audit.view`

---

### GET `/permission-matrix`
Get a matrix of all users and their effective permissions.

**Query Parameters:**
- `include_inherited` (bool): Include permissions from groups (default: true)

**Response:**
```json
{
  "headers": ["user_name", "sales.create", "sales.approve", "inventory.view"],
  "rows": [
    {
      "user_id": "user-uuid-1",
      "user_name": "John Doe",
      "permissions": { "sales.create": true, "sales.approve": true, "inventory.view": false }
    }
  ]
}
```

**Permissions Required:** `admin.view` or `audit.view`

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "Email already exists"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized",
  "message": "Permission denied: admin.edit"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Role not found"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "User already in group"
}
```

---

## Permission Naming Convention

Permissions follow the pattern: `module.action`

**Modules:** sales, inventory, accounts, reports, audit, kyc, market, dashboard, admin

**Actions:** view, create, edit, delete, approve, override, export, import

**Examples:**
- `sales.create` - Create sales orders
- `sales.approve` - Approve sales orders
- `inventory.transfer` - Transfer inventory
- `reports.export` - Export reports
- `admin.*` - All admin actions

---

## Separation of Duties

The system enforces separation of duties to prevent conflict of interest. For example:

- A user cannot both **create** and **approve** a sales order (unless explicitly authorized)
- A finance officer cannot both **submit** and **approve** a payment request

Check `WorkflowAuthorityService` for configured rules.

---

## Multi-Location Enforcement

All data queries are automatically filtered by user's assigned locations. Users cannot access data outside their location scope.

Location enforcement happens at:
1. Database query level (automatic filtering)
2. API endpoint level (401 Forbidden for cross-location access)
3. Frontend level (components hidden for unauthorized locations)

---

## Default Roles & Permissions

### System Roles Created on Seed

1. **GOD_MODE_ADMIN** - Full system access, bypass restrictions
2. **SUPER_ADMIN** - Business-wide management
3. **SALES_ADMIN** - Sales module management
4. **SALES_OFFICER** - Create and submit orders
5. **INVENTORY_MANAGER** - Manage inventory
6. **ACCOUNTS_MANAGER** - Manage accounts
7. **ACCOUNTS_OFFICER** - Create vouchers and transactions
8. **AUDITOR** - View all audit logs
9. **REPORT_VIEWER** - View reports only
10. **MARKET_INTELLIGENCE_OFFICER** - Market analysis
11. **KYC_MANAGER** - Manage KYC submissions

---

## Rate Limiting

Currently no rate limiting is enforced. Subject to change in production deployments.

---

## Pagination

All list endpoints support pagination:

**Request:**
```
GET /roles?per_page=10&page=2
```

**Response Metadata:**
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "per_page": 10,
    "page": 2,
    "last_page": 10
  }
}
```

---

## Testing

Use the following test credentials:

- **Admin:** admin@example.com / password
- **Sales Officer:** sales@example.com / password
- **Analyst:** analyst@example.com / password

---

## Troubleshooting

**User cannot access a module:**
1. Check if user is in an appropriate group
2. Check if group has required module access
3. Check if any location restrictions apply
4. Verify permissions in admin panel

**Permission denied on API call:**
1. Check request `Authorization` header
2. Verify JWT token is not expired
3. Check user's effective permissions via `/users/{id}/permissions`
4. Review audit logs for recent permission changes

**Temporary access not working:**
1. Check expiry date: `expires_at` must be in future
2. Verify user still in original group (temporary is additive)
3. Check scheduled job has run: `RevokeExpiredTemporaryAccess`

---

## Version History

- **v1.0** (2026-05-08) - Initial RBAC system release

---

## Support

For RBAC issues or feature requests, please contact: security@example.com
