<?php

namespace App\Services\Ai\Commands;

use App\Services\Ai\Contracts\CommandInterface;
use App\Models\User;

abstract class AbstractCommand implements CommandInterface
{
    /**
     * Проверить права доступа по умолчанию
     */
    public function canExecute($user, array $parameters = []): bool
    {
        return $user instanceof User;
    }

    /**
     * Валидировать параметры команды
     */
    protected function validateParameters(array $parameters, array $required = []): void
    {
        foreach ($required as $field) {
            if (!isset($parameters[$field])) {
                throw new \InvalidArgumentException("Параметр '{$field}' обязателен для команды {$this->getName()}");
            }
        }
    }

    /**
     * Форматировать ответ с ссылками
     */
    protected function formatResponse(array $data, string $message = null): array
    {
        return [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'links' => $this->generateLinks($data),
        ];
    }

    /**
     * Генерировать ссылки для объектов
     */
    protected function generateLinks(array $data): array
    {
        $links = [];

        if (isset($data['project'])) {
            $links['project'] = route('projects.show', $data['project']['id']);
            $links['project_board'] = route('projects.board', $data['project']['id']);
        }

        if (isset($data['task'])) {
            $links['task'] = route('tasks.show', $data['task']['id']);
        }

        if (isset($data['sprint'])) {
            $links['sprint'] = route('sprints.show', [$data['sprint']['project_id'], $data['sprint']['id']]);
        }

        return $links;
    }

    /**
     * Обработать ошибку
     */
    protected function handleError(\Exception $e): array
    {
        return [
            'success' => false,
            'message' => $e->getMessage(),
            'data' => [],
            'links' => [],
        ];
    }
} 