<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Ai\CommandRegistry;
use App\Services\Ai\ContextProviders\DynamicStatusContextProvider;
use App\Services\Ai\ContextProviders\EnumsContextProvider;
use App\Services\Ai\ContextProviders\ProjectContextProvider;
use App\Services\Ai\ContextProviders\UserContextProvider;
use App\Services\Ai\ContextProviders\UsersContextProvider;
use App\Services\Ai\FlexibleAiAgentService;
use App\Services\AiConversationService;
use App\Services\CommentService;
use App\Services\ProjectService;
use App\Services\SprintService;
use App\Services\TaskService;
use App\Services\TaskStatusService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class FlexibleAiAgentServiceTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private FlexibleAiAgentService $aiAgent;
    private CommandRegistry $commandRegistry;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->commandRegistry = new CommandRegistry(
            app(ProjectService::class),
            app(TaskService::class),
            app(SprintService::class),
            app(CommentService::class)
        );

        $contextProviders = [
            new UserContextProvider(),
            new ProjectContextProvider(app(ProjectService::class)),
            new UsersContextProvider(),
            new EnumsContextProvider(),
            new DynamicStatusContextProvider(app(TaskStatusService::class)),
        ];

        $this->aiAgent = new FlexibleAiAgentService(
            $this->commandRegistry,
            $contextProviders,
            app(AiConversationService::class)
        );

        Config::set('services.ai.url', 'https://test-ai-service.com/api');
        Config::set('services.ai.token', 'test-token');
        Config::set('services.ai.model', 'test-model');
    }

    /**
     * Test basic command identification flow
     */
    public function test_command_identification(): void
    {
        Http::fake([
            'https://test-ai-service.com/api' => Http::sequence()
                // Command identification request
                ->push([
                    'output' => '{"command": "LIST_TASKS"}',
                    'session_id' => 'test-session-123'
                ], 200)
                // Command parameters request
                ->push([
                    'output' => '{"parameters": {"my_tasks": true}}',
                    'session_id' => 'test-session-123'
                ], 200)
                // Response generation request
                ->push([
                    'output' => 'Вот список ваших задач.',
                    'session_id' => 'test-session-123'
                ], 200)
        ]);

        $result = $this->aiAgent->processRequest('Покажи мои задачи', $this->user);

        $this->assertTrue($result['success']);
        $this->assertEquals('test-session-123', $result['session_id']);
        $this->assertEquals('Вот список ваших задач.', $result['message']);
        $this->assertEquals(1, $result['commands_executed']);

        // Verify all three requests were made
        Http::assertSentCount(3);
        
        // Verify the first request was for command identification
        Http::assertSent(function ($request) {
            return $request->url() === 'https://test-ai-service.com/api' &&
                   $request['model'] === 'test-model' &&
                   str_contains($request['input'], 'ТОЛЬКО НАЗВАНИЕ');
        });
    }

    /**
     * Test the command parameters process
     */
    public function test_command_parameters(): void
    {
        Http::fake([
            'https://test-ai-service.com/api' => Http::sequence()
                // Command identification request
                ->push([
                    'output' => '{"command": "CREATE_TASK"}',
                    'session_id' => 'test-session-123'
                ], 200)
                // Command parameters request
                ->push([
                    'output' => '{"parameters": {"title": "Новая задача", "description": "Описание задачи", "assign_to_me": true}}',
                    'session_id' => 'test-session-123'
                ], 200)
                // Response generation request
                ->push([
                    'output' => 'Я создал новую задачу "Новая задача" и назначил её на вас.',
                    'session_id' => 'test-session-123'
                ], 200)
        ]);

 
        $result = $this->aiAgent->processRequest('Создай задачу "Новая задача" и назначь на меня', $this->user);

 
        $this->assertTrue($result['success']);
        $this->assertEquals('test-session-123', $result['session_id']);
        $this->assertEquals('Я создал новую задачу "Новая задача" и назначил её на вас.', $result['message']);

        // Verify all three requests were made
        Http::assertSentCount(3);
        
        // Verify the second request was for parameters
        Http::assertSent(function ($request) {
            return $request->url() === 'https://test-ai-service.com/api' &&
                   str_contains($request['input'], 'Параметры команды');
        });
    }

    /**
     * Test handling of empty user input
     */
    public function test_empty_input_handling(): void
    {
        $result = $this->aiAgent->processRequest('', $this->user);

        $this->assertFalse($result['success']);
        $this->assertEquals('Запрос не может быть пустым', $result['message']);
    }

    /**
     * Test rate limiting functionality
     */
    public function test_rate_limiting(): void
    {
        // Configure rate limit to 1 request per minute for testing
        Config::set('ai-agent.rate_limiting.requests_per_minute', 1);

        // First request should succeed
        Http::fake([
            'https://test-ai-service.com/api' => Http::response([
                'output' => 'Ответ на первый запрос',
                'session_id' => 'test-session-123'
            ], 200)
        ]);

        $this->aiAgent->processRequest('Первый запрос', $this->user);

        // Second request should be rate limited
        $result = $this->aiAgent->processRequest('Второй запрос', $this->user);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Слишком много запросов', $result['message']);
    }

    /**
     * Test fallback commands when AI doesn't return any commands
     */
    public function test_fallback_commands(): void
    {
        Http::fake([
            'https://test-ai-service.com/api' => Http::sequence()
                // First request - empty commands response
                ->push([
                    'output' => '{"commands": []}',
                    'session_id' => 'test-session-123'
                ], 200)
                // Second request - response generation
                ->push([
                    'output' => 'Вот список ваших задач.',
                    'session_id' => 'test-session-123'
                ], 200)
        ]);

        // Use a request that should trigger fallback
        $result = $this->aiAgent->processRequest('статус задач', $this->user);

        $this->assertTrue($result['success']);
        $this->assertEquals('Вот список ваших задач.', $result['message']);

        // Verify the fallback command was used
        $this->assertGreaterThan(0, $result['commands_executed']);
    }

    /**
     * Test error handling when AI service fails
     */
    public function test_ai_service_error_handling(): void
    {
        Http::fake([
            'https://test-ai-service.com/api' => Http::response('Internal Server Error', 500)
        ]);

        $result = $this->aiAgent->processRequest('Покажи мои задачи', $this->user);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Ошибка при обращении к ИИ сервису', $result['message']);
    }
}
