<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

class GenerateReport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $reportType,
        public ?string $startDate = null,
        public ?string $endDate = null,
        public ?string $userId = null,
    ) {
        $this->onQueue('high');
        $this->timeout = 300; // 5 minutes
    }

    public function handle(): void
    {
        $data = match ($this->reportType) {
            'sales' => $this->generateSalesReport(),
            'inventory' => $this->generateInventoryReport(),
            'accounts' => $this->generateAccountsReport(),
            default => [],
        };

        // Store or send report to user
        // For now, just log
        \Log::info("Report generated: {$this->reportType}", ['data_count' => count($data)]);
    }

    private function generateSalesReport(): array
    {
        $query = \App\Models\Sales\Order::query();

        if ($this->startDate) {
            $query->whereDate('created_at', '>=', $this->startDate);
        }

        if ($this->endDate) {
            $query->whereDate('created_at', '<=', $this->endDate);
        }

        return $query->get(['id', 'order_number', 'total', 'status'])->toArray();
    }

    private function generateInventoryReport(): array
    {
        return \App\Models\Product::whereNull('deleted_at')
            ->get(['id', 'sku', 'name', 'stock_quantity', 'price'])
            ->toArray();
    }

    private function generateAccountsReport(): array
    {
        return \App\Models\Accounts\Account::whereNull('deleted_at')
            ->get(['id', 'account_number', 'name', 'type', 'balance'])
            ->toArray();
    }

    public function failed(\Throwable $exception): void
    {
        \Log::error("Report generation failed: {$this->reportType}", [
            'error' => $exception->getMessage(),
        ]);
    }
}
