<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TaskDependency extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'depends_on_task_id',
        'type',
        'lag_days'
    ];

    protected $casts = [
        'lag_days' => 'integer',
    ];

    // Типы зависимостей
    const TYPE_FINISH_TO_START = 'finish_to_start';
    const TYPE_START_TO_START = 'start_to_start';
    const TYPE_FINISH_TO_FINISH = 'finish_to_finish';
    const TYPE_START_TO_FINISH = 'start_to_finish';

    /**
     * Задача, которая зависит от другой
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Задача, от которой зависит текущая
     */
    public function dependsOnTask(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'depends_on_task_id');
    }

    /**
     * Получить название типа зависимости на русском
     */
    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            self::TYPE_FINISH_TO_START => 'Окончание → Начало',
            self::TYPE_START_TO_START => 'Начало → Начало',
            self::TYPE_FINISH_TO_FINISH => 'Окончание → Окончание',
            self::TYPE_START_TO_FINISH => 'Начало → Окончание',
            default => $this->type
        };
    }
}
