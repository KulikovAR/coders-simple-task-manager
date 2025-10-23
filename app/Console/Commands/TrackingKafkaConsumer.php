<?php

namespace App\Console\Commands;

use App\Services\Seo\Services\TrackingCompletionService;
use Enqueue\RdKafka\RdKafkaConnectionFactory;
use Enqueue\RdKafka\RdKafkaContext;
use Enqueue\RdKafka\RdKafkaConsumer;
use Enqueue\RdKafka\RdKafkaMessage;
use Enqueue\RdKafka\Serializer\RawSerializer;
use Illuminate\Console\Command;
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

        $brokers = config('kafka.brokers');
        $topic = config('kafka.topics.tracking_jobs');
        $consumerGroup = config('kafka.consumer.group_id');

        $connectionFactory = new RdKafkaConnectionFactory([
            'global' => [
                'group.id' => $consumerGroup,
                'metadata.broker.list' => $brokers,
                'enable.auto.commit' => 'true',
                'auto.offset.reset' => 'earliest',
            ],
            'topic' => [
                'auto.offset.reset' => 'earliest',
            ],
        ]);

        $context = $connectionFactory->createContext();
        $context->setSerializer(new RawSerializer());
        $queue = $context->createQueue($topic);
        $consumer = $context->createConsumer($queue);

        $this->info("Subscribed to topic: {$topic}");

        $running = true;
        pcntl_signal(SIGTERM, function () use (&$running) {
            $running = false;
        });
        pcntl_signal(SIGINT, function () use (&$running) {
            $running = false;
        });

        while ($running) {
            pcntl_signal_dispatch();
            
            try {
                $message = $consumer->receive(1000);

                if ($message) {
                    Log::info('Received message from Kafka', [
                        'message_type' => get_class($message),
                        'message_methods' => get_class_methods($message)
                    ]);
                    
                    $this->processMessage($message);
                    $consumer->acknowledge($message);
                }

            } catch (\Exception $e) {
                Log::error('Kafka consumer error', [
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]);
                sleep(1);
            }
        }

        $this->info('Kafka consumer stopped');
    }

    private function processMessage(RdKafkaMessage $message): void
    {
        try {
            Log::info('Processing message', [
                'message_class' => get_class($message)
            ]);
            
            $body = $message->getBody();
            
            Log::info('Debug message body', [
                'body_type' => gettype($body),
                'body_content' => $body
            ]);
            
            $payload = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
            
            Log::info('Received Kafka message', [
                'topic' => $message->getProperty('topic'),
                'partition' => $message->getProperty('partition'),
                'offset' => $message->getProperty('offset'),
                'payload' => $payload
            ]);

            $this->trackingCompletionService->handleTrackingCompletion($payload);

            $this->info('Message processed successfully');

        } catch (\JsonException $e) {
            Log::error('Failed to decode Kafka message', [
                'error' => $e->getMessage(),
                'body' => $body ?? 'not set'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to process Kafka message', [
                'error' => $e->getMessage(),
                'body' => $body ?? 'not set',
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
        }
    }
}
