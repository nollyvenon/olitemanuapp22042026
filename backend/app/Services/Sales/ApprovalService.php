<?php

namespace App\Services\Sales;

use App\Models\Sales\SalesOrder;
use App\Models\Sales\ApprovedOrder;
use App\Models\Sales\ApprovedOrderItem;
use App\Models\User;
use Illuminate\Support\Str;

class ApprovalService
{
    public function approveOrder(SalesOrder $order, User $salesAdmin, array $items, ?string $notes = null): ApprovedOrder
    {
        if ($order->status !== 'submitted') {
            throw new \Exception('Only submitted orders can be approved');
        }

        $approvedOrder = ApprovedOrder::create([
            'id' => Str::uuid(),
            'approved_order_number' => 'AO-' . date('YmdHis') . '-' . Str::random(6),
            'sales_order_id' => $order->id,
            'sales_admin_id' => $salesAdmin->id,
            'status' => 'approved',
            'subtotal' => 0,
            'tax' => 0,
            'total' => 0,
            'approval_notes' => $notes,
        ]);

        foreach ($items as $item) {
            ApprovedOrderItem::create([
                'id' => Str::uuid(),
                'approved_order_id' => $approvedOrder->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'line_total' => $item['quantity'] * $item['unit_price'],
            ]);
        }

        $this->recalculateTotals($approvedOrder);
        $order->update(['status' => 'approved']);

        return $approvedOrder->refresh();
    }

    public function editApprovedOrder(ApprovedOrder $order, array $items): ApprovedOrder
    {
        if ($order->status !== 'approved') {
            throw new \Exception('Only approved orders awaiting authorization can be edited');
        }

        $order->items()->delete();

        foreach ($items as $item) {
            ApprovedOrderItem::create([
                'id' => Str::uuid(),
                'approved_order_id' => $order->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'line_total' => $item['quantity'] * $item['unit_price'],
            ]);
        }

        $this->recalculateTotals($order);
        return $order->refresh();
    }

    public function moveToAuthorization(ApprovedOrder $order): ApprovedOrder
    {
        $order->update(['status' => 'awaiting_authorization']);
        return $order;
    }

    private function recalculateTotals(ApprovedOrder $order): void
    {
        $subtotal = $order->items()->sum('line_total');
        $tax = $subtotal * 0.1;
        $total = $subtotal + $tax;

        $order->update([
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total' => $total,
        ]);
    }
}
