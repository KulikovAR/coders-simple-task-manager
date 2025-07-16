<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,completed,on_hold,cancelled',
            'deadline' => 'nullable|date|after:today',
            'docs' => 'nullable|array',
            'docs.*' => 'nullable|url',
            'owner_id' => 'nullable|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Название проекта обязательно для заполнения.',
            'name.max' => 'Название проекта не может быть длиннее 255 символов.',
            'status.required' => 'Статус проекта обязателен для заполнения.',
            'status.in' => 'Выбран недопустимый статус проекта.',
            'deadline.date' => 'Дедлайн должен быть корректной датой.',
            'deadline.after' => 'Дедлайн должен быть в будущем.',
            'docs.array' => 'Документы должны быть массивом.',
            'docs.*.url' => 'Каждая ссылка на документ должна быть корректным URL.',
        ];
    }
} 