<?php

namespace App\Services;

use App\Models\FileAttachment;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;

class FileUploadService
{
    /**
     * Максимальный размер файла в байтах (50MB)
     */
    const MAX_FILE_SIZE = 50 * 1024 * 1024;

    /**
     * Максимальный общий размер файлов пользователя (500MB)
     */
    const MAX_USER_TOTAL_SIZE = 500 * 1024 * 1024;

    /**
     * Разрешенные типы файлов
     */
    const ALLOWED_FILE_TYPES = [
        // Документы
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        // Архивы
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        // Аудио
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/mp4',
        // Видео
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/wmv',
        'video/webm',
        // Изображения
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
    ];

    /**
     * Загружает файл на сервер
     */
    public function uploadFile(
        UploadedFile $file,
        string $attachableType,
        $attachableId,
        ?string $description = null
    ): FileAttachment {
        try {
            // Проверяем размер файла
            if ($file->getSize() > self::MAX_FILE_SIZE) {
                throw new Exception('Файл слишком большой. Максимальный размер: ' . $this->formatFileSize(self::MAX_FILE_SIZE));
            }

            // Проверяем тип файла
            if (!in_array($file->getMimeType(), self::ALLOWED_FILE_TYPES)) {
                throw new Exception('Неподдерживаемый тип файла: ' . $file->getMimeType());
            }

            // Генерируем уникальное имя файла
            $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
            
            // Определяем путь для сохранения
            $storagePath = $this->getStoragePath($attachableType, $attachableId);
            $filePath = $storagePath . '/' . $fileName;

            // Сохраняем файл на диск
            if (!$file->storeAs($storagePath, $fileName, 'public')) {
                throw new Exception('Ошибка при сохранении файла на диск');
            }

            // Создаем запись в базе данных
            $attachment = FileAttachment::create([
                'user_id' => auth()->id(),
                'original_name' => $file->getClientOriginalName(),
                'file_name' => $fileName,
                'file_path' => $filePath,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'description' => $description,
                'attachable_type' => $attachableType,
                'attachable_id' => $attachableId,
            ]);

            Log::info('Файл успешно загружен', [
                'file_id' => $attachment->id,
                'user_id' => auth()->id(),
                'attachable_type' => $attachableType,
                'attachable_id' => $attachableId,
                'file_size' => $file->getSize(),
            ]);

            return $attachment;

        } catch (Exception $e) {
            Log::error('Ошибка при загрузке файла', [
                'error' => $e->getMessage(),
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);
            throw $e;
        }
    }

    /**
     * Удаляет файл с сервера
     */
    public function deleteFile(FileAttachment $attachment): bool
    {
        try {
            // Удаляем файл с диска
            if ($attachment->fileExists()) {
                Storage::disk('public')->delete($attachment->file_path);
            }

            // Удаляем запись из базы данных
            $attachment->delete();

            Log::info('Файл успешно удален', [
                'file_id' => $attachment->id,
                'user_id' => auth()->id(),
            ]);

            return true;

        } catch (Exception $e) {
            Log::error('Ошибка при удалении файла', [
                'error' => $e->getMessage(),
                'file_id' => $attachment->id,
            ]);
            throw $e;
        }
    }

    /**
     * Получает список файлов для объекта
     */
    public function getAttachments(string $attachableType, $attachableId): \Illuminate\Database\Eloquent\Collection
    {
        return FileAttachment::where('attachable_type', $attachableType)
            ->where('attachable_id', $attachableId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Получает общий размер файлов для объекта
     */
    public function getAttachableTotalFileSize(string $attachableType, $attachableId): int
    {
        return FileAttachment::where('attachable_type', $attachableType)
            ->where('attachable_id', $attachableId)
            ->sum('file_size');
    }

    /**
     * Получает общий размер файлов пользователя
     */
    public function getUserTotalFileSize(int $userId): int
    {
        return FileAttachment::where('user_id', $userId)->sum('file_size');
    }

    /**
     * Проверяет лимит пользователя на файлы
     */
    public function checkUserFileLimit(int $userId, int $fileSize): bool
    {
        $currentTotal = $this->getUserTotalFileSize($userId);
        return ($currentTotal + $fileSize) <= self::MAX_USER_TOTAL_SIZE;
    }

    /**
     * Переносит временные файлы к новому объекту
     */
    public function transferTemporaryFiles(
        string $newAttachableType,
        $newAttachableId,
        ?string $temporaryAttachableType = null,
        $temporaryAttachableId = null
    ): array {
        try {
            $query = FileAttachment::where('attachable_type', $temporaryAttachableType ?? 'App\\Models\\TemporaryFile');
            
            if ($temporaryAttachableId) {
                $query->where('attachable_id', $temporaryAttachableId);
            }

            $temporaryFiles = $query->get();
            $transferredFiles = [];

            foreach ($temporaryFiles as $file) {
                $file->update([
                    'attachable_type' => $newAttachableType,
                    'attachable_id' => $newAttachableId,
                ]);

                $transferredFiles[] = $file;
            }

            Log::info('Файлы успешно перенесены', [
                'from_type' => $temporaryAttachableType,
                'from_id' => $temporaryAttachableId,
                'to_type' => $newAttachableType,
                'to_id' => $newAttachableId,
                'files_count' => count($transferredFiles),
            ]);

            return $transferredFiles;

        } catch (Exception $e) {
            Log::error('Ошибка при переносе файлов', [
                'error' => $e->getMessage(),
                'from_type' => $temporaryAttachableType,
                'to_type' => $newAttachableType,
            ]);
            throw $e;
        }
    }

    /**
     * Форматирует размер файла для отображения
     */
    public function formatFileSize(int $bytes): string
    {
        if ($bytes === 0) return '0 Б';
        
        $sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
        $i = floor(log($bytes, 1024));
        
        return round($bytes / pow(1024, $i), 2) . ' ' . $sizes[$i];
    }

    /**
     * Получает путь для сохранения файлов
     */
    private function getStoragePath(string $attachableType, $attachableId): string
    {
        $basePath = 'attachments';
        
        // Определяем подпапку на основе типа объекта
        if (str_contains($attachableType, 'Task')) {
            $basePath .= '/tasks';
        } elseif (str_contains($attachableType, 'Project')) {
            $basePath .= '/projects';
        } elseif (str_contains($attachableType, 'Comment')) {
            $basePath .= '/comments';
        } else {
            $basePath .= '/other';
        }

        return $basePath . '/' . $attachableId;
    }

    /**
     * Очищает неиспользуемые файлы
     */
    public function cleanupUnusedFiles(): int
    {
        try {
            // Находим файлы, которые не привязаны к существующим объектам
            $unusedFiles = FileAttachment::where('created_at', '<', now()->subDays(7))
                ->whereNull('attachable_id')
                ->get();

            $deletedCount = 0;

            foreach ($unusedFiles as $file) {
                if ($this->deleteFile($file)) {
                    $deletedCount++;
                }
            }

            Log::info('Очистка неиспользуемых файлов завершена', [
                'deleted_count' => $deletedCount,
            ]);

            return $deletedCount;

        } catch (Exception $e) {
            Log::error('Ошибка при очистке неиспользуемых файлов', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
