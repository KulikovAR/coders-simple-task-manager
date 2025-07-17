<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:To Do,In Progress,Review,Testing,Ready for Release,Done',
            'priority' => 'nullable|in:low,medium,high',
            'project_id' => 'required|exists:projects,id',
            'sprint_id' => 'nullable|exists:sprints,id',
            'deadline' => 'nullable|date|after:today',
            'result' => 'nullable|string',
            'merge_request' => 'nullable|url',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Название задачи обязательно для заполнения.',
            'title.max' => 'Название задачи не может быть длиннее 255 символов.',
            'status.required' => 'Статус задачи обязателен для заполнения.',
            'status.in' => 'Выбран недопустимый статус задачи.',
            'priority.in' => 'Выбран недопустимый приоритет задачи.',
            'project_id.required' => 'Проект обязателен для выбора.',
            'project_id.exists' => 'Выбранный проект не существует.',
            'sprint_id.exists' => 'Выбранный спринт не существует.',
            'deadline.date' => 'Дедлайн должен быть корректной датой.',
            'deadline.after' => 'Дедлайн должен быть в будущем.',
            'merge_request.url' => 'Ссылка на merge request должна быть корректным URL.',
        ];
    }
} 