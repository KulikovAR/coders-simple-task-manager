<?php

namespace App\Jobs;

use App\Models\Webhook;
use App\Services\WebhookService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Bus\Queueable as BusQueueable;
use Illuminate\Support\Facades\Log;

class ProcessWebhookJob implements ShouldQueue
{
    use BusQueueable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120;
    public $tries = 3;
    public $backoff = [30, 60, 120]; // Задержки между попытками в секундах

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Webhook $webhook,
        public string $event,
        public array $data
    ) {
        // Устанавливаем очередь для webhook'ов
        $this->onQueue('webhooks');
    }

    /**
     * Execute the job.
     */
    public function handle(WebhookService $webhookService): void
    {
        try {
            Log::info("Processing webhook job", [
                'webhook_id' => $this->webhook->id,
                'event' => $this->event,
                'url' => $this->webhook->url
            ]);

            $webhookService->sendWebhook($this->webhook, $this->event, $this->data);

            Log::info("Webhook job completed successfully", [
                'webhook_id' => $this->webhook->id,
                'event' => $this->event
            ]);

        } catch (\Exception $e) {
            Log::error("Webhook job failed", [
                'webhook_id' => $this->webhook->id,
                'event' => $this->event,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts()
            ]);

            // Если это последняя попытка, помечаем webhook как проблемный
            if ($this->attempts() >= $this->tries) {
                Log::warning("Webhook permanently failed after {$this->tries} attempts", [
                    'webhook_id' => $this->webhook->id,
                    'url' => $this->webhook->url
                ]);
            }

            throw $e; // Перебрасываем исключение для повторной попытки
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Webhook job permanently failed", [
            'webhook_id' => $this->webhook->id,
            'event' => $this->event,
            'url' => $this->webhook->url,
            'error' => $exception->getMessage()
        ]);
    }
}
