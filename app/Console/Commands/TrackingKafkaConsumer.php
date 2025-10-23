<?php

namespace App\Console\Commands;

use App\Services\Seo\Services\TrackingCompletionService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TrackingKafkaConsumer extends Command
{
    protected $signature = 'kafka:tracking-consumer';
    protected $description = 'Kafka consumer for tracking completion messages';

    public function __construct(
        private TrackingCompletionService $trackingCompletionService
    ) {
        parent::__construct();
    }

    public function handle(): void
    {
        $this->info('Starting Kafka tracking consumer...');

        $kafkaRestUrl = config('kafka.rest_url');
        $topic = config('kafka.topics.tracking_jobs');
        $consumerGroup = config('kafka.consumer.group_id');

        if (!$kafkaRestUrl) {
            $this->error('Kafka REST URL not configured');
            return;
        }

        $this->info("Subscribed to topic: {$topic}");

        while (true) {
            try {
                $response = Http::timeout(30)->get("{$kafkaRestUrl}/consumers/{$consumerGroup}/instances/tracking-consumer/records", [
                    'format' => 'json'
                ]);

                if ($response->successful()) {
                    $messages = $response->json();
                    
                    if (!empty($messages)) {
                        foreach ($messages as $message) {
                            $this->processMessage($message);
                        }
                    }
                } else {
                    Log::warning('Failed to fetch messages from Kafka', [
                        'status' => $response->status(),
                        'body' => $response->body()
                    ]);
                }

                sleep(1);

            } catch (\Exception $e) {
                Log::error('Kafka consumer error', [
                    'error' => $e->getMessage()
                ]);
                sleep(5);
            }
        }
    }

    private function processMessage(array $message): void
    {
        try {
            $payload = json_decode($message['value'] ?? '', true, 512, JSON_THROW_ON_ERROR);
            
            Log::info('Received Kafka message', [
                'topic' => $message['topic'] ?? 'unknown',
                'partition' => $message['partition'] ?? 'unknown',
                'offset' => $message['offset'] ?? 'unknown',
                'payload' => $payload
            ]);

            $this->trackingCompletionService->handleTrackingCompletion($payload);

            $this->info('Message processed successfully');

        } catch (\JsonException $e) {
            Log::error('Failed to decode Kafka message', [
                'error' => $e->getMessage(),
                'message' => $message
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to process Kafka message', [
                'error' => $e->getMessage(),
                'message' => $message
            ]);
        }
    }
}
