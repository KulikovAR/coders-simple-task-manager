<?php

namespace Tests\Unit;

use App\Models\Project;
use App\Models\User;
use App\Models\Webhook;
use App\Models\WebhookLog;
use App\Services\WebhookService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WebhookServiceTest extends TestCase
{
    use RefreshDatabase;

    private WebhookService $webhookService;
    private User $user;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->webhookService = app(WebhookService::class);
        $this->user = User::factory()->create();
        $this->project = Project::factory()->create(['owner_id' => $this->user->id]);
    }

    /** @test */
    public function it_can_create_webhook()
    {
        $webhookData = [
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'name' => 'Test Webhook',
            'description' => 'Test Description',
            'url' => 'https://example.com/webhook',
            'events' => ['task.created', 'task.updated'],
            'is_active' => true,
            'retry_count' => 3,
            'timeout' => 30,
        ];

        $webhook = $this->webhookService->createWebhook($webhookData);

        $this->assertInstanceOf(Webhook::class, $webhook);
        $this->assertEquals('Test Webhook', $webhook->name);
        $this->assertEquals('https://example.com/webhook', $webhook->url);
        $this->assertEquals(['task.created', 'task.updated'], $webhook->events);
        $this->assertTrue($webhook->is_active);
        $this->assertNotNull($webhook->secret);
        $this->assertStringStartsWith('whsec_', $webhook->secret);
    }

    /** @test */
    public function it_generates_secret_when_not_provided()
    {
        $webhookData = [
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'name' => 'Test Webhook',
            'url' => 'https://example.com/webhook',
            'events' => ['task.created'],
        ];

        $webhook = $this->webhookService->createWebhook($webhookData);

        $this->assertNotNull($webhook->secret);
        $this->assertStringStartsWith('whsec_', $webhook->secret);
    }

    /** @test */
    public function it_can_update_webhook()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'name' => 'Original Name',
        ]);

        $updateData = [
            'name' => 'Updated Name',
            'description' => 'Updated Description',
            'is_active' => false,
        ];

        $updatedWebhook = $this->webhookService->updateWebhook($webhook, $updateData);

        $this->assertEquals('Updated Name', $updatedWebhook->name);
        $this->assertEquals('Updated Description', $updatedWebhook->description);
        $this->assertFalse($updatedWebhook->is_active);
    }

    /** @test */
    public function it_can_delete_webhook()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
        ]);

        $result = $this->webhookService->deleteWebhook($webhook);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('webhooks', ['id' => $webhook->id]);
    }

    /** @test */
    public function it_can_send_webhook_successfully()
    {
        Http::fake([
            'https://example.com/webhook' => Http::response(['status' => 'success'], 200),
        ]);

        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'url' => 'https://example.com/webhook',
            'events' => ['task.created'],
            'is_active' => true,
        ]);

        $eventData = [
            'task' => ['id' => 1, 'title' => 'Test Task'],
            'project' => $this->project->toArray(),
        ];

        $this->webhookService->sendWebhook($webhook, 'task.created', $eventData);

        // Проверяем, что HTTP запрос был отправлен
        Http::assertSent(function ($request) use ($webhook) {
            return $request->url() === $webhook->url &&
                   $request->hasHeader('Content-Type', 'application/json') &&
                   $request->hasHeader('User-Agent', '379TM-Webhook/1.0') &&
                   $request->hasHeader('X-Webhook-Event') &&
                   $request->hasHeader('X-Webhook-Signature');
        });

        // Проверяем, что лог был создан
        $this->assertDatabaseHas('webhook_logs', [
            'webhook_id' => $webhook->id,
            'event' => 'task.created',
            'response_status' => 200,
        ]);
    }

    /** @test */
    public function it_handles_webhook_failure()
    {
        Http::fake([
            'https://example.com/webhook' => Http::response(['error' => 'Server Error'], 500),
        ]);

        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'url' => 'https://example.com/webhook',
            'events' => ['task.created'],
            'is_active' => true,
        ]);

        $eventData = [
            'task' => ['id' => 1, 'title' => 'Test Task'],
        ];

        $this->webhookService->sendWebhook($webhook, 'task.created', $eventData);

        // Проверяем, что лог был создан с ошибкой
        $this->assertDatabaseHas('webhook_logs', [
            'webhook_id' => $webhook->id,
            'event' => 'task.created',
            'response_status' => 500,
        ]);
    }

    /** @test */
    public function it_handles_webhook_timeout()
    {
        Http::fake([
            'https://example.com/webhook' => Http::response(['status' => 'success'], 200),
        ]);

        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'url' => 'https://example.com/webhook',
            'timeout' => 1, // Очень короткий таймаут
            'is_active' => true,
        ]);

        $eventData = ['task' => ['id' => 1]];

        $this->webhookService->sendWebhook($webhook, 'task.created', $eventData);

        // Проверяем, что лог был создан
        $this->assertDatabaseHas('webhook_logs', [
            'webhook_id' => $webhook->id,
            'event' => 'task.created',
        ]);
        
        $log = WebhookLog::where('webhook_id', $webhook->id)->first();
        $this->assertNotNull($log);
    }

    /** @test */
    public function it_can_test_webhook()
    {
        Http::fake([
            'https://example.com/webhook' => Http::response(['status' => 'success'], 200),
        ]);

        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'url' => 'https://example.com/webhook',
            'is_active' => true,
        ]);

        $result = $this->webhookService->testWebhook($webhook);

        $this->assertTrue($result['success']);
        $this->assertEquals('Webhook успешно протестирован', $result['message']);
    }

    /** @test */
    public function it_can_get_webhook_stats()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
        ]);

        // Создаем тестовые логи
        WebhookLog::factory()->create([
            'webhook_id' => $webhook->id,
            'response_status' => 200,
            'execution_time' => 100,
        ]);

        WebhookLog::factory()->create([
            'webhook_id' => $webhook->id,
            'response_status' => 500,
            'execution_time' => 200,
        ]);

        $stats = $this->webhookService->getWebhookStats($webhook);

        $this->assertEquals(2, $stats['total_requests']);
        $this->assertEquals(1, $stats['successful_requests']);
        $this->assertEquals(1, $stats['failed_requests']);
        $this->assertEquals(50.0, $stats['success_rate']);
        $this->assertEquals(150.0, $stats['average_execution_time']);
    }

    /** @test */
    public function it_dispatches_events_to_active_webhooks_only()
    {
        // Создаем активный webhook
        $activeWebhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'url' => 'https://active.example.com/webhook',
            'events' => ['task.created'],
            'is_active' => true,
        ]);

        // Создаем неактивный webhook
        $inactiveWebhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'url' => 'https://inactive.example.com/webhook',
            'events' => ['task.created'],
            'is_active' => false,
        ]);

        Http::fake([
            'https://active.example.com/webhook' => Http::response(['status' => 'success'], 200),
        ]);

        $eventData = ['task' => ['id' => 1]];

        $this->webhookService->dispatchEvent('task.created', $eventData, $this->project->id);

        // Проверяем, что только активный webhook получил запрос
        Http::assertSent(function ($request) {
            return $request->url() === 'https://active.example.com/webhook';
        });

        Http::assertNotSent(function ($request) {
            return $request->url() === 'https://inactive.example.com/webhook';
        });
    }

    /** @test */
    public function it_filters_webhooks_by_event()
    {
        $webhook1 = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'url' => 'https://task.example.com/webhook',
            'events' => ['task.created'],
            'is_active' => true,
        ]);

        $webhook2 = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'url' => 'https://project.example.com/webhook',
            'events' => ['project.created'],
            'is_active' => true,
        ]);

        Http::fake([
            'https://task.example.com/webhook' => Http::response(['status' => 'success'], 200),
        ]);

        $eventData = ['task' => ['id' => 1]];

        $this->webhookService->dispatchEvent('task.created', $eventData, $this->project->id);

        // Проверяем, что только webhook для task.created получил запрос
        Http::assertSent(function ($request) {
            return $request->url() === 'https://task.example.com/webhook';
        });

        Http::assertNotSent(function ($request) {
            return $request->url() === 'https://project.example.com/webhook';
        });
    }

    /** @test */
    public function it_builds_correct_payload()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'url' => 'https://example.com/webhook',
        ]);

        $eventData = [
            'task' => ['id' => 1, 'title' => 'Test Task'],
            'project' => $this->project->toArray(),
        ];

        Http::fake([
            'https://example.com/webhook' => Http::response(['status' => 'success'], 200),
        ]);

        $this->webhookService->sendWebhook($webhook, 'task.created', $eventData);

        Http::assertSent(function ($request) use ($webhook, $eventData) {
            $payload = $request->data();
            
            return $payload['event'] === 'task.created' &&
                   $payload['data'] === $eventData &&
                   isset($payload['timestamp']) &&
                   $payload['webhook_id'] === $webhook->id &&
                   $payload['project_id'] === $this->project->id;
        });
    }

    /** @test */
    public function it_includes_custom_headers()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'url' => 'https://example.com/webhook',
            'headers' => [
                'X-Custom-Header' => 'Custom Value',
                'Authorization' => 'Bearer token123',
            ],
        ]);

        Http::fake([
            'https://example.com/webhook' => Http::response(['status' => 'success'], 200),
        ]);

        $this->webhookService->sendWebhook($webhook, 'task.created', []);

        Http::assertSent(function ($request) {
            return $request->hasHeader('X-Custom-Header', 'Custom Value') &&
                   $request->hasHeader('Authorization', 'Bearer token123');
        });
    }
}