<?php

return [
    /*
    |--------------------------------------------------------------------------
    | AI Agent Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the AI Agent service including security, rate limiting,
    | and caching settings.
    |
    */

    'security' => [
        'max_input_length' => env('AI_AGENT_MAX_INPUT_LENGTH', 1000),
        'allowed_commands' => [
            'LIST_TASKS',
            'CREATE_TASK',
            'CREATE_MULTIPLE_TASKS',
            'LIST_PROJECTS',
            'CREATE_PROJECT',
            'LIST_SPRINTS',
            'CREATE_SPRINT',
            'ASSIGN_TASK',
        ],
    ],

    'rate_limiting' => [
        'requests_per_minute' => env('AI_AGENT_RATE_LIMIT', 10),
        'burst_limit' => env('AI_AGENT_BURST_LIMIT', 5),
    ],

    'caching' => [
        'context_ttl' => env('AI_AGENT_CONTEXT_TTL', 300), // 5 minutes
        'results_ttl' => env('AI_AGENT_RESULTS_TTL', 600), // 10 minutes
    ],

    'ai_service' => [
        'url' => env('AI_SERVICE_URL', 'https://oneai-proxy.ru/api/v1/ai'),
        'token' => env('AI_SERVICE_TOKEN'),
        'model' => env('AI_SERVICE_MODEL', 'gpt-3.5-turbo'),
        'timeout' => env('AI_SERVICE_TIMEOUT', 30),
        'max_retries' => env('AI_SERVICE_MAX_RETRIES', 3),
    ],

    'conversation' => [
        'max_messages_per_conversation' => env('AI_CONVERSATION_MAX_MESSAGES', 100),
        'auto_cleanup_days' => env('AI_CONVERSATION_CLEANUP_DAYS', 30),
    ],

    'logging' => [
        'enabled' => env('AI_AGENT_LOGGING', true),
        'level' => env('AI_AGENT_LOG_LEVEL', 'info'),
        'log_commands' => env('AI_AGENT_LOG_COMMANDS', true),
        'log_responses' => env('AI_AGENT_LOG_RESPONSES', false),
    ],

    'free' => [
        // Количество бесплатных запросов к ИИ (для paid = false)
        'requests' => env('AI_AGENT_FREE_REQUESTS', 9),
    ],
]; 