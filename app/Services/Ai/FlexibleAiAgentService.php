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
            $fallbackCommands = $this->getFallbackCommands($userInput);
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
        
        // Добавляем информацию о enum'ах
        if (isset($context['enums'])) {
            $prompt .= "ДОСТУПНЫЕ СТАТУСЫ ЗАДАЧ:\n";
            foreach ($context['enums']['task_statuses'] as $status) {
                $prompt .= "- {$status['name']} ({$status['key']}): {$status['description']}\n";
            }
            $prompt .= "\n";
            
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
        $prompt .= "10. ВАЖНО: Используй точные названия статусов из enum'ов\n";
        $prompt .= "11. Статусы задач: 'To Do', 'In Progress', 'Review', 'Testing', 'Ready for Release', 'Done'\n";
        $prompt .= "12. Возвращай ТОЛЬКО JSON\n\n";
        
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
                $context[$provider->getName()] = $provider->getContext($user);
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
    private function getFallbackCommands(string $userInput): array
    {
        $input = mb_strtolower($userInput);
        
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
        
        // Задачи к выполнению
        if (preg_match('/(к выполнению|готовые к выполнению|новые задачи|не начатые)/', $input)) {
            return [
                [
                    'name' => 'LIST_TASKS',
                    'parameters' => [
                        'status' => 'To Do'
                    ]
                ]
            ];
        }
        
        // Задачи в работе
        if (preg_match('/(в работе|выполняются|активные задачи|текущие)/', $input)) {
            return [
                [
                    'name' => 'LIST_TASKS',
                    'parameters' => [
                        'status' => 'In Progress'
                    ]
                ]
            ];
        }
        
        // Готовые задачи
        if (preg_match('/(готово|завершено|выполнено|готовые|завершенные)/', $input)) {
            return [
                [
                    'name' => 'LIST_TASKS',
                    'parameters' => [
                        'status' => 'Done'
                    ]
                ]
            ];
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
            $parameters = ['new_status' => 'Done'];
            
            // Проверяем разные варианты статуса "выполнено"
            if (preg_match('/(?:в статус|на статус)\s+(выполнено|готово|done)/i', $input, $matches)) {
                $status = strtolower($matches[1]);
                if ($status === 'done' || $status === 'выполнено' || $status === 'готово') {
                    $parameters['new_status'] = 'Done';
                } else {
                    $parameters['new_status'] = $status;
                }
            }
            
            // Ищем название проекта
            if (preg_match('/в проекте "([^"]+)"/', $input, $matches)) {
                $parameters['project_name'] = $matches[1];
            } elseif (preg_match('/в проекте ([^,\s]+)/', $input, $matches)) {
                $parameters['project_name'] = $matches[1];
            }
            
            // Ищем текущий статус
            if (preg_match('/(?:которые|что).*?(?:в|на).*?(тестировании|тестирование)/', $input)) {
                $parameters['current_status'] = 'Testing';
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