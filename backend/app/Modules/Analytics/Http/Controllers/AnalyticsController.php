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
use App\Modules\Analytics\Services\AuditReportService;
use App\Modules\Analytics\Services\UnifiedIntelligenceService;
use App\Modules\Analytics\Services\AiInsightService;
use App\Models\User;
use App\Modules\Auth\Services\RBACService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AnalyticsController
{
    public function __construct(private RBACService $rbac) {}

    private function checkAnalyticsAccess(Request $request): ?JsonResponse {
        $user = User::find($request->authUser->sub ?? null);
        if ($user && !$this->rbac->canAccessModule($user, 'analytics')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        return null;
    }

    public function sales(Request $request, SalesInsightService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        $period = (int) $request->query('period', 30);
        return response()->json($service->getInsights($period));
    }

    public function collections(Request $request, CollectionsInsightService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json($service->getInsights());
    }

    public function inventory(Request $request, InventoryInsightService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json($service->getInsights());
    }

    public function performance(Request $request, PerformanceInsightService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        $period = (int) $request->query('period', 30);
        return response()->json($service->getInsights($period));
    }

    public function executive(Request $request, ExecutiveDashboardService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json($service->getInsights());
    }

    public function revenue(Request $request, RevenueIntelligenceService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json($service->getInsights());
    }

    public function accountsRisk(Request $request, AccountsRiskService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json($service->getInsights());
    }

    public function salesPerformance(Request $request, SalesPerformanceService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json($service->getInsights());
    }

    public function insights(Request $request, InsightGeneratorService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json([
            'daily' => $service->generateDailyInsights(),
            'weekly' => $service->generateWeeklySummary(),
            'generated_at' => now()->toIso8601String()
        ]);
    }

    public function alerts(Request $request, AlertService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json(['alerts' => $service->getActiveAlerts()]);
    }

    public function salesForecast(Request $request, ForecastService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json($service->getSalesForecasts());
    }

    public function inventoryForecast(Request $request, ForecastService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json($service->getInventoryForecasts());
    }

    public function cashFlowForecast(Request $request, ForecastService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json($service->getCashFlowForecasts());
    }

    public function auditTransactions(Request $request, AuditReportService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json(['transactions' => $service->getTransactionHistory($request->all())]);
    }

    public function auditActivity(Request $request, AuditReportService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json(['logs' => $service->getUserActivityLogs($request->all())]);
    }

    public function auditOverrides(Request $request, AuditReportService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json(['overrides' => $service->getOverrideTracking($request->all())]);
    }

    public function auditSuspicious(Request $request, AuditReportService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json(['suspicious' => $service->detectSuspiciousActivity(), 'summary' => $service->getAuditSummary()]);
    }

    public function unified(Request $request, UnifiedIntelligenceService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json($service->getUnifiedIntelligence());
    }

    public function unifiedModule(Request $request, UnifiedIntelligenceService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json($service->getModuleInsights($request->route('module')));
    }

    public function crossModuleCorrelations(Request $request, UnifiedIntelligenceService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json(['correlations' => $service->getCrossModuleCorrelations()]);
    }

    public function aiInsights(Request $request, AiInsightService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json($service->getInsights());
    }

    public function aiForecast(Request $request, ForecastService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        return response()->json(['sales' => $service->getSalesForecasts(), 'inventory' => $service->getInventoryForecasts(), 'cashflow' => $service->getCashFlowForecasts()]);
    }

    public function aiAlerts(Request $request, AlertService $service): JsonResponse
    {
        if ($response = $this->checkAnalyticsAccess($request)) return $response;
        $alerts = $service->getActiveAlerts();
        foreach ($alerts as $alert) {
            \App\Models\Notification::create(['user_id' => \Auth::id(), 'type' => $alert['type'] ?? 'alert', 'message' => $alert['message'] ?? '', 'data' => json_encode($alert)]);
        }
        return response()->json(['alerts' => $alerts]);
    }
}
