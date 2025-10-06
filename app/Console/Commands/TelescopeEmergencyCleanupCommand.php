<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TelescopeEmergencyCleanupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telescope:emergency-cleanup 
                            {--keep-days=1 : Количество дней для сохранения записей}
                            {--batch-size=500 : Размер пакета для удаления (меньше для экстренной очистки)}
                            {--force : Принудительная очистка без подтверждения}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Экстренная очистка записей Telescope для освобождения места на сервере';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $keepDays = (int) $this->option('keep-days');
        $batchSize = (int) $this->option('batch-size');
        $force = $this->option('force');

        $this->warn("🚨 ЭКСТРЕННАЯ ОЧИСТКА TELESCOPE");
        $this->warn("⚠️  Будет удалено ВСЕ кроме записей за последние {$keepDays} дней!");

        try {
            // Получаем статистику
            $totalEntries = DB::table('telescope_entries')->count();
            $entriesToKeep = DB::table('telescope_entries')
                ->where('created_at', '>=', now()->subDays($keepDays))
                ->count();
            $entriesToDelete = $totalEntries - $entriesToKeep;

            $this->info("📊 Статистика:");
            $this->info("   Всего записей: {$totalEntries}");
            $this->info("   Записей для сохранения: {$entriesToKeep}");
            $this->info("   Записей для удаления: {$entriesToDelete}");

            if ($entriesToDelete === 0) {
                $this->info("✅ Нет записей для удаления");
                return 0;
            }

            if (!$force) {
                $this->error("⚠️  ВНИМАНИЕ: Эта операция удалит {$entriesToDelete} записей!");
                if (!$this->confirm("Вы уверены, что хотите продолжить?")) {
                    $this->info("❌ Операция отменена");
                    return 0;
                }
            }

            $this->info("🗑️  Начинаем экстренную очистку...");

            $deletedCount = 0;
            $startTime = microtime(true);

            // Удаляем записи пакетами
            do {
                $entriesToDelete = DB::table('telescope_entries')
                    ->where('created_at', '<', now()->subDays($keepDays))
                    ->limit($batchSize)
                    ->pluck('uuid');

                if ($entriesToDelete->isEmpty()) {
                    break;
                }

                // Удаляем связанные записи
                DB::table('telescope_entries_tags')
                    ->whereIn('entry_uuid', $entriesToDelete)
                    ->delete();

                // Удаляем основные записи
                $deleted = DB::table('telescope_entries')
                    ->whereIn('uuid', $entriesToDelete)
                    ->delete();

                $deletedCount += $deleted;

                $this->info("   Удалено записей: {$deletedCount}");

                // Пауза между пакетами
                usleep(50000); // 0.05 секунды

            } while (true);

            $endTime = microtime(true);
            $executionTime = round($endTime - $startTime, 2);

            $this->info("✅ Экстренная очистка завершена!");
            $this->info("   Удалено записей: {$deletedCount}");
            $this->info("   Время выполнения: {$executionTime} секунд");

            // Логируем результат
            Log::warning('Telescope emergency cleanup completed', [
                'deleted_count' => $deletedCount,
                'execution_time' => $executionTime,
                'keep_days' => $keepDays,
                'batch_size' => $batchSize
            ]);

            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Ошибка при экстренной очистке Telescope: {$e->getMessage()}");
            Log::error('Telescope emergency cleanup failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}
