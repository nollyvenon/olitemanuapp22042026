<?php

namespace App\Modules\Sales\Http\Controllers;

use App\Models\SalesReverse;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\LedgerAccount;
use Illuminate\Support\Facades\DB;

class SalesReverseController
{
    public function __construct(private AuditService $auditService) {}

    public function index(Request $request): JsonResponse
    {
        $salesReverses = SalesReverse::with(['invoice', 'customer', 'ledgerAccount', 'createdBy'])
            ->when($request->invoice_id, fn ($query, $invoice_id) => $query->where('invoice_id', $invoice_id))
            ->when($request->customer_id, fn ($query, $customer_id) => $query->where('customer_id', $customer_id))
            ->when($request->start_date, fn ($query, $start_date) => $query->whereDate('date', '>=', $start_date))
            ->when($request->end_date, fn ($query, $end_date) => $query->whereDate('date', '<=', $end_date))
            ->orderBy('date', 'desc')
            ->paginate(20);
        return response()->json($salesReverses);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invoice_id' => 'required|uuid|exists:invoices,id',
            'customer_id' => 'required|uuid|exists:customers,id',
            'ledger_account_id' => 'required|uuid|exists:ledger_accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'nullable|string|max:1000',
            'date' => 'required|date',
        ]);

        if ($validated['date'] < now()->toDateString() && !\App\Helpers\hasOverridePermission($request->authUser, 'sales.sales_reverses.backdate')) {
            return response()->json(['error' => 'Backdating sales reverses is not allowed without override permission.'], 403);
        }

        DB::beginTransaction();
        try {
            $salesReverse = SalesReverse::create(array_merge($validated, [
                'reverse_number' => 'SREV-' . now()->format('YmdHis') . '-' . substr(str_replace('.', '', uniqid('', true)), -6),
                'created_by' => $request->authUser->sub,
            ]));

            // Reverse the invoice amount in the customer's ledger account
            $ledgerAccount = LedgerAccount::findOrFail($validated['ledger_account_id']);
            $ledgerAccount->current_balance -= $validated['amount']; // Assuming sales reverse reduces outstanding balance
            $ledgerAccount->save();

            // Optionally update the invoice status or balance
            $invoice = Invoice::findOrFail($validated['invoice_id']);
            $invoice->status = 'reversed'; // Or update a 'remaining_amount' field
            $invoice->save();

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'CREATE',
                'entity_type' => 'sales_reverses',
                'entity_id' => $salesReverse->id,
                'after_snapshot' => $salesReverse->toArray(),
            ]);

            DB::commit();
            return response()->json($salesReverse, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create sales reverse: ' . $e->getMessage()], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        $salesReverse = SalesReverse::with(['invoice', 'customer', 'ledgerAccount', 'createdBy'])->findOrFail($id);
        return response()->json($salesReverse);
    }
}
