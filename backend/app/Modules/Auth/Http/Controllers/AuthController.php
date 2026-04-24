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
            $status = is_int($e->getCode()) && $e->getCode() > 0 ? $e->getCode() : 500;
            return response()->json(['error' => $e->getMessage()], $status);
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
            \Log::info('[Auth] Refresh request received', [
                'has_auth_header' => $request->hasHeader('Authorization'),
                'auth_header' => $request->header('Authorization') ? 'Bearer ...' : 'missing',
                'all_headers' => array_keys($request->headers->all()),
            ]);

            $token = $this->extractToken($request);
            \Log::info('[Auth] Token extracted successfully', ['token_length' => strlen($token)]);

            $result = $this->authService->refresh($token);
            \Log::info('[Auth] Token refresh successful');
            return response()->json($result, 200);
        } catch (\Exception $e) {
            \Log::error('[Auth] Refresh failed', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
            ]);
            return response()->json(['error' => $e->getMessage(), 'debug' => 'Check server logs'], 401);
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
        \Log::info('[Auth] extractToken called', [
            'has_header' => !!$header,
            'header_starts_with_bearer' => $header ? str_starts_with($header, 'Bearer ') : false,
            'header_preview' => $header ? substr($header, 0, 20) . '...' : 'null',
        ]);

        if ($header && str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }
        throw new \Exception('Token not found in Authorization header', 401);
    }
}
