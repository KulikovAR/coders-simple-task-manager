<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Models\User;
use App\Services\WebhookService;
use Illuminate\Console\Command;

class TestWebhookCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'webhook:test {url} {--project=} {--user=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Тестировать webhook интеграцию';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $url = $this->argument('url');
        $projectId = $this->option('project');
        $userId = $this->option('user');

        // Получаем проект и пользователя
        $project = $projectId ? Project::find($projectId) : Project::first();
        $user = $userId ? User::find($userId) : User::first();

        if (!$project) {
            $this->error('Проект не найден. Используйте --project=ID');
            return 1;
        }

        if (!$user) {
            $this->error('Пользователь не найден. Используйте --user=ID');
            return 1;
        }

        $this->info("Тестируем webhook для проекта: {$project->name}");
        $this->info("URL: {$url}");

        // Создаем временный webhook
        $webhookService = app(WebhookService::class);
        
        $webhook = $webhookService->createWebhook([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'name' => 'Тестовый webhook',
            'description' => 'Временный webhook для тестирования',
            'url' => $url,
            'events' => ['task.created', 'task.updated'],
            'is_active' => true,
        ]);

        $this->info("Создан webhook ID: {$webhook->id}");

        // Тестируем webhook
        $result = $webhookService->testWebhook($webhook);

        if ($result['success']) {
            $this->info('✅ Webhook протестирован успешно!');
        } else {
            $this->error('❌ Ошибка тестирования: ' . $result['message']);
        }

        // Отправляем тестовое событие
        $this->info('Отправляем тестовое событие...');
        $webhookService->dispatchEvent('task.created', [
            'task' => [
                'id' => 999,
                'title' => 'Тестовая задача',
                'description' => 'Это тестовая задача для проверки webhook',
                'priority' => 'high',
                'status' => 'Новая',
            ],
            'project' => $project->toArray(),
            'user' => $user->toArray(),
        ], $project->id);

        $this->info('✅ Тестовое событие отправлено!');

        // Удаляем временный webhook
        $webhookService->deleteWebhook($webhook);
        $this->info('Временный webhook удален.');

        return 0;
    }
}
