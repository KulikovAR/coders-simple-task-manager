<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Carbon\Carbon;

class CheckDeadlines extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'deadlines:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Проверяет дедлайны задач и отправляет уведомления';

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
        $this->info('Проверка дедлайнов задач...');

        $now = Carbon::now();
        $approachingDeadline = $now->copy()->addDays(1); // Завтра
        $overdueDeadline = $now->copy()->subDay(); // Вчера

        // Задачи с приближающимся дедлайном (завтра)
        $approachingTasks = Task::where('deadline', '<=', $approachingDeadline)
            ->where('deadline', '>', $now)
            ->whereNotNull('assignee_id')
            ->whereHas('status', function ($query) {
                $query->whereNotIn('name', ['Завершено', 'Отменено']);
            })
            ->with(['assignee', 'project'])
            ->get();

        $this->info("Найдено {$approachingTasks->count()} задач с приближающимся дедлайном");

        foreach ($approachingTasks as $task) {
            $this->notificationService->deadlineApproaching($task);
            $this->line("Уведомление отправлено для задачи: {$task->title}");
        }

        // Просроченные задачи
        $overdueTasks = Task::where('deadline', '<', $now)
            ->whereNotNull('assignee_id')
            ->whereHas('status', function ($query) {
                $query->whereNotIn('name', ['Завершено', 'Отменено']);
            })
            ->with(['assignee', 'project'])
            ->get();

        $this->info("Найдено {$overdueTasks->count()} просроченных задач");

        foreach ($overdueTasks as $task) {
            $this->notificationService->deadlineOverdue($task);
            $this->line("Уведомление о просрочке отправлено для задачи: {$task->title}");
        }

        $this->info('Проверка дедлайнов завершена!');
    }
}
