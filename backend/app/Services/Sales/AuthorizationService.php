<?php

namespace App\Services\Sales;

use App\Models\Sales\ApprovedOrder;
use App\Models\Sales\SalesInvoice;
use App\Models\Sales\OrderOverride;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Str;

class AuthorizationService
{
    public function validateStockAvailability(ApprovedOrder $order): array
    {
        $insufficientItems = [];

        foreach ($order->items() as $item) {
            $product = $item->product;
            if ($product->stock_quantity < $item->quantity) {
                $insufficientItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'requested_quantity' => $item->quantity,
                    'available_stock' => $product->stock_quantity,
                ];
            }
        }

        return $insufficientItems;
    }

    public function requestOverride(ApprovedOrder $order, array $overrideItems, User $requester): void
    {
        foreach ($overrideItems as $override) {
            OrderOverride::create([
                'id' => Str::uuid(),
                'approved_order_id' => $order->id,
                'product_id' => $override['product_id'],
                'requested_quantity' => $override['requested_quantity'],
                'available_stock' => $override['available_stock'],
                'override_reason' => $override['reason'],
                'requested_by' => $requester->id,
                'status' => 'pending',
            ]);
        }

        $order->update(['status' => 'awaiting_authorization']);
    }

    public function approveOverride(OrderOverride $override, User $approver): void
    {
        if ($override->status !== 'pending') {
            throw new \Exception('Only pending overrides can be approved');
        }

        $override->update([
            'status' => 'approved',
            'approved_by' => $approver->id,
            'approved_at' => now(),
        ]);
    }

    public function rejectOverride(OrderOverride $override, User $rejecter): void
    {
        if ($override->status !== 'pending') {
            throw new \Exception('Only pending overrides can be rejected');
        }

        $override->update([
            'status' => 'rejected',
            'approved_by' => $rejecter->id,
            'approved_at' => now(),
        ]);
    }

    public function authorizeInvoice(ApprovedOrder $order, User $accountant, string $tallyInvoiceFile, string $deliveryNoteFile, ?string $notes = null): SalesInvoice
    {
        $insufficientStock = $this->validateStockAvailability($order);

        if (!empty($insufficientStock)) {
            throw new \Exception('Cannot authorize: insufficient stock. Overrides required.');
        }

        $invoice = SalesInvoice::create([
            'id' => Str::uuid(),
            'invoice_number' => 'INV-' . date('YmdHis') . '-' . Str::random(6),
            'approved_order_id' => $order->id,
            'status' => 'authorized',
            'tally_invoice_file' => $tallyInvoiceFile,
            'delivery_note_file' => $deliveryNoteFile,
            'total' => $order->total,
            'authorized_by' => $accountant->id,
            'authorized_at' => now(),
            'authorization_notes' => $notes,
        ]);

        $order->update(['status' => 'authorized']);

        return $invoice;
    }

    public function uploadInvoiceDocuments(ApprovedOrder $order, string $tallyFile, string $deliveryNoteFile): void
    {
        $invoice = $order->invoice()->first();

        if (!$invoice) {
            $invoice = SalesInvoice::create([
                'id' => Str::uuid(),
                'invoice_number' => 'INV-' . date('YmdHis') . '-' . Str::random(6),
                'approved_order_id' => $order->id,
                'status' => 'pending',
                'tally_invoice_file' => $tallyFile,
                'delivery_note_file' => $deliveryNoteFile,
                'total' => $order->total,
            ]);
        } else {
            $invoice->update([
                'tally_invoice_file' => $tallyFile,
                'delivery_note_file' => $deliveryNoteFile,
            ]);
        }
    }
}
