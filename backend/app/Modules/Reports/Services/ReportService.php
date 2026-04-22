<?php

namespace App\Modules\Reports\Services;

use App\Models\Report;
use App\Models\Voucher;
use App\Models\StockJournal;
use App\Models\LedgerAccount;

class ReportService {
    public function salesReport(array $filters): array {
        $query = Voucher::with('ledger', 'entries');
        if ($filters['from'] ?? null) $query->where('created_at', '>=', $filters['from']);
        if ($filters['to'] ?? null) $query->where('created_at', '<=', $filters['to']);
        if ($filters['ledger_id'] ?? null) $query->where('ledger_id', $filters['ledger_id']);

        $vouchers = $query->get();
        $total = $vouchers->sum('amount');

        return ['vouchers' => $vouchers, 'total_amount' => $total, 'count' => $vouchers->count()];
    }

    public function inventoryReport(array $filters): array {
        $query = StockJournal::with('item', 'location');
        if ($filters['from'] ?? null) $query->where('created_at', '>=', $filters['from']);
        if ($filters['to'] ?? null) $query->where('created_at', '<=', $filters['to']);
        if ($filters['location_id'] ?? null) $query->where('location_id', $filters['location_id']);

        return ['journals' => $query->get()];
    }

    public function ledgerReport(array $filters): array {
        $query = LedgerAccount::with('location', 'territory');
        if ($filters['location_id'] ?? null) $query->where('location_id', $filters['location_id']);
        if ($filters['territory_id'] ?? null) $query->where('territory_id', $filters['territory_id']);

        return ['ledgers' => $query->get()];
    }
}
