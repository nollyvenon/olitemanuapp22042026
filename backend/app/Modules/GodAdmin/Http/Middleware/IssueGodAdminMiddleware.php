<?php

namespace App\Modules\GodAdmin\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class IssueGodAdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $authUser = $request->authUser;

        if (!$authUser) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication required for GOD MODE access',
            ], 401);
        }

        $user = User::find($authUser->sub);

        if (!$user) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'User not found',
            ], 401);
        }

        $isGodAdmin = $user->is_god_admin === true ||
                      (isset($authUser->permissions) && in_array('god_admin', $authUser->permissions ?? []));

        if (!$isGodAdmin) {
            Log::warning('Unauthorized GOD_ADMIN access attempt', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'endpoint' => $request->path(),
                'ip_address' => $request->ip(),
                'timestamp' => now(),
            ]);

            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'GOD MODE requires explicit administrator privilege',
            ], 403);
        }

        Log::info('GOD_ADMIN access initiated', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'endpoint' => $request->path(),
            'method' => $request->method(),
            'ip_address' => $request->ip(),
            'timestamp' => now(),
        ]);

        return $next($request);
    }
}
