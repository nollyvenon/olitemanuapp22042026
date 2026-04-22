<?php

namespace App\Observers;

use App\Models\User;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Database\Eloquent\Model;

class AuditObserver {
    private array $auditedModels = ['User', 'Group', 'Order', 'Voucher', 'KycSubmission', 'Territory', 'PriceListVersion'];

    public function created(Model $model): void {
        if (!in_array(class_basename($model), $this->auditedModels)) return;

        AuditService::log([
            'user_id' => auth()->id(),
            'action_type' => 'CREATE',
            'entity_type' => $this->getEntityType($model),
            'entity_id' => $model->id,
            'after_snapshot' => $model->toArray(),
        ]);
    }

    public function updated(Model $model): void {
        if (!in_array(class_basename($model), $this->auditedModels)) return;

        $before = $model->getOriginal();
        $after = $model->getAttributes();

        AuditService::log([
            'user_id' => auth()->id(),
            'action_type' => 'UPDATE',
            'entity_type' => $this->getEntityType($model),
            'entity_id' => $model->id,
            'before_snapshot' => $before,
            'after_snapshot' => $after,
        ]);
    }

    public function deleted(Model $model): void {
        if (!in_array(class_basename($model), $this->auditedModels)) return;

        AuditService::log([
            'user_id' => auth()->id(),
            'action_type' => 'DELETE',
            'entity_type' => $this->getEntityType($model),
            'entity_id' => $model->id,
            'before_snapshot' => $model->toArray(),
        ]);
    }

    private function getEntityType(Model $model): string {
        $class = class_basename($model);
        return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $class)) . 's';
    }
}
