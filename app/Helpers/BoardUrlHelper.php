<?php

namespace App\Helpers;

use App\Models\Task;

class BoardUrlHelper
{
    /**
     * Формирует URL для доски проекта с фильтрацией по спринту
     *
     * @param int $projectId ID проекта
     * @param int|null $sprintId ID спринта (опционально)
     * @return string
     */
    public static function getBoardUrl(int $projectId, ?int $sprintId = null): string
    {
        $url = route('projects.board', $projectId);

        if ($sprintId) {
            $url .= '?sprint_id=' . $sprintId;
        }

        return $url;
    }

    /**
     * Формирует URL для доски проекта на основе задачи
     *
     * @param Task $task
     * @return string|null
     */
    public static function getBoardUrlFromTask($task): ?string
    {
        if (!$task->project_id) {
            return null;
        }

        return self::getBoardUrl($task->project_id, $task->sprint_id);
    }
}
