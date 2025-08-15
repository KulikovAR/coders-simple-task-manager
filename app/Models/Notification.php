<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'user_id',
        'from_user_id',
        'notifiable_type',
        'notifiable_id',
        'data',
        'read',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read' => 'boolean',
        'read_at' => 'datetime',
    ];

    // Типы уведомлений
    const TYPE_TASK_ASSIGNED = 'task_assigned';
    const TYPE_TASK_MOVED = 'task_moved';
    const TYPE_TASK_CREATED = 'task_created';
    const TYPE_TASK_UPDATED = 'task_updated';
    const TYPE_TASK_PRIORITY_CHANGED = 'task_priority_changed';
    const TYPE_COMMENT_ADDED = 'comment_added';
    const TYPE_USER_MENTIONED = 'user_mentioned';
    const TYPE_SPRINT_STARTED = 'sprint_started';
    const TYPE_SPRINT_ENDED = 'sprint_ended';
    const TYPE_PROJECT_INVITED = 'project_invited';
    const TYPE_DEADLINE_APPROACHING = 'deadline_approaching';
    const TYPE_DEADLINE_OVERDUE = 'deadline_overdue';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fromUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }

    // Пометить как прочитанное
    public function markAsRead(): void
    {
        $this->update([
            'read' => true,
            'read_at' => now(),
        ]);
    }

    // Пометить как непрочитанное
    public function markAsUnread(): void
    {
        $this->update([
            'read' => false,
            'read_at' => null,
        ]);
    }

    // Проверить, прочитано ли уведомление
    public function isRead(): bool
    {
        return $this->read;
    }

    // Получить текст уведомления
    public function getMessage(): string
    {
        $messages = [
            self::TYPE_TASK_ASSIGNED => 'Вам назначена задача: :task_title',
            self::TYPE_TASK_MOVED => 'Задача ":task_title" перемещена в статус ":status"',
            self::TYPE_TASK_CREATED => 'Создана новая задача: :task_title',
            self::TYPE_TASK_UPDATED => 'Задача ":task_title" обновлена',
            self::TYPE_TASK_PRIORITY_CHANGED => 'Приоритет задачи ":task_title" изменен на ":priority"',
            self::TYPE_COMMENT_ADDED => 'Добавлен комментарий к задаче ":task_title"',
            self::TYPE_USER_MENTIONED => 'Вас упомянули в комментарии к задаче ":task_title"',
            self::TYPE_SPRINT_STARTED => 'Спринт ":sprint_name" начался',
            self::TYPE_SPRINT_ENDED => 'Спринт ":sprint_name" завершён',
            self::TYPE_PROJECT_INVITED => 'Вас пригласили в проект ":project_name"',
            self::TYPE_DEADLINE_APPROACHING => 'Дедлайн задачи ":task_title" приближается',
            self::TYPE_DEADLINE_OVERDUE => 'Дедлайн задачи ":task_title" просрочен',
        ];

        $message = $messages[$this->type] ?? 'Новое уведомление';
        
        // Заменяем плейсхолдеры данными
        if ($this->data) {
            foreach ($this->data as $key => $value) {
                $message = str_replace(":$key", $value, $message);
            }
        }

        return $message;
    }

    // Получить иконку для типа уведомления
    public function getIcon(): string
    {
        $icons = [
            self::TYPE_TASK_ASSIGNED => '🎯',
            self::TYPE_TASK_MOVED => '🔄',
            self::TYPE_TASK_CREATED => '➕',
            self::TYPE_TASK_UPDATED => '✏️',
            self::TYPE_COMMENT_ADDED => '💬',
            self::TYPE_USER_MENTIONED => '👋',
            self::TYPE_SPRINT_STARTED => '🏃',
            self::TYPE_SPRINT_ENDED => '🏁',
            self::TYPE_PROJECT_INVITED => '👥',
            self::TYPE_DEADLINE_APPROACHING => '⏰',
            self::TYPE_DEADLINE_OVERDUE => '🚨',
        ];

        return $icons[$this->type] ?? '🔔';
    }

    // Получить цвет для типа уведомления
    public function getColor(): string
    {
        $colors = [
            self::TYPE_TASK_ASSIGNED => 'text-blue-500',
            self::TYPE_TASK_MOVED => 'text-green-500',
            self::TYPE_TASK_CREATED => 'text-purple-500',
            self::TYPE_TASK_UPDATED => 'text-yellow-500',
            self::TYPE_COMMENT_ADDED => 'text-indigo-500',
            self::TYPE_USER_MENTIONED => 'text-purple-500',
            self::TYPE_SPRINT_STARTED => 'text-green-500',
            self::TYPE_SPRINT_ENDED => 'text-red-500',
            self::TYPE_PROJECT_INVITED => 'text-blue-500',
            self::TYPE_DEADLINE_APPROACHING => 'text-orange-500',
            self::TYPE_DEADLINE_OVERDUE => 'text-red-500',
        ];

        return $colors[$this->type] ?? 'text-gray-500';
    }
}
