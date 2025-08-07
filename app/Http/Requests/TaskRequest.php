<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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

        // project_id обязателен только при создании
        if ($this->isMethod('POST')) {
            $rules['project_id'] = 'required|exists:projects,id';
        }
        
        // Валидация статуса - проверяем либо status_id, либо status
        $rules['status_id'] = 'nullable|exists:task_statuses,id';
        $rules['status'] = 'nullable|string';

        return $rules;
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Название задачи обязательно для заполнения.',
            'title.max' => 'Название задачи не может быть длиннее 255 символов.',
            'status_id.exists' => 'Выбранный статус не существует.',
            'priority.in' => 'Выбран недопустимый приоритет задачи.',
            'project_id.required' => 'Проект обязателен для выбора.',
            'project_id.exists' => 'Выбранный проект не существует.',
            'sprint_id.exists' => 'Выбранный спринт не существует.',
            'assignee_id.exists' => 'Выбранный исполнитель не существует.',
            'deadline.date' => 'Дедлайн должен быть корректной датой.',
            'merge_request.url' => 'Ссылка на merge request должна быть корректным URL.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            // Проверяем, что status_id принадлежит проекту задачи
            if ($this->filled('status_id') && $this->filled('project_id')) {
                $statusExists = \App\Models\TaskStatus::where('id', $this->status_id)
                    ->where('project_id', $this->project_id)
                    ->exists();
                
                if (!$statusExists) {
                    $validator->errors()->add('status_id', 'Выбранный статус не принадлежит данному проекту.');
                }
            }
        });
    }
} 