<?php

namespace App\Modules\Auth\Services;

use App\Models\User;

class RBACService
{
    public function getUserPermissions(User $user): array
    {
        return $user->getAllPermissions();
    }

    public function hasPermission(User $user, string $perm): bool
    {
        $perms = $this->getUserPermissions($user);
        return in_array($perm, $perms) || $this->matchesWildcard($perm, $perms);
    }

    public function canAccessModule(User $user, string $module): bool
    {
        $permission = $module . '.view';
        return $this->hasPermission($user, $permission) || $this->hasPermission($user, '*');
    }

    private function matchesWildcard($required, $available): bool
    {
        foreach ($available as $perm) {
            if (str_ends_with($perm, '.*')) {
                $prefix = substr($perm, 0, -2);
                if (strpos($required, $prefix) === 0) {
                    return true;
                }
            }
        }
        return false;
    }
}
