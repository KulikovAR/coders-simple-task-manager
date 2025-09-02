<?php

namespace App\Services;

use App\Models\Webhook;
use App\Models\WebhookLog;
use App\Jobs\ProcessWebhookJob;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;

class WebhookService
{
    /**
     * Отправить webhook для события (асинхронно через очереди)
     */
    public function dispatchEvent(string $event, array $data, ?int $projectId = null): void
    {
        $webhooks = $this->getActiveWebhooks($event, $projectId);

        Log::info("Dispatching webhook events", [
            'event' => $event,
            'project_id' => $projectId,
            'webhook_count' => $webhooks->count()
        ]);

        foreach ($webhooks as $webhook) {
            // Отправляем webhook в очередь для асинхронной обработки
            ProcessWebhookJob::dispatch($webhook, $event, $data);
            
            Log::debug("Webhook job dispatched", [
                'webhook_id' => $webhook->id,
                'event' => $event,
                'url' => $webhook->url
            ]);
        }
    }

    /**
     * Отправить webhook для события синхронно (для тестирования)
     */
    public function dispatchEventSync(string $event, array $data, ?int $projectId = null): void
    {
        $webhooks = $this->getActiveWebhooks($event, $projectId);

        foreach ($webhooks as $webhook) {
            $this->sendWebhook($webhook, $event, $data);
        }
    }

    /**
     * Получить активные webhook'и для события
     */
    private function getActiveWebhooks(string $event, ?int $projectId = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Webhook::where('is_active', true)
            ->whereJsonContains('events', $event);

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        return $query->get();
    }

    /**
     * Отправить webhook
     */
    public function sendWebhook(Webhook $webhook, string $event, array $data): void
    {
        $startTime = microtime(true);
        
        try {
            $payload = $this->buildPayload($event, $data, $webhook);
            $headers = $this->buildHeaders($webhook);

            $response = Http::timeout($webhook->timeout ?? 30)
                ->withHeaders($headers)
                ->post($webhook->url, $payload);

            $executionTime = (microtime(true) - $startTime) * 1000;

            $this->logWebhook(
                $webhook,
                $event,
                $payload,
                $response->status(),
                $response->json() ?? $response->body(),
                (int) $executionTime,
                null,
                1
            );

            // Если webhook не успешен, попробуем повторить
            if (!$response->successful()) {
                if ($webhook->retry_count > 0) {
                    $this->scheduleRetry($webhook, $event, $data, 1);
                }
                throw new \Exception("HTTP {$response->status()}: {$response->body()}");
            }

        } catch (\Exception $e) {
            $executionTime = (microtime(true) - $startTime) * 1000;
            
            $this->logWebhook(
                $webhook,
                $event,
                $data,
                null,
                null,
                (int) $executionTime,
                $e->getMessage(),
                1
            );

            // Планируем повторную попытку
            if ($webhook->retry_count > 0) {
                $this->scheduleRetry($webhook, $event, $data, 1);
            }

            Log::error('Webhook error', [
                'webhook_id' => $webhook->id,
                'event' => $event,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Построить payload для webhook
     */
    private function buildPayload(string $event, array $data, Webhook $webhook): array
    {
        return [
            'event' => $event,
            'data' => $data,
            'timestamp' => now()->toISOString(),
            'webhook_id' => $webhook->id,
            'project_id' => $webhook->project_id,
        ];
    }

    /**
     * Построить заголовки для webhook
     */
    private function buildHeaders(Webhook $webhook): array
    {
        $headers = [
            'Content-Type' => 'application/json',
            'User-Agent' => '379TM-Webhook/1.0',
            'X-Webhook-Event' => $webhook->id,
        ];

        // Добавляем пользовательские заголовки
        if ($webhook->headers) {
            $headers = array_merge($headers, $webhook->headers);
        }

        // Добавляем подпись для безопасности
        if ($webhook->secret) {
            $headers['X-Webhook-Signature'] = $this->generateSignature($webhook->secret);
        }

        return $headers;
    }

    /**
     * Генерировать подпись для webhook
     */
    private function generateSignature(string $secret): string
    {
        $timestamp = time();
        $nonce = Str::random(16);
        $signature = hash_hmac('sha256', $timestamp . $nonce, $secret);
        
        return "sha256={$signature},timestamp={$timestamp},nonce={$nonce}";
    }

    /**
     * Записать лог webhook
     */
    private function logWebhook(
        Webhook $webhook,
        string $event,
        array $payload,
        ?int $responseStatus,
        $responseBody,
        int $executionTime,
        ?string $errorMessage,
        int $attempts
    ): void {
        WebhookLog::create([
            'webhook_id' => $webhook->id,
            'event' => $event,
            'payload' => $payload,
            'response_status' => $responseStatus,
            'response_body' => $responseBody,
            'execution_time' => $executionTime,
            'error_message' => $errorMessage,
            'attempts' => $attempts,
            'executed_at' => now(),
        ]);
    }

    /**
     * Запланировать повторную попытку
     */
    private function scheduleRetry(Webhook $webhook, string $event, array $data, int $attempt): void
    {
        // Здесь можно использовать Laravel Queue для отложенного выполнения
        // Пока что просто логируем
        Log::info('Scheduling webhook retry', [
            'webhook_id' => $webhook->id,
            'event' => $event,
            'attempt' => $attempt
        ]);
    }

    /**
     * Создать webhook
     */
    public function createWebhook(array $data): Webhook
    {
        $data['secret'] = $data['secret'] ?? Webhook::generateSecret();
        
        return Webhook::create($data);
    }

    /**
     * Обновить webhook
     */
    public function updateWebhook(Webhook $webhook, array $data): Webhook
    {
        $webhook->update($data);
        return $webhook->fresh();
    }

    /**
     * Удалить webhook
     */
    public function deleteWebhook(Webhook $webhook): bool
    {
        return $webhook->delete();
    }

    /**
     * Тестировать webhook
     */
    public function testWebhook(Webhook $webhook): array
    {
        $testData = [
            'test' => true,
            'message' => 'Тестовый webhook от 379TM',
            'timestamp' => now()->toISOString(),
        ];

        try {
            $this->sendWebhook($webhook, 'webhook.test', $testData);
            
            return [
                'success' => true,
                'message' => 'Webhook успешно протестирован'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Ошибка тестирования: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Получить статистику webhook
     */
    public function getWebhookStats(Webhook $webhook): array
    {
        $logs = $webhook->logs()->orderBy('created_at', 'desc')->limit(100)->get();
        
        $total = $logs->count();
        $successful = $logs->where('response_status', '>=', 200)->where('response_status', '<', 300)->count();
        $failed = $total - $successful;
        
        $avgExecutionTime = $logs->avg('execution_time');
        
        return [
            'total_requests' => $total,
            'successful_requests' => $successful,
            'failed_requests' => $failed,
            'success_rate' => $total > 0 ? round(($successful / $total) * 100, 2) : 0,
            'average_execution_time' => round($avgExecutionTime ?? 0, 2),
            'last_execution' => $logs->first()?->created_at,
        ];
    }
}
