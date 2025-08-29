<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Carbon\Carbon;

class CheckTaskAssignmentDeadlines extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'deadlines:check-assignment';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Проверяет дедлайнов недавно назначенных задач и отправляет уведомления';

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
        $this->info('Проверка дедлайнов недавно назначенных задач...');

        $now = Carbon::now();
        
        // Получаем задачи, назначенные в последние 24 часа
        $recentlyAssignedTasks = Task::where('updated_at', '>=', $now->copy()->subDay())
            ->whereNotNull('assignee_id')
            ->whereNotNull('deadline')
            ->whereHas('status', function ($query) {
                $query->whereNotIn('name', ['Завершено', 'Отменено']);
            })
            ->with(['assignee', 'project'])
            ->get();

        $this->info("Найдено {$recentlyAssignedTasks->count()} недавно назначенных задач с дедлайнами");

        foreach ($recentlyAssignedTasks as $task) {
            $this->checkTaskDeadline($task, $now);
        }

        $this->info('Проверка дедлайнов назначенных задач завершена!');
    }

    /**
     * Проверяет дедлайн конкретной задачи
     */
    private function checkTaskDeadline(Task $task, Carbon $now): void
    {
        $deadline = Carbon::parse($task->deadline);
        $daysUntilDeadline = $now->diffInDays($deadline, false);

        $this->line("Проверяем задачу: {$task->title} (дедлайн: {$deadline->format('d.m.Y')})");

        if ($daysUntilDeadline === 2) {
            $this->line("  Отправляем уведомление: До дедлайна остается 2 дня или 48 часов");
            $this->notificationService->deadlineApproachingWithCustomMessage(
                $task, 
                'До дедлайна остается 2 дня или 48 часов'
            );
        } elseif ($daysUntilDeadline === 1) {
            $this->line("  Отправляем уведомление: До дедлайна остается 1 день");
            $this->notificationService->deadlineApproachingWithCustomMessage(
                $task, 
                'До дедлайна остается 1 день'
            );
        } elseif ($daysUntilDeadline === 0) {
            $this->line("  Отправляем уведомление: Дедлайн сегодня");
            $this->notificationService->deadlineApproachingWithCustomMessage(
                $task, 
                'Дедлайн сегодня'
            );
        } else {
            $this->line("  Дедлайн через {$daysUntilDeadline} дней - уведомление не требуется");
        }
    }
}
