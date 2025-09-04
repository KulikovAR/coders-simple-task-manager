<?php

namespace App\Services\Ai;

use App\Services\Ai\Contracts\ContextProviderInterface;
use App\Services\Ai\Contracts\CommandInterface;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use App\Services\AiConversationService;

class FlexibleAiAgentService
{
    private CommandRegistry $commandRegistry;
    private array $contextProviders;
    private ?AiConversationService $conversationService;
    private string $aiServiceUrl;
    private string $aiServiceToken;
    private string $aiModel;

    public function __construct(
        CommandRegistry $commandRegistry,
        array $contextProviders = [],
        AiConversationService $conversationService = null
    ) {
        $this->commandRegistry = $commandRegistry;
        $this->contextProviders = $contextProviders;
        $this->conversationService = $conversationService;
        $this->aiServiceUrl = config('services.ai.url', 'https://oneai-proxy.ru/api/v1/ai');
        $this->aiServiceToken = config('services.ai.token');
        $this->aiModel = config('services.ai.model', 'gpt-3.5-turbo');
    }

    /**
     * Обработать запрос пользователя с новой схемой
     */
    public function processRequest(string $userInput, User $user, ?string $sessionId = null): array
    {
        $startTime = microtime(true);

        // Валидация входных данных
        $userInput = trim($userInput);
        if (empty($userInput)) {
            return [
                'success' => false,
                'message' => 'Запрос не может быть пустым',
                'session_id' => $sessionId,
            ];
        }

        $maxLength = config('ai-agent.security.max_input_length', 1000);
        if (strlen($userInput) > $maxLength) {
            return [
                'success' => false,
                'message' => "Запрос слишком длинный (максимум {$maxLength} символов)",
                'session_id' => $sessionId,
            ];
        }

        // Rate limiting
        $key = 'ai_agent_' . $user->id;
        $rateLimit = config('ai-agent.rate_limiting.requests_per_minute', 10);
        if (RateLimiter::tooManyAttempts($key, $rateLimit)) {
            $seconds = RateLimiter::availableIn($key);
            return [
                'success' => false,
                'message' => "Слишком много запросов. Попробуйте через {$seconds} секунд.",
                'session_id' => $sessionId,
            ];
        }
        RateLimiter::hit($key, 60);

        // Автоматически сбрасываем paid, если подписка истекла
        if ($user->paid && $user->expires_at && now()->greaterThan($user->expires_at)) {
            $user->update(['paid' => false]);
        }

        // Проверка лимита запросов к ИИ
        // Эта проверка больше не нужна, так как лимиты проверяются в AiAgentController
        // через SubscriptionService::canUseAi()

        try {
            // Проверяем, является ли это подтверждением
            $isConfirmation = $this->isConfirmation($userInput);

            // Шаг 1: Получаем команды от ИИ
            $commandsResponse = $this->getCommandsFromAi($userInput, $user, $sessionId, $isConfirmation);
            $sessionId = $commandsResponse['session_id'] ?? $sessionId;

            // Шаг 2: Выполняем команды (автоматически для подтверждений)
            $commandResults = [];
            if (!empty($commandsResponse['commands'])) {
                $commandResults = $this->executeCommands($commandsResponse['commands'], $user);
            }

            // Шаг 3: Генерируем финальный ответ на основе результатов
            $finalResponse = $this->generateNaturalResponse($userInput, $commandResults, $user, $sessionId, $isConfirmation);

            $processingTime = microtime(true) - $startTime;

            // Сохраняем в историю
            if ($this->conversationService) {
                $conversation = $this->conversationService->getOrCreateActiveSession($user);
                $this->conversationService->addUserMessage($conversation, $userInput);
                $this->conversationService->addAiMessage(
                    $conversation,
                    $finalResponse['message'],
                    true,
                    count($commandsResponse['commands'] ?? []),
                    $commandResults,
                    $processingTime
                );
            }

            Log::info('Flexible AI Agent Success', [
                'user_id' => $user->id,
                'user_input' => $userInput,
                'commands_executed' => count($commandsResponse['commands'] ?? []),
                'session_id' => $sessionId,
                'processing_time' => $processingTime,
            ]);

            return [
                'success' => true,
                'message' => $finalResponse['message'],
                'session_id' => $sessionId,
                'commands_executed' => count($commandsResponse['commands'] ?? []),
                'processing_time' => $processingTime,
                'command_results' => $commandResults,
            ];
        } catch (\Exception $e) {
            $processingTime = isset($startTime) ? microtime(true) - $startTime : 0;

            // Сохраняем ошибку в историю
            if ($this->conversationService) {
                try {
                    $conversation = $this->conversationService->getOrCreateActiveSession($user);
                    $this->conversationService->addUserMessage($conversation, $userInput);
                    $this->conversationService->addAiMessage(
                        $conversation,
                        'Произошла ошибка при обработке запроса: ' . $e->getMessage(),
                        false,
                        0,
                        [],
                        $processingTime
                    );
                } catch (\Exception $historyError) {
                    Log::error('Failed to save conversation history', [
                        'error' => $historyError->getMessage(),
                        'original_error' => $e->getMessage(),
                    ]);
                }
            }

            Log::error('Flexible AI Agent Error', [
                'error' => $e->getMessage(),
                'user_input' => $userInput,
                'user_id' => $user->id,
                'session_id' => $sessionId,
                'trace' => $e->getTraceAsString(),
                'processing_time' => $processingTime,
            ]);

            return [
                'success' => false,
                'message' => 'Произошла ошибка при обработке запроса: ' . $e->getMessage(),
                'session_id' => $sessionId,
                'processing_time' => $processingTime,
            ];
        }
    }

