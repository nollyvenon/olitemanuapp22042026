<?php

namespace App\Modules\Accounts\Http\Controllers;

use App\Models\DebitNote;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\LedgerAccount;
use Illuminate\Support\Facades\DB;

class DebitNoteController
{
    public function __construct(private AuditService $auditService) {}

    public function index(Request $request): JsonResponse
    {
        $debitNotes = DebitNote::with(['customer', 'ledgerAccount', 'createdBy'])
            ->when($request->customer_id, fn ($query, $customer_id) => $query->where('customer_id', $customer_id))
            ->when($request->start_date, fn ($query, $start_date) => $query->whereDate('date', '>=', $start_date))
            ->when($request->end_date, fn ($query, $end_date) => $query->whereDate('date', '<=', $end_date))
            ->orderBy('date', 'desc')
            ->paginate(20);
        return response()->json($debitNotes);
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

        if ($validated['date'] < now()->toDateString() && !\App\Helpers\hasOverridePermission($request->authUser, 'accounts.debit_notes.backdate')) {
            return response()->json(['error' => 'Backdating debit notes is not allowed without override permission.'], 403);
        }

        DB::beginTransaction();
        try {
            $debitNote = DebitNote::create(array_merge($validated, [
                'debit_note_number' => 'DN-' . now()->format('YmdHis') . '-' . substr(str_replace('.', '', uniqid('', true)), -6),
                'created_by' => $request->authUser->sub,
            ]));

            // Debit the customer's ledger account
            $ledgerAccount = LedgerAccount::findOrFail($validated['ledger_account_id']);
            $ledgerAccount->current_balance += $validated['amount']; // Assuming debit notes increase outstanding balance
            $ledgerAccount->save();

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'CREATE',
                'entity_type' => 'debit_notes',
                'entity_id' => $debitNote->id,
                'after_snapshot' => $debitNote->toArray(),
            ]);

            DB::commit();
            return response()->json($debitNote, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create debit note: ' . $e->getMessage()], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        $debitNote = DebitNote::with(['customer', 'ledgerAccount', 'createdBy'])->findOrFail($id);
        return response()->json($debitNote);
    }
}
