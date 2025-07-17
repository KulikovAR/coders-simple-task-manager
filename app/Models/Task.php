<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'sprint_id',
        'title',
        'description',
        'result',
        'merge_request',
        'assignee_id',
        'reporter_id',
        'priority',
        'status_id',
    ];

    protected $casts = [
        'result' => 'string',
        'merge_request' => 'string',
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
        return $this->hasMany(TaskComment::class);
    }

    public function getCodeAttribute(): string
    {
        $project = $this->project;
        if (!$project) return (string)$this->id;
        $name = $project->name;
        // Простая транслитерация (можно заменить на более сложную при необходимости)
        $translit = iconv('UTF-8', 'ASCII//TRANSLIT', $name);
        $translit = preg_replace('/[^A-Za-z0-9]/', '', $translit);
        $translit = strtoupper($translit);
        return $translit . '-' . $this->id;
    }
}
