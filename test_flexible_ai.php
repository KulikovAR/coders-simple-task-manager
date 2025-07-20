<?php

require_once 'vendor/autoload.php';

use App\Services\Ai\FlexibleAiAgentService;
use App\Services\Ai\CommandRegistry;
use App\Services\Ai\ContextProviders\UserContextProvider;
use App\Services\Ai\ContextProviders\ProjectContextProvider;
use App\Services\Ai\ContextProviders\UsersContextProvider;
use App\Services\ProjectService;
use App\Services\TaskService;
use App\Services\SprintService;
use App\Services\CommentService;
use App\Services\AiConversationService;
use App\Models\User;

// Инициализируем Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🧪 Тестирование гибкого ИИ агента\n";
echo "================================\n\n";

// Создаем сервисы
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
];

$conversationService = app(AiConversationService::class);

$aiAgent = new FlexibleAiAgentService($commandRegistry, $contextProviders, $conversationService);

// Получаем первого пользователя
$user = User::first();
if (!$user) {
    echo "❌ Пользователь не найден\n";
    exit(1);
}

echo "👤 Пользователь: {$user->name}\n\n";

// Тестовые запросы
$testQueries = [
    "расскажи статус проекта",
    "какие у меня задачи?",
    "что происходит с задачами?",
    "покажи мои задачи к выполнению",
    "какие задачи в работе?",
    "что готово?",
];

foreach ($testQueries as $query) {
    echo "🤖 Запрос: {$query}\n";
    echo "---\n";
    
    try {
        $result = $aiAgent->processRequest($query, $user);
        
        echo "✅ Успех: " . ($result['success'] ? 'Да' : 'Нет') . "\n";
        echo "📝 Ответ: " . $result['message'] . "\n";
        echo "🆔 Session ID: " . ($result['session_id'] ?? 'Нет') . "\n";
        echo "⚡ Команд выполнено: " . ($result['commands_executed'] ?? 0) . "\n";
        echo "⏱️ Время обработки: " . ($result['processing_time'] ?? 0) . " сек\n";
        
        if (isset($result['command_results']) && !empty($result['command_results'])) {
            echo "📊 Результаты команд:\n";
            foreach ($result['command_results'] as $i => $cmdResult) {
                echo "  {$i}: " . ($cmdResult['success'] ? '✅' : '❌') . " " . $cmdResult['message'] . "\n";
            }
        }
        
    } catch (Exception $e) {
        echo "❌ Ошибка: " . $e->getMessage() . "\n";
    }
    
    echo "\n" . str_repeat("=", 50) . "\n\n";
    
    // Небольшая пауза между запросами
    sleep(1);
}

echo "🎉 Тестирование завершено!\n"; 