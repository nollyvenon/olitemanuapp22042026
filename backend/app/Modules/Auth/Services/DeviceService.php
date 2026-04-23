<?php

namespace App\Modules\Auth\Services;

use App\Models\Device;
use App\Models\User;
use Jenssegers\Agent\Agent;

class DeviceService {
    public function resolveDevice(?string $fingerprint, ?string $userAgent, User $user): Device {
        $agent = new Agent();
        if ($userAgent) {
            $agent->setUserAgent($userAgent);
        }

        if (!$fingerprint) {
            $fingerprint = $this->generateFingerprint($userAgent);
        }

        $device = Device::firstOrCreate(
            ['user_id' => $user->id, 'fingerprint' => $fingerprint],
            [
                'user_agent' => $userAgent,
                'os' => $agent->platform(),
                'browser' => $agent->browser(),
                'first_seen_at' => now(),
            ]
        );

        $device->update(['last_seen_at' => now()]);

        return $device;
    }

    private function generateFingerprint(?string $userAgent): string {
        return hash('sha256', ($userAgent ?? 'unknown') . request()->ip() . now()->toDateString());
    }
}
