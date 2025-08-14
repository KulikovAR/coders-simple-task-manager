<?php

namespace App\Enums;

enum TaskStatusType: string
{
    case TODO = 'К выполнению';
    case IN_PROGRESS = 'В работе';
    case REVIEW = 'На проверке';
    case TESTING = 'Тестирование';
    case READY_FOR_RELEASE = 'Готов к релизу';
    case DONE = 'Завершена';

    public function getOrder(): int
    {
        return match($this) {
            self::TODO => 1,
            self::IN_PROGRESS => 2,
            self::REVIEW => 3,
            self::TESTING => 4,
            self::READY_FOR_RELEASE => 5,
            self::DONE => 6,
        };
    }

    public function getColor(): string
    {
        return match($this) {
            self::TODO => '#6B7280',
            self::IN_PROGRESS => '#3B82F6',
            self::REVIEW => '#F59E0B',
            self::TESTING => '#8B5CF6',
            self::READY_FOR_RELEASE => '#EC4899',
            self::DONE => '#10B981',
        };
    }

    public static function getDefaultStatuses(): array
    {
        return [
            [
                'name' => self::TODO->value,
                'order' => self::TODO->getOrder(),
                'color' => self::TODO->getColor(),
            ],
            [
                'name' => self::IN_PROGRESS->value,
                'order' => self::IN_PROGRESS->getOrder(),
                'color' => self::IN_PROGRESS->getColor(),
            ],
            [
                'name' => self::REVIEW->value,
                'order' => self::REVIEW->getOrder(),
                'color' => self::REVIEW->getColor(),
            ],
            [
                'name' => self::TESTING->value,
                'order' => self::TESTING->getOrder(),
                'color' => self::TESTING->getColor(),
            ],
            [
                'name' => self::READY_FOR_RELEASE->value,
                'order' => self::READY_FOR_RELEASE->getOrder(),
                'color' => self::READY_FOR_RELEASE->getColor(),
            ],
            [
                'name' => self::DONE->value,
                'order' => self::DONE->getOrder(),
                'color' => self::DONE->getColor(),
            ],
        ];
    }
} 