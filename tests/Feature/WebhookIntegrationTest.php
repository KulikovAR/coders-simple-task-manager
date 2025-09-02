<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\User;
use App\Models\Webhook;
use App\Models\WebhookLog;
use App\Services\TaskService;
use App\Services\WebhookService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WebhookIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Project $project;
    private WebhookService $webhookService;
    private TaskService $taskService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->project = Project::factory()->create(['owner_id' => $this->user->id]);
        $this->webhookService = app(WebhookService::class);
        $this->taskService = app(TaskService::class);
    }

    /** @test */
    public function it_dispatches_webhook_when_task_is_created()
    {
        Http::fake([
            'https://example.com/webhook' => Http::response(['status' => 'success'], 200),
        ]);

        // Создаем webhook
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'url' => 'https://example.com/webhook',
            'events' => ['task.created'],
            'is_active' => true,
        ]);

        // Создаем статус для проекта
        $status = TaskStatus::factory()->create([
            'project_id' => $this->project->id,
            'name' => 'To Do',
            'order' => 1,
        ]);

        // Создаем задачу
        $taskData = [
            'title' => 'Test Task',
            'description' => 'Test Description',
            'priority' => 'high',
            'status_id' => $status->id,
        ];

        $task = $this->taskService->createTask($taskData, $this->project, $this->user);

        // Проверяем, что webhook был вызван
        Http::assertSent(function ($request) {
            $payload = $request->data();
            return $request->url() === 'https://example.com/webhook' &&
                   $payload['event'] === 'task.created' &&
                   isset($payload['data']['task']) &&
                   $payload['data']['task']['title'] === 'Test Task';
        });

        // Проверяем, что лог был создан
        $this->assertDatabaseHas('webhook_logs', [
            'webhook_id' => $webhook->id,
            'event' => 'task.created',
            'response_status' => 200,
        ]);
    }

    /** @test */
    public function it_handles_webhook_failures_gracefully()
    {
        Http::fake([
            'https://example.com/webhook' => Http::response(['error' => 'Server Error'], 500),
        ]);

        // Создаем webhook
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'url' => 'https://example.com/webhook',
            'events' => ['task.created'],
            'is_active' => true,
        ]);

        // Создаем статус для проекта
        $status = TaskStatus::factory()->create([
            'project_id' => $this->project->id,
            'name' => 'To Do',
            'order' => 1,
        ]);

        // Создаем задачу
        $taskData = [
            'title' => 'Test Task',
            'description' => 'Test Description',
            'status_id' => $status->id,
        ];

        $task = $this->taskService->createTask($taskData, $this->project, $this->user);

        // Проверяем, что задача была создана несмотря на ошибку webhook
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Test Task',
        ]);

        // Проверяем, что лог ошибки был создан
        $this->assertDatabaseHas('webhook_logs', [
            'webhook_id' => $webhook->id,
            'event' => 'task.created',
            'response_status' => 500,
        ]);
    }
}