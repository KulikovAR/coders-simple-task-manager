<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Настройка расписания команд
Schedule::command('telescope:cleanup --days=7 --batch-size=1000')
    ->daily()
    ->at('02:00')
    ->name('telescope-cleanup')
    ->withoutOverlapping()
    ->runInBackground();

// Очистка файлов (уже настроена в проекте)
Schedule::command('files:cleanup')
    ->daily()
    ->at('02:30')
    ->name('files-cleanup')
    ->withoutOverlapping()
    ->runInBackground();

// Очистка старых задач SEO распознавания
Schedule::command('seo:cleanup-tasks')
    ->daily()
    ->at('03:00')
    ->name('seo-cleanup-tasks')
    ->withoutOverlapping()
    ->runInBackground();
