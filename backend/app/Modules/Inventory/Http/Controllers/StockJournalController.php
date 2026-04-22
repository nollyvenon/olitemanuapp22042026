<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Models\StockJournal;
use App\Modules\Audit\Services\AuditService;
use App\Modules\Inventory\Services\StockMovementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockJournalController {
    public function __construct(
        private StockMovementService $stockMovement,
        private AuditService $auditService
    ) {}

    public function index(Request $request): JsonResponse {
        $journals = StockJournal::with('item', 'fromLocation', 'toLocation')
            ->when($request->item_id, fn($q) => $q->where('item_id', $request->item_id))
            ->when($request->location_id, fn($q) => $q->where(function ($q) use ($request) {
                $q->where('from_location', $request->location_id)->orWhere('to_location', $request->location_id);
            }))
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($journals);
    }

    public function add(Request $request): JsonResponse {
        try {
            $validated = $request->validate([
                'item_id' => 'required|uuid|exists:stock_items,id',
                'location_id' => 'required|uuid|exists:locations,id',
                'quantity' => 'required|numeric|min:0.01',
                'notes' => 'nullable|string',
            ]);

            $journal = $this->stockMovement->addStock(
                $validated['item_id'],
                $validated['location_id'],
                $validated['quantity'],
                $request->authUser->sub,
                ['notes' => $validated['notes'] ?? null]
            );

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'STOCK_ADD',
                'entity_type' => 'stock_journals',
                'entity_id' => $journal->id,
                'after_snapshot' => $journal->toArray(),
            ]);

            return response()->json($journal, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function transfer(Request $request): JsonResponse {
        try {
            $validated = $request->validate([
                'item_id' => 'required|uuid|exists:stock_items,id',
                'from_location' => 'required|uuid|exists:locations,id',
                'to_location' => 'required|uuid|exists:locations,id|different:from_location',
                'quantity' => 'required|numeric|min:0.01',
                'notes' => 'nullable|string',
            ]);

            $journal = $this->stockMovement->transferStock(
                $validated['item_id'],
                $validated['from_location'],
                $validated['to_location'],
                $validated['quantity'],
                $request->authUser->sub,
                $validated['notes'] ?? null
            );

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'STOCK_TRANSFER',
                'entity_type' => 'stock_journals',
                'entity_id' => $journal->id,
                'after_snapshot' => $journal->toArray(),
            ]);

            return response()->json($journal, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function remove(Request $request): JsonResponse {
        try {
            $validated = $request->validate([
                'item_id' => 'required|uuid|exists:stock_items,id',
                'location_id' => 'required|uuid|exists:locations,id',
                'quantity' => 'required|numeric|min:0.01',
                'notes' => 'nullable|string',
            ]);

            $journal = $this->stockMovement->removeStock(
                $validated['item_id'],
                $validated['location_id'],
                $validated['quantity'],
                $request->authUser->sub,
                ['type' => 'adjustment', 'notes' => $validated['notes'] ?? null]
            );

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'STOCK_REMOVE',
                'entity_type' => 'stock_journals',
                'entity_id' => $journal->id,
                'after_snapshot' => $journal->toArray(),
            ]);

            return response()->json($journal, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }
}
