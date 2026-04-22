<?php

namespace App\Modules\Audit\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditController {
    public function index(Request $request): JsonResponse {
        $logs = AuditLog::with('user')
            ->when($request->user_id, fn($q) => $q->where('user_id', $request->user_id))
            ->when($request->entity_type, fn($q) => $q->where('entity_type', $request->entity_type))
            ->when($request->action_type, fn($q) => $q->where('action_type', $request->action_type))
            ->when($request->from, fn($q) => $q->where('created_at', '>=', $request->from))
            ->when($request->to, fn($q) => $q->where('created_at', '<=', $request->to))
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($logs);
    }

    public function show(Request $request, string $id): JsonResponse {
        $log = AuditLog::with('user')->findOrFail($id);
        return response()->json($log);
    }

    public function entityAuditTrail(Request $request, string $entityType, string $entityId): JsonResponse {
        $logs = AuditLog::where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($logs);
    }

    public function userActions(Request $request, string $userId): JsonResponse {
        $logs = AuditLog::where('user_id', $userId)
            ->with('user')
            ->when($request->from, fn($q) => $q->where('created_at', '>=', $request->from))
            ->when($request->to, fn($q) => $q->where('created_at', '<=', $request->to))
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($logs);
    }

    public function statistics(Request $request): JsonResponse {
        $stats = [
            'total_actions' => AuditLog::count(),
            'actions_by_type' => AuditLog::selectRaw('action_type, COUNT(*) as count')->groupBy('action_type')->pluck('count', 'action_type'),
            'actions_by_entity' => AuditLog::selectRaw('entity_type, COUNT(*) as count')->groupBy('entity_type')->pluck('count', 'entity_type'),
            'actions_today' => AuditLog::whereDate('created_at', today())->count(),
        ];

        return response()->json($stats);
    }

    public function export(Request $request): JsonResponse {
        $validated = $request->validate([
            'format' => 'required|in:csv,json',
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'entity_type' => 'nullable|string',
        ]);

        $query = AuditLog::with('user');
        if ($validated['from'] ?? null) $query->where('created_at', '>=', $validated['from']);
        if ($validated['to'] ?? null) $query->where('created_at', '<=', $validated['to']);
        if ($validated['entity_type'] ?? null) $query->where('entity_type', $validated['entity_type']);

        $data = $query->orderBy('created_at', 'desc')->get();

        if ($validated['format'] === 'csv') {
            $csv = fopen('php://temp', 'r+');
            fputcsv($csv, ['ID', 'User', 'Action', 'Entity Type', 'Entity ID', 'Timestamp']);
            foreach ($data as $log) {
                fputcsv($csv, [$log->id, $log->user->name ?? 'N/A', $log->action_type, $log->entity_type, $log->entity_id, $log->created_at]);
            }
            rewind($csv);
            return response(stream_get_contents($csv))->header('Content-Type', 'text/csv');
        }

        return response()->json($data);
    }
}
