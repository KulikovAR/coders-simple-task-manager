<?php

namespace App\Http\Requests\Api\Comment;

use App\Enums\CommentType;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCommentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content' => 'sometimes|required|string|max:2000',
            'type' => 'sometimes|string|in:' . implode(',', array_column(CommentType::cases(), 'value')),
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'content.required' => 'Содержание комментария обязательно',
            'content.max' => 'Комментарий не может быть длиннее 2000 символов',
            'type.in' => 'Неверный тип комментария',
        ];
    }
}
