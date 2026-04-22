<?php

namespace App\Jobs;

use App\Models\Sales\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessInvoice implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Invoice $invoice)
    {
        $this->onQueue('default');
        $this->timeout = 120; // 2 minutes
    }

    public function handle(): void
    {
        // Mark as issued
        $this->invoice->update(['status' => 'issued']);

        // Send email to customer
        // Mail::to($this->invoice->customer->email)
        //     ->send(new InvoiceNotification($this->invoice));

        // Create audit log
        \Log::info("Invoice processed: {$this->invoice->invoice_number}");
    }

    public function failed(\Throwable $exception): void
    {
        $this->invoice->update(['status' => 'draft']);

        \Log::error("Invoice processing failed: {$this->invoice->invoice_number}", [
            'error' => $exception->getMessage(),
        ]);
    }
}
