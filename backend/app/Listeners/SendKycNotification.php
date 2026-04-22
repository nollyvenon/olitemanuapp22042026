<?php

namespace App\Listeners;

use App\Events\KycApproved;
use App\Models\Notification;
use App\Models\NotificationPreference;

class SendKycNotification {
    public function handle(KycApproved $event): void {
        $notifyUsers = \App\Models\User::whereHas('groups', fn($q) => $q->where('name', 'Accountant'))->pluck('id')->toArray();

        foreach ($notifyUsers as $userId) {
            $pref = NotificationPreference::firstOrCreate(['user_id' => $userId, 'type' => 'kyc'], ['email' => true, 'in_app' => true]);
            if ($pref->in_app) {
                Notification::create([
                    'user_id' => $userId,
                    'type' => 'kyc',
                    'title' => 'KYC Approved',
                    'message' => 'Customer ' . $event->submission->business_name . ' KYC approved',
                    'data' => ['customer_id' => $event->submission->customer_id, 'submission_id' => $event->submission->id],
                ]);
            }
        }
    }
}
