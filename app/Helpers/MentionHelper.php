<?php

namespace App\Helpers;

use App\Models\User;
use Illuminate\Support\Collection;

class MentionHelper
{
    /**
     * Извлекает упоминания пользователей из текста
     *
     * @param string $text
     * @return array
     */
    public static function extractMentions(string $text): array
    {
        $pattern = '/@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/';
        preg_match_all($pattern, $text, $matches);

        return array_unique($matches[1] ?? []);
    }

    /**
     * Получает пользователей по email из упоминаний
     *
     * @param array $emails
     * @param Collection|null $projectUsers - ограничение по пользователям проекта
     * @return Collection
     */
    public static function getUsersByEmails(array $emails, ?Collection $projectUsers = null): Collection
    {
        $users = User::whereIn('email', $emails)->get();

        if (!$projectUsers->isEmpty()) {
            $projectUserIds = $projectUsers->pluck('id')->toArray();
            $users = $users->filter(function ($user) use ($projectUserIds) {
                return in_array($user->id, $projectUserIds);
            });
        }

        return $users;
    }

    /**
     * Получает пользователей, упомянутых в тексте
     *
     * @param string $text
     * @param Collection|null $projectUsers
     * @return Collection
     */
    public static function getMentionedUsers(string $text, ?Collection $projectUsers = null): Collection
    {
        $emails = self::extractMentions($text);

        if (empty($emails)) {
            return collect();
        }

        return self::getUsersByEmails($emails, $projectUsers);
    }

    /**
     * Заменяет упоминания в тексте на отформатированный вид для хранения
     *
     * @param string $text
     * @return string
     */
    public static function formatMentions(string $text): string
    {
        // Пока просто возвращаем текст как есть
        // В будущем можно добавить дополнительное форматирование
        return $text;
    }
}
