<?php

namespace App\Models;

use App\Helpers\TranslitHelper;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $appends = ['code'];

    protected $fillable = [
        'project_id',
        'internal_id',
        'sprint_id',
        'title',
        'description',
        'result',
        'merge_request',
        'assignee_id',
        'reporter_id',
        'priority',
        'status_id',
        'deadline',
        'tags',
        'start_date',
        'duration_days',
        'progress_percent',
        'is_milestone',
        'sort_order'
    ];

    protected $casts = [
        'result' => 'string',
        'merge_request' => 'string',
        'deadline' => 'date',
        'tags' => 'array',
        'start_date' => 'date',
        'duration_days' => 'integer',
        'progress_percent' => 'integer',
        'is_milestone' => 'boolean',
        'sort_order' => 'integer',
        'assignee_id' => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function sprint(): BelongsTo
    {
        return $this->belongsTo(Sprint::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function assignees()
    {
        return $this->belongsToMany(User::class, 'task_assignees')
            ->withTimestamps();
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(TaskStatus::class, 'status_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class)->orderBy('id', 'desc');
    }

    public function checklists(): HasMany
    {
        return $this->hasMany(TaskChecklist::class)->orderBy('sort_order', 'asc');
    }

    public function dependencies(): HasMany
    {
        return $this->hasMany(TaskDependency::class);
    }

    public function dependents(): HasMany
    {
        return $this->hasMany(TaskDependency::class, 'depends_on_task_id');
    }

    public function getCodeAttribute(): string
    {
        $project = $this->project;
        if (!$project || !$this->internal_id) {
            return (string)$this->id;
        }

        return $project->slug . '-' . $this->internal_id;
    }

    /**
     * Получить дату окончания задачи
     */
    public function getEndDateAttribute(): ?string
    {
        if (!$this->start_date || !$this->duration_days) {
            return null;
        }

        return $this->start_date->addDays($this->duration_days - 1)->format('Y-m-d');
    }

    public function getEndDateCarbonAttribute(): ?\Carbon\Carbon
    {
        if (!$this->start_date || !$this->duration_days) {
            return null;
        }

        return $this->start_date->addDays($this->duration_days - 1);
    }

    /**
     * Проверить, является ли задача вехой
     */
    public function isMilestone(): bool
    {
        return $this->is_milestone || $this->duration_days === 0;
    }

    /**
     * Получить все зависимости задачи
     */
    public function getAllDependencies(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->dependencies()->with('dependsOnTask')->get();
    }

    /**
     * Получить все задачи, которые зависят от текущей
     */
    public function getAllDependents(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->dependents()->with('task')->get();
    }
}
