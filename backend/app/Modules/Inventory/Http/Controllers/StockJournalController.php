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

    /** @return JsonResponse|null Returns 403 response if forbidden */
    private static function denyBackdatedJournal(Request $request, string $d): ?JsonResponse {
        if ($d >= now()->toDateString()) {
            return null;
        }
        if (\App\Helpers\hasOverridePermission($request->authUser, 'inventory.stock_journals.backdate')) {
            return null;
        }
        return response()->json(['error' => 'Backdating stock journals is not allowed without override permission.'], 403);
    }

    public function add(Request $request): JsonResponse {
        $v = $request->validate(['item_id' => 'required|uuid|exists:stock_items,id', 'location_id' => 'required|uuid|exists:locations,id', 'quantity' => 'required|numeric|min:0.01', 'notes' => 'nullable|string', 'journal_date' => 'nullable|date']);
        $jd = $v['journal_date'] ?? now()->toDateString();
        if ($r = self::denyBackdatedJournal($request, $jd)) {
            return $r;
        }
        unset($v['journal_date']);
        return DB::transaction(function () use ($v, $request, $jd) {
            $journal = StockJournal::create([...$v, 'type' => 'add', 'journal_date' => $jd, 'created_by' => $request->authUser->sub]);
            StockLedger::updateOrCreate(['item_id' => $v['item_id'], 'location_id' => $v['location_id']], ['quantity' => DB::raw("COALESCE(quantity, 0) + {$v['quantity']}")]);
            return response()->json($journal, 201);
        });
    }

    public function transfer(Request $request): JsonResponse {
        $v = $request->validate(['item_id' => 'required|uuid|exists:stock_items,id', 'from_location' => 'required|uuid|exists:locations,id', 'to_location' => 'required|uuid|exists:locations,id', 'quantity' => 'required|numeric|min:0.01', 'notes' => 'nullable|string', 'journal_date' => 'nullable|date']);
        $jd = $v['journal_date'] ?? now()->toDateString();
        if ($r = self::denyBackdatedJournal($request, $jd)) {
            return $r;
        }
        unset($v['journal_date']);
        return DB::transaction(function () use ($v, $request, $jd) {
            $from = StockLedger::where('item_id', $v['item_id'])->where('location_id', $v['from_location'])->first();
            if (!$from || $from->quantity < $v['quantity']) {
                return response()->json(['error' => 'Insufficient stock'], 422);
            }
            $journal = StockJournal::create([...$v, 'type' => 'transfer', 'journal_date' => $jd, 'created_by' => $request->authUser->sub]);
            $from->decrement('quantity', $v['quantity']);
            StockLedger::updateOrCreate(['item_id' => $v['item_id'], 'location_id' => $v['to_location']], ['quantity' => DB::raw("COALESCE(quantity, 0) + {$v['quantity']}")]);
            return response()->json($journal, 201);
        });
    }

    public function remove(Request $request): JsonResponse {
        $v = $request->validate(['item_id' => 'required|uuid|exists:stock_items,id', 'location_id' => 'required|uuid|exists:locations,id', 'quantity' => 'required|numeric|min:0.01', 'notes' => 'nullable|string', 'journal_date' => 'nullable|date']);
        $jd = $v['journal_date'] ?? now()->toDateString();
        if ($r = self::denyBackdatedJournal($request, $jd)) {
            return $r;
        }
        unset($v['journal_date']);
        return DB::transaction(function () use ($v, $request, $jd) {
            $ledger = StockLedger::where('item_id', $v['item_id'])->where('location_id', $v['location_id'])->first();
            if (!$ledger || $ledger->quantity < $v['quantity']) {
                return response()->json(['error' => 'Insufficient stock'], 422);
            }
            StockJournal::create([...$v, 'type' => 'remove', 'journal_date' => $jd, 'created_by' => $request->authUser->sub]);
            $ledger->decrement('quantity', $v['quantity']);
            return response()->json(['success' => true], 201);
        });
    }
}
