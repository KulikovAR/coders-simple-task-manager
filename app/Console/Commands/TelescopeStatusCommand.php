<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class TelescopeStatusCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telescope:status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Показывает статистику и статус Telescope';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("📊 Статистика Laravel Telescope");
        $this->info("================================");

        try {
            // Общая статистика
            $totalEntries = DB::table('telescope_entries')->count();
            $totalTags = DB::table('telescope_entries_tags')->count();
            $totalMonitoring = DB::table('telescope_monitoring')->count();

            $this->info("📈 Общая статистика:");
            $this->info("   Записей: {$totalEntries}");
            $this->info("   Тегов: {$totalTags}");
            $this->info("   Мониторинг: {$totalMonitoring}");

            if ($totalEntries === 0) {
                $this->info("✅ Таблица пуста");
                return 0;
            }

            // Статистика по типам
            $this->info("\n📋 Статистика по типам записей:");
            $types = DB::table('telescope_entries')
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->orderBy('count', 'desc')
                ->get();

            foreach ($types as $type) {
                $this->info("   {$type->type}: {$type->count}");
            }

            // Статистика по дням
            $this->info("\n📅 Статистика по дням (последние 10 дней):");
            $dailyStats = DB::table('telescope_entries')
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('created_at', '>=', now()->subDays(10))
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->get();

            foreach ($dailyStats as $stat) {
                $this->info("   {$stat->date}: {$stat->count} записей");
            }

            // Размер таблиц
            $this->info("\n💾 Размер таблиц:");
            $tableSizes = DB::select("
                SELECT 
                    table_name,
                    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
                FROM information_schema.TABLES 
                WHERE table_schema = DATABASE()
                    AND table_name LIKE 'telescope_%'
                ORDER BY (data_length + index_length) DESC
            ");

            foreach ($tableSizes as $table) {
                $this->info("   {$table->table_name}: {$table->size_mb} MB");
            }

            // Рекомендации
            $this->info("\n💡 Рекомендации:");
            
            $oldEntries = DB::table('telescope_entries')
                ->where('created_at', '<', now()->subDays(7))
                ->count();

            if ($oldEntries > 10000) {
                $this->warn("   ⚠️  Много старых записей ({$oldEntries}). Рекомендуется очистка:");
                $this->info("      php artisan telescope:cleanup --days=7");
            }

            if ($totalEntries > 100000) {
                $this->warn("   ⚠️  Очень много записей ({$totalEntries}). Рассмотрите отключение Telescope на продакшене");
            }

            $this->info("   ✅ Автоматическая очистка настроена (ежедневно в 02:00)");

            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Ошибка при получении статистики: {$e->getMessage()}");
            return 1;
        }
    }
}
