<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TelescopeCleanupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telescope:cleanup 
                            {--days=7 : Количество дней для сохранения записей}
                            {--batch-size=1000 : Размер пакета для удаления}
                            {--dry-run : Показать что будет удалено без выполнения}
                            {--force : Принудительная очистка без подтверждения}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Безопасная очистка старых записей Laravel Telescope';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = (int) $this->option('days');
        $batchSize = (int) $this->option('batch-size');
        $dryRun = $this->option('dry-run');
        $force = $this->option('force');

        $this->info("🔍 Анализ записей Telescope старше {$days} дней...");

        try {
            // Получаем статистику
            $totalEntries = DB::table('telescope_entries')->count();
            $oldEntries = DB::table('telescope_entries')
                ->where('created_at', '<', now()->subDays($days))
                ->count();

            $this->info("📊 Статистика:");
            $this->info("   Всего записей: {$totalEntries}");
            $this->info("   Записей старше {$days} дней: {$oldEntries}");

            if ($oldEntries === 0) {
                $this->info("✅ Нет записей для удаления");
                return 0;
            }

            if ($dryRun) {
                $this->info("🔍 Режим предварительного просмотра:");
                $this->info("   Будет удалено записей: {$oldEntries}");
                $this->info("   Размер пакета: {$batchSize}");
                return 0;
            }

            if (!$force) {
                if (!$this->confirm("⚠️  Вы уверены, что хотите удалить {$oldEntries} записей?")) {
                    $this->info("❌ Операция отменена");
                    return 0;
                }
            }

            $this->info("🗑️  Начинаем очистку записей...");

            $deletedCount = 0;
            $startTime = microtime(true);

            // Удаляем записи пакетами для избежания блокировки таблицы
            do {
                $entriesToDelete = DB::table('telescope_entries')
                    ->where('created_at', '<', now()->subDays($days))
                    ->limit($batchSize)
                    ->pluck('uuid');

                if ($entriesToDelete->isEmpty()) {
                    break;
                }

                // Удаляем связанные записи в telescope_entries_tags
                DB::table('telescope_entries_tags')
                    ->whereIn('entry_uuid', $entriesToDelete)
                    ->delete();

                // Удаляем основные записи
                $deleted = DB::table('telescope_entries')
                    ->whereIn('uuid', $entriesToDelete)
                    ->delete();

                $deletedCount += $deleted;

                $this->info("   Удалено записей: {$deletedCount} / {$oldEntries}");

                // Небольшая пауза между пакетами
                usleep(100000); // 0.1 секунды

            } while ($deletedCount < $oldEntries);

            $endTime = microtime(true);
            $executionTime = round($endTime - $startTime, 2);

            $this->info("✅ Очистка завершена!");
            $this->info("   Удалено записей: {$deletedCount}");
            $this->info("   Время выполнения: {$executionTime} секунд");

            // Логируем результат
            Log::info('Telescope cleanup completed', [
                'deleted_count' => $deletedCount,
                'execution_time' => $executionTime,
                'days_retained' => $days,
                'batch_size' => $batchSize
            ]);

            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Ошибка при очистке Telescope: {$e->getMessage()}");
            Log::error('Telescope cleanup failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}
