<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\FileUpload\StoreFileRequest;
use App\Models\FileAttachment;
use App\Services\FileUploadService;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FileUploadController extends Controller
{
    public function __construct(
        private FileUploadService $fileUploadService,
        private SubscriptionService $subscriptionService
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

            // Получаем текущего пользователя
            $user = Auth::user();
            
            // Проверяем лимит пользователя по тарифу
            if (!$this->subscriptionService->canUploadFile($user, $file->getSize())) {
                $subscriptionInfo = $this->subscriptionService->getUserSubscriptionInfo($user);
                $limitText = $subscriptionInfo['storage_limit'] === -1 ? 
                    'Неограниченно' : 
                    "{$subscriptionInfo['storage_limit']} ГБ";
                
                return response()->json([
                    'success' => false,
                    'message' => "Превышен лимит на файлы. Доступно: {$limitText}. Использовано: {$subscriptionInfo['storage_used']} ГБ"
                ], 422);
            }

            // Загружаем файл
            $attachment = $this->fileUploadService->uploadFile(
                $file,
                $attachableType,
                $attachableId,
                $description
            );
            
            // Обновляем счетчик использованного места
            $this->subscriptionService->processFileUpload($user, $file->getSize());

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

            // Получаем размер файла перед удалением
            $fileSize = $attachment->file_size;
            
            // Удаляем файл
            $this->fileUploadService->deleteFile($attachment);
            
            // Обновляем счетчик использованного места
            $user = Auth::user();
            $this->subscriptionService->processFileDelete($user, $fileSize);

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
            $user = Auth::user();
            
            // Получаем информацию о тарифе пользователя
            $subscriptionInfo = $this->subscriptionService->getUserSubscriptionInfo($user);
            
            // Получаем текущий размер файлов пользователя
            $totalSize = 0;
            if ($user->subscriptionLimit) {
                $totalSize = $user->subscriptionLimit->storage_used_bytes;
            }
            
            // Определяем максимальный размер в зависимости от тарифа
            $maxSize = $subscriptionInfo['storage_limit'] === -1 
                ? PHP_INT_MAX 
                : $subscriptionInfo['storage_limit'] * 1024 * 1024 * 1024; // ГБ в байты
            
            // Вычисляем процент использования
            $usedPercentage = $maxSize > 0 ? min(100, ($totalSize / $maxSize) * 100) : 0;
            if ($subscriptionInfo['storage_limit'] === -1) {
                $usedPercentage = 0; // Для безлимитного тарифа показываем 0%
            }
            
            // Форматируем размеры для отображения
            $totalSizeFormatted = $this->fileUploadService->formatFileSize($totalSize);
            $maxSizeFormatted = $subscriptionInfo['storage_limit'] === -1 
                ? 'Неограниченно' 
                : $this->fileUploadService->formatFileSize($maxSize);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'total_size' => $totalSize,
                    'total_size_formatted' => $totalSizeFormatted,
                    'max_size' => $maxSize,
                    'max_size_formatted' => $maxSizeFormatted,
                    'used_percentage' => round($usedPercentage, 2),
                    'remaining_size' => $maxSize - $totalSize,
                    'remaining_size_formatted' => $subscriptionInfo['storage_limit'] === -1 
                        ? 'Неограниченно' 
                        : $this->fileUploadService->formatFileSize($maxSize - $totalSize),
                    'subscription_name' => $subscriptionInfo['name'],
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
