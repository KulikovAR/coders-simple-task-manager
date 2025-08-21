<?php

namespace App\Http\Requests;

use App\Models\Project;
use App\Models\Sprint;
use App\Rules\ValidTaskStatus;
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
            'tags' => 'nullable|max:255'
        ];

        if ($this->isMethod('POST')) {
            $rules['project_id'] = 'required|exists:projects,id';
        }

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

    public function wantsJson(): bool
    {
        return $this->ajax() || $this->wantsJson() || $this->header('Accept') === 'application/json';
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            // Контекстная валидация статуса
            if ($this->filled('status_id')) {
                $project = null;
                $sprint = null;

                // Получаем проект
                if ($this->filled('project_id')) {
                    $project = Project::find($this->project_id);
                }

                // Получаем спринт если указан
                if ($this->filled('sprint_id') && $project) {
                    $sprint = $project->sprints()->find($this->sprint_id);
                }

                // Применяем контекстную валидацию
                if ($project) {
                    $rule = new ValidTaskStatus($project, $sprint);
                    $rule->validate('status_id', $this->status_id, function ($message) use ($validator) {
                        $validator->errors()->add('status_id', $message);
                    });
                }
            }
        });
    }
}
