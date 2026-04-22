<?php

namespace App\Services\Notifications;

use App\Events\WorkflowNotification;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Query\Builder;

class NotificationService
{
    public function notifyGroup(string $groupId, string $type, string $message, array $data = []): Notification
    {
        return Notification::create([
            'group_id' => $groupId,
            'type' => $type,
            'message' => $message,
            'data' => $data,
        ]);
    }

    public function notifyUser(string $userId, string $type, string $message, array $data = []): Notification
    {
        $user = User::findOrFail($userId);
        $groupId = $user->groups()->first()?->id;

        return $this->notifyGroup($groupId ?? $userId, $type, $message, $data);
    }

    public function markAsRead(string $notificationId, ?string $userId = null): bool
    {
        $query = Notification::where('id', $notificationId);
        if ($userId) {
            $query->where('group_id', $userId);
        }

        return $query->update(['read_at' => now()]) > 0;
    }

    public function getGroupNotifications(string $groupId, int $limit = 50): Builder
    {
        return Notification::where('group_id', $groupId)
            ->latest()
            ->limit($limit);
    }

    public function broadcastWorkflowNotification(string $toGroupId, string $resource, string $resourceId, string $action, array $metadata = []): void
    {
        $message = "New {$resource} requires your action";

        broadcast(new WorkflowNotification(
            $toGroupId,
            $resource,
            $resourceId,
            $action,
            $message,
            $metadata
        ))->toOthers();

        $this->notifyGroup($toGroupId, "workflow.{$resource}.{$action}", $message, [
            'resource_id' => $resourceId,
            'action' => $action,
            'metadata' => $metadata,
        ]);
    }

    public function getUnreadCount(string $groupId): int
    {
        return Notification::where('group_id', $groupId)
            ->whereNull('read_at')
            ->count();
    }

    public function markAllAsRead(string $groupId): int
    {
        return Notification::where('group_id', $groupId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
