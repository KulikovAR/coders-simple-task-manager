<?php

namespace App\Rules;

use App\Helpers\TagHelper;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidTags implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $tags = TagHelper::normalize($value);

        if (!empty($tags) && !TagHelper::validate($tags)) {
            $fail('Теги должны содержать только буквы, цифры, дефис и подчеркивание, длина каждого тега от 2 до 50 символов.');
        }
    }
}
