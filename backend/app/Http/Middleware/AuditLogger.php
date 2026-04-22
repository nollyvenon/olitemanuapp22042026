<?php

namespace App\Http\Middleware;

use App\Models\Audit\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditLogger
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldAudit($request)) {
            $this->logAudit($request, $response);
        }

        return $response;
    }

    private function shouldAudit(Request $request): bool
    {
        $method = $request->getMethod();
        return in_array($method, ['POST', 'PATCH', 'DELETE', 'PUT']);
    }

    private function logAudit(Request $request, Response $response): void
    {
        $user = auth()->user();
        $pathSegments = explode('/', trim($request->path(), '/'));
        $module = $pathSegments[2] ?? 'unknown';
        $resource = $pathSegments[3] ?? 'unknown';

        $resourceId = null;
        if (count($pathSegments) > 4 && $this->isUuid($pathSegments[4])) {
            $resourceId = $pathSegments[4];
        }

        AuditLog::create([
            'actor_id' => $user?->id,
            'actor_email' => $user?->email ?? 'system',
            'action' => $this->getAction($request),
            'module' => $module,
            'resource' => $resource,
            'resource_id' => $resourceId,
            'old_values' => $request->input('_old_values'),
            'new_values' => $request->all(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'request_id' => $request->header('X-Request-ID'),
            'status_code' => $response->getStatusCode(),
            'metadata' => $this->extractMetadata($request),
        ]);
    }

    private function getAction(Request $request): string
    {
        return match ($request->getMethod()) {
            'POST' => 'created',
            'PATCH', 'PUT' => 'updated',
            'DELETE' => 'deleted',
            default => 'modified',
        };
    }

    private function extractMetadata(Request $request): array
    {
        $path = $request->path();

        if (str_contains($path, 'override')) {
            return ['override_reason' => $request->input('override_reason')];
        }

        if (str_contains($path, 'approve')) {
            return ['approval_notes' => $request->input('approval_notes')];
        }

        return [];
    }

    private function isUuid(string $str): bool
    {
        return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $str) === 1;
    }
}
