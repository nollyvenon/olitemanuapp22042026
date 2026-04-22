<?php
namespace App\Http\Controllers\Accounts;
use App\Http\Controllers\Controller;
use App\Models\Accounts\Voucher;
use App\Services\Accounts\VoucherService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
class VoucherController extends Controller
{
    public function __construct(private VoucherService $voucherService) {}
    public function createVoucher(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'type' => 'required|in:receipt,credit_note,debit_note,discount,sales_reverse',
                'ledger_id' => 'required|uuid|exists:account_ledgers,id',
                'amount' => 'required|numeric|min:0.01',
                'description' => 'nullable|string',
                'backdated' => 'boolean',
                'backdated_reason' => 'required_if:backdated,true|string|max:500',
                'transaction_date' => 'required|date',
                'approved_order_id' => 'nullable|uuid|exists:approved_orders,id',
            ]);
            $voucher = $this->voucherService->createVoucher($validated, $request->user());
            return response()->json($voucher, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
    public function approveVoucher(Voucher $voucher, Request $request): JsonResponse
    {
        $this->voucherService->approveVoucher($voucher, $request->user());
        return response()->json($voucher);
    }
    public function getLedgerVouchers(Request $request): JsonResponse
    {
        $ledgerId = $request->query('ledger_id');
        $vouchers = Voucher::where('ledger_id', $ledgerId)->with('ledger', 'creator', 'approver')->orderBy('transaction_date', 'desc')->paginate(20);
        return response()->json($vouchers);
    }
}
