<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiConversationMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'type', // 'user' или 'ai'
        'content',
        'success',
        'commands_executed',
        'results',
        'processing_time',
    ];

    protected $casts = [
        'success' => 'boolean',
        'commands_executed' => 'integer',
        'results' => 'array',
        'processing_time' => 'float',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(AiConversation::class, 'conversation_id');
    }

    public function user(): BelongsTo
    {
        return $this->conversation->user();
    }
} 