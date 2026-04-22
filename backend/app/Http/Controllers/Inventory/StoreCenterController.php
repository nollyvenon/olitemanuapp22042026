<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory\StoreCenter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class StoreCenterController extends Controller
{
    public function index(): JsonResponse
    {
        $centers = StoreCenter::paginate(15);
        return response()->json($centers);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:store_centers',
            'code' => 'required|string|unique:store_centers',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'contact_person' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        $center = StoreCenter::create([
            'id' => Str::uuid(),
            ...$validated,
        ]);

        return response()->json($center, 201);
    }

    public function show(StoreCenter $center): JsonResponse
    {
        return response()->json($center->load('ledgers.stockItem'));
    }

    public function update(Request $request, StoreCenter $center): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|unique:store_centers,name,' . $center->id . ',id',
            'code' => 'sometimes|string|unique:store_centers,code,' . $center->id . ',id',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'contact_person' => 'nullable|string',
            'phone' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $center->update($validated);
        return response()->json($center);
    }

    public function destroy(StoreCenter $center): JsonResponse
    {
        if ($center->ledgers()->where('quantity', '>', 0)->exists()) {
            return response()->json(['message' => 'Cannot delete center with active stock'], 422);
        }

        $center->delete();
        return response()->json(null, 204);
    }
}
