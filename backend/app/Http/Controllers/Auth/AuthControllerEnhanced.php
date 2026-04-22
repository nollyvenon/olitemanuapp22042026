<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Auth\AuthServiceEnhanced;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuthControllerEnhanced extends Controller
{
    public function __construct(private AuthServiceEnhanced $authService) {}

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->authenticate(
                $request->email,
                $request->password,
                $request->location,
                $request->ip(),
                $request->userAgent(),
                $this->extractDeviceInfo($request)
            );
            return response()->json($result, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 401);
        }
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate(['email' => 'required|email']);
            $result = $this->authService->initiatePasswordReset($validated['email']);
            // Send email with reset token: $result['token']
            return response()->json(['message' => 'Password reset email sent'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    public function resetPassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'token' => 'required|string',
                'password' => 'required|min:6|confirmed',
            ]);
            $this->authService->resetPassword($validated['token'], $validated['password']);
            return response()->json(['message' => 'Password reset successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function adminResetPassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|uuid|exists:users,id',
                'password' => 'required|min:6',
            ]);

            $targetUser = \App\Models\User::find($validated['user_id']);
            $this->authService->adminResetUserPassword($request->user(), $targetUser, $validated['password']);

            return response()->json(['message' => 'User password reset by admin'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        }
    }

    private function extractDeviceInfo(Request $request): array
    {
        $ua = $request->userAgent();
        return [
            'device_name' => 'Web Browser',
            'browser' => $this->parseBrowser($ua),
            'os' => $this->parseOS($ua),
            'user_agent' => $ua,
        ];
    }

    private function parseBrowser(string $ua): ?string
    {
        if (stripos($ua, 'Chrome') !== false) return 'Chrome';
        if (stripos($ua, 'Firefox') !== false) return 'Firefox';
        if (stripos($ua, 'Safari') !== false) return 'Safari';
        if (stripos($ua, 'Edge') !== false) return 'Edge';
        return null;
    }

    private function parseOS(string $ua): ?string
    {
        if (stripos($ua, 'Windows') !== false) return 'Windows';
        if (stripos($ua, 'Mac') !== false) return 'macOS';
        if (stripos($ua, 'Linux') !== false) return 'Linux';
        if (stripos($ua, 'iPhone') !== false) return 'iOS';
        if (stripos($ua, 'Android') !== false) return 'Android';
        return null;
    }
}
