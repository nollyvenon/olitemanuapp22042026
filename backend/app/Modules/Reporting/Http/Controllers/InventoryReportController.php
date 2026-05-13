<?php

namespace App\Modules\Reporting\Http\Controllers;

use App\Models\User;
use App\Modules\Reporting\Services\InventoryReportService;
use App\Modules\Reporting\Services\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryReportController {
    public function __construct(private InventoryReportService $reportService, private ExportService $exportService) {}

    private function assertLocation(Request $request, string $locationId): void {
        $u = User::with('locations')->find($request->authUser->sub ?? null);
        if (!$u) {
            abort(401);
        }
        if (!empty($u->is_god_admin)) {
            return;
        }
        if ($u->locations->isEmpty()) {
            return;
        }
        if (!$u->locations->contains('id', $locationId)) {
            abort(403, 'Location not allowed');
        }
    }

    public function unified(Request $request): JsonResponse {
        $validated = $request->validate([
            'location_id' => 'required|uuid|exists:locations,id',
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
            'category_id' => 'nullable|uuid|exists:stock_categories,id',
            'group_id' => 'nullable|uuid|exists:stock_groups,id',
            'item_id' => 'nullable|uuid|exists:stock_items,id',
            'exclude_zero' => 'sometimes|boolean',
            'transaction_only' => 'sometimes|boolean',
        ]);
        $this->assertLocation($request, $validated['location_id']);
        $data = $this->reportService->unified($validated);
        return response()->json(['data' => $data]);
    }

    public function opening(Request $request): JsonResponse {
        $validated = $request->validate([
            'location_id' => 'required|uuid|exists:locations,id',
            'category_id' => 'nullable|uuid|exists:stock_categories,id',
            'item_id' => 'nullable|uuid|exists:stock_items,id',
            'date' => 'required|date',
        ]);

        $data = $this->reportService->openingBalance(
            $validated['location_id'],
            $validated['category_id'] ?? null,
            $validated['item_id'] ?? null,
            $validated['date']
        );

        return response()->json(['type' => 'opening', 'date' => $validated['date'], 'data' => $data]);
    }

    public function inwards(Request $request): JsonResponse {
        $validated = $request->validate([
            'location_id' => 'required|uuid|exists:locations,id',
            'category_id' => 'nullable|uuid|exists:stock_categories,id',
            'item_id' => 'nullable|uuid|exists:stock_items,id',
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        $data = $this->reportService->inwardsMovement(
            $validated['location_id'],
            $validated['category_id'] ?? null,
            $validated['item_id'] ?? null,
            $validated['from'],
            $validated['to']
        );

        return response()->json(['type' => 'inwards', 'period' => [$validated['from'], $validated['to']], 'data' => $data]);
    }

    public function outwards(Request $request): JsonResponse {
        $validated = $request->validate([
            'location_id' => 'required|uuid|exists:locations,id',
            'category_id' => 'nullable|uuid|exists:stock_categories,id',
            'item_id' => 'nullable|uuid|exists:stock_items,id',
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        $data = $this->reportService->outwardsMovement(
            $validated['location_id'],
            $validated['category_id'] ?? null,
            $validated['item_id'] ?? null,
            $validated['from'],
            $validated['to']
        );

        return response()->json(['type' => 'outwards', 'period' => [$validated['from'], $validated['to']], 'data' => $data]);
    }

    public function closing(Request $request): JsonResponse {
        $validated = $request->validate([
            'location_id' => 'required|uuid|exists:locations,id',
            'category_id' => 'nullable|uuid|exists:stock_categories,id',
            'item_id' => 'nullable|uuid|exists:stock_items,id',
            'date' => 'required|date',
        ]);

        $data = $this->reportService->closingBalance(
            $validated['location_id'],
            $validated['category_id'] ?? null,
            $validated['item_id'] ?? null,
            $validated['date']
        );

        return response()->json(['type' => 'closing', 'date' => $validated['date'], 'data' => $data]);
    }

    public function exportReport(Request $request): JsonResponse {
        $validated = $request->validate([
            'report_type' => 'required|in:opening,inwards,outwards,closing',
            'location_id' => 'required|uuid|exists:locations,id',
            'category_id' => 'nullable|uuid|exists:stock_categories,id',
            'item_id' => 'nullable|uuid|exists:stock_items,id',
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'date' => 'nullable|date',
            'format' => 'required|in:csv,pdf',
        ]);

        $data = match($validated['report_type']) {
            'opening' => $this->reportService->openingBalance($validated['location_id'], $validated['category_id'] ?? null, $validated['item_id'] ?? null, $validated['date'] ?? now()->toDateString()),
            'inwards' => $this->reportService->inwardsMovement($validated['location_id'], $validated['category_id'] ?? null, $validated['item_id'] ?? null, $validated['from'] ?? now()->subMonth()->toDateString(), $validated['to'] ?? now()->toDateString()),
            'outwards' => $this->reportService->outwardsMovement($validated['location_id'], $validated['category_id'] ?? null, $validated['item_id'] ?? null, $validated['from'] ?? now()->subMonth()->toDateString(), $validated['to'] ?? now()->toDateString()),
            'closing' => $this->reportService->closingBalance($validated['location_id'], $validated['category_id'] ?? null, $validated['item_id'] ?? null, $validated['date'] ?? now()->toDateString()),
        };

        $content = $validated['format'] === 'csv'
            ? $this->exportService->exportCsv($data, 'inventory_' . $validated['report_type'])
            : $this->exportService->exportPdf($data, 'Inventory Report: ' . $validated['report_type']);

        return response($content)->header('Content-Type', $validated['format'] === 'csv' ? 'text/csv' : 'text/html');
    }
}
