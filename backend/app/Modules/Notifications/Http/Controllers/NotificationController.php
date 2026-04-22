<?php

namespace App\Modules\Notifications\Http\Controllers;

use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Modules\Notifications\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController {
    public function index(Request $request): JsonResponse {
        $notifications = Notification::where('user_id', $request->authUser->sub)
            ->when($request->unread, fn($q) => $q->whereNull('read_at'))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($notifications);
    }

    public function markAsRead(Request $request, string $id): JsonResponse {
        $notification = Notification::where('user_id', $request->authUser->sub)->findOrFail($id);
        NotificationService::markAsRead($id);
        return response()->json($notification);
    }

    public function preferences(Request $request): JsonResponse {
        $prefs = NotificationPreference::where('user_id', $request->authUser->sub)->get();
        return response()->json($prefs);
    }

    public function updatePreference(Request $request, string $type): JsonResponse {
        $validated = $request->validate([
            'email' => 'boolean',
            'in_app' => 'boolean',
        ]);

        $pref = NotificationPreference::updateOrCreate(
            ['user_id' => $request->authUser->sub, 'type' => $type],
            $validated
        );

        return response()->json($pref);
    }
}
