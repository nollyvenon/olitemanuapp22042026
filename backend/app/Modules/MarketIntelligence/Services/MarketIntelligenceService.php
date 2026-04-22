<?php

namespace App\Modules\MarketIntelligence\Services;

use App\Models\Voucher;
use App\Models\Customer;
use App\Models\CustomerInsight;

class MarketIntelligenceService {
    public function updateCustomerInsights(string $customerId): CustomerInsight {
        $customer = Customer::findOrFail($customerId);
        $vouchers = Voucher::where('ledger_id', $customerId)->get();
        
        $ltv = $vouchers->sum('amount');
        $count = $vouchers->count();
        $avg = $count > 0 ? $ltv / $count : 0;
        $lastPurchase = $vouchers->max('created_at');

        return CustomerInsight::updateOrCreate(
            ['customer_id' => $customerId],
            [
                'lifetime_value' => $ltv,
                'avg_purchase_value' => $avg,
                'purchase_frequency' => $count,
                'last_purchase_at' => $lastPurchase,
                'segment' => $this->classifySegment($ltv, $count),
            ]
        );
    }

    private function classifySegment(float $ltv, int $count): string {
        if ($ltv > 500000) return 'VIP';
        if ($ltv > 100000) return 'Premium';
        if ($count > 20) return 'Loyal';
        return 'Standard';
    }
}
