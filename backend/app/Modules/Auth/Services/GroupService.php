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

        $permissions = Group::whereIn('id', $groupIds)
            ->with('permissions')
            ->get()
            ->pluck('permissions.*.name')
            ->flatten()
            ->unique()
            ->values()
            ->toArray();

        return $permissions;
    }
}
