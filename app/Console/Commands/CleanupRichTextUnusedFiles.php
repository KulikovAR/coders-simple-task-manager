<?php

namespace App\Console\Commands;

use App\Services\RichTextContentAnalyzerService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupRichTextUnusedFiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'files:cleanup-richtext {--dry-run : Показать что будет удалено без выполнения}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Очищает неиспользуемые файлы из RichTextEditor контента';

    /**
     * Execute the console command.
     */
    public function handle(RichTextContentAnalyzerService $analyzerService)
    {
        $dryRun = $this->option('dry-run');

        $this->info('🔍 Анализ RichTextEditor контента на предмет неиспользуемых файлов...');

        try {
            if ($dryRun) {
                $this->info('🔍 Режим предварительного просмотра (dry-run)');
                
                // Получаем список неиспользуемых файлов
                $unusedFiles = $analyzerService->analyzeAllRichTextContent();
                
                if (empty($unusedFiles)) {
                    $this->info('✅ Неиспользуемых файлов не найдено');
                    return 0;
                }

                $this->warn("📋 Найдено файлов для удаления: " . count($unusedFiles));
                
                // Группируем файлы по типам объектов
                $groupedFiles = [];
                foreach ($unusedFiles as $file) {
                    $key = $file->attachable_type . ':' . $file->attachable_id;
                    if (!isset($groupedFiles[$key])) {
                        $groupedFiles[$key] = [];
                    }
                    $groupedFiles[$key][] = $file;
                }

                // Выводим информацию о файлах
                foreach ($groupedFiles as $key => $files) {
                    [$attachableType, $attachableId] = explode(':', $key);
                    $shortType = class_basename($attachableType);
                    
                    $this->info("\n📁 {$shortType} #{$attachableId}:");
                    
                    foreach ($files as $file) {
                        $this->line("  • {$file->original_name} ({$this->formatFileSize($file->file_size)})");
                    }
                }

                $this->info("\n💡 Для выполнения удаления запустите команду без --dry-run");
                
            } else {
                $this->info('🗑️ Выполнение очистки неиспользуемых файлов из RichTextEditor...');
                
                // Получаем список неиспользуемых файлов
                $unusedFiles = $analyzerService->analyzeAllRichTextContent();
                
                if (empty($unusedFiles)) {
                    $this->info('✅ Неиспользуемых файлов не найдено');
                    return 0;
                }
                
                $deletedCount = $analyzerService->cleanupUnusedFiles($unusedFiles);
                
                if ($deletedCount > 0) {
                    $this->info("✅ Успешно удалено файлов: {$deletedCount}");
                    Log::info("Очистка неиспользуемых файлов из RichTextEditor завершена", ['deleted_count' => $deletedCount]);
                } else {
                    $this->info('✅ Неиспользуемых файлов не найдено');
                }
            }

            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Ошибка при очистке файлов: {$e->getMessage()}");
            Log::error('Ошибка при очистке неиспользуемых файлов из RichTextEditor', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }

    /**
     * Форматирует размер файла для отображения
     */
    private function formatFileSize(int $bytes): string
    {
        if ($bytes === 0) return '0 Б';
        
        $sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
        $i = floor(log($bytes, 1024));
        
        return round($bytes / pow(1024, $i), 2) . ' ' . $sizes[$i];
    }
}
