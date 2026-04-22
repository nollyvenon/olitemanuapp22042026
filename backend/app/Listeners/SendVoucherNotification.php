<?php

namespace App\Listeners;

use App\Events\VoucherPosted;
use App\Models\Notification;
use App\Models\NotificationPreference;

class SendVoucherNotification {
    public function handle(VoucherPosted $event): void {
        $ledger = $event->voucher->ledger;
        $notifyUsers = $this->getNextGroupUsers($ledger);

        foreach ($notifyUsers as $userId) {
            $pref = NotificationPreference::firstOrCreate(['user_id' => $userId, 'type' => 'voucher'], ['email' => true, 'in_app' => true]);
            if ($pref->in_app) {
                Notification::create([
                    'user_id' => $userId,
                    'type' => 'voucher',
                    'title' => 'New Voucher Posted',
                    'message' => 'Voucher ' . $event->voucher->voucher_number . ' for ' . $ledger->name,
                    'data' => ['voucher_id' => $event->voucher->id, 'ledger_id' => $ledger->id],
                ]);
            }
        }
    }

    private function getNextGroupUsers($ledger): array {
        return \App\Models\User::whereHas('groups', fn($q) => $q->where('name', 'Accountant'))->pluck('id')->toArray();
    }
}
