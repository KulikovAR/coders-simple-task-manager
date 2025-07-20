<?php

namespace App\Http\Controllers;

use App\Services\Ai\AiAgentService;
use App\Services\Ai\CommandRegistry;
use App\Services\Ai\ContextProviders\UserContextProvider;
use App\Services\Ai\ContextProviders\ProjectContextProvider;
use App\Services\Ai\ContextProviders\UsersContextProvider;
use App\Services\ProjectService;
use App\Services\TaskService;
use App\Services\SprintService;
use App\Services\CommentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AiAgentController extends Controller
{
    private AiAgentService $aiAgentService;

    public function __construct()
    {
        $this->aiAgentService = $this->createAiAgentService();
    }

    /**
     * Показать интерфейс ИИ-агента
     */
    public function index()
    {
        return Inertia::render('AiAgent/Index', [
            'user' => Auth::user(),
        ]);
    }

    /**
     * Обработать запрос пользователя
     */
    public function processRequest(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $user = Auth::user();
        $message = $request->input('message');

        $result = $this->aiAgentService->processRequest($message, $user);

        return response()->json($result);
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
     * Создать экземпляр ИИ-агента
     */
    private function createAiAgentService(): AiAgentService
    {
        $commandRegistry = $this->createCommandRegistry();
        
        $contextProviders = [
            new UserContextProvider(),
            new ProjectContextProvider(app(ProjectService::class)),
            new UsersContextProvider(),
        ];

        return new AiAgentService($commandRegistry, $contextProviders);
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