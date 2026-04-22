<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\LoginSession;
use App\Models\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthServiceEnhanced
{
    public function __construct(private TokenService $tokenService) {}

    public function authenticate(
        string $email,
        string $password,
        ?string $location,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?array $deviceInfo = null,
    ): array {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password_hash)) {
            throw new \Exception('Invalid credentials');
        }

        if (!$user->is_active) {
            throw new \Exception('Account disabled');
        }

        // Record login session
        $session = LoginSession::create([
            'user_id' => $user->id,
            'ip_address' => $ipAddress,
            'location' => $location,
            'device_info' => $deviceInfo ?? [],
            'device_name' => $deviceInfo['device_name'] ?? null,
            'browser' => $deviceInfo['browser'] ?? null,
            'os' => $deviceInfo['os'] ?? null,
        ]);

        // Update user last login
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $ipAddress,
            'last_login_location' => $location,
            'last_device_info' => $deviceInfo,
        ]);

        $tokens = $this->tokenService->generateTokenPair($user, $ipAddress, $userAgent);

        return [
            'access_token' => $tokens['access_token'],
            'refresh_token' => $tokens['refresh_token'],
            'token_type' => $tokens['token_type'],
            'expires_in' => $tokens['expires_in'],
            'user' => $this->formatUserResponse($user),
        ];
    }

    public function initiatePasswordReset(string $email): array
    {
        $user = User::where('email', $email)->first();
        if (!$user) {
            throw new \Exception('User not found');
        }

        // Invalidate previous reset tokens
        PasswordReset::where('user_id', $user->id)
            ->whereNull('used_at')
            ->delete();

        $token = Str::random(64);
        $reset = PasswordReset::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $token),
            'expires_at' => now()->addHours(1),
        ]);

        return [
            'reset_id' => $reset->id,
            'token' => $token,
            'expires_in' => 3600,
        ];
    }

    public function resetPassword(string $token, string $newPassword): array
    {
        $tokenHash = hash('sha256', $token);
        $reset = PasswordReset::where('token', $tokenHash)
            ->where('expires_at', '>', now())
            ->whereNull('used_at')
            ->first();

        if (!$reset) {
            throw new \Exception('Invalid or expired reset token');
        }

        $user = $reset->user;
        $user->update(['password_hash' => Hash::make($newPassword)]);
        $reset->update(['used_at' => now()]);

        return ['message' => 'Password reset successfully'];
    }

    public function adminResetUserPassword(User $admin, User $targetUser, string $newPassword): void
    {
        if (!$admin->is_sub_admin && !$admin->roles()->where('slug', 'admin')->exists()) {
            throw new \Exception('Insufficient privileges');
        }

        $targetUser->update(['password_hash' => Hash::make($newPassword)]);

        PasswordReset::create([
            'user_id' => $targetUser->id,
            'token' => Str::random(64),
            'expires_at' => now()->addHours(24),
            'reset_by' => $admin->id,
            'used_at' => now(),
        ]);
    }

    public function formatUserResponse(User $user): array
    {
        $groups = $user->groups()->get(['id', 'name', 'slug']);
        $allPermissions = $this->getAllGroupPermissions($groups);

        return [
            'id' => $user->id,
            'email' => $user->email,
            'username' => $user->username,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
            'isSubAdmin' => $user->is_sub_admin,
            'lastLoginLocation' => $user->last_login_location,
            'createdAt' => $user->created_at->toIso8601String(),
            'groups' => $groups->toArray(),
            'permissions' => $allPermissions,
        ];
    }

    private function getAllGroupPermissions($groups): array
    {
        $permissions = [];

        foreach ($groups as $group) {
            $groupPerms = \App\Models\Role::whereHas('groupRoles', function ($q) use ($group) {
                $q->where('group_id', $group->id);
            })->with('permissions')->get()->flatMap(fn($role) => $role->permissions->pluck('slug'))->toArray();

            $permissions = array_merge($permissions, $groupPerms);

            // Walk group hierarchy
            if ($group->parent_id) {
                $parent = \App\Models\Group::find($group->parent_id);
                $permissions = array_merge($permissions, $this->getAllGroupPermissions([$parent]));
            }
        }

        return array_unique($permissions);
    }
}
