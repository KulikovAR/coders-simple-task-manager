<?php

namespace App\Http\Requests;

use App\Enums\CommentType;
use Illuminate\Foundation\Http\FormRequest;

class TaskCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => 'required|string',
            'type' => 'sometimes|in:' . implode(',', CommentType::values()),
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => 'Содержание комментария обязательно.',
            'content.string' => 'Содержание должно быть текстом.',
            'content.max' => 'Содержание не может превышать 1000 символов.',
            'type.in' => 'Неверный тип комментария.',
        ];
    }
}
