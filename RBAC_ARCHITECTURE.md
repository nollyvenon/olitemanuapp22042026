# RBAC System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                      │
│  ┌────────────────┬──────────────────┬──────────────┬──────────┐
│  │ PermissionGuard│ usePermission    │ Admin Pages  │ API Call │
│  │ Components     │ Hook             │ (Locations,  │ with JWT │
│  │                │                  │  Roles, etc) │          │
│  └────────────────┴──────────────────┴──────────────┴──────────┘
│                                │
└────────────────────────────────┼──────────────────────────────────
                                 │ HTTP/JWT
┌────────────────────────────────┼──────────────────────────────────
│                                ▼                                  │
│                  ┌──────────────────────────┐                    │
│                  │  API Routes (/api/v1)    │                    │
│                  │  ┌─────────────────────┐ │                    │
│                  │  │ Auth Middleware     │ │                    │
│                  │  │ (JWT Validation)    │ │                    │
│                  │  └─────────────────────┘ │                    │
│                  └──────────────────────────┘                    │
│                                │                                  │
│                  ┌─────────────▼──────────────┐                  │
│                  │   Controller Layer         │                  │
│                  │  ┌──────────────────────┐  │                  │
│                  │  │ RBACService Check    │  │                  │
│                  │  │ - Module Access      │  │                  │
│                  │  │ - Permission Check   │  │                  │
│                  │  │ - Location Access    │  │                  │
│                  │  └──────────────────────┘  │                  │
│                  └─────────────┬───────────────┘                  │
│                                │                                  │
│                  ┌─────────────▼──────────────┐                  │
│                  │  RBACService              │                  │
│                  │  (Permission Resolver)    │                  │
│                  │                          │                  │
│                  │ getUserEffectivePermissions():               │
│                  │ - Merge group permissions                   │
│                  │ - Merge role permissions                    │
│                  │ - Resolve inheritance chain                 │
│                  │ - Apply location filter                     │
│                  │ - Return effective perms                    │
│                  │                          │                  │
│                  │ hasPermission()           │                  │
│                  │ canAccessModule()         │                  │
│                  │ canAccessLocation()       │                  │
│                  └─────────────┬───────────────┘                  │
│                                │                                  │
│              ┌─────────────────┼─────────────────┐                │
│              │                 │                 │                │
│     ┌────────▼────────┐  ┌────▼─────────┐ ┌────▼──────────┐    │
│     │ Database Layer  │  │ Related      │ │ Cache Layer  │    │
│     │                 │  │ Services     │ │              │    │
│     │ ┌─────────────┐ │  │              │ │ In-Memory    │    │
│     │ │ users       │ │  │ WorkflowAuth │ │ Permission   │    │
│     │ │ groups      │ │  │ Service      │ │ Cache        │    │
│     │ │ roles       │ │  │              │ │              │    │
│     │ │ permissions │ │  │ TempAccess   │ │ Location     │    │
│     │ │             │ │  │ Service      │ │ Cache        │    │
│     │ │ user_groups │ │  │              │ │              │    │
│     │ │ user_roles  │ │  │ AuditService │ │ Role/Group   │    │
│     │ │ group_perms │ │  │              │ │ Permission   │    │
│     │ │ role_perms  │ │  │              │ │ Cache        │    │
│     │ │ locations   │ │  │              │ │              │    │
│     │ │ location_acc│ │  │              │ │              │    │
│     │ │ temporary_ac│ │  │              │ │              │    │
│     │ │ access_audit│ │  │              │ │              │    │
│     │ └─────────────┘ │  │              │ │              │    │
│     └─────────────────┘  └──────────────┘ └──────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Permission Resolution Flow

```
User Makes API Request
        │
        ▼
Extract JWT Token
        │
        ▼
RBACAuthorizationMiddleware
        │
        ├─ Validate JWT
        │
        ├─ Extract user_id from payload
        │
        └─ Load User from Database
                │
                ▼
        Controller Method
                │
                ├─ Check: canAccessModule()
                │         ├─ Get user's groups
                │         ├─ Get user's roles
                │         ├─ Check group module access
                │         ├─ Check role module access
                │         └─ Return bool
                │
                ├─ Check: hasPermission('module.action')
                │         ├─ Get effective permissions via:
                │         │  ├─ resolveInheritedGroups()
                │         │  ├─ getUserRoles()
                │         │  ├─ Merge all permissions
                │         │  └─ Apply wildcard matching
                │         └─ Return bool
                │
                ├─ Check: canAccessLocation()
                │         ├─ Get user's assigned locations
                │         ├─ Get group locations
                │         ├─ Intersect with resource location
                │         └─ Return bool
                │
                ├─ Check: Workflow Authority (optional)
                │         ├─ Check approval matrix
                │         ├─ Check separation of duties
                │         └─ Validate approval chain
                │
                ▼
        Authorization Passed
                │
                ├─ Proceed with business logic
                ├─ Execute operation
                ├─ Audit log the change
                │
                ▼
        Return Response
```

