<?php

namespace App\Modules\Sales\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Order;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController {
    public function __construct(private AuditService $auditService) {}

    public function index(Request $request): JsonResponse {
        $invoices = Invoice::with('customer', 'items')->orderBy('invoice_date', 'desc')->paginate(20);
        return response()->json($invoices);
    }

    public function show(Request $request, string $id): JsonResponse {
        $invoice = Invoice::with('customer', 'items', 'payments')->findOrFail($id);
        return response()->json($invoice);
    }

    public function store(Request $request): JsonResponse {
        try {
            $validated = $request->validate([
                'order_id' => 'required|uuid|exists:orders,id',
                'invoice_date' => 'required|date',
                'due_date' => 'required|date|after:invoice_date',
            ]);

            $order = Order::with('customer', 'items')->findOrFail($validated['order_id']);

            $invoice = Invoice::create([
                'invoice_number' => 'INV-' . now()->format('YmdHis'),
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'issued_by' => $request->authUser->sub,
                'invoice_date' => $validated['invoice_date'],
                'due_date' => $validated['due_date'],
                'status' => 'draft',
                'subtotal' => $order->subtotal,
                'tax' => $order->tax,
                'total' => $order->total,
            ]);

            foreach ($order->items as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'order_item_id' => $item->id,
                    'description' => $item->product_name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total_price' => $item->total_price,
                ]);
            }

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'CREATE',
                'entity_type' => 'invoices',
                'entity_id' => $invoice->id,
                'after_snapshot' => $invoice->toArray(),
            ]);

            return response()->json($invoice->load('items'), 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, string $id): JsonResponse {
        try {
            $invoice = Invoice::findOrFail($id);
            $before = $invoice->toArray();

            $validated = $request->validate([
                'status' => 'required|in:draft,sent,paid,overdue,cancelled',
            ]);

            $invoice->update($validated);

            if ($validated['status'] === 'paid') {
                $invoice->update(['paid_at' => now()]);
            }

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'UPDATE',
                'entity_type' => 'invoices',
                'entity_id' => $id,
                'before_snapshot' => $before,
                'after_snapshot' => $invoice->toArray(),
            ]);

            return response()->json($invoice);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
