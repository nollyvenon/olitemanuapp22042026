<?php

namespace App\Modules\Documentation\Http\Controllers;

use App\Models\Manual;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManualSearchController {
    public function search(Request $request): JsonResponse {
        $query = $request->query('q', '');
        $type = $request->query('type', 'user');
        $user = User::find($request->authUser->sub ?? null);
        if (!$query) return response()->json(['data' => []]);
        $manuals = Manual::where('status', 'published')->where('type', $type)->where(function($q) use ($query) {
            $q->where('title', 'ilike', "%$query%")
              ->orWhere('excerpt', 'ilike', "%$query%")
              ->orWhere('content', 'ilike', "%$query%")
              ->orWhereJsonContains('keywords', $query);
        })->with('category')->limit(20)->get();
        if ($user) $manuals = $manuals->filter(fn($m) => $m->isAccessibleBy($user));
        return response()->json(['data' => $manuals->map(fn($m) => [
            'id' => $m->id, 'title' => $m->title, 'slug' => $m->slug, 'excerpt' => $m->excerpt,
            'category' => $m->category->name, 'relevance' => $this->calculateRelevance($m, $query)
        ])->sortByDesc('relevance')->values()]);
    }

    private function calculateRelevance(Manual $m, string $query): int {
        $score = 0;
        if (stripos($m->title, $query) !== false) $score += 100;
        if (stripos($m->excerpt, $query) !== false) $score += 50;
        if (stripos($m->content, $query) !== false) $score += 25;
        if (in_array($query, $m->keywords ?? [])) $score += 75;
        return $score;
    }
}
