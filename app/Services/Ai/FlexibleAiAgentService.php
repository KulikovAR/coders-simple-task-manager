<?php

namespace App\Services\Ai;

use App\Models\Sprint;
use App\Models\Task;
use App\Models\User;
use App\Services\Ai\Contracts\ContextProviderInterface;
use App\Services\AiConversationService;
use App\Services\TaskService;
use App\Services\TaskStatusService;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class FlexibleAiAgentService
{
    private CommandRegistry $commandRegistry;
    private array $contextProviders;
    private ?AiConversationService $conversationService;
    private string $aiServiceUrl;
    private string $aiServiceToken;
    private string $aiModel;

    public function __construct(
        CommandRegistry        $commandRegistry,
        ?array                 $contextProviders = null,
        ?AiConversationService $conversationService = null
    )
    {
        $contextProviders ??= [];
        $this->commandRegistry = $commandRegistry;
        $this->contextProviders = $contextProviders;
        $this->conversationService = $conversationService;
        $this->aiServiceUrl = config('services.ai.url', 'https://oneai-proxy.ru/api/v1/ai');
        $this->aiServiceToken = config('services.ai.token');
        $this->aiModel = config('services.ai.model', 'gpt-3.5-turbo');
    }

    public function processRequest(string $userInput, User $user, ?string $sessionId = null): array
    {
        $startTime = microtime(true);

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

        try {
            $isConfirmation = $this->isConfirmation($userInput);

            $commandsResponse = $this->getCommandsFromAi($userInput, $user, $sessionId, $isConfirmation);
            $sessionId = $commandsResponse['session_id'] ?? $sessionId;

            $commandResults = [];
            if (!empty($commandsResponse['commands'])) {
                $commandResults = $this->executeCommands($commandsResponse['commands'], $user);
            }

            $finalResponse = $this->generateNaturalResponse($userInput, $commandResults, $user, $sessionId, $isConfirmation);

            $processingTime = microtime(true) - $startTime;

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
        } catch (Exception $e) {
            $processingTime = isset($startTime) ? microtime(true) - $startTime : 0;

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
                } catch (Exception $historyError) {
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
            if (str_starts_with($input, $confirmation)) {
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
        // Step 1: Identify command name with minimal context
        $commands = $this->commandRegistry->getCommandsForAi();
        $commandIdentificationResponse = $this->identifyCommands($userInput, $user, $sessionId, $isConfirmation, $commands);
        
        $sessionId = $commandIdentificationResponse['session_id'] ?? $sessionId;
        $commandName = $commandIdentificationResponse['command_name'] ?? '';
        
        // If no command identified, try fallback
        if (empty($commandName)) {
            $context = $this->buildContext($user);
            $fallbackCommands = $this->getFallbackCommands($userInput, $context);
            if (!empty($fallbackCommands)) {
                Log::info('Using fallback commands', [
                    'user_input' => $userInput,
                    'fallback_commands' => $fallbackCommands
                ]);
                return [
                    'commands' => $fallbackCommands,
                    'session_id' => $sessionId,
                ];
            }
            
            // Если не нашли команду, вернем пустой массив
            return [
                'commands' => [],
                'session_id' => $sessionId,
            ];
        }
        
        // Step 2: Get parameters for the identified command
        $command = $this->commandRegistry->getCommand($commandName);
        if (!$command) {
            Log::warning('Command not found in registry', ['command_name' => $commandName]);
            return [
                'commands' => [],
                'session_id' => $sessionId,
            ];
        }
        
        // Get parameters with specific context
        $enhancedCommand = $this->getCommandParameters($commandName, $user, $userInput, $sessionId);
        
        return [
            'commands' => [$enhancedCommand],
            'session_id' => $sessionId,
        ];
    }
    
    /**
     * Получить параметры для команды
     */
    private function getCommandParameters(string $commandName, User $user, string $userInput, ?string $sessionId): array
    {
        // Загрузить необходимый контекст для конкретной команды
        $context = $this->buildSpecificContext($commandName, $user, $userInput);
        $command = $this->commandRegistry->getCommand($commandName);
        
        if (!$command) {
            return ['name' => $commandName, 'parameters' => []];
        }
        
        $commandInfo = [
            'name' => $commandName,
            'description' => $command->getDescription(),
            'parameters' => $command->getParametersSchema()
        ];
        
        $prompt = $this->buildParametersPrompt($userInput, $context, $commandInfo);
        
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
            Log::warning('Failed to get command parameters', [
                'command' => $commandName,
                'error' => $response->body()
            ]);
            return ['name' => $commandName, 'parameters' => []];
        }

        $aiResponse = $response->json();
        $content = $this->extractContent($aiResponse);
        
        try {
            if (preg_match('/\{.*\}/s', $content, $matches)) {
                $json = json_decode($matches[0], true);
                if ($json && isset($json['parameters'])) {
                    return ['name' => $commandName, 'parameters' => $json['parameters']];
                }
            }
            
            $json = json_decode($content, true);
            if ($json && isset($json['parameters'])) {
                return ['name' => $commandName, 'parameters' => $json['parameters']];
            }
        } catch (Exception $e) {
            Log::warning('Failed to parse command parameters', [
                'command' => $commandName,
                'error' => $e->getMessage()
            ]);
        }
        
        return ['name' => $commandName, 'parameters' => []];
    }

    /**
     * Шаг 3: Генерировать естественный ответ на основе результатов команд
     */
    private function generateNaturalResponse(string $userInput, array $commandResults, User $user, ?string $sessionId, bool $isConfirmation = false): array
    {
        // Для генерации ответа не нужен полный контекст, только основная информация
        $minimalContext = $this->buildMinimalContext($user);

        $prompt = $this->buildResponsePrompt($userInput, $commandResults, $minimalContext);

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
            throw new Exception('Ошибка при генерации ответа: ' . $response->body());
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
     * Построить минимальный промпт для идентификации команд
     */
    private function buildCommandIdentificationPrompt(string $userInput, array $commands, bool $isConfirmation = false): string
    {
        $prompt = "Ты - ИИ-ассистент для системы управления задачами. Анализируй запрос пользователя и определи ТОЛЬКО НАЗВАНИЕ нужной команды.\n\n";
        $prompt .= "Запрос пользователя: {$userInput}\n\n";

        $prompt .= "Доступные команды:\n";
        foreach ($commands as $command) {
            $prompt .= "- {$command['name']}: {$command['description']}\n";
        }

        $prompt .= "\nПРАВИЛА:\n";
        $prompt .= "1. Анализируй запрос и определи ТОЛЬКО НАЗВАНИЕ нужной команды\n";
        $prompt .= "2. Для вопросов о статусе используй LIST_TASKS\n";
        $prompt .= "3. Для создания используй CREATE команды\n";
        $prompt .= "4. Если пользователь говорит 'переведи задачи в статус выполнено' - используй BULK_UPDATE_TASK_STATUS\n";
        $prompt .= "5. Если пользователь подтверждает действие (да, сделай, ок) - выбери предыдущую команду\n";
        $prompt .= "6. Для работы со спринтами используй CREATE_SPRINT, LIST_SPRINTS, UPDATE_SPRINT\n";
        $prompt .= "7. Верни ТОЛЬКО название команды БЕЗ ПАРАМЕТРОВ\n\n";

        $prompt .= "Формат ответа:\n";
        $prompt .= '{"command": "COMMAND_NAME"}';

        return $prompt;
    }

    /**
     * Построить детальный промпт для получения команд с контекстом
     */
    private function buildCommandsPrompt(string $userInput, array $context, array $commands, bool $isConfirmation = false): string
    {
        $prompt = "Ты - ИИ-ассистент для системы управления задачами. Анализируй запрос пользователя и определяй, какие команды нужно выполнить.\n\n";
        $prompt .= "Запрос пользователя: {$userInput}\n\n";

        $prompt .= "Контекст пользователя:\n";
        $prompt .= json_encode($context, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n\n";

        if (isset($context['dynamic_statuses']) && !empty($context['dynamic_statuses']['available_status_names'])) {
            $prompt .= "ДОСТУПНЫЕ СТАТУСЫ ЗАДАЧ:\n";
            foreach ($context['dynamic_statuses']['status_mapping'] as $statusName => $description) {
                $prompt .= "- {$statusName}: {$description}\n";
            }
            $prompt .= "\n";
        }

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
        $prompt .= json_encode($commandResults, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n\n";

        $prompt .= "Контекст пользователя:\n";
        $prompt .= json_encode($context, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n\n";

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

        if (preg_match('/\{.*\}/s', $content, $matches)) {
            $json = json_decode($matches[0], true);
            if ($json && isset($json['commands'])) {
                return $json;
            }
        }

        $json = json_decode($content, true);
        if ($json && isset($json['commands'])) {
            return $json;
        }

        throw new Exception('Не удалось распарсить команды из ответа ИИ');
    }

    /**
     * Извлечь контент из ответа ИИ
     */
    private function extractContent(array $aiResponse): string
    {
        if (isset($aiResponse['choices']) && is_array($aiResponse['choices'])) {
            return $aiResponse['choices'][0]['message']['content'] ?? '';
        }

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
                } catch (Exception $e) {
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
            } catch (Exception $e) {
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

        $availableStatuses = [];
        if (isset($context['dynamic_statuses']['available_status_names'])) {
            $availableStatuses = $context['dynamic_statuses']['available_status_names'];
        }

        if (preg_match('/(статус|состояние|как дела|что происходит)/', $input)) {
            return [
                [
                    'name' => 'LIST_TASKS',
                    'parameters' => []
                ]
            ];
        }

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

        if (preg_match('/(задачи|список задач|все задачи)/', $input)) {
            return [
                [
                    'name' => 'LIST_TASKS',
                    'parameters' => []
                ]
            ];
        }

        if (preg_match('/(переведи|перевести|обнови|обновить).*?(задач|задачи).*?(статус|статус).*?(выполнено|готово|done)/', $input)) {
            $completedStatus = 'Done'; // fallback
            foreach (['Завершена', 'Done', 'Готова к релизу'] as $status) {
                if (in_array($status, $availableStatuses)) {
                    $completedStatus = $status;
                    break;
                }
            }

            $parameters = ['new_status' => $completedStatus];

            if (preg_match('/в проекте "([^"]+)"/', $input, $matches)) {
                $parameters['project_name'] = $matches[1];
            } elseif (preg_match('/в проекте ([^,\s]+)/', $input, $matches)) {
                $parameters['project_name'] = $matches[1];
            }

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

        if (preg_match('/(проекты|список проектов|все проекты|мои проекты)/', $input)) {
            return [
                [
                    'name' => 'LIST_PROJECTS',
                    'parameters' => []
                ]
            ];
        }

        if (preg_match('/(спринты|список спринтов|все спринты|мои спринты)/', $input)) {
            return [
                [
                    'name' => 'LIST_SPRINTS',
                    'parameters' => []
                ]
            ];
        }

        if (preg_match('/(создай спринт|создать спринт|новый спринт|добавь спринт)/', $input)) {
            $parameters = [];

            if (preg_match('/в проекте "([^"]+)"/', $input, $matches)) {
                $parameters['project_name'] = $matches[1];
            } elseif (preg_match('/в проекте ([^,\s]+)/', $input, $matches)) {
                $parameters['project_name'] = $matches[1];
            }

            if (preg_match('/название[:\s]+"([^"]+)"/', $input, $matches)) {
                $parameters['name'] = $matches[1];
            } elseif (preg_match('/название[:\s]+([^,\n]+)/', $input, $matches)) {
                $parameters['name'] = trim($matches[1]);
            } else {
                $parameters['name'] = 'Новый спринт';
            }

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
     * Идентификация команды с минимальным контекстом
     */
    private function identifyCommands(string $userInput, User $user, ?string $sessionId, bool $isConfirmation, array $commands): array
    {
        $prompt = $this->buildCommandIdentificationPrompt($userInput, $commands, $isConfirmation);
        
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
            throw new Exception('Ошибка при обращении к ИИ сервису: ' . $response->body());
        }

        $aiResponse = $response->json();

        Log::info('AI Command Identification Response', [
            'response' => $aiResponse,
            'user_input' => $userInput,
            'session_id' => $sessionId,
        ]);

        $commandName = $this->extractCommandName($aiResponse);
        
        return [
            'command_name' => $commandName,
            'session_id' => $aiResponse['session_id'] ?? $sessionId,
        ];
    }
    
    /**
     * Извлечь название команды из ответа ИИ
     */
    private function extractCommandName(array $aiResponse): string
    {
        $content = $this->extractContent($aiResponse);
        
        // Пробуем найти JSON формат
        if (preg_match('/\{.*\}/s', $content, $matches)) {
            $json = json_decode($matches[0], true);
            if ($json && isset($json['command'])) {
                return $json['command'];
            }
        }
        
        // Пробуем найти команду в тексте
        $possibleCommands = [
            'LIST_TASKS',
            'CREATE_TASK',
            'UPDATE_TASK',
            'DELETE_TASK',
            'LIST_PROJECTS',
            'CREATE_PROJECT',
            'UPDATE_PROJECT',
            'DELETE_PROJECT',
            'LIST_SPRINTS',
            'CREATE_SPRINT',
            'UPDATE_SPRINT',
            'DELETE_SPRINT',
            'BULK_UPDATE_TASK_STATUS',
            'ADD_COMMENT',
        ];
        
        foreach ($possibleCommands as $cmd) {
            if (stripos($content, $cmd) !== false) {
                return $cmd;
            }
        }
        
        // Если не нашли, вернем пустую строку
        return '';
    }
    
    
    /**
     * Построить промпт для получения параметров команды
     */
    private function buildParametersPrompt(string $userInput, array $context, array $commandInfo): string
    {
        $prompt = "Ты - ИИ-ассистент для системы управления задачами. Тебе нужно определить параметры команды на основе запроса и контекста.\n\n";
        $prompt .= "Запрос пользователя: {$userInput}\n\n";

        $prompt .= "Команда: {$commandInfo['name']}\n";
        $prompt .= "Описание: {$commandInfo['description']}\n\n";
        
        $prompt .= "Параметры команды:\n";
        foreach ($commandInfo['parameters'] as $param => $config) {
            $required = $config['required'] ? 'обязательный' : 'опциональный';
            $prompt .= "- {$param} ({$config['type']}, {$required}): {$config['description']}\n";
        }
        
        $prompt .= "\nКонтекст:\n";
        $prompt .= json_encode($context, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n\n";
        
        // Если это обновление статуса конкретной задачи, выделяем информацию о ней
        if (isset($context['specific_task'])) {
            $task = $context['specific_task'];
            $prompt .= "ИНФОРМАЦИЯ О ЗАДАЧЕ:\n";
            $prompt .= "- ID: {$task['id']}\n";
            $prompt .= "- Название: {$task['title']}\n";
            $prompt .= "- Текущий статус: {$task['current_status']}\n";
            $prompt .= "- Проект: {$task['project_name']}\n\n";
            
            $prompt .= "ДОСТУПНЫЕ СТАТУСЫ ДЛЯ ЭТОЙ ЗАДАЧИ:\n";
            foreach ($task['status_mapping'] as $statusName => $description) {
                $prompt .= "- {$statusName}: {$description}\n";
            }
            $prompt .= "\n";
        }
        // Общие статусы из контекста
        elseif (isset($context['dynamic_statuses']) && !empty($context['dynamic_statuses']['available_status_names'])) {
            $prompt .= "ДОСТУПНЫЕ СТАТУСЫ ЗАДАЧ:\n";
            foreach ($context['dynamic_statuses']['status_mapping'] as $statusName => $description) {
                $prompt .= "- {$statusName}: {$description}\n";
            }
            $prompt .= "\n";
        }
        // Резервные статусы, если нет динамических
        elseif (isset($context['fallback_statuses']) && !empty($context['fallback_statuses']['available_status_names'])) {
            $prompt .= "ДОСТУПНЫЕ СТАТУСЫ ЗАДАЧ:\n";
            foreach ($context['fallback_statuses']['status_mapping'] as $statusName => $description) {
                $prompt .= "- {$statusName}: {$description}\n";
            }
            $prompt .= "\n";
        }
        
        $prompt .= "ПРАВИЛА:\n";
        $prompt .= "1. Определи все необходимые параметры для команды на основе запроса пользователя\n";
        $prompt .= "2. Используй project_name вместо project_id\n";
        $prompt .= "3. Для назначения на себя используй assign_to_me: true\n";
        $prompt .= "4. Используй только точные названия статусов из доступных статусов задач\n";
        
        $prompt .= "\nЗадача: Определи параметры команды на основе контекста и запроса пользователя.\n";
        $prompt .= "Верни ТОЛЬКО JSON с параметрами в формате: {\"parameters\": {\"param1\": \"value1\", \"param2\": \"value2\"}}\n";
        
        return $prompt;
    }
    
    /**
     * Построить специфический контекст для команды
     */
    private function buildSpecificContext(string $commandName, User $user, ?string $userInput = null): array
    {
        $context = [];
        
        // Загружаем только необходимые для конкретной команды провайдеры
        foreach ($this->contextProviders as $provider) {
            if (!$provider instanceof ContextProviderInterface) {
                continue;
            }
            
            $providerName = $provider->getName();
            
            // Фильтруем провайдеры в зависимости от команды
            $isNeeded = false;
            
            if (in_array($commandName, ['CREATE_TASK', 'UPDATE_TASK', 'UPDATE_TASK_STATUS', 'BULK_UPDATE_TASK_STATUS']) && 
                in_array($providerName, ['user', 'project', 'dynamic_statuses'])) {
                $isNeeded = true;
            }
            
            if (in_array($commandName, ['CREATE_SPRINT', 'UPDATE_SPRINT']) && 
                in_array($providerName, ['user', 'project'])) {
                $isNeeded = true;
            }
            
            if ($isNeeded) {
                try {
                    $context[$providerName] = $provider->getContext($user);
                } catch (Exception $e) {
                    Log::warning("Context provider {$providerName} failed for command {$commandName}", [
                        'error' => $e->getMessage(),
                        'user_id' => $user->id
                    ]);
                }
            }
        }
        
        // Добавляем специфический контекст для команды UPDATE_TASK_STATUS
        if ($commandName === 'UPDATE_TASK_STATUS' && $userInput) {
            $this->addTaskStatusContext($context, $userInput, $user);
        }
        
        // Проверяем, что у нас есть информация о статусах для команд работы со статусами
        if (in_array($commandName, ['UPDATE_TASK_STATUS', 'BULK_UPDATE_TASK_STATUS']) && 
            (!isset($context['dynamic_statuses']) || empty($context['dynamic_statuses']['available_status_names']))) {
            // Загружаем стандартные статусы, если нет динамических
            $context['fallback_statuses'] = [
                'available_status_names' => [
                    'К выполнению', 'To Do',
                    'В работе', 'In Progress',
                    'Завершена', 'Done',
                    'На проверке', 'Review',
                    'Тестирование', 'Testing',
                    'Готова к релизу', 'Ready for Release'
                ],
                'status_mapping' => [
                    'К выполнению' => 'Задачи, которые готовы к выполнению',
                    'To Do' => 'Tasks ready to be worked on',
                    'В работе' => 'Задачи, над которыми сейчас работают',
                    'In Progress' => 'Tasks currently being worked on',
                    'Завершена' => 'Задачи, которые полностью завершены',
                    'Done' => 'Tasks that are completely done',
                    'На проверке' => 'Задачи на проверке кода',
                    'Review' => 'Tasks being reviewed',
                    'Тестирование' => 'Задачи на этапе тестирования',
                    'Testing' => 'Tasks being tested',
                    'Готова к релизу' => 'Задачи, готовые к выпуску в продакшен',
                    'Ready for Release' => 'Tasks ready to be released to production'
                ]
            ];
        }
        
        return $context;
    }
    
    /**
     * Добавить контекст статусов для конкретной задачи
     */
    private function addTaskStatusContext(array &$context, string $userInput, User $user): void
    {
        // Пытаемся извлечь ID задачи из запроса пользователя
        $taskId = null;
        
        // Поиск по шаблонам вроде "#123", "task 123", "задача 123", "задачу 123"
        if (preg_match('/#(\d+)/', $userInput, $matches)) {
            $taskId = (int)$matches[1];
        } elseif (preg_match('/(task|задача|задачу)\s+(\d+)/iu', $userInput, $matches)) {
            $taskId = (int)$matches[2];
        }
        
        if (!$taskId) {
            return;
        }
        
        try {
            // Получаем данные о задаче напрямую из модели
            $task = \App\Models\Task::with(['status', 'project'])->find($taskId);
            
            if ($task && $task->project && $user->can('view', $task)) {
                // Добавляем информацию о задаче в контекст
                $context['specific_task'] = [
                    'id' => $task->id,
                    'title' => $task->title,
                    'current_status' => $task->status->name,
                    'project_id' => $task->project_id,
                    'project_name' => $task->project->name,
                ];
                
                // Получаем доступные статусы для этого проекта
                $taskStatusService = app(TaskStatusService::class);
                
                // Получаем статусы для контекста задачи
                $statuses = $task->project->statuses;
                if ($task->sprint_id) {
                    // Если задача в спринте, используем статусы с учетом спринта
                    $sprint = \App\Models\Sprint::find($task->sprint_id);
                    if ($sprint) {
                        $statuses = $taskStatusService->getAvailableStatusesForTask($task, $task->project, $sprint);
                    }
                }
                
                $availableStatuses = [];
                $statusMapping = [];
                
                foreach ($statuses as $status) {
                    $availableStatuses[] = $status->name;
                    $statusMapping[$status->name] = $status->description ?: $status->name;
                }
                
                $context['specific_task']['available_statuses'] = $availableStatuses;
                $context['specific_task']['status_mapping'] = $statusMapping;
            }
        } catch (Exception $e) {
            Log::warning('Failed to get task status context', [
                'task_id' => $taskId,
                'error' => $e->getMessage(),
                'user_id' => $user->id
            ]);
        }
    }

    /**
     * Создать минимальный контекст для генерации ответа
     */
    private function buildMinimalContext(User $user): array
    {
        $context = [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ]
        ];
        
        // Добавляем только статусы для корректного отображения в ответе
        foreach ($this->contextProviders as $provider) {
            if ($provider instanceof ContextProviderInterface) {
                if ($provider->getName() === 'dynamic_statuses') {
                    try {
                        $context['dynamic_statuses'] = $provider->getContext($user);
                    } catch (Exception $e) {
                        Log::warning("Dynamic statuses provider failed", [
                            'error' => $e->getMessage(),
                            'user_id' => $user->id
                        ]);
                    }
                    break;
                }
            }
        }
        
        return $context;
    }
    
    /**
     * Добавить провайдер контекста
     */
    public function addContextProvider(ContextProviderInterface $provider): void
    {
        $this->contextProviders[] = $provider;
    }
}
