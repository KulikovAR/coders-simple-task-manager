<?php

return [
    /*
    |--------------------------------------------------------------------------
    | AI Agent Configuration
    |--------------------------------------------------------------------------
    |
    | Конфигурация для ИИ-агента
    |
    */

    'rate_limiting' => [
        'requests_per_minute' => env('AI_AGENT_RATE_LIMIT', 10),
        'api_requests_per_minute' => env('AI_AGENT_API_RATE_LIMIT', 20),
    ],

    'caching' => [
        'context_ttl' => env('AI_AGENT_CONTEXT_CACHE_TTL', 300), // 5 минут
    ],

    'security' => [
        'max_input_length' => env('AI_AGENT_MAX_INPUT_LENGTH', 1000),
        'require_email_verification' => env('AI_AGENT_REQUIRE_EMAIL_VERIFICATION', true),
    ],

    'logging' => [
        'enabled' => env('AI_AGENT_LOGGING_ENABLED', true),
        'level' => env('AI_AGENT_LOG_LEVEL', 'info'),
    ],

    'commands' => [
        'enabled' => [
            'CREATE_PROJECT',
            'UPDATE_PROJECT', 
            'LIST_PROJECTS',
            'CREATE_TASK',
            'UPDATE_TASK',
            'LIST_TASKS',
            'UPDATE_TASK_STATUS',
            'ASSIGN_TASK',
        ],
    ],
]; 