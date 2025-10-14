<?php

namespace App\Console\Commands;

use App\Models\SeoSite;
use App\Services\Seo\Services\MicroserviceClient;
use Illuminate\Console\Command;
use Carbon\Carbon;

class RunScheduledParsing extends Command
{
    protected $signature = 'seo:run-scheduled-parsing {--force : Запустить парсинг для всех сайтов независимо от расписания}';

    protected $description = 'Запускает парсинг позиций для сайтов согласно их расписанию';

    public function __construct(
        private \App\Services\Seo\Services\MicroserviceClient $microserviceClient
    ) {
        parent::__construct();
    }

    public function handle()
    {
        $this->info('Запуск проверки расписания парсинга...');
        
        $force = $this->option('force');
        $sites = SeoSite::with('users')->get();
        
        $processedCount = 0;
        $skippedCount = 0;
        
        foreach ($sites as $site) {
            if ($this->shouldRunParsing($site, $force)) {
                $this->runParsingForSite($site);
                $processedCount++;
            } else {
                $skippedCount++;
            }
        }
        
        $this->info("Обработано сайтов: {$processedCount}");
        $this->info("Пропущено сайтов: {$skippedCount}");
        
        return Command::SUCCESS;
    }

    private function shouldRunParsing(SeoSite $site, bool $force): bool
    {
        if ($force) {
            return true;
        }

        $schedule = $site->schedule;
        
        if (!$schedule || !isset($schedule['type']) || $schedule['type'] === 'manual') {
            return false;
        }

        $now = Carbon::now();
        $currentTime = $now->format('H:i');
        $currentDayOfWeek = $now->dayOfWeek;
        $currentDayOfMonth = $now->day;

        if ($schedule['type'] === 'weekly') {
            return $this->shouldRunWeekly($schedule, $currentTime, $currentDayOfWeek);
        }

        if ($schedule['type'] === 'monthly') {
            return $this->shouldRunMonthly($schedule, $currentTime, $currentDayOfMonth);
        }

        return false;
    }

    private function shouldRunWeekly(array $schedule, string $currentTime, int $currentDayOfWeek): bool
    {
        if (!isset($schedule['time']) || !isset($schedule['days'])) {
            return false;
        }

        $scheduledTime = $schedule['time'];
        $scheduledDays = $schedule['days'];

        if ($currentTime !== $scheduledTime) {
            return false;
        }

        return in_array($currentDayOfWeek, $scheduledDays);
    }

    private function shouldRunMonthly(array $schedule, string $currentTime, int $currentDayOfMonth): bool
    {
        if (!isset($schedule['time']) || !isset($schedule['monthDays'])) {
            return false;
        }

        $scheduledTime = $schedule['time'];
        $scheduledDays = $schedule['monthDays'];

        if ($currentTime !== $scheduledTime) {
            return false;
        }

        if (in_array('*', $scheduledDays)) {
            return true;
        }

        return in_array($currentDayOfMonth, $scheduledDays);
    }

    private function runParsingForSite(SeoSite $site): void
    {
        try {
            $this->info("Запуск парсинга для сайта: {$site->name} (ID: {$site->go_seo_site_id})");
            
            $keywords = $this->microserviceClient->getKeywords($site->go_seo_site_id);
            
            if (empty($keywords)) {
                $this->warn("Нет ключевых слов для сайта: {$site->name}");
                return;
            }

            $result = $this->microserviceClient->trackSitePositions($site->go_seo_site_id);
            
            if ($result) {
                $this->info("✓ Парсинг успешно запущен для: {$site->name}");
            } else {
                $this->error("✗ Ошибка запуска парсинга для: {$site->name}");
            }
            
        } catch (\Exception $e) {
            $this->error("Ошибка при парсинге сайта {$site->name}: " . $e->getMessage());
        }
    }
}
