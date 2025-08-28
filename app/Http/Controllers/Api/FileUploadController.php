<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\FileUpload\StoreFileRequest;
use App\Http\Resources\ApiResponse;
use App\Models\FileAttachment;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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
                return response()->json(
                    ApiResponse::error('Превышен лимит на файлы. Максимум: 500MB'),
                    422
                );
            }

            // Загружаем файл
            $attachment = $this->fileUploadService->uploadFile(
                $file,
                $attachableType,
                $attachableId,
                $description
            );

            return response()->json(
                ApiResponse::success($attachment, 'Файл успешно загружен')
            );
        } catch (\Exception $e) {
            return response()->json(
                ApiResponse::error('Ошибка при загрузке файла: ' . $e->getMessage()),
                500
            );
        }
    }

    /**
     * Получает список файлов для объекта
     */
    public function index(Request $request)
    {
        try {
            $attachableType = $request->input('attachable_type');
            $attachableId = $request->input('attachable_id');

            if (!$attachableType || !$attachableId) {
                return response()->json(
                    ApiResponse::error('Не указан тип и ID объекта'),
                    400
                );
            }

            // Преобразуем ID в правильный тип, если это число
            if (is_numeric($attachableId)) {
                $attachableId = (int) $attachableId;
            }

            $attachments = $this->fileUploadService->getAttachments($attachableType, $attachableId);
            $totalSize = $this->fileUploadService->getAttachableTotalFileSize($attachableType, $attachableId);

            return response()->json(
                ApiResponse::success([
                    'attachments' => $attachments,
                    'total_size' => $totalSize,
                    'total_size_formatted' => $this->fileUploadService->formatFileSize($totalSize),
                ], 'Файлы получены')
            );
        } catch (\Exception $e) {
            return response()->json(
                ApiResponse::error('Ошибка при получении файлов: ' . $e->getMessage()),
                500
            );
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
                return response()->json(
                    ApiResponse::error('Нет прав для удаления этого файла'),
                    403
                );
            }

            $this->fileUploadService->deleteFile($attachment);

            return response()->json(
                ApiResponse::success(null, 'Файл успешно удален')
            );
        } catch (\Exception $e) {
            return response()->json(
                ApiResponse::error('Ошибка при удалении файла: ' . $e->getMessage()),
                500
            );
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
                return response()->json(
                    ApiResponse::error('Файл не найден'),
                    404
                );
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
            return response()->json(
                ApiResponse::error('Ошибка при скачивании файла: ' . $e->getMessage()),
                500
            );
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

            return response()->json(
                ApiResponse::success([
                    'total_size' => $totalSize,
                    'total_size_formatted' => $this->fileUploadService->formatFileSize($totalSize),
                    'max_size' => $maxSize,
                    'max_size_formatted' => $this->fileUploadService->formatFileSize($maxSize),
                    'used_percentage' => round($usedPercentage, 2),
                    'remaining_size' => $maxSize - $totalSize,
                    'remaining_size_formatted' => $this->fileUploadService->formatFileSize($maxSize - $totalSize),
                ], 'Статистика получена')
            );
        } catch (\Exception $e) {
            return response()->json(
                ApiResponse::error('Ошибка при получении статистики: ' . $e->getMessage()),
                500
            );
        }
    }

    /**
     * Переносит временные файлы к новому объекту
     */
    public function transferTemporaryFiles(Request $request)
    {
        try {
            $request->validate([
                'new_attachable_type' => 'required|string',
                'new_attachable_id' => 'required',
                'temporary_attachable_type' => 'string|default:App\\Models\\TemporaryFile',
                'temporary_attachable_id' => 'nullable',
            ]);

            $newAttachableType = $request->input('new_attachable_type');
            $newAttachableId = $request->input('new_attachable_id');
            $temporaryAttachableType = $request->input('temporary_attachable_type', 'App\\Models\\TemporaryFile');
            $temporaryAttachableId = $request->input('temporary_attachable_id');

            // Преобразуем ID в правильный тип
            if (is_numeric($newAttachableId)) {
                $newAttachableId = (int) $newAttachableId;
            }
            if ($temporaryAttachableId && is_numeric($temporaryAttachableId)) {
                $temporaryAttachableId = (int) $temporaryAttachableId;
            }

            // Переносим файлы
            $transferredFiles = $this->fileUploadService->transferTemporaryFiles(
                $newAttachableType,
                $newAttachableId,
                $temporaryAttachableType,
                $temporaryAttachableId
            );

            return response()->json(
                ApiResponse::success($transferredFiles, 'Файлы успешно перенесены')
            );
        } catch (\Exception $e) {
            return response()->json(
                ApiResponse::error('Ошибка при переносе файлов: ' . $e->getMessage()),
                500
            );
        }
    }
}
