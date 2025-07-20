<?php

namespace App\Services\Ai;

use App\Services\Ai\Contracts\ContextProviderInterface;
use App\Services\Ai\Contracts\CommandInterface;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;

class AiAgentService
{
    private CommandRegistry $commandRegistry;
    private array $contextProviders;
    private string $aiServiceUrl;
    private string $aiServiceToken;
    private string $aiModel;

    public function __construct(
        CommandRegistry $commandRegistry,
        array $contextProviders = []
    ) {
        $this->commandRegistry = $commandRegistry;
        $this->contextProviders = $contextProviders;
        $this->aiServiceUrl = config('services.ai.url', 'https://oneai-proxy.ru/api/v1/ai');
        $this->aiServiceToken = config('services.ai.token');
        $this->aiModel = config('services.ai.model', 'gpt-3.5-turbo');
    }

    /**
     * Обработать запрос пользователя
     */
    public function processRequest(string $userInput, User $user): array
    {
        // Валидация входных данных
        $userInput = trim($userInput);
        if (empty($userInput)) {
            return [
                'success' => false,
                'message' => 'Запрос не может быть пустым',
                'results' => [],
                'commands_executed' => 0,
            ];
        }
        
        $maxLength = config('ai-agent.security.max_input_length', 1000);
        if (strlen($userInput) > $maxLength) {
            return [
                'success' => false,
                'message' => "Запрос слишком длинный (максимум {$maxLength} символов)",
                'results' => [],
                'commands_executed' => 0,
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
                'results' => [],
                'commands_executed' => 0,
            ];
        }
        RateLimiter::hit($key, 60); // 1 минута

        try {
            // Кэшируем контекст
            $contextCacheKey = 'ai_context_' . $user->id;
            $contextTtl = config('ai-agent.caching.context_ttl', 300);
            $context = Cache::remember($contextCacheKey, $contextTtl, function() use ($user) {
                return $this->buildContext($user);
            });
            
            // Получаем команды от ИИ
            $aiResponse = $this->getAiCommands($userInput, $context);
            
            // Выполняем команды
            $results = $this->executeCommands($aiResponse['commands'], $user);
            
            // Формируем финальный ответ
            $finalResponse = $this->generateFinalResponse($userInput, $results, $user);
            
            // Логируем успешные операции
            Log::info('AI Agent Success', [
                'user_id' => $user->id,
                'user_input' => $userInput,
                'commands_executed' => count($aiResponse['commands']),
                'commands' => $aiResponse['commands'],
            ]);
            
            return [
                'success' => true,
                'message' => $finalResponse,
                'results' => $results,
                'commands_executed' => count($aiResponse['commands']),
            ];
        } catch (\Exception $e) {
            Log::error('AI Agent Error', [
                'error' => $e->getMessage(),
                'user_input' => $userInput,
                'user_id' => $user->id,
                'trace' => $e->getTraceAsString(),
            ]);
            
            return [
                'success' => false,
                'message' => 'Произошла ошибка при обработке запроса: ' . $e->getMessage(),
                'results' => [],
                'commands_executed' => 0,
            ];
        }
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
     * Получить команды от ИИ
     */
    private function getAiCommands(string $userInput, array $context): array
    {
        $commands = $this->commandRegistry->getCommandsForAi();
        
        $prompt = $this->buildPrompt($userInput, $context, $commands);
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->aiServiceToken,
            'Content-Type' => 'application/json',
        ])->post($this->aiServiceUrl, [
            'model' => $this->aiModel,
            'input' => $prompt,
            'session_id' => 'ai-agent-session',
            'new_session' => false,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Ошибка при обращении к ИИ сервису: ' . $response->body());
        }

        $aiResponse = $response->json();
        
        // Логируем ответ для отладки
        Log::info('AI Response', [
            'response' => $aiResponse,
            'user_input' => $userInput,
        ]);
        
        // Парсим ответ ИИ для извлечения команд
        $parsedCommands = $this->parseAiResponse($aiResponse);
        
        // Если команды не найдены, пытаемся определить команду по ключевым словам
        if (empty($parsedCommands['commands'])) {
            $fallbackCommands = $this->getFallbackCommands($userInput);
            if (!empty($fallbackCommands)) {
                Log::info('Using fallback commands', [
                    'user_input' => $userInput,
                    'fallback_commands' => $fallbackCommands
                ]);
                return ['commands' => $fallbackCommands];
            }
            
            // Если и fallback не сработал, возвращаем пустой массив
            Log::warning('No commands found for user input', [
                'user_input' => $userInput,
                'parsed_commands' => $parsedCommands
            ]);
            return ['commands' => []];
        }
        
        return $parsedCommands;
    }

