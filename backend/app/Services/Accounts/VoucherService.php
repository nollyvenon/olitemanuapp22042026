<?php
namespace App\Services\Accounts;
use App\Models\Accounts\Voucher;
use App\Models\Accounts\AccountLedger;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class VoucherService
{
    public function __construct(private LedgerService $ledgerService) {}

    public function createVoucher(array $data, User $creator): Voucher
    {
        if (!$data['backdated'] && $data['transaction_date'] < now()) {
            throw new \Exception('Backdating not allowed without override reason');
        }

        return DB::transaction(function () use ($data, $creator) {
            $voucher = Voucher::create([
                'id' => Str::uuid(),
                'voucher_number' => 'V-' . date('YmdHis') . '-' . Str::random(6),
                'type' => $data['type'],
                'ledger_id' => $data['ledger_id'],
                'approved_order_id' => $data['approved_order_id'] ?? null,
                'amount' => $data['amount'],
                'description' => $data['description'] ?? null,
                'backdated' => $data['backdated'] ?? false,
                'backdated_reason' => $data['backdated_reason'] ?? null,
                'created_by' => $creator->id,
                'transaction_date' => $data['transaction_date'],
            ]);

            $ledger = AccountLedger::find($data['ledger_id']);
            $operation = in_array($data['type'], ['receipt', 'credit_note']) ? 'deduct' : 'add';
            $this->ledgerService->updateBalance($ledger, $data['amount'], $operation);

            return $voucher;
        });
    }

    public function approveVoucher(Voucher $voucher, User $approver): void
    {
        $voucher->update(['approved_by' => $approver->id, 'approved_at' => now()]);
    }
}
