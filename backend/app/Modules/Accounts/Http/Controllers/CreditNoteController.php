<?php

namespace App\Modules\Accounts\Http\Controllers;

use App\Models\CreditNote;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\LedgerAccount;
use Illuminate\Support\Facades\DB;

class CreditNoteController
{
    public function __construct(private AuditService $auditService) {}

    public function index(Request $request): JsonResponse
    {
        $creditNotes = CreditNote::with(['customer', 'ledgerAccount', 'createdBy'])
            ->when($request->customer_id, fn ($query, $customer_id) => $query->where('customer_id', $customer_id))
            ->when($request->start_date, fn ($query, $start_date) => $query->whereDate('date', '>=', $start_date))
            ->when($request->end_date, fn ($query, $end_date) => $query->whereDate('date', '<=', $end_date))
            ->orderBy('date', 'desc')
            ->paginate(20);
        return response()->json($creditNotes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|uuid|exists:customers,id',
            'ledger_account_id' => 'required|uuid|exists:ledger_accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'nullable|string|max:1000',
            'date' => 'required|date',
        ]);

        if ($validated['date'] < now()->toDateString() && !\App\Helpers\hasOverridePermission($request->authUser, 'accounts.credit_notes.backdate')) {
            return response()->json(['error' => 'Backdating credit notes is not allowed without override permission.'], 403);
        }

        DB::beginTransaction();
        try {
            $creditNote = CreditNote::create(array_merge($validated, [
                'credit_note_number' => 'CN-' . now()->format('YmdHis') . '-' . substr(str_replace('.', '', uniqid('', true)), -6),
                'created_by' => $request->authUser->sub,
            ]));

            // Credit the customer's ledger account
            $ledgerAccount = LedgerAccount::findOrFail($validated['ledger_account_id']);
            $ledgerAccount->current_balance -= $validated['amount']; // Assuming credit notes reduce outstanding balance
            $ledgerAccount->save();

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'CREATE',
                'entity_type' => 'credit_notes',
                'entity_id' => $creditNote->id,
                'after_snapshot' => $creditNote->toArray(),
            ]);

            DB::commit();
            return response()->json($creditNote, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create credit note: ' . $e->getMessage()], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        $creditNote = CreditNote::with(['customer', 'ledgerAccount', 'createdBy'])->findOrFail($id);
        return response()->json($creditNote);
    }
}
