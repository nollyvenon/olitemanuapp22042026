<?php

namespace App\Modules\MarketIntelligence\Http\Controllers;

use App\Models\MarketPlan;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MarketPlanController {
    public function __construct(private AuditService $auditService) {}

    public function index(Request $request): JsonResponse {
        $plans = MarketPlan::where('is_current', true)
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($plans);
    }

    public function store(Request $request): JsonResponse {
        try {
            $validated = $request->validate([
                'type' => 'required|in:daily,weekly,monthly',
                'remark' => 'required|string|max:1000',
            ]);

            $validated['created_by'] = $request->authUser->sub;
            $validated['status'] = 'NOT_VETTED';

            $plan = MarketPlan::create($validated);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'CREATE',
                'entity_type' => 'market_plans',
                'entity_id' => $plan->id,
                'after_snapshot' => $plan->toArray(),
            ]);

            return response()->json($plan, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show(Request $request, string $id): JsonResponse {
        $plan = MarketPlan::findOrFail($id);
        return response()->json($plan);
    }

    public function vet(Request $request, string $id): JsonResponse {
        try {
            $plan = MarketPlan::findOrFail($id);

            if ($plan->status === 'VETTED') {
                return response()->json(['error' => 'Plan already vetted'], 422);
            }

            $before = $plan->toArray();
            $plan->update(['status' => 'VETTED', 'vetted_by' => $request->authUser->sub, 'vetted_at' => now()]);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'VET',
                'entity_type' => 'market_plans',
                'entity_id' => $id,
                'before_snapshot' => $before,
                'after_snapshot' => $plan->toArray(),
            ]);

            return response()->json($plan);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
