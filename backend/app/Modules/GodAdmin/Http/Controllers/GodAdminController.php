<?php

namespace App\Modules\GodAdmin\Http\Controllers;

use App\Modules\GodAdmin\Services\GodAdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GodAdminController
{
    public function __construct(private GodAdminService $godAdminService) {}

    public function override(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action_type' => 'required|string',
            'module' => 'required|string',
            'affected_entity_id' => 'nullable|uuid',
            'affected_entity_type' => 'nullable|string',
            'previous_state' => 'required|array',
            'new_state' => 'required|array',
            'reason' => 'required|string|max:500',
            'device_id' => 'nullable|uuid',
            'ip_address' => 'nullable|ip',
        ]);

        $result = $this->godAdminService->override(
            $request->authUser,
            $validated['action_type'],
            $validated['module'],
            $validated['affected_entity_id'] ?? null,
            $validated['affected_entity_type'] ?? null,
            $validated['previous_state'],
            $validated['new_state'],
            $validated['reason'],
            $validated['device_id'] ?? null,
            $validated['ip_address'] ?? null
        );

        if ($result->exists && $result->getTable() === 'god_mode_confirmations') {
            return response()->json([
                'confirmation_id' => $result->id,
                'requires_confirmation' => true,
                'status' => 'pending',
                'message' => 'High-risk action awaiting second god admin confirmation',
            ], 202);
        }

        return response()->json([
            'action_id' => $result->id,
            'status' => 'completed',
            'action_type' => $result->action_type,
        ], 201);
    }

    public function confirmAction(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'confirmation_id' => 'required|uuid',
        ]);

        $this->godAdminService->confirmHighRiskAction(
            $validated['confirmation_id'],
            $request->authUser
        );

        return response()->json([
            'status' => 'confirmed',
            'confirmation_id' => $validated['confirmation_id'],
        ]);
    }

    public function impersonate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target_user_id' => 'required|uuid|exists:users,id',
            'reason' => 'required|string|max:500',
        ]);

        $token = $this->godAdminService->impersonate(
            $request->authUser,
            $validated['target_user_id'],
            $validated['reason']
        );

        return response()->json([
            'impersonation_token' => $token,
            'expires_in' => 3600,
            'target_user_id' => $validated['target_user_id'],
        ], 201);
    }

    public function forceStateTransition(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'entity_type' => 'required|string',
            'entity_id' => 'required|uuid',
            'new_state' => 'required|string',
            'reason' => 'required|string|max:500',
        ]);

        $this->godAdminService->forceStateTransition(
            $validated['entity_type'],
            $validated['entity_id'],
            $validated['new_state'],
            $validated['reason'],
            $request->authUser
        );

        return response()->json([
            'status' => 'transitioned',
            'entity_type' => $validated['entity_type'],
            'entity_id' => $validated['entity_id'],
            'new_state' => $validated['new_state'],
        ]);
    }

    public function suspendUser(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $this->godAdminService->suspendUser(
            $id,
            $validated['reason'],
            $request->authUser
        );

        return response()->json([
            'status' => 'pending_confirmation',
            'user_id' => $id,
            'message' => 'User suspension awaiting second god admin confirmation',
        ], 202);
    }

    public function unsuspendUser(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $this->godAdminService->unsuspendUser(
            $id,
            $validated['reason'],
            $request->authUser
        );

        return response()->json([
            'status' => 'unsuspended',
            'user_id' => $id,
        ]);
    }

    public function overridePriceOnOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|uuid|exists:orders,id',
            'line_item_overrides' => 'required|array|min:1',
            'line_item_overrides.*.line_item_id' => 'required|uuid',
            'line_item_overrides.*.new_price' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:500',
        ]);

        $this->godAdminService->overridePriceOnOrder(
            $validated['order_id'],
            $validated['line_item_overrides'],
            $validated['reason'],
            $request->authUser
        );

        return response()->json([
            'status' => 'overridden',
            'order_id' => $validated['order_id'],
            'affected_items_count' => count($validated['line_item_overrides']),
        ]);
    }

    public function overrideInventoryBalance(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'item_id' => 'required|uuid|exists:stock_items,id',
            'location_id' => 'required|uuid|exists:locations,id',
            'new_balance' => 'required|numeric|min:0',
            'reason' => 'required|string|max:500',
        ]);

        $this->godAdminService->overrideInventoryBalance(
            $validated['item_id'],
            $validated['location_id'],
            $validated['new_balance'],
            $validated['reason'],
            $request->authUser
        );

        return response()->json([
            'status' => 'overridden',
            'item_id' => $validated['item_id'],
            'location_id' => $validated['location_id'],
            'new_balance' => $validated['new_balance'],
        ]);
    }

    public function viewVersionHistory(Request $request, string $entityType, string $entityId): JsonResponse
    {
        $history = $this->godAdminService->viewVersionHistory($entityType, $entityId);

        return response()->json([
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'versions' => $history,
            'total_versions' => count($history),
        ]);
    }

    public function viewAuditLog(Request $request): JsonResponse
    {
        $filters = $request->only([
            'action_type',
            'module',
            'god_admin_id',
            'start_date',
            'end_date',
        ]);

        $auditLog = $this->godAdminService->viewAuditLog($filters);

        return response()->json($auditLog);
    }

    public function exportAuditLog(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $downloadUrl = $this->godAdminService->exportAuditLog(
            $validated['start_date'],
            $validated['end_date']
        );

        return response()->json([
            'download_url' => $downloadUrl,
            'expires_in' => 86400,
        ]);
    }
}
