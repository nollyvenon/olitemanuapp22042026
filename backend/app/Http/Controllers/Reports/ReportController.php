<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function salesReport(Request $request): JsonResponse
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        return response()->json([
            'type' => 'sales',
            'period' => ['start' => $startDate, 'end' => $endDate],
            'summary' => [
                'total_orders' => 0,
                'total_revenue' => 0,
                'average_order_value' => 0,
            ],
            'data' => [],
        ]);
    }

    public function inventoryReport(Request $request): JsonResponse
    {
        return response()->json([
            'type' => 'inventory',
            'summary' => [
                'total_products' => 0,
                'total_stock_value' => 0,
                'low_stock_items' => 0,
            ],
            'data' => [],
        ]);
    }

    public function accountsReport(Request $request): JsonResponse
    {
        return response()->json([
            'type' => 'accounts',
            'summary' => [
                'total_receivables' => 0,
                'total_payables' => 0,
                'net_position' => 0,
            ],
            'data' => [],
        ]);
    }
}
