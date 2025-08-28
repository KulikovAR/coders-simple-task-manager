<?php

namespace App\Console\Commands;

use App\Services\FileUploadService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupUnusedFiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'files:cleanup {--days=7 : Количество дней для определения неиспользуемых файлов} {--dry-run : Показать что будет удалено без выполнения}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Очищает неиспользуемые файлы из системы';

    /**
     * Execute the console command.
     */
    public function handle(FileUploadService $fileUploadService)
    {
        $days = $this->option('days');
        $dryRun = $this->option('dry-run');

        $this->info("🔍 Поиск неиспользуемых файлов старше {$days} дней...");

        try {
            if ($dryRun) {
                $this->info('🔍 Режим предварительного просмотра (dry-run)');
                
                // Получаем список файлов для удаления
                $unusedFiles = $this->getUnusedFiles($days);
                
                if ($unusedFiles->isEmpty()) {
                    $this->info('✅ Неиспользуемых файлов не найдено');
                    return 0;
                }

                $this->warn("📋 Найдено файлов для удаления: {$unusedFiles->count()}");
                
                $this->table(
                    ['ID', 'Имя файла', 'Размер', 'Дата создания', 'Тип объекта'],
                    $unusedFiles->map(function ($file) use ($fileUploadService) {
                        return [
                            $file->id,
                            $file->original_name,
                            $fileUploadService->formatFileSize($file->file_size),
                            $file->created_at->format('Y-m-d H:i:s'),
                            $file->attachable_type ?? 'Не привязан'
                        ];
                    })
                );

                $this->info('💡 Для выполнения удаления запустите команду без --dry-run');
                
            } else {
                $this->info('🗑️ Выполнение очистки неиспользуемых файлов...');
                
                $deletedCount = $fileUploadService->cleanupUnusedFiles($days);
                
                if ($deletedCount > 0) {
                    $this->info("✅ Успешно удалено файлов: {$deletedCount}");
                    Log::info("Очистка неиспользуемых файлов завершена", ['deleted_count' => $deletedCount]);
                } else {
                    $this->info('✅ Неиспользуемых файлов не найдено');
                }
            }

            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Ошибка при очистке файлов: {$e->getMessage()}");
            Log::error('Ошибка при очистке неиспользуемых файлов', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }

    /**
     * Получает список неиспользуемых файлов
     */
    private function getUnusedFiles(int $days)
    {
        return \App\Models\FileAttachment::where('created_at', '<', now()->subDays($days))
            ->whereNull('attachable_id')
            ->get();
    }
}
