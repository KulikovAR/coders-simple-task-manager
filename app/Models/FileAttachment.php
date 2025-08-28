<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class FileAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'original_name',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
        'description',
        'attachable_type',
        'attachable_id',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    /**
     * Пользователь, загрузивший файл
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Полиморфная связь с объектом, к которому прикреплен файл
     */
    public function attachable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Получает URL для скачивания файла
     */
    public function getDownloadUrlAttribute(): string
    {
        return route('file-upload.download', $this);
    }

    /**
     * Получает URL для просмотра файла (если это изображение)
     */
    public function getViewUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }

    /**
     * Проверяет, существует ли файл на диске
     */
    public function fileExists(): bool
    {
        return Storage::disk('public')->exists($this->file_path);
    }

    /**
     * Получает размер файла в отформатированном виде
     */
    public function getFormattedSizeAttribute(): string
    {
        return $this->formatFileSize($this->file_size);
    }

    /**
     * Проверяет, является ли файл изображением
     */
    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    /**
     * Проверяет, является ли файл видео
     */
    public function isVideo(): bool
    {
        return str_starts_with($this->mime_type, 'video/');
    }

    /**
     * Проверяет, является ли файл аудио
     */
    public function isAudio(): bool
    {
        return str_starts_with($this->mime_type, 'audio/');
    }

    /**
     * Проверяет, является ли файл документом
     */
    public function isDocument(): bool
    {
        return in_array($this->mime_type, [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv',
        ]);
    }

    /**
     * Проверяет, является ли файл архивом
     */
    public function isArchive(): bool
    {
        return in_array($this->mime_type, [
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
        ]);
    }

    /**
     * Получает иконку для типа файла
     */
    public function getFileIconAttribute(): string
    {
        if ($this->isImage()) return '🖼️';
        if ($this->isVideo()) return '🎥';
        if ($this->isAudio()) return '🎵';
        if ($this->isDocument()) return '📄';
        if ($this->isArchive()) return '📦';
        
        return '📎';
    }

    /**
     * Форматирует размер файла
     */
    private function formatFileSize(int $bytes): string
    {
        if ($bytes === 0) return '0 Б';
        
        $sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
        $i = floor(log($bytes, 1024));
        
        return round($bytes / pow(1024, $i), 2) . ' ' . $sizes[$i];
    }

    /**
     * Boot метод для автоматической очистки файлов при удалении записи
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($fileAttachment) {
            // Удаляем файл с диска при удалении записи
            if ($fileAttachment->fileExists()) {
                Storage::disk('public')->delete($fileAttachment->file_path);
            }
        });
    }
}
