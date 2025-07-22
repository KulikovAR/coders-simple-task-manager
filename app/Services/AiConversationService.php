<?php

namespace App\Services;

use App\Models\AiConversation;
use App\Models\AiConversationMessage;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class AiConversationService
{
    /**
     * Получить или создать активную сессию для пользователя
     */
    public function getOrCreateActiveSession(User $user): AiConversation
    {
        $session = AiConversation::where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        if (!$session) {
            $session = AiConversation::create([
                'user_id' => $user->id,
                'session_id' => Str::uuid(),
                'title' => 'Новый диалог',
                'is_active' => true,
            ]);
        }

        return $session;
    }

    /**
     * Получить историю диалогов пользователя с пагинацией
     */
    public function getUserConversations(User $user, int $perPage = 10): LengthAwarePaginator
    {
        return AiConversation::where('user_id', $user->id)
            ->with(['messages' => function($query) {
                $query->latest()->limit(1); // Последнее сообщение
            }])
            ->withCount('messages')
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Получить сообщения диалога с пагинацией
     */
    public function getConversationMessages(AiConversation $conversation, int $perPage = 20): LengthAwarePaginator
    {
        return $conversation->messages()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Добавить сообщение пользователя
     */
    public function addUserMessage(AiConversation $conversation, string $content): AiConversationMessage
    {
        $message = $conversation->messages()->create([
            'type' => 'user',
            'content' => $content,
            'success' => true,
            'commands_executed' => 0,
        ]);

        // Обновляем заголовок диалога, если это первое сообщение
        if ($conversation->messages()->count() === 1) {
            $conversation->update([
                'title' => Str::limit($content, 50)
            ]);
        }

        return $message;
    }

    /**
     * Добавить ответ ИИ
     */
    public function addAiMessage(
        AiConversation $conversation, 
        string $content, 
        bool $success = true, 
        int $commandsExecuted = 0, 
        array $results = [], 
        float $processingTime = null
    ): AiConversationMessage {
        return $conversation->messages()->create([
            'type' => 'ai',
            'content' => $content,
            'success' => $success,
            'commands_executed' => $commandsExecuted,
            'results' => $results,
            'processing_time' => $processingTime,
        ]);
    }

    /**
     * Создать новый диалог
     */
    public function createNewConversation(User $user): AiConversation
    {
        // Деактивируем текущую активную сессию
        AiConversation::where('user_id', $user->id)
            ->where('is_active', true)
            ->update(['is_active' => false]);

        // Создаем новую сессию
        return AiConversation::create([
            'user_id' => $user->id,
            'session_id' => Str::uuid(),
            'title' => 'Новый диалог',
            'is_active' => true,
        ]);
    }

    /**
     * Удалить диалог
     */
    public function deleteConversation(AiConversation $conversation): bool
    {
        return $conversation->delete();
    }

    /**
     * Получить статистику диалогов пользователя
     */
    public function getUserStats(User $user): array
    {
        $conversations = AiConversation::where('user_id', $user->id);
        
        return [
            'total_conversations' => $conversations->count(),
            'active_conversations' => $conversations->where('is_active', true)->count(),
            'total_messages' => AiConversationMessage::whereHas('conversation', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })->count(),
            'successful_commands' => AiConversationMessage::whereHas('conversation', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })->where('type', 'ai')->where('success', true)->sum('commands_executed'),
        ];
    }

    /**
     * Получить количество пользовательских сообщений к ИИ (для лимита бесплатных запросов)
     */
    public function getUserFreeAiRequestsCount(User $user): int
    {
        return AiConversationMessage::whereHas('conversation', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })->where('type', 'user')->count();
    }
} 