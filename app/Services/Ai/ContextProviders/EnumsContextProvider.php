<?php

namespace App\Services\Ai\ContextProviders;

use App\Services\Ai\Contracts\ContextProviderInterface;
use App\Models\User;
use App\Enums\TaskStatusType;
use App\Enums\CommentType;

class EnumsContextProvider implements ContextProviderInterface
{
    public function getName(): string
    {
        return 'enums';
    }

    public function getContext($user): array
    {
        return [
            'task_statuses' => $this->getTaskStatuses(),
            'comment_types' => $this->getCommentTypes(),
        ];
    }

    private function getTaskStatuses(): array
    {
        $statuses = [];
        
        foreach (TaskStatusType::cases() as $status) {
            $statuses[] = [
                'name' => $status->value,
                'key' => $status->name,
                'order' => $status->getOrder(),
                'color' => $status->getColor(),
                'description' => $this->getStatusDescription($status),
            ];
        }
        
        return $statuses;
    }

    private function getCommentTypes(): array
    {
        $types = [];
        
        foreach (CommentType::cases() as $type) {
            $types[] = [
                'name' => $type->value,
                'key' => $type->name,
                'label' => $type->getLabel(),
                'color' => $type->getColor(),
                'icon' => $type->getIcon(),
                'is_special' => $type->isSpecial(),
            ];
        }
        
        return $types;
    }

    private function getStatusDescription(TaskStatusType $status): string
    {
        return match($status) {
            TaskStatusType::TODO => 'Задачи, которые нужно выполнить',
            TaskStatusType::IN_PROGRESS => 'Задачи, которые выполняются в данный момент',
            TaskStatusType::REVIEW => 'Задачи, которые проходят проверку/ревью',
            TaskStatusType::TESTING => 'Задачи, которые проходят тестирование',
            TaskStatusType::READY_FOR_RELEASE => 'Задачи, готовые к выпуску',
            TaskStatusType::DONE => 'Завершенные задачи',
        };
    }
} 