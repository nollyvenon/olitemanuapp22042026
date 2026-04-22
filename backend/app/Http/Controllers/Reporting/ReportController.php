<?php
namespace App\Http\Controllers\Reporting;
use App\Http\Controllers\Controller;
use App\Services\Reporting\InventoryReportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function __construct(private InventoryReportService $reportService) {}

    public function inventoryReport(Request $request): JsonResponse
    {
        try {
            $filters = $request->validate([
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date',
                'store_center_id' => 'nullable|uuid|exists:store_centers,id',
                'category_id' => 'nullable|uuid|exists:stock_categories,id',
                'group_id' => 'nullable|uuid|exists:stock_groups,id',
                'item_id' => 'nullable|uuid|exists:stock_items,id',
                'exclude_zero' => 'boolean',
                'transaction_only' => 'boolean',
            ]);

            $report = $this->reportService->getInventoryReport($filters);
            return response()->json(['data' => $report, 'count' => count($report)]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function detailedMovements(Request $request): JsonResponse
    {
        try {
            $filters = $request->validate([
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date',
                'item_id' => 'required|uuid|exists:stock_items,id',
                'store_center_id' => 'required|uuid|exists:store_centers,id',
            ]);

            $movements = $this->reportService->getDetailedMovements($filters);
            return response()->json(['data' => $movements]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function exportInventoryReport(Request $request)
    {
        try {
            $filters = $request->validate([
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date',
                'store_center_id' => 'nullable|uuid',
                'format' => 'required|in:csv,pdf',
            ]);

            $report = $this->reportService->getInventoryReport($filters);
            $format = $filters['format'];

            if ($format === 'csv') {
                return $this->exportCSV($report, 'inventory-report');
            } else {
                return $this->exportPDF($report, 'inventory-report');
            }
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    private function exportCSV($data, $filename)
    {
        $output = fopen('php://output', 'w');
        header('Content-Type: text/csv; charset=utf-8');
        header("Content-Disposition: attachment; filename=\"{$filename}.csv\"");

        if (count($data) > 0) {
            fputcsv($output, array_keys((array)$data[0]));
            foreach ($data as $row) {
                fputcsv($output, (array)$row);
            }
        }

        fclose($output);
        exit;
    }

    private function exportPDF($data, $filename)
    {
        return response()->json(['message' => 'PDF export requires library integration', 'data' => $data]);
    }
}
