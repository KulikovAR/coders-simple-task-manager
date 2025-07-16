<?php

namespace App\Http\Requests\Api\Sprint;

use Illuminate\Foundation\Http\FormRequest;

class StoreSprintRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'status' => 'sometimes|in:planned,active,completed',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Название спринта обязательно',
            'name.max' => 'Название спринта не может быть длиннее 255 символов',
            'description.max' => 'Описание спринта не может быть длиннее 1000 символов',
            'start_date.required' => 'Дата начала спринта обязательна',
            'start_date.after_or_equal' => 'Дата начала спринта должна быть сегодня или в будущем',
            'end_date.required' => 'Дата окончания спринта обязательна',
            'end_date.after' => 'Дата окончания спринта должна быть после даты начала',
            'status.in' => 'Статус должен быть одним из: planned, active, completed',
        ];
    }
}
