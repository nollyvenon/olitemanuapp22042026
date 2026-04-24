<?php namespace App\Modules\Inventory\Http\Controllers;
use App\Models\StockJournal;
use App\Models\StockLedger;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StockJournalController {
    public function index(): JsonResponse {
        return response()->json(StockJournal::with('item')->orderBy('created_at', 'desc')->paginate(20));
    }
    public function add(Request $request): JsonResponse {
        $v = $request->validate(['item_id' => 'required|uuid|exists:stock_items,id', 'location_id' => 'required|uuid|exists:locations,id', 'quantity' => 'required|numeric|min:0.01', 'notes' => 'string']);
        return DB::transaction(function () use ($v, $request) {
            $journal = StockJournal::create([...$v, 'type' => 'add', 'created_by' => $request->authUser->sub]);
            StockLedger::updateOrCreate(['item_id' => $v['item_id'], 'location_id' => $v['location_id']], ['quantity' => DB::raw("COALESCE(quantity, 0) + {$v['quantity']}")]);
            return response()->json($journal, 201);
        });
    }
    public function transfer(Request $request): JsonResponse {
        $v = $request->validate(['item_id' => 'required|uuid|exists:stock_items,id', 'from_location' => 'required|uuid|exists:locations,id', 'to_location' => 'required|uuid|exists:locations,id', 'quantity' => 'required|numeric|min:0.01', 'notes' => 'string']);
        return DB::transaction(function () use ($v, $request) {
            $from = StockLedger::where('item_id', $v['item_id'])->where('location_id', $v['from_location'])->first();
            if (!$from || $from->quantity < $v['quantity']) return response()->json(['error' => 'Insufficient stock'], 422);
            $journal = StockJournal::create([...$v, 'type' => 'transfer', 'created_by' => $request->authUser->sub]);
            $from->decrement('quantity', $v['quantity']);
            StockLedger::updateOrCreate(['item_id' => $v['item_id'], 'location_id' => $v['to_location']], ['quantity' => DB::raw("COALESCE(quantity, 0) + {$v['quantity']}")]);
            return response()->json($journal, 201);
        });
    }
    public function remove(Request $request): JsonResponse {
        $v = $request->validate(['item_id' => 'required|uuid|exists:stock_items,id', 'location_id' => 'required|uuid|exists:locations,id', 'quantity' => 'required|numeric|min:0.01', 'notes' => 'string']);
        return DB::transaction(function () use ($v, $request) {
            $ledger = StockLedger::where('item_id', $v['item_id'])->where('location_id', $v['location_id'])->first();
            if (!$ledger || $ledger->quantity < $v['quantity']) return response()->json(['error' => 'Insufficient stock'], 422);
            StockJournal::create([...$v, 'type' => 'remove', 'created_by' => $request->authUser->sub]);
            $ledger->decrement('quantity', $v['quantity']);
            return response()->json(['success' => true], 201);
        });
    }
}
