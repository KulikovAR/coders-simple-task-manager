<?php

namespace App\Http\Requests;

use App\Models\Project;
use App\Models\Sprint;
use App\Rules\ValidTaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
use Illuminate\Support\Facades\Log;

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
            'description' => 'nullable|string|max:65535',
            'priority' => 'nullable|in:low,medium,high',
            'sprint_id' => 'nullable|integer',
            'assignee_id' => 'nullable|exists:users,id',
            'assignee_ids' => 'nullable|array',
            'assignee_ids.*' => 'integer|exists:users,id',
            'deadline' => 'nullable|date',
            'result' => 'nullable|string|max:65535',
            'merge_request' => 'nullable|url',
            'tags' => 'nullable|max:255',
            'start_date' => 'nullable|date',
            'duration_days' => 'nullable|integer|min:0',
            'progress_percent' => 'nullable|integer|min:0|max:100',
            'is_milestone' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0'
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
            'assignee_ids.array' => 'Список исполнителей должен быть массивом',
            'assignee_ids.*.exists' => 'Некоторые исполнители не существуют',
            'deadline.date' => 'Дедлайн должен быть корректной датой.',
            'merge_request.url' => 'Ссылка на merge request должна быть корректным URL.',
            'description.max' => 'слишком много символов',
            'result.max' => 'слишком много символов',
        ];
    }

    public function wantsJson(): bool
    {
        return $this->ajax() || $this->wantsJson() || $this->header('Accept') === 'application/json';
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            // Валидация sprint_id
            if ($this->filled('sprint_id') && $this->sprint_id !== '') {
                $sprintExists = \App\Models\Sprint::where('id', $this->sprint_id)->exists();
                if (!$sprintExists) {
                    $validator->errors()->add('sprint_id', 'Выбранный спринт не существует.');
                }
            }

            // Контекстная валидация статуса
            if ($this->filled('status_id')) {
                $project = null;
                $sprint = null;

                // Получаем проект
                if ($this->filled('project_id')) {
                    $project = Project::find($this->project_id);
                }

                // Получаем спринт если указан
                if ($this->filled('sprint_id') && $this->sprint_id !== '' && $project) {
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

    protected function prepareForValidation(): void
    {
        // Логируем как данные приходят "в сыром виде"
        Log::info('TaskRequest raw input', [
            'assignee_ids' => $this->input('assignee_ids'),
            'all' => $this->all(),
        ]);

        // Приводим к массиву
        if ($this->has('assignee_ids') && !is_array($this->assignee_ids)) {
            $value = $this->assignee_ids;

            if (is_string($value)) {
                $value = preg_match('/^\[.*\]$/', $value)
                    ? json_decode($value, true)
                    : explode(',', $value);
            }

            $this->merge([
                'assignee_ids' => is_array($value) ? $value : [],
            ]);
        }

        // Логируем после преобразования
        Log::info('TaskRequest normalized', [
            'assignee_ids' => $this->assignee_ids,
        ]);
    }
}
