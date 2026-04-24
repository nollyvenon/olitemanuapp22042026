<?php

namespace App\Modules\Sales\Services;

use App\Models\Order;

class OrderStateMachine {
    private const STATES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];
    private const AUTH_STATES = ['PENDING_AUTH', 'AUTHORIZED', 'OVERRIDDEN'];
    private const TRANSITIONS = [
        'DRAFT' => ['SUBMITTED'],
        'SUBMITTED' => ['UNDER_REVIEW', 'DRAFT'],
        'UNDER_REVIEW' => ['APPROVED', 'REJECTED'],
        'APPROVED' => ['PENDING_AUTH', 'REJECTED'],
        'REJECTED' => ['DRAFT'],
        'PENDING_AUTH' => ['AUTHORIZED', 'OVERRIDDEN'],
        'AUTHORIZED' => [],
        'OVERRIDDEN' => [],
    ];

    public function validate(string $from, string $to): bool {
        if (!in_array($from, array_merge(self::STATES, self::AUTH_STATES))) {
            throw new \Exception("Invalid from state: $from", 422);
        }
        if (!in_array($to, array_merge(self::STATES, self::AUTH_STATES))) {
            throw new \Exception("Invalid to state: $to", 422);
        }
        if (!in_array($to, self::TRANSITIONS[$from] ?? [])) {
            throw new \Exception("Transition from $from to $to not allowed", 422);
        }
        return true;
    }

    public function transition(Order $order, string $newState, ?string $reason = null): Order {
        $this->validate($order->status, $newState);

        $old = $order->toArray();
        $order->update(['status' => $newState]);

        if ($reason) {
            $order->update(['metadata' => array_merge($order->metadata ?? [], ['transition_reason' => $reason])]);
        }

        return $order;
    }
}
