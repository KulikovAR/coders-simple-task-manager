<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\TelegramService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class NotifyReleaseCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telegram:notify-release {message} {--ver=} {--dry-run} {--test-user=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Отправить уведомление о новом релизе всем пользователям в Telegram (или конкретному пользователю для тестирования)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $message = $this->argument('message');
        $version = $this->option('ver');
        $dryRun = $this->option('dry-run');
        $testUserId = $this->option('test-user');

        if (empty($message)) {
            $this->error('Сообщение не может быть пустым');
            return 1;
        }

        // Формируем финальное сообщение
        $finalMessage = $this->formatReleaseMessage($message, $version);

        // Если указан тестовый пользователь, отправляем только ему
        if ($testUserId !== null) {
            return $this->sendToTestUser($testUserId, $finalMessage, $dryRun);
        }

        if ($dryRun) {
            $this->info('Режим тестирования (dry-run) - сообщения не будут отправлены');
            $this->info('Сообщение:');
            $this->line($finalMessage);
            
            try {
                $userCount = $this->getTelegramUsersCount();
                $this->info('Количество пользователей с Telegram: ' . $userCount);
            } catch (\Exception $e) {
                $this->warn('Не удалось получить количество пользователей: ' . $e->getMessage());
            }
            
            return 0;
        }

        // Подтверждение отправки
        if (!$this->confirm('Вы уверены, что хотите отправить это сообщение всем пользователям?')) {
            $this->info('Отправка отменена');
            return 0;
        }

        $this->info('Начинаем отправку уведомлений...');
        $this->info('Сообщение: ' . $finalMessage);

        $telegramService = app(TelegramService::class);
        
        if (!$telegramService->isEnabled()) {
            $this->error('Telegram бот не настроен. Проверьте TELEGRAM_BOT_TOKEN в .env файле');
            return 1;
        }

        $users = User::whereNotNull('telegram_chat_id')
            ->where('telegram_chat_id', '!=', '')
            ->get();

        if ($users->isEmpty()) {
            $this->warn('Не найдено пользователей с настроенным Telegram');
            return 0;
        }

        $this->info("Найдено пользователей с Telegram: {$users->count()}");

        $successCount = 0;
        $errorCount = 0;
        $progressBar = $this->output->createProgressBar($users->count());

        foreach ($users as $user) {
            try {
                $success = $telegramService->sendMessage($user->telegram_chat_id, $finalMessage);
                
                if ($success) {
                    $successCount++;
                } else {
                    $errorCount++;
                    Log::warning('Не удалось отправить сообщение пользователю', [
                        'user_id' => $user->id,
                        'telegram_chat_id' => $user->telegram_chat_id,
                        'message' => $finalMessage
                    ]);
                }
            } catch (\Exception $e) {
                $errorCount++;
                Log::error('Ошибка отправки сообщения пользователю', [
                    'user_id' => $user->id,
                    'telegram_chat_id' => $user->telegram_chat_id,
                    'error' => $e->getMessage()
                ]);
            }

            $progressBar->advance();
            
            // Небольшая задержка между отправками, чтобы не превысить лимиты API
            usleep(100000); // 0.1 секунды
        }

        $progressBar->finish();
        $this->newLine();

        $this->info("✅ Успешно отправлено: {$successCount}");
        if ($errorCount > 0) {
            $this->warn("❌ Ошибок: {$errorCount}");
        }

        return 0;
    }

    /**
     * Форматировать сообщение о релизе
     */
    private function formatReleaseMessage(string $message, ?string $version): string
    {
        $header = "🚀 <b>Новый релиз!</b>";
        
        if ($version) {
            $header .= " v{$version}";
        }
        
        return $header . "\n\n" . $message . "\n\n" . 
               "Спасибо за использование нашего сервиса! 💙";
    }

    /**
     * Отправить сообщение тестовому пользователю
     */
    private function sendToTestUser(int $userId, string $message, bool $dryRun): int
    {
        try {
            $user = User::find($userId);
            
            if (!$user) {
                $this->error("Пользователь с ID {$userId} не найден");
                return 1;
            }

            if (empty($user->telegram_chat_id)) {
                $this->error("У пользователя {$user->name} (ID: {$userId}) не настроен Telegram");
                return 1;
            }

            $this->info("Отправка сообщения пользователю: {$user->name} (ID: {$userId})");
            $this->info("Telegram Chat ID: {$user->telegram_chat_id}");
            $this->info("Сообщение:");
            $this->line($message);

            if ($dryRun) {
                $this->info('Режим тестирования (dry-run) - сообщение не будет отправлено');
                return 0;
            }

            $telegramService = app(TelegramService::class);
            
            if (!$telegramService->isEnabled()) {
                $this->error('Telegram бот не настроен. Проверьте TELEGRAM_BOT_TOKEN в .env файле');
                return 1;
            }

            $success = $telegramService->sendMessage($user->telegram_chat_id, $message);
            
            if ($success) {
                $this->info('✅ Сообщение успешно отправлено!');
                return 0;
            } else {
                $this->error('❌ Не удалось отправить сообщение');
                return 1;
            }

        } catch (\Illuminate\Database\QueryException $e) {
            $this->error("❌ Ошибка подключения к базе данных: {$e->getMessage()}");
            $this->warn("Убедитесь, что база данных доступна и настройки подключения корректны");
            return 1;
        } catch (\Exception $e) {
            $this->error("❌ Ошибка: {$e->getMessage()}");
            return 1;
        }
    }

    /**
     * Получить количество пользователей с Telegram
     */
    private function getTelegramUsersCount(): int
    {
        return User::whereNotNull('telegram_chat_id')
            ->where('telegram_chat_id', '!=', '')
            ->count();
    }
}
