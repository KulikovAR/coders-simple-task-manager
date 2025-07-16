<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Task\StoreTaskRequest;
use App\Http\Requests\Api\Task\UpdateTaskRequest;
use App\Http\Resources\ApiResponse;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\User;
use App\Services\ProjectService;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(
        private TaskService $taskService,
        private ProjectService $projectService
    ) {}

    public function index(Project $project, Request $request): JsonResponse
    {
        if (!$this->projectService->canUserAccessProject($request->user(), $project)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $tasks = $this->taskService->getProjectTasks($project);
        
        return response()->json(
            ApiResponse::success($tasks, 'Задачи успешно загружены')
        );
    }

    public function store(StoreTaskRequest $request, Project $project): JsonResponse
    {
        if (!$this->projectService->canUserManageProject($request->user(), $project)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $task = $this->taskService->createTask($request->validated(), $project, $request->user());
        
        return response()->json(
            ApiResponse::success($task, 'Задача успешно создана'),
            201
        );
    }

    public function show(Project $project, Task $task, Request $request): JsonResponse
    {
        if (!$this->taskService->canUserViewTask($request->user(), $task)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $task->load(['assignee', 'reporter', 'status', 'sprint', 'comments.user']);
        
        return response()->json(
            ApiResponse::success($task, 'Задача успешно загружена')
        );
    }

    public function update(UpdateTaskRequest $request, Project $project, Task $task): JsonResponse
    {
        if (!$this->taskService->canUserManageTask($request->user(), $task)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $task = $this->taskService->updateTask($task, $request->validated());
        
        return response()->json(
            ApiResponse::success($task, 'Задача успешно обновлена')
        );
    }

    public function destroy(Project $project, Task $task, Request $request): JsonResponse
    {
        if (!$this->taskService->canUserManageTask($request->user(), $task)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $this->taskService->deleteTask($task);
        
        return response()->json(
            ApiResponse::success(null, 'Задача успешно удалена')
        );
    }

    public function updateStatus(Request $request, Task $task): JsonResponse
    {
        if (!$this->taskService->canUserManageTask($request->user(), $task)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $request->validate([
            'status_id' => 'required|exists:task_statuses,id',
        ]);

        $status = TaskStatus::findOrFail($request->status_id);
        $task = $this->taskService->updateTaskStatus($task, $status);
        
        return response()->json(
            ApiResponse::success($task, 'Статус задачи успешно обновлен')
        );
    }

    public function assign(Request $request, Task $task): JsonResponse
    {
        if (!$this->taskService->canUserManageTask($request->user(), $task)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $request->validate([
            'assignee_id' => 'required|exists:users,id',
        ]);

        $assignee = User::findOrFail($request->assignee_id);
        $task = $this->taskService->assignTask($task, $assignee);
        
        return response()->json(
            ApiResponse::success($task, 'Исполнитель задачи успешно назначен')
        );
    }

    public function board(Project $project, Request $request): JsonResponse
    {
        if (!$this->projectService->canUserAccessProject($request->user(), $project)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $board = $this->taskService->getProjectBoard($project);
        
        return response()->json(
            ApiResponse::success($board, 'Доска проекта успешно загружена')
        );
    }
} 