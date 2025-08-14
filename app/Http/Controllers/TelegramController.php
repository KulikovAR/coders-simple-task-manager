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
            $chatType = $chat['type'] ?? 'private';
            $from = $message['from'] ?? [];
            $fromId = isset($from['id']) ? (string) $from['id'] : null;
            $botUsername = config('telegram.bot_username');
            $botLink = $botUsername ? ('https://t.me/' . ltrim($botUsername, '@')) : null;
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
                    ['command' => 'id', 'description' => 'Показать chatId и senderId'],
                    ['command' => 'start', 'description' => 'Справка и статус подключения'],
                ]);
            }

            // Приветственное сообщение с инструкциями
            if (in_array($text, ['/start', 'start', 'Start'], true)) {
                // Проверяем привязку по senderId (в группах chatId = id группы)
                $linkedUser = $fromId ? User::where('telegram_chat_id', $fromId)->first() : null;

                if ($linkedUser) {
                    $help = '<b>✅ Telegram уже подключен к вашему аккаунту.</b><br/><br/>' .
                        '<b>Команды:</b><br/>' .
                        '<code>/ai ваш запрос</code> — общение с ИИ<br/>' .
                        '<code>/id</code> — показать chatId и senderId<br/>' .
                        '<code>/start</code> — справка и статус подключения';
                    if ($chatType !== 'private') {
                        $help .= '<br/><br/><i>Вы пишете в группе. Для личных уведомлений начните диалог с ботом в личке</i>';
                        if ($botLink) {
                            $help .= ' — <a href="' . $botLink . '">открыть бота</a>';
                        }
                    }
                    $tg->sendMessage($chatId, $help);
                } else {
                    $help = '<b>Я бот‑помощник</b>: присылаю уведомления и общаюсь с ИИ.<br/><br/>' .
                        '<b>Ваш chatId:</b> <code>' . $chatId . '</code><br/>' .
                        ($fromId ? ('<b>Ваш senderId:</b> <code>' . $fromId . '</code><br/>') : '') .
                        '<br/><b>Как привязать:</b><br/>' .
                        '— Вставьте <u>senderId</u> в поле Telegram в профиле на сайте<br/>' .
                        '— Или начните диалог с ботом и отправьте свой email для автопривязки';
                    if ($botLink) {
                        $help .= '<br/>Личный чат с ботом: <a href="' . $botLink . '">' . $botLink . '</a>';
                    }
                    $help .= '<br/><br/><b>Команды:</b><br/>' .
                        '<code>/ai ваш запрос</code> — общение с ИИ<br/>' .
                        '<code>/id</code> — показать chatId и senderId<br/>' .
                        '<code>/start</code> — справка и статус подключения';
                    $tg->sendMessage($chatId, $help);
                }
                return response()->noContent();
            }

            // Обработка команды /id
            if (in_array($text, ['/id', 'id', 'ID'], true)) {
                $idText = '<b>Ваш chatId:</b> <code>' . $chatId . '</code>';
                if ($fromId) {
                    $idText .= "\n<b>Ваш senderId:</b> <code>" . $fromId . '</code>\n<i>Для привязки используйте senderId</i>';
                }
                $tg->sendMessage($chatId, $idText);
                return response()->noContent();
            }

            // Команда для общения с ИИ: /ai <запрос>
            if (str_starts_with(mb_strtolower($text), '/ai')) {
                // Ищем пользователя по senderId, чтобы корректно работать в группах
                $user = $fromId ? User::where('telegram_chat_id', $fromId)->first() : null;
                if (!$user) {
                    $msg = 'Аккаунт не привязан. Вставьте ваш <b>senderId</b> в профиль на сайте (поле Telegram chatId).';
                    if ($botLink) {
                        $msg .= "\nЛичный чат с ботом: <a href=\"" . $botLink . '\">перейти</a>';
                    }
                    $tg->sendMessage($chatId, $msg);
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
                    // Привязываем по senderId, чтобы связь была персональной, а не с группой
                    $user->telegram_chat_id = (string) ($fromId ?: $chatId);
                    $user->save();
                    $tg->sendMessage($chatId, 'Telegram успешно подключен к вашему аккаунту.');
                } else {
                    $tg->sendMessage($chatId, 'Пользователь с таким email не найден. Введите /id, чтобы получить senderId и вставьте его в профиль.');
                }
            } else {
                // Эхо-подсказка с HTML-оформлением
                $hint = '<b>Я бот‑помощник</b>: присылаю уведомления и общаюсь с ИИ.<br/><br/>' .
                    '<b>Команды:</b><br/>' .
                    '<code>/ai ваш запрос</code> — общение с ИИ<br/>' .
                    '<code>/id</code> — показать chatId и senderId<br/>' .
                    '<code>/start</code> — справка и статус подключения<br/><br/>' .
                    'Для привязки отправьте свой <b>email</b> или вставьте <u>senderId</u> в профиль на сайте.';
                if ($botLink) {
                    $hint .= '<br/>Личный чат с ботом: <a href="' . $botLink . '">' . $botLink . '</a>';
                }
                $tg->sendMessage($chatId, $hint);
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
            new \App\Services\Ai\ContextProviders\DynamicStatusContextProvider(app(\App\Services\TaskStatusService::class)),
        ];

        return new FlexibleAiAgentService($commandRegistry, $contextProviders, app(AiConversationService::class));
    }
}


