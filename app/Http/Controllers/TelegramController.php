<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\Ai\ContextProviders\DynamicStatusContextProvider;
use App\Services\TaskStatusService;
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
use App\Services\TelegramVoiceService;
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
                $linkedUser = $fromId ? User::where('telegram_chat_id', $fromId)->first() : null;
                
                // Базовые команды для всех пользователей
                $commands = [
                    ['command' => 'ai', 'description' => 'Общение с ИИ: /ai <запрос>'],
                    ['command' => 'id', 'description' => 'Показать chatId и senderId'],
                    ['command' => 'start', 'description' => 'Справка и статус подключения'],
                ];
                
                // Добавляем команду stats только для пользователя с id = 1
                if ($linkedUser && $linkedUser->id === 1) {
                    $commands[] = ['command' => 'stats', 'description' => 'Статистика проекта (только для админа)'];
                }
                
                $tg->setMyCommands($commands);
            }

            // Приветственное сообщение с инструкциями
            if (in_array($text, ['/start', 'start', 'Start'], true)) {
                // Проверяем привязку по senderId (в группах chatId = id группы)
                $linkedUser = $fromId ? User::where('telegram_chat_id', $fromId)->first() : null;

                if ($linkedUser) {
                    $help = '<b>✅ Telegram уже подключен к вашему аккаунту.</b>' . "\n\n" .
                        '<b>Команды:</b>' . "\n" .
                        '<code>/ai ваш запрос</code> — общение с ИИ' . "\n" .
                        '<code>/id</code> — показать chatId и senderId' . "\n" .
                        '<code>/start</code> — справка и статус подключения' . "\n\n" .
                        '<b>Голосовые сообщения:</b>' . "\n" .
                        '🎤 Отправьте голосовое сообщение для общения с ИИ';
                    
                    // Добавляем команду stats только для пользователя с id = 1
                    if ($linkedUser->id === 1) {
                        $help .= "\n" . '<code>/stats</code> — статистика проекта (только для админа)';
                    }
                    
                    if ($chatType !== 'private') {
                        $help .= "\n\n" . '<i>Вы пишете в группе. Для личных уведомлений начните диалог с ботом в личке</i>';
                        if ($botLink) {
                            $help .= ' — <a href="' . $botLink . '">открыть бота</a>';
                        }
                    }
                    $tg->sendMessage($chatId, $help);
                } else {
                    $help = '<b>Я бот‑помощник</b>: присылаю уведомления и общаюсь с ИИ.' . "\n\n" .
                        '<b>Ваш chatId:</b> <code>' . $chatId . '</code>' . "\n" .
                        ($fromId ? ('<b>Ваш senderId:</b> <code>' . $fromId . '</code>' . "\n") : '') .
                        "\n" . '<b>Как привязать:</b>' . "\n" .
                        '— Вставьте <u>senderId</u> в поле Telegram в профиле на сайте' . "\n" .
                        '— Или начните диалог с ботом и отправьте свой email для автопривязки';
                    if ($botLink) {
                        $help .= "\n" . 'Личный чат с ботом: <a href="' . $botLink . '">' . $botLink . '</a>';
                    }
                    $help .= "\n\n" . '<b>Команды:</b>' . "\n" .
                        '<code>/ai ваш запрос</code> — общение с ИИ' . "\n" .
                        '<code>/id</code> — показать chatId и senderId' . "\n" .
                        '<code>/stats</code> — статистика проекта (только для админа)' . "\n" .
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

            // Обработка команды /stats (только для пользователя с id = 1)
            if (in_array($text, ['/stats', 'stats', 'STATS'], true)) {
                $user = $fromId ? User::where('telegram_chat_id', $fromId)->first() : null;
                
                if (!$user || $user->id !== 1) {
                    $tg->sendMessage($chatId, '❌ У вас нет прав для просмотра статистики.');
                    return response()->noContent();
                }

                try {
                    $statsText = $this->getProjectStats();
                    $tg->sendMessage($chatId, $statsText);
                } catch (\Throwable $e) {
                    Log::error('Telegram stats error', ['error' => $e->getMessage()]);
                    $tg->sendMessage($chatId, 'Произошла ошибка при получении статистики.');
                }

                return response()->noContent();
            }

            // Обработка голосовых сообщений
            if (isset($message['voice'])) {
                /** @var TelegramVoiceService $voiceService */
                $voiceService = app(TelegramVoiceService::class);
                $voiceService->processVoiceMessage($message, $chatId);
                return response()->noContent();
            }

            // /ai <запрос>
            if (str_starts_with(mb_strtolower($text), '/ai')) {
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

            if (filter_var($text, FILTER_VALIDATE_EMAIL)) {
                $user = User::where('email', $text)->first();
                if ($user) {
                    $user->telegram_chat_id = (string) ($fromId ?: $chatId);
                    $user->save();
                    $tg->sendMessage($chatId, 'Telegram успешно подключен к вашему аккаунту.');
                } else {
                    $tg->sendMessage($chatId, 'Пользователь с таким email не найден. Введите /id, чтобы получить senderId и вставьте его в профиль.');
                }
            } else {
                // Эхо-подсказка с HTML-оформлением
                $hint = '<b>Я бот‑помощник</b>: присылаю уведомления и общаюсь с ИИ.' . "\n\n" .
                    '<b>Команды:</b>' . "\n" .
                    '<code>/ai ваш запрос</code> — общение с ИИ' . "\n" .
                    '<code>/id</code> — показать chatId и senderId' . "\n" .
                    '<code>/start</code> — справка и статус подключения' . "\n\n" .
                    '<b>Голосовые сообщения:</b>' . "\n" .
                    '🎤 Отправьте голосовое сообщение для общения с ИИ' . "\n\n" .
                    'Для привязки отправьте свой <b>email</b> или вставьте <u>senderId</u> в профиль на сайте.';
                if ($botLink) {
                    $hint .= "\n" . 'Личный чат с ботом: <a href="' . $botLink . '">' . $botLink . '</a>';
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
            new DynamicStatusContextProvider(app(TaskStatusService::class)),
        ];

        return new FlexibleAiAgentService($commandRegistry, $contextProviders, app(AiConversationService::class));
    }

    private function getProjectStats(): string
    {
        // Получаем статистику пользователей
        $totalUsers = User::count();
        $activeUsers = User::whereNotNull('email_verified_at')->count();
        $usersWithTelegram = User::whereNotNull('telegram_chat_id')->count();
        $usersWithSubscription = User::whereNotNull('subscription_id')->count();

        // Получаем статистику проектов
        $totalProjects = \App\Models\Project::count();
        $totalTasks = \App\Models\Task::count();

        return '<b>📊 Статистика проекта</b>' . "\n\n" .
            '<b>👥 Пользователи:</b>' . "\n" .
            '• Всего пользователей: <b>' . $totalUsers . '</b>' . "\n" .
            '• Активных (верифицированных): <b>' . $activeUsers . '</b>' . "\n" .
            '• С Telegram: <b>' . $usersWithTelegram . '</b>' . "\n" .
            '• С подпиской: <b>' . $usersWithSubscription . '</b>' . "\n\n" .
            '<b>📋 Проекты и задачи:</b>' . "\n" .
            '• Всего проектов: <b>' . $totalProjects . '</b>' . "\n" .
            '• Всего задач: <b>' . $totalTasks . '</b>';
    }
}


