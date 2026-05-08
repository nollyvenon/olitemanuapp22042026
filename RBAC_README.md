# Enterprise RBAC System - OMCLTA ERP

## 🔐 Overview

A comprehensive, enterprise-grade Role-Based Access Control (RBAC) system built for the OMCLTA ERP platform. Provides:

- ✅ **Granular Permission Management** - Module.action based permissions
- ✅ **Group Inheritance** - Parent-child group relationships with permission cascading
- ✅ **Multi-Group Support** - Users can belong to multiple groups with merged permissions
- ✅ **Location-Based Access** - Data isolation by geographic location
- ✅ **Separation of Duties** - Prevent conflicting actions from same user
- ✅ **Workflow Authority** - Approval matrix and approval chain validation
- ✅ **Temporary Access** - Time-limited group/role assignments with auto-revocation
- ✅ **Comprehensive Auditing** - All access changes logged with before/after snapshots
- ✅ **Admin UI** - Complete web interface for managing RBAC
- ✅ **API Documentation** - Full endpoint reference with examples

## 🚀 Quick Start

### 1. Database Setup

Run migrations to create RBAC tables:

```bash
php artisan migrate
```

This creates:
- `users`, `groups`, `roles`, `permissions`
- `user_groups`, `user_roles`, `role_permissions`, `group_permissions`
- `location_access`, `temporary_access`, `access_audit`
- `group_inheritance`

### 2. Seed Default Data

```bash
php artisan db:seed --class=RBACSeeder
```

Creates:
- **Default Roles**: Super Admin, Sales Officer, Inventory Manager, Accounts Officer, etc.
- **Default Permissions**: Module-based permissions for sales, inventory, accounts, reports, etc.
- **Test Users**: admin@example.com, sales@example.com, analyst@example.com, etc.

### 3. Access Admin Dashboard

1. Start the frontend: `npm run dev`
2. Navigate to `/dashboard/admin`
3. Login with test user credentials
4. Manage roles, groups, users, permissions, and locations

### 4. Integrate into Your Controller

```php
<?php
namespace App\Modules\YourModule\Http\Controllers;

use App\Models\User;
use App\Modules\Auth\Services\RBACService;

class YourController {
    public function __construct(private RBACService $rbac) {}

    public function store(Request $request): JsonResponse {
        $user = User::find($request->authUser->sub);
        if (!$this->rbac->hasPermission($user, 'module.create')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        // ... create resource
    }
}
```

## 📚 Documentation

### Essential Reading

1. **[RBAC_ARCHITECTURE.md](./RBAC_ARCHITECTURE.md)** (Start here!)
   - System design and data model
   - Permission resolution flow
   - Service layer overview
   - Module integration pattern

2. **[RBAC_API_DOCUMENTATION.md](./RBAC_API_DOCUMENTATION.md)**
   - Complete API endpoint reference
   - Request/response examples
   - All CRUD operations
   - Error handling

3. **[RBAC_IMPLEMENTATION_GUIDE.md](./RBAC_IMPLEMENTATION_GUIDE.md)**
   - Step-by-step integration guide
   - Code patterns and best practices
   - Testing examples
   - Troubleshooting checklist

## 🏗️ Architecture

### Permission Resolution Hierarchy

```
User → Groups → Permissions
     → Roles  → Permissions
     ↓
     Merged Effective Permissions
     ↓
     + Location Filtering
     ↓
     Final Authorized Actions
```

### Core Services

| Service | Purpose |
|---------|---------|
| **RBACService** | Permission resolver, checks, group/user management |
| **WorkflowAuthorityService** | Approval rights, separation of duties |
| **TemporaryAccessService** | Time-limited access grants, auto-revocation |
| **GroupService** | Group inheritance resolution |
| **AuditService** | Comprehensive access logging |

### Frontend Components

- **PermissionGuard** - Conditionally render UI based on permissions
- **usePermission Hook** - Runtime permission checks
- **Admin Pages** - Manage users, roles, groups, permissions, locations

## 🔑 Key Concepts

### Users Never Get Permissions Directly

```
❌ User → Permission (WRONG!)
✅ User → Group → Permission (CORRECT)
✅ User → Role → Permission (CORRECT)
✅ User → Group (inherits parent) → Permission (CORRECT)
```

### Permission Naming Convention

```
module.action

sales.create         # Create sales orders
sales.approve        # Approve orders
inventory.transfer   # Transfer inventory
accounts.override    # Override accounting rules
admin.*              # All admin actions
```

### Location-Based Access

```
User Access = (Group Permissions) + (User Permissions)
              ∩ (Assigned Locations)

Result: User can only access data from their assigned locations
```

