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

    public function getProgressPercentageAttribute(): int
    {
        if (isset($this->progress_percent) && $this->progress_percent > 0) {
            return $this->progress_percent;
        }
        
        if ($this->total_keywords === 0) {
            return 0;
        }
        
        return (int) round(($this->processed_keywords / $this->total_keywords) * 100);
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
}