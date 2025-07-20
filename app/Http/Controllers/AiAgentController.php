<?php

namespace App\Http\Controllers;

use App\Services\Ai\AiAgentService;
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
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AiAgentController extends Controller
{
    private FlexibleAiAgentService $aiAgentService;

    public function __construct()
    {
        $this->aiAgentService = $this->createFlexibleAiAgentService();
    }

    /**
     * Показать интерфейс ИИ-агента
     */
    public function index()
    {
        $user = Auth::user();
        $conversationService = app(AiConversationService::class);
        
        return Inertia::render('AiAgent/Index', [
            'user' => $user,
            'conversations' => $conversationService->getUserConversations($user, 5),
            'stats' => $conversationService->getUserStats($user),
        ]);
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

        $result = $this->aiAgentService->processRequest($message, $user, $sessionId);

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
        
        return response()->json([
            'success' => true,
            'conversations' => $conversationService->getUserConversations($user, $perPage),
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
        
        return response()->json([
            'success' => true,
            'conversation' => $conversation,
            'messages' => $conversationService->getConversationMessages($conversation, $perPage),
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
        
        return response()->json([
            'success' => true,
            'stats' => $conversationService->getUserStats($user),
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
        
        $contextProviders = [
            new UserContextProvider(),
            new ProjectContextProvider(app(ProjectService::class)),
            new UsersContextProvider(),
            new EnumsContextProvider(),
        ];

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