    /**
     * Построить промпт для ИИ
     */
    private function buildPrompt(string $userInput, array $context, array $commands): string
    {
        $prompt = "Ты - ИИ-ассистент для системы управления задачами. Твоя задача - анализировать запросы пользователей и возвращать команды для выполнения.\n\n";
        $prompt .= "Запрос пользователя: {$userInput}\n\n";
        
        $prompt .= "Контекст пользователя:\n";
        $prompt .= json_encode($context, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n\n";
        
        $prompt .= "Доступные команды:\n";
        foreach ($commands as $command) {
            $prompt .= "- {$command['name']}: {$command['description']}\n";
            foreach ($command['parameters'] as $param => $config) {
                $required = $config['required'] ? 'обязательный' : 'опциональный';
                $prompt .= "  - {$param} ({$config['type']}, {$required}): {$config['description']}\n";
            }
        }
        
        $prompt .= "\nПРАВИЛА:\n";
        $prompt .= "1. Анализируй запрос пользователя и определяй, какие команды нужно выполнить\n";
        $prompt .= "2. Если пользователь спрашивает о своих задачах - используй LIST_TASKS с параметром my_tasks: true\n";
        $prompt .= "3. Если пользователь спрашивает о задачах вообще - используй LIST_TASKS\n";
        $prompt .= "4. Если пользователь хочет создать что-то - используй соответствующую CREATE команду\n";
        $prompt .= "5. Для назначения исполнителей используй assignee_id или assignee_name из контекста пользователей\n";
        $prompt .= "6. Если пользователь говорит 'на меня', 'мне', 'себе' - используй assign_to_me: true\n";
        $prompt .= "7. Для назначения на конкретного пользователя используй assignee_name с именем\n";
        $prompt .= "8. ВАЖНО: Возвращай ТОЛЬКО JSON, без дополнительного текста\n";
        $prompt .= "9. Если не можешь определить команду - возвращай пустой массив команд\n\n";
        
        $prompt .= "Формат ответа (только JSON):\n";
        $prompt .= '{"commands": [{"name": "COMMAND_NAME", "parameters": {"param1": "value1"}}]}';
        
        return $prompt;
    }

    /**
     * Парсить ответ ИИ
     */
    private function parseAiResponse(array $aiResponse): array
    {
        // Проверяем формат OpenAI API
        if (isset($aiResponse['choices']) && is_array($aiResponse['choices'])) {
            $content = $aiResponse['choices'][0]['message']['content'] ?? '';
        } else {
            // Fallback для других форматов
            $content = $aiResponse['output'] ?? $aiResponse['response'] ?? '';
        }
        
        // Ищем JSON в ответе
        if (preg_match('/\{.*\}/s', $content, $matches)) {
            $json = json_decode($matches[0], true);
            if ($json && isset($json['commands'])) {
                return $json;
            }
        }
        
        // Если не нашли JSON, попробуем распарсить весь контент как JSON
        $json = json_decode($content, true);
        if ($json && isset($json['commands'])) {
            return $json;
        }
        
        throw new \Exception('Не удалось распарсить команды из ответа ИИ. Полученный контент: ' . substr($content, 0, 200));
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
     * Сгенерировать финальный ответ
     */
    private function generateFinalResponse(string $userInput, array $results, User $user): string
    {
        $successfulResults = array_filter($results, fn($r) => $r['success'] ?? false);
        $failedResults = array_filter($results, fn($r) => !($r['success'] ?? false));
        
        $prompt = "Пользователь запросил: {$userInput}\n\n";
        $prompt .= "Результаты выполнения команд:\n";
        
        foreach ($successfulResults as $result) {
            $prompt .= "- Успешно: {$result['message']}\n";
        }
        
        foreach ($failedResults as $result) {
            $prompt .= "- Ошибка: {$result['message']}\n";
        }
        
        $prompt .= "\nСформируй краткий и понятный ответ пользователю на русском языке. ";
        $prompt .= "Если были созданы объекты, укажи ссылки на них. ";
        $prompt .= "Если были ошибки, объясни их простыми словами.";
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->aiServiceToken,
            'Content-Type' => 'application/json',
        ])->post($this->aiServiceUrl, [
            'model' => $this->aiModel,
            'input' => $prompt,
            'session_id' => 'ai-agent-session',
            'new_session' => false,
        ]);

        if ($response->successful()) {
            $aiResponse = $response->json();
            
            // Проверяем формат OpenAI API
            if (isset($aiResponse['choices']) && is_array($aiResponse['choices'])) {
                return $aiResponse['choices'][0]['message']['content'] ?? 'Операция выполнена успешно.';
            }
            
            // Fallback для других форматов
            return $aiResponse['output'] ?? $aiResponse['response'] ?? 'Операция выполнена успешно.';
        }
        
        return 'Операция выполнена успешно.';
    }

