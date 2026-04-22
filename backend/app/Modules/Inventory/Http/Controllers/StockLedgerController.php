<?php

namespace App\Modules\Inventory\Http\Controllers;

use App\Models\StockItem;
use App\Models\StockLedger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockLedgerController {
    public function index(Request $request): JsonResponse {
        $ledgers = StockLedger::with('item.group.category', 'location')
            ->when($request->location_id, fn($q) => $q->where('location_id', $request->location_id))
            ->when($request->item_id, fn($q) => $q->where('item_id', $request->item_id))
            ->when($request->low_stock, fn($q) => $q->whereRaw('quantity <= (SELECT reorder_level FROM stock_items WHERE id = stock_ledgers.item_id)'))
            ->paginate(50);

        return response()->json($ledgers);
    }

    public function itemBalance(Request $request, string $itemId): JsonResponse {
        $item = StockItem::with('ledgers.location')->findOrFail($itemId);

        return response()->json([
            'item' => $item,
            'total_stock' => $item->getTotalStock(),
            'by_location' => $item->ledgers->map(fn($l) => [
                'location_id' => $l->location_id,
                'location_name' => $l->location?->name,
                'quantity' => $l->quantity,
                'below_reorder' => $l->quantity < $item->reorder_level,
            ]),
        ]);
    }
}
