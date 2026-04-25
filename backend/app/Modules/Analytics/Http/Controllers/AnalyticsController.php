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
use App\Modules\Analytics\Services\InsightGeneratorService;
use App\Modules\Analytics\Services\AlertService;
use App\Modules\Analytics\Services\ForecastService;
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

    public function insights(InsightGeneratorService $service): JsonResponse
    {
        return response()->json([
            'daily' => $service->generateDailyInsights(),
            'weekly' => $service->generateWeeklySummary(),
            'generated_at' => now()->toIso8601String()
        ]);
    }

    public function alerts(AlertService $service): JsonResponse
    {
        return response()->json(['alerts' => $service->getActiveAlerts()]);
    }

    public function salesForecast(ForecastService $service): JsonResponse
    {
        return response()->json($service->getSalesForecasts());
    }

    public function inventoryForecast(ForecastService $service): JsonResponse
    {
        return response()->json($service->getInventoryForecasts());
    }

    public function cashFlowForecast(ForecastService $service): JsonResponse
    {
        return response()->json($service->getCashFlowForecasts());
    }
}
