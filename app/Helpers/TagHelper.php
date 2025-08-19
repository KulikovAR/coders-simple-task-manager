<?php

namespace App\Helpers;

class TagHelper
{
    /**
     * Нормализует строку тегов в массив уникальных тегов
     *
     * @param string|null $tagsString
     * @return array|null
     */
    public static function normalize(?string $tagsString): ?array
    {
        if (empty($tagsString)) {
            return null;
        }

        // Разбиваем строку на теги, удаляем пробелы и пустые значения
        $tags = array_filter(array_map('trim', explode(' ', $tagsString)));

        // Приводим к нижнему регистру и удаляем дубликаты
        $tags = array_unique(array_map('mb_strtolower', $tags));

        // Сортируем теги для консистентности
        sort($tags);

        return !empty($tags) ? array_values($tags) : null;
    }

    /**
     * Проверяет, содержит ли массив тегов все искомые теги
     *
     * @param array|null $haystack
     * @param array|null $needles
     * @return bool
     */
    public static function containsAll(?array $haystack, ?array $needles): bool
    {
        if (empty($needles)) {
            return true;
        }

        if (empty($haystack)) {
            return false;
        }

        $haystack = array_map('mb_strtolower', $haystack);
        $needles = array_map('mb_strtolower', $needles);

        foreach ($needles as $needle) {
            if (!in_array($needle, $haystack)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Преобразует массив тегов в строку
     *
     * @param array|null $tags
     * @return string|null
     */
    public static function toString(?array $tags): ?string
    {
        if (empty($tags)) {
            return null;
        }

        return implode(' ', $tags);
    }

    /**
     * Валидирует теги
     *
     * @param array|null $tags
     * @return bool
     */
    public static function validate(?array $tags): bool
    {
        if (empty($tags)) {
            return true;
        }

        foreach ($tags as $tag) {
            // Проверяем длину тега (от 2 до 50 символов)
            if (mb_strlen($tag) < 2 || mb_strlen($tag) > 50) {
                return false;
            }

            // Проверяем, что тег содержит только разрешенные символы
            if (!preg_match('/^[a-zа-яё0-9\-_]+$/ui', $tag)) {
                return false;
            }
        }

        return true;
    }
}
