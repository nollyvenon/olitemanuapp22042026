<?php

namespace App\Modules\Accounts\Http\Controllers;

use App\Models\Receipt;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\LedgerAccount;
use Illuminate\Support\Facades\DB;

class ReceiptController
{
    public function __construct(private AuditService $auditService) {}

    public function index(Request $request): JsonResponse
    {
        $receipts = Receipt::with(['customer', 'ledgerAccount', 'createdBy'])
            ->when($request->customer_id, fn ($query, $customer_id) => $query->where('customer_id', $customer_id))
            ->when($request->start_date, fn ($query, $start_date) => $query->whereDate('date', '>=', $start_date))
            ->when($request->end_date, fn ($query, $end_date) => $query->whereDate('date', '<=', $end_date))
            ->orderBy('date', 'desc')
            ->paginate(20);
        return response()->json($receipts);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|uuid|exists:customers,id',
            'ledger_account_id' => 'required|uuid|exists:ledger_accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|max:255',
            'reference' => 'nullable|string|max:255',
            'date' => 'required|date',
        ]);

        if ($validated['date'] < now()->toDateString() && !\App\Helpers\hasOverridePermission($request->authUser, 'accounts.receipts.backdate')) {
            return response()->json(['error' => 'Backdating receipts is not allowed without override permission.'], 403);
        }

        DB::beginTransaction();
        try {
            $receipt = Receipt::create(array_merge($validated, [
                'receipt_number' => 'RCPT-' . now()->format('YmdHis') . '-' . substr(str_replace('.', '', uniqid('', true)), -6),
                'created_by' => $request->authUser->sub,
            ]));

            // Credit the customer's ledger account
            $ledgerAccount = LedgerAccount::findOrFail($validated['ledger_account_id']);
            $ledgerAccount->current_balance -= $validated['amount'];
            $ledgerAccount->save();

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'CREATE',
                'entity_type' => 'receipts',
                'entity_id' => $receipt->id,
                'after_snapshot' => $receipt->toArray(),
            ]);

            DB::commit();
            return response()->json($receipt, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create receipt: ' . $e->getMessage()], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        $receipt = Receipt::with(['customer', 'ledgerAccount', 'createdBy'])->findOrFail($id);
        return response()->json($receipt);
    }

    // No update or delete as per requirements (receipts are immutable transactions)
}