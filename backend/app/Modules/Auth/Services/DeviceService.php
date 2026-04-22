<?php

namespace App\Modules\Auth\Services;

use App\Models\Device;
use App\Models\User;
use Jenssegers\Agent\Agent;

class DeviceService {
    public function resolveDevice(string $fingerprint, string $userAgent, User $user): Device {
        $agent = new Agent();
        $agent->setUserAgent($userAgent);

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
}
