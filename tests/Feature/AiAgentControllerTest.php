<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\AiConversation;
use App\Models\AiConversationMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiAgentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Фейкаем HTTP запросы к AI сервису
        Http::fake([
            'https://oneai-proxy.ru/api/v1/ai' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => '{"commands": []}'
                        ]
                    ]
                ],
                'session_id' => 'test-session-123',
                'output' => 'Test AI response message'
            ], 200)
        ]);
    }

    public function test_index_page_is_displayed_for_authenticated_user(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/ai-agent');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('AiAgent/Index')
            ->where('user.id', $user->id)
            ->has('conversations')
            ->has('stats')
        );
    }

    public function test_index_requires_authentication(): void
    {
        $response = $this->get('/ai-agent');

        $response->assertRedirect('/login');
    }

    public function test_index_shows_user_conversations(): void
    {
        $user = User::factory()->create();
        $conversation = AiConversation::factory()->create(['user_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->get('/ai-agent');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('AiAgent/Index')
            ->where('user.id', $user->id)
            ->has('conversations')
        );
    }

    public function test_index_shows_user_stats(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/ai-agent');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('AiAgent/Index')
            ->has('stats')
        );
    }

    public function test_process_request_handles_valid_request(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/ai-agent/process', [
                'message' => 'Test message',
                'session_id' => 'test-session-123'
            ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'message',
            'session_id',
            'commands_executed',
            'processing_time',
            'command_results'
        ]);
    }

    public function test_process_request_requires_authentication(): void
    {
        $response = $this->post('/ai-agent/process', [
            'message' => 'Test message',
            'session_id' => 'test-session-123'
        ]);

        $response->assertRedirect('/login');
    }

    public function test_process_request_validates_required_fields(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/ai-agent/process', []);

        $response->assertSessionHasErrors(['message']);
    }

    public function test_process_request_validates_message_length(): void
    {
        $user = User::factory()->create();
        $longMessage = str_repeat('A', 1001); // Превышает лимит в 1000 символов

        $response = $this
            ->actingAs($user)
            ->post('/ai-agent/process', [
                'message' => $longMessage
            ]);

        $response->assertSessionHasErrors(['message']);
    }

    public function test_process_request_accepts_optional_session_id(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/ai-agent/process', [
                'message' => 'Test message'
            ]);

        $response->assertOk();
    }

    public function test_get_conversations_returns_user_conversations(): void
    {
        $user = User::factory()->create();
        $conversation = AiConversation::factory()->create(['user_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->get('/ai-agent/conversations');

        $response->assertOk();
        $response->assertJson([
            'success' => true
        ]);
        $response->assertJsonStructure([
            'success',
            'conversations'
        ]);
    }

    public function test_get_conversations_requires_authentication(): void
    {
        $response = $this->get('/ai-agent/conversations');

        $response->assertRedirect('/login');
    }

    public function test_get_conversations_with_custom_per_page(): void
    {
        $user = User::factory()->create();
        
        // Создаем 15 диалогов
        for ($i = 0; $i < 15; $i++) {
            AiConversation::factory()->create(['user_id' => $user->id]);
        }

        $response = $this
            ->actingAs($user)
            ->get('/ai-agent/conversations?per_page=5');

        $response->assertOk();
        $response->assertJson([
            'success' => true
        ]);
        
        $data = $response->json();
        $this->assertCount(5, $data['conversations']);
    }

    public function test_get_conversations_defaults_to_10_per_page(): void
    {
        $user = User::factory()->create();
        
        // Создаем 15 диалогов
        for ($i = 0; $i < 15; $i++) {
            AiConversation::factory()->create(['user_id' => $user->id]);
        }

        $response = $this
            ->actingAs($user)
            ->get('/ai-agent/conversations');

        $response->assertOk();
        
        $data = $response->json();
        $this->assertCount(10, $data['conversations']);
    }

    public function test_get_conversation_messages_returns_messages(): void
    {
        $user = User::factory()->create();
        $conversation = AiConversation::factory()->create(['user_id' => $user->id]);
        $message = AiConversationMessage::factory()->create([
            'conversation_id' => $conversation->id
        ]);

        $response = $this
            ->actingAs($user)
            ->get("/ai-agent/conversations/{$conversation->id}/messages");

        $response->assertOk();
        $response->assertJson([
            'success' => true
        ]);
        $response->assertJsonStructure([
            'success',
            'conversation',
            'messages'
        ]);
    }

    public function test_get_conversation_messages_requires_authentication(): void
    {
        $conversation = AiConversation::factory()->create();

        $response = $this->get("/ai-agent/conversations/{$conversation->id}/messages");

        $response->assertRedirect('/login');
    }

    public function test_get_conversation_messages_denies_access_for_other_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $conversation = AiConversation::factory()->create(['user_id' => $otherUser->id]);

        $response = $this
            ->actingAs($user)
            ->get("/ai-agent/conversations/{$conversation->id}/messages");

        $response->assertStatus(404);
    }

    public function test_get_conversation_messages_with_custom_per_page(): void
    {
        $user = User::factory()->create();
        $conversation = AiConversation::factory()->create(['user_id' => $user->id]);
        
        // Создаем 25 сообщений
        for ($i = 0; $i < 25; $i++) {
            AiConversationMessage::factory()->create([
                'conversation_id' => $conversation->id
            ]);
        }

        $response = $this
            ->actingAs($user)
            ->get("/ai-agent/conversations/{$conversation->id}/messages?per_page=15");

        $response->assertOk();
        
        $data = $response->json();
        $this->assertCount(15, $data['messages']);
    }

    public function test_get_conversation_messages_defaults_to_20_per_page(): void
    {
        $user = User::factory()->create();
        $conversation = AiConversation::factory()->create(['user_id' => $user->id]);
        
        // Создаем 25 сообщений
        for ($i = 0; $i < 25; $i++) {
            AiConversationMessage::factory()->create([
                'conversation_id' => $conversation->id
            ]);
        }

        $response = $this
            ->actingAs($user)
            ->get("/ai-agent/conversations/{$conversation->id}/messages");

        $response->assertOk();
        
        $data = $response->json();
        $this->assertCount(20, $data['messages']);
    }

    public function test_create_conversation_creates_new_conversation(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/ai-agent/conversations');

        $response->assertOk();
        $response->assertJson([
            'success' => true
        ]);
        $response->assertJsonStructure([
            'success',
            'conversation'
        ]);

        $this->assertDatabaseHas('ai_conversations', [
            'user_id' => $user->id
        ]);
    }

    public function test_create_conversation_requires_authentication(): void
    {
        $response = $this->post('/ai-agent/conversations');

        $response->assertRedirect('/login');
    }

    public function test_delete_conversation_deletes_conversation(): void
    {
        $user = User::factory()->create();
        $conversation = AiConversation::factory()->create(['user_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->delete("/ai-agent/conversations/{$conversation->id}");

        $response->assertOk();
        $response->assertJson([
            'success' => true
        ]);

        $this->assertDatabaseMissing('ai_conversations', ['id' => $conversation->id]);
    }

    public function test_delete_conversation_requires_authentication(): void
    {
        $conversation = AiConversation::factory()->create();

        $response = $this->delete("/ai-agent/conversations/{$conversation->id}");

        $response->assertRedirect('/login');
    }

    public function test_delete_conversation_denies_access_for_other_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $conversation = AiConversation::factory()->create(['user_id' => $otherUser->id]);

        $response = $this
            ->actingAs($user)
            ->delete("/ai-agent/conversations/{$conversation->id}");

        $response->assertStatus(404);
    }

    public function test_delete_conversation_deletes_related_messages(): void
    {
        $user = User::factory()->create();
        $conversation = AiConversation::factory()->create(['user_id' => $user->id]);
        
        // Создаем несколько сообщений
        for ($i = 0; $i < 5; $i++) {
            AiConversationMessage::factory()->create([
                'conversation_id' => $conversation->id
            ]);
        }

        $response = $this
            ->actingAs($user)
            ->delete("/ai-agent/conversations/{$conversation->id}");

        $response->assertOk();

        // Проверяем, что диалог и сообщения удалены
        $this->assertDatabaseMissing('ai_conversations', ['id' => $conversation->id]);
        $this->assertEquals(0, AiConversationMessage::where('conversation_id', $conversation->id)->count());
    }



    public function test_ai_agent_handles_empty_message(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/ai-agent/process', [
                'message' => ''
            ]);

        $response->assertSessionHasErrors(['message']);
    }

    public function test_ai_agent_handles_whitespace_only_message(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/ai-agent/process', [
                'message' => '   '
            ]);

        $response->assertSessionHasErrors(['message']);
    }

    public function test_ai_agent_handles_special_characters_in_message(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/ai-agent/process', [
                'message' => 'Test message with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
            ]);

        $response->assertOk();
    }

    public function test_ai_agent_handles_unicode_characters(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/ai-agent/process', [
                'message' => 'Тест с русскими символами и emoji 🚀✨'
            ]);

        $response->assertOk();
    }
}
