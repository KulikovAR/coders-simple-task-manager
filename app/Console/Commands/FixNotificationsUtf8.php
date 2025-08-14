<?php

namespace App\Console\Commands;

use App\Models\Notification;
use Illuminate\Console\Command;

class FixNotificationsUtf8 extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'notifications:fix-utf8';

    /**
     * The console command description.
     */
    protected $description = 'Исправить некорректные UTF-8 данные в существующих уведомлениях';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Начинаем проверку и исправление UTF-8 в уведомлениях...');

        $problematicCount = 0;
        $fixedCount = 0;

        Notification::chunk(100, function ($notifications) use (&$problematicCount, &$fixedCount) {
            foreach ($notifications as $notification) {
                $needsUpdate = false;
                $data = $notification->data ?? [];

                if (is_array($data)) {
                    foreach ($data as $key => $value) {
                        if (is_string($value) && !mb_check_encoding($value, 'UTF-8')) {
                            $problematicCount++;
                            $data[$key] = $this->sanitizeUtf8($value);
                            $needsUpdate = true;
                        }
                    }

                    if ($needsUpdate) {
                        try {
                            $notification->update(['data' => $data]);
                            $fixedCount++;
                            $this->info("Исправлено уведомление ID: {$notification->id}");
                        } catch (\Exception $e) {
                            $this->error("Ошибка при исправлении уведомления ID: {$notification->id} - {$e->getMessage()}");
                        }
                    }
                }
            }
        });

        $this->info("Проверка завершена:");
        $this->info("- Найдено проблемных полей: {$problematicCount}");
        $this->info("- Исправлено уведомлений: {$fixedCount}");

        return Command::SUCCESS;
    }

    /**
     * Очистить и валидировать UTF-8 строку
     */
    private function sanitizeUtf8(?string $string): string
    {
        if ($string === null) {
            return '';
        }

        // Проверяем, является ли строка корректной UTF-8
        if (mb_check_encoding($string, 'UTF-8')) {
            return $string;
        }

        // Если строка содержит некорректные UTF-8 последовательности, пытаемся их исправить
        $clean = mb_convert_encoding($string, 'UTF-8', 'UTF-8');
        
        // Проверяем результат ещё раз
        if (!mb_check_encoding($clean, 'UTF-8')) {
            // Если всё ещё проблемы, заменяем некорректные символы
            $clean = mb_convert_encoding($clean, 'UTF-8', 'auto');
        }
        
        return $clean ?: '';
    }
}
