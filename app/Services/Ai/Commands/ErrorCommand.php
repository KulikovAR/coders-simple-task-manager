<?php

namespace App\Services\Ai\Commands;

class ErrorCommand extends AbstractCommand
{
    public function getName(): string
    {
        return 'ERROR';
    }

    public function getDescription(): string
    {
        return 'Обработать ошибку доступа или другую ошибку';
    }

    public function getParametersSchema(): array
    {
        return [
            'error' => ['type' => 'string', 'required' => true, 'description' => 'Сообщение об ошибке'],
            'action' => ['type' => 'string', 'required' => false, 'description' => 'Действие, которое не удалось выполнить'],
        ];
    }

    public function execute(array $parameters, $user): array
    {
        $errorMessage = $parameters['error'] ?? 'Произошла ошибка';
        $action = $parameters['action'] ?? 'выполнить действие';

        return [
            'success' => false,
            'message' => $errorMessage,
            'data' => [
                'action' => $action,
                'user_id' => $user->id,
            ],
            'links' => [],
        ];
    }

    public function canExecute($user, array $parameters = []): bool
    {
        return true; // Команда ошибки всегда доступна
    }
} 