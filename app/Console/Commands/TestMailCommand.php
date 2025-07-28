<?php

namespace App\Console\Commands;

use App\Mail\NotificationMail;
use App\Mail\PasswordResetMail;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestMailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:test {email?} {--type=notification}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Тестирование отправки email уведомлений';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $type = $this->option('type');

        if (!$email) {
            $email = $this->ask('Введите email для тестирования');
        }

        $this->info("Отправляем тестовое письмо на: {$email}");
        $this->info("Тип письма: {$type}");

        try {
            switch ($type) {
                case 'notification':
                    $this->testNotificationMail($email);
                    break;
                case 'password-reset':
                    $this->testPasswordResetMail($email);
                    break;
                default:
                    $this->error("Неизвестный тип письма: {$type}");
                    $this->info("Доступные типы: notification, password-reset");
                    return 1;
            }

            $this->info('✅ Письмо успешно отправлено!');
            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Ошибка отправки письма: {$e->getMessage()}");
            $this->error("Проверьте настройки почты в .env файле");
            return 1;
        }
    }

    /**
     * Тестирование уведомления
     */
    private function testNotificationMail(string $email): void
    {
        // Создаем или находим пользователя с указанным email
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->info("Создаем тестового пользователя с email: {$email}");
            $user = User::factory()->create([
                'email' => $email,
                'email_notifications' => true,
            ]);
        }

        // Создаем тестовое уведомление через factory
        $notification = \App\Models\Notification::factory()
            ->taskAssigned()
            ->unread()
            ->create([
                'user_id' => $user->id,
                'from_user_id' => $user->id,
                'data' => [
                    'task_title' => 'Тестовая задача для проверки email',
                    'project_name' => 'Тестовый проект',
                ],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

        // Загружаем связи
        $notification->load(['user', 'fromUser']);

        $notificationText = "Вам назначена задача: Тестовая задача для проверки email";
        $actionUrl = route('dashboard');

        Mail::to($email)->send(new NotificationMail($notification, $notificationText, $actionUrl));
    }

    /**
     * Тестирование восстановления пароля
     */
    private function testPasswordResetMail(string $email): void
    {
        $url = route('password.reset', [
            'token' => 'test-token',
            'email' => $email,
        ]);

        Mail::to($email)->send(new PasswordResetMail($url));
    }
}
