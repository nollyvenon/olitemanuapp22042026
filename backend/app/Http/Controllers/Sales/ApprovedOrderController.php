<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\SalesOrder;
use App\Models\Sales\ApprovedOrder;
use App\Services\Sales\ApprovalService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ApprovedOrderController extends Controller
{
    public function __construct(private ApprovalService $approvalService) {}

    public function approve(Request $request, SalesOrder $order): JsonResponse
    {
        try {
            $validated = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|uuid|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.unit_price' => 'required|numeric|min:0',
                'approval_notes' => 'nullable|string|max:500',
            ]);

            $approvedOrder = $this->approvalService->approveOrder(
                $order,
                $request->user(),
                $validated['items'],
                $validated['approval_notes'] ?? null
            );

            return response()->json($approvedOrder->load('items.product', 'salesAdmin'), 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(ApprovedOrder $order): JsonResponse
    {
        return response()->json($order->load('items.product', 'salesAdmin', 'overrides'));
    }

    public function edit(Request $request, ApprovedOrder $order): JsonResponse
    {
        try {
            $validated = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|uuid|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.unit_price' => 'required|numeric|min:0',
            ]);

            $order = $this->approvalService->editApprovedOrder($order, $validated['items']);
            return response()->json($order->load('items.product'));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function moveToAuthorization(ApprovedOrder $order): JsonResponse
    {
        try {
            $order = $this->approvalService->moveToAuthorization($order);
            return response()->json($order);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function list(Request $request): JsonResponse
    {
        $orders = ApprovedOrder::with('items.product', 'salesAdmin', 'overrides')
            ->paginate(15);

        return response()->json($orders);
    }
}
