<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Carbon\Carbon;

class CheckDeadlinesWithUserTime extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'deadlines:check-user-time';

    /**
     * The console console command description.
     *
     * @var string
     */
    protected $description = 'Проверяет дедлайны задач и отправляет уведомления в настройенное пользователем время';

    public function __construct(
        private NotificationService $notificationService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Проверка дедлайнов задач с учетом времени пользователей...');

        $now = Carbon::now();

        // Получаем всех пользователей с настройками времени уведомлений
        $users = User::whereNotNull('deadline_notification_time')
            ->where('email_notifications', true)
            ->get();

        $this->info("Найдено {$users->count()} пользователей с настройками времени уведомлений");

        foreach ($users as $user) {
            $this->checkDeadlinesForUser($user, $now);
        }

        $this->info('Проверка дедлайнов завершена!');
    }

    /**
     * Проверяет дедлайны для конкретного пользователя
     */
    private function checkDeadlinesForUser(User $user, Carbon $now): void
    {
        $userTime = Carbon::parse($user->deadline_notification_time);
        $currentTime = $now->format('H:i');
        $userNotificationTime = $userTime->format('H:i');

        $this->line("Проверяем дедлайны для пользователя: {$user->name} (время юзера: {$userNotificationTime}), время сейчас {$currentTime}");

        // Проверяем, наступило ли время для отправки уведомлений этому пользователю
        if ($currentTime !== $userNotificationTime) {
            return;
        }

        $this->line("Проверяем дедлайны для пользователя: {$user->name} (время: {$userNotificationTime})");

        // Задачи с дедлайном через 2 дня (48 часов)
        $this->checkDeadlinesInDays($user, $now, 2, 'До дедлайна остается 2 дня или 48 часов');

        // Задачи с дедлайном через 1 день
        $this->checkDeadlinesInDays($user, $now, 1, 'До дедлайна остается 1 день');

        // Задачи с дедлайном сегодня
        $this->checkDeadlinesInDays($user, $now, 0, 'Дедлайн сегодня');
    }

    /**
     * Проверяет задачи с дедлайном через указанное количество дней
     */
    private function checkDeadlinesInDays(User $user, Carbon $now, int $days, string $message): void
    {
        $deadlineDate = $now->copy()->addDays($days)->startOfDay();

        $tasks = Task::where('deadline', $deadlineDate->format('Y-m-d'))
            ->where('assignee_id', $user->id)
            ->whereHas('status', function ($query) {
                $query->whereNotIn('name', ['Завершено', 'Отменено']);
            })
            ->with(['project'])
            ->get();

        if ($tasks->count() > 0) {
            $this->line("  Найдено {$tasks->count()} задач с дедлайном через {$days} дней");

            foreach ($tasks as $task) {
                $this->notificationService->deadlineApproachingWithCustomMessage($task, $message);
                $this->line("    Уведомление отправлено для задачи: {$task->title}");
            }
        }
    }
}
