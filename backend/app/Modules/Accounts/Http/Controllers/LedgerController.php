<?php

namespace App\Modules\Accounts\Http\Controllers;

use App\Models\LedgerAccount;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LedgerController {
    public function __construct(private AuditService $auditService) {}

    public function index(Request $request): JsonResponse {
        $ledgers = LedgerAccount::with('customer', 'location', 'territory', 'salesOfficer')
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->location_id, fn($q) => $q->where('location_id', $request->location_id))
            ->when($request->territory_id, fn($q) => $q->where('territory_id', $request->territory_id))
            ->when($request->sales_officer_id, fn($q) => $q->where('sales_officer_id', $request->sales_officer_id))
            ->paginate(20);

        return response()->json($ledgers);
    }

    public function show(Request $request, string $id): JsonResponse {
        $ledger = LedgerAccount::with('customer', 'location', 'territory', 'salesOfficer', 'priceList')->findOrFail($id);
        return response()->json($ledger);
    }

    public function store(Request $request): JsonResponse {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'type' => 'required|in:debtor,creditor',
                'customer_id' => 'nullable|uuid|exists:customers,id',
                'location_id' => 'required|uuid|exists:locations,id',
                'territory_id' => 'nullable|uuid|exists:territories,id',
                'price_list_version_id' => 'nullable|uuid|exists:price_list_versions,id',
                'sales_officer_id' => 'nullable|uuid|exists:users,id',
                'credit_limit' => 'nullable|numeric|min:0',
                'opening_balance' => 'nullable|numeric',
            ]);

            $validated['account_number'] = 'ACC-' . now()->format('YmdHis');
            $validated['current_balance'] = $validated['opening_balance'] ?? 0;
            $validated['created_by'] = $request->authUser->sub;

            $ledger = LedgerAccount::create($validated);

            $this->auditService->log(['user_id' => $request->authUser->sub, 'action_type' => 'CREATE', 'entity_type' => 'ledger_accounts', 'entity_id' => $ledger->id, 'after_snapshot' => $ledger->toArray()]);

            return response()->json($ledger, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse {
        try {
            $ledger = LedgerAccount::findOrFail($id);
            $before = $ledger->toArray();

            $validated = $request->validate([
                'name' => 'nullable|string|max:255',
                'territory_id' => 'nullable|uuid|exists:territories,id',
                'price_list_version_id' => 'nullable|uuid|exists:price_list_versions,id',
                'sales_officer_id' => 'nullable|uuid|exists:users,id',
                'credit_limit' => 'nullable|numeric|min:0',
                'is_active' => 'nullable|boolean',
            ]);

            $ledger->update($validated);

            $this->auditService->log(['user_id' => $request->authUser->sub, 'action_type' => 'UPDATE', 'entity_type' => 'ledger_accounts', 'entity_id' => $id, 'before_snapshot' => $before, 'after_snapshot' => $ledger->toArray()]);

            return response()->json($ledger);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function statement(Request $request, string $id): JsonResponse {
        $ledger = LedgerAccount::findOrFail($id);
        $entries = $ledger->entries()
            ->with('voucher')
            ->when($request->from, fn($q) => $q->where('created_at', '>=', $request->from))
            ->when($request->to, fn($q) => $q->where('created_at', '<=', $request->to))
            ->orderBy('created_at')
            ->get();

        $debit = $entries->where('side', 'debit')->sum('amount');
        $credit = $entries->where('side', 'credit')->sum('amount');

        return response()->json([
            'ledger' => $ledger,
            'entries' => $entries,
            'summary' => ['total_debit' => $debit, 'total_credit' => $credit, 'balance' => $credit - $debit],
        ]);
    }
}
