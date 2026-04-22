<?php

namespace App\Modules\Accounts\Http\Controllers;

use App\Models\Voucher;
use App\Modules\Accounts\Services\VoucherService;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoucherController {
    public function __construct(private VoucherService $voucherService, private AuditService $auditService) {}

    public function index(Request $request): JsonResponse {
        $vouchers = Voucher::with('ledger', 'entries')
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->ledger_id, fn($q) => $q->where('ledger_id', $request->ledger_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($vouchers);
    }

    public function store(Request $request): JsonResponse {
        try {
            $validated = $request->validate([
                'ledger_id' => 'required|uuid|exists:ledger_accounts,id',
                'type' => 'required|in:receipt,credit_note,debit_note,discount,sales_reverse',
                'amount' => 'required|numeric|min:0.01',
                'currency' => 'nullable|string|size:3',
                'reference' => 'nullable|string|max:255',
                'notes' => 'nullable|string',
                'transaction_date' => 'required|date',
                'override_reason' => 'nullable|string',
            ]);

            $voucher = $this->voucherService->post($validated, $request->authUser->sub);

            return response()->json($voucher, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function show(Request $request, string $id): JsonResponse {
        $voucher = Voucher::with('ledger', 'entries')->findOrFail($id);
        return response()->json($voucher);
    }

    public function reverse(Request $request, string $id): JsonResponse {
        try {
            $validated = $request->validate([
                'reason' => 'required|string',
            ]);

            $reversal = $this->voucherService->reverse($id, $request->authUser->sub, $validated['reason']);

            return response()->json($reversal, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }
}
