<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'webhook_id',
        'event',
        'payload',
        'response_status',
        'response_body',
        'execution_time',
        'error_message',
        'attempts',
    ];

    protected $casts = [
        'payload' => 'array',
        'response_body' => 'array',
        'execution_time' => 'integer',
        'attempts' => 'integer',
    ];

    public function webhook(): BelongsTo
    {
        return $this->belongsTo(Webhook::class);
    }

    /**
     * Проверить, был ли webhook успешным
     */
    public function isSuccessful(): bool
    {
        return $this->response_status >= 200 && $this->response_status < 300;
    }

    /**
     * Получить статус в человекочитаемом виде
     */
    public function getStatusTextAttribute(): string
    {
        if ($this->isSuccessful()) {
            return 'Успешно';
        }

        if ($this->response_status >= 400 && $this->response_status < 500) {
            return 'Ошибка клиента';
        }

        if ($this->response_status >= 500) {
            return 'Ошибка сервера';
        }

        return 'Неизвестно';
    }
}
