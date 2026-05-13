<?php

namespace App\Modules\Sales\Http\Controllers;

use App\Models\Customer;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController {
    public function __construct(private AuditService $auditService) {}

    public function index(Request $request): JsonResponse {
        $customers = Customer::paginate(20);
        return response()->json($customers);
    }

    public function show(Request $request, string $id): JsonResponse {
        $customer = Customer::with('orders', 'invoices', 'viewGroups')->findOrFail($id);
        return response()->json($customer);
    }

    public function store(Request $request): JsonResponse {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:customers',
                'phone' => 'nullable|string',
                'company' => 'nullable|string',
                'address' => 'nullable|string',
                'city' => 'nullable|string',
                'state' => 'nullable|string',
                'country' => 'nullable|string',
                'ledger_category' => 'nullable|in:debtor,creditor',
                'view_group_ids' => 'nullable|array',
                'view_group_ids.*' => 'uuid|exists:groups,id',
            ]);

            $authUser = $request->attributes->get('authUser');
            $validated['ledger_category'] = $validated['ledger_category'] ?? 'debtor';
            $customer = Customer::create([...$validated, 'created_by' => $authUser?->sub ?? $authUser['sub'] ?? null]);
            $customer->viewGroups()->sync($validated['view_group_ids'] ?? []);

            $this->auditService->log([
                'user_id' => $authUser?->sub ?? $authUser['sub'] ?? null,
                'action_type' => 'CREATE',
                'entity_type' => 'customers',
                'entity_id' => $customer->id,
                'after_snapshot' => $customer->toArray(),
            ]);

            return response()->json($customer, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse {
        try {
            if (!$request->attributes->get('authUser')->hasPermission('sales.customers.override') && !$request->attributes->get('authUser')->hasPermission('admin.*')) {
                return response()->json(['error' => 'Unauthorized to edit customer parameters'], 403);
            }
            $this->authorize('sales.customers.override', 'admin.*');

            $customer = Customer::findOrFail($id);
            $before = $customer->toArray();

            $validated = $request->validate([
                'name' => 'nullable|string|max:255',
                'email' => 'nullable|email|unique:customers,email,' . $id,
                'phone' => 'nullable|string',
                'company' => 'nullable|string',
                'address' => 'nullable|string',
                'city' => 'nullable|string',
                'state' => 'nullable|string',
                'country' => 'nullable|string',
                'status' => 'nullable|in:active,inactive,suspended',
                'ledger_category' => 'nullable|in:debtor,creditor',
                'view_group_ids' => 'nullable|array',
                'view_group_ids.*' => 'uuid|exists:groups,id',
            ]);

            $customer->update($validated);
            $customer->viewGroups()->sync($validated['view_group_ids'] ?? []);

            $authUser = $request->attributes->get('authUser');
            $this->auditService->log([
                'user_id' => $authUser?->sub ?? $authUser['sub'] ?? null,
                'action_type' => 'UPDATE',
                'entity_type' => 'customers',
                'entity_id' => $id,
                'before_snapshot' => $before,
                'after_snapshot' => $customer->toArray(),
            ]);

            return response()->json($customer);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
