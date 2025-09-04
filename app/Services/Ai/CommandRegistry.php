<?php

namespace App\Services\Ai;

use App\Services\Ai\Contracts\CommandInterface;
use App\Services\Ai\Commands\CreateProjectCommand;
use App\Services\Ai\Commands\UpdateProjectCommand;
use App\Services\Ai\Commands\ListProjectsCommand;
use App\Services\Ai\Commands\CreateTaskCommand;
use App\Services\Ai\Commands\CreateMultipleTasksCommand;
use App\Services\Ai\Commands\UpdateTaskCommand;
use App\Services\Ai\Commands\ListTasksCommand;
use App\Services\Ai\Commands\UpdateTaskStatusCommand;
use App\Services\Ai\Commands\BulkUpdateTaskStatusCommand;
use App\Services\Ai\Commands\AssignTaskCommand;
use App\Services\Ai\Commands\CreateSprintCommand;
use App\Services\Ai\Commands\UpdateSprintCommand;
use App\Services\Ai\Commands\ListSprintsCommand;
use App\Services\Ai\Commands\ErrorCommand;
use App\Services\ProjectService;
use App\Services\TaskService;
use App\Services\SprintService;
use App\Services\CommentService;
use Illuminate\Support\Collection;

class CommandRegistry
{
    private Collection $commands;

    public function __construct(
        ProjectService $projectService,
        TaskService $taskService,
        SprintService $sprintService,
        CommentService $commentService
    ) {
        $this->commands = collect();
        $this->registerDefaultCommands($projectService, $taskService, $sprintService, $commentService);
    }

    /**
     * Регистрация команд по умолчанию
     */
    private function registerDefaultCommands(
        ProjectService $projectService,
        TaskService $taskService,
        SprintService $sprintService,
        CommentService $commentService
    ): void {
        // Команды проектов
        $this->register(new CreateProjectCommand($projectService));
        $this->register(new UpdateProjectCommand($projectService));
        $this->register(new ListProjectsCommand($projectService));

        // Команды задач
        $this->register(new CreateTaskCommand($taskService, $projectService));
        $this->register(new CreateMultipleTasksCommand($taskService, $projectService));
        $this->register(new UpdateTaskCommand($taskService));
        $this->register(new ListTasksCommand($taskService));
        $this->register(new UpdateTaskStatusCommand($taskService));
        $this->register(new BulkUpdateTaskStatusCommand($taskService, $projectService));
        $this->register(new AssignTaskCommand($taskService));
        
        // Команды спринтов
        $this->register(new CreateSprintCommand($sprintService, $projectService, app(\App\Services\TaskStatusService::class)));
        $this->register(new UpdateSprintCommand($sprintService, $projectService));
        $this->register(new ListSprintsCommand($sprintService, $projectService));
        
        // Команды ошибок
        $this->register(new ErrorCommand());
    }

    /**
     * Регистрация новой команды
     */
    public function register(CommandInterface $command): void
    {
        $this->commands->put($command->getName(), $command);
    }

    /**
     * Получить команду по имени
     */
    public function getCommand(string $name): ?CommandInterface
    {
        return $this->commands->get($name);
    }

    /**
     * Получить все команды
     */
    public function getAllCommands(): Collection
    {
        return $this->commands;
    }

    /**
     * Получить список команд для ИИ
     */
    public function getCommandsForAi(): array
    {
        return $this->commands->map(function (CommandInterface $command) {
            return [
                'name' => $command->getName(),
                'description' => $command->getDescription(),
                'parameters' => $command->getParametersSchema(),
            ];
        })->values()->toArray();
    }

    /**
     * Проверить существование команды
     */
    public function hasCommand(string $name): bool
    {
        return $this->commands->has($name);
    }

    /**
     * Получить команды по категории
     */
    public function getCommandsByCategory(): array
    {
        $categories = [
            'projects' => ['CREATE_PROJECT', 'UPDATE_PROJECT', 'LIST_PROJECTS'],
            'tasks' => ['CREATE_TASK', 'UPDATE_TASK', 'LIST_TASKS', 'UPDATE_TASK_STATUS'],
            'sprints' => ['CREATE_SPRINT', 'UPDATE_SPRINT', 'LIST_SPRINTS'],
            'comments' => ['CREATE_COMMENT', 'UPDATE_COMMENT', 'LIST_COMMENTS'],
            'analytics' => ['GET_PROJECT_ANALYTICS', 'GET_USER_ANALYTICS', 'GET_DASHBOARD_STATS'],
        ];

        $result = [];
        foreach ($categories as $category => $commandNames) {
            $result[$category] = $this->commands
                ->filter(fn($command) => in_array($command->getName(), $commandNames))
                ->values()
                ->toArray();
        }

        return $result;
    }
} 