<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Support\Facades\Hash;

class AuthService {
    public function __construct(
        private JwtService $jwtService,
        private GroupService $groupService,
        private DeviceService $deviceService,
        private IpGeolocationService $ipGeolocationService,
        private AuditService $auditService
    ) {}

    public function login(array $validated): array {
        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            throw new \Exception('Email not found', 401);
        }

        if (!Hash::check($validated['password'], $user->password_hash)) {
            throw new \Exception('Wrong password', 401);
        }

        if (!$user->is_active) {
            throw new \Exception('Account is inactive', 403);
        }

        if ($user->force_password_reset) {
            throw new \Exception('Password reset required', 403);
        }

        $device = $this->deviceService->resolveDevice(
            $validated['device_fingerprint'] ?? null,
            $validated['user_agent'] ?? null,
            $user
        );

        $location = $this->resolveLocation($validated);

        $payload = $this->buildPayload($user, $device, $location);
        $permissions = $payload['permissions'];

        $accessToken = $this->jwtService->generateAccessToken($payload);
        $refreshToken = $this->jwtService->generateRefreshToken($payload);

        $session = $user->sessions()->create([
            'device_id' => $device->id,
            'access_token_hash' => hash('sha256', $accessToken),
            'refresh_token_hash' => hash('sha256', $refreshToken),
            'ip_address' => request()->ip(),
            'location_lat' => $location['lat'],
            'location_long' => $location['long'],
            'ip_city' => $location['city'] ?? null,
            'ip_country' => $location['country'] ?? null,
            'gps_source' => $validated['gps_source'] ?? 'ip_fallback',
            'expires_at' => now()->addHours(8),
            'is_active' => true,
        ]);

        $this->auditService->log([
            'user_id' => $user->id,
            'action_type' => 'LOGIN',
            'entity_type' => 'auth',
            'entity_id' => $user->id,
            'device_id' => $device->id,
            'ip_address' => request()->ip(),
            'location_lat' => $location['lat'],
            'location_long' => $location['long'],
            'after_snapshot' => ['device_id' => $device->id, 'session_id' => $session->id],
        ]);

        $user->load('groups', 'locations');
        $userArray = $user->toArray();
        $userArray['permissions'] = $permissions;

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'device_id' => $device->id,
            'user' => $userArray,
        ];
    }

    private function resolveLocation(array $validated): array {
        if (($validated['gps_source'] ?? null) === 'gps' && isset($validated['latitude']) && isset($validated['longitude'])) {
            return [
                'lat' => $validated['latitude'],
                'long' => $validated['longitude'],
                'source' => 'gps',
            ];
        }

        return $this->ipGeolocationService->resolve(request()->ip());
    }

    private function buildPayload(User $user, $device, array $location): array {
        $locations = $user->locations()->get(['id', 'name', 'city', 'country', 'lat', 'long'])->toArray();

        // God admin users get all permissions
        if ($user->is_god_admin) {
            $permissions = ['admin.*'];
        } else {
            $groupIds = $user->groups()->pluck('groups.id')->toArray();
            $inheritedGroupIds = $this->groupService->resolveInheritedGroups($groupIds);
            $permissions = $this->groupService->getEffectivePermissions($inheritedGroupIds);
        }

        return [
            'sub' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'device_id' => $device->id,
            'groups' => $user->groups()->pluck('id')->toArray(),
            'permissions' => $permissions,
            'locations' => $locations,
            'iat' => now()->timestamp,
        ];
    }

    public function logout(string $token): void {
        try {
            $decoded = $this->jwtService->decode($token);
            $session = app(\App\Models\Session::class)
                ->where('access_token_hash', hash('sha256', $token))
                ->first();

            if ($session) {
                $session->update(['revoked_at' => now(), 'is_active' => false]);
            }

            $this->auditService->log([
                'user_id' => $decoded->sub,
                'action_type' => 'LOGOUT',
                'entity_type' => 'auth',
                'entity_id' => $decoded->sub,
            ]);
        } catch (\Exception $e) {
            throw new \Exception('Invalid token', 401);
        }
    }

    public function refresh(string $token): array {
        $decoded = $this->jwtService->decode($token);

        if ($decoded->type !== 'refresh') {
            throw new \Exception('Invalid token type', 401);
        }

        $user = User::findOrFail($decoded->sub);

        if (!$user->is_active) {
            throw new \Exception('Account is inactive', 403);
        }

        $device = app(\App\Models\Device::class)->find($decoded->device_id ?? null);

        if (!$device) {
            throw new \Exception('Device not found', 401);
        }

        // Safely extract location from decoded token
        // JWT::decode() returns nested objects as stdClass, so use object notation
        $decodedLocations = $decoded->locations ?? [];
        $firstLocation = is_array($decodedLocations) && count($decodedLocations) > 0 ? $decodedLocations[0] : null;
        $location = [
            'lat' => $firstLocation->lat ?? 0,
            'long' => $firstLocation->long ?? 0,
            'city' => $firstLocation->city ?? null,
            'country' => $firstLocation->country ?? null,
            'source' => 'refresh',
        ];

        $newPayload = $this->buildPayload($user, $device, $location);
        $accessToken = $this->jwtService->generateAccessToken($newPayload);

        return [
            'access_token' => $accessToken,
            'refresh_token' => $token,
            'user' => $user->toArray(),
        ];
    }
}
