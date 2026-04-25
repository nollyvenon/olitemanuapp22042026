<?php

namespace App\Modules\Auth\Services;

use App\Models\Group;
use Illuminate\Support\Collection;

class GroupService {
    private array $visited = [];

    public function resolveInheritedGroups(array $directGroupIds): array {
        $this->visited = [];
        $allGroupIds = [];

        foreach ($directGroupIds as $groupId) {
            $allGroupIds = array_merge($allGroupIds, $this->traverse($groupId));
        }

        return array_unique($allGroupIds);
    }

    private function traverse(string $groupId): array {
        if (in_array($groupId, $this->visited)) {
            return [];
        }

        $this->visited[] = $groupId;
        $groupIds = [$groupId];

        $parentIds = Group::find($groupId)
            ?->parentGroups()
            ->pluck('group_inheritance.parent_group_id')
            ->toArray() ?? [];

        foreach ($parentIds as $parentId) {
            $groupIds = array_merge($groupIds, $this->traverse($parentId));
        }

        return $groupIds;
    }

    public function getEffectivePermissions(array $groupIds): array {
        if (empty($groupIds)) {
            return [];
        }

        $groups = Group::whereIn('id', $groupIds)
            ->with('permissions', 'roles.permissions')
            ->get();

        $permissionNames = [];

        // Get permissions directly from groups
        foreach ($groups as $group) {
            foreach ($group->permissions as $permission) {
                $permissionNames[] = $permission->name;
            }
            // Get permissions from roles assigned to the group
            foreach ($group->roles as $role) {
                foreach ($role->permissions as $permission) {
                    $permissionNames[] = $permission->name;
                }
            }
        }

        return array_unique($permissionNames);
    }
}
