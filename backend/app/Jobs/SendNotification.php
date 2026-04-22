<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $type,
        public array $data,
    ) {
        $this->onQueue('low');
        $this->timeout = 30;
    }

    public function handle(): void
    {
        $message = match ($this->type) {
            'low_stock' => "Product {$this->data['product_name']} stock is low",
            'order_status' => "Order {$this->data['order_number']} status: {$this->data['status']}",
            'invoice_due' => "Invoice {$this->data['invoice_number']} is due",
            default => 'Notification',
        };

        // Send via mail, sms, websocket, etc.
        // For now, just log
        \Log::info("Notification sent to {$this->user->email}: {$message}");
    }

    public function failed(\Throwable $exception): void
    {
        \Log::warning("Notification failed for {$this->user->email}", [
            'type' => $this->type,
            'error' => $exception->getMessage(),
        ]);
    }
}
