<?php

namespace App\Modules\Notifications\Services;

use App\Models\Notification;
use App\Models\NotificationPreference;

class NotificationService {
    public static function send(string $userId, string $type, string $title, string $message, ?array $data = null): Notification {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    public static function markAsRead(string $notificationId): Notification {
        $notification = Notification::findOrFail($notificationId);
        $notification->update(['read_at' => now()]);
        return $notification;
    }

    public static function getPreference(string $userId, string $type): NotificationPreference {
        return NotificationPreference::firstOrCreate(
            ['user_id' => $userId, 'type' => $type],
            ['email' => true, 'in_app' => true]
        );
    }
}
