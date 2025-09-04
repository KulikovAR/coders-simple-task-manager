<?php

namespace App\Services\Ai\Commands;

use App\Services\SprintService;
use App\Services\ProjectService;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\User;

class UpdateSprintCommand extends AbstractCommand
{
    private SprintService $sprintService;
    private ProjectService $projectService;

    public function __construct(SprintService $sprintService, ProjectService $projectService)
    {
        $this->sprintService = $sprintService;
        $this->projectService = $projectService;
    }

    public function getName(): string
    {
        return 'UPDATE_SPRINT';
    }

    public function getDescription(): string
    {
        return 'Обновить существующий спринт';
    }

    public function getParametersSchema(): array
    {
        return [
            'sprint_id' => ['type' => 'integer', 'required' => true, 'description' => 'ID спринта'],
            'name' => ['type' => 'string', 'required' => false, 'description' => 'Новое название спринта'],
            'description' => ['type' => 'string', 'required' => false, 'description' => 'Новое описание спринта'],
            'start_date' => ['type' => 'string', 'required' => false, 'description' => 'Новая дата начала (Y-m-d)'],
            'end_date' => ['type' => 'string', 'required' => false, 'description' => 'Новая дата окончания (Y-m-d)'],
            'status' => ['type' => 'string', 'required' => false, 'description' => 'Новый статус (planned, active, completed)'],
        ];
    }

    public function execute(array $parameters, $user): array
    {
        try {
            $this->validateParameters($parameters, ['sprint_id']);

            // Находим спринт
            $sprint = Sprint::find($parameters['sprint_id']);
            if (!$sprint) {
                return [
                    'success' => false,
                    'message' => 'Спринт не найден',
                ];
            }

            // Проверяем права доступа
            if (!$this->projectService->canUserContributeToProject($user, $sprint->project)) {
                return [
                    'success' => false,
                    'message' => 'Нет прав для редактирования этого спринта',
                ];
            }

            // Подготавливаем данные для обновления
            $updateData = [];
            
            if (isset($parameters['name'])) {
                $updateData['name'] = $parameters['name'];
            }
            
            if (isset($parameters['description'])) {
                $updateData['description'] = $parameters['description'];
            }
            
            if (isset($parameters['start_date'])) {
                $updateData['start_date'] = \Carbon\Carbon::parse($parameters['start_date'])->format('Y-m-d');
            }
            
            if (isset($parameters['end_date'])) {
                $updateData['end_date'] = \Carbon\Carbon::parse($parameters['end_date'])->format('Y-m-d');
            }
            
            if (isset($parameters['status'])) {
                $updateData['status'] = $parameters['status'];
            }

            if (empty($updateData)) {
                return [
                    'success' => false,
                    'message' => 'Не указаны данные для обновления',
                ];
            }

            // Валидируем даты если они указаны
            if (isset($updateData['start_date']) && isset($updateData['end_date'])) {
                $startDate = \Carbon\Carbon::parse($updateData['start_date']);
                $endDate = \Carbon\Carbon::parse($updateData['end_date']);

                if ($endDate->lte($startDate)) {
                    return [
                        'success' => false,
                        'message' => 'Дата окончания должна быть после даты начала',
                    ];
                }
            }

            // Обновляем спринт
            $updatedSprint = $this->sprintService->updateSprint($sprint, $updateData);

            return [
                'success' => true,
                'message' => "Спринт '{$updatedSprint->name}' успешно обновлен",
                'data' => [
                    'sprint_id' => $updatedSprint->id,
                    'sprint_name' => $updatedSprint->name,
                    'project_name' => $updatedSprint->project->name,
                    'start_date' => $updatedSprint->start_date,
                    'end_date' => $updatedSprint->end_date,
                    'status' => $updatedSprint->status,
                    'sprint_url' => route('sprints.show', [$updatedSprint->project, $updatedSprint]),
                ],
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Ошибка при обновлении спринта: ' . $e->getMessage(),
            ];
        }
    }
}
