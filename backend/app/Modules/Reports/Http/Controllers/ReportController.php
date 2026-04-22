<?php

namespace App\Modules\Reports\Http\Controllers;

use App\Models\Report;
use App\Modules\Reports\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController {
    public function __construct(private ReportService $reportService) {}

    public function index(Request $request): JsonResponse {
        $reports = Report::with('createdBy', 'schedules')
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($reports);
    }

    public function store(Request $request): JsonResponse {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:sales,inventory,ledger,customer',
            'description' => 'nullable|string',
            'filters' => 'nullable|json',
            'columns' => 'nullable|json',
        ]);

        $validated['created_by'] = $request->authUser->sub;
        $report = Report::create($validated);

        return response()->json($report, 201);
    }

    public function show(Request $request, string $id): JsonResponse {
        $report = Report::with('schedules')->findOrFail($id);
        return response()->json($report);
    }

    public function generate(Request $request, string $id): JsonResponse {
        $report = Report::findOrFail($id);
        $filters = json_decode($request->getContent(), true) ?? [];

        $data = match($report->type) {
            'sales' => $this->reportService->salesReport($filters),
            'inventory' => $this->reportService->inventoryReport($filters),
            'ledger' => $this->reportService->ledgerReport($filters),
            default => ['error' => 'Unknown report type'],
        };

        return response()->json($data);
    }
}
