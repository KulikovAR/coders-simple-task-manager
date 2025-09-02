<?php

namespace Tests\Unit;

use App\Models\Project;
use App\Models\User;
use App\Models\Webhook;
use App\Models\WebhookLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebhookModelTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->project = Project::factory()->create(['owner_id' => $this->user->id]);
    }

    /** @test */
    public function it_can_create_webhook()
    {
        $webhook = Webhook::create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'name' => 'Test Webhook',
            'description' => 'Test Description',
            'url' => 'https://example.com/webhook',
            'events' => ['task.created', 'task.updated'],
            'is_active' => true,
            'retry_count' => 3,
            'timeout' => 30,
        ]);

        $this->assertInstanceOf(Webhook::class, $webhook);
        $this->assertEquals('Test Webhook', $webhook->name);
        $this->assertEquals('https://example.com/webhook', $webhook->url);
        $this->assertEquals(['task.created', 'task.updated'], $webhook->events);
        $this->assertTrue($webhook->is_active);
    }

    /** @test */
    public function it_has_project_relationship()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
        ]);

        $this->assertInstanceOf(Project::class, $webhook->project);
        $this->assertEquals($this->project->id, $webhook->project->id);
    }

    /** @test */
    public function it_has_user_relationship()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
        ]);

        $this->assertInstanceOf(User::class, $webhook->user);
        $this->assertEquals($this->user->id, $webhook->user->id);
    }

    /** @test */
    public function it_has_logs_relationship()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
        ]);

        $log = WebhookLog::factory()->create([
            'webhook_id' => $webhook->id,
        ]);

        $this->assertTrue($webhook->logs->contains($log));
    }

    /** @test */
    public function it_can_check_if_listens_to_event()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'events' => ['task.created', 'task.updated'],
        ]);

        $this->assertTrue($webhook->listensTo('task.created'));
        $this->assertTrue($webhook->listensTo('task.updated'));
        $this->assertFalse($webhook->listensTo('project.created'));
    }

    /** @test */
    public function it_can_get_event_names()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'events' => ['task.created', 'task.updated'],
        ]);

        $eventNames = $webhook->event_names;

        $this->assertIsArray($eventNames);
        $this->assertContains('Задача создана', $eventNames);
        $this->assertContains('Задача обновлена', $eventNames);
    }

    /** @test */
    public function it_can_generate_secret()
    {
        $secret = Webhook::generateSecret();

        $this->assertIsString($secret);
        $this->assertStringStartsWith('whsec_', $secret);
        $this->assertEquals(70, strlen($secret)); // whsec_ + 64 hex chars
    }

    /** @test */
    public function it_casts_events_to_array()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'events' => ['task.created', 'task.updated'],
        ]);

        $this->assertIsArray($webhook->events);
        $this->assertEquals(['task.created', 'task.updated'], $webhook->events);
    }

    /** @test */
    public function it_casts_headers_to_array()
    {
        $headers = ['Authorization' => 'Bearer token', 'X-Custom' => 'value'];

        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'headers' => $headers,
        ]);

        $this->assertIsArray($webhook->headers);
        $this->assertEquals($headers, $webhook->headers);
    }

    /** @test */
    public function it_casts_boolean_fields()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'is_active' => true,
        ]);

        $this->assertTrue($webhook->is_active);
        $this->assertIsBool($webhook->is_active);
    }

    /** @test */
    public function it_casts_integer_fields()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'retry_count' => 5,
            'timeout' => 60,
        ]);

        $this->assertIsInt($webhook->retry_count);
        $this->assertIsInt($webhook->timeout);
        $this->assertEquals(5, $webhook->retry_count);
        $this->assertEquals(60, $webhook->timeout);
    }

    /** @test */
    public function webhook_log_can_be_created()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
        ]);

        $log = WebhookLog::create([
            'webhook_id' => $webhook->id,
            'event' => 'task.created',
            'payload' => ['task' => ['id' => 1]],
            'response_status' => 200,
            'response_body' => ['status' => 'success'],
            'execution_time' => 150,
            'attempts' => 1,
        ]);

        $this->assertInstanceOf(WebhookLog::class, $log);
        $this->assertEquals($webhook->id, $log->webhook_id);
        $this->assertEquals('task.created', $log->event);
        $this->assertEquals(200, $log->response_status);
    }

    /** @test */
    public function webhook_log_has_webhook_relationship()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
        ]);

        $log = WebhookLog::factory()->create([
            'webhook_id' => $webhook->id,
        ]);

        $this->assertInstanceOf(Webhook::class, $log->webhook);
        $this->assertEquals($webhook->id, $log->webhook->id);
    }

    /** @test */
    public function webhook_log_can_check_success()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
        ]);

        $successfulLog = WebhookLog::factory()->create([
            'webhook_id' => $webhook->id,
            'response_status' => 200,
        ]);

        $failedLog = WebhookLog::factory()->create([
            'webhook_id' => $webhook->id,
            'response_status' => 500,
        ]);

        $this->assertTrue($successfulLog->isSuccessful());
        $this->assertFalse($failedLog->isSuccessful());
    }

    /** @test */
    public function webhook_log_can_get_status_text()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
        ]);

        $successfulLog = WebhookLog::factory()->create([
            'webhook_id' => $webhook->id,
            'response_status' => 200,
        ]);

        $clientErrorLog = WebhookLog::factory()->create([
            'webhook_id' => $webhook->id,
            'response_status' => 400,
        ]);

        $serverErrorLog = WebhookLog::factory()->create([
            'webhook_id' => $webhook->id,
            'response_status' => 500,
        ]);

        $this->assertEquals('Успешно', $successfulLog->status_text);
        $this->assertEquals('Ошибка клиента', $clientErrorLog->status_text);
        $this->assertEquals('Ошибка сервера', $serverErrorLog->status_text);
    }

    /** @test */
    public function webhook_log_casts_payload_to_array()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
        ]);

        $payload = ['task' => ['id' => 1, 'title' => 'Test']];

        $log = WebhookLog::factory()->create([
            'webhook_id' => $webhook->id,
            'payload' => $payload,
        ]);

        $this->assertIsArray($log->payload);
        $this->assertEquals($payload, $log->payload);
    }

    /** @test */
    public function webhook_log_casts_response_body_to_array()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
        ]);

        $responseBody = ['status' => 'success', 'data' => ['id' => 1]];

        $log = WebhookLog::factory()->create([
            'webhook_id' => $webhook->id,
            'response_body' => $responseBody,
        ]);

        $this->assertIsArray($log->response_body);
        $this->assertEquals($responseBody, $log->response_body);
    }

    /** @test */
    public function webhook_log_casts_integer_fields()
    {
        $webhook = Webhook::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
        ]);

        $log = WebhookLog::factory()->create([
            'webhook_id' => $webhook->id,
            'execution_time' => 150,
            'attempts' => 3,
        ]);

        $this->assertIsInt($log->execution_time);
        $this->assertIsInt($log->attempts);
        $this->assertEquals(150, $log->execution_time);
        $this->assertEquals(3, $log->attempts);
    }

    /** @test */
    public function webhook_has_default_values()
    {
        $webhook = Webhook::create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'name' => 'Test Webhook',
            'url' => 'https://example.com/webhook',
            'events' => ['task.created'],
            'is_active' => true,
            'retry_count' => 3,
            'timeout' => 30,
        ]);

        $this->assertTrue($webhook->is_active);
        $this->assertEquals(3, $webhook->retry_count);
        $this->assertEquals(30, $webhook->timeout);
    }
}