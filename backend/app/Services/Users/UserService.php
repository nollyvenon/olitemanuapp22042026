<?php

namespace App\Services\Users;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function list(array $filters = []): Paginator
    {
        $query = User::whereNull('deleted_at');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%$search%")
                  ->orWhere('username', 'like', "%$search%")
                  ->orWhere('first_name', 'like', "%$search%")
                  ->orWhere('last_name', 'like', "%$search%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (!empty($filters['role_id'])) {
            $query->whereHas('roles', function ($q) {
                $q->where('role_id', $filters['role_id']);
            });
        }

        if (!empty($filters['group_id'])) {
            $query->whereHas('groups', function ($q) {
                $q->where('group_id', $filters['group_id']);
            });
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        $page = $filters['page'] ?? 1;
        $limit = $filters['limit'] ?? 20;

        return $query->paginate($limit, ['*'], 'page', $page);
    }

    public function getById(string $id): ?User
    {
        return User::whereNull('deleted_at')->find($id);
    }

    public function create(array $data): User
    {
        $user = User::create([
            'email' => $data['email'],
            'username' => $data['username'],
            'password_hash' => Hash::make($data['password']),
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'phone_number' => $data['phone_number'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        if (!empty($data['role_ids'])) {
            $user->roles()->sync($data['role_ids']);
        }

        if (!empty($data['group_ids'])) {
            $user->groups()->sync($data['group_ids']);
        }

        return $user;
    }

    public function update(User $user, array $data): User
    {
        $user->update([
            'first_name' => $data['first_name'] ?? $user->first_name,
            'last_name' => $data['last_name'] ?? $user->last_name,
            'phone_number' => $data['phone_number'] ?? $user->phone_number,
            'avatar_url' => $data['avatar_url'] ?? $user->avatar_url,
            'is_active' => $data['is_active'] ?? $user->is_active,
        ]);

        if (isset($data['role_ids'])) {
            $user->roles()->sync($data['role_ids']);
        }

        if (isset($data['group_ids'])) {
            $user->groups()->sync($data['group_ids']);
        }

        return $user;
    }

    public function delete(User $user): bool
    {
        return $user->delete();
    }

    public function assignRoles(User $user, array $roleIds): void
    {
        $user->roles()->sync($roleIds);
    }

    public function assignGroups(User $user, array $groupIds): void
    {
        $user->groups()->sync($groupIds);
    }
}
