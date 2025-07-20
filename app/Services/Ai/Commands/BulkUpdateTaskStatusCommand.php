<?php

namespace App\Services\Ai\Commands;

use App\Services\TaskService;
use App\Services\ProjectService;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\Project;
use App\Models\User;

class BulkUpdateTaskStatusCommand extends AbstractCommand
{
    private TaskService $taskService;
    private ProjectService $projectService;

    public function __construct(TaskService $taskService, ProjectService $projectService)
    {
                    $this->taskService = $taskService;
            $this->projectService = $projectService;
    }

    public function getName(): string
    {
        return 'BULK_UPDATE_TASK_STATUS';
    }

    public function getDescription(): string
    {
        return 'Массово обновить статус задач по фильтрам';
    }

    public function getParametersSchema(): array
    {
        return [
            'project_name' => ['type' => 'string', 'required' => false, 'description' => 'Название проекта'],
            'project_id' => ['type' => 'integer', 'required' => false, 'description' => 'ID проекта'],
            'current_status' => ['type' => 'string', 'required' => false, 'description' => 'Текущий статус задач для обновления'],
            'new_status' => ['type' => 'string', 'required' => true, 'description' => 'Новый статус'],
            'assignee_id' => ['type' => 'integer', 'required' => false, 'description' => 'ID исполнителя'],
            'my_tasks' => ['type' => 'boolean', 'required' => false, 'description' => 'Только мои задачи'],
        ];
    }

    public function execute(array $parameters, $user): array
    {
        try {
            $this->validateParameters($parameters, ['new_status']);

            // Находим проект
            $project = null;
            if (isset($parameters['project_name'])) {
                $project = Project::where('name', $parameters['project_name'])->first();
                if (!$project) {
                    throw new \Exception("Проект '{$parameters['project_name']}' не найден");
                }
            } elseif (isset($parameters['project_id'])) {
                $project = Project::find($parameters['project_id']);
                if (!$project) {
                    throw new \Exception("Проект с ID {$parameters['project_id']} не найден");
                }
            }

            // Проверяем права доступа к проекту
            if ($project && !$this->projectService->canUserAccessProject($user, $project)) {
                throw new \Exception('У вас нет прав для доступа к этому проекту');
            }

            // Находим новый статус
            $newStatus = null;
            if ($project) {
                $newStatus = $project->taskStatuses()->where('name', $parameters['new_status'])->first();
            } else {
                // Если проект не указан, ищем статус среди всех проектов пользователя
                $userProjects = $this->projectService->getUserProjects($user);
                foreach ($userProjects as $userProject) {
                    $status = $userProject->taskStatuses()->where('name', $parameters['new_status'])->first();
                    if ($status) {
                        $newStatus = $status;
                        break;
                    }
                }
            }

            if (!$newStatus) {
                throw new \Exception("Статус '{$parameters['new_status']}' не найден");
            }

            // Строим запрос для поиска задач
            $query = Task::with(['project', 'status', 'assignee']);

            if ($project) {
                $query->where('project_id', $project->id);
            } else {
                // Только задачи из проектов пользователя
                $userProjectIds = $this->projectService->getUserProjects($user)->pluck('id');
                $query->whereIn('project_id', $userProjectIds);
            }

            // Фильтр по текущему статусу
            if (isset($parameters['current_status'])) {
                $query->whereHas('status', function ($q) use ($parameters) {
                    $q->where('name', $parameters['current_status']);
                });
            }

            // Фильтр по исполнителю
            if (isset($parameters['assignee_id'])) {
                $query->where('assignee_id', $parameters['assignee_id']);
            }

            // Фильтр по моим задачам
            if (isset($parameters['my_tasks']) && $parameters['my_tasks']) {
                $query->where('assignee_id', $user->id);
            }

            $tasks = $query->get();

            if ($tasks->isEmpty()) {
                return $this->formatResponse(
                    [],
                    "Задачи для обновления не найдены"
                );
            }

            // Обновляем статус для каждой задачи
            $updatedTasks = [];
            $errors = [];

            foreach ($tasks as $task) {
                try {
                    if (!$this->taskService->canUserManageTask($user, $task)) {
                        $errors[] = "Нет прав для изменения задачи '{$task->title}'";
                        continue;
                    }

                    $updatedTask = $this->taskService->updateTaskStatus($task, $newStatus);
                    $updatedTasks[] = $updatedTask;
                } catch (\Exception $e) {
                    $errors[] = "Ошибка обновления задачи '{$task->title}': " . $e->getMessage();
                }
            }

            // Формируем ответ
            $message = "Обновлено задач: " . count($updatedTasks);
            if (!empty($errors)) {
                $message .= ". Ошибки: " . implode(', ', $errors);
            }

            $links = [];
            if ($project) {
                $links['project'] = route('projects.show', $project);
                $links['project_board'] = route('projects.board', $project);
            }

            return $this->formatResponse(
                [
                    'updated_tasks' => $updatedTasks,
                    'errors' => $errors,
                    'total_updated' => count($updatedTasks),
                    'total_errors' => count($errors),
                ],
                $message,
                $links
            );

        } catch (\Exception $e) {
            return $this->handleError($e);
        }
    }

    public function canExecute($user, array $parameters = []): bool
    {
        if (!parent::canExecute($user, $parameters)) {
            return false;
        }

        // Проверяем права доступа к проекту, если указан
        if (isset($parameters['project_id'])) {
            $project = Project::find($parameters['project_id']);
            return $project && $this->projectService->canUserAccessProject($user, $project);
        }

        if (isset($parameters['project_name'])) {
            $project = Project::where('name', $parameters['project_name'])->first();
            return $project && $this->projectService->canUserAccessProject($user, $project);
        }

        return true;
    }
} 