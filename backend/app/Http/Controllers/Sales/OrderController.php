<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\Order;
use App\Services\Sales\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function __construct(private OrderService $orderService) {}

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search' => $request->query('search'),
            'status' => $request->query('status'),
            'customer_id' => $request->query('customer_id'),
            'sort_by' => $request->query('sort_by', 'created_at'),
            'sort_order' => $request->query('sort_order', 'desc'),
            'page' => $request->integer('page', 1),
            'limit' => $request->integer('limit', 20),
        ];

        $paginated = $this->orderService->list($filters);

        return response()->json([
            'data' => $paginated->items(),
            'pagination' => [
                'total' => $paginated->total(),
                'page' => $paginated->currentPage(),
                'limit' => $paginated->perPage(),
                'pages' => $paginated->lastPage(),
            ],
        ]);
    }

    public function show(Order $order): JsonResponse
    {
        if ($order->deleted_at) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json($order->load('customer', 'items.product'));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|uuid|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.notes' => 'sometimes|string',
            'notes' => 'sometimes|string',
        ]);

        $order = $this->orderService->create($validated);

        return response()->json($order->load('customer', 'items'), 201);
    }

    public function update(Order $order, Request $request): JsonResponse
    {
        if ($order->deleted_at) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $validated = $request->validate([
            'customer_id' => 'sometimes|uuid|exists:users,id',
            'status' => 'sometimes|in:draft,pending,confirmed,shipped,delivered,cancelled',
            'items' => 'sometimes|array',
            'items.*.product_id' => 'required_with:items|uuid|exists:products,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
            'notes' => 'sometimes|string',
        ]);

        $order = $this->orderService->update($order, $validated);

        return response()->json($order->load('customer', 'items'));
    }

    public function destroy(Order $order): JsonResponse
    {
        if ($order->deleted_at) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $this->orderService->delete($order);

        return response()->json(null, 204);
    }

    public function changeStatus(Order $order, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,pending,confirmed,shipped,delivered,cancelled',
        ]);

        $order = $this->orderService->changeStatus($order, $validated['status']);

        return response()->json($order);
    }
}
