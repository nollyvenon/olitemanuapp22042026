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
}
