# RBAC Implementation Guide

## Quick Start: Adding RBAC to a New Controller

### Step 1: Inject RBACService and Import Models

```php
<?php
namespace App\Modules\YourModule\Http\Controllers;

use App\Models\User;
use App\Modules\Auth\Services\RBACService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class YourController {
    public function __construct(private RBACService $rbac) {}
```

### Step 2: Add Module Access Check

```php
public function index(Request $request): JsonResponse {
    $user = User::find($request->authUser->sub ?? null);
    if ($user && !$this->rbac->canAccessModule($user, 'your_module')) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    // ... rest of method
}
```

### Step 3: Add Action-Level Permission Checks

```php
public function store(Request $request): JsonResponse {
    $user = User::find($request->authUser->sub);
    if (!$this->rbac->hasPermission($user, 'your_module.create')) {
        return response()->json(['error' => 'Permission denied: your_module.create'], 403);
    }
    // ... rest of method
}

public function approve(Request $request, string $id): JsonResponse {
    $user = User::find($request->authUser->sub);
    if (!$this->rbac->hasPermission($user, 'your_module.approve')) {
        return response()->json(['error' => 'Permission denied: your_module.approve'], 403);
    }
    // ... rest of method
}
```

---

## RBACService API Reference

### Check Module Access

```php
$user = User::find($userId);

// Check if user can access a module
if ($this->rbac->canAccessModule($user, 'sales')) {
    // User has access to sales module
}
```

**Parameters:**
- `$user` (User): User model instance
- `$module` (string): Module name (sales, inventory, accounts, etc.)

**Returns:** `bool`

---

### Check Permission

```php
// Check specific permission
if ($this->rbac->hasPermission($user, 'sales.create')) {
    // User can create sales orders
}

// Check wildcard permission (admin.* matches any admin action)
if ($this->rbac->hasPermission($user, 'admin.*')) {
    // User has all admin permissions
}
```

**Parameters:**
- `$user` (User): User model instance
- `$permission` (string): Permission name in format `module.action`

**Returns:** `bool`

---

### Check Location Access

```php
// Check if user can access a specific location
if ($this->rbac->canAccessLocation($user, $locationId)) {
    // User can access this location
}

// Get user's allowed locations
$locations = $this->rbac->getUserLocations($user);
```

**Parameters:**
- `$user` (User): User model instance
- `$locationId` (string): Location UUID

**Returns:** `bool` or `Collection`

---

### Get Effective Permissions

```php
// Get all permissions for a user (merged from groups/roles)
$permissions = $this->rbac->getUserEffectivePermissions($user);
// Returns: ['sales.create', 'sales.submit', 'inventory.view', ...]
```

**Returns:** `array` of permission strings

---

### Assign User to Group

```php
$this->rbac->assignUserToGroup($user, $groupId, $request->authUser->sub);
// Logs audit entry automatically
```

**Parameters:**
- `$user` (User): User model instance
- `$groupId` (string): Group UUID
- `$assignedBy` (string): User ID of admin assigning access

---

### Revoke User from Group

```php
$this->rbac->removeUserFromGroup($user, $groupId, $request->authUser->sub);
// Logs audit entry automatically
```

---

## Frontend: Permission-Based UI

### PermissionGuard Component

```tsx
import { PermissionGuard } from '@/components/shared/PermissionGuard';

export default function SalesPage() {
  return (
    <div>
      <h1>Sales Orders</h1>
      
      {/* Only show create button if user has permission */}
      <PermissionGuard permission="sales.create">
        <Button onClick={handleCreate}>+ Create Order</Button>
      </PermissionGuard>

      {/* Only show approve button for admins */}
      <PermissionGuard permission="admin.*">
        <Button onClick={handleApprove}>Approve</Button>
      </PermissionGuard>
    </div>
  );
}
```

**Props:**
- `permission` (string): Required permission (supports wildcards)
- `fallback` (ReactNode): Component to show if not authorized (optional)
- `children` (ReactNode): Content to show if authorized

---

### usePermission Hook

```tsx
import { usePermission } from '@/hooks/usePermission';

export default function OrderActions() {
  const { hasPermission, can } = usePermission();

  return (
    <div>
      {hasPermission('sales.create') && <Button>Create</Button>}
      {can('sales.approve') && <Button>Approve</Button>}
    </div>
  );
}
```

---

## Database: RBAC Tables Overview

### users
Primary user table with `role` field.

```sql
SELECT * FROM users WHERE role = 'admin';
```

### groups
Organizational groups (teams, departments).

```sql
SELECT * FROM groups WHERE is_active = true;
```

### roles
System roles that define responsibilities.

```sql
SELECT * FROM roles;
```

### permissions
Atomic action permissions.

```sql
SELECT * FROM permissions WHERE module = 'sales';
```

### user_groups
Junction table: users → groups.

```sql
SELECT u.name, g.name FROM users u
JOIN user_groups ug ON ug.user_id = u.id
JOIN groups g ON g.id = ug.group_id;
```

