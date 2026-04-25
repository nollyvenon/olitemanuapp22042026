<?php

namespace App\Modules\Analytics\Services;

class UnifiedIntelligenceService
{
    private $executive;
    private $revenue;
    private $inventory;
    private $accounts;
    private $sales;
    private $insights;
    private $alerts;
    private $forecast;
    private $audit;

    public function __construct(
        ExecutiveDashboardService $executive,
        RevenueIntelligenceService $revenue,
        InventoryIntelligenceService $inventory,
        AccountsRiskService $accounts,
        SalesPerformanceService $sales,
        InsightGeneratorService $insights,
        AlertService $alerts,
        ForecastService $forecast,
        AuditReportService $audit
    ) {
        $this->executive = $executive;
        $this->revenue = $revenue;
        $this->inventory = $inventory;
        $this->accounts = $accounts;
        $this->sales = $sales;
        $this->insights = $insights;
        $this->alerts = $alerts;
        $this->forecast = $forecast;
        $this->audit = $audit;
    }

    public function getUnifiedIntelligence(): array
    {
        return [
            'metadata' => ['generated_at' => now()->toIso8601String(), 'modules' => 9],
            'executive' => $this->executive->getInsights(),
            'revenue' => $this->revenue->getInsights(),
            'inventory' => $this->inventory->getInsights(),
            'accounts' => $this->accounts->getInsights(),
            'sales' => $this->sales->getInsights(),
            'insights' => ['daily' => $this->insights->generateDailyInsights(), 'weekly' => $this->insights->generateWeeklySummary()],
            'alerts' => $this->alerts->getActiveAlerts(),
            'forecast' => ['sales' => $this->forecast->getSalesForecasts(), 'inventory' => $this->forecast->getInventoryForecasts(), 'cashflow' => $this->forecast->getCashFlowForecasts()],
            'audit' => ['summary' => $this->audit->getAuditSummary(), 'suspicious' => $this->audit->detectSuspiciousActivity()]
        ];
    }

    public function getModuleInsights(string $module): array
    {
        return match($module) {
            'executive' => $this->executive->getInsights(),
            'revenue' => $this->revenue->getInsights(),
            'inventory' => $this->inventory->getInsights(),
            'accounts' => $this->accounts->getInsights(),
            'sales' => $this->sales->getInsights(),
            'insights' => ['daily' => $this->insights->generateDailyInsights(), 'weekly' => $this->insights->generateWeeklySummary()],
            'alerts' => $this->alerts->getActiveAlerts(),
            'forecast' => ['sales' => $this->forecast->getSalesForecasts(), 'inventory' => $this->forecast->getInventoryForecasts(), 'cashflow' => $this->forecast->getCashFlowForecasts()],
            'audit' => ['summary' => $this->audit->getAuditSummary(), 'suspicious' => $this->audit->detectSuspiciousActivity()],
            default => []
        };
    }

    public function getCrossModuleCorrelations(): array
    {
        $exec = $this->executive->getInsights();
        $rev = $this->revenue->getInsights();
        $inv = $this->inventory->getInsights();
        $acc = $this->accounts->getInsights();
        $sal = $this->sales->getInsights();

        $correlations = [];

        if (($exec['kpis']['rev_7d'] ?? 0) < ($exec['kpis']['rev_prior_7d'] ?? 1) * 0.8) {
            $correlations[] = ['type' => 'sales_decline_chain', 'severity' => 'critical', 'modules' => ['executive', 'revenue', 'sales'], 'insight' => 'Revenue decline correlates with lower conversion rates'];
        }

        if (($inv['out_of_stock'] ?? 0) > 3 && ($exec['kpis']['rev_7d'] ?? 0) < ($exec['kpis']['rev_prior_7d'] ?? 1)) {
            $correlations[] = ['type' => 'stockout_revenue_impact', 'severity' => 'warning', 'modules' => ['inventory', 'executive', 'revenue'], 'insight' => 'Stockouts likely causing revenue decline'];
        }

        if (($acc['aging_analysis'][0]['d90plus'] ?? 0) > ($acc['aging_analysis'][0]['total_outstanding'] ?? 1) * 0.2) {
            $correlations[] = ['type' => 'cash_flow_risk', 'severity' => 'critical', 'modules' => ['accounts', 'forecast'], 'insight' => 'AR aging exceeds 20% - cash flow at risk'];
        }

        return $correlations;
    }
}
