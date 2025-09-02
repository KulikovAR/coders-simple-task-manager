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
        'tags'
    ];

    protected $casts = [
        'result' => 'string',
        'merge_request' => 'string',
        'deadline' => 'date',
        'tags' => 'array',
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

    public function getCodeAttribute(): string
    {
        $project = $this->project;
        if (!$project || !$this->internal_id) {
            return (string)$this->id;
        }

        return $project->slug . '-' . $this->internal_id;
    }
}