### user_roles
Junction table: users → roles.

```sql
SELECT u.name, r.name FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id;
```

### role_permissions
Junction table: roles → permissions.

```sql
SELECT r.name, p.name FROM roles r
JOIN role_permissions rp ON rp.role_id = r.id
JOIN permissions p ON p.id = rp.permission_id;
```

### group_permissions
Junction table: groups → permissions.

```sql
SELECT g.name, p.name FROM groups g
JOIN group_permissions gp ON gp.group_id = g.id
JOIN permissions p ON p.id = gp.permission_id;
```

### location_access
Junction table: users/groups → locations.

```sql
-- User locations
SELECT u.name, l.name FROM users u
JOIN location_access la ON la.user_id = u.id
JOIN locations l ON l.id = la.location_id;

-- Group locations
SELECT g.name, l.name FROM groups g
JOIN location_access la ON la.group_id = g.id
JOIN locations l ON l.id = la.location_id;
```

### temporary_access
Time-limited access grants.

```sql
SELECT user_id, group_id, expires_at FROM temporary_access
WHERE is_active = true AND expires_at > NOW();
```

### access_audit
Audit log for all RBAC changes.

```sql
SELECT * FROM access_audit ORDER BY created_at DESC LIMIT 100;
```

---

## Workflow Authority & Approval Rights

### Checking Approval Authority

```php
use App\Modules\Auth\Services\WorkflowAuthorityService;

public function __construct(private WorkflowAuthorityService $workflow) {}

public function approveOrder(Request $request, string $orderId): JsonResponse {
    $user = User::find($request->authUser->sub);
    $order = Order::find($orderId);

    // Check if user has right to approve this order
    $canApprove = $this->workflow->canApprove(
        $user,
        'sales.approve',
        ['order_value' => $order->total, 'order_status' => $order->status]
    );

    if (!$canApprove) {
        return response()->json(['error' => 'Not authorized to approve'], 403);
    }

    // ... approve logic
}
```

---

## Separation of Duties Enforcement

### Example: Prevent Self-Approval

```php
use App\Modules\Auth\Services\WorkflowAuthorityService;

public function approveVoucher(Request $request, string $voucherId): JsonResponse {
    $voucher = Voucher::find($voucherId);
    $user = User::find($request->authUser->sub);

    // Prevent user from approving their own voucher
    if ($this->workflow->violatesSeparationOfDuties(
        $user,
        ['action' => 'approve', 'created_by' => $voucher->created_by_id]
    )) {
        return response()->json([
            'error' => 'Cannot approve: Separation of duties violation'
        ], 403);
    }

    // ... approval logic
}
```

---

## Temporary Access for Coverage

### Grant Temporary Access

```php
use App\Modules\Auth\Services\TemporaryAccessService;

public function grantTemporaryAccess(Request $request): JsonResponse {
    $data = $request->validate([
        'user_id' => 'required|uuid',
        'group_id' => 'required|uuid',
        'expires_at' => 'required|date|after:now',
        'reason' => 'nullable|string',
    ]);

    $tempAccess = app(TemporaryAccessService::class)->grant(
        $data['user_id'],
        $data['group_id'],
        $data['expires_at'],
        $request->authUser->sub
    );

    return response()->json($tempAccess, 201);
}
```

---

## Audit Logging

### Log Permission Changes

All permission changes are automatically logged via:

```php
// Automatically logged when using RBAC methods:
$this->rbac->assignUserToGroup($user, $groupId, $adminId);
$this->rbac->removeUserFromGroup($user, $groupId, $adminId);
// ... etc
```

### View Audit Logs

```php
use App\Models\AccessAudit;

// Get recent changes
$audits = AccessAudit::orderBy('created_at', 'desc')->limit(100)->get();

// Filter by user
$audits = AccessAudit::where('user_id', $userId)->get();

// Filter by action type
$audits = AccessAudit::where('action_type', 'assign_permission')->get();
```

---

## Query Scoping by Location

### Automatic Location Filtering

The system automatically filters queries by user's allowed locations:

```php
// This is ALWAYS filtered to user's locations
$orders = Order::where('customer_id', $customerId)->get();
// Users can only see orders from their assigned locations
```

This happens through:
1. Query Builder middleware
2. Model `boot()` method
3. Authorization middleware

---

## Permission Matrix Reporting

### Generate Permission Matrix

```php
use App\Modules\Auth\Services\RBACService;

$rbac = app(RBACService::class);
$matrix = $rbac->getPermissionMatrix();

// Returns structure:
// {
//   headers: ['user_name', 'sales.create', 'sales.approve', ...],
//   rows: [
//     { user_id, user_name, permissions: { 'sales.create': true, ... } },
//     ...
//   ]
// }
```

---

## Error Handling

### Permission Denied

```php
// Always return 403 for unauthorized access
if (!$this->rbac->hasPermission($user, 'required.permission')) {
    return response()->json([
        'error' => 'Permission denied',
        'required_permission' => 'required.permission'
    ], 403);
}
```

