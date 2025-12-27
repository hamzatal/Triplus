<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;

class DeactivateAccountRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'password' => ['required', 'string'],
            'deactivation_reason' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if (!Hash::check($this->password, $this->user()->password)) {
                $validator->errors()->add('password', 'The provided password is incorrect.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'password.required' => 'The password is required.',
            'deactivation_reason.max' => 'The deactivation reason may not be longer than 1000 characters.',
        ];
    }
}