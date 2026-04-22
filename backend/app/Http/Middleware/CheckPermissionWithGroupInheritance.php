<?php

namespace App\Http\Middleware;

use App\Services\Audit\AuditService;
use Closure;
use Illuminate\Http\Request;

class CheckPermissionWithGroupInheritance
{
    public function handle(Request $request, Closure $next, string $permission)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $userPermissions = $this->resolveUserPermissions($user);
        $hasPermission = in_array($permission, $userPermissions) || $this->matchesWildcard($permission, $userPermissions);

        // Log permission check
        AuditService::logPermissionCheck($user, $permission, $hasPermission, $request->ip());

        if (!$hasPermission) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }

    private function resolveUserPermissions($user): array
    {
        $permissions = [];

        // Direct roles
        foreach ($user->roles as $role) {
            $permissions = array_merge($permissions, $role->permissions->pluck('slug')->toArray());
        }

        // Group-based permissions with hierarchy
        foreach ($user->groups as $group) {
            $permissions = array_merge($permissions, $this->getGroupPermissionsRecursive($group));
        }

        return array_unique($permissions);
    }

    private function getGroupPermissionsRecursive($group): array
    {
        $permissions = [];

        foreach ($group->roles as $role) {
            $permissions = array_merge($permissions, $role->permissions->pluck('slug')->toArray());
        }

        if ($group->parent_id) {
            $parent = \App\Models\Group::find($group->parent_id);
            $permissions = array_merge($permissions, $this->getGroupPermissionsRecursive($parent));
        }

        return $permissions;
    }

    private function matchesWildcard(string $required, array $permissions): bool
    {
        foreach ($permissions as $perm) {
            if (str_ends_with($perm, '.*')) {
                if (str_starts_with($required, substr($perm, 0, -2))) {
                    return true;
                }
            }
        }
        return false;
    }
}