    /**
     * Проверить, является ли запрос подтверждением
     */
    private function isConfirmation(string $userInput): bool
    {
        $input = mb_strtolower(trim($userInput));
        $confirmations = ['да', 'давай', 'сделай', 'выполни', 'ок', 'окей', 'хорошо', 'согласен', 'подтверждаю', 'да, сделай', 'да, выполни'];

        foreach ($confirmations as $confirmation) {
            if (strpos($input, $confirmation) === 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Шаг 1: Получить команды от ИИ
     */
    private function getCommandsFromAi(string $userInput, User $user, ?string $sessionId, bool $isConfirmation = false): array
    {
        $context = $this->buildContext($user);
        $commands = $this->commandRegistry->getCommandsForAi();

        $prompt = $this->buildCommandsPrompt($userInput, $context, $commands, $isConfirmation);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->aiServiceToken,
            'Content-Type' => 'application/json',
        ])->post($this->aiServiceUrl, [
            'model' => $this->aiModel,
            'input' => $prompt,
            'session_id' => $sessionId ?? 'flexible-ai-session-' . $user->id,
            'new_session' => $sessionId === null,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Ошибка при обращении к ИИ сервису: ' . $response->body());
        }

        $aiResponse = $response->json();

        Log::info('AI Commands Response', [
            'response' => $aiResponse,
            'user_input' => $userInput,
            'session_id' => $sessionId,
        ]);

        $parsedCommands = $this->parseCommandsResponse($aiResponse);

        // Если команды не найдены, используем fallback
        if (empty($parsedCommands['commands'])) {
            $fallbackCommands = $this->getFallbackCommands($userInput, $context);
            if (!empty($fallbackCommands)) {
                Log::info('Using fallback commands', [
                    'user_input' => $userInput,
                    'fallback_commands' => $fallbackCommands
                ]);
                return [
                    'commands' => $fallbackCommands,
                    'session_id' => $aiResponse['session_id'] ?? $sessionId,
                ];
            }
        }

        return [
            'commands' => $parsedCommands['commands'] ?? [],
            'session_id' => $aiResponse['session_id'] ?? $sessionId,
        ];
    }

    /**
     * Шаг 3: Генерировать естественный ответ на основе результатов команд
     */
    private function generateNaturalResponse(string $userInput, array $commandResults, User $user, ?string $sessionId, bool $isConfirmation = false): array
    {
        $context = $this->buildContext($user);

        $prompt = $this->buildResponsePrompt($userInput, $commandResults, $context);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->aiServiceToken,
            'Content-Type' => 'application/json',
        ])->post($this->aiServiceUrl, [
            'model' => $this->aiModel,
            'input' => $prompt,
            'session_id' => $sessionId ?? 'flexible-ai-session-' . $user->id,
            'new_session' => false,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Ошибка при генерации ответа: ' . $response->body());
        }

        $aiResponse = $response->json();

        Log::info('AI Response Generation', [
            'response' => $aiResponse,
            'user_input' => $userInput,
            'command_results' => $commandResults,
        ]);

        $content = $this->extractContent($aiResponse);

        return [
            'message' => $content,
            'session_id' => $aiResponse['session_id'] ?? $sessionId,
        ];
    }

    /**
     * Построить промпт для получения команд
     */
    private function buildCommandsPrompt(string $userInput, array $context, array $commands, bool $isConfirmation = false): string
    {
        $prompt = "Ты - ИИ-ассистент для системы управления задачами. Анализируй запрос пользователя и определяй, какие команды нужно выполнить.\n\n";
        $prompt .= "Запрос пользователя: {$userInput}\n\n";

        $prompt .= "Контекст пользователя:\n";
        $prompt .= json_encode($context, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n\n";

        // Добавляем информацию о доступных статусах задач
        if (isset($context['dynamic_statuses']) && !empty($context['dynamic_statuses']['available_status_names'])) {
            $prompt .= "ДОСТУПНЫЕ СТАТУСЫ ЗАДАЧ:\n";
            foreach ($context['dynamic_statuses']['status_mapping'] as $statusName => $description) {
                $prompt .= "- {$statusName}: {$description}\n";
            }
            $prompt .= "\n";
        }

        // Добавляем информацию о типах комментариев
        if (isset($context['enums']['comment_types'])) {
            $prompt .= "ТИПЫ КОММЕНТАРИЕВ:\n";
            foreach ($context['enums']['comment_types'] as $type) {
                $prompt .= "- {$type['name']} ({$type['key']}): {$type['label']} {$type['icon']}\n";
            }
            $prompt .= "\n";
        }

        $prompt .= "Доступные команды:\n";
        foreach ($commands as $command) {
            $prompt .= "- {$command['name']}: {$command['description']}\n";
            foreach ($command['parameters'] as $param => $config) {
                $required = $config['required'] ? 'обязательный' : 'опциональный';
                $prompt .= "  - {$param} ({$config['type']}, {$required}): {$config['description']}\n";
            }
        }

        $prompt .= "\nПРАВИЛА:\n";
        $prompt .= "1. Анализируй запрос и определяй нужные команды\n";
        $prompt .= "2. Для вопросов о статусе используй LIST_TASKS с соответствующими параметрами\n";
        $prompt .= "3. Для создания используй CREATE команды\n";
        $prompt .= "4. Используй project_name вместо project_id\n";
        $prompt .= "5. Для назначения на себя используй assign_to_me: true\n";
        $prompt .= "6. ВАЖНО: Если пользователь просит что-то сделать - выполняй команды сразу, не спрашивай подтверждения\n";
        $prompt .= "7. Если пользователь говорит 'переведи задачи в статус выполнено' - используй BULK_UPDATE_TASK_STATUS\n";
        $prompt .= "8. Если пользователь подтверждает действие (да, сделай, ок) - выполняй предыдущие команды\n";
        $prompt .= "9. Для массового обновления статуса используй BULK_UPDATE_TASK_STATUS с параметрами project_name и current_status\n";
        $prompt .= "10. ВАЖНО: Используй только точные названия статусов из доступных статусов задач\n";
        $prompt .= "11. Для работы со спринтами используй CREATE_SPRINT, LIST_SPRINTS, UPDATE_SPRINT\n";
        $prompt .= "12. При создании спринта автоматически создаются все нужные статусы\n";
        if (isset($context['dynamic_statuses']) && !empty($context['dynamic_statuses']['available_status_names'])) {
            $statusNames = implode("', '", $context['dynamic_statuses']['available_status_names']);
            $prompt .= "13. Доступные статусы задач: '{$statusNames}'\n";
        } else {
            $prompt .= "13. ВНИМАНИЕ: Статусы задач не загружены. Используй общие названия.\n";
        }
        $prompt .= "14. Возвращай ТОЛЬКО JSON\n\n";

        $prompt .= "Формат ответа:\n";
        $prompt .= '{"commands": [{"name": "COMMAND_NAME", "parameters": {"param1": "value1"}}]}';

        return $prompt;
    }

    /**
     * Построить промпт для генерации естественного ответа
     */
    private function buildResponsePrompt(string $userInput, array $commandResults, array $context): string
    {
        $prompt = "Ты - ИИ-ассистент для системы управления задачами. Сгенерируй естественный ответ пользователю на основе результатов выполненных команд.\n\n";
        $prompt .= "Исходный запрос пользователя: {$userInput}\n\n";

        $prompt .= "Результаты выполненных команд:\n";
        $prompt .= json_encode($commandResults, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n\n";

        $prompt .= "Контекст пользователя:\n";
        $prompt .= json_encode($context, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n\n";

        $prompt .= "ПРАВИЛА ДЛЯ ОТВЕТА:\n";
        $prompt .= "1. Отвечай естественно и дружелюбно\n";
        $prompt .= "2. Объясняй результаты простым языком\n";
        $prompt .= "3. Если есть ссылки - включай их в ответ\n";
        $prompt .= "4. Если есть ошибки - объясни их понятно\n";
        $prompt .= "5. Используй эмодзи для лучшего восприятия\n";
        $prompt .= "6. Если запрос был о статусе - дай краткую сводку\n";
        $prompt .= "7. Если создавались задачи - подтверди создание\n";
        $prompt .= "8. Не используй технические термины без необходимости\n\n";
        $prompt .= "9. Имя вячик обозначает влада\n\n";

        $prompt .= "Сгенерируй естественный ответ пользователю:";

        return $prompt;
    }

    /**
     * Парсить ответ с командами
     */
    private function parseCommandsResponse(array $aiResponse): array
    {
        $content = $this->extractContent($aiResponse);

        // Ищем JSON в ответе
        if (preg_match('/\{.*\}/s', $content, $matches)) {
            $json = json_decode($matches[0], true);
            if ($json && isset($json['commands'])) {
                return $json;
            }
        }

        // Если не нашли JSON, попробуем распарсить весь контент
        $json = json_decode($content, true);
        if ($json && isset($json['commands'])) {
            return $json;
        }

        throw new \Exception('Не удалось распарсить команды из ответа ИИ');
    }

    /**
     * Извлечь контент из ответа ИИ
     */
    private function extractContent(array $aiResponse): string
    {
        // Проверяем формат OpenAI API
        if (isset($aiResponse['choices']) && is_array($aiResponse['choices'])) {
            return $aiResponse['choices'][0]['message']['content'] ?? '';
        }

        // Fallback для других форматов
        return $aiResponse['output'] ?? $aiResponse['response'] ?? '';
    }

    /**
     * Собрать контекст для ИИ
     */
    private function buildContext(User $user): array
    {
        $context = [];

        foreach ($this->contextProviders as $provider) {
            if ($provider instanceof ContextProviderInterface) {
                try {
                    $providerContext = $provider->getContext($user);
                    $context[$provider->getName()] = $providerContext;
                } catch (\Exception $e) {
                    // Логируем ошибку, но продолжаем работу
                    Log::warning("Context provider {$provider->getName()} failed", [
                        'error' => $e->getMessage(),
                        'user_id' => $user->id
                    ]);
                }
            }
        }

        return $context;
    }

    /**
     * Выполнить команды
     */
    private function executeCommands(array $commands, User $user): array
    {
        $results = [];

        foreach ($commands as $commandData) {
            $commandName = $commandData['name'] ?? '';
            $parameters = $commandData['parameters'] ?? [];

            $command = $this->commandRegistry->getCommand($commandName);
            if (!$command) {
                $results[] = [
                    'success' => false,
                    'message' => "Команда '{$commandName}' не найдена",
                ];
                continue;
            }

            if (!$command->canExecute($user, $parameters)) {
                $results[] = [
                    'success' => false,
                    'message' => "Нет прав для выполнения команды '{$commandName}'",
                ];
                continue;
            }

            try {
                $result = $command->execute($parameters, $user);
                $results[] = $result;
            } catch (\Exception $e) {
                $results[] = [
                    'success' => false,
                    'message' => "Ошибка выполнения команды '{$commandName}': " . $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Получить команды по ключевым словам (fallback)
     */
    private function getFallbackCommands(string $userInput, array $context = []): array
    {
        $input = mb_strtolower($userInput);

        // Получаем доступные статусы из контекста
        $availableStatuses = [];
        if (isset($context['dynamic_statuses']['available_status_names'])) {
            $availableStatuses = $context['dynamic_statuses']['available_status_names'];
        }

        // Статус проекта/задач
        if (preg_match('/(статус|состояние|как дела|что происходит)/', $input)) {
            return [
                [
                    'name' => 'LIST_TASKS',
                    'parameters' => []
                ]
            ];
        }

        // Мои задачи
        if (preg_match('/(мои|на меня|мои задачи|задачи на меня|что у меня|что стоит)/', $input)) {
            return [
                [
                    'name' => 'LIST_TASKS',
                    'parameters' => [
                        'my_tasks' => true
                    ]
                ]
            ];
        }

        // Попытка найти соответствующий статус в доступных
        $statusMapping = [
            '/(к выполнению|готовые к выполнению|новые задачи|не начатые)/' => ['К выполнению', 'To Do'],
            '/(в работе|выполняются|активные задачи|текущие)/' => ['В работе', 'In Progress'],
            '/(готово|завершено|выполнено|готовые|завершенные)/' => ['Завершена', 'Done'],
            '/(на проверке|проверка|ревью|review)/' => ['На проверке', 'Review'],
            '/(тестировани|тестирую|testing)/' => ['Тестирование', 'Testing'],
            '/(готов к релизу|релиз|готов|ready)/' => ['Готова к релизу', 'Ready for Release'],
        ];

        foreach ($statusMapping as $pattern => $possibleStatuses) {
            if (preg_match($pattern, $input)) {
                // Ищем первый подходящий статус из доступных
                $foundStatus = null;
                foreach ($possibleStatuses as $statusName) {
                    if (in_array($statusName, $availableStatuses)) {
                        $foundStatus = $statusName;
                        break;
                    }
                }

                if ($foundStatus) {
                    return [
                        [
                            'name' => 'LIST_TASKS',
                            'parameters' => [
                                'status' => $foundStatus
                            ]
                        ]
                    ];
                }
            }
        }

        // Общие запросы о задачах
        if (preg_match('/(задачи|список задач|все задачи)/', $input)) {
            return [
                [
                    'name' => 'LIST_TASKS',
                    'parameters' => []
                ]
            ];
        }

        // Массовое обновление статуса задач
        if (preg_match('/(переведи|перевести|обнови|обновить).*?(задач|задачи).*?(статус|статус).*?(выполнено|готово|done)/', $input)) {
            // Ищем подходящий "завершенный" статус
            $completedStatus = 'Done'; // fallback
            foreach (['Завершена', 'Done', 'Готова к релизу'] as $status) {
                if (in_array($status, $availableStatuses)) {
                    $completedStatus = $status;
                    break;
                }
            }

            $parameters = ['new_status' => $completedStatus];

            // Ищем название проекта
            if (preg_match('/в проекте "([^"]+)"/', $input, $matches)) {
                $parameters['project_name'] = $matches[1];
            } elseif (preg_match('/в проекте ([^,\s]+)/', $input, $matches)) {
                $parameters['project_name'] = $matches[1];
            }

            // Ищем текущий статус
            if (preg_match('/(?:которые|что).*?(?:в|на).*?(тестировании|тестирование)/', $input)) {
                $testingStatus = 'Testing'; // fallback
                foreach (['Тестирование', 'Testing'] as $status) {
                    if (in_array($status, $availableStatuses)) {
                        $testingStatus = $status;
                        break;
                    }
                }
                $parameters['current_status'] = $testingStatus;
            }

            return [['name' => 'BULK_UPDATE_TASK_STATUS', 'parameters' => $parameters]];
        }

        // Проекты
        if (preg_match('/(проекты|список проектов|все проекты|мои проекты)/', $input)) {
            return [
                [
                    'name' => 'LIST_PROJECTS',
                    'parameters' => []
                ]
            ];
        }

        // Спринты
        if (preg_match('/(спринты|список спринтов|все спринты|мои спринты)/', $input)) {
            return [
                [
                    'name' => 'LIST_SPRINTS',
                    'parameters' => []
                ]
            ];
        }

        // Создание спринта
        if (preg_match('/(создай спринт|создать спринт|новый спринт|добавь спринт)/', $input)) {
            $parameters = [];
            
            // Ищем название проекта
            if (preg_match('/в проекте "([^"]+)"/', $input, $matches)) {
                $parameters['project_name'] = $matches[1];
            } elseif (preg_match('/в проекте ([^,\s]+)/', $input, $matches)) {
                $parameters['project_name'] = $matches[1];
            }

            // Ищем название спринта
            if (preg_match('/название[:\s]+"([^"]+)"/', $input, $matches)) {
                $parameters['name'] = $matches[1];
            } elseif (preg_match('/название[:\s]+([^,\n]+)/', $input, $matches)) {
                $parameters['name'] = trim($matches[1]);
            } else {
                $parameters['name'] = 'Новый спринт';
            }

            // Ищем даты
            if (preg_match('/с (\d{4}-\d{2}-\d{2})/', $input, $matches)) {
                $parameters['start_date'] = $matches[1];
            }
            if (preg_match('/до (\d{4}-\d{2}-\d{2})/', $input, $matches)) {
                $parameters['end_date'] = $matches[1];
            }

            return [['name' => 'CREATE_SPRINT', 'parameters' => $parameters]];
        }

        return [];
    }

    /**
     * Добавить провайдер контекста
     */
    public function addContextProvider(ContextProviderInterface $provider): void
    {
        $this->contextProviders[] = $provider;
    }
}
