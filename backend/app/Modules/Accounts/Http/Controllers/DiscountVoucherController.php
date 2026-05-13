<?php

namespace App\Modules\Accounts\Http\Controllers;

use App\Models\DiscountVoucher;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\LedgerAccount;
use App\Models\Invoice;
use Illuminate\Support\Facades\DB;

class DiscountVoucherController
{
    public function __construct(private AuditService $auditService) {}

    public function index(Request $request): JsonResponse
    {
        $discountVouchers = DiscountVoucher::with(['customer', 'invoice', 'ledgerAccount', 'createdBy'])
            ->when($request->customer_id, fn ($query, $customer_id) => $query->where('customer_id', $customer_id))
            ->when($request->invoice_id, fn ($query, $invoice_id) => $query->where('invoice_id', $invoice_id))
            ->when($request->start_date, fn ($query, $start_date) => $query->whereDate('date', '>=', $start_date))
            ->when($request->end_date, fn ($query, $end_date) => $query->whereDate('date', '<=', $end_date))
            ->orderBy('date', 'desc')
            ->paginate(20);
        return response()->json($discountVouchers);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|uuid|exists:customers,id',
            'invoice_id' => 'nullable|uuid|exists:invoices,id',
            'ledger_account_id' => 'required|uuid|exists:ledger_accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'nullable|string|max:1000',
            'date' => 'required|date',
        ]);

        if ($validated['date'] < now()->toDateString() && !\App\Helpers\hasOverridePermission($request->authUser, 'accounts.discount_vouchers.backdate')) {
            return response()->json(['error' => 'Backdating discount vouchers is not allowed without override permission.'], 403);
        }

        DB::beginTransaction();
        try {
            $discountVoucher = DiscountVoucher::create(array_merge($validated, [
                'voucher_number' => 'DISC-' . now()->format('YmdHis') . '-' . substr(str_replace('.', '', uniqid('', true)), -6),
                'created_by' => $request->authUser->sub,
            ]));

            // Deduct the discount amount from the customer's ledger account
            $ledgerAccount = LedgerAccount::findOrFail($validated['ledger_account_id']);
            $ledgerAccount->current_balance -= $validated['amount'];
            $ledgerAccount->save();

            // Optionally update the invoice balance if an invoice is linked
            if (isset($validated['invoice_id'])) {
                $invoice = Invoice::findOrFail($validated['invoice_id']);
                $invoice->total = max(0, (float) $invoice->total - (float) $validated['amount']);
                $invoice->save();
            }

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'CREATE',
                'entity_type' => 'discount_vouchers',
                'entity_id' => $discountVoucher->id,
                'after_snapshot' => $discountVoucher->toArray(),
            ]);

            DB::commit();
            return response()->json($discountVoucher, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create discount voucher: ' . $e->getMessage()], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        $discountVoucher = DiscountVoucher::with(['customer', 'invoice', 'ledgerAccount', 'createdBy'])->findOrFail($id);
        return response()->json($discountVoucher);
    }
}
