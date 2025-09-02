<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Webhook extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'user_id',
        'name',
        'url',
        'secret',
        'events',
        'is_active',
        'description',
        'headers',
        'retry_count',
        'timeout',
    ];

    protected $casts = [
        'events' => 'array',
        'is_active' => 'boolean',
        'headers' => 'array',
        'retry_count' => 'integer',
        'timeout' => 'integer',
    ];

    // События, которые можно отслеживать
    public const EVENTS = [
        'task.created' => 'Задача создана',
        'task.updated' => 'Задача обновлена',
        'task.assigned' => 'Задача назначена',
        'task.completed' => 'Задача завершена',
        'task.deleted' => 'Задача удалена',
        'project.created' => 'Проект создан',
        'project.updated' => 'Проект обновлен',
        'sprint.created' => 'Спринт создан',
        'sprint.updated' => 'Спринт обновлен',
        'comment.created' => 'Комментарий создан',
        'user.joined' => 'Пользователь присоединился',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(WebhookLog::class);
    }

    /**
     * Проверить, отслеживает ли webhook определенное событие
     */
    public function listensTo(string $event): bool
    {
        return in_array($event, $this->events ?? []);
    }

    /**
     * Получить человекочитаемые названия событий
     */
    public function getEventNamesAttribute(): array
    {
        return array_map(
            fn($event) => self::EVENTS[$event] ?? $event,
            $this->events ?? []
        );
    }

    /**
     * Генерировать секретный ключ для webhook
     */
    public static function generateSecret(): string
    {
        return 'whsec_' . bin2hex(random_bytes(32));
    }
}
