<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    private string $botToken;

    public function __construct()
    {
        $this->botToken = (string) config('telegram.bot_token');
    }

    public function isEnabled(): bool
    {
        return !empty($this->botToken);
    }

    public function apiUrl(string $method): string
    {
        return "https://api.telegram.org/bot{$this->botToken}/{$method}";
    }

    public function sendMessage(int|string $chatId, string $text, array $options = []): bool
    {
        if (!$this->isEnabled()) {
            return false;
        }

        try {
            $payload = array_merge([
                'chat_id' => (string) $chatId,
                'text' => $text,
                'parse_mode' => 'HTML',
                'disable_web_page_preview' => true,
            ], $options);

            $response = Http::post($this->apiUrl('sendMessage'), $payload);
            if (!$response->ok() || !($response->json('ok') === true)) {
                Log::warning('Telegram sendMessage failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return false;
            }
            return true;
        } catch (\Throwable $e) {
            Log::error('Telegram sendMessage exception', ['error' => $e->getMessage()]);
            return false;
        }
    }
}


