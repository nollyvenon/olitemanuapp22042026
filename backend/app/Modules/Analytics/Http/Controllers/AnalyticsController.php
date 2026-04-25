<?php

namespace App\Modules\Analytics\Http\Controllers;

use App\Modules\Analytics\Services\SalesInsightService;
use App\Modules\Analytics\Services\CollectionsInsightService;
use App\Modules\Analytics\Services\InventoryInsightService;
use App\Modules\Analytics\Services\PerformanceInsightService;
use App\Modules\Analytics\Services\ExecutiveDashboardService;
use App\Modules\Analytics\Services\RevenueIntelligenceService;
use App\Modules\Analytics\Services\InventoryIntelligenceService;
use App\Modules\Analytics\Services\AccountsRiskService;
use App\Modules\Analytics\Services\SalesPerformanceService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AnalyticsController
{
    public function sales(Request $request, SalesInsightService $service): JsonResponse
    {
        $period = (int) $request->query('period', 30);
        return response()->json($service->getInsights($period));
    }

    public function collections(CollectionsInsightService $service): JsonResponse
    {
        return response()->json($service->getInsights());
    }

    public function inventory(InventoryInsightService $service): JsonResponse
    {
        return response()->json($service->getInsights());
    }

    public function performance(Request $request, PerformanceInsightService $service): JsonResponse
    {
        $period = (int) $request->query('period', 30);
        return response()->json($service->getInsights($period));
    }

    public function executive(ExecutiveDashboardService $service): JsonResponse
    {
        return response()->json($service->getInsights());
    }

    public function revenue(RevenueIntelligenceService $service): JsonResponse
    {
        return response()->json($service->getInsights());
    }

    public function accountsRisk(AccountsRiskService $service): JsonResponse
    {
        return response()->json($service->getInsights());
    }

    public function salesPerformance(SalesPerformanceService $service): JsonResponse
    {
        return response()->json($service->getInsights());
    }
}
