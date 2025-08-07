<?php

namespace App\Helpers;

class TaskStatusHelper
{
    /**
     * Маппинг статусов для устранения дублирования
     */
    public static function getStatusMapping(): array
    {
        return [
            'To Do' => 'К выполнению',
            'In Progress' => 'В работе', 
            'Review' => 'На проверке',
            'Testing' => 'Тестирование',
            'Ready for Release' => 'Готов к релизу',
            'Done' => 'Завершена',
        ];
    }

    /**
     * Получить русское название статуса
     */
    public static function getRussianName(string $englishName): string
    {
        $mapping = self::getStatusMapping();
        return $mapping[$englishName] ?? $englishName;
    }

    /**
     * Получить английское название статуса
     */
    public static function getEnglishName(string $russianName): string
    {
        $mapping = array_flip(self::getStatusMapping());
        return $mapping[$russianName] ?? $russianName;
    }

    /**
     * Нормализовать название статуса (привести к русскому)
     */
    public static function normalizeStatusName(string $statusName): string
    {
        return self::getRussianName($statusName);
    }
} 