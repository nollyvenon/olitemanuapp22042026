<?php

namespace App\Modules\Sales\Http\Controllers;

use App\Events\OrderStatusChanged;
use App\Models\Order;
use App\Modules\Accounts\Services\PriceListService;
use App\Modules\Audit\Services\AuditService;
use App\Modules\Sales\Services\OrderStateMachine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController {
    public function __construct(private AuditService $auditService, private OrderStateMachine $stateMachine, private PriceListService $priceService) {}

    public function index(Request $request): JsonResponse {
        $orders = Order::with('customer', 'items')->orderBy('order_date', 'desc')->paginate(20);
        return response()->json($orders);
    }

    public function show(Request $request, string $id): JsonResponse {
        $order = Order::with('customer', 'items', 'invoice')->findOrFail($id);
        return response()->json($order);
    }

    public function store(Request $request): JsonResponse {
        try {
            $validated = $request->validate([
                'customer_id' => 'required|uuid|exists:customers,id',
                'order_date' => 'required|date',
                'expected_delivery' => 'nullable|date',
                'form_status' => 'required|in:manual_captured,no_manual_form',
                'items' => 'required|array|min:1',
                'items.*.product_name' => 'required|string',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.unit_price' => 'required|numeric|min:0',
                'notes' => 'nullable|string',
            ]);

            $order = Order::create([
                'order_number' => 'ORD-' . now()->format('YmdHis'),
                'customer_id' => $validated['customer_id'],
                'created_by' => $request->authUser->sub,
                'order_date' => $validated['order_date'],
                'expected_delivery' => $validated['expected_delivery'],
                'form_status' => $validated['form_status'],
                'notes' => $validated['notes'],
                'status' => 'DRAFT',
            ]);

            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $resolvedPrice = $this->priceService->getPriceForItem($item['product_name']);
                $total = $item['quantity'] * $resolvedPrice;
                $order->items()->create([
                    'product_name' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $resolvedPrice,
                    'total_price' => $total,
                ]);
                $subtotal += $total;
            }

            $tax = $subtotal * 0.075;
            $order->update(['subtotal' => $subtotal, 'tax' => $tax, 'total' => $subtotal + $tax]);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'CREATE',
                'entity_type' => 'orders',
                'entity_id' => $order->id,
                'after_snapshot' => $order->toArray(),
            ]);

            return response()->json($order->load('items'), 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse {
        try {
            $order = Order::findOrFail($id);
            $before = $order->toArray();

            $validated = $request->validate([
                'status' => 'required|in:draft,confirmed,in_progress,completed,cancelled',
                'notes' => 'nullable|string',
            ]);

            $oldStatus = $order->status;
            $order->update($validated);

            if ($oldStatus !== $validated['status']) {
                OrderStatusChanged::dispatch($order, $oldStatus, $validated['status']);
            }

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'UPDATE',
                'entity_type' => 'orders',
                'entity_id' => $id,
                'before_snapshot' => $before,
                'after_snapshot' => $order->toArray(),
            ]);

            return response()->json($order);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function transition(Request $request, string $id): JsonResponse {
        try {
            $order = Order::findOrFail($id);
            $validated = $request->validate([
                'status' => 'required|string',
                'reason' => 'nullable|string',
            ]);

            $before = $order->toArray();
            $order = $this->stateMachine->transition($order, $validated['status'], $validated['reason'] ?? null);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'STATE_TRANSITION',
                'entity_type' => 'orders',
                'entity_id' => $id,
                'before_snapshot' => $before,
                'after_snapshot' => $order->toArray(),
                'metadata' => ['transition' => $validated['status']],
            ]);

            return response()->json($order);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function uploadDocuments(Request $request, string $id): JsonResponse {
        try {
            $order = Order::findOrFail($id);
            $validated = $request->validate([
                'tally_invoice' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
                'delivery_note' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            ]);

            $tallyPath = $validated['tally_invoice']->store("orders/{$id}/tally", 's3');
            $deliveryPath = $validated['delivery_note']->store("orders/{$id}/delivery", 's3');

            $order->update([
                'tally_invoice_path' => $tallyPath,
                'delivery_note_path' => $deliveryPath,
            ]);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'UPLOAD',
                'entity_type' => 'orders',
                'entity_id' => $id,
                'after_snapshot' => $order->toArray(),
                'metadata' => ['files_uploaded' => ['tally', 'delivery_note']],
            ]);

            return response()->json($order);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function authorize(Request $request, string $id): JsonResponse {
        try {
            $order = Order::findOrFail($id);

            if (!$order->tally_invoice_path || !$order->delivery_note_path) {
                return response()->json(['error' => 'Both documents required before authorization'], 422);
            }

            $before = $order->toArray();
            $order = $this->stateMachine->transition($order, 'AUTHORIZED');

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'AUTHORIZE',
                'entity_type' => 'orders',
                'entity_id' => $id,
                'before_snapshot' => $before,
                'after_snapshot' => $order->toArray(),
            ]);

            return response()->json($order);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function override(Request $request, string $id): JsonResponse {
        try {
            $order = Order::findOrFail($id);

            $validated = $request->validate([
                'override_reason' => 'required|string|max:500',
            ]);

            if (!in_array('sales.override', $request->authUser->permissions ?? [])) {
                return response()->json(['error' => 'Insufficient permissions for override'], 403);
            }

            $before = $order->toArray();
            $order->update(['status' => 'OVERRIDDEN', 'metadata' => array_merge($order->metadata ?? [], ['override_reason' => $validated['override_reason']])]);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'OVERRIDE',
                'entity_type' => 'orders',
                'entity_id' => $id,
                'before_snapshot' => $before,
                'after_snapshot' => $order->toArray(),
                'metadata' => ['reason' => $validated['override_reason']],
            ]);

            return response()->json($order);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }
}
