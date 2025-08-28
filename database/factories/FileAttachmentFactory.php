<?php

namespace Database\Factories;

use App\Models\FileAttachment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FileAttachment>
 */
class FileAttachmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $fileTypes = [
            'application/pdf' => 'pdf',
            'application/msword' => 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            'application/vnd.ms-excel' => 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
            'text/plain' => 'txt',
            'text/csv' => 'csv',
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'application/zip' => 'zip',
        ];

        $mimeType = $this->faker->randomElement(array_keys($fileTypes));
        $extension = $fileTypes[$mimeType];
        $fileName = Str::uuid() . '.' . $extension;

        return [
            'user_id' => User::factory(),
            'original_name' => $this->faker->words(2, true) . '.' . $extension,
            'file_name' => $fileName,
            'file_path' => 'attachments/test/' . $fileName,
            'mime_type' => $mimeType,
            'file_size' => $this->faker->numberBetween(1024, 10 * 1024 * 1024), // 1KB - 10MB
            'description' => $this->faker->optional()->sentence(),
            'attachable_type' => 'App\\Models\\Task',
            'attachable_id' => $this->faker->numberBetween(1, 100),
        ];
    }

    /**
     * Файл изображения
     */
    public function image(): static
    {
        $imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $mimeType = $this->faker->randomElement($imageTypes);
        $extension = str_replace('image/', '', $mimeType);
        $fileName = Str::uuid() . '.' . $extension;

        return $this->state(fn (array $attributes) => [
            'mime_type' => $mimeType,
            'file_name' => $fileName,
            'file_path' => 'attachments/images/' . $fileName,
            'original_name' => $this->faker->words(2, true) . '.' . $extension,
            'file_size' => $this->faker->numberBetween(1024, 5 * 1024 * 1024), // 1KB - 5MB
        ]);
    }

    /**
     * PDF документ
     */
    public function pdf(): static
    {
        $fileName = Str::uuid() . '.pdf';

        return $this->state(fn (array $attributes) => [
            'mime_type' => 'application/pdf',
            'file_name' => $fileName,
            'file_path' => 'attachments/documents/' . $fileName,
            'original_name' => $this->faker->words(3, true) . '.pdf',
            'file_size' => $this->faker->numberBetween(1024 * 1024, 10 * 1024 * 1024), // 1MB - 10MB
        ]);
    }

    /**
     * Word документ
     */
    public function word(): static
    {
        $fileName = Str::uuid() . '.docx';

        return $this->state(fn (array $attributes) => [
            'mime_type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'file_name' => $fileName,
            'file_path' => 'attachments/documents/' . $fileName,
            'original_name' => $this->faker->words(3, true) . '.docx',
            'file_size' => $this->faker->numberBetween(1024 * 1024, 5 * 1024 * 1024), // 1MB - 5MB
        ]);
    }

    /**
     * Архив
     */
    public function archive(): static
    {
        $archiveTypes = ['application/zip', 'application/x-rar-compressed'];
        $mimeType = $this->faker->randomElement($archiveTypes);
        $extension = $mimeType === 'application/zip' ? 'zip' : 'rar';
        $fileName = Str::uuid() . '.' . $extension;

        return $this->state(fn (array $attributes) => [
            'mime_type' => $mimeType,
            'file_name' => $fileName,
            'file_path' => 'attachments/archives/' . $fileName,
            'original_name' => $this->faker->words(2, true) . '.' . $extension,
            'file_size' => $this->faker->numberBetween(1024 * 1024, 50 * 1024 * 1024), // 1MB - 50MB
        ]);
    }
}
