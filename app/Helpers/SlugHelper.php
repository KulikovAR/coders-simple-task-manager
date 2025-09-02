<?php declare(strict_types=1);

namespace App\Helpers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SlugHelper
{
    /**
     * Генерирует slug из строки
     */
    public static function generate(string $text): string
    {
        $text = TranslitHelper::translit($text);

        $text = strtolower($text);

        $text = preg_replace('/[^a-z0-9]+/', '-', $text);

        $text = trim($text, '-');

        $text = Str::limit($text, 100, '');

        return $text;
    }

    /**
     * Генерирует уникальный slug для проекта
     */
    public static function generateUniqueSlug(string $text, Model $model, int $excludeId = null): string
    {
        $baseSlug = self::generate($text);
        $slug = $baseSlug;
        $counter = 1;

        while (true) {
            $query = $model::where('slug', $slug);

            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }

            if (!$query->exists()) {
                break;
            }

            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
