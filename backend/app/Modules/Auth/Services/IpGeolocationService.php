<?php

namespace App\Modules\Auth\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class IpGeolocationService {
    public function resolve(string $ip): array {
        $cacheKey = "geolocation:{$ip}";

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = Http::get("https://ip-api.com/json/{$ip}");
            $data = $response->json();

            if ($data['status'] === 'success') {
                $result = [
                    'lat' => $data['lat'],
                    'long' => $data['lon'],
                    'city' => $data['city'] ?? null,
                    'country' => $data['country'] ?? null,
                    'source' => 'ip_fallback',
                ];

                Cache::put($cacheKey, $result, 3600);
                return $result;
            }
        } catch (\Exception $e) {
            \Log::warning("Geolocation lookup failed for {$ip}: " . $e->getMessage());
        }

        return [
            'lat' => 0,
            'long' => 0,
            'city' => null,
            'country' => null,
            'source' => 'default',
        ];
    }
}
