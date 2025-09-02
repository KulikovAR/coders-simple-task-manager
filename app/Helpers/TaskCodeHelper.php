<?php declare(strict_types=1);

namespace App\Helpers;

use App\Models\Task;
use App\Models\Project;

class TaskCodeHelper
{
    /**
     * Генерирует следующий internal_id для задачи в проекте
     */
    public static function getNextInternalId(int $projectId): int
    {
        $maxInternalId = Task::where('project_id', $projectId)
            ->max('internal_id');
        
        return ($maxInternalId ?? 0) + 1;
    }

    /**
     * Генерирует код задачи
     */
    public static function generateTaskCode(string $projectSlug, int $internalId): string
    {
        return $projectSlug . '-' . $internalId;
    }

    /**
     * Парсит код задачи и возвращает slug проекта и internal_id
     */
    public static function parseTaskCode(string $code): ?array
    {
        $parts = explode('-', $code);
        if (count($parts) < 2) {
            return null;
        }

        $internalId = (int) end($parts);
        $projectSlug = implode('-', array_slice($parts, 0, -1));

        if ($internalId <= 0 || empty($projectSlug)) {
            return null;
        }

        return [
            'project_slug' => $projectSlug,
            'internal_id' => $internalId
        ];
    }

    /**
     * Находит задачу по коду
     */
    public static function findTaskByCode(string $code): ?Task
    {
        $parsed = self::parseTaskCode($code);
        if (!$parsed) {
            return null;
        }

        $project = Project::where('slug', $parsed['project_slug'])->first();
        if (!$project) {
            return null;
        }

        return Task::where('project_id', $project->id)
            ->where('internal_id', $parsed['internal_id'])
            ->first();
    }

    /**
     * Проверяет, является ли строка валидным кодом задачи
     */
    public static function isValidTaskCode(string $code): bool
    {
        return self::parseTaskCode($code) !== null;
    }
}
