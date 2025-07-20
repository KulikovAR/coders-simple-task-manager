<?php

namespace App\Services\Ai\Contracts;

interface ContextProviderInterface
{
    /**
     * Получить контекст для пользователя
     */
    public function getContext($user): array;

    /**
     * Получить название провайдера
     */
    public function getName(): string;
} 