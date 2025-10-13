<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSiteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'nullable|string|max:255',
            'keywords' => 'nullable|string',
            'search_engines' => 'nullable|array',
            'regions' => 'nullable|array',
            'device_settings' => 'nullable|array',
            'position_limit' => 'nullable|integer|min:1|max:100',
            'subdomains' => 'nullable|boolean',
        ];
    }
}
