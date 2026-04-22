<?php

namespace App\Modules\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateUserRequest extends FormRequest {
    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
            'group_ids' => 'required|array|min:1',
            'group_ids.*' => 'uuid|exists:groups,id',
            'location_ids' => 'required|array|min:1',
            'location_ids.*' => 'uuid|exists:locations,id',
            'is_sub_admin' => 'nullable|boolean',
        ];
    }
}
