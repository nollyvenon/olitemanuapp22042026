<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Modules\Auth\Http\Requests\LoginRequest;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController {
    public function __construct(private AuthService $authService) {}

    public function login(LoginRequest $request): JsonResponse {
        try {
            $result = $this->authService->login($request->validated());
            return response()->json($result, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function logout(Request $request): JsonResponse {
        try {
            $token = $this->extractToken($request);
            $this->authService->logout($token);
            return response()->json(['message' => 'Logged out successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function refresh(Request $request): JsonResponse {
        try {
            $token = $this->extractToken($request);
            $result = $this->authService->refresh($token);
            return response()->json($result, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 401);
        }
    }

    public function requestReset(Request $request): JsonResponse {
        return response()->json(['message' => 'Not implemented'], 501);
    }

    public function resetPassword(Request $request): JsonResponse {
        return response()->json(['message' => 'Not implemented'], 501);
    }

    private function extractToken(Request $request): string {
        $header = $request->header('Authorization');
        if ($header && str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }
        throw new \Exception('Token not found', 401);
    }
}
