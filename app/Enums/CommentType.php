<?php

namespace App\Enums;

enum CommentType: string
{
    case GENERAL = 'general';
    case TESTING_FEEDBACK = 'testing_feedback';
    case REVIEW_COMMENT = 'review_comment';
    case BUG_REPORT = 'bug_report';
    case FEATURE_REQUEST = 'feature_request';

    public function getLabel(): string
    {
        return match ($this) {
            self::GENERAL => 'Общий комментарий',
            self::TESTING_FEEDBACK => 'Отзыв тестирования',
            self::REVIEW_COMMENT => 'Комментарий ревью',
            self::BUG_REPORT => 'Отчет об ошибке',
            self::FEATURE_REQUEST => 'Запрос функции',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::GENERAL => '#6B7280',
            self::TESTING_FEEDBACK => '#8B5CF6',
            self::REVIEW_COMMENT => '#F59E0B',
            self::BUG_REPORT => '#EF4444',
            self::FEATURE_REQUEST => '#10B981',
        };
    }

    public function getIcon(): string
    {
        return match ($this) {
            self::GENERAL => '💬',
            self::TESTING_FEEDBACK => '🧪',
            self::REVIEW_COMMENT => '👁️',
            self::BUG_REPORT => '🐛',
            self::FEATURE_REQUEST => '💡',
        };
    }

    public function isSpecial(): bool
    {
        return match ($this) {
            self::TESTING_FEEDBACK => true,
            default => false,
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
