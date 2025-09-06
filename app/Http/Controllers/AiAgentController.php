<?php

namespace App\Http\Controllers;

use App\Services\Ai\FlexibleAiAgentService;
use App\Services\Ai\CommandRegistry;
use App\Services\Ai\ContextProviders\UserContextProvider;
use App\Services\Ai\ContextProviders\ProjectContextProvider;
use App\Services\Ai\ContextProviders\UsersContextProvider;
use App\Services\Ai\ContextProviders\EnumsContextProvider;
use App\Services\Ai\ContextProviders\DynamicStatusContextProvider;
use App\Services\Ai\ContextProviders\SprintContextProvider;
use App\Services\Ai\ContextProviders\LazyContextProvider;
use App\Services\ProjectService;
use App\Services\TaskService;
use App\Services\SprintService;
use App\Services\CommentService;
use App\Services\AiConversationService;
use App\Services\SubscriptionService;
use App\Services\TaskStatusService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AiAgentController extends Controller
{
    private FlexibleAiAgentService $aiAgentService;
    private SubscriptionService $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->aiAgentService = $this->createFlexibleAiAgentService();
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Показать интерфейс ИИ-агента
     */
    public function index()
    {
        $user = Auth::user();
        $conversationService = app(AiConversationService::class);

        // Получаем информацию о лимитах запросов к ИИ
        $subscriptionInfo = $this->subscriptionService->getUserSubscriptionInfo($user);
        $aiRequestsRemaining = $user->getRemainingAiRequests();

        return Inertia::render('AiAgent/Index', [
            'user' => $user,
            'conversations' => $conversationService->getUserConversations($user, 5),
            'stats' => $conversationService->getUserStats($user),
            'subscription' => [
                'name' => $subscriptionInfo['name'],
                'ai_requests_limit' => $subscriptionInfo['ai_requests_limit'],
                'ai_requests_used' => $subscriptionInfo['ai_requests_used'],
                'ai_requests_remaining' => $aiRequestsRemaining,
                'ai_requests_period' => $subscriptionInfo['ai_requests_period'] ?? null,
                'ai_requests_reset_at' => $subscriptionInfo['ai_requests_reset_at'],
            ],
        ])->with('subscriptionName', $subscriptionInfo['name']);
    }

    /**
     * Обработать запрос пользователя
     */
    public function processRequest(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'session_id' => 'nullable|string',
        ]);

        $user = Auth::user();
        $message = $request->input('message');
        $sessionId = $request->input('session_id');

        // Проверяем, есть ли у пользователя доступные запросы к ИИ
        if (!$this->subscriptionService->canUseAi($user)) {
                    // Получаем информацию о текущем тарифе
        $subscriptionInfo = $this->subscriptionService->getUserSubscriptionInfo($user);

        return response()->json([
            'success' => false,
            'error' => 'Превышен лимит запросов к ИИ-ассистенту. Пожалуйста, обновите тариф.',
            'subscription' => [
                'name' => $subscriptionInfo['name'],
                'ai_requests_remaining' => $user->getRemainingAiRequests(),
                'ai_requests_reset_at' => $user->ai_requests_reset_at,
            ]
        ], 403);
        }

        // Обрабатываем запрос
        $result = $this->aiAgentService->processRequest($message, $user, $sessionId);

        // Увеличиваем счетчик использованных запросов
        $this->subscriptionService->processAiUsage($user);

        // Добавляем информацию о лимитах в ответ
        $result['subscription'] = [
            'ai_requests_remaining' => $user->getRemainingAiRequests(),
            'ai_requests_reset_at' => $user->ai_requests_reset_at,
        ];

        return response()->json($result);
    }

    /**
     * Получить историю диалогов пользователя
     */
    public function getConversations(Request $request)
    {
        $user = Auth::user();
        $conversationService = app(AiConversationService::class);
        $perPage = $request->get('per_page', 10);

        $paginatedConversations = $conversationService->getUserConversations($user, $perPage);

        return response()->json([
            'success' => true,
            'conversations' => $paginatedConversations->items(),
            'pagination' => [
                'current_page' => $paginatedConversations->currentPage(),
                'last_page' => $paginatedConversations->lastPage(),
                'per_page' => $paginatedConversations->perPage(),
                'total' => $paginatedConversations->total(),
            ],
        ]);
    }

    /**
     * Получить сообщения конкретного диалога
     */
    public function getConversationMessages(Request $request, $conversationId)
    {
        $user = Auth::user();
        $conversationService = app(AiConversationService::class);
        $perPage = $request->get('per_page', 20);

        $conversation = \App\Models\AiConversation::where('id', $conversationId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $paginatedMessages = $conversationService->getConversationMessages($conversation, $perPage);

        return response()->json([
            'success' => true,
            'conversation' => $conversation,
            'messages' => $paginatedMessages->items(),
            'pagination' => [
                'current_page' => $paginatedMessages->currentPage(),
                'last_page' => $paginatedMessages->lastPage(),
                'per_page' => $paginatedMessages->perPage(),
                'total' => $paginatedMessages->total(),
            ],
        ]);
    }

    /**
     * Создать новый диалог
     */
    public function createConversation()
    {
        $user = Auth::user();
        $conversationService = app(AiConversationService::class);

        $conversation = $conversationService->createNewConversation($user);

        return response()->json([
            'success' => true,
            'conversation' => $conversation,
        ]);
    }

    /**
     * Удалить диалог
     */
    public function deleteConversation($conversationId)
    {
        $user = Auth::user();
        $conversationService = app(AiConversationService::class);

        $conversation = \App\Models\AiConversation::where('id', $conversationId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $conversationService->deleteConversation($conversation);

        return response()->json([
            'success' => true,
            'message' => 'Диалог удален',
        ]);
    }

    /**
     * Получить статистику пользователя
     */
    public function getStats()
    {
        $user = Auth::user();
        $conversationService = app(AiConversationService::class);
        
        $subscriptionInfo = $this->subscriptionService->getUserSubscriptionInfo($user);
        $aiRequestsRemaining = $user->getRemainingAiRequests();

        return response()->json([
            'success' => true,
            'stats' => $conversationService->getUserStats($user),
            'subscription' => [
                'name' => $subscriptionInfo['name'],
                'ai_requests_limit' => $subscriptionInfo['ai_requests_limit'],
                'ai_requests_used' => $subscriptionInfo['ai_requests_used'],
                'ai_requests_remaining' => $aiRequestsRemaining,
                'ai_requests_period' => $subscriptionInfo['ai_requests_period'] ?? null,
                'ai_requests_reset_at' => $subscriptionInfo['ai_requests_reset_at'],
            ],
        ]);
    }

    /**
     * Получить доступные команды (для отладки)
     */
    public function getCommands()
    {
        $commandRegistry = $this->createCommandRegistry();

        return response()->json([
            'commands' => $commandRegistry->getCommandsForAi(),
            'categories' => $commandRegistry->getCommandsByCategory(),
        ]);
    }

    /**
     * Создать экземпляр гибкого ИИ-агента
     */
    private function createFlexibleAiAgentService(): FlexibleAiAgentService
    {
        $commandRegistry = $this->createCommandRegistry();

        $lazyProvider = new LazyContextProvider([
            new UserContextProvider(),
            new ProjectContextProvider(app(ProjectService::class)),
            new UsersContextProvider(),
            new EnumsContextProvider(),
            new DynamicStatusContextProvider(app(TaskStatusService::class)),
            new SprintContextProvider(),
        ]);

        $contextProviders = [$lazyProvider];

        return new FlexibleAiAgentService($commandRegistry, $contextProviders, app(AiConversationService::class));
    }

    /**
     * Создать реестр команд
     */
    private function createCommandRegistry(): CommandRegistry
    {
        return new CommandRegistry(
            app(ProjectService::class),
            app(TaskService::class),
            app(SprintService::class),
            app(CommentService::class)
        );
    }
}
