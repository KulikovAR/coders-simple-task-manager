<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\FileUpload\StoreFileRequest;
use App\Http\Resources\ApiResponse;
use App\Models\FileAttachment;
use App\Services\FileUploadService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class FileUploadController extends Controller
{
    public function __construct(
        private FileUploadService $fileUploadService
    )
    {
    }

    public function store(StoreFileRequest $request)
    {
        try {
            $file = $request->file('file');
            $attachableType = $request->input('attachable_type');
            $attachableId = $request->input('attachable_id');
            $description = $request->input('description');

            if (is_numeric($attachableId)) {
                $attachableId = (int)$attachableId;
            }

            if (!$this->fileUploadService->checkUserFileLimit(Auth::id(), $file->getSize())) {
                return response()->json(
                    ApiResponse::error('Превышен лимит на файлы. Максимум: 500MB'),
                    422
                );
            }

            $attachment = $this->fileUploadService->uploadFile(
                $file,
                $attachableType,
                $attachableId,
                $description
            );

            return response()->json(
                ApiResponse::success($attachment, 'Файл успешно загружен')
            );
        } catch (Exception $e) {
            return response()->json(
                ApiResponse::error('Ошибка при загрузке файла: ' . $e->getMessage()),
                500
            );
        }
    }

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

            if (is_numeric($attachableId)) {
                $attachableId = (int)$attachableId;
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
        } catch (Exception $e) {
            return response()->json(
                ApiResponse::error('Ошибка при получении файлов: ' . $e->getMessage()),
                500
            );
        }
    }

    public function destroy(FileAttachment $attachment)
    {
        try {
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
        } catch (Exception $e) {
            return response()->json(
                ApiResponse::error('Ошибка при удалении файла: ' . $e->getMessage()),
                500
            );
        }
    }


    public function download(FileAttachment $attachment)
    {
        try {
            if (!$attachment->fileExists()) {
                return response()->json(
                    ApiResponse::error('Файл не найден'),
                    404
                );
            }

            $path = Storage::disk('public')->path($attachment->file_path);

            return response()->download($path, $attachment->original_name, [
                'Content-Type' => $attachment->mime_type,
            ]);
        } catch (Exception $e) {
            return response()->json(
                ApiResponse::error('Ошибка при скачивании файла: ' . $e->getMessage()),
                500
            );
        }
    }

    public function userStats()
    {
        try {
            $userId = Auth::id();
            $totalSize = $this->fileUploadService->getUserTotalFileSize($userId);
            $maxSize = 500 * 1024 * 1024;
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
        } catch (Exception $e) {
            return response()->json(
                ApiResponse::error('Ошибка при получении статистики: ' . $e->getMessage()),
                500
            );
        }
    }

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

            if (is_numeric($newAttachableId)) {
                $newAttachableId = (int)$newAttachableId;
            }
            if ($temporaryAttachableId && is_numeric($temporaryAttachableId)) {
                $temporaryAttachableId = (int)$temporaryAttachableId;
            }


            $transferredFiles = $this->fileUploadService->transferTemporaryFiles(
                $newAttachableType,
                $newAttachableId,
                $temporaryAttachableType,
                $temporaryAttachableId
            );

            return response()->json(
                ApiResponse::success($transferredFiles, 'Файлы успешно перенесены')
            );
        } catch (Exception $e) {
            return response()->json(
                ApiResponse::error('Ошибка при переносе файлов: ' . $e->getMessage()),
                500
            );
        }
    }
}
