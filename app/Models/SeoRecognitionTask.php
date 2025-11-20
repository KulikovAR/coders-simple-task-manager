<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeoRecognitionTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'site_id',
        'status',
        'search_engines',
        'total_keywords',
        'processed_keywords',
        'progress_percent',
        'error_message',
        'external_task_id',
        'started_at',
        'completed_at',
        'engine_states',
    ];

    protected $casts = [
        'search_engines' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'engine_states' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['pending', 'processing']);
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function getExternalJobIds(): array
    {
        if (!empty($this->external_task_id)) {
            return array_values(array_filter(array_map('trim', explode(',', $this->external_task_id))));
        }
        return [];
    }

    public function getEngineStates(): array
    {
        if (is_array($this->engine_states)) {
            return $this->engine_states;
        }

        return [];
    }

    public function initEngineStates(array $jobs): void
    {
        foreach ($jobs as $id) {
            if (!isset($engineStates[$id])) {
                $engineStates[$id] = ['percent' => 0, 'status' => 'processing'];
            }
        }
    }
}