---

## Data Model Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                          PERMISSIONS                            │
│  (Atomic actions: sales.create, sales.approve, inventory.view)  │
└─────────────────────────────────────────────────────────────────┘
           ▲                           ▲
           │ can be assigned to        │ can be assigned to
           │ multiple roles            │ multiple groups
           │                           │
┌──────────┴───────────┐  ┌──────────┴──────────────┐
│  ROLES               │  │  GROUPS                 │
│  (Responsibilities) │  │  (Organizational Units) │
│                     │  │                        │
│ - Sales Officer     │  │ - Sales Team           │
│ - Inventory Manager │  │ - Finance Department   │
│ - Super Admin       │  │ - Warehouse Staff      │
│                     │  │ - Regional Managers    │
└──────────┬──────────┘  └──────────┬──────────────┘
           │                        │
           │ assigned to            │ members are
           │ users                  │ users
           │                        │
           └────────────┬───────────┘
                        │
            ┌───────────▼────────────┐
            │  USERS                 │
            │  (System Actors)       │
            │                        │
            │ user.name              │
            │ user.email             │
            │ user.is_active         │
            │ user.role (default)    │
            │                        │
            │ EFFECTIVE PERMISSIONS: │
            │ = Merge of:            │
            │   - All group perms    │
            │   - All role perms     │
            │   - Inherited group    │
            │     permissions        │
            └────────────┬───────────┘
                        │
            ┌───────────▼────────────┐
            │  LOCATIONS             │
            │  (Access Scoping)      │
            │                        │
            │ User can only access   │
            │ data from assigned     │
            │ locations              │
            └────────────────────────┘
```

---

## Core RBAC Services

### 1. RBACService (Permission Resolver)

**Location:** `app/Modules/Auth/Services/RBACService.php`

**Responsibilities:**
- Resolve user's effective permissions
- Check module access
- Check permission validity
- Check location access
- Assign/revoke group membership
- Manage user-location mapping
- Audit all permission changes

**Key Methods:**
- `getUserEffectivePermissions($user)` - Returns all permissions
- `hasPermission($user, $permission)` - Boolean check
- `canAccessModule($user, $module)` - Module-level access
- `canAccessLocation($user, $locationId)` - Location-level access
- `assignUserToGroup($user, $groupId, $by)` - Add to group + audit
- `removeUserFromGroup($user, $groupId, $by)` - Remove from group + audit

---

### 2. WorkflowAuthorityService

**Location:** `app/Modules/Auth/Services/WorkflowAuthorityService.php`

**Responsibilities:**
- Define approval matrices
- Check if user can approve specific actions
- Enforce separation of duties
- Validate approval chains
- Prevent self-approval

**Key Methods:**
- `canApprove($user, $permission, $context)` - Check approval authority
- `violatesSeparationOfDuties($user, $action)` - Detect conflicts
- `validateApprovalChain($order)` - Ensure approval workflow

**Configuration Example:**
```php
'approvalMatrix' => [
    'sales.approve' => [
        'role' => 'Sales Admin',
        'minAmount' => 50000,
    ],
],
'separationOfDuties' => [
    'orders' => ['create', 'approve'], // Can't both create and approve
]
```

---

### 3. TemporaryAccessService

**Location:** `app/Modules/Auth/Services/TemporaryAccessService.php`

**Responsibilities:**
- Grant temporary access to groups/roles
- Track access expiration
- Auto-revoke expired access
- Log all temporary assignments

**Key Methods:**
- `grant($userId, $groupId, $expiresAt, $by)` - Grant temp access
- `revoke($tempAccessId, $by)` - Revoke immediately
- `checkIsActive($userId, $groupId)` - Check if temp access valid
- `getTemporaryPermissions($user)` - Get active temp permissions

**Auto-Revocation:**
- Scheduled job: `RevokeExpiredTemporaryAccess`
- Runs hourly via Laravel Scheduler
- Marks `is_active = false` and sets `revoked_at`

---

### 4. AuditService (Audit Logging)

**Location:** `app/Modules/Audit/Services/AuditService.php`

**Responsibilities:**
- Log all RBAC changes
- Track before/after snapshots
- Record user who made change
- Store audit trail

**Logged Actions:**
- User assigned to group
- User removed from group
- Permission granted to role
- Permission removed from role
- Group permission changed
- Location access modified
- Temporary access granted/revoked

---

### 5. GroupService (Group Inheritance)

**Location:** `app/Modules/Auth/Services/GroupService.php`

**Responsibilities:**
- Resolve group inheritance chains
- Get all inherited permissions
- Support parent-child group relationships
- Traverse inheritance hierarchy

**Key Methods:**
- `resolveInheritedGroups($group)` - Get all parent groups
- `getInheritedPermissions($group)` - Get permissions from chain
- `buildInheritanceTree($group)` - Show group hierarchy

---

## Module Integration Pattern

### All Controllers Follow This Pattern:

```php
class SomeController {
    public function __construct(private RBACService $rbac) {}

