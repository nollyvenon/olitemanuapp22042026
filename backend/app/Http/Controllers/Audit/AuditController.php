<?php

namespace App\Http\Controllers\Audit;

use App\Http\Controllers\Controller;
use App\Models\Audit\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function list(Request $request): JsonResponse
    {
        $query = AuditLog::query();

        if ($request->has('action')) {
            $query->where('action', $request->input('action'));
        }

        if ($request->has('module')) {
            $query->where('module', $request->input('module'));
        }

        if ($request->has('resource')) {
            $query->where('resource', $request->input('resource'));
        }

        if ($request->has('actor_id')) {
            $query->where('actor_id', $request->input('actor_id'));
        }

        if ($request->has('resource_id')) {
            $query->where('resource_id', $request->input('resource_id'));
        }

        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->input('start_date'));
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->input('end_date'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('actor_email', 'ilike', "%{$search}%")
                    ->orWhere('resource', 'ilike', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 25);
        $logs = $query->with('actor')
            ->latest()
            ->paginate($perPage);

        return response()->json($logs);
    }

    public function show(string $auditLogId): JsonResponse
    {
        $log = AuditLog::with('actor')->findOrFail($auditLogId);

        return response()->json([
            'data' => $log,
            'changes' => $log->getChangesSummary(),
        ]);
    }

    public function export(Request $request): JsonResponse
    {
        $format = $request->input('format', 'csv');
        $query = AuditLog::query();

        if ($request->has('module')) {
            $query->where('module', $request->input('module'));
        }

        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->input('start_date'));
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->input('end_date'));
        }

        $logs = $query->with('actor')->latest()->get();

        if ($format === 'csv') {
            return $this->exportAsCSV($logs);
        }

        return response()->json(['error' => 'Unsupported format'], 400);
    }

    private function exportAsCSV($logs): JsonResponse
    {
        $csv = "Timestamp,Actor,Action,Module,Resource,Resource ID,Status Code\n";

        foreach ($logs as $log) {
            $csv .= sprintf(
                '"%s","%s","%s","%s","%s","%s",%d' . "\n",
                $log->created_at->toDateTimeString(),
                $log->actor_email ?? 'system',
                $log->action,
                $log->module,
                $log->resource,
                $log->resource_id ?? '',
                $log->status_code ?? 0
            );
        }

        return response()->json([
            'csv' => $csv,
            'count' => count($logs),
        ]);
    }
}