## 📋 Default Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **GOD_MODE_ADMIN** | All (*) | System administration |
| **SUPER_ADMIN** | All business (no system) | Executive management |
| **SALES_ADMIN** | All sales (*) | Sales department head |
| **SALES_OFFICER** | sales.create, sales.submit | Field sales rep |
| **INVENTORY_MANAGER** | All inventory (*) | Warehouse head |
| **ACCOUNTS_MANAGER** | All accounts (*) | Finance manager |
| **ACCOUNTS_OFFICER** | accounts.create, accounts.submit | Entry-level finance |
| **AUDITOR** | audit.view | Internal audit |
| **REPORT_VIEWER** | reports.view | Business analyst |

## 🔒 Security Features

### Deny by Default
- No permission = no access
- Must explicitly grant permissions
- Absence of permission is secure

### Separation of Duties
- Prevent same user from creating AND approving
- Configurable per module
- Enforced at business logic layer

### Location Enforcement
- Query filtering by location
- Cross-location access prevented
- Users isolated to their locations

### Comprehensive Auditing
- Every permission change logged
- Before/after snapshots stored
- Admin identity recorded
- Timestamp and reason tracked

### Temporary Access with Auto-Revocation
- Grant temporary access (hours/days)
- Automatic revocation on expiry
- Scheduled job: RevokeExpiredTemporaryAccess
- Runs hourly, logs all revocations

## 🛠️ Integration Checklist

When adding RBAC to a new module:

- [ ] Inject RBACService in constructor
- [ ] Add module access check to read methods (index, show)
- [ ] Add action permission checks to write methods (store, update, delete)
- [ ] Add approval permission checks for workflow actions (approve, reject)
- [ ] Filter queries by user's locations
- [ ] Log all sensitive operations via AuditService
- [ ] Add PermissionGuard to frontend components
- [ ] Test with different user roles
- [ ] Document required permissions in code comments

## 🧪 Testing

### Test Users

```
Email: admin@example.com (SUPER_ADMIN - all permissions)
Email: sales@example.com (SALES_OFFICER - limited permissions)
Email: analyst@example.com (ANALYST - read-only permissions)
Password: password (for all test accounts)
```

### Test Permission Check

```bash
curl -H "Authorization: Bearer {JWT_TOKEN}" \
  http://localhost/api/v1/users/{userId}/permissions
```

Response shows effective permissions:
```json
{
  "permissions": ["sales.create", "sales.submit", "inventory.view"],
  "module_access": ["sales", "inventory"],
  "locations": ["loc-uuid-1", "loc-uuid-2"]
}
```

## 📊 Admin Dashboard

Access at: `http://localhost/dashboard/admin`

### Available Pages

1. **Users** - Create, edit, assign groups
2. **Roles & Groups** - Manage roles and permission groups
3. **Permissions** - View all system permissions
4. **Locations** - Configure office locations
5. **Settings** - System configuration
6. **Audit Logs** - View all access changes

## 🔧 API Endpoints

