<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Models\Accounts\Account;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Account::whereNull('deleted_at');

        if ($request->has('type')) {
            $query->where('type', $request->query('type'));
        }

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('account_number', 'like', "%$search%");
            });
        }

        $paginated = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('limit', 20));

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

    public function show(Account $account): JsonResponse
    {
        if ($account->deleted_at) {
            return response()->json(['message' => 'Account not found'], 404);
        }

        return response()->json($account);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'account_number' => 'required|string|unique:accounts',
            'name' => 'required|string|max:255',
            'type' => 'required|in:receivable,payable,bank,expense,revenue',
            'description' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $account = Account::create([
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        return response()->json($account, 201);
    }

    public function update(Account $account, Request $request): JsonResponse
    {
        if ($account->deleted_at) {
            return response()->json(['message' => 'Account not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $account->update([
            ...$validated,
            'updated_by' => auth()->id(),
        ]);

        return response()->json($account);
    }

    public function destroy(Account $account): JsonResponse
    {
        if ($account->deleted_at) {
            return response()->json(['message' => 'Account not found'], 404);
        }

        $account->delete();

        return response()->json(null, 204);
    }
}
