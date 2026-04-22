<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory\StockItem;
use App\Models\Inventory\StoreCenter;
use App\Models\Inventory\StockJournal;
use App\Services\Inventory\StockService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StockJournalController extends Controller
{
    public function __construct(private StockService $stockService) {}

    public function index(Request $request): JsonResponse
    {
        $query = StockJournal::with('stockItem', 'fromStore', 'toStore', 'creator');

        if ($request->has('stock_item_id')) {
            $query->where('stock_item_id', $request->stock_item_id);
        }

        if ($request->has('store_center_id')) {
            $query->where('to_store_id', $request->store_center_id)
                  ->orWhere('from_store_id', $request->store_center_id);
        }

        return response()->json($query->orderBy('journal_date', 'desc')->paginate(20));
    }

    public function addStock(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'stock_item_id' => 'required|uuid|exists:stock_items,id',
                'store_center_id' => 'required|uuid|exists:store_centers,id',
                'quantity' => 'required|numeric|min:0.01',
                'remarks' => 'nullable|string',
            ]);

            $item = StockItem::findOrFail($validated['stock_item_id']);
            $store = StoreCenter::findOrFail($validated['store_center_id']);

            $journal = $this->stockService->addStock(
                $item,
                $store,
                $validated['quantity'],
                $validated['remarks'] ?? null,
                $request->user()
            );

            return response()->json($journal->load('stockItem', 'toStore', 'creator'), 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function transfer(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'stock_item_id' => 'required|uuid|exists:stock_items,id',
                'from_store_id' => 'required|uuid|exists:store_centers,id',
                'to_store_id' => 'required|uuid|exists:store_centers,id',
                'quantity' => 'required|numeric|min:0.01',
                'remarks' => 'nullable|string',
            ]);

            $item = StockItem::findOrFail($validated['stock_item_id']);
            $fromStore = StoreCenter::findOrFail($validated['from_store_id']);
            $toStore = StoreCenter::findOrFail($validated['to_store_id']);

            $journal = $this->stockService->transferStock(
                $item,
                $fromStore,
                $toStore,
                $validated['quantity'],
                $validated['remarks'] ?? null,
                $request->user()
            );

            return response()->json($journal->load('stockItem', 'fromStore', 'toStore', 'creator'), 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function oneWayMovement(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'stock_item_id' => 'required|uuid|exists:stock_items,id',
                'from_store_id' => 'required|uuid|exists:store_centers,id',
                'to_store_id' => 'required|uuid|exists:store_centers,id',
                'quantity' => 'required|numeric|min:0.01',
                'remarks' => 'nullable|string',
            ]);

            $item = StockItem::findOrFail($validated['stock_item_id']);
            $fromStore = StoreCenter::findOrFail($validated['from_store_id']);
            $toStore = StoreCenter::findOrFail($validated['to_store_id']);

            $journal = $this->stockService->oneWayMovement(
                $item,
                $fromStore,
                $toStore,
                $validated['quantity'],
                $validated['remarks'] ?? null,
                $request->user()
            );

            return response()->json($journal->load('stockItem', 'fromStore', 'toStore', 'creator'), 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
