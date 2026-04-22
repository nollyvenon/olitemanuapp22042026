<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;

class CreateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|unique:users',
            'username' => 'required|string|min:3|unique:users',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'password' => 'required|string|min:6|confirmed',
            'phone_number' => 'sometimes|string|max:50',
            'role_ids' => 'sometimes|array',
            'role_ids.*' => 'uuid|exists:roles,id',
            'group_ids' => 'sometimes|array',
            'group_ids.*' => 'uuid|exists:groups,id',
        ];
    }
}
