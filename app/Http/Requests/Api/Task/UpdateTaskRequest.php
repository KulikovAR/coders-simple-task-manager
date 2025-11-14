<?php

namespace App\Http\Requests\Api\Task;

use App\Rules\ValidTags;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
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
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:65535',
            'result' => 'nullable|string|max:65535',
            'merge_request' => 'nullable|url|max:255',
            'sprint_id' => 'nullable|exists:sprints,id',
            'assignee_id' => 'nullable|exists:users,id',
            'priority' => 'nullable|in:low,medium,high,critical',
            'tags' => ['nullable', 'string', new ValidTags],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Название задачи обязательно',
            'title.max' => 'Название задачи не может быть длиннее 255 символов',
            'description.max' => 'слишком много символов',
            'sprint_id.exists' => 'Указанный спринт не существует',
            'assignee_id.exists' => 'Указанный исполнитель не существует',
            'priority.in' => 'Приоритет должен быть одним из: low, medium, high, critical',
            'result.max' => 'слишком много символов',
        ];
    }
}