    /**
     * Получить команды по ключевым словам (fallback)
     */
    private function getFallbackCommands(string $userInput): array
    {
        $input = mb_strtolower($userInput);
        
        // Команды для задач
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
        
        if (preg_match('/(задачи|список задач|все задачи)/', $input)) {
            return [
                [
                    'name' => 'LIST_TASKS',
                    'parameters' => []
                ]
            ];
        }
        
        // Команды для проектов
        if (preg_match('/(проекты|список проектов|все проекты|мои проекты)/', $input)) {
            return [
                [
                    'name' => 'LIST_PROJECTS',
                    'parameters' => []
                ]
            ];
        }
        
        if (preg_match('/(создай|создать) проект/', $input)) {
            // Извлекаем название проекта
            if (preg_match('/(?:создай|создать) проект\s+(.+)/', $input, $matches)) {
                return [
                    [
                        'name' => 'CREATE_PROJECT',
                        'parameters' => [
                            'name' => trim($matches[1])
                        ]
                    ]
                ];
            }
            return [
                [
                    'name' => 'CREATE_PROJECT',
                    'parameters' => [
                        'name' => 'Новый проект'
                    ]
                ]
            ];
        }
        
        if (preg_match('/(создай|создать) задачу/', $input)) {
            $parameters = ['project_id' => 1]; // По умолчанию первый проект
            
            // Извлекаем название задачи
            if (preg_match('/(?:создай|создать) задачу\s+(.+)/', $input, $matches)) {
                $parameters['title'] = trim($matches[1]);
            } else {
                $parameters['title'] = 'Новая задача';
            }
            
            // Проверяем назначение на себя
            if (preg_match('/(на меня|мне|себе)/', $input)) {
                $parameters['assign_to_me'] = true;
            }
            
            // Проверяем назначение на конкретного пользователя
            if (preg_match('/(?:на|для)\s+([а-яё\s]+)/', $input, $matches)) {
                $parameters['assignee_name'] = trim($matches[1]);
            }
            
            return [['name' => 'CREATE_TASK', 'parameters' => $parameters]];
        }
        
        // Назначение исполнителя для существующей задачи
        if (preg_match('/(назначь|поставь|назначить|поставить).*?(?:на|для)\s+([а-яё\s]+)/', $input, $matches)) {
            return [
                [
                    'name' => 'ASSIGN_TASK',
                    'parameters' => [
                        'assignee_name' => trim($matches[2]),
                        'task_id' => 1 // Нужно будет определить ID задачи
                    ]
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