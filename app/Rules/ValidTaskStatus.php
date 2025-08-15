<?php

namespace App\Rules;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\TaskStatus;
use App\Services\TaskStatusService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidTaskStatus implements ValidationRule
{
    private ?Project $project = null;
    private ?Sprint $sprint = null;
    private TaskStatusService $taskStatusService;

    public function __construct(?Project $project = null, ?Sprint $sprint = null)
    {
        $this->project = $project;
        $this->sprint = $sprint;
        $this->taskStatusService = app(TaskStatusService::class);
    }

    /**
     * Установить контекст проекта
     */
    public function forProject(Project $project): self
    {
        $this->project = $project;
        return $this;
    }

    /**
     * Установить контекст спринта
     */
    public function forSprint(Sprint $sprint): self
    {
        $this->sprint = $sprint;
        $this->project = $sprint->project;
        return $this;
    }

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Если нет проекта для проверки, пропускаем валидацию
        if (!$this->project) {
            return;
        }

        // Получаем статус
        $status = TaskStatus::find($value);
        if (!$status) {
            $fail('Выбранный статус не существует.');
            return;
        }

        // Проверяем соответствие статуса контексту
        if (!$this->taskStatusService->isStatusValidForContext($status, $this->project, $this->sprint)) {
            $contextName = $this->sprint 
                ? "спринта \"{$this->sprint->name}\"" 
                : "проекта \"{$this->project->name}\"";
                
            $fail("Статус \"{$status->name}\" не доступен для {$contextName}.");
        }
    }

    /**
     * Получить доступные статусы для контекста
     */
    public function getAvailableStatuses(): array
    {
        if (!$this->project) {
            return [];
        }

        $statuses = $this->taskStatusService->getContextualStatuses($this->project, $this->sprint);
        
        return $statuses->map(function ($status) {
            return [
                'id' => $status->id,
                'name' => $status->name,
                'color' => $status->color,
                'order' => $status->order,
                'is_custom' => $status->is_custom,
                'sprint_id' => $status->sprint_id,
            ];
        })->toArray();
    }
}