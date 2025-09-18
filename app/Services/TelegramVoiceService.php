<?php

namespace App\Services;

use App\Models\User;
use App\Services\Ai\FlexibleAiAgentService;
use App\Services\Ai\CommandRegistry;
use App\Services\AiConversationService;
use App\Services\CommentService;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramVoiceService
{
    private VoiceToTextService $voiceToTextService;
    private TelegramService $telegramService;
    private string $botToken;

    public function __construct(
        VoiceToTextService $voiceToTextService,
        TelegramService $telegramService
    ) {
        $this->voiceToTextService = $voiceToTextService;
        $this->telegramService = $telegramService;
        $this->botToken = config('telegram.bot_token');
    }

    /**
     * Обработать голосовое сообщение в Telegram
     */
    public function processVoiceMessage(array $message, string $chatId): void
    {
        try {
            $voice = $message['voice'] ?? null;
            if (!$voice) {
                $this->telegramService->sendMessage($chatId, '❌ Не удалось получить голосовое сообщение.');
                return;
            }

            $fileId = $voice['file_id'] ?? null;
            $duration = $voice['duration'] ?? 0;
            $mimeType = $voice['mime_type'] ?? 'audio/ogg';

            // Проверяем длительность (максимум 5 минут)
            if ($duration > 300) {
                $this->telegramService->sendMessage($chatId, '❌ Голосовое сообщение слишком длинное. Максимум 5 минут.');
                return;
            }

            // Проверяем поддерживаемый формат
            if (!$this->voiceToTextService->isSupportedFormat($mimeType)) {
                $this->telegramService->sendMessage($chatId, '❌ Неподдерживаемый формат аудио. Поддерживаются: OGG, MP3, WAV, M4A, WebM.');
                return;
            }

            // Получаем информацию о файле
            $fileInfo = $this->getFileInfo($fileId);
            if (!$fileInfo) {
                $this->telegramService->sendMessage($chatId, '❌ Не удалось получить файл голосового сообщения.');
                return;
            }

            $fileUrl = $fileInfo['file_path'];
            $fullFileUrl = "https://api.telegram.org/file/bot{$this->botToken}/{$fileUrl}";

            // Отправляем уведомление о начале обработки
            $this->telegramService->sendMessage($chatId, '🎤 Обрабатываю голосовое сообщение...');

            // Конвертируем голос в текст
            $transcribedText = $this->voiceToTextService->convertVoiceToText($fullFileUrl, $fileId);

            if (empty($transcribedText)) {
                $this->telegramService->sendMessage($chatId, '❌ Не удалось распознать речь в голосовом сообщении.');
                return;
            }

            // Отправляем распознанный текст пользователю
            $this->telegramService->sendMessage($chatId, "📝 Распознанный текст:\n\n<i>{$transcribedText}</i>");

            // Получаем пользователя
            $fromId = $message['from']['id'] ?? null;
            $user = $fromId ? User::where('telegram_chat_id', (string)$fromId)->first() : null;

            if (!$user) {
                $this->telegramService->sendMessage($chatId, '❌ Аккаунт не привязан. Вставьте ваш <b>senderId</b> в профиль на сайте (поле Telegram chatId).');
                return;
            }

            // Отправляем запрос к AI ассистенту
            $this->telegramService->sendMessage($chatId, '🤖 Обрабатываю запрос через ИИ-ассистента...');

            $aiService = $this->createFlexibleAiAgentService();
            $result = $aiService->processRequest($transcribedText, $user, null);

            $reply = $result['message'] ?? 'Не удалось получить ответ от ИИ-ассистента.';
            $this->telegramService->sendMessage($chatId, $reply);

            Log::info('Voice message processed successfully', [
                'chat_id' => $chatId,
                'user_id' => $user->id,
                'file_id' => $fileId,
                'duration' => $duration,
                'transcribed_text' => $transcribedText,
                'ai_response_length' => strlen($reply)
            ]);

        } catch (Exception $e) {
            Log::error('Voice message processing failed', [
                'chat_id' => $chatId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $this->telegramService->sendMessage($chatId, '❌ Произошла ошибка при обработке голосового сообщения. Попробуйте позже.');
        }
    }

    /**
     * Получить информацию о файле от Telegram API
     */
    private function getFileInfo(string $fileId): ?array
    {
        try {
            $response = Http::get("https://api.telegram.org/bot{$this->botToken}/getFile", [
                'file_id' => $fileId
            ]);

            if (!$response->successful()) {
                Log::error('Failed to get file info from Telegram', [
                    'file_id' => $fileId,
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return null;
            }

            $data = $response->json();
            return $data['result'] ?? null;

        } catch (Exception $e) {
            Log::error('Exception while getting file info', [
                'file_id' => $fileId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Создать экземпляр FlexibleAiAgentService
     */
    private function createFlexibleAiAgentService(): FlexibleAiAgentService
    {
        $commandRegistry = new CommandRegistry(
            app(ProjectService::class),
            app(TaskService::class),
            app(SprintService::class),
            app(CommentService::class)
        );

        $contextProviders = [
            app(\App\Services\Ai\ContextProviders\UserContextProvider::class),
            app(\App\Services\Ai\ContextProviders\ProjectContextProvider::class),
            app(\App\Services\Ai\ContextProviders\SprintContextProvider::class),
            app(\App\Services\Ai\ContextProviders\EnumsContextProvider::class),
            app(\App\Services\Ai\ContextProviders\DynamicStatusContextProvider::class),
        ];

        return new FlexibleAiAgentService(
            $commandRegistry,
            $contextProviders,
            app(AiConversationService::class)
        );
    }

    /**
     * Проверить, является ли сообщение голосовым
     */
    public function isVoiceMessage(array $message): bool
    {
        return isset($message['voice']) && is_array($message['voice']);
    }

    /**
     * Получить информацию о голосовом сообщении
     */
    public function getVoiceInfo(array $message): ?array
    {
        if (!$this->isVoiceMessage($message)) {
            return null;
        }

        $voice = $message['voice'];
        return [
            'file_id' => $voice['file_id'] ?? null,
            'duration' => $voice['duration'] ?? 0,
            'mime_type' => $voice['mime_type'] ?? 'audio/ogg',
            'file_size' => $voice['file_size'] ?? null
        ];
    }
}
