<?php

namespace App\Modules\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest {
    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $this->route('id'),
            'password' => 'nullable|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
            'group_ids' => 'nullable|array|min:1',
            'group_ids.*' => 'uuid|exists:groups,id',
            'location_ids' => 'nullable|array|min:1',
            'location_ids.*' => 'uuid|exists:locations,id',
            'is_active' => 'nullable|boolean',
        ];
    }
}
