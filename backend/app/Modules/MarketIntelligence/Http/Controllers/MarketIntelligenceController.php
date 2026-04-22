<?php

namespace App\Modules\MarketIntelligence\Http\Controllers;

use App\Models\MarketTrend;
use App\Models\CompetitorAnalysis;
use App\Models\CustomerInsight;
use App\Modules\MarketIntelligence\Services\MarketIntelligenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MarketIntelligenceController {
    public function __construct(private MarketIntelligenceService $service) {}

    public function trends(Request $request): JsonResponse {
        $trends = MarketTrend::when($request->category, fn($q) => $q->where('category', $request->category))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($trends);
    }

    public function competitors(Request $request): JsonResponse {
        $competitors = CompetitorAnalysis::orderBy('last_updated_at', 'desc')->paginate(20);
        return response()->json($competitors);
    }

    public function updateCompetitor(Request $request, string $id): JsonResponse {
        $validated = $request->validate([
            'products' => 'nullable|json',
            'pricing' => 'nullable|json',
            'notes' => 'nullable|string',
        ]);

        $validated['updated_by'] = $request->authUser->sub;
        $validated['last_updated_at'] = now();

        $competitor = CompetitorAnalysis::findOrFail($id);
        $competitor->update($validated);

        return response()->json($competitor);
    }

    public function customerInsights(Request $request): JsonResponse {
        $insights = CustomerInsight::with('customer')
            ->when($request->segment, fn($q) => $q->where('segment', $request->segment))
            ->orderBy('lifetime_value', 'desc')
            ->paginate(20);

        return response()->json($insights);
    }

    public function refreshInsights(Request $request, string $customerId): JsonResponse {
        $insight = $this->service->updateCustomerInsights($customerId);
        return response()->json($insight);
    }
}
