<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class CorsMiddleware {
    public function handle(Request $request, Closure $next) {
        $origin = $request->headers->get('Origin');
        $allowOrigin = $origin ?: '*';
        $headers = [
            'Access-Control-Allow-Origin' => $allowOrigin,
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
            'Access-Control-Allow-Credentials' => 'true',
            'Vary' => 'Origin',
        ];

        if ($request->getMethod() === 'OPTIONS') {
            return response('', 200)->withHeaders($headers);
        }

        $response = $next($request);

        Log::info('CORS middleware before headers', [
            'class' => get_class($response),
            'headers' => $response->headers->all(),
        ]);

        foreach ($headers as $key => $value) {
            header("{$key}: {$value}");
        }

        if (method_exists($response, 'withHeaders')) {
            $response = $response->withHeaders($headers);
        } elseif ($response instanceof HttpResponse) {
            $response->headers->add($headers);
        }

        Log::info('CORS middleware after headers', [
            'headers' => $response->headers->all(),
        ]);

        return $response;
    }
}
