<?php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class DeleteGuardObserver {
    public function deleting(Model $model): void {
        $tableName = $model->getTable();
        $id = $model->getKey();

        $checks = [
            'stock_items' => [
                'stock_journals' => ['item_id', $id],
                'price_list_items' => ['item_id', $id],
            ],
            'stock_categories' => [
                'stock_items' => ['category_id', $id],
            ],
            'ledger_accounts' => [
                'vouchers' => ['ledger_id', $id],
                'orders' => ['ledger_id', $id],
            ],
            'groups' => [
                'user_groups' => ['group_id', $id],
            ],
            'locations' => [
                'users' => ['location_id', $id],
                'orders' => ['location_id', $id],
            ],
        ];

        if (!isset($checks[$tableName])) return;

        foreach ($checks[$tableName] as $refTable => [$refCol, $refId]) {
            if (DB::table($refTable)->where($refCol, $refId)->exists()) {
                throw new \Exception("Cannot delete {$tableName} record: referenced in {$refTable}", 403);
            }
        }
    }
}
