<?php

namespace App\Modules\Sales\Http\Controllers;

use App\Models\Order;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController {
    public function __construct(private AuditService $auditService) {}

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
                'notes' => $validated['notes'],
                'status' => 'draft',
            ]);

            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $total = $item['quantity'] * $item['unit_price'];
                $order->items()->create([
                    'product_name' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
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

            $order->update($validated);

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
}
