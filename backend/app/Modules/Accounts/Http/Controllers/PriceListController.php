<?php

namespace App\Modules\Accounts\Http\Controllers;

use App\Models\PriceListVersion;
use App\Modules\Accounts\Services\PriceListService;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PriceListController {
    public function __construct(private PriceListService $priceListService, private AuditService $auditService) {}

    public function index(Request $request): JsonResponse {
        $lists = PriceListVersion::with('items')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->withCount('items')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($lists);
    }

    public function show(Request $request, string $id): JsonResponse {
        $list = PriceListVersion::with('items')->findOrFail($id);
        return response()->json($list);
    }

    public function upload(Request $request): JsonResponse {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'effective_from' => 'nullable|date',
                'effective_to' => 'nullable|date',
                'items' => 'required|array|min:1',
                'items.*.item_id' => 'required|uuid|exists:stock_items,id',
                'items.*.price' => 'required|numeric|min:0',
                'items.*.min_qty' => 'nullable|numeric|min:1',
                'items.*.currency' => 'nullable|string|size:3',
            ]);

            $version = $this->priceListService->upload($validated, $validated['items'], $request->authUser->sub);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'CREATE',
                'entity_type' => 'price_list_versions',
                'entity_id' => $version->id,
                'after_snapshot' => $version->toArray(),
            ]);

            return response()->json($version, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function activate(Request $request, string $id): JsonResponse {
        try {
            $version = $this->priceListService->activate($id, $request->authUser->sub);

            $this->auditService->log([
                'user_id' => $request->authUser->sub,
                'action_type' => 'UPDATE',
                'entity_type' => 'price_list_versions',
                'entity_id' => $id,
                'after_snapshot' => $version->toArray(),
                'metadata' => ['action' => 'activated'],
            ]);

            return response()->json($version);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function price(Request $request): JsonResponse {
        $validated = $request->validate([
            'item_id' => 'required|uuid|exists:stock_items,id',
            'version_id' => 'nullable|uuid|exists:price_list_versions,id',
        ]);

        $price = $this->priceListService->getPriceForItem($validated['item_id'], $validated['version_id'] ?? null);

        return response()->json(['price' => $price]);
    }
}
