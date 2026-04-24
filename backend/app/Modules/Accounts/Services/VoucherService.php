<?php

namespace App\Modules\Accounts\Services;

use App\Events\VoucherPosted;
use App\Models\LedgerAccount;
use App\Models\LedgerEntry;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;

class VoucherService {
    private array $DEBIT_TYPES = ['debit_note', 'sales_reverse'];
    private array $CREDIT_TYPES = ['receipt', 'credit_note', 'discount'];

    public function post(array $data, string $userId): Voucher {
        $txDate = $data['transaction_date'];

        if ($txDate < now()->startOfDay()->toDateString() && empty($data['override_reason'])) {
            throw new \Exception('Backdated transactions require an override reason', 422);
        }

        return DB::transaction(function () use ($data, $userId, $txDate) {
            $ledger = LedgerAccount::lockForUpdate()->findOrFail($data['ledger_id']);

            $voucher = Voucher::create([
                'voucher_number' => 'VCH-' . now()->format('YmdHis'),
                'ledger_id' => $ledger->id,
                'type' => $data['type'],
                'status' => 'posted',
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'NGN',
                'reference' => $data['reference'] ?? null,
                'notes' => $data['notes'] ?? null,
                'transaction_date' => $txDate,
                'posted_at' => now(),
                'created_by' => $userId,
                'override_by' => $txDate < now()->startOfDay()->toDateString() ? $userId : null,
                'override_reason' => $data['override_reason'] ?? null,
            ]);

            [$debitSide, $creditSide] = $this->resolveSides($data['type'], $ledger->type);

            LedgerEntry::create(['voucher_id' => $voucher->id, 'ledger_id' => $ledger->id, 'side' => $debitSide, 'amount' => $data['amount'], 'description' => $data['notes'] ?? $data['type'], 'created_at' => now()]);
            LedgerEntry::create(['voucher_id' => $voucher->id, 'ledger_id' => $ledger->id, 'side' => $creditSide, 'amount' => $data['amount'], 'description' => $data['notes'] ?? $data['type'], 'created_at' => now()]);

            $this->updateBalance($ledger, $data['amount'], $data['type']);

            VoucherPosted::dispatch($voucher, $userId);

            return $voucher;
        });
    }

    public function reverse(string $voucherId, string $userId, string $reason): Voucher {
        return DB::transaction(function () use ($voucherId, $userId, $reason) {
            $original = Voucher::where('status', 'posted')->lockForUpdate()->findOrFail($voucherId);
            $ledger = LedgerAccount::lockForUpdate()->findOrFail($original->ledger_id);

            $reversal = Voucher::create([
                'voucher_number' => 'VCH-REV-' . now()->format('YmdHis'),
                'ledger_id' => $original->ledger_id,
                'type' => 'sales_reverse',
                'status' => 'posted',
                'amount' => $original->amount,
                'currency' => $original->currency,
                'reference' => $original->voucher_number,
                'notes' => $reason,
                'transaction_date' => now()->toDateString(),
                'posted_at' => now(),
                'created_by' => $userId,
                'reversal_of' => $original->id,
            ]);

            $reverseType = in_array($original->type, $this->DEBIT_TYPES) ? $this->CREDIT_TYPES[0] : $this->DEBIT_TYPES[0];
            $this->updateBalance($ledger, $original->amount, $reverseType);

            $original->update(['status' => 'reversed', 'reversed_at' => now()]);

            return $reversal;
        });
    }

    private function resolveSides(string $type, string $ledgerType): array {
        $isDebit = in_array($type, $this->DEBIT_TYPES);
        if ($ledgerType === 'debtor') {
            return $isDebit ? ['debit', 'credit'] : ['credit', 'debit'];
        }
        return $isDebit ? ['credit', 'debit'] : ['debit', 'credit'];
    }

    private function updateBalance(LedgerAccount $ledger, float $amount, string $type): void {
        $isDebit = in_array($type, $this->DEBIT_TYPES);
        if ($ledger->type === 'debtor') {
            $isDebit ? $ledger->decrement('current_balance', $amount) : $ledger->increment('current_balance', $amount);
        } else {
            $isDebit ? $ledger->increment('current_balance', $amount) : $ledger->decrement('current_balance', $amount);
        }
    }
}
