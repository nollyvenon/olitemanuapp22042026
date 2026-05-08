<?php

namespace App\Modules\Documentation\Http\Controllers;

use App\Models\Manual;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIAssistantController {
    public function answer(Request $request): JsonResponse {
        $user = User::find($request->authUser->sub ?? null);
        $question = $request->input('question', '');
        if (!$question) return response()->json(['error' => 'Question required'], 400);

        $relevant = $this->findRelevantManuals($question, $user);
        $response = $this->generateResponse($question, $relevant);

        return response()->json(['response' => $response, 'sources' => $relevant->map(fn($m) => ['title' => $m->title, 'slug' => $m->slug])]);
    }

    private function findRelevantManuals(string $question, ?User $user) {
        $keywords = $this->extractKeywords($question);
        $manuals = Manual::where('status', 'published')->with('category')->get();

        if ($user) $manuals = $manuals->filter(fn($m) => $m->isAccessibleBy($user));

        return $manuals->map(function(Manual $m) use ($keywords) {
            $score = 0;
            $searchText = strtolower($m->title . ' ' . $m->content . ' ' . ($m->excerpt ?? ''));
            foreach ($keywords as $keyword) {
                if (stripos($m->title, $keyword) !== false) $score += 50;
                if (stripos($searchText, $keyword) !== false) $score += 25;
            }
            return ['manual' => $m, 'score' => $score];
        })->filter(fn($item) => $item['score'] > 0)
          ->sortByDesc('score')
          ->take(3)
          ->pluck('manual');
    }

    private function extractKeywords(string $question): array {
        $stopwords = ['the', 'a', 'an', 'is', 'are', 'how', 'do', 'i', 'what', 'where', 'when', 'why', 'can', 'to', 'in', 'on', 'at', 'for', 'and', 'or', 'but'];
        $words = preg_split('/\s+/', strtolower($question));
        return array_filter($words, fn($w) => strlen($w) > 2 && !in_array($w, $stopwords));
    }

    private function generateResponse(string $question, $manuals): string {
        if ($manuals->isEmpty()) {
            return "I couldn't find specific documentation for that question. Try searching the manual directly or contact support.";
        }

        $responseText = "Based on the documentation, here's what I found:\n\n";
        foreach ($manuals as $manual) {
            $responseText .= "**{$manual->title}**\n";
            $responseText .= substr($manual->excerpt ?? $manual->content, 0, 200) . "...\n\n";
        }
        $responseText .= "For more details, check the full documentation articles above.";

        return $responseText;
    }
}
