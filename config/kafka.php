<?php

return [
    'brokers' => env('KAFKA_BROKERS', 'localhost:9092'),
    'topics' => [
        'tracking_jobs' => 'tracking-jobs',
    ],
    'consumer' => [
        'group_id' => env('KAFKA_CONSUMER_GROUP', 'tracking-consumer-group'),
        'auto_offset_reset' => env('KAFKA_AUTO_OFFSET_RESET', 'earliest'),
        'enable_auto_commit' => env('KAFKA_ENABLE_AUTO_COMMIT', 'true'),
    ],
];
