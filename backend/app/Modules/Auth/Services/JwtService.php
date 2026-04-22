<?php

namespace App\Modules\Auth\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtService {
    private string $secret;
    private string $algorithm = 'HS256';
    private int $accessTokenExpiry = 28800;
    private int $refreshTokenExpiry = 2592000;

    public function __construct() {
        $this->secret = config('jwt.secret') ?: 'default-secret-change-in-production';
    }

    public function generateAccessToken(array $payload): string {
        $payload['exp'] = now()->addSeconds($this->accessTokenExpiry)->timestamp;
        $payload['type'] = 'access';
        return JWT::encode($payload, $this->secret, $this->algorithm);
    }

    public function generateRefreshToken(array $payload): string {
        $payload['exp'] = now()->addSeconds($this->refreshTokenExpiry)->timestamp;
        $payload['type'] = 'refresh';
        return JWT::encode($payload, $this->secret, $this->algorithm);
    }

    public function decode(string $token): object {
        return JWT::decode($token, new Key($this->secret, $this->algorithm));
    }

    public function verify(string $token): bool {
        try {
            $this->decode($token);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
