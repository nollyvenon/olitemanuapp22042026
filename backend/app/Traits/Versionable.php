<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;

trait Versionable {
    protected static function bootVersionable() {
        static::updating(function (Model $model) {
            if (!$model->isDirty()) return;

            $original = $model->getOriginal();
            $model->version_number = ($original['version_number'] ?? 0) + 1;
            $model->parent_id = $original['id'] ?? null;
            $model->is_current = true;
        });
    }
}
