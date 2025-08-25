<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskChecklist extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'title',
        'is_completed',
        'sort_order'
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Задача, к которой принадлежит чек-лист
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Автоматически устанавливаем порядок при создании
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($checklist) {
            if (is_null($checklist->sort_order)) {
                $maxOrder = static::where('task_id', $checklist->task_id)->max('sort_order');
                $checklist->sort_order = ($maxOrder ?? 0) + 1;
            }
        });
    }
}
