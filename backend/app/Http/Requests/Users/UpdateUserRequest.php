<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'phone_number' => 'sometimes|string|max:50',
            'avatar_url' => 'sometimes|url',
            'is_active' => 'sometimes|boolean',
            'role_ids' => 'sometimes|array',
            'role_ids.*' => 'uuid|exists:roles,id',
            'group_ids' => 'sometimes|array',
            'group_ids.*' => 'uuid|exists:groups,id',
        ];
    }
}
