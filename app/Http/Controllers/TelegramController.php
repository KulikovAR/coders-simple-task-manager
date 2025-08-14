<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\TelegramService;
use App\Services\Ai\FlexibleAiAgentService;
use App\Services\Ai\CommandRegistry;
use App\Services\Ai\ContextProviders\UserContextProvider;
use App\Services\Ai\ContextProviders\ProjectContextProvider;
use App\Services\Ai\ContextProviders\UsersContextProvider;
use App\Services\Ai\ContextProviders\EnumsContextProvider;
use App\Services\ProjectService;
use App\Services\TaskService;
use App\Services\SprintService;
use App\Services\CommentService;
use App\Services\AiConversationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class TelegramController extends Controller
{
    public function webhook(Request $request): Response
    {
        $secret = (string) config('telegram.webhook_secret');
        if ($secret !== '') {
            $incoming = (string) $request->header('X-Telegram-Bot-Api-Secret-Token', '');
            if (!hash_equals($secret, $incoming)) {
                return response()->noContent(403);
            }
        }

        $update = $request->all();

        try {
            $message = $update['message'] ?? $update['edited_message'] ?? null;
            if (!$message) {
                return response()->noContent();
            }

            $chat = $message['chat'] ?? [];
            $chatId = $chat['id'] ?? null;
            $text = trim((string) ($message['text'] ?? ''));

            /** @var TelegramService $tg */
            $tg = app(TelegramService::class);

            if (!$chatId) {
                return response()->noContent();
            }

            // Обновим список команд при каждом /start (безопасно и дёшево)
            if (in_array($text, ['/start', 'start', 'Start'], true)) {
                $tg->setMyCommands([
                    ['command' => 'ai', 'description' => 'Общение с ИИ: /ai <запрос>'],
                    ['command' => 'id', 'description' => 'Показать ваш chatId'],
                    ['command' => 'start', 'description' => 'Справка и статус подключения'],
                ]);
            }

            // Приветственное сообщение с chatId
            if (in_array($text, ['/start', 'start', 'Start'], true)) {
                $linkedUser = User::where('telegram_chat_id', (string) $chatId)->first();
                if ($linkedUser) {
                    $tg->sendMessage(
                        $chatId,
                        "✅ Telegram уже подключен к вашему аккаунту.\n\nДоступные команды:\n- /ai ваш запрос — общение с ИИ\n- /id — показать ваш chatId"
                    );
                } else {
                    $tg->sendMessage(
                        $chatId,
                        "Ваш chatId: <b>{$chatId}</b>\n\nПерейдите в профиль на сайте и вставьте этот chatId в поле Telegram.\n\nДоступные команды:\n- /ai ваш запрос — общение с ИИ\n- /id — показать ваш chatId"
                    );
                }
                return response()->noContent();
            }

            // Обработка команды /id
            if (in_array($text, ['/id', 'id', 'ID'], true)) {
                $tg->sendMessage($chatId, "Ваш chatId: <b>{$chatId}</b>");
                return response()->noContent();
            }

            // Команда для общения с ИИ: /ai <запрос>
            if (str_starts_with(mb_strtolower($text), '/ai')) {
                // Пытаемся найти пользователя по chatId
                $user = User::where('telegram_chat_id', (string) $chatId)->first();
                if (!$user) {
                    $tg->sendMessage($chatId, 'Аккаунт не привязан. Отправьте /start, скопируйте chatId и вставьте его в профиль на сайте.');
                    return response()->noContent();
                }

                $prompt = trim(mb_substr($text, 3));
                if ($prompt === '') {
                    $tg->sendMessage($chatId, 'Использование: /ai ваш запрос. Например: /ai создай задачу "Сверстать хедер" в проекте Site.');
                    return response()->noContent();
                }

                try {
                    // Смайлик ожидания
                    $tg->sendMessage($chatId, '⏳');

                    $ai = $this->createFlexibleAiAgentService();
                    $result = $ai->processRequest($prompt, $user, null);

                    $reply = $result['message'] ?? 'Не удалось получить ответ.';
                    $tg->sendMessage($chatId, $reply);
                } catch (\Throwable $e) {
                    Log::error('Telegram AI error', ['error' => $e->getMessage()]);
                    $tg->sendMessage($chatId, 'Произошла ошибка при обращении к ИИ. Попробуйте позже.');
                }

                return response()->noContent();
            }

            // Если пользователь прислал email — попробуем связать автоматически
            if (filter_var($text, FILTER_VALIDATE_EMAIL)) {
                $user = User::where('email', $text)->first();
                if ($user) {
                    $user->telegram_chat_id = (string) $chatId;
                    $user->save();
                    $tg->sendMessage($chatId, 'Telegram успешно подключен к вашему аккаунту.');
                } else {
                    $tg->sendMessage($chatId, 'Пользователь с таким email не найден. Введите /id, чтобы получить chatId и вставьте его в профиль.');
                }
            } else {
                // Эхо-подсказка
                $tg->sendMessage($chatId, 'Я бот-помощник: присылаю уведомления и общаюсь с ИИ.\n\nКоманды:\n- /ai ваш запрос — общение с ИИ\n- /id — показать ваш chatId\n- /start — справка и статус подключения\n\nДля привязки отправьте свой email или вставьте chatId в профиль на сайте.');
            }

            return response()->noContent();
        } catch (\Throwable $e) {
            Log::error('Telegram webhook error', ['error' => $e->getMessage()]);
            return response()->noContent();
        }
    }

    private function createFlexibleAiAgentService(): FlexibleAiAgentService
    {
        $commandRegistry = new CommandRegistry(
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
        ];

        return new FlexibleAiAgentService($commandRegistry, $contextProviders, app(AiConversationService::class));
    }
}


