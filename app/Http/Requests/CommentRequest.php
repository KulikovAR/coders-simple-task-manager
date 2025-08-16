<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => 'required|string|max:50000', // Увеличиваем лимит для HTML контента
            'type' => 'required|in:comment,status',
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => 'Содержание комментария обязательно для заполнения.',
            'content.max' => 'Комментарий не может быть длиннее 50 000 символов.',
            'type.required' => 'Тип комментария обязателен для заполнения.',
            'type.in' => 'Выбран недопустимый тип комментария.',
        ];
    }
}
