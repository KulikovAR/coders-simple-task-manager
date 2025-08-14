<?php

namespace App\Services\Ai\ContextProviders;

use App\Services\Ai\Contracts\ContextProviderInterface;
use App\Services\TaskStatusService;
use App\Models\User;
use App\Models\Project;
use Illuminate\Support\Facades\Cache;

class DynamicStatusContextProvider implements ContextProviderInterface
{
    private TaskStatusService $taskStatusService;

    public function __construct(TaskStatusService $taskStatusService)
    {
        $this->taskStatusService = $taskStatusService;
    }

    public function getName(): string
    {
        return 'dynamic_statuses';
    }

    public function getContext($user): array
    {
        if (!$user instanceof User) {
            return [];
        }

        // Кэшируем статусы на 5 минут
        $cacheKey = "dynamic_statuses_user_{$user->id}";

        return Cache::remember($cacheKey, 300, function () use ($user) {
            $context = [
                'project_statuses' => [],
                'available_status_names' => [],
                'status_mapping' => [],
            ];

            // Получаем все проекты пользователя
            $projects = Project::where('owner_id', $user->id)
                ->orWhereHas('members', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->with(['taskStatuses' => function($query) {
                    $query->whereNull('sprint_id')->orderBy('order');
                }])
                ->get();

            foreach ($projects as $project) {
                $statuses = $this->taskStatusService->getProjectStatuses($project);

                $projectStatuses = $statuses->map(function ($status) {
                    return [
                        'id' => $status->id,
                        'name' => $status->name,
                        'order' => $status->order,
                        'color' => $status->color,
                        'is_custom' => $status->is_custom,
                    ];
                })->toArray();

                $context['project_statuses'][$project->name] = $projectStatuses;

                // Собираем все уникальные названия статусов
                foreach ($statuses as $status) {
                    if (!in_array($status->name, $context['available_status_names'])) {
                        $context['available_status_names'][] = $status->name;

                        // Добавляем в маппинг (название -> описание статуса)
                        $context['status_mapping'][$status->name] = $this->getStatusDescription($status->name);
                    }
                }
            }

            return $context;
        });
    }

    /**
     * Получить описание статуса на основе его названия
     */
    private function getStatusDescription(string $statusName): string
    {
        $descriptions = [
            'К выполнению' => 'Задачи, которые нужно выполнить',
            'В работе' => 'Задачи, которые выполняются в данный момент',
            'На проверке' => 'Задачи, которые проходят проверку/ревью',
            'Тестирование' => 'Задачи, которые проходят тестирование',
            'Готова к релизу' => 'Задачи, готовые к выпуску',
            'Завершена' => 'Завершенные задачи',
        ];

        return $descriptions[$statusName] ?? "Пользовательский статус: {$statusName}";
    }
}