### Users
- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user
- `PATCH /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user
- `GET /api/v1/users/{id}/permissions` - Get effective permissions
- `POST /api/v1/users/{id}/locations` - Assign locations

### Groups
- `GET /api/v1/groups` - List groups
- `POST /api/v1/groups` - Create group
- `PATCH /api/v1/groups/{id}` - Update group
- `DELETE /api/v1/groups/{id}` - Delete group
- `POST /api/v1/groups/{id}/permissions` - Assign permissions
- `POST /api/v1/groups/{id}/locations` - Assign locations
- `POST /api/v1/groups/{id}/users` - Add users

### Roles
- `GET /api/v1/roles` - List roles
- `POST /api/v1/roles` - Create role
- `PATCH /api/v1/roles/{id}` - Update role
- `POST /api/v1/roles/{id}/permissions` - Attach permissions

### Permissions
- `GET /api/v1/permissions` - List permissions
- `POST /api/v1/permissions` - Create permission
- `DELETE /api/v1/permissions/{id}` - Delete permission

### Temporary Access
- `POST /api/v1/temporary-access` - Grant temporary access
- `GET /api/v1/temporary-access` - List temporary access
- `DELETE /api/v1/temporary-access/{id}` - Revoke immediately

### Audit & Reporting
- `GET /api/v1/access-audit` - View RBAC changes
- `GET /api/v1/permission-matrix` - View user permission matrix

For full details, see: **[RBAC_API_DOCUMENTATION.md](./RBAC_API_DOCUMENTATION.md)**

## 🔍 Troubleshooting

### "Permission denied: module.view"
1. Check user is in a group
2. Verify group has the permission
3. Check user's locations match resource location
4. Review audit log for recent changes

### User can't access module
1. Get effective permissions: `GET /api/v1/users/{id}/permissions`
2. Check group membership: Look in `user_groups`
3. Verify group is active: `is_active = true`
4. Check module access in groups table

### Temporary access not working
1. Verify `expires_at` is in the future
2. Check `is_active = true`
3. Ensure scheduled job has run
4. User should still be in original group

For more help, see: **[RBAC_IMPLEMENTATION_GUIDE.md](./RBAC_IMPLEMENTATION_GUIDE.md#troubleshooting-checklist)**

## 📈 Scaling

For large deployments:

1. **Cache Permissions**
   - Store in Redis with 1-hour TTL
   - Invalidate on permission change
   - Separate cache keys per user

2. **Database Optimization**
   - Add indexes on `user_id`, `group_id`, `location_id`
   - Archive old audit logs (> 1 year)
   - Use read replicas for audit queries

3. **Rate Limiting**
   - Protect admin endpoints
   - Limit permission checks per user
   - Prevent enumeration attacks

## 🚨 Important Security Notes

- ⚠️ **Always check permissions on backend** - Frontend checks are UI-only
- ⚠️ **Use JWT with short expiry** - Tokens in localStorage
- ⚠️ **Audit all sensitive operations** - AuditService is mandatory
- ⚠️ **Review permissions monthly** - Prevent privilege creep
- ⚠️ **Archive audit logs** - Don't store forever in active DB
- ⚠️ **Never hardcode permissions** - Always use RBAC checks

## 🔄 Migration Path

If you have existing permissions:

1. Create new groups matching your org structure
2. Assign users to groups
3. Grant permissions to groups (not directly to users)
4. Test with new group-based permissions
5. Deprecate old permission system
6. Delete old user-permission table

## 📞 Support

For RBAC questions or issues:

- **Architecture**: Read [RBAC_ARCHITECTURE.md](./RBAC_ARCHITECTURE.md)
- **API Reference**: Check [RBAC_API_DOCUMENTATION.md](./RBAC_API_DOCUMENTATION.md)
- **Implementation Help**: See [RBAC_IMPLEMENTATION_GUIDE.md](./RBAC_IMPLEMENTATION_GUIDE.md)
- **Code**: Browse `app/Modules/Auth/Services/` and `app/Modules/Auth/Http/Controllers/`

## 📝 Files Overview

### Backend
- `app/Modules/Auth/Services/RBACService.php` - Core permission resolver
- `app/Modules/Auth/Services/WorkflowAuthorityService.php` - Approval rights
- `app/Modules/Auth/Services/TemporaryAccessService.php` - Temporary access
- `app/Modules/Auth/Http/Controllers/RoleController.php` - Role CRUD
- `app/Modules/Auth/Http/Controllers/GroupPermissionController.php` - Group management
- `app/Modules/Auth/Http/Controllers/AccessAuditController.php` - Audit viewing
- `app/Modules/Auth/Http/Controllers/TemporaryAccessController.php` - Temp access management
- `database/migrations/2026_05_08_000001_create_rbac_audit_tables.php` - RBAC tables
- `database/seeders/RBACSeeder.php` - Default roles and permissions
- `app/Jobs/RevokeExpiredTemporaryAccess.php` - Auto-revocation job

### Frontend
- `src/app/dashboard/admin/users/page.tsx` - User management
- `src/app/dashboard/admin/roles/page.tsx` - Role & group management
- `src/app/dashboard/admin/permissions/page.tsx` - Permission management
- `src/app/dashboard/admin/locations/page.tsx` - Location management
- `src/components/shared/PermissionGuard.tsx` - Conditional rendering
- `src/hooks/usePermission.ts` - Permission hook

### Documentation
- `RBAC_README.md` - This file
- `RBAC_ARCHITECTURE.md` - System design and data model
- `RBAC_API_DOCUMENTATION.md` - API reference
- `RBAC_IMPLEMENTATION_GUIDE.md` - Integration guide

## 🎯 Next Steps

1. **Review Architecture**: Read `RBAC_ARCHITECTURE.md`
2. **Understand API**: Check `RBAC_API_DOCUMENTATION.md`
3. **Integrate Modules**: Follow `RBAC_IMPLEMENTATION_GUIDE.md`
4. **Create Groups**: Use admin dashboard at `/dashboard/admin`
5. **Assign Users**: Add users to appropriate groups
6. **Test Access**: Verify with test credentials
7. **Monitor Audit**: Review changes in audit logs
8. **Ongoing**: Review permissions monthly

---

**Version:** 1.0  
**Released:** 2026-05-08  
**Status:** Production Ready

---

*Built with Laravel, Next.js, and PostgreSQL for enterprise security and scalability.*
