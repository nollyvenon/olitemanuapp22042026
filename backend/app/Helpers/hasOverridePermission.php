<?php

namespace App\Helpers;

/**
 * @param object $authUser JWT payload stdClass — permissions as string[]
 */
function hasOverridePermission(object $authUser, string $permission): bool {
    $p = $authUser->permissions ?? [];
    $perms = is_array($p) ? $p : [];
    return in_array($permission, $perms, true)
        || in_array('accounts.override.backdate', $perms, true)
        || in_array('override.adjustment', $perms, true)
        || in_array('admin.*', $perms, true);
}
