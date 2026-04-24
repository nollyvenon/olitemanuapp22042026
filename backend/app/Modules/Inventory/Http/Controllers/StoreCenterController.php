<?php namespace App\Modules\Inventory\Http\Controllers;
use App\Models\StoreCenter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StoreCenterController {
    public function index(): JsonResponse {
        return response()->json(StoreCenter::where('is_active', true)->get());
    }
    public function store(Request $request): JsonResponse {
        $v = $request->validate(['name' => 'required|unique:store_centers', 'address' => 'string', 'city' => 'string', 'state' => 'string', 'country' => 'string']);
        return response()->json(StoreCenter::create([...$v, 'created_by' => $request->authUser->sub]), 201);
    }
    public function show(string $id): JsonResponse {
        return response()->json(StoreCenter::with('balances.item')->findOrFail($id));
    }
    public function update(Request $request, string $id): JsonResponse {
        $center = StoreCenter::findOrFail($id);
        $v = $request->validate(['name' => 'string|unique:store_centers,name,' . $id, 'address' => 'string', 'city' => 'string', 'state' => 'string', 'country' => 'string', 'is_active' => 'boolean']);
        return response()->json($center->update($v) ? $center->refresh() : $center);
    }
    public function destroy(string $id): JsonResponse {
        StoreCenter::findOrFail($id)->delete();
        return response()->noContent();
    }
}
