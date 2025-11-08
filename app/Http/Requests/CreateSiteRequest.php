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
            'keyword_groups' => 'nullable|array',
            'keyword_groups.*.name' => 'nullable|string|max:255',
            'keyword_groups.*.keywords' => 'nullable|string',
            'search_engines' => 'nullable|array',
            'targets' => 'nullable|array',
            'targets.*.search_engine' => 'required|string|in:google,yandex',
            'targets.*.domain' => 'nullable|array',
            'targets.*.region' => 'nullable|array',
            'targets.*.language' => 'nullable|string|max:10',
            'targets.*.lr' => 'nullable|integer',
            'targets.*.device' => 'required|string|in:desktop,tablet,mobile',
            'targets.*.os' => 'nullable|string|in:ios,android',
            'targets.*.organic' => 'nullable|boolean',
            'targets.*.enabled' => 'nullable|boolean',
            'position_limit_yandex' => 'nullable|integer|min:1|max:100',
            'position_limit_google' => 'nullable|integer|in:10,20,30',
            'subdomains' => 'nullable|boolean',
            'schedule' => 'nullable|array',
            'wordstat_enabled' => 'nullable|boolean',
            'wordstat_region' => 'nullable|integer',
            'wordstat_options' => 'nullable|array',
            'wordstat_options.default' => 'nullable|boolean',
            'wordstat_options.quotes' => 'nullable|boolean',
            'wordstat_options.quotes_exclamation_marks' => 'nullable|boolean',
            'wordstat_options.exclamation_marks' => 'nullable|boolean',
        ];
    }
}
