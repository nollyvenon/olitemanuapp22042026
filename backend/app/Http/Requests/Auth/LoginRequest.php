<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest {
    public function authorize(): bool { return true; }

    public function rules(): array {
        return [
            'email' => 'required|email',
            'password' => 'required|string|min:8',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'deviceFingerprint' => 'required|string',
            'userAgent' => 'required|string',
        ];
    }
}
