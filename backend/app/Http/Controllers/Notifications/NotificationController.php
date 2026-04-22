<?php

namespace App\Http\Controllers\Notifications;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\Notifications\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $notificationService)
    {
    }

    public function getGroupNotifications(Request $request): JsonResponse
    {
        $user = auth()->user();
        $groupId = $user->groups()->first()?->id ?? $user->id;

        $notifications = $this->notificationService->getGroupNotifications(
            $groupId,
            $request->input('limit', 50)
        )->get();

        return response()->json([
            'data' => $notifications,
            'count' => count($notifications),
            'unread_count' => $this->notificationService->getUnreadCount($groupId),
        ]);
    }

    public function markAsRead(Request $request, string $notificationId): JsonResponse
    {
        $user = auth()->user();
        $success = $this->notificationService->markAsRead(
            $notificationId,
            $user->id
        );

        if (!$success) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        return response()->json(['status' => 'ok']);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = auth()->user();
        $groupId = $user->groups()->first()?->id ?? $user->id;

        $count = $this->notificationService->markAllAsRead($groupId);

        return response()->json([
            'marked_count' => $count,
            'status' => 'ok',
        ]);
    }

    public function getUnreadCount(): JsonResponse
    {
        $user = auth()->user();
        $groupId = $user->groups()->first()?->id ?? $user->id;

        return response()->json([
            'unread_count' => $this->notificationService->getUnreadCount($groupId),
        ]);
    }
}
