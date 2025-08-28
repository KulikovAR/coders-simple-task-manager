<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\FileUpload\StoreFileRequest;
use App\Models\FileAttachment;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FileUploadController extends Controller
{
    public function __construct(
        private FileUploadService $fileUploadService
    ) {}

    /**
     * Загружает файл
     */
    public function store(StoreFileRequest $request)
    {
        try {
            $file = $request->file('file');
            $attachableType = $request->input('attachable_type');
            $attachableId = $request->input('attachable_id');
            $description = $request->input('description');

            // Преобразуем ID в правильный тип, если это число
            if (is_numeric($attachableId)) {
                $attachableId = (int) $attachableId;
            }

            // Проверяем лимит пользователя
            if (!$this->fileUploadService->checkUserFileLimit(Auth::id(), $file->getSize())) {
                return response()->json([
                    'success' => false,
                    'message' => 'Превышен лимит на файлы. Максимум: 500MB'
                ], 422);
            }

            // Загружаем файл
            $attachment = $this->fileUploadService->uploadFile(
                $file,
                $attachableType,
                $attachableId,
                $description
            );

            return response()->json([
                'success' => true,
                'data' => $attachment,
                'message' => 'Файл успешно загружен'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при загрузке файла: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Скачивает файл
     */
    public function download(FileAttachment $attachment)
    {
        try {
            // Проверяем существование файла
            if (!$attachment->fileExists()) {
                abort(404, 'Файл не найден');
            }

            // Проверяем права доступа (пользователь может скачивать файлы из своих проектов)
            if ($attachment->user_id !== Auth::id()) {
                // Здесь можно добавить дополнительную логику проверки прав
                // например, проверку членства в проекте
            }

            $path = Storage::disk('public')->path($attachment->file_path);
            
            return response()->download($path, $attachment->original_name, [
                'Content-Type' => $attachment->mime_type,
            ]);

        } catch (\Exception $e) {
            abort(500, 'Ошибка при скачивании файла: ' . $e->getMessage());
        }
    }

    /**
     * Просматривает файл (для изображений)
     */
    public function view(FileAttachment $attachment)
    {
        try {
            // Проверяем существование файла
            if (!$attachment->fileExists()) {
                abort(404, 'Файл не найден');
            }

            // Проверяем права доступа
            if ($attachment->user_id !== Auth::id()) {
                // Здесь можно добавить дополнительную логику проверки прав
            }

            // Проверяем, что это изображение
            if (!str_starts_with($attachment->mime_type, 'image/')) {
                abort(400, 'Этот файл не является изображением');
            }

            $path = Storage::disk('public')->path($attachment->file_path);
            
            // Возвращаем изображение для просмотра (без скачивания)
            return response()->file($path, [
                'Content-Type' => $attachment->mime_type,
                'Content-Disposition' => 'inline',
            ]);

        } catch (\Exception $e) {
            abort(500, 'Ошибка при просмотре файла: ' . $e->getMessage());
        }
    }

    /**
     * Удаляет файл
     */
    public function destroy(FileAttachment $attachment)
    {
        try {
            // Проверяем права доступа
            if ($attachment->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Нет прав для удаления этого файла'
                ], 403);
            }

            $this->fileUploadService->deleteFile($attachment);

            return response()->json([
                'success' => true,
                'message' => 'Файл успешно удален'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при удалении файла: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получает статистику по файлам пользователя
     */
    public function userStats()
    {
        try {
            $userId = Auth::id();
            $totalSize = $this->fileUploadService->getUserTotalFileSize($userId);
            $maxSize = 500 * 1024 * 1024; // 500MB
            $usedPercentage = ($totalSize / $maxSize) * 100;

            return response()->json([
                'success' => true,
                'data' => [
                    'total_size' => $totalSize,
                    'total_size_formatted' => $this->fileUploadService->formatFileSize($totalSize),
                    'max_size' => $maxSize,
                    'max_size_formatted' => $this->fileUploadService->formatFileSize($maxSize),
                    'used_percentage' => round($usedPercentage, 2),
                    'remaining_size' => $maxSize - $totalSize,
                    'remaining_size_formatted' => $this->fileUploadService->formatFileSize($maxSize - $totalSize),
                ],
                'message' => 'Статистика получена'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении статистики: ' . $e->getMessage()
            ], 500);
        }
    }
}
