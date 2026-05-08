<?php

namespace App\Modules\Documentation\Http\Controllers;

use App\Models\Manual;
use App\Models\ManualCategory;
use App\Models\ManualFeedback;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManualController {
    public function index(Request $request): JsonResponse {
        $type = $request->query('type', 'user');
        $category = $request->query('category');
        $user = User::find($request->authUser->sub ?? null);
        $query = Manual::where('status', 'published')->where('type', $type);
        if ($category) $query->whereHas('category', fn($q) => $q->where('slug', $category));
        $manuals = $query->with('category')->get();
        if ($user) $manuals = $manuals->filter(fn($m) => $m->isAccessibleBy($user));
        return response()->json(['data' => $manuals->values()]);
    }

    public function show(Request $request, string $slug): JsonResponse {
        $user = User::find($request->authUser->sub ?? null);
        $manual = Manual::where('slug', $slug)->where('status', 'published')->with('category', 'feedback')->firstOrFail();
        if ($user && !$manual->isAccessibleBy($user)) return response()->json(['error' => 'Unauthorized'], 403);
        $manual->increment('view_count');
        return response()->json(['data' => $manual]);
    }

    public function store(Request $request): JsonResponse {
        $user = User::find($request->authUser->sub);
        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) return response()->json(['error' => 'Unauthorized'], 403);
        $data = $request->validate(['category_id' => 'required|uuid|exists:manual_categories,id', 'title' => 'required|string|max:255', 'slug' => 'required|string|unique:manuals', 'content' => 'required|string', 'excerpt' => 'nullable|string', 'type' => 'required|in:user,admin', 'related_articles' => 'nullable|array', 'keywords' => 'nullable|array']);
        $data['created_by'] = $user->id;
        $data['status'] = 'draft';
        $manual = Manual::create($data);
        return response()->json($manual, 201);
    }

    public function update(Request $request, string $id): JsonResponse {
        $user = User::find($request->authUser->sub);
        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) return response()->json(['error' => 'Unauthorized'], 403);
        $manual = Manual::findOrFail($id);
        $data = $request->validate(['title' => 'nullable|string|max:255', 'content' => 'nullable|string', 'excerpt' => 'nullable|string', 'status' => 'nullable|in:draft,published,archived', 'related_articles' => 'nullable|array', 'keywords' => 'nullable|array']);
        $data['updated_by'] = $user->id;
        if ($request->has('status') && $data['status'] === 'published' && !$manual->published_at) $data['published_at'] = now();
        $manual->update($data);
        return response()->json($manual);
    }

    public function delete(Request $request, string $id): JsonResponse {
        $user = User::find($request->authUser->sub);
        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) return response()->json(['error' => 'Unauthorized'], 403);
        Manual::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    public function feedback(Request $request, string $id): JsonResponse {
        $user = User::find($request->authUser->sub);
        if (!$user) return response()->json(['error' => 'Unauthorized'], 403);
        $manual = Manual::findOrFail($id);
        $data = $request->validate(['rating' => 'required|in:helpful,unhelpful', 'comment' => 'nullable|string']);
        ManualFeedback::create(['manual_id' => $id, 'user_id' => $user->id, 'rating' => $data['rating'], 'comment' => $data['comment'] ?? null]);
        if ($data['rating'] === 'helpful') $manual->increment('helpful_count');
        else $manual->increment('unhelpful_count');
        return response()->json(['message' => 'Feedback recorded'], 201);
    }

    public function getCategories(): JsonResponse {
        $categories = ManualCategory::where('is_active', true)->with(['manuals' => fn($q) => $q->where('status', 'published')])->get();
        return response()->json(['data' => $categories]);
    }
}
