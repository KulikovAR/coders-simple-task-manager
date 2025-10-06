<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class TelescopeForceCleanupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telescope:force-cleanup 
                            {--keep-days=1 : Количество дней для сохранения}
                            {--batch-size=500 : Размер пакета}
                            {--timeout=30 : Таймаут для запросов}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Принудительная очистка Telescope с таймаутами';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $keepDays = (int) $this->option('keep-days');
        $batchSize = (int) $this->option('batch-size');
        $timeout = (int) $this->option('timeout');

        $this->warn("🚨 ПРИНУДИТЕЛЬНАЯ ОЧИСТКА TELESCOPE");
        $this->warn("⚠️  Используется прямой SQL с таймаутами");

        try {
            // Устанавливаем таймаут для запросов
            DB::statement("SET SESSION wait_timeout = {$timeout}");
            DB::statement("SET SESSION interactive_timeout = {$timeout}");

            $this->info("🔍 Проверяем состояние таблиц...");

            // Проверяем размер таблиц
            $tableInfo = DB::select("
                SELECT 
                    table_name,
                    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
                    table_rows
                FROM information_schema.TABLES 
                WHERE table_schema = DATABASE()
                    AND table_name LIKE 'telescope_%'
                ORDER BY (data_length + index_length) DESC
            ");

            foreach ($tableInfo as $table) {
                $this->info("   {$table->table_name}: {$table->size_mb} MB ({$table->table_rows} записей)");
            }

            $this->info("\n🗑️  Начинаем принудительную очистку...");

            $totalDeleted = 0;
            $batchCount = 0;

            do {
                $batchCount++;
                $this->info("   Пакет #{$batchCount}...");

                // Удаляем связанные записи
                $deletedTags = DB::statement("
                    DELETE FROM telescope_entries_tags 
                    WHERE entry_uuid IN (
                        SELECT uuid FROM telescope_entries 
                        WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
                        LIMIT ?
                    )
                ", [$keepDays, $batchSize]);

                // Удаляем основные записи
                $deletedEntries = DB::statement("
                    DELETE FROM telescope_entries 
                    WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
                    LIMIT ?
                ", [$keepDays, $batchSize]);

                $totalDeleted += $batchSize;

                $this->info("   Удалено записей: {$totalDeleted}");

                // Проверяем, есть ли еще записи для удаления
                $remaining = DB::selectOne("
                    SELECT COUNT(*) as count 
                    FROM telescope_entries 
                    WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
                ", [$keepDays]);

                if ($remaining->count == 0) {
                    break;
                }

                // Пауза между пакетами
                sleep(1);

            } while ($batchCount < 50); // Максимум 50 пакетов

            $this->info("\n🔧 Оптимизируем таблицы...");
            
            try {
                DB::statement("OPTIMIZE TABLE telescope_entries");
                DB::statement("OPTIMIZE TABLE telescope_entries_tags");
                DB::statement("OPTIMIZE TABLE telescope_monitoring");
            } catch (\Exception $e) {
                $this->warn("⚠️  Не удалось оптимизировать таблицы: {$e->getMessage()}");
            }

            $this->info("\n📊 Финальная статистика:");
            $finalInfo = DB::select("
                SELECT 
                    table_name,
                    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
                    table_rows
                FROM information_schema.TABLES 
                WHERE table_schema = DATABASE()
                    AND table_name LIKE 'telescope_%'
                ORDER BY (data_length + index_length) DESC
            ");

            foreach ($finalInfo as $table) {
                $this->info("   {$table->table_name}: {$table->size_mb} MB ({$table->table_rows} записей)");
            }

            $this->info("\n✅ Принудительная очистка завершена!");
            $this->info("   Всего пакетов: {$batchCount}");
            $this->info("   Примерно удалено записей: {$totalDeleted}");

            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Ошибка при принудительной очистке: {$e->getMessage()}");
            return 1;
        }
    }
}
