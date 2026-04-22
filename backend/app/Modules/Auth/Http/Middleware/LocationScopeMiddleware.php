<?php

namespace App\Modules\Auth\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class LocationScopeMiddleware {
    public function handle(Request $request, Closure $next) {
        if (!$request->authUser) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $locationIds = array_map(fn($loc) => $loc->id ?? $loc, $request->authUser->locations ?? []);

        $request->attributes->set('user_locations', $locationIds);

        return $next($request);
    }
}