### Module Not Accessible

```php
// Return 403 for module access denied
if (!$this->rbac->canAccessModule($user, 'sales')) {
    return response()->json([
        'error' => 'Module access denied',
        'module' => 'sales'
    ], 403);
}
```

### Location Restriction

```php
// Return 403 for location access denied
if (!$this->rbac->canAccessLocation($user, $locationId)) {
    return response()->json([
        'error' => 'Location access denied',
        'location_id' => $locationId
    ], 403);
}
```

---

## Testing

### Mock Permissions in Tests

```php
use Tests\TestCase;

class OrderTest extends TestCase {
    public function test_user_cannot_create_without_permission() {
        $user = User::factory()->create();
        // User has no permissions by default

        $response = $this->actingAs($user)
            ->postJson('/api/v1/orders', [
                'customer_id' => 'uuid',
                'items' => [],
            ]);

        $response->assertStatus(403);
    }

    public function test_user_can_create_with_permission() {
        $user = User::factory()->create();
        $group = Group::factory()->create();
        $permission = Permission::firstOrCreate([
            'module' => 'sales',
            'name' => 'sales.create'
        ]);

        // Add user to group
        $user->groups()->attach($group);
        // Grant permission to group
        $group->permissions()->attach($permission);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/orders', [
                'customer_id' => 'uuid',
                'items' => [],
            ]);

        $response->assertStatus(201);
    }
}
```

---

## Performance Optimization

### Caching User Permissions

Permissions are cached in-memory during request lifecycle. For heavy permission checks:

```php
// Good - checks cached permissions
if ($this->rbac->hasPermission($user, 'sales.create')) { ... }
if ($this->rbac->hasPermission($user, 'sales.approve')) { ... }

// Also good - batch get
$permissions = $this->rbac->getUserEffectivePermissions($user);
if (in_array('sales.create', $permissions)) { ... }
```

### Eager Loading

```php
// Load user with groups/permissions to avoid N+1 queries
$user = User::with(['groups.permissions', 'roles.permissions'])->find($userId);
```

---

## Troubleshooting Checklist

- [ ] User is in a group
- [ ] Group has required permission
- [ ] Permission follows `module.action` naming
- [ ] User's assigned locations include data location
- [ ] JWT token is not expired
- [ ] Authorization header format: `Bearer <token>`
- [ ] Check audit log for permission changes
- [ ] Verify group is active (`is_active = true`)
- [ ] Check for separation of duties violations
- [ ] Verify no temporary access revoked recently

---

## Common Integration Patterns

### Pattern 1: View + Create

```php
public function index(Request $request): JsonResponse {
    $user = User::find($request->authUser->sub);
    if (!$this->rbac->canAccessModule($user, 'sales')) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    // ... list items
}

public function store(Request $request): JsonResponse {
    $user = User::find($request->authUser->sub);
    if (!$this->rbac->hasPermission($user, 'sales.create')) {
        return response()->json(['error' => 'Permission denied: sales.create'], 403);
    }
    // ... create item
}
```

### Pattern 2: View + Edit + Delete

```php
public function show(Request $request, string $id): JsonResponse {
    $user = User::find($request->authUser->sub);
    if (!$this->rbac->canAccessModule($user, 'inventory')) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    // ... show item
}

public function update(Request $request, string $id): JsonResponse {
    $user = User::find($request->authUser->sub);
    if (!$this->rbac->hasPermission($user, 'inventory.edit')) {
        return response()->json(['error' => 'Permission denied'], 403);
    }
    // ... update item
}

public function destroy(Request $request, string $id): JsonResponse {
    $user = User::find($request->authUser->sub);
    if (!$this->rbac->hasPermission($user, 'inventory.delete')) {
        return response()->json(['error' => 'Permission denied'], 403);
    }
    // ... delete item
}
```

### Pattern 3: Workflow with Approvals

```php
public function submit(Request $request, string $id): JsonResponse {
    if (!$this->rbac->hasPermission($user, 'orders.submit')) {
        return response()->json(['error' => 'Permission denied'], 403);
    }
    // ... submit order
}

public function approve(Request $request, string $id): JsonResponse {
    if (!$this->rbac->hasPermission($user, 'orders.approve')) {
        return response()->json(['error' => 'Permission denied'], 403);
    }
    // ... approve order
}

public function reject(Request $request, string $id): JsonResponse {
    if (!$this->rbac->hasPermission($user, 'orders.reject')) {
        return response()->json(['error' => 'Permission denied'], 403);
    }
    // ... reject order
}
```

---

## Next Steps

1. Review RBAC_API_DOCUMENTATION.md for full endpoint reference
2. Integrate RBAC into remaining controllers
3. Create appropriate groups and assign users
4. Set up permission auditing and monitoring
5. Train team on RBAC admin UI

---

## Support

For questions or issues: security@example.com