    // Check module access at entry point
    public function index(Request $request): JsonResponse {
        $user = User::find($request->authUser->sub ?? null);
        if ($user && !$this->rbac->canAccessModule($user, 'module_name')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        // ...
    }

    // Check action permission before state changes
    public function store(Request $request): JsonResponse {
        $user = User::find($request->authUser->sub);
        if (!$this->rbac->hasPermission($user, 'module_name.create')) {
            return response()->json(['error' => 'Permission denied'], 403);
        }
        // ...
    }

    public function approve(Request $request, string $id): JsonResponse {
        $user = User::find($request->authUser->sub);
        if (!$this->rbac->hasPermission($user, 'module_name.approve')) {
            return response()->json(['error' => 'Permission denied'], 403);
        }
        // ...
    }
}
```

---

## Location Scoping

### How Location Access Works:

1. **User Locations Assignment**
   - Admin assigns locations to users
   - Admin assigns locations to groups
   - User inherits group locations

2. **Query Scoping**
   - All queries filtered by user's locations
   - Returns `401 Forbidden` for cross-location access
   - Happens at API layer and query layer

3. **Data Isolation**
   - User A in Lagos cannot see Abuja data
   - Even with `sales.view` permission
   - Location is mandatory filter

---

## Permission Naming Convention

```
module.action

Module:  sales | inventory | accounts | reports | audit | kyc | market | dashboard | admin
Action:  view | create | edit | delete | approve | override | export | import

Examples:
- sales.create        → Can create orders
- sales.approve       → Can approve orders
- inventory.transfer  → Can transfer inventory
- accounts.override   → Can override accounting rules
- reports.export      → Can export reports
- admin.*             → All admin permissions
```

---

## Default Roles & Permissions

### System Roles Created on Seed:

1. **GOD_MODE_ADMIN**
   - All permissions (*)
   - No location restrictions
   - Can bypass all controls

2. **SUPER_ADMIN**
   - All business permissions
   - Cannot modify system settings
   - Can approve workflows

3. **SALES_ADMIN**
   - sales.* (all sales actions)
   - Can approve orders
   - Can override sales rules

4. **SALES_OFFICER**
   - sales.create, sales.submit
   - Cannot approve own orders
   - Location-scoped

5. **INVENTORY_MANAGER**
   - inventory.* (all inventory)
   - Can transfer stock
   - Can adjust inventory

6. **ACCOUNTS_MANAGER**
   - accounts.* (all accounting)
   - Can create/approve vouchers
   - Financial reporting

7. **AUDITOR**
   - audit.view
   - Read-only access
   - Cannot modify data

---

## Scheduled Jobs

### RevokeExpiredTemporaryAccess

**Trigger:** Every hour (configurable)

**Action:**
1. Find all temporary_access with `expires_at < NOW()` and `is_active = true`
2. Set `is_active = false`
3. Set `revoked_at = NOW()`
4. Log via AuditService

**Configuration:** `config/scheduler.php` or `Kernel.php`

---

## Frontend Architecture

### Components:

1. **PermissionGuard**
   - Hides UI based on permission
   - Optional fallback UI
   - Supports wildcards

2. **usePermission Hook**
   - Query permission at runtime
   - `hasPermission()`, `can()` methods
   - Uses frontend auth context

3. **Admin Pages**
   - `/dashboard/admin/users`
   - `/dashboard/admin/roles`
   - `/dashboard/admin/groups`
   - `/dashboard/admin/permissions`
   - `/dashboard/admin/locations`

### API Integration:

```tsx
// Fetch permissions for display
const { data: permissions } = await api.get('/permissions');

// Assign group permissions
await api.post(`/groups/${groupId}/permissions`, { permission_ids });

// Manage user locations
await api.post(`/users/${userId}/locations`, { location_ids });
```

---

## Audit Trail Example

```
2026-05-08 10:30:00 | admin@example.com  | ASSIGN_PERMISSION | 
  role_id: "sales-admin-uuid" | permission_id: "sales.approve" | 
  by: admin_id

2026-05-08 10:31:15 | admin@example.com  | ASSIGN_USER_GROUP | 
  user_id: "john-uuid" | group_id: "sales-team-uuid" | 
  by: admin_id

2026-05-08 10:32:30 | admin@example.com  | GRANT_TEMP_ACCESS | 
  user_id: "john-uuid" | group_id: "sales-admin-uuid" | 
  expires_at: "2026-05-15 23:59:59" | by: admin_id

2026-05-15 23:59:59 | SYSTEM             | REVOKE_TEMP_ACCESS | 
  temp_access_id: "uuid" | reason: "expiration"
```

---

## Security Principles

### 1. Deny by Default
- No permission granted unless explicitly assigned
- User must have permission to access anything
- Absence of permission = denial

### 2. Explicit Allow Only
- Cannot "allow all except X"
- Must explicitly grant each permission
- No negative permissions

### 3. Least Privilege
- Users get minimum permissions needed
- Roles are granular
- Review permissions regularly

### 4. Separation of Duties
- Conflicting actions prevented
- Cannot create and approve same transaction
- Enforced at business logic layer

### 5. Immutable Audit Trail
- All changes logged
- Cannot be deleted (only archived)
- Includes before/after snapshots
- Records who made change and when

### 6. Fail Secure
- On permission check failure: deny access
- On database error: deny access
- Errors logged for investigation
- Default is always secure

---

## Performance Considerations

### Caching Strategy:

1. **Request-Level Cache**
   - User permissions cached in memory
   - Fresh load on each request
   - No staleness within request

2. **Database Indexes**
   - `user_id` on user_groups
   - `group_id` on group_permissions
   - `user_id` on location_access
   - `expires_at` on temporary_access

3. **Query Optimization**
   - Eager load relationships
   - Batch permission checks
   - Use wildcard efficiently

### N+1 Prevention:

```php
// Good - eager loaded
$user = User::with(['groups.permissions', 'roles.permissions'])->find($id);

// Avoid - N+1 query
$user = User::find($id);
foreach ($user->groups as $group) {
    $permissions = $group->permissions; // N queries!
}
```

---

## Scaling Considerations

### For Large User Base:

1. **Permission Caching**
   - Cache resolved permissions in Redis
   - Invalidate on permission change
   - TTL: 1 hour

2. **Database Optimization**
   - Use read replicas for permission queries
   - Archive old audit logs
   - Partition audit tables by date

3. **API Rate Limiting**
   - Implement rate limits on admin endpoints
   - Protect permission queries
   - Prevent enumeration attacks

---

## Troubleshooting Guide

### User Can't Access Module

**Checklist:**
1. Is user in a group? → `SELECT * FROM user_groups WHERE user_id = ?`
2. Does group have module access? → Check `groups` table
3. Is group active? → `is_active = true`
4. Correct locations assigned? → Check `location_access`

### Permission Check Fails

**Steps:**
1. Get user's effective permissions: `/users/{id}/permissions`
2. Check audit log for recent changes
3. Verify permission naming: `module.action`
4. Test with admin account (should have all permissions)

### Temporary Access Not Working

**Check:**
1. Is `expires_at` in the future?
2. Is `is_active = true`?
3. Has revocation job run?
4. User still in original group?

---

## Version & Updates

**Current Version:** 1.0 (2026-05-08)

**Key Features:**
- ✅ Role-based permissions
- ✅ Group inheritance
- ✅ Location scoping
- ✅ Temporary access
- ✅ Audit logging
- ✅ Separation of duties
- ✅ Workflow authority

**Planned Features:**
- [ ] Permission inheritance
- [ ] Time-based rules (permissions active only during business hours)
- [ ] Attribute-based access control (ABAC)
- [ ] Dynamic policy engine

---

## References

- **API Docs:** `RBAC_API_DOCUMENTATION.md`
- **Implementation Guide:** `RBAC_IMPLEMENTATION_GUIDE.md`
- **RBACService:** `app/Modules/Auth/Services/RBACService.php`
- **Migrations:** `database/migrations/2026_05_08_*`

---

## Support & Contact

For RBAC architecture questions: `security@example.com`
