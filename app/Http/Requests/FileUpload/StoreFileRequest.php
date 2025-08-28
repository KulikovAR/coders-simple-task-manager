<?php

namespace App\Http\Requests\FileUpload;

use Illuminate\Foundation\Http\FormRequest;

class StoreFileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:51200', // 50MB
                'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,zip,rar,7z,mp3,wav,ogg,mp4,avi,mov,wmv,webm,jpg,jpeg,png,gif,webp,svg'
            ],
            'attachable_type' => 'required|string',
            'attachable_id' => 'required',
            'description' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'file.required' => 'Файл обязателен для загрузки.',
            'file.file' => 'Загруженный объект должен быть файлом.',
            'file.max' => 'Размер файла не должен превышать 50MB.',
            'file.mimes' => 'Неподдерживаемый тип файла. Разрешены: PDF, документы, таблицы, презентации, архивы, аудио, видео и изображения.',
            'attachable_type.required' => 'Тип объекта обязателен.',
            'attachable_id.required' => 'ID объекта обязателен.',
            'description.max' => 'Описание не должно превышать 500 символов.',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     *
     * @return array
     */
    public function attributes(): array
    {
        return [
            'file' => 'файл',
            'attachable_type' => 'тип объекта',
            'attachable_id' => 'ID объекта',
            'description' => 'описание',
        ];
    }
}
