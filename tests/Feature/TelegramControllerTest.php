<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TelegramControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_requires_valid_secret_token(): void
    {
        // Устанавливаем секретный токен в конфигурации
        config(['telegram.webhook_secret' => 'test_secret']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ], [
            'X-Telegram-Bot-Api-Secret-Token' => 'wrong_secret'
        ]);

        $response->assertStatus(403);
    }

    public function test_webhook_accepts_valid_secret_token(): void
    {
        // Устанавливаем секретный токен в конфигурации
        config(['telegram.webhook_secret' => 'test_secret']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ], [
            'X-Telegram-Bot-Api-Secret-Token' => 'test_secret'
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_works_without_secret_token(): void
    {
        // Не устанавливаем секретный токен
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_start_command(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_start_command_variations(): void
    {
        config(['telegram.webhook_secret' => '']);

        $variations = ['start', 'Start'];

        foreach ($variations as $variation) {
            $response = $this->post('/api/telegram/webhook', [
                'message' => [
                    'text' => $variation,
                    'chat' => ['id' => 123456, 'type' => 'private'],
                    'from' => ['id' => 789012]
                ]
            ]);

            $response->assertStatus(204);
        }
    }

    public function test_webhook_handles_private_chat(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_group_chat(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => ['id' => 123456, 'type' => 'group'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_supergroup_chat(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => ['id' => 123456, 'type' => 'supergroup'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_missing_chat_id(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => ['type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_missing_from_id(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => []
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_missing_message(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', []);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_edited_message(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'edited_message' => [
                'text' => '/start',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_ai_command(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/ai test query',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_id_command(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/id',
                'chat' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_empty_text(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_whitespace_text(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '   ',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_special_characters(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '!@#$%^&*()_+-=[]{}|;:,.<>?',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_unicode_characters(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => 'Привет мир! 🚀✨',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_long_text(): void
    {
        config(['telegram.webhook_secret' => '']);

        $longText = str_repeat('A', 1000);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => $longText,
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_missing_chat_type(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => ['id' => 123456],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_missing_bot_username(): void
    {
        config(['telegram.webhook_secret' => '']);
        config(['telegram.bot_username' => null]);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_bot_username_with_at_symbol(): void
    {
        config(['telegram.webhook_secret' => '']);
        config(['telegram.bot_username' => '@test_bot']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_bot_username_without_at_symbol(): void
    {
        config(['telegram.webhook_secret' => '']);
        config(['telegram.bot_username' => 'test_bot']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_malformed_request(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'invalid_key' => 'invalid_value'
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_json_payload(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ], [
            'Content-Type' => 'application/json'
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_multiple_messages(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ],
            'edited_message' => [
                'text' => '/ai help',
                'chat' => ['id' => 123456, 'type' => 'private'],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_empty_chat_array(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => [],
                'from' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }

    public function test_webhook_handles_empty_from_array(): void
    {
        config(['telegram.webhook_secret' => '']);

        $response = $this->post('/api/telegram/webhook', [
            'message' => [
                'text' => '/start',
                'chat' => ['id' => 789012]
            ]
        ]);

        $response->assertStatus(204);
    }
}
