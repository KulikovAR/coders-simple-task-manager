<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateSiteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'domain' => 'required|url|max:255',
            'name' => 'required|string|max:255',
            'keywords' => 'nullable|string',
            'search_engines' => 'nullable|array',
            'regions' => 'nullable|array',
            'device_settings' => 'nullable|array',
        ];
    }
}
