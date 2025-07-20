<?php

namespace App\Services\Ai\Contracts;

interface CommandInterface
{
    /**
     * Получить название команды
     */
    public function getName(): string;

    /**
     * Получить описание команды
     */
    public function getDescription(): string;

    /**
     * Получить схему параметров команды
     */
    public function getParametersSchema(): array;

    /**
     * Выполнить команду
     */
    public function execute(array $parameters, $user): array;

    /**
     * Проверить права доступа для выполнения команды
     */
    public function canExecute($user, array $parameters = []): bool;
} 