<?php

namespace App\Modules\Auth\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Modules\Auth\Services\JwtService;

class JwtMiddleware
{
    public function __construct(private JwtService $jwtService) {}

    public function handle(Request $request, Closure $next)
    {
        $token = $this->extractToken($request);

        if (!$token) {
            \Log::error('[JWT] Token not provided', [
                'url' => $request->url(),
                'headers' => $request->headers->all(),
            ]);
            return response()->json(['error' => 'Token not provided'], 401);
        }

        try {
            \Log::info('[JWT] Attempting to decode token', [
                'tokenPrefix' => substr($token, 0, 20) . '...',
                'tokenLength' => strlen($token),
            ]);
            $decoded = $this->jwtService->decode($token);
            \Log::info('[JWT] Token decoded successfully', [
                'sub' => $decoded->sub ?? 'unknown',
                'type' => $decoded->type ?? 'unknown',
            ]);
            $authUser = (object)$decoded;
            $request->attributes->set('authUser', $authUser);
            $request->authUser = $authUser;
            return $next($request);
        } catch (\Exception $e) {
            \Log::error('[JWT] Token validation failed', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'tokenPrefix' => substr($token, 0, 20) . '...',
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json(['error' => 'Invalid token: ' . $e->getMessage()], 401);
        }
    }

    private function extractToken(Request $request): ?string
    {
        $header = $request->header('Authorization');
        if ($header && str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }
        return null;
    }
}
