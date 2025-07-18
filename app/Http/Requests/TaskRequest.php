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
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:low,medium,high',
            'sprint_id' => 'nullable|exists:sprints,id',
            'assignee_id' => 'nullable|exists:users,id',
            'deadline' => 'nullable|date',
            'result' => 'nullable|string',
            'merge_request' => 'nullable|url',
        ];

        // project_id и status обязательны только при создании
        if ($this->isMethod('POST')) {
            $rules['project_id'] = 'required|exists:projects,id';
            $rules['status'] = 'required|in:To Do,In Progress,Review,Testing,Ready for Release,Done';
        }

        return $rules;
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
            'assignee_id.exists' => 'Выбранный исполнитель не существует.',
            'deadline.date' => 'Дедлайн должен быть корректной датой.',
            'merge_request.url' => 'Ссылка на merge request должна быть корректным URL.',
        ];
    }
} 