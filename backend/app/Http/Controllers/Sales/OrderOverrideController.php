<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\ApprovedOrder;
use App\Models\Sales\OrderOverride;
use App\Services\Sales\AuthorizationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrderOverrideController extends Controller
{
    public function __construct(private AuthorizationService $authorizationService) {}

    public function requestOverride(Request $request, ApprovedOrder $order): JsonResponse
    {
        try {
            $validated = $request->validate([
                'overrides' => 'required|array|min:1',
                'overrides.*.product_id' => 'required|uuid|exists:products,id',
                'overrides.*.requested_quantity' => 'required|integer|min:1',
                'overrides.*.available_stock' => 'required|integer|min:0',
                'overrides.*.reason' => 'required|string|min:10|max:500',
            ]);

            $this->authorizationService->requestOverride(
                $order,
                $validated['overrides'],
                $request->user()
            );

            return response()->json(['message' => 'Override request submitted']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function approveOverride(OrderOverride $override): JsonResponse
    {
        try {
            $this->authorizationService->approveOverride($override, auth()->user());
            return response()->json(['message' => 'Override approved']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function rejectOverride(OrderOverride $override): JsonResponse
    {
        try {
            $this->authorizationService->rejectOverride($override, auth()->user());
            return response()->json(['message' => 'Override rejected']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function list(ApprovedOrder $order): JsonResponse
    {
        $overrides = $order->overrides()->with('product', 'requester', 'approver')->get();
        return response()->json($overrides);
    }
}
