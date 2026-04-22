<?php

namespace App\Modules\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGroupRequest extends FormRequest {
    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'name' => 'nullable|string|max:255|unique:groups,name,' . $this->route('id'),
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'uuid|exists:permissions,id',
        ];
    }
}
