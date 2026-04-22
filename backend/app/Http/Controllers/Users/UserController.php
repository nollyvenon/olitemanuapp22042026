<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\CreateUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\User;
use App\Services\Users\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function __construct(private UserService $userService) {}

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search' => $request->query('search'),
            'is_active' => $request->boolean('is_active', null),
            'role_id' => $request->query('role_id'),
            'group_id' => $request->query('group_id'),
            'sort_by' => $request->query('sort_by', 'created_at'),
            'sort_order' => $request->query('sort_order', 'desc'),
            'page' => $request->integer('page', 1),
            'limit' => $request->integer('limit', 20),
        ];

        $paginated = $this->userService->list($filters);

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

    public function show(User $user): JsonResponse
    {
        if ($user->deleted_at) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json([
            'id' => $user->id,
            'email' => $user->email,
            'username' => $user->username,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
            'avatarUrl' => $user->avatar_url,
            'phoneNumber' => $user->phone_number,
            'isActive' => $user->is_active,
            'isEmailVerified' => $user->is_email_verified,
            'lastLoginAt' => $user->last_login_at?->toIso8601String(),
            'createdAt' => $user->created_at->toIso8601String(),
            'updatedAt' => $user->updated_at->toIso8601String(),
            'roles' => $user->roles()->get(['id', 'name', 'slug'])->toArray(),
            'groups' => $user->groups()->get(['id', 'name', 'slug'])->toArray(),
        ]);
    }

    public function store(CreateUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());

        return response()->json([
            'id' => $user->id,
            'email' => $user->email,
            'username' => $user->username,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
        ], 201);
    }

    public function update(User $user, UpdateUserRequest $request): JsonResponse
    {
        if ($user->deleted_at) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user = $this->userService->update($user, $request->validated());

        return response()->json([
            'id' => $user->id,
            'email' => $user->email,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
            'updatedAt' => $user->updated_at->toIso8601String(),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->deleted_at) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $this->userService->delete($user);

        return response()->json(null, 204);
    }

    public function assignRoles(User $user, Request $request): JsonResponse
    {
        $validated = $request->validate(['role_ids' => 'array|required']);
        $this->userService->assignRoles($user, $validated['role_ids']);

        return response()->json(['message' => 'Roles assigned']);
    }

    public function assignGroups(User $user, Request $request): JsonResponse
    {
        $validated = $request->validate(['group_ids' => 'array|required']);
        $this->userService->assignGroups($user, $validated['group_ids']);

        return response()->json(['message' => 'Groups assigned']);
    }
}